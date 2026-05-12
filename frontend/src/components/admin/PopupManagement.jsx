import React, { useState, useEffect, useCallback } from "react";
import { siteConfigAPI } from "../../services/api";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";
import LoadingSpinner from "../common/LoadingSpinner";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    RocketLaunchIcon,
    SparklesIcon,
    StarIcon,
    FireIcon,
    LinkIcon,
    EyeIcon,
    EyeSlashIcon,
    ClockIcon,
    ChatBubbleBottomCenterTextIcon,
    ArrowRightIcon
} from "@heroicons/react/24/outline";

const Icons = [
    { id: 'rocket', name: 'Rocket', icon: RocketLaunchIcon },
    { id: 'sparkles', name: 'Sparkles', icon: SparklesIcon },
    { id: 'star', name: 'Star', icon: StarIcon },
    { id: 'fire', name: 'Fire', icon: FireIcon },
];

const PopupManagement = () => {
    const fetchPopupData = useCallback(async () => {
        const response = await siteConfigAPI.getPopupAll();
        const data = response.data;
        return Array.isArray(data) ? data : (data.results || []);
    }, []);

    const {
        data: popups,
        loading,
        refresh: refetchPopups
    } = useAdminCache("admin_popups", fetchPopupData);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPopup, setCurrentPopup] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "NEET 2026",
        title_highlight: "Answer Key",
        description: "Download the official NEET 2026 Answer Key and Question Paper solutions. Check your performance and calculate your expected score instantly.",
        button_text: "Download Answer Key",
        button_link: "https://pathfinder.edu.in/blog/neet-2026-answer-key",
        maybe_later_text: "Maybe Later",
        bottom_banner_text: "Live Prediction Portal is Now Open",
        icon_type: "rocket",
        is_active: true,
        show_delay: 1500
    });

    const handleOpenModal = (popup = null) => {
        if (popup) {
            setCurrentPopup(popup);
            setFormData({
                title: popup.title,
                title_highlight: popup.title_highlight,
                description: popup.description,
                button_text: popup.button_text,
                button_link: popup.button_link,
                maybe_later_text: popup.maybe_later_text || "Maybe Later",
                bottom_banner_text: popup.bottom_banner_text,
                icon_type: popup.icon_type || "rocket",
                is_active: popup.is_active,
                show_delay: popup.show_delay || 1500
            });
        } else {
            setCurrentPopup(null);
            setFormData({
                title: "NEET 2026",
                title_highlight: "Answer Key",
                description: "Download the official NEET 2026 Answer Key and Question Paper solutions. Check your performance and calculate your expected score instantly.",
                button_text: "Download Answer Key",
                button_link: "https://pathfinder.edu.in/blog/neet-2026-answer-key",
                maybe_later_text: "Maybe Later",
                bottom_banner_text: "Live Prediction Portal is Now Open",
                icon_type: "rocket",
                is_active: true,
                show_delay: 1500
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPopup(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (currentPopup) {
                await siteConfigAPI.updatePopup(currentPopup.id, formData);
            } else {
                await siteConfigAPI.createPopup(formData);
            }
            handleCloseModal();
            clearAdminCache("admin_popups");
            refetchPopups();
        } catch (err) {
            console.error("Error saving popup:", err);
            alert("Failed to save popup.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this popup configuration?")) {
            try {
                await siteConfigAPI.deletePopup(id);
                clearAdminCache("admin_popups");
                refetchPopups();
            } catch (err) {
                console.error("Error deleting popup:", err);
                alert("Failed to delete popup.");
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <RocketLaunchIcon className="w-8 h-8 text-orange-600" />
                        Prediction Popups
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage dynamic high-conversion exit/entry popups</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            clearAdminCache("admin_popups");
                            refetchPopups();
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
                        New Popup
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(Array.isArray(popups) ? popups : []).map((popup) => {
                    const IconComp = Icons.find(i => i.id === popup.icon_type)?.icon || RocketLaunchIcon;
                    return (
                        <div 
                            key={popup.id}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-xl transition-all duration-300"
                        >
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
                                        <IconComp className="w-7 h-7 text-white -rotate-3" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleOpenModal(popup)}
                                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(popup.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                        {popup.title} <span className="text-orange-500">{popup.title_highlight}</span>
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {popup.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        {popup.is_active ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase rounded-full">
                                                <EyeIcon className="w-3.5 h-3.5" /> LIVE
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-full">
                                                <EyeSlashIcon className="w-3.5 h-3.5" /> HIDDEN
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                                            <ClockIcon className="w-3.5 h-3.5" /> {popup.show_delay}ms
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Collection: prediction_popup
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {(!Array.isArray(popups) || popups.length === 0) && (
                    <div className="col-span-full text-center py-24 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <RocketLaunchIcon className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No popups configured</h3>
                        <p className="text-slate-500 font-medium">Drive more leads by deploying dynamic entry popups</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl border border-white/20 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {currentPopup ? "Refine Popup" : "Design New Popup"}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium italic">Configure content, behavior, and call-to-actions</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all">
                                <XMarkIcon className="w-8 h-8 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Left/Middle Column: Content & Settings */}
                                <div className="lg:col-span-7 space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Main Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                required
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-full focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all font-bold"
                                                placeholder="e.g. NEET 2026"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Highlight Text</label>
                                            <input
                                                type="text"
                                                name="title_highlight"
                                                required
                                                value={formData.title_highlight}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-full focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all font-bold text-orange-500"
                                                placeholder="e.g. Answer Key"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Description Content</label>
                                        <textarea
                                            name="description"
                                            required
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all font-bold"
                                            placeholder="Explain the value proposition..."
                                        />
                                    </div>

                                    <div className="p-6 border-2 border-orange-100 bg-orange-50/30 rounded-[2rem] space-y-4">
                                        <label className="block text-[11px] font-black text-orange-600 mb-2 uppercase tracking-[0.2em]">Primary Call-to-Action</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <input
                                                type="text"
                                                name="button_text"
                                                required
                                                value={formData.button_text}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border-2 border-white rounded-full outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                                placeholder="Button Label (e.g. DOWNLOAD NOW)"
                                            />
                                            <div className="relative">
                                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="button_link"
                                                    required
                                                    value={formData.button_link}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 border-2 border-white rounded-full outline-none focus:border-orange-500 transition-all font-bold text-sm"
                                                    placeholder="URL Link (https://...)"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Bottom Banner Text</label>
                                        <textarea
                                            name="bottom_banner_text"
                                            value={formData.bottom_banner_text}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full px-6 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-orange-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                                            placeholder="e.g. Prediction Portal is Now Open"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Icon Style</label>
                                            <div className="flex gap-2">
                                                {Icons.map((i) => (
                                                    <button
                                                        key={i.id}
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ ...p, icon_type: i.id }))}
                                                        className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-center ${formData.icon_type === i.id ? 'border-orange-500 bg-orange-100 text-orange-600' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                                                        title={i.name}
                                                    >
                                                        <i.icon className="w-6 h-6" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Show Delay (ms)</label>
                                            <input
                                                type="number"
                                                name="show_delay"
                                                value={formData.show_delay}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-full focus:border-orange-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-slate-50/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <label className="block text-[11px] font-black text-slate-400 mb-1 uppercase tracking-[0.2em]">Visibility Status</label>
                                                <p className="text-[10px] text-slate-500 font-medium">Show or hide this popup on the website</p>
                                            </div>
                                            <div 
                                                onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                                                className={`w-16 h-8 rounded-full relative cursor-pointer transition-all duration-300 ${formData.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.is_active ? 'left-9' : 'left-1'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: LIVE PREVIEW */}
                                <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 relative">
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 z-10">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Preview</span>
                                    </div>

                                    <div className="h-full flex items-center justify-center pt-8">
                                        {/* Scaled down version of the real popup */}
                                        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 origin-center transform scale-90 sm:scale-100">
                                            <div className="relative p-6">
                                                {/* Close Button Mock */}
                                                <div className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                                    <XMarkIcon className="w-4 h-4" />
                                                </div>

                                                {/* Header Icon */}
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 rotate-3">
                                                    {(() => {
                                                        const IconComp = Icons.find(i => i.id === formData.icon_type)?.icon || RocketLaunchIcon;
                                                        return <IconComp className="w-6 h-6 text-white -rotate-3" />;
                                                    })()}
                                                </div>

                                                {/* Text */}
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                                                    {formData.title} <br />
                                                    <span className="text-orange-500">{formData.title_highlight}</span>
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-6 line-clamp-3">
                                                    {formData.description}
                                                </p>

                                                {/* CTA Button */}
                                                <div className="flex items-center justify-between p-0.5 pl-4 bg-slate-900 text-white rounded-xl">
                                                    <span className="text-xs font-bold">{formData.button_text}</span>
                                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                                        <ArrowRightIcon className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom Banner */}
                                            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{formData.bottom_banner_text}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-5 pt-8 border-t dark:border-slate-800">
                                <button type="button" onClick={handleCloseModal} className="px-8 py-4 border-2 border-slate-100 rounded-full hover:bg-slate-50 transition font-black uppercase text-xs tracking-widest text-slate-400">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-12 py-4 bg-gradient-to-r from-slate-900 to-black text-white rounded-full hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 font-black uppercase text-xs tracking-[0.2em]"
                                >
                                    {formLoading ? "Saving..." : "Save Configuration"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PopupManagement;
