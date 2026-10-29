import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Automatically attach JWT token to all requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Extract clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired (401), can clear token if necessary
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      // Token might be expired
      // Could optionally clear localStorage and redirect if needed
    }
    return Promise.reject(error);
  }
);

export default api;
