import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white focus:ring-indigo-500 shadow-lg shadow-indigo-500/20',
    secondary: 'bg-[#1E2638] hover:bg-[#28334a] text-gray-200 border border-gray-700/60 focus:ring-gray-500',
    outline: 'border border-gray-600/60 hover:bg-white/5 text-gray-300 focus:ring-indigo-500',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white focus:ring-red-500 shadow-lg shadow-red-500/20',
    success: 'bg-[#22C55E] hover:bg-[#16A34A] text-white focus:ring-green-500 shadow-lg shadow-green-500/20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5 focus:ring-gray-500',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

