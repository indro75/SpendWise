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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer touch-manipulation';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 sm:py-1.5 gap-1.5 min-h-[36px] sm:min-h-0',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px] sm:min-h-0',
    lg: 'text-base px-5 py-3 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-md shadow-indigo-500/20',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-[#1E2638] dark:hover:bg-[#28334a] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700/60 focus:ring-gray-500',
    outline: 'border border-gray-300 dark:border-gray-600/60 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 focus:ring-indigo-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-red-500 shadow-md shadow-red-500/20',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-green-500 shadow-md shadow-green-500/20',
    ghost: 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-white/5 focus:ring-gray-500',
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
