# 📊 Breev UML Diagrams

Dokumentasi diagram UML untuk memahami alur sistem Breev.
Diagram ini ditulis dalam format **PlantUML**. Anda bisa merender-nya menggunakan plugin VS Code atau [PlantText](https://www.planttext.com/).

## 1. Use Case Diagram
Menggambarkan interaksi aktor dengan sistem.

```mermaid
graph LR
    subgraph AdminSide [Admin/User]
        Admin((Admin))
    end
    subgraph PublicSide [Public Visitor]
        Public((Public))
    end
    subgraph IoTSide [ESP32 Device]
        IoT((Device))
    end

    subgraph System [Breev System]
        UC1(Login Dashboard)
        UC2(View Real-time Data)
        UC3(Generate Reports)
        UC4(Manage Devices)
        UC5(Configure Alerts)
        UC6(Scan QR Code)
        UC7(View Forecast)
        UC8(Ingest Sensor Data)
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5

    Public --> UC6
    Public --> UC7

    IoT --> UC8

    classDef actor fill:#f9f,stroke:#333,stroke-width:2px;
    class Admin,Public,IoT actor;
```

## 2. Sequence Diagram: Data Ingestion
Alur bagaimana data dikirim dari sensor hingga tersimpan.

```mermaid
sequenceDiagram
    participant Dev as ESP32 (Breev.ino)
    participant CF as Cloudflare Tunnel
    participant API as Backend API (FastAPI)
    participant DB as MongoDB

    Dev->>Dev: Read Sensors (DHT22, MQ135)
    Dev->>Dev: Add API Key Header
    Dev->>CF: POST /ingest (JSON)
    CF->>API: Forward Request
    activate API
    API->>API: Validate x-api-key
    alt Invalid Key
        API-->>Dev: 401 Unauthorized
    else Valid Key
        API->>DB: Insert Sensor Log
        activate DB
        DB-->>API: Success (ID)
        deactivate DB
        API-->>Dev: 200 OK
    end
    deactivate API
```

## 3. Sequence Diagram: User View Dashboard
Alur user melihat data di frontend.

```mermaid
sequenceDiagram
    actor User
    participant FE as Next.js Frontend
    participant BE as Backend API
    participant DB as MongoDB

    User->>FE: Open Dashboard
    FE->>BE: GET /api/analytics
    activate BE
    BE->>DB: Aggregate Daily Insight
    activate DB
    DB-->>BE: Data Result
    deactivate DB
    BE-->>FE: JSON Response
    deactivate BE
    FE->>FE: Render Charts
    FE-->>User: Show Dashboard
```

## 4. Class Diagram
Struktur data utama dalam sistem.

```mermaid
classDiagram
    class Device {
        +String sensor_id
        +String name
        +String location
        +String status
        +Date installed_at
    }

    class SensorLog {
        +String sensor_id
        +Float temperature
        +Float humidity
        +Float co2_ppm
        +Int aqi
        +DateTime timestamp
    }

    class User {
        +String username
        +String role
        +login()
    }

    class SystemSettings {
        +String api_key
        +Object aqi_thresholds
        +Boolean notifications_enabled
    }

    Device "1" -- "many" SensorLog : generates
```
