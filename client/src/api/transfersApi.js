import client from './client.js';

export const transfersApi = {
  getTransfers: async (params = {}) => {
    const res = await client.get('/transfers', { params });
    return res.data;
  },

  getTransferById: async (id) => {
    const res = await client.get(`/transfers/${id}`);
    return res.data;
  },
};
