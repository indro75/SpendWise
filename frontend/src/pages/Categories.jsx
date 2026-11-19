import { useState, useEffect, useMemo, useCallback } from 'react';
import { categoryService } from '../services/categories';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { TableSkeleton } from '../components/common/SkeletonLoader';

import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  FolderPlus,
} from 'lucide-react';

export const Categories = () => {
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'expense' | 'income'

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('expense');
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete Modal
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      setIsCreating(true);
      await categoryService.create({
        name: newName.trim(),
        type: newType,
      });
      showToast('Custom category created successfully', 'success');
      setIsCreateOpen(false);
      setNewName('');
      loadCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to create category';
      showToast(msg, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      setIsEditing(true);
      await categoryService.update(editingCategory.id, {
        name: editName.trim(),
      });
      showToast('Category updated successfully', 'success');
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to rename category';
      showToast(msg, 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      await categoryService.delete(deletingCategory.id);
      showToast('Category removed successfully', 'success');
      setDeletingCategory(null);
      loadCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(
        typeof detail === 'string'
          ? detail
          : 'Failed to delete category (it may be linked to active transactions)',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (activeTab === 'all') return categories;
    return categories.filter((c) => c.type === activeTab);
  }, [categories, activeTab]);

  const expenseCount = categories.filter((c) => c.type === 'expense').length;
  const incomeCount = categories.filter((c) => c.type === 'income').length;
  const customCount = categories.filter((c) => c.user_id !== null).length;

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Tags className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            Category Management
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Organize default system categories and design custom tags for income & expenses.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          className="w-full sm:w-auto"
          onClick={() => {
            setNewName('');
            setNewType('expense');
            setIsCreateOpen(true);
          }}
        >
          New Custom Category
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Expense Categories</span>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{expenseCount} categories</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Income Categories</span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{incomeCount} categories</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Custom User Created</span>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{customCount} custom</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <FolderPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Table */}
      <Card>
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            All Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            Expenses ({expenseCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            Income ({incomeCount})
          </button>
        </div>

        {/* Categories Container */}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No categories"
            description="Create custom categories to segment your finances."
          />
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Category Name</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Scope</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredCategories.map((cat) => {
                    const isCustom = cat.user_id !== null;
                    const isIncome = cat.type === 'income';

                    return (
                      <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="py-3 font-medium text-[var(--text-primary)]">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span className="font-semibold">{cat.name}</span>
                          </div>
                        </td>

                        <td className="py-3 whitespace-nowrap">
                          <Badge variant={isIncome ? 'income' : 'expense'}>
                            {cat.type}
                          </Badge>
                        </td>

                        <td className="py-3 whitespace-nowrap">
                          {isCustom ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold">
                              Custom
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[var(--text-muted)] text-[11px]">
                              <Lock className="w-3 h-3" /> Default System
                            </span>
                          )}
                        </td>

                        <td className="py-3 text-center whitespace-nowrap">
                          {isCustom ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setEditName(cat.name);
                                }}
                                className="p-1.5 text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Rename Category"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingCategory(cat)}
                                className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[var(--text-muted)] italic">Protected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Category Cards */}
            <div className="md:hidden divide-y divide-[var(--border-subtle)] -mx-2">
              {filteredCategories.map((cat) => {
                const isCustom = cat.user_id !== null;
                const isIncome = cat.type === 'income';

                return (
                  <div key={cat.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/15 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{cat.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={isIncome ? 'income' : 'expense'} size="sm">
                            {cat.type}
                          </Badge>
                          {isCustom ? (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Custom</span>
                          ) : (
                            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> System</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isCustom ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditName(cat.name);
                          }}
                          className="p-2 text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          aria-label="Edit category"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(cat)}
                          className="p-2 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          aria-label="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[var(--text-muted)] italic shrink-0">Protected</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Create Custom Category Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Custom Category"
        subtitle="Add a personalized category for transactions"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-[#111827] rounded-xl border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setNewType('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                newType === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense Category
            </button>
            <button
              type="button"
              onClick={() => setNewType('income')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                newType === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income Category
            </button>
          </div>

          <Input
            label="Category Name"
            placeholder="e.g. Subscriptions, Coffee, Side Hustle"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
          />

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating} className="w-full sm:w-auto">
              Create Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Rename Category"
        subtitle={`Editing ${editingCategory?.type} category: ${editingCategory?.name}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Category Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            autoFocus
          />

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setEditingCategory(null)}
              disabled={isEditing}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isEditing} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete Custom Category"
        message={`Are you sure you want to permanently delete the custom category "${deletingCategory?.name}"? Transactions assigned to it will become uncategorized.`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
