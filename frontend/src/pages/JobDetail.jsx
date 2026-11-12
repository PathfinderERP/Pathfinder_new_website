import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { jobAPI } from "../services/jobAPI";

// Helper component to render text with auto-linkified URLs and email addresses (CR-04)
const AutoLinkText = ({ text }) => {
  if (!text) return null;

  // Regex to detect URLs and emails
  const pattern = /((?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(token);
    const href = isEmail
      ? `mailto:${token}`
      : token.startsWith("http")
      ? token
      : `https://${token}`;

    parts.push(
      <a
        key={match.index}
        href={href}
        target={isEmail ? "_self" : "_blank"}
        rel="noopener noreferrer"
        className="text-[#FF6332] font-semibold underline hover:text-[#FF4500] transition-colors break-all"
      >
        {token}
      </a>
    );
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span>{parts}</span>;
};

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
    return jobType ? jobType.replace(/_/g, " ").toUpperCase() : "FULL TIME";
  };

  const formatExperience = (experience) => {
    const levels = {
      fresher: "Fresher (0-1 years)",
      entry: "Entry Level (1-2 years)",
      mid: "Mid Level (2-5 years)",
      senior: "Senior Level (5+ years)",
    };
    return levels[experience] || experience || "Fresher / Experienced";
  };

  // Company Name with guaranteed fallback (CR-06)
  const companyName = useMemo(() => {
    return job?.company?.trim() || "Pathfinder Educational Centre LLP";
  }, [job]);

  // Clean location formatting to prevent duplicate text (CR-04)
  const cleanLocation = useMemo(() => {
    if (!job) return "Kolkata, West Bengal";
    const loc = job.location || job.centre || "";
    const district = job.district || "";
    const state = job.state || "";

    const parts = [loc, district, state].filter(Boolean);
    const uniqueParts = [...new Set(parts.map(p => p.trim()))];
    return uniqueParts.join(", ") || "Kolkata, West Bengal";
  }, [job]);

  // Dynamic updated application date / active rolling deadline (CR-07)
  const applicationDeadlineText = useMemo(() => {
    if (job?.application_deadline) {
      const deadline = new Date(job.application_deadline);
      const now = new Date();
      if (!isNaN(deadline.getTime()) && deadline >= now) {
        return deadline.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }
    // Dynamic active recruitment cycle for rolling openings
    const now = new Date();
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `Open (Rolling till ${cycleEnd.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })})`;
  }, [job]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6332] mx-auto"></div>
          <p className="mt-4 text-slate-600 font-bold text-sm">Loading position details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Position Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            {error || "The requested job position is no longer active or has been filled."}
          </p>
          <Link
            to="/career"
            className="inline-flex items-center gap-2 bg-[#FF6332] hover:bg-[#FF4500] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      {/* Header Banner - Rich Pathfinder Theme (CR-05) */}
      <div className="bg-gradient-to-r from-[#FF6332] via-[#FF7D54] to-[#FF9D66] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb Back Link */}
          <Link
            to="/career"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-bold text-xs uppercase tracking-wider mb-6 bg-black/20 hover:bg-black/30 px-4 py-1.5 rounded-full backdrop-blur-sm transition-all"
          >
            <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" />
            Back to All Openings
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-wider mb-3">
                {job.department || "Pathfinder Team"}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2">
                {job.title}
              </h1>
              {/* Company Name (CR-06) */}
              <p className="text-base sm:text-lg text-white/95 font-bold flex items-center gap-2">
                <BuildingOffice2Icon className="w-5 h-5 text-white/80" />
                <span>{companyName}</span>
              </p>

              {/* Top Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white text-slate-900 shadow-sm">
                  <BriefcaseIcon className="w-3.5 h-3.5 text-[#FF6332]" />
                  {formatJobType(job.job_type)}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-sm">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {formatExperience(job.experience_level)}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-sm">
                  <MapPinIcon className="w-3.5 h-3.5 text-orange-200" />
                  {cleanLocation}
                </span>
                {job.is_featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase">
                    ⭐ Featured Role
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex-shrink-0">
              <Link
                to={`/career/apply/${job.id}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-900 hover:text-white font-black text-sm uppercase tracking-wider shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 text-center"
              >
                Apply for this Position →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Layout (CR-05) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <BriefcaseIcon className="w-6 h-6 text-[#FF6332]" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Job Description
                </h2>
              </div>
              <div className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed whitespace-pre-line">
                <AutoLinkText text={job.description} />
              </div>
            </div>

            {/* Requirements Card */}
            {job.requirements && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Candidate Requirements & Qualifications
                  </h2>
                </div>
                <div className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  <AutoLinkText text={job.requirements} />
                </div>
              </div>
            )}

            {/* Bottom Apply CTA Card */}
            <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100/40 rounded-3xl p-8 border border-orange-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">
                  Ready to Shape Young Minds?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Submit your application today. Our recruitment team reviews each candidate within 48 hours.
                </p>
              </div>
              <Link
                to={`/career/apply/${job.id}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF6332] to-[#FF7D54] hover:from-[#FF4500] hover:to-[#FF6332] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all text-center flex-shrink-0"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Job Overview Card (CR-07, CR-08) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-[#FF6332]" />
                Job Overview
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-bold">Employment Type:</span>
                  <span className="font-black text-slate-900">{formatJobType(job.job_type)}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-bold">Experience Required:</span>
                  <span className="font-black text-slate-900">{formatExperience(job.experience_level)}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-bold">Location:</span>
                  <span className="font-black text-slate-900 text-right max-w-[180px]">{cleanLocation}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-bold">Compensation:</span>
                  <span className="font-black text-slate-900">
                    {job.salary_range_min && job.salary_range_max
                      ? `₹${Number(job.salary_range_min).toLocaleString()} - ₹${Number(job.salary_range_max).toLocaleString()} ${job.salary_type || ''}`
                      : "Best in Industry Standards"}
                  </span>
                </div>

                {job.vacancies && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-bold">Open Vacancies:</span>
                    <span className="font-black text-slate-900">{job.vacancies} Position{job.vacancies > 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Updated Application Deadline (CR-07) */}
                <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-3">
                  <span className="text-slate-500 font-bold">Application Status:</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-right">
                    {applicationDeadlineText}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Info Card (CR-06) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                <BuildingOffice2Icon className="w-5 h-5 text-[#FF6332]" />
                Company Information
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Company Name</span>
                  <p className="font-black text-slate-900 mt-0.5">{companyName}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Location</span>
                  <p className="font-black text-slate-800 mt-0.5">{cleanLocation}</p>
                </div>

                {job.address && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Centre Address</span>
                    <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">{job.address}</p>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Official Website</span>
                  <p className="mt-0.5">
                    <a
                      href="https://pathfinder.edu.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6332] font-bold underline hover:text-[#FF4500]"
                    >
                      pathfinder.edu.in
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Support Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg">
              <h4 className="text-base font-black tracking-tight mb-1">
                Need Help Applying?
              </h4>
              <p className="text-xs text-slate-300 mb-4">
                Have questions regarding roles, interview schedules or eligibility? Reach our talent acquisition desk.
              </p>
              <div className="space-y-1.5 text-xs font-bold text-orange-200">
                <p>📞 Phone: <a href="tel:9147178886" className="underline hover:text-white">9147178886</a></p>
                <p>✉️ Email: <a href="mailto:support@pathfinder.edu.in" className="underline hover:text-white">support@pathfinder.edu.in</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
