import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Wind, Droplets, Thermometer, MapPin, Share2, Activity } from 'lucide-react';
import MetricCard from '../../components/atmo/MetricCard';
import ScoreGauge from '../../components/atmo/ScoreGauge';
import RecommendationCard from '../../components/atmo/RecommendationCard';
import { getAQIInfo, AQI_SCALE } from '../../lib/aqi';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Auto-register charts

export default function ScanPage() {
  const router = useRouter();
  const { id } = router.query;

  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/sensors/${id}`);
        if (!res.ok) throw new Error('Sensor not found');
        const json = await res.json();

        // Map API response to UI
        const current = json.current || {};
        const historical = json.historical || [];

        // Use centralized AQI Logic
        const aqi = current.aqi || 0;
        const aqiInfo = getAQIInfo(aqi);

        const recTitle = `Kualitas Udara: ${aqiInfo.level}`;
        const recDesc = aqiInfo.desc;

        // Map our simple types to RecommendationCard types if needed, or pass hex directly?
        // RecommendationCard likely expects 'success', 'warning', 'danger'.
        // Let's map loosely or update RecommendationCard (better to map loosely for now)
        let recType = 'success';
        if (aqi > 50) recType = 'warning';
        if (aqi > 150) recType = 'danger';

        setRoomData({
          name: current.name || `Room ${id}`,
          floor: current.location || "Unknown Floor",
          building: "HQ Office",
          aqi: Math.round(aqi),
          temperature: current.temperature ? Math.round(current.temperature) : '--',
          humidity: current.humidity ? Math.round(current.humidity) : '--',
          co2: current.co2 ? Math.round(current.co2) : '--',
          lastUpdate: "Live",
          recommendation: { title: recTitle, desc: recDesc, type: recType, colorInfo: aqiInfo }
        });
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000); // Live poll every 10s
    return () => clearInterval(interval);
  }, [id]);

  // Fetch Predictions
  useEffect(() => {
    if (!id) return;
    async function fetchPred() {
      try {
        const res = await fetch(`/api/predictions/${id}`);
        if (res.ok) {
          const data = await res.json();
          // Expecting { predicted_aqi: [ {hour: 1, aqi: 45}, ... ] } or similar
          // Adapting to whatever the API returns. 
          // If API returns stored prediction document: { predictions: [{predicted_co2: 500}, ...] }
          if (data.predictions) {
            // Extract CO2 values
            const values = data.predictions.map(p => p.predicted_co2);
            setPredictions(values);
          }
        }
      } catch (e) { console.error(e); }
    }
    fetchPred();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
      <Activity className="animate-spin mr-2" /> Loading stats...
    </div>
  );

  if (error || !roomData) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
      <p>⚠️ Failed to load sensor data. Is the device online?</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100">
      <Head>
        <title>{roomData.name} - Breev Monitor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0" />
        <meta name="description" content={`Real-time air quality in ${roomData.name}: ${roomData.recommendation.title}`} />
        <meta property="og:title" content={`${roomData.name} - Breev AQI`} />
        <meta property="og:description" content={`Current AQI: ${roomData.aqi} (${roomData.recommendation.title}). ${roomData.recommendation.desc}`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://breev.vercel.app/icon-512.png" />
      </Head>

      {/* Mobile-Friendly Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">{roomData.name}</h1>
          <p className="text-xs font-medium text-gray-400 flex items-center mt-0.5">
            <MapPin size={12} className="mr-1" /> {roomData.floor}, {roomData.building}
          </p>
        </div>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${roomData.name} Air Quality`,
                text: `Current AQI in ${roomData.name}: ${roomData.aqi}`,
                url: window.location.href
              }).catch(console.error);
            } else {
              // Fallback
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }
          }}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          <Share2 size={18} className="text-gray-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">

        {/* Responsive Grid Layout based on 'Image 0' */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Gauge & Key Metrics */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Main Score Card */}
            <section>
              <ScoreGauge value={roomData.aqi} />
            </section>

            {/* Metrics Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                label="Temperature"
                value={roomData.temperature}
                unit="°C"
                icon={Thermometer}
                status={roomData.temperature > 26 ? 'warning' : 'good'}
              />
              <MetricCard
                label="Humidity"
                value={roomData.humidity}
                unit="%"
                icon={Droplets}
                status="neutral"
              />
              <MetricCard
                label="CO2 Level"
                value={roomData.co2}
                unit="PPM"
                icon={Wind}
                status={roomData.co2 > 1000 ? 'danger' : 'good'}
                className="col-span-2 md:col-span-1"
              />
            </section>

            {/* Recommendation Widget */}
            <section>
              <RecommendationCard
                title={roomData.recommendation.title}
                description={roomData.recommendation.desc}
                type={roomData.recommendation.type}
              />
            </section>

            {/* Forecasting Section */}
            {predictions && (
              <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600" />
                  Forecasting (Next 6 Hours)
                </h3>
                <div className="h-48">
                  <Line
                    data={{
                      labels: ['+1h', '+2h', '+3h', '+4h', '+5h', '+6h'],
                      datasets: [{
                        label: 'Predicted CO2 (PPM)',
                        data: predictions,
                        borderColor: '#4f46e5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } }
                    }}
                  />
                </div>
              </section>
            )}

            {/* Educational Section */}
            <section id="aqi-guide" className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-900">Panduan Kualitas Udara (US EPA)</h3>
                <p className="text-sm text-gray-500">Standar yang digunakan untuk menghitung Indeks Kualitas Udara.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Rentang AQI</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 hidden md:table-cell">Implikasi Kesehatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {AQI_SCALE.map((scale, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-mono font-bold">{scale.range}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${scale.color}`}>
                            {scale.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-600">{scale.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column: Location & Info (Desktop) / Bottom (Mobile) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Map Widget Placeholder */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-64 relative group">
              {/* Static Map Image Placeholder */}
              <div className="absolute inset-0 bg-indigo-50 flex items-center justify-center">
                <MapPin size={48} className="text-indigo-200" />
                <span className="sr-only">Map View</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm">Location Context</h4>
                <p className="text-xs text-gray-500 mt-1">{roomData.floor}, {roomData.building}</p>
              </div>
            </div>

            {/* About Card */}
            <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-lg">
              <h3 className="font-bold text-lg mb-2">About Breev</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                We monitor indoor environmental quality to ensure your health and productivity. Scan any room&apos;s QR code to see real-time data.
                <br /><br />
                <strong>AI Forecasting:</strong> Powered by <em>AirPhyNet</em> (Physics-Informed LSTM) to predict future trends based on airflow dynamics.
              </p>
              <button
                onClick={() => document.getElementById('aqi-guide').scrollIntoView({ behavior: 'smooth' })}
                className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-sm transition"
              >
                Learn More
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
