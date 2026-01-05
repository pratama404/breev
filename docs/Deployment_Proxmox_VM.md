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

## 5. Deployment Hybrid (Backend Proxmox + Frontend Vercel)

Skema ini memisahkan Frontend (di Cloud Vercel) dan Backend (di Home Server Proxmox), dihubungkan oleh MongoDB Atlas.

### A. Konfigurasi Backend (Proxmox)
1. Pastikan `docker-compose.yml` berjalan.
2. Pastikan `.env` menggunakan `MONGODB_URI` ke **MongoDB Atlas**.
   `mongodb+srv://user:pass@cluster.mongodb.net/aqi_monitoring`
3. (Opsional) Jalankan **Cloudflare Tunnel** agar Grafana bisa diakses publik.
    ```bash
    cloudflared tunnel --url http://localhost:3000
    ```
    *Simpan URL yang diberikan (misal: `https://monitor-air.trycloudflare.com`).*

### B. Konfigurasi Frontend (Vercel)
Saat deploy project `web-frontend` ke Vercel, masuk ke **Settings > Environment Variables** dan tambahkan:

1. `MONGODB_URI`: Sama persis dengan data di Backend (ke Atlas).
2. `NEXT_PUBLIC_GRAFANA_URL`: Masukkan URL Cloudflare Tunnel dari langkah A (misal: `https://monitor-air.trycloudflare.com`).
3. `NEXTAUTH_URL`: URL domain Vercel Anda (misal `https://breev-admin.vercel.app`).
4. `NEXTAUTH_SECRET`: Generate random string (bisa pakai command `openssl rand -base64 32`).

### C. Alur Data
*   **Sensor** -> MQTT -> **Backend (Proxmox)** -> **MongoDB Atlas**
*   **User** -> **Frontend (Vercel)** -> **MongoDB Atlas**

---
**Catatan Penting Security**:
Untuk produksi, disarankan menggunakan **Nginx Reverse Proxy** dan **HTTPS (Certbot)** agar port internal (8000, 9090) tidak terekspos langsung ke publik.
