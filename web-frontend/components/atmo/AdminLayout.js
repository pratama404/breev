import React, { useState } from 'react';
import Head from 'next/head';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

import { useRouter } from 'next/router';

export default function AdminLayout({ children, title = 'Breev Admin' }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans selection:bg-indigo-100">
            <Head>
                <title>{title || 'Breev Admin'}</title>
            </Head>

            {/* Sidebar (Responsive) */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>

            </div>
        </div>
    );
}
