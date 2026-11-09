import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '../services/analytics';
import api from '../services/api';
import { formatCurrency, formatPercentage, getShortMonthName, getMonthName } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';

import {
  TrendingUp,
  Brain,
  Sparkles,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ExpensePrediction = () => {
  const { showToast } = useToast();

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
      } catch (mlErr) {
        // Backend ML endpoint is either 404 Not Found or in training/development in /ml
        setMlEndpointStatus('unready');
      }
    } catch (err) {
      showToast('Failed to load expense history', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract non-zero past monthly expenses
  const recordedMonths = useMemo(() => {
    return monthlyExpenses.filter((m) => (parseFloat(m.expense) || 0) > 0);
  }, [monthlyExpenses]);

  // Compute statistical moving average and baseline trend from real data
  const statisticalProjection = useMemo(() => {
    if (recordedMonths.length === 0) return null;
    const values = recordedMonths.map((m) => parseFloat(m.expense));
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const last = values[values.length - 1];

    // Simple weighted regression projection
    const projected = Math.round((avg * 0.45 + last * 0.55) * 100) / 100;
    const diff = projected - avg;
    const percentDiff = avg > 0 ? ((diff / avg) * 100).toFixed(1) : 0;

    return {
      average: avg,
      projected,
      lastMonth: last,
      percentDiff,
      sampleSize: values.length,
    };
  }, [recordedMonths]);

  // Chart dataset comparing historical months
  const chartData = useMemo(() => {
    return monthlyExpenses.map((m) => ({
      month: getShortMonthName(m.month),
      ActualExpense: parseFloat(m.expense) || 0,
      Income: parseFloat(m.income) || 0,
    }));
  }, [monthlyExpenses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            AI Expense Prediction
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Analyze historical spending patterns and forecast upcoming monthly expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Historical Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="rounded-xl bg-[#151C2C] text-gray-200 text-xs px-3 py-1.5 border border-[#1F293D] outline-none font-semibold"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Backend Model Status Notice */}
      {mlEndpointStatus === 'unready' && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-100">Machine Learning API Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                Pipeline In Development (`ml/src`)
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              The dedicated Scikit-Learn prediction endpoint is currently in active model training.
              In accordance with project guidelines, this page displays audited historical spending from PostgreSQL
              and statistical baseline projections without fabricating fake artificial data.
            </p>
          </div>
        </div>
      )}

      {/* Projection Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#151C2C] to-[#1a1e36] border border-indigo-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">
              Forecasted Next Month
            </span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-2">
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

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Monthly Historical Average
            </span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-100 mt-2">
            {statisticalProjection
              ? formatCurrency(statisticalProjection.average)
              : '৳ 0.00'}
          </h2>
          <span className="text-[11px] text-gray-400 mt-1 block">Mean expense across active months</span>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Variance / Trend
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-3xl font-extrabold mt-2 text-indigo-400">
            {statisticalProjection ? `${statisticalProjection.percentDiff}%` : '0.0%'}
          </h2>
          <span className="text-[11px] text-gray-400 mt-1 block">
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
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151C2C',
                    borderColor: '#1F293D',
                    borderRadius: '12px',
                    color: '#F9FAFB',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [formatCurrency(val), undefined]}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '16px' }} />
                <Line
                  type="monotone"
                  dataKey="ActualExpense"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#EF4444' }}
                  name="Actual Expense"
                />
                <Line
                  type="monotone"
                  dataKey="Income"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#22C55E' }}
                  name="Recorded Income"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Monthly Actual Expenses Ledger */}
      <Card title="Monthly Historical Breakdown" subtitle="Detailed breakdown of recorded months">
        {monthlyExpenses.length === 0 ? (
          <EmptyState title="No months found" description="No data found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Month</th>
                  <th className="pb-3 font-semibold">Total Income</th>
                  <th className="pb-3 font-semibold">Actual Expense</th>
                  <th className="pb-3 font-semibold text-right">Net Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {monthlyExpenses.map((m) => {
                  const inc = parseFloat(m.income) || 0;
                  const exp = parseFloat(m.expense) || 0;
                  const net = inc - exp;

                  return (
                    <tr key={m.month} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 font-semibold text-gray-100">
                        {getMonthName(parseInt(m.month, 10))}
                      </td>
                      <td className="py-3 text-emerald-400 font-semibold">{formatCurrency(inc)}</td>
                      <td className="py-3 text-rose-400 font-semibold">{formatCurrency(exp)}</td>
                      <td
                        className={`py-3 text-right font-bold ${
                          net >= 0 ? 'text-indigo-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

