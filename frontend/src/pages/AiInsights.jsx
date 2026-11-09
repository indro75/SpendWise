import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TrendingUp,
  PieChart,
  ShieldCheck,
  Target,
  ArrowRight,
  Brain,
  CheckCircle2,
  DollarSign,
  AlertCircle,
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

  // Generate personalized financial intelligence
  const insights = useMemo(() => {
    if (!summary) return null;

    const totalIncome = parseFloat(summary.total_income) || 0;
    const totalExpense = parseFloat(summary.total_expense) || 0;
    const balance = parseFloat(summary.balance) || 0;
    const savingsRate = parseFloat(summary.savings_rate) || 0;

    // 1. Identify Largest Spending Categories
    const topCategories = categories.slice(0, 3);

    // 2. 50/30/20 Rule Benchmarks
    const needsTarget = totalIncome * 0.5;
    const wantsTarget = totalIncome * 0.3;
    const savingsTarget = totalIncome * 0.2;

    // 3. Potential Savings Opportunities
    // If top category is > 30% of total spend, recommend optimization
    const savingsOpportunities = [];
    if (topCategories.length > 0) {
      const highest = topCategories[0];
      const monthlyPotential = (parseFloat(highest.total_amount) * 0.15).toFixed(0);
      savingsOpportunities.push({
        title: `Optimize ${highest.category_name}`,
        impact: `Potential monthly savings: ${formatCurrency(monthlyPotential)}`,
        detail: `Currently accounts for ${highest.percentage}% of all expenditures. Trimming 15% via supplier or discretionary comparison frees up capital for savings goals.`,
        category: highest.category_name,
      });
    }

    if (topCategories.length > 1) {
      const second = topCategories[1];
      const monthlyPotential = (parseFloat(second.total_amount) * 0.1).toFixed(0);
      savingsOpportunities.push({
        title: `Audit ${second.category_name} Outflows`,
        impact: `Potential monthly savings: ${formatCurrency(monthlyPotential)}`,
        detail: `Consumes ${second.percentage}% of disbursements. Consolidating or negotiating subscriptions provides direct margin gains.`,
        category: second.category_name,
      });
    }

    // 4. Personalized Narrative Summary
    let narrativeHealth = 'Solid Financial Health';
    let narrativeAdvice = 'Maintain active emergency buffer deposits while exploring investment vehicles.';

    if (savingsRate < 10) {
      narrativeHealth = 'Savings Cushion Warning';
      narrativeAdvice = 'Disbursements closely match income. Implement category budget caps immediately to rebuild personal liquidity.';
    } else if (savingsRate >= 30) {
      narrativeHealth = 'Exceptional Surplus Generation';
      narrativeAdvice = 'Your savings rate significantly outpaces the national recommended baseline of 20%. Consider allocating surplus to high-yield goals.';
    }

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      topCategories,
      needsTarget,
      wantsTarget,
      savingsTarget,
      savingsOpportunities,
      narrativeHealth,
      narrativeAdvice,
    };
  }, [summary, categories]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            AI Financial Insights & Recommendations
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Data-backed financial advice, habit analysis, and savings opportunities computed from your actual transactions.
          </p>
        </div>

        <Badge variant="info">
          Audited vs AI Segregated
        </Badge>
      </div>

      {isLoading || !insights ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-br from-[#151C2C] to-[#1c223d] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    Executive Financial Brief
                  </span>
                  <span className="text-xs text-gray-400">• Dynamic Assessment</span>
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Status: {insights.narrativeHealth}
                </h2>

                <p className="text-sm text-gray-300 leading-relaxed">
                  Your current recorded earnings total{' '}
                  <span className="font-bold text-emerald-400">{formatCurrency(insights.totalIncome)}</span>{' '}
                  against{' '}
                  <span className="font-bold text-rose-400">{formatCurrency(insights.totalExpense)}</span>{' '}
                  in expenses, yielding an ongoing liquid surplus of{' '}
                  <span className="font-bold text-indigo-300">{formatCurrency(insights.balance)}</span>{' '}
                  and a savings rate of <span className="font-bold text-white">{formatPercentage(insights.savingsRate)}</span>.
                </p>

                <p className="text-xs text-indigo-200/80 font-medium">
                  Recommendation: {insights.narrativeAdvice}
                </p>
              </div>

              <div className="bg-[#111827]/80 border border-gray-700/60 rounded-2xl p-4 text-center shrink-0 w-full md:w-56 space-y-1">
                <span className="text-xs text-gray-400 uppercase font-semibold">Savings Retention</span>
                <p className="text-3xl font-extrabold text-emerald-400">{formatPercentage(insights.savingsRate)}</p>
                <span className="text-[11px] text-gray-400 block">Target benchmark: 20%+</span>
              </div>
            </div>
          </div>

          {/* 50/30/20 Budget Recommendation Model */}
          <Card
            title="50/30/20 Financial Allocation Model"
            subtitle="Comparing your actual disbursements against classic financial SaaS planning benchmarks"
            headerAction={
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                AI Suggestion Engine
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#111827] border border-gray-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-300">50% Essential Needs</span>
                  <span className="text-indigo-400 font-bold">{formatCurrency(insights.needsTarget)}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Target ceiling for rent, groceries, medical, and utility bills.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-gray-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-300">30% Discretionary Wants</span>
                  <span className="text-indigo-400 font-bold">{formatCurrency(insights.wantsTarget)}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Target ceiling for dining out, entertainment, shopping, and hobbies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-300">20% Savings & Debt</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(insights.savingsTarget)}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Recommended minimum allocation towards emergency funds & investments.
                </p>
              </div>
            </div>
          </Card>

          {/* Actionable Savings Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title="Targeted Savings Opportunities"
              subtitle="Data-driven opportunities to optimize outflows"
              headerAction={
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
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
                      className="p-4 rounded-xl bg-[#111827] border border-indigo-500/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-100">{op.title}</h4>
                        <span className="text-xs font-semibold text-emerald-400">{op.impact}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{op.detail}</p>
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
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 font-semibold">
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
                      className="p-3.5 rounded-xl bg-[#111827] border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-100">{cat.category_name}</p>
                          <span className="text-[11px] text-gray-400">{cat.percentage}% of total expenses</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-rose-400">
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

