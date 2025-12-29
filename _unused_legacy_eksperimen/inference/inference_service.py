"""
AirPhyNet Inference Service
Real-time air quality prediction using trained AirPhyNet model
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import joblib
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class AirPhyNet(nn.Module):
    """
    Physics-Informed Neural Network for Air Quality Prediction
    (Same architecture as training script)
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

class AirQualityPredictor:
    """
    Air Quality Prediction Service
    """
    
    def __init__(self, model_path='../artifacts/final_airphynet_model.pth'):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.scaler_X = None
        self.scaler_y = None
        self.model_info = None
        self.sequence_length = 24
        
        self.load_model(model_path)
    
    def load_model(self, model_path):
        """Load trained model and preprocessing objects"""
        try:
            # Load model info
            self.model_info = joblib.load('../artifacts/model_info.pkl')
            
            # Load scalers
            self.scaler_X = joblib.load('../artifacts/scaler_X.pkl')
            self.scaler_y = joblib.load('../artifacts/scaler_y.pkl')
            
            # Initialize model with saved parameters
            self.model = AirPhyNet(
                input_size=self.model_info['input_size'],
                hidden_size=self.model_info['hidden_size'],
                num_layers=self.model_info['num_layers'],
                dropout=self.model_info['dropout']
            ).to(self.device)
            
            # Load model weights
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.eval()
            
            self.sequence_length = self.model_info['sequence_length']
            
            print(f"Model loaded successfully!")
            print(f"Input features: {self.model_info['feature_columns']}")
            print(f"Model performance - R²: {self.model_info['test_r2']:.3f}")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def preprocess_data(self, data):
        """Preprocess input data for prediction"""
        try:
            # Ensure data is numpy array
            if isinstance(data, list):
                data = np.array(data)
            elif isinstance(data, pd.DataFrame):
                data = data.values
            
            # Handle missing values
            data = np.nan_to_num(data, nan=0.0)
            
            # Scale features
            data_scaled = self.scaler_X.transform(data)
            
            return data_scaled
            
        except Exception as e:
            print(f"Error preprocessing data: {e}")
            raise
    
    def create_sequence(self, data):
        """Create sequence from recent data points"""
        if len(data) < self.sequence_length:
            # Pad with zeros if insufficient data
            padding = np.zeros((self.sequence_length - len(data), data.shape[1]))
            data = np.vstack([padding, data])
        elif len(data) > self.sequence_length:
            # Take last sequence_length points
            data = data[-self.sequence_length:]
        
        return data.reshape(1, self.sequence_length, -1)
    
    def predict_single(self, sensor_data):
        """
        Make single prediction from sensor data
        
        Args:
            sensor_data: List or array of recent sensor readings
                        Shape: (sequence_length, num_features) or (num_features,)
        
        Returns:
            dict: Prediction result with AQI value and confidence
        """
        try:
            # Ensure correct input format
            if len(sensor_data.shape) == 1:
                sensor_data = sensor_data.reshape(1, -1)
            
            # Preprocess data
            data_scaled = self.preprocess_data(sensor_data)
            
            # Create sequence
            sequence = self.create_sequence(data_scaled)
            
            # Convert to tensor
            input_tensor = torch.FloatTensor(sequence).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                prediction_scaled = self.model(input_tensor)
                prediction = self.scaler_y.inverse_transform(
                    prediction_scaled.cpu().numpy().reshape(-1, 1)
                )
            
            aqi_value = float(prediction[0, 0])
            
            # Calculate confidence (simplified)
            confidence = min(0.95, max(0.6, 1.0 - abs(aqi_value - 75) / 200))
            
            return {
                'predicted_aqi': aqi_value,
                'confidence': confidence,
                'timestamp': datetime.now().isoformat(),
                'model_version': '1.0'
            }
            
        except Exception as e:
            print(f"Error making prediction: {e}")
            return {
                'predicted_aqi': None,
                'confidence': 0.0,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def predict_sequence(self, sensor_data, hours_ahead=6):
        """
        Make multi-step predictions
        
        Args:
            sensor_data: Historical sensor data
            hours_ahead: Number of hours to predict ahead
        
        Returns:
            list: List of predictions for each hour
        """
        try:
            predictions = []
            current_data = sensor_data.copy()
            
            for hour in range(1, hours_ahead + 1):
                # Make prediction for current sequence
                pred_result = self.predict_single(current_data)
                
                if pred_result['predicted_aqi'] is not None:
                    # Create prediction entry
                    future_time = datetime.now() + timedelta(hours=hour)
                    prediction_entry = {
                        'hour': hour,
                        'predicted_time': future_time.isoformat(),
                        'predicted_aqi': pred_result['predicted_aqi'],
                        'confidence': pred_result['confidence'] * (0.95 ** (hour - 1))  # Decay confidence
                    }
                    predictions.append(prediction_entry)
                    
                    # Update sequence for next prediction (simplified)
                    # In practice, you might want more sophisticated sequence updating
                    if len(current_data) >= self.sequence_length:
                        current_data = current_data[1:]  # Remove first element
                    
                    # Add predicted value as new input (simplified)
                    last_row = current_data[-1].copy()
                    # Update with some variation based on prediction
                    variation = np.random.normal(0, 0.1, size=last_row.shape)
                    new_row = last_row + variation
                    current_data = np.vstack([current_data, new_row])
                else:
                    break
            
            return predictions
            
        except Exception as e:
            print(f"Error making sequence predictions: {e}")
            return []
    
    def get_aqi_category(self, aqi_value):
        """Get AQI category based on value"""
        if aqi_value <= 50:
            return 'Good'
        elif aqi_value <= 100:
            return 'Moderate'
        elif aqi_value <= 150:
            return 'Unhealthy for Sensitive Groups'
        elif aqi_value <= 200:
            return 'Unhealthy'
        elif aqi_value <= 300:
            return 'Very Unhealthy'
        else:
            return 'Hazardous'
    
    def get_health_recommendation(self, aqi_value):
        """Get health recommendation based on AQI"""
        category = self.get_aqi_category(aqi_value)
        
        recommendations = {
            'Good': 'Air quality is good. Normal activities can be continued.',
            'Moderate': 'Air quality is acceptable. Sensitive individuals should consider limiting outdoor activities.',
            'Unhealthy for Sensitive Groups': 'Sensitive groups should reduce outdoor activities and wear masks.',
            'Unhealthy': 'Everyone should limit outdoor activities and use air purifiers indoors.',
            'Very Unhealthy': 'Avoid outdoor activities. Stay indoors with air purification.',
            'Hazardous': 'Emergency conditions. Everyone should stay indoors and use air purifiers.'
        }
        
        return recommendations.get(category, 'Unknown air quality level.')

def simulate_sensor_data(num_points=24):
    """Simulate sensor data for testing"""
    np.random.seed(42)
    
    # Simulate realistic air quality data
    pm25 = np.random.normal(35, 15, num_points)
    pm10 = np.random.normal(50, 20, num_points)
    so2 = np.random.normal(10, 5, num_points)
    co = np.random.normal(1.2, 0.5, num_points)
    o3 = np.random.normal(80, 25, num_points)
    no2 = np.random.normal(25, 10, num_points)
    
    # Ensure positive values
    data = np.column_stack([
        np.maximum(pm25, 0),
        np.maximum(pm10, 0),
        np.maximum(so2, 0),
        np.maximum(co, 0),
        np.maximum(o3, 0),
        np.maximum(no2, 0)
    ])
    
    return data

def main():
    """Test the inference service"""
    print("=== AirPhyNet Inference Service Test ===")
    
    try:
        # Initialize predictor
        predictor = AirQualityPredictor()
        
        # Simulate sensor data
        print("\\nGenerating simulated sensor data...")
        sensor_data = simulate_sensor_data(24)
        print(f"Sensor data shape: {sensor_data.shape}")
        
        # Make single prediction
        print("\\nMaking single prediction...")
        result = predictor.predict_single(sensor_data)
        print(f"Prediction result: {json.dumps(result, indent=2)}")
        
        if result['predicted_aqi'] is not None:
            aqi = result['predicted_aqi']
            category = predictor.get_aqi_category(aqi)
            recommendation = predictor.get_health_recommendation(aqi)
            
            print(f"\\nAQI: {aqi:.1f}")
            print(f"Category: {category}")
            print(f"Recommendation: {recommendation}")
        
        # Make sequence predictions
        print("\\nMaking sequence predictions...")
        sequence_predictions = predictor.predict_sequence(sensor_data, hours_ahead=6)
        
        print("\\nPredictions for next 6 hours:")
        for pred in sequence_predictions:
            print(f"Hour {pred['hour']}: AQI {pred['predicted_aqi']:.1f} "
                  f"(Confidence: {pred['confidence']:.2f})")
        
        print("\\nInference service test completed successfully!")
        
    except Exception as e:
        print(f"Error in inference service: {e}")

if __name__ == "__main__":
    main()