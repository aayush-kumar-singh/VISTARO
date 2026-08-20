import api from './client.js';

export const reviewsApi = {
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
};
