import api from './api';

export const analyticsService = {
  // Get financial summary (total_income, total_expense, balance, savings_rate)
  async getSummary() {
    const response = await api.get('/analytics/summary');
    return response.data;
  },

  // Get monthly analytics for given year
  async getMonthly(year = new Date().getFullYear()) {
    const response = await api.get(`/analytics/monthly`, {
      params: { year },
    });
    return response.data;
  },

  // Get category analytics (type: 'expense' | 'income')
  async getCategories(type = 'expense') {
    const response = await api.get(`/analytics/categories`, {
      params: { type },
    });
    return response.data;
  },

  // Get recent transactions
  async getRecentTransactions(limit = 5) {
    const response = await api.get(`/analytics/recent-transactions`, {
      params: { limit },
    });
    return response.data;
  },

  // Get daily expense trends for given year and month
  async getExpenseTrends(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
    const response = await api.get(`/analytics/expense-trends`, {
      params: { year, month },
    });
    return response.data;
  },
};

