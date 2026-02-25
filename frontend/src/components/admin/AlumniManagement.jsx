import React, { useState, useEffect, useCallback } from "react";
import { alumniAPI } from "../../services/api";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";
import {
    Plus,
    Edit,
    Trash2,
    Upload,
    X,
    Save,
    Users,
    Calendar,
    Image as ImageIcon,
    Search,
    Filter,
    RefreshCw
} from "lucide-react";

const AlumniManagement = () => {
    // --- Caching Hook Implementation ---
    const fetchAlumniData = useCallback(async () => {
        const response = await alumniAPI.getAll();
        let alumniData = [];
        if (Array.isArray(response.data)) {
            alumniData = response.data;
        } else if (response.data && typeof response.data === 'object') {
            if (Array.isArray(response.data.data)) {
                alumniData = response.data.data;
            } else if (Array.isArray(response.data.results)) {
                alumniData = response.data.results;
            } else if (Array.isArray(response.data.alumni)) {
                alumniData = response.data.alumni;
            }
        }
        return alumniData;
    }, []);

    const {
        data: alumni,
        loading,
        error: cacheError,
        refresh: refetchAlumni,
        updateCache: setAlumniCache
    } = useAdminCache("admin_alumni", fetchAlumniData);

    const fetchYearsData = useCallback(async () => {
        const response = await alumniAPI.getYears();
        return response.data || [];
    }, []);

    const { data: years, refresh: refetchYears } = useAdminCache("admin_alumni_years", fetchYearsData);

    const fetchProfessionsData = useCallback(async () => {
        const response = await alumniAPI.getProfessions();
        const apiProfessions = response.data || [];
        const uniqueProfessions = Array.from(new Set(apiProfessions));
        const filtered = uniqueProfessions.filter(p => p !== "Others");
        return [...filtered, "Others"];
    }, []);

    const { data: professions, refresh: refetchProfessions } = useAdminCache("admin_alumni_professions", fetchProfessionsData, { initialData: ["Others"] });

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (cacheError) setError(cacheError);
    }, [cacheError]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        profession: "Engineers",
        images: []
    });

    // Custom profession state
    const [customProfession, setCustomProfession] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Filter states
    const [filterYear, setFilterYear] = useState("all");
    const [filterProfession, setFilterProfession] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Image preview
    const [imagePreviews, setImagePreviews] = useState([]);

    // Image modal for viewing
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalAlt, setModalAlt] = useState("");

    // Removed manual fetch functions as they are handled by useAdminCache hook
    const fetchAlumni = refetchAlumni;
    const fetchYears = refetchYears;
    const fetchProfessions = refetchProfessions;


    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                // Just add to previews, we'll separate them at submit time
                setImagePreviews(prev => [...prev, base64String]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input value so same file can be selected again if needed
        e.target.value = null;
    };

    const removeImage = (index) => {
        // Just remove from previews
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setUploading(true);

        // Separate existing URLs from new base64 images
        const keptImageUrls = imagePreviews.filter(img => !img.startsWith('data:'));
        const newImages = imagePreviews.filter(img => img.startsWith('data:'));

        // Prepare data with custom profession if 'Others' is selected
        const dataToSubmit = {
            year: formData.year,
            profession: formData.profession === "Others" ? customProfession : formData.profession,
            images: newImages,              // New base64 images to upload
            kept_image_urls: keptImageUrls  // Existing URLs to keep
        };

        // Validate custom profession
        if (formData.profession === "Others" && !customProfession.trim()) {
            setError("Please enter a custom profession name");
            setUploading(false);
            return;
        }

        try {
            if (editingId) {
                // Only send new images, backend will append to existing
                await alumniAPI.update(editingId, dataToSubmit);
                setSuccess("Alumni updated successfully! Images uploaded to Cloudflare R2.");
            } else {
                await alumniAPI.create(dataToSubmit);
                setSuccess("Alumni created successfully! Images uploaded to Cloudflare R2.");
            }

            clearAdminCache("admin_alumni");
            clearAdminCache("admin_alumni_years");
            clearAdminCache("admin_alumni_professions");
            fetchAlumni();
            fetchYears();
            fetchProfessions(); // Refresh professions list in case new one was added
            closeModal();
        } catch (err) {
            console.error("Error saving alumni:", err);
            setError(err.response?.data?.error || "Failed to save alumni data");
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (alumniData) => {
        setEditingId(alumniData.id);

        // Check if profession is a custom one (not in predefined list)
        const isCustom = !professions.slice(0, -1).includes(alumniData.profession);

        setFormData({
            year: alumniData.year,
            profession: isCustom ? "Others" : alumniData.profession
        });

        if (isCustom) {
            setCustomProfession(alumniData.profession);
            setShowCustomInput(true);
        } else {
            setCustomProfession("");
            setShowCustomInput(false);
        }

        // Set image previews from existing URLs
        const previews = alumniData.image_urls || [];
        setImagePreviews(previews);

        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this alumni entry?")) {
            return;
        }

        try {
            await alumniAPI.delete(id);
            setSuccess("Alumni deleted successfully!");
            clearAdminCache("admin_alumni");
            clearAdminCache("admin_alumni_years");
            fetchAlumni();
            fetchYears();
        } catch (err) {
            console.error("Error deleting alumni:", err);
            setError("Failed to delete alumni");
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            year: new Date().getFullYear(),
            profession: "Engineers",
            images: []
        });
        setImagePreviews([]);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            year: new Date().getFullYear(),
            profession: "Engineers",
            images: []
        });
        setImagePreviews([]);
        setCustomProfession("");
        setShowCustomInput(false);
    };

    // Filter alumni - ensure alumni is always an array
    const alumniArray = Array.isArray(alumni) ? alumni : [];
    const filteredAlumni = alumniArray.filter(item => {
        const matchesYear = filterYear === "all" || item.year === parseInt(filterYear);
        const matchesProfession = filterProfession === "all" || item.profession === filterProfession;
        const matchesSearch = searchTerm === "" ||
            item.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.year.toString().includes(searchTerm);

        return matchesYear && matchesProfession && matchesSearch;
    });

    // Group alumni by year and profession for display
    const groupedAlumni = filteredAlumni.reduce((acc, item) => {
        const key = `${item.year}-${item.profession}`;
        if (!acc[key]) {
            acc[key] = {
                year: item.year,
                profession: item.profession,
                entries: []
            };
        }
        acc[key].entries.push(item);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alumni Management</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage alumni profiles and images</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    clearAdminCache("admin_alumni");
                                    clearAdminCache("admin_alumni_years");
                                    clearAdminCache("admin_alumni_professions");
                                    fetchAlumni();
                                    fetchYears();
                                    fetchProfessions();
                                }}
                                className="p-2 text-gray-500 hover:text-orange-600 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg transition shadow-sm"
                                title="Refresh Alumni Data"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200 gap-2 shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                Add Alumni
                            </button>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>{success}</span>
                        <button onClick={() => setSuccess("")} className="text-green-700 hover:text-green-900">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{alumniArray.length}</p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Years</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{years.length}</p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Images</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                    {alumniArray.reduce((sum, item) => sum + (item.image_count || 0), 0)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <ImageIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 mb-6 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filter Alumni
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by year or profession..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Year
                            </label>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Profession
                            </label>
                            <select
                                value={filterProfession}
                                onChange={(e) => setFilterProfession(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Professions</option>
                                {professions.map(prof => (
                                    <option key={prof} value={prof}>{prof}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Alumni List */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Alumni Entries ({filteredAlumni.length})
                        </h3>

                        {Object.values(groupedAlumni).length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No alumni entries found</p>
                                <button
                                    onClick={openCreateModal}
                                    className="mt-4 text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 font-medium"
                                >
                                    Add your first entry
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.values(groupedAlumni).map((group, idx) => (
                                    <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {group.year} - {group.profession}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {group.entries.reduce((sum, e) => sum + (e.image_count || 0), 0)} images
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {group.entries.map((entry) => {
                                                // Check if entry was actually updated (different from created time)
                                                const wasUpdated = entry.updated_at && entry.created_at &&
                                                    new Date(entry.updated_at).getTime() !== new Date(entry.created_at).getTime();

                                                return (
                                                    <div key={entry.id} className="bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-xl p-6 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md transition-all">
                                                        {/* Header Section */}
                                                        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                                        ID: {entry.id?.slice(-8) || 'N/A'}
                                                                    </span>
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                                        {entry.image_count || 0} {entry.image_count === 1 ? 'Image' : 'Images'}
                                                                    </span>
                                                                </div>

                                                                {/* Metadata Grid */}
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                                    {/* Created Info */}
                                                                    <div className="flex items-start gap-2">
                                                                        <div className="flex-shrink-0 w-20 text-gray-500 dark:text-gray-400 font-medium">Created:</div>
                                                                        <div className="flex-1">
                                                                            <div className="text-gray-900 dark:text-white">
                                                                                {entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-IN', {
                                                                                    day: '2-digit',
                                                                                    month: 'short',
                                                                                    year: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                }) : 'N/A'}
                                                                            </div>
                                                                            {entry.created_by && (
                                                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                                    by {entry.created_by}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Updated Info - Only show if actually updated */}
                                                                    {wasUpdated && (
                                                                        <div className="flex items-start gap-2">
                                                                            <div className="flex-shrink-0 w-20 text-gray-500 font-medium">Updated:</div>
                                                                            <div className="flex-1">
                                                                                <div className="text-gray-900 dark:text-white">
                                                                                    {new Date(entry.updated_at).toLocaleDateString('en-IN', {
                                                                                        day: '2-digit',
                                                                                        month: 'short',
                                                                                        year: 'numeric',
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit'
                                                                                    })}
                                                                                </div>
                                                                                {entry.updated_by && entry.updated_by !== entry.created_by && (
                                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                                        by {entry.updated_by}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex gap-2 ml-4">
                                                                <button
                                                                    onClick={() => handleEdit(entry)}
                                                                    className="p-2.5 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors border border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(entry.id)}
                                                                    className="p-2.5 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Image Gallery Section */}
                                                        {entry.image_urls && entry.image_urls.length > 0 ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-px flex-1 bg-gray-200"></div>
                                                                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                                        Images Gallery
                                                                    </span>
                                                                    <div className="h-px flex-1 bg-gray-200"></div>
                                                                </div>
                                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                                                    {entry.image_urls.map((imageUrl, imgIdx) => (
                                                                        <div
                                                                            key={imgIdx}
                                                                            className="relative group cursor-pointer aspect-square"
                                                                            onClick={() => {
                                                                                setSelectedImage(imageUrl);
                                                                                setModalAlt(`${group.profession} - Image ${imgIdx + 1}`);
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={imageUrl}
                                                                                alt={`Alumni ${imgIdx + 1}`}
                                                                                className="w-full h-full object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                                                                            />
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-center pb-2">
                                                                                <span className="text-white text-xs font-medium">
                                                                                    View
                                                                                </span>
                                                                            </div>
                                                                            {/* Image Number Badge */}
                                                                            <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                                                                {imgIdx + 1}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                                                <div className="text-gray-400 mb-2">
                                                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <p className="text-sm text-gray-500 font-medium">No images uploaded</p>
                                                                <p className="text-xs text-gray-400 mt-1">Click edit to add images</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {editingId ? "Edit Alumni" : "Add Alumni"}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Year *
                                    </label>
                                    <input
                                        type="number"
                                        min="1990"
                                        max="2030"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>

                                {/* Profession */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profession *
                                    </label>
                                    <select
                                        value={formData.profession}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData({ ...formData, profession: value });
                                            setShowCustomInput(value === "Others");
                                            if (value !== "Others") {
                                                setCustomProfession("");
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {professions.map(prof => (
                                            <option key={prof} value={prof}>{prof}</option>
                                        ))}
                                    </select>

                                    {/* Custom Profession Input */}
                                    {showCustomInput && (
                                        <div className="mt-3">
                                            <input
                                                type="text"
                                                value={customProfession}
                                                onChange={(e) => setCustomProfession(e.target.value)}
                                                placeholder="Enter custom profession..."
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required={showCustomInput}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Please specify the profession
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Images
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer flex flex-col items-center"
                                        >
                                            <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">
                                                Click to upload image or drag and drop
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">
                                                PNG, JPG up to 10MB
                                            </span>
                                        </label>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Preview ({imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''})
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {imagePreviews.map((preview, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${idx + 1}`}
                                                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                                                            Image {idx + 1}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${uploading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                    >
                                        {uploading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading to Cloudflare R2...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                {editingId ? "Update" : "Create"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Image Preview Modal */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setSelectedImage(null);
                            setModalAlt("");
                        }}
                    >
                        <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setSelectedImage(null);
                                    setModalAlt("");
                                }}
                                className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
                            >
                                <X className="w-6 h-6 text-gray-800" />
                            </button>

                            {/* Image */}
                            <img
                                src={selectedImage}
                                alt={modalAlt}
                                className="max-w-full max-h-full object-contain rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                            />

                            {/* Image Info */}
                            {modalAlt && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg">
                                    <p className="text-sm font-medium text-gray-800">{modalAlt}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlumniManagement;
