import { useState, useEffect, useCallback, useMemo } from 'react';
import { spendingAlertService } from '../services/spendingAlerts';
import { formatDate } from '../utils/formatters';
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
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            Spending Alerts & Notifications
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Automated alerts triggered when category spending reaches 80% or exceeds 100% of defined budgets.
          </p>
        </div>

        {alerts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[var(--bg-card)] border border-rose-500/25 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">Critical Danger (100%+)</span>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{dangerCount} alerts</p>
            <span className="text-[11px] text-[var(--text-muted)]">Budget limits fully exceeded</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-amber-500/25 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold">Warnings (80% - 99%)</span>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{warningCount} alerts</p>
            <span className="text-[11px] text-[var(--text-muted)]">Approaching threshold limit</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-indigo-500/25 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">Informational Notices</span>
            <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{infoCount} alerts</p>
            <span className="text-[11px] text-[var(--text-muted)]">System updates and guidance</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Alert Stream */}
      <Card>
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              severityFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('danger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              severityFilter === 'danger'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            Danger ({dangerCount})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              severityFilter === 'warning'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            Warning ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              severityFilter === 'info'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
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

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isDanger
                      ? 'bg-rose-500/5 border-rose-500/25 hover:border-rose-500/40'
                      : isWarning
                      ? 'bg-amber-500/5 border-amber-500/25 hover:border-amber-500/40'
                      : 'bg-indigo-500/5 border-indigo-500/25 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isDanger
                          ? 'bg-rose-500/15 text-rose-500'
                          : isWarning
                          ? 'bg-amber-500/15 text-amber-500'
                          : 'bg-indigo-500/15 text-indigo-500'
                      }`}
                    >
                      {isDanger ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={alert.severity}>{alert.severity}</Badge>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {formatDate(alert.created_at)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] mt-1.5 leading-snug">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      isLoading={deletingId === alert.id}
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
