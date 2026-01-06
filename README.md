# 🍃 Breev - Smart Air Quality Monitoring System

![Version](https://img.shields.io/badge/version-2.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/license-MIT-blue)

**Breev** adalah platform IoT & SaaS lengkap untuk memantau kualitas udara secara real-time dengan **ESP32**, **AI Forecasting**, dan **Web Dashboard** yang intuitif.

🌐 **Live Demo**: [https://breev.vercel.app](https://breev.vercel.app)
📚 **Documentation**: [docs/](./docs/)

## ✨ Fitur Utama

### 📡 Core IoT & Monitoring
- **Real-time AQI** - Pemantauan Indeks Kualitas Udara detik-ke-detik.
- **Multi-Sensor Support** - Integrasi suhu, kelembaban, dan CO2 (MQ135).
- **QR Code Access** - Akses publik cepat ke data ruangan via scan QR.

### 💻 Web Dashboard (Admin)
- **device Management** - Tambah/Hapus device sensor dengan mudah.
- **PDF Reporting** - Generate laporan eksekutif sekali klik.
- **Forecasting Chart** - Prediksi tren kualitas udara 6 jam ke depan via AI.
- **Secure Settings** - Manajemen API Key dan Notifikasi yang aman.

### 🧠 AI & Security (Breev 2.0)
- **Smart Prediction** - Machine Learning (PyTorch) untuk memprediksi polusi.
- **API Key Enforcement** - Proteksi endpoint backend dari akses tidak sah.
- **Role-Based Auth** - Login khusus Admin untuk konfigurasi sistem.

## 🚀 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Recharts, Chart.js, JSPDF
- **Backend**: Python FastAPI, Uvicorn, Pandas, PyTorch
- **Database**: MongoDB Atlas (Cloud)
- **IoT Firmware**: C++ (Connect via HTTPS/Cloudflare Tunnel)
- **Infrastructure**: Docker Compose, Cloudflare Tunnels, Proxmox (Optional)

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (untuk pengembangan Frontend)
- ESP32 Board (untuk Hardware)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/pratama404/breev.git
cd breev
```

#### 2. Setup Backend (Docker)
```bash
cd backend-services
cp .env.example .env
# Edit .env dengan MONGODB_URI Anda
docker compose up -d --build
```

#### 3. Setup Frontend (Local/Vercel)
```bash
cd web-frontend
npm install
npm run dev
```

#### 4. Flash Firmware
Buka `firmware/breev.ino`, isi WiFi dan API Key, lalu upload ke ESP32.

👉 **Panduan Lengkap**: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

## 🏗️ Struktur Project

```
breev/
├── web-frontend/       # Next.js Dashboard App
│   ├── pages/          # Routes & API Handlers
│   ├── components/     # React UI Components
│   └── public/         # Icons & Manifest
├── backend-services/   # Dockerized Services
│   ├── airphynet-model/# FastAPI & ML Engine
│   └── docker-compose.yml
├── firmware/           # ESP32 Source Code
│   ├── breev.ino       # Main Arduino Sketch
│   └── src/            # PlatformIO Source
└── docs/               # Architecture & Guides
```

## 📚 Dokumentasi

### Main Docs
- [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md) - Overview Project
- [ROADMAP.md](./ROADMAP.md) - Rencana Pengembangan
- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) - Panduan Deploy
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Panduan Kontribusi

### Technical Docs
- [docs/PRD-BREEV.md](./docs/PRD-BREEV.md) - Product Requirements (PRD)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Diagram Sistem (C4)
- [docs/API-DOCUMENTATION.md](./docs/API-DOCUMENTATION.md) - Spesifikasi API
- [docs/DATABASE-SCHEMA.md](./docs/DATABASE-SCHEMA.md) - Skema MongoDB
- [docs/UML-DIAGRAMS.md](./docs/UML-DIAGRAMS.md) - UML (Use Case, Sequence)

## 👥 Team

- **IoT Engineer** - Firmware & Hardware Integration
- **Fullstack Developer** - Next.js & FastAPI
- **Product Owner** - Strategy & Branding

## 📞 Contact

- Website: [breev.vercel.app](https://breev.vercel.app/)
- Email: support@breev.id

---

Made with 🍃 for a cleaner future.