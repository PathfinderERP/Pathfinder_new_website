import React, { useState } from 'react';
import { 
    CheckCircleIcon, 
    PaperAirplaneIcon, 
    UserIcon, 
    PhoneIcon, 
    EnvelopeIcon, 
    AcademicCapIcon, 
    MapPinIcon, 
    BuildingLibraryIcon,
    IdentificationIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import env from '../../config/env';

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

const BlogEnrollmentForm = ({ onSuccess, mode = 'enroll' }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        class: "",
        board: "",
        area: "",
        schoolName: ""
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [error, setError] = useState("");

    const isDownloadMode = mode === 'download';

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length <= 10) {
                setFormData({ ...formData, [name]: numericValue });
            }
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.phone.length !== 10) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

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
                board: formData.board || null,
                area: formData.area,
                school_name: formData.schoolName || null,
                course: {
                    id: `blog-lead-${Date.now()}`,
                    name: isDownloadMode ? "Material Download Lead" : "Course Enrollment Lead",
                    goal: "Lead Generation",
                    mode: "Online/Offline",
                    location: formData.area,
                    start: "Immediate",
                    price: "Contact for Price"
                },
                source: isDownloadMode ? "blog_download_form" : "blog_enroll_form",
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
                const fieldError = errorData.phone?.[0] || errorData.full_name?.[0] || errorData.email?.[0] || errorData.student_class?.[0];
                throw new Error(fieldError || "Failed to submit application");
            }

            setStatus('success');
            setFormData({ fullName: "", phone: "", email: "", class: "", board: "", area: "", schoolName: "" });
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Submission error:", err);
            setStatus('error');
            setError("Something went wrong. Please try again.");
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
                    <CheckCircleIcon className="w-14 h-14 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Success!</h3>
                <p className="text-lg text-slate-600 max-w-md mx-auto">
                    {isDownloadMode 
                        ? "Your download will start automatically." 
                        : "Thank you for your interest. Our academic counselor will contact you within 24 hours."}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-slate-100 w-full group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
            <div className="bg-[#66090D] text-white p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-1 tracking-tight">
                        {isDownloadMode ? "Download Now" : "Enroll Now"}
                    </h3>
                    <p className="text-white/70 text-sm font-medium">Fill in your details to proceed</p>
                </div>
            </div>

            <div className="p-6 md:p-10 bg-gradient-to-b from-slate-50/50 to-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className={`grid grid-cols-1 ${isDownloadMode ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-x-8 gap-y-6`}>
                        {/* Column 1 */}
                        <div className="space-y-6">
                            <InputWrapper label="Full Name" icon={UserIcon} required>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                                />
                            </InputWrapper>

                            <InputWrapper label="Phone Number" icon={PhoneIcon} required>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                                />
                            </InputWrapper>
                        </div>

                        {/* Column 2 (Shared for both modes or specific to Enroll) */}
                        <div className="space-y-6">
                            {!isDownloadMode ? (
                                <>
                                    <InputWrapper label="Class" icon={AcademicCapIcon}>
                                        <select
                                            name="class"
                                            value={formData.class}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 shadow-sm appearance-none"
                                        >
                                            <option value="">Select Class</option>
                                            <option value="9">Class 9</option>
                                            <option value="10">Class 10</option>
                                            <option value="11">Class 11</option>
                                            <option value="12">Class 12</option>
                                            <option value="Repeater">Repeater</option>
                                        </select>
                                    </InputWrapper>

                                    <InputWrapper label="Board" icon={IdentificationIcon}>
                                        <select
                                            name="board"
                                            value={formData.board}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 shadow-sm appearance-none"
                                        >
                                            <option value="">Select Board</option>
                                            <option value="CBSE">CBSE</option>
                                            <option value="ICSE">ICSE</option>
                                            <option value="WB Board">West Bengal Board</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </InputWrapper>
                                </>
                            ) : (
                                <>
                                    <InputWrapper label="Area/Locality" icon={MapPinIcon} required>
                                        <input
                                            type="text"
                                            name="area"
                                            required
                                            value={formData.area}
                                            onChange={handleChange}
                                            placeholder="e.g. Salt Lake, Howrah"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                                        />
                                    </InputWrapper>

                                    <InputWrapper label="Email Address" icon={EnvelopeIcon}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                                        />
                                    </InputWrapper>
                                </>
                            )}
                        </div>

                        {/* Column 3 (Only for Enroll mode) */}
                        {!isDownloadMode && (
                            <div className="space-y-6">
                                <InputWrapper label="Area/Locality" icon={MapPinIcon} required>
                                    <input
                                        type="text"
                                        name="area"
                                        required
                                        value={formData.area}
                                        onChange={handleChange}
                                        placeholder="e.g. Salt Lake, Howrah"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                                    />
                                </InputWrapper>

                                <InputWrapper label="Email Address" icon={EnvelopeIcon}>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="your.email@example.com"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                                    />
                                </InputWrapper>
                            </div>
                        )}
                    </div>

                    {!isDownloadMode && (
                        <div className="pt-6">
                            <InputWrapper label="School Name (Optional)" icon={BuildingLibraryIcon}>
                                <input
                                    type="text"
                                    name="schoolName"
                                    value={formData.schoolName}
                                    onChange={handleChange}
                                    placeholder="Enter your school name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-orange-500 transition-all bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm"
                                />
                            </InputWrapper>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-xl hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-xl shadow-lg shadow-orange-600/20"
                        >
                            {status === 'submitting' ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isDownloadMode ? "Download Now" : "Submit Application"}</span>
                                    <PaperAirplaneIcon className="w-6 h-6 -rotate-45" />
                                </>
                            )}
                        </button>
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-center text-sm font-bold">
                                ⚠️ {error}
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogEnrollmentForm;
