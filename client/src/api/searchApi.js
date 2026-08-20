import api from './client.js';

export const searchApi = {
  search: async (params = {}) => {
    const res = await api.get('/search', { params });
    return res.data;
  },
};
