import { useState, useEffect, useMemo, useCallback } from 'react';
import { transactionService } from '../services/transactions';
import { categoryService } from '../services/categories';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/SkeletonLoader';

import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';

export const UnusualSpending = () => {
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sensitivity, setSensitivity] = useState('standard'); // 'relaxed' (2.5x) | 'standard' (2.0x) | 'strict' (1.5x)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [txs, cats] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll(),
      ]);
      setTransactions(txs);
      setCategories(cats);
    } catch {
      showToast('Failed to load transaction logs', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  // Anomaly Detection Algorithm on actual user expense records
  const { anomalies, stats } = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .map((t) => ({ ...t, numAmount: parseFloat(t.amount) || 0 }));

    if (expenses.length < 2) {
      return {
        anomalies: [],
        stats: { mean: 0, stdDev: 0, thresholdAmount: 0 },
      };
    }

    const sum = expenses.reduce((acc, t) => acc + t.numAmount, 0);
    const mean = sum / expenses.length;

    const variance =
      expenses.reduce((acc, t) => acc + Math.pow(t.numAmount - mean, 2), 0) /
      expenses.length;
    const stdDev = Math.sqrt(variance);

    // Dynamic multiplier based on user preference
    const multiplier = sensitivity === 'strict' ? 1.4 : sensitivity === 'relaxed' ? 2.5 : 1.9;
    const thresholdAmount = mean + multiplier * stdDev;

    // Filter outliers
    const detected = expenses
      .filter((t) => t.numAmount > thresholdAmount && t.numAmount > 0)
      .map((t) => ({
        ...t,
        deviation: t.numAmount - mean,
        ratio: (t.numAmount / (mean || 1)).toFixed(1),
      }))
      .sort((a, b) => b.numAmount - a.numAmount);

    return {
      anomalies: detected,
      stats: { mean, stdDev, thresholdAmount },
    };
  }, [transactions, sensitivity]);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
            Unusual Spending & Anomaly Detection
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Statistical deviation engine highlighting transactions exceeding baseline spending patterns.
          </p>
        </div>

        {/* Sensitivity Selector */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs text-[var(--text-muted)] font-medium">Detection Rigor:</span>
          <select
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value)}
            className="rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-semibold px-3 py-1.5 border border-[var(--border-subtle)] outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="strict">Strict (1.4σ)</option>
            <option value="standard">Standard (1.9σ)</option>
            <option value="relaxed">Relaxed (2.5σ)</option>
          </select>
        </div>
      </div>

      {/* Baseline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Average Expense Size
          </span>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">{formatCurrency(stats.mean)}</p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Baseline transaction mean</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
            Anomaly Threshold
          </span>
          <p className="text-xl sm:text-2xl font-bold text-amber-500 mt-1">{formatCurrency(stats.thresholdAmount)}</p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Expenses above this value are flagged
          </span>
        </div>

        <div className="bg-[var(--bg-card)] border border-rose-500/25 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">
            Flagged Outliers
          </span>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">{anomalies.length} Transactions</p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {anomalies.length > 0 ? 'Outliers requiring audit' : 'No unusual transactions detected'}
          </span>
        </div>
      </div>

      {/* Flagged Anomalies Card */}
      <Card
        title="Detected Spending Anomalies"
        subtitle="Transactions displaying statistical deviation from baseline behavior"
      >
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : anomalies.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Zero anomalous activity"
            description="All recorded expenses align smoothly within expected statistical deviations."
          />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {anomalies.map((tx) => {
              const catName = categoryMap[tx.category_id] || 'General Expense';

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-[#111827] border border-rose-500/30 hover:border-rose-500/50 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[var(--text-primary)]">{tx.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[var(--text-primary)] font-medium text-[11px]">
                            {catName}
                          </span>
                          <span>•</span>
                          <span>{formatDate(tx.transaction_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right flex items-center sm:block justify-between pt-1 sm:pt-0">
                      <p className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCurrency(tx.amount)}
                      </p>
                      <Badge variant="danger" size="sm" className="sm:mt-1">
                        {tx.ratio}x Baseline
                      </Badge>
                    </div>
                  </div>

                  {/* Flag Reason & Recommendation */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] text-xs space-y-1.5">
                    <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        This outflow deviates by{' '}
                        <strong className="text-[var(--text-primary)]">
                          +{formatCurrency(tx.deviation)}
                        </strong>{' '}
                        above your calculated baseline mean ({formatCurrency(stats.mean)}).
                      </span>
                    </div>

                    {tx.description && (
                      <div className="flex items-start gap-2 text-[var(--text-muted)] text-[11px]">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Notes: {tx.description}</span>
                      </div>
                    )}
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
