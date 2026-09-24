import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import { MapPin, Mail, X, CheckCircle, ChevronLeft, ChevronRight, Lock, GraduationCap, Award, ShieldCheck, CreditCard } from 'lucide-react';
import axios from 'axios';
import Header from '../common/Header';
import Footer from '../common/Footer';
import RegistrationPopup from '../common/RegistrationPopup';
import { landingAPI, centresAPI, coursesAPI } from "../../../services/api";
import { useCachedData } from "../../../hooks/useCachedData";
import CourseDetailModal from "../../../components/CourseDetailModal";

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
            {/* Admissions Badge */}
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
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Batch 2026-27</span>
                        <span className="text-sm font-black whitespace-nowrap">ADMISSIONS OPEN</span>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                </div>
            </motion.div>

            {/* Scholarship Badge */}
            <motion.div
                animate={{ 
                    x: [0, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white border-y border-l border-orange-200 text-orange-600 py-2.5 px-4 rounded-l-xl shadow-xl pointer-events-auto cursor-pointer flex items-center gap-3 hover:bg-orange-50 transition-colors"
                onClick={onScholarshipClick}
            >
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Scholarship</span>
                    <span className="text-xs font-black">UP TO 100% OFF</span>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5" />
                </div>
            </motion.div>

            {/* Urgency & Counter */}
            <div className="mr-2 flex flex-col items-end gap-1.5">
                <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-2"
                >
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                    LAST 06 HOURS
                </motion.div>
                
                <motion.div
                    className="bg-white/95 backdrop-blur-sm border border-orange-200 text-gray-900 text-[10px] font-black px-3 py-2 rounded-xl shadow-xl flex items-center gap-2"
                >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={studentCount}
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -5, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {studentCount}+ ENROLLED
                        </motion.span>
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
};

export const MockTestLandingPage = ({ boardType, isVersionTwo = false }) => {
    // boardType: 'cbse' | 'icse' | 'wb'
    const config = {
        cbse: {
            title: "CBSE Board",
            highlight: "Mock Test Program",
            badgeText: "CBSE MOCK TEST 2026",
            heading: "India's Top CBSE Class 10 & 12 Mock Test Series",
            subHeading: "Boost your CBSE Board exam preparation with expert-crafted mock tests for Class 10 and Class 12.",
            pageSource: "CBSE Mock Test Program",
            coursesFilter: "cbse",
            bannerSrc: "/WHY PATH IMAGES/CBSE BANNER.webp"
        },
        icse: {
            title: "ICSE / ISC Board",
            highlight: "Mock Test Program",
            badgeText: "ICSE & ISC MOCK TEST 2026",
            heading: "India's Top ICSE & ISC Class 10 & 12 Mock Test Series",
            subHeading: "Excel in your ICSE Class 10 & ISC Class 12 Board Exams with comprehensive test papers and detailed evaluations.",
            pageSource: "ICSE/ISC Mock Test Program",
            coursesFilter: "icse",
            bannerSrc: "/WHY PATH IMAGES/ICSE BANNER.webp"
        },
        wb: {
            title: "WB Board",
            highlight: "Mock Test Program",
            badgeText: "WB BOARD MOCK TEST 2026",
            heading: "West Bengal Board Class 10 & 12 Mock Test Series",
            subHeading: "Prepare for Class 10 & Class 12 (HS) with West Bengal's leading test program.",
            pageSource: "WB Board Mock Test Program",
            coursesFilter: "wb",
            bannerSrc: "/WHY PATH IMAGES/WB BANNER.webp"
        }
    }[boardType] || {
        title: "Board Exam",
        highlight: "Mock Test Program",
        badgeText: "MOCK TEST 2026",
        heading: "Top Board Exam Mock Test Series",
        subHeading: "Boost your Board exam preparation with expert-crafted mock tests for Class 10 and Class 12.",
        pageSource: "Mock Test Program",
        coursesFilter: "board",
        bannerSrc: "/WHY PATH IMAGES/CBSE BANNER.webp"
    };

    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [centres, setCentres] = useState([]);
    const [isLeadCaptured, setIsLeadCaptured] = useState(() => {
        return localStorage.getItem(`pathfinder_lead_captured_${boardType}`) === 'true';
    });
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);
    const [popupShowPercentage, setPopupShowPercentage] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        student_class: '',
        course_type: '',
        city: '',
        centre: '',
        page_source: config.pageSource
    });

    const [isPayingNow, setIsPayingNow] = useState(false);
    const [isAwaitingPaymentModal, setIsAwaitingPaymentModal] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const handleBuyNow = (course = null) => {
        const courseToBuy = course || {
            id: `cbse-mock-test-program-2026`,
            name: `${config.title} ${config.highlight} 2026`,
            price: 10,
            discounted_price: 10,
            course_price: 10,
            discount_price: 10,
            mode: "Classroom / Digital",
            location: formData.city || formData.centre || "All Pathfinder Centres",
            class_level: formData.student_class || "Class 10 & 12",
            short_description: config.subHeading
        };

        navigate("/buynow", { state: { courseData: courseToBuy } });
    };

    const handleICICIPayNow = async () => {
        if (!formData.name || !formData.phone) {
            alert("Please fill in your Name and Phone Number to proceed with Buy Now.");
            scrollToForm();
            return;
        }

        setIsPayingNow(true);
        try {
            // 1. Pre-save student/lead details into database before redirecting
            const merchantTxnNo = `TXN${Date.now()}`;
            const selectedClass = formData.student_class ? `Class ${formData.student_class}` : 'Class 10';
            const cleanSource = `Mock Test - ${selectedClass}`;
            const customerName = formData.name || 'CBSE Student';
            const customerMobileNo = formData.phone || '9876543210';
            const customerEmailID = formData.email || `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@pathfinder.edu.in`;

            try {
                await landingAPI.register({
                    ...formData,
                    name: customerName,
                    phone: customerMobileNo,
                    email: customerEmailID,
                    centre: formData.city || formData.centre || 'Online',
                    course_type: `${config.title} Mock Test Program`,
                    page_source: cleanSource,
                    txn_ref: merchantTxnNo
                });
            } catch (leadErr) {
                console.warn("Lead save notice on Pay Now:", leadErr);
            }

            // 2. Fetch live production credentials and redirect URLs from backend/environment
            let gatewayConfig = {
                merchantId: "100000000517815",
                aggregatorID: "100000000517814",
                secretKey: "",
                saleUrl: "https://pgpay.icicibank.com/pg/api/v2/initiateSale"
            };

            try {
                const configRes = await axios.get(`${API_BASE_URL}/api/courses/icici/config/`);
                if (configRes.data && configRes.data.saleUrl) {
                    gatewayConfig = configRes.data;
                }
            } catch (cfgErr) {
                console.warn("Using fallback ICICI config", cfgErr);
            }

            const { merchantId, aggregatorID, secretKey, saleUrl } = gatewayConfig;
            const txnDate = new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
            const amount = "10.00"; // Test amount set to ₹10 as requested
            const returnURL = `${API_BASE_URL}/api/courses/icici/callback/`;

            const params = {
                merchantId,
                aggregatorID,
                merchantTxnNo,
                amount,
                currencyCode: "356",
                payType: "0",
                customerEmailID,
                transactionType: "SALE",
                returnURL,
                txnDate,
                customerMobileNo,
                customerName,
                addlParam1: "cbse-mock-test-program-2",
                addlParam2: ""
            };

            // 3. Generate HMAC-SHA256 hash using backend secret key
            const hashRes = await axios.post(`${API_BASE_URL}/api/courses/icici/generate-hash/`, {
                mode: "v1",
                secretKey,
                params
            });

            const secureHash = hashRes.data?.secureHash || "";
            const fullPayload = { ...params, secureHash };

            // 4. Proxy request to ICICI Bank initiateSale API
            const proxyRes = await axios.post(`${API_BASE_URL}/api/courses/icici/proxy/`, {
                target_url: saleUrl,
                payload_type: "json",
                payload: fullPayload
            });

            const resData = proxyRes.data;
            const responseContent = resData?.data || resData || {};
            const targetRedirect = responseContent.redirectURI || responseContent.redirectUrl || responseContent.redirect_url || responseContent.targetUrl || responseContent.target_url || responseContent.url || responseContent.action;
            const tranCtx = responseContent.tranCtx || responseContent.tran_ctx || responseContent.tranContext;

            let redirectTarget = targetRedirect;
            if (redirectTarget && tranCtx) {
                redirectTarget = redirectTarget.includes('?') 
                    ? `${redirectTarget}&tranCtx=${encodeURIComponent(tranCtx)}`
                    : `${redirectTarget}?tranCtx=${encodeURIComponent(tranCtx)}`;
            }

            if (redirectTarget) {
                // Redirect browser directly to ICICI Payment Gateway
                window.location.href = redirectTarget;
            } else if (responseContent.html || responseContent.formHtml) {
                document.open();
                document.write(responseContent.html || responseContent.formHtml);
                document.close();
            } else {
                const errorMsg = responseContent.responseMessage || responseContent.respDescription || responseContent.message || responseContent.error || (typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent));
                throw new Error(errorMsg || "Failed to obtain ICICI payment gateway redirect URL");
            }
        } catch (error) {
            console.error('ICICI Direct Checkout Error:', error);
            alert(`Payment Gateway Error: ${error.message || 'Unable to connect to ICICI Bank gateway. Please try again.'}`);
            setIsPayingNow(false);
        }
    };

    const scrollToForm = () => {
        const formElement = document.getElementById('landing-registration-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const { data: coursesDataRaw, loading: loadingCourses } = useCachedData("all_courses", () => coursesAPI.getAll());

    const allCourses = useMemo(() => {
        const dataArray = Array.isArray(coursesDataRaw) ? coursesDataRaw : [];

        const filtered = dataArray.filter(c => {
            const name = (c.name || '').toLowerCase();
            const target = (c.target_exam || '').toLowerCase();
            const cat = (c.category?.name || '').toLowerCase();
            const classLevel = (c.class_level || '').toLowerCase();
            const desc = (c.short_description || '').toLowerCase();

            const isMockOrBoard = name.includes('mock') || target.includes('mock') || cat.includes('mock') ||
                desc.includes('mock') || name.includes('board') || cat.includes('board') || name.includes(config.coursesFilter);

            if (!isMockOrBoard) return false;

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return name.includes(query) || target.includes(query) || (c.course_title || "").toLowerCase().includes(query);
            }

            return true;
        });

        return filtered.length > 0 ? filtered : dataArray.slice(0, 6);
    }, [coursesDataRaw, searchQuery, config.coursesFilter]);

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
            return {
                lat: parseFloat(latMatch[1]),
                lng: parseFloat(lngMatch[1])
            };
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            alert("Please fill in all required fields (Name, Phone)");
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                centre: formData.city || formData.centre,
                course_type: formData.course_type || "Mock Test Program"
            };
            const response = await landingAPI.register(submitData);
            if (response.data && (response.data.success || response.status === 201)) {
                setShowSuccess(true);
                localStorage.setItem(`pathfinder_lead_captured_${boardType}`, 'true');
                setIsLeadCaptured(true);
                setFormData({
                    name: '',
                    phone: '',
                    student_class: '',
                    course_type: '',
                    city: '',
                    centre: '',
                    page_source: config.pageSource
                });
            } else {
                alert("Registration failed: " + (response.data?.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Submission error:", error);
            const errMsg = error.response?.data?.message || error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : "An error occurred. Please try again later.";
            alert("Registration submission: " + errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const banners = [
        {
            src: config.bannerSrc,
            alt: `${config.title} Mock Test Banner`
        }
    ];

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
        <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
            <Header 
                customPayNowButton={
                    isVersionTwo ? (
                        <motion.button
                            onClick={handleICICIPayNow}
                            disabled={isPayingNow}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-extrabold shadow-lg hover:shadow-orange-500/40 transition-all border border-white/20 animate-pulse cursor-pointer disabled:opacity-50"
                        >
                            <CreditCard className="w-5 h-5 text-white" />
                            <span>{isPayingNow ? 'REDIRECTING...' : 'BUY NOW'}</span>
                        </motion.button>
                    ) : null
                }
            />
            <div className="h-20 lg:h-24"></div>
            <FloatingStickyBadge 
                scrollToForm={scrollToForm} 
                onScholarshipClick={() => {
                    setPopupShowPercentage(true);
                    setIsRegistrationPopupOpen(true);
                }}
            />

            {/* Main Content Boxed Wrapper */}
            <div className="2xl:max-w-7xl mx-auto bg-white shadow-2xl relative">

                {/* Hero Section - Carousel */}
                <section id="home" className="relative pt-0 overflow-hidden">
                    <div className="relative w-full">
                        <div className="relative overflow-hidden w-full">
                            <div className="flex transition-transform duration-700 ease-in-out h-full"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                {banners.map((banner, index) => (
                                    <div key={index} className="min-w-full">
                                        <img
                                            src={banner.src}
                                            alt={banner.alt}
                                            className="w-full h-auto block"
                                        />
                                    </div>
                                ))}
                            </div>

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
                        {isLeadCaptured ? (
                            <div className="py-20 text-center">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-500/10">
                                    <CheckCircle className="w-14 h-14 text-green-500" />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                                    Thank <span className="text-[#FF9F00]">You!</span>
                                </h2>
                                <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
                                    Our expert team will contact you soon to guide you through your {config.title} Board Exam preparation.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full">
                                <div className="max-w-5xl mx-auto">
                                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center leading-tight">
                                        {config.title} <span className="text-[#FF9F00]">{config.highlight}</span>
                                    </h2>
                                    <p className="text-center text-gray-300 text-sm md:text-base max-w-2xl mx-auto mb-10">
                                        {config.subHeading}
                                    </p>
                                </div>

                                <div className="max-w-4xl mx-auto">
                                    <form onSubmit={handleSubmit} className="space-y-3">
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                                                    <option value="10">Class 10</option>
                                                    <option value="12">Class 12</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <label className="block text-sm font-bold">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your city"
                                                    required
                                                    className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-black font-black text-base md:text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT ENQUIRY'}
                                            </button>

                                            {isVersionTwo && (
                                                <button
                                                    type="button"
                                                    onClick={handleICICIPayNow}
                                                    disabled={isPayingNow}
                                                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-base md:text-lg rounded-xl shadow-xl hover:shadow-green-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2 border border-green-400 cursor-pointer disabled:opacity-50"
                                                >
                                                    <CreditCard className="w-5 h-5 text-white" />
                                                    {isPayingNow ? 'OPENING GATEWAY...' : 'BUY NOW'}
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden md:block absolute right-0 bottom-0 z-0 pointer-events-none">
                        <img
                            src="/images/Form Boy.webp"
                            alt="Pathfinder Student"
                            className="w-56 lg:w-[280px] h-auto object-contain block"
                        />
                    </div>
                </section>

                {/* Why Choose Pathfinder Mock Test Section */}
                <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Pathfinder Mock Test?</span>
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-10">
                            {[
                                { image: "/WHY PATH IMAGES/Top faculty.webp", label: "Board Exam Pattern" },
                                { image: "/WHY PATH IMAGES/pathtex app.webp", label: "Pathtex Test App" },
                                { image: "/WHY PATH IMAGES/Soft skills.webp", label: "Detailed Answer Analysis" },
                                { image: "/WHY PATH IMAGES/mental-health.webp", label: "Exam Time Management" },
                                { image: "/WHY PATH IMAGES/AI.webp", label: "AI Score Analytics" },
                                { image: "/WHY PATH IMAGES/Robotics.webp", label: "State & All India Ranking" }
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-white rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                >
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

                {/* Related Programs Section */}
                <section className="py-20 bg-white relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                                Related <span className="text-orange-500">{config.title} Mock Test Programs</span>
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Specialized mock test programs designed to help Class 10 & Class 12 students score 95%+ in Board Exams.
                            </p>
                        </div>

                        {!isLeadCaptured ? (
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-2xl md:rounded-[3rem] z-20 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 border-2 border-dashed border-orange-200 shadow-2xl shadow-orange-500/5 text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-orange-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-6 animate-bounce">
                                        <Lock className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">View All {config.title} Mock Test Programs</h3>
                                    <p className="text-gray-600 text-center mb-4 sm:mb-6 md:mb-8 max-w-md font-medium text-xs sm:text-sm md:text-base">
                                        To view our complete list of Classroom and Digital test series, please complete your registration.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setPopupShowPercentage(false);
                                            setIsRegistrationPopupOpen(true);
                                        }}
                                        className="px-5 py-3 sm:px-8 sm:py-3.5 md:px-10 md:py-4 bg-orange-600 text-white rounded-xl md:rounded-2xl font-black text-xs sm:text-sm md:text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center gap-2 md:gap-3"
                                    >
                                        Unlock Program List
                                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                    </button>
                                </div>

                                <div className="filter blur-md pointer-events-none opacity-40 select-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className={`${n > 1 ? 'hidden md:block' : ''} bg-white rounded-3xl p-6 border border-gray-200 shadow-sm`}>
                                            <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4"></div>
                                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {allCourses.slice(0, 6).map((course, idx) => (
                                    <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                                        <div>
                                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 font-bold text-xs rounded-full mb-3">
                                                {course.class_level ? `Class ${course.class_level}` : "Class 10 / 12"}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name || course.course_title}</h3>
                                            <p className="text-gray-600 text-sm line-clamp-3 mb-6">{course.short_description || "Comprehensive mock test series matching the latest Board pattern."}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                setIsModalOpen(true);
                                            }}
                                            className="w-full py-3 bg-gray-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

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
                </section>

                <Footer />

                {/* Success Modal */}
                {showSuccess && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl transform animate-in zoom-in-95 duration-300">
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

                            <div className="p-6 text-center space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Congratulations! We've received your registration for {config.title} Mock Test Program. Our team will contact you shortly.
                                </p>

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
            </div>
            <RegistrationPopup 
                isOpen={isRegistrationPopupOpen} 
                onClose={() => setIsRegistrationPopupOpen(false)} 
                pageSource={config.pageSource}
                showPercentage={popupShowPercentage}
                classOptions={["Class 10", "Class 12"]}
                hideCourseType={true}
            />

            {/* Awaiting Payment Blurred Modal */}
            {isAwaitingPaymentModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-orange-100 transform animate-in zoom-in-95 duration-300 space-y-6">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600 relative">
                            <CreditCard className="w-10 h-10" />
                            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900">Awaiting Payment...</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                We have opened the secure ICICI Payment Gateway in a new tab. Please complete your transaction of <span className="font-extrabold text-orange-600">₹10.00</span> there.
                            </p>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-xs text-orange-800 font-medium">
                            🔒 Once completed, you will be redirected to download your receipt and view nearest branches.
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setIsAwaitingPaymentModal(false)}
                                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                Cancel & Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
