import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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

  const currentPage = navItems.find((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 bg-[#111827] border-r border-[#1F293D] flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${mobileMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#1F293D] flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-gray-200 to-indigo-300 bg-clip-text text-transparent">
                  SpendWise
                </span>
                <span className="text-[10px] text-indigo-400 tracking-wider font-semibold uppercase">
                  AI Finance
                </span>
              </div>
            )}
          </div>

          {/* Close on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
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
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-[#151C2C]'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'}`} />
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
        <div className="p-3 border-t border-[#1F293D] flex flex-col gap-2">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[#151C2C]/60 border border-gray-800/80">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-100 truncate">{user.full_name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={logout}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors w-full ${
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
              className="hidden md:flex p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#151C2C] transition-colors shrink-0"
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
        <header className="h-16 px-4 md:px-8 border-b border-[#1F293D] bg-[#111827]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#151C2C]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-100">
                {currentPage ? currentPage.name : 'SpendWise'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              type="button"
              onClick={() => navigate('/spending-alerts')}
              className="relative p-2.5 rounded-xl bg-[#151C2C] border border-[#1F293D] text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
              title="Spending Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[#151C2C] border border-[#1F293D] text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* User Avatar */}
            {user && (
              <div
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#151C2C] border border-[#1F293D] hover:border-gray-700 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.full_name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium text-gray-200 hidden sm:inline max-w-[120px] truncate">
                  {user.full_name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

