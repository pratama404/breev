import React, { useState } from 'react';
import AdminLayout from '../../components/atmo/AdminLayout';
import { ThresholdForm, MQTTConfigForm, NotificationSettings, ApiKeyGenerator } from '../../components/atmo/SettingsForms';
import { useToast } from '../../components/atmo/ToastProvider';

export default function SettingsPage() {
    const { addToast } = useToast();
    const [settings, setSettings] = useState({
        aqi_threshold: {
            moderate: 100,
            unhealthy: 150
        },
        mqtt: {
            broker_url: "mqtt://broker.example.com",
            topic: "air-quality/data",
            qos: 1
        },
        notification: {
            enabled: true,
            channel: ["dashboard", "email"]
        }
    });
    const [loading, setLoading] = useState(true);

    // Fetch Settings
    React.useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const saveSettings = async (newSettings) => {
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            if (res.ok) {
                return true;
            }
            throw new Error('Failed to save');
        } catch (e) {
            console.error(e);
            addToast('Failed to save settings', 'error');
            return false;
        }
    };

    const handleSaveThreshold = async (newValues) => {
        const newSettings = { ...settings, aqi_threshold: newValues };
        setSettings(newSettings);
        if (await saveSettings(newSettings)) {
            addToast('Threshold settings saved successfully', 'success');
        }
    };

    const handleSaveMQTT = async (newValues) => {
        const newSettings = { ...settings, mqtt: newValues };
        setSettings(newSettings);
        if (await saveSettings(newSettings)) {
            addToast('MQTT configuration updated', 'success');
        }
    };

    const handleToggleNotify = async (enabled) => {
        const newSettings = {
            ...settings,
            notification: { ...settings.notification, enabled }
        };
        setSettings(newSettings);

        // Auto-save toggle
        if (await saveSettings(newSettings)) {
            addToast(enabled ? 'Notifications enabled' : 'Notifications disabled', 'info');
        }
    };

    const handleSaveApiKey = async (newKey) => {
        const newSettings = { ...settings, api_key: newKey };
        setSettings(newSettings);
        if (await saveSettings(newSettings)) {
            addToast('API Key saved successfully. Update your devices!', 'warning');
        }
    };

    return (
        <AdminLayout title="System Settings">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Configure your dashboard and sensor network preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Main Forms */}
                <div className="lg:col-span-2 space-y-8">
                    <ThresholdForm
                        settings={settings.aqi_threshold}
                        onSave={handleSaveThreshold}
                    />

                    <MQTTConfigForm
                        config={settings.mqtt}
                        onSave={handleSaveMQTT}
                    />

                    <NotificationSettings
                        settings={settings.notification}
                        onToggle={handleToggleNotify}
                    />
                </div>

                {/* Right Column: API & Danger Zone */}
                <div className="space-y-6">
                    <ApiKeyGenerator
                        currentKey={settings?.api_key}
                        onSave={handleSaveApiKey}
                    />

                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                        <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
                        <p className="text-red-700 text-sm mb-4">Irreversible actions that affect your system data.</p>
                        <button className="w-full py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition">
                            Reset Factory Defaults
                        </button>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
