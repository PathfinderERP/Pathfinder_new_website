// ApplyNowForm.jsx - Modern Light Theme (Matches Header)
import { useState, useEffect, useRef, useCallback } from "react";
import { useFilter } from "../../contexts/FilterContext";
import { useLocation, useNavigate } from "react-router-dom";
import { coursesAPI } from "../../services/api";
import {
  AcademicCapIcon,
  BookOpenIcon,
  ComputerDesktopIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  TagIcon,
  BoltIcon,
  PhoneIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";

function ApplyNowForm({ course: propCourse, isOpen: propIsOpen, onClose: propOnClose, onSubmit: propOnSubmit, allowMultipleCentres = true, isFromHeader: propIsFromHeader = false, formTitle, formSubtitle }) {
  const { setGlobalSelectedCentre } = useFilter(); // Use global filter context
  const location = useLocation();
  const navigate = useNavigate();

  const isPageMode = propIsOpen === undefined;
  const isOpen = isPageMode ? true : propIsOpen;
  
  const availableCourses = [
    {
      id: "all-india",
      name: "All India Entrance Programs",
      description: "National entrance preparation for NEET, JEE, and other national exams",
      centres: ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"],
      price: "Contact for Price",
      duration: "1-2 years",
      badge: "Popular",
      goal: "NEET/JEE Preparation"
    },
    {
      id: "foundation",
      name: "Foundation Program",
      description: "Build strong fundamentals for Class 8-10 students",
      centres: ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"],
      price: "Contact for Price",
      duration: "1 year",
      badge: "Trending",
      goal: "Class 8-10 Basics"
    },
    {
      id: "boards",
      name: "Board Exam Preparation",
      description: "Comprehensive preparation for CBSE, ICSE, and State Boards",
      centres: ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"],
      price: "Contact for Price",
      duration: "6 months - 1 year",
      badge: null,
      goal: "CBSE/ICSE Boards"
    }
  ];

  const [selectedCourseFromDropdown, setSelectedCourseFromDropdown] = useState(null);
  const course = propCourse || location.state?.courseData || selectedCourseFromDropdown;
  const isFromHeader = propIsFromHeader || location.state?.courseData?.isFromHeader || !propCourse;
  
  const onClose = isPageMode ? () => navigate(-1) : propOnClose;
  const onSubmit = propOnSubmit || (() => {});

  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const [coursesList, setCoursesList] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [selectedModeFilter, setSelectedModeFilter] = useState("all");

  useEffect(() => {
    if (isPageMode) {
      setIsLoadingCourses(true);
      coursesAPI.getAll()
        .then(res => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setCoursesList(list);
        })
        .catch(err => {
          console.error("Error fetching courses:", err);
          setCoursesList(availableCourses); // Fallback to static courses
        })
        .finally(() => {
          setIsLoadingCourses(false);
        });
    }
  }, [isPageMode]);

  const [formData, setFormData] = useState({
    fullName: "",
    class: "",
    area: "",
    schoolName: "",
    phone: "",
    email: "",
    board: "",
    selectedCentres: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [availableCentres, setAvailableCentres] = useState([]);
  const [isCentreDropdownOpen, setIsCentreDropdownOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const [formAnimation, setFormAnimation] = useState("scale-95 opacity-0");

  // Sync with global filter when centres are selected in this form
  useEffect(() => {
    if (isFromHeader) { // Only sync if this is the main header/enroll form
      if (formData.selectedCentres.length > 0) {
        // Find the name of the first selected centre
        const centreId = formData.selectedCentres[0];
        const centreObj = availableCentres.find(c => c.id === centreId);
        if (centreObj) {
          setGlobalSelectedCentre(centreObj.name);

        }
      } else {
        // Maybe don't reset to All if form is closed? Or do?
        // User might just be exploring. Let's not reset if they clear it while form is open?
        // Actually, if they clear it, maybe they mean "All"?
        // Let's safe-guard: only set if explicit.
      }
    }
  }, [formData.selectedCentres, isFromHeader, availableCentres, setGlobalSelectedCentre]);

  // Performance optimization: Use refs for frequently accessed values
  const formDataRef = useRef(formData);
  const availableCentresRef = useRef(availableCentres);
  const isFromHeaderRef = useRef(isFromHeader);
  const allowMultipleCentresRef = useRef(allowMultipleCentres);

  // Update refs when dependencies change
  useEffect(() => {
    formDataRef.current = formData;
    availableCentresRef.current = availableCentres;
    isFromHeaderRef.current = isFromHeader;
    allowMultipleCentresRef.current = allowMultipleCentres;
  }, [formData, availableCentres, isFromHeader, allowMultipleCentres]);

  // Form entrance animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setFormAnimation("scale-100 opacity-100");
      }, 50);
    } else {
      setFormAnimation("scale-95 opacity-0");
    }
  }, [isOpen]);

  // Get environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const APPLICATIONS_ENDPOINT = import.meta.env.VITE_APPLICATIONS_ENDPOINT || "/api/applications/";
  const CONTACT_PHONE = import.meta.env.VITE_CONTACT_PHONE || "+91-9147178886";
  const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "[EMAIL_ADDRESS]";

  // Initialize centres from course data (only for header dropdown)
  useEffect(() => {
    if (isFromHeader && course?.centres && Array.isArray(course.centres)) {
      setAvailableCentres(course.centres.map(centre => ({
        name: centre,
        id: centre.toLowerCase().replace(/\s+/g, '-'),
        selected: false
      })));
    }
  }, [course, isFromHeader]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (submitError) setSubmitError("");
  }, [submitError]);

  // Toggle centre selection
  const toggleCentreSelection = useCallback((centreId, isSelectAll = false) => {
    if (isSelectAll) {
      // Select/Deselect All
      const allSelected = formDataRef.current.selectedCentres.length === availableCentresRef.current.length;

      if (allSelected) {
        // Deselect all
        setFormData(prev => ({
          ...prev,
          selectedCentres: []
        }));
        setAvailableCentres(prev =>
          prev.map(centre => ({
            ...centre,
            selected: false
          }))
        );
      } else {
        // Select all
        const allCentreIds = availableCentresRef.current.map(centre => centre.id);
        setFormData(prev => ({
          ...prev,
          selectedCentres: allCentreIds
        }));
        setAvailableCentres(prev =>
          prev.map(centre => ({
            ...centre,
            selected: true
          }))
        );
      }
    } else {
      // Toggle single centre
      setFormData(prev => {
        const isSelected = prev.selectedCentres.includes(centreId);
        const newCentres = isSelected
          ? prev.selectedCentres.filter(id => id !== centreId)
          : [...prev.selectedCentres, centreId];

        return {
          ...prev,
          selectedCentres: newCentres
        };
      });

      // Update availableCentres selection state
      setAvailableCentres(prev =>
        prev.map(centre => ({
          ...centre,
          selected: centre.id === centreId ? !centre.selected : centre.selected
        }))
      );
    }
  }, []);

  const validatePhone = useCallback((phone) => {
    const phonePattern = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
    return phonePattern.test(phone);
  }, []);

  const validateEmail = useCallback((email) => {
    if (!email) return true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Early return for debugging
    if (process.env.NODE_ENV === 'development') {
      console.time('Form submission');
    }

    setIsSubmitting(true);
    setSubmitError("");

    // Validation
    if (!formData.fullName.trim()) {
      setSubmitError("Full name is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.area.trim()) {
      setSubmitError("Area/locality is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.phone.trim()) {
      setSubmitError("Phone number is required");
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(formData.phone)) {
      setSubmitError("Please enter a valid Indian phone number (10 digits starting with 6-9)");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setSubmitError("Please enter a valid email address or leave it empty");
      setIsSubmitting(false);
      return;
    }

    // For header dropdown: validate centre selection
    if (isFromHeader && formData.selectedCentres.length === 0) {
      setSubmitError("Please select at least one centre");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare application data
      const applicationData = {
        full_name: formData.fullName.trim(),
        student_class: formData.class.trim() || null,
        board: formData.board.trim() || null,
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        area: formData.area.trim(),
        school_name: formData.schoolName.trim() || null,

        course: isFromHeader ? {
          id: course?.id || `header-${Date.now()}`,
          name: course?.name || "Course from Header",
          goal: course?.goal || "General Course",
          mode: course?.mode || "Online/Offline",
          location: formData.selectedCentres.length > 0
            ? formData.selectedCentres.map(id => {
              const centre = availableCentres.find(c => c.id === id);
              return centre?.name || id;
            }).join(", ")
            : "Multiple Locations",
          start: course?.start || "Flexible",
          price: course?.price || "Contact for Price",
          badge: course?.badge || "Popular",
          centres: course?.centres || availableCentres.map(c => c.name)
        } : {
          id: course?.id,
          name: course?.name,
          goal: course?.goal,
          mode: course?.mode,
          location: course?.location,
          start: course?.start,
          price: course?.price,
          badge: course?.badge,
        },

        ...(isFromHeader && {
          selected_centres: formData.selectedCentres.map(id => {
            const centre = availableCentres.find(c => c.id === id);
            return centre?.name || id;
          }),
          course_name: course?.name,
          course_type: course?.name,
        }),

        application_date: new Date().toISOString(),
        status: "pending",
        source: isFromHeader ? "header_dropdown" : "course_card"
      };

      /* application data ready */


      // Send to backend API
      if (API_BASE_URL) {
        const response = await fetch(
          `${API_BASE_URL}${APPLICATIONS_ENDPOINT}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(applicationData),
          }
        );

        const contentType = response.headers.get("content-type");
        let result;

        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const textResponse = await response.text();
          console.error(
            "Server returned HTML instead of JSON:",
            textResponse.substring(0, 200)
          );

          if (!response.ok) {
            throw new Error(
              `Server error: ${response.status} ${response.statusText}`
            );
          } else {
            result = {
              success: true,
              message: "Application submitted successfully",
            };
          }
        }

        if (!response.ok) {
          console.error("Backend error details:", result);

          let errorMessage = "Failed to submit application";
          if (result.message) {
            errorMessage = result.message;
          } else if (typeof result === "object") {
            const fieldErrors = Object.entries(result)
              .map(
                ([field, errors]) =>
                  `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`
              )
              .join("; ");
            errorMessage = fieldErrors || errorMessage;
          }

          throw new Error(errorMessage);
        }

        /* submitted successfully */


        onSubmit(applicationData);

        // Reset form
        setFormData({
          fullName: "",
          class: "",
          area: "",
          schoolName: "",
          phone: "",
          email: "",
          board: "",
          selectedCentres: [],
        });

        setIsSubmittedSuccessfully(true);
        if (!isPageMode) {
          onClose();
        }
      } else {
        // For development without backend

        onSubmit(applicationData);
        setFormData({
          fullName: "",
          class: "",
          area: "",
          schoolName: "",
          phone: "",
          email: "",
          board: "",
          selectedCentres: [],
        });
        setIsSubmittedSuccessfully(true);
        if (!isPageMode) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes("course") && !errorMessage.includes("course_name")) {
        setSubmitError("Course selection is required. Please select a course from the dropdown.");
      } else if (errorMessage.includes("server error: 500")) {
        setSubmitError(
          "Our server is currently experiencing issues. Please try again in a few minutes or contact support."
        );
      } else if (
        errorMessage.includes("failed to fetch") ||
        errorMessage.includes("network error")
      ) {
        setSubmitError(
          "Network connection failed. Please check your internet connection and try again."
        );
      } else if (
        errorMessage.includes("student_class") ||
        errorMessage.includes("class")
      ) {
        setSubmitError(
          "Class selection error. Please select a valid class or leave it empty."
        );
      } else if (errorMessage.includes("phone")) {
        setSubmitError(
          "Phone number error: Please enter a valid Indian phone number (10 digits starting with 6-9)"
        );
      } else if (errorMessage.includes("email")) {
        setSubmitError(
          "Email error: Please enter a valid email address or leave it empty"
        );
      } else if (
        errorMessage.includes("full_name") ||
        errorMessage.includes("full name")
      ) {
        setSubmitError("Full name is required");
      } else if (errorMessage.includes("area")) {
        setSubmitError("Area/locality is required");
      } else {
        setSubmitError(
          error.message ||
          (CONTACT_PHONE
            ? `Submission failed: ${error.message || "Please try again or call " + CONTACT_PHONE}`
            : `Submission failed: ${error.message || "Please try again"}`)
        );
      }
    } finally {
      setIsSubmitting(false);

      if (process.env.NODE_ENV === 'development') {
        console.timeEnd('Form submission');
      }
    }
  };

  useEffect(() => {
  });


  if (!isPageMode && !isOpen) return null;

  if (isPageMode) {
    const filteredCourses = coursesList.filter(c => {
      const mode = (c.mode || "").toLowerCase();
      const name = (c.name || "").toLowerCase();
      
      if (selectedModeFilter === "online") {
        return mode.includes("online") || name.includes("online");
      }
      if (selectedModeFilter === "offline") {
        return mode.includes("offline") || !mode || name.includes("classroom") || name.includes("offline");
      }
      return true; // "all"
    });

    return (
      <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Banner */}
          <div className="text-center mb-12">
            <span className="text-[#66090D] text-sm font-bold tracking-widest uppercase bg-red-50 px-4 py-2 rounded-full border border-red-100">
              Admission Hub
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#292929] mt-4 tracking-tight">
              Choose Your Pathway to <span className="text-[#66090D]">Success</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto font-medium">
              Select a program below to enroll online with instant digital access, or explore offline classroom study options at our premium centres.
            </p>
          </div>

          {/* Mode Tabs / Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-orange-50/50 border border-orange-100/80 p-1.5 rounded-2xl flex gap-2 shadow-sm">
              {[
                { id: "all", label: "All Programs", icon: BookOpenIcon },
                { id: "online", label: "Online Programs", icon: ComputerDesktopIcon },
                { id: "offline", label: "Offline Classroom", icon: BuildingStorefrontIcon }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedModeFilter(tab.id)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2
                      ${selectedModeFilter === tab.id
                        ? "bg-[#66090D] text-white shadow-md shadow-[#66090D]/10 hover:scale-[1.02]"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {isLoadingCourses ? (
            <div className="py-20 flex flex-col justify-center items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-[#66090D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-500 font-semibold">Loading available courses...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm p-8 flex flex-col items-center justify-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-bold text-gray-700">No courses match the selected mode</h3>
              <p className="text-gray-500 mt-1">Please try choosing another tab or contact support for help.</p>
              <button onClick={() => setSelectedModeFilter("all")} className="mt-4 px-6 py-2.5 bg-[#66090D] text-white font-bold rounded-xl transition-all hover:bg-[#55080b]">
                Show All Programs
              </button>
            </div>
          ) : (
            /* Courses Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map(c => {
                const name = c.name || "Coaching Program";
                const desc = c.description || "Comprehensive coaching and test preparation program.";
                const duration = c.duration || "Varies";
                const price = c.course_price || c.price || "Contact for Price";
                const badge = c.badge || null;
                const centresList = c.centres || ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"];
                const isOnlineAvailable = (c.mode || "").toLowerCase().includes("online") || name.toLowerCase().includes("online") || (c.mode || "").toLowerCase().includes("hybrid");
                const isOfflineAvailable = (c.mode || "").toLowerCase().includes("offline") || !c.mode || name.toLowerCase().includes("classroom") || name.toLowerCase().includes("offline");

                return (
                  <div key={c._id || c.id} className="bg-white rounded-3xl border border-gray-150 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                    {/* Course Banner Image / Fallback Gradient */}
                    <div className="h-44 w-full relative bg-gradient-to-br from-[#66090D]/10 to-orange-500/10 flex items-center justify-center border-b border-gray-50 overflow-hidden">
                      {c.thumbnail_url ? (
                        <img
                          src={c.thumbnail_url}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-center p-4 flex flex-col items-center justify-center">
                          <AcademicCapIcon className="w-12 h-12 text-[#66090D] mb-1" />
                          <span className="text-xs font-bold text-[#66090D] tracking-wider uppercase">Pathfinder Program</span>
                        </div>
                      )}
                      
                      {/* Badge */}
                      {badge && (
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase shadow-md animate-pulse">
                          {badge}
                        </span>
                      )}

                      {/* Study Mode Tags */}
                      <div className="absolute bottom-4 right-4 flex gap-1">
                        {isOnlineAvailable && (
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase">Online</span>
                        )}
                        {isOfflineAvailable && (
                          <span className="bg-orange-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase">Classroom</span>
                        )}
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-extrabold text-xl text-gray-800 tracking-tight leading-snug group-hover:text-[#66090D] transition-colors">
                        {name}
                      </h3>
                      
                      <p className="text-gray-500 text-sm mt-3 line-clamp-3 leading-relaxed flex-1">
                        {desc}
                      </p>

                      {/* Info badges */}
                      <div className="grid grid-cols-2 gap-2 mt-5 py-3 border-y border-gray-50 text-xs font-semibold text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>Duration: <strong>{duration}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <TagIcon className="w-4 h-4 text-gray-400 font-bold" />
                          <span className="text-orange-600 font-extrabold">{price}</span>
                        </div>
                      </div>

                      {/* Admission Options Panel */}
                      <div className="mt-5 space-y-4">
                        {/* Option 1: Online Admission */}
                        <div className="p-4 bg-orange-50/40 border border-orange-100/50 rounded-2xl flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              <BoltIcon className="w-4 h-4 text-orange-500" />
                              Online Admission
                            </span>
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">Instant</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-snug">
                            Pay online to get immediate access to digital portals, test-series, and online batches.
                          </p>
                          <button
                            onClick={() => {
                              navigate("/buynow", {
                                state: {
                                  courseData: {
                                    ...c,
                                    name: name,
                                    course_price: c.course_price || c.price || "Contact for Price",
                                    mode: isOnlineAvailable ? "Online" : "Offline",
                                    centre: isOnlineAvailable ? "Online" : centresList[0]
                                  }
                                }
                              });
                            }}
                            className="mt-1 w-full bg-[#66090D] hover:bg-[#55080b] text-white font-extrabold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-xs tracking-wider uppercase"
                          >
                            Buy Now
                          </button>
                        </div>

                        {/* Option 2: Offline Admission */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              <BuildingStorefrontIcon className="w-4 h-4 text-[#66090D]" />
                              Classroom Admission
                            </span>
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">At Centre</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-snug">
                            Attend physical classroom lectures, offline mock tests, and print materials at our premium branches.
                          </p>

                          <div className="mt-1 text-[11px] font-semibold text-gray-600 flex items-center justify-between">
                            <span>Available centres:</span>
                            <span className="text-slate-800 font-bold">{centresList.length} locations</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <a
                              href="tel:+91-9147178886"
                              className="w-full border border-slate-200 hover:border-orange-400 hover:bg-white text-slate-700 font-bold py-2 rounded-xl text-center text-[10.5px] transition-all flex items-center justify-center gap-1.5"
                            >
                              <PhoneIcon className="w-3.5 h-3.5 text-gray-500" />
                              <span>Call Helpline</span>
                            </a>
                            <button
                              onClick={() => {
                                navigate("/", { replace: true });
                                setTimeout(() => {
                                  document.getElementById("admissions")?.scrollIntoView({ behavior: "smooth" });
                                }, 300);
                              }}
                              className="w-full border border-slate-200 hover:border-orange-400 hover:bg-white text-slate-700 font-bold py-2 rounded-xl text-center text-[10.5px] transition-all flex items-center justify-center gap-1.5"
                            >
                              <IdentificationIcon className="w-3.5 h-3.5 text-gray-500" />
                              <span>Book Counselling</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const formCard = (
    <div
      className={`bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-500 ${formAnimation} [&::-webkit-scrollbar]:hidden [-ms-overflow-style]:none [scrollbar-width]:none border border-white/20 relative z-[9999]`}
    >
      {/* Header - Matches Main Website Header Color */}
      <div className="bg-[#66090D] text-white p-6 rounded-t-2xl sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1 text-white relative inline-block">
              {formTitle || "Enroll Now"}
            </h3>
            <p className="text-orange-100/90 text-sm">
              {formSubtitle || (isFromHeader ? "Secure your future with us" : "Reserve your seat in this program")}
            </p>

            {/* Show selected course name with animation */}
            {isFromHeader && course?.name && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 animate-slide-in-left">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-orange-200 text-xs font-medium">Selected:</span>
                <span className="font-bold text-white text-xs">{course.name}</span>
              </div>
            )}
          </div>

          {/* Animated close button - show only in modal mode */}
          {!isPageMode && (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white transition-all duration-300 p-2 rounded-full hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Dynamic Course Selector Dropdown if no course is selected */}
        {!propCourse && !location.state?.courseData && (
          <div className="mb-6 space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Select Course Program <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCourseFromDropdown?.id || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selected = availableCourses.find(c => c.id === selectedId);
                setSelectedCourseFromDropdown(selected || null);
                setFormData(prev => ({ ...prev, selectedCentres: [] }));
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-500 transition-all duration-200"
            >
              <option value="" disabled>-- Choose a Program --</option>
              {availableCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
          {/* Course Details Card - Light Theme */}
          {course && (
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 mb-6">
              {course.thumbnail_url && (
                <div className="mb-4 rounded-lg overflow-hidden h-32 w-full border border-gray-100">
                  <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg text-gray-800">
                  {course.name}
                </h4>
                {course.badge && (
                  <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                    {course.badge}
                  </span>
                )}
              </div>

              {/* Show different info based on source */}
              {!isFromHeader ? (
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      🎯
                    </span>
                    <span>
                      Goal: <strong className="text-gray-800">{course.goal}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      📍
                    </span>
                    <span>
                      Mode: <strong className="text-gray-800">{course.mode}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                      🏢
                    </span>
                    <span>
                      Location: <strong className="text-gray-800">{course.location}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      📅
                    </span>
                    <span>
                      Starts: <strong className="text-gray-800">{course.start}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-orange-200/50 mt-2">
                    <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                      💰
                    </span>
                    <span className="text-lg font-bold text-orange-600">
                      {course.price}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                      📚
                    </span>
                    <span>
                      Selected Course: <strong className="text-gray-800">{course.name}</strong>
                    </span>
                  </div>
                  {course.goal && (
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        🎯
                      </span>
                      <span>
                        Focus: <strong className="text-gray-800">{course.goal}</strong>
                      </span>
                    </div>
                  )}
                  {course.centres && (
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        🏢
                      </span>
                      <span>
                        Available at: <strong className="text-gray-800">{course.centres.length} centres</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Centre Selection Section - Light Theme */}
          {isFromHeader && availableCentres.length > 0 && (
            <div className="mb-6 centre-dropdown-container">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Select Centre{allowMultipleCentres ? "s" : ""} <span className="text-red-500">*</span>
                </label>

                {/* Custom Dropdown - Light */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsCentreDropdownOpen(true)}
                  onMouseLeave={() => setIsCentreDropdownOpen(false)}
                >
                  <button
                    type="button"
                    className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl bg-white text-left flex items-center justify-between hover:border-orange-500 hover:shadow-md transition-all duration-200 group text-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={`font-medium ${formData.selectedCentres.length === 0 ? 'text-gray-500' : 'text-gray-800'}`}>
                        {formData.selectedCentres.length === 0
                          ? "Select Centre Type"
                          : formData.selectedCentres.length === availableCentres.length
                            ? "All centres selected"
                            : `${formData.selectedCentres.length} centre${formData.selectedCentres.length > 1 ? 's' : ''} selected`
                        }
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isCentreDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu - Light */}
                  {isCentreDropdownOpen && (
                    <div className="absolute z-[20] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {/* Select All Option */}
                      <div
                        onClick={() => toggleCentreSelection(null, true)}
                        className="px-4 py-3 border-b border-gray-100 hover:bg-orange-50 cursor-pointer flex items-center justify-between transition-colors group/select"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.selectedCentres.length === availableCentres.length
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-300'
                            }`}>
                            {formData.selectedCentres.length === availableCentres.length && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="font-semibold text-gray-700">Select All Centres</span>
                        </div>
                        <span className="text-xs text-orange-600 font-medium">
                          {formData.selectedCentres.length === availableCentres.length ? 'All selected' : 'Click to select all'}
                        </span>
                      </div>

                      {/* Individual Centre Options */}
                      {availableCentres.map((centre) => (
                        <div
                          key={centre.id}
                          onClick={() => toggleCentreSelection(centre.id)}
                          className="px-4 py-3 hover:bg-orange-50 cursor-pointer flex items-center justify-between transition-colors group/item"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${centre.selected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                              }`}>
                              {centre.selected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-gray-700 font-medium">{centre.name}</span>
                          </div>
                          {centre.selected && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                              Selected
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Centres Summary */}
                {formData.selectedCentres.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-2">
                      Selected centres ({formData.selectedCentres.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedCentres.map(id => {
                        const centre = availableCentres.find(c => c.id === id);
                        return centre ? (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-100"
                          >
                            <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {centre.name}
                            <button
                              type="button"
                              onClick={() => toggleCentreSelection(centre.id)}
                              className="ml-1 text-orange-400 hover:text-orange-600"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {allowMultipleCentres
                    ? "Hover to select multiple centres for this course"
                    : "Hover to select a centre for this course"}
                </p>
              </div>
            </div>
          )}

          {/* Application Form - Light Theme */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-2">
              <h4 className="font-bold text-gray-800 text-lg">
                Student Information
              </h4>
              <p className="text-gray-500 text-sm">
                Fill in your details to proceed
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm hover:border-gray-400"
                placeholder="Enter your full name"
              />
            </div>

            {/* Class */}
            <div className="space-y-1 relative">
              <label
                htmlFor="class"
                className="block text-sm font-semibold text-gray-700"
              >
                Class (Optional)
              </label>

              {/* Class Dropdown - Light */}
              <div
                className="relative"
                onMouseEnter={() => setIsClassDropdownOpen(true)}
                onMouseLeave={() => setIsClassDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl bg-white text-left flex items-center justify-between hover:border-orange-500 hover:shadow-md transition-all duration-200 group text-gray-900"
                >
                  <span className={formData.class ? "text-gray-900" : "text-gray-400"}>
                    {formData.class || "Select Class"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isClassDropdownOpen && (
                  <div className="absolute z-[20] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {[
                      "Class 7",
                      "Class 8",
                      "Class 9",
                      "Class 10",
                      "Class 11",
                      "Class 12",
                      "Repeater"
                    ].map((className) => (
                      <div
                        key={className}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, class: className }));
                          setIsClassDropdownOpen(false);
                        }}
                        className={`px-4 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-orange-700 transition-colors ${formData.class === className ? 'bg-orange-50 text-orange-700 font-semibold' : ''
                          }`}
                      >
                        {className}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Board (Optional) */}
            <div className="space-y-1 relative">
              <label
                htmlFor="board"
                className="block text-sm font-semibold text-gray-700"
              >
                Board (Optional)
              </label>

              {/* Board Dropdown - Light */}
              <div
                className="relative"
                onMouseEnter={() => setIsBoardDropdownOpen(true)}
                onMouseLeave={() => setIsBoardDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl bg-white text-left flex items-center justify-between hover:border-orange-500 hover:shadow-md transition-all duration-200 group text-gray-900"
                >
                  <span className={formData.board ? "text-gray-900" : "text-gray-400"}>
                    {formData.board || "Select Board"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isBoardDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isBoardDropdownOpen && (
                  <div className="absolute z-[20] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {[
                      "CBSE",
                      "ICSE",
                      "West Bengal Board",
                      "Other"
                    ].map((boardName) => (
                      <div
                        key={boardName}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, board: boardName }));
                          setIsBoardDropdownOpen(false);
                        }}
                        className={`px-4 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-orange-700 transition-colors ${formData.board === boardName ? 'bg-orange-50 text-orange-700 font-semibold' : ''
                          }`}
                      >
                        {boardName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label
                htmlFor="area"
                className="block text-sm font-semibold text-gray-700"
              >
                Area/Locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm hover:border-gray-400"
                placeholder="e.g. Salt Lake, Howrah, etc."
              />
            </div>

            {/* School Name */}
            <div className="space-y-1">
              <label
                htmlFor="schoolName"
                className="block text-sm font-semibold text-gray-700"
              >
                School Name (Optional)
              </label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm hover:border-gray-400"
                placeholder="Enter your school name"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm hover:border-gray-400"
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  📞
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email Address (Optional)
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 bg-white text-gray-900 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm hover:border-gray-400"
                  placeholder="your.email@example.com"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ✉️
                </div>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-pulse">
                ⚠️ {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Application</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              By submitting, you agree to our Terms & Privacy Policy
            </p>
          </form>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      {/* Animated Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      {formCard}
    </div>
  );
}

export default ApplyNowForm;