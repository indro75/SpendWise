import api from './api';

export const authService = {
  // Register a new user
  async register({ full_name, email, password }) {
    const response = await api.post('/auth/register', {
      full_name,
      email,
      password,
    });
    return response.data;
  },

  // Login user using OAuth2 form-urlencoded (username = email)
  async login({ email, password }) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Get current user profile
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

