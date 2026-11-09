import api from './api';

export const categoryService = {
  // Get all categories (system defaults + user custom)
  async getAll() {
    const response = await api.get('/categories/');
    return response.data;
  },

  // Create custom category
  // data: { name, type: 'income' | 'expense' }
  async create(data) {
    const response = await api.post('/categories/', data);
    return response.data;
  },

  // Update custom category name
  // data: { name }
  async update(id, data) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete custom category
  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

