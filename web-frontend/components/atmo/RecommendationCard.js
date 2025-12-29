import React from 'react';
import { ArrowRight, Info } from 'lucide-react';

export default function RecommendationCard({ title, description, type = 'info' }) {
  const styles = {
    info: 'bg-indigo-50 text-indigo-900 border-indigo-100',
    warning: 'bg-orange-50 text-orange-900 border-orange-100',
    success: 'bg-green-50 text-green-900 border-green-100'
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className={`p-6 rounded-2xl border flex items-center space-x-5 transition-transform hover:scale-[1.01] cursor-pointer ${currentStyle}`}>
      <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm shrink-0">
        <Info size={28} className="opacity-80" />
      </div>

      <div className="flex-grow">
        <h4 className="font-bold text-lg mb-1 tracking-tight">{title}</h4>
        <p className="text-sm opacity-80 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      <div className="self-center p-2 rounded-full bg-white/40 hover:bg-white/60 transition-colors">
        <ArrowRight size={20} />
      </div>
    </div>
  );
}
