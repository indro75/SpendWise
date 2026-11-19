import { useState, useEffect, useCallback, useMemo } from 'react';
import { savingsGoalService } from '../services/savingsGoals';
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
  Target,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  ArrowUpCircle,
} from 'lucide-react';

export const SavingsGoals = () => {
  const { showToast } = useToast();

  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'In Progress' | 'Completed' | 'Overdue'

  // Create Goal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Quick Deposit / Update Funds Modal
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Edit Goal Modal
  const [editingGoal, setEditingGoal] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editCurrent, setEditCurrent] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Goal
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const rawGoals = await savingsGoalService.getAll();
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
      setGoals(goalsWithProgress);
    } catch {
      showToast('Failed to load savings goals', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Create Goal Handler
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    if (!targetAmount || isNaN(targetAmount) || parseFloat(targetAmount) <= 0) {
      showToast('Valid positive target amount is required', 'error');
      return;
    }
    if (!deadline) {
      showToast('Target deadline date is required', 'error');
      return;
    }

    try {
      setIsSubmittingCreate(true);
      await savingsGoalService.create({
        title: title.trim(),
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        deadline,
      });

      showToast('Savings goal created successfully', 'success');
      setIsCreateOpen(false);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      loadGoals();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to create goal';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Deposit Handler
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
      showToast('Please enter a valid deposit amount', 'error');
      return;
    }

    try {
      setIsSubmittingDeposit(true);
      const newTotal = (parseFloat(depositGoal.current_amount) || 0) + parseFloat(depositAmount);
      await savingsGoalService.update(depositGoal.id, {
        current_amount: newTotal,
      });

      showToast(`Deposited ${formatCurrency(depositAmount)} to "${depositGoal.title}"!`, 'success');
      setDepositGoal(null);
      setDepositAmount('');
      loadGoals();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Deposit failed';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (g) => {
    setEditingGoal(g);
    setEditTitle(g.title);
    setEditTarget(g.target_amount.toString());
    setEditCurrent(g.current_amount.toString());
    setEditDeadline(g.deadline);
  };

  // Update Handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    if (!editTarget || isNaN(editTarget) || parseFloat(editTarget) <= 0) {
      showToast('Valid target amount is required', 'error');
      return;
    }
    if (!editDeadline) {
      showToast('Deadline is required', 'error');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await savingsGoalService.update(editingGoal.id, {
        title: editTitle.trim(),
        target_amount: parseFloat(editTarget),
        current_amount: parseFloat(editCurrent) || 0,
        deadline: editDeadline,
      });

      showToast('Goal updated successfully', 'success');
      setEditingGoal(null);
      loadGoals();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to update goal';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!deletingGoal) return;
    try {
      setIsDeleting(true);
      await savingsGoalService.delete(deletingGoal.id);
      showToast('Savings goal removed successfully', 'success');
      setDeletingGoal(null);
      loadGoals();
    } catch {
      showToast('Failed to delete savings goal', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered
  const filteredGoals = useMemo(() => {
    if (statusFilter === 'all') return goals;
    return goals.filter((g) => g.status === statusFilter);
  }, [goals, statusFilter]);

  // Totals
  const totalTarget = goals.reduce((a, b) => a + (parseFloat(b.target_amount) || 0), 0);
  const totalSaved = goals.reduce((a, b) => a + (parseFloat(b.current_amount) || 0), 0);
  const totalRemaining = totalTarget - totalSaved;
  const overallPercentage = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            Savings Goals
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Set target financial milestones, track saved funds, and hit your deadlines.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          className="w-full sm:w-auto"
          onClick={() => {
            setTitle('');
            setTargetAmount('');
            setCurrentAmount('0');
            setDeadline('');
            setIsCreateOpen(true);
          }}
        >
          Create Savings Goal
        </Button>
      </div>

      {/* Aggregate Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Saved</span>
          <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{formatCurrency(totalSaved)}</p>
          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 block truncate">{overallPercentage}% achieved</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Target</span>
          <p className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] mt-0.5 truncate">{formatCurrency(totalTarget)}</p>
          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 block truncate">{goals.length} target goals</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Remaining Gap</span>
          <p className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">{formatCurrency(totalRemaining)}</p>
          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 block truncate">To 100% completion</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">Completed</span>
          <p className="text-lg sm:text-2xl font-bold text-amber-500 mt-0.5 truncate">{goals.filter((g) => g.status === 'Completed').length} Goals</p>
          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 block truncate">Milestones reached</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          All ({goals.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('In Progress')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'In Progress'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          In Progress ({goals.filter((g) => g.status === 'In Progress').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'Completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          Completed ({goals.filter((g) => g.status === 'Completed').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Overdue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            statusFilter === 'Overdue'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          Overdue ({goals.filter((g) => g.status === 'Overdue').length})
        </button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No savings goals found"
            description="Create your first financial target to stay motivated and track your wealth journey."
            actionText="Create Goal"
            onAction={() => setIsCreateOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGoals.map((g) => {
            const percent = g.percentage_completed || 0;
            const isCompleted = g.status === 'Completed' || percent >= 100;
            const isOverdue = g.status === 'Overdue';

            return (
              <div
                key={g.id}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider block">
                        Milestone #{g.id}
                      </span>
                      <h3 className="text-base font-bold text-[var(--text-primary)] truncate">{g.title}</h3>
                    </div>
                    <Badge
                      variant={isCompleted ? 'success' : isOverdue ? 'danger' : 'info'}
                    >
                      {g.status}
                    </Badge>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mt-3">
                    <div>
                      <span className="text-xs text-[var(--text-muted)]">Saved</span>
                      <p className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">
                        {formatCurrency(g.current_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[var(--text-muted)]">Target</span>
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">
                        {formatCurrency(g.target_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isOverdue
                            ? 'bg-rose-500'
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>{percent}% completed</span>
                      <span>{formatCurrency(g.remaining_amount || 0)} left</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions & Deadline */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1 text-[11px] truncate">
                    <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    Target: {formatDate(g.deadline)}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setDepositGoal(g);
                        setDepositAmount('');
                      }}
                      className="px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Add Funds"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      Add $
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(g)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingGoal(g)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Savings Goal Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Savings Target"
        subtitle="Set a goal amount and deadline for future purchases or emergencies"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Emergency Fund, New Laptop, Vacation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Amount (৳ BDT)"
              type="number"
              step="0.01"
              placeholder="50000.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              icon={DollarSign}
              required
            />
            <Input
              label="Starting Saved Amount (৳ BDT)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              icon={DollarSign}
            />
          </div>

          <Input
            label="Target Completion Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            icon={Calendar}
            required
          />

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
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Funds Modal */}
      <Modal
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        title="Deposit to Savings Goal"
        subtitle={`Adding funds towards "${depositGoal?.title}"`}
      >
        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#111827] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Current Balance:</span>
            <span className="font-bold text-[var(--text-primary)]">{formatCurrency(depositGoal?.current_amount || 0)}</span>
          </div>

          <Input
            label="Deposit Amount (৳ BDT)"
            type="number"
            step="0.01"
            placeholder="1000.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            icon={DollarSign}
            required
            autoFocus
          />

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setDepositGoal(null)}
              disabled={isSubmittingDeposit}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={isSubmittingDeposit} className="w-full sm:w-auto">
              Add Deposit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Savings Goal Modal */}
      <Modal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Edit Savings Goal"
        subtitle={`Modifying Milestone #${editingGoal?.id}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Goal Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Amount (৳ BDT)"
              type="number"
              step="0.01"
              value={editTarget}
              onChange={(e) => setEditTarget(e.target.value)}
              icon={DollarSign}
              required
            />
            <Input
              label="Current Saved Amount (৳ BDT)"
              type="number"
              step="0.01"
              value={editCurrent}
              onChange={(e) => setEditCurrent(e.target.value)}
              icon={DollarSign}
              required
            />
          </div>

          <Input
            label="Target Deadline"
            type="date"
            value={editDeadline}
            onChange={(e) => setEditDeadline(e.target.value)}
            icon={Calendar}
            required
          />

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setEditingGoal(null)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDelete}
        title="Delete Savings Goal"
        message={`Are you sure you want to permanently delete "${deletingGoal?.title}" (${formatCurrency(deletingGoal?.target_amount)})?`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
