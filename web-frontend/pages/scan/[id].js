import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import GaugeChart from '../../components/GaugeChart';
import TrendGraph from '../../components/TrendGraph';
import { getHealthRecommendation, getAQIColor } from '../../lib/api';
import { motion } from 'framer-motion';
import { FaTemperatureHigh, FaTint, FaCloud, FaInfoCircle, FaChevronRight } from 'react-icons/fa';

export default function ScanPage() {
    const router = useRouter();
    const { id } = router.query;
    const [activeTab, setActiveTab] = useState('monitor');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock data for demo if ID is 'demo'
    const isDemo = id === 'demo';

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        if (isDemo) {
            // Demo Data
            setTimeout(() => {
                setData({
                    name: "Lobby Utama",
                    timestamp: new Date().toISOString(),
                    aqi_calculated: 45,
                    co2_ppm: 550,
                    temperature: 24.5,
                    humidity: 60,
                    predictions: []
                });
                setLoading(false);
            }, 1000);
            return;
        }

        try {
            const res = await fetch(`/api/sensors/${id}`);
            if (res.ok) {
                const json = await res.json();
                setData(json.current);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (aqi) => {
        if (aqi <= 50) return 'from-green-400 to-green-600';
        if (aqi <= 100) return 'from-yellow-400 to-yellow-600';
        return 'from-red-400 to-red-600';
    };

    if (loading) return (
        <Layout title="Scanning...">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 animate-pulse">Menghubungkan ke Sensor...</p>
            </div>
        </Layout>
    );

    if (!data) return <Layout><div className="p-8 text-center">Sensor tidak ditemukan</div></Layout>;

    return (
        <Layout title={`Scan: ${data.name || id}`}>
            <div className="max-w-md mx-auto">

                {/* Dynamic Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative overflow-hidden rounded-3xl text-white shadow-xl mb-6 bg-gradient-to-br ${getStatusColor(data.aqi_calculated)}`}
                >
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>

                    <div className="relative p-6 text-center z-10">
                        <h2 className="text-lg font-medium opacity-90 mb-1">{data.name || 'Sensor Room'}</h2>
                        <div className="text-sm opacity-75 mb-6">{new Date(data.timestamp).toLocaleString('id-ID')}</div>

                        <div className="bg-white/20 backdrop-blur-md rounded-full p-4 inline-block mb-4 ring-4 ring-white/10">
                            <GaugeChart aqi={data.aqi_calculated} size={140} isDark={true} />
                        </div>

                        <h1 className="text-3xl font-bold mb-2">
                            {data.aqi_calculated <= 50 ? 'Udara Bersih' :
                                data.aqi_calculated <= 100 ? 'Sedang' : 'Tidak Sehat'}
                        </h1>
                        <p className="text-sm opacity-90 max-w-xs mx-auto">
                            {getHealthRecommendation(data.aqi_calculated)}
                        </p>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6 border border-gray-100">
                    {['monitor', 'rekomendasi', 'info'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'monitor' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <FaTemperatureHigh className="text-orange-500 text-2xl mb-2" />
                                <span className="text-gray-500 text-xs">Suhu</span>
                                <span className="text-xl font-bold">{data.temperature}°C</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <FaTint className="text-blue-500 text-2xl mb-2" />
                                <span className="text-gray-500 text-xs">Kelembaban</span>
                                <span className="text-xl font-bold">{data.humidity}%</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                                <FaCloud className="text-gray-500 text-2xl mb-2" />
                                <span className="text-gray-500 text-xs">CO2</span>
                                <span className="text-xl font-bold">{Math.round(data.co2_ppm)} ppm</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center col-span-2">
                                <h3 className="text-gray-900 font-semibold mb-2 self-start w-full flex justify-between">
                                    <span>Grafik 1 Jam</span>
                                    <FaChevronRight className="text-gray-400 text-xs" />
                                </h3>
                                <div className="w-full h-32">
                                    {/* Placeholder for small trend graph */}
                                    <TrendGraph data={[]} predictions={[]} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rekomendasi' && (
                        <div className="space-y-4">
                            {data.co2_ppm > 1000 && (
                                <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                                    <h4 className="font-bold text-red-700">Buka Ventilasi!</h4>
                                    <p className="text-sm text-red-600">Kadar CO2 tinggi, harap buka jendela atau nyalakan exhaust fan.</p>
                                </div>
                            )}
                            {data.temperature > 30 && (
                                <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500">
                                    <h4 className="font-bold text-orange-700">Suhu Panas</h4>
                                    <p className="text-sm text-orange-600">Terlalu panas untuk kerja produktif. Nyalakan AC.</p>
                                </div>
                            )}
                            <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                                <h4 className="font-bold text-blue-700">Rekomendasi Umum</h4>
                                <p className="text-sm text-blue-600">{getHealthRecommendation(data.aqi_calculated)}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 flex items-center">
                                <FaInfoCircle className="text-blue-600 mr-2" /> Apa itu IAQ?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Indoor Air Quality (IAQ) adalah kualitas udara di dalam dan di sekitar gedung, yang berhubungan dengan kesehatan penghhuninya.
                            </p>
                            <details className="group">
                                <summary className="flex justify-between items-center cursor-pointer list-none py-3 border-b border-gray-100">
                                    <span className="font-medium">Bahaya CO2 Tinggi</span>
                                    <span className="transition group-open:rotate-180">▼</span>
                                </summary>
                                <p className="text-gray-600 text-sm mt-3 animate-fade-in">
                                    Konsentrasi CO2 di atas 1000 ppm bisa menyebabkan kantuk, sakit kepala, dan penurunan konsentrasi kerja.
                                </p>
                            </details>
                            <details className="group mt-2">
                                <summary className="flex justify-between items-center cursor-pointer list-none py-3 border-b border-gray-100">
                                    <span className="font-medium">Tentang PM2.5</span>
                                    <span className="transition group-open:rotate-180">▼</span>
                                </summary>
                                <p className="text-gray-600 text-sm mt-3 animate-fade-in">
                                    Partikel debu mikro yang bisa masuk ke paru-paru. Sumbernya bisa dari rokok, masakan, atau polusi luar.
                                </p>
                            </details>
                        </div>
                    )}
                </motion.div>

            </div>
        </Layout>
    );
}
