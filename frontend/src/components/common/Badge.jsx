import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-semibold',
    md: 'text-xs px-3 py-1 rounded-full font-semibold',
  };

  const variantClasses = {
    neutral: 'bg-gray-800 text-gray-300 border border-gray-700',
    info: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    income: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    expense: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 uppercase tracking-wider ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.neutral} ${className}`}>
      {children}
    </span>
  );
};

