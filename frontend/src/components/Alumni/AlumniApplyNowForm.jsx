// AlumniApplyNowForm.jsx - Based on ApplyNowForm.jsx logic
import { useState, useEffect, useRef, useCallback } from "react";
import { useFilter } from "../../contexts/FilterContext";

function AlumniApplyNowForm({ course, isOpen, onClose, onSubmit, allowMultipleCentres = true, formTitle, formSubtitle }) {
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
        courseType: "", // Added for Alumni specific interest
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [availableCentres, setAvailableCentres] = useState([]);
    const [isCentreDropdownOpen, setIsCentreDropdownOpen] = useState(false);
    const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
    const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
    const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
    const [formAnimation, setFormAnimation] = useState("scale-95 opacity-0");

    // Performance optimization: Use refs for frequently accessed values
    const formDataRef = useRef(formData);
    const availableCentresRef = useRef(availableCentres);

    // Update refs when dependencies change
    useEffect(() => {
        formDataRef.current = formData;
        availableCentresRef.current = availableCentres;
    }, [formData, availableCentres]);

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

    // Initialize centres from course data
    useEffect(() => {
        if (course?.centres && Array.isArray(course.centres)) {
            setAvailableCentres(course.centres.map(centre => ({
                name: centre,
                id: centre.toLowerCase().replace(/\s+/g, '-'),
                selected: false
            })));
        }
    }, [course]);

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

        setIsSubmitting(true);
        setSubmitError("");

        // Validation
        if (!formData.fullName.trim()) { setSubmitError("Full name is required"); setIsSubmitting(false); return; }
        if (!formData.area.trim()) { setSubmitError("Area/locality is required"); setIsSubmitting(false); return; }
        if (!formData.phone.trim()) { setSubmitError("Phone number is required"); setIsSubmitting(false); return; }
        if (!validatePhone(formData.phone)) { setSubmitError("Please enter a valid Indian phone number"); setIsSubmitting(false); return; }
        if (!validateEmail(formData.email)) { setSubmitError("Please enter a valid email address"); setIsSubmitting(false); return; }
        if (formData.selectedCentres.length === 0) { setSubmitError("Please select at least one centre"); setIsSubmitting(false); return; }
        if (!formData.courseType) { setSubmitError("Please select an Interested Course"); setIsSubmitting(false); return; }

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
                course_name: formData.courseType,
                course: {
                    id: `alumni-${Date.now()}`,
                    name: formData.courseType,
                    goal: "Legend Selection",
                    mode: "Online/Offline",
                    location: formData.selectedCentres.length > 0
                        ? formData.selectedCentres.map(id => {
                            const centre = availableCentres.find(c => c.id === id);
                            return centre?.name || id;
                        }).join(", ")
                        : "Multiple Locations",
                    start: "Flexible",
                    price: "Contact for Price",
                    badge: "Alumni Choice",
                    centres: availableCentres.map(c => c.name)
                },
                selected_centres: formData.selectedCentres.map(id => {
                    const centre = availableCentres.find(c => c.id === id);
                    return centre?.name || id;
                }),
                application_date: new Date().toISOString(),
                status: "pending",
                source: "alumni_page_legend_enroll"
            };

            

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

                if (!response.ok) {
                    const resJson = await response.json();
                    throw new Error(resJson.message || "Failed to submit application");
                }

                onSubmit(applicationData);
                onClose();
            } else {
                onSubmit(applicationData);
                onClose();
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            setSubmitError(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            {/* Animated Backdrop */}
            <div className="absolute inset-0 bg-black/20" onClick={onClose} />

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
                                {formSubtitle || "Secure your future with us"}
                            </p>
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
                            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
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
                                className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400 bg-white text-gray-900 shadow-sm hover:border-gray-400"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Interested Course Dropdown (Alumni Specific) */}
                        <div className="space-y-1 relative">
                            <label className="block text-sm font-semibold text-gray-700">
                                Interested Course <span className="text-red-500">*</span>
                            </label>
                            <div
                                className="relative"
                                onMouseEnter={() => setIsCourseDropdownOpen(true)}
                                onMouseLeave={() => setIsCourseDropdownOpen(false)}
                            >
                                <button
                                    type="button"
                                    className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl bg-white text-left flex items-center justify-between hover:border-orange-500 hover:shadow-md transition-all duration-200 group text-gray-900"
                                >
                                    <span className={formData.courseType ? "text-gray-900" : "text-gray-400"}>
                                        {formData.courseType || "Select Course Category"}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform ${isCourseDropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isCourseDropdownOpen && (
                                    <div className="absolute z-[30] w-full pt-1 bg-transparent">
                                        <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                            {["All India", "Foundation", "Boards"].map((cat) => (
                                                <div
                                                    key={cat}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, courseType: cat }));
                                                        setIsCourseDropdownOpen(false);
                                                    }}
                                                    className={`px-4 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-orange-700 transition-colors ${formData.courseType === cat ? 'bg-orange-50 text-orange-700 font-semibold' : ''}`}
                                                >
                                                    {cat}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Class */}
                        <div className="space-y-1 relative">
                            <label htmlFor="class" className="block text-sm font-semibold text-gray-700">
                                Class (Optional)
                            </label>
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
                                    <div className="absolute z-[20] w-full pt-1 bg-transparent">
                                        <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                            {["Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Repeater"].map((className) => (
                                                <div
                                                    key={className}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, class: className }));
                                                        setIsClassDropdownOpen(false);
                                                    }}
                                                    className={`px-4 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-orange-700 transition-colors ${formData.class === className ? 'bg-orange-50 text-orange-700 font-semibold' : ''}`}
                                                >
                                                    {className}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Board */}
                        <div className="space-y-1 relative">
                            <label htmlFor="board" className="block text-sm font-semibold text-gray-700">
                                Board (Optional)
                            </label>
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
                                    <div className="absolute z-[20] w-full pt-1 bg-transparent">
                                        <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                            {["CBSE", "ICSE", "West Bengal Board", "Other"].map((boardName) => (
                                                <div
                                                    key={boardName}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, board: boardName }));
                                                        setIsBoardDropdownOpen(false);
                                                    }}
                                                    className={`px-4 py-3 hover:bg-orange-50 cursor-pointer text-gray-700 hover:text-orange-700 transition-colors ${formData.board === boardName ? 'bg-orange-50 text-orange-700 font-semibold' : ''}`}
                                                >
                                                    {boardName}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Centres Selection */}
                        {availableCentres.length > 0 && (
                            <div className="space-y-2 relative">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Select Centre{allowMultipleCentres ? "s" : ""} <span className="text-red-500">*</span>
                                </label>
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
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className={`font-medium ${formData.selectedCentres.length === 0 ? 'text-gray-500' : 'text-gray-800'}`}>
                                                {formData.selectedCentres.length === 0
                                                    ? "Select Centre Location"
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
                                    {isCentreDropdownOpen && (
                                        <div className="absolute z-[20] w-full pt-1 bg-transparent">
                                            <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                <div
                                                    onClick={() => toggleCentreSelection(null, true)}
                                                    className="px-4 py-3 border-b border-gray-100 hover:bg-orange-50 cursor-pointer flex items-center justify-between transition-colors group/select"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.selectedCentres.length === availableCentres.length
                                                            ? 'bg-orange-500 border-orange-500'
                                                            : 'border-gray-300 group-hover/select:border-orange-400'
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
                                                {availableCentres.map((centre) => (
                                                    <div
                                                        key={centre.id}
                                                        onClick={() => toggleCentreSelection(centre.id)}
                                                        className="px-4 py-3 hover:bg-orange-50 cursor-pointer flex items-center justify-between transition-colors group/item"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.selectedCentres.includes(centre.id)
                                                                ? 'bg-orange-500 border-orange-500'
                                                                : 'border-gray-300 group-hover/item:border-orange-400'
                                                                }`}>
                                                                {formData.selectedCentres.includes(centre.id) && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="text-gray-700 font-medium">{centre.name}</span>
                                                        </div>
                                                        {formData.selectedCentres.includes(centre.id) && (
                                                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Selected Centres Summary */}
                                {formData.selectedCentres.length > 0 && (
                                    <div className="mt-3">
                                        <div className="text-sm text-gray-600 mb-2 font-medium">
                                            Selected centres ({formData.selectedCentres.length}):
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.selectedCentres.map(id => {
                                                const centre = availableCentres.find(c => c.id === id);
                                                return centre ? (
                                                    <span
                                                        key={id}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-100 animate-in fade-in zoom-in duration-200"
                                                    >
                                                        <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {centre.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCentreSelection(centre.id)}
                                                            className="ml-1 text-orange-400 hover:text-orange-600 transition-colors"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* <p className="text-xs text-gray-500 mt-2 italic">
                                    {allowMultipleCentres
                                        ? "Hover to select multiple centres for this program"
                                        : "Hover to select a centre location"}
                                </p> */}
                            </div>
                        )}

                        {/* Area */}
                        <div className="space-y-1">
                            <label htmlFor="area" className="block text-sm font-semibold text-gray-700">
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
                                className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 shadow-sm hover:border-gray-400"
                                placeholder="e.g. Salt Lake, Howrah"
                            />
                        </div>

                        {/* School Name */}
                        <div className="space-y-1">
                            <label htmlFor="schoolName" className="block text-sm font-semibold text-gray-700">
                                School Name (Optional)
                            </label>
                            <input
                                type="text"
                                id="schoolName"
                                name="schoolName"
                                value={formData.schoolName}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 shadow-sm hover:border-gray-400"
                                placeholder="Enter your school name"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 shadow-sm hover:border-gray-400"
                                placeholder="10-digit mobile number"
                                maxLength="10"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                Email Address (Optional)
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 border border-gray-300 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 shadow-sm hover:border-gray-400"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        {submitError && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                                ⚠️ {submitError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Application"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AlumniApplyNowForm;
