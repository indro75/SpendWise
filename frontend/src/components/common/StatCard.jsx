import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-400',
  iconBg = 'bg-indigo-500/10 border-indigo-500/20',
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  className = '',
}) => {
  return (
    <div
      className={`bg-[#151C2C] border border-[#1F293D] rounded-2xl p-5 shadow-lg shadow-black/20 relative overflow-hidden transition-all duration-200 hover:border-gray-700/80 hover:shadow-indigo-500/5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
          <h2 className="text-2xl font-bold text-gray-100 tracking-tight">{value}</h2>
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${iconBg} ${iconColor} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium px-2 py-0.5 rounded-full text-[11px] ${
                trendType === 'positive'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : trendType === 'negative'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

