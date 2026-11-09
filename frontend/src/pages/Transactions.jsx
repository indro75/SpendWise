import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { transactionService } from '../services/transactions';
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
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { TransactionModal } from '../components/transactions/TransactionModal';

import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  ArrowLeftRight,
} from 'lucide-react';

export const Transactions = () => {
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'income' | 'expense'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState('expense');

  // Edit Modal state
  const [editingTx, setEditingTx] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('expense');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Confirm Modal state
  const [deletingTx, setDeletingTx] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [txData, catData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll(),
      ]);
      setTransactions(txData);
      setCategories(catData);
    } catch (err) {
      showToast('Failed to load transactions', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map category ID to category object for easy lookup
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [categories]);

  // Open Edit Modal
  const openEditModal = (tx) => {
    setEditingTx(tx);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditCategoryId(tx.category_id ? tx.category_id.toString() : '');
    setEditDate(tx.transaction_date);
    setEditDescription(tx.description || '');
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    if (!editingTx) return;

    if (!editTitle.trim()) {
      showToast('Title is required', 'warning');
      return;
    }
    if (!editAmount || parseFloat(editAmount) <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      await transactionService.update(editingTx.id, {
        title: editTitle.trim(),
        amount: parseFloat(editAmount),
        type: editType,
        category_id: editCategoryId ? parseInt(editCategoryId, 10) : null,
        transaction_date: editDate,
        description: editDescription.trim() || null,
      });

      showToast('Transaction updated successfully!', 'success');
      setEditingTx(null);
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === 'string' ? detail : 'Failed to update transaction', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async () => {
    if (!deletingTx) return;
    try {
      setIsDeleting(true);
      await transactionService.delete(deletingTx.id);
      showToast('Transaction deleted successfully', 'success');
      setDeletingTx(null);
      loadData();
    } catch {
      showToast('Failed to delete transaction', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Sort logic
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = tx.title?.toLowerCase().includes(q);
          const matchDesc = tx.description?.toLowerCase().includes(q);
          const catName = categoryMap[tx.category_id]?.name?.toLowerCase();
          const matchCat = catName?.includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (tx.category_id !== parseInt(selectedCategory, 10)) {
            return false;
          }
        }

        // Date filter
        if (selectedDate && tx.transaction_date !== selectedDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.transaction_date) - new Date(a.transaction_date) || b.id - a.id;
        }
        if (sortBy === 'date-asc') {
          return new Date(a.transaction_date) - new Date(b.transaction_date) || a.id - b.id;
        }
        if (sortBy === 'amount-desc') {
          return parseFloat(b.amount) - parseFloat(a.amount);
        }
        if (sortBy === 'amount-asc') {
          return parseFloat(a.amount) - parseFloat(b.amount);
        }
        return 0;
      });
  }, [transactions, searchQuery, selectedType, selectedCategory, selectedDate, sortBy, categoryMap]);

  // Statistics calculation for the filtered set
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'income') income += amt;
      else expense += amt;
    });
    return {
      count: filteredTransactions.length,
      income,
      expense,
      net: income - expense,
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-400" />
            Transaction Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track, filter, and organize all your personal earnings and expenditures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="success"
            size="sm"
            icon={Plus}
            onClick={() => {
              setAddModalType('income');
              setIsAddModalOpen(true);
            }}
          >
            Add Income
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setAddModalType('expense');
              setIsAddModalOpen(true);
            }}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Mini Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-3.5">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Shown Count</span>
          <p className="text-lg font-bold text-gray-100 mt-0.5">{stats.count} records</p>
        </div>
        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-3.5">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Period Income</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatCurrency(stats.income)}</p>
        </div>
        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-3.5">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Period Expenses</span>
          <p className="text-lg font-bold text-rose-400 mt-0.5">{formatCurrency(stats.expense)}</p>
        </div>
        <div className="bg-[#151C2C] border border-[#1F293D] rounded-xl p-3.5">
          <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Period Net</span>
          <p className={`text-lg font-bold mt-0.5 ${stats.net >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
            {formatCurrency(stats.net)}
          </p>
        </div>
      </div>

      {/* Search & Filters Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by title, description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl bg-[#111827] text-gray-200 text-sm px-3.5 py-2.5 border border-gray-700/70 hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl bg-[#111827] text-gray-200 text-sm px-3.5 py-2.5 border border-gray-700/70 hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl bg-[#111827] text-gray-200 text-sm px-3.5 py-2.5 border border-gray-700/70 hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Date Filter & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Filter by Specific Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#111827] text-gray-200 text-xs px-2.5 py-1.5 rounded-lg border border-gray-700 outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Clear Date
              </button>
            )}
          </div>

          {(searchQuery || selectedType !== 'all' || selectedCategory !== 'all' || selectedDate) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCategory('all');
                setSelectedDate('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </Card>

      {/* Transactions Table Card */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions found"
            description={
              transactions.length === 0
                ? "You haven't recorded any transactions yet. Add your first income or expense to begin."
                : "No transactions match your current filters. Try resetting search or filter criteria."
            }
            actionText={transactions.length === 0 ? 'Add First Transaction' : 'Clear Filters'}
            onAction={
              transactions.length === 0
                ? () => {
                    setAddModalType('expense');
                    setIsAddModalOpen(true);
                  }
                : () => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedCategory('all');
                    setSelectedDate('');
                  }
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Transaction</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredTransactions.map((tx) => {
                  const cat = categoryMap[tx.category_id];
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-gray-800/20 transition-colors group">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-100">{tx.title}</p>
                            {tx.description && (
                              <p className="text-[11px] text-gray-400 truncate max-w-xs">{tx.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 whitespace-nowrap">
                        <Badge variant={isIncome ? 'income' : 'expense'}>
                          {tx.type}
                        </Badge>
                      </td>

                      <td className="py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-gray-800/80 border border-gray-700/60 text-gray-300 text-[11px]">
                          {cat?.name || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="py-3.5 whitespace-nowrap text-gray-400">
                        {formatDate(tx.transaction_date)}
                      </td>

                      <td className="py-3.5 text-right font-bold text-sm whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Edit Transaction"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTx(tx)}
                            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialType={addModalType}
        onSuccess={loadData}
      />

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        title="Edit Transaction"
        subtitle={`Update details for transaction #${editingTx?.id}`}
      >
        <form onSubmit={handleUpdateTransaction} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#111827] rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => setEditType('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                editType === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setEditType('income')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                editType === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
          </div>

          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <Input
            label="Amount (৳ BDT)"
            type="number"
            step="0.01"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            icon={DollarSign}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300">
                Category
              </label>
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                className="w-full rounded-xl bg-[#111827] text-gray-100 text-sm px-3.5 py-2.5 border border-gray-700/70 hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Uncategorized</option>
                {categories
                  .filter((c) => c.type === editType)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <Input
              label="Transaction Date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              icon={Calendar}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full rounded-xl bg-[#111827] text-gray-100 text-sm p-3 border border-gray-700/70 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setEditingTx(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingEdit}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${deletingTx?.title}" (${formatCurrency(deletingTx?.amount)})?`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
