# 🏗️ Breev System Architecture

## Overview
Breev menggunakan arsitektur **Hybrid Cloud-Edge**.
*   **Edge**: Perangkat ESP32 melakukan pembacaan sensor dasar.
*   **Local Server (Backend)**: Menjalankan logika bisnis berat, AI Forecasting, dan Data Ingestion.
*   **Cloud (Frontend)**: Hosting UI di Vercel untuk akses cepat global.
*   **Tunnel**: Menghubungkan Backend Lokal ke Internet Publik secara aman.

## Diagram Arsitektur (C4 Level 1)

```mermaid
graph TD
    User[Admin / Public User]
    IoT[ESP32 Device]
    
    subgraph CloudVercel [Vercel Cloud]
        Frontend[Next.js Dashboard]
    end
    
    subgraph LocalServer [Proxmox / On-Premise]
        Tunnel[Cloudflare Cloudflared]
        API[FastAPI Backend]
        AI[PyTorch Model]
        MQTT[EMQX Broker (Optional)]
    end
    
    subgraph DatabaseCloud [MongoDB Atlas]
        DB[(MongoDB)]
    end

    User -->|HTTPS| Frontend
    IoT -->|HTTPS POST| Tunnel
    Tunnel -->|Forward| API
    Frontend -->|Fetch Data| API
    Frontend -->|Read/Write| DB
    API -->|Read/Write| DB
    API -->|Inference| AI
```

## Stack Details
1.  **Frontend**: 
    *   Dibangun dengan **Next.js 14**.
    *   Menggunakan **Tailwind CSS** untuk styling.
    *   **React-Chartjs-2** untuk visualisasi data.

2.  **Backend**:
    *   **FastAPI (Python)**: High-performance async framework.
    *   **Uvicorn**: ASGI Server.
    *   **Pandas/PyTorch**: Pengolahan data dan Forecasting.

3.  **Connectivity**:
    *   **Cloudflare Tunnel**: Mengekspos port local (8000) ke public internet tanpa membuka port router (Port Forwarding tidak diperlukan).

4.  **Security**:
    *   Setiap request dari IoT wajib menyertakan `x-api-key`.
    *   Frontend Admin dilindungi oleh password environment variable.
