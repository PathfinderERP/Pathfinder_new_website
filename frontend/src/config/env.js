// Environment configuration helper - UPDATED WITH ALL ENDPOINTS
const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  DEBUG: import.meta.env.VITE_DEBUG === "true",

  // App Configuration
  APP_TITLE: import.meta.env.VITE_APP_TITLE || "Pathfinder Academy",
  ADMIN_APP_TITLE:
    import.meta.env.VITE_ADMIN_APP_TITLE || "Pathfinder Academy Admin",

  // Contact Information
  CONTACT_PHONE: import.meta.env.VITE_CONTACT_PHONE || "+91-9147178886",
  CONTACT_EMAIL:
    import.meta.env.VITE_CONTACT_EMAIL || "[EMAIL_ADDRESS]",
  SUPPORT_EMAIL:
    import.meta.env.VITE_SUPPORT_EMAIL || "[EMAIL_ADDRESS]",

  // API Endpoints
  endpoints: {
    // Student Auth
    AUTH_LOGIN: import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || "/api/auth/login/",
    AUTH_REGISTER:
      import.meta.env.VITE_AUTH_REGISTER_ENDPOINT || "/api/auth/register/",
    AUTH_PROFILE:
      import.meta.env.VITE_AUTH_PROFILE_ENDPOINT || "/api/auth/profile/",
    AUTH_VERIFY:
      import.meta.env.VITE_AUTH_VERIFY_ENDPOINT || "/api/auth/verify-token/",
    AUTH_CHECK:
      import.meta.env.VITE_AUTH_CHECK_ENDPOINT || "/api/auth/check-auth/",

    // User Management
    USERS_LIST: import.meta.env.VITE_USERS_LIST_ENDPOINT || "/api/auth/users/",
    USERS_STATS:
      import.meta.env.VITE_USERS_STATS_ENDPOINT || "/api/auth/users/stats/",
    USER_DETAIL:
      import.meta.env.VITE_USER_DETAIL_ENDPOINT || "/api/auth/users/",
    USER_STATUS:
      import.meta.env.VITE_USER_STATUS_ENDPOINT || "/api/auth/users/",
    USER_DELETE:
      import.meta.env.VITE_USER_DELETE_ENDPOINT || "/api/auth/users/",
    USER_CREATE:
      import.meta.env.VITE_USER_CREATE_ENDPOINT || "/api/business/admin/auth/create/",

    // Admin Auth
    ADMIN_LOGIN:
      import.meta.env.VITE_ADMIN_LOGIN_ENDPOINT || "/api/business/admin/auth/login/",
    ADMIN_REGISTER:
      import.meta.env.VITE_ADMIN_REGISTER_ENDPOINT ||
      "/api/business/admin/auth/register/",
    ADMIN_DASHBOARD:
      import.meta.env.VITE_ADMIN_DASHBOARD_ENDPOINT ||
      "/api/business/admin/auth/dashboard/",
    ADMIN_FORGOT_PASSWORD:
      import.meta.env.VITE_ADMIN_FORGOT_PASSWORD_ENDPOINT ||
      "/api/business/admin/auth/forgot-password/",
    ADMIN_RESET_PASSWORD:
      import.meta.env.VITE_ADMIN_RESET_PASSWORD_ENDPOINT ||
      "/api/business/admin/auth/reset-password/",
    ADMIN_VERIFY_RESET_TOKEN:
      import.meta.env.VITE_ADMIN_VERIFY_RESET_TOKEN_ENDPOINT ||
      "/api/business/admin/auth/verify-reset-token/",
    ADMIN_PROFILE:
      import.meta.env.VITE_ADMIN_PROFILE_ENDPOINT || "/api/business/admin/auth/profile/",
    ADMIN_CHANGE_PASSWORD:
      import.meta.env.VITE_ADMIN_CHANGE_PASSWORD_ENDPOINT ||
      "/api/business/admin/auth/change-password/",

    // Admin Management
    ADMIN_CREATE:
      import.meta.env.VITE_ADMIN_CREATE_ENDPOINT || "/api/business/admin/auth/create/",
    ADMIN_LIST:
      import.meta.env.VITE_ADMIN_LIST_ENDPOINT || "/api/business/admin/auth/list/",
    ADMIN_PERMISSIONS:
      import.meta.env.VITE_ADMIN_PERMISSIONS_ENDPOINT || "/api/business/admin/auth/",
    ADMIN_DELETE:
      import.meta.env.VITE_ADMIN_DELETE_ENDPOINT || "/api/business/admin/auth/",
    ADMIN_INVITE:
      import.meta.env.VITE_ADMIN_INVITE_ENDPOINT || "/api/business/admin/auth/invite/",

    // Courses
    COURSES: import.meta.env.VITE_COURSES_ENDPOINT || "/api/courses/courses/",
    COURSES_STATES:
      import.meta.env.VITE_COURSES_STATES_ENDPOINT ||
      "/api/courses/data/states/",
    COURSES_DISTRICTS:
      import.meta.env.VITE_COURSES_DISTRICTS_ENDPOINT ||
      "/api/courses/data/districts/",
    COURSES_CENTRES:
      import.meta.env.VITE_COURSES_CENTRES_ENDPOINT ||
      "/api/courses/data/centres/",
    COURSES_ADMIN_ALLDATA:
      import.meta.env.VITE_COURSES_ADMIN_ALLDATA_ENDPOINT ||
      "/api/courses/business/admin/alldata/",
    PURCHASE: import.meta.env.VITE_PURCHASE_ENDPOINT || "/api/courses/purchase/",
    MY_COURSES:
      import.meta.env.VITE_MY_COURSES_ENDPOINT || "/api/courses/courses/my_courses/",

    // Applications
    APPLICATIONS:
      import.meta.env.VITE_APPLICATIONS_ENDPOINT || "/api/applications/",
    APPLICATIONS_ADMIN:
      import.meta.env.VITE_APPLICATIONS_ADMIN_ENDPOINT || "/api/business/admin/applications/applications/",

    // Centres
    CENTRES: import.meta.env.VITE_CENTRES_ENDPOINT || "/api/centres/",
    CENTRES_ADMIN: import.meta.env.VITE_CENTRES_ADMIN_ENDPOINT || "/api/business/admin/centres/",
    CENTRES_STATES:
      import.meta.env.VITE_CENTRES_STATES_ENDPOINT || "/api/centres/states/",
    CENTRES_DISTRICTS:
      import.meta.env.VITE_CENTRES_DISTRICTS_ENDPOINT ||
      "/api/centres/districts/",
    CENTRES_LIST:
      import.meta.env.VITE_CENTRES_LIST_ENDPOINT || "/api/centres/centres/",
    CENTRES_DETAILS:
      import.meta.env.VITE_CENTRES_DETAILS_ENDPOINT ||
      "/api/centres/centre_details/",

    // Image Upload Endpoints
    IMAGE_UPLOAD:
      import.meta.env.VITE_IMAGE_UPLOAD_ENDPOINT ||
      "/api/business/admin/centres/upload/image/",
    CENTRE_LOGO_UPLOAD:
      import.meta.env.VITE_CENTRE_LOGO_UPLOAD_ENDPOINT ||
      "/api/business/admin/centres/{centre_id}/upload-logo/",
    TOPPER_IMAGE_UPLOAD:
      import.meta.env.VITE_TOPPER_IMAGE_UPLOAD_ENDPOINT ||
      "/api/business/admin/centres/{centre_id}/upload-topper-image/",
    CENTRE_LOGO_GET:
      import.meta.env.VITE_CENTRE_LOGO_GET_ENDPOINT ||
      "/api/centres/{centre_id}/logo/",

    // Alternative Centres Data Endpoints
    CENTRES_DATA_STATES:
      import.meta.env.VITE_CENTRES_DATA_STATES_ENDPOINT ||
      "/api/centres/data/states/",
    CENTRES_DATA_DISTRICTS:
      import.meta.env.VITE_CENTRES_DATA_DISTRICTS_ENDPOINT ||
      "/api/centres/data/districts/",
    CENTRES_DATA_CENTRES:
      import.meta.env.VITE_CENTRES_DATA_CENTRES_ENDPOINT ||
      "/api/centres/data/centres/",

    // Job Post Endpoints
    JOBS: import.meta.env.VITE_JOBS_ENDPOINT || "/api/jobs/job-posts/",
    JOBS_ADMIN: import.meta.env.VITE_JOBS_ADMIN_ENDPOINT || "/api/business/admin/jobs/job-posts/",
    JOB_APPLICATIONS:
      import.meta.env.VITE_JOB_APPLICATIONS_ENDPOINT ||
      "/api/jobs/applications/",
    JOB_APPLICATIONS_ADMIN:
      import.meta.env.VITE_JOB_APPLICATIONS_ADMIN_ENDPOINT ||
      "/api/business/admin/jobs/applications/",
    JOBS_ACTIVE:
      import.meta.env.VITE_JOBS_ACTIVE_ENDPOINT ||
      "/api/jobs/job-posts/active_jobs/",
    JOBS_FEATURED:
      import.meta.env.VITE_JOBS_FEATURED_ENDPOINT ||
      "/api/jobs/job-posts/featured_jobs/",
  },
};

export default env;
