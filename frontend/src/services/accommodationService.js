import api from "./api";

export const accommodationService = {
  /**
   * Get all accommodations with optional query filters
   * params can include: search, location, minPrice, maxPrice, gender, facilities
   */
  getAll: async (params = {}) => {
    // Filter out undefined or empty strings
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== "" &&
        params[key] !== "All"
      ) {
        cleanParams[key] = params[key];
      }
    });

    const response = await api.get("/accommodations", { params: cleanParams });
    return response.data;
  },

  /**
   * Get a single accommodation by ID
   */
  getById: async (id) => {
    const response = await api.get(`/accommodations/${id}`);
    return response.data;
  },

  /**
   * Get all accommodations listed by the logged-in owner
   */
  getMyAccommodations: async () => {
    const response = await api.get("/accommodations/my");
    return response.data;
  },

  /**
   * Create a new accommodation listing (Owner only)
   */
  create: async (accommodationData) => {
    const response = await api.post("/accommodations", accommodationData);
    return response.data;
  },

  /**
   * Update an existing accommodation listing (Owner only)
   */
  update: async (id, updateData) => {
    const response = await api.put(`/accommodations/${id}`, updateData);
    return response.data;
  },

  /**
   * Toggle or update availability status (Owner only)
   */
  toggleAvailability: async (id, isAvailable) => {
    const response = await api.patch(`/accommodations/${id}/availability`, { isAvailable });
    return response.data;
  },

  /**
   * Delete an accommodation listing (Owner only)
   */
  delete: async (id) => {
    const response = await api.delete(`/accommodations/${id}`);
    return response.data;
  },
};
