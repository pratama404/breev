# Panduan Deployment di Proxmox (Ubuntu VM)

Panduan ini khusus untuk melakukan deployment sistem Monitoring Kualitas Udara ke dalam Virtual Machine (VM) Ubuntu yang baru dibuat di Proxmox.

## 1. Persiapan VM (Ubuntu Server)
Pastikan Anda sudah masuk ke terminal VM Ubuntu Anda.

### Update & Install Dependensi Dasar
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl apt-transport-https ca-certificates software-properties-common gnupg lsb-release
```

### Install Docker & Docker Compose
```bash
# Tambahkan GPG key Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Tambahkan repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Masukkan user ke grup docker (agar tidak perlu sudo setiap saat)
sudo usermod -aG docker $USER
newgrp docker
```

## 2. Setup Project

### Clone Repository
```bash
git clone https://github.com/pratama404/breev.git
cd breev
```

### Konfigurasi Environment Variables
Kita perlu mengatur file `.env` agar terhubung ke layanan cloud (MongoDB Atlas, EMQX, DagsHub).

1.  Masuk ke folder backend:
    ```bash
    cd backend-services
    ```

2.  Buat file `.env` dari contoh:
    ```bash
    cp ../.env.example .env
    ```

3.  Edit file `.env` dan isi dengan kredensial asli:
    ```bash
    nano .env
    ```
    Isi nilai berikut (sesuaikan dengan akun Anda):
    - `MONGODB_URI`: Connection string MongoDB Atlas.
    - `MQTT_BROKER`: `broker.emqx.io` (atau private broker Anda).
    - `MQTT_USERNAME` / `MQTT_PASSWORD`: Kredensial EMQX.
    - `MLFLOW_TRACKING_URI`, dll: Kredensial DagsHub.

## 3. Menjalankan Aplikasi

Jalankan semua layanan (Backend, Ingestor, Monitoring) menggunakan Docker Compose:

```bash
docker compose up -d --build
```

### Verifikasi status:
```bash
docker compose ps
```
Pastikan `inference-service`, `ingestion-service`, `grafana`, dan `prometheus` statusnya **Up**.

## 4. Akses Layanan

Jika IP VM Proxmox Anda misalnya `192.168.1.50`, maka akses:

- **API Backend**: `http://192.168.1.50:8000/docs`
- **Grafana (Monitoring)**: `http://192.168.1.50:3000` (Login: `admin` / `admin`)
- **Prometheus**: `http://192.168.1.50:9090`

## 5. (Opsional) Setup Frontend

Jika Anda ingin menjalankan Frontend Next.js juga di VM ini:

1.  **Install Node.js (v18+)**:
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    ```

2.  **Setup Frontend**:
    ```bash
    cd ../web-frontend
    cp .env.local.example .env.local
    nano .env.local
    # Ubah AIRPHYNET_API_URL ke http://localhost:8000
    ```

3.  **Build & Run**:
    ```bash
    npm install
    npm run build
    npm start
    ```
    Akses di `http://192.168.1.50:3000` (Pastikan port tidak bentrok dengan Grafana yg juga 3000. Jika bentrok, ubah port Grafana di docker-compose.yml ke 3001).

---
**Catatan Penting Security**:
Untuk produksi, disarankan menggunakan **Nginx Reverse Proxy** dan **HTTPS (Certbot)** agar port internal (8000, 9090) tidak terekspos langsung ke publik.
