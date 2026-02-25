import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { jobAPI } from "../services/jobAPI";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getJobById(id);
        setJob(response.data);
      } catch (err) {
        setError("Failed to fetch job details");
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const formatJobType = (jobType) => {
    return jobType ? jobType.replace("_", " ").toUpperCase() : "N/A";
  };

  const formatExperience = (experience) => {
    const levels = {
      fresher: "Fresher (0-1 years)",
      entry: "Entry Level (1-2 years)",
      mid: "Mid Level (2-5 years)",
      senior: "Senior Level (5+ years)",
    };
    return levels[experience] || experience;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50  mt-14 pb-8 ">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            {error}
          </div>
          <Link
            to="/career"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return <Navigate to="/career" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50  mt-20 pb-8 ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/career"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Careers
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {job.title}
              </h1>
              <p className="text-xl text-gray-700 mb-4">{job.company}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {formatJobType(job.job_type)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {formatExperience(job.experience_level)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  📍 {job.location}
                </span>
                {job.is_featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 lg:mt-0">
              <Link
                to={`/career/apply/${job.id}`}
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
              >
                Apply for this Job
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Requirements
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Type:</span>
                  <span className="font-medium">
                    {formatJobType(job.job_type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">
                    {formatExperience(job.experience_level)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{job.location}</span>
                </div>
                {job.salary_range_min && job.salary_range_max && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium">
                      {job.salary_range_min} - {job.salary_range_max}{" "}
                      {job.salary_type}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Vacancies:</span>
                  <span className="font-medium">{job.vacancies}</span>
                </div>
                {job.application_deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Apply Before:</span>
                    <span className="font-medium">
                      {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Name:</strong> {job.company}
                </p>
                <p className="text-gray-700">
                  <strong>Location:</strong> {job.district}, {job.state}
                </p>
                {job.address && (
                  <p className="text-gray-700">
                    <strong>Address:</strong> {job.address}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Apply */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Ready to Apply?
              </h3>
              <p className="text-blue-800 mb-4">
                Don't miss this opportunity. Apply now and take the next step in
                your career.
              </p>
              <Link
                to={`/career/apply/${job.id}`}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
              >
                Apply for this Position
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
