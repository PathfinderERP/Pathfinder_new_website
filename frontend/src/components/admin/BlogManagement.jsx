import React, { useState, useEffect, useCallback } from "react";
import { blogAPI } from "../../services/api";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";
import LoadingSpinner from "../common/LoadingSpinner";
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    PhotoIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";

const BlogManagement = () => {
    // --- Caching Hook Implementation ---
    const fetchPostsData = useCallback(async () => {
        const response = await blogAPI.getAll({ status: 'all' });
        const data = response.data.results || response.data || [];
        return Array.isArray(data) ? data : [];
    }, []);

    const {
        data: posts,
        loading,
        error: cacheError,
        refresh: refetchPosts
    } = useAdminCache("admin_blogs", fetchPostsData);

    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (cacheError) setError(cacheError);
    }, [cacheError]);

    const fetchPosts = refetchPosts;


    // Form State
    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "General",
        author: "Admin",
        read_time: "5 min read",
        is_featured: false,
        is_active: true,
        image_file: null // Base64 image
    });

    const categories = [
        "General", "JEE", "NEET", "Foundation", "Study Tips", "Success Stories", "Notifications"
    ];

    // Redundant fetchPosts removed, hook handles it.


    const handleOpenModal = (post = null) => {
        if (post) {
            setCurrentPost(post);
            setFormData({
                title: post.title,
                excerpt: post.excerpt || "",
                content: post.content,
                category: post.category,
                author: post.author,
                read_time: post.read_time,
                is_featured: post.is_featured,
                is_active: post.is_active,
                image_url: post.image_url,
                image_file: null
            });
        } else {
            setCurrentPost(null);
            setFormData({
                title: "",
                excerpt: "",
                content: "",
                category: "General",
                author: "Admin",
                read_time: "5 min read",
                is_featured: false,
                is_active: true,
                image_url: null,
                image_file: null
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPost(null);
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
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_file: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const submissionData = { ...formData };
            // Don't send null image_file as it might clear existing image on some backends
            if (!submissionData.image_file) {
                delete submissionData.image_file;
            }

            if (currentPost) {
                await blogAPI.update(currentPost.id, submissionData);
            } else {
                await blogAPI.create(submissionData);
            }
            handleCloseModal();
            clearAdminCache("admin_blogs");
            fetchPosts();
        } catch (err) {
            console.error("Error saving blog post:", err);
            alert("Error saving blog post. Please try again.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this blog post?")) {
            try {
                await blogAPI.delete(id);
                clearAdminCache("admin_blogs");
                fetchPosts();
            } catch (err) {
                console.error("Error deleting blog post:", err);
                alert("Failed to delete blog post.");
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Blog Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Create and manage your blog articles</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            clearAdminCache("admin_blogs");
                            fetchPosts();
                        }}
                        className="p-2 text-slate-500 hover:text-orange-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition shadow-sm"
                        title="Refresh Posts"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Post
                    </button>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-gray-300">Image & Title</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-gray-300">Category</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-gray-300">Author</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-gray-300">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {posts.map((post) => (
                            <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={post.image_url || "/images/placeholder.webp"}
                                            alt={post.title}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div>
                                            <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1">{post.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Published: {new Date(post.published_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-300 rounded-md text-xs font-medium">
                                        {post.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{post.author}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs inline-flex items-center gap-1 font-medium ${post.is_active ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {post.is_active ? <CheckIcon className="w-3 h-3" /> : <XMarkIcon className="w-3 h-3" />}
                                            {post.is_active ? 'Active' : 'Draft'}
                                        </span>
                                        {post.is_featured && (
                                            <span className="text-[10px] bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded w-max font-bold">FEATURED</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleOpenModal(post)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800">
                        <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b dark:border-slate-800 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {currentPost ? "Edit Post" : "Create New Post"}
                            </h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        placeholder="Enter post title"
                                    />
                                </div>

                                {/* Excerpt */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Excerpt</label>
                                    <textarea
                                        name="excerpt"
                                        required
                                        value={formData.excerpt}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="w-full px-4 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        placeholder="Short description for cards..."
                                    />
                                </div>

                                {/* Content */}
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Content (Text/HTML)</label>
                                    <textarea
                                        name="content"
                                        required
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        rows="8"
                                        className="w-full px-4 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-mono text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        placeholder="Write your article here..."
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-orange-500"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Author */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Author Name</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-orange-500"
                                    />
                                </div>

                                {/* Read Time */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Read Time</label>
                                    <input
                                        type="text"
                                        name="read_time"
                                        value={formData.read_time}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border dark:border-slate-700 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-orange-500"
                                        placeholder="e.g. 5 min read"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Featured Image</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm text-slate-700 dark:text-gray-300">
                                            <PhotoIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                            Upload Image
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                        {formData.image_file ? (
                                            <div className="relative">
                                                <img src={formData.image_file} className="w-10 h-10 rounded border object-cover" />
                                                <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border border-white"></span>
                                            </div>
                                        ) : formData.image_url ? (
                                            <div className="relative">
                                                <img src={formData.image_url} className="w-10 h-10 rounded border object-cover" />
                                                <span className="absolute -top-1 -right-1 bg-blue-500 w-3 h-3 rounded-full border border-white"></span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="flex items-center gap-8 py-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={formData.is_featured}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-orange-600 rounded bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Featured Post</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-orange-600 rounded bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Is Active?</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-8 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {formLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        currentPost ? "Update Post" : "Publish Post"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManagement;

