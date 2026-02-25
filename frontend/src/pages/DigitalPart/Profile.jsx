import React, { useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { studentAuthAPI } from "../../services/api";
import {
    UserCircleIcon,
    IdentificationIcon,
    MapPinIcon,
    AcademicCapIcon,
    PhoneIcon,
    EnvelopeIcon,
    HomeIcon,
    CameraIcon,
    TrashIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Image must be smaller than 10MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await studentAuthAPI.uploadProfileImage(formData);

            if (res.data && res.data.url) {
                updateUser({
                    ...user,
                    profile_image_url: res.data.url
                });
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image. Please check your connection.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = async (e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to remove your profile image?")) return;

        setUploading(true);
        try {
            await studentAuthAPI.removeProfileImage();
            updateUser({
                ...user,
                profile_image_url: null
            });
        } catch (error) {
            console.error("Remove failed:", error);
            alert("Failed to remove image.");
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-40 lg:pt-36 pb-12 sm:pb-16 2xl:max-w-7xl 2xl:mx-auto 2xl:shadow-2xl 2xl:rounded-[60px] 2xl:my-8 2xl:border 2xl:border-slate-100">
            <StudentSidebar />

            <main className="flex-1 flex flex-col gap-8 max-w-full overflow-hidden">
                {/* Modern Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">
                            PortFolio
                        </h1>
                        <p className="text-slate-500 font-medium">Academic Year 2025-26</p>
                    </div>
                    <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Active Status</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Profile Summary Card */}
                    <div className="xl:col-span-4 flex flex-col gap-8">
                        <div className="bg-black rounded-[40px] p-8 text-white relative overflow-hidden group">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7D54]/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#FF7D54]/40 transition-all duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="relative mb-6 group cursor-pointer" onClick={handleImageClick}>
                                    <div className="w-32 h-32 rounded-[35px] overflow-hidden border-2 border-white/20 p-1 bg-white/5 relative">
                                        {user.profile_image_url ? (
                                            <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover rounded-[30px]" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-[30px] flex items-center justify-center">
                                                <UserCircleIcon className="w-16 h-16 text-slate-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[30px]">
                                            <CameraIcon className="w-8 h-8 text-white" />
                                        </div>
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[30px]">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                    {user.profile_image_url && !uploading && (
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-white text-black p-2 rounded-full shadow-xl hover:scale-110 transition-all"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>

                                <h2 className="text-2xl font-black italic tracking-tight mb-1 uppercase">{user.fullName}</h2>
                                <p className="text-white/60 font-bold text-sm tracking-widest mb-6 uppercase">ID: PF-2025-{Math.floor(1000 + Math.random() * 9000)}</p>

                                <div className="w-full space-y-3">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Phone</span>
                                        <span className="text-sm font-bold">{user.phone}</span>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</span>
                                        <span className="text-sm font-bold truncate ml-4">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-[#FF7D54] rounded-[40px] p-8 text-white">
                            <h3 className="text-lg font-black italic uppercase tracking-widest mb-6 underline underline-offset-8 decoration-white/20">Academic Info</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <AcademicCapIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Class</p>
                                        <p className="font-bold text-lg">{user.student_class || "12th Standard"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <HomeIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Institution</p>
                                        <p className="font-bold text-lg">{user.school || "Pathfinder High"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Details Section */}
                    <div className="xl:col-span-8 flex flex-col gap-8">
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                            <h3 className="text-xl font-black italic uppercase tracking-widest text-slate-900 mb-10 pb-4 border-b border-slate-100">
                                Personal Identity
                            </h3>

                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                    <p className="text-lg font-bold text-slate-800 border-b-2 border-slate-50 pb-2">{user.fullName}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Name</label>
                                    <p className="text-lg font-bold text-slate-800 border-b-2 border-slate-50 pb-2">{user.parentName || "Mr. " + user.fullName.split(' ').pop()}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Contact</label>
                                    <p className="text-lg font-bold text-slate-800 border-b-2 border-slate-50 pb-2">{user.phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Contact</label>
                                    <p className="text-lg font-bold text-slate-800 border-b-2 border-slate-50 pb-2">{user.parentPhone || "N/A"}</p>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Address & Location</h4>
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                        <MapPinIcon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-800">{user.area || "Kolkata, West Bengal"}</p>
                                        <p className="text-sm font-medium text-slate-500">{user.pinCode || "700001"} • India</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information Policy */}
                        <div className="bg-black/5 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-8 border border-slate-200/50">
                            <div className="w-20 h-20 bg-black rounded-[25px] flex items-center justify-center shrink-0">
                                <IdentificationIcon className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="text-lg font-black italic uppercase tracking-widest mb-2">Notice of Privacy</h4>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                                    Currently, profile details cannot be modified online for security reasons.
                                    To update your information, please contact your **Center Administrator** or the **Student Support Team**.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
