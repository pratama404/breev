import { useState, useEffect } from 'react';
import QRGenerator from '../../components/QRGenerator';

export default function AdminDashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    sensor_id: '',
    name: '',
    location: ''
  });

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
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice),
      });

      if (response.ok) {
        setNewDevice({ sensor_id: '', name: '', location: '' });
        setShowAddDevice(false);
        fetchDevices();
      }
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const handleDeleteDevice = async (sensorId) => {
    if (confirm('Apakah Anda yakin ingin menghapus perangkat ini?')) {
      try {
        const response = await fetch(`/api/devices/${sensorId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchDevices();
          setSelectedDevice(null);
        }
      } catch (error) {
        console.error('Error deleting device:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => setShowAddDevice(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Tambah Perangkat
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Device List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Daftar Perangkat</h2>
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.sensor_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDevice?.sensor_id === device.sensor_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className="text-sm text-gray-600">{device.location}</p>
                      <p className="text-xs text-gray-500">ID: {device.sensor_id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        device.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {device.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDevice(device.sensor_id);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Generator */}
          <div>
            {selectedDevice ? (
              <QRGenerator
                sensorId={selectedDevice.sensor_id}
                roomName={selectedDevice.name}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-gray-400 text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold mb-2">Generator QR Code</h3>
                <p className="text-gray-600">
                  Pilih perangkat dari daftar untuk membuat QR Code
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Device Modal */}
        {showAddDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Tambah Perangkat Baru</h3>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sensor ID
                  </label>
                  <input
                    type="text"
                    value={newDevice.sensor_id}
                    onChange={(e) => setNewDevice({...newDevice, sensor_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Ruangan
                  </label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Tambah
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDevice(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grafana Integration */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Analitik Lanjutan</h2>
          <p className="text-gray-600 mb-4">
            Akses dashboard Grafana untuk analisis mendalam dan visualisasi data historis.
          </p>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Buka Grafana Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}