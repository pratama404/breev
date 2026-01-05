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

    const handleSaveThreshold = (newValues) => {
        setSettings({ ...settings, aqi_threshold: newValues });
        // In real app, make API call here
        addToast('Threshold settings saved successfully', 'success');
    };

    const handleSaveMQTT = (newValues) => {
        setSettings({ ...settings, mqtt: newValues });
        addToast('MQTT configuration updated', 'success');
    };

    const handleToggleNotify = (enabled) => {
        setSettings({
            ...settings,
            notification: { ...settings.notification, enabled }
        });
        addToast(enabled ? 'Notifications enabled' : 'Notifications disabled', 'info');
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
                    <ApiKeyGenerator />

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
