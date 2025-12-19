#include "mqtt_handler.h"
#include "config.h"
#include <WiFi.h>
#include <WiFiClientSecure.h> // Key changel: Use Secure Client
#include <PubSubClient.h>
#include <ArduinoJson.h>

WiFiClientSecure espClient; // Key change: Secure Client
PubSubClient client(espClient);

void initWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to WiFi");
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());

    // For EMQX Cloud SSL (Simplified for now, skipping strict CA check)
    // In production, use setCACert(root_ca)
    espClient.setInsecure(); 
}

void initMQTT() {
    client.setServer(MQTT_SERVER, MQTT_PORT);
    // client.setKeepAlive(60); 
}

bool connectMQTT() {
    // If username/password required, use client.connect(ID, User, Pass)
    // Assuming anonymous or IP-based auth for now based on user input, 
    // BUT usually cloud needs auth. If fails, user must add credentials.
    // We will use existing defined macros if they exist, or just client ID.
    
    #ifdef MQTT_USERNAME
    if (client.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD)) {
    #else
    if (client.connect(MQTT_CLIENT_ID)) {
    #endif
        Serial.println("MQTT connected");
        return true;
    } else {
        Serial.print("MQTT connection failed, rc=");
        Serial.print(client.state());
        Serial.println(" try again in 5 seconds");
        // delay(5000); // Handled by loop in main usually
        return false;
    }
}

void publishSensorData(float temperature, float humidity, float co2_ppm, int aqi) {
    if (!client.connected()) {
        // Main loop should handle reconnection usually, but here is a check
        return; 
    }
    
    DynamicJsonDocument doc(1024);
    doc["sensor_id"] = SENSOR_ID;
    // doc["timestamp"] = millis() / 1000; // Cloud usually adds server timestamp
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["mq135_raw"] = analogRead(MQ135_PIN); // Assuming pin is defined
    doc["co2_ppm"] = co2_ppm;
    doc["aqi_calculated"] = aqi;
    
    String payload;
    serializeJson(doc, payload);
    
    if (client.publish(MQTT_TOPIC, payload.c_str())) {
        Serial.println("Data published successfully");
        Serial.println(payload);
    } else {
        Serial.println("Failed to publish data");
    }
}

void mqttLoop() {
    client.loop();
}