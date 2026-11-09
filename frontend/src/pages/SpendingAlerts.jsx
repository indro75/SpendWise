import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { spendingAlertService } from '../services/spendingAlerts';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/SkeletonLoader';

import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SpendingAlerts = () => {
  const { showToast } = useToast();

  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'danger' | 'warning' | 'info'
  const [deletingId, setDeletingId] = useState(null);

  const loadAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await spendingAlertService.getAll();
      setAlerts(data);
    } catch {
      showToast('Failed to load spending alerts', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleDeleteAlert = async (id) => {
    try {
      setDeletingId(id);
      await spendingAlertService.delete(id);
      showToast('Alert dismissed', 'success');
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      showToast('Failed to dismiss alert', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAlerts = useMemo(() => {
    if (severityFilter === 'all') return alerts;
    return alerts.filter((a) => a.severity === severityFilter);
  }, [alerts, severityFilter]);

  const dangerCount = alerts.filter((a) => a.severity === 'danger').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            Spending Alerts & Notifications
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Automated alerts triggered when category spending reaches 80% or exceeds 100% of defined budgets.
          </p>
        </div>

        {alerts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              for (const a of alerts) {
                await spendingAlertService.delete(a.id).catch(() => {});
              }
              showToast('All alerts cleared', 'success');
              loadAlerts();
            }}
          >
            Clear All Alerts
          </Button>
        )}
      </div>

      {/* Severity Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151C2C] border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-400 uppercase tracking-wider font-semibold">Critical Danger (100%+)</span>
            <p className="text-2xl font-extrabold text-white mt-1">{dangerCount} alerts</p>
            <span className="text-[11px] text-gray-400">Budget limits fully exceeded</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#151C2C] border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Warnings (80% - 99%)</span>
            <p className="text-2xl font-extrabold text-white mt-1">{warningCount} alerts</p>
            <span className="text-[11px] text-gray-400">Approaching threshold limit</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#151C2C] border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">Informational Notices</span>
            <p className="text-2xl font-extrabold text-white mt-1">{infoCount} alerts</p>
            <span className="text-[11px] text-gray-400">System updates and guidance</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Alert Stream */}
      <Card>
        {/* Severity Tabs */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
          <button
            type="button"
            onClick={() => setSeverityFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              severityFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('danger')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              severityFilter === 'danger'
                ? 'bg-rose-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Danger ({dangerCount})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('warning')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              severityFilter === 'warning'
                ? 'bg-amber-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Warning ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('info')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              severityFilter === 'info'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Info ({infoCount})
          </button>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : filteredAlerts.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No spending alerts"
            description="Your expenses are well within all designated budget guidelines."
          />
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const isDanger = alert.severity === 'danger';
              const isWarning = alert.severity === 'warning';

              let borderClass = 'border-indigo-500/30 bg-indigo-500/5';
              let icon = <Info className="w-5 h-5 text-indigo-400 shrink-0" />;

              if (isDanger) {
                borderClass = 'border-rose-500/30 bg-rose-500/10';
                icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
              } else if (isWarning) {
                borderClass = 'border-amber-500/30 bg-amber-500/10';
                icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
              }

              return (
                <div
                  key={alert.id}
                  className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${borderClass} transition-all duration-200 hover:shadow-lg`}
                >
                  <div className="flex items-start gap-3">
                    {icon}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.severity}>{alert.severity}</Badge>
                        {alert.amount && (
                          <span className="text-xs font-bold text-gray-200">
                            Triggered Amount: {formatCurrency(alert.amount)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-100">{alert.message}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{formatDate(alert.created_at, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAlert(alert.id)}
                    disabled={deletingId === alert.id}
                    className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

