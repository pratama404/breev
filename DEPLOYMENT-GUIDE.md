# 🚀 Breev Deployment Guide

Panduan lengkap instalasi, konfigurasi, dan deployment sistem Breev dari nol hingga production.

## 📋 Prasyarat
*   **Akun GitHub** (untuk Source Code)
*   **Akun Vercel** (untuk Frontend Hosting)
*   **Server/VM** (Ubuntu 20.04+ atau Proxmox) untuk Backend
*   **MongoDB Atlas** (Database Cloud)
*   **Perangkat ESP32** + Sensor

---

## Bagian 1: Persiapan Backend (Server)

Kita akan menggunakan **Docker Compose** untuk menjalankan backend (API, MQTT, Monitoring) di server (atau VM Proxmox).

### 1.1 Persiapan Environment System
1.  Masuk ke terminal server Anda.
2.  Install Git dan Docker:
    ```bash
    sudo apt update && sudo apt install git docker.io docker-compose -y
    ```

### 1.2 Setup Codebase
1.  Clone repository:
    ```bash
    git clone https://github.com/pratama404/breev.git
    cd breev/backend-services
    ```
2.  Setup Environment Variables:
    ```bash
    cp .env.example .env
    nano .env
    ```
    Isi variabel penting:
    *   `MONGODB_URI`: Connection string dari MongoDB Atlas.
    *   `API_SECRET_KEY`: Buat kunci rahasia acak (misal: `breev-secret-2024`).
    *   `ADMIN_PASSWORD`: Password untuk login dashboard nanti.

### 1.3 Jalankan Services
```bash
docker compose up -d --build
```
Verifikasi dengan `docker compose ps`. Pastikan service `ingestion-service`, `grafana`, dan `emqx` berstatus **Up**.

---

## Bagian 2: Persiapan Frontend (Vercel)

Kita menggunakan Vercel untuk hosting dashboard karena cepat dan gratis untuk hobi.

### 2.1 Deploy Code
1.  Push folder `web-frontend` ke GitHub Anda.
2.  Buka [Vercel Dashboard](https://vercel.com/new).
3.  Import repository GitHub Anda.
4.  Pilih Framework Preset: **Next.js**.

### 2.2 Environment Variables (Vercel)
Di halaman konfigurasi Vercel, tambahkan:
*   `MONGODB_URI`: (Sama dengan backend)
*   `AIRPHYNET_API_URL`: URL Tunnel Backend (lihat Bagian 4).
*   `ADMIN_PASSWORD`: (Sama dengan backend).

Klik **Deploy**.

---

## Bagian 3: Persiapan Hardware (ESP32)

### 3.1 Hardware Wiring
*   **DHT22**: Pin 4 (Data), 3.3V (VCC), GND.
*   **MQ135**: Pin 34 (Analog), 5V/3.3V (VCC), GND.

### 3.2 Firmware Flash
1.  Buka `firmware/breev.ino` dengan Arduino IDE.
2.  Install Library via Library Manager:
    *   `DHT sensor library` by Adafruit
    *   `ArduinoJson`
3.  Edit Konfigurasi di bagian atas file:
    ```cpp
    #define WIFI_SSID "NamaWiFiAnda"
    #define WIFI_PASSWORD "PasswordWiFi"
    const char* apiEndpoint = "https://URL-TUNNEL-ANDA.trycloudflare.com/ingest"; 
    #define API_KEY "generate-di-dashboard"
    ```
4.  Hubungkan ESP32 dan klik **Upload**.

---

## Bagian 4: Networking (Cloudflare Tunnel)

Agar Backend di server lokal bisa diakses oleh ESP32 dan Vercel (Public Internet), kita gunakan Cloudflare Tunnel.

1.  Di server backend, install `cloudflared`.
2.  Jalankan tunnel ke port 8000 (API):
    ```bash
    cloudflared tunnel --url http://localhost:8000
    ```
3.  Copy URL yang muncul (misal: `https://cool-breev.trycloudflare.com`).
4.  **PENTING**: Update `AIRPHYNET_API_URL` di Vercel dan `apiEndpoint` di Firmware dengan URL ini.

---

## Bagian 5: Verifikasi & Security

1.  Buka Dashboard: `https://breev-app.vercel.app/admin`.
2.  Login dengan `admin` / `ADMIN_PASSWORD` anda.
3.  Masuk ke menu **Settings**.
4.  Generate **API Key** baru, **Save**.
5.  Copy Key tersebut ke firmware ESP32, upload ulang.
6.  Selesai! Sistem Anda aman dan live. 🛡️
