import api from './client.js';

export const bookingsApi = {
  getMyBookings: async (params = {}) => {
    const res = await api.get('/my-bookings', { params });
    return res.data;
  },

  getBookingById: async (bookingId) => {
    const res = await api.get(`/bookings/${bookingId}`);
    return res.data;
  },

  createBooking: async (listingId, bookingData) => {
    const res = await api.post(`/listings/${listingId}/bookings`, bookingData);
    return res.data;
  },

  createPackageBooking: async (packageId, bookingData) => {
    const res = await api.post(`/tour-packages/${packageId}/bookings`, bookingData);
    return res.data;
  },

  createExperienceBooking: async (experienceId, bookingData) => {
    const res = await api.post(`/experiences/${experienceId}/bookings`, bookingData);
    return res.data;
  },

  cancelBooking: async (bookingId, data = {}) => {
    const res = await api.delete(`/bookings/${bookingId}`, { data });
    return res.data;
  },
};
