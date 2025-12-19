"""
AirPhyNet Model Training Script
Physics-Informed Neural Network for Air Quality Prediction
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
import mlflow
import mlflow.pytorch
import joblib
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class AirPhyNet(nn.Module):
    """
    Physics-Informed Neural Network for Air Quality Prediction
    Combines LSTM with physics constraints based on advection-diffusion equation
    """
    
    def __init__(self, input_size=6, hidden_size=128, num_layers=3, output_size=1, dropout=0.2):
        super(AirPhyNet, self).__init__()
        
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.dropout = dropout
        
        # LSTM layers for temporal patterns
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # Physics-informed layers
        self.physics_layer1 = nn.Linear(hidden_size, hidden_size)
        self.physics_layer2 = nn.Linear(hidden_size, hidden_size // 2)
        
        # Diffusion modeling layer
        self.diffusion_layer = nn.Linear(hidden_size // 2, hidden_size // 4)
        
        # Output layers
        self.output_layer = nn.Linear(hidden_size // 4, output_size)
        
        # Activation functions
        self.relu = nn.ReLU()
        self.tanh = nn.Tanh()
        self.dropout_layer = nn.Dropout(dropout)
        
        # Batch normalization
        self.bn1 = nn.BatchNorm1d(hidden_size)
        self.bn2 = nn.BatchNorm1d(hidden_size // 2)
        
    def physics_loss(self, predictions, inputs, dt=1.0):
        """
        Physics-informed loss based on advection-diffusion equation
        ∂C/∂t + ∇·(uC) = ∇·(D∇C) + S
        """
        if predictions.size(1) < 2:
            return torch.tensor(0.0, device=predictions.device)
        
        # Physical parameters (learnable or fixed)
        D = 0.1  # Diffusion coefficient
        u = 0.05  # Advection velocity
        
        # Calculate temporal gradient (∂C/∂t)
        dC_dt = torch.diff(predictions, dim=1) / dt
        
        # Simplified spatial gradients (assuming 1D spatial domain)
        # In real implementation, this would use actual spatial derivatives
        d2C_dx2 = torch.zeros_like(dC_dt)
        
        # Source term (simplified)
        S = torch.mean(inputs[:, :-1, :], dim=2, keepdim=True) * 0.01
        
        # Physics equation residual: ∂C/∂t - D∇²C + u∇C - S
        physics_residual = dC_dt - D * d2C_dx2 + u * dC_dt - S
        
        # Return mean squared residual
        return torch.mean(physics_residual ** 2)
    
    def forward(self, x):
        batch_size = x.size(0)
        
        # Initialize hidden states
        h0 = torch.zeros(self.num_layers, batch_size, self.hidden_size, device=x.device)
        c0 = torch.zeros(self.num_layers, batch_size, self.hidden_size, device=x.device)
        
        # LSTM forward pass
        lstm_out, (hn, cn) = self.lstm(x, (h0, c0))
        
        # Take the last output from LSTM
        lstm_out = lstm_out[:, -1, :]
        
        # Physics-informed processing
        physics_out1 = self.relu(self.bn1(self.physics_layer1(lstm_out)))
        physics_out1 = self.dropout_layer(physics_out1)
        
        physics_out2 = self.relu(self.bn2(self.physics_layer2(physics_out1)))
        physics_out2 = self.dropout_layer(physics_out2)
        
        # Diffusion modeling
        diffusion_out = self.tanh(self.diffusion_layer(physics_out2))
        
        # Final prediction
        output = self.output_layer(diffusion_out)
        
        return output

def create_sequences(data, target, sequence_length=24):
    """Create sequences for time series prediction"""
    sequences = []
    targets = []
    
    for i in range(len(data) - sequence_length):
        seq = data[i:i + sequence_length]
        tgt = target[i + sequence_length]
        sequences.append(seq)
        targets.append(tgt)
    
    return np.array(sequences), np.array(targets)

def train_model():
    """Main training function"""
    
    # Set random seeds for reproducibility
    torch.manual_seed(42)
    np.random.seed(42)
    
    # Device configuration
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Load and prepare data
    print("Loading data...")
    df = pd.read_csv('../data/aqi_cleaned.csv')
    
    # Select features for training
    feature_columns = ['pm25', 'pm10', 'so2', 'co', 'o3', 'no2']
    target_column = 'max'  # AQI target
    
    # Ensure all required columns exist
    available_features = [col for col in feature_columns if col in df.columns]
    if target_column not in df.columns:
        print(f"Target column '{target_column}' not found!")
        return
    
    print(f"Using features: {available_features}")
    
    # Prepare data
    X = df[available_features].values
    y = df[target_column].values
    
    # Handle missing values
    X = np.nan_to_num(X, nan=np.nanmean(X))
    y = np.nan_to_num(y, nan=np.nanmean(y))
    
    # Scale features
    scaler_X = StandardScaler()
    scaler_y = StandardScaler()
    
    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y.reshape(-1, 1)).flatten()
    
    # Create sequences
    sequence_length = 24  # 24 hours lookback
    X_seq, y_seq = create_sequences(X_scaled, y_scaled, sequence_length)
    
    print(f"Sequence shape: {X_seq.shape}, Target shape: {y_seq.shape}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_seq, y_seq, test_size=0.2, random_state=42, shuffle=False
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=42, shuffle=False
    )
    
    # Convert to tensors
    X_train_tensor = torch.FloatTensor(X_train).to(device)
    y_train_tensor = torch.FloatTensor(y_train).to(device)
    X_val_tensor = torch.FloatTensor(X_val).to(device)
    y_val_tensor = torch.FloatTensor(y_val).to(device)
    X_test_tensor = torch.FloatTensor(X_test).to(device)
    y_test_tensor = torch.FloatTensor(y_test).to(device)
    
    # Create data loaders
    batch_size = 64
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    
    val_dataset = TensorDataset(X_val_tensor, y_val_tensor)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    # Initialize model
    input_size = len(available_features)
    model = AirPhyNet(
        input_size=input_size,
        hidden_size=128,
        num_layers=3,
        output_size=1,
        dropout=0.2
    ).to(device)
    
    # Loss function and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=10, factor=0.5)
    
    # Training parameters
    num_epochs = 100
    best_val_loss = float('inf')
    patience = 20
    patience_counter = 0
    
    # Training history
    train_losses = []
    val_losses = []
    physics_losses = []
    
    # MLflow tracking
    mlflow.start_run()
    mlflow.log_params({
        'input_size': input_size,
        'hidden_size': 128,
        'num_layers': 3,
        'dropout': 0.2,
        'batch_size': batch_size,
        'learning_rate': 0.001,
        'sequence_length': sequence_length
    })
    
    print("Starting training...")
    
    # Training loop
    for epoch in range(num_epochs):
        model.train()
        train_loss = 0.0
        physics_loss_total = 0.0
        
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(batch_X)
            
            # Main loss
            main_loss = criterion(outputs.squeeze(), batch_y)
            
            # Physics loss
            physics_loss = model.physics_loss(outputs, batch_X)
            
            # Combined loss
            total_loss = main_loss + 0.1 * physics_loss  # Physics loss weight
            
            # Backward pass
            total_loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
            train_loss += main_loss.item()
            physics_loss_total += physics_loss.item()
        
        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch_X, batch_y in val_loader:
                outputs = model(batch_X)
                loss = criterion(outputs.squeeze(), batch_y)
                val_loss += loss.item()
        
        # Average losses
        train_loss /= len(train_loader)
        val_loss /= len(val_loader)
        physics_loss_total /= len(train_loader)
        
        train_losses.append(train_loss)
        val_losses.append(val_loss)
        physics_losses.append(physics_loss_total)
        
        # Learning rate scheduling
        scheduler.step(val_loss)
        
        # Early stopping
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            patience_counter = 0
            # Save best model
            torch.save(model.state_dict(), '../artifacts/best_airphynet_model.pth')
        else:
            patience_counter += 1
        
        # Log to MLflow
        mlflow.log_metrics({
            'train_loss': train_loss,
            'val_loss': val_loss,
            'physics_loss': physics_loss_total
        }, step=epoch)
        
        if epoch % 10 == 0:
            print(f'Epoch [{epoch}/{num_epochs}], Train Loss: {train_loss:.6f}, '
                  f'Val Loss: {val_loss:.6f}, Physics Loss: {physics_loss_total:.6f}')
        
        if patience_counter >= patience:
            print(f"Early stopping at epoch {epoch}")
            break
    
    # Load best model for evaluation
    model.load_state_dict(torch.load('../artifacts/best_airphynet_model.pth'))
    
    # Evaluation
    model.eval()
    with torch.no_grad():
        train_pred = model(X_train_tensor).cpu().numpy()
        val_pred = model(X_val_tensor).cpu().numpy()
        test_pred = model(X_test_tensor).cpu().numpy()
    
    # Inverse transform predictions
    train_pred_orig = scaler_y.inverse_transform(train_pred)
    val_pred_orig = scaler_y.inverse_transform(val_pred)
    test_pred_orig = scaler_y.inverse_transform(test_pred)
    
    y_train_orig = scaler_y.inverse_transform(y_train.reshape(-1, 1))
    y_val_orig = scaler_y.inverse_transform(y_val.reshape(-1, 1))
    y_test_orig = scaler_y.inverse_transform(y_test.reshape(-1, 1))
    
    # Calculate metrics
    train_mse = mean_squared_error(y_train_orig, train_pred_orig)
    train_mae = mean_absolute_error(y_train_orig, train_pred_orig)
    train_r2 = r2_score(y_train_orig, train_pred_orig)
    
    val_mse = mean_squared_error(y_val_orig, val_pred_orig)
    val_mae = mean_absolute_error(y_val_orig, val_pred_orig)
    val_r2 = r2_score(y_val_orig, val_pred_orig)
    
    test_mse = mean_squared_error(y_test_orig, test_pred_orig)
    test_mae = mean_absolute_error(y_test_orig, test_pred_orig)
    test_r2 = r2_score(y_test_orig, test_pred_orig)
    
    # Log final metrics
    mlflow.log_metrics({
        'train_mse': train_mse,
        'train_mae': train_mae,
        'train_r2': train_r2,
        'val_mse': val_mse,
        'val_mae': val_mae,
        'val_r2': val_r2,
        'test_mse': test_mse,
        'test_mae': test_mae,
        'test_r2': test_r2
    })
    
    print(f"\\n=== FINAL RESULTS ===")
    print(f"Test MSE: {test_mse:.4f}")
    print(f"Test MAE: {test_mae:.4f}")
    print(f"Test R²: {test_r2:.4f}")
    
    # Save model and artifacts
    torch.save(model.state_dict(), '../artifacts/final_airphynet_model.pth')
    joblib.dump(scaler_X, '../artifacts/scaler_X.pkl')
    joblib.dump(scaler_y, '../artifacts/scaler_y.pkl')
    
    # Save model info
    model_info = {
        'input_size': input_size,
        'hidden_size': 128,
        'num_layers': 3,
        'dropout': 0.2,
        'sequence_length': sequence_length,
        'feature_columns': available_features,
        'target_column': target_column,
        'test_mse': test_mse,
        'test_mae': test_mae,
        'test_r2': test_r2
    }
    
    joblib.dump(model_info, '../artifacts/model_info.pkl')
    
    # Log model to MLflow
    mlflow.pytorch.log_model(model, "airphynet_model")
    
    # Plot training history
    plt.figure(figsize=(15, 5))
    
    plt.subplot(1, 3, 1)
    plt.plot(train_losses, label='Train Loss')
    plt.plot(val_losses, label='Validation Loss')
    plt.title('Training and Validation Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)
    
    plt.subplot(1, 3, 2)
    plt.plot(physics_losses, label='Physics Loss', color='red')
    plt.title('Physics Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Physics Loss')
    plt.legend()
    plt.grid(True)
    
    plt.subplot(1, 3, 3)
    plt.scatter(y_test_orig, test_pred_orig, alpha=0.6)
    plt.plot([y_test_orig.min(), y_test_orig.max()], [y_test_orig.min(), y_test_orig.max()], 'r--', lw=2)
    plt.xlabel('Actual AQI')
    plt.ylabel('Predicted AQI')
    plt.title(f'Test Set Predictions (R² = {test_r2:.3f})')
    plt.grid(True)
    
    plt.tight_layout()
    plt.savefig('../artifacts/training_results.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    mlflow.end_run()
    
    print("Training completed successfully!")
    print(f"Model saved to: ../artifacts/final_airphynet_model.pth")
    print(f"Artifacts saved to: ../artifacts/")

if __name__ == "__main__":
    train_model()