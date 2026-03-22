// ApplyNowForm.jsx - Modern Light Theme (Matches Header)
import { useState, useEffect, useRef, useCallback } from "react";
import { useFilter } from "../../contexts/FilterContext";

function ApplyNowForm({ course, isOpen, onClose, onSubmit, allowMultipleCentres = true, isFromHeader = false, formTitle, formSubtitle }) {
  const { setGlobalSelectedCentre } = useFilter(); // Use global filter context

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

        onClose();
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
        onClose();
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


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      {/* Animated Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Main Form Container with Animation - LIGHT THEME */}
      <div
        className={`bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-500 ${formAnimation}
          [&::-webkit-scrollbar]:hidden
          [-ms-overflow-style]:none
          [scrollbar-width]:none
          border border-white/20 relative z-[9999]
        `}
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

            {/* Animated close button */}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white transition-all duration-300 p-2 rounded-full hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
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
    </div>
  );
}

export default ApplyNowForm;