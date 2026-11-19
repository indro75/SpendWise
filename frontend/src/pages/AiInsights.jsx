import { useState, useEffect, useMemo, useCallback } from 'react';
import { analyticsService } from '../services/analytics';
import { transactionService } from '../services/transactions';
import { budgetService } from '../services/budgets';
import { savingsGoalService } from '../services/savingsGoals';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';

import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export const AiInsights = () => {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);

  const loadInsightsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sumRes, catRes, txRes, budRes, goalRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getCategories('expense'),
        transactionService.getAll(),
        budgetService.getAll(),
        savingsGoalService.getAll(),
      ]);

      setSummary(sumRes);
      setCategories(catRes);
      setTransactions(txRes);
      setBudgets(budRes);
      setGoals(goalRes);
    } catch {
      showToast('Failed to load financial data for insights', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInsightsData();
  }, [loadInsightsData]);

  // Pure logic financial health computation without simulated numbers
  const insights = useMemo(() => {
    if (!summary) return null;

    const totalIncome = parseFloat(summary.total_income) || 0;
    const totalExpense = parseFloat(summary.total_expense) || 0;
    const balance = parseFloat(summary.balance) || 0;
    const savingsRate = parseFloat(summary.savings_rate) || 0;

    // Classical 50/30/20 benchmark allocation targets
    const needsTarget = totalIncome * 0.5;
    const wantsTarget = totalIncome * 0.3;
    const savingsTarget = totalIncome * 0.2;

    // Identify highest expense drivers
    const topCategories = categories.slice(0, 3);

    // Compute narrative health evaluation
    let narrativeHealth = 'Fair Financial Health';
    let narrativeAdvice = 'Your earnings balance is positive. Consider allocating more funds into recurring savings targets.';
    if (balance < 0) {
      narrativeHealth = 'Budget Deficit Notice';
      narrativeAdvice = 'Your outflows have surpassed liquid income. Review top categories to curtail non-essential discretionary expenses.';
    } else if (savingsRate >= 20) {
      narrativeHealth = 'Excellent Wealth Building';
      narrativeAdvice = 'You are saving 20% or more of all gross receipts. Continue funding savings milestones for long-term compounding.';
    }

    // Identify actionable savings opportunities
    const savingsOpportunities = [];
    if (topCategories.length > 0) {
      const highest = topCategories[0];
      if (highest.percentage > 30) {
        savingsOpportunities.push({
          title: `Concentrated spend in "${highest.category_name}" (${highest.percentage}%)`,
          detail: `Your highest expense line item represents nearly a third of all spending (${formatCurrency(highest.total_amount)}). Trimming this category by 10% would liberate ${formatCurrency(highest.total_amount * 0.1)} monthly.`,
          impact: 'High Impact',
        });
      }
    }

    if (budgets.length === 0) {
      savingsOpportunities.push({
        title: 'Zero Category Budget Limits Defined',
        detail: 'Setting defined monthly expenditure ceilings on high-frequency categories prevents impulsive lifestyle creep.',
        impact: 'Structural Guidance',
      });
    }

    if (goals.length === 0) {
      savingsOpportunities.push({
        title: 'No Active Savings Milestones Configured',
        detail: 'Users with documented emergency targets retain significantly more net income over a 12-month timeframe.',
        impact: 'Wealth Strategy',
      });
    }

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      needsTarget,
      wantsTarget,
      savingsTarget,
      topCategories,
      narrativeHealth,
      narrativeAdvice,
      savingsOpportunities,
    };
  }, [summary, categories, budgets, goals]);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            AI Financial Insights & Health Analysis
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Data-driven strategic recommendations, 50/30/20 allocation modeling, and cashflow optimization.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Sparkles}
          className="w-full sm:w-auto"
          onClick={loadInsightsData}
        >
          Refresh Insights
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !insights ? (
        <Card>
          <EmptyState
            icon={Lightbulb}
            title="Insufficient data for insights"
            description="Record transactions and categories to unlock automated financial assessments."
          />
        </Card>
      ) : (
        <>
          {/* Main Health Diagnostic Banner */}
          <div className="bg-gradient-to-br from-[#151C2C] to-[#1a1c38] border border-indigo-500/25 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1 border border-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> Core Financial Diagnosis
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Status: {insights.narrativeHealth}
                </h2>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Your current recorded earnings total{' '}
                  <span className="font-bold text-emerald-400">{formatCurrency(insights.totalIncome)}</span>{' '}
                  against{' '}
                  <span className="font-bold text-rose-400">{formatCurrency(insights.totalExpense)}</span>{' '}
                  in expenses, yielding an ongoing liquid surplus of{' '}
                  <span className="font-bold text-indigo-300">{formatCurrency(insights.balance)}</span>{' '}
                  and a savings rate of <span className="font-bold text-white">{formatPercentage(insights.savingsRate)}</span>.
                </p>

                <p className="text-xs text-indigo-200/90 font-medium">
                  Recommendation: {insights.narrativeAdvice}
                </p>
              </div>

              <div className="bg-[#111827]/80 dark:bg-[#111827]/80 bg-white/20 backdrop-blur-md border border-white/20 dark:border-gray-700/60 rounded-2xl p-4 text-center shrink-0 w-full md:w-56 space-y-1">
                <span className="text-xs text-indigo-100 dark:text-gray-400 uppercase font-semibold">Savings Retention</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300 dark:text-emerald-400">{formatPercentage(insights.savingsRate)}</p>
                <span className="text-[11px] text-indigo-200 dark:text-gray-400 block">Target benchmark: 20%+</span>
              </div>
            </div>
          </div>

          {/* 50/30/20 Budget Recommendation Model */}
          <Card
            title="50/30/20 Financial Allocation Model"
            subtitle="Comparing your actual disbursements against classic financial SaaS planning benchmarks"
            headerAction={
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-semibold">
                AI Suggestion Engine
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-2">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111827] border border-[var(--border-subtle)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-secondary)]">50% Essential Needs</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(insights.needsTarget)}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Target ceiling for rent, groceries, medical, and utility bills.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111827] border border-[var(--border-subtle)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-secondary)]">30% Discretionary Wants</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatCurrency(insights.wantsTarget)}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Target ceiling for dining out, entertainment, shopping, and hobbies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111827] border border-emerald-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">20% Savings & Debt</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(insights.savingsTarget)}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Recommended minimum allocation towards emergency funds & investments.
                </p>
              </div>
            </div>
          </Card>

          {/* Actionable Savings Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <Card
              title="Targeted Savings Opportunities"
              subtitle="Data-driven opportunities to optimize outflows"
              headerAction={
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Machine Recommendation
                </span>
              }
            >
              {insights.savingsOpportunities.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="No urgent savings gaps"
                  description="Your spending is broadly distributed with no single category over-consuming funds."
                />
              ) : (
                <div className="space-y-3">
                  {insights.savingsOpportunities.map((op, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-[#111827] border border-indigo-500/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">{op.title}</h4>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{op.impact}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{op.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Top Outflow Drivers (Factual) */}
            <Card
              title="Largest Spending Drivers"
              subtitle="Audited categories with highest transaction volume"
              headerAction={
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[var(--text-muted)] border border-[var(--border-subtle)] font-semibold">
                  Audited Fact
                </span>
              }
            >
              {insights.topCategories.length === 0 ? (
                <EmptyState title="No categorized expenses" description="Record categorized transactions." />
              ) : (
                <div className="space-y-3">
                  {insights.topCategories.map((cat, idx) => (
                    <div
                      key={cat.category_name}
                      className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#111827] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{cat.category_name}</p>
                          <span className="text-[11px] text-[var(--text-muted)]">{cat.percentage}% of total expenses</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(cat.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
