import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import DeviceCard from './DeviceCard';

export default function DeviceList({ devices, onAddDevice }) {
    return (
        <div className="space-y-6">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">Active Devices ({devices.length})</h2>

                <div className="flex space-x-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search room..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                        <Filter size={18} />
                    </button>
                    <button
                        onClick={onAddDevice}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-sm"
                    >
                        <Plus size={18} />
                        <span className="text-sm font-medium hidden sm:inline">Add Device</span>
                    </button>
                </div>
            </div>

            {/* Grid Layout (Desktop) & Stack (Mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {devices.map((device) => (
                    <DeviceCard key={device.id} device={device} />
                ))}
            </div>

        </div>
    );
}
