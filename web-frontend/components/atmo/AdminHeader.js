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

                {/* Location Selector */}
                <div className="relative group z-50">
                    <button
                        className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors"
                    >
                        <MapPin size={16} className="text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">{location}</span>
                        <ChevronDown size={14} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </button>

                    {/* Location Dropdown */}
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
                        {['Main Office', 'Server Room', 'Lobby', 'Meeting Room A'].map((loc) => (
                            <button
                                key={loc}
                                onClick={() => setLocation(loc)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${location === loc ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700'}`}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
                <div className="relative group">
                    <button
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative outline-none focus:bg-gray-100"
                        title="Notifications"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </button>

                    {/* Mock Dropdown on Hover/Group */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-2 border-b border-gray-50">
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                                <p className="text-sm text-gray-800 font-medium">High CO2 Alert</p>
                                <p className="text-xs text-gray-500 mt-0.5">Meeting Room B exceeded 1000 PPM.</p>
                                <p className="text-[10px] text-gray-400 mt-1">2 mins ago</p>
                            </div>
                            <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                                <p className="text-sm text-gray-800 font-medium">Sensor Offline</p>
                                <p className="text-xs text-gray-500 mt-0.5">Device DEV-002 lost connection.</p>
                                <p className="text-[10px] text-gray-400 mt-1">1 hour ago</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 border-t border-gray-50 text-center">
                            <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Mark all as read</button>
                        </div>
                    </div>
                </div>
            </div>

        </header>
    );
}
