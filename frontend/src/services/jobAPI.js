import api from "./api";
import env from "../config/env";

export const jobAPI = {
  // Job Posts
  getAllJobs: (params = {}) => {
    
    const queryParams = new URLSearchParams(params).toString();
    return api.get(
      `${env.endpoints.JOBS}${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getJobById: (id) => {
    
    return api.get(`${env.endpoints.JOBS}${id}/`);
  },

  createJob: (jobData) => {
    
    return api.post(env.endpoints.JOBS, jobData);
  },

  updateJob: (id, jobData) => {
    
    return api.put(`${env.endpoints.JOBS}${id}/`, jobData);
  },

  deleteJob: (id) => {
    
    return api.delete(`${env.endpoints.JOBS}${id}/`);
  },

  toggleJobActive: (id) => {
    
    return api.post(`${env.endpoints.JOBS}${id}/toggle_active/`);
  },

  toggleJobFeatured: (id) => {
    
    return api.post(`${env.endpoints.JOBS}${id}/toggle_featured/`);
  },

  // For public career page - get only active jobs
  getActiveJobs: () => {
    
    return api
      .get(env.endpoints.JOBS, {
        params: { is_active: true }, // Filter by active status
      })
      .then((response) => {
        // Double-check filtering on frontend as backup
        const jobs = response.data.results || response.data;
        const activeJobs = jobs.filter((job) => job.is_active !== false);

        

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
    
    const queryParams = new URLSearchParams(params).toString();
    return api.get(
      `${env.endpoints.JOB_APPLICATIONS}${queryParams ? `?${queryParams}` : ""}`
    );
  },

  getApplicationById: (id) => {
    
    return api.get(`${env.endpoints.JOB_APPLICATIONS}${id}/`);
  },

  createApplication: (applicationData) => {
    
    return api.post(env.endpoints.JOB_APPLICATIONS, applicationData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateApplicationStatus: (id, status) => {
    
    return api.post(`${env.endpoints.JOB_APPLICATIONS}${id}/update_status/`, {
      status: status,
    });
  },

  downloadCV: (id) => {
    
    return api.get(`${env.endpoints.JOB_APPLICATIONS}${id}/download-cv/`, {
      responseType: "blob",
    });
  },

  downloadCoverLetter: (id) => {
    
    return api.get(
      `${env.endpoints.JOB_APPLICATIONS}${id}/download-cover-letter/`,
      {
        responseType: "blob",
      }
    );
  },

  deleteApplication: (id) => {
    
    return api.delete(`${env.endpoints.JOB_APPLICATIONS}${id}/`);
  },
};
