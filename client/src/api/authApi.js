import api from './client.js';

export const authApi = {
  signup: async (userData) => {
    const res = await api.post('/auth/signup', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/current-user');
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.put('/auth/change-password', data);
    return res.data;
  },
};
