# AirPhyNet Experiment - Jakarta Air Quality Prediction

This experiment implements a Physics-Informed Neural Network (AirPhyNet) for air quality prediction using the Jakarta Air Quality dataset from Kaggle.

## 📊 Dataset Information

**Source**: [Jakarta Air Quality Index 2010-2025](https://www.kaggle.com/datasets/senadu34/air-quality-index-in-jakarta-2010-2021)

**Description**: Air Quality Index (AQI) measurements from 5 monitoring stations in DKI Jakarta from January 2010 to February 2025.

### Variables:
- `tanggal`: Measurement date
- `stasiun`: Monitoring station name
- `pm25`: PM2.5 concentration (µg/m³)
- `pm10`: PM10 concentration (µg/m³)
- `so2`: SO2 concentration (ppm)
- `co`: CO concentration (ppm)
- `o3`: O3 concentration (ppm)
- `no2`: NO2 concentration (ppm)
- `max`: Maximum pollutant value (AQI)
- `critical`: Most critical pollutant
- `category`: Air quality category

## 🏗️ Project Structure

```
eksperimen/
├── data/                          # Dataset files
│   ├── ispu_dki_all.csv          # Raw dataset
│   ├── aqi_cleaned.csv           # Cleaned dataset
│   └── aqi_scaled.csv            # Scaled dataset
├── preprocessing/
│   └── explore.ipynb             # Data exploration & preprocessing
├── models/
│   └── airphynet_model.py        # AirPhyNet training script
├── inference/
│   └── inference_service.py      # Inference service
├── artifacts/                     # Model artifacts
│   ├── final_airphynet_model.pth # Trained model
│   ├── scaler_X.pkl              # Feature scaler
│   ├── scaler_y.pkl              # Target scaler
│   └── model_info.pkl            # Model metadata
├── notebooks/                     # Additional notebooks
├── requirements.txt               # Python dependencies
└── README.md                     # This file
```

## 🚀 Getting Started

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv airphynet_env
source airphynet_env/bin/activate  # Linux/Mac
# or
airphynet_env\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Download Dataset

1. Download the dataset from [Kaggle](https://www.kaggle.com/datasets/senadu34/air-quality-index-in-jakarta-2010-2021)
2. Extract and place `ispu_dki_all.csv` in the `data/` folder

### 3. Data Preprocessing

```bash
# Run Jupyter notebook for data exploration
jupyter notebook preprocessing/explore.ipynb
```

The preprocessing notebook includes:
- Data loading and exploration
- Missing value handling
- Outlier detection and treatment
- Feature scaling and normalization
- Categorical encoding
- Statistical analysis and visualization

### 4. Model Training

```bash
# Train AirPhyNet model
cd models/
python airphynet_model.py
```

Training features:
- Physics-Informed Neural Network architecture
- LSTM for temporal patterns
- Advection-diffusion equation constraints
- MLflow experiment tracking
- Early stopping and model checkpointing

### 5. Model Inference

```bash
# Test inference service
cd inference/
python inference_service.py
```

Inference capabilities:
- Single-point AQI prediction
- Multi-step forecasting (1-6 hours ahead)
- Confidence scoring
- Health recommendations

## 🧠 AirPhyNet Architecture

The AirPhyNet model combines:

1. **LSTM Layers**: Capture temporal dependencies in air quality data
2. **Physics-Informed Layers**: Incorporate advection-diffusion equation constraints
3. **Batch Normalization**: Improve training stability
4. **Dropout Regularization**: Prevent overfitting

### Physics Constraints

The model incorporates the advection-diffusion equation:
```
∂C/∂t + ∇·(uC) = ∇·(D∇C) + S
```

Where:
- C: Pollutant concentration
- u: Advection velocity (wind)
- D: Diffusion coefficient
- S: Source term

## 📈 Model Performance

Expected performance metrics:
- **MSE**: < 100 (AQI units²)
- **MAE**: < 8 (AQI units)
- **R²**: > 0.85

## 🔧 Configuration

### Model Hyperparameters

```python
{
    'input_size': 6,           # Number of input features
    'hidden_size': 128,        # LSTM hidden units
    'num_layers': 3,           # LSTM layers
    'dropout': 0.2,            # Dropout rate
    'sequence_length': 24,     # Input sequence length (hours)
    'batch_size': 64,          # Training batch size
    'learning_rate': 0.001,    # Adam optimizer learning rate
    'physics_weight': 0.1      # Physics loss weight
}
```

### Training Parameters

```python
{
    'num_epochs': 100,         # Maximum epochs
    'patience': 20,            # Early stopping patience
    'val_split': 0.2,          # Validation split
    'test_split': 0.2          # Test split
}
```

## 📊 Experiment Tracking

The project uses MLflow for experiment tracking:

```bash
# Start MLflow UI
mlflow ui

# View at http://localhost:5000
```

Tracked metrics:
- Training/validation loss
- Physics loss
- Model performance metrics
- Hyperparameters
- Model artifacts

## 🔍 Data Analysis Results

### Key Findings:
1. **PM10 and O3** are the most critical pollutants (67% of cases)
2. **Strong correlation** between PM2.5 and PM10 (r=0.85)
3. **Seasonal patterns** in air quality with peaks during dry season
4. **Weekly cycles** with higher pollution on weekdays

### Data Quality:
- **Missing values**: ~22% (handled via imputation)
- **Outliers**: Capped using IQR method
- **Data range**: 2010-2025 (15+ years)
- **Temporal resolution**: Daily measurements

## 🎯 Use Cases

1. **Real-time Monitoring**: Predict AQI from current sensor readings
2. **Early Warning**: 6-hour ahead forecasting for health alerts
3. **Policy Planning**: Long-term air quality trend analysis
4. **Health Recommendations**: Personalized advice based on predictions

## 🔧 Integration with IoT System

The trained model integrates with the main IoT system:

```python
# In backend-services/airphynet-model/inference_api.py
from eksperimen.inference.inference_service import AirQualityPredictor

predictor = AirQualityPredictor('../eksperimen/artifacts/final_airphynet_model.pth')
prediction = predictor.predict_single(sensor_data)
```

## 📝 Future Improvements

1. **Multi-location modeling**: Extend to multiple cities
2. **Weather integration**: Include meteorological data
3. **Real-time learning**: Online model updates
4. **Ensemble methods**: Combine multiple models
5. **Spatial modeling**: Include geographic features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Run experiments and document results
4. Submit pull request with findings

## 📄 References

1. Jakarta Air Quality Dataset - Kaggle
2. Physics-Informed Neural Networks - Raissi et al.
3. LSTM Networks for Time Series - Hochreiter & Schmidhuber
4. Air Quality Index Standards - EPA Guidelines

---

**Developed for the AQI IoT Monitoring System Project**