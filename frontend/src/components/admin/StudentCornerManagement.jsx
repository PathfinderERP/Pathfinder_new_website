import React, { useState, useEffect, useCallback } from "react";
import { studentCornerAPI } from "../../services/api";
import { useAdminCache, clearAdminCacheByPrefix } from "../../hooks/useAdminCache";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    PhotoIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";

const StudentCornerManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isViewOnly, setIsViewOnly] = useState(false);

    // Pagination & Filter State
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('-created_at'); // Default: Newest Created
    const [filterCategory, setFilterCategory] = useState('');
    const [jumpToPage, setJumpToPage] = useState('');

    // --- Caching Hook Implementation ---
    const fetchItemsData = useCallback(async () => {
        const params = {
            page: page,
            ordering: sortBy,
        };
        if (filterCategory) params.category = filterCategory;

        const response = await studentCornerAPI.getAllItems(params);

        let result = { items: [], totalItems: 0, totalPages: 1 };

        if (response.data && response.data.results) {
            result.items = response.data.results;
            result.totalItems = response.data.count;
            result.totalPages = Math.ceil(response.data.count / 20);
        } else {
            result.items = response.data || [];
            result.totalItems = (response.data || []).length;
            result.totalPages = 1;
        }
        return result;
    }, [page, sortBy, filterCategory]);

    // Use a composite key for caching different pages/filters
    const cacheKey = `admin_student_corner_${page}_${sortBy}_${filterCategory || 'all'}`;

    const {
        data: fetchedData,
        loading,
        error: cacheError,
        refresh: refreshItems,
        updateCache: updateItemsCache
    } = useAdminCache(cacheKey, fetchItemsData, { initialData: { items: [], totalItems: 0, totalPages: 1 } });

    const { items, totalItems, totalPages } = fetchedData;
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (cacheError) setError(cacheError);
    }, [cacheError]);

    const initialFormState = {
        name: "",
        category: "",
        custom_category: "",
        description: "",
        price: "",
        discount: "0",
        rating: "0",
        tags: "",
        board: "",
        custom_board: "",
        class_level: "",
        custom_class_level: "",
        course_type: "",
        custom_course_type: "",
        is_popular: false,
        free_delivery: false,
        image_url: ""
    };

    const [formData, setFormData] = useState(initialFormState);

    const categories = [
        "Study Materials", "Stationery", "Merchandise", "Timetables", "Notes", "Others"
    ];

    const boards = ["CBSE", "ICSE", "State Board", "Others"];
    const classes = ["6", "7", "8", "9", "10", "11", "12", "Foundation", "Others"];
    const courseTypes = ["JEE", "NEET", "Foundation", "Boards", "Others"];

    const handleJumpToPage = (e) => {
        e.preventDefault();
        const p = parseInt(jumpToPage);
        if (p >= 1 && p <= totalPages) {
            setPage(p);
            setJumpToPage('');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setImageFile(null);
        setImagePreview(null);
        setEditingItem(null);
        setIsViewOnly(false);
    };

    const openModal = (item = null, viewOnly = false) => {
        if (item) {
            setEditingItem(item);
            setIsViewOnly(viewOnly);
            setFormData({
                ...initialFormState,
                ...item,
                category: categories.includes(item.category) ? item.category : "Others",
                custom_category: categories.includes(item.category) ? "" : item.category,
                board: boards.includes(item.board) ? item.board : "Others",
                custom_board: boards.includes(item.board) ? "" : item.board,
                class_level: classes.includes(item.class_level) ? item.class_level : "Others",
                custom_class_level: classes.includes(item.class_level) ? "" : item.class_level,
                course_type: courseTypes.includes(item.course_type) ? item.course_type : "Others",
                custom_course_type: courseTypes.includes(item.course_type) ? "" : item.course_type,
            });
            setImagePreview(item.image_url);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError("");
        setSuccess("");

        try {
            const dataToSubmit = { ...formData };

            // Handle custom fields mapping
            if (dataToSubmit.category === "Others") dataToSubmit.category = dataToSubmit.custom_category;
            if (dataToSubmit.board === "Others") dataToSubmit.board = dataToSubmit.custom_board;
            if (dataToSubmit.class_level === "Others") dataToSubmit.class_level = dataToSubmit.custom_class_level;
            if (dataToSubmit.course_type === "Others") dataToSubmit.course_type = dataToSubmit.custom_course_type;

            // Remove temporary custom fields before sending to backend
            delete dataToSubmit.custom_category;
            delete dataToSubmit.custom_board;
            delete dataToSubmit.custom_class_level;
            delete dataToSubmit.custom_course_type;

            // Handle tags: convert comma-separated string to array
            if (typeof dataToSubmit.tags === 'string' && dataToSubmit.tags.trim() !== "") {
                dataToSubmit.tags = dataToSubmit.tags.split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag !== "");
            } else if (!Array.isArray(dataToSubmit.tags)) {
                dataToSubmit.tags = [];
            }

            // Cleanup: Ensure numeric values are numbers
            dataToSubmit.price = parseFloat(dataToSubmit.price) || 0;
            dataToSubmit.discount = parseFloat(dataToSubmit.discount) || 0;
            dataToSubmit.rating = parseFloat(dataToSubmit.rating) || 0;

            // Handle image upload if a new file is selected
            if (imageFile) {
                const uploadRes = await studentCornerAPI.uploadImage(imageFile);
                dataToSubmit.image_url = uploadRes.data.url;
            }

            if (editingItem) {
                await studentCornerAPI.updateItem(editingItem.id, dataToSubmit);
                setSuccess("Item updated successfully!");
            } else {
                await studentCornerAPI.createItem(dataToSubmit);
                setSuccess("Item created successfully!");
            }

            clearAdminCacheByPrefix("admin_student_corner");
            refreshItems();
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            console.error("Error saving item:", err);
            setError("Failed to save item. Please check your data.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            // Optimistic Update
            const updatedItems = items.filter(item => item.id !== id);
            updateItemsCache({
                ...fetchedData,
                items: updatedItems,
                totalItems: totalItems - 1
            });

            await studentCornerAPI.deleteItem(id);
            setSuccess("Item deleted successfully!");
            clearAdminCacheByPrefix("admin_student_corner");
            refreshItems();
        } catch (err) {
            console.error("Error deleting item:", err);
            setError("Failed to delete item.");
            refreshItems(); // Revert on failure
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight italic">Student Corner</h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">Manage products, study materials, and stationery.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            clearAdminCacheByPrefix("admin_student_corner");
                            refreshItems();
                        }}
                        className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transform active:scale-95 transition-all"
                    >
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transform active:scale-95 transition-all"
                    >
                        <PlusIcon className="w-5 h-5 mr-1" />
                        Add New Item
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Category</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="-created_at">Newest First</option>
                            <option value="created_at">Oldest First</option>
                            <option value="price">Price: Low to High</option>
                            <option value="-price">Price: High to Low</option>
                            <option value="name">Name: A-Z</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-full text-center">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Total Items: {totalItems}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Specs</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-orange-200 transition-all">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <PhotoIcon className="w-6 h-6 m-3 text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">ID: {item.unique_id || item.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">₹{item.price}</div>
                                        {item.discount > 0 && <div className="text-[10px] text-green-500 font-bold">-{item.discount}% off</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.board} | Class {item.class_level}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{item.course_type}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            {item.is_popular && <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-orange-100 text-orange-600 text-[8px] font-black uppercase italic">Popular</span>}
                                            {item.free_delivery && <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-green-100 text-green-600 text-[8px] font-black uppercase">Free Delivery</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openModal(item, true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><EyeIcon className="w-5 h-5" /></button>
                                            <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"><PencilIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 transition-all font-bold text-sm"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-black text-slate-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 transition-all font-bold text-sm"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Go to"
                            value={jumpToPage}
                            onChange={(e) => setJumpToPage(e.target.value)}
                            className="w-16 px-3 py-1.5 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center appearance-none"
                        />
                        <button type="submit" className="text-xs font-black text-orange-600 uppercase hover:underline tracking-widest focus:outline-none">Jump</button>
                    </form>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f1121] rounded-[32px] w-full max-w-4xl shadow-2xl relative overflow-hidden border border-slate-800">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                                    {isViewOnly ? "View Product" : editingItem ? "Edit Product" : "New Product"}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Product identification & Metadata node</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition-all"><XMarkIcon className="w-6 h-6" /></button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[60vh] overflow-y-auto px-2 custom-scrollbar">
                                {/* Image Upload Component */}
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Image</label>
                                    <div className="relative group aspect-square rounded-[24px] overflow-hidden bg-[#141721] border-2 border-dashed border-slate-800 hover:border-orange-500/50 transition-all flex items-center justify-center">
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                {!isViewOnly && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                            Replace Image
                                                            <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                                                        </label>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 bg-[#0f1121] rounded-full shadow-lg flex items-center justify-center text-slate-500 group-hover:text-orange-500 transition-colors"><PhotoIcon className="w-6 h-6" /></div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Texture</span>
                                                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter italic text-center">Standard resolution: 1:1 Aspect Ratio (Square)</p>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name *</label>
                                        <input required name="name" value={formData.name} onChange={handleInputChange} disabled={isViewOnly} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500/50" placeholder="e.g. Physics Formula Book" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (₹) *</label>
                                            <input required type="number" name="price" value={formData.price} onChange={handleInputChange} disabled={isViewOnly} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white focus:ring-2 focus:ring-orange-500/50" placeholder="299" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount (%)</label>
                                            <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} disabled={isViewOnly} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white focus:ring-2 focus:ring-orange-500/50" placeholder="10" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange} disabled={isViewOnly} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white focus:ring-2 focus:ring-orange-500/50">
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    {formData.category === "Others" && (
                                        <input name="custom_category" value={formData.custom_category} onChange={handleInputChange} disabled={isViewOnly} placeholder="Specify Category" className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white mt-2 focus:ring-2 focus:ring-orange-500/50" />
                                    )}

                                    {formData.category !== "Merchandise" && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Board</label>
                                                    <select name="board" value={formData.board} onChange={handleInputChange} disabled={isViewOnly} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white focus:ring-2 focus:ring-orange-500/50">
                                                        <option value="">Select Board</option>
                                                        {boards.map(b => <option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                    {formData.board === "Others" && (
                                                        <input name="custom_board" value={formData.custom_board} onChange={handleInputChange} disabled={isViewOnly} placeholder="Specify Board" className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white mt-2 focus:ring-2 focus:ring-orange-500/50" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Level</label>
                                                    <select name="class_level" value={formData.class_level} onChange={handleInputChange} disabled={isViewOnly} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white focus:ring-2 focus:ring-orange-500/50">
                                                        <option value="">Select Class</option>
                                                        {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                                                    </select>
                                                    {formData.class_level === "Others" && (
                                                        <input name="custom_class_level" value={formData.custom_class_level} onChange={handleInputChange} disabled={isViewOnly} placeholder="Specify Class" className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white mt-2 focus:ring-2 focus:ring-orange-500/50" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Type</label>
                                                <select name="course_type" value={formData.course_type} onChange={handleInputChange} disabled={isViewOnly} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white focus:ring-2 focus:ring-orange-500/50">
                                                    <option value="">Select Type</option>
                                                    {courseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                {formData.course_type === "Others" && (
                                                    <input name="custom_course_type" value={formData.custom_course_type} onChange={handleInputChange} disabled={isViewOnly} placeholder="Specify Course Type" className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white mt-2 focus:ring-2 focus:ring-orange-500/50" />
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags (Comma separated)</label>
                                        <input name="tags" value={formData.tags} onChange={handleInputChange} disabled={isViewOnly} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500/50" placeholder="Trending, New, BestSeller" />
                                    </div>

                                    <div className="flex gap-10 py-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" name="is_popular" checked={formData.is_popular} onChange={handleInputChange} disabled={isViewOnly} className="rounded border-none bg-white text-orange-600 focus:ring-0 w-6 h-6 shadow-lg transition-all" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Popular</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" name="free_delivery" checked={formData.free_delivery} onChange={handleInputChange} disabled={isViewOnly} className="rounded border-none bg-white text-green-600 focus:ring-0 w-6 h-6 shadow-lg transition-all" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Free Delivery</span>
                                        </label>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleInputChange} disabled={isViewOnly} rows={4} className="w-full rounded-2xl border-none font-bold text-base p-4 bg-[#141721] text-white placeholder-slate-600 focus:ring-2 focus:ring-orange-500/50" placeholder="Product details, features, etc." />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all">Abort</button>
                                {!isViewOnly && (
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white flex items-center gap-2 transform active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
                                    >
                                        {uploading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                                        {editingItem ? "Update Protocol" : "Initialize Asset"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            ` }} />
        </div>
    );
};

export default StudentCornerManagement;
