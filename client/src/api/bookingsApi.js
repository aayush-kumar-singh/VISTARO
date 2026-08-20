import api from './client.js';

export const bookingsApi = {
  createBooking: async (listingId, bookingData) => {
    const res = await api.post(`/listings/${listingId}/bookings`, bookingData);
    return res.data;
  },

  cancelBooking: async (bookingId, data = {}) => {
    const res = await api.delete(`/bookings/${bookingId}`, { data });
    return res.data;
  },
};
