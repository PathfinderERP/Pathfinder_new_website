import React, { useState, useEffect } from "react";
import { MapPin, Mail, X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { landingAPI, centresAPI } from "../../../services/api";


export const AllIndiaLandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [centres, setCentres] = useState([]);
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
            src: "/Header Banner.webp",
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
                <section className="bg-black text-white pt-12 md:pt-18 pb-1 relative overflow-hidden">
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
                            src="/Form Boy.webp"
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

                {/* Program Information Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        {/* Header - Compact Design */}
                        <div className="mb-4">
                            <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 text-center mb-2 px-2">
                                2 Year Classroom Programme for
                            </h2>
                            <h3 className="text-xl md:text-3xl font-extrabold text-gray-900 text-center mb-4 px-2">
                                JEE Main & Advanced | <span className="text-orange-500">WBJEE</span>
                            </h3>
                        </div>
                    </div>

                    {/* Full-width Orange Bar - Outside Container */}
                    <div className="bg-orange-500 text-white text-lg md:text-xl font-bold py-1 text-center w-full mb-8">
                        For 11 students
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
                                src="/Toppers.webp"
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
            </div >
        </div >
    );
};
