import React from 'react';
import { cn } from '../../lib/utils';

export default function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  status = 'neutral',
  className
}) {
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-100',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    danger: 'text-red-600 bg-red-50 border-red-100',
    neutral: 'text-blue-600 bg-blue-50 border-blue-100'
  };

  const activeColor = statusColors[status] || statusColors.neutral;

  return (
    <div className={`relative p-5 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${activeColor}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-1">
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
          {value}
        </h3>
        <span className="text-sm font-semibold text-gray-400 uppercase">{unit}</span>
      </div>
    </div>
  );
}
