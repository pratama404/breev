#!/bin/bash

# Start the Bridge (Cloud -> Local)
python mqtt_bridge.py &

# Start the Ingestor in background
python ingestor.py &

# Start the API via uvicorn
uvicorn inference_api:app --host 0.0.0.0 --port 8000
