import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
      showToast('Category name is required', 'warning');
      return;
    }

    try {
      setIsCreating(true);
      await categoryService.create({
        name: newName.trim(),
        type: newType,
      });
      showToast('Custom category created successfully!', 'success');
      setNewName('');
      setIsCreateOpen(false);
      loadCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to create category', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingCategory) return;

    try {
      setIsEditing(true);
      await categoryService.update(editingCategory.id, {
        name: editName.trim(),
      });
      showToast('Category renamed successfully!', 'success');
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to update category', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      await categoryService.delete(deletingCategory.id);
      showToast('Custom category deleted', 'success');
      setDeletingCategory(null);
      loadCategories();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(
        typeof detail === 'string' ? detail : 'Cannot delete this category because it is in use.',
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tags className="w-6 h-6 text-indigo-400" />
            Category Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organize default system categories and design custom tags for income & expenses.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Expense Categories</span>
            <p className="text-xl font-bold text-rose-400 mt-1">{expenseCount} categories</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Income Categories</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">{incomeCount} categories</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Custom User Created</span>
            <p className="text-xl font-bold text-indigo-400 mt-1">{customCount} custom</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <FolderPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Table */}
      <Card>
        {/* Type Tabs */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            All Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'expense'
                ? 'bg-rose-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Expenses ({expenseCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'income'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Income ({incomeCount})
          </button>
        </div>

        {/* Categories Table */}
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No categories"
            description="Create custom categories to segment your finances."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Category Name</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Scope</th>
                  <th className="pb-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredCategories.map((cat) => {
                  const isCustom = cat.user_id !== null;
                  const isIncome = cat.type === 'income';

                  return (
                    <tr key={cat.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 font-medium text-gray-200">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isIncome ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span className="font-semibold text-gray-100">{cat.name}</span>
                        </div>
                      </td>

                      <td className="py-3 whitespace-nowrap">
                        <Badge variant={isIncome ? 'income' : 'expense'}>
                          {cat.type}
                        </Badge>
                      </td>

                      <td className="py-3 whitespace-nowrap">
                        {isCustom ? (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-medium">
                            Custom
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
                            <Lock className="w-3 h-3 text-gray-500" /> Default System
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
                              className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Rename Category"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCategory(cat)}
                              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#111827] rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => setNewType('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                newType === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense Category
            </button>
            <button
              type="button"
              onClick={() => setNewType('income')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                newType === 'income'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income Category
            </button>
          </div>

          <Input
            label="Category Name"
            placeholder="e.g. Software Subscriptions, Side Business"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating}>
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
        subtitle={`Updating "${editingCategory?.name}"`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Category Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isEditing}>
              Save Name
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete custom category "${deletingCategory?.name}"?`}
        confirmText="Delete Category"
        isLoading={isDeleting}
      />
    </div>
  );
};

