import api from './client.js';

export const inboxApi = {
  getConversations: async () => {
    const res = await api.get('/inbox');
    return res.data;
  },

  getConversation: async (conversationId) => {
    const res = await api.get(`/inbox/${conversationId}`);
    return res.data;
  },

  startConversation: async (listingId) => {
    const res = await api.post(`/inbox/start/${listingId}`);
    return res.data;
  },

  sendMessage: async (conversationId, body) => {
    const res = await api.post(`/inbox/${conversationId}/messages`, { body });
    return res.data;
  },
};
