import React, { useState, useEffect, useCallback } from "react";
import { announcementsAPI } from "../../services/api";
import { useAdminCache, clearAdminCache, clearPublicCache } from "../../hooks/useAdminCache";
import LoadingSpinner from "../common/LoadingSpinner";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    MegaphoneIcon,
    StarIcon,
    FireIcon,
    GiftIcon,
    BellIcon,
    CursorArrowRaysIcon,
    SparklesIcon
} from "@heroicons/react/24/outline";

const Icons = [
    { id: 'megaphone', name: 'Megaphone', icon: MegaphoneIcon },
    { id: 'star', name: 'Star', icon: StarIcon },
    { id: 'fire', name: 'Fire', icon: FireIcon },
    { id: 'gift', name: 'Gift', icon: GiftIcon },
    { id: 'bell', name: 'Bell', icon: BellIcon },
];

const AnnouncementManagement = () => {
    const fetchAnnouncementsData = useCallback(async () => {
        const response = await announcementsAPI.getAll();
        const data = response.data;
        return Array.isArray(data) ? data : (data.results || []);
    }, []);

    const {
        data: announcements,
        loading,
        refresh: refetchAnnouncements
    } = useAdminCache("admin_announcements", fetchAnnouncementsData);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        text: "",
        link: "",
        is_active: true,
        bg_color: "#66090D",
        bg_color_2: "",
        text_color: "#FFFFFF",
        icon_type: "megaphone",
        show_shine: true,
        is_blinking: false,
        is_marquee: false,
        button_text: "",
        button_bg_color: "#FFFFFF",
        button_text_color: "#66090D",
        priority: 0
    });

    const handleOpenModal = (announcement = null) => {
        if (announcement) {
            setCurrentAnnouncement(announcement);
            setFormData({
                text: announcement.text,
                link: announcement.link || "",
                is_active: announcement.is_active,
                bg_color: announcement.bg_color || "#66090D",
                bg_color_2: announcement.bg_color_2 || "",
                text_color: announcement.text_color || "#FFFFFF",
                icon_type: announcement.icon_type || "megaphone",
                show_shine: announcement.show_shine !== false,
                is_blinking: announcement.is_blinking || false,
                is_marquee: announcement.is_marquee || false,
                button_text: announcement.button_text || "",
                button_bg_color: announcement.button_bg_color || "#FFFFFF",
                button_text_color: announcement.button_text_color || "#66090D",
                priority: announcement.priority || 0
            });
        } else {
            setCurrentAnnouncement(null);
            setFormData({
                text: "",
                link: "",
                is_active: true,
                bg_color: "#66090D",
                bg_color_2: "",
                text_color: "#FFFFFF",
                icon_type: "megaphone",
                show_shine: true,
                is_blinking: false,
                is_marquee: false,
                button_text: "",
                button_bg_color: "#FFFFFF",
                button_text_color: "#66090D",
                priority: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentAnnouncement(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (currentAnnouncement) {
                await announcementsAPI.update(currentAnnouncement.id, formData);
            } else {
                await announcementsAPI.create(formData);
            }
            handleCloseModal();
            clearAdminCache("admin_announcements");
            refetchAnnouncements();
        } catch (err) {
            console.error("Error saving announcement:", err);
            alert("Failed to save announcement.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this announcement?")) {
            try {
                await announcementsAPI.delete(id);
                clearAdminCache("admin_announcements");
                refetchAnnouncements();
            } catch (err) {
                console.error("Error deleting announcement:", err);
                alert("Failed to delete announcement.");
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MegaphoneIcon className="w-8 h-8 text-orange-600" />
                        Announcement Bar
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage hyper-premium top banner notifications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            clearAdminCache("admin_announcements");
                            refetchAnnouncements();
                        }}
                        className="p-2 text-slate-500 hover:text-orange-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition shadow-lg shadow-orange-600/20"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Announcement
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(Array.isArray(announcements) ? announcements : []).map((announcement) => {
                    const IconComp = Icons.find(i => i.id === announcement.icon_type)?.icon || MegaphoneIcon;
                    return (
                        <div 
                            key={announcement.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group"
                        >
                            <div 
                                className={`px-6 py-5 flex items-center justify-between transition-all ${announcement.is_blinking ? 'animate-pulse' : ''}`}
                                style={{ 
                                    background: announcement.bg_color_2 
                                        ? `linear-gradient(90deg, ${announcement.bg_color}, ${announcement.bg_color_2})`
                                        : announcement.bg_color,
                                    color: announcement.text_color 
                                }}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                                        <IconComp className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-black text-xl tracking-tight ${announcement.is_marquee ? 'italic' : ''}`}>{announcement.text}</span>
                                            {announcement.button_text && (
                                                <div 
                                                    style={{ background: announcement.button_bg_color, color: announcement.button_text_color }}
                                                    className="px-4 py-1 rounded-full text-xs font-black uppercase shadow-lg"
                                                >
                                                    {announcement.button_text}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {announcement.show_shine && <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-white/10 px-2 rounded"><SparklesIcon className="w-3 h-3"/> Shine</span>}
                                            {announcement.is_blinking && <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-white/10 px-2 rounded">Blinking</span>}
                                            {announcement.is_marquee && <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-white/10 px-2 rounded">Moving</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(announcement)}
                                        className="p-2.5 hover:bg-black/10 rounded-2xl transition"
                                        title="Edit"
                                    >
                                        <PencilIcon className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(announcement.id)}
                                        className="p-2.5 hover:bg-black/10 rounded-2xl transition"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-8 text-slate-400">
                                    <span className="flex items-center gap-1.5"><ArrowPathIcon className="w-3.5 h-3.5"/> Priority: <b className="text-slate-900 dark:text-white">{announcement.priority}</b></span>
                                    {announcement.link && <span className="flex items-center gap-1.5"><CursorArrowRaysIcon className="w-3.5 h-3.5"/> Link: <b className="text-slate-900 dark:text-white">{announcement.link}</b></span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-4 py-1.5 rounded-xl ${announcement.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {announcement.is_active ? 'LIVE ON SITE' : 'DRAFT / HIDDEN'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {(!Array.isArray(announcements) || announcements.length === 0) && (
                    <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <MegaphoneIcon className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No banners deployed</h3>
                        <p className="text-slate-500 font-medium">Deploy your first high-impact notification to thousands of visitors</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {currentAnnouncement ? "Refine Banner" : "Deploy New Banner"}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium italic">Customize effects, colors, and interactive buttons</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all">
                                <XMarkIcon className="w-8 h-8 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Content & Logic */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Banner Message</label>
                                        <textarea
                                            name="text"
                                            required
                                            value={formData.text}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all font-bold"
                                            placeholder="What's the big news?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">External/Internal Link</label>
                                        <input
                                            type="text"
                                            name="link"
                                            value={formData.link}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-full focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all font-bold"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black text-slate-400 mb-0 uppercase tracking-[0.2em]">Visual Effects</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-4 border-2 border-slate-100 dark:border-slate-800 rounded-[1.25rem] bg-slate-50/50">
                                                <input type="checkbox" id="is_blinking" name="is_blinking" checked={formData.is_blinking} onChange={handleInputChange} className="w-6 h-6 text-orange-600 rounded-lg focus:ring-orange-500"/>
                                                <label htmlFor="is_blinking" className="text-sm font-black text-slate-700 dark:text-gray-300">BLINKING</label>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 border-2 border-slate-100 dark:border-slate-800 rounded-[1.25rem] bg-slate-50/50">
                                                <input type="checkbox" id="is_marquee" name="is_marquee" checked={formData.is_marquee} onChange={handleInputChange} className="w-6 h-6 text-orange-600 rounded-lg focus:ring-orange-500"/>
                                                <label htmlFor="is_marquee" className="text-sm font-black text-slate-700 dark:text-gray-300">MOVING</label>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 border-2 border-slate-100 dark:border-slate-800 rounded-[1.25rem] bg-slate-50/50">
                                                <input type="checkbox" id="show_shine" name="show_shine" checked={formData.show_shine} onChange={handleInputChange} className="w-6 h-6 text-orange-600 rounded-lg focus:ring-orange-500"/>
                                                <label htmlFor="show_shine" className="text-sm font-black text-slate-700 dark:text-gray-300">SHINE</label>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 border-2 border-slate-100 dark:border-slate-800 rounded-[1.25rem] bg-slate-50/50">
                                                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="w-6 h-6 text-green-600 rounded-lg focus:ring-green-500"/>
                                                <label htmlFor="is_active" className="text-sm font-black text-slate-700 dark:text-gray-300">ACTIVE</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Styling & Buttons */}
                                <div className="space-y-6">
                                    <div className="p-6 border-2 border-orange-100 bg-orange-50/30 rounded-[2rem] space-y-4">
                                        <label className="block text-[11px] font-black text-orange-600 mb-2 uppercase tracking-[0.2em]">Button Configuration</label>
                                        <div>
                                            <input
                                                type="text"
                                                name="button_text"
                                                value={formData.button_text}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border-2 border-white rounded-full outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                                placeholder="Button Text (e.g. GET OFFER)"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Btn Bg</label>
                                                <input type="color" name="button_bg_color" value={formData.button_bg_color} onChange={handleInputChange} className="w-full h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"/>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Btn Text</label>
                                                <input type="color" name="button_text_color" value={formData.button_text_color} onChange={handleInputChange} className="w-full h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"/>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black text-slate-400 mb-0 uppercase tracking-[0.2em]">Banner Colors</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="color" name="bg_color" value={formData.bg_color} onChange={handleInputChange} className="w-full h-12 rounded-2xl cursor-pointer border-2 border-white shadow-sm"/>
                                            <input type="color" name="bg_color_2" value={formData.bg_color_2 || formData.bg_color} onChange={(e) => setFormData(p => ({ ...p, bg_color_2: e.target.value }))} className="w-full h-12 rounded-2xl cursor-pointer border-2 border-white shadow-sm"/>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Display Icon</label>
                                        <div className="grid grid-cols-5 gap-3">
                                            {Icons.map((i) => (
                                                <button
                                                    key={i.id}
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, icon_type: i.id }))}
                                                    className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-center ${formData.icon_type === i.id ? 'border-orange-500 bg-orange-100 text-orange-600' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                                                >
                                                    <i.icon className="w-6 h-6" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-5 pt-8 border-t dark:border-slate-800">
                                <button type="button" onClick={handleCloseModal} className="px-8 py-4 border-2 border-slate-100 rounded-full hover:bg-slate-50 transition font-black uppercase text-xs tracking-widest text-slate-400">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-12 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full hover:shadow-2xl hover:shadow-orange-600/40 transition-all active:scale-95 disabled:opacity-50 font-black uppercase text-xs tracking-[0.2em]"
                                >
                                    {formLoading ? "Deploying..." : "Publish Banner"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementManagement;
