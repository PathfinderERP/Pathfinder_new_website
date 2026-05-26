import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, MapPinIcon } from "@heroicons/react/24/outline";
import ReCAPTCHA from "react-google-recaptcha";
import { centresAPI } from "../../services/api";

/**
 * Shared Contact Form Card — identical to the form on the /contact page.
 * Can be embedded in any page (e.g. CustomPageRenderer, landing pages).
 */
export default function ContactFormCard() {
    const [centres, setCentres] = useState([]);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        contact_number: "",
        email: "",
        student_class: "",
        course: "",
        center_name: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [showMessage, setShowMessage] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    useEffect(() => {
        centresAPI.getAll()
            .then((res) => {
                const raw = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setCentres(raw);
            })
            .catch(console.error);
    }, []);

    const onCaptchaChange = (token) => setCaptchaToken(token);

    const validate = () => {
        const newErrors = {};
        if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
        if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.match(emailRegex)) newErrors.email = "Please enter a valid email address";
        const phoneRegex = /^\d{10}$/;
        if (!formData.contact_number.match(phoneRegex)) newErrors.contact_number = "Please enter a valid 10-digit number";
        if (!formData.course) newErrors.course = "Please select a course";
        if (!formData.student_class) newErrors.student_class = "Please select your class";
        if (!formData.center_name) newErrors.center_name = "Please select a centre";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        const fieldMapping = {
            fname: "first_name",
            lname: "last_name",
            contactno: "contact_number",
            emailid: "email",
            student_class: "student_class",
            course: "course",
            centername: "center_name",
            floatingTextarea2: "message",
        };
        const backendField = fieldMapping[id] || id;
        if (id === "contactno" && value !== "" && !/^\d*$/.test(value)) return;
        if (id === "contactno" && value.length > 10) return;
        setFormData((prev) => ({ ...prev, [backendField]: value }));
        if (errors[backendField]) setErrors((prev) => ({ ...prev, [backendField]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (!captchaToken) {
            setSubmitMessage("Please complete the reCAPTCHA.");
            setShowMessage(true);
            return;
        }
        setIsSubmitting(true);
        setSubmitMessage("");
        setErrors({});
        setShowMessage(false);
        try {
            const response = await fetch(`${API_BASE_URL}/api/contact/submit/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, captcha_token: captchaToken }),
            });
            const result = await response.json();
            if (result.success) {
                setSubmitMessage(result.message);
                setShowMessage(true);
                setFormData({ first_name: "", last_name: "", contact_number: "", email: "", student_class: "", course: "", center_name: "", message: "" });
                setCaptchaToken(null);
                if (window.grecaptcha) window.grecaptcha.reset();
            } else {
                if (result.field_errors) {
                    setErrors(result.field_errors);
                    setSubmitMessage("Please correct the errors below.");
                } else {
                    setSubmitMessage(result.error || "Something went wrong. Please try again.");
                }
                setShowMessage(true);
            }
        } catch (error) {
            setSubmitMessage(`Network error: ${error.message}. Please check your connection and try again.`);
            setShowMessage(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!showMessage || !submitMessage) return;
        const timer = setTimeout(() => {
            setShowMessage(false);
            setTimeout(() => setSubmitMessage(""), 300);
        }, 5000);
        return () => clearTimeout(timer);
    }, [showMessage, submitMessage]);

    const handleCloseMessage = () => {
        setShowMessage(false);
        setTimeout(() => setSubmitMessage(""), 300);
    };

    const isSuccess = submitMessage.includes("success") || submitMessage.includes("Thank");

    return (
        <>
            {/* The exact same card UI as /contact page */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                {/* Orange Header */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-5 md:p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                    <div className="relative z-10">
                        <h2 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">
                            Get in <span className="text-orange-200">Touch</span>
                        </h2>
                        <p className="text-white/80 text-sm font-medium">Have a question? We're here to help.</p>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-5 md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            {/* First Name */}
                            <div className="space-y-2">
                                <label htmlFor="fname" className="text-sm font-bold text-slate-700 ml-1">
                                    First Name <span className="text-orange-500">*</span>
                                </label>
                                <input
                                    type="text" id="fname"
                                    value={formData.first_name} onChange={handleChange} required
                                    className={`w-full px-3 py-2.5 rounded-lg border ${errors.first_name ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                    placeholder="Enter your first name"
                                />
                                {errors.first_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.first_name}</p>}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <label htmlFor="lname" className="text-sm font-bold text-slate-700 ml-1">
                                    Last Name <span className="text-orange-500">*</span>
                                </label>
                                <input
                                    type="text" id="lname"
                                    value={formData.last_name} onChange={handleChange} required
                                    className={`w-full px-3 py-2.5 rounded-lg border ${errors.last_name ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                    placeholder="Enter your last name"
                                />
                                {errors.last_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.last_name}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label htmlFor="contactno" className="text-sm font-bold text-slate-700 ml-1">
                                    Contact Number <span className="text-orange-500">*</span>
                                </label>
                                <input
                                    type="tel" id="contactno"
                                    value={formData.contact_number} onChange={handleChange} required
                                    className={`w-full px-3 py-2.5 rounded-lg border ${errors.contact_number ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                    placeholder="Enter 10-digit number"
                                />
                                {errors.contact_number && <p className="text-red-500 text-xs font-bold ml-1">{errors.contact_number}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="emailid" className="text-sm font-bold text-slate-700 ml-1">
                                    Email Address <span className="text-orange-500">*</span>
                                </label>
                                <input
                                    type="email" id="emailid"
                                    value={formData.email} onChange={handleChange} required
                                    className={`w-full px-3 py-2.5 rounded-lg border ${errors.email ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs font-bold ml-1">{errors.email}</p>}
                            </div>

                            {/* Class */}
                            <div className="space-y-2">
                                <label htmlFor="student_class" className="text-sm font-bold text-slate-700 ml-1">
                                    Select Class <span className="text-orange-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="student_class"
                                        value={formData.student_class} onChange={handleChange} required
                                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.student_class ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium appearance-none text-sm`}
                                    >
                                        <option value="">Select your class</option>
                                        <option value="Class 7">Class 7</option>
                                        <option value="Class 8">Class 8</option>
                                        <option value="Class 9">Class 9</option>
                                        <option value="Class 10">Class 10</option>
                                        <option value="Class 11">Class 11</option>
                                        <option value="Class 12">Class 12</option>
                                        <option value="Passout">Passout/Dropper</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                                {errors.student_class && <p className="text-red-500 text-xs font-bold ml-1">{errors.student_class}</p>}
                            </div>

                            {/* Course */}
                            <div className="space-y-2">
                                <label htmlFor="course" className="text-sm font-bold text-slate-700 ml-1">
                                    Select Course <span className="text-orange-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="course"
                                        value={formData.course} onChange={handleChange} required
                                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.course ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium appearance-none text-sm`}
                                    >
                                        <option value="">Select a course</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Foundation">Foundation</option>
                                        <option value="Medical">Medical</option>
                                        <option value="NCRP">NCRP</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                                {errors.course && <p className="text-red-500 text-xs font-bold ml-1">{errors.course}</p>}
                            </div>

                            {/* Centre Name — full width */}
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="centername" className="text-sm font-bold text-slate-700 ml-1">
                                    Centre Name <span className="text-orange-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="centername"
                                        value={formData.center_name} onChange={handleChange} required
                                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.center_name ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium appearance-none text-sm`}
                                    >
                                        <option value="">Select a centre</option>
                                        {centres.map((c) => (
                                            <option key={c.id || c._id} value={c.centre}>{c.centre}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                                {errors.center_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.center_name}</p>}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label htmlFor="floatingTextarea2" className="text-sm font-bold text-slate-700 ml-1">
                                Your Message
                            </label>
                            <textarea
                                id="floatingTextarea2" rows="2"
                                value={formData.message} onChange={handleChange}
                                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium resize-none text-sm"
                                placeholder="Tell us how we can help..."
                            />
                        </div>

                        {/* Consent */}
                        <p className="text-[10px] text-slate-500 font-bold mb-1 ml-1 leading-tight italic">
                            I Authorize Pathfinder Educational Centre to send notifications via SMS / RCS / Call / Email / Whatsapp
                        </p>

                        {/* reCAPTCHA */}
                        <div className="flex justify-center md:justify-start py-2">
                            <ReCAPTCHA
                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdGdd8sAAAAAGnXDx7IDnHOiOWDtF9yQ4pVvwYD"}
                                onChange={onCaptchaChange}
                            />
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-lg shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 transition-all duration-300 disabled:opacity-50 text-base tracking-tight"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Sending...</span>
                                </div>
                            ) : "Send Message"}
                        </motion.button>
                    </form>
                </div>
            </div>

            {/* Toast notification */}
            <AnimatePresence>
                {showMessage && submitMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-l-4 ${isSuccess ? "bg-white border-green-500 text-slate-900" : "bg-white border-red-500 text-slate-900"}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                            {isSuccess ? <MapPinIcon className="w-6 h-6" /> : <div className="font-bold">!</div>}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 leading-tight">{isSuccess ? "Message Sent!" : "Error"}</p>
                            <p className="text-sm font-medium text-slate-500">{submitMessage}</p>
                        </div>
                        <button onClick={handleCloseMessage} className="ml-4 text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
