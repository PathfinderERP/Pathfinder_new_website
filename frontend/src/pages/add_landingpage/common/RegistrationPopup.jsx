import React, { useState, useEffect } from "react";
import { X, MapPin, ChevronRight, CheckCircle, Mail, KeyRound, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { landingAPI, centresAPI } from "../../../services/api";
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

const RegistrationPopup = ({ isOpen, onClose, pageSource, showPercentage = false, classOptions = null, hideCourseType = false }) => {
    const [step, setStep] = useState("form"); // "form" | "otp"
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [centres, setCentres] = useState([]);
    const [otp, setOtp] = useState("");
    const [resendCountdown, setResendCountdown] = useState(60);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        student_class: "",
        course_type: hideCourseType ? "Mock Test Program" : "",
        city: "",
        centre: "",
        last_exam_percentage: "",
        page_source: pageSource || "Landing Page"
    });

    // Reset step when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep("form");
            setOtp("");
            setShowSuccess(false);
            setResendCountdown(60);
        }
    }, [isOpen]);

    // Resend countdown timer
    useEffect(() => {
        let interval = null;
        if (step === "otp" && resendCountdown > 0) {
            interval = setInterval(() => {
                setResendCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, resendCountdown]);

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
                                (c.centre || c.name || "").toLowerCase().includes(city.toLowerCase()) ||
                                city.toLowerCase().includes((c.centre || c.name || "").toLowerCase())
                            );
                            if (nearestCentre) {
                                setFormData(prev => ({ ...prev, centre: nearestCentre.centre || nearestCentre.name }));
                                toast.success(`Found nearest centre: ${nearestCentre.centre || nearestCentre.name}`);
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

    // Step 1: Submit Details -> Send OTP -> Move to OTP Step
    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            toast.error("Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.");
            return;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (!formData.centre) {
            toast.error("Please select a centre.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await landingAPI.sendOTP({
                email: formData.email.trim().lower ? formData.email.trim().toLowerCase() : formData.email.trim(),
                name: formData.name.trim()
            });
            if (response.data.success) {
                toast.success(response.data.message || "Verification code sent to your email!");
                setStep("otp");
                setResendCountdown(60);
                setOtp("");
            } else {
                toast.error(response.data.message || "Failed to send verification code.");
            }
        } catch (error) {
            console.error("Send OTP error:", error);
            const msg = error.response?.data?.message || "Could not send verification code. Please check your email.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 2: Resend OTP
    const handleResendOTP = async () => {
        if (resendCountdown > 0 || isResending) return;
        setIsResending(true);
        try {
            const response = await landingAPI.sendOTP({
                email: formData.email.trim(),
                name: formData.name.trim()
            });
            if (response.data.success) {
                toast.success("New verification code sent! Check your inbox & spam folder.");
                setResendCountdown(60);
                setOtp("");
            } else {
                toast.error(response.data.message || "Failed to resend code.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend code.");
        } finally {
            setIsResending(false);
        }
    };

    // Step 3: Verify OTP -> Complete Registration
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        const cleanOtp = otp.trim();
        if (cleanOtp.length !== 6) {
            toast.error("Please enter the complete 6-digit verification code.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Verify OTP
            const verifyRes = await landingAPI.verifyOTP({
                email: formData.email.trim(),
                otp: cleanOtp
            });

            if (!verifyRes.data.success) {
                toast.error(verifyRes.data.message || "Invalid verification code.");
                setIsSubmitting(false);
                return;
            }

            // 2. Submit Final Registration
            const submitData = { 
                ...formData,
                email: formData.email.trim(),
                otp: cleanOtp,
                centre: formData.centre,
                city: formData.city || formData.centre
            };
            if (!showPercentage) {
                delete submitData.last_exam_percentage;
            }

            const regResponse = await landingAPI.register(submitData);
            if (regResponse.data.success) {
                setShowSuccess(true);
                triggerCelebration();
                localStorage.setItem('pathfinder_lead_captured', 'true');
                window.dispatchEvent(new Event('storage'));

                setTimeout(() => {
                    onClose();
                    window.location.reload(); 
                }, 5000);
            } else {
                toast.error(regResponse.data.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Verification & Registration error:", error);
            toast.error(error.response?.data?.message || "Verification failed. Please check the code and try again.");
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
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

                        <div className="relative z-10 p-8 md:p-10">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* SUCCESS STATE */}
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
                                        Registration & Email Verified
                                    </p>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                                        <p className="text-gray-400 leading-relaxed">
                                            Your email <strong className="text-white">{formData.email}</strong> is confirmed. Our academic team will contact you shortly at <strong className="text-white">{formData.phone}</strong>.
                                        </p>
                                    </div>
                                    <p className="text-gray-500 text-sm animate-pulse">
                                        Unlocking content in a few seconds...
                                    </p>
                                </motion.div>
                            ) : step === "otp" ? (
                                /* STEP 2: OTP VERIFICATION BOX */
                                <motion.div
                                    key="otp-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="py-2"
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                                            <KeyRound className="w-7 h-7 text-white" />
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                                            Verify Your <span className="text-[#FF9F00]">Email</span>
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            Enter the 6-digit code sent to your email to complete registration
                                        </p>
                                    </div>

                                    {/* Email Confirmation Pill with Change Option */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl mb-6">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <Mail className="w-4 h-4 text-[#FF9F00] shrink-0" />
                                            <span className="text-white text-sm font-semibold truncate">{formData.email}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep("form")}
                                            className="text-xs font-bold text-[#FF9F00] hover:text-orange-300 underline underline-offset-2 ml-3 shrink-0 flex items-center gap-1 transition-colors"
                                        >
                                            <ArrowLeft className="w-3 h-3" />
                                            Change Email
                                        </button>
                                    </div>

                                    <form onSubmit={handleVerifyAndRegister} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block text-center">
                                                Enter 6-Digit Code
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                placeholder="• • • • • •"
                                                required
                                                autoFocus
                                                className="w-full text-center text-3xl font-black tracking-[12px] px-5 py-4 bg-white/10 border-2 border-white/20 text-white rounded-xl outline-none focus:border-[#FF9F00] focus:ring-4 focus:ring-orange-500/20 transition-all font-mono"
                                            />
                                        </div>

                                        {/* Resend Timer & Action */}
                                        <div className="flex items-center justify-between text-xs px-1 text-gray-400">
                                            <span>Didn't receive the email?</span>
                                            {resendCountdown > 0 ? (
                                                <span className="text-gray-400">
                                                    Resend in <strong className="text-[#FF9F00] font-mono">{resendCountdown}s</strong>
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isResending}
                                                    onClick={handleResendOTP}
                                                    className="text-[#FF9F00] hover:text-orange-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                                                >
                                                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                                                    {isResending ? "Sending..." : "Resend Code"}
                                                </button>
                                            )}
                                        </div>

                                        {/* SPAM / JUNK FOLDER PROMINENT CALLOUT */}
                                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-2.5 text-left">
                                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-[12px] text-amber-200/90 leading-relaxed">
                                                <strong>Check Junk & Spam Folder:</strong> If you don't find the email in your main inbox, please inspect your <strong>Spam</strong> or <strong>Junk</strong> folder.
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || otp.trim().length !== 6}
                                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-base md:text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Verifying & Registering...' : 'Verify & Complete Registration'}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                /* STEP 1: INITIAL DETAILS FORM */
                                <>
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1.5">
                                            Unlock Your <span className="text-[#FF9F00]">Success</span>
                                        </h2>
                                        <p className="text-gray-400 text-sm">Fill in your details to begin registration</p>
                                    </div>

                                    <form onSubmit={handleInitialSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Name *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter full name"
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="10-digit mobile number"
                                                    required
                                                    maxLength={10}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Email Input Field */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                                <span>Email Address *</span>
                                                <span className="text-[11px] text-[#FF9F00] font-normal lowercase">(OTP will be sent here)</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="e.g. student@gmail.com"
                                                required
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all text-sm"
                                            />
                                        </div>

                                        <div className={`grid grid-cols-1 ${hideCourseType ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-3.5`}>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Class *</label>
                                                <select
                                                    name="student_class"
                                                    value={formData.student_class}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] appearance-none text-sm"
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
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Program Type *</label>
                                                    <select
                                                        name="course_type"
                                                        value={formData.course_type}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] appearance-none text-sm"
                                                    >
                                                        <option value="" className="bg-black">Select Program</option>
                                                        <option value="Online Program" className="bg-black">Online Program</option>
                                                        <option value="Offline Program" className="bg-black">Offline Program</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your city"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nearest Centre *</label>
                                                <select
                                                    name="centre"
                                                    value={formData.centre}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] appearance-none text-sm"
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
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Exam (%)</label>
                                                <input
                                                    type="text"
                                                    name="last_exam_percentage"
                                                    value={formData.last_exam_percentage}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. 85%"
                                                    required={showPercentage}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#FF9F00] transition-all text-sm"
                                                />
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 mt-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-base md:text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Sending Verification Code...' : 'Proceed to Email Verification'}
                                        </button>

                                        <div className="flex items-center justify-center gap-2 mt-3 text-gray-500 text-xs font-medium">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                            <span>Your contact info is 100% verified & secure</span>
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
