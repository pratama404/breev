import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWind, FaChartLine, FaQrcode, FaCog } from 'react-icons/fa';

export default function Layout({ children, title = 'Breev' }) {
    const router = useRouter();

    const navItems = [
        { name: 'Monitor', path: '/', icon: <FaWind /> },
        { name: 'Admin', path: '/admin', icon: <FaCog /> },
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gradient-to-br from-blue-50 to-indigo-50">
            <Head>
                <title>{title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#2563eb" />
            </Head>

            {/* Glass Header */}
            <header className="fixed top-0 w-full z-50 glass-header shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                            <FaWind size={20} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Breev
                        </span>
                    </Link>

                    <nav className="hidden md:flex space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${router.pathname === item.path
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Button (Placeholder) */}
                    <button className="md:hidden text-gray-600 p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content with Page Transitions */}
            <main className="flex-grow pt-20 pb-20 md:pb-8 container mx-auto px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={router.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full glass-header border-t border-gray-200 pb-safe z-50">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex flex-col items-center p-2 transition-colors ${router.pathname === item.path
                                ? 'text-blue-600'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <div className="text-xl mb-1">{item.icon}</div>
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    ))}
                    <Link
                        href="/scan/demo"
                        className="flex flex-col items-center p-2 text-gray-500 hover:text-gray-900"
                    >
                        <div className="text-xl mb-1"><FaQrcode /></div>
                        <span className="text-xs font-medium">Scan</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
