import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, MapPin } from 'lucide-react';

export default function AdminHeader({ onMenuClick }) {

    // Location State
    const [location, setLocation] = useState('Main Office');

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">

            {/* Left: Mobile Menu & Breadcrumbs/Title */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <Menu size={24} />
                </button>

                {/* Location Selector (Dropdown Mock) */}
                <div
                    className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors"
                    onClick={() => alert("Location fixed to 'Main Office' for this demo.")}
                >
                    <MapPin size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">{location}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
                <div
                    className="relative cursor-pointer group"
                    onClick={() => alert("Notifications feature coming in v2.1!")}
                >
                    <div className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </div>
                </div>
            </div>

        </header>
    );
}
