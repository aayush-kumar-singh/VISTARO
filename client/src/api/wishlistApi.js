import api from './client.js';

export const wishlistApi = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    return res.data;
  },

  toggleWishlist: async (listingId) => {
    const res = await api.post(`/wishlist/${listingId}/toggle`);
    return res.data;
  },
};
