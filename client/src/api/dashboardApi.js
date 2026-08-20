import api from './client.js';

export const dashboardApi = {
  getDashboard: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },
};
