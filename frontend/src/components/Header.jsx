import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
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
import { useNavigate, useLocation, Link } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import ApplyNowForm from "../pages/Student/Applynow";
import { centresAPI } from "../services/api";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        console.log("📍 [HEADER] Fetched centres:", centreNames);
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
      if (isMobileMenuOpen) {
        const isClickInMobileMenu = mobileMenuRef.current?.contains(event.target);
        const isClickOnHamburger = event.target.closest(".hamburger-button");
        if (!isClickInMobileMenu && !isClickOnHamburger) {
          setIsMobileMenuOpen(false);
          setOpenDropdown(null);
          setOpenSubDropdown(null);
        }
      } else {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setOpenDropdown(null);
          setOpenSubDropdown(null);
        }
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleAdminLogout = () => {
    adminLogout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
  };

  // Handle form submission
  const handleApplyNowSubmit = (applicationData) => {
    console.log("Application submitted:", { ...applicationData, course: selectedCourseData.name });

    // Determine base path based on context type
    const basePath = contextType === "result" ? "/results" : "/courses";

    navigate(`${basePath}/${selectedCourseForApply?.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { courseFilter: selectedCourseForApply, formData: applicationData }
    });
    setIsApplyNowOpen(false);
    setSelectedCourseForApply(null);
  };

  // Handle mobile apply now click
  const handleMobileApplyNowClick = (courseName, type, e) => {
    e.preventDefault();
    e.stopPropagation();
    const centresToUse = dynamicCentres.length > 0 ? dynamicCentres : ["Online", "Hazra", "Garia", "Salt Lake", "Howrah"];
    let courseData = {};

    switch (courseName) {
      case "All India":
        courseData = { name: "All India Entrance Programs", description: "National entrance preparation", centres: centresToUse, price: "Contact for Price", duration: "1-2 years", badge: "Popular" };
        break;
      case "Foundation":
        courseData = { name: "Foundation Program", description: "Build strong fundamentals", centres: centresToUse, price: "Contact for Price", duration: "1 year", badge: "Trending" };
        break;
      case "Boards":
        courseData = { name: "Board Exam Preparation", description: "Comprehensive board preparation", centres: centresToUse, price: "Contact for Price", duration: "6 months - 1 year", badge: null };
        break;
      default:
        courseData = { name: courseName, description: "Professional coaching program", centres: centresToUse, price: "Contact for Price", duration: "Varies", badge: null };
    }

    setSelectedCourseData(courseData);
    setSelectedCourseForApply(courseName);
    setContextType(type); // Set context type
    setIsApplyNowOpen(true);
    setIsMobileMenuOpen(false);
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
  const handleMobileDropdownToggle = (title) => { if (openDropdown === title) { setOpenDropdown(null); setOpenSubDropdown(null); } else { setOpenDropdown(title); setOpenSubDropdown(null); } };
  const handleMobileSubDropdownToggle = (itemName) => { if (openSubDropdown === itemName) { setOpenSubDropdown(null); } else { setOpenSubDropdown(itemName); } };
  const handleMobileLinkClick = () => { setIsMobileMenuOpen(false); setOpenDropdown(null); setOpenSubDropdown(null); };
  const handleHamburgerClick = () => { const newState = !isMobileMenuOpen; setIsMobileMenuOpen(newState); if (!newState) { setOpenDropdown(null); setOpenSubDropdown(null); } };
  const handleCloseMobileMenu = () => { setIsMobileMenuOpen(false); setOpenDropdown(null); setOpenSubDropdown(null); };

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
                <Link to="/" title="Pathfinder" className="flex items-center space-x-2 xs:space-x-3">
                  <div className="relative">
                    <img src="https://pathfinder-wp-new.s3.ap-south-1.amazonaws.com/wp-content/uploads/2025/03/logo-1.svg" alt="Pathfinder Logo" className="h-8 xs:h-10 sm:h-10 md:h-12 transition-all duration-300 filter drop-shadow-lg" />
                  </div>
                  <img src="https://pathfinder-wp-new.s3.ap-south-1.amazonaws.com/wp-content/uploads/2025/03/excellence.svg" alt="Excellence" className="h-10 hidden sm:block" />
                </Link>
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
                      <motion.button onClick={() => setIsLoginModalOpen(true)} className="hidden lg:flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-600 text-sm font-semibold transition-all duration-300 group overflow-hidden relative" whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}>
                        <motion.img src="https://pathfinder-wp-new.s3.ap-south-1.amazonaws.com/wp-content/uploads/2025/04/user_icon.svg" alt="User" className="h-8 group-hover:scale-110 transition-transform duration-300 z-10" />
                        <div className="flex flex-col items-start leading-none ml-1 z-10">
                          <span className="text-sm font-bold">Student Login</span>
                          <span className="text-[10px] font-medium text-orange-600/80 group-hover:text-white/90">for Digital Portal</span>
                        </div>
                      </motion.button>
                    </>
                  )}

                  <motion.button className="lg:hidden hamburger-button p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-orange-200/50 hover:bg-white/80 transition-all duration-300" onClick={handleHamburgerClick} whileTap={{ scale: 0.95 }}>
                    {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6 text-orange-600" /> : <Bars3Icon className="h-6 w-6 text-orange-600" />}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Header - Main Navigation */}
        <motion.div
          className={`hidden lg:block bg-[#66090D] backdrop-blur-xl mx-auto max-w-7xl w-[95%] rounded-2xl shadow-2xl transition-all duration-500 border border-white/10 ${isScrolled ? "mt-2 scale-[0.98] rounded-2xl" : "mt-2 scale-[0.98]"}`}
          animate={{ y: isScrolled ? -5 : 0, scale: isScrolled ? 0.98 : 1 }}
          ref={dropdownRef}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex justify-around items-center text-white">
              {Object.entries(menuItems).map(([title, section], index) => (
                <motion.div
                  key={title}
                  className="relative group py-2 xl:py-3"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  onMouseEnter={() => section.items && handleDropdownEnter(title)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <motion.button
                    className={`flex items-center space-x-2 font-semibold hover:text-orange-300 text-sm xl:text-base transition-colors duration-300 relative group/nav ${isActiveLink(section) ? "text-orange-300" : ""}`}
                    whileHover={{ y: -2 }}
                    onClick={() => { if (section.href) { navigate(section.href); } }}
                  >
                    {section.icon && <section.icon className={`h-4 w-4 group-hover/nav:scale-110 transition-transform duration-300 ${isActiveLink(section) ? "text-orange-300" : ""}`} />}
                    <span>{title}</span>
                    {section.items && section.items.length > 0 && (
                      <motion.div animate={{ rotate: openDropdown === title ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDownIcon className="h-3 w-3" />
                      </motion.div>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {openDropdown === title && section.items && section.items.length > 0 && (
                      <motion.div
                        className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 border border-white/20 overflow-visible z-50"
                        variants={dropdownVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onMouseEnter={() => handleDropdownEnter(title)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="bg-[#66090D] p-3 text-white rounded-t-2xl">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                              {section.icon && <section.icon className="h-5 w-5 text-white" />}
                            </div>
                            <div>
                              <h3 className="font-bold text-base">{title}</h3>
                              <p className="text-orange-200 text-xs">Explore our offerings</p>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-visible max-h-96">
                          {section.items.map((item) => (
                            <div key={item.name} className="relative group/item border-b border-gray-100 last:border-b-0">
                              {item.action === "apply" ? (
                                <motion.button
                                  onClick={(e) => handleApplyNowClick(item.name, title === "Results" ? "result" : "course", e)}
                                  className="flex items-start w-full p-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 group/link text-left"
                                  whileHover={{ x: 4 }}
                                >
                                  <div className="flex items-start space-x-3 flex-1">
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                      <item.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                                        {item.badge && <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">{item.badge}</span>}
                                      </div>
                                      <p className="text-gray-600 text-xs mb-1">{item.description}</p>
                                    </div>
                                  </div>
                                </motion.button>
                              ) : (
                                <motion.a
                                  href={item.href}
                                  className="flex items-start p-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 group/link"
                                  whileHover={{ x: 4 }}
                                >
                                  <div className="flex items-start space-x-3 flex-1">
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                                      <item.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                                        {item.badge && <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">{item.badge}</span>}
                                      </div>
                                      <p className="text-gray-600 text-xs mb-1">{item.description}</p>
                                    </div>
                                  </div>
                                </motion.a>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </nav>
          </div>
        </motion.div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl z-[100] lg:hidden" ref={mobileMenuRef} variants={mobileMenuVariants} initial="closed" animate="open" exit="closed">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-lg font-bold text-gray-800">Menu</span>
                <motion.button onClick={handleCloseMobileMenu} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all" whileTap={{ scale: 0.95 }}>
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {Object.entries(menuItems).map(([title, data]) => (
                  <div key={title} className="mb-2">
                    {data.href && !data.items ? (
                      <button onClick={() => { navigate(data.href); handleMobileLinkClick(); }} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all w-full text-left ${isActiveLink(data) ? "bg-orange-50 text-orange-600" : "hover:bg-orange-50"}`}>
                        {data.icon && <data.icon className={`h-5 w-5 ${isActiveLink(data) ? "text-orange-600" : "text-orange-600"}`} />}
                        <span className={`font-medium ${isActiveLink(data) ? "text-orange-600" : "text-gray-800"}`}>{title}</span>
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleMobileDropdownToggle(title)} className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${isActiveLink(data) || openDropdown === title ? "bg-orange-50" : "hover:bg-gray-50"}`}>
                          <div className="flex items-center space-x-3">
                            {data.icon && <data.icon className={`h-5 w-5 ${isActiveLink(data) ? "text-orange-600" : "text-orange-600"}`} />}
                            <span className={`font-medium ${isActiveLink(data) ? "text-orange-600" : "text-gray-800"}`}>{title}</span>
                          </div>
                          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${openDropdown === title ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {openDropdown === title && data.items && (
                            <motion.div className="ml-4 mt-1 space-y-1" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                              {data.items.map((item) => (
                                item.action === "apply" ? (
                                  <button key={item.name} onClick={(e) => handleMobileApplyNowClick(item.name, title === "Results" ? "result" : "course", e)} className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-orange-50 transition-all w-full text-left">
                                    <item.icon className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm text-gray-700">{item.name}</span>
                                    {item.badge && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">{item.badge}</span>}
                                  </button>
                                ) : (
                                  <a key={item.name} href={item.href} onClick={handleMobileLinkClick} className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-orange-50 transition-all">
                                    <item.icon className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm text-gray-700">{item.name}</span>
                                    {item.badge && <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">{item.badge}</span>}
                                  </a>
                                )
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 space-y-3">
                {isStudentAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-orange-50/50 rounded-2xl border border-orange-100">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                        {user?.profile_image_url ? (
                          <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <UserCircleIcon className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-800 truncate">Welcome, {user?.fullName}</div>
                        <div className="text-xs text-orange-600 font-medium">{user?.student_class || "Student"}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => { navigate("/dashboard"); handleCloseMobileMenu(); }}
                        className="flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all border border-slate-100"
                        whileTap={{ scale: 0.95 }}
                      >
                        <RectangleGroupIcon className="h-6 w-6" />
                        <span className="text-xs font-bold">Dashboard</span>
                      </motion.button>
                      <motion.button
                        onClick={() => { navigate("/profile"); handleCloseMobileMenu(); }}
                        className="flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all border border-slate-100"
                        whileTap={{ scale: 0.95 }}
                      >
                        <IdentificationIcon className="h-6 w-6" />
                        <span className="text-xs font-bold">Profile</span>
                      </motion.button>
                    </div>

                    <motion.button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all shadow-sm" whileTap={{ scale: 0.98 }}>
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </motion.button>
                  </div>
                ) : (
                  <motion.button onClick={() => { setIsLoginModalOpen(true); handleCloseMobileMenu(); }} className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-orange-500/20" whileTap={{ scale: 0.98 }}>
                    <UserCircleIcon className="h-8 w-8" />
                    <div className="flex flex-col items-start leading-none ml-1">
                      <span className="text-sm font-bold">Student Login</span>
                      <span className="text-[10px] font-medium opacity-90">for Digital Portal</span>
                    </div>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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