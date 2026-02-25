import api from "./api";
import env from "../config/env";

export const jobAPI = {
  // Job Posts
  getAllJobs: (params = {}) => {
    console.log("💼 Fetching all jobs");
    const queryParams = new URLSearchParams(params).toString();
    return api.get(
      `${env.endpoints.JOBS}${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getJobById: (id) => {
    console.log("🔍 Fetching job by ID:", id);
    return api.get(`${env.endpoints.JOBS}${id}/`);
  },

  createJob: (jobData) => {
    console.log("➕ Creating new job:", jobData.title);
    return api.post(env.endpoints.JOBS, jobData);
  },

  updateJob: (id, jobData) => {
    console.log("✏️ Updating job:", id);
    return api.put(`${env.endpoints.JOBS}${id}/`, jobData);
  },

  deleteJob: (id) => {
    console.log("🗑️ Deleting job:", id);
    return api.delete(`${env.endpoints.JOBS}${id}/`);
  },

  toggleJobActive: (id) => {
    console.log("🔄 Toggling job active status:", id);
    return api.post(`${env.endpoints.JOBS}${id}/toggle_active/`);
  },

  toggleJobFeatured: (id) => {
    console.log("⭐ Toggling job featured status:", id);
    return api.post(`${env.endpoints.JOBS}${id}/toggle_featured/`);
  },

  // For public career page - get only active jobs
  getActiveJobs: () => {
    console.log("📋 Fetching active jobs for career page");
    return api
      .get(env.endpoints.JOBS, {
        params: { is_active: true }, // Filter by active status
      })
      .then((response) => {
        // Double-check filtering on frontend as backup
        const jobs = response.data.results || response.data;
        const activeJobs = jobs.filter((job) => job.is_active !== false);

        console.log(
          `📊 API returned ${jobs.length} jobs, ${activeJobs.length} are active`
        );

        // Log any inactive jobs that slipped through
        const inactiveJobs = jobs.filter((job) => job.is_active === false);
        if (inactiveJobs.length > 0) {
          console.warn(
            "🚫 Inactive jobs that slipped through backend filtering:",
            inactiveJobs.map((job) => ({
              id: job.id,
              title: job.title,
              is_active: job.is_active,
            }))
          );
        }

        // Return filtered data
        return {
          ...response,
          data: response.data.results
            ? { ...response.data, results: activeJobs }
            : activeJobs,
        };
      });
  },

  getFeaturedJobs: () => {
    console.log("🌟 Fetching featured jobs");
    return api
      .get(env.endpoints.JOBS, {
        params: { is_active: true, is_featured: true }, // Filter by active and featured
      })
      .then((response) => {
        // Double-check filtering on frontend
        const jobs = response.data.results || response.data;
        const featuredActiveJobs = jobs.filter(
          (job) => job.is_active !== false && job.is_featured === true
        );

        console.log(
          `📊 API returned ${jobs.length} featured jobs, ${featuredActiveJobs.length} are active and featured`
        );

        return {
          ...response,
          data: response.data.results
            ? { ...response.data, results: featuredActiveJobs }
            : featuredActiveJobs,
        };
      });
  },

  // Job Applications
  getAllApplications: (params = {}) => {
    console.log("📝 Fetching all applications");
    const queryParams = new URLSearchParams(params).toString();
    return api.get(
      `${env.endpoints.JOB_APPLICATIONS}${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getApplicationById: (id) => {
    console.log("🔍 Fetching application by ID:", id);
    return api.get(`${env.endpoints.JOB_APPLICATIONS}${id}/`);
  },

  createApplication: (applicationData) => {
    console.log("📄 Creating new application");
    return api.post(env.endpoints.JOB_APPLICATIONS, applicationData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateApplicationStatus: (id, status) => {
    console.log("🔄 Updating application status:", { id, status });
    return api.post(`${env.endpoints.JOB_APPLICATIONS}${id}/update_status/`, {
      status: status,
    });
  },

  downloadCV: (id) => {
    console.log("📥 Downloading CV for application:", id);
    return api.get(`${env.endpoints.JOB_APPLICATIONS}${id}/download-cv/`, {
      responseType: "blob",
    });
  },

  downloadCoverLetter: (id) => {
    console.log("📥 Downloading cover letter for application:", id);
    return api.get(
      `${env.endpoints.JOB_APPLICATIONS}${id}/download-cover-letter/`,
      {
        responseType: "blob",
      }
    );
  },

  deleteApplication: (id) => {
    console.log("🗑️ Deleting application:", id);
    return api.delete(`${env.endpoints.JOB_APPLICATIONS}${id}/`);
  },
};
