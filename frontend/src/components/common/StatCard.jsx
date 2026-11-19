export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-500',
  iconBg = 'bg-indigo-500/10 border-indigo-500/20',
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  className = '',
}) => {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">{title}</p>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight truncate">{value}</h2>
        </div>

        {Icon && (
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border ${iconBg} ${iconColor} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] shrink-0 ${
                trendType === 'positive'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : trendType === 'negative'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-[var(--text-muted)] border border-[var(--border-subtle)]'
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
