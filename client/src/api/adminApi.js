import client from './client.js';

export const adminApi = {
  getStats: async () => {
    const res = await client.get('/admin/stats');
    return res.data;
  },

  getUsers: async () => {
    const res = await client.get('/admin/users');
    return res.data;
  },

  updateUserRole: async (userId, role) => {
    const res = await client.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  deleteUser: async (userId) => {
    const res = await client.delete(`/admin/users/${userId}`);
    return res.data;
  },

  deleteListing: async (listingId) => {
    const res = await client.delete(`/admin/listings/${listingId}`);
    return res.data;
  },

  // Tour Packages Management
  getTourPackages: async () => {
    const res = await client.get('/admin/tour-packages');
    return res.data;
  },

  createTourPackage: async (data) => {
    const isFormData = data instanceof FormData;
    const res = await client.post('/admin/tour-packages', isFormData ? data : { tourPackage: data }, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  updateTourPackage: async (id, data) => {
    const isFormData = data instanceof FormData;
    const res = await client.patch(`/admin/tour-packages/${id}`, isFormData ? data : { tourPackage: data }, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  deactivateTourPackage: async (id) => {
    const res = await client.delete(`/admin/tour-packages/${id}`);
    return res.data;
  },

  // Destinations Management
  createDestination: async (data) => {
    const res = await client.post('/admin/destinations', { destination: data });
    return res.data;
  },

  updateDestination: async (id, data) => {
    const res = await client.patch(`/admin/destinations/${id}`, { destination: data });
    return res.data;
  },

  // Experiences Management (Phase 3)
  getExperiences: async () => {
    const res = await client.get('/admin/experiences');
    return res.data;
  },

  createExperience: async (data) => {
    const isFormData = data instanceof FormData;
    const res = await client.post('/admin/experiences', isFormData ? data : { experience: data }, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  updateExperience: async (id, data) => {
    const isFormData = data instanceof FormData;
    const res = await client.patch(`/admin/experiences/${id}`, isFormData ? data : { experience: data }, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  deactivateExperience: async (id) => {
    const res = await client.delete(`/admin/experiences/${id}`);
    return res.data;
  },

  // Transfers & Cabs Management (Phase 6 / Part 6.4)
  getTransfers: async () => {
    const res = await client.get('/admin/transfers');
    return res.data;
  },

  createTransfer: async (data) => {
    const isFormData = data instanceof FormData;
    const res = await client.post('/admin/transfers', isFormData ? data : { transfer: data }, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  updateTransfer: async (id, data) => {
    const isFormData = data instanceof FormData;
    const res = await client.patch(`/admin/transfers/${id}`, isFormData ? data : { transfer: data }, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
    });
    return res.data;
  },

  deactivateTransfer: async (id) => {
    const res = await client.delete(`/admin/transfers/${id}`);
    return res.data;
  },
};

