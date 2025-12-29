import os
from dotenv import load_dotenv
from pathlib import Path
from pymongo import MongoClient
import pprint

# Load env vars
script_dir = Path(__file__).resolve().parent
env_path = script_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "aqi_monitoring")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "sensor_logs")

print(f"Connecting to {DB_NAME}.{COLLECTION_NAME}...")
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

count = collection.count_documents({})
print(f"Total documents: {count}")

if count > 0:
    print("Sample document:")
    pprint.pprint(collection.find_one())
else:
    print("⚠️ Collection is empty!")
