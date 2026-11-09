import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';

import {
  Settings as SettingsIcon,
  User,
  Mail,
  Sun,
  Moon,
  Server,
  Shield,
  Coins,
  LogOut,
  CheckCircle2,
  AlertCircle,
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
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-gray-800/60">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          Platform & Account Settings
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your personal profile, display theme, currency standards, and connectivity.
        </p>
      </div>

      {/* User Profile Card */}
      <Card title="User Profile Information" subtitle="Your credentials on SpendWise">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-indigo-600/30 shrink-0">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="space-y-4 flex-1 w-full text-center sm:text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#111827] border border-gray-800">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block">
                  Full Name
                </span>
                <p className="text-sm font-bold text-gray-100 mt-1">{user?.full_name || 'N/A'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111827] border border-gray-800">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block">
                  Registered Email
                </span>
                <p className="text-sm font-bold text-gray-100 mt-1">{user?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
              <span>Account ID: #{user?.id || '—'}</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Authenticated via JWT
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* System Preferences */}
      <Card title="Display & Regional Localization" subtitle="Interface customization and currency">
        <div className="divide-y divide-gray-800/80 text-xs">
          {/* Theme Mode Toggle */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-100">Interface Color Theme</p>
              <p className="text-gray-400">
                Current mode: <span className="capitalize font-bold text-indigo-400">{theme}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111827] border border-gray-700 text-gray-200 hover:text-white transition-all cursor-pointer font-medium"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Switch to Dark</span>
                </>
              )}
            </button>
          </div>

          {/* Default Currency Display */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-100">Default Currency</p>
              <p className="text-gray-400">Target regional financial denomination</p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
              <Coins className="w-4 h-4 text-indigo-400" />
              <span>Bangladeshi Taka (৳ BDT)</span>
            </div>
          </div>

          {/* API Server Status */}
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-100">FastAPI Backend Status</p>
              <p className="text-gray-400">Connected to {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</p>
            </div>
            <div className="flex items-center gap-2">
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
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400 max-w-md">
            Terminating your session will clear cached bearer tokens and require you to sign in again.
          </p>
          <Button variant="danger" size="sm" icon={LogOut} onClick={logout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};

