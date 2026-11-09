import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { transactionService } from '../services/transactions';
import { categoryService } from '../services/categories';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/SkeletonLoader';

import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowDownRight,
  Info,
  ExternalLink,
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
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length === 0) {
      return { anomalies: [], stats: { mean: 0, stdDev: 0, thresholdAmount: 0 } };
    }

    const amounts = expenses.map((e) => parseFloat(e.amount) || 0);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Variance & Standard Deviation
    const variance =
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    // Multiplier based on sensitivity
    const zMultiplier = sensitivity === 'strict' ? 1.4 : sensitivity === 'relaxed' ? 2.5 : 1.9;
    const thresholdAmount = mean + zMultiplier * (stdDev || mean * 0.5);

    // Find anomalies
    const flagged = expenses
      .filter((t) => (parseFloat(t.amount) || 0) >= thresholdAmount)
      .map((t) => {
        const amt = parseFloat(t.amount);
        const ratio = mean > 0 ? (amt / mean).toFixed(1) : 1;
        let reason = `Amount is ${ratio}x higher than average expense (৳ ${mean.toFixed(0)})`;
        let recommendation = 'Review receipt and evaluate if this is a recurring charge or one-off outlier.';

        if (ratio >= 3.0) {
          reason = `Significant financial outflow (${ratio}x higher than standard transaction size)`;
          recommendation = 'Adjust category budget limits to prevent early month budget exhaustion.';
        }

        return {
          ...t,
          ratio,
          reason,
          recommendation,
        };
      })
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

    return {
      anomalies: flagged,
      stats: { mean, stdDev, thresholdAmount },
    };
  }, [transactions, sensitivity]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
            Unusual Spending Detection
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Statistical & anomaly detection algorithm identifying sudden spikes and irregular transaction patterns.
          </p>
        </div>

        {/* Sensitivity Selector */}
        <div className="flex items-center gap-2 bg-[#151C2C] p-1.5 rounded-xl border border-[#1F293D] text-xs">
          <Sliders className="w-4 h-4 text-gray-400 ml-1" />
          <span className="text-gray-400 font-medium">Detection Sensitivity:</span>
          <select
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value)}
            className="rounded-lg bg-[#111827] text-gray-200 text-xs px-2.5 py-1 border border-gray-700 outline-none font-semibold focus:ring-1 focus:ring-indigo-500"
          >
            <option value="strict">Strict (1.4σ)</option>
            <option value="standard">Standard (1.9σ)</option>
            <option value="relaxed">Relaxed (2.5σ)</option>
          </select>
        </div>
      </div>

      {/* Baseline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Average Expense Size
          </span>
          <p className="text-2xl font-bold text-gray-100 mt-1">{formatCurrency(stats.mean)}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Baseline transaction mean</span>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Anomaly Threshold
          </span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(stats.thresholdAmount)}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Expenses above this value are flagged
          </span>
        </div>

        <div className="bg-[#151C2C] border border-rose-500/20 rounded-xl p-4">
          <span className="text-xs text-rose-400 uppercase tracking-wider font-semibold">
            Flagged Anomalies
          </span>
          <p className="text-2xl font-bold text-white mt-1">{anomalies.length} Transactions</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
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
          <div className="space-y-4">
            {anomalies.map((tx) => {
              const catName = categoryMap[tx.category_id] || 'General Expense';

              return (
                <div
                  key={tx.id}
                  className="p-5 rounded-2xl bg-[#111827] border border-rose-500/30 hover:border-rose-500/50 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-100">{tx.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                            {catName}
                          </span>
                          <span>•</span>
                          <span>{formatDate(tx.transaction_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-extrabold text-rose-400">
                        {formatCurrency(tx.amount)}
                      </p>
                      <Badge variant="danger" size="sm">
                        {tx.ratio}x Baseline
                      </Badge>
                    </div>
                  </div>

                  {/* Flag Reason & Recommendation */}
                  <div className="pt-3 border-t border-gray-800 text-xs space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-300 shrink-0">Trigger Reason:</span>
                      <span className="text-rose-300">{tx.reason}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-300 shrink-0">Recommendation:</span>
                      <span className="text-gray-400">{tx.recommendation}</span>
                    </div>
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

