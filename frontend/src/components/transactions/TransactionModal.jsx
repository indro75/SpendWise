import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { categoryService } from '../../services/categories';
import { transactionService } from '../../services/transactions';
import { useToast } from '../../context/ToastContext';
import { ArrowDownRight, ArrowUpRight, Calendar, DollarSign, FileText, Tag } from 'lucide-react';

export const TransactionModal = ({
  isOpen,
  onClose,
  initialType = 'expense',
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setTitle('');
      setAmount('');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setErrors({});
      loadCategories();
    }
  }, [isOpen, initialType]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  // Auto-select first matching category if current categoryId does not match
  useEffect(() => {
    if (filteredCategories.length > 0) {
      const currentCategoryValid = filteredCategories.some((c) => c.id === Number(categoryId));
      if (!currentCategoryValid) {
        setCategoryId(filteredCategories[0].id.toString());
      }
    } else {
      setCategoryId('');
    }
  }, [type, categories]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters';
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }

    if (!transactionDate) {
      errs.transactionDate = 'Date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await transactionService.create({
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        transaction_date: transactionDate,
        description: description.trim() || null,
      });

      showToast(`${type === 'income' ? 'Income' : 'Expense'} recorded successfully!`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to record transaction.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'income' ? 'Add Income' : 'Add Expense'}
      subtitle="Record your financial transaction"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#111827] rounded-xl border border-gray-800">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Income
          </button>
        </div>

        {/* Title */}
        <Input
          label="Title"
          placeholder="e.g. Grocery shopping, Freelance payment"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />

        {/* Amount */}
        <Input
          label="Amount (৳ BDT)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          icon={DollarSign}
          required
        />

        {/* Category & Date in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-gray-300">
              Category
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isLoadingCategories}
                className="w-full rounded-xl bg-[#111827] text-gray-100 text-sm px-3.5 py-2.5 border border-gray-700/70 hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                {filteredCategories.length === 0 && (
                  <option value="">No categories available</option>
                )}
              </select>
            </div>
          </div>

          <Input
            label="Transaction Date"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            error={errors.transactionDate}
            icon={Calendar}
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wide text-gray-300">
            Description (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="Add notes or details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl bg-[#111827] text-gray-100 placeholder-gray-500 text-sm p-3 border border-gray-700/70 hover:border-gray-600 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={type === 'income' ? 'success' : 'primary'}
            isLoading={isSubmitting}
          >
            Save {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

