import { useState, useEffect, useCallback, useMemo } from 'react';
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
  DollarSign,
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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [budgetList, catList] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll(),
      ]);

      // Fetch progress for each budget
      const budgetsWithProgress = await Promise.all(
        budgetList.map(async (b) => {
          try {
            const progress = await budgetService.getProgress(b.id);
            return { ...b, ...progress };
          } catch {
            return b;
          }
        })
      );

      setBudgets(budgetsWithProgress);
      setCategories(catList);
    } catch {
      showToast('Failed to load budgets', 'error');
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

  // Handle Create Budget
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid positive budget amount', 'error');
      return;
    }
    if (!startDate || !endDate) {
      showToast('Please specify valid start and end dates', 'error');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showToast('Start date cannot be after end date', 'error');
      return;
    }

    try {
      setIsSubmittingCreate(true);
      await budgetService.create({
        amount: parseFloat(amount),
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        start_date: startDate,
        end_date: endDate,
      });

      showToast('Budget configured successfully', 'success');
      setIsCreateOpen(false);
      setAmount('');
      setCategoryId('');
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to create budget';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (b) => {
    setEditingBudget(b);
    setEditAmount(b.amount.toString());
    setEditCategoryId(b.category_id ? b.category_id.toString() : '');
    setEditStartDate(b.start_date);
    setEditEndDate(b.end_date);
  };

  // Handle Update Budget
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editAmount || isNaN(editAmount) || parseFloat(editAmount) <= 0) {
      showToast('Please enter a valid positive amount', 'error');
      return;
    }
    if (!editStartDate || !editEndDate) {
      showToast('Start and end dates are required', 'error');
      return;
    }
    if (new Date(editStartDate) > new Date(editEndDate)) {
      showToast('Start date cannot be after end date', 'error');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await budgetService.update(editingBudget.id, {
        amount: parseFloat(editAmount),
        category_id: editCategoryId ? parseInt(editCategoryId, 10) : null,
        start_date: editStartDate,
        end_date: editEndDate,
      });

      showToast('Budget updated successfully', 'success');
      setEditingBudget(null);
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to update budget';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Budget
  const handleDelete = async () => {
    if (!deletingBudget) return;
    try {
      setIsDeleting(true);
      await budgetService.delete(deletingBudget.id);
      showToast('Budget removed successfully', 'success');
      setDeletingBudget(null);
      loadData();
    } catch {
      showToast('Failed to delete budget', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Aggregated totals
  const totalAllocated = useMemo(() => {
    return budgets.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return budgets.reduce((acc, b) => acc + (parseFloat(b.spent_amount) || 0), 0);
  }, [budgets]);

  const totalRemaining = totalAllocated - totalSpent;

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <WalletCards className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            Budget Management
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Set category spending limits, track burn rates, and receive early warning alerts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          className="w-full sm:w-auto"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Allocated</span>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">{formatCurrency(totalAllocated)}</p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Across {budgets.length} active limits</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Spent</span>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatCurrency(totalSpent)}</p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            {totalAllocated > 0 ? `${((totalSpent / totalAllocated) * 100).toFixed(1)}% consumed` : '0%'}
          </span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Remaining Pool</span>
          <p className={`text-xl sm:text-2xl font-bold mt-1 ${totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(totalRemaining)}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Available for planned spend</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                        Budget #{b.id}
                      </span>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{categoryName}</h3>
                    </div>
                    {statusBadge}
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mt-3">
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">Spent</span>
                      <p className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                        {formatCurrency(b.spent_amount || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[var(--text-muted)]">Limit</span>
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">
                        {formatCurrency(b.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${progressColor}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>{percent}% consumed</span>
                      <span className={b.remaining_amount < 0 ? 'text-rose-500 font-semibold' : ''}>
                        {formatCurrency(b.remaining_amount || 0)} remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Dates & Actions */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                    {formatDate(b.start_date)} - {formatDate(b.end_date)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(b)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Edit Budget"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingBudget(b)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
        title="Create Spending Budget"
        subtitle="Set ceiling threshold limits to keep expenses controlled"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Budget Limit (৳ BDT)"
            type="number"
            step="0.01"
            placeholder="5000.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={DollarSign}
            required
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
              Category Scope
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-sm px-3.5 py-2.5 border border-[var(--border-subtle)] hover:border-gray-400 dark:hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories (Global Expense Budget)</option>
              {categories
                .filter((c) => c.type === 'expense')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cycle Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              icon={Calendar}
              required
            />
            <Input
              label="Cycle End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              icon={Calendar}
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmittingCreate}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingCreate} className="w-full sm:w-auto">
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
        subtitle={`Modifying Budget #${editingBudget?.id}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Budget Limit (৳ BDT)"
            type="number"
            step="0.01"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            icon={DollarSign}
            required
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
              Category Scope
            </label>
            <select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              className="w-full rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-sm px-3.5 py-2.5 border border-[var(--border-subtle)] hover:border-gray-400 dark:hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories (Global Expense Budget)</option>
              {categories
                .filter((c) => c.type === 'expense')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cycle Start Date"
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              icon={Calendar}
              required
            />
            <Input
              label="Cycle End Date"
              type="date"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
              icon={Calendar}
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setEditingBudget(null)}
              disabled={isSubmittingEdit}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingEdit} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Budget Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Are you sure you want to remove Budget #${deletingBudget?.id} (${formatCurrency(deletingBudget?.amount)})? This will deactivate spending tracking for this target period.`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
