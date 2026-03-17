import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { jobAPI } from "../../services/jobAPI";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";

const JobPostList = () => {
  const [error, setError] = useState("");

  const jobTypeColors = {
    full_time: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    part_time: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    contract: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    remote: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    hybrid: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
  };

  const experienceColors = {
    fresher: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    entry: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    mid: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    senior: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };

  const fetchJobsData = useCallback(async () => {
    const response = await jobAPI.getAllJobs();
    return response.data.results || response.data;
  }, []);

  const {
    data: jobs,
    loading,
    error: cacheError,
    refresh: fetchJobs
  } = useAdminCache("admin_job_posts", fetchJobsData, { initialData: [] });

  useEffect(() => {
    if (cacheError) setError("Failed to fetch jobs");
  }, [cacheError]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("refresh") === "true") {
      
      clearAdminCache("admin_job_posts");
      fetchJobs();
    }
  }, [fetchJobs]);

  const handleToggleActive = async (jobId, currentStatus) => {
    try {
      await jobAPI.toggleJobActive(jobId);
      clearAdminCache("admin_job_stats");
      clearAdminCache("admin_job_posts");
      fetchJobs();
    } catch (err) {
      setError("Failed to update job status");
      console.error("Error toggling job active:", err);
    }
  };

  const handleToggleFeatured = async (jobId, currentStatus) => {
    try {
      await jobAPI.toggleJobFeatured(jobId);
      clearAdminCache("admin_job_stats");
      clearAdminCache("admin_job_posts");
      fetchJobs();
    } catch (err) {
      setError("Failed to update featured status");
      console.error("Error toggling job featured:", err);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job post?")) {
      try {
        await jobAPI.deleteJob(jobId);
        clearAdminCache("admin_job_stats");
        clearAdminCache("admin_job_posts");
        fetchJobs();
      } catch (err) {
        setError("Failed to delete job");
        console.error("Error deleting job:", err);
      }
    }
  };

  const formatJobType = (jobType) => {
    return jobType ? jobType.replace("_", " ").toUpperCase() : "N/A";
  };

  const formatExperience = (experience) => {
    const levels = {
      fresher: "Fresher",
      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior Level",
    };
    return levels[experience] || experience;
  };

  if (loading) {
    return (
      <div className="min-h-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white dark:bg-slate-900 shadow overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {job.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {job.district}, {job.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${jobTypeColors[job.job_type] ||
                        "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300"
                        }`}
                    >
                      {formatJobType(job.job_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${experienceColors[job.experience_level] ||
                        "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300"
                        }`}
                    >
                      {formatExperience(job.experience_level)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-300">
                      {job.application_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(job.id, job.is_active)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${job.is_active ? "bg-green-500" : "bg-gray-200"
                        }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${job.is_active ? "translate-x-5" : "translate-x-0"
                          }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleFeatured(job.id, job.is_featured)
                      }
                      className={`p-1 rounded-full ${job.is_featured ? "text-yellow-500" : "text-gray-400"
                        } hover:text-yellow-600`}
                    >
                      {job.is_featured ? (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/admin/jobs/edit/${job.id}`}
                      className="text-orange-600 hover:text-orange-900 dark:text-orange-500 dark:hover:text-orange-400 mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No job posts
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new job post.
          </p>
          <div className="mt-6">
            <Link
              to="/business/admin/jobs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
              Create Job Post
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostList;

