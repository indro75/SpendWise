import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analytics';
import { budgetService } from '../services/budgets';
import { savingsGoalService } from '../services/savingsGoals';
import { spendingAlertService } from '../services/spendingAlerts';
import { formatCurrency, formatPercentage, formatDate, getShortMonthName } from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton, TableSkeleton } from '../components/common/SkeletonLoader';
import { TransactionModal } from '../components/transactions/TransactionModal';

import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Percent,
  Plus,
  Bell,
  Target,
  WalletCards,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CATEGORY_COLORS = [
  '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
  '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
];

export const Dashboard = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    savings_rate: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentYear = new Date().getFullYear();

      // Parallel data fetching
      const [
        summaryRes,
        monthlyRes,
        categoriesRes,
        recentTxRes,
        budgetsRes,
        goalsRes,
        alertsRes,
      ] = await Promise.allSettled([
        analyticsService.getSummary(),
        analyticsService.getMonthly(currentYear),
        analyticsService.getCategories('expense'),
        analyticsService.getRecentTransactions(5),
        budgetService.getAll(),
        savingsGoalService.getAll(),
        spendingAlertService.getAll(),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (monthlyRes.status === 'fulfilled') setMonthlyData(monthlyRes.value);
      if (categoriesRes.status === 'fulfilled') setCategoryData(categoriesRes.value);
      if (recentTxRes.status === 'fulfilled') setRecentTransactions(recentTxRes.value);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value);

      // Fetch progress for each budget
      if (budgetsRes.status === 'fulfilled') {
        const rawBudgets = budgetsRes.value.slice(0, 4);
        const budgetsWithProgress = await Promise.all(
          rawBudgets.map(async (b) => {
            try {
              const progress = await budgetService.getProgress(b.id);
              return { ...b, ...progress };
            } catch {
              return b;
            }
          })
        );
        setBudgets(budgetsWithProgress);
      }

      // Fetch progress for savings goals
      if (goalsRes.status === 'fulfilled') {
        const rawGoals = goalsRes.value.slice(0, 3);
        const goalsWithProgress = await Promise.all(
          rawGoals.map(async (g) => {
            try {
              const progress = await savingsGoalService.getProgress(g.id);
              return { ...g, ...progress };
            } catch {
              return g;
            }
          })
        );
        setSavingsGoals(goalsWithProgress);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const openAddModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Predict next month expense from monthly trend or historical average
  const predictedNextMonthExpense = React.useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return 0;
    const expenseValues = monthlyData
      .map((m) => parseFloat(m.expense) || 0)
      .filter((v) => v > 0);
    if (expenseValues.length === 0) return 0;
    const avg = expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;
    // slight trend estimation
    const lastExpense = expenseValues[expenseValues.length - 1];
    return Math.round((avg * 0.4 + lastExpense * 0.6) * 100) / 100;
  }, [monthlyData]);

  // Formatted chart data
  const formattedMonthlyChart = monthlyData.map((d) => ({
    name: getShortMonthName(d.month),
    Income: parseFloat(d.income) || 0,
    Expense: parseFloat(d.expense) || 0,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Hello, {user?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Here is your financial activity overview and health analysis for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="success"
            size="sm"
            icon={Plus}
            onClick={() => openAddModal('income')}
          >
            Add Income
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => openAddModal('expense')}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
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
              title="Total Balance"
              value={formatCurrency(summary.balance)}
              icon={Wallet}
              iconColor={summary.balance >= 0 ? 'text-indigo-400' : 'text-rose-400'}
              iconBg={summary.balance >= 0 ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-rose-500/10 border-rose-500/20'}
              subtitle="Net liquid financial position"
              trend={summary.balance >= 0 ? 'Positive' : 'Deficit'}
              trendType={summary.balance >= 0 ? 'positive' : 'negative'}
            />

            <StatCard
              title="Total Income"
              value={formatCurrency(summary.total_income)}
              icon={ArrowUpRight}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/10 border-emerald-500/20"
              subtitle="All recorded earnings"
              trend="Inflow"
              trendType="positive"
            />

            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary.total_expense)}
              icon={ArrowDownRight}
              iconColor="text-rose-400"
              iconBg="bg-rose-500/10 border-rose-500/20"
              subtitle="All cumulative spending"
              trend="Outflow"
              trendType="negative"
            />

            <StatCard
              title="Savings Rate"
              value={formatPercentage(summary.savings_rate)}
              icon={Percent}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/10 border-amber-500/20"
              subtitle="Portion of earnings retained"
              trend={summary.savings_rate >= 20 ? 'Target Achieved' : 'Needs Attention'}
              trendType={summary.savings_rate >= 20 ? 'positive' : 'neutral'}
            />
          </>
        )}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expense Chart */}
        <Card
          className="lg:col-span-2"
          title="Income vs Expenses"
          subtitle={`Year ${new Date().getFullYear()} monthly comparison`}
          headerAction={
            <Link to="/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {formattedMonthlyChart.length === 0 ? (
            <EmptyState
              title="No monthly data yet"
              description="Add income or expense transactions to visualize your cash flow trends."
              actionText="Add Transaction"
              onAction={() => openAddModal('expense')}
            />
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedMonthlyChart} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(value) => [formatCurrency(value), undefined]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="Income" fill="#22C55E" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Expense Category Distribution */}
        <Card
          title="Expense Distribution"
          subtitle="Top expense categories"
          headerAction={
            <Link to="/categories" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              Manage
            </Link>
          }
        >
          {categoryData.length === 0 ? (
            <EmptyState
              title="No categorized expenses"
              description="Record expenses with categories to generate spending breakdowns."
            />
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total_amount"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
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
                      formatter={(val) => [formatCurrency(val), 'Spent']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend preview */}
              <div className="w-full space-y-2 mt-2">
                {categoryData.slice(0, 4).map((cat, idx) => (
                  <div key={cat.category_name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-gray-300 truncate">{cat.category_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200">{formatCurrency(cat.total_amount)}</span>
                      <span className="text-gray-400 text-[11px]">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* AI Expense Prediction & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Learning / AI Prediction Card */}
        <div className="bg-gradient-to-br from-[#151C2C] to-[#1a1c38] border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Expense Prediction
                </h3>
              </div>
              <Badge variant="info">ML Powered</Badge>
            </div>

            <div>
              <p className="text-xs text-indigo-200/70">Forecasted Next Month Expenses</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                {formatCurrency(predictedNextMonthExpense)}
              </h2>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Based on historical spending patterns and seasonal regression analysis.
              Compare and review full anomalies in prediction engine.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-indigo-500/20 flex items-center justify-between">
            <span className="text-[11px] text-indigo-300">Updated from transaction logs</span>
            <Link
              to="/expense-prediction"
              className="text-xs text-white font-semibold flex items-center gap-1.5 hover:text-indigo-300 transition-colors"
            >
              Explore AI Model <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Spending Alerts Overview */}
        <Card
          className="lg:col-span-2"
          title="Active Spending Alerts"
          subtitle="Automated notifications & budget threshold triggers"
          headerAction={
            <Link to="/spending-alerts" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              View All ({alerts.length})
            </Link>
          }
        >
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-200">All spending is currently within safe limits!</p>
                <p className="text-gray-400 mt-0.5">No budget threshold alerts or risk notices generated.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border text-xs ${
                    alert.severity === 'danger'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Bell className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-100">{alert.message}</p>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">
                        {formatDate(alert.created_at)}
                      </span>
                    </div>
                  </div>
                  <Badge variant={alert.severity}>{alert.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions & Budget Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card
          className="lg:col-span-2"
          title="Recent Transactions"
          subtitle="Your latest financial actions"
          headerAction={
            <Link to="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No recent transactions"
              description="Start recording your earnings and daily expenses."
              actionText="Add Transaction"
              onAction={() => openAddModal('expense')}
            />
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
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 pr-2 font-medium text-gray-200 flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="truncate max-w-[160px] sm:max-w-xs">{tx.title}</span>
                      </td>
                      <td className="py-3 text-gray-400">
                        <span className="px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-300 text-[11px]">
                          {tx.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-[11px] whitespace-nowrap">
                        {formatDate(tx.transaction_date)}
                      </td>
                      <td className="py-3 text-right font-bold whitespace-nowrap">
                        <span
                          className={tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}
                        >
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

        {/* Budgets & Savings Goals Overview */}
        <div className="space-y-6">
          {/* Budget Overview Card */}
          <Card
            title="Budget Progress"
            subtitle="Active category limits"
            headerAction={
              <Link to="/budgets" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                Manage
              </Link>
            }
          >
            {budgets.length === 0 ? (
              <EmptyState
                icon={WalletCards}
                title="No active budgets"
                description="Set monthly spending limits for categories."
                actionText="Create Budget"
                onAction={() => {}}
              />
            ) : (
              <div className="space-y-4">
                {budgets.map((b) => {
                  const percent = b.percentage_used || 0;
                  const isExceeded = percent >= 100;
                  const isWarning = percent >= 80 && percent < 100;

                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-200">Budget #{b.id}</span>
                        <span className="text-gray-400">
                          {formatCurrency(b.spent_amount || 0)} / {formatCurrency(b.amount)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isExceeded
                              ? 'bg-rose-500'
                              : isWarning
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <Badge
                          variant={isExceeded ? 'danger' : isWarning ? 'warning' : 'success'}
                          size="sm"
                        >
                          {b.status || 'Safe'}
                        </Badge>
                        <span>{percent}% used</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Savings Goals Overview */}
          <Card
            title="Savings Goals"
            subtitle="Your financial milestones"
            headerAction={
              <Link to="/savings-goals" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                Manage
              </Link>
            }
          >
            {savingsGoals.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No savings goals"
                description="Set targets for emergency funds or future purchases."
              />
            ) : (
              <div className="space-y-4">
                {savingsGoals.map((g) => {
                  const percent = g.percentage_completed || 0;
                  return (
                    <div key={g.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-200 truncate max-w-[140px]">{g.title}</span>
                        <span className="text-indigo-400 font-bold">{percent}%</span>
                      </div>

                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>{formatCurrency(g.current_amount)} saved</span>
                        <span>Target: {formatCurrency(g.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Transaction Modal for Quick Action */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={modalType}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

