import client from './client.js';

export const experiencesApi = {
  // Get all active experiences, with optional destination & category filters
  getExperiences: async (params = {}) => {
    const res = await client.get('/experiences', { params });
    return res.data;
  },

  // Get single experience detail by slug
  getExperienceBySlug: async (slug) => {
    const res = await client.get(`/experiences/${slug}`);
    return res.data;
  },
};
