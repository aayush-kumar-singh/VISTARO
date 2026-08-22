import client from './client.js';

export const supportApi = {
  // Submit platform-level contact / support inquiry
  submitContact: async (data) => {
    const res = await client.post('/support/contact', { contact: data });
    return res.data;
  },
};
