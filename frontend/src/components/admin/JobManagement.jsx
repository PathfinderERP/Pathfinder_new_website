import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import JobPostList from "./JobPostList";
import JobApplicationList from "./JobApplicationList";
import { jobAPI } from "../../services/jobAPI";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";
import { RefreshCw } from "lucide-react";

const JobManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");

  const fetchJobStatsData = useCallback(async () => {
    const [jobsResponse, applicationsResponse] = await Promise.all([
      jobAPI.getAllJobs(),
      jobAPI.getAllApplications(),
    ]);

    const jobs = jobsResponse.data.results || jobsResponse.data;
    const applications = applicationsResponse.data.results || applicationsResponse.data;

    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((job) => job.is_active).length,
      featuredJobs: jobs.filter((job) => job.is_featured).length,
      totalApplications: applications.length,
    };
  }, []);

  const {
    data: stats,
    loading,
    error: cacheError,
    refresh: fetchStats
  } = useAdminCache("admin_job_stats", fetchJobStatsData, { initialData: {} });

  useEffect(() => {
    if (cacheError) setError("Failed to fetch job statistics");
  }, [cacheError]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("refresh") === "true") {
      
      clearAdminCache("admin_job_stats");
      clearAdminCache("admin_job_posts");
      clearAdminCache("admin_job_applications");
      fetchStats();
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [fetchStats]);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  if (loading) {
    return (
      <div className="min-h-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage job posts and applications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              clearAdminCache("admin_job_stats");
              clearAdminCache("admin_job_posts");
              clearAdminCache("admin_job_applications");
              fetchStats();
            }}
            className="p-2 text-gray-500 hover:text-orange-600 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg transition shadow-sm"
            title="Refresh All Job Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            to="/admin/jobs/create"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Create Job Post
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-800 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalJobs || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Total Jobs</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-800 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.activeJobs || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Active Jobs</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-800 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.featuredJobs || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Featured Jobs</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow border border-gray-200 dark:border-slate-800 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalApplications || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Applications</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 shadow rounded-lg mb-6 border border-gray-200 dark:border-slate-800">
        <div className="border-b border-gray-200 dark:border-slate-800">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabChange(0)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 0
                ? "border-orange-500 text-orange-600 dark:text-orange-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
            >
              Job Posts
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 1
                ? "border-orange-500 text-orange-600 dark:text-orange-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
            >
              Applications
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 0 && <JobPostList />}
      {activeTab === 1 && <JobApplicationList />}
    </div>
  );
};

export default JobManagement;

