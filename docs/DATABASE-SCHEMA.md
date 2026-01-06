# 🗄️ Database Schema Documentation

Breev menggunakan **MongoDB** (NoSQL) yang dirancang untuk performa data time-series IoT.

## Collections

### 1. `sensor_logs`
Menyimpan data mentah dari perangkat ESP32.
*   **Primary Index**: `timestamp` (Descending), `sensor_id`

```json
{
  "_id": "ObjectId(...)",
  "sensor_id": "device_001",
  "temperature": 28.5,    // Celsius
  "humidity": 60.1,       // Percent
  "co2_ppm": 450.2,       // PPM
  "aqi": 35,              // Calculated AQI (0-500)
  "rssi": -65,            // WiFi Quality (dBm)
  "received_at": "ISODate('2024-01-01T12:00:00Z')"
}
```

### 2. `devices`
Metadata inventaris perangkat.
*   **Unique Index**: `sensor_id`

```json
{
  "_id": "ObjectId(...)",
  "sensor_id": "device_001",
  "name": "Meeting Room A",
  "location": "Floor 2",
  "status": "active",     // active, maintenance, offline
  "installed_at": "ISODate(...)"
}
```

### 3. `predictions`
Hasil forecasting AI (disimpan untuk cache/history).

```json
{
  "_id": "ObjectId(...)",
  "sensor_id": "device_001",
  "generated_at": "ISODate(...)",
  "forecast_hours": [
    { "hour_offset": 1, "aqi": 40 },
    { "hour_offset": 2, "aqi": 42 },
    ...
  ]
}
```

### 4. `system_settings`
Konfigurasi tunggal (Singleton) untuk aplikasi.

```json
{
  "_id": "ObjectId(...)",
  "type": "global",
  "api_key": "sk_live_xxxxx",
  "aqi_thresholds": {
    "moderate": 100,
    "unhealthy": 150
  },
  "notifications": {
    "enabled": true,
    "email_list": ["admin@breev.id"]
  }
}
```

## Setup Script
Untuk inisialisasi database dan indexes secara otomatis, jalankan script Python yang tersedia:
`backend-services/database-scripts/setup_atlas.py`
