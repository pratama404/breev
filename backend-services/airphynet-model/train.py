import os
from dotenv import load_dotenv
from pathlib import Path

# Load env vars from parent directory (backend-services/.env)
script_dir = Path(__file__).resolve().parent
env_path = script_dir.parent / '.env'
load_dotenv(dotenv_path=env_path)

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
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

import argparse
import sys

def train(args):
    # Initialize DagsHub connection using the official SDK
    # This automatically sets MLFLOW_TRACKING_URI and authentication
    try:
        dagshub.init(repo_owner='pratama404', repo_name='breev', mlflow=True)
        logger.info(f"DagsHub initialized. Tracking URI: {mlflow.get_tracking_uri()}")
    except Exception as e:
        logger.error(f"Failed to init DagsHub: {e}")
        # Fallback to manual environment variables if init fails
        DAGSHUB_REPO = os.getenv("BC_DAGSHUB_REPO", "pratama404/breev")
        tracking_uri = os.getenv("MLFLOW_TRACKING_URI", f"https://dagshub.com/{DAGSHUB_REPO}.mlflow")
        mlflow.set_tracking_uri(tracking_uri)

    experiment_name = "AirPhyNet_Experiments"
    mlflow.set_experiment(experiment_name)
    
    with mlflow.start_run():
        # Hyperparameters from args
        input_size = 4 # Placeholder, updated dynamically
        hidden_size = args.hidden_size
        num_layers = args.num_layers
        learning_rate = args.learning_rate
        epochs = args.epochs
        batch_size = args.batch_size
        
        # Log Params
        mlflow.log_params({
            "hidden_size": hidden_size,
            "num_layers": num_layers,
            "learning_rate": learning_rate,
            "epochs": epochs,
            "batch_size": batch_size,
            "optimizer": "Adam",
            "loss_function": "PhysicsLoss + MSE"
        })

        if args.data_path:
            logger.info(f"Loading data from CSV: {args.data_path}")
            df = pd.read_csv(args.data_path)
            # Legacy dataset support
            legacy_features = ['pm10', 'so2', 'co', 'o3', 'no2']
            if all(f in df.columns for f in legacy_features):
                logger.info("Detected legacy dataset columns.")
                features = legacy_features
                # If 'max' column exists, use it as target, otherwise use first feature
                if 'max' in df.columns:
                    target = 'max'
                else:
                    target = features[0]
            else:
                # Default/Synthetic dataset features
                features = ['co2_ppm', 'humidity', 'temperature']
                target = features[0] # Default target if mostly self-supervised or specific column
                
        else:
            logger.info("Fetching training data from MongoDB...")
            MONGODB_URI = os.getenv("MONGODB_URI")
            DB_NAME = os.getenv("DB_NAME", "aqi_monitoring")
            COLLECTION_NAME = os.getenv("COLLECTION_NAME", "sensor_logs")
            
            if not MONGODB_URI:
                logger.error("MONGODB_URI missing")
                return
                
            client = MongoClient(MONGODB_URI)
            collection = client[DB_NAME][COLLECTION_NAME]
            
            start_date = datetime.utcnow() - timedelta(days=30)
            cursor = collection.find({"received_at": {"$gte": start_date}}).sort("received_at", 1)
            data_list = list(cursor)
            
            if len(data_list) < 50:
                logger.error(f"Insufficient data found in MongoDB ({len(data_list)} records). Need at least 50.")
                return

            df = pd.DataFrame(data_list)
            features = ['co2_ppm', 'humidity', 'temperature']
            target = 'co2_ppm' # Default for MongoDB data
        
        # Feature Selection & Preprocessing
        available_features = [f for f in features if f in df.columns]
        
        if not available_features:
             logger.error(f"Missing required features. Expected one of: {features}. Found: {df.columns}")
             return
             
        # Handle Date/Time sorting if possible
        # Handle Date/Time sorting & Cyclical Features
        if 'tanggal' in df.columns:
            df['tanggal'] = pd.to_datetime(df['tanggal'])
            df = df.sort_values('tanggal')
            # Extract Hour
            df['hour'] = df['tanggal'].dt.hour
        elif 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            # Extract Hour
            df['hour'] = df['timestamp'].dt.hour
            
        # Add Cyclical Features (Critical for Time Series R2)
        if 'hour' in df.columns:
            df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
            df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
            # Add to available features list automatically
            available_features.extend(['hour_sin', 'hour_cos'])
            print("Added Cyclical Time Features (hour_sin, hour_cos)")
             
        df_features = df[available_features].ffill().fillna(0)
        
        # Prepare Target
        if target in df.columns:
            df_target = df[target].ffill().fillna(0)
        else:
            # Fallback if specific target not found, use first feature
            df_target = df_features.iloc[:, 0]

        # LSTM Sequence Prep
        seq_length = args.seq_length
        data_values = df_features.values
        target_values = df_target.values
        X, y = [], []
        
        X_raw = df_features.values
        y_raw = df_target.values.reshape(-1, 1)
        
        # DEBUG: Check for NaNs in raw data
        if np.isnan(X_raw).any() or np.isnan(y_raw).any():
            logger.error("NaN found in raw data!")
            X_raw = np.nan_to_num(X_raw)
            y_raw = np.nan_to_num(y_raw)

        # 1. Create Sequences FIRST (from raw data)
        # We must preserve local temporal order (t, t-1...) within the sequence
        seq_length = args.seq_length
        X_seq, y_seq = [], []
        
        for i in range(len(X_raw) - seq_length):
            X_seq.append(X_raw[i:i+seq_length])
            y_seq.append(y_raw[i+seq_length]) 
            
        if len(X_seq) == 0:
            logger.error("Not enough data for sequence generation.")
            return
            
        # 2. Split Data (Random Shuffle to fix Distribution Shift)
        from sklearn.model_selection import train_test_split
        
        X_np = np.array(X_seq) # Shape: [N, seq_len, features]
        y_np = np.array(y_seq) # Shape: [N, 1]
        
        X_train_np, X_test_np, y_train_np, y_test_np = train_test_split(
            X_np, y_np, test_size=0.2, shuffle=True, random_state=42
        )
        
        # 3. Scaling - THE "ANTI-LEAKAGE" WAY
        # Fit scaler ONLY on Training Data
        from sklearn.preprocessing import StandardScaler
        scaler_X = StandardScaler()
        scaler_y = StandardScaler()
        
        # We need to reshape 3D [N, L, F] to 2D [N*L, F] to fit scaler
        N_train, L, F = X_train_np.shape
        X_train_reshaped = X_train_np.reshape(-1, F)
        
        scaler_X.fit(X_train_reshaped)
        scaler_y.fit(y_train_np)
        
        # Transform Train
        X_train_scaled = scaler_X.transform(X_train_reshaped).reshape(N_train, L, F)
        y_train_scaled = scaler_y.transform(y_train_np)
        
        # Transform Test (using scaler fitted on Train)
        N_test, _, _ = X_test_np.shape
        X_test_scaled = scaler_X.transform(X_test_np.reshape(-1, F)).reshape(N_test, L, F)
        y_test_scaled = scaler_y.transform(y_test_np)
        
        print(f"Data Stats (Train) - Max: {np.max(X_train_scaled):.2f}, Min: {np.min(X_train_scaled):.2f}")
        
        X_train = torch.FloatTensor(X_train_scaled)
        y_train = torch.FloatTensor(y_train_scaled).unsqueeze(1)
        X_test = torch.FloatTensor(X_test_scaled)
        # Note: y_test_scaled is already [N, 1], unsqueeze(1) would make it [N, 1, 1], but y_train logic above suggests [N] -> [N,1]
        # Checking y_train_np shape: it was appended as y_raw[i+seq_length] which is [1], so y_seq is list of arrays of shape [1].
        # y_np is [N, 1]. y_train_scaled is [N_train, 1].
        # So torch conversion should be:
        y_train = torch.FloatTensor(y_train_scaled) # Shape [N, 1]
        y_test = torch.FloatTensor(y_test_scaled)   # Shape [N, 1]
        
        # Model Init
        input_size = len(available_features)
        model = AirPhyNet(input_size, hidden_size, num_layers, dropout_prob=args.dropout)
        # Added weight_decay for L2 Regularization
        optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=1e-4)
        criterion = nn.MSELoss()
        
        print(f"Training with LR={learning_rate}, Hidden={hidden_size}, Epochs={epochs}...")
        
        final_train_loss = 0.0
        
        for epoch in range(epochs):
            model.train()
            optimizer.zero_grad()
            
            output = model(X_train)
            loss = criterion(output, y_train)
            
            # Physics loss might be unstable if predictions are wild
            p_loss = model.physics_loss(output, X_train)
            
            # Weighted physics loss (reduce weight if causing instability)
            total_loss = loss + 0.01 * p_loss 
            
            if torch.isnan(total_loss):
                logger.error(f"Loss became NaN at epoch {epoch}! Stopping training.")
                final_train_loss = float('nan')
                break
                
            total_loss.backward()
            
            # Gradient Clipping to prevent explosion
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            optimizer.step()
            
            final_train_loss = total_loss.item()
            
            if (epoch + 1) % 5 == 0:
                mlflow.log_metric("train_loss_history", total_loss.item(), step=epoch)

        # Evaluation on TEST Set
        model.eval()
        with torch.no_grad():
            preds = model(X_test)
            test_mse = criterion(preds, y_test).item()
            
            # Test R2 Score
            y_true_mean = torch.mean(y_test)
            ss_tot = torch.sum((y_test - y_true_mean) ** 2)
            ss_res = torch.sum((y_test - preds) ** 2)
            test_r2 = 1 - ss_res / (ss_tot + 1e-8)
            
            # Log exact metrics user requested
            mlflow.log_metric("train_loss", final_train_loss)
            mlflow.log_metric("test_mse", test_mse)
            mlflow.log_metric("test_r2", test_r2.item())
            
            print(f"Run Complete. Train Loss: {final_train_loss:.4f}, Test MSE: {test_mse:.4f}, Test R2: {test_r2.item():.4f}")

        # Save & Register (Safe Mode)
        try:
            # Only log artifact, avoid registry if causing bad request
            mlflow.pytorch.log_model(model, "model")
            print("Model artifact logged successfully.")
        except Exception as e:
            logger.warning(f"Failed to log model artifact: {e}")
            print("Skipping model upload, but metrics are saved.")
        
        # Transition to Production if best R2 (simplified logic: always promote latest for now, or user can choose)
        # We will let the search script decide or user manually promote in DagsHub.

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--learning_rate", type=float, default=0.001)
    parser.add_argument("--hidden_size", type=int, default=64)
    parser.add_argument("--num_layers", type=int, default=2)
    parser.add_argument("--seq_length", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--dropout", type=float, default=0.2, help="Dropout probability")
    parser.add_argument("--data_path", type=str, default=None, help="Path to CSV dataset")
    
    args = parser.parse_args()
    train(args)
