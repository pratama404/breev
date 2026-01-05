import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/atmo/AdminLayout';
import DevicesTable from '../../components/atmo/DevicesTable';
import AddDeviceModal from '../../components/atmo/AddDeviceModal';
import { Search, Filter, Plus } from 'lucide-react';
import { useToast } from '../../components/atmo/ToastProvider';

export default function DevicesPage() {
    const { addToast } = useToast();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Fetch Data
    const fetchDevices = React.useCallback(async () => {
        setLoading(true); // fast refresh visual might be annoying, maybe skip
        try {
            const res = await fetch('/api/devices');
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map(d => ({
                    device_id: d.sensor_id,
                    name: d.name,
                    location: d.location,
                    status: (new Date() - new Date(d.last_seen)) < 5 * 60 * 1000 ? 'online' : 'offline',
                    last_seen: d.last_seen || null,
                    latest_aqi: d.latest_aqi
                }));
                setDevices(mapped);
            } else {
                addToast('Failed to fetch devices', 'error');
            }
        } catch (e) {
            console.error(e);
            addToast('Error loading devices', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, online, offline

    // Filtering Logic
    const filteredDevices = devices.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.location.toLowerCase().includes(search.toLowerCase()) ||
            d.device_id.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' ? true : d.status === filter;

        return matchesSearch && matchesFilter;
    });

    // Real Handlers
    const handleDelete = async (id) => {
        if (confirm(`Are you sure you want to delete device ${id}?`)) {
            try {
                const res = await fetch(`/api/devices?sensor_id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setDevices(prev => prev.filter(d => d.device_id !== id));
                    addToast(`Device ${id} deleted successfully`, 'success');
                } else {
                    addToast('Failed to delete device', 'error');
                }
            } catch (e) {
                console.error(e);
                addToast('Error deleting device', 'error');
            }
        }
    };

    const handleEdit = (device) => {
        addToast(`Edit mode for ${device.name} coming soon`, 'info');
    };

    return (
        <AdminLayout title="Device Management">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Devices</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage and monitor your sensor network.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} />
                    <span className="font-semibold text-sm">Add New Device</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Search */}
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
                    />
                </div>

                {/* Filters */}
                <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
                    {['all', 'online', 'offline'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <DevicesTable
                devices={filteredDevices}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <AddDeviceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchDevices}
            />
        </AdminLayout>
    );
}
