import api from "./api";

export const authService = {
  /**
   * Register a new user or owner
   */
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Login user with email and password
   */
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
