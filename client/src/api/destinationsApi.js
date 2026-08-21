import api from './client.js';

export const destinationsApi = {
  getDestinations: async () => {
    const res = await api.get('/destinations');
    return res.data;
  },

  getDestinationBySlug: async (slug) => {
    const res = await api.get(`/destinations/${slug}`);
    return res.data;
  },
};
