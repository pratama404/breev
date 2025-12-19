// API utility functions
export const fetchSensorData = async (sensorId) => {
  try {
    const response = await fetch(`/api/sensors/${sensorId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sensor data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    throw error;
  }
};

export const fetchPredictions = async (sensorId) => {
  try {
    const response = await fetch(`/api/predictions/${sensorId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch predictions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
};

export const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#00E400'; // Good - Green
  if (aqi <= 100) return '#FFFF00'; // Moderate - Yellow
  if (aqi <= 150) return '#FF7E00'; // Unhealthy for Sensitive Groups - Orange
  if (aqi <= 200) return '#FF0000'; // Unhealthy - Red
  if (aqi <= 300) return '#8F3F97'; // Very Unhealthy - Purple
  return '#7E0023'; // Hazardous - Maroon
};

export const getAQILabel = (aqi) => {
  if (aqi <= 50) return 'Baik';
  if (aqi <= 100) return 'Sedang';
  if (aqi <= 150) return 'Tidak Sehat untuk Kelompok Sensitif';
  if (aqi <= 200) return 'Tidak Sehat';
  if (aqi <= 300) return 'Sangat Tidak Sehat';
  return 'Berbahaya';
};

export const getHealthRecommendation = (aqi) => {
  if (aqi <= 50) return 'Kualitas udara baik. Aktivitas outdoor aman untuk semua.';
  if (aqi <= 100) return 'Kualitas udara sedang. Kelompok sensitif sebaiknya mengurangi aktivitas outdoor.';
  if (aqi <= 150) return 'Tidak sehat untuk kelompok sensitif. Gunakan masker jika beraktivitas outdoor.';
  if (aqi <= 200) return 'Tidak sehat. Batasi aktivitas outdoor dan gunakan air purifier.';
  if (aqi <= 300) return 'Sangat tidak sehat. Hindari aktivitas outdoor dan nyalakan air purifier.';
  return 'Berbahaya! Tetap di dalam ruangan dan gunakan air purifier.';
};