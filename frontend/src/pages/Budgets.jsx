import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { budgetService } from '../services/budgets';
import { categoryService } from '../services/categories';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/SkeletonLoader';

import {
  WalletCards,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const Budgets = () => {
  const { showToast } = useToast();

  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Edit Modal
  const [editingBudget, setEditingBudget] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Modal
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBudgetsAndCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rawBudgets, allCategories] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll(),
      ]);

      const expenseCategories = allCategories.filter((c) => c.type === 'expense');
      setCategories(expenseCategories);

      // Fetch progress for each budget
      const budgetsWithProgress = await Promise.all(
        rawBudgets.map(async (b) => {
          try {
            const prog = await budgetService.getProgress(b.id);
            return { ...b, ...prog };
          } catch {
            return b;
          }
        })
      );

      setBudgets(budgetsWithProgress);
    } catch {
      showToast('Failed to load budget records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadBudgetsAndCategories();
  }, [loadBudgetsAndCategories]);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  // Handle Create Budget
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid budget amount', 'warning');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      showToast('End date cannot be earlier than start date', 'warning');
      return;
    }

    try {
      setIsSubmittingCreate(true);
      await budgetService.create({
        amount: parseFloat(amount),
        start_date: startDate,
        end_date: endDate,
        category_id: categoryId ? parseInt(categoryId, 10) : null,
      });

      showToast('Budget created successfully!', 'success');
      setIsCreateOpen(false);
      setAmount('');
      loadBudgetsAndCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to create budget', 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal
  const openEdit = (b) => {
    setEditingBudget(b);
    setEditAmount(b.amount.toString());
    setEditCategoryId(b.category_id ? b.category_id.toString() : '');
    setEditStartDate(b.start_date);
    setEditEndDate(b.end_date);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingBudget) return;
    if (!editAmount || parseFloat(editAmount) <= 0) {
      showToast('Please enter a valid budget amount', 'warning');
      return;
    }
    if (new Date(editEndDate) < new Date(editStartDate)) {
      showToast('End date cannot be earlier than start date', 'warning');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await budgetService.update(editingBudget.id, {
        amount: parseFloat(editAmount),
        start_date: editStartDate,
        end_date: editEndDate,
        category_id: editCategoryId ? parseInt(editCategoryId, 10) : null,
      });

      showToast('Budget updated successfully!', 'success');
      setEditingBudget(null);
      loadBudgetsAndCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to update budget', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBudget) return;
    try {
      setIsDeleting(true);
      await budgetService.delete(deletingBudget.id);
      showToast('Budget deleted successfully', 'success');
      setDeletingBudget(null);
      loadBudgetsAndCategories();
    } catch {
      showToast('Failed to delete budget', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Aggregated totals
  const totalAllocated = budgets.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (parseFloat(b.spent_amount) || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-indigo-400" />
            Budget Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Set category spending limits, track burn rates, and receive early warning alerts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setAmount('');
            setCategoryId('');
            setIsCreateOpen(true);
          }}
        >
          Create New Budget
        </Button>
      </div>

      {/* Aggregate Budget Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Allocated</span>
          <p className="text-2xl font-bold text-gray-100 mt-1">{formatCurrency(totalAllocated)}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Across {budgets.length} active limits</span>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Spent</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(totalSpent)}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {totalAllocated > 0 ? `${((totalSpent / totalAllocated) * 100).toFixed(1)}% of total budget` : '0%'}
          </span>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Remaining Pool</span>
          <p className={`text-2xl font-bold mt-1 ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(totalRemaining)}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Available for planned spend</span>
        </div>
      </div>

      {/* Budgets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={WalletCards}
            title="No budgets configured"
            description="Create your first category budget to keep your expenses bounded and avoid overspending."
            actionText="Create Budget"
            onAction={() => setIsCreateOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const percent = b.percentage_used || 0;
            const isExceeded = percent >= 100;
            const isWarning = percent >= 80 && percent < 100;
            const categoryName = b.category_id ? categoryMap[b.category_id] : 'All Categories (Global)';

            let progressColor = 'bg-emerald-500';
            let statusBadge = <Badge variant="success">Safe</Badge>;
            if (isExceeded) {
              progressColor = 'bg-rose-500';
              statusBadge = <Badge variant="danger">Exceeded</Badge>;
            } else if (isWarning) {
              progressColor = 'bg-amber-500';
              statusBadge = <Badge variant="warning">Warning (80%+)</Badge>;
            }

            return (
              <div
                key={b.id}
                className="bg-[#151C2C] border border-[#1F293D] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-gray-700/80 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                        Budget #{b.id}
                      </span>
                      <h3 className="text-base font-bold text-gray-100">{categoryName}</h3>
                    </div>
                    {statusBadge}
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mt-4">
                    <div>
                      <span className="text-xs text-gray-400">Spent</span>
                      <p className="text-xl font-extrabold text-gray-100">
                        {formatCurrency(b.spent_amount || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Limit</span>
                      <p className="text-sm font-semibold text-gray-300">
                        {formatCurrency(b.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${progressColor}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{percent}% consumed</span>
                      <span className={b.remaining_amount < 0 ? 'text-rose-400 font-semibold' : ''}>
                        {formatCurrency(b.remaining_amount || 0)} remaining
                      </span>
                    </div>
                  </div>

                  {/* Period Dates */}
                  <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>
                      {formatDate(b.start_date)} - {formatDate(b.end_date)}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(b)}
                    className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    title="Edit Budget"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingBudget(b)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Budget"
        subtitle="Set a spending cap for a category"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Budget Limit (৳ BDT)"
            type="number"
            step="0.01"
            placeholder="e.g. 15000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={DollarSign}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl bg-[#111827] text-gray-100 text-sm px-3.5 py-2.5 border border-gray-700/70 hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Expense Categories (Global)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingCreate}>
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title="Edit Budget"
        subtitle={`Update Budget #${editingBudget?.id}`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Budget Limit (৳ BDT)"
            type="number"
            step="0.01"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            icon={DollarSign}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300">
              Category
            </label>
            <select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              className="w-full rounded-xl bg-[#111827] text-gray-100 text-sm px-3.5 py-2.5 border border-gray-700/70 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Expense Categories (Global)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setEditingBudget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingEdit}>
              Update Budget
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Are you sure you want to delete Budget #${deletingBudget?.id}?`}
        confirmText="Delete Budget"
        isLoading={isDeleting}
      />
    </div>
  );
};

