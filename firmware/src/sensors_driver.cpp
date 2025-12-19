#include "sensors_driver.h"
#include "config.h"
#include <DHT.h>
#include <math.h>

DHT dht(DHT22_PIN, DHT_TYPE);

void initSensors() {
    dht.begin();
    pinMode(MQ135_PIN, INPUT);
}

float readMQ135() {
    int sensorValue = analogRead(MQ135_PIN);
    float voltage = sensorValue * (3.3 / 4095.0); // ESP32 ADC is 12-bit
    float Rs = ((3.3 * RL_VALUE) / voltage) - RL_VALUE;
    float ratio = Rs / (RL_VALUE * RO_CLEAN_AIR_FACTOR);
    
    // Convert to CO2 PPM using approximation curve
    float ppm = 116.6020682 * pow(ratio, -2.769034857);
    return ppm;
}

float readTemperature() {
    return dht.readTemperature();
}

float readHumidity() {
    return dht.readHumidity();
}

int calculateAQI(float co2_ppm, float temp, float humidity) {
    // Simplified AQI calculation based on CO2 levels
    if (co2_ppm <= 400) return 25;
    else if (co2_ppm <= 600) return 50;
    else if (co2_ppm <= 1000) return 100;
    else if (co2_ppm <= 1500) return 150;
    else return 200;
}