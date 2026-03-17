import React, { useState, useEffect, useCallback } from "react";
import { jobAPI } from "../../services/jobAPI";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";

const JobApplicationList = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [error, setError] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const statusOptions = [
    { value: "applied", label: "Applied", color: "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-300" },
    {
      value: "under_review",
      label: "Under Review",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    },
    {
      value: "shortlisted",
      label: "Shortlisted",
      color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
    },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
    {
      value: "accepted",
      label: "Accepted",
      color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    },
    {
      value: "on_hold",
      label: "On Hold",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    },
  ];

  // --- Caching Hook Implementation ---
  const fetchApplicationsData = useCallback(async () => {
    const response = await jobAPI.getAllApplications();
    return response.data.results || response.data;
  }, []);

  const {
    data: applications,
    loading,
    error: cacheError,
    refresh: fetchApplications
  } = useAdminCache("admin_job_applications", fetchApplicationsData, { initialData: [] });

  useEffect(() => {
    if (cacheError) setError("Failed to fetch applications");
  }, [cacheError]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("refresh") === "true") {
      
      clearAdminCache("admin_job_applications");
      fetchApplications();
    }
  }, [fetchApplications]);

  // Get unique job titles for filter
  const uniqueJobs = [
    ...new Set(applications.map((app) => app.job_post_title)),
  ].filter(Boolean);

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    // Date filter
    if (fromDate) {
      const appDate = new Date(app.applied_at);
      const filterFrom = new Date(fromDate);
      // Reset time for comparison
      appDate.setHours(0, 0, 0, 0);
      filterFrom.setHours(0, 0, 0, 0);
      if (appDate < filterFrom) return false;
    }
    if (toDate) {
      const appDate = new Date(app.applied_at);
      const filterTo = new Date(toDate);
      // Reset time for comparison
      appDate.setHours(0, 0, 0, 0);
      filterTo.setHours(0, 0, 0, 0);
      if (appDate > filterTo) return false;
    }

    // Job filter
    if (selectedJob && app.job_post_title !== selectedJob) {
      return false;
    }

    return true;
  });

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await jobAPI.updateApplicationStatus(applicationId, newStatus);
      clearAdminCache("admin_job_stats");
      clearAdminCache("admin_job_applications");
      fetchApplications();
    } catch (err) {
      setError("Failed to update application status");
      console.error("Error updating status:", err);
    }
  };

  const handleDownloadCV = async (application, filename) => {
    // If it has a direct R2 URL, open it in a new tab
    if (application.cv_url) {
      window.open(application.cv_url, "_blank");
      return;
    }

    try {
      const response = await jobAPI.downloadCV(application.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "cv.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download CV");
      console.error("Error downloading CV:", err);
    }
  };

  const handleDownloadCoverLetter = async (application, filename) => {
    // If it has a direct R2 URL, open it in a new tab
    if (application.cover_letter_url) {
      window.open(application.cover_letter_url, "_blank");
      return;
    }

    try {
      const response = await jobAPI.downloadCoverLetter(application.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "cover_letter.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download cover letter");
      console.error("Error downloading cover letter:", err);
    }
  };

  const handleExportCSV = () => {
    if (filteredApplications.length === 0) {
      alert("No applications to export");
      return;
    }

    // Helper to escape CSV fields
    const escapeCsv = (str) => {
      if (str === null || str === undefined) return "";
      const stringValue = String(str);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Define headers
    const headers = [
      "Applicant Name",
      "Email",
      "Phone",
      "Job Position",
      "Department",
      "Experience",
      "Applied Date",
      "Status",
      "CV Filename",
      "Cover Letter Filename"
    ];

    // Map data to rows
    const rows = filteredApplications.map((app) => [
      escapeCsv(app.applicant_name),
      escapeCsv(app.applicant_email),
      escapeCsv(app.applicant_phone),
      escapeCsv(app.job_post_title),
      escapeCsv(app.job_post_department),
      escapeCsv(`${app.total_experience} years`),
      escapeCsv(
        app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "N/A"
      ),
      escapeCsv(
        statusOptions.find((opt) => opt.value === app.status)?.label ||
        app.status
      ),
      escapeCsv(app.cv_filename || "N/A"),
      escapeCsv(app.cover_letter_filename || "N/A")
    ]);

    // Combine headers and rows
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `job_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDownloadCVs = async () => {
    if (filteredApplications.length === 0) {
      alert("No applications to download");
      return;
    }

    const confirmMessage = filteredApplications.length > 5
      ? `You are about to download ${filteredApplications.length} CVs. This will start multiple downloads. Continue?`
      : null;

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    let downloadedCount = 0;
    for (const app of filteredApplications) {
      if (app.cv_filename || app.cv_url) {
        try {
          await handleDownloadCV(app, app.cv_filename);
          downloadedCount++;
          // Small delay to prevent browser from blocking multiple downloads
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (e) {
          console.error(`Failed to download CV for ${app.applicant_name}`, e);
        }
      }
    }

    if (downloadedCount === 0) {
      alert("No CVs found for the selected applications.");
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
  };

  const openDetailModal = (application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedApplication(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Job Applications</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage and track candidate applications across all positions.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleBulkDownloadCVs}
            disabled={filteredApplications.length === 0}
            className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 ${filteredApplications.length === 0
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            title="Download CVs for filtered list"
          >
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CVs
            <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">
              {filteredApplications.length}
            </span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredApplications.length === 0}
            className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all duration-200 ${filteredApplications.length === 0
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              : "bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 hover:shadow-md"
              }`}
            title="Export details to CSV"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>

          <button
            onClick={fetchApplications}
            className="inline-flex items-center px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 mb-8">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Job Position</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="block w-full rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
            >
              <option value="">All Positions</option>
              {uniqueJobs.map((job) => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
                setSelectedJob("");
              }}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">S.No</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applicant</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Position & Department</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Experience</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {filteredApplications.map((application, index) => (
                <tr key={application.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{application.applicant_name}</div>
                    <div className="text-xs text-slate-400">{application.applied_at ? new Date(application.applied_at).toLocaleDateString() : "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {application.applicant_email}
                      </div>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {application.applicant_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{application.job_post_title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{application.job_post_department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                      {application.total_experience} years
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={application.status || "applied"}
                      onChange={(e) => handleStatusChange(application.id, e.target.value)}
                      className={`block w-full pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 cursor-pointer ${getStatusColor(application.status || "applied")}`}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => openDetailModal(application)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors duration-200"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownloadCV(application, application.cv_filename)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors duration-200"
                        title="View CV"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No applications found</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Try adjusting your filters or check back later for new applications.
            </p>
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
                setSelectedJob("");
              }}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-right text-xs text-slate-400">
        Showing {filteredApplications.length} of {applications.length} total applications
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" onClick={closeDetailModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-middle bg-white dark:bg-slate-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-slate-200 dark:border-slate-800">
              {/* Modal Header */}
              <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedApplication.applicant_name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Application for {selectedApplication.job_post_title}</p>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-8 h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Left Column: Personal Info */}
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Personal Details</h4>
                      <dl className="grid grid-cols-1 gap-y-4">
                        <div className="flex flex-col">
                          <dt className="text-xs font-medium text-slate-500 uppercase">Email</dt>
                          <dd className="text-sm font-semibold text-slate-900 dark:text-white">{selectedApplication.total_experience} Years</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-xs font-medium text-slate-500 uppercase">Phone</dt>
                          <dd className="text-sm font-semibold text-slate-900 dark:text-white">{selectedApplication.applicant_phone}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-xs font-medium text-slate-500 uppercase">Experience</dt>
                          <dd className="text-sm font-semibold text-slate-900">{selectedApplication.total_experience} Years</dd>
                        </div>
                        {selectedApplication.applicant_address && (
                          <div className="flex flex-col">
                            <dt className="text-xs font-medium text-slate-500 uppercase">Address</dt>
                            <dd className="text-sm font-semibold text-slate-900">{selectedApplication.applicant_address}</dd>
                          </div>
                        )}
                      </dl>
                    </section>

                    {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 uppercase tracking-wider">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    {(selectedApplication.portfolio_url || selectedApplication.linkedin_url) && (
                      <section>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Links</h4>
                        <div className="flex flex-col gap-2">
                          {selectedApplication.portfolio_url && (
                            <a href={selectedApplication.portfolio_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
                              Portfolio →
                            </a>
                          )}
                          {selectedApplication.linkedin_url && (
                            <a href={selectedApplication.linkedin_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
                              LinkedIn Profile →
                            </a>
                          )}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Right Column: Professional Experience */}
                  <div className="space-y-6">
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Status</h4>
                      <dl className="grid grid-cols-1 gap-y-4">
                        <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <dt className="text-xs font-medium text-slate-500 uppercase mb-1">Current Company</dt>
                          <dd className="text-sm font-bold text-slate-900 dark:text-white">{selectedApplication.current_company || "N/A"}</dd>
                        </div>
                        <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <dt className="text-xs font-medium text-slate-500 uppercase mb-1">Current Position</dt>
                          <dd className="text-sm font-bold text-slate-900">{selectedApplication.current_position || "N/A"}</dd>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <dt className="text-xs font-medium text-slate-500 uppercase mb-1">Current Salary</dt>
                            <dd className="text-sm font-bold text-slate-900">{selectedApplication.current_salary || "N/A"}</dd>
                          </div>
                          <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <dt className="text-xs font-medium text-slate-500 uppercase mb-1">Expected Salary</dt>
                            <dd className="text-sm font-bold text-slate-900">{selectedApplication.expected_salary || "N/A"}</dd>
                          </div>
                        </div>
                        <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                          <dt className="text-xs font-medium text-slate-500 uppercase mb-1">Notice Period</dt>
                          <dd className="text-sm font-bold text-slate-900">{selectedApplication.notice_period || "N/A"}</dd>
                        </div>
                      </dl>
                    </section>
                  </div>
                </div>

                {/* Full Width Sections: Work Exp & Education */}
                <div className="space-y-8">
                  {selectedApplication.work_experience && selectedApplication.work_experience.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Work History</h4>
                      <div className="space-y-4">
                        {selectedApplication.work_experience.map((exp, i) => (
                          <div key={i} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-bold text-slate-900 dark:text-white">{exp.position}</h5>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                              </div>
                              <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg whitespace-nowrap">
                                {exp.start_date} - {exp.currently_working ? "Present" : exp.end_date}
                              </span>
                            </div>
                            {exp.description && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedApplication.education_details && selectedApplication.education_details.length > 0 && (
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Education</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApplication.education_details.map((edu, i) => (
                          <div key={i} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-500 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-bold text-slate-900 dark:text-white">{edu.degree}</h5>
                              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">{edu.year_completed}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{edu.institution}</p>
                            {edu.field_of_study && <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{edu.field_of_study}</p>}
                            {edu.percentage && <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">Result: {edu.percentage}%</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedApplication.additional_info && (
                    <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Additional Info</h4>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl italic text-sm text-slate-600 dark:text-slate-300">
                        {selectedApplication.additional_info}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
                <button
                  onClick={() => handleDownloadCV(selectedApplication, selectedApplication.cv_filename)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Open CV
                </button>
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
};

export default JobApplicationList;

