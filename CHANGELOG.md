# 📝 Changelog

Semua perubahan pada project **Breev**.

## [2.0.0] - 2024-01-01
### ✨ Major Updates
- **Rebranding**: Ganti nama total dari "AirPhyNet" menjadi "**Breev**".
- **Hybrid Architecture**: Dukungan resmi untuk deployment Backend Local + Frontend Vercel via Cloudflare Tunnel.
- **Security V2**: Implementasi `x-api-key` validation strict pada backend dan frontend proxy.

### 🚀 New Features
- **Public QR Page**:
    - Dynamic AQI Color (Green/Yellow/Red).
    - Status "Mask Required" otomatis.
    - Grafik Forecasting 6-jam.
- **Admin Dashboard**:
    - PDF Generation ("Download Report").
    - Daily Insight (Persentase perubahan vs kemarin).
    - Persistent Settings (Simpan Config ke MongoDB).

### 🐛 Bug Fixes
- Fix `NextAuth` build warnings (Removed dependency).
- Fix `plantuml.jar` missing error (Migrated to Mermaid.js).
- Fix `inference_api.py` security bypass.
- Fix `setup_atlas.py` creating dead admin users.

### 📚 Documentation
- Added `DEPLOYMENT-GUIDE.md`.
- Added `docs/PRD-BREEV.md`.
- Added `docs/API-DOCUMENTATION.md`.
- Updated all Architecture Diagrams to standard UML/Mermaid.
