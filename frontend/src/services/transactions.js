import api from './api';

export const transactionService = {
  // Get all user transactions
  async getAll() {
    const response = await api.get('/transactions/');
    return response.data;
  },

  // Get single transaction
  async getById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create new transaction
  // data: { title, amount, type: 'income'|'expense', description?, transaction_date, category_id? }
  async create(data) {
    const response = await api.post('/transactions/', data);
    return response.data;
  },

  // Update transaction
  async update(id, data) {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  async delete(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

