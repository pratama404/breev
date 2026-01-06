import { Frown, Meh, Smile, AlertTriangle, AlertOctagon, Skull } from 'lucide-react';
import { getAQIInfo } from '../../lib/aqi';

export default function ScoreGauge({ value, maxValue = 500 }) {
  const getStatus = (aqi) => {
    const info = getAQIInfo(aqi);
    // Map internal logic to helper info
    let icon = Smile;
    if (aqi > 50) icon = Meh;
    if (aqi > 100) icon = Frown;
    if (aqi > 150) icon = AlertTriangle;
    if (aqi > 200) icon = AlertOctagon;
    if (aqi > 300) icon = Skull;

    // We need to translate 'bg-color' to 'text-color' if strictly following previous pattern
    // Or just use the hex
    return {
      label: info.level,
      colorClass: info.textColor,
      icon,
      hex: info.hex
    };
  };

  const status = getStatus(value);
  const Icon = status.icon;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden h-full">
      <div className={`absolute top-0 w-full h-1 opacity-20`} style={{ backgroundColor: status.hex }} />

      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="112" cy="112" r={radius} stroke="#f3f4f6" strokeWidth="16" fill="transparent" />
          <circle
            cx="112"
            cy="112"
            r={radius}
            stroke={status.hex}
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={56} className={`mb-3`} style={{ color: status.hex }} />
          <span className={`text-6xl font-black tracking-tighter`} style={{ color: status.hex }}>
            {value}
          </span>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">AQI Index</span>
        </div>
      </div>

      <div className={`mt-6 text-2xl font-bold tracking-tight text-center uppercase`} style={{ color: status.hex }}>
        {status.label}
      </div>
      <p className="text-gray-400 text-sm mt-2 text-center max-w-[200px]">
        {getAQIInfo(value).desc}
      </p>
    </div>
  );
}
