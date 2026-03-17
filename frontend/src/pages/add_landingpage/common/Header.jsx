import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
    ChevronDownIcon,
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    LifebuoyIcon,
    ArrowRightOnRectangleIcon,
    AcademicCapIcon,
    BookOpenIcon,
    ChartBarIcon,
    UserGroupIcon,
    StarIcon,
    TrophyIcon,
    BriefcaseIcon,
    BuildingStorefrontIcon,
    PhoneIcon,
    IdentificationIcon,
    RectangleGroupIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from "../../../components/LoginModal";
import ApplyNowForm from "../../Student/Applynow";
import { centresAPI } from "../../../services/api";

const Header = () => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openSubDropdown, setOpenSubDropdown] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // New states and location
    const location = useLocation();
    const navigate = useNavigate();

    // Helper to check if a route is active
    const isActiveLink = (item) => {
        if (item.href && item.href !== "#" && location.pathname === item.href) return true;
        if (item.items) {
            return item.items.some(sub => sub.href && sub.href !== "#" && location.pathname === sub.href);
        }
        return false;
    };

    // Apply Now Form State
    const [isApplyNowOpen, setIsApplyNowOpen] = useState(false);
    const [selectedCourseForApply, setSelectedCourseForApply] = useState(null);
    const [contextType, setContextType] = useState("course"); // 'course' or 'result'
    const [dynamicCentres, setDynamicCentres] = useState([]);
    const [selectedCourseData, setSelectedCourseData] = useState({
        name: "",
        description: "",
        centres: [],
        price: "",
        duration: "",
    });

    // Fetch dynamic centres from backend
    useEffect(() => {
        const fetchCentres = async () => {
            try {
                const response = await centresAPI.getAll();
                // Handle both direct array and paginated results
                const centresData = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.results || []);

                const centreNames = centresData.map(c => c.centre).filter(Boolean);
                setDynamicCentres(centreNames);
                
            } catch (error) {
                console.error("❌ [HEADER] Error fetching centres:", error);
                setDynamicCentres(["Online", "Hazra", "Garia", "Salt Lake", "Howrah"]);
            }
        };
        fetchCentres();
    }, []);

    const {
        user,
        logout,
        adminLogout,
        isLoading,
        isStudentAuthenticated,
        isAdminAuthenticated,
    } = useAuth();

    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
                setOpenSubDropdown(null);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate("/");
    };

    const handleAdminLogout = () => {
        adminLogout();
        setIsUserMenuOpen(false);
    };

    const handleAuthClick = () => {
        navigate("/buynow");
    };

    // Handle Apply Now for a specific course from dropdown
    const handleApplyNowClick = (courseName, type, e) => {
        e.preventDefault();
        e.stopPropagation();

        const centresToUse = dynamicCentres.length > 0 ? dynamicCentres : ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"];
        let courseData = {};

        switch (courseName) {
            case "All India":
                courseData = {
                    name: "All India Entrance Programs",
                    description: "National entrance preparation for NEET, JEE, and other national exams",
                    centres: centresToUse,
                    price: "Contact for Price",
                    duration: "1-2 years",
                    badge: "Popular"
                };
                break;
            case "Foundation":
                courseData = {
                    name: "Foundation Program",
                    description: "Build strong fundamentals for Class 8-10 students",
                    centres: centresToUse,
                    price: "Contact for Price",
                    duration: "1 year",
                    badge: "Trending"
                };
                break;
            case "Boards":
                courseData = {
                    name: "Board Exam Preparation",
                    description: "Comprehensive preparation for CBSE, ICSE, and State Boards",
                    centres: centresToUse,
                    price: "Contact for Price",
                    duration: "6 months - 1 year",
                    badge: null
                };
                break;
            default:
                courseData = {
                    name: courseName,
                    description: "Professional coaching program",
                    centres: centresToUse,
                    price: "Contact for Price",
                    duration: "Varies",
                    badge: null
                };
        }

        setSelectedCourseData(courseData);
        setSelectedCourseForApply(courseName);
        setContextType(type); // Set context type
        setIsApplyNowOpen(true);
        setOpenDropdown(null);
        setOpenSubDropdown(null);
    };

    // Handle form submission
    const handleApplyNowSubmit = (applicationData) => {
        

        // Determine base path based on context type
        const basePath = contextType === "result" ? "/results" : "/courses";

        navigate(`${basePath}/${selectedCourseForApply?.toLowerCase().replace(/\s+/g, '-')}`, {
            state: { courseFilter: selectedCourseForApply, formData: applicationData }
        });
        setIsApplyNowOpen(false);
        setSelectedCourseForApply(null);
    };



    const menuItems = {
        "About Us": {
            icon: UserGroupIcon,
            items: [
                { name: "Why Pathfinder", href: "/about-us", icon: StarIcon, description: "Discover our excellence" },
                { name: "CEO's Message", href: "/ceo-message", icon: BriefcaseIcon, description: "Leadership vision" },
                { name: "Chairman's Message", href: "/chairman-message", icon: TrophyIcon, description: "Founder's insight" },
            ],
        },
        Courses: {
            icon: AcademicCapIcon,
            items: [
                { name: "All India", href: "#", icon: BookOpenIcon, description: "National entrance preparation", badge: "Popular", action: "apply" },
                { name: "Foundation", href: "#", icon: Cog6ToothIcon, description: "Build your future", badge: "Trending", action: "apply" },
                { name: "Boards", href: "#", icon: ChartBarIcon, description: "Strong basics", action: "apply" },
                // { name: "View All Courses", href: "/courses", icon: AcademicCapIcon, description: "Browse all programs" },
            ],
        },
        Results: {
            icon: TrophyIcon,
            items: [
                { name: "All India", href: "#", icon: StarIcon, description: "Celebrate our National Toppers", badge: "Outstanding", action: "apply" },
                { name: "Foundation", href: "#", icon: TrophyIcon, description: "Future Champions", badge: "Excellent", action: "apply" },
                { name: "Boards", href: "#", icon: ChartBarIcon, description: "State & Central Board Toppers", badge: "99%+", action: "apply" },
            ],
        },
        "Student's Corner": {
            icon: BookOpenIcon,
            href: "/students-corner"
        },
        Alumni: { icon: UserGroupIcon, href: "/alumni" },
        Career: { icon: BriefcaseIcon, href: "/career" },
        Blog: { icon: BookOpenIcon, href: "/blog" },
        Center: { icon: BuildingStorefrontIcon, href: "/centres" },
        Franchise: { icon: BuildingStorefrontIcon, href: "/franchise" },
        Contact: { icon: PhoneIcon, href: "/contact" },
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: -20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } } };
    const mobileMenuVariants = { closed: { x: "100%", transition: { type: "spring", stiffness: 400, damping: 40 } }, open: { x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } } };
    const dropdownVariants = { closed: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }, open: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

    const handleDropdownEnter = (title) => { setOpenDropdown(title); setOpenSubDropdown(null); };
    const handleDropdownLeave = () => { setOpenDropdown(null); setOpenSubDropdown(null); };
    const handleSubDropdownEnter = (itemName) => { setOpenSubDropdown(itemName); };
    const handleSubDropdownLeave = () => { setOpenSubDropdown(null); };

    return (
        <>
            <motion.header className="w-full fixed top-0 z-[1000]" initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                <motion.div
                    className={`relative bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-2xl border-b transition-all duration-500 w-full shadow-sm ${isScrolled ? "border-orange-200/30 shadow-2xl shadow-orange-500/5 py-2" : "border-orange-100/20 py-2"}`}
                    style={{ zIndex: 999 }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="flex justify-between items-center">
                            {/* Logo */}
                            <motion.div className="flex items-center space-x-2 xs:space-x-3" variants={itemVariants} initial="hidden" animate="visible">
                                <a href="/" title="Pathfinder" className="flex items-center space-x-2 xs:space-x-3">
                                    <div className="relative">
                                        <img src="https://pathfinder-wp-new.s3.ap-south-1.amazonaws.com/wp-content/uploads/2025/03/logo-1.svg" alt="Pathfinder Logo" className="h-8 xs:h-10 sm:h-10 md:h-12 transition-all duration-300 filter drop-shadow-lg" />
                                    </div>
                                    <img src="https://pathfinder-wp-new.s3.ap-south-1.amazonaws.com/wp-content/uploads/2025/03/excellence.svg" alt="Excellence" className="h-10 hidden sm:block" />
                                </a>
                            </motion.div>

                            {/* Right Side */}
                            <motion.div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6" variants={containerVariants} initial="hidden" animate="visible">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    {isStudentAuthenticated ? (
                                        <div className="hidden lg:block relative" ref={userMenuRef}>
                                            <motion.button
                                                className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-orange-200/50 transition-all duration-300 group"
                                                whileHover={{ scale: 1.05, y: -1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            >
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-orange-100 shadow-sm">
                                                    {user?.profile_image_url ? (
                                                        <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                                            <UserCircleIcon className="h-5 w-5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-semibold text-gray-800">Welcome, {user?.fullName}</div>
                                                    <div className="text-xs text-gray-600">{user?.student_class || "Student"}</div>
                                                </div>
                                                <motion.div animate={{ rotate: isUserMenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                                                    <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                                </motion.div>
                                            </motion.button>

                                            <AnimatePresence>
                                                {isUserMenuOpen && (
                                                    <motion.div
                                                        className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 border border-white/20 overflow-hidden"
                                                        style={{ zIndex: 70 }}
                                                        variants={dropdownVariants}
                                                        initial="closed"
                                                        animate="open"
                                                        exit="closed"
                                                    >
                                                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-500/5 to-red-500/5">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                                                                    {user?.profile_image_url ? (
                                                                        <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                                                            <UserCircleIcon className="h-6 w-6 text-white" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-800">{user?.fullName}</div>
                                                                    <div className="text-sm text-gray-600">{user?.email}</div>
                                                                    <div className="text-xs text-orange-600 font-medium">{user?.student_class}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-2">
                                                            <motion.a href="/dashboard" className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 group/item" whileHover={{ x: 4 }} onClick={() => setIsUserMenuOpen(false)}>
                                                                <Cog6ToothIcon className="h-5 w-5 text-gray-600 group-hover/item:text-orange-600" />
                                                                <span className="text-sm font-medium text-gray-700 group-hover/item:text-orange-600">Dashboard</span>
                                                            </motion.a>
                                                            <motion.button onClick={handleLogout} className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300 group/item w-full text-left" whileHover={{ x: 4 }}>
                                                                <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600 group-hover/item:text-red-600" />
                                                                <span className="text-sm font-medium text-gray-700 group-hover/item:text-red-600">Logout</span>
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <>

                                            <motion.a
                                                href="tel:9147178886"
                                                className="hidden lg:flex items-center gap-4 px-8 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-[#EE4600] hover:text-white transition-all duration-300 ml-3 border border-white/10 group h-[52px] shine-effect"
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <PhoneIcon className="h-6 w-6 text-[#EE4600] group-hover:text-white transition-colors duration-300" />
                                                <div className="flex flex-col -space-y-1 items-start">
                                                    <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-widest group-hover:text-white transition-colors duration-300">Help Desk</span>
                                                    <span className="text-xl font-bold italic">9147178886</span>
                                                </div>
                                            </motion.a>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>


            </motion.header>



            {/* Login Modal */}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

            {/* Apply Now Form Modal */}
            {/* Apply Now Form Modal */}
            <ApplyNowForm
                course={selectedCourseData}
                isOpen={isApplyNowOpen}
                onClose={() => { setIsApplyNowOpen(false); setSelectedCourseForApply(null); }}
                onSubmit={handleApplyNowSubmit}
                allowMultipleCentres={true}
                isFromHeader={true}
                formTitle={contextType === 'result' ? "Join Our Toppers" : undefined}
                formSubtitle={contextType === 'result' ? "Start your journey to success today" : undefined}
            />
        </>
    );
};

export default Header;