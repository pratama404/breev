import { getAQIColor, getAQILabel } from '../lib/api';

export default function GaugeChart({ aqi, size = 200 }) {
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (aqi / 500) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="20"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getAQIColor(aqi)}
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-800">{Math.round(aqi)}</div>
          <div className="text-sm text-gray-600">AQI</div>
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-4 text-center">
        <div 
          className="text-lg font-semibold px-4 py-2 rounded-full text-white"
          style={{ backgroundColor: getAQIColor(aqi) }}
        >
          {getAQILabel(aqi)}
        </div>
      </div>
    </div>
  );
}