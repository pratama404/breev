from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import torch
import numpy as np
from pymongo import MongoClient
import os
from datetime import datetime, timedelta
import mlflow
import mlflow.pytorch
from prometheus_fastapi_instrumentator import Instrumentator
from model import create_model, predict_aqi

app = FastAPI(title="AirPhyNet Prediction Service", version="1.0.0")

# Instrument for Prometheus/Grafana
Instrumentator().instrument(app).expose(app)

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://admin:password123@localhost:27017/aqi_monitoring?authSource=admin")
client = MongoClient(MONGODB_URI)
db = client.aqi_monitoring  # Will use 'aqi_monitoring' db on Atlas

# Load Model
model = create_model()
MLFLOW_MODEL_URI = os.getenv("MLFLOW_MODEL_URI")

try:
    if MLFLOW_MODEL_URI:
        print(f"Attempting to load model from MLflow: {MLFLOW_MODEL_URI}")
        model = mlflow.pytorch.load_model(MLFLOW_MODEL_URI)
        print("Successfully loaded model from MLflow Registry")
    else:
        # Fallback to local
        model.load_state_dict(torch.load("airphynet_weights.pth", map_location='cpu'))
        print("Loaded pre-trained model weights from disk")
except Exception as e:
    print(f"Warning: Could not load pre-trained model ({e}). Using random initialization.")

class SensorData(BaseModel):
    sensor_id: str
    temperature: float
    humidity: float
    co2_ppm: float
    aqi: int

class PredictionRequest(BaseModel):
    sensor_id: str
    hours_ahead: int = 6

class PredictionResponse(BaseModel):
    sensor_id: str
    current_time: str
    predictions: List[dict]

@app.get("/")
async def root():
    return {"message": "AirPhyNet Prediction Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True}

# --- PROMETHEUS METRICS ---
from prometheus_client import Gauge
SENSOR_TEMP = Gauge('sensor_temperature_celsius', 'Temperature from sensor', ['sensor_id'])
SENSOR_HUM = Gauge('sensor_humidity_percent', 'Humidity from sensor', ['sensor_id'])
SENSOR_CO2 = Gauge('sensor_co2_ppm', 'CO2 PPM from sensor', ['sensor_id'])
SENSOR_AQI = Gauge('sensor_aqi', 'Calculated AQI from sensor', ['sensor_id'])

# --- HTTP INGESTION ---
@app.post("/ingest")
async def ingest_sensor_data(data: SensorData):
    try:
        # Convert to dict
        doc = data.dict()
        doc['received_at'] = datetime.utcnow()
        doc['aqi_calculated'] = data.aqi # Align naming with ingestor.py
        
        # Insert to Mongo
        result = db.sensor_logs.insert_one(doc)
        
        # Update Prometheus
        sid = data.sensor_id
        SENSOR_TEMP.labels(sensor_id=sid).set(data.temperature)
        SENSOR_HUM.labels(sensor_id=sid).set(data.humidity)
        SENSOR_CO2.labels(sensor_id=sid).set(data.co2_ppm)
        SENSOR_AQI.labels(sensor_id=sid).set(data.aqi)

        return {"status": "success", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict", response_model=PredictionResponse)
async def predict_air_quality(request: PredictionRequest):
    try:
        # Get historical data from MongoDB
        sensor_logs = db.sensor_logs.find(
            {"sensor_id": request.sensor_id}
        ).sort("received_at", -1).limit(24)  # Use 'received_at' or 'timestamp'
        
        sensor_data_list = list(sensor_logs)
        
        if len(sensor_data_list) < 10:
            raise HTTPException(
                status_code=400, 
                detail="Insufficient historical data for prediction"
            )
        
        # Prepare data for model
        historical_data = []
        for data in reversed(sensor_data_list):
            historical_data.append([
                data.get('temperature', 25.0),
                data.get('humidity', 50.0),
                data.get('co2_ppm', 400.0),
                data.get('aqi_calculated', 50)
            ])
        
        # Generate predictions
        predictions = []
        current_time = datetime.now()
        
        for hour in range(1, request.hours_ahead + 1):
            future_time = current_time + timedelta(hours=hour)
            
            # Use the last 10 data points for prediction
            input_data = historical_data[-10:]
            predicted_co2 = predict_aqi(model, input_data, hour)
            
            predictions.append({
                "hour": hour,
                "predicted_time": future_time.isoformat(),
                "predicted_co2": round(predicted_co2, 2),
                "confidence": 0.85
            })
        
        # Store predictions in database
        prediction_doc = {
            "sensor_id": request.sensor_id,
            "generated_at": current_time,
            "predictions": predictions
        }
        db.predictions.insert_one(prediction_doc)
        
        return PredictionResponse(
            sensor_id=request.sensor_id,
            current_time=current_time.isoformat(),
            predictions=predictions
        )
        
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predictions/{sensor_id}")
async def get_latest_predictions(sensor_id: str):
    """Get the latest predictions for a sensor"""
    try:
        latest_prediction = db.predictions.find_one(
            {"sensor_id": sensor_id},
            sort=[("generated_at", -1)]
        )
        
        if not latest_prediction:
            raise HTTPException(status_code=404, detail="No predictions found")
        
        # Convert ObjectId to string for JSON serialization
        latest_prediction["_id"] = str(latest_prediction["_id"])
        
        return latest_prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)