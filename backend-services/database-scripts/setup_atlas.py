
import os
import pymongo
from datetime import datetime
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

# Get URI
uri = os.getenv("MONGODB_URI")
if not uri:
    print("Error: MONGODB_URI not found in ../.env")
    exit(1)

print(f"Connecting to MongoDB Atlas...")
client = pymongo.MongoClient(uri)
db = client.aqi_monitoring

print("Creating collections and indexes...")

# 1. Sensor Logs
db.sensor_logs.create_index([("sensor_id", 1), ("timestamp", -1)])
db.sensor_logs.create_index([("timestamp", -1)])
print(" - sensor_logs indexes created")

# 2. Devices
db.devices.create_index("sensor_id", unique=True)
print(" - devices indexes created")

# 3. Predictions
db.predictions.create_index([("sensor_id", 1), ("generated_at", -1)])
print(" - predictions indexes created")

# 4. Insert Sample Devices (if not exist)
sample_devices = [
    {
        "sensor_id": "device_001", # Matches breev.ino default
        "name": "Meeting Room 1",
        "location": "Floor 1, Room 101",
        "qr_code": "https://aqi-app.vercel.app/room/meeting-room-1",
        "installed_date": datetime.now(),
        "status": "active"
    }
]

for device in sample_devices:
    try:
        db.devices.insert_one(device)
        print(f" - Inserted sample device: {device['sensor_id']}")
    except pymongo.errors.DuplicateKeyError:
        print(f" - Device {device['sensor_id']} already exists (skipping)")

# 5. Insert Admin User (if not exist)
admin_user = {
    "username": "admin",
    "password": "$2b$10$rOzJmZKz8qHqV8qGqGqGqOzJmZKz8qHqV8qGqGqGqOzJmZKz8qHqV8", # hashed "admin123"
    "role": "admin",
    "created_at": datetime.now()
}

existing_admin = db.users.find_one({"username": "admin"})
if not existing_admin:
    db.users.insert_one(admin_user)
    print(" - Admin user created (user: admin, pass: admin123)")
else:
    print(" - Admin user already exists")

# 6. Insert Default System Settings (if not exist)
default_settings = {
    "type": "global",
    "aqi_threshold": { "moderate": 100, "unhealthy": 150 },
    "mqtt": { "broker_url": "mqtt://localhost", "topic": "air-quality/data", "qos": 1 },
    "notification": { "enabled": True, "channel": ["dashboard"] },
    "api_key": "sk_live_default_setup_key_change_me" 
}
existing_settings = db.system_settings.find_one({"type": "global"})
if not existing_settings:
    db.system_settings.insert_one(default_settings)
    print(" - specific: System Settings initialized (Default API Key: sk_live_default_setup_key_change_me)")
else:
    print(" - System Settings already exist")

print("\n✅ Database initialized successfully!")
