export const SpendWiseIcon = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-indigo-500/25 transition-transform duration-200 hover:scale-105 select-none ${className}`}>
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="sw-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="55%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient id="sw-arrow-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#A5F3FC" />
          </linearGradient>

          <linearGradient id="sw-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <filter id="sw-subtle-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Squircle Background with gradient */}
        <rect width="44" height="44" rx="12" fill="url(#sw-bg-grad)" />

        {/* Ambient glow reflection */}
        <circle cx="36" cy="8" r="16" fill="white" fillOpacity="0.12" filter="blur(4px)" />

        {/* Lower flow curve of 'S' */}
        <path
          d="M13 28.5C13.5 31.5 16.5 33.5 21.5 33.5C26.5 33.5 29.5 31 29.5 27.5C29.5 24.5 27 22.8 22 21.5"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dynamic rising 'S' stroke with top-right growth arrow */}
        <path
          d="M14 17C14.5 13.5 17.5 11.5 22 11.5C26.5 11.5 30.5 13.5 31 17.5V11M31 11H24.5"
          stroke="url(#sw-arrow-grad)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#sw-subtle-glow)"
        />

        {/* Upward diagonal growth trend line through the monogram */}
        <path
          d="M13 31L30.5 11.5"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          filter="url(#sw-subtle-glow)"
        />

        {/* AI Financial Sparkle / Intelligence Star */}
        <path
          d="M28 20L29.2 22.3L31.5 23.5L29.2 24.7L28 27L26.8 24.7L24.5 23.5L26.8 22.3L28 20Z"
          fill="url(#sw-star-grad)"
          filter="url(#sw-subtle-glow)"
        />

        {/* Micro accent dot */}
        <circle cx="14" cy="23" r="1.5" fill="#A5F3FC" />
      </svg>
    </div>
  );
};

export const Logo = ({
  size = 'md',
  showText = true,
  subtitle = 'AI Finance',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    xs: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <SpendWiseIcon className={currentSize.icon} />

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center tracking-tight font-extrabold">
            <span className="text-gray-900 dark:text-white transition-colors duration-200">
              Spend
            </span>
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Wise
            </span>
          </div>
          {subtitle && (
            <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider transition-colors duration-200 font-mono text-[10px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
