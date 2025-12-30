/*
 * GABUNGAN KODE ESP32 AIRPHYNET
 * Project: Monitoring Kualitas Udara (AQI) dengan MQTT (EMQX Cloud)
 * Hardware: ESP32, DHT22, MQ-135
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <math.h>

// ==========================================
// 1. KONFIGURASI (CONFIG)
// ==========================================

// --- WiFi Credentials ---
// Ganti "|" dengan nama WiFi dan Password yang benar
#define WIFI_SSID "|" 
#define WIFI_PASSWORD "covidsars"

// --- MQTT Settings (EMQX Cloud) ---
// --- MQTT Settings (EMQX Cloud) ---
#define MQTT_SERVER "f8d02a91.ala.asia-southeast1.emqxsl.com"
#define MQTT_PORT 8883
#define MQTT_TOPIC "aqi/sensor/device_001/telemetry"
#define MQTT_CLIENT_ID "esp32_airphynet_client"

// --- Auth Credentials ---
#define MQTT_USERNAME "breev"
#define MQTT_PASSWORD "Breev123#"

// --- Sensor Settings ---
#define SENSOR_ID "device_001"
#define DELAY_MS 5000 

// --- Pin Definitions ---
#define DHTPIN 4        // Pin D4 untuk DHT
#define DHTTYPE DHT22   // Tipe sensor DHT
#define MQ135_PIN 34    // Pin D34 (Analog) untuk MQ135

// --- Konstanta Kalibrasi MQ135 (Tambahan agar rumus jalan) ---
#define RL_VALUE 10.0            // Nilai resistor beban (biasanya 10k Ohm)
#define RO_CLEAN_AIR_FACTOR 9.83 // Konstanta udara bersih

// ==========================================
// 2. GLOBAL OBJECTS & VARIABLES
// ==========================================

WiFiClientSecure espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 30000; // Kirim data setiap 30 detik

// ==========================================
// 3. FUNGSI SENSOR (SENSOR DRIVER)
// ==========================================

void initSensors() {
    dht.begin();
    // Pin 34 di ESP32 otomatis INPUT, tapi di-set lagi tidak masalah
    pinMode(MQ135_PIN, INPUT);
}

float readTemperature() {
    return dht.readTemperature();
}

float readHumidity() {
    return dht.readHumidity();
}

float readMQ135() {
    int sensorValue = analogRead(MQ135_PIN);
    
    // Konversi nilai analog (0-4095) ke voltase (0-3.3V)
    float voltage = sensorValue * (3.3 / 4095.0); 
    
    // Cek agar tidak membagi dengan 0
    if(voltage == 0) return 0; 

    // Hitung resistansi sensor (Rs)
    float Rs = ((3.3 * RL_VALUE) / voltage) - RL_VALUE;
    
    // Hitung rasio
    float ratio = Rs / (RL_VALUE * RO_CLEAN_AIR_FACTOR);
    
    // Rumus pendekatan kurva untuk CO2 (Sederhana)
    float ppm = 116.6020682 * pow(ratio, -2.769034857);
    
    return ppm;
}

int calculateAQI(float co2_ppm, float temp, float humidity) {
    // Logika sederhana penentuan AQI berdasarkan PPM CO2
    if (co2_ppm <= 400) return 25;       // Baik
    else if (co2_ppm <= 600) return 50;  // Sedang
    else if (co2_ppm <= 1000) return 100;// Tidak Sehat bagi Sensitif
    else if (co2_ppm <= 1500) return 150;// Tidak Sehat
    else return 200;                     // Berbahaya
}

// ==========================================
// 4. FUNGSI KONEKSI (WIFI & MQTT)
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

    Serial.println("");
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // PENTING: Bypass sertifikat SSL (untuk testing EMQX Cloud)
    // Agar tidak perlu upload file sertifikat CA root
    espClient.setInsecure();
}

void reconnectMQTT() {
    // Loop sampai terkoneksi
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        
        // Coba connect dengan Username & Password
        if (client.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD)) {
            Serial.println("connected");
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void publishSensorData(float temperature, float humidity, float co2_ppm, int aqi) {
    // Buat JSON Object
    DynamicJsonDocument doc(512); // Buffer size cukup 512
    doc["sensor_id"] = SENSOR_ID;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["mq135_raw"] = analogRead(MQ135_PIN);
    doc["co2_ppm"] = co2_ppm;
    doc["aqi_calculated"] = aqi;

    String payload;
    serializeJson(doc, payload);

    // Publish ke Topic
    if (client.publish(MQTT_TOPIC, payload.c_str())) {
        Serial.println("Data published to MQTT:");
        Serial.println(payload);
    } else {
        Serial.println("Failed to publish data");
    }
}

// ==========================================
// 5. MAIN SETUP & LOOP
// ==========================================

void setup() {
    Serial.begin(115200);
    Serial.println("AQI Monitoring System Starting...");

    // 1. Init Sensor
    initSensors();
    Serial.println("Sensors initialized");

    // 2. Init WiFi
    initWiFi();

    // 3. Init MQTT Server
    client.setServer(MQTT_SERVER, MQTT_PORT);
    // client.setCallback(callback); // Jika perlu menerima pesan (subscribe)
}

void loop() {
    // 1. Cek Koneksi MQTT
    if (!client.connected()) {
        reconnectMQTT();
    }
    client.loop();

    // 2. Timer Non-Blocking untuk baca sensor
    unsigned long currentTime = millis();
    if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
        
        // Baca data sensor
        float temperature = readTemperature();
        float humidity = readHumidity();
        float co2_ppm = readMQ135();
        int aqi = calculateAQI(co2_ppm, temperature, humidity);

        // Validasi pembacaan DHT (kadang suka NaN/Error)
        if (!isnan(temperature) && !isnan(humidity)) {
            Serial.println("\n=== Sensor Readings ===");
            Serial.printf("Temperature: %.2f °C\n", temperature);
            Serial.printf("Humidity: %.2f %%\n", humidity);
            Serial.printf("CO2: %.2f ppm\n", co2_ppm);
            Serial.printf("AQI Status: %d\n", aqi);
            Serial.println("=====================");

            // Kirim ke Cloud
            publishSensorData(temperature, humidity, co2_ppm, aqi);
        } else {
            Serial.println("Failed to read from DHT sensor! Check wiring.");
        }

        lastSensorRead = currentTime;
    }
}