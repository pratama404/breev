import React from 'react';
import { MoreVertical, Edit2, Trash2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DevicesTable({ devices, onEdit, onDelete }) {
    // Status Helper
    const getStatusBadge = (status) => {
        const isOnline = status === 'online';
        return (
            <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center w-fit gap-1.5",
                isOnline ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-600 border-slate-100"
            )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-green-500" : "bg-slate-400")} />
                {isOnline ? 'Online' : 'Offline'}
            </span>
        );
    };

    const getAQIBadge = (aqi) => {
        let colorClass = "bg-green-50 text-green-700 border-green-100";
        let label = "Good";
        if (aqi > 50) {
            colorClass = "bg-yellow-50 text-yellow-700 border-yellow-100";
            label = "Moderate";
        }
        if (aqi > 100) {
            colorClass = "bg-orange-50 text-orange-700 border-orange-100";
            label = "Unhealthy";
        }
        if (aqi > 150) {
            colorClass = "bg-red-50 text-red-700 border-red-100";
            label = "Hazardous";
        }

        return (
            <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{aqi}</span>
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border", colorClass)}>
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900">Device Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Location</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Latest AQI</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Last Seen</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {devices.map((device) => (
                            <tr key={device.device_id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-semibold text-gray-900">{device.name}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{device.device_id}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{device.location}</td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(device.status)}
                                </td>
                                <td className="px-6 py-4">
                                    {getAQIBadge(device.latest_aqi)}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(device.last_seen).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit && onEdit(device)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit Device"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(device.device_id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Device"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {devices.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                    <p>No devices found matching your criteria.</p>
                </div>
            )}
        </div>
    );
}
