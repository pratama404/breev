
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/atmo/AdminLayout';
import MetricCard from '../../components/atmo/MetricCard';
import DeviceList from '../../components/atmo/DeviceList';
import AirQualityChart from '../../components/atmo/AirQualityChart';
import Skeleton from '../../components/atmo/Skeleton';
import { Wind, Users, Activity, Battery, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DashboardPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Real Data
  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch('/api/devices');
        const data = await res.json();

        // Enrich with status logic if API doesn't provide it fully
        const now = new Date();
        const enriched = data.map(d => {
          const lastSeen = d.last_seen ? new Date(d.last_seen) : null;
          const isOnline = lastSeen && (now - lastSeen) < 5 * 60 * 1000; // 5 min threshold

          return {
            id: d.sensor_id,
            name: d.name || d.sensor_id,
            location: d.location || 'Unknown',
            aqi: d.current_aqi || 0,
            status: isOnline ? 'online' : 'offline',
            battery: d.battery_level || 100
          };
        });

        setDevices(enriched);
      } catch (e) {
        console.error("Failed to fetch devices", e);
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
    const interval = setInterval(fetchDevices, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Calculate Metrics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = totalDevices - onlineDevices;
  const avgAqi = totalDevices > 0 ? Math.round(devices.reduce((acc, curr) => acc + (curr.aqi || 0), 0) / totalDevices) : 0;

  const [chartData, setChartData] = useState([]);
  const [insight, setInsight] = useState(null);

  // Fetch Chart Data
  useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          // API returns 'aqi_trend' with 'aqi' and 'co2' keys which match our chart expectations
          setChartData(json.aqi_trend || []);
          if (json.insight) setInsight(json.insight);
        }
      } catch (e) {
        console.error("Failed to fetch chart data", e);
      }
    }
    fetchChartData();
  }, []);

  // PDF Report Generation
  const generateReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("Breev - Air Quality Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Summary Metrics
    doc.setTextColor(0);
    doc.text("Executive Summary:", 14, 45);
    const summaryData = [
      ["Total Devices", "Online", "Average AQI", "Issues"],
      [totalDevices, onlineDevices, avgAqi, offlineDevices]
    ];
    autoTable(doc, {
      head: [summaryData[0]],
      body: [summaryData[1]],
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Insight
    if (insight) {
      doc.text("Daily Insight:", 14, doc.lastAutoTable.finalY + 15);
      doc.setFont("helvetica", "italic");
      doc.text(insight.message, 14, doc.lastAutoTable.finalY + 22);
      doc.setFont("helvetica", "normal");
    }

    // Devices Table
    doc.text("Device Status:", 14, doc.lastAutoTable.finalY + 35);
    const deviceRows = devices.map(d => [d.name, d.location, d.aqi, d.status, d.battery + '%']);

    autoTable(doc, {
      head: [["Name", "Location", "Current AQI", "Status", "Battery"]],
      body: deviceRows,
      startY: doc.lastAutoTable.finalY + 40,
      theme: 'striped'
    });

    doc.save(`Breev_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <AdminLayout title="Dashboard - Breev Admin">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time monitoring and analytics.</p>
      </div>

      {/* 1. Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Total Devices"
          value={totalDevices}
          unit="Active"
          icon={Activity}
          status="neutral"
        />
        <MetricCard
          label="Avg AIQ"
          value={avgAqi}
          unit="Score"
          icon={Wind}
          status={avgAqi < 50 ? "good" : "warning"}
        />
        <MetricCard
          label="Online"
          value={onlineDevices}
          unit="Devices"
          icon={Users}
          status="good"
        />
        <MetricCard
          label="Issues"
          value={offlineDevices}
          unit="Offline"
          icon={AlertTriangle}
          status={offlineDevices > 0 ? "warning" : "good"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 2. Main Chart Section */}
        <div className="lg:col-span-2">
          <AirQualityChart data={chartData} />

          {/* Recent Activity / Device List */}
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-1/3" />
                    <div className="flex gap-2 pt-4">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <DeviceList devices={devices} />
            )}
          </div>
        </div>

        {/* 3. Small Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Daily Insight</h3>
            <p className="text-indigo-100 text-sm mb-4">
              {insight ? insight.message : "Collecting data for advanced insights..."}
            </p>
            <button
              onClick={generateReport}
              className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition flex justify-center items-center gap-2"
            >
              <span>Download PDF Report</span>
            </button>
          </div>

          {/* Mini Health Status */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">API Gateway</span>
                <span className="text-green-600 font-bold">Operational</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Database</span>
                <span className="text-green-600 font-bold">Connected</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">MQTT Broker</span>
                <span className="text-green-600 font-bold">Live</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </AdminLayout>
  );
}
