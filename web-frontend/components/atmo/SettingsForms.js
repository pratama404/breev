import React, { useState } from 'react';
import { Save, RefreshCw, Bell, BellOff, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ThresholdForm({ settings, onSave }) {
    const [values, setValues] = useState(settings || { moderate: 100, unhealthy: 150 });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(values);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">AQI Thresholds</h3>
                    <p className="text-sm text-gray-500">Define alert levels for air quality index.</p>
                </div>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-medium">
                    <Save size={16} /> Save
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Moderate Limit (&gt; Good)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={values.moderate}
                            onChange={(e) => setValues({ ...values, moderate: parseInt(e.target.value) })}
                            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">AQI</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unhealthy Limit (&gt; Mod)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={values.unhealthy}
                            onChange={(e) => setValues({ ...values, unhealthy: parseInt(e.target.value) })}
                            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">AQI</span>
                    </div>
                </div>
            </div>
        </form>
    );
}

export function MQTTConfigForm({ config, onSave }) {
    const [values, setValues] = useState(config || { broker_url: '', topic: '', qos: 1 });

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">MQTT Configuration</h3>
                    <p className="text-sm text-gray-500">Connection details for the IoT broker.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition" title="Test Connection">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={() => onSave(values)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm font-medium">
                        <Save size={16} /> Save
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Broker URL</label>
                    <input
                        type="text"
                        value={values.broker_url}
                        onChange={(e) => setValues({ ...values, broker_url: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition font-mono text-sm"
                        placeholder="mqtt://broker.hivemq.com"
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subscribe Topic</label>
                        <input
                            type="text"
                            value={values.topic}
                            onChange={(e) => setValues({ ...values, topic: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">QoS Level</label>
                        <select
                            value={values.qos}
                            onChange={(e) => setValues({ ...values, qos: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition"
                        >
                            <option value={0}>0 - At most once</option>
                            <option value={1}>1 - At least once</option>
                            <option value={2}>2 - Exactly once</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function NotificationSettings({ settings, onToggle }) {
    const [enabled, setEnabled] = useState(settings?.enabled || false);

    const handleToggle = () => {
        const newState = !enabled;
        setEnabled(newState);
        onToggle(newState);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Alert Notifications</h3>
                    <p className="text-sm text-gray-500 mb-4">Receive alerts when AQI exceeds hazardous levels.</p>

                    <div className="flex gap-3">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", enabled ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200")}>
                            Dashboard
                        </span>
                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", enabled ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200")}>
                            Email
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleToggle}
                    className={cn(
                        "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2",
                        enabled ? 'bg-indigo-600' : 'bg-gray-200'
                    )}
                >
                    <span
                        aria-hidden="true"
                        className={cn(
                            "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            enabled ? 'translate-x-6' : 'translate-x-0'
                        )}
                    />
                </button>
            </div>
        </div>
    );
}

export function ApiKeyGenerator() {
    const [key, setKey] = useState('sk_live_' + Math.random().toString(36).substr(2, 16));

    const regenerate = () => {
        setKey('sk_live_' + Math.random().toString(36).substr(2, 16));
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Lock size={18} className="text-indigo-400" /> API Access
            </h3>
            <p className="text-slate-400 text-sm mb-6">Use this key to authenticate external devices.</p>

            <div className="flex gap-2 mb-4">
                <code className="flex-1 bg-black/30 p-3 rounded-lg font-mono text-sm text-indigo-300 break-all border border-white/10">
                    {key}
                </code>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition">
                    Copy
                </button>
            </div>
            <button onClick={regenerate} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition">
                Regenerate Key
            </button>
        </div>
    )
}
