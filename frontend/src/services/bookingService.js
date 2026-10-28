import api from "./api";

export const bookingService = {
  /**
   * Create a new booking request for an accommodation
   */
  create: async (accommodationId) => {
    const response = await api.post("/bookings", { accommodationId });
    return response.data;
  },

  /**
   * Get all booking requests submitted by the logged-in user
   */
  getMyBookings: async () => {
    const response = await api.get("/bookings/my");
    return response.data;
  },

  /**
   * Get all booking requests received for accommodations owned by the logged-in owner
   */
  getOwnerBookings: async () => {
    const response = await api.get("/bookings/owner");
    return response.data;
  },

  /**
   * Approve a booking request (Owner only - automatically sets accommodation unavailable)
   */
  approve: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/approve`);
    return response.data;
  },

  /**
   * Reject a booking request (Owner only)
   */
  reject: async (bookingId) => {
    const response = await api.put(`/bookings/${bookingId}/reject`);
    return response.data;
  },
};
