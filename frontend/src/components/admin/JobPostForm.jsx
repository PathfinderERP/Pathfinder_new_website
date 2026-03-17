import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobAPI } from "../../services/jobAPI";
import { clearAdminCache } from "../../hooks/useAdminCache";

const JobPostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    requirements: "",
    state: "West Bengal",
    district: "",
    centre: "",
    location: "",
    address: "",
    job_type: "full_time",
    experience_level: "entry",
    salary_range_min: "",
    salary_range_max: "",
    salary_type: "monthly",
    application_deadline: "",
    vacancies: 1,
    is_active: true,
    is_featured: false,
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const jobTypeOptions = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
  ];

  const experienceOptions = [
    { value: "fresher", label: "Fresher (0-1 years)" },
    { value: "entry", label: "Entry Level (1-2 years)" },
    { value: "mid", label: "Mid Level (2-5 years)" },
    { value: "senior", label: "Senior Level (5+ years)" },
  ];

  const salaryTypeOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "project", label: "Project Based" },
  ];

  useEffect(() => {
    if (isEditing) {
      fetchJobDetails();
    }
  }, [id, isEditing]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getJobById(id);
      const job = response.data;

      setFormData({
        title: job.title || "",
        department: job.department || "",
        description: job.description || "",
        requirements: job.requirements || "",
        state: job.state || "West Bengal",
        district: job.district || "",
        centre: job.centre || "",
        location: job.location || "",
        address: job.address || "",
        job_type: job.job_type || "full_time",
        experience_level: job.experience_level || "entry",
        salary_range_min: job.salary_range_min || "",
        salary_range_max: job.salary_range_max || "",
        salary_type: job.salary_type || "monthly",
        application_deadline: job.application_deadline
          ? job.application_deadline.split("T")[0]
          : "",
        vacancies: job.vacancies || 1,
        is_active: job.is_active !== undefined ? job.is_active : true,
        is_featured: job.is_featured !== undefined ? job.is_featured : false,
        tags: job.tags || [],
      });
    } catch (err) {
      setError("Failed to fetch job details");
      console.error("Error fetching job:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (isEditing) {
        await jobAPI.updateJob(id, formData);
        setSuccess("Job post updated successfully!");
      } else {
        await jobAPI.createJob(formData);
        setSuccess("Job post created successfully!");
      }

      clearAdminCache("admin_job_stats");
      clearAdminCache("admin_job_posts");

      setTimeout(() => {
        navigate("/business/admin/jobs?refresh=true");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} job post`
      );
      console.error("Error saving job:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link
              to="/business/admin/dashboard"
              className="text-gray-400 hover:text-gray-500"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <svg
              className="flex-shrink-0 h-5 w-5 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li>
            <Link
              to="/business/admin/jobs"
              className="text-gray-400 hover:text-gray-500"
            >
              Jobs
            </Link>
          </li>
          <li>
            <svg
              className="flex-shrink-0 h-5 w-5 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li>
            <span className="text-gray-500">
              {isEditing ? "Edit Job" : "Create Job"}
            </span>
          </li>
        </ol>
      </nav>

      <div className="bg-white dark:bg-slate-900 shadow rounded-lg border border-gray-200 dark:border-slate-800">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isEditing ? "Edit Job Post" : "Create New Job Post"}
          </h1>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 mb-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Job Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Department *
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="West Bengal">West Bengal</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="district"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      District *
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="centre"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Centre *
                    </label>
                    <input
                      type="text"
                      id="centre"
                      name="centre"
                      value={formData.centre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Location *
                  </label>
                  <textarea
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Job Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="job_type"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Job Type
                    </label>
                    <select
                      id="job_type"
                      name="job_type"
                      value={formData.job_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      {jobTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="experience_level"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Experience Level
                    </label>
                    <select
                      id="experience_level"
                      name="experience_level"
                      value={formData.experience_level}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      {experienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Salary Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="salary_range_min"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Min Salary
                    </label>
                    <input
                      type="number"
                      id="salary_range_min"
                      name="salary_range_min"
                      value={formData.salary_range_min}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="salary_range_max"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Max Salary
                    </label>
                    <input
                      type="number"
                      id="salary_range_max"
                      name="salary_range_max"
                      value={formData.salary_range_max}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="salary_type"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Salary Type
                    </label>
                    <select
                      id="salary_type"
                      name="salary_type"
                      value={formData.salary_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      {salaryTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Application Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="application_deadline"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      id="application_deadline"
                      name="application_deadline"
                      value={formData.application_deadline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="vacancies"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Vacancies
                    </label>
                    <input
                      type="number"
                      id="vacancies"
                      name="vacancies"
                      value={formData.vacancies}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Requirements */}
              <div>
                <label
                  htmlFor="requirements"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Requirements *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Status */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Status
                </h2>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-800">
              <Link
                to="/business/admin/jobs"
                className="bg-white dark:bg-slate-800 py-2 px-4 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Update Job"
                ) : (
                  "Create Job"
                )}
              </button>
            </div>
          </form>
        </div>
      </div >
    </div >
  );
};

export default JobPostForm;

