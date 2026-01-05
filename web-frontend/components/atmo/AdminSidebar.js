import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Server, BarChart3, Settings, LogOut, X } from 'lucide-react';
import { cn } from '../../lib/utils'; // Design System Utils

export default function AdminSidebar({ isOpen, onClose }) {
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Devices', path: '/admin/devices', icon: Server },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static border-r border-slate-800",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>

                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                    <div className="p-6 border-b border-gray-800">
                        <h1 className="text-xl font-bold tracking-wider">BREEV</h1>
                        <p className="text-xs text-gray-400 mt-1">Air Quality Monitor</p>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        // Precise active state logic:
                        // Dashboard should be active only on exact match or root admin
                        // Others (Devices, Analytics, Settings) should be active on sub-paths
                        const isActive = item.path === '/admin/dashboard'
                            ? router.pathname === '/admin/dashboard' || router.pathname === '/admin'
                            : router.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors group",
                                    isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom User Profile */}
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 px-2">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                            alt="Admin"
                            className="w-10 h-10 rounded-full bg-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Admin User</p>
                            <p className="text-xs text-slate-500 truncate">admin@atmo.com</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/login')}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

            </aside>
        </>
    );
}
