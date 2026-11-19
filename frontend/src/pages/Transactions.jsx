import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Plus,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
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
    } catch {
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

  // Submit Edit Form
  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showToast('Title is required', 'error');
      return;
    }
    if (!editAmount || isNaN(editAmount) || parseFloat(editAmount) <= 0) {
      showToast('Valid positive amount is required', 'error');
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

      showToast('Transaction updated successfully', 'success');
      setEditingTx(null);
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to update transaction';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async () => {
    if (!deletingTx) return;
    try {
      setIsDeleting(true);
      await transactionService.delete(deletingTx.id);
      showToast('Transaction removed successfully', 'success');
      setDeletingTx(null);
      loadData();
    } catch {
      showToast('Failed to delete transaction', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const titleMatch = t.title.toLowerCase().includes(q);
          const descMatch = t.description?.toLowerCase().includes(q);
          const cat = categoryMap[t.category_id];
          const catMatch = cat?.name.toLowerCase().includes(q);
          if (!titleMatch && !descMatch && !catMatch) return false;
        }

        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (t.category_id?.toString() !== selectedCategory) {
            return false;
          }
        }

        // Date filter
        if (selectedDate && t.transaction_date !== selectedDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.transaction_date) - new Date(a.transaction_date);
        }
        if (sortBy === 'date-asc') {
          return new Date(a.transaction_date) - new Date(b.transaction_date);
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
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            Transaction Management
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Track, filter, and organize all your personal earnings and expenditures.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="success"
            size="sm"
            icon={Plus}
            className="flex-1 sm:flex-none"
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
            className="flex-1 sm:flex-none"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Records</span>
          <p className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-0.5">{stats.count} txs</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Period Income</span>
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{formatCurrency(stats.income)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Period Expenses</span>
          <p className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5 truncate">{formatCurrency(stats.expense)}</p>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Net Cashflow</span>
          <p className={`text-base sm:text-lg font-bold mt-0.5 truncate ${stats.net >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(stats.net)}
          </p>
        </div>
      </div>

      {/* Search & Filters Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Search Bar */}
          <div className="sm:col-span-2 lg:col-span-2">
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
              className="w-full rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-sm px-3.5 py-2.5 border border-[var(--border-subtle)] hover:border-gray-400 dark:hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-sm px-3.5 py-2.5 border border-[var(--border-subtle)] hover:border-gray-400 dark:hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-sm px-3.5 py-2.5 border border-[var(--border-subtle)] hover:border-gray-400 dark:hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Date Filter & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-[var(--border-subtle)] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--text-muted)] font-medium">Filter by Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[var(--bg-input)] text-[var(--text-primary)] text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
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
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </Card>

      {/* Transactions Container */}
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
          <div>
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Transaction</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredTransactions.map((tx) => {
                    const cat = categoryMap[tx.category_id];
                    const isIncome = tx.type === 'income';

                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isIncome
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">{tx.title}</p>
                              {tx.description && (
                                <p className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">{tx.description}</p>
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
                          <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 text-[11px] font-medium">
                            {cat?.name || 'Uncategorized'}
                          </span>
                        </td>

                        <td className="py-3.5 whitespace-nowrap text-[var(--text-muted)]">
                          {formatDate(tx.transaction_date)}
                        </td>

                        <td className="py-3.5 text-right font-bold text-sm whitespace-nowrap">
                          <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                          </span>
                        </td>

                        <td className="py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openEditModal(tx)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit Transaction"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTx(tx)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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

            {/* Mobile Native Card View (< md) */}
            <div className="md:hidden divide-y divide-[var(--border-subtle)] -mx-2">
              {filteredTransactions.map((tx) => {
                const cat = categoryMap[tx.category_id];
                const isIncome = tx.type === 'income';

                return (
                  <div key={tx.id} className="p-3.5 flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/15 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{tx.title}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-0.5">
                            <span>{formatDate(tx.transaction_date)}</span>
                            <span>•</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                              {cat?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`font-bold text-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                        </p>
                        <Badge variant={isIncome ? 'income' : 'expense'} size="sm" className="mt-1">
                          {tx.type}
                        </Badge>
                      </div>
                    </div>

                    {tx.description && (
                      <p className="text-xs text-[var(--text-muted)] pl-11 line-clamp-2">
                        {tx.description}
                      </p>
                    )}

                    {/* Touch Action Bar */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border-subtle)]/50">
                      <button
                        type="button"
                        onClick={() => openEditModal(tx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTx(tx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-[#111827] rounded-xl border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setEditType('expense')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                editType === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setEditType('income')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                editType === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
              <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
                Category
              </label>
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                className="w-full rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] text-sm px-3.5 py-2.5 border border-[var(--border-subtle)] hover:border-gray-400 dark:hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
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
            <label className="text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
              Description (Optional)
            </label>
            <textarea
              rows="2"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm p-3 border border-[var(--border-subtle)] outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <Button variant="secondary" onClick={() => setEditingTx(null)} className="w-full sm:w-auto">
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
