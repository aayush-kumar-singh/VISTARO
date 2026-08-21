import api from './client.js';

export const reviewsApi = {
  // Stay Listing Reviews
  createReview: async (listingId, reviewData) => {
    const res = await api.post(`/listings/${listingId}/reviews`, reviewData);
    return res.data;
  },

  deleteReview: async (listingId, reviewId) => {
    const res = await api.delete(`/listings/${listingId}/reviews/${reviewId}`);
    return res.data;
  },

  addReply: async (listingId, reviewId, replyData) => {
    const res = await api.post(`/listings/${listingId}/reviews/${reviewId}/reply`, replyData);
    return res.data;
  },

  deleteReply: async (listingId, reviewId) => {
    const res = await api.delete(`/listings/${listingId}/reviews/${reviewId}/reply`);
    return res.data;
  },

  // Tour Package Reviews
  createPackageReview: async (packageId, reviewData) => {
    const res = await api.post(`/tour-packages/${packageId}/reviews`, reviewData);
    return res.data;
  },

  deletePackageReview: async (packageId, reviewId) => {
    const res = await api.delete(`/tour-packages/${packageId}/reviews/${reviewId}`);
    return res.data;
  },

  addPackageReply: async (packageId, reviewId, replyData) => {
    const res = await api.post(`/tour-packages/${packageId}/reviews/${reviewId}/reply`, replyData);
    return res.data;
  },

  deletePackageReply: async (packageId, reviewId) => {
    const res = await api.delete(`/tour-packages/${packageId}/reviews/${reviewId}/reply`);
    return res.data;
  },

  // Experience Reviews (Phase 3 / Part 3.8)
  createExperienceReview: async (experienceId, reviewData) => {
    const res = await api.post(`/experiences/${experienceId}/reviews`, reviewData);
    return res.data;
  },

  deleteExperienceReview: async (experienceId, reviewId) => {
    const res = await api.delete(`/experiences/${experienceId}/reviews/${reviewId}`);
    return res.data;
  },

  addExperienceReply: async (experienceId, reviewId, replyData) => {
    const res = await api.post(`/experiences/${experienceId}/reviews/${reviewId}/reply`, replyData);
    return res.data;
  },

  deleteExperienceReply: async (experienceId, reviewId) => {
    const res = await api.delete(`/experiences/${experienceId}/reviews/${reviewId}/reply`);
    return res.data;
  },
};
