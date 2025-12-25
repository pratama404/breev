# Panduan Deployment Vercel (Front-end Monorepo)

Panduan ini untuk men-deploy folder `web-frontend` yang berada di dalam repository utama (`breev`) ke Vercel.

## Konsep Monorepo
Karena repository `breev` berisi banyak folder (`backend-services`, `firmware`, `web-frontend`), kita harus memberitahu Vercel bahwa aplikasi Next.js hanya berada di folder `web-frontend`.

## Langkah-langkah

1.  **Login ke Vercel**
    *   Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.

2.  **Import Project**
    *   Klik **Add New...** > **Project**.
    *   Pilih repository `breev` (atau `pratama404/breev`).
    *   Klik **Import**.

3.  **Konfigurasi Root Directory (PENTING! ⚠️)**
    *   Di halaman "Configure Project", cari bagian **Framework Preset** (biasanya Next.js terdeteksi otomatis).
    *   Lihat bagian **Root Directory**.
    *   Klik **Edit**.
    *   Pilih folder `web-frontend`.
    *   Klik **Continue**.
    *   *(Ini memberitahu Vercel untuk menjalankan `npm install` dan `npm run build` HANYA di dalam folder tersebut).*

4.  **Environment Variables**
    *   Buka bagian **Environment Variables**.
    *   Tambahkan variabel berikut:
        *   **Name**: `AIRPHYNET_API_URL`
        *   **Value**: `https://api.61262.online` (URL Backend Anda dari Cloudflare Tunnel).
        *   *(Jangan gunakan `localhost:8000` karena Vercel ada di cloud, tidak bisa akses localhost laptop/VM Anda)*.
        *   **Name**: `MONGODB_URI`
        *   **Value**: Connection String MongoDB Atlas Anda.

5.  **Deploy**
    *   Klik tombol **Deploy**.
    *   Vercel akan mulai memproses: Mendownload repo -> Masuk ke folder web-frontend -> Install -> Build.

## Verifikasi
Setelah selesai, Vercel akan memberikan domain (misal: `breev.vercel.app`).
Buka domain tersebut. Jika Dashboard muncul dan data sensor tampil, berarti koneksi Frontend (Vercel) -> Backend (Proxmox via Tunnel) sukses!
