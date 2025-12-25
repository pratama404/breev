import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import GaugeChart from '../../components/GaugeChart';
import TrendGraph from '../../components/TrendGraph';
import { getHealthRecommendation } from '../../lib/api';

export default function RoomMonitoring() {
  const router = useRouter();
  const { id } = router.query;

  const [sensorData, setSensorData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchData();
      const interval = setInterval(fetchData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch current sensor data
      const sensorResponse = await fetch(`/api/sensors/${id}`);
      if (!sensorResponse.ok) throw new Error('Failed to fetch sensor data');
      const sensorResult = await sensorResponse.json();

      setSensorData(sensorResult.current);
      setHistoricalData(sensorResult.historical);

      // Fetch predictions
      try {
        const predResponse = await fetch(`/api/predictions/${id}`);
        if (predResponse.ok) {
          const predResult = await predResponse.json();
          setPredictions(predResult.predictions || []);
        }
      } catch (predError) {
        console.log('Predictions not available:', predError);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data sensor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (!sensorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Tidak Tersedia</h1>
          <p className="text-gray-600">Sensor belum mengirim data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Monitoring Kualitas Udara
          </h1>
          <p className="text-gray-600">Sensor ID: {id}</p>
          <p className="text-sm text-gray-500">
            Terakhir diperbarui: {new Date(sensorData.timestamp).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Current Status */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <GaugeChart aqi={sensorData.aqi_calculated} size={150} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Parameter Lingkungan</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Suhu:</span>
                <span className="font-semibold">{sensorData.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kelembaban:</span>
                <span className="font-semibold">{sensorData.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CO₂:</span>
                <span className="font-semibold">{Math.round(sensorData.co2_ppm)} ppm</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Rekomendasi Kesehatan</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                {getHealthRecommendation(sensorData.aqi_calculated)}
              </p>
            </div>
          </div>
        </div>

        {/* Trend Graph */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">Tren AQI (24 Jam Terakhir & Prediksi)</h3>
          <TrendGraph data={historicalData} predictions={predictions} />
        </div>

        {/* Predictions Table */}
        {predictions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4">Prediksi AQI</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Waktu</th>
                    <th className="px-4 py-2 text-left">Prediksi CO2 (ppm)</th>
                    <th className="px-4 py-2 text-left">Confidence</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">
                        {new Date(pred.predicted_time).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {Math.round(pred.predicted_co2)} ppm
                      </td>
                      <td className="px-4 py-2">
                        {Math.round(pred.confidence * 100)}%
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${pred.predicted_co2 <= 800 ? 'bg-green-100 text-green-800' :
                          pred.predicted_co2 <= 1000 ? 'bg-yellow-100 text-yellow-800' :
                            pred.predicted_co2 <= 1500 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {pred.predicted_co2 <= 800 ? 'Normal' :
                            pred.predicted_co2 <= 1000 ? 'Sedang' :
                              pred.predicted_co2 <= 1500 ? 'Kurang Sehat' :
                                'Bahaya'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}