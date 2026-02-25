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

    // Debug token information
    if (env.DEBUG) {
      console.log("🔐 Token Debug:", {
        hasAdminToken: !!adminToken,
        hasStudentToken: !!studentToken,
        userType: userType,
        adminTokenPreview: adminToken
          ? `${adminToken.substring(0, 50)}...`
          : "None",
        url: config.url,
      });
    }

    // Priority Selection:
    // 1. If hitting admin-specific endpoints or user management, use admin token first
    // 2. If hitting student auth endpoints, use student token first
    // 3. Otherwise use whatever is available
    let tokenToUse = null;

    const isAdminEndpoint = config.url.includes('/api/admin/') ||
      config.url.includes('/api/auth/users/') ||
      config.url.includes('/api/auth/admin/') ||
      config.url.includes('/api/courses/admin/');

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
      const usedStudentToken = tokenToUse === studentToken && studentToken !== adminToken;
      if (env.DEBUG) {
        console.log(`✅ Using ${usedStudentToken ? 'Student' : 'Admin'} Token for request:`, config.url);
      }
    } else {
      if (env.DEBUG) console.log("⚠️ No auth token found for request:", config.url);
    }

    if (env.DEBUG) {
      console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
      console.log("📋 Request Headers:", {
        Authorization: config.headers.Authorization ? "Present" : "Missing",
        "Content-Type": config.headers["Content-Type"],
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors with better debugging
api.interceptors.response.use(
  (response) => {
    if (env.DEBUG) {
      console.log("✅ API Response Success:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
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
      console.log("🔐 401 Unauthorized - Clearing tokens");
      const userType = localStorage.getItem("userType");

      if (userType === "admin") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        localStorage.removeItem("userType");
        console.log("🔄 Redirecting to admin login");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("userType");
        console.log("🔄 Redirecting to student login");
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      console.log("🚫 403 Forbidden - Authentication issue detected");
      console.log("💡 Possible causes:", {
        tokenPresent:
          !!localStorage.getItem("admin_token") ||
          !!localStorage.getItem("authToken"),
        userType: localStorage.getItem("userType"),
        endpoint: error.config?.url,
      });

      // Handle 403 as token expiry/auth failure
      // If a token exists, it's likely expired or invalid
      if (localStorage.getItem("admin_token") || localStorage.getItem("authToken")) {
        console.log("↪️ Treating 403 as auth failure explicitly -> Force Logout");
        const userType = localStorage.getItem("userType");

        if (userType === "admin") {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          localStorage.removeItem("userType");
          console.log("🔄 Redirecting to admin login");
          window.location.href = "/admin/login";
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          localStorage.removeItem("userType");
          console.log("🔄 Redirecting to student login");
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
    const response = await api.post("/api/admin/auth/debug-token/", { token });
    return response.data;
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return { valid: false, error: error.message };
  }
};

// Admin Auth API - Using env configuration
export const adminAuthAPI = {
  login: (credentials) => {
    console.log("🔐 Admin Login Attempt:", credentials.email);
    return api.post(env.endpoints.ADMIN_LOGIN, credentials);
  },

  register: (adminData) => api.post(env.endpoints.ADMIN_REGISTER, adminData),

  forgotPassword: (email) => {
    console.log("🔑 Forgot Password Request:", email);
    return api.post(env.endpoints.ADMIN_FORGOT_PASSWORD, { email });
  },

  resetPassword: (data) => api.post(env.endpoints.ADMIN_RESET_PASSWORD, data),

  verifyResetToken: (token) =>
    api.get(`${env.endpoints.ADMIN_VERIFY_RESET_TOKEN}${token}/`),

  changePassword: (data) => api.post(env.endpoints.ADMIN_CHANGE_PASSWORD, data),

  getProfile: () => {
    console.log("👤 Fetching Admin Profile");
    return api.get(env.endpoints.ADMIN_PROFILE);
  },

  updateProfile: (data) => {
    console.log("👤 Updating Admin Profile");
    return api.put("/api/admin/auth/update-profile/", data);
  },

  getDashboard: () => {
    console.log("📊 Fetching Admin Dashboard");
    const token = localStorage.getItem("admin_token");
    console.log(
      "🔐 Dashboard Token Check:",
      token ? `Present (${token.substring(0, 30)}...)` : "Missing"
    );
    return api.get(env.endpoints.ADMIN_DASHBOARD);
  },

  inviteAdmin: (inviteData) => {
    console.log("📧 Inviting Admin:", inviteData.email);
    return api.post(env.endpoints.ADMIN_INVITE, inviteData);
  },

  getAllAdmins: () => {
    console.log("👥 Fetching All Admins");
    return api.get(env.endpoints.ADMIN_LIST);
  },

  registerWithInvite: (adminData) => {
    console.log("✅ Registering with Invite");
    return api.post("/api/admin/auth/register-with-invite/", adminData);
  },

  // Add debug endpoint
  debugToken: (token) => {
    return api.post("/api/admin/auth/debug-token/", { token });
  },
};

// Courses API - Using env configuration
export const coursesAPI = {
  getAll: () => {
    console.log("📚 Fetching All Courses");
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
    console.log("📝 Creating Application");
    return api.post(env.endpoints.APPLICATIONS, applicationData);
  },

  getAll: () => api.get(env.endpoints.APPLICATIONS),

  getById: (id) => api.get(`${env.endpoints.APPLICATIONS}${id}/`),
};

// Student Auth API - Using env configuration
export const studentAuthAPI = {
  login: (credentials) => {
    console.log("🔐 Student Login Attempt:", credentials.email);
    return api.post(env.endpoints.AUTH_LOGIN, credentials);
  },

  register: (userData) => api.post(env.endpoints.AUTH_REGISTER, userData),

  getProfile: () => {
    console.log("👤 Fetching Student Profile");
    return api.get(env.endpoints.AUTH_PROFILE);
  },

  verifyToken: (token) => api.post(env.endpoints.AUTH_VERIFY, { token }),

  checkAuth: () => {
    console.log("🔍 Checking Student Auth Status");
    return api.get(env.endpoints.AUTH_CHECK);
  },

  uploadProfileImage: (formData) => {
    console.log("🖼️ Uploading Profile Image");
    return api.post("/api/auth/profile/upload-image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });
  },

  removeProfileImage: () => {
    console.log("🗑️ Removing Profile Image");
    return api.delete("/api/auth/profile/remove-image/");
  },
};

// Admin Management API - Using env configuration
export const adminManagementAPI = {
  // Get all admins
  getAllAdmins: () => {
    console.log("👥 Fetching all admins");
    return api.get(env.endpoints.ADMIN_LIST);
  },

  // Create admin directly
  createAdmin: (adminData) => {
    console.log("➕ Creating admin:", adminData.email);
    return api.post(env.endpoints.ADMIN_CREATE, adminData);
  },

  // Update admin details
  updateAdmin: (adminId, adminData) => {
    console.log("🔧 Updating admin details:", adminId);
    return api.put(
      `/api/admin/auth/${adminId}/update/`,
      adminData
    );
  },
  updateAdminPermissions: (adminId, permissionsData) => {
    console.log("🔧 Updating admin permissions:", adminId);
    return api.put(
      `${env.endpoints.ADMIN_PERMISSIONS}${adminId}/permissions/`,
      permissionsData
    );
  },

  // Delete admin
  deleteAdmin: (adminId) => {
    console.log("🗑️ Deleting admin:", adminId);
    return api.delete(`${env.endpoints.ADMIN_DELETE}${adminId}/delete/`);
  },

  // Invite admin
  inviteAdmin: (inviteData) => {
    console.log("📧 Inviting admin:", inviteData.email);
    return api.post(env.endpoints.ADMIN_INVITE, inviteData);
  },
};

// Utility function to test authentication
export const testAuth = async () => {
  try {
    const adminToken = localStorage.getItem("admin_token");
    const studentToken = localStorage.getItem("authToken");

    console.log("🧪 Auth Test:", {
      hasAdminToken: !!adminToken,
      hasStudentToken: !!studentToken,
      userType: localStorage.getItem("userType"),
    });

    if (adminToken) {
      const result = await adminAuthAPI.getProfile();
      console.log("✅ Admin Auth Test Passed:", result.data);
      return { type: "admin", data: result.data };
    } else if (studentToken) {
      const result = await studentAuthAPI.getProfile();
      console.log("✅ Student Auth Test Passed:", result.data);
      return { type: "student", data: result.data };
    } else {
      console.log("❌ No valid tokens found");
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
    console.log("👥 Fetching users with params:", params);
    const queryParams = new URLSearchParams(params).toString();
    return api.get(
      `${env.endpoints.USERS_LIST}${queryParams ? `?${queryParams}` : ""}`
    );
  },

  // Get user statistics
  getUserStats: () => {
    console.log("📊 Fetching user statistics");
    return api.get(env.endpoints.USERS_STATS);
  },

  // Get user details
  getUserDetail: (userId) => {
    console.log("👤 Fetching user details:", userId);
    return api.get(`${env.endpoints.USER_DETAIL}${userId}/`);
  },

  // Update user status
  updateUserStatus: (userId, isActive) => {
    console.log("🔄 Updating user status:", { userId, isActive });
    return api.put(`${env.endpoints.USER_STATUS}${userId}/status/`, {
      is_active: isActive,
    });
  },

  // Delete user
  deleteUser: (userId) => {
    console.log("🗑️ Deleting user:", userId);
    return api.delete(`${env.endpoints.USER_DELETE}${userId}/delete/`);
  },

  // ADD THIS MISSING FUNCTION - Create student user by admin
  createUser: (userData) => {
    console.log("➕ Creating student user:", userData.email);
    return api.post(env.endpoints.USER_CREATE, userData);
  },

  // Reset user password (admin)
  resetUserPassword: (userId, password) => {
    console.log("🔐 Resetting password for user:", userId);
    return api.post(`${env.endpoints.USERS_LIST}${userId}/reset-password/`, { password });
  },

  // Get user enrollments (admin)
  getUserEnrollments: (userId) => {
    console.log("📚 Fetching enrollments for user:", userId);
    return api.get(`/api/courses/admin/user_enrollments/?user_id=${userId}`);
  },
};

// Updated Centres API section in api.js
export const centresAPI = {
  // Basic CRUD operations
  getAll: () => {
    console.log("🏢 Fetching all centres");
    return api.get(env.endpoints.CENTRES);
  },

  getById: (id) => api.get(`${env.endpoints.CENTRES}${id}/`),

  create: (centreData) => api.post(env.endpoints.CENTRES, centreData),

  update: (id, centreData) =>
    api.patch(`${env.endpoints.CENTRES}${id}/`, centreData),

  delete: (id) => api.delete(`${env.endpoints.CENTRES}${id}/`),

  // NEW: MongoDB Image Upload Methods
  uploadCentreLogo: async (centreId, imageFile) => {
    console.log("🏢 Uploading centre logo for:", centreId);

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
    console.log(`🔍 API CALL: Uploading topper image for centre ${centreId}`);
    console.log(`🔍 API URL: /api/centres/${centreId}/upload-topper-image/`);

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

      console.log("✅ Topper image upload successful");
      return response;
    } catch (error) {
      console.error("❌ Topper image upload failed:", error);
      throw error;
    }
  },

  getCentreLogo: (centreId) => {
    console.log("🖼️ Fetching centre logo for:", centreId);
    return api.get(
      env.endpoints.CENTRE_LOGO_GET.replace("{centre_id}", centreId)
    );
  },

  // Legacy method for general image upload (if needed)
  uploadImage: async (imageFile) => {
    console.log("🖼️ General image upload:", imageFile.name);

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
    console.log("🗺️ Fetching states for centres");
    return api.get(env.endpoints.CENTRES_STATES);
  },

  getDistricts: (state) => {
    console.log("📍 Fetching districts for state:", state);
    return api.get(
      `${env.endpoints.CENTRES_DISTRICTS}?state=${encodeURIComponent(state)}`
    );
  },

  getCentres: (state, district) => {
    console.log("🏢 Fetching centres for:", { state, district });
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
    console.log("🔍 Fetching centre details for:", centreName);
    return api.get(
      `${env.endpoints.CENTRES_DETAILS}?centre=${encodeURIComponent(
        centreName
      )}`
    );
  },

  // Fetch all toppers from all centres
  getToppers: () => {
    console.log("🏆 Fetching all toppers from all centres");
    return api.get(`${env.endpoints.CENTRES}toppers/`);
  },
};

// Alumni API
export const alumniAPI = {
  // Get all alumni (with optional filters)
  getAll: (params = {}) => {
    console.log("🎓 Fetching all alumni with params:", params);
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/api/alumni/${queryParams ? `?${queryParams}` : ""}`);
  },

  // Get alumni by ID
  getById: (id) => {
    console.log("🎓 Fetching alumni by ID:", id);
    return api.get(`/api/alumni/${id}/`);
  },

  // Create new alumni entry (admin only)
  create: (alumniData) => {
    console.log("➕ Creating alumni entry");
    return api.post("/api/alumni/", alumniData);
  },

  // Update alumni entry (admin only)
  update: (id, alumniData) => {
    console.log("🔄 Updating alumni:", id);
    return api.patch(`/api/alumni/${id}/`, alumniData);
  },

  // Delete alumni entry (admin only)
  delete: (id) => {
    console.log("🗑️ Deleting alumni:", id);
    return api.delete(`/api/alumni/${id}/`);
  },

  // Get alumni grouped by profession
  getByProfession: (year = null) => {
    console.log("👥 Fetching alumni grouped by profession", year ? `for year ${year}` : "");
    const url = year ? `/api/alumni/by_profession/?year=${year}` : "/api/alumni/by_profession/";
    return api.get(url);
  },

  // Get alumni grouped by year
  getByYear: (profession = null) => {
    console.log("📅 Fetching alumni grouped by year", profession ? `for profession ${profession}` : "");
    const url = profession ? `/api/alumni/by_year/?profession=${profession}` : "/api/alumni/by_year/";
    return api.get(url);
  },

  // Get list of available years
  getYears: () => {
    console.log("📅 Fetching available years");
    return api.get("/api/alumni/years/");
  },

  // Get list of professions
  getProfessions: () => {
    console.log("👔 Fetching professions");
    return api.get("/api/alumni/professions/");
  },
};

// Student Corner API
export const studentCornerAPI = {
  // Get all items
  getAllItems: (params) => {
    console.log("📚 Fetching student corner items");
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/api/student-corner/items/${queryParams ? `?${queryParams}` : ""}`);
  },

  // Create item
  createItem: (itemData) => {
    console.log("➕ Creating student corner item");
    return api.post('/api/student-corner/items/', itemData);
  },

  // Update item
  updateItem: (id, itemData) => {
    console.log("🔄 Updating student corner item:", id);
    return api.patch(`/api/student-corner/items/${id}/`, itemData);
  },

  // Delete item
  deleteItem: (id) => {
    console.log("🗑️ Deleting student corner item:", id);
    return api.delete(`/api/student-corner/items/${id}/`);
  },

  // Upload image
  uploadImage: (imageFile) => {
    console.log("🖼️ Uploading item image");
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
    console.log("🛒 Purchasing student corner items");
    return api.post('/api/student-corner/purchase/', purchaseData);
  },

  // Get current user's orders
  getMyOrders: () => {
    console.log("📦 Fetching my student corner orders");
    return api.get('/api/student-corner/orders/');
  },

  // Get specific user's orders (admin only)
  getUserOrders: (userId) => {
    console.log("📦 Fetching student corner orders for user:", userId);
    return api.get(`/api/student-corner/orders/user_orders/?user_id=${userId}`);
  }
};

// Blog API
export const blogAPI = {
  // Get all blog posts
  getAll: (params = {}) => {
    console.log("📝 Fetching all blog posts with params:", params);
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/api/blog/posts/${queryParams ? `?${queryParams}` : ""}`);
  },

  // Get blog post by ID or Slug
  getById: (id) => {
    console.log("📝 Fetching blog post by ID/Slug:", id);
    return api.get(`/api/blog/posts/${id}/`);
  },

  // Create new blog post
  create: (blogData) => {
    console.log("➕ Creating new blog post");
    return api.post("/api/blog/posts/", blogData);
  },

  // Update blog post
  update: (id, blogData) => {
    console.log("🔄 Updating blog post:", id);
    return api.patch(`/api/blog/posts/${id}/`, blogData);
  },

  // Delete blog post
  delete: (id) => {
    console.log("🗑️ Deleting blog post:", id);
    return api.delete(`/api/blog/posts/${id}/`);
  },

  // Get distinct categories
  getCategories: () => {
    console.log("📑 Fetching blog categories");
    return api.get("/api/blog/posts/categories/");
  }
};

// Landing Page Registration API
export const landingAPI = {
  register: (registrationData) => {
    console.log("📝 Submitting landing page registration:", registrationData.name);
    return api.post("/api/landing/register/", registrationData);
  },

  list: () => {
    console.log("📋 Fetching all landing page registrations");
    return api.get("/api/landing/list/");
  }
};

