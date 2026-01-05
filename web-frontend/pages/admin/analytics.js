import React, { useState } from 'react';
import AdminLayout from '../../components/atmo/AdminLayout';
import AirQualityChart from '../../components/atmo/AirQualityChart';
import SensorChart from '../../components/atmo/SensorChart';
import MetricCard from '../../components/atmo/MetricCard';
import { Wind, Thermometer, Droplets, Activity, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
    const [data, setData] = useState({
        summary: { avg_aqi: 0, max_aqi: 0, min_aqi: 0, active_devices: 0 },
        aqi_trend: [],
        sensor_data: []
    });
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState('7d');
    const [selectedDevice, setSelectedDevice] = useState('all');

    React.useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const query = selectedDevice !== 'all' ? `?sensor_id=${selectedDevice}` : '';
                const res = await fetch(`/api/analytics${query}`);

                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedDevice, dateRange]);

    const { summary, aqi_trend, sensor_data } = data;

    return (
        <AdminLayout title="Analytics & Trends">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Trends</h1>
                    <p className="text-gray-500 text-sm mt-1">Deep dive into historical air quality data.</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={selectedDevice}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none cursor-pointer shadow-sm"
                        >
                            <option value="all">All Devices</option>
                            <option value="DEV-001">Lab Komputasi 1</option>
                            <option value="DEV-002">Lab Jaringan</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    <div className="relative">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition shadow-sm text-gray-700">
                            <Calendar size={16} />
                            <span>Last 7 Days</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    label="Avg AQI"
                    value={summary?.avg_aqi || 0}
                    unit="Score"
                    icon={Wind}
                    status={summary?.avg_aqi < 100 ? "good" : "warning"}
                />
                <MetricCard
                    label="Max AQI"
                    value={summary?.max_aqi || 0}
                    unit="Peak"
                    icon={Activity}
                    status="warning"
                />
                <MetricCard
                    label="Min AQI"
                    value={summary?.min_aqi || 0}
                    unit="Low"
                    icon={Wind}
                    status="good"
                />
                <MetricCard
                    label="Active Sensors"
                    value={summary?.active_devices || 0}
                    unit="Online"
                    icon={Activity}
                    status="neutral"
                />
            </div>

            {/* 2. Main AQI Charts */}
            <div className="mb-8">
                <AirQualityChart data={aqi_trend || []} />
            </div>

            {/* 3. Detailed Sensor Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SensorChart
                    title="Gas Concentration"
                    data={sensor_data || []}
                    dataKey="gas_ppm"
                    unit="ppm"
                    color="#f59e0b" // Amber
                    type="area"
                />
                <div className="space-y-6">
                    <SensorChart
                        title="Temperature Trend"
                        data={sensor_data || []}
                        dataKey="temperature"
                        unit="°C"
                        color="#ef4444" // Red
                        type="bar" // Try mixing types
                    />
                    {/* Can add Humidity here in a carousel or separate little card if needed,
                for now let's just show Temp to match the grid layout efficiently or add Humidity below */}
                    <SensorChart
                        title="Humidity Trend"
                        data={sensor_data || []}
                        dataKey="humidity"
                        unit="%"
                        color="#06b6d4" // Cyan
                        type="area"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
