import api from './api';

export const savingsGoalService = {
  // Get all user savings goals
  async getAll() {
    const response = await api.get('/savings-goals/');
    return response.data;
  },

  // Get single savings goal
  async getById(id) {
    const response = await api.get(`/savings-goals/${id}`);
    return response.data;
  },

  // Get goal progress
  async getProgress(id) {
    const response = await api.get(`/savings-goals/${id}/progress`);
    return response.data;
  },

  // Create savings goal
  // data: { title, target_amount, current_amount, deadline? }
  async create(data) {
    const response = await api.post('/savings-goals/', data);
    return response.data;
  },

  // Update savings goal
  async update(id, data) {
    const response = await api.put(`/savings-goals/${id}`, data);
    return response.data;
  },

  // Delete savings goal
  async delete(id) {
    const response = await api.delete(`/savings-goals/${id}`);
    return response.data;
  },
};

