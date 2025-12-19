#ifndef SENSORS_DRIVER_H
#define SENSORS_DRIVER_H

void initSensors();
float readMQ135();
float readTemperature();
float readHumidity();
int calculateAQI(float co2_ppm, float temp, float humidity);

#endif