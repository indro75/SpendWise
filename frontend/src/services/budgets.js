import api from './api';

export const budgetService = {
  // Get all user budgets
  async getAll() {
    const response = await api.get('/budgets/');
    return response.data;
  },

  // Get single budget
  async getById(id) {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  // Get budget progress
  async getProgress(id) {
    const response = await api.get(`/budgets/${id}/progress`);
    return response.data;
  },

  // Create new budget
  // data: { amount, start_date, end_date, category_id? }
  async create(data) {
    const response = await api.post('/budgets/', data);
    return response.data;
  },

  // Update budget
  async update(id, data) {
    const response = await api.put(`/budgets/${id}`, data);
    return response.data;
  },

  // Delete budget
  async delete(id) {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

