import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

import Link from 'next/link';
import Layout from '../components/Layout';
import { FaWind, FaQrcode, FaShieldAlt } from 'react-icons/fa';

export default function Home() {
  return (
    <Layout title="AirPhyNet - Welcome">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">

        {/* Hero Section */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-block p-4 rounded-full bg-blue-100 text-blue-600 mb-6 shadow-sm">
            <FaWind size={48} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            AirPhy<span className="text-blue-600">Net</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sistem Monitoring Kualitas Udara Cerdas Berbasis IoT & AI.
            <br />
            Menjaga kesehatan udara di lingkungan Anda secara real-time.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full px-4 mb-16">
          <Link href="/scan/demo" className="group">
            <div className="glass-panel p-8 h-full hover:border-blue-400 transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform">
                <FaQrcode size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Scan QR Code</h2>
              <p className="text-gray-500">
                Akses cepat data kualitas udara di ruangan Anda. Cukup scan kode QR yang tersedia.
              </p>
            </div>
          </Link>

          <Link href="/admin/login" className="group">
            <div className="glass-panel p-8 h-full hover:border-blue-400 transition-all duration-300 transform group-hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform">
                <FaShieldAlt size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Admin Portal</h2>
              <p className="text-gray-500">
                Login untuk operator dan pengelola gedung. Monitor semua perangkat dan unduh data.
              </p>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-sm text-gray-400 animate-fade-in">
          <p>© 2024 AirPhyNet Project. Powered by ESP32, MQTT & AI.</p>
        </div>

      </div>
    </Layout>
  );
}