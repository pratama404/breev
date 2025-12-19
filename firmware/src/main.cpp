#include <Arduino.h>
#include "config.h"
#include "sensors_driver.h"
#include "mqtt_handler.h"

unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 30000; // 30 seconds

void setup() {
    Serial.begin(115200);
    Serial.println("AQI Monitoring System Starting...");
    
    // Initialize sensors
    initSensors();
    Serial.println("Sensors initialized");
    
    // Initialize WiFi
    initWiFi();
    
    // Initialize MQTT
    initMQTT();
    
    Serial.println("System ready!");
}

void loop() {
    mqttLoop();
    
    unsigned long currentTime = millis();
    
    if (currentTime - lastSensorRead >= SENSOR_INTERVAL) {
        // Read sensor data
        float temperature = readTemperature();
        float humidity = readHumidity();
        float co2_ppm = readMQ135();
        int aqi = calculateAQI(co2_ppm, temperature, humidity);
        
        // Validate readings
        if (!isnan(temperature) && !isnan(humidity)) {
            Serial.println("=== Sensor Readings ===");
            Serial.printf("Temperature: %.2f°C\n", temperature);
            Serial.printf("Humidity: %.2f%%\n", humidity);
            Serial.printf("CO2: %.2f ppm\n", co2_ppm);
            Serial.printf("AQI: %d\n", aqi);
            Serial.println("=====================");
            
            // Publish to MQTT
            publishSensorData(temperature, humidity, co2_ppm, aqi);
        } else {
            Serial.println("Failed to read from DHT sensor!");
        }
        
        lastSensorRead = currentTime;
    }
    
    delay(1000);
}