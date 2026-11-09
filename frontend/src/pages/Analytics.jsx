import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '../services/analytics';
import { formatCurrency, formatPercentage, formatDate, getShortMonthName, getMonthName } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';

import {
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const CATEGORY_PALETTE = [
  '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
  '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
  '#A855F7', '#64748B'
];

export const Analytics = () => {
  const { showToast } = useToast();

  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [categoryType, setCategoryType] = useState('expense'); // 'expense' | 'income'

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    savings_rate: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [recentTx, setRecentTx] = useState([]);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sumRes, monRes, catRes, trendRes, txRes] = await Promise.allSettled([
        analyticsService.getSummary(),
        analyticsService.getMonthly(selectedYear),
        analyticsService.getCategories(categoryType),
        analyticsService.getExpenseTrends(selectedYear, selectedMonth),
        analyticsService.getRecentTransactions(8),
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (monRes.status === 'fulfilled') setMonthlyData(monRes.value);
      if (catRes.status === 'fulfilled') setCategoryData(catRes.value);
      if (trendRes.status === 'fulfilled') setDailyTrends(trendRes.value);
      if (txRes.status === 'fulfilled') setRecentTx(txRes.value);
    } catch {
      showToast('Failed to load financial analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, categoryType, showToast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Formatted data for monthly comparison
  const monthlyChartData = useMemo(() => {
    return monthlyData.map((d) => ({
      name: getShortMonthName(d.month),
      Income: parseFloat(d.income) || 0,
      Expense: parseFloat(d.expense) || 0,
      Net: (parseFloat(d.income) || 0) - (parseFloat(d.expense) || 0),
    }));
  }, [monthlyData]);

  // Formatted daily trends
  const dailyChartData = useMemo(() => {
    return dailyTrends.map((d) => ({
      day: d.date.split('-')[2],
      Expense: parseFloat(d.total_expense) || 0,
    }));
  }, [dailyTrends]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Financial Analytics
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Deep dive into your monthly cash flows, category spending, daily trends, and savings metrics.
          </p>
        </div>

        {/* Global Year Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Reporting Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="rounded-xl bg-[#151C2C] text-gray-200 text-xs px-3 py-1.5 border border-[#1F293D] outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Net Balance"
              value={formatCurrency(summary.balance)}
              icon={Wallet}
              iconColor={summary.balance >= 0 ? 'text-indigo-400' : 'text-rose-400'}
              iconBg={summary.balance >= 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-rose-500/10 border-rose-500/20'}
              subtitle="Cumulative balance retained"
              trend={summary.balance >= 0 ? 'Solvent' : 'Negative'}
              trendType={summary.balance >= 0 ? 'positive' : 'negative'}
            />

            <StatCard
              title="Total Income"
              value={formatCurrency(summary.total_income)}
              icon={ArrowUpRight}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/10 border-emerald-500/20"
              subtitle="Total gross receipts"
              trend="Inflow"
              trendType="positive"
            />

            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary.total_expense)}
              icon={ArrowDownRight}
              iconColor="text-rose-400"
              iconBg="bg-rose-500/10 border-rose-500/20"
              subtitle="Total disbursements"
              trend="Outflow"
              trendType="negative"
            />

            <StatCard
              title="Savings Rate"
              value={formatPercentage(summary.savings_rate)}
              icon={Percent}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/10 border-amber-500/20"
              subtitle="Saved / Gross Income"
              trend={summary.savings_rate >= 20 ? 'Optimal (>=20%)' : 'Sub-optimal'}
              trendType={summary.savings_rate >= 20 ? 'positive' : 'neutral'}
            />
          </>
        )}
      </div>

      {/* Monthly Cash Flow Comparison Chart */}
      <Card
        title={`Monthly Income vs Expense Cashflow (${selectedYear})`}
        subtitle="Month-by-month financial volume breakdown"
      >
        {monthlyChartData.length === 0 ? (
          <EmptyState
            title="No cashflow data"
            description={`No transactions found recorded in calendar year ${selectedYear}.`}
          />
        ) : (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
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
                <Bar dataKey="Income" fill="#22C55E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Category Breakdown & Daily Trend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card
          title="Category Distribution Breakdown"
          subtitle="Relative distribution by volume"
          headerAction={
            <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-gray-800 text-xs">
              <button
                type="button"
                onClick={() => setCategoryType('expense')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  categoryType === 'expense'
                    ? 'bg-rose-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Expenses
              </button>
              <button
                type="button"
                onClick={() => setCategoryType('income')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  categoryType === 'income'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Income
              </button>
            </div>
          }
        >
          {categoryData.length === 0 ? (
            <EmptyState
              icon={PieIcon}
              title={`No ${categoryType} categories`}
              description={`Add ${categoryType} transactions to populate categories.`}
            />
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
              <div className="h-64 w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total_amount"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cat-cell-${index}`}
                          fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151C2C',
                        borderColor: '#1F293D',
                        borderRadius: '12px',
                        color: '#F9FAFB',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [formatCurrency(val), 'Volume']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full sm:w-1/2 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {categoryData.map((cat, idx) => (
                  <div key={cat.category_name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] }}
                      />
                      <span className="text-gray-200 truncate">{cat.category_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-gray-100">{formatCurrency(cat.total_amount)}</span>
                      <span className="text-gray-400 text-[11px]">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Daily Expense Trends for Selected Month */}
        <Card
          title="Daily Expense Trends"
          subtitle="Expense distribution across days of the month"
          headerAction={
            <div className="flex items-center gap-1.5">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="rounded-lg bg-[#111827] text-gray-200 text-xs px-2.5 py-1 border border-gray-700 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          {dailyChartData.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No daily spending"
              description={`No daily expenses recorded for ${getMonthName(selectedMonth)} ${selectedYear}.`}
            />
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151C2C',
                      borderColor: '#1F293D',
                      borderRadius: '12px',
                      color: '#F9FAFB',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [formatCurrency(val), 'Expense']}
                  />
                  <Area
                    type="monotone"
                    dataKey="Expense"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity Ledger */}
      <Card title="Recent Financial Activity Ledger" subtitle="Latest audited transaction items">
        {recentTx.length === 0 ? (
          <EmptyState title="No transactions recorded" description="No activities found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {recentTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="py-3 font-semibold text-gray-100 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tx.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      {tx.title}
                    </td>
                    <td className="py-3 text-gray-400">{tx.category_name || 'Uncategorized'}</td>
                    <td className="py-3 text-gray-400">{formatDate(tx.transaction_date)}</td>
                    <td className="py-3 text-right font-bold">
                      <span className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

