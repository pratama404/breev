import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

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
    <Layout title="AirPhyNet - Monitoring">
      <div className="text-center mb-12 pt-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 animate-fade-in">
          Sistem Monitoring Kualitas Udara
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Pantau kualitas udara real-time dengan teknologi IoT dan prediksi berbasis AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="text-blue-600 text-3xl mb-4">🌡️</div>
          <h3 className="text-lg font-semibold mb-2">Monitoring Real-time</h3>
          <p className="text-gray-600">
            Pantau suhu, kelembaban, dan kualitas udara secara real-time
          </p>
        </div>

        <div className="glass-panel p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="text-green-600 text-3xl mb-4">🔮</div>
          <h3 className="text-lg font-semibold mb-2">Prediksi AI</h3>
          <p className="text-gray-600">
            Prediksi kualitas udara masa depan dengan AirPhyNet
          </p>
        </div>

        <div className="glass-panel p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="text-purple-600 text-3xl mb-4">📱</div>
          <h3 className="text-lg font-semibold mb-2">Akses QR Code</h3>
          <p className="text-gray-600">
            Scan QR code untuk akses cepat data ruangan
          </p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Ruangan Tersedia</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <Link
                key={device.sensor_id}
                href={`/room/${device.sensor_id}`}
                className="block p-4 border border-gray-100 bg-white/50 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{device.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${device.status === 'active' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}></div>
                </div>
                <p className="text-gray-500 text-sm mb-4">{device.location}</p>
                <div className="text-blue-600 text-sm font-medium flex items-center">
                   Lihat Detail <span className="ml-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-12 pb-8">
        <p className="text-sm text-gray-400">© 2024 AirPhyNet Project</p>
      </div>
    </Layout>
  );
}