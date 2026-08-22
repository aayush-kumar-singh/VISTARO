import api from './client.js';

export const travelPlansApi = {
  getPlans: async (params = {}) => {
    const res = await api.get('/travel-plans', { params });
    return res.data;
  },

  getPlanById: async (id) => {
    const res = await api.get(`/travel-plans/${id}`);
    return res.data;
  },

  createPlan: async (data) => {
    const res = await api.post('/travel-plans', data);
    return res.data;
  },

  updatePlan: async (id, data) => {
    const res = await api.patch(`/travel-plans/${id}`, data);
    return res.data;
  },

  deletePlan: async (id, permanent = false) => {
    const res = await api.delete(`/travel-plans/${id}${permanent ? '?permanent=true' : ''}`);
    return res.data;
  },

  addItemToPlan: async (planId, { itemType, itemId, notes }) => {
    const res = await api.post(`/travel-plans/${planId}/items`, {
      itemType,
      itemId,
      notes,
    });
    return res.data;
  },

  removeItemFromPlan: async (planId, itemSubDocId) => {
    const res = await api.delete(`/travel-plans/${planId}/items/${itemSubDocId}`);
    return res.data;
  },
};
