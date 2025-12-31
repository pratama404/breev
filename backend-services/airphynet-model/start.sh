#!/bin/bash

# Start the Bridge (Cloud -> Local) - DISABLED (Using HTTP Tunnel)
# python mqtt_bridge.py &

# Start the Ingestor in background - DISABLED (Using HTTP Ingestion)
# python ingestor.py &

# Start the API via uvicorn
uvicorn inference_api:app --host 0.0.0.0 --port 8000
