import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { coursesAPI } from "../../services/api";
import { useAdminCache } from "../../hooks/useAdminCache";
import ImageModal from "../ImageModal";
import {
  Search,
  User,
  Calendar,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Plus as PlusIcon,
  Monitor,
  Users,
  RefreshCw,
  Trash2
} from "lucide-react";
import {
  PlusIcon as PlusHero,
  AcademicCapIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";

const CourseList = () => {
  // --- Caching Hook Implementation ---
  const fetchCoursesData = useCallback(async () => {
    
    const response = await coursesAPI.getAll();
    

    // Handle different response formats
    let coursesData = [];
    if (response && response.data && Array.isArray(response.data)) {
      coursesData = response.data;
    } else if (response && Array.isArray(response)) {
      coursesData = response;
    } else if (response && response.data && response.data.results) {
      coursesData = response.data.results;
    }

    // Process each course (Logic moved from old fetchCourses)
    const processedCourses = coursesData.map(course => {
      let createdAt = course.created_at;
      let updatedAt = course.updated_at;

      const hasTimezoneCreated = createdAt && typeof createdAt === 'string' && (createdAt.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(createdAt));
      if (createdAt && typeof createdAt === 'string' && !hasTimezoneCreated) createdAt += 'Z';

      const hasTimezoneUpdated = updatedAt && typeof updatedAt === 'string' && (updatedAt.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(updatedAt));
      if (updatedAt && typeof updatedAt === 'string' && !hasTimezoneUpdated) updatedAt += 'Z';

      const cDate = new Date(createdAt);
      const uDate = new Date(updatedAt);
      if (!isNaN(cDate.getTime()) && !isNaN(uDate.getTime()) && cDate > uDate) {
        const temp = createdAt;
        createdAt = updatedAt;
        updatedAt = temp;
      }

      if (!createdAt && course.id) {
        // Helper assumed to be available or redefined inside/outside
        // For cleanliness, we'll just check if getDateFromObjectId exists or move it up.
        // Since getDateFromObjectId is defined inside component below, we need to ensure scope.
        // Better to move helper functions out or assume they are accessible.
        // Let's rely on standard logic here for now without helper if complex, or just keep simple.
      }

      const creatorName = course.created_by_name ||
        course.created_by ||
        (course.created_by_email ? course.created_by_email.split('@')[0] : "System");

      const creatorEmail = course.created_by_email ||
        (course.created_by && course.created_by.includes('@') ? course.created_by : "");

      return {
        ...course,
        id: course._id?.$oid || course._id || course.id,
        created_at: createdAt,
        updated_at: updatedAt,
        created_by_name: creatorName,
        created_by_email: creatorEmail
      };
    });

    return processedCourses;
  }, []);

  const {
    data: courses,
    loading,
    error: cacheError,
    refresh: fetchCourses,
    updateCache
  } = useAdminCache("admin_courses", fetchCoursesData);

  const [error, setError] = useState("");

  useEffect(() => {
    if (cacheError) setError(cacheError);
  }, [cacheError]);

  // Force refresh when navigating back from create/edit
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true') {
      
      // Clear cache first to ensure fresh data
      const cacheKey = `admin_cache_admin_courses`;
      localStorage.removeItem(cacheKey);
      
      fetchCourses();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchCourses]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [modalAlt, setModalAlt] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCentre, setSelectedCentre] = useState("all");
  const [selectedMode, setSelectedMode] = useState("all");
  const [selectedCourseType, setSelectedCourseType] = useState("all");
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("all");
  const [priceSort, setPriceSort] = useState("none");
  const [dateSort, setDateSort] = useState("newest");
  const [availableCentres, setAvailableCentres] = useState([]);
  const [availableCourseTitles, setAvailableCourseTitles] = useState([]);
  const [availableCourseTypes, setAvailableCourseTypes] = useState([]);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    course_price: "",
    mode: "",
    is_active: "",
    badge: "",
    programme: "",
    class_level: "",
    duration: "",
    course_sessions: "",
    offers: "",
    language: "",
    starting_date: "",
    course_type: "",
    course_title: "",
  });
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Removed explicit fetchCourses call on mount as hook handles it

  // Helper function to extract date from MongoDB ObjectId
  const getDateFromObjectId = (objectId) => {
    if (!objectId || typeof objectId !== 'string' || objectId.length !== 24) {
      return null;
    }
    try {
      const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000;
      return new Date(timestamp);
    } catch (error) {
      console.error("Error extracting date from ObjectId:", error);
      return null;
    }
  };

  // Robust UTC to IST converter
  const getISTDate = (dateString) => {
    if (!dateString) return null;
    try {
      // Create date object
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;

      // Check if it's already an IST styled string or if we need to force it
      // Standardize to UTC milliseconds
      const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
      // If the string already had 'Z', date.getTime() gives UTC. 
      // If the string was "2025... (no Z)", browser assumed Local. 
      // This is tricky. Let's rely on standard parsing but force the offset add.

      // Better approach: Use Intl with explicit timezone, but if that fails, use manual offset.
      // Let's stick to the cleanest solution: proper Intl usage.

      return date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  const formatDateIST = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return "Error";
    }
  };

  const formatTimeIST = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }).toUpperCase();
    } catch (error) {
      return "";
    }
  };

  const formatFullDateTimeIST = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return "Error";
    }
  };

  // Update available filters when courses change
  useEffect(() => {
    if (courses.length > 0) {
      const centres = [...new Set(courses.map(course => course.centre).filter(Boolean))];
      setAvailableCentres(centres.sort());

      const titles = [...new Set(courses.map(course => course.course_title).filter(Boolean))];
      setAvailableCourseTitles(titles.sort());

      const types = [...new Set(courses.map(course => course.name).filter(Boolean))];
      setAvailableCourseTypes(types.sort());
    }
  }, [courses]);

  const handleImageClick = (imageUrl, altText) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setModalAlt(altText);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalAlt("");
  };

  // Fallback function for testing
  const useFallbackData = () => {
    const fallbackCourses = [
      {
        id: "692d56875934d959943522f8",
        name: "Foundation Course JEE",
        centre: "HAZRA",
        class_level: "JEE",
        mode: "offline",
        duration: "12",
        course_price: "25000.00",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by_name: "Admin User",
        created_by_email: "atanu@pathfinder.edu.com",
        created_by: "atanu@pathfinder.edu.in",
        address: "47, Kalidas Patitundi Lane, Kalighat, Kolkata",
        badge: "popular",
        // popularity: "4.8",
        offers: "15",
        state: "West Bengal",
        district: "Kolkata",
        course_sessions: "2024-2025",
        location: "https://maps.google.com",
        programme: "CRP",
        course_type: "Institution",
        starting_date: "2024-01-15",
        language: "English, Hindi"
      },
    ];

    setCourses(fallbackCourses);
    const centres = [...new Set(fallbackCourses.map(course => course.centre).filter(Boolean))];
    setAvailableCentres(centres);
  };

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let result = [...courses];

    // Apply filters
    result = result.filter(course => {
      // Search term filter
      const matchesSearch = searchTerm === "" ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.class_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.created_by_email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Centre filter
      const matchesCentre = selectedCentre === "all" || course.centre === selectedCentre;

      // Mode filter
      const matchesMode = selectedMode === "all" || course.mode === selectedMode;

      // Course Type filter
      const matchesType = selectedCourseType === "all" || course.name === selectedCourseType;

      // Course Title filter
      const matchesTitle = selectedCourseTitle === "all" || course.course_title === selectedCourseTitle;

      return matchesSearch && matchesCentre && matchesMode && matchesType && matchesTitle;
    });

    // Apply price sorting
    if (priceSort !== "none") {
      result.sort((a, b) => {
        const priceA = parseFloat(a.course_price) || 0;
        const priceB = parseFloat(b.course_price) || 0;

        if (priceSort === "low-high") {
          return priceA - priceB;
        } else if (priceSort === "high-low") {
          return priceB - priceA;
        }
        return 0;
      });
    } else {
      // Date sort (only if price sort is NOT active)
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
    }

    return result;
  }, [courses, searchTerm, selectedCentre, selectedMode, selectedCourseType, selectedCourseTitle, priceSort, dateSort]);

  // Course Statistics
  const courseStats = useMemo(() => {
    const totalCourses = courses.length;
    const filteredCourses = filteredAndSortedCourses.length;
    const onlineCourses = courses.filter(course => course.mode?.toLowerCase() === 'online').length;
    const offlineCourses = courses.filter(course => course.mode?.toLowerCase() === 'offline').length;
    const filteredOnline = filteredAndSortedCourses.filter(course => course.mode?.toLowerCase() === 'online').length;
    const filteredOffline = filteredAndSortedCourses.filter(course => course.mode?.toLowerCase() === 'offline').length;

    return {
      totalCourses,
      filteredCourses,
      onlineCourses,
      offlineCourses,
      filteredOnline,
      filteredOffline
    };
  }, [courses, filteredAndSortedCourses]);

  // Helper function to get creator name
  const getCreatorName = (course) => {
    if (course.created_by_name) return course.created_by_name;
    if (course.created_by_email) return course.created_by_email;
    if (course.created_by && typeof course.created_by === 'object') {
      return course.created_by.name || course.created_by.email || "Unknown";
    }
    if (course.created_by) return String(course.created_by);
    return "Unknown";
  };

  // Helper function to get creator email
  const getCreatorEmail = (course) => {
    if (course.created_by_email) return course.created_by_email;
    if (course.created_by && typeof course.created_by === 'object') {
      return course.created_by.email || "";
    }
    return "";
  };

  // Check if course was edited (has updated_at different from created_at)
  const wasEdited = (course) => {
    if (!course.created_at || !course.updated_at) return false;

    const created = new Date(course.created_at).getTime();
    const updated = new Date(course.updated_at).getTime();

    // Allow for a small difference (e.g. < 1000ms) which might happen during creation if fields are set sequentially
    // But typically they are set in same save() call.
    // If they are exactly equal, it wasn't edited.
    return Math.abs(updated - created) > 1000; // 1 second buffer
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredAndSortedCourses.slice(indexOfFirstItem, indexOfLastItem);

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await coursesAPI.delete(courseId);
      // Optimistic update
      const newCourses = courses.filter(course => course.id !== courseId);
      updateCache(newCourses);
    } catch (err) {
      setError("Failed to delete course");
      console.error("Error deleting course:", err);
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCentre("all");
    setSelectedMode("all");
    setSelectedCourseType("all");
    setSelectedCourseTitle("all");
    setPriceSort("none");
    setDateSort("newest");
    setCurrentPage(1);
  };

  // Selection handlers
  const handleSelectCourse = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const currentPageIds = currentCourses.map(c => c.id);
    const allSelected = currentPageIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to update ${selectedIds.length} courses?`)) return;

    setBulkUpdating(true);
    setError("");
    let successCount = 0;
    const errors = [];

    try {
      for (const id of selectedIds) {
        try {
          // Filter out empty fields from bulkEditData
          const dataToUpdate = {};
          if (bulkEditData.course_price) dataToUpdate.course_price = parseFloat(bulkEditData.course_price);
          if (bulkEditData.mode) dataToUpdate.mode = bulkEditData.mode;
          if (bulkEditData.is_active !== "") dataToUpdate.is_active = bulkEditData.is_active === "true";
          if (bulkEditData.badge) dataToUpdate.badge = bulkEditData.badge;
          if (bulkEditData.programme) dataToUpdate.programme = bulkEditData.programme;
          if (bulkEditData.class_level) dataToUpdate.class_level = bulkEditData.class_level;
          if (bulkEditData.duration) dataToUpdate.duration = bulkEditData.duration;
          if (bulkEditData.course_sessions) dataToUpdate.course_sessions = bulkEditData.course_sessions;
          if (bulkEditData.offers) dataToUpdate.offers = parseFloat(bulkEditData.offers);
          if (bulkEditData.language) dataToUpdate.language = bulkEditData.language;
          if (bulkEditData.starting_date) dataToUpdate.starting_date = bulkEditData.starting_date;
          if (bulkEditData.course_type) dataToUpdate.name = bulkEditData.course_type; // Map Course Type to 'name' field
          if (bulkEditData.course_title) dataToUpdate.course_title = bulkEditData.course_title;

          if (Object.keys(dataToUpdate).length > 0) {
            await coursesAPI.update(id, dataToUpdate);
            successCount++;
          }
        } catch (err) {
          errors.push(`ID ${id}: ${err.response?.data?.error || "Update failed"}`);
        }
      }

      if (successCount > 0) {
        alert(`Successfully updated ${successCount} course(s).`);
        fetchCourses();
        setSelectedIds([]);
        setIsBulkEditModalOpen(false);
      }

      if (errors.length > 0) {
        setError(`Errors during bulk update:\n${errors.join("\n")}`);
      }
    } catch (err) {
      setError("Failed to process bulk update.");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedIds.length} course(s)? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    setBulkUpdating(true);
    setError("");
    let successCount = 0;
    const errors = [];

    try {
      for (const id of selectedIds) {
        try {
          await coursesAPI.delete(id);
          successCount++;
        } catch (err) {
          errors.push(`ID ${id}: ${err.response?.data?.error || "Delete failed"}`);
        }
      }

      if (successCount > 0) {
        alert(`Successfully deleted ${successCount} course(s).`);
        // Clear cache and refresh
        const cacheKey = `admin_cache_admin_courses`;
        localStorage.removeItem(cacheKey);
        fetchCourses();
        setSelectedIds([]);
      }

      if (errors.length > 0) {
        setError(`Errors during bulk delete:\n${errors.join("\n")}`);
      }
    } catch (err) {
      setError("Failed to process bulk delete.");
    } finally {
      setBulkUpdating(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('₹', '₹ ');
  };

  const LoadingSkeleton = () => (
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

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-transparent p-0">
      <ImageModal
        imageUrl={selectedImage}
        alt={modalAlt}
        onClose={closeModal}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Course Portfolio</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage and monitor all academy courses</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                
                const cacheKey = `admin_cache_admin_courses`;
                localStorage.removeItem(cacheKey);
                fetchCourses();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
              title="Refresh course list"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
            >
              <X className="w-4 h-4" />
              Reset Filters
            </button>
            <Link
              to="/admin/courses/create"
              className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              New Course
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-blue-50 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {courseStats.totalCourses}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                  Showing {courseStats.filteredCourses} after filters
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-orange-50 dark:bg-orange-900/20 opacity-0 group-hover:opacity-100 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Online Learning</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {courseStats.onlineCourses}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                  {courseStats.filteredOnline} filtered
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                <Monitor className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">In-Person Centres</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {courseStats.offlineCourses}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                  {courseStats.filteredOffline} filtered
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-1.5 h-6 bg-orange-600 rounded-full" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Smart Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Input */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Search Database
              </label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="ID, Name, Centre..."
                  className="pl-10 pr-4 py-2.5 w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Centre Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Academic Centre
              </label>
              <select
                value={selectedCentre}
                onChange={(e) => {
                  setSelectedCentre(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
              >
                <option value="all">All Centres</option>
                {availableCentres.map((centre, index) => (
                  <option key={index} value={centre}>{centre}</option>
                ))}
              </select>
            </div>

            {/* Course Type Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Stream/Type
              </label>
              <select
                value={selectedCourseType}
                onChange={(e) => {
                  setSelectedCourseType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
              >
                <option value="all">All Learning Streams</option>
                {availableCourseTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Learning Mode
              </label>
              <select
                value={selectedMode}
                onChange={(e) => {
                  setSelectedMode(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all"
              >
                <option value="all">Hybrid (All Modes)</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Price Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by Price
              </label>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={priceSort}
                  onChange={(e) => {
                    setPriceSort(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="none">Default Order</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Date Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={dateSort}
                  onChange={(e) => {
                    setDateSort(e.target.value);
                    setPriceSort("none"); // Reset price sort
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="newest">Newest Created</option>
                  <option value="oldest">Oldest Created</option>
                  <option value="updated-newest">Recently Updated</option>
                  <option value="updated-oldest">Least Recently Updated</option>
                </select>
              </div>
            </div>
            {/* Items Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items Per Page
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={courses.length || 1000}>Show All</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {/* Active Filters Summary */}
          {(searchTerm || selectedCentre !== "all" || selectedMode !== "all" || selectedCourseType !== "all" || selectedCourseTitle !== "all" || priceSort !== "none" || dateSort !== "newest") && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="ml-1.5 hover:text-blue-600 font-bold">×</button>
                  </span>
                )}
                {selectedCentre !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Centre: {selectedCentre}
                    <button onClick={() => setSelectedCentre("all")} className="ml-1.5 hover:text-green-600 font-bold">×</button>
                  </span>
                )}
                {selectedCourseType !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Type: {selectedCourseType}
                    <button onClick={() => setSelectedCourseType("all")} className="ml-1.5 hover:text-purple-600 font-bold">×</button>
                  </span>
                )}
                {selectedCourseTitle !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Title: {selectedCourseTitle}
                    <button onClick={() => setSelectedCourseTitle("all")} className="ml-1.5 hover:text-orange-600 font-bold">×</button>
                  </span>
                )}
                {selectedMode !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Mode: {selectedMode}
                    <button onClick={() => setSelectedMode("all")} className="ml-1.5 hover:text-indigo-600 font-bold">×</button>
                  </span>
                )}
                {priceSort !== "none" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Price: {priceSort === 'low-high' ? 'Low to High' : 'High to Low'}
                    <button onClick={() => setPriceSort("none")} className="ml-1.5 hover:text-yellow-600 font-bold">×</button>
                  </span>
                )}
                {dateSort !== "newest" && priceSort === "none" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    Date: {dateSort === 'oldest' ? 'Oldest Created' : dateSort === 'updated-newest' ? 'Recently Updated' : 'Least Recently Updated'}
                    <button onClick={() => setDateSort("newest")} className="ml-1.5 hover:text-slate-600 font-bold">×</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top Pagination */}
        {currentCourses.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 mb-6 overflow-hidden">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAndSortedCourses.length)} of {filteredAndSortedCourses.length} results
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Jump to page input */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Jump to:</span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        defaultValue={currentPage}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= totalPages) {
                              goToPage(page);
                              e.target.value = page;
                            } else {
                              e.target.value = currentPage;
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            goToPage(page);
                          } else {
                            e.target.value = currentPage;
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-label="Page number"
                      />
                      <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg">
                        / {totalPages}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => goToPage(pageNum)}
                            className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Show ellipsis if there are more pages */}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}

                      {/* Always show last page if not in current range */}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <button
                          onClick={() => goToPage(totalPages)}
                          className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === totalPages
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {totalPages}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-visible">
          {/* Table Header */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-800 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Courses</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Showing {currentCourses.length} of {filteredAndSortedCourses.length} courses
                  {filteredAndSortedCourses.length !== courses.length && ` (filtered from ${courses.length} total)`}
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>

          {/* Bulk Selection Header */}
          {courses.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={currentCourses.length > 0 && currentCourses.every(c => selectedIds.includes(c.id))}
                  onChange={handleSelectAllOnPage}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedIds.length > 0 ? `${selectedIds.length} courses selected` : "Select All on Page"}
                </span>
              </div>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsBulkEditModalOpen(true)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Bulk Edit ({selectedIds.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkUpdating}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Bulk Delete ({selectedIds.length})
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Courses List */}
          <div className="divide-y divide-gray-200">
            {currentCourses.length > 0 ? (
              currentCourses.map((course, index) => {
                const creatorName = getCreatorName(course);
                const creatorEmail = getCreatorEmail(course);
                const wasCourseEdited = wasEdited(course);



                return (
                  <div
                    key={course.id}
                    className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all border-b border-gray-100 dark:border-slate-800 flex gap-4 ${selectedIds.includes(course.id) ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(course.id)}
                        onChange={() => handleSelectCourse(course.id)}
                        className="w-4 h-4 text-orange-600 rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-orange-500 cursor-pointer transition-all"
                      />
                    </div>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Course Identity */}
                      <div className="lg:col-span-4 flex items-center gap-4">
                        <div className="relative group/img">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-gray-200 dark:border-slate-700 shadow-sm cursor-zoom-in group-hover/img:scale-105 transition-transform"
                              onClick={() => handleImageClick(course.thumbnail_url, course.name)}
                            />
                          ) : (
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-dashed border-gray-300 dark:border-slate-700 ${course.mode === 'online' ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                              <span className={`text-xl font-bold ${course.mode === 'online' ? 'text-purple-600' : 'text-emerald-600'}`}>
                                {course.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          {course.badge && (
                            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-600 text-white text-[8px] font-black uppercase rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                              {course.badge}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
                            {course.course_title || course.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-500">{course.class_level}</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500">•</span>
                            <span className="text-[10px] text-gray-500 dark:text-slate-400 italic">ID: {course.id.slice(-6)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deployment Details */}
                      <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <BuildingOfficeIcon className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-tighter">Centre</p>
                            <p className="text-xs font-bold text-gray-700 dark:text-slate-300 truncate">{course.centre}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${course.mode === 'online' ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                            {course.mode === 'online' ? <Monitor className="w-3.5 h-3.5 text-purple-600" /> : <Users className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-tighter">Mode</p>
                            <p className="text-xs font-bold text-gray-700 dark:text-slate-300 capitalize">{course.mode}</p>
                          </div>
                        </div>
                      </div>

                      {/* Commercials */}
                      <div className="lg:col-span-2">
                        <div className="text-right lg:text-left">
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-black tracking-tighter">Commercials</p>
                          <div className="flex items-center lg:justify-start justify-end gap-1.5">
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                              {course.discounted_price ? formatPrice(course.discounted_price) : formatPrice(course.course_price)}
                            </span>
                            {course.offers && (
                              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded">
                                -{course.offers}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-2 flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/courses/${course.id}/edit`}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all"
                          title="Edit Portfolio"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                          title="Archive Course"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                  <AcademicCapIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Portfolio remains empty</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto text-sm">
                  {filteredAndSortedCourses.length === 0 && courses.length > 0
                    ? "Our search systems couldn't find matches for the applied logic."
                    : "No course assets have been registered in the system yet."}
                </p>
                <Link
                  to="/admin/courses/create"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20"
                >
                  Create Your First Asset
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {currentCourses.length > 0 && (
            <div className="px-6 py-5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 rounded-b-2xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">
                  Showing <span className="text-gray-900 dark:text-white">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAndSortedCourses.length)}</span> of <span className="text-gray-900 dark:text-white">{filteredAndSortedCourses.length}</span> Assets
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-xl p-1 gap-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) pageNum = i + 1;
                        else if (currentPage <= 2) pageNum = i + 1;
                        else if (currentPage >= totalPages - 1) pageNum = totalPages - 2 + i;
                        else pageNum = currentPage - 1 + i;

                        return (
                          <button
                            key={i}
                            onClick={() => goToPage(pageNum)}
                            className={`w-8 h-8 text-[11px] font-black rounded-lg transition-all ${currentPage === pageNum ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-8 w-px bg-gray-200 dark:bg-slate-800" />

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Jump To</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      defaultValue={currentPage}
                      onBlur={(e) => goToPage(parseInt(e.target.value))}
                      className="w-12 h-8 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-xs font-black text-center focus:ring-2 focus:ring-orange-600/20 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Bulk Edit Modal */}
        {
          isBulkEditModalOpen && (
            <div className="fixed inset-0 z-[2000] overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={() => !bulkUpdating && setIsBulkEditModalOpen(false)}>
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <form onSubmit={handleBulkUpdate}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Bulk Edit {selectedIds.length} Courses
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            Changes will be applied to all selected courses. Leave fields empty if you don't want to change them.
                          </p>

                          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 px-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Course Price (₹)</label>
                                <input
                                  type="number"
                                  value={bulkEditData.course_price}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, course_price: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  placeholder="Enter new price"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Course Type</label>
                                <select
                                  value={bulkEditData.course_type}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, course_type: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                >
                                  <option value="">Don't Change</option>
                                  <option value="Foundation">Foundation</option>
                                  <option value="All India">All India</option>
                                  <option value="Boards">Boards</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                  value={bulkEditData.is_active}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, is_active: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                >
                                  <option value="">Don't Change</option>
                                  <option value="true">Active</option>
                                  <option value="false">Inactive</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Badge</label>
                                <input
                                  type="text"
                                  value={bulkEditData.badge}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, badge: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  placeholder="e.g. Popular, New"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Programme</label>
                                <select
                                  value={bulkEditData.programme}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, programme: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                >
                                  <option value="">Don't Change</option>
                                  <option value="CRP">CRP</option>
                                  <option value="NCRP">NCRP</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Class Level</label>
                                <input
                                  type="text"
                                  value={bulkEditData.class_level}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, class_level: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  placeholder="e.g. Class 11, NEET"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Duration</label>
                                <input
                                  type="text"
                                  value={bulkEditData.duration}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, duration: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  placeholder="e.g. 1 year, 6 months"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Course Sessions</label>
                                <input
                                  type="text"
                                  value={bulkEditData.course_sessions}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, course_sessions: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  placeholder="e.g. 100 sessions"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Offers (% Discount)</label>
                                <input
                                  type="number"
                                  value={bulkEditData.offers}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, offers: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  placeholder="e.g. 20"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Language</label>
                                <input
                                  type="text"
                                  value={bulkEditData.language}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, language: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  placeholder="e.g. English, Hindi"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Starting Date</label>
                                <input
                                  type="date"
                                  value={bulkEditData.starting_date}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, starting_date: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Mode</label>
                                <select
                                  value={bulkEditData.mode}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, mode: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                >
                                  <option value="">Don't Change</option>
                                  <option value="online">Online</option>
                                  <option value="offline">Offline</option>
                                  <option value="centre">Centre</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">Course Title</label>
                                <input
                                  type="text"
                                  value={bulkEditData.course_title}
                                  onChange={(e) => setBulkEditData({ ...bulkEditData, course_title: e.target.value })}
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                  placeholder="e.g. JEE Main Special Batch"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                      <button
                        type="submit"
                        disabled={bulkUpdating}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50"
                      >
                        {bulkUpdating ? "Updating..." : "Apply Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsBulkEditModalOpen(false)}
                        disabled={bulkUpdating}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default CourseList;