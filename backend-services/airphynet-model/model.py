import torch
import torch.nn as nn
import numpy as np

class AirPhyNet(nn.Module):
    def __init__(self, input_size=4, hidden_size=64, num_layers=2, output_size=1):
        super(AirPhyNet, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM layers for temporal patterns
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        
        # Physics-informed layers
        self.physics_layer = nn.Linear(hidden_size, hidden_size)
        self.diffusion_layer = nn.Linear(hidden_size, hidden_size)
        
        # Output layer
        self.output_layer = nn.Linear(hidden_size, output_size)
        
        # Activation functions
        self.relu = nn.ReLU()
        self.tanh = nn.Tanh()
        
    def physics_loss(self, predictions, inputs):
        """
        Physics-informed loss based on advection-diffusion equation
        ∂C/∂t + ∇·(uC) = ∇·(D∇C) + S
        """
        # Simplified physics constraint
        # Assume diffusion coefficient D and advection velocity u
        D = 0.1  # Diffusion coefficient
        u = 0.05  # Advection velocity
        
        # Calculate temporal gradient
        dt = 1.0  # Time step (normalized)
        dC_dt = torch.diff(predictions, dim=1) / dt
        
        # Simplified spatial gradients (assuming 1D)
        d2C_dx2 = torch.zeros_like(dC_dt)  # Placeholder for spatial derivatives
        
        # Physics equation residual
        residual = dC_dt - D * d2C_dx2
        
        return torch.mean(residual ** 2)
    
    def forward(self, x):
        # Initialize hidden state
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        
        # LSTM forward pass
        lstm_out, _ = self.lstm(x, (h0, c0))
        
        # Take the last output
        lstm_out = lstm_out[:, -1, :]
        
        # Physics-informed processing
        physics_out = self.relu(self.physics_layer(lstm_out))
        diffusion_out = self.tanh(self.diffusion_layer(physics_out))
        
        # Final prediction
        output = self.output_layer(diffusion_out)
        
        return output

def create_model():
    """Create and return AirPhyNet model"""
    model = AirPhyNet(input_size=4, hidden_size=64, num_layers=2, output_size=1)
    return model

def preprocess_data(data):
    """Preprocess sensor data for model input"""
    # Normalize data
    data_array = np.array(data)
    
    # Simple normalization (in production, use proper scaling)
    normalized_data = (data_array - np.mean(data_array, axis=0)) / (np.std(data_array, axis=0) + 1e-8)
    
    return torch.FloatTensor(normalized_data).unsqueeze(0)

def predict_aqi(model, sensor_data, hours_ahead=6):
    """Predict AQI for future hours"""
    model.eval()
    
    with torch.no_grad():
        # Preprocess input data
        input_tensor = preprocess_data(sensor_data)
        
        # Make prediction
        prediction = model(input_tensor)
        
        # Convert to CO2 PPM (Scale 0-5000 approx)
        # Using 5000 as a safe upper bound for indoor CO2
        co2_prediction = torch.clamp(prediction * 100, 0, 5000)
        
        return co2_prediction.item()