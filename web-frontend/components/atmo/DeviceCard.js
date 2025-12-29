import React from 'react';
import { useRouter } from 'next/router';
import { Battery, Wifi, WifiOff, MapPin, ArrowRight, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DeviceCard({ device }) {
    const router = useRouter();

    // Status Helpers
    const isOnline = device.status === 'online';
    const batteryColor = device.battery < 20 ? 'text-red-500' : 'text-green-500';
    const aqColor = device.aqi <= 50 ? 'bg-green-100 text-green-700'
        : device.aqi <= 100 ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700';

    return (
        <div
            onClick={() => router.push(`/scan/${device.id}`)} // For demo, goes to scan page
            className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            {/* Top Row: Name & Status */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {device.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin size={12} className="mr-1" />
                        {device.location}
                    </div>
                </div>
                <button className="text-gray-300 hover:text-gray-600">
                    <MoreVertical size={18} />
                </button>
            </div>

            {/* Middle Row: Big AQI Number */}
            <div className="flex items-end space-x-2 mb-4">
                <span className="text-4xl font-extrabold text-slate-800 tracking-tighter">
                    {device.aqi}
                </span>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold uppercase mb-1.5", aqColor)}>
                    {device.aqi <= 50 ? 'Good' : device.aqi <= 100 ? 'Moderate' : 'Poor'}
                </span>
            </div>

            {/* Bottom Row: Tech Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs font-medium text-gray-400">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center" title="Connection Status">
                        {isOnline ? <Wifi size={14} className="text-green-500 mr-1" /> : <WifiOff size={14} className="text-red-400 mr-1" />}
                        {isOnline ? 'Online' : 'Offline'}
                    </div>
                    <div className="flex items-center" title="Battery Level">
                        <Battery size={14} className={cn("mr-1", batteryColor)} />
                        {device.battery}%
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 flex items-center">
                    Details <ArrowRight size={14} className="ml-1" />
                </div>
            </div>
        </div>
    );
}
