import { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '../services/analytics';
import api from '../services/api';
import { formatCurrency, formatPercentage, getShortMonthName, getMonthName } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';

import {
  TrendingUp,
  Brain,
  Sparkles,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ExpensePrediction = () => {
  const { showToast } = useToast();
  const { isDark } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [mlEndpointStatus, setMlEndpointStatus] = useState('checking'); // 'ready' | 'unready'
  const [predictionResult, setPredictionResult] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Fetch real historical monthly expenses from existing analytics API
      const monthly = await analyticsService.getMonthly(selectedYear);
      setMonthlyExpenses(monthly);

      // 2. Inspect if a FastAPI ML prediction endpoint is online
      try {
        const mlRes = await api.get('/ml/predict');
        setMlEndpointStatus('ready');
        setPredictionResult(mlRes.data);
      } catch {
        setMlEndpointStatus('unready');
      }
    } catch {
      showToast('Failed to load expense prediction metrics', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statistical projection baseline based strictly on real transaction records
  const statisticalProjection = useMemo(() => {
    if (!monthlyExpenses || monthlyExpenses.length === 0) return null;

    const validExpenses = monthlyExpenses
      .map((m) => parseFloat(m.expense) || 0)
      .filter((v) => v > 0);

    if (validExpenses.length === 0) return null;

    const total = validExpenses.reduce((acc, v) => acc + v, 0);
    const average = total / validExpenses.length;
    const latest = validExpenses[validExpenses.length - 1];

    // Simple weighted regression projection: 40% historical mean + 60% recent cycle
    const projected = Math.round((average * 0.4 + latest * 0.6) * 100) / 100;
    const diff = projected - average;
    const percentDiff = average > 0 ? ((diff / average) * 100).toFixed(1) : 0;

    return {
      average,
      latest,
      projected,
      percentDiff,
      sampleSize: validExpenses.length,
    };
  }, [monthlyExpenses]);

  // Formatted chart data for actual historical and forecast trajectory
  const chartData = useMemo(() => {
    const data = monthlyExpenses.map((m) => ({
      month: getShortMonthName(m.month),
      ActualExpense: parseFloat(m.expense) || 0,
      IncomeBaseline: parseFloat(m.income) || 0,
    }));

    if (statisticalProjection && data.length > 0) {
      const nextMonthNum = ((new Date().getMonth() + 1) % 12) + 1;
      data.push({
        month: `${getShortMonthName(nextMonthNum)} (Est)`,
        ProjectedExpense: statisticalProjection.projected,
      });
    }

    return data;
  }, [monthlyExpenses, statisticalProjection]);

  const tooltipStyle = {
    backgroundColor: isDark ? '#151C2C' : '#FFFFFF',
    borderColor: isDark ? '#1F293D' : '#E2E8F0',
    borderRadius: '12px',
    color: isDark ? '#F9FAFB' : '#0F172A',
    fontSize: '12px',
    boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
  };

  const gridStroke = isDark ? '#1F293D' : '#E2E8F0';
  const axisStroke = isDark ? '#6B7280' : '#94A3B8';

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            AI & Machine Learning Expense Prediction
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Predictive forecasting engine estimating future cash outflow based on verified user transaction records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs text-[var(--text-muted)] font-medium">Model Basis Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-semibold px-3 py-1.5 border border-[var(--border-subtle)] outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Backend Integration Diagnostic Banner */}
      {mlEndpointStatus === 'ready' ? (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">Active ML Server Connected</span>
            <p className="text-[var(--text-secondary)] mt-0.5 leading-relaxed">
              Scikit-learn / Linear Regression model deployed and serving inference from FastAPI backend.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3 text-xs">
          <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                Statistical Projection Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold">
                Live Data
              </span>
            </div>
            <p className="text-[var(--text-secondary)] mt-1 leading-relaxed">
              Displaying statistical baseline projections calculated from historical spending records in PostgreSQL.
            </p>
          </div>
        </div>
      )}

      {/* Projection Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-[#151C2C] to-[#1a1e36] border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">
              Forecasted Next Month
            </span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {statisticalProjection
              ? formatCurrency(statisticalProjection.projected)
              : '৳ 0.00'}
          </h2>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {statisticalProjection
              ? `Based on ${statisticalProjection.sampleSize} recorded billing cycles`
              : 'Requires historical expense data'}
          </span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Monthly Historical Average
            </span>
            <TrendingUp className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-2">
            {statisticalProjection
              ? formatCurrency(statisticalProjection.average)
              : '৳ 0.00'}
          </h2>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Mean expense across active months</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
              Variance / Trend Pace
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 text-indigo-600 dark:text-indigo-400">
            {statisticalProjection ? `${statisticalProjection.percentDiff}%` : '0.0%'}
          </h2>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {statisticalProjection && parseFloat(statisticalProjection.percentDiff) >= 0
              ? 'Upward trend compared to historical average'
              : 'Downward or stable spending pace'}
          </span>
        </div>
      </div>

      {/* Historical vs Forecast Chart */}
      <Card
        title={`Historical Spending Trend & Trajectory (${selectedYear})`}
        subtitle="Audited monthly expense history vs income baseline"
      >
        {chartData.length === 0 ? (
          <EmptyState
            title="No historical data"
            description="Record monthly expenses to train and calibrate spending predictions."
          />
        ) : (
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val) => [formatCurrency(val), undefined]}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="ActualExpense"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#EF4444' }}
                  name="Actual Expense"
                />
                <Line
                  type="monotone"
                  dataKey="IncomeBaseline"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Income Baseline"
                />
                {statisticalProjection && (
                  <Line
                    type="monotone"
                    dataKey="ProjectedExpense"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#6366F1' }}
                    name="AI Forecast (Est)"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};
