import os
import json
import logging
import ssl
import threading
from datetime import datetime
import paho.mqtt.client as mqtt
from pymongo import MongoClient
from dotenv import load_dotenv
from prometheus_client import start_http_server, Gauge, Counter

# Load environment variables
load_dotenv()

# Configuration
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.emqx.io")
MQTT_PORT = int(os.getenv("MQTT_PORT", 8883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "aqi/sensor/+/telemetry")
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "")

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "aqi_monitoring")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "sensor_logs")

# Validations
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set")

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Prometheus Metrics
SENSOR_TEMP = Gauge('sensor_temperature_celsius', 'Temperature from sensor', ['sensor_id'])
SENSOR_HUM = Gauge('sensor_humidity_percent', 'Humidity from sensor', ['sensor_id'])
SENSOR_CO2 = Gauge('sensor_co2_ppm', 'CO2 PPM from sensor', ['sensor_id'])
SENSOR_AQI = Gauge('sensor_aqi', 'Calculated AQI from sensor', ['sensor_id'])
SENSOR_RSSI = Gauge('sensor_rssi_dbm', 'WiFi Signal Strength (dBm)', ['sensor_id'])
SENSOR_UPTIME = Gauge('sensor_uptime_seconds', 'Sensor Uptime in seconds', ['sensor_id'])
MSG_COUNTER = Counter('sensor_messages_total', 'Total MQTT messages received', ['sensor_id'])

# MongoDB Connection
try:
    mongo_client = MongoClient(MONGODB_URI)
    db = mongo_client[DB_NAME]
    collection = db[COLLECTION_NAME]
    logger.info("Connected to MongoDB Atlas")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    exit(1)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("Connected to MQTT Broker")
        client.subscribe(MQTT_TOPIC)
        logger.info(f"Subscribed to topic: {MQTT_TOPIC}")
    else:
        logger.error(f"Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    try:
        payload_str = msg.payload.decode('utf-8')
        logger.info(f"Received message on {msg.topic}: {payload_str}")
        
        data = json.loads(payload_str)
        
        # Determine sensor_id from topic if not in payload, or trust payload
        # Topic format: aqi/sensor/{sensor_id}/telemetry
        topic_parts = msg.topic.split('/')
        if 'sensor_id' not in data and len(topic_parts) >= 3:
            data['sensor_id'] = topic_parts[2]

        sid = data.get('sensor_id', 'unknown')
        
        # Update Metrics
        MSG_COUNTER.labels(sensor_id=sid).inc()
        if 'temperature' in data: SENSOR_TEMP.labels(sensor_id=sid).set(data['temperature'])
        if 'humidity' in data: SENSOR_HUM.labels(sensor_id=sid).set(data['humidity'])
        if 'co2_ppm' in data: SENSOR_CO2.labels(sensor_id=sid).set(data['co2_ppm'])
        if 'aqi_calculated' in data: SENSOR_AQI.labels(sensor_id=sid).set(data['aqi_calculated'])
        if 'rssi' in data: SENSOR_RSSI.labels(sensor_id=sid).set(data['rssi'])
        if 'uptime' in data: SENSOR_UPTIME.labels(sensor_id=sid).set(data['uptime'])

        # Add server-side timestamps
        data['received_at'] = datetime.utcnow()
        if 'timestamp' in data:
            # Convert unix timestamp to datetime if needed, or keep as is
            pass
            
        # Insert into MongoDB
        result = collection.insert_one(data)
        logger.info(f"Inserted document with ID: {result.inserted_id}")
        
    except json.JSONDecodeError:
        logger.error("Failed to decode JSON payload")
    except Exception as e:
        logger.error(f"Error processing message: {e}")

# MQTT Setup
client = mqtt.Client()

if MQTT_USERNAME and MQTT_PASSWORD:
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

# SSL/TLS setup for EMQX Cloud
# Use standard CA certificates
client.tls_set(cert_reqs=ssl.CERT_NONE, tls_version=ssl.PROTOCOL_TLSv1_2)
client.tls_insecure_set(True)

client.on_connect = on_connect
client.on_message = on_message

logger.info(f"Connecting to MQTT Broker: {MQTT_BROKER}:{MQTT_PORT}...")

# Start Prometheus Client Server
try:
    start_http_server(8001)
    logger.info("Prometheus metrics server started on port 8001")
except Exception as e:
    logger.error(f"Failed to start Prometheus server: {e}")

try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
except Exception as e:
    logger.error(f"MQTT Connection Error: {e}")
