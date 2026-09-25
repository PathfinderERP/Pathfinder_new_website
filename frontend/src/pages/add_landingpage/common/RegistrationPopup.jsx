import React, { useState, useEffect } from "react";
import { X, MapPin, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { landingAPI, centresAPI } from "../../../services/api";
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

const RegistrationPopup = ({ isOpen, onClose, pageSource, showPercentage = false, classOptions = null, hideCourseType = false }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [centres, setCentres] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        student_class: "",
        course_type: hideCourseType ? "Mock Test Program" : "",
        city: "",
        centre: "",
        last_exam_percentage: "",
        page_source: pageSource || "Landing Page"
    });

    useEffect(() => {
        const fetchCentres = async () => {
            try {
                const response = await centresAPI.getAll();
                const centresData = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.results || []);
                setCentres(centresData);
            } catch (error) {
                console.error("Error fetching centres:", error);
            }
        };
        if (isOpen) {
            fetchCentres();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

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

    const handleDetectLocation = async () => {
        setIsDetecting(true);
        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
                        );
                        const data = await response.json();
                        const city = data.address.city || data.address.town || data.address.suburb;

                        if (city) {
                            setFormData(prev => ({ ...prev, city: city }));
                            const nearestCentre = centres.find(c =>
                                c.centre.toLowerCase().includes(city.toLowerCase()) ||
                                city.toLowerCase().includes(c.centre.toLowerCase())
                            );
                            if (nearestCentre) {
                                setFormData(prev => ({ ...prev, centre: nearestCentre.centre }));
                                toast.success(`Found nearest centre: ${nearestCentre.centre}`);
                            } else {
                                toast.info("City detected. Please select your nearest centre.");
                            }
                        }
                    } catch (err) {
                        console.error("Location detection error:", err);
                    }
                    setIsDetecting(false);
                }, (error) => {
                    console.error("Geolocation error:", error);
                    setIsDetecting(false);
                    toast.error("Location access denied.");
                });
            }
        } catch (error) {
            setIsDetecting(false);
        }
    };

    const triggerCelebration = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            toast.error("Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.");
            return;
        }
        if (!formData.centre) {
            toast.error("Please select a centre.");
            return;
        }
        setIsSubmitting(true);
        try {
            const submitData = { 
                ...formData,
                centre: formData.centre,
                city: formData.city || formData.centre
            };
            if (!showPercentage) {
                delete submitData.last_exam_percentage;
            }
            const response = await landingAPI.register(submitData);
            if (response.data.success) {
                setShowSuccess(true);
                triggerCelebration();
                localStorage.setItem('pathfinder_lead_captured', 'true');
                window.dispatchEvent(new Event('storage'));
                // Don't reload immediately, let the user see the success message
                setTimeout(() => {
                    onClose();
                    window.location.reload(); 
                }, 5000);
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl bg-black border border-white/20 rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

                        <div className="relative z-10 p-8 md:p-10">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {showSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-10"
                                >
                                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-green-500/10">
                                        <CheckCircle className="w-14 h-14 text-green-500" />
                                    </div>
                                    <h2 className="text-4xl font-black text-white mb-4">
                                        Thank <span className="text-[#FF9F00]">You!</span>
                                    </h2>
                                    <p className="text-gray-300 text-xl font-medium mb-6">
                                        Registration Successful
                                    </p>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                                        <p className="text-gray-400 leading-relaxed">
                                            Our expert team will contact you soon to guide you through the next steps and scholarship process.
                                        </p>
                                    </div>
                                    <p className="text-gray-500 text-sm animate-pulse">
                                        Unlocking content in a few seconds...
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            Unlock Your <span className="text-[#FF9F00]">Success</span>
                                        </h2>
                                        <p className="text-gray-400">Complete your registration to access premium content</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter full name"
                                            required
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="10-digit mobile number"
                                            required
                                            maxLength={10}
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className={`grid grid-cols-1 ${hideCourseType ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Class</label>
                                        <select
                                            name="student_class"
                                            value={formData.student_class}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] appearance-none"
                                        >
                                            <option value="" className="bg-black">Select Class</option>
                                            {(classOptions || ["11", "12", "12 Passout"]).map((cls, idx) => (
                                                <option key={idx} value={cls} className="bg-black">
                                                    {cls.startsWith("Class") ? cls : `Class ${cls}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {!hideCourseType && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Course Type</label>
                                            <select
                                                name="course_type"
                                                value={formData.course_type}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] appearance-none"
                                            >
                                                <option value="" className="bg-black">Select Program</option>
                                                <option value="Online Program" className="bg-black">Online Program</option>
                                                <option value="Offline Program" className="bg-black">Offline Program</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Enter your city"
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Centre *</label>
                                        <select
                                            name="centre"
                                            value={formData.centre}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] appearance-none"
                                        >
                                            <option value="" className="bg-black">Select Centre *</option>
                                            {centres.map((c, idx) => (
                                                <option key={idx} value={c.centre || c.name} className="bg-black">
                                                    {c.centre || c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                    {showPercentage && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Exam (%)</label>
                                            <input
                                                type="text"
                                                name="last_exam_percentage"
                                                value={formData.last_exam_percentage}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 85%"
                                                required={showPercentage}
                                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all"
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Register & Unlock Now'}
                                </button>

                                <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-xs font-medium">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    Your data is 100% secure with us
                                </div>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);
};

export default RegistrationPopup;
