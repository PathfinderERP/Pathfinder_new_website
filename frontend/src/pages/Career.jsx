import { getImageUrl } from "../utils/imageUtils";
// Career.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { ChevronLeftIcon, ChevronRightIcon, ArrowUpRightIcon, CurrencyDollarIcon, BookOpenIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { jobAPI } from "../services/jobAPI";

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute -right-6 lg:-right-28 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl z-30 hover:scale-110 transition-transform active:scale-95 group"
  >
    <ChevronRightIcon className="w-6 h-6 text-black stroke-[3] group-hover:text-[#FF8643] transition-colors" />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute -left-6 lg:-left-28 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl z-30 hover:scale-110 transition-transform active:scale-95 group"
  >
    <ChevronLeftIcon className="w-6 h-6 text-black stroke-[3] group-hover:text-[#FF8643] transition-colors" />
  </button>
);

const Career = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    jobType: "",
    experience: "",
    location: "",
    search: "",
    department: "",
  });

  const [dynamicDepartments, setDynamicDepartments] = useState(["View all"]);
  const [teamSlidesToShow, setTeamSlidesToShow] = useState(3);

  const jobTypeOptions = [
    { value: "", label: "All Types" },
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
  ];

  const experienceOptions = [
    { value: "", label: "All Experience" },
    { value: "fresher", label: "Fresher (0-1 years)" },
    { value: "entry", label: "Entry Level (1-2 years)" },
    { value: "mid", label: "Mid Level (2-5 years)" },
    { value: "senior", label: "Senior Level (5+ years)" },
  ];

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getActiveJobs();
      const jobsData = response.data.results || response.data;
      setJobs(jobsData);
      setFilteredJobs(jobsData);

      // Extract unique departments (handle legacy company field as fallback)
      const uniqueDepts = [...new Set(jobsData.map(job => job.department || job.company).filter(Boolean))];
      setDynamicDepartments(["View all", ...uniqueDepts]);
    } catch (err) {
      setError("Failed to fetch job openings");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setTeamSlidesToShow(1);
      } else if (width < 1024) {
        setTeamSlidesToShow(2);
      } else {
        setTeamSlidesToShow(3);
      }
    };
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    filterJobs();
  }, [filters, jobs]);

  const filterJobs = () => {
    let filtered = jobs;

    if (filters.jobType) {
      filtered = filtered.filter((job) => job.job_type === filters.jobType);
    }

    if (filters.experience) {
      filtered = filtered.filter(
        (job) => job.experience_level === filters.experience
      );
    }

    if (filters.location) {
      filtered = filtered.filter(
        (job) =>
          job.location.toLowerCase().includes(filters.location.toLowerCase()) ||
          job.district.toLowerCase().includes(filters.location.toLowerCase()) ||
          job.state.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.department && filters.department !== "View all") {
      filtered = filtered.filter(
        (job) => job.department?.toLowerCase() === filters.department.toLowerCase()
      );
    }

    if (filters.search) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.department?.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      jobType: "",
      experience: "",
      location: "",
      search: "",
    });
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

  const getJobTypeColor = (jobType) => {
    const colors = {
      full_time: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      part_time: "bg-blue-100 text-blue-800 border border-blue-200",
      contract: "bg-amber-100 text-amber-800 border border-amber-200",
      remote: "bg-purple-100 text-purple-800 border border-purple-200",
      hybrid: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    };
    return (
      colors[jobType] || "bg-slate-100 text-slate-800 border border-slate-200"
    );
  };

  const getExperienceColor = (experience) => {
    const colors = {
      fresher: "bg-green-100 text-green-800 border border-green-200",
      entry: "bg-sky-100 text-sky-800 border border-sky-200",
      mid: "bg-amber-100 text-amber-800 border border-amber-200",
      senior: "bg-rose-100 text-rose-800 border border-rose-200",
    };
    return (
      colors[experience] ||
      "bg-slate-100 text-slate-800 border border-slate-200"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading career opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[80px]">
      <div className="2xl:max-w-7xl mx-auto bg-white shadow-2xl shadow-gray-200 border-x border-gray-100 min-h-screen">
        {/* Hero Section - Constrained width Gradient */}
        <div className="relative bg-gradient-to-r from-[#FF6332] to-[#FF9D66] overflow-hidden">
          <div className="px-6 py-12 md:px-8 md:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-10">
            <div className="max-w-2xl relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-7xl leading-none mb-6">
                <span className="text-white font-bold">Be part of our</span><br />
                <span className="text-slate-900 font-black">mission!</span>
              </h1>
              <p className="text-lg md:text-xl text-white font-medium leading-tight max-w-xl">
                We're looking for <span className="text-slate-900 font-bold">passionate people</span> to join us on our mission.{" "}
                We value flat hierarchies, <span className="text-slate-900 font-bold">clear communication</span> & full ownership.
              </p>
            </div>

            <div className="flex-shrink-0 relative z-10 md:-mt-12 group">
              <div className="w-fit px-8 py-3 md:px-10 md:py-4 rounded-full border-2 border-white text-slate-900 font-bold text-lg shadow-sm cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 active:scale-95 text-center">
                We're hiring!
              </div>
            </div>
          </div>

          {/* Abstract Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        </div>

        <section className="bg-white pb-8 sm:pb-12 md:pb-16">
          <div className="px-4 sm:px-6 lg:px-8 pt-16">
            {/* Meet the Team Section */}
            {/* Meet the Team Section */}
            {/* Meet the Team Section */}
            <div className="bg-white px-4 md:px-8 pb-10">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 lg:gap-12 mb-8 lg:mb-16">
                <div className="max-w-3xl">
                  <h2 className="text-4xl md:text-6xl font-semibold text-slate-900 leading-[0.9] tracking-tighter">
                    Meet the team<br />
                    behind our<br />
                    success
                  </h2>
                </div>
                <div className="lg:max-w-sm mt-4">
                  <p className="text-slate-900 font-semibold leading-tight text-sm text-left lg:text-right">
                    At Pathfinder, we believe that education is the most powerful tool for transformation. Our team is dedicated to empowering students with the resources, mentorship, and guidance they need to succeed.
                  </p>
                </div>
              </div>

              {/* Team Carousel Card - Narrower Container */}
              <div className="max-w-6xl mx-auto">
                <div className="relative bg-[#FF8643] rounded-[32px] md:rounded-[48px] p-6 md:p-20 mb-8 overflow-visible shadow-2xl">
                  <div className="relative px-2">
                    <Slider
                      dots={false}
                      infinite={true}
                      speed={500}
                      slidesToShow={teamSlidesToShow}
                      slidesToScroll={1}
                      initialSlide={0}
                      focusOnSelect={true}
                      nextArrow={<NextArrow />}
                      prevArrow={<PrevArrow />}
                    >
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div key={idx} className="px-2 md:px-10">
                          <div className="aspect-square max-w-[240px] mx-auto bg-slate-900 rounded-full overflow-hidden border-[10px] border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 group">
                            <img
                              src={getImageUrl("/images/carrer/employee1.webp")}
                              alt="Team Member"
                              className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                            />
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>

                  {/* View All Button - Wider Pill */}
                  <div className="mt-20 flex justify-center">
                    <button className="w-full max-w-xl md:max-w-2xl bg-white text-slate-900 py-4 rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-2xl active:scale-[0.98]">
                      View All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Filters Black Bar */}
            <div className="bg-black py-4 md:py-8 mb-10 md:mb-20 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="max-w-7xl mx-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center px-6 md:px-0 justify-start md:justify-center gap-3 md:gap-4 w-max md:w-full md:flex-wrap mx-auto">
                  {dynamicDepartments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => handleFilterChange("department", dept)}
                      className={`px-6 py-1.5 rounded-full border border-white/30 text-base font-bold uppercase tracking-widest transition-all duration-300 flex-shrink-0 ${(filters.department === dept || (dept === "View all" && !filters.department))
                        ? "bg-gradient-to-r from-[#FF6332] to-[#FF9D66] border-none text-white shadow-lg shadow-orange-500/20 scale-105"
                        : "text-white/80 hover:bg-white/10 hover:text-white hover:scale-101"
                        }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jobs Listing Section */}
            <div className="max-w-7xl mx-auto px-4 mb-4">
              <div className="bg-[#F8FAFC] rounded-[32px] md:rounded-[48px] p-6 md:p-20 shadow-sm border border-slate-100">
                <div className="text-center mb-10 md:mb-20">
                  <h2 className="text-3xl md:text-[60px] font-bold text-slate-900 tracking-tighter">
                    Currently open positions
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12 md:gap-y-24">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="group transition-all duration-300">
                      <Link to={`/career/job/${job.id}`} className="block">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <div>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1 leading-tight group-hover:text-[#FF6332] transition-colors capitalize">
                              {job.title}
                            </h3>
                            <p className="text-sm md:text-lg text-slate-600">
                              {formatJobType(job.job_type)}
                            </p>
                          </div>
                          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 border border-slate-900/10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-black group-hover:border-black">
                            <ArrowUpRightIcon className="w-5 h-5 md:w-6 md:h-6 text-black transition-colors duration-300 group-hover:text-white stroke-[2.5]" />
                          </div>
                        </div>

                        <div className="h-[2px] bg-slate-900 w-full mb-4 md:mb-8 opacity-90"></div>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-4 md:mb-8 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex items-center">
                          <MapPinIcon className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-[#FF6332]" />
                          <span className="text-slate-900 text-sm md:text-lg font-bold capitalize">
                            {job.centre || job.location} centre
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {filteredJobs.length === 0 && !loading && (
                  <div className="text-center py-20 px-4">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ArrowUpRightIcon className="w-10 h-10 text-slate-400 rotate-45" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      No jobs found in this category
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                      Try selecting a different department or clear all filters to see all available positions.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-[#FF6332] hover:bg-[#FF4500] text-white px-8 py-3 rounded-full font-bold transition-all duration-200"
                    >
                      Browse All Categories
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits Section */}
            <div className="max-w-7xl mx-auto px-2 md:px-4 mb-8">
              <div className="bg-[#F8FAFC] rounded-[32px] md:rounded-[48px] px-4 py-8 md:p-20 shadow-sm border border-slate-100">
                <div className="text-center mb-10 md:mb-20">
                  <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-slate-900 mb-4 md:mb-6 tracking-tighter">
                    Why work with us?
                  </h2>
                  <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto">
                    We offer great benefits and opportunities for growth, ensuring our team feels valued and empowered.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                  {/* Benefit 1 */}
                  <div className="group bg-[#FFF7F5] rounded-[24px] md:rounded-[40px] p-5 md:p-10 transition-all duration-500 shadow-xl shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 border border-orange-200/50">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#FF6332] to-[#FF9D66] rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                      <CurrencyDollarIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight group-hover:text-[#FF6332] transition-colors">
                      Competitive Salary
                    </h3>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed font-bold">
                      We offer market-leading compensation packages with performance-based rewards and regular reviews.
                    </p>
                  </div>

                  {/* Benefit 2 */}
                  <div className="group bg-[#FFF7F5] rounded-[24px] md:rounded-[40px] p-5 md:p-10 transition-all duration-500 shadow-xl shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 border border-orange-200/50">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#FF6332] to-[#FF9D66] rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                      <BookOpenIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight group-hover:text-[#FF6332] transition-colors">
                      Growth & Learning
                    </h3>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed font-bold">
                      Continuous learning budgets, mentorship programs, and clear pathways to help you climb your career ladder.
                    </p>
                  </div>

                  {/* Benefit 3 */}
                  <div className="group bg-[#FFF7F5] rounded-[24px] md:rounded-[40px] p-5 md:p-10 transition-all duration-500 shadow-xl shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 border border-orange-200/50">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#FF6332] to-[#FF9D66] rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                      <UserGroupIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight group-hover:text-[#FF6332] transition-colors">
                      Incredible Culture
                    </h3>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed font-bold">
                      Work with a diverse, supportive, and brilliant team in an environment that values transparency and ownership.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Career;
