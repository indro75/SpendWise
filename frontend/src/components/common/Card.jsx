import React from 'react';

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
      className={`bg-[#151C2C] border border-[#1F293D] rounded-2xl p-5 shadow-lg shadow-black/20 transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-800/80">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-gray-800/80 text-xs text-gray-400">
          {footer}
        </div>
      )}
    </div>
  );
};

