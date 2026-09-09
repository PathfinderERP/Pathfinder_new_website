import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { centresAPI } from "../../services/api";
import env from "../../config/env";

/**
 * Shared Contact Form Card — identical to the form on the /contact page.
 * Can be embedded in any page (e.g. CustomPageRenderer, landing pages).
 */

export default function ContactFormCard({ slug, classOptions }) {
    const [centres, setCentres] = useState([]);

    const MOCK_TEST_SLUGS = [
        "cbse-mock-test-program",
        "icse-isc-mock-test-program",
        "madhyamik-mock-test-program"
    ];

    const EXAM_PROGRAMME_SLUGS = [
        "jee-wbjee-programme",
        "neet-programme"
    ];

    const isMockTestPage = MOCK_TEST_SLUGS.includes(slug);
    const isExamProgrammePage = EXAM_PROGRAMME_SLUGS.includes(slug);
    const isCustomFormPage = isMockTestPage || isExamProgrammePage;

    const SLUG_CLASS_OPTIONS = {
        "cbse-mock-test-program": ["Class 11", "Class 12"],
        "icse-isc-mock-test-program": ["Class 11", "Class 12"],
        "madhyamik-mock-test-program": ["Class 11", "Class 12"],
        "foundation-programme": ["Class 7", "Class 8", "Class 9", "Class 10"],
        "jee-wbjee-programme": ["Class 11", "Class 12", "Passout/Dropper"],
        "neet-programme": ["Class 11", "Class 12", "Passout/Dropper"],
        "mock-test-program": ["Class 10", "Class 11", "Class 12", "Passout/Dropper"],
        "key-to-success": ["Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Passout/Dropper"],
    };

    const availableClasses = classOptions || SLUG_CLASS_OPTIONS[slug] || [
        "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Passout/Dropper"
    ];

    const [formData, setFormData] = useState({
        full_name: "",
        first_name: "",
        last_name: "",
        contact_number: "",
        email: "",
        student_class: "",
        course: "",
        learning_mode: "", // "Online (at home)" or "Offline (at centre)"
        center_name: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [showMessage, setShowMessage] = useState(false);

    const API_BASE_URL = env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";

    useEffect(() => {
        centresAPI.getAll()
            .then((res) => {
                const raw = Array.isArray(res.data) ? res.data : (res.data?.results || []);
                setCentres(raw);
            })
            .catch(console.error);
    }, []);

    const validate = () => {
        const newErrors = {};
        if (isCustomFormPage) {
            if (!formData.full_name.trim()) newErrors.full_name = "Student full name is required";
        } else {
            if (!formData.first_name.trim()) newErrors.first_name = "First name is required";
            if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!formData.email.match(emailRegex)) newErrors.email = "Please enter a valid email address";
            if (!formData.course) newErrors.course = "Please select a course";
        }

        const phoneRegex = /^\d{10}$/;
        if (!formData.contact_number.match(phoneRegex)) newErrors.contact_number = "Please enter a valid 10-digit number";
        if (!formData.student_class) newErrors.student_class = "Please select your class";

        if (isExamProgrammePage) {
            if (!formData.learning_mode) newErrors.learning_mode = "Please select learning mode";
            if (formData.learning_mode === "Offline (at centre)" && !formData.center_name) {
                newErrors.center_name = "Please select a centre";
            }
        } else {
            if (!formData.center_name) newErrors.center_name = "Please select a centre";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        const fieldMapping = {
            fullname: "full_name",
            fname: "first_name",
            lname: "last_name",
            contactno: "contact_number",
            emailid: "email",
            student_class: "student_class",
            course: "course",
            learning_mode: "learning_mode",
            centername: "center_name",
            floatingTextarea2: "message",
        };
        const backendField = fieldMapping[id] || id;
        if (id === "contactno" && value !== "" && !/^\d*$/.test(value)) return;
        if (id === "contactno" && value.length > 10) return;
        setFormData((prev) => {
            const updated = { ...prev, [backendField]: value };
            if (backendField === "learning_mode" && value === "Online (at home)") {
                updated.center_name = "Online / Home Study";
            } else if (backendField === "learning_mode" && value === "Offline (at centre)" && prev.center_name === "Online / Home Study") {
                updated.center_name = "";
            }
            return updated;
        });
        if (errors[backendField]) setErrors((prev) => ({ ...prev, [backendField]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        setSubmitMessage("");
        setErrors({});
        setShowMessage(false);

        const payload = { ...formData };
        if (isCustomFormPage) {
            const nameParts = formData.full_name.trim().split(" ");
            payload.first_name = nameParts[0] || "";
            payload.last_name = nameParts.slice(1).join(" ") || nameParts[0] || "";
            payload.email = `${formData.contact_number}@${slug}.pathfinder.edu.in`;

            const hardcodedCourseName = slug === "jee-wbjee-programme" ? "JEE / WBJEE Programme"
                : slug === "neet-programme" ? "NEET Medical Programme"
                : slug ? slug.replace(/-/g, " ").toUpperCase() : "Special Program";

            payload.course = {
                id: slug || "special_program",
                name: hardcodedCourseName,
                goal: isExamProgrammePage ? "Exam Prep Registration" : "Mock Test Application",
                mode: formData.learning_mode || "Online/Offline",
                location: payload.center_name || "General",
                start: "Immediate",
                price: "N/A"
            };
            payload.message = `${hardcodedCourseName} Application (${formData.learning_mode || 'Default Mode'})`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact/submit/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.success) {
                setSubmitMessage(result.message);
                setShowMessage(true);
                setFormData({ full_name: "", first_name: "", last_name: "", contact_number: "", email: "", student_class: "", course: "", learning_mode: "", center_name: "", message: "" });
            } else {
                const apiErrors = result.errors || result.field_errors;
                if (apiErrors) {
                    const formatted = {};
                    const messagesList = [];
                    Object.keys(apiErrors).forEach(key => {
                        const val = apiErrors[key];
                        const msgText = Array.isArray(val) ? val.join(", ") : String(val);
                        formatted[key] = msgText;
                        messagesList.push(`${key}: ${msgText}`);
                    });
                    setErrors(formatted);
                    setSubmitMessage(messagesList.join(" | "));
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
            <div id="contact-form" className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                {/* Orange Header */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-5 md:p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                    <div className="relative z-10">
                        <h2 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">
                            {isExamProgrammePage ? (
                                <>Apply for <span className="text-orange-200">{slug === "neet-programme" ? "NEET" : "JEE / WBJEE"}</span></>
                            ) : isMockTestPage ? (
                                <>Apply for <span className="text-orange-200">Mock Test</span></>
                            ) : (
                                <>Get in <span className="text-orange-200">Touch</span></>
                            )}
                        </h2>
                        <p className="text-white/80 text-sm font-medium">
                            {isCustomFormPage ? "Fill out the details below to apply." : "Have a question? We're here to help."}
                        </p>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-5 md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            {isCustomFormPage ? (
                                /* Student Full Name */
                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="fullname" className="text-sm font-bold text-slate-700 ml-1">
                                        Student Full Name <span className="text-orange-500">*</span>
                                    </label>
                                    <input
                                        type="text" id="fullname"
                                        value={formData.full_name} onChange={handleChange} required
                                        className={`w-full px-3 py-2.5 rounded-lg border ${errors.full_name ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium text-sm`}
                                        placeholder="Enter student full name"
                                    />
                                    {errors.full_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.full_name}</p>}
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}

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

                            {/* Email - hidden for custom form pages */}
                            {!isCustomFormPage && (
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
                            )}

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
                                        {availableClasses.map((cls) => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                                {errors.student_class && <p className="text-red-500 text-xs font-bold ml-1">{errors.student_class}</p>}
                            </div>

                            {/* Learning Mode for JEE/NEET pages */}
                            {isExamProgrammePage && (
                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="learning_mode" className="text-sm font-bold text-slate-700 ml-1">
                                        Learning Mode <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="learning_mode"
                                            value={formData.learning_mode} onChange={handleChange} required
                                            className={`w-full px-3 py-2.5 rounded-lg border ${errors.learning_mode ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium appearance-none text-sm`}
                                        >
                                            <option value="">Select mode</option>
                                            <option value="Online (at home)">Online (at home)</option>
                                            <option value="Offline (at centre)">Offline (at centre)</option>
                                        </select>
                                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    {errors.learning_mode && <p className="text-red-500 text-xs font-bold ml-1">{errors.learning_mode}</p>}
                                </div>
                            )}

                            {/* Course - hidden for custom form pages */}
                            {!isCustomFormPage && (
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
                            )}

                            {/* Centre Name — full width (hidden if online is chosen) */}
                            {(!isExamProgrammePage || formData.learning_mode === "Offline (at centre)") && (
                                <div className="space-y-2 md:col-span-2">
                                    <label htmlFor="centername" className="text-sm font-bold text-slate-700 ml-1">
                                        {isCustomFormPage ? "Choose centre" : "Centre Name"} <span className="text-orange-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="centername"
                                            value={formData.center_name} onChange={handleChange} required
                                            className={`w-full px-3 py-2.5 rounded-lg border ${errors.center_name ? "border-red-500" : "border-slate-200"} focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 font-medium appearance-none text-sm`}
                                        >
                                            <option value="">Choose centre</option>
                                            {centres.map((c) => (
                                                <option key={c.id || c._id} value={c.centre}>{c.centre}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                    {errors.center_name && <p className="text-red-500 text-xs font-bold ml-1">{errors.center_name}</p>}
                                </div>
                            )}
                        </div>

                        {/* Message - hidden for custom form pages */}
                        {!isCustomFormPage && (
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
                        )}

                        {/* Consent */}
                        <p className="text-[10px] text-slate-500 font-bold mb-1 ml-1 leading-tight italic">
                            I Authorize Pathfinder Educational Centre to send notifications via SMS / RCS / Call / Email / Whatsapp
                        </p>

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
                            ) : isCustomFormPage ? "Apply now" : "Send Message"}
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
