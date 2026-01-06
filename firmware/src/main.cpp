/*
 * BREEV FIRMWARE (PlatformIO Edition)
 * Project: Breev Air Quality Monitor
 * Hardware: ESP32, DHT22, MQ-135
 * Method: HTTP POST -> Cloudflare Tunnel -> FastAPI
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <math.h>

// ==========================================
// 1. KONFIGURASI (CONFIG)
// ==========================================

// --- WiFi Credentials ---
#define WIFI_SSID "YOUR_WIFI_SSID" 
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// --- API Settings ---
// GANTI DENGAN URL TUNNEL ANDA! (Contoh: https://your-tunnel.trycloudflare.com/ingest)
// NOTE: Use 'https' and port 443 (default) for Cloudflare Tunnels
const char* apiEndpoint = "https://YOUR_TUNNEL_URL.trycloudflare.com/ingest"; 
#define API_KEY "YOUR_GENERATED_API_KEY_FROM_DASHBOARD" 

// --- Sensor Settings ---
#define SENSOR_ID "device_001"
#define SENSOR_INTERVAL 30000 // Kirim data setiap 30 detik

// --- Pin Definitions ---
#define DHTPIN 4        // Pin D4 untuk DHT
#define DHTTYPE DHT22   // Tipe sensor DHT
#define MQ135_PIN 34    // Pin D34 (Analog) untuk MQ135

// --- Konstanta Kalibrasi MQ135 ---
#define RL_VALUE 10.0            
#define RO_CLEAN_AIR_FACTOR 9.83 

// ==========================================
// 2. GLOBAL OBJECTS
// ==========================================

DHT dht(DHTPIN, DHTTYPE);
unsigned long lastSensorRead = 0;

// ==========================================
// 3. FUNGSI SENSOR
// ==========================================

void initSensors() {
    dht.begin();
    pinMode(MQ135_PIN, INPUT);
}

float readTemperature() { return dht.readTemperature(); }
float readHumidity() { return dht.readHumidity(); }

float readMQ135() {
    int sensorValue = analogRead(MQ135_PIN);
    float voltage = sensorValue * (3.3 / 4095.0); 
    if(voltage == 0) return 0; 
    float Rs = ((3.3 * RL_VALUE) / voltage) - RL_VALUE;
    float ratio = Rs / (RL_VALUE * RO_CLEAN_AIR_FACTOR);
    float ppm = 116.6020682 * pow(ratio, -2.769034857);
    return ppm;
}

int calculateAQI(float co2_ppm, float temp, float humidity) {
    if (co2_ppm <= 400) return 25;       
    else if (co2_ppm <= 600) return 50;  
    else if (co2_ppm <= 1000) return 100;
    else if (co2_ppm <= 1500) return 150;
    else return 200;                     
}

// ==========================================
// 4. FUNGSI KONEKSI & KIRIM DATA
// ==========================================

void initWiFi() {
    delay(10);
    Serial.println();
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
}

void sendSensorDataHTTP(float temperature, float humidity, float co2_ppm, int aqi) {
    if(WiFi.status() == WL_CONNECTED){
        HTTPClient http;
        
        Serial.print("Sending data to: ");
        Serial.println(apiEndpoint);

        // Mulai koneksi (HTTPS secara otomatis ditangani ESP32 jika link https://)
        // Kita gunakan setInsecure untuk bypass validasi sertifikat SSL (opsional tapi aman buat tunnel)
        WiFiClientSecure *client = new WiFiClientSecure;
        client->setInsecure(); // Ignore SSL certificate errors
        
        if (http.begin(*client, apiEndpoint)) {  
            http.addHeader("Content-Type", "application/json");
            http.addHeader("x-api-key", API_KEY);

            // Buat JSON
            DynamicJsonDocument doc(512);
            doc["sensor_id"] = SENSOR_ID;
            doc["temperature"] = temperature;
            doc["humidity"] = humidity;
            doc["co2_ppm"] = co2_ppm;
            doc["aqi"] = aqi; 
            doc["rssi"] = WiFi.RSSI();  // Add WiFi Signal Strength
            doc["uptime_seconds"] = millis() / 1000; // Add Device Uptime

            String payload;
            serializeJson(doc, payload);

            // POST Request
            int httpResponseCode = http.POST(payload);

            if (httpResponseCode > 0) {
                String response = http.getString();
                Serial.println("HTTP Response code: " + String(httpResponseCode));
                Serial.println("Server Response: " + response);
            } else {
                Serial.print("Error code: ");
                Serial.println(httpResponseCode);
            }
            http.end();
        } else {
            Serial.println("Unable to connect to server");
        }
        delete client;
    } else {
        Serial.println("WiFi Disconnected");
    }
}

// ==========================================
// 5. MAIN SETUP & LOOP
// ==========================================

void setup() {
    Serial.begin(115200);
    Serial.println("Breev Monitor System Starting... (PlatformIO)");
    initSensors();
    initWiFi();
}

void loop() {
    // Reconnect WiFi if needed
    if(WiFi.status() != WL_CONNECTED) {
        initWiFi();
    }

    unsigned long currentTime = millis();
    if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
        
        float temperature = readTemperature();
        float humidity = readHumidity();
        float co2_ppm = readMQ135();
        int aqi = calculateAQI(co2_ppm, temperature, humidity);

        if (!isnan(temperature) && !isnan(humidity)) {
            Serial.println("\n=== Sensor Readings ===");
            Serial.printf("Temp: %.2f C, Hum: %.2f %%, CO2: %.2f ppm, AQI: %d\n", temperature, humidity, co2_ppm, aqi);
            
            // Kirim via HTTP
            sendSensorDataHTTP(temperature, humidity, co2_ppm, aqi);
            
        } else {
            Serial.println("Failed to read sensor!");
        }

        lastSensorRead = currentTime;
    }
}