import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistem Monitoring Kualitas Udara
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pantau kualitas udara real-time dengan teknologi IoT dan prediksi berbasis AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🌡️</div>
            <h3 className="text-lg font-semibold mb-2">Monitoring Real-time</h3>
            <p className="text-gray-600">
              Pantau suhu, kelembaban, dan kualitas udara secara real-time
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-3xl mb-4">🔮</div>
            <h3 className="text-lg font-semibold mb-2">Prediksi AI</h3>
            <p className="text-gray-600">
              Prediksi kualitas udara masa depan dengan AirPhyNet
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Akses QR Code</h3>
            <p className="text-gray-600">
              Scan QR code untuk akses cepat data ruangan
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Ruangan Tersedia</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <Link
                  key={device.sensor_id}
                  href={`/room/${device.sensor_id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-lg mb-2">{device.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{device.location}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      device.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {device.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                    <span className="text-blue-600 text-sm">Lihat Detail →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/admin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}