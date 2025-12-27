import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { FaDownload, FaMicrochip, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

export default function AdminDashboard() {
  const router = useRouter();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      // Add mock status for demo
      const enriched = data.map(d => ({
         ...d,
         lastSeen: new Date().toISOString(), // Mock, backend usually provides this
         status: Math.random() > 0.2 ? 'online' : 'offline',
         battery: Math.floor(Math.random() * 100)
      }));
      setDevices(enriched);
    } catch {
      // Fallback data
      setDevices([
        { sensor_id: 'S001', name: 'Lobby', status: 'online', battery: 85, lastSeen: new Date().toISOString() },
        { sensor_id: 'S002', name: 'Server Room', status: 'offline', battery: 0, lastSeen: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Sensor ID', 'Name', 'Status', 'Battery', 'Last Seen'];
    const rows = devices.map(d => [d.sensor_id, d.name, d.status, d.battery, d.lastSeen]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "device_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div className="p-10 text-center">Loading Admin...</div>;

  return (
    <Layout title="Admin Dashboard">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
            <p className="text-gray-500 text-sm">Overview of all monitoring stations</p>
          </div>
          <button 
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition"
          >
            <FaDownload /> <span>Export CSV</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-600 mr-4">
              <FaMicrochip size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Devices</h3>
              <p className="text-2xl font-bold">{devices.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
             <div className="bg-green-100 p-4 rounded-xl text-green-600 mr-4">
              <FaCheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Online</h3>
              <p className="text-2xl font-bold">{devices.filter(d => d.status === 'online').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-red-100 p-4 rounded-xl text-red-600 mr-4">
              <FaExclamationTriangle size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Issues</h3>
              <p className="text-2xl font-bold">{devices.filter(d => d.status !== 'online').length}</p>
            </div>
          </div>
        </div>

        {/* Device Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Device Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Battery</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Seen</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.sensor_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold mr-3">
                           {device.sensor_id.substring(0,2)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{device.name}</div>
                          <div className="text-xs text-gray-500">ID: {device.sensor_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {device.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[80px]">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${device.battery}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">{device.battery}%</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(device.lastSeen).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}
