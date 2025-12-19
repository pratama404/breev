# Sistem Monitoring Kualitas Udara Berbasis IoT

Sistem monitoring dan prediksi indeks kualitas udara (AQI) berbasis IoT dengan teknologi AirPhyNet untuk prediksi berbasis fisika.

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   ESP32 + MQ135 │───▶│ MQTT Broker  │───▶│   Node-RED      │
│   DHT22 Sensors │    │   (EMQX)     │    │  Data Pipeline  │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                     │
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  Next.js Web    │◀───│   MongoDB    │◀───│  AirPhyNet ML   │
│   Dashboard     │    │   Database   │    │   Predictions   │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## 🚀 Fitur Utama

- **Monitoring Real-time**: Suhu, kelembaban, dan kualitas udara
- **Prediksi AI**: Model AirPhyNet berbasis physics-informed neural network
- **QR Code Access**: Akses cepat data ruangan via QR code
- **Admin Dashboard**: Manajemen perangkat dan analitik
- **Grafana Integration**: Visualisasi data lanjutan

## 📋 Persyaratan Sistem

### Hardware
- ESP32 Development Board
- Sensor MQ135 (Gas/Air Quality)
- Sensor DHT22 (Temperature & Humidity)
- Breadboard dan kabel jumper
- Power supply 5V

### Software
- Docker & Docker Compose
- Node.js 18+ (untuk development)
- Python 3.9+ (untuk ML service)

## 🛠️ Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd aqi-iot-system
```

### 2. Setup Backend Services
```bash
cd backend-services
docker-compose up -d
```

Services yang akan berjalan:
- EMQX MQTT Broker: `http://localhost:18083` (admin/public)
- MongoDB: `localhost:27017`
- Node-RED: `http://localhost:1880`
- Grafana: `http://localhost:3000` (admin/admin123)
- AirPhyNet API: `http://localhost:8000`

### 3. Setup Frontend
```bash
cd web-frontend
npm install
npm run dev
```

Web dashboard: `http://localhost:3001`

### 4. Upload Firmware ke ESP32
```bash
cd firmware
# Edit config.h dengan kredensial WiFi dan MQTT
pio run --target upload
```

## 📊 Konfigurasi

### WiFi & MQTT (firmware/src/config.h)
```cpp
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_SERVER = "your-mqtt-broker.com";
```

### Environment Variables (.env.local)
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/aqi_monitoring?authSource=admin
AIRPHYNET_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
```

## 🔧 Penggunaan

### 1. Monitoring Real-time
- Akses web dashboard di `http://localhost:3001`
- Pilih ruangan untuk melihat data real-time
- Lihat grafik tren dan prediksi AQI

### 2. QR Code Access
- Login sebagai admin
- Pilih perangkat dan generate QR code
- Print dan tempel QR code di ruangan
- Scan QR code untuk akses cepat

### 3. Admin Dashboard
- Tambah/hapus perangkat sensor
- Generate QR code untuk ruangan
- Akses Grafana untuk analitik lanjutan

## 🧠 Model AirPhyNet

Model prediksi menggunakan Physics-Informed Neural Network yang menggabungkan:
- LSTM untuk pola temporal
- Persamaan adveksi-difusi untuk constraint fisika
- Prediksi AQI hingga 6 jam ke depan

### API Endpoints
```
POST /predict - Generate predictions
GET /predictions/{sensor_id} - Get latest predictions
GET /health - Health check
```

## 📈 Monitoring & Analytics

### Grafana Dashboards
- Real-time sensor metrics
- Historical trends
- Anomaly detection
- Multi-room heatmaps

### MongoDB Collections
- `sensor_logs`: Raw sensor data
- `devices`: Device metadata
- `predictions`: ML predictions
- `users`: Admin users

## 🔒 Keamanan

- HTTPS untuk web traffic
- MQTT dengan QoS Level 1
- Admin authentication
- Input validation & sanitization

## 🐛 Troubleshooting

### ESP32 tidak terhubung WiFi
1. Periksa kredensial WiFi di `config.h`
2. Pastikan sinyal WiFi kuat (RSSI > -80 dBm)
3. Restart ESP32

### Data tidak muncul di dashboard
1. Periksa koneksi MQTT broker
2. Cek log Node-RED di `http://localhost:1880`
3. Verifikasi MongoDB connection

### Prediksi tidak tersedia
1. Pastikan AirPhyNet service running
2. Cek minimal 10 data points tersedia
3. Restart ML service jika perlu

## 📝 API Documentation

### Sensor Data API
```
GET /api/sensors/{id} - Get sensor data
GET /api/devices - List all devices
POST /api/devices - Add new device
DELETE /api/devices/{id} - Remove device
```

### Predictions API
```
GET /api/predictions/{id} - Get predictions
POST /api/predictions/{id} - Trigger new prediction
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

Untuk bantuan teknis, silakan buka issue di repository ini atau hubungi tim pengembang.

---

**Dikembangkan dengan ❤️ untuk monitoring kualitas udara yang lebih baik**