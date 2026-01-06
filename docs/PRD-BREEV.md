# 📋 Product Requirements Document (PRD) - Breev v2.1

## 1. Introduction
**Breev** adalah ekosistem IoT cerdas yang mengubah cara gedung memantau kesehatan udara. Tidak seperti sensor konvensional yang hanya menampilkan angka, Breev memberikan konteks, prediksi, dan laporan yang dapat ditindaklanjuti.

## 2. Problem Statement
*   **Invisible Threat**: CO2 dan polutan tidak kasat mata namun menurunkan produktivitas hingga 15% (Harvard Study).
*   **Data Silos**: Manajer gedung kesulitan mengumpulkan data dari ratusan ruangan secara manual.
*   **Delayed Action**: Penghuni baru sadar udara buruk ketika sudah merasa pusing atau pengap.

## 3. Goals & Objectives
*   **Instant Visibility**: Memberikan data real-time (<30s latency) kepada penghuni dan pengelola.
*   **Data-Driven Decisions**: Membantu manajemen gedung mengoptimalkan penggunaan ventilasi/AC.
*   **Public Transparency**: Membangun kepercayaan penghuni melalui akses data terbuka (QR Code).
*   **Scalable Intelligence**: Mendukung ekspansi hingga 500+ titik sensor tanpa degradasi performa.

## 4. User Personas
### 👨‍💼 Building Manager (Andi)
*   **Goal**: Memastikan gedung memenuhi standar kesehatan (WELL/Greenship).
*   **Pain Point**: Laporan manual yang memakan waktu.
*   **Need**: Dashboard terpusat dan laporan PDF otomatis "satu-klik".

### 👩‍💻 Office Worker (Sarah)
*   **Goal**: Bekerja di lingkungan yang aman dan nyaman.
*   **Pain Point**: Khawatir tentang penularan penyakit di ruang tertutup.
*   **Need**: Cara cepat cek status ruangan sebelum masuk (via Scan QR).

## 5. Functional Requirements

### 5.1 IoT & Firmware (Edge)
| ID | Requirement | Priority |
| :--- | :--- | :--- |
| **F-01** | Sensor wajib membaca Suhu, Kelembaban, dan Gas (CO2/VOC) setiap 30 detik. | P0 (Critical) |
| **F-02** | Pengiriman data menggunakan HTTPS (`WiFiClientSecure`) ke Cloudflare Tunnel. | P0 (Critical) |
| **F-03** | Firmware harus menyimpan API Key di memori untuk autentikasi backend. | P0 (Critical) |
| **F-04** | Mekanisme Auto-Reconnect jika WiFi terputus. | P1 (High) |
| **F-05** | Indikator LED berkedip saat data berhasil terkirim. | P2 (Medium) |

### 5.2 Backend API (Core)
| ID | Requirement | Priority |
| :--- | :--- | :--- |
| **B-01** | Endpoint `/ingest` memvalidasi Header `x-api-key` sebelum menerima data. | P0 |
| **B-02** | Endpoint `/predict` melayani forecasting 6-jam menggunakan model PyTorch. | P1 |
| **B-03** | Auto-seeding database jika koleksi kosong saat startup. | P2 |

### 5.3 Web Dashboard (Frontend)
| ID | Requirement | Priority |
| :--- | :--- | :--- |
| **FE-01** | Landing Page responsif dengan branding "Breev". | P0 |
| **FE-02** | CRUD Device Management (Add/Edit/Delete sensor). | P0 |
| **FE-03** | Visualisasi Grafik Real-time (Chart.js/Recharts). | P1 |
| **FE-04** | **PDF Report Generation**: Mencetak laporan insight harian/mingguan. | P1 |
| **FE-05** | **Forecasting Widget**: Menampilkan grafik prediksi di halaman publik. | P2 |

### 3. AI & Forecasting Engine
- **Model Architecture**: **AirPhyNet** (Physics-Informed Neural Network).
- **Hybrid Approach**: Combines LSTM (Long Short-Term Memory) for temporal patterns with Advection-Diffusion equations for physical airflow laws.
- **Input Features**: Temperature, Humidity, CO2, AQI History (Last 24h).
- **Output**: 6-Hour Forward Prediction of AQI Trends.
- **Tech Stack**: PyTorch, NumPy.

## 6. Non-Functional Requirements
*   **Performance**: Laman dashboard harus dimuat dalam < 1.5 detik (First Contentful Paint).
*   **Security**: Admin Login diproteksi password environment variable; IoT data diproteksi API Key.
*   **Availability**: Backend harus auto-restart jika crash (Docker Restart Policy: Always).
*   **Compatibility**: Web App harus berjalan mulus di Mobile (iOS/Android) dan Desktop.

## 7. Success Metrics (KPI)
*   **System Uptime**: 99.9% (Downtime < 43 menit/bulan).
*   **Data Accuracy**: Penyimpangan sensor < 5% dibandingkan alat kalibrasi standar.
*   **User Engagement**: Rata-rata 5x scan QR per ruangan per hari.
*   **Response Time**: API Latency < 200ms untuk ingestion data.

## 8. Development Roadmap Strategy
*   **Phase 1 (MVP)**: Monitoring Real-time + Dashboard Admin Dasar. (✅ Selesai)
*   **Phase 2 (Pro)**: Forecasting AI, PDF Reporting, Security Hardening. (✅ Selesai)
*   **Phase 3 (Enterprise)**: Mobile App, Multi-tenant, Notification System (Email/WA). (🚧 Next)

## 9. Assumptions & Constraints
*   **Koneksi Internet**: Lokasi pemasangan sensor memiliki WiFi stabil (2.4GHz).
*   **Power**: Perangkat sensor selalu terhubung ke listrik (bukan baterai).
*   **Cloudflare**: Tunnel `trycloudflare.com` digunakan untuk kemudahan deployment (non-permanent domain).
