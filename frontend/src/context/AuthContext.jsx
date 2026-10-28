import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state from localStorage on application start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Optionally verify token validity with backend
          try {
            const profile = await authService.getMe();
            if (profile) {
              setUser(profile);
              localStorage.setItem("user", JSON.stringify(profile));
            }
          } catch (profileError) {
            console.warn("Session check notice:", profileError.response?.data?.message || profileError.message);
            // If token invalid, logout
            if (profileError.response?.status === 401) {
              logout();
            }
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Log in user and persist credentials
   */
  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  };

  /**
   * Register new user or owner
   */
  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  };

  /**
   * Log out user and clear stored credentials
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isOwner: user?.role === "owner",
    isUser: user?.role === "user",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
