# 🔌 Breev API Documentation (v2.0)

Dokumentasi lengkap untuk endpoint REST API backend Breev. Backend ini dibangun menggunakan **FastAPI** (Python).

**Base URL**: `https://[TUNNEL_URL].trycloudflare.com`

---

## 🛡️ Authentication & Security

Semua endpoint yang bersifat *write* atau *restricted* memerlukan autentikasi.

### API Key (untuk IoT Devices & Scripts)
Digunakan oleh ESP32 atau script ingestion eksternal.
*   **Header**: `x-api-key`
*   **Value**: Kunci yang digenerate di Dashboard Admin > Settings.
*   **Scope**: Akses ke `/ingest` dan `/predict`.

### Admin Auth (untuk Dashboard)
Dashboard menggunakan sesi berbasis Environment Variable (`ADMIN_PASSWORD`).

---

## 1. IoT Data Ingestion

### `POST /ingest`
Menerima data telemetri dari sensor ESP32. Menyimpannya ke MongoDB `sensor_logs`.

**Request Headers:**
*   `Content-Type: application/json`
*   `x-api-key: [YOUR_API_KEY]`

**Request Body:**
```json
{
  "sensor_id": "device_001",    // String (Required) - ID Unik Device
  "temperature": 28.5,          // Float - Celcius
  "humidity": 60.2,             // Float - Persen
  "co2_ppm": 450.0,             // Float - Raw PPM
  "aqi": 34,                    // Int - Calculated AQI (Optional, backend can recalculate)
  "rssi": -65,                  // Int - WiFi Signal Strength
  "uptime_seconds": 3600        // Int - Device Uptime
}
```

**Response:**
*   **200 OK**
    ```json
    {
      "status": "success",
      "message": "Data ingested successfully",
      "id": "651a..." // MongoDB ObjectId
    }
    ```
*   **401 Unauthorized**: API Key salah atau tidak ada.
*   **422 Validation Error**: Body JSON tidak sesuai format.

---

## 2. AI Forecasting

### `POST /predict`
Menghasilkan prediksi tren kualitas udara (AQI) untuk beberapa jam ke depan.

**Request Body:**
```json
{
  "sensor_id": "device_001",
  "hours_ahead": 6  // (Optional) Default: 6, Max: 24
}
```

**Response:**
*   **200 OK**
    ```json
    {
      "sensor_id": "device_001",
      "model_version": "v1.2",
      "generated_at": "2024-01-01T12:00:00Z",
      "forecast": [
        {"hour": 1, "aqi": 45, "status": "Good"},
        {"hour": 2, "aqi": 48, "status": "Good"},
        {"hour": 3, "aqi": 55, "status": "Moderate"},
        ...
      ]
    }
    ```
*   **404 Not Found**: Sensor ID tidak ditemukan atau tidak cukup data historis untuk prediksi.

---

## 3. Data Retrieval (Frontend)

Endpoint ini digunakan oleh Next.js Dashboard.

### `GET /api/devices`
Mengambil daftar semua perangkat beserta status terakhirnya.

**Response:**
```json
{
  "devices": [
    {
      "sensor_id": "device_001",
      "name": "Meeting Room 1",
      "location": "Floor 1",
      "status": "active",
      "last_seen": "2 mins ago",
      "latest_data": { "aqi": 42, "temp": 24 }
    },
    ...
  ]
}
```

### `GET /api/analytics`
Mengambil agregasi data harian (Avg AQI, Max Temp, dll) untuk grafik dashboard utama.

---

## ⚠️ Error Codes

| Code | Meaning | Description |
| :--- | :--- | :--- |
| **200** | OK | Request berhasil. |
| **400** | Bad Request | Parameter salah atau data korup. |
| **401** | Unauthorized | API Key / Token salah. |
| **404** | Not Found | Resource (Sensor ID) tidak ditemukan. |
| **500** | Server Error | Kesalahan internal server (Cek log Docker). |
| **503** | Service Unavailable | Database sedang down atau Tunnel terputus. |
