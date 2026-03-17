import axios from "axios";
import env from "../config/env"; // Import the env configuration

const API_BASE_URL = env.API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased to 60s for Render cold starts
});

// Request interceptor to add auth token with better debugging
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("admin_token");
    const studentToken = localStorage.getItem("authToken");
    const userType = localStorage.getItem("userType");

    // Debug token information deleted for clean console


    // Priority Selection:
    // 1. If hitting admin-specific endpoints or user management, use admin token first
    // 2. If hitting student auth endpoints, use student token first
    // 3. Otherwise use whatever is available
    let tokenToUse = null;

    const isAdminEndpoint = config.url.includes('/api/business/admin/') ||
      config.url.includes('/api/auth/users/') ||
      config.url.includes('/api/auth/business/admin/') ||
      config.url.includes('/api/courses/business/admin/');

    const isStudentEndpoint = config.url.includes('/my_courses/') ||
      config.url.includes('/api/auth/profile/') ||
      config.url.includes('/api/auth/verify-token/') ||
      config.url.includes('/api/student-corner/orders/') ||
      config.url.includes('/purchase/');

    if (isAdminEndpoint) {
      tokenToUse = adminToken || studentToken;
    } else if (isStudentEndpoint) {
      tokenToUse = studentToken || adminToken;
    } else if (config.url.includes('/api/auth/')) {
      tokenToUse = studentToken || adminToken;
    } else {
      // Default to admin token if available for other endpoints (backward compatibility)
      tokenToUse = adminToken || studentToken;
    }

    if (tokenToUse) {
      config.headers.Authorization = `Bearer ${tokenToUse}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error Details:", {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      
      const userType = localStorage.getItem("userType");

      if (userType === "admin") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        localStorage.removeItem("userType");
        
        window.location.href = "/business/admin/login";
      } else {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("userType");
        
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      
      

      // Handle 403 as token expiry/auth failure
      // If a token exists, it's likely expired or invalid
      if (localStorage.getItem("admin_token") || localStorage.getItem("authToken")) {
        
        const userType = localStorage.getItem("userType");

        if (userType === "admin") {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          localStorage.removeItem("userType");
          
          window.location.href = "/business/admin/login";
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          localStorage.removeItem("userType");
          
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Token verification utility
export const verifyToken = async (token, userType = "admin") => {
  try {
    const response = await api.post("/api/business/admin/auth/debug-token/", { token });
    return response.data;
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return { valid: false, error: error.message };
  }
};

// Admin Auth API - Using env configuration
export const adminAuthAPI = {
  login: (credentials) => {
    return api.post(env.endpoints.ADMIN_LOGIN, credentials);

  },

  register: (adminData) => api.post(env.endpoints.ADMIN_REGISTER, adminData),

  forgotPassword: (email) => {
    return api.post(env.endpoints.ADMIN_FORGOT_PASSWORD, { email });

  },

  resetPassword: (data) => api.post(env.endpoints.ADMIN_RESET_PASSWORD, data),

  verifyResetToken: (token) =>
    api.get(`${env.endpoints.ADMIN_VERIFY_RESET_TOKEN}${token}/`),

  changePassword: (data) => api.post(env.endpoints.ADMIN_CHANGE_PASSWORD, data),

  getProfile: () => {
    return api.get(env.endpoints.ADMIN_PROFILE);
  },

  updateProfile: (data) => {
    return api.put("/api/business/admin/auth/update-profile/", data);
  },

  getDashboard: () => {
    return api.get(env.endpoints.ADMIN_DASHBOARD);
  },

  inviteAdmin: (inviteData) => {
    return api.post(env.endpoints.ADMIN_INVITE, inviteData);
  },

  getAllAdmins: () => {
    return api.get(env.endpoints.ADMIN_LIST);
  },

  registerWithInvite: (adminData) => {
    return api.post("/api/business/admin/auth/register-with-invite/", adminData);
  },

  // Add debug endpoint
  debugToken: (token) => {
    return api.post("/api/business/admin/auth/debug-token/", { token });
  },
};

// Courses API - Using env configuration
export const coursesAPI = {
  getAll: () => {
    return api.get(env.endpoints.COURSES, {
      params: {
        _t: new Date().getTime(),
        timestamp: new Date().toISOString() // Add redundant timestamp for certain proxy caches
      }
    });
  },

  getById: (id) => api.get(`${env.endpoints.COURSES}${id}/`),

  create: (courseData) => api.post(env.endpoints.COURSES, courseData),

  update: (id, courseData) =>
    api.patch(`${env.endpoints.COURSES}${id}/`, courseData),

  delete: (id) => api.delete(`${env.endpoints.COURSES}${id}/`),

  getStates: () => api.get(env.endpoints.COURSES_STATES),

  getDistricts: (state) =>
    api.get(`${env.endpoints.COURSES_DISTRICTS}?state=${state}`),

  getCentres: () => api.get(env.endpoints.COURSES_CENTRES),

  purchase: (data) => api.post(env.endpoints.PURCHASE, data),

  getMyCourses: () => {
    // Ensure we use the correct token or let interceptor handle it
    return api.get(env.endpoints.MY_COURSES);
  },

  getAdminAllData: () => api.get(env.endpoints.COURSES_ADMIN_ALLDATA),
};

// Applications API (for students) - Using env configuration
export const applicationsAPI = {
  create: (applicationData) => {
    return api.post(env.endpoints.APPLICATIONS, applicationData);
  },

  getAll: () => api.get(env.endpoints.APPLICATIONS),

  getById: (id) => api.get(`${env.endpoints.APPLICATIONS}${id}/`),
};

// Student Auth API - Using env configuration
export const studentAuthAPI = {
  login: (credentials) => {
    return api.post(env.endpoints.AUTH_LOGIN, credentials);
  },

  register: (userData) => api.post(env.endpoints.AUTH_REGISTER, userData),

  getProfile: () => {
    return api.get(env.endpoints.AUTH_PROFILE);
  },

  verifyToken: (token) => api.post(env.endpoints.AUTH_VERIFY, { token }),

  checkAuth: () => {
    return api.get(env.endpoints.AUTH_CHECK);
  },

  uploadProfileImage: (formData) => {
    return api.post("/api/auth/profile/upload-image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
  },

  removeProfileImage: () => {
    return api.delete("/api/auth/profile/remove-image/");
  },
};

// Admin Management API - Using env configuration
export const adminManagementAPI = {
  // Get all admins
  getAllAdmins: () => {
    return api.get(env.endpoints.ADMIN_LIST);
  },

  // Create admin directly
  createAdmin: (adminData) => {
    return api.post(env.endpoints.ADMIN_CREATE, adminData);
  },

  // Update admin details
  updateAdmin: (adminId, adminData) => {
    return api.put(
      `/api/business/admin/auth/${adminId}/update/`,
      adminData
    );
  },
  updateAdminPermissions: (adminId, permissionsData) => {
    return api.put(
      `${env.endpoints.ADMIN_PERMISSIONS}${adminId}/permissions/`,
      permissionsData
    );
  },

  // Delete admin
  deleteAdmin: (adminId) => {
    return api.delete(`${env.endpoints.ADMIN_DELETE}${adminId}/delete/`);
  },

  // Invite admin
  inviteAdmin: (inviteData) => {
    return api.post(env.endpoints.ADMIN_INVITE, inviteData);
  },
};

// Utility function to test authentication
export const testAuth = async () => {
  try {
    const adminToken = localStorage.getItem("admin_token");
    const studentToken = localStorage.getItem("authToken");

    /* auth test removed */


    if (adminToken) {
      const result = await adminAuthAPI.getProfile();
      return { type: "admin", data: result.data };
    } else if (studentToken) {
      const result = await studentAuthAPI.getProfile();
      return { type: "student", data: result.data };
    } else {
      return { type: "none", data: null };

    }
  } catch (error) {
    console.error(
      "❌ Auth Test Failed:",
      error.response?.data || error.message
    );
    return { type: "error", error: error.response?.data || error.message };
  }
};

export default api;

// User Management API - Using env configuration
export const userManagementAPI = {
  // Get all users with pagination and filters
  getAllUsers: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(
      `${env.endpoints.USERS_LIST}${queryParams ? `?${queryParams}` : ""}`
    );
  },

  // Get user statistics
  getUserStats: () => {
    return api.get(env.endpoints.USERS_STATS);
  },

  // Get user details
  getUserDetail: (userId) => {
    return api.get(`${env.endpoints.USER_DETAIL}${userId}/`);
  },

  // Update user status
  updateUserStatus: (userId, isActive) => {
    return api.put(`${env.endpoints.USER_STATUS}${userId}/status/`, {
      is_active: isActive,
    });
  },

  // Delete user
  deleteUser: (userId) => {
    return api.delete(`${env.endpoints.USER_DELETE}${userId}/delete/`);
  },

  // ADD THIS MISSING FUNCTION - Create student user by admin
  createUser: (userData) => {
    return api.post(env.endpoints.USER_CREATE, userData);
  },

  // Reset user password (admin)
  resetUserPassword: (userId, password) => {
    return api.post(`${env.endpoints.USERS_LIST}${userId}/reset-password/`, { password });
  },

  // Get user enrollments (admin)
  getUserEnrollments: (userId) => {
    return api.get(`/api/courses/business/admin/user_enrollments/?user_id=${userId}`);
  },
};

// Updated Centres API section in api.js
export const centresAPI = {
  // Basic CRUD operations
  getAll: () => {
    return api.get(env.endpoints.CENTRES);
  },

  getById: (id) => api.get(`${env.endpoints.CENTRES}${id}/`),

  create: (centreData) => api.post(env.endpoints.CENTRES, centreData),

  update: (id, centreData) =>
    api.patch(`${env.endpoints.CENTRES}${id}/`, centreData),

  delete: (id) => api.delete(`${env.endpoints.CENTRES}${id}/`),

  // NEW: MongoDB Image Upload Methods
  uploadCentreLogo: async (centreId, imageFile) => {
    const formData = new FormData();

    formData.append("logo", imageFile);

    const response = await api.post(
      env.endpoints.CENTRE_LOGO_UPLOAD.replace("{centre_id}", centreId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  // In your api.js file - FIX THIS FUNCTION
  uploadTopperImage: async (centreId, formData) => {
    try {
      // Use the existing axios instance (api) which has the interceptors
      const response = await api.post(
        `/api/centres/${centreId}/upload-topper-image/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // The Authorization header will be automatically added by the interceptor
          },
          timeout: 30000,
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  },

  getCentreLogo: (centreId) => {
    return api.get(
      env.endpoints.CENTRE_LOGO_GET.replace("{centre_id}", centreId)
    );
  },

  // Legacy method for general image upload (if needed)
  uploadImage: async (imageFile) => {
    const formData = new FormData();

    formData.append("image", imageFile);

    const response = await api.post(env.endpoints.IMAGE_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Data endpoints (keep existing)
  getStates: () => {
    return api.get(env.endpoints.CENTRES_STATES);
  },

  getDistricts: (state) => {
    return api.get(
      `${env.endpoints.CENTRES_DISTRICTS}?state=${encodeURIComponent(state)}`
    );
  },

  getCentres: (state, district) => {
    let url = env.endpoints.CENTRES_LIST;
    const params = new URLSearchParams();

    if (state) params.append("state", state);
    if (district) params.append("district", district);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return api.get(url);
  },

  getCentreDetails: (centreName) => {
    return api.get(
      `${env.endpoints.CENTRES_DETAILS}?centre=${encodeURIComponent(
        centreName
      )}`
    );
  },

  // Fetch all toppers from all centres
  getToppers: () => {
    return api.get(`${env.endpoints.CENTRES}toppers/`);
  },
};

// Alumni API
export const alumniAPI = {
  // Get all alumni (with optional filters)
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/api/alumni/${queryParams ? `?${queryParams}` : ""}`);
  },

  // Get alumni by ID
  getById: (id) => {
    return api.get(`/api/alumni/${id}/`);
  },

  // Create new alumni entry (admin only)
  create: (alumniData) => {
    return api.post("/api/alumni/", alumniData);
  },

  // Update alumni entry (admin only)
  update: (id, alumniData) => {
    return api.patch(`/api/alumni/${id}/`, alumniData);
  },

  // Delete alumni entry (admin only)
  delete: (id) => {
    return api.delete(`/api/alumni/${id}/`);
  },

  // Get alumni grouped by profession
  getByProfession: (year = null) => {
    const url = year ? `/api/alumni/by_profession/?year=${year}` : "/api/alumni/by_profession/";
    return api.get(url);
  },

  // Get alumni grouped by year
  getByYear: (profession = null) => {
    const url = profession ? `/api/alumni/by_year/?profession=${profession}` : "/api/alumni/by_year/";
    return api.get(url);
  },

  // Get list of available years
  getYears: () => {
    return api.get("/api/alumni/years/");
  },

  // Get list of professions
  getProfessions: () => {
    return api.get("/api/alumni/professions/");
  },
};

// Student Corner API
export const studentCornerAPI = {
  // Get all items
  getAllItems: (params) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/api/student-corner/items/${queryParams ? `?${queryParams}` : ""}`);
  },

  // Create item
  createItem: (itemData) => {
    return api.post('/api/student-corner/items/', itemData);
  },

  // Update item
  updateItem: (id, itemData) => {
    return api.patch(`/api/student-corner/items/${id}/`, itemData);
  },

  // Delete item
  deleteItem: (id) => {
    return api.delete(`/api/student-corner/items/${id}/`);
  },

  // Upload image
  uploadImage: (imageFile) => {
    const formData = new FormData();

    formData.append("image", imageFile);
    return api.post('/api/student-corner/items/upload-image/', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
  },

  // Purchase items
  purchase: (purchaseData) => {
    return api.post('/api/student-corner/purchase/', purchaseData);
  },

  // Get current user's orders
  getMyOrders: () => {
    return api.get('/api/student-corner/orders/');
  },

  // Get specific user's orders (admin only)
  getUserOrders: (userId) => {
    return api.get(`/api/student-corner/orders/user_orders/?user_id=${userId}`);
  }
};

// Blog API
export const blogAPI = {
  // Get all blog posts
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/api/blog/posts/${queryParams ? `?${queryParams}` : ""}`);
  },

  // Get blog post by ID or Slug
  getById: (id) => {
    return api.get(`/api/blog/posts/${id}/`);
  },

  // Create new blog post
  create: (blogData) => {
    return api.post("/api/blog/posts/", blogData);
  },

  // Update blog post
  update: (id, blogData) => {
    return api.patch(`/api/blog/posts/${id}/`, blogData);
  },

  // Delete blog post
  delete: (id) => {
    return api.delete(`/api/blog/posts/${id}/`);
  },

  // Get distinct categories
  getCategories: () => {
    return api.get("/api/blog/posts/categories/");
  }
};

// Landing Page Registration API
export const landingAPI = {
  register: (registrationData) => {
    return api.post("/api/landing/register/", registrationData);
  },

  list: () => {
    return api.get("/api/landing/list/");
  }
};

