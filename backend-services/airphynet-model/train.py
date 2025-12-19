import os
import torch
import torch.nn as nn
import torch.optim as optim
import mlflow
import mlflow.pytorch
import dagshub
import pandas as pd
import numpy as np
from datetime import datetime
from model import AirPhyNet, create_model

def train():
    # Initialize DagsHub/MLflow
    # Note: For this to work efficiently locally, consider 'dagshub.init()'
    # But for a script, setting env vars or tracking URI is standard.
    
    DAGSHUB_REPO = "pratama404/breev"
    mlflow.set_tracking_uri(f"https://dagshub.com/{DAGSHUB_REPO}.mlflow")
    
    print("Starting training experiment...")
    
    # Auto-configure auth if running locally with token in env or .dagshub file
    # If inside docker, rely on MLFLOW_TRACKING_USERNAME/PASSWORD env vars
    
    experiment_name = "AirPhyNet_Training"
    mlflow.set_experiment(experiment_name)
    
    with mlflow.start_run():
        # Hyperparameters
        input_size = 4
        hidden_size = 64
        num_layers = 2
        learning_rate = 0.001
        epochs = 10
        
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
        
        # Dummy Training Data (Replace with real MongoDB fetching)
        # N, Seq_len, Features
        X_train = torch.randn(100, 10, input_size) 
        y_train = torch.randn(100, 1) # Target: Next AQI
        
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
        
        # Save Model Artifact
        mlflow.pytorch.log_model(model, "model")
        
        print("Training complete. Model logged to DagsHub.")

if __name__ == "__main__":
    # Ensure auth env vars are set before running
    if not os.environ.get("MLFLOW_TRACKING_USERNAME"):
        print("Warning: MLFLOW_TRACKING_USERNAME not set. Ensure you have DagsHub credentials.")
        
    train()
