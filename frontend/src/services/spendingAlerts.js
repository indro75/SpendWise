import api from './api';

export const spendingAlertService = {
  // Get all alerts
  async getAll() {
    const response = await api.get('/spending-alerts/');
    return response.data;
  },

  // Get single alert
  async getById(id) {
    const response = await api.get(`/spending-alerts/${id}`);
    return response.data;
  },

  // Create alert
  async create(data) {
    const response = await api.post('/spending-alerts/', data);
    return response.data;
  },

  // Delete alert
  async delete(id) {
    const response = await api.delete(`/spending-alerts/${id}`);
    return response.data;
  },
};

