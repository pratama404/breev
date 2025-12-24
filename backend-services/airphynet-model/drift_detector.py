import os
import sys
import logging
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from pymongo import MongoClient
from scipy.stats import ks_2samp
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("DriftDetector")

# Configuration
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "aqi_monitoring")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "sensor_logs")

# Thresholds
DRIFT_THRESHOLD = 0.05  # P-value threshold (if < 0.05, distributions are different)
MIN_SAMPLES = 50        # Minimum samples required to run test

def get_data(days_lookback=1):
    """Fetch data from MongoDB for the specified lookback period."""
    if not MONGODB_URI:
        logger.error("MONGODB_URI not set.")
        sys.exit(1)
        
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        # Calculate time window
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days_lookback)
        
        # Query (assuming 'received_at' or 'timestamp' exists)
        # We try 'received_at' first as per ingestor.py
        query = {"received_at": {"$gte": start_time}}
        
        cursor = collection.find(query, {"co2_ppm": 1, "pm25": 1, "aqi": 1, "_id": 0})
        data = list(cursor)
        
        return pd.DataFrame(data)
    except Exception as e:
        logger.error(f"Error fetching data: {e}")
        return pd.DataFrame()

def check_drift():
    """
    Checks for data drift between 'reference' (e.g. last week) and 'current' (e.g. today).
    Returns exit code 1 if drift detected, 0 otherwise.
    """
    logger.info("Fetching data for drift detection...")
    
    # Current window: Last 24 hours
    current_df = get_data(days_lookback=1)
    
    # Reference window: Previous 7 days (simplified as "last 7 days" for now, 
    # ideally should be a fixed training set or sliding window excluding 'current')
    reference_df = get_data(days_lookback=7)
    
    if current_df.empty or reference_df.empty:
        logger.warning("Not enough data to check for drift.")
        sys.exit(0) # No fail, just skip
        
    if len(current_df) < MIN_SAMPLES:
        logger.warning(f"Insufficient current samples ({len(current_df)}) for drift test.")
        sys.exit(0)

    # Metric to check: CO2 PPM (since we use MQ135)
    metric = 'co2_ppm'
    if metric not in current_df.columns:
        if 'pm25' in current_df.columns:
            metric = 'pm25'
        elif 'aqi' in current_df.columns:
            metric = 'aqi'
        else:
            logger.error("No valid metric (co2_ppm/pm25/aqi) found in data.")
            sys.exit(0)
            
    current_data = current_df[metric].dropna().values
    ref_data = reference_df[metric].dropna().values
    
    # Perform Kolmogorov-Smirnov Test
    statistic, p_value = ks_2samp(ref_data, current_data)
    
    logger.info(f"Drift Test ({metric}): statistic={statistic:.4f}, p-value={p_value:.4f}")
    
    if p_value < DRIFT_THRESHOLD:
        logger.warning(f"⚠️ DATA DRIFT DETECTED! (p-value {p_value:.4f} < {DRIFT_THRESHOLD})")
        
        # OPTIONAL: Save drift report to DagsHub or file
        
        # Exit with 1 to signal "Drift Found" -> Trigger Retraining
        sys.exit(1)
    else:
        logger.info("✅ No meaningful drift detected.")
        sys.exit(0)

if __name__ == "__main__":
    check_drift()
