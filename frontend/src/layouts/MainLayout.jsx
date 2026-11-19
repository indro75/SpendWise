import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from '../components/common/Logo';
import { spendingAlertService } from '../services/spendingAlerts';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  WalletCards,
  Target,
  BarChart3,
  Bell,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  // Fetch active alerts count for topbar notification badge
  useEffect(() => {
    let isMounted = true;
    const fetchAlertCount = async () => {
      try {
        const alerts = await spendingAlertService.getAll();
        if (isMounted) {
          setActiveAlertCount(alerts.length);
        }
      } catch {
        // silent fallback
      }
    };
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Budgets', path: '/budgets', icon: WalletCards },
    { name: 'Savings Goals', path: '/savings-goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Spending Alerts', path: '/spending-alerts', icon: Bell, badge: activeAlertCount },
    { name: 'Expense Prediction', path: '/expense-prediction', icon: TrendingUp },
    { name: 'Unusual Spending', path: '/unusual-spending', icon: ShieldAlert },
    { name: 'AI Insights', path: '/ai-insights', icon: Sparkles },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Mobile bottom navigation primary links
  const mobileBottomItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Activity', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', path: '/budgets', icon: WalletCards },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const currentPage = navItems.find((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-none ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${mobileMenuOpen ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 md:px-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div
            onClick={() => {
              navigate('/');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
          >
            <Logo
              size={isCollapsed ? 'sm' : 'md'}
              showText={!isCollapsed}
              subtitle="AI Finance"
            />
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-indigo-500'
                  }`}
                />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}
                {!isCollapsed && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white shrink-0">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile & Collapse Toggle */}
        <div className="p-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.full_name}</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={logout}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors w-full ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 px-4 md:px-8 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="md:hidden">
                <Logo size="xs" showText={false} onClick={() => navigate('/')} />
              </div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-[var(--text-primary)] tracking-tight">
                {currentPage ? currentPage.name : 'SpendWise'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Spending Alerts Bell */}
            <button
              type="button"
              onClick={() => navigate('/spending-alerts')}
              className="relative p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/40 transition-colors"
              title="Spending Alerts"
              aria-label="Spending alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500/40 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* User Profile Pill */}
            {user && (
              <div
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.full_name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium text-[var(--text-primary)] hidden sm:inline max-w-[120px] truncate">
                  {user.full_name?.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8 transition-colors duration-200">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (thumb friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-secondary)]/95 backdrop-blur-lg border-t border-[var(--border-subtle)] px-2 py-1.5 flex items-center justify-around shadow-2xl pb-safe">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.name}
              </span>
            </NavLink>
          );
        })}

        {/* More / Menu Drawer trigger on mobile */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all`}
        >
          <div className="p-1 rounded-lg relative">
            <Menu className="w-5 h-5" />
            {activeAlertCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            More
          </span>
        </button>
      </nav>
    </div>
  );
};
