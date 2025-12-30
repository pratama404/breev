import os
import time
import ssl
import logging
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

# Load ENV
load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [BRIDGE] - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---

# CLOUD BROKER (Source)
CLOUD_BROKER = "f8d02a91.ala.asia-southeast1.emqxsl.com"
CLOUD_PORT = 8883
CLOUD_USER = "breev"
CLOUD_PASS = "Breev123#"
TOPIC_SOURCE = "aqi/sensor/#"

# LOCAL BROKER (Destination)
LOCAL_BROKER = "emqx" # Container name
LOCAL_PORT = 1883
LOCAL_USER = os.getenv("MQTT_USERNAME", "")
LOCAL_PASS = os.getenv("MQTT_PASSWORD", "")

# --- CLIENTS ---

def create_cloud_client():
    client = mqtt.Client(client_id="python_bridge_cloud_in")
    client.username_pw_set(CLOUD_USER, CLOUD_PASS)
    
    # SSL Context (Loose validation like test_wss.py)
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    client.tls_set_context(context)
    
    def on_connect(c, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected to CLOUD Broker!")
            c.subscribe(TOPIC_SOURCE)
        else:
            logger.error(f"Failed to connect to Cloud: {rc}")

    def on_message(c, userdata, msg):
        try:
            payload = msg.payload
            topic = msg.topic
            logger.info(f"Forwarding: {topic}")
            # Forward to Local
            local_client.publish(topic, payload)
        except Exception as e:
            logger.error(f"Error forwarding: {e}")

    client.on_connect = on_connect
    client.on_message = on_message
    return client

def create_local_client():
    client = mqtt.Client(client_id="python_bridge_local_out")
    if LOCAL_USER and LOCAL_PASS:
        client.username_pw_set(LOCAL_USER, LOCAL_PASS)
    
    def on_connect(c, userdata, flags, rc):
        if rc == 0:
            logger.info("Connected to LOCAL Broker!")
        else:
            logger.error(f"Failed to connect to Local: {rc}")

    client.on_connect = on_connect
    return client

# --- MAIN LOOP ---

if __name__ == "__main__":
    logger.info("Starting MQTT Bridge Service...")
    
    # Init Clients
    local_client = create_local_client()
    cloud_client = create_cloud_client()

    try:
        # Connect Local First
        logger.info(f"Connecting to Local: {LOCAL_BROKER}:{LOCAL_PORT}")
        local_client.connect(LOCAL_BROKER, LOCAL_PORT, 60)
        local_client.loop_start() # Run in background thread

        # Connect Cloud Second
        logger.info(f"Connecting to Cloud: {CLOUD_BROKER}:{CLOUD_PORT}")
        cloud_client.connect(CLOUD_BROKER, CLOUD_PORT, 60)
        
        # Blocking Loop for Cloud Client
        cloud_client.loop_forever()

    except Exception as e:
        logger.error(f"Bridge Crashed: {e}")
        time.sleep(5)
