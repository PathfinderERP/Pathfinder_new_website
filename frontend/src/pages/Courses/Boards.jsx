import { getImageUrl } from "../../utils/imageUtils";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { coursesAPI, centresAPI } from "../../services/api";
import CourseDetailModal from "../../components/CourseDetailModal";
import { useCachedData } from "../../hooks/useCachedData";
import { useCallback } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Helper to preload images
const preloadImages = (srcs) => {
    const promises = srcs.map((src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one fails
        });
    });
    return Promise.all(promises);
};

export default function BoardsPage() {
    const { data: coursesDataRaw, loading: coursesLoading } = useCachedData("all_courses", () => coursesAPI.getAll());
    const { data: centresDataRaw, loading: centresLoading } = useCachedData("centres", () => centresAPI.getAll());

    const isPageLoading = coursesLoading || centresLoading;

    const coursesData = useMemo(() => Array.isArray(coursesDataRaw) ? coursesDataRaw : [], [coursesDataRaw]);
    const centresData = useMemo(() => Array.isArray(centresDataRaw) ? centresDataRaw : [], [centresDataRaw]);

    if (isPageLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 scroll-smooth lg:mt-20">
            {/* Hero Section - Unique Design */}
            <BoardsHero />

            {/* COURSES SECTION with Filters */}
            <CoursesSection
                courseType="boards"
                preFetchedCourses={coursesData}
                preFetchedCentres={centresData}
            />

            {/* Features and Stories Section */}
            <FeaturesAndStoriesSection />

            {/* FAQ Section */}
            <FAQSection />

        </div>
    );
}

/********************
 * HERO SECTION - Unique Design
 *******************/
function BoardsHero() {
    return (
        <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pt-24 sm:pt-16 md:pt-20 pb-10 sm:pb-16 md:pb-20 overflow-hidden w-full 2xl:mx-auto 2xl:max-w-7xl 2xl:rounded-3xl 2xl:mt-10 shadow-sm">
            {/* Animated Background Pattern - Softer version */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-orange-200 to-red-200 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-red-100 to-pink-100 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Left Banner Image */}
            <div className="absolute left-0 top-[32%] -translate-y-1/2 hidden lg:block z-0">
                <img
                    src={getImageUrl("/images/course_images/hero_leftside banner.webp")}
                    alt="Left Banner"
                    className="h-[350px] xl:h-[400px] w-auto object-contain opacity-90"
                />
            </div>

            {/* Right Banner Image */}
            <div className="absolute right-0 top-[32%] -translate-y-1/2 hidden lg:block z-10">
                <img
                    src={getImageUrl("/images/course_images/hero_rightside banner.webp")}
                    alt="Right Banner"
                    className="h-[360px] xl:h-[400px] w-auto object-contain opacity-90"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-5xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-full mb-4 sm:mb-6 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[#66090D] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider">Board Exam Preparation</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-6 px-2">
                        <span className="text-gray-900">
                            Excel in Your
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-[#66090D] via-[#8B0A0F] to-[#A10B12] bg-clip-text text-transparent drop-shadow-sm">
                            Board Exams
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base lg:text-lg text-[#66090D] max-w-3xl mx-auto leading-relaxed font-medium px-4">
                        Comprehensive preparation for CBSE, ICSE, and State Board exams. Score 95%+ with our proven methods and expert guidance.
                    </p>

                    {/* Key Highlights Banner */}
                    <div className="mt-6 sm:mt-8 md:mt-10 max-w-3xl mx-auto px-4">
                        <div className="bg-white/80 backdrop-blur-sm border-2 border-[#66090D]/20 rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                                <div className="flex items-center justify-center md:justify-start">
                                    <div className="flex items-center gap-3 w-full max-w-[240px] md:max-w-none">
                                        <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-[#66090D] to-[#A10B12] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-bold text-gray-900 leading-tight">95%+ Scores</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Board Excellence</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center md:justify-start">
                                    <div className="flex items-center gap-3 w-full max-w-[240px] md:max-w-none">
                                        <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-bold text-gray-900 leading-tight">Concept Clarity</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Strong Foundation</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center md:justify-start lg:col-span-1 md:col-span-2 lg:md:justify-start md:justify-center">
                                    <div className="flex items-center gap-3 w-full max-w-[240px] md:max-w-none">
                                        <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-bold text-gray-900 leading-tight">Regular Tests</div>
                                            <div className="text-xs sm:text-sm text-gray-600">Track Progress</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - 2x2 on Mobile, 4 in one row on Desktop */}
                    <div className="mt-10 sm:mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-4">
                        {[
                            { number: "98%", label: "SUCCESS RATE", color: "text-red-800", icon: "🏆" },
                            { number: "5,000+", label: "BOARD TOPPERS", color: "text-orange-600", icon: "👨‍🎓" },
                            { number: "40+", label: "EXPERT FACULTY", color: "text-red-700", icon: "👨‍🏫" },
                            { number: "95%+", label: "AVERAGE SCORE", color: "text-orange-500", icon: "⭐" }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-orange-50 text-center flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg">
                                <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
                                <div className={`text-xl sm:text-2xl md:text-3xl font-black ${stat.color} leading-none`}>
                                    {stat.number}
                                </div>
                                <div className="text-slate-600 text-[10px] sm:text-xs mt-2 font-bold tracking-wider leading-tight px-1 uppercase">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 sm:mt-10 md:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 px-4">
                        {[
                            { icon: "📚", label: "CBSE, ICSE, State", bg: "bg-[#66090D]/10", text: "text-[#66090D]", border: "border-[#66090D]/20" },
                            { icon: "🎯", label: "Focus on Basics", bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-200" },
                            { icon: "⭐", label: "95%+ Guarantee", bg: "bg-red-50", text: "text-red-900", border: "border-red-200" }
                        ].map((item, index) => (
                            <div key={index} className={`flex items-center gap-2.5 px-6 py-2.5 sm:px-6 sm:py-2.5 ${item.bg} ${item.border} border rounded-full shadow-sm hover:shadow-md transition-shadow duration-300 w-fit`}>
                                <span className="text-base sm:text-lg">{item.icon}</span>
                                <span className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${item.text}`}>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Board Types */}
                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        {[
                            { name: "CBSE", color: "bg-blue-100 text-blue-800 border-blue-200" },
                            { name: "ICSE", color: "bg-purple-100 text-purple-800 border-purple-200" },
                            { name: "WBCHSE", color: "bg-green-100 text-green-800 border-green-200" },
                            { name: "ISC", color: "bg-red-100 text-red-800 border-red-200" },
                            { name: "State Boards", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
                        ].map((board, index) => (
                            <div key={index} className={`px-4 py-2 rounded-lg border ${board.color} text-sm font-medium shadow-sm`}>
                                {board.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Decorative Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                </svg>
            </div>
        </section>
    );
}

/********************
 * COURSE DETAIL MODAL
 *******************/


/********************
 * COURSES SECTION with Cascading Filters
 *******************/
function CoursesSection({ courseType = "foundation", preFetchedCourses, preFetchedCentres }) {
    const [courses, setCourses] = useState([]);
    const [centres, setCentres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Track allowed centres from Apply Now form
    const [allowedCentres, setAllowedCentres] = useState([]);
    const [isFromApplyNow, setIsFromApplyNow] = useState(false);

    // Filter states
    const [selectedCentre, setSelectedCentre] = useState("All");
    const [selectedProgramme, setSelectedProgramme] = useState("All");
    const [selectedMode, setSelectedMode] = useState("All");
    const [selectedClassLevel, setSelectedClassLevel] = useState("All");
    const [selectedDuration, setSelectedDuration] = useState("All");
    const [sortBy, setSortBy] = useState("default");

    // Modal state
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, isLoading } = useAuth();

    // Get centre filter from navigation state (from Apply Now form)
    useEffect(() => {
        let centresFromNav = [];

        // Check for snake_case version first
        if (location.state?.formData?.selected_centres?.length > 0) {
            centresFromNav = location.state.formData.selected_centres;
        }
        // Fallback for camelCase version
        else if (location.state?.formData?.selectedCentres?.length > 0) {
            centresFromNav = location.state.formData.selectedCentres;
        }

        if (centresFromNav.length > 0) {
            
            setIsFromApplyNow(true);
            setAllowedCentres(centresFromNav);

            // If single centre, select it directly; if multiple, show "All" (which means all allowed)
            if (centresFromNav.length === 1) {
                setSelectedCentre(centresFromNav[0]);
            } else {
                setSelectedCentre("All");
            }
        }
    }, [location.state]);

    // Process courses (Filter logic)
    useEffect(() => {
        const processCourses = (coursesData, centresData) => {
            try {
                setLoading(true);

                // Determine effective course type from navigation state or prop
                const stateFilter = location.state?.courseFilter;
                const targetType = stateFilter ? stateFilter.toLowerCase() : courseType.toLowerCase();
                

                // Extract centre names
                const centreNames = centresData.map(c => c.centre).filter(Boolean);
                setCentres(centreNames);

                // Filter courses based on target type
                const filteredCourses = coursesData.filter((course) => {
                    const courseName = course.name?.toLowerCase() || "";
                    const targetExam = course.target_exam?.toLowerCase() || "";
                    const courseLevel = course.course_level?.toLowerCase() || "";

                    let isMatch = false;

                    if (targetType.includes("all india") || targetType.includes("medical") || targetType.includes("engineering")) {
                        // Match All India / JEE / NEET / CUET / NDA
                        const examKeywords = ['jee', 'neet', 'cuet', 'nda', 'medical', 'engineering'];
                        const nameHasKeyword = examKeywords.some(keyword => courseName.includes(keyword));
                        const targetHasKeyword = examKeywords.some(keyword => targetExam.includes(keyword));

                        isMatch = targetHasKeyword || nameHasKeyword || courseName.includes("all india");
                    } else if (targetType.includes("board")) {
                        // Match Boards - strict exclusion of other types to be safe
                        isMatch = (targetExam === 'boards' || courseName.includes("board")) &&
                            !courseName.includes("jee") &&
                            !courseName.includes("neet") &&
                            !courseName.includes("foundation") &&
                            !courseName.includes("all india");
                    } else {
                        // Default to Foundation
                        isMatch = courseLevel === 'foundation' || courseName.includes("foundation");
                    }

                    if (isMatch) {
                        
                    }
                    return isMatch;
                });

                
                setCourses(filteredCourses);
            } catch (err) {
                console.error("❌ [COURSES] Error processing data:", err);
                setError("Failed to process courses");
                setCourses([]);
                setCentres([]);
            } finally {
                setLoading(false);
            }
        };

        if (preFetchedCourses && preFetchedCentres) {
            // Use pre-fetched data
            processCourses(preFetchedCourses, preFetchedCentres);
        } else {
            // Fallback to internal fetch if no props provided
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const [coursesResponse, centresResponse] = await Promise.all([
                        coursesAPI.getAll(),
                        centresAPI.getAll()
                    ]);
                    const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
                    const centresData = Array.isArray(centresResponse.data) ? centresResponse.data : [];
                    processCourses(coursesData, centresData);
                } catch (err) {
                    setError("Failed to load courses");
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [courseType, location.state, preFetchedCourses, preFetchedCentres]);

    const formatClassLevel = (level) => {
        if (!level) return "Not specified";
        if (/^\d+$/.test(level.toString().trim())) {
            return `Class ${level}`;
        }
        return level;
    };

    // Get unique centres - show only allowed centres if coming from Apply Now
    const uniqueCentres = useMemo(() => {
        if (isFromApplyNow && allowedCentres.length > 0) {
            // If only one centre selected, don't show "All" option
            if (allowedCentres.length === 1) {
                return allowedCentres;
            }
            // If multiple centres, show "All" + selected centres only
            return ["All", ...allowedCentres];
        }
        // Default: show all centres from backend
        return ["All", ...centres];
    }, [centres, isFromApplyNow, allowedCentres]);

    // Filter courses by centre first (handles both single and multiple allowed centres)
    const centreFilteredCourses = useMemo(() => {
        // If coming from Apply Now, first filter to only allowed centres
        let coursesToFilter = courses;
        if (isFromApplyNow && allowedCentres.length > 0) {
            coursesToFilter = courses.filter((course) => {
                const courseCentre = course.centre?.toLowerCase().trim() || "";
                return allowedCentres.some(ac => ac.toLowerCase().trim() === courseCentre);
            });
            
        }

        // If "All" selected, return all (allowed) courses
        if (selectedCentre === "All") return coursesToFilter;

        // Filter by specific selected centre
        
        const filtered = coursesToFilter.filter((course) => {
            const courseCentre = course.centre?.toLowerCase().trim() || "";
            const filterCentre = selectedCentre.toLowerCase().trim();
            const matches = courseCentre === filterCentre;
            if (matches) {
                
            }
            return matches;
        });
        
        return filtered;
    }, [courses, selectedCentre]);

    // Get unique programmes from centre-filtered courses
    const uniqueProgrammes = useMemo(() => {
        const programmes = [...new Set(centreFilteredCourses.map((c) => c.programme))];
        return ["All", ...programmes.filter(Boolean).sort()];
    }, [centreFilteredCourses]);

    // Filter by programme
    const programmeFilteredCourses = useMemo(() => {
        if (selectedProgramme === "All") return centreFilteredCourses;
        return centreFilteredCourses.filter((course) => course.programme === selectedProgramme);
    }, [centreFilteredCourses, selectedProgramme]);

    // Get unique modes from programme-filtered courses
    const uniqueModes = useMemo(() => {
        const modes = [...new Set(programmeFilteredCourses.map((c) => c.mode))];
        return ["All", ...modes.filter(Boolean).sort()];
    }, [programmeFilteredCourses]);

    // Get unique class levels from programme-filtered courses
    const allClassLevels = useMemo(() => {
        const levels = [...new Set(programmeFilteredCourses.map((c) => c.class_level))];
        return ["All", ...levels.filter(Boolean).sort()];
    }, [programmeFilteredCourses]);

    // Reset mode, class level, and programme when centre changes
    useEffect(() => {
        if (selectedProgramme !== "All" && !uniqueProgrammes.includes(selectedProgramme)) {
            setSelectedProgramme("All");
        }
        if (selectedMode !== "All" && !uniqueModes.includes(selectedMode)) {
            setSelectedMode("All");
        }
        if (selectedClassLevel !== "All" && !allClassLevels.includes(selectedClassLevel)) {
            setSelectedClassLevel("All");
        }
    }, [uniqueProgrammes, uniqueModes, allClassLevels, selectedProgramme, selectedMode, selectedClassLevel]);

    // Filter courses by mode and class level
    const modeAndClassFilteredCourses = useMemo(() => {
        return programmeFilteredCourses.filter((course) => {
            if (selectedMode !== "All" && course.mode !== selectedMode) return false;
            if (selectedClassLevel !== "All" && course.class_level !== selectedClassLevel) return false;
            return true;
        });
    }, [programmeFilteredCourses, selectedMode, selectedClassLevel]);

    // Get durations based on filtered courses (cascading)
    const availableDurations = useMemo(() => {
        const durations = [...new Set(modeAndClassFilteredCourses.map((c) => c.duration))];
        return ["All", ...durations.filter(Boolean).sort()];
    }, [modeAndClassFilteredCourses]);

    // Reset duration when class level or mode changes
    useEffect(() => {
        if (selectedDuration !== "All" && !availableDurations.includes(selectedDuration)) {
            setSelectedDuration("All");
        }
    }, [availableDurations, selectedDuration]);

    // Final filtered courses
    const filteredCourses = useMemo(() => {
        return modeAndClassFilteredCourses.filter((course) => {
            if (selectedDuration !== "All" && course.duration !== selectedDuration) return false;
            return true;
        });
    }, [modeAndClassFilteredCourses, selectedDuration]);

    // Sort courses
    const sortedCourses = useMemo(() => {
        const sorted = [...filteredCourses];
        switch (sortBy) {
            case "price-low":
                return sorted.sort((a, b) => (parseFloat(a.discounted_price || a.course_price) || 0) - (parseFloat(b.discounted_price || b.course_price) || 0));
            case "price-high":
                return sorted.sort((a, b) => (parseFloat(b.discounted_price || b.course_price) || 0) - (parseFloat(a.discounted_price || a.course_price) || 0));
            case "start-date":
                return sorted.sort((a, b) => new Date(a.starting_date || 0) - new Date(b.starting_date || 0));
            default:
                return sorted;
        }
    }, [filteredCourses, sortBy]);

    const handleExploreClick = useCallback((course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    }, []);

    const handleBuyNowClick = useCallback((course) => {
        navigate("/buynow", { state: { courseData: course } });
    }, [navigate]);

    const handleSortChange = useCallback((e) => {
        setSortBy(e.target.value);
    }, []);

    if (loading || isLoading) {
        return (
            <section id="courses" className="py-12 bg-white">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-slate-500">Loading courses...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="courses" className="py-12 bg-white">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <div className="text-red-600 text-lg">{error}</div>
                </div>
            </section>
        );
    }

    return (
        <section id="courses" className="pt-6 pb-0 bg-white w-full 2xl:mx-auto 2xl:max-w-7xl 2xl:rounded-3xl 2xl:mt-8 shadow-sm">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                            Board Exam Programs
                        </h2>
                        <div className="flex-shrink-0">
                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold py-1.5 px-3 sm:px-4 pr-7 sm:pr-9 rounded-full hover:border-orange-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer uppercase tracking-tight"
                                >
                                    <option value="default">Sort</option>
                                    <option value="price-low">Price: Low-High</option>
                                    <option value="price-high">Price: High-Low</option>
                                    <option value="start-date">Latest</option>
                                </select>
                                <div className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
                                    <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs sm:text-sm md:text-base text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap sm:whitespace-normal">
                        Complete preparation for CBSE, ICSE, and State Boards
                    </p>
                </div>

                {/* Filter Section */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-8 shadow-xl border border-orange-400/50">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-3 gap-y-5 sm:gap-6">
                        {/* Centre Filter */}
                        {uniqueCentres.length > 1 && (
                            <div className="space-y-2">
                                <label className="block text-[10px] sm:text-[11px] font-bold text-orange-50 uppercase tracking-widest pl-1">
                                    Centre
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedCentre}
                                        onChange={(e) => setSelectedCentre(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-none bg-white/95 text-slate-800 text-xs sm:text-sm font-semibold focus:ring-4 focus:ring-white/20 outline-none appearance-none shadow-sm"
                                    >
                                        {uniqueCentres.map((centre) => (
                                            <option key={centre} value={centre}>
                                                {centre}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Programme Filter */}
                        <div className="space-y-2">
                            <label className="block text-[10px] sm:text-[11px] font-bold text-orange-50 uppercase tracking-widest pl-1">
                                Programme
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedProgramme}
                                    onChange={(e) => setSelectedProgramme(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-none bg-white/95 text-slate-800 text-xs sm:text-sm font-semibold focus:ring-4 focus:ring-white/20 outline-none appearance-none shadow-sm"
                                >
                                    {uniqueProgrammes.map((programme) => (
                                        <option key={programme} value={programme}>
                                            {programme}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Mode Filter (Online/Offline) */}
                        {uniqueModes.length > 1 && (
                            <div className="space-y-2 col-span-2 lg:col-span-1">
                                <label className="block text-[11px] font-bold text-orange-50 uppercase tracking-widest pl-1">
                                    Mode
                                </label>
                                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 scroll-smooth">
                                    <div className="flex flex-nowrap gap-2">
                                        {uniqueModes.map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setSelectedMode(mode)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap uppercase tracking-wider ${selectedMode === mode
                                                    ? "bg-white text-orange-600 shadow-lg scale-105"
                                                    : "bg-orange-400/30 text-white border border-white/20 hover:bg-white/10"
                                                    }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Class Level Filter */}
                        {allClassLevels.length > 1 && (
                            <div className="space-y-2 col-span-2 lg:col-span-1">
                                <label className="block text-[11px] font-bold text-orange-50 uppercase tracking-widest pl-1">
                                    Class Level
                                </label>
                                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 scroll-smooth">
                                    <div className="flex flex-nowrap gap-2">
                                        {allClassLevels.map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setSelectedClassLevel(level)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap uppercase tracking-wider ${selectedClassLevel === level
                                                    ? "bg-white text-orange-600 shadow-lg scale-105"
                                                    : "bg-orange-400/30 text-white border border-white/20 hover:bg-white/10"
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Duration Filter */}
                        {availableDurations.length > 1 && (
                            <div className="space-y-2 col-span-2 lg:col-span-1">
                                <label className="block text-[11px] font-bold text-orange-50 uppercase tracking-widest pl-1">
                                    Duration
                                </label>
                                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 scroll-smooth">
                                    <div className="flex flex-nowrap gap-2">
                                        {availableDurations.map((duration) => (
                                            <button
                                                key={duration}
                                                onClick={() => setSelectedDuration(duration)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap uppercase tracking-wider ${selectedDuration === duration
                                                    ? "bg-white text-orange-600 shadow-lg scale-105"
                                                    : "bg-orange-400/30 text-white border border-white/20 hover:bg-white/10"
                                                    }`}
                                            >
                                                {duration}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Filters Summary */}
                    {(selectedCentre !== "All" || selectedProgramme !== "All" || selectedMode !== "All" || selectedClassLevel !== "All" || selectedDuration !== "All") && (
                        <div className="mt-6 pt-6 border-t border-white/30">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-semibold text-white">Active filters:</span>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCentre !== "All" && (
                                        <span className="px-3 py-1.5 bg-white/90 border border-white rounded-lg flex items-center gap-1 text-orange-700 text-sm font-medium">
                                            Centre: {selectedCentre}
                                            <button
                                                onClick={() => setSelectedCentre("All")}
                                                className="hover:text-red-600 ml-1 text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {selectedProgramme !== "All" && (
                                        <span className="px-3 py-1.5 bg-white/90 border border-white rounded-lg flex items-center gap-1 text-orange-700 text-sm font-medium">
                                            Programme: {selectedProgramme}
                                            <button
                                                onClick={() => setSelectedProgramme("All")}
                                                className="hover:text-red-600 ml-1 text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {selectedMode !== "All" && (
                                        <span className="px-3 py-1.5 bg-white/90 border border-white rounded-lg flex items-center gap-1 text-orange-700 text-sm font-medium">
                                            {selectedMode}
                                            <button
                                                onClick={() => setSelectedMode("All")}
                                                className="hover:text-red-600 ml-1 text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {selectedClassLevel !== "All" && (
                                        <span className="px-3 py-1.5 bg-white/90 border border-white rounded-lg flex items-center gap-1 text-orange-700 text-sm font-medium">
                                            {selectedClassLevel}
                                            <button
                                                onClick={() => setSelectedClassLevel("All")}
                                                className="hover:text-red-600 ml-1 text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {selectedDuration !== "All" && (
                                        <span className="px-3 py-1.5 bg-white/90 border border-white rounded-lg flex items-center gap-1 text-orange-700 text-sm font-medium">
                                            {selectedDuration}
                                            <button
                                                onClick={() => setSelectedDuration("All")}
                                                className="hover:text-red-600 ml-1 text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedCentre("All");
                                            setSelectedProgramme("All");
                                            setSelectedMode("All");
                                            setSelectedClassLevel("All");
                                            setSelectedDuration("All");
                                        }}
                                        className="px-3 py-1.5 text-white hover:text-white hover:bg-red-600 rounded-lg text-sm font-medium border border-white/50 hover:border-red-600 transition-all"
                                    >
                                        clear all filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
                    {sortedCourses.map((c) => {
                        // Use discounted_price if available, otherwise course_price
                        const displayPrice = c.discounted_price ? parseFloat(c.discounted_price) : parseFloat(c.course_price);
                        const originalPrice = c.course_price ? parseFloat(c.course_price) : 0;
                        const discount = c.offers ? parseInt(c.offers) : 0;
                        const hasDiscount = c.discounted_price && discount > 0;

                        return (
                            <div
                                key={c.id || c._id}
                                className="rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative flex flex-col group bg-white"
                            >
                                {/* Mode Ribbon */}
                                <div className="absolute top-0 left-0 z-10">
                                    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-br-xl shadow-md uppercase tracking-wide">
                                        {c.mode || "Online"}
                                    </div>
                                </div>

                                {/* Banner Image Section with Orange Gradient */}
                                <div className="relative h-48 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 overflow-hidden">
                                    {c.thumbnail_url ? (
                                        <img
                                            src={c.thumbnail_url}
                                            alt={c.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center p-4">
                                            <div className="text-center">
                                                <h4 className="text-white/90 font-black text-4xl uppercase tracking-wider mb-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                                    WARRIORS
                                                </h4>
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <div className="h-px bg-white/60 w-8"></div>
                                                    <span className="text-white/90 font-bold text-sm">AND</span>
                                                    <div className="h-px bg-white/60 w-8"></div>
                                                </div>
                                                <h4 className="text-white font-black text-4xl uppercase tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                                    WINNERS
                                                </h4>
                                                <div className="mt-3 bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded inline-block">
                                                    {c.programme || 'BOARD CLASSROOM PROGRAM'}
                                                </div>
                                                <div className="mt-1 text-white/90 text-xs font-bold">
                                                    95%+ PERCENTILE ACHIEVERS
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Black Content Section */}
                                <div className="bg-black text-white p-6 flex flex-col flex-grow">
                                    {/* Course Title */}
                                    {c.course_title && (
                                        <div className="text-orange-500 text-sm font-black uppercase tracking-widest mb-3 text-center border-b border-orange-500/20 pb-2">
                                            {c.course_title}
                                        </div>
                                    )}

                                    {/* Title Row with Decorative Lines and Language Badge */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1 hidden sm:block"></div>
                                            <h3 className="font-bold text-xl sm:text-2xl text-white leading-tight">
                                                {c.name}
                                            </h3>
                                            <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
                                        </div>
                                        <div className="px-2 py-1 border border-white/50 text-white text-[10px] font-bold uppercase rounded w-fit">
                                            ENGLISH
                                        </div>
                                    </div>

                                    {/* Details with Icons */}
                                    <div className="space-y-2.5 mb-5">
                                        <div className="flex items-center gap-3 text-white text-sm">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                            </svg>
                                            <span>For {formatClassLevel(c.class_level)} Aspirants</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-white text-sm">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                                            </svg>
                                            <span>
                                                Starts on {c.starting_date
                                                    ? new Date(c.starting_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : c.start_date
                                                        ? new Date(c.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : "Coming Soon"
                                                }
                                            </span>
                                        </div>
                                        {c.centre && (
                                            <div className="flex items-center gap-3 text-white text-sm">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span>Centre : {c.centre}</span>
                                            </div>
                                        )}
                                        {c.programme && (
                                            <div className="flex items-center gap-3 text-white text-sm">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                                </svg>
                                                <span>Programme: {c.programme}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Section */}
                                    <div className="flex items-center gap-3 mb-5 mt-auto">
                                        <div className="text-4xl font-bold text-orange-500 leading-none">
                                            ₹{displayPrice.toLocaleString()}
                                        </div>
                                        {hasDiscount && (
                                            <>
                                                <div className="text-lg text-gray-400 line-through">
                                                    ₹{originalPrice.toLocaleString()}
                                                </div>
                                                <div className="ml-auto bg-green-600 text-white text-sm font-bold px-3 py-1 rounded">
                                                    {discount}% OFF
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleExploreClick(c)}
                                            className="py-3 rounded-xl border-2 border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-all duration-200 uppercase tracking-wider"
                                        >
                                            EXPLORE
                                        </button>
                                        <button
                                            onClick={() => handleBuyNowClick(c)}
                                            className="py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg uppercase tracking-wider"
                                        >
                                            BUY NOW
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* No Results Message */}
                {sortedCourses.length === 0 && !loading && (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed">
                        <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">No foundation courses found</h3>
                        <p className="mt-2 text-slate-600 max-w-md mx-auto">
                            We couldn't find any foundation courses matching your filters. Try adjusting your search criteria.
                        </p>
                        <button
                            onClick={() => {
                                setSelectedMode("All");
                                setSelectedClassLevel("All");
                                setSelectedDuration("All");
                            }}
                            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Course Detail Modal */}
            <CourseDetailModal
                course={selectedCourse}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCourse(null);
                }}
            />
        </section>
    );
}

/********************
 * FEATURES AND STORIES SECTION
 *******************/
function FeaturesAndStoriesSection() {
    const [activeStory, setActiveStory] = useState(0);

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStory(prev => (prev === 2 ? 0 : prev + 1)); // Assuming 3 stories
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            title: "Board-Aligned Pedagogy",
            description: "Curriculum strictly mapped to CBSE, ICSE, and State Board syllabi for focused preparation.",
            icon: "📚",
            gradient: "from-blue-500 to-cyan-400"
        },
        {
            title: "Score Maximization",
            description: "Special emphasis on answer writing skills, step-marking, and presentation to ensure 95%+ scores.",
            icon: "📈",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            title: "Regular Assessments",
            description: "Chapter-wise tests and full-length pre-board mock exams to simulate real exam conditions.",
            icon: "📝",
            gradient: "from-orange-500 to-red-500"
        },
        {
            title: "Expert Mentorship",
            description: "Personalized guidance from experienced faculty to identify and improve weak areas.",
            icon: "👨‍🏫",
            gradient: "from-emerald-500 to-teal-500"
        }
    ];

    const stories = [
        {
            name: "Amit Kumar",
            achievement: "CBSE 12th 98.6%",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            quote: "Pathfinder's mock boards gave me the exact feel of the real exam. The feedback on my answer writing was invaluable."
        },
        {
            name: "Priya Singh",
            achievement: "ICSE 10th 99.2%",
            image: "https://randomuser.me/api/portraits/women/44.jpg",
            quote: "The faculty helped me master the toughest concepts with ease. I owe my perfect score in Science to their guidance."
        },
        {
            name: "Rahul Roy",
            achievement: "WBCHSE Rank 5",
            image: "https://randomuser.me/api/portraits/men/86.jpg",
            quote: "Consistent practice and concept clarity were key. Pathfinder's test series helped me manage my time effectively."
        }
    ];

    return (
        <section className="-mt-20 md:mt-0 pt-1 pb-36 md:pb-16 relative overflow-hidden w-full 2xl:mx-auto 2xl:max-w-7xl 2xl:rounded-3xl 2xl:my-10 shadow-2xl">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/result/black  paper high res.webp"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Full Width Orange Section */}
            <div className="relative z-10 w-full mb-0">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/result/orange paper.webp"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-32 pb-48 md:py-24">
                    {/* Features Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-8">
                        <h2 className="text-4xl md:text-5xl font-black text-black md:text-white mb-6 tracking-tight drop-shadow-sm">
                            Why Choose <span className="text-black md:text-white">Pathfinder for Boards?</span>
                        </h2>
                        <p className="text-xl text-black leading-relaxed font-medium drop-shadow-sm">
                            We don't just teach; we transform potential into performance. Give your child the perfect launchpad for their academic journey.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl shadow-lg mb-6`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full mb-5 -mt-24 md:mt-0">
                {/* Success Stories Header */}
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-950/90 text-orange-300 text-sm font-bold tracking-wide uppercase mb-4 border border-orange-500/30 shadow-lg">
                        Hall of Fame
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
                        Stories of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Triumph</span>
                    </h2>
                    <p className="text-xl text-white leading-relaxed font-bold drop-shadow-md">
                        Join the league of extraordinary achievers who started their journey with Pathfinder.
                    </p>
                </div>

                {/* Main Content Area: Left Image - Carousel - Right Image */}
                <div className="flex flex-col lg:flex-row items-end justify-center gap-4 lg:gap-8 min-h-[400px]">

                    {/* Left Image */}
                    <div className="hidden lg:block w-1/4 max-w-[350px] relative z-20">
                        <img
                            src={getImageUrl("/images/course_images/course_footer_left_img.webp")}
                            alt="Student"
                            className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Carousel Container */}
                    <div className="w-full lg:w-1/2 max-w-2xl relative mb-8 lg:mb-12">
                        {/* Carousel Wrapper - Result Board Style */}
                        <div className="relative bg-white rounded-xl shadow-2xl pt-16 pb-16 px-4 md:px-12 mt-8 ml-4 mr-4 md:ml-0 md:mr-0 border-4 border-white">
                            {/* Dashed Border Overlay */}
                            <div className="absolute inset-2 border-2 border-dashed border-slate-800 rounded-lg pointer-events-none z-0"></div>

                            {/* Top Badge */}
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-8 py-2 z-20 rounded-full border-4 border-white shadow-xl">
                                <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase whitespace-nowrap tracking-tighter">
                                    Our <span className="text-orange-500">Board Toppers</span>
                                </h3>
                            </div>

                            {/* Carousel Inner */}
                            <div className="relative overflow-hidden z-10">
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: `translateX(-${activeStory * 100}%)` }}
                                >
                                    {stories.map((story, index) => (
                                        <div key={index} className="w-full flex-shrink-0 px-4 md:px-8 py-4 box-border">
                                            <div className="flex flex-col items-center text-center">
                                                {/* Image with angular frame effect */}
                                                <div className="relative mb-6">
                                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-900 shadow-xl relative z-10">
                                                        <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-20 transform translate-y-2"></div>
                                                </div>

                                                <div className="mb-4">
                                                    <h4 className="font-black text-slate-900 text-2xl mb-2 uppercase tracking-tight">{story.name}</h4>
                                                    <span className="inline-block px-4 py-1 bg-orange-600 text-white text-sm font-bold skew-x-[-10deg] shadow-md uppercase">
                                                        <span className="inline-block skew-x-[10deg]">{story.achievement}</span>
                                                    </span>
                                                </div>

                                                <div className="relative max-w-lg mx-auto">
                                                    <svg className="w-8 h-8 text-orange-300 absolute -top-4 -left-6 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M14.017 21L14.017 18C14.017 16.896 14.325 15.953 14.941 15.171C15.557 14.361 16.319 13.906 17.228 13.806C16.551 13.506 16.035 13.124 15.68 12.66C15.353 12.18 15.189 11.603 15.189 10.929C15.189 10.153 15.467 9.473 16.023 8.889C16.579 8.289 17.295 7.989 18.171 7.989C19.021 7.989 19.721 8.283 20.271 8.871C20.847 9.447 21.135 10.173 21.135 11.049C21.135 12.441 20.655 13.833 19.695 15.225C18.759 16.593 17.511 17.859 15.951 19.023L14.017 21ZM6.197 21L6.197 18C6.197 16.896 6.505 15.953 7.121 15.171C7.737 14.361 8.499 13.906 9.408 13.806C8.731 13.506 8.215 13.124 7.86 12.66C7.533 12.18 7.369 11.603 7.369 10.929C7.369 10.153 7.647 9.473 8.203 8.889C8.759 8.289 9.475 7.989 10.351 7.989C11.201 7.989 11.901 8.283 12.451 8.871C13.027 9.447 13.315 10.173 13.315 11.049C13.315 12.441 12.835 13.833 11.875 15.225C10.939 16.593 9.691 17.859 8.131 19.023L6.197 21Z" />
                                                    </svg>
                                                    <p className="text-slate-700 italic leading-relaxed text-lg font-medium">
                                                        "{story.quote}"
                                                    </p>
                                                    <svg className="w-8 h-8 text-orange-300 absolute -bottom-6 -right-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M14.017 21L14.017 18C14.017 16.896 14.325 15.953 14.941 15.171C15.557 14.361 16.319 13.906 17.228 13.806C16.551 13.506 16.035 13.124 15.68 12.66C15.353 12.18 15.189 11.603 15.189 10.929C15.189 10.153 15.467 9.473 16.023 8.889C16.579 8.289 17.295 7.989 18.171 7.989C19.021 7.989 19.721 8.283 20.271 8.871C20.847 9.447 21.135 10.173 21.135 11.049C21.135 12.441 20.655 13.833 19.695 15.225C18.759 16.593 17.511 17.859 15.951 19.023L14.017 21ZM6.197 21L6.197 18C6.197 16.896 6.505 15.953 7.121 15.171C7.737 14.361 8.499 13.906 9.408 13.806C8.731 13.506 8.215 13.124 7.86 12.66C7.533 12.18 7.369 11.603 7.369 10.929C7.369 10.153 7.647 9.473 8.203 8.889C8.759 8.289 9.475 7.989 10.351 7.989C11.201 7.989 11.901 8.283 12.451 8.871C13.027 9.447 13.315 10.173 13.315 11.049C13.315 12.441 12.835 13.833 11.875 15.225C10.939 16.593 9.691 17.859 8.131 19.023L6.197 21Z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Carousel Controls */}
                                <div className="absolute inset-y-0 left-0 flex items-center z-20">
                                    <button
                                        onClick={() => setActiveStory(prev => (prev === 0 ? stories.length - 1 : prev - 1))}
                                        className="ml-1 md:ml-2 p-2 rounded-full bg-slate-100 hover:bg-orange-500 text-slate-800 hover:text-white transition-all shadow-md border border-slate-200"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                                    </button>
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center z-20">
                                    <button
                                        onClick={() => setActiveStory(prev => (prev === stories.length - 1 ? 0 : prev + 1))}
                                        className="mr-1 md:mr-2 p-2 rounded-full bg-slate-100 hover:bg-orange-500 text-slate-800 hover:text-white transition-all shadow-md border border-slate-200"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                </div>

                                {/* Dots */}
                                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-20">
                                    {stories.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveStory(idx)}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${activeStory === idx ? 'bg-orange-500 w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Banner */}
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-fit max-w-[90%]">
                                <div className="bg-slate-900 text-white py-3 px-6 md:px-12 rounded-xl shadow-2xl border-4 border-white relative overflow-hidden text-center">
                                    <span className="text-sm md:text-xl font-black italic tracking-widest whitespace-nowrap">
                                        <span className="text-orange-500">CBSE • ICSE • STATE</span> RESULTS
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="hidden lg:block w-1/4 max-w-[350px] relative z-20 translate-y-12">
                        <img
                            src={getImageUrl("/images/course_images/course_footer_right_img.webp")}
                            alt="Student"
                            className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Curve */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-30 translate-y-[1px]">
                <svg
                    className="relative block "
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,120 L1200,120 L1200,60 C900,140 300,-20 0,60 Z"
                        fill="#f8fafc"
                    ></path>
                </svg>
            </div>
        </section>
    );
}

/********************
 * FAQ SECTION
 *******************/
function FAQSection() {
    const faqs = [
        {
            question: "Which boards do you cover in your program?",
            answer: "We provide comprehensive preparation for CBSE, ICSE, and major State Boards including West Bengal Board, Maharashtra Board, and UP Board. Our curriculum is designed to cover all syllabus patterns while maintaining high standards."
        },
        {
            question: "How do you ensure 95%+ scores in board exams?",
            answer: "Our proven methodology includes in-depth concept clarity, rigorous practice, regular assessments, board-pattern question practice, answer writing techniques, and time management strategies. We also conduct board exam simulations to build confidence."
        },
        {
            question: "When should students join for Class 10/12 board preparation?",
            answer: "For Class 10 boards, joining at the start of Class 10 is ideal, though we accept students throughout the year with customized catch-up plans. For Class 12, we recommend starting from Class 11 itself for comprehensive preparation."
        },
        {
            question: "Do you provide previous year question papers and sample papers?",
            answer: "Yes, we provide an extensive collection of previous 10 years' board question papers, CBSE sample papers, marking schemes, and board-specific practice materials. Students also get access to our exclusive question bank with 1000+ board-pattern questions."
        }
    ];

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="pt-6 pb-16 md:py-16 bg-slate-50 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                        Frequently Asked <span className="text-orange-600">Questions</span>
                    </h2>
                    <p className="text-lg text-slate-600">
                        Everything you need to know about our Board Exam Programs.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl border transition-all duration-300 ${openIndex === index ? 'border-orange-200 shadow-lg ring-1 ring-orange-100' : 'border-slate-200 hover:border-orange-200'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none"
                            >
                                <span className={`font-bold text-lg transition-colors duration-300 ${openIndex === index ? 'text-orange-700' : 'text-slate-800'}`}>
                                    {faq.question}
                                </span>
                                <span className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-orange-100 text-orange-600 rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>
                            <div
                                className={`px-8 transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-48 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <p className="text-slate-600 leading-relaxed text-lg border-t border-slate-100 pt-4">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


