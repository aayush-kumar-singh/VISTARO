import client from './client.js';

export const tourPackagesApi = {
  // Get all active tour packages, with optional destination filter
  getTourPackages: async (params = {}) => {
    const res = await client.get('/tour-packages', { params });
    return res.data;
  },

  // Get single package detail by slug
  getTourPackageBySlug: async (slug) => {
    const res = await client.get(`/tour-packages/${slug}`);
    return res.data;
  },
};
