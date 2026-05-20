import React, { useState, useEffect, useCallback } from "react";
import { wbjeeAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import {
    CloudArrowUpIcon,
    ArrowPathIcon,
    PresentationChartLineIcon,
    DocumentTextIcon,
    VideoCameraIcon,
    SparklesIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    PlusIcon,
    TrashIcon,
    PhotoIcon,
    LinkIcon,
    EyeIcon,
    CodeBracketIcon,
    TableCellsIcon
} from "@heroicons/react/24/outline";

const WBJEEAnalysisManagement = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pendingHeroImage, setPendingHeroImage] = useState(null);


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await wbjeeAPI.getLatest();
            setConfig(response.data);
            setError("");
        } catch (err) {
            console.error("Error fetching WBJEE config:", err);
            if (err.response?.status === 404) {
                // Initialize empty config if none exists
                setConfig({
                    title: "WBJEE 2026: Answer Key & Analysis",
                    description: "",
                    sub_description: "",
                    hero_image_url: "",
                    meta_title: "WBJEE 2026: Answer Key & Analysis | Pathfinder",
                    meta_description: "Download the WBJEE 2026 Answer Key, subject-wise analysis, and video solutions prepared by Pathfinder experts.",
                    custom_meta_tags: [
                        { name: "keywords", content: "WBJEE 2026, Answer Key, Pathfinder, Engineering Entrance", property: false },
                        { name: "og:type", content: "website", property: true }
                    ],
                    resources: [
                        { subject: "Mathematics", icon: "📐", weightage_url: "", pdf_url: "", video_url: "", bg_color: "bg-yellow-50" },
                        { subject: "Physics", icon: "⚛️", weightage_url: "", pdf_url: "", video_url: "", bg_color: "bg-orange-50" },
                        { subject: "Chemistry", icon: "🧪", weightage_url: "", pdf_url: "", video_url: "", bg_color: "bg-emerald-50" }
                    ],
                    marks_division: [],
                    videos: [],
                    custom_html: ""
                });
            } else {
                setError("Failed to load configuration. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const originalTitle = document.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        const originalDescription = metaDesc ? metaDesc.getAttribute('content') : '';

        document.title = "WBJEE Hub Configuration & Cloud Resource Manager | Pathfinder Admin";
        if (metaDesc) {
            metaDesc.setAttribute('content', "Manage the WBJEE 2026 answer key, subject-wise analysis, and expert video solutions.");
        }

        return () => {
            document.title = originalTitle;
            if (metaDesc) {
                metaDesc.setAttribute('content', originalDescription);
            }
        };
    }, []);

    const handleInputChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleResourceChange = (index, field, value) => {
        const updatedResources = [...config.resources];
        updatedResources[index] = { ...updatedResources[index], [field]: value };
        setConfig(prev => ({ ...prev, resources: updatedResources }));
    };

    const handleFileUpload = async (e, type, subjectIndex = null) => {
        const file = e.target.files[0];
        if (!file) return;

        // Special handling for Hero Image: Defer upload until Sync
        if (type === 'hero_image') {
            setPendingHeroImage(file);
            const previewUrl = URL.createObjectURL(file);
            handleInputChange('hero_image_url', previewUrl);
            return;
        }

        if (!config?.id) {
            alert("Please save the configuration first before uploading PDFs.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        if (subjectIndex !== null) formData.append("subject_index", subjectIndex);

        try {
            setSaving(true);
            const response = await wbjeeAPI.uploadFile(config.id, formData);
            
            if (subjectIndex !== null) {
                handleResourceChange(subjectIndex, type === 'weightage' ? 'weightage_url' : 'pdf_url', response.data.url);
            }
            
            setSuccess("File uploaded successfully to Cloudflare R2!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            let currentConfigId = config.id;
            let finalConfig = { ...config };

            // 1. Initial save/create if no ID (needed for file upload)
            if (!currentConfigId) {
                const response = await wbjeeAPI.create(config);
                currentConfigId = response.data.id;
                finalConfig = response.data;
                setConfig(response.data);
            }

            // 2. Handle Pending Hero Image Upload
            if (pendingHeroImage && currentConfigId) {
                const formData = new FormData();
                formData.append("file", pendingHeroImage);
                formData.append("type", "hero_image");
                
                const uploadRes = await wbjeeAPI.uploadFile(currentConfigId, formData);
                finalConfig.hero_image_url = uploadRes.data.url;
                setPendingHeroImage(null);
            }

            // 3. Final update with all changes
            const updateRes = await wbjeeAPI.update(currentConfigId, finalConfig);
            setConfig(updateRes.data);

            setSuccess("Configuration synced and Cloudflare assets updated!");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Save error:", err);
            const serverError = err.response?.data;
            let errorMsg = "Failed to save configuration.";
            if (serverError) {
                if (typeof serverError === 'object') {
                    errorMsg += " Details: " + Object.entries(serverError)
                        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : JSON.stringify(val)}`)
                        .join(' | ');
                } else if (typeof serverError === 'string') {
                    errorMsg += " Details: " + serverError;
                }
            } else if (err.message) {
                errorMsg += " Error: " + err.message;
            }
            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 gap-4 md:gap-0">
                <div className="text-center md:text-left">
                    <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2 md:gap-3">
                        <PresentationChartLineIcon className="w-6 h-6 md:w-10 md:h-10 text-orange-600" />
                        WBJEE Hub
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[8px] md:text-xs">Page Configuration & Cloud Resource Manager</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                    <button 
                        onClick={fetchData}
                        className="p-2 md:p-3 text-slate-500 hover:text-orange-600 bg-slate-50 dark:bg-slate-800 rounded-xl md:rounded-2xl transition flex-1 md:flex-none flex justify-center"
                    >
                        <ArrowPathIcon className={`w-5 h-5 md:w-6 md:h-6 ${saving ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-orange-600 text-white px-4 py-2.5 md:px-8 md:py-3 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-sm tracking-widest hover:bg-orange-700 transition shadow-xl shadow-orange-600/20 disabled:opacity-50 flex items-center justify-center gap-2 flex-[2] md:flex-none"
                    >
                        {saving ? "Processing..." : "Sync Changes"}
                        <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold animate-in fade-in slide-in-from-top-2">
                    <ExclamationCircleIcon className="w-6 h-6" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-2 border-green-100 p-4 rounded-2xl flex items-center gap-3 text-green-600 font-bold animate-in fade-in slide-in-from-top-2">
                    <CheckCircleIcon className="w-6 h-6" />
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Left Panel: Hero & SEO */}
                <div className="lg:col-span-2 space-y-4 md:space-y-8">
                    <section className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-4 md:space-y-6">
                        <div className="flex items-center gap-2 mb-2 md:mb-4">
                            <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                            <h2 className="text-base md:text-xl font-black uppercase tracking-tight">Hero Section</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Main Title (White)</label>
                                    <textarea 
                                        rows="1"
                                        value={config.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-black text-slate-900 resize-none min-h-[58px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Highlighted Title (Orange)</label>
                                    <textarea 
                                        rows="1"
                                        value={config.title_highlight || ""}
                                        onChange={(e) => handleInputChange('title_highlight', e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-black text-orange-600 resize-none min-h-[58px]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Primary Description</label>
                                    <textarea 
                                        rows="4"
                                        value={config.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Sub Description (Highlight)</label>
                                    <textarea 
                                        rows="4"
                                        value={config.sub_description}
                                        onChange={(e) => handleInputChange('sub_description', e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-bold italic"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t dark:border-slate-800">
                            <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Hero Banner Image (Cloudflare R2)</label>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-full md:w-64 h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center relative group">
                                    {config.hero_image_url ? (
                                        <img src={config.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
                                    ) : (
                                        <PhotoIcon className="w-12 h-12 text-slate-300" />
                                    )}
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'hero_image')} />
                                        <CloudArrowUpIcon className="w-10 h-10 text-white" />
                                    </label>
                                </div>
                                <div className="flex-grow space-y-2">
                                    <p className="text-xs text-slate-500 font-medium">Recommended: 1920x800px High-Quality WebP, JPG, or PNG.</p>
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <LinkIcon className="w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={config.hero_image_url} 
                                            className="bg-transparent text-[10px] font-mono text-slate-500 outline-none w-full"
                                            placeholder="No image uploaded yet"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SEO Section */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <PresentationChartLineIcon className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-black uppercase tracking-tight">SEO Metadata (Google Search)</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Meta Title (Page Browser Tab)</label>
                                <textarea 
                                    rows="1"
                                    value={config.meta_title || ""}
                                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-bold text-blue-600 resize-none min-h-[58px]"
                                    placeholder="e.g. WBJEE 2026 Answer Key & Solutions | Pathfinder"
                                />
                                <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Recommended: 50-60 characters</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Meta Description (Google Snippet)</label>
                                <textarea 
                                    rows="3"
                                    value={config.meta_description || ""}
                                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-bold"
                                    placeholder="Provide a brief summary of the page for search engines..."
                                />
                                <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Recommended: 150-160 characters</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t dark:border-slate-800 space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Additional Meta Tags (Keywords, OpenGraph, etc.)</label>
                                <button 
                                    onClick={() => handleInputChange('custom_meta_tags', [...(config.custom_meta_tags || []), { name: "", content: "", property: false }])}
                                    className="text-[10px] font-black text-orange-600 hover:text-orange-500 flex items-center gap-1 uppercase tracking-widest"
                                >
                                    <PlusIcon className="w-3 h-3" /> Add Tag
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(config.custom_meta_tags || []).map((tag, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition">
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <input 
                                                type="text" 
                                                value={tag.name}
                                                onChange={(e) => {
                                                    const newTags = [...config.custom_meta_tags];
                                                    newTags[idx].name = e.target.value;
                                                    handleInputChange('custom_meta_tags', newTags);
                                                }}
                                                placeholder="Name (e.g. keywords)"
                                                className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none text-[10px] font-bold"
                                            />
                                            <textarea 
                                                rows={3}
                                                value={tag.content}
                                                onChange={(e) => {
                                                    const newTags = [...config.custom_meta_tags];
                                                    newTags[idx].content = e.target.value;
                                                    handleInputChange('custom_meta_tags', newTags);
                                                }}
                                                placeholder="Content"
                                                className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-xl outline-none text-[10px] font-bold break-all min-h-[70px]"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 px-2">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={tag.property}
                                                    onChange={(e) => {
                                                        const newTags = [...config.custom_meta_tags];
                                                        newTags[idx].property = e.target.checked;
                                                        handleInputChange('custom_meta_tags', newTags);
                                                    }}
                                                    className="w-3 h-3 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition">Property</span>
                                            </label>
                                            <button 
                                                onClick={() => {
                                                    const newTags = config.custom_meta_tags.filter((_, i) => i !== idx);
                                                    handleInputChange('custom_meta_tags', newTags);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 transition"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!config.custom_meta_tags || config.custom_meta_tags.length === 0) && (
                                    <p className="text-center py-4 text-[10px] text-slate-400 font-medium italic border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                        No additional meta tags defined. Click "Add Tag" for keywords, OG tags, etc.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>



                    {/* Subject Resources */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <DocumentTextIcon className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Subject-Wise Resources</h2>
                        </div>

                        <div className="space-y-6">
                            {config.resources.map((res, idx) => (
                                <div key={idx} className={`${res.bg_color} p-6 rounded-3xl border-2 border-black/5 space-y-6`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{res.icon}</span>
                                            <h3 className="text-lg font-black uppercase text-slate-900">{res.subject}</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">Weightage Analysis PDF</label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-grow">
                                                    <textarea 
                                                        rows={3}
                                                        value={res.weightage_url}
                                                        onChange={(e) => handleResourceChange(idx, 'weightage_url', e.target.value)}
                                                        className="w-full pl-4 pr-20 py-3 bg-white/50 border-2 border-black/10 rounded-xl outline-none focus:border-orange-500 text-xs font-bold break-all min-h-[80px]"
                                                        placeholder="R2 Link or External URL"
                                                    />
                                                    <div className="absolute right-3 top-3 flex items-center gap-1">
                                                        {res.weightage_url && (
                                                            <a href={res.weightage_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition p-1">
                                                                <EyeIcon className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <label className="cursor-pointer text-orange-600 hover:scale-110 transition p-1">
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'weightage', idx)} />
                                                            <CloudArrowUpIcon className="w-4 h-4" />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">Answer Key PDF</label>
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-grow">
                                                    <textarea 
                                                        rows={3}
                                                        value={res.pdf_url}
                                                        onChange={(e) => handleResourceChange(idx, 'pdf_url', e.target.value)}
                                                        className="w-full pl-4 pr-20 py-3 bg-white/50 border-2 border-black/10 rounded-xl outline-none focus:border-orange-500 text-xs font-bold break-all min-h-[80px]"
                                                        placeholder="R2 Link or External URL"
                                                    />
                                                    <div className="absolute right-3 top-3 flex items-center gap-1">
                                                        {res.pdf_url && (
                                                            <a href={res.pdf_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition p-1">
                                                                <EyeIcon className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <label className="cursor-pointer text-orange-600 hover:scale-110 transition p-1">
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'pdf', idx)} />
                                                            <CloudArrowUpIcon className="w-4 h-4" />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">YouTube Video Solution URL</label>
                                            <input 
                                                type="text" 
                                                value={res.video_url}
                                                onChange={(e) => handleResourceChange(idx, 'video_url', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/50 border-2 border-black/10 rounded-xl outline-none focus:border-orange-500 text-xs font-bold"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">Video Download URL (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={res.video_download_url || ""}
                                                onChange={(e) => handleResourceChange(idx, 'video_download_url', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/50 border-2 border-black/10 rounded-xl outline-none focus:border-orange-500 text-xs font-bold"
                                                placeholder="R2 Link or External URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Marks Division Table */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <TableCellsIcon className="w-6 h-6 text-orange-500" />
                                <h2 className="text-xl font-black uppercase tracking-tight">Marks Division Analysis</h2>
                            </div>
                            <button 
                                onClick={() => handleInputChange('marks_division', [...(config.marks_division || []), { subject: "", questions: "", marks: "", weightage: "" }])}
                                className="px-4 py-2 bg-orange-600 text-white rounded-xl oswald font-bold uppercase text-[10px] tracking-widest hover:bg-orange-700 transition flex items-center gap-2"
                            >
                                <PlusIcon className="w-4 h-4" /> Add Row
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <th className="p-4 text-left">Subject</th>
                                        <th className="p-4 text-left">Questions</th>
                                        <th className="p-4 text-left">Marks</th>
                                        <th className="p-4 text-left">Weightage</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-800">
                                    {(config.marks_division || []).map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    value={row.subject}
                                                    onChange={(e) => {
                                                        const newData = [...config.marks_division];
                                                        newData[idx].subject = e.target.value;
                                                        handleInputChange('marks_division', newData);
                                                    }}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-transparent focus:border-orange-500 outline-none text-xs font-bold"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    value={row.questions}
                                                    onChange={(e) => {
                                                        const newData = [...config.marks_division];
                                                        newData[idx].questions = e.target.value;
                                                        handleInputChange('marks_division', newData);
                                                    }}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-transparent focus:border-orange-500 outline-none text-xs font-bold"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    value={row.marks}
                                                    onChange={(e) => {
                                                        const newData = [...config.marks_division];
                                                        newData[idx].marks = e.target.value;
                                                        handleInputChange('marks_division', newData);
                                                    }}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-transparent focus:border-orange-500 outline-none text-xs font-bold"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input 
                                                    type="text" 
                                                    value={row.weightage}
                                                    onChange={(e) => {
                                                        const newData = [...config.marks_division];
                                                        newData[idx].weightage = e.target.value;
                                                        handleInputChange('marks_division', newData);
                                                    }}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-transparent focus:border-orange-500 outline-none text-xs font-bold"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <button 
                                                    onClick={() => {
                                                        const newData = config.marks_division.filter((_, i) => i !== idx);
                                                        handleInputChange('marks_division', newData);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!config.marks_division || config.marks_division.length === 0) && (
                                <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl mt-4">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No table data added yet</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Panel: Additional Sections */}
                <div className="space-y-8">
                    {/* Expert Guidance Videos */}
                    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <VideoCameraIcon className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Expert Videos</h2>
                        </div>

                        <div className="space-y-4">
                            {config.videos.map((vid, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 relative group">
                                    <button 
                                        onClick={() => {
                                            const newVids = config.videos.filter((_, i) => i !== idx);
                                            handleInputChange('videos', newVids);
                                        }}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    <textarea 
                                        rows="1"
                                        value={vid.label}
                                        onChange={(e) => {
                                            const newVids = [...config.videos];
                                            newVids[idx].label = e.target.value;
                                            handleInputChange('videos', newVids);
                                        }}
                                        placeholder="Video Label"
                                        className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 mb-3 pb-1 text-sm font-black uppercase tracking-tight outline-none resize-none min-h-[30px]"
                                    />
                                    <textarea 
                                        rows={2}
                                        value={vid.url}
                                        onChange={(e) => {
                                            const newVids = [...config.videos];
                                            newVids[idx].url = e.target.value;
                                            handleInputChange('videos', newVids);
                                        }}
                                        placeholder="YouTube Embed URL"
                                        className="w-full bg-transparent text-[10px] text-slate-500 outline-none mb-2 break-all min-h-[50px]"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <textarea 
                                            value={vid.description || ""}
                                            onChange={(e) => {
                                                const newVids = [...config.videos];
                                                newVids[idx].description = e.target.value;
                                                handleInputChange('videos', newVids);
                                            }}
                                            placeholder="Video Description (Optional)"
                                            rows="2"
                                            className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-xl px-3 py-2 text-[10px] text-slate-600 dark:text-slate-400 outline-none border border-transparent focus:border-orange-500 transition font-medium"
                                        />
                                        <textarea 
                                            value={vid.download_url || ""}
                                            onChange={(e) => {
                                                const newVids = [...config.videos];
                                                newVids[idx].download_url = e.target.value;
                                                handleInputChange('videos', newVids);
                                            }}
                                            placeholder="Download URL (Optional)"
                                            rows="2"
                                            className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-xl px-3 py-2 text-[10px] text-slate-600 dark:text-slate-400 outline-none border border-transparent focus:border-orange-500 transition font-medium"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => handleInputChange('videos', [...config.videos, { label: "New Video", url: "", description: "" }])}
                                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-orange-600 hover:border-orange-500 transition flex items-center justify-center gap-2 text-xs font-bold uppercase"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add Video Card
                            </button>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CodeBracketIcon className="w-6 h-6 text-orange-500" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Custom HTML Section</h2>
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Raw HTML Content</label>
                            <textarea 
                                rows="10"
                                value={config.custom_html || ""}
                                onChange={(e) => handleInputChange('custom_html', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-mono text-[11px] text-slate-600 dark:text-slate-400"
                                placeholder="<div>Your custom HTML here...</div>"
                            />
                            <p className="text-[10px] text-slate-400 mt-2 font-medium italic">
                                Use this section to add custom tables, announcements, or specialized tracking scripts.
                            </p>
                        </div>
                    </section>

                    <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4">
                        <h3 className="text-sm font-black uppercase text-orange-500 tracking-[0.2em]">Quick Help</h3>
                        <ul className="text-xs text-slate-400 space-y-3 font-medium">
                            <li className="flex gap-2">
                                <span className="text-orange-500">•</span>
                                Always click "Sync Changes" after uploading PDFs or updating links.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-500">•</span>
                                Use "Embed" URLs for YouTube videos (e.g. youtube.com/embed/...) for best player performance.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-orange-500">•</span>
                                The Hero Image is gated behind R2 storage for ultra-fast loading.
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default WBJEEAnalysisManagement;
