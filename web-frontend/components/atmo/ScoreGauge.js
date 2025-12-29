import React from 'react';
import { Frown, Meh, Smile, AlertTriangle } from 'lucide-react';

export default function ScoreGauge({ value, maxValue = 500 }) {
  const getStatus = (aqi) => {
    if (aqi <= 50) return { label: "Excellent", color: "text-green-500", icon: Smile, ring: "stroke-green-500" };
    if (aqi <= 100) return { label: "Good", color: "text-green-400", icon: Smile, ring: "stroke-green-400" };
    if (aqi <= 150) return { label: "Moderate", color: "text-yellow-500", icon: Meh, ring: "stroke-yellow-500" };
    if (aqi <= 200) return { label: "Poor", color: "text-orange-500", icon: Frown, ring: "stroke-orange-500" };
    return { label: "Hazardous", color: "text-red-600", icon: AlertTriangle, ring: "stroke-red-600" };
  };

  const status = getStatus(value);
  const Icon = status.icon;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden h-full">
      <div className={`absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-${status.color.replace('text-', '')} to-transparent opacity-20`} />

      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="112" cy="112" r={radius} stroke="#f3f4f6" strokeWidth="16" fill="transparent" />
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${status.ring} transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={56} className={`${status.color} mb-3`} />
          <span className={`text-6xl font-black ${status.color} tracking-tighter`}>
            {value}
          </span>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">AQI Index</span>
        </div>
      </div>

      <div className={`mt-6 text-2xl font-bold ${status.color} tracking-tight text-center uppercase`}>
        {status.label}
      </div>
      <p className="text-gray-400 text-sm mt-2 text-center max-w-[200px]">
        Air quality is {status.label.toLowerCase()} today.
      </p>
    </div>
  );
}
