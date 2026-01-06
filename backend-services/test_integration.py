import requests
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:8000" # Local Docker or Cloudflare URL
API_KEY = os.getenv("API_SECRET_KEY", "sk_live_default_setup_key_change_me")

def test_health():
    print(f"\n[1] Testing Health Check ({BASE_URL}/health)...")
    try:
        r = requests.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            print("✅ API is Healthy:", r.json())
            return True
        else:
            print("❌ API Unhealthy:", r.status_code)
            return False
    except Exception as e:
        print("❌ Connection Failed:", e)
        return False

def test_security_rejection():
    print("\n[2] Testing Security (No Key)...")
    payload = {
        "sensor_id": "test_device_secure",
        "temperature": 25.0,
        "humidity": 50.0,
        "co2_ppm": 400.0,
        "aqi": 50
    }
    r = requests.post(f"{BASE_URL}/ingest", json=payload)
    if r.status_code == 401 or r.status_code == 403:
        print(f"✅ Security Active! Request Rejected as expected ({r.status_code}).")
    else:
        print(f"❌ Security FAIL! Request accepted without key ({r.status_code}).")

def test_valid_ingestion():
    print("\n[3] Testing Valid Ingestion (With Key)...")
    payload = {
        "sensor_id": "test_device_valid",
        "temperature": 25.5,
        "humidity": 60.0,
        "co2_ppm": 450.0,
        "aqi": 55,
        "uptime_seconds": 120
    }
    headers = {"x-api-key": API_KEY}
    
    r = requests.post(f"{BASE_URL}/ingest", json=payload, headers=headers)
    if r.status_code == 200:
        print("✅ Data Ingested Successfully:", r.json())
        print("   Check your MongoDB 'sensor_logs' collection!")
    else:
        print(f"❌ Ingestion Failed: {r.status_code} - {r.text}")

if __name__ == "__main__":
    print(f"--- Breev Integration Test ({BASE_URL}) ---")
    if test_health():
        test_security_rejection()
        test_valid_ingestion()
    else:
        print("\n⚠️  Skipping remaining tests because API is down.")
        print("   Did you run 'docker compose up'?")
