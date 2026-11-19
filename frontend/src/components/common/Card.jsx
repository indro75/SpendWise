export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  footer,
  ...props
}) => {
  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            {title && <h3 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0 self-start sm:self-auto">{headerAction}</div>}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          {footer}
        </div>
      )}
    </div>
  );
};
