# Manual Instalasi Sistem Monitoring Kualitas Udara

## Daftar Isi
1. [Persiapan Hardware](#persiapan-hardware)
2. [Setup Backend Services](#setup-backend-services)
3. [Konfigurasi Frontend](#konfigurasi-frontend)
4. [Upload Firmware ESP32](#upload-firmware-esp32)
5. [Testing & Verifikasi](#testing--verifikasi)

## Persiapan Hardware

### Komponen yang Dibutuhkan
- ESP32 Development Board
- Sensor MQ135 (Gas Sensor)
- Sensor DHT22 (Temperature & Humidity)
- Breadboard
- Kabel jumper male-to-male dan male-to-female
- Power supply 5V atau kabel USB

### Wiring Diagram
```
ESP32          MQ135
-----          -----
3.3V    -----> VCC
GND     -----> GND
A0      -----> A0

ESP32          DHT22
-----          -----
3.3V    -----> VCC
GND     -----> GND
GPIO4   -----> DATA
```

### Kalibrasi Sensor MQ135
1. Biarkan sensor menyala selama 24 jam untuk stabilisasi
2. Catat nilai resistansi di udara bersih (R0)
3. Update nilai `RO_CLEAN_AIR_FACTOR` di `config.h`

## Setup Backend Services

### 1. Install Docker
```bash
# Windows: Download Docker Desktop
# Linux:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Clone Repository
```bash
git clone <repository-url>
cd aqi-iot-system
```

### 3. Start Backend Services
```bash
cd backend-services
docker-compose up -d
```

### 4. Verifikasi Services
```bash
# Check running containers
docker ps

# Expected services:
# - emqx (MQTT Broker)
# - mongodb (Database)
# - node-red (Data Pipeline)
# - grafana (Analytics)
# - airphynet-service (ML Predictions)
```

### 5. Konfigurasi Node-RED
1. Akses `http://localhost:1880`
2. Import flow dari `node-red-flows/aqi-flow.json`
3. Deploy flow
4. Test MQTT connection

## Konfigurasi Frontend

### 1. Install Dependencies
```bash
cd web-frontend
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.local.example .env.local
# Edit .env.local dengan konfigurasi yang sesuai
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Verifikasi Frontend
- Akses `http://localhost:3001`
- Pastikan dapat terhubung ke database
- Test API endpoints

## Upload Firmware ESP32

### 1. Install PlatformIO
```bash
# Via VS Code Extension
# Atau via CLI:
pip install platformio
```

### 2. Konfigurasi WiFi & MQTT
Edit `firmware/src/config.h`:
```cpp
const char* WIFI_SSID = "NamaWiFiAnda";
const char* WIFI_PASSWORD = "PasswordWiFi";
const char* MQTT_SERVER = "192.168.1.100"; // IP server MQTT
```

### 3. Upload Firmware
```bash
cd firmware
pio run --target upload
```

### 4. Monitor Serial Output
```bash
pio device monitor
```

Expected output:
```
AQI Monitoring System Starting...
Sensors initialized
Connecting to WiFi....
WiFi connected!
IP address: 192.168.1.101
MQTT connected
=== Sensor Readings ===
Temperature: 28.50°C
Humidity: 65.20%
CO2: 420.30 ppm
AQI: 45
Data published successfully
```

## Testing & Verifikasi

### 1. Test MQTT Communication
```bash
# Subscribe to sensor topic
mosquitto_sub -h localhost -t "aqi/sensor/+/telemetry"
```

### 2. Verifikasi Database
```bash
# Connect to MongoDB
docker exec -it mongodb mongo -u admin -p password123
use aqi_monitoring
db.sensor_logs.find().limit(5)
```

### 3. Test Web Dashboard
1. Akses `http://localhost:3001`
2. Pilih ruangan yang tersedia
3. Verifikasi data real-time muncul
4. Test QR code generation di admin panel

### 4. Test Predictions
```bash
# Test AirPhyNet API
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": "ESP32_A101", "hours_ahead": 6}'
```

### 5. Grafana Dashboard
1. Akses `http://localhost:3000`
2. Login: admin/admin123
3. Import dashboard dari `docs/grafana-dashboard.json`
4. Verifikasi data visualization

## Troubleshooting

### ESP32 Issues
```bash
# Reset ESP32
pio run --target erase
pio run --target upload

# Check serial monitor
pio device monitor --baud 115200
```

### MQTT Issues
```bash
# Check EMQX logs
docker logs emqx

# Test MQTT connection
mosquitto_pub -h localhost -t "test/topic" -m "hello"
```

### Database Issues
```bash
# Restart MongoDB
docker restart mongodb

# Check MongoDB logs
docker logs mongodb
```

### Frontend Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Check API endpoints
curl http://localhost:3001/api/devices
```

## Production Deployment

### 1. Environment Setup
- Update environment variables untuk production
- Setup SSL certificates
- Configure firewall rules

### 2. Database Migration
```bash
# Backup development data
mongodump --uri="mongodb://admin:password123@localhost:27017/aqi_monitoring"

# Restore to production
mongorestore --uri="mongodb://prod-user:prod-pass@prod-server:27017/aqi_monitoring"
```

### 3. Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4. Backend Deployment (Docker Swarm/Kubernetes)
```bash
# Docker Swarm
docker stack deploy -c docker-compose.prod.yml aqi-stack

# Kubernetes
kubectl apply -f k8s/
```

## Maintenance

### Regular Tasks
1. Monitor sensor calibration (monthly)
2. Database cleanup (weekly)
3. Log rotation (daily)
4. Backup data (daily)

### Monitoring
- Setup alerts untuk sensor offline
- Monitor disk space dan memory usage
- Track prediction accuracy

---

**Untuk bantuan lebih lanjut, hubungi tim support atau buka issue di repository.**