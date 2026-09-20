import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, X, CheckCircle, ChevronLeft, ChevronRight, GraduationCap, Award } from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import RegistrationPopup from '../common/RegistrationPopup';
import { landingAPI, centresAPI, coursesAPI } from "../../../services/api";
import { useCachedData } from "../../../hooks/useCachedData";
import CourseDetailModal from "../../../components/CourseDetailModal";

const FloatingStickyBadge = ({ scrollToForm, onScholarshipClick }) => {
    const [studentCount, setStudentCount] = useState(3820);

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
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">PMO 2026-27</span>
                        <span className="text-sm font-black whitespace-nowrap">REGISTER NOW</span>
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
                    <span className="text-[9px] font-bold text-gray-500 uppercase">CASH PRIZE & SCHOLARSHIP</span>
                    <span className="text-xs font-black">UP TO ₹25 CRORE</span>
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
                    LIMITED SEATS AVAILABLE
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
                            {studentCount}+ REGISTERED
                        </motion.span>
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
};

export const PmoLandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [centres, setCentres] = useState([]);
    const [isLeadCaptured, setIsLeadCaptured] = useState(() => {
        return localStorage.getItem('pathfinder_lead_captured_pmo') === 'true';
    });
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegistrationPopupOpen, setIsRegistrationPopupOpen] = useState(false);
    const [popupShowPercentage, setPopupShowPercentage] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        student_class: '',
        course_type: 'PMO Olympiad',
        centre: '',
        page_source: 'PMO Olympiad'
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
        return dataArray.filter(c => {
            const name = (c.name || '').toLowerCase();
            const target = (c.target_exam || '').toLowerCase();
            const cat = (c.category?.name || '').toLowerCase();
            return name.includes('olympiad') || target.includes('olympiad') || cat.includes('olympiad') || name.includes('pmo') || name.includes('foundation');
        });
    }, [coursesDataRaw]);

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
                    if (url) {
                        const latMatch = url.match(/!3d\s*([-0-9.]+)/);
                        const lngMatch = url.match(/!2d\s*([-0-9.]+)/);
                        if (latMatch && lngMatch) {
                            const lat2 = parseFloat(latMatch[1]);
                            const lon2 = parseFloat(lngMatch[1]);
                            const R = 6371;
                            const dLat = (lat2 - userLat) * (Math.PI / 180);
                            const dLon = (lon2 - userLng) * (Math.PI / 180);
                            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos(userLat * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                                Math.sin(dLon / 2) * Math.sin(dLon / 2);
                            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            if (dist < minDistance) {
                                minDistance = dist;
                                nearestCentre = centre;
                            }
                        }
                    }
                });

                if (nearestCentre) {
                    setFormData(prev => ({
                        ...prev,
                        centre: nearestCentre.centre || nearestCentre.name
                    }));
                } else {
                    alert("Could not detect nearest centre.");
                }
                setIsDetecting(false);
            },
            () => {
                alert("Unable to retrieve your location.");
                setIsDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
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
            alert("Please fill in required fields (Name, Phone)");
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                centre: formData.city || formData.centre,
                city: formData.city,
            };
            const response = await landingAPI.register(submitData);
            if (response.data.success) {
                setShowSuccess(true);
                localStorage.setItem('pathfinder_lead_captured_pmo', 'true');
                setIsLeadCaptured(true);
                setFormData({
                    name: '',
                    phone: '',
                    student_class: '',
                    course_type: 'PMO Olympiad',
                    city: '',
                    centre: '',
                    page_source: 'PMO Olympiad'
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
            src: "/WHY PATH IMAGES/PMO BANNER.webp",
            alt: "Pathfinder Mathematics Olympiad (PMO) Banner"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
            <Header />
            <FloatingStickyBadge 
                scrollToForm={scrollToForm} 
                onScholarshipClick={() => {
                    setPopupShowPercentage(true);
                    setIsRegistrationPopupOpen(true);
                }}
            />

            {/* Main Content Boxed Wrapper */}
            <div className="2xl:max-w-7xl mx-auto bg-white shadow-2xl relative">

                {/* Hero Section - Banner */}
                <section id="home" className="relative pt-8 md:pt-12 overflow-hidden">
                    <div className="relative w-full">
                        <div className="relative overflow-hidden aspect-[16/7] md:aspect-[16/5.5]">
                            <div className="flex transition-transform duration-700 ease-in-out h-full">
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
                        </div>
                    </div>
                </section>

                {/* Registration Section */}
                <section id="landing-registration-form" className="bg-black text-white pt-12 md:pt-18 pb-12 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        {isLeadCaptured ? (
                            <div className="py-20 text-center">
                                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-500/10">
                                    <CheckCircle className="w-14 h-14 text-green-500" />
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                                    Registration <span className="text-[#FF9F00]">Successful!</span>
                                </h2>
                                <p className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
                                    Thank you for registering for Pathfinder Mathematics Olympiad (PMO). Our team will contact you shortly.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full">
                                <div className="max-w-5xl mx-auto text-center mb-8">
                                    <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
                                        Pathfinder Mathematics Olympiad <span className="text-[#FF9F00]">(PMO)</span>
                                    </h2>
                                    <p className="text-lg md:text-xl text-gray-300 font-semibold">
                                        Dominate the Test. Grab the Prize. Become a Legend. | Class 5 to 10
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        <span className="bg-orange-500 text-black px-4 py-1.5 rounded-full font-bold text-sm">
                                            ₹10 LACS CASH PRIZE
                                        </span>
                                        <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-4 py-1.5 rounded-full font-bold text-sm">
                                            SCHOLARSHIP UP TO ₹25 CRORE
                                        </span>
                                    </div>
                                </div>

                                <div className="max-w-4xl mx-auto">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold">Your Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Student Name"
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
                                                <label className="block text-sm font-bold">Your Class (5 to 10)</label>
                                                <select
                                                    name="student_class"
                                                    value={formData.student_class}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                    required
                                                >
                                                    <option value="">Select Class</option>
                                                    <option value="5">Class 5</option>
                                                    <option value="6">Class 6</option>
                                                    <option value="7">Class 7</option>
                                                    <option value="8">Class 8</option>
                                                    <option value="9">Class 9</option>
                                                    <option value="10">Class 10</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-bold">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your city"
                                                    className="w-full px-5 py-4 bg-white text-black rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-center pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className={`px-12 py-4 bg-orange-500 hover:bg-orange-600 text-black font-black text-lg rounded-xl transition-all transform hover:scale-105 shadow-xl ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isSubmitting ? 'SUBMITTING...' : 'REGISTER FOR PMO NOW'}
                                            </button>
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
                            className="w-56 lg:w-[280px] h-auto object-contain block opacity-90"
                        />
                    </div>
                </section>

                {/* Why Choose Pathfinder Section */}
                <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                                Why Participate in <span className="text-orange-500">PMO Olympiad?</span>
                            </h2>
                            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-10">
                            {[
                                { image: "/WHY PATH IMAGES/Top faculty.webp", label: "National Level Benchmark" },
                                { image: "/WHY PATH IMAGES/pathtex app.webp", label: "₹10 Lacs Cash Prizes" },
                                { image: "/WHY PATH IMAGES/Soft skills.webp", label: "Scholarships up to 100%" },
                                { image: "/WHY PATH IMAGES/mental-health.webp", label: "Mental Ability Training" },
                                { image: "/WHY PATH IMAGES/AI.webp", label: "AI Analytical Report" },
                                { image: "/WHY PATH IMAGES/Robotics.webp", label: "Olympiad Level Rigor" }
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-white rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    <div className="relative flex flex-col items-center text-center">
                                        <div className="w-28 h-28 md:w-32 md:h-32 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                            <img
                                                src={feature.image}
                                                alt={feature.label}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
                                            {feature.label}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Toppers Image Section */}
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
                                    Congratulations! Your registration for Pathfinder Mathematics Olympiad (PMO) is received. Our team will contact you shortly.
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
                pageSource="PMO Olympiad"
                showPercentage={popupShowPercentage}
                classOptions={["Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"]}
            />
        </div>
    );
};
