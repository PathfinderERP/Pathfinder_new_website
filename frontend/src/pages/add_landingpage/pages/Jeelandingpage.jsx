import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { MapPin, Mail, X, CheckCircle, ChevronLeft, ChevronRight, Lock, GraduationCap, Award, ShieldCheck } from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { landingAPI, centresAPI, coursesAPI } from "../../../services/api";
import { useCachedData } from "../../../hooks/useCachedData";
import { useMemo } from "react";
import CourseDetailModal from "../../../components/CourseDetailModal";

export const Jeelandingpage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [centres, setCentres] = useState([]);
    const [isLeadCaptured, setIsLeadCaptured] = useState(() => {
        return localStorage.getItem('pathfinder_lead_captured') === 'true';
    });
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allCoursesRaw, setAllCoursesRaw] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        student_class: '',
        board: '',
        course_type: '',
        centre: '',
        email: '',
        page_source: window.location.pathname.includes('neet') ? 'NEET' : 'JEE'
    });

    const scrollToForm = () => {
        const formElement = document.getElementById('landing-registration-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const { data: coursesDataRaw, loading: loadingCourses } = useCachedData("all_courses", () => coursesAPI.getAll());

    const allCourses = useMemo(() => {
        const dataArray = Array.isArray(coursesDataRaw) ? coursesDataRaw : [];

        // 1. Strict filtering (JEE only)
        const filtered = dataArray.filter(c => {
            const name = (c.name || '').toLowerCase();
            const target = (c.target_exam || '').toLowerCase();
            const cat = (c.category?.name || '').toLowerCase();

            const classLevel = (c.class_level || '').toLowerCase();
            const desc = (c.short_description || '').toLowerCase();

            const matchesJee = name.includes('jee') || target.includes('jee') || cat.includes('jee') ||
                classLevel.includes('jee') || desc.includes('jee') ||
                name.includes('wbjee') || target.includes('wbjee') || cat.includes('wbjee') ||
                classLevel.includes('wbjee') || desc.includes('wbjee') ||
                name.includes('engineering') || target.includes('engineering') || cat.includes('engineering') ||
                classLevel.includes('engineering') || desc.includes('engineering');

            if (!matchesJee) return false;

            // Apply search query filter if present
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return name.includes(query) || target.includes(query) || (c.course_title || "").toLowerCase().includes(query);
            }

            return true;
        });

        return filtered;
    }, [coursesDataRaw, searchQuery]);

    useEffect(() => {
        const fetchCentres = async () => {
            try {
                const response = await centresAPI.getAll();
                setCentres(response.data || []);
            } catch (error) {
                console.error("Error fetching centres:", error);
            }
        };
        fetchCentres();
    }, []);

    // Helper functions for location detection
    const extractCoordsFromUrl = (url) => {
        if (!url) return null;
        let targetUrl = url;
        if (url.includes("<iframe")) {
            const srcMatch = url.match(/src="([^"]+)"/);
            if (srcMatch) targetUrl = srcMatch[1];
        }
        const latMatch = targetUrl.match(/!3d\s*([-0-9.]+)/);
        const lngMatch = targetUrl.match(/!2d\s*([-0-9.]+)/);
        if (latMatch && lngMatch) {
            return {
                lat: parseFloat(latMatch[1]),
                lng: parseFloat(lngMatch[1])
            };
        }
        return null;
    };

    const formatClassLevel = (level) => {
        if (!level) return "Not specified";
        if (/^\d+$/.test(level.toString().trim())) {
            return `Class ${level}`;
        }
        return level;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const [isDetecting, setIsDetecting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                let nearestCentre = null;
                let minDistance = Infinity;

                centres.forEach((centre) => {
                    const url = centre.map_url || centre.google_map_url || centre.mapEmbed || centre.map || centre.location;
                    const coords = extractCoordsFromUrl(url);
                    if (coords) {
                        const dist = calculateDistance(userLat, userLng, coords.lat, coords.lng);
                        if (dist < minDistance) {
                            minDistance = dist;
                            nearestCentre = centre;
                        }
                    }
                });

                if (nearestCentre) {
                    setFormData(prev => ({
                        ...prev,
                        centre: nearestCentre.centre || nearestCentre.name
                    }));
                } else {
                    alert("Could not find any centres with valid location data.");
                }
                setIsDetecting(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Unable to retrieve your location.");
                setIsDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.phone || !formData.email) {
            alert("Please fill in all required fields (Name, Phone, Email)");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await landingAPI.register(formData);
            if (response.data.success) {
                setShowSuccess(true);
                localStorage.setItem('pathfinder_lead_captured', 'true');
                setIsLeadCaptured(true);
                // Reset form
                setFormData({
                    name: '',
                    phone: '',
                    student_class: '',
                    board: '',
                    course_type: '',
                    centre: '',
                    email: '',
                    page_source: window.location.pathname.includes('neet') ? 'NEET' : 'JEE'
                });
            } else {
                alert("Registration failed: " + (response.data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An error occurred. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const banners = [
        {
            src: "/images/Header Banner.webp",
            alt: "JEE WBJEE Header Banner"
        },
        // {
        //     src: "/WHY PATH IMAGES/NEET BANNER.webp",
        //     alt: "NEET 2025 Banner"
        // }
    ];

    // Auto-rotate carousel every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
            <Header />

            {/* Main Content Boxed Wrapper */}
            <div className="2xl:max-w-7xl mx-auto bg-white shadow-2xl relative">

                {/* Hero Section - Carousel */}
                <section id="home" className="relative pt-14 md:pt-20 overflow-hidden">
                    <div className="relative w-full">
                        {/* Carousel Container with Fixed Aspect Ratio */}
                        <div className="relative overflow-hidden aspect-[16/7] md:aspect-[16/5.5]">
                            {/* Images */}
                            <div className="flex transition-transform duration-700 ease-in-out h-full"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {banners.map((banner, index) => (
                                    <div key={index} className="min-w-full h-full">
                                        <img
                                            src={banner.src}
                                            alt={banner.alt}
                                            className="w-full h-full object-cover object-left block"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Arrows - Only show if multiple banners */}
                            {banners.length > 1 && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                                        aria-label="Previous slide"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                                        aria-label="Next slide"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            {/* Dot Indicators - Only show if multiple banners */}
                            {banners.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                                    {banners.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToSlide(index)}
                                            className={`transition-all duration-300 rounded-full ${currentSlide === index
                                                ? 'bg-orange-500 w-8 h-3'
                                                : 'bg-white/60 hover:bg-white/80 w-3 h-3'
                                                }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Registration Section */}
                <section id="landing-registration-form" className="bg-black text-white pt-12 md:pt-18 pb-1 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        {/* Centered Form Container */}
                        <div className="w-full">
                            <div className="max-w-5xl mx-auto">
                                <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center leading-tight">
                                    Register Now To get <span className="text-[#FF9F00]">AIR 1</span> Topper's Notes!
                                </h2>
                            </div>

                            <div className="max-w-4xl mx-auto">
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    {/* ... grid items ... */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold">Your Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Name"
                                                required
                                                className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+91"
                                                required
                                                className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold">Your Class</label>
                                            <select
                                                name="student_class"
                                                value={formData.student_class}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                required
                                            >
                                                <option value="">Select Class</option>
                                                <option value="6">6</option>
                                                <option value="7">7</option>
                                                <option value="8">8</option>
                                                <option value="9">9</option>
                                                <option value="10">10</option>
                                                <option value="11">11</option>
                                                <option value="12">12</option>
                                                <option value="Repeater">Repeater</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold">Your Board</label>
                                            <select
                                                name="board"
                                                value={formData.board}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                required
                                            >
                                                <option value="">Select Board</option>
                                                <option value="CBSE">CBSE</option>
                                                <option value="ICSE">ICSE</option>
                                                <option value="WB Board">West Bengal Board</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold">Course Type</label>
                                            <select
                                                name="course_type"
                                                value={formData.course_type}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                required
                                            >
                                                <option value="">Course Type</option>
                                                <option value="CRP">CRP (Classroom Program)</option>
                                                <option value="NCRP">NCRP (Non-Classroom Program)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                        <div className="space-y-2 md:flex-[3]">
                                            <label className="block text-sm font-bold">Centre</label>
                                            <div className="relative group">
                                                <select
                                                    name="centre"
                                                    value={formData.centre}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-5 pr-24 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] appearance-none"
                                                    required
                                                >
                                                    <option value="">Select Centre</option>
                                                    {centres.map((centre, index) => (
                                                        <option key={index} value={centre.centre || centre.name}>
                                                            {centre.centre || centre.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDetectLocation();
                                                        }}
                                                        disabled={isDetecting}
                                                        className="pointer-events-auto flex items-center gap-1 text-[9px] font-bold text-white bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded-md transition-colors shine-effect"
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        {isDetecting ? '...' : 'AUTO'}
                                                    </button>
                                                    <div className="w-px h-4 bg-gray-200"></div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:flex-[7]">
                                            <label className="block text-sm font-bold invisible">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Email"
                                                required
                                                className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-center ">
                                        <div className="flex justify-center pb-4 ">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`px-12 py-3 mb-4 bg-orange-500 hover:bg-orange-600 text-black font-black text-lg rounded-lg transition-all transform hover:scale-105 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Boy Image - Absolute Extreme Down */}
                    <div className="hidden md:block absolute right-0 bottom-0 z-0 pointer-events-none">
                        <img
                            src="/images/Form Boy.webp"
                            alt="Pathfinder Student"
                            className="w-56 lg:w-[280px] h-auto object-contain block"
                        />
                    </div>
                </section>

                {/* Why Choose Pathfinder Section */}
                <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Pathfinder?</span>
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-10">
                            {[
                                { image: "/WHY PATH IMAGES/Top faculty.webp", label: "Top Faculty" },
                                { image: "/WHY PATH IMAGES/pathtex app.webp", label: "Pathtex App" },
                                { image: "/WHY PATH IMAGES/Soft skills.webp", label: "Soft Skills" },
                                { image: "/WHY PATH IMAGES/mental-health.webp", label: "Mental Health" },
                                { image: "/WHY PATH IMAGES/AI.webp", label: "AI Learning" },
                                { image: "/WHY PATH IMAGES/Robotics.webp", label: "Robotics" }
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-white rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/5 group-hover:to-orange-600/5 rounded-2xl transition-all duration-300"></div>

                                    <div className="relative flex flex-col items-center text-center">
                                        <div className="w-28 h-28 md:w-32 md:h-32 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                            <img
                                                src={feature.image}
                                                alt={feature.label}
                                                className="w-full h-full object-contain drop-shadow-lg"
                                            />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300">
                                            {feature.label}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related Courses Section */}
                <section className="py-20 bg-white relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                                Related <span className="text-orange-500">JEE & WBJEE</span> Courses
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Explore our specialized programs designed to help you ace the JEE Main, Advanced & WBJEE exams.
                            </p>
                        </div>

                        {!isLeadCaptured ? (
                            <div className="relative group">
                                {/* Locked State UI */}
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-[3rem] z-20 flex flex-col items-center justify-center p-8 border-2 border-dashed border-orange-200 shadow-2xl shadow-orange-500/5">
                                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                        <Lock className="w-10 h-10 text-orange-600" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">View All JEE Courses</h3>
                                    <p className="text-gray-600 text-center mb-8 max-w-md font-medium">
                                        To view our complete list of Classroom and Digital programs for JEE, please complete your registration.
                                    </p>
                                    <button
                                        onClick={scrollToForm}
                                        className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center gap-3"
                                    >
                                        Unlock Course List
                                        <ShieldCheck className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Blurred Placeholder Content */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-20 select-none pointer-events-none filter blur-sm">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                            <div className="h-40 bg-gray-200 rounded-2xl mb-6"></div>
                                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto pb-8 custom-scrollbar snap-x">
                                <div className="grid grid-rows-2 grid-flow-col gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 w-max min-w-full">
                                    {allCourses.length > 0 ? (
                                        allCourses.map((c, idx) => {
                                            const displayPrice = c.discounted_price ? parseFloat(c.discounted_price) : parseFloat(c.course_price);
                                            const originalPrice = c.course_price ? parseFloat(c.course_price) : 0;
                                            const discount = c.offers ? parseInt(c.offers) : 0;
                                            const hasDiscount = c.discounted_price && discount > 0;

                                            return (
                                                <div
                                                    key={c.id || c._id}
                                                    className="w-[350px] md:w-[400px] rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative flex flex-col group bg-white border border-gray-100 snap-start"
                                                >
                                                    {/* Mode Ribbon */}
                                                    <div className="absolute top-0 left-0 z-10">
                                                        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-br-xl shadow-md uppercase tracking-wide">
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
                                                                    <h4 className="text-white/90 font-black text-3xl uppercase tracking-wider mb-1" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                                                        WARRIORS
                                                                    </h4>
                                                                    <div className="flex items-center justify-center gap-2 mb-1">
                                                                        <div className="h-px bg-white/60 w-8"></div>
                                                                        <span className="text-white/90 font-bold text-xs">AND</span>
                                                                        <div className="h-px bg-white/60 w-8"></div>
                                                                    </div>
                                                                    <h4 className="text-white font-black text-3xl uppercase tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                                                        WINNERS
                                                                    </h4>
                                                                    <div className="mt-2 bg-black/80 text-white text-[10px] font-semibold px-3 py-1 rounded inline-block">
                                                                        {c.programme || 'JEE CLASSROOM PROGRAM'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Black Content Section */}
                                                    <div className="bg-black text-white p-6 flex flex-col flex-grow">
                                                        {/* Course Title */}
                                                        {c.course_title && (
                                                            <div className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-3 text-center border-b border-orange-500/20 pb-2">
                                                                {c.course_title}
                                                            </div>
                                                        )}

                                                        {/* Title Row with Decorative Lines and Language Badge */}
                                                        <div className="flex flex-col items-center justify-center gap-3 mb-4">
                                                            <div className="flex items-center gap-2 w-full">
                                                                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
                                                                <h3 className="font-bold text-lg text-white leading-tight text-center whitespace-nowrap">
                                                                    {c.name}
                                                                </h3>
                                                                <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1"></div>
                                                            </div>
                                                            <div className="px-2 py-0.5 border border-white/50 text-white text-[8px] font-bold uppercase rounded w-fit">
                                                                ENGLISH
                                                            </div>
                                                        </div>

                                                        {/* Details with Icons */}
                                                        <div className="space-y-2.5 mb-5">
                                                            <div className="flex items-center gap-3 text-white text-[13px]">
                                                                <GraduationCap className="w-4 h-4 text-orange-500" />
                                                                <span>For {formatClassLevel(c.class_level)} Aspirants</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-white text-[13px]">
                                                                <CheckCircle className="w-4 h-4 text-orange-500" />
                                                                <span>
                                                                    Starts on {c.starting_date
                                                                        ? new Date(c.starting_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                        : "Coming Soon"
                                                                    }
                                                                </span>
                                                            </div>
                                                            {c.centre && (
                                                                <div className="flex items-center gap-3 text-white text-[13px]">
                                                                    <MapPin className="w-4 h-4 text-orange-500" />
                                                                    <span>Centre : {c.centre}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Price Section */}
                                                        <div className="flex items-center flex-wrap gap-3 mb-5 mt-auto">
                                                            <div className="text-2xl font-bold text-orange-500 leading-none">
                                                                ₹{displayPrice.toLocaleString()}
                                                            </div>
                                                            {hasDiscount && (
                                                                <>
                                                                    <div className="text-sm text-gray-400 line-through">
                                                                        ₹{originalPrice.toLocaleString()}
                                                                    </div>
                                                                    <div className="ml-auto bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                                                                        {discount}% OFF
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedCourse(c);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="py-2.5 rounded-xl border border-white text-white font-bold text-[10px] hover:bg-white hover:text-black transition-all duration-200 uppercase tracking-wider"
                                                            >
                                                                EXPLORE
                                                            </button>
                                                            <button
                                                                onClick={() => toast.info("To purchase this course, please contact our Help Desk or visit the nearest Pathfinder centre.", {
                                                                    position: "top-center",
                                                                    autoClose: 5000,
                                                                    hideProgressBar: false,
                                                                    closeOnClick: true,
                                                                    pauseOnHover: true,
                                                                    draggable: true,
                                                                    theme: "colored",
                                                                })}
                                                                className="py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold text-[10px] hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg uppercase tracking-wider"
                                                            >
                                                                BUY NOW
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-full text-center py-10">
                                            <p className="text-gray-500 font-medium">No active JEE or WBJEE courses found at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Scholarship Section */}
                <section className="py-20 bg-slate-50 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full -ml-48 -mb-48 blur-3xl" />

                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                                Scholarship <span className="text-orange-500">Opportunities</span>
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Pathfinder provides extensive scholarships to meritorious students based on their academic performance and entrance exams.
                            </p>
                        </div>

                        {!isLeadCaptured ? (
                            <div className="relative group">
                                {/* Locked State UI */}
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-[3rem] z-20 flex flex-col items-center justify-center p-8 border-2 border-dashed border-orange-200 shadow-2xl shadow-orange-500/5">
                                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                        <Lock className="w-10 h-10 text-orange-600" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Content Locked</h3>
                                    <p className="text-gray-600 text-center mb-8 max-w-md font-medium">
                                        To view detailed scholarship criteria and award amounts, please complete your registration.
                                    </p>
                                    <button
                                        onClick={scrollToForm}
                                        className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center gap-3"
                                    >
                                        Unlock Scholarship Details
                                        <ShieldCheck className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Blurred Placeholder Content */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-20 select-none pointer-events-none filter blur-sm">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl mb-6"></div>
                                            <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
                                            <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                                            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Unlocked State UI */
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-500/5 hover:border-orange-300 transition-colors group">
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <GraduationCap className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Merit Scholarship</h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        Up to <span className="text-orange-600 font-bold">100% scholarship</span> on tuition fees for students securing top ranks in national entrance exams.
                                    </p>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-500/5 hover:border-orange-300 transition-colors group">
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Award className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Board Toppers</h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        Special fee waivers for State and Central Board toppers (CBSE, ICSE, WB Board). Guaranteed support for <span className="text-orange-600 font-bold">90%+ scorers</span>.
                                    </p>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-500/5 hover:border-orange-300 transition-colors group">
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Admission Test</h4>
                                    <p className="text-gray-600 mb-4 leading-relaxed">
                                        Take our scholarship-cum-admission test to avail up to <span className="text-orange-600 font-bold">50% waiver</span> based on your potential.
                                    </p>
                                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 w-fit">
                                        <span className="text-orange-600 text-xs font-black uppercase tracking-wider">📝 PSAT Exam</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Expert Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        {/* Premium Section Header */}
                        <div className="text-center mb-8">
                            {/* <span className="inline-block bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-orange-200 mb-4">
                                📚 Classroom Programme
                            </span> */}
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-3">
                                1-Year, 2-Year & Repeater
                                <br />
                                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                    Programmes
                                </span>
                            </h2>
                            <p className="text-gray-600 text-base md:text-lg font-semibold">
                                JEE Main & Advanced &nbsp;|&nbsp; <span className="text-orange-500 font-black">JEE</span>
                            </p>
                            <div className="mt-4 h-1 w-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
                        </div>
                    </div>

                    {/* Full-width Orange Bar - Outside Container */}
                    <div className="bg-orange-500 text-white text-lg md:text-xl font-bold py-1 text-center w-full mb-8">
                        For 11, 12 & Repeater Students
                    </div>

                    <div className="max-w-6xl mx-auto px-6">
                        {/* Frequency and Timings - Horizontal Compact Layout */}
                        <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 md:gap-0 mb-12 pt-8">
                            {/* Frequency */}
                            <div className="flex-1 flex items-center justify-center md:justify-end gap-4 md:pr-8">
                                <img src="/WHY PATH IMAGES/rotateing cube.webp" alt="Frequency" className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0" />
                                <div className="text-left">
                                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Frequency</h4>
                                    <p className="text-gray-700 text-sm md:text-base whitespace-nowrap"><span className="font-semibold">Instation:</span> 2 Days a Week</p>
                                    <p className="text-gray-700 text-sm md:text-base whitespace-nowrap"><span className="font-semibold">Outstation:</span> 2 Days a Week</p>
                                </div>
                            </div>

                            {/* Center Divider Line - Hidden on mobile */}
                            <div className="hidden md:block w-px h-24 bg-gray-300"></div>

                            {/* Timings */}
                            <div className="flex-1 flex items-center justify-center md:justify-start gap-4 md:pl-8">
                                <img src="/WHY PATH IMAGES/clock.webp" alt="Timings" className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0" />
                                <div className="text-left">
                                    <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Timings</h4>
                                    <p className="text-gray-700 text-sm md:text-base whitespace-nowrap"><span className="font-semibold">Instation:</span> 12hrs / Subject / Month</p>
                                    <p className="text-gray-700 text-sm md:text-base whitespace-nowrap"><span className="font-semibold">Outstation:</span> 12 hrs / Subject / Month</p>
                                </div>
                            </div>
                        </div>

                        {/* Test Support */}
                        <div className="mb-12">
                            <h3 className="text-3xl font-extrabold text-center text-gray-900 mb-8">Test Support</h3>

                            {/* Tables Container - Reduced Width */}
                            <div className="max-w-4xl mx-auto">
                                {/* JEE Test Support Table */}
                                <div className="overflow-x-auto mb-2">
                                    <table className="w-full border-collapse rounded-md overflow-hidden bg-gradient-to-r from-white via-orange-100 to-orange-300">
                                        <colgroup>
                                            <col style={{ width: '50%' }} />
                                            <col style={{ width: '50%' }} />
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th className="border-r border-b border-gray-400 px-6 py-4 text-left text-xl font-bold text-gray-900">
                                                    1st Year (XI)
                                                </th>
                                                <th className="border-b border-gray-400 px-6 py-4 text-left text-xl font-bold text-gray-900">
                                                    2nd Year (XII)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border-r border-b border-gray-400 px-6 py-3 text-gray-800">
                                                    Phase Test (JEE Main Part Syllabus) - 5 Test
                                                </td>
                                                <td className="border-b border-gray-400 px-6 py-3 text-gray-800">
                                                    Phase Test (JEE Main Part Syllabus) - 5 Test
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border-r border-b border-gray-400 px-6 py-3 text-gray-800">
                                                    Phase Test (JEE Adv. Part Syllabus) - 2 Test
                                                </td>
                                                <td className="border-b border-gray-400 px-6 py-3 text-gray-800">
                                                    Phase Test (JEE Adv. Part Syllabus) - 2 Test
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border-r border-b border-gray-400 px-6 py-3 text-gray-800">
                                                    JEE Main Full Syllabus - 1 Test
                                                </td>
                                                <td className="border-b border-gray-400 px-6 py-3 text-gray-800">
                                                    JEE Main Mock Test (Full Syllabus) - 10 Test
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border-r border-gray-400 px-6 py-3 text-gray-800">
                                                    JEE Advanced Full Syllabus - 1 Test
                                                </td>
                                                <td className="px-6 py-3 text-gray-800">
                                                    JEE Advanced Mock Test (Full Syllabus) - 5 Test
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* WBJEE Test Support Table - Separate */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse rounded-md overflow-hidden bg-orange-100">
                                        <colgroup>
                                            <col style={{ width: '50%' }} />
                                            <col style={{ width: '50%' }} />
                                        </colgroup>
                                        <tbody>
                                            <tr>
                                                <td className="border-r border-b border-gray-400 px-6 py-3 text-gray-800">
                                                    WBJEE Phase Test (Part Syllabus) - 5 Test
                                                </td>
                                                <td className="border-b border-gray-400 px-6 py-3 text-gray-800">
                                                    WBJEE Phase Test (Part Syllabus) - 5 Test
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border-r border-gray-400 px-6 py-3 text-gray-800">
                                                    WBJEE Full Syllabus Test - 2 Test
                                                </td>
                                                <td className="px-6 py-3 text-gray-800">
                                                    WBJEE Mock Test (Full Syllabus) - 8 Test
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Add-ons */}
                        < div className="text-center" >
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-6">
                                <span className="text-orange-500">Add ons</span> <span className="text-gray-900">(Till Official NEET Exam)</span>
                            </h3>
                            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
                                <div className="flex items-center gap-3">
                                    <img src="/WHY PATH IMAGES/Tick mark.webp" alt="Check" className="w-8 h-8" />
                                    <span className="text-lg md:text-xl font-semibold text-gray-800">Online Class Support</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <img src="/WHY PATH IMAGES/Tick mark.webp" alt="Check" className="w-8 h-8" />
                                    <span className="text-lg md:text-xl font-semibold text-gray-800">Free Doubt Clearing Calender</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <img src="/WHY PATH IMAGES/Tick mark.webp" alt="Check" className="w-8 h-8" />
                                    <span className="text-lg md:text-xl font-semibold text-gray-800">Individual Mentorship</span>
                                </div>
                            </div>
                        </div >
                    </div >
                </section >

                {/* Rankers Section */}
                <section className="bg-gradient-to-br from-orange-200 via-orange-200 to-orange-200 overflow-visible mt-8 mb-0 md:my-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="h-[100px] md:h-[290px] flex items-start justify-center">
                            <img
                                src="/images/Toppers.webp"
                                alt="Pathfinder Toppers"
                                className="w-full h-auto object-contain -mt-[160px] md:-mt-[504px] scale-[1.4] translate-x-[6%] md:scale-[1.1] md:translate-x-0 pointer-events-none"
                            />
                        </div>
                    </div>
                </section >

                {/* Ranker Testimonials Section */}
                <section className="pt-10 pb-20 md:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-12">
                            See what our <span className="text-orange-500">Expert</span> are saying
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                            {[
                                { id: 1, label: "Topper's Talk", url: "https://www.youtube.com/embed/dl-QLpDplLE" },
                                { id: 2, label: "Success Story", url: "https://www.youtube.com/embed/wGnX7j4EULA" },
                                { id: 3, label: "Expert Guidance", url: "https://www.youtube.com/embed/KOFomNzzluc" }
                            ].map((video) => (
                                <div key={video.id} className="space-y-4">
                                    <h4 className="text-center text-xl font-bold text-gray-900 mb-2">
                                        {video.label}
                                    </h4>
                                    <div className="relative z-10 aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                                        <iframe
                                            className="w-full h-full"
                                            src={video.url}
                                            title={video.label}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section >

                <Footer />

                {/* Success Modal */}
                {showSuccess && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl transform animate-in zoom-in-95 duration-300">
                            {/* Colorful Header */}
                            <div className="bg-orange-500 p-6 text-center relative">
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-lg mb-3">
                                    <CheckCircle className="w-8 h-8 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-extrabold text-white">Registration Successful!</h3>
                            </div>

                            {/* Message Body */}
                            <div className="p-6 text-center space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Congratulations! We've received your registration. Our team will contact you shortly.
                                </p>

                                <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-3 text-left border border-orange-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                        <Mail className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Check Your Inbox</p>
                                        <p className="text-[10px] text-gray-500 leading-tight">Confirmation email sent.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <CourseDetailModal
                    course={selectedCourse}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedCourse(null);
                    }}
                />
            </div >
        </div >
    );
};


