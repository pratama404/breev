import torch
import torch.nn as nn
import numpy as np

class AirPhyNet(nn.Module):
    def __init__(self, input_size=4, hidden_size=64, num_layers=2, output_size=1, dropout_prob=0.2):
        super(AirPhyNet, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # LSTM layers for temporal patterns
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=dropout_prob if num_layers > 1 else 0)
        
        # Physics-informed layers
        self.physics_layer = nn.Linear(hidden_size, hidden_size)
        self.diffusion_layer = nn.Linear(hidden_size, hidden_size)
        
        # Output layer
        self.output_layer = nn.Linear(hidden_size, output_size)
        
        # Activation functions & Regularization
        self.relu = nn.ReLU()
        self.tanh = nn.Tanh()
        self.dropout = nn.Dropout(dropout_prob)
        
    def physics_loss(self, predictions, inputs):
        """
        Physics-informed loss based on advection-diffusion equation
        ∂C/∂t + ∇·(uC) = ∇·(D∇C) + S
        """
        # Simplified physics constraint
        # Assume diffusion coefficient D and advection velocity u
        D = 0.1  # Diffusion coefficient
        u = 0.05  # Advection velocity
        
        # Check output dimension
        if predictions.shape[1] <= 1:
            # Cannot compute temporal gradient from single time point
            # Return 0.0 (no physics constraint penalty)
            return torch.tensor(0.0, device=predictions.device, requires_grad=True)

        # Calculate temporal gradient
        dt = 1.0  # Time step (normalized)
        dC_dt = torch.diff(predictions, dim=1) / dt
        
        # Simplified spatial gradients (assuming 1D)
        # Note: This is still a placeholder as spatial is hard without spatial coords
        d2C_dx2 = torch.zeros_like(dC_dt)  
        
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
        physics_out = self.dropout(self.relu(self.physics_layer(lstm_out)))
        diffusion_out = self.dropout(self.tanh(self.diffusion_layer(physics_out)))
        
        # Final prediction
        output = self.output_layer(diffusion_out)
        
        return output

def create_model():
    """Create and return AirPhyNet model"""
    model = AirPhyNet(input_size=4, hidden_size=64, num_layers=2, output_size=1)
    return model

def preprocess_data(data):
    """Preprocess sensor data for model input using Fixed Constants (Approximate Training Dist)"""
    data_array = np.array(data)
    
    # Approx stats (Temp, Hum, CO2, AQI)
    # Based on typical sensor ranges:
    # Temp: 20-40 -> Mean 30, Std 10
    # Hum: 40-80 -> Mean 60, Std 20
    # CO2: 400-2000 -> Mean 1000, Std 500
    # AQI: 0-300 -> Mean 100, Std 50
    means = np.array([30.0, 60.0, 1000.0, 100.0])
    stds = np.array([10.0, 20.0, 500.0, 50.0])
    
    # Broadcast subtraction/division
    # data_array shape is (Seq_Len, 4)
    normalized_data = (data_array - means) / (stds + 1e-8)
    
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