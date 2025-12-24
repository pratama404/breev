import os
import torch
import torch.nn as nn
import torch.optim as optim
import mlflow
import mlflow.pytorch
import dagshub
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from pymongo import MongoClient
from model import AirPhyNet, create_model

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def train():
    # Initialize DagsHub/MLflow
    # Note: For this to work efficiently locally, consider 'dagshub.init()'
    # But for a script, setting env vars or tracking URI is standard.
    
    DAGSHUB_REPO = os.getenv("BC_DAGSHUB_REPO", "pratama404/breev")
    tracking_uri = os.getenv("MLFLOW_TRACKING_URI", f"https://dagshub.com/{DAGSHUB_REPO}.mlflow")
    mlflow.set_tracking_uri(tracking_uri)
    
    print("Starting training experiment...")
    
    # Auto-configure auth if running locally with token in env or .dagshub file
    # If inside docker, rely on MLFLOW_TRACKING_USERNAME/PASSWORD env vars
    if not os.getenv("MLFLOW_TRACKING_USERNAME"):
        logger.warning("MLFLOW_TRACKING_USERNAME not set. Ensure you have DagsHub credentials.")

    
    experiment_name = "AirPhyNet_Training"
    mlflow.set_experiment(experiment_name)
    
    with mlflow.start_run():
        # Hyperparameters
        input_size = 4 # Default, updated later
        hidden_size = 64
        num_layers = 2
        learning_rate = 0.001
        epochs = 10
        
        # Data Loading from MongoDB
        logger.info("Fetching training data from MongoDB...")
        MONGODB_URI = os.getenv("MONGODB_URI")
        DB_NAME = os.getenv("DB_NAME", "aqi_monitoring")
        COLLECTION_NAME = os.getenv("COLLECTION_NAME", "sensor_logs")
        
        if not MONGODB_URI:
            raise ValueError("MONGODB_URI environment variable is missing")
            
        client = MongoClient(MONGODB_URI)
        collection = client[DB_NAME][COLLECTION_NAME]
        
        # Fetch last 30 days of data for training
        start_date = datetime.utcnow() - timedelta(days=30)
        cursor = collection.find({"received_at": {"$gte": start_date}}).sort("received_at", 1)
        data = list(cursor)
        
        if not data:
            logger.error("No data found in MongoDB! Cannot train.")
            return
            
        df = pd.DataFrame(data)
        
        # Feature Engineering (Basic)
        # Using columns from firmware: temperature, humidity, co2_ppm
        # Target: co2_ppm
        features = ['co2_ppm', 'humidity', 'temperature'] 
        available_features = [f for f in features if f in df.columns]
        
        if not available_features:
             logger.error(f"Missing required features. Available: {df.columns}")
             return
             
        df = df[available_features].fillna(method='ffill').fillna(0)
        
        # Prepare Sequences for LSTM
        # Input: (Batch, Seq_Len, Features)
        # Output: (Batch, 1) -> Forecasting CO2 PPM
        
        seq_length = 10
        data_values = df.values
        X, y = [], []
        
        for i in range(len(data_values) - seq_length):
            X.append(data_values[i:i+seq_length])
            y.append(data_values[i+seq_length, 0]) # Predicting 1st feature (co2_ppm)
            
        X_train = torch.FloatTensor(np.array(X))
        y_train = torch.FloatTensor(np.array(y)).unsqueeze(1)
        
        logger.info(f"Training data shape: {X_train.shape}")
        
        # Update input_size dynamically based on real data
        input_size = len(available_features)
        
        # Log Params
        mlflow.log_params({
            "input_size": input_size,
            "hidden_size": hidden_size,
            "num_layers": num_layers,
            "learning_rate": learning_rate,
            "epochs": epochs,
            "optimizer": "Adam",
            "loss_function": "PhysicsLoss + MSE"
        })
        
        # Initialize Model
        model = AirPhyNet(input_size, hidden_size, num_layers)
        optimizer = optim.Adam(model.parameters(), lr=learning_rate)
        criterion = nn.MSELoss()
        
        print(f"Training for {epochs} epochs...")
        
        for epoch in range(epochs):
            model.train()
            optimizer.zero_grad()
            
            output = model(X_train)
            loss = criterion(output, y_train)
            
            # Physics Loss constraint (from model.py)
            p_loss = model.physics_loss(output, X_train)
            
            total_loss = loss + 0.1 * p_loss
            
            total_loss.backward()
            optimizer.step()
            
            # Log Metrics
            if (epoch + 1) % 5 == 0:
                print(f"Epoch [{epoch+1}/{epochs}], Loss: {total_loss.item():.4f}")
                mlflow.log_metric("loss", total_loss.item(), step=epoch)
                mlflow.log_metric("mse_loss", loss.item(), step=epoch)
                mlflow.log_metric("physics_loss", p_loss.item(), step=epoch)
        
        # Save Model Artifact & Register
        model_info = mlflow.pytorch.log_model(model, "model", registered_model_name="AirPhyNet")
        
        # Promote to Production
        client = mlflow.tracking.MlflowClient()
        client.transition_model_version_stage(
            name="AirPhyNet",
            version=model_info.registered_model_version,
            stage="Production",
            archive_existing_versions=True
        )
        
        print(f"Training complete. Model registered (v{model_info.registered_model_version}) and promoted to Production.")

if __name__ == "__main__":
    # Ensure auth env vars are set before running
    if not os.environ.get("MLFLOW_TRACKING_USERNAME"):
        print("Warning: MLFLOW_TRACKING_USERNAME not set. Ensure you have DagsHub credentials.")
        
    train()
