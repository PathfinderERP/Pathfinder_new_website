import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null); // 'student' or 'admin'
  const [redirectAfterRegister, setRedirectAfterRegister] = useState(null);

  // Environment variables
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // Student endpoints - using environment variables
  const REGISTER_ENDPOINT =
    import.meta.env.VITE_AUTH_REGISTER_ENDPOINT || "/api/auth/register/";
  const LOGIN_ENDPOINT =
    import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || "/api/auth/login/";
  const VERIFY_ENDPOINT =
    import.meta.env.VITE_AUTH_VERIFY_ENDPOINT || "/api/auth/verify-token/";

  // Admin endpoints - using environment variables
  const ADMIN_LOGIN_ENDPOINT =
    import.meta.env.VITE_ADMIN_LOGIN_ENDPOINT || "/api/admin/auth/login/";
  const ADMIN_REGISTER_ENDPOINT =
    import.meta.env.VITE_ADMIN_REGISTER_ENDPOINT || "/api/admin/auth/register/";

  // Check for existing token on app start
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("userData");
    const savedAdmin = localStorage.getItem("admin_user");
    const savedAdminToken = localStorage.getItem("admin_token");
    const savedUserType = localStorage.getItem("userType");

    let studentRestored = false;
    let adminRestored = false;

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      studentRestored = true;
    }

    if (savedAdminToken && savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
      adminRestored = true;
    }

    // Set user type prioritize URL or existing type
    if (savedUserType) {
      setUserType(savedUserType);
    } else if (adminRestored && !studentRestored) {
      setUserType("admin");
    } else if (studentRestored) {
      setUserType("student");
    }

    if (studentRestored) {
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch(`${API_BASE_URL}${VERIFY_ENDPOINT}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(tokenToVerify);
        setUserType("student");
        localStorage.setItem("authToken", tokenToVerify);
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("userType", "student");
        setIsLoading(false);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      setIsLoading(false);
    }
  };

  // Student Authentication
  const login = async (loginData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        setUserType("student");
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("userType", "student");
        return { success: true, data };
      } else {
        let errorMessage = "Login failed";
        if (data.details) {
          errorMessage = Object.values(data.details).flat().join(", ");
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Network error in login:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  };

  // Admin Authentication
  const adminLogin = async (loginData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${ADMIN_LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
        setToken(data.token);
        setUserType("admin");
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.admin));
        localStorage.setItem("userType", "admin");
        return { success: true, data };
      } else {
        const errorMessage = data.error || "Admin login failed";
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Network error in admin login:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  };

  const register = async (userData, redirectTo = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}${REGISTER_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        setUserType("student");
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("userType", "student");

        if (redirectTo) {
          setRedirectAfterRegister(redirectTo);
        }

        return { success: true, data };
      } else {
        let errorMessage = "Registration failed";
        if (data.details) {
          errorMessage = Object.values(data.details).flat().join(", ");
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Network error in registration:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setToken(null);
    setUserType(null);
    setRedirectAfterRegister(null);

    // Clear all storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("userType");
  };

  const adminLogout = () => {
    setAdmin(null);
    setToken(null);
    setUserType(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("userType");
    window.location.href = "/admin/login";
  };

  const clearRedirect = () => {
    setRedirectAfterRegister(null);
  };

  const value = {
    // Student auth
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    redirectAfterRegister,
    clearRedirect,

    // Admin auth
    admin,
    adminLogin,
    adminLogout,
    userType,
    isStudentAuthenticated: !!user,
    isAdminAuthenticated: !!admin,
    updateUser: (newData) => {
      setUser(newData);
      localStorage.setItem("userData", JSON.stringify(newData));
    },
    setAuthenticatedUser: (userData, token) => {
      setUser(userData);
      setToken(token);
      // Only switch userType if we aren't currently an admin to avoid breaking admin flow
      const currentAdmin = localStorage.getItem("admin_token");
      if (!currentAdmin) {
        setUserType("student");
        localStorage.setItem("userType", "student");
      }
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
