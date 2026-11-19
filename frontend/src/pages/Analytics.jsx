import { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '../services/analytics';
import { formatCurrency, formatPercentage, getShortMonthName, getMonthName } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';

import {
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  const { isDark } = useTheme();

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
  const [dailyData, setDailyData] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sumRes, monthRes, catRes, dailyRes] = await Promise.allSettled([
        analyticsService.getSummary(),
        analyticsService.getMonthly(selectedYear),
        analyticsService.getCategories(categoryType),
        analyticsService.getDaily(selectedYear, selectedMonth),
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (monthRes.status === 'fulfilled') setMonthlyData(monthRes.value);
      if (catRes.status === 'fulfilled') setCategoryData(catRes.value);
      if (dailyRes.status === 'fulfilled') setDailyData(dailyRes.value);
    } catch {
      showToast('Failed to load analytics datasets', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, categoryType, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Formatted Monthly Data
  const monthlyChartData = useMemo(() => {
    return monthlyData.map((d) => ({
      name: getShortMonthName(d.month),
      Income: parseFloat(d.income) || 0,
      Expense: parseFloat(d.expense) || 0,
    }));
  }, [monthlyData]);

  // Formatted Daily Data
  const dailyChartData = useMemo(() => {
    return dailyData.map((d) => ({
      day: d.day ? d.day.slice(-2) : '',
      Expense: parseFloat(d.total_amount) || 0,
    }));
  }, [dailyData]);

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
      {/* Header & Year Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            Financial Analytics & Trends
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Deep dive into multi-month income, expenditure distributions, and daily burn rates.
          </p>
        </div>

        {/* Global Year Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs text-[var(--text-muted)] font-medium">Reporting Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-xs font-semibold px-3 py-1.5 border border-[var(--border-subtle)] outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
              iconColor={summary.balance >= 0 ? 'text-indigo-500' : 'text-rose-500'}
              iconBg={summary.balance >= 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-rose-500/10 border-rose-500/20'}
              subtitle="Cumulative balance retained"
              trend={summary.balance >= 0 ? 'Solvent' : 'Negative'}
              trendType={summary.balance >= 0 ? 'positive' : 'negative'}
            />

            <StatCard
              title="Total Income"
              value={formatCurrency(summary.total_income)}
              icon={ArrowUpRight}
              iconColor="text-emerald-500"
              iconBg="bg-emerald-500/10 border-emerald-500/20"
              subtitle="Total gross receipts"
              trend="Inflow"
              trendType="positive"
            />

            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary.total_expense)}
              icon={ArrowDownRight}
              iconColor="text-rose-500"
              iconBg="bg-rose-500/10 border-rose-500/20"
              subtitle="Total disbursements"
              trend="Outflow"
              trendType="negative"
            />

            <StatCard
              title="Savings Rate"
              value={formatPercentage(summary.savings_rate)}
              icon={Percent}
              iconColor="text-amber-500"
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
          <div className="h-72 sm:h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val) => [formatCurrency(val), undefined]}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }} />
                <Bar dataKey="Income" fill="#22C55E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Category Breakdown & Daily Trend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Category Breakdown */}
        <Card
          title="Category Distribution Breakdown"
          subtitle="Relative distribution by volume"
          headerAction={
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#111827] p-1 rounded-lg border border-[var(--border-subtle)] text-xs">
              <button
                type="button"
                onClick={() => setCategoryType('expense')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  categoryType === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Expenses
              </button>
              <button
                type="button"
                onClick={() => setCategoryType('income')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  categoryType === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
              <div className="h-56 sm:h-64 w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total_amount"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
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
                      contentStyle={tooltipStyle}
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
                      <span className="text-[var(--text-secondary)] truncate">{cat.category_name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[var(--text-primary)]">{formatCurrency(cat.total_amount)}</span>
                      <span className="text-[var(--text-muted)] text-[11px]">({cat.percentage}%)</span>
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
                className="rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] text-xs px-2.5 py-1 border border-[var(--border-subtle)] outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
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
            <div className="h-60 sm:h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="day" stroke={axisStroke} fontSize={11} tickLine={false} />
                  <YAxis
                    stroke={axisStroke}
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
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
    </div>
  );
};
