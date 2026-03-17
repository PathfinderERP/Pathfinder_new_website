import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { coursesAPI, adminAuthAPI, centresAPI } from "../../services/api";
import { jobAPI } from "../../services/jobAPI";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";
import {
  UsersIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PlusIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const [error, setError] = useState("");
  const { admin } = useAuth();

  const getArrayData = (response, fallbackKey = null) => {
    if (!response || !response.data) return [];
    if (Array.isArray(response.data)) return response.data;
    if (typeof response.data === "object") {
      const nestedArrays = [
        response.data.results, // Common DRF pagination key
        response.data.data,
        response.data.courses,
        response.data.centres,
        response.data.users,
        response.data.jobs,
        response.data.applications,
      ].find((arr) => Array.isArray(arr));
      if (nestedArrays) return nestedArrays;
      if (fallbackKey && Array.isArray(response.data[fallbackKey])) return response.data[fallbackKey];
    }
    return [];
  };

  const fetchDashboardAllData = useCallback(async () => {
    const [
      dashboardResponse,
      coursesResponse,
      usersResponse,
      centresResponse,
      jobsResponse,
      applicationsResponse,
    ] = await Promise.all([
      adminAuthAPI.getDashboard().catch(() => ({ data: { stats: {} } })),
      coursesAPI.getAll().catch(() => ({ data: [] })),
      (adminAuthAPI.getUsers?.() || Promise.resolve({ data: [] })).catch(() => ({ data: [] })),
      (centresAPI.getAll?.() || Promise.resolve({ data: [] })).catch(() => ({ data: [] })),
      jobAPI.getAllJobs().catch(() => ({ data: [] })),
      jobAPI.getAllApplications().catch(() => ({ data: [] })),
    ]);

    const dashboardStatsData = dashboardResponse.data?.stats || dashboardResponse.data || {};
    const coursesData = getArrayData(coursesResponse, "courses");
    const usersData = getArrayData(usersResponse, "users");
    const centresData = getArrayData(centresResponse, "centres");
    const jobsData = getArrayData(jobsResponse, "jobs");
    const applicationsData = getArrayData(applicationsResponse, "applications");

    const activeJobs = jobsData.filter((job) => job.is_active).length;
    const totalApplicationsCount = applicationsData.length;

    return {
      stats: {
        total_users: dashboardStatsData.total_users || usersData.length,
        total_courses: dashboardStatsData.total_courses || coursesData.length,
        total_centres: dashboardStatsData.total_centres || centresData.length,
        total_jobs: dashboardStatsData.total_jobs || jobsData.length,
        active_jobs: dashboardStatsData.active_jobs || activeJobs,
        total_applications: dashboardStatsData.total_applications || totalApplicationsCount,
      },
      recentCourses: coursesData.slice(0, 5),
      recentUsers: usersData.slice(0, 5),
      recentCentres: centresData.slice(0, 5),
      recentJobs: jobsData.slice(0, 5),
      recentApplications: applicationsData.slice(0, 5),
    };
  }, []);

  const {
    data: dashboardData,
    loading: loading,
    error: cacheError,
    refresh: fetchDashboardData
  } = useAdminCache("admin_dashboard_summary", fetchDashboardAllData, {
    initialData: {
      stats: {},
      recentCourses: [],
      recentUsers: [],
      recentCentres: [],
      recentJobs: [],
      recentApplications: []
    }
  });

  const { stats, recentCourses, recentUsers, recentCentres, recentJobs, recentApplications } = dashboardData;

  useEffect(() => {
    if (cacheError) {
      setError("Failed to fetch dashboard data. Please try refreshing the page.");
    }
  }, [cacheError]);

  const getStatusBadgeClasses = (status) => {
    const statusMap = {
      applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
      under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
      shortlisted: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin shadow-lg shadow-orange-500/10"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Initializing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-2">
      {/* Modern Header with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">
              Dashboard <span className="text-orange-500">Overview</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm max-w-xl">
              Welcome back, <span className="text-white font-bold">{admin?.full_name || "Admin"}</span>.
              Here is your daily activity summary and system health check.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right mr-4">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">System Status</div>
              <div className="text-emerald-400 text-sm font-bold flex items-center justify-end gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Operational
              </div>
            </div>
            <button
              onClick={() => {
                clearAdminCache("admin_dashboard_summary");
                fetchDashboardData();
              }}
              className="group flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all hover:scale-105 active:scale-95"
            >
              <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Colorful Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            name: "Total Users",
            value: stats?.total_users,
            icon: UsersIcon,
            gradient: "from-blue-500 to-blue-600",
            shadow: "shadow-blue-500/20",
            trend: "+12% this month"
          },
          {
            name: "Active Courses",
            value: stats?.total_courses,
            icon: AcademicCapIcon,
            gradient: "from-purple-500 to-purple-600",
            shadow: "shadow-purple-500/20",
            trend: "Updated recently"
          },
          {
            name: "Training Centres",
            value: stats?.total_centres,
            icon: BuildingOfficeIcon,
            gradient: "from-emerald-500 to-emerald-600",
            shadow: "shadow-emerald-500/20",
            trend: "Across active regions"
          },
          {
            name: "Job Openings",
            value: stats?.active_jobs,
            icon: BriefcaseIcon,
            gradient: "from-orange-500 to-orange-600",
            shadow: "shadow-orange-500/20",
            trend: "Currently hiring"
          }
        ].map((stat) => (
          <div key={stat.name} className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl ${stat.shadow} border border-gray-100 dark:border-slate-800 group hover:-translate-y-1 transition-all duration-300`}>
            <div className={`absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:scale-110 transition-transform duration-500`}></div>

            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.name}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stat.value || 0}</h3>
                <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500 flex items-center gap-1">
                  <span className="text-emerald-500">●</span> {stat.trend}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link to="/business/admin/courses/create" className="group relative overflow-hidden bg-gradient-to-tr from-orange-400 to-orange-600 rounded-3xl p-8 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white mb-6">
                  <PlusIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Create New Course</h3>
                <p className="text-orange-100 text-sm font-medium pr-8">Launch a new curriculum for students. Supports bulk CSV upload.</p>
              </div>
              <ChevronRightIcon className="absolute bottom-8 right-8 w-6 h-6 text-white/50 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>

            <Link to="/business/admin/jobs/create" className="group relative overflow-hidden bg-gradient-to-tr from-slate-700 to-slate-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white mb-6">
                  <BriefcaseIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Post Job Opening</h3>
                <p className="text-slate-300 text-sm font-medium pr-8">Recruit new talent for available positions within the organization.</p>
              </div>
              <ChevronRightIcon className="absolute bottom-8 right-8 w-6 h-6 text-white/50 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </Link>
          </div>

          {/* Recent Applications with Modern Table Style */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent Applications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Latest candidates applied for positions</p>
              </div>
              <Link to="/business/admin/course-applications" className="text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/10 px-4 py-2 rounded-xl transition-colors">
                View All
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {recentApplications?.length > 0 ? recentApplications.map((app, idx) => (
                <div key={app.id || idx} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${idx % 3 === 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                      idx % 3 === 1 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' :
                        'bg-pink-100 text-pink-600 dark:bg-pink-900/30'
                      }`}>
                      {app.applicant_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{app.applicant_name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 flex items-center gap-2">
                        <BriefcaseIcon className="w-3 h-3" />
                        {app.job_post_title}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClasses(app.status)}`}>
                      {app.status || "Pending"}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No recent applications found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">

          {/* Recent Courses List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-gray-900 dark:text-white">New Courses</h3>
              <Link to="/business/admin/courses" className="text-orange-500 hover:text-orange-600">
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentCourses?.map((course) => (
                <div key={course.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-500 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <AcademicCapIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{course.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-gray-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                        {course.class_level}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">₹{course.course_price}</span>
                    </div>
                  </div>
                </div>
              ))}
              {recentCourses?.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">No courses available.</p>
              )}
            </div>
          </div>

          {/* Job Opportunities Preview */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
            <h3 className="font-black text-lg mb-1 relative z-10">Active Job Posts</h3>
            <p className="text-slate-400 text-xs font-medium mb-6 relative z-10">Recent vacancies listed</p>

            <div className="space-y-3 relative z-10">
              {recentJobs?.length > 0 ? recentJobs.slice(0, 3).map((job, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                    <span className="text-sm font-bold truncate max-w-[120px]">{job.title}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {job.location?.length > 10 ? `${job.location.substring(0, 10)}...` : job.location}
                  </span>
                </div>
              )) : (
                <p className="text-slate-500 text-sm">No active job posts.</p>
              )}
            </div>

            <Link to="/business/admin/jobs" className="mt-6 block w-full py-3 bg-orange-600 hover:bg-orange-700 text-center rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
              Manage All Jobs
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
