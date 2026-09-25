import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import { MapPin, Mail, X, CheckCircle, ChevronLeft, ChevronRight, Lock, GraduationCap, Award, ShieldCheck } from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import RegistrationPopup from '../common/RegistrationPopup';
import { landingAPI, centresAPI, coursesAPI } from "../../../services/api";
import { useCachedData } from "../../../hooks/useCachedData";

const FloatingStickyBadge = ({ scrollToForm, onScholarshipClick }) => {
    const [studentCount, setStudentCount] = useState(2450);

    useEffect(() => {
        const incrementCounter = () => {
            setStudentCount(prev => prev + 1);
            const nextTimeout = Math.floor(Math.random() * 8000) + 3000;
            setTimeout(incrementCounter, nextTimeout);
        };
        const timer = setTimeout(incrementCounter, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
        >
            <motion.div
                animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                        "0 10px 15px -3px rgba(234, 88, 12, 0.2)",
                        "0 10px 15px -3px rgba(234, 88, 12, 0.4)",
                        "0 10px 15px -3px rgba(234, 88, 12, 0.2)"
                    ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-l from-orange-600 to-orange-500 text-white py-3 px-4 rounded-l-2xl shadow-2xl pointer-events-auto cursor-pointer group hover:pr-6 transition-all"
                onClick={scrollToForm}
            >
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">PMTSE 2026</span>
                        <span className="text-sm font-black whitespace-nowrap">SCHOLARSHIP TEST</span>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                        <Award className="w-6 h-6" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white border-y border-l border-orange-200 text-orange-600 py-2.5 px-4 rounded-l-xl shadow-xl pointer-events-auto cursor-pointer flex items-center gap-3 hover:bg-orange-50 transition-colors"
                onClick={onScholarshipClick}
            >
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Scholarship</span>
                    <span className="text-xs font-black">UP TO 100% SCHOLARSHIP</span>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                </div>
            </motion.div>

            <div className="mr-2 flex flex-col items-end gap-1.5">
                <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-2"
                >
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                    LIMITED SEATS
                </motion.div>
                
                <motion.div className="bg-white/95 backdrop-blur-sm border border-orange-200 text-gray-900 text-[10px] font-black px-3 py-2 rounded-xl shadow-xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={studentCount}
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -5, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {studentCount}+ APPLIED
                        </motion.span>
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
};

export const PmtseLandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [centres, setCentres] = useState([]);
    const [isLeadCaptured, setIsLeadCaptured] = useState(() => {
        return localStorage.getItem('pathfinder_lead_captured_pmtse') === 'true';
    });
    const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        student_class: '',
        course_type: '',
        city: '',
        centre: '',
        page_source: 'PMTSE Scholarship'
    });

    const scrollToForm = () => {
        const formElement = document.getElementById('landing-registration-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

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
            return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
        }
        return null;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const [isDetecting, setIsDetecting] = useState(false);

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
        if (name === "phone") {
            const digitsOnly = value.replace(/\D/g, "");
            if (digitsOnly.length > 0 && !/^[6-9]/.test(digitsOnly)) {
                return;
            }
            if (digitsOnly.length > 10) return;
            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.centre) {
            alert("Please fill in all required fields (Name, Phone, Centre)");
            return;
        }
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = { ...formData };
            const response = await landingAPI.register(submitData);
            if (response.data.success) {
                setShowSuccess(true);
                localStorage.setItem('pathfinder_lead_captured_pmtse', 'true');
                setIsLeadCaptured(true);
                setFormData({
                    name: '',
                    phone: '',
                    student_class: '',
                    course_type: '',
                    city: '',
                    centre: '',
                    page_source: 'PMTSE Scholarship'
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
        { src: "/WHY PATH IMAGES/CBSE BANNER.webp", alt: "PMTSE Scholarship Banner" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
            <Header />
            <FloatingStickyBadge 
                scrollToForm={scrollToForm} 
                onScholarshipClick={() => setIsRegistrationPopupOpen(true)}
            />

            <div className="2xl:max-w-7xl mx-auto bg-white shadow-2xl relative">
                <section id="home" className="relative pt-8 md:pt-12 overflow-hidden">
                    <div className="relative w-full">
                        <div className="relative overflow-hidden aspect-[16/7] md:aspect-[16/5.5]">
                            <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {banners.map((banner, index) => (
                                    <div key={index} className="min-w-full h-full">
                                        <img src={banner.src} alt={banner.alt} className="w-full h-full object-cover object-left block" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="landing-registration-form" className="bg-black text-white pt-12 md:pt-18 pb-12 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        {isLeadCaptured ? (
                            <div className="py-20 text-center">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-500/10">
                                    <CheckCircle className="w-14 h-14 text-green-500" />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                                    Thank <span className="text-[#FF9F00]">You!</span>
                                </h2>
                                <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
                                    Our expert team will contact you soon with details for PMTSE Scholarship Test 2026.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full">
                                <div className="max-w-5xl mx-auto text-center">
                                    <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                                        PMTSE <span className="text-[#FF9F00]">Scholarship Test 2026</span>
                                    </h2>
                                    <p className="text-gray-300 text-base md:text-lg mb-10 max-w-2xl mx-auto">
                                        Unlock up to 100% Scholarship for JEE, NEET & Foundation Courses.
                                    </p>
                                </div>

                                <div className="max-w-4xl mx-auto">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold">Your Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter full name"
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
                                                    placeholder="10-digit mobile number"
                                                    maxLength={10}
                                                    required
                                                    className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    <option value="7">Class 7</option>
                                                    <option value="8">Class 8</option>
                                                    <option value="9">Class 9</option>
                                                    <option value="10">Class 10</option>
                                                    <option value="11">Class 11</option>
                                                    <option value="12">Class 12</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold">Target Exam</label>
                                                <select
                                                    name="course_type"
                                                    value={formData.course_type}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                    required
                                                >
                                                    <option value="">Select Target Exam</option>
                                                    <option value="JEE Main & Advanced">JEE Main & Advanced</option>
                                                    <option value="NEET (UG)">NEET (UG)</option>
                                                    <option value="Foundation (Class 7-10)">Foundation (Class 7-10)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your city"
                                                    className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="block text-sm font-bold">Choose Centre *</label>
                                                    <button
                                                        type="button"
                                                        onClick={handleDetectLocation}
                                                        className="text-xs text-[#FF9F00] hover:underline flex items-center gap-1"
                                                        disabled={isDetecting}
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        {isDetecting ? 'Detecting...' : 'Near Me'}
                                                    </button>
                                                </div>
                                                <select
                                                    name="centre"
                                                    value={formData.centre}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                    required
                                                >
                                                    <option value="">Select Centre *</option>
                                                    {centres.map((c, idx) => (
                                                        <option key={idx} value={c.centre || c.name}>
                                                            {c.centre || c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex justify-center pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`px-12 py-4 bg-orange-500 hover:bg-orange-600 text-black font-black text-lg rounded-xl transition-all transform hover:scale-105 shadow-xl ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isSubmitting ? 'SUBMITTING...' : 'REGISTER FOR PMTSE NOW'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <Footer />
            <RegistrationPopup 
                isOpen={isRegistrationPopupOpen} 
                onClose={() => setIsRegistrationPopupOpen(false)} 
            />
        </div>
    );
};

export default PmtseLandingPage;
