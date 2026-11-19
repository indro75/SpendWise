import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Coins,
  LogOut,
  CheckCircle2,
} from 'lucide-react';

export const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [apiHealth, setApiHealth] = useState('checking'); // 'healthy' | 'error' | 'checking'

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.status === 'healthy') {
          setApiHealth('healthy');
        } else {
          setApiHealth('error');
        }
      } catch {
        setApiHealth('error');
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-[var(--border-subtle)]">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
          Platform & Account Settings
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Manage your personal profile, display theme, currency standards, and connectivity.
        </p>
      </div>

      {/* User Profile Card */}
      <Card title="User Profile Information" subtitle="Your credentials on SpendWise">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pt-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-lg shadow-indigo-600/30 shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="space-y-4 flex-1 w-full text-center sm:text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#111827] border border-[var(--border-subtle)]">
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
                  Full Name
                </span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{user?.full_name || 'N/A'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#111827] border border-[var(--border-subtle)]">
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
                  Registered Email
                </span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{user?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[var(--text-muted)]">
              <span>Account ID: #{user?.id || '—'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Authenticated via JWT
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* System Preferences */}
      <Card title="Display & Regional Localization" subtitle="Interface customization and currency">
        <div className="divide-y divide-[var(--border-subtle)] text-xs">
          {/* Theme Mode Toggle */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Interface Color Theme</p>
              <p className="text-[var(--text-muted)]">
                Current mode: <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">{theme} Mode</span>
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#111827] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-indigo-500 transition-all cursor-pointer font-semibold shadow-sm w-full sm:w-auto"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Default Currency Display */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Default Currency</p>
              <p className="text-[var(--text-muted)]">Target regional financial denomination</p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold self-start sm:self-auto">
              <Coins className="w-4 h-4 text-indigo-500" />
              <span>Bangladeshi Taka (৳ BDT)</span>
            </div>
          </div>

          {/* API Server Status */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">FastAPI Backend Status</p>
              <p className="text-[var(--text-muted)]">Connected to {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {apiHealth === 'healthy' ? (
                <Badge variant="success">Online & Healthy</Badge>
              ) : apiHealth === 'error' ? (
                <Badge variant="danger">Connection Issue</Badge>
              ) : (
                <Badge variant="info">Checking...</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Account Session Logout */}
      <Card title="Session Management" subtitle="Sign out of current active session">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <p className="text-xs text-[var(--text-muted)] max-w-md">
            Terminating your session will clear cached bearer tokens and require you to sign in again.
          </p>
          <Button variant="danger" size="sm" icon={LogOut} onClick={logout} className="w-full sm:w-auto">
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
