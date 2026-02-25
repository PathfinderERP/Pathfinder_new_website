import { useState, useEffect, useCallback } from "react";
import { adminAuthAPI } from "../services/api";

export const useAuth = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const adminData = localStorage.getItem("admin_user");

    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing admin data:", error);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await adminAuthAPI.login(credentials);
      const { token, admin: adminData } = response.data;

      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(adminData));

      setAdmin(adminData);
      setIsAuthenticated(true);

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdmin(null);
    setIsAuthenticated(false);
    window.location.href = "/admin/login";
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await adminAuthAPI.forgotPassword({ email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to send reset email",
      };
    }
  }, []);

  const resetPassword = useCallback(async (data) => {
    try {
      const response = await adminAuthAPI.resetPassword(data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Password reset failed",
      };
    }
  }, []);

  return {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    forgotPassword,
    resetPassword,
  };
};
