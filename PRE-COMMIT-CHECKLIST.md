# ✅ Pre-Commit & Deployment Checklist

Sebelum melakukan Push ke GitHub atau Deploy ke Production, pastikan hal-hal berikut sudah dicek.

## 🛡️ Security Check
- [ ] **Environment Variables**:
    - [ ] `.env` di backend TIDAK boleh di-commit (cek `.gitignore`).
    - [ ] `ADMIN_PASSWORD` sudah menggunakan password kuat.
    - [ ] `API_SECRET_KEY` sudah diganti (jangan pakai default).
- [ ] **Firmware**:
    - [ ] `WIFI_PASSWORD` di `breev.ino` sudah dihapus/diganti placeholder sebelum commit publik.
    - [ ] `API_KEY` di `breev.ino` sudah dihapus placeholder sebelum commit publik.

## 🏗️ Docker & Infrastructure
- [ ] **Docker Compose**:
    - [ ] Jalankan `docker compose config` untuk validasi syntax.
    - [ ] Pastikan tidak ada hardcoded credentials di `docker-compose.yml`.
- [ ] **Database**:
    - [ ] MongoDB Atlas Network Access (IP Whitelist) sudah dikonfigurasi.
    - [ ] User database memiliki role yang sesuai (readWrite).

## 💻 Frontend (Next.js)
- [ ] **Build Check**:
    - [ ] Jalankan `npm run build` lokal untuk memastikan tidak ada error typing/linting.
- [ ] **Config**:
    - [ ] `next.config.js` tidak mengandung secret keys.
    - [ ] `manifest.json` icons sudah tersedia di folder public.

## 🧪 Testing Flow
- [ ] **Ingestion**:
    - [ ] Kirim dummy request ke `/ingest` via Postman -> Pastikan masuh DB.
- [ ] **Dashboard**:
    - [ ] Login Admin berhasil.
    - [ ] Grafik muncul data.
    - [ ] PDF Report bisa di-download.

---
**Ready?**
```bash
git add .
git commit -m "feat: release v2.0 stable"
git push origin main
```
