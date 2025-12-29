import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_data(n_rows=1000):
    base_time = datetime.now()
    data = []
    
    # Simulating sensor readings
    co2 = 400.0
    temp = 25.0
    hum = 50.0
    
    for i in range(n_rows):
        timestamp = base_time + timedelta(minutes=5*i)
        
        # Random walk with drift
        co2 += np.random.normal(0, 5)
        temp += np.random.normal(0, 0.1)
        hum += np.random.normal(0, 0.5)
        
        # Bounds
        co2 = max(400, min(2000, co2))
        temp = max(15, min(35, temp))
        hum = max(30, min(90, hum))
        
        # AQI Proxy (Simple formula for demo)
        aqi = (co2 - 400) / 10 + (temp - 25) * 2
        
        data.append({
            'timestamp': timestamp,
            'co2_ppm': co2,
            'temperature': temp,
            'humidity': hum,
            'sensor_id': 'sensor_sim_01'
        })
        
    df = pd.DataFrame(data)
    df.to_csv('clean_dataset.csv', index=False)
    print(f"✅ Generated 'clean_dataset.csv' with {n_rows} rows.")

if __name__ == "__main__":
    generate_data()
