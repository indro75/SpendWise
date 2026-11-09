import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
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
            const prog = await savingsGoalService.getProgress(g.id);
            return { ...g, ...prog };
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

  // Create Goal
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Title is required', 'warning');
      return;
    }
    const target = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount) || 0;
    if (isNaN(target) || target <= 0) {
      showToast('Target amount must be greater than 0', 'warning');
      return;
    }
    if (curr > target) {
      showToast('Current savings cannot exceed target amount', 'warning');
      return;
    }

    try {
      setIsSubmittingCreate(true);
      await savingsGoalService.create({
        title: title.trim(),
        target_amount: target,
        current_amount: curr,
        deadline: deadline || null,
      });

      showToast('Savings goal created successfully!', 'success');
      setIsCreateOpen(false);
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      loadGoals();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to create savings goal', 'error');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Add Funds / Deposit
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositGoal) return;
    const added = parseFloat(depositAmount);
    if (isNaN(added) || added <= 0) {
      showToast('Please enter a valid deposit amount', 'warning');
      return;
    }

    const newTotal = (parseFloat(depositGoal.current_amount) || 0) + added;
    const target = parseFloat(depositGoal.target_amount);

    if (newTotal > target) {
      showToast(`Total cannot exceed target of ${formatCurrency(target)}`, 'warning');
      return;
    }

    try {
      setIsSubmittingDeposit(true);
      await savingsGoalService.update(depositGoal.id, {
        current_amount: newTotal,
      });
      showToast(`Added ${formatCurrency(added)} to "${depositGoal.title}"!`, 'success');
      setDepositGoal(null);
      setDepositAmount('');
      loadGoals();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to update savings', 'error');
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Edit Goal
  const openEdit = (g) => {
    setEditingGoal(g);
    setEditTitle(g.title);
    setEditTarget(g.target_amount.toString());
    setEditCurrent(g.current_amount.toString());
    setEditDeadline(g.deadline || '');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;
    const target = parseFloat(editTarget);
    const curr = parseFloat(editCurrent);

    if (!editTitle.trim()) {
      showToast('Title is required', 'warning');
      return;
    }
    if (isNaN(target) || target <= 0) {
      showToast('Target amount must be greater than 0', 'warning');
      return;
    }
    if (curr > target) {
      showToast('Current savings cannot exceed target amount', 'warning');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await savingsGoalService.update(editingGoal.id, {
        title: editTitle.trim(),
        target_amount: target,
        current_amount: curr,
        deadline: editDeadline || null,
      });

      showToast('Savings goal updated successfully!', 'success');
      setEditingGoal(null);
      loadGoals();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to update goal', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Goal
  const handleDelete = async () => {
    if (!deletingGoal) return;
    try {
      setIsDeleting(true);
      await savingsGoalService.delete(deletingGoal.id);
      showToast('Savings goal deleted', 'success');
      setDeletingGoal(null);
      loadGoals();
    } catch {
      showToast('Failed to delete goal', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Goals
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-400" />
            Savings Goals
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Set target financial milestones, track saved funds, and hit your deadlines.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Saved</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalSaved)}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">{overallPercentage}% of target achieved</span>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Target</span>
          <p className="text-2xl font-bold text-gray-100 mt-1">{formatCurrency(totalTarget)}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Combined target across goals</span>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Remaining Gap</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{formatCurrency(totalRemaining)}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Needed to reach 100% completion</span>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Active Milestones</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{goals.length} Goals</p>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {goals.filter((g) => g.status === 'Completed').length} reached 100%
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-1 border-b border-gray-800">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          All Goals ({goals.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('In Progress')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'In Progress'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          In Progress ({goals.filter((g) => g.status === 'In Progress').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Completed')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'Completed'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Completed ({goals.filter((g) => g.status === 'Completed').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Overdue')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'Overdue'
              ? 'bg-rose-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Overdue ({goals.filter((g) => g.status === 'Overdue').length})
        </button>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="No savings goals"
            description="Set a target to motivate and pace your personal savings journey."
            actionText="Create Goal"
            onAction={() => setIsCreateOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((g) => {
            const percent = g.percentage_completed || 0;
            const isCompleted = g.status === 'Completed';
            const isOverdue = g.status === 'Overdue';

            return (
              <div
                key={g.id}
                className="bg-[#151C2C] border border-[#1F293D] rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-gray-700/80 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-gray-100 truncate pr-2">{g.title}</h3>
                    <Badge
                      variant={
                        isCompleted ? 'success' : isOverdue ? 'danger' : 'info'
                      }
                    >
                      {g.status}
                    </Badge>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mt-4">
                    <div>
                      <span className="text-xs text-gray-400">Current Saved</span>
                      <p className="text-xl font-extrabold text-emerald-400">
                        {formatCurrency(g.current_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Target</span>
                      <p className="text-sm font-semibold text-gray-300">
                        {formatCurrency(g.target_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
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
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-semibold text-indigo-400">{percent}% reached</span>
                      <span>{formatCurrency(g.remaining_amount || 0)} left</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{g.deadline ? formatDate(g.deadline) : 'No Deadline'}</span>
                    </div>
                    {isCompleted && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Achieved!
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  {!isCompleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowUpCircle}
                      onClick={() => {
                        setDepositGoal(g);
                        setDepositAmount('');
                      }}
                    >
                      Add Savings
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">Goal Complete</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Edit Goal"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingGoal(g)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Goal"
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Savings Goal"
        subtitle="Set a goal to work towards"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. New Laptop, Emergency Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Amount (৳ BDT)"
              type="number"
              step="0.01"
              placeholder="e.g. 50000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              icon={DollarSign}
              required
            />
            <Input
              label="Starting Saved (৳ BDT)"
              type="number"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              icon={DollarSign}
            />
          </div>

          <Input
            label="Target Deadline (Optional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            icon={Calendar}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingCreate}>
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Funds / Deposit Modal */}
      <Modal
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        title="Add Funds to Goal"
        subtitle={`Deposit towards "${depositGoal?.title}"`}
      >
        <form onSubmit={handleDeposit} className="space-y-4">
          <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/60 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Savings:</span>
              <span className="font-semibold text-gray-200">
                {formatCurrency(depositGoal?.current_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Target Goal:</span>
              <span className="font-semibold text-gray-200">
                {formatCurrency(depositGoal?.target_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Remaining to Save:</span>
              <span className="font-semibold text-emerald-400">
                {formatCurrency(depositGoal?.remaining_amount)}
              </span>
            </div>
          </div>

          <Input
            label="Contribution Amount (৳ BDT)"
            type="number"
            step="0.01"
            placeholder="e.g. 5000"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            icon={DollarSign}
            required
            autoFocus
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setDepositGoal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" isLoading={isSubmittingDeposit}>
              Deposit Funds
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Edit Savings Goal"
        subtitle={`Update "${editingGoal?.title}"`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Goal Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
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
              label="Current Saved (৳ BDT)"
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
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setEditingGoal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingEdit}>
              Update Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDelete}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete goal "${deletingGoal?.title}"?`}
        confirmText="Delete Goal"
        isLoading={isDeleting}
      />
    </div>
  );
};

