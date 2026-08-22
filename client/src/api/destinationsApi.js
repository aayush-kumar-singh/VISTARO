import api from './client.js';

export const destinationsApi = {
  getDestinations: async (params = {}) => {
    const res = await api.get('/destinations', { params });
    return res.data;
  },

  getDestinationBySlug: async (slug) => {
    const res = await api.get(`/destinations/${slug}`);
    return res.data;
  },
};
