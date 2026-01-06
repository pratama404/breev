# 🍃 Breev - Project Summary

## 📖 Ringkasan Eksekutif
**Breev** (sebelumnya AirPhyNet) adalah solusi monitoring kualitas udara *end-to-end* yang dirancang untuk penggunaan di gedung perkantoran, sekolah, dan rumah pintar. Sistem ini menggabungkan perangkat keras IoT yang terjangkau (ESP32) dengan kecerdasan buatan (AI) untuk tidak hanya memantau kondisi saat ini, tetapi juga memprediksi tren masa depan.

## 🎯 Masalah yang Diselesaikan
1.  **Ketidaktahuan Kualitas Udara**: Pengguna tidak sadar ruangan mereka memiliki CO2 tinggi atau ventilasi buruk.
2.  **Data Terisolasi**: Alat monitor tradisional seringkali tidak terhubung ke internet atau sulit diakses datanya.
3.  **Tidak Ada Prediksi**: Alat biasa hanya menunjukkan "Sekarang", tidak memberi peringatan dini.

## 💡 Solusi Kami
Breev menyediakan ekosistem terintegrasi:
*   **Sensor Node**: Perangkat kecil yang mengirim data setiap 30 detik via HTTPS aman.
*   **Cloud Platform**: Backend yang memproses data, menyimpannya di MongoDB, dan menjalankan model ML.
*   **User Apps**: Dashboard untuk Admin (manajemen gedung) dan Tampilan Publik (QR Code) untuk penghuni ruangan.

## 🔑 Fitur Unggulan (v2.0)
*   **Branding Modern**: Antarmuka "Breev" yang bersih dan profesional.
*   **Security First**: Validasi API Key pada setiap level (IoT, API, Frontend).
*   **Hybrid Cloud**: Dapat berjalan di server lokal (Proxmox) atau Cloud (Vercel + Atlas).
*   **AI Forecasting**: Prediksi tren kualitas udara 6 jam ke depan menggunakan PyTorch LSTM.
*   **Automated Reporting**: Laporan PDF otomatis untuk kebutuhan audit.

## 📈 Impact
*   Meningkatkan kesadaran kesehatan penghuni gedung.
*   Efisiensi energi (menyalakan ventilasi hanya saat dibutuhkan).
*   Transparansi data lingkungan.
