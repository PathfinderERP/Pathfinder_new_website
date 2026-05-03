import React, { useState } from 'react';
import { 
    CheckCircleIcon, 
    PaperAirplaneIcon, 
    UserIcon, 
    PhoneIcon, 
    EnvelopeIcon, 
    AcademicCapIcon, 
    MapPinIcon, 
    BuildingLibraryIcon 
} from '@heroicons/react/24/outline';
import env from '../../config/env';

const BlogEnrollmentForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        class: "",
        area: "",
        schoolName: ""
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setError("");

        try {
            const API_BASE_URL = env.API_BASE_URL;
            const APPLICATIONS_ENDPOINT = env.endpoints.APPLICATIONS;

            const applicationData = {
                full_name: formData.fullName,
                phone: formData.phone,
                email: formData.email || null,
                student_class: formData.class || null,
                area: formData.area,
                school_name: formData.schoolName || null,
                course: {
                    id: `blog-lead-${Date.now()}`,
                    name: "Blog Enrollment",
                    goal: "Lead Generation",
                    mode: "Online/Offline",
                    location: formData.area,
                    start: "Immediate",
                    price: "Contact for Price"
                },
                source: "blog_post_enroll_form",
                application_date: new Date().toISOString(),
                status: "pending"
            };

            const response = await fetch(`${API_BASE_URL}${APPLICATIONS_ENDPOINT}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend validation errors:", errorData);
                // Extract specific field errors if they exist
                const fieldError = errorData.phone?.[0] || errorData.full_name?.[0] || errorData.email?.[0] || errorData.student_class?.[0];
                throw new Error(fieldError || "Failed to submit application");
            }

            setStatus('success');
            setFormData({ fullName: "", phone: "", email: "", class: "", area: "", schoolName: "" });
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Submission error:", err);
            setStatus('error');
            setError("Something went wrong. Please try again.");
        }
    };

    const InputWrapper = ({ label, icon: Icon, children, required }) => (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                <Icon className="w-4 h-4 text-slate-400" />
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group">
                {children}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-within:border-orange-500/20 pointer-events-none transition-all duration-300"></div>
            </div>
        </div>
    );

    if (status === 'success') {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
                    <CheckCircleIcon className="w-14 h-14 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Registration Successful!</h3>
                <p className="text-lg text-slate-600 max-w-md mx-auto">Thank you for your interest. Our academic counselor will contact you within 24 hours.</p>
                <button 
                    onClick={() => setStatus('idle')}
                    className="mt-8 text-orange-600 font-bold hover:underline"
                >
                    Submit another response
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-slate-100 max-w-2xl mx-auto group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            {/* Compact Premium Header */}
            <div className="bg-[#66090D] text-white p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 backdrop-blur-sm border border-white/10">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>
                        Limited Seats
                    </div>
                    <h3 className="text-2xl font-black mb-1 tracking-tight">Enroll Now</h3>
                    <p className="text-orange-100/80 font-medium text-sm">Secure your future with Pathfinder</p>
                </div>
            </div>

            <div className="p-6 md:p-8 bg-gradient-to-b from-slate-50/50 to-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-grow bg-slate-200"></div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Student Details</h4>
                    <div className="h-px flex-grow bg-slate-200"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Full Name */}
                        <InputWrapper label="Full Name" icon={UserIcon} required>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                            />
                        </InputWrapper>

                        {/* Phone Number */}
                        <InputWrapper label="Phone Number" icon={PhoneIcon} required>
                            <input
                                type="tel"
                                name="phone"
                                required
                                pattern="[0-9]{10}"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                            />
                        </InputWrapper>

                        {/* Email Address */}
                        <InputWrapper label="Email Address" icon={EnvelopeIcon}>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g. name@example.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                            />
                        </InputWrapper>

                        {/* Class Selection */}
                        <InputWrapper label="Target Class" icon={AcademicCapIcon} required>
                            <select
                                name="class"
                                required
                                value={formData.class}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 shadow-sm appearance-none cursor-pointer"
                            >
                                <option value="">Select Target Class</option>
                                <option value="Class 5">Class 5</option>
                                <option value="Class 6">Class 6</option>
                                <option value="Class 7">Class 7</option>
                                <option value="Class 8">Class 8</option>
                                <option value="Class 9">Class 9</option>
                                <option value="Class 10">Class 10</option>
                                <option value="Class 11">Class 11</option>
                                <option value="Class 12">Class 12</option>
                                <option value="Repeater">Repeater (Dropper)</option>
                            </select>
                        </InputWrapper>

                        {/* Area/Locality */}
                        <InputWrapper label="Area/Locality" icon={MapPinIcon} required>
                            <input
                                type="text"
                                name="area"
                                required
                                value={formData.area}
                                onChange={handleChange}
                                placeholder="e.g. Salt Lake, Howrah"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                            />
                        </InputWrapper>

                        {/* School Name */}
                        <InputWrapper label="Current School" icon={BuildingLibraryIcon}>
                            <input
                                type="text"
                                name="schoolName"
                                value={formData.schoolName}
                                onChange={handleChange}
                                placeholder="Enter your school name"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                            />
                        </InputWrapper>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-xl hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg shadow-orange-600/20"
                        >
                            {status === 'submitting' ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Enroll Now</span>
                                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                </>
                            )}
                        </button>
                        {error && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-center text-xs font-bold">
                                ⚠️ {error}
                            </div>
                        )}
                        <p className="text-center text-slate-400 text-[10px] mt-4">
                            By clicking "Enroll Now", you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a>.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogEnrollmentForm;
