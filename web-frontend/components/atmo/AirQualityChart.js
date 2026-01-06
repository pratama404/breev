import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AirQualityChart({ data }) {

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-sm font-bold text-gray-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs font-medium mb-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-500 capitalize">{entry.name}:</span>
              <span className="text-gray-900 font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Air Quality Trend</h3>
          <p className="text-xs text-gray-500">CO2 (ppm) vs AQI over the last 24 hours</p>
        </div>

        {/* Simple Time Filter */}
        <div className="flex bg-gray-50 p-1 rounded-lg">
          {['24h', '7d', '30d'].map((period, idx) => (
            <button
              key={period}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${idx === 0 ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickFormatter={(str) => {
              const date = new Date(str);
              if (isNaN(date.getTime())) return str;
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }}
            dy={10}
          />
          <YAxis
            yAxisId="co2"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6366f1' }}
            domain={[400, 1000]}
          />
          <YAxis
            yAxisId="aqi"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#10b981' }}
          />
          <Tooltip content={<CustomTooltip />} />

          <Area
            yAxisId="co2"
            type="monotone"
            dataKey="co2"
            name="CO2 Level"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCo2)"
          />
          <Area
            yAxisId="aqi"
            type="monotone"
            dataKey="aqi"
            name="AQI Score"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAqi)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
