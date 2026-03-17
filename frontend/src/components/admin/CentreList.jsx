import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { centresAPI } from "../../services/api";
import { useAdminCache } from "../../hooks/useAdminCache";
import ImageModal from "../ImageModal";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  ArrowUpDown,
  Building2,
  MapPin,
  Trophy,
  Plus as PlusIcon,
  RefreshCcw,
  LayoutGrid,
  List as ListIcon,
  ExternalLink,
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  BuildingOfficeIcon,
  MapIcon,
  AcademicCapIcon,
  CalendarIcon,
  FunnelIcon,
  PlusIcon as PlusHero
} from "@heroicons/react/24/outline";

const CentreList = () => {
  const fetchCentresData = useCallback(async () => {
    const response = await centresAPI.getAll();
    const centresData = Array.isArray(response.data)
      ? response.data
      : (response.data?.results || []);
    return centresData;
  }, []);

  const {
    data: centres,
    loading,
    error: cacheError,
    refresh: fetchCentres,
    updateCache: updateCentresCache
  } = useAdminCache("admin_centres", fetchCentresData);

  const [error, setError] = useState("");

  useEffect(() => {
    if (cacheError) setError(cacheError);
  }, [cacheError]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalAlt, setModalAlt] = useState("");
  const [hoveredTopper, setHoveredTopper] = useState(null);

  // Force refresh when navigating back from create/edit
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true') {
      
      const cacheKey = `admin_cache_admin_centres`;
      localStorage.removeItem(cacheKey);
      fetchCentres();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchCentres]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [dateSort, setDateSort] = useState("newest");

  // Derived state
  const uniqueStates = useMemo(() => [...new Set(centres.map(c => c.state).filter(Boolean))], [centres]);

  const uniqueDistricts = useMemo(() => {
    let dists = centres;
    if (selectedState !== "all") {
      dists = dists.filter(c => c.state === selectedState);
    }
    return [...new Set(dists.map(c => c.district).filter(Boolean))];
  }, [centres, selectedState]);

  const filteredAndSortedCentres = useMemo(() => {
    let result = centres.filter(centre => {
      const matchesSearch = searchTerm === "" ||
        centre.centre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centre.centre_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centre.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = selectedState === "all" || centre.state === selectedState;
      const matchesDistrict = selectedDistrict === "all" || centre.district === selectedDistrict;

      return matchesSearch && matchesState && matchesDistrict;
    });

    // Apply date sorting
    result.sort((a, b) => {
      const dateA_created = new Date(a.created_at || 0).getTime();
      const dateB_created = new Date(b.created_at || 0).getTime();
      const dateA_updated = new Date(a.updated_at || 0).getTime();
      const dateB_updated = new Date(b.updated_at || 0).getTime();

      switch (dateSort) {
        case "newest":
          return dateB_created - dateA_created;
        case "oldest":
          return dateA_created - dateB_created;
        case "updated-newest":
          return dateB_updated - dateA_updated;
        case "updated-oldest":
          return dateA_updated - dateB_updated;
        default:
          return 0;
      }
    });

    return result;
  }, [centres, searchTerm, selectedState, selectedDistrict, dateSort]);

  const totalPages = Math.ceil(filteredAndSortedCentres.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCentres = filteredAndSortedCentres.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedState("all");
    setSelectedDistrict("all");
    setDateSort("newest");
    setCurrentPage(1);
  };

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedState, selectedDistrict]);

  const PaginationControls = () => {
    if (filteredAndSortedCentres.length === 0) return null;
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-4">
            Viewing <span className="text-gray-900 dark:text-white">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAndSortedCentres.length)}</span> of <span className="text-gray-900 dark:text-white">{filteredAndSortedCentres.length}</span> Nodes
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-50 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center px-3">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageNum)}
                      className={`w-9 h-9 text-[11px] font-black rounded-xl transition-all ${currentPage === pageNum ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // Add image click handlers
  const handleLogoClick = (logoUrl, centreName) => {
    if (logoUrl) {
      setSelectedImage(logoUrl);
      setModalAlt(`${centreName} Logo`);
    }
  };

  const handleTopperImageClick = (imageUrl, topperName) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setModalAlt(`${topperName} Photo`);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalAlt("");
  };

  // Enhanced date formatting that handles null values
  const formatDateTime = (dateInput) => {
    if (!dateInput) return "Not Available";

    try {
      let date;

      if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else {
        return "Invalid Date";
      }

      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch (error) {
      console.error("Date formatting error:", error, dateInput);
      return "Invalid Date";
    }
  };

  // Get display date with fallbacks
  const getDisplayDate = (centre, field) => {
    // Direct field access
    if (centre[field]) {
      return formatDateTime(centre[field]);
    }

    // Try alternative field names
    const alternativeFields = [`${field}_formatted`, `${field}_iso`];

    for (const altField of alternativeFields) {
      if (centre[altField]) {
        return formatDateTime(centre[altField]);
      }
    }

    return "Not Available";
  };

  // Truncate long URLs for better display
  const truncateUrl = (url, maxLength = 50) => {
    if (!url) return "";
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  const handleDeleteCentre = async (centreId, centreName) => {
    if (
      window.confirm(`Are you sure you want to delete centre "${centreName}"?`)
    ) {
      try {
        await centresAPI.delete(centreId);
        alert("Centre deleted successfully!");
        fetchCentres();
      } catch (err) {
        setError("Failed to delete centre");
        console.error("Delete centre error:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-0">
      {/* Image Modal for viewing Logos and Portraits */}
      <ImageModal
        imageUrl={selectedImage}
        alt={modalAlt}
        onClose={closeModal}
      />

      {/* Hero Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Regional Network</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Orchestrate and monitor academy operational nodes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const cacheKey = `admin_cache_admin_centres`;
              localStorage.removeItem(cacheKey);
              fetchCentres();
            }}
            className="p-2 text-gray-500 hover:text-orange-600 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl transition-all shadow-sm"
            title="Reload Network"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          <Link
            to="/business/admin/centres/create"
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
          >
            <PlusIcon className="w-5 h-5" />
            Initialize Centre
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
          <X className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-tight">{error}</span>
        </div>
      )}

      {/* Network Intelligence Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
              <FunnelIcon className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Discovery System</h3>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">Filter operational nodes by region</p>
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="group flex items-center gap-2 px-5 py-2 text-[11px] font-black text-gray-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 uppercase tracking-widest transition-all"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Purge Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Discovery Query */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Node Identity</label>
            <div className="relative group/input">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/input:text-orange-600 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Centre Name or Code"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Regional Jurisdiction */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">State Domain</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all appearance-none cursor-pointer shadow-inner"
            >
              <option value="all">Everywhere</option>
              {uniqueStates.map((state, index) => (
                <option key={index} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Local Sector */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">District Sector</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all appearance-none cursor-pointer shadow-inner disabled:opacity-40"
              disabled={selectedState !== "all" && uniqueDistricts.length === 0}
            >
              <option value="all">All Sectors</option>
              {uniqueDistricts.map((district, index) => (
                <option key={index} value={district}>{district}</option>
              ))}
            </select>
          </div>

          {/* Temporal Ordering */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Chronological Order</label>
            <select
              value={dateSort}
              onChange={(e) => {
                setDateSort(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all appearance-none cursor-pointer shadow-inner"
            >
              <option value="newest">Latest Inbound</option>
              <option value="oldest">Historical Nodes</option>
              <option value="updated-newest">Recently Optimized</option>
              <option value="updated-oldest">Stable Nodes</option>
            </select>
          </div>
        </div>
      </div>

      <PaginationControls />

      <div className="grid grid-cols-1 gap-6 mb-12">
        {currentCentres.length > 0 ? (
          currentCentres.map((centre) => (
            <div key={centre.id} className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />

              <div className="flex flex-col lg:flex-row gap-8 relative items-start lg:items-center">
                {/* Media Node */}
                <div className="flex-shrink-0">
                  {centre.centre_image || centre.logo_url ? (
                    <div
                      className="relative w-28 h-28 rounded-3xl overflow-hidden cursor-pointer shadow-lg group-hover:shadow-orange-500/20 transition-all border-4 border-white dark:border-slate-800 bg-gray-100 dark:bg-slate-800"
                      onClick={() => handleLogoClick(centre.centre_image || centre.logo_url, centre.centre)}
                    >
                      <img
                        src={centre.centre_image || centre.logo_url}
                        alt={centre.centre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-3xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-slate-700">
                      <Building2 className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Information Domain */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">
                      {centre.centre}
                    </h3>
                    <div className="flex items-center gap-1.5 ml-2">
                      {centre.centre_code && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {centre.centre_code}
                        </span>
                      )}
                      {centre.centre_type && (
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {centre.centre_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="font-bold text-gray-700 dark:text-slate-300 truncate">{centre.district}, {centre.state}</span>
                    </div>
                    {centre.location && (
                      <a
                        href={centre.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-orange-600 dark:text-orange-500 hover:opacity-80 transition-opacity"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-widest">Geo Coordinates</span>
                      </a>
                    )}
                  </div>

                  {/* Toppers Performance Hub */}
                  {centre.toppers && centre.toppers.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Performance Hub • {centre.toppers.length} High Assets</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {centre.toppers.slice(0, 5).map((topper, idx) => (
                          <div
                            key={idx}
                            className="group/topper relative cursor-pointer"
                            onClick={() => topper.image_url && handleTopperImageClick(topper.image_url, topper.name)}
                          >
                            {topper.image_url ? (
                              <img
                                src={topper.image_url}
                                alt={topper.name}
                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800 group-hover/topper:ring-orange-500 transition-all shadow-md shadow-black/5"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                                <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}

                            {/* Hover Intel Modal */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover/topper:opacity-100 pointer-events-none transition-all duration-300 z-50">
                              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 min-w-[240px]">
                                <div className="flex items-center gap-3 mb-3">
                                  {topper.image_url && <img src={topper.image_url} className="w-12 h-12 rounded-xl object-cover" />}
                                  <div>
                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{topper.name}</h4>
                                    <p className="text-[10px] text-orange-600 dark:text-orange-500 font-bold uppercase">{topper.exam}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-gray-50 dark:bg-slate-800 p-2 rounded-xl">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Rank</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">#{topper.rank}</p>
                                  </div>
                                  <div className="bg-gray-50 dark:bg-slate-800 p-2 rounded-xl">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Score</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">{topper.percentages}%</p>
                                  </div>
                                </div>
                              </div>
                              <div className="w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-gray-100 dark:border-slate-800 rotate-45 mx-auto -mt-1.5" />
                            </div>
                          </div>
                        ))}
                        {centre.toppers.length > 5 && (
                          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-orange-500/20">
                            +{centre.toppers.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Operational Protocols */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-end w-full lg:w-auto">
                  <Link
                    to={`/admin/centres/${centre.id}/edit`}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 dark:bg-slate-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-500 font-bold rounded-2xl transition-all border border-transparent hover:border-orange-100 dark:hover:border-orange-900/30 text-xs uppercase tracking-widest"
                  >
                    <Edit className="w-4 h-4" />
                    Configure
                  </Link>
                  <button
                    onClick={() => handleDeleteCentre(centre.id, centre.centre)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Node Status Line */}
              <div className="mt-8 pt-4 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3 h-3" />
                    Initialized • {getDisplayDate(centre, 'created_at')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCcw className="w-3 h-3" />
                  Last Scan • {getDisplayDate(centre, 'updated_at')}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 border border-dashed border-gray-200 dark:border-slate-800 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-gray-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Deployment Vacuum</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No regional nodes detected within specified parameters.</p>
            <button
              onClick={resetFilters}
              className="mt-6 px-8 py-3 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 uppercase text-xs tracking-widest"
            >
              Reset Protocol
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CentreList;
