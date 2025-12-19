#ifndef MQTT_HANDLER_H
#define MQTT_HANDLER_H

void initWiFi();
void initMQTT();
bool connectMQTT();
void publishSensorData(float temperature, float humidity, float co2_ppm, int aqi);
void mqttLoop();

#endif