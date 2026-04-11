import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axios.js";

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Verify email with OTP
  const verifyEmail = async (email, otp) => {
    try {
      const response = await axiosInstance.post("/auth/verify-email", {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Resend OTP
  const resendOTP = async (email) => {
    try {
      const response = await axiosInstance.post("/auth/resend-otp", { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const { token: newToken, refreshToken, user: userData } = response.data;

      // Store tokens and user data
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Get user profile
  const getProfile = async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // Update user data locally
  const updateUserData = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    verifyEmail,
    resendOTP,
    forgotPassword,
    getProfile,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
