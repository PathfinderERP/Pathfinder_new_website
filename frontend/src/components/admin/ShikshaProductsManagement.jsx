import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  BookOpenIcon,
  CheckCircleIcon,
  SparklesIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";
import { shikshaBandhuAPI } from "../../services/api";

const ShikshaProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    board: "WBBSE",
    class_name: "Class X",
    price: 4500,
    description: "",
    includes: "Mock Test 1, Mock Test 2, Checked Answer Scripts, Key to Success Booklet",
    featured: false,
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const generateSlug = (str) => {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await shikshaBandhuAPI.getItems(true);
      if (res.data && res.data.products) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error("Error fetching Shiksha Bandhu products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      slug: "",
      board: "WBBSE",
      class_name: "Class X",
      price: 4500,
      description: "",
      includes: "Mock Test 1, Mock Test 2, Checked Answer Scripts, Key to Success Booklet",
      featured: false,
      status: "active",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const itemTitle = item.title || item.name || "";
    setFormData({
      title: itemTitle,
      slug: item.slug || generateSlug(itemTitle),
      board: item.board || "WBBSE",
      class_name: item.class_name || item.className || "Class X",
      price: item.price || 4500,
      description: item.description || "",
      includes: Array.isArray(item.includes) ? item.includes.join(", ") : item.includes || "",
      featured: Boolean(item.featured),
      status: item.status || "active",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData((prev) => {
      const prevAutoSlug = generateSlug(prev.title);
      const shouldAutoUpdateSlug = !prev.slug || prev.slug === prevAutoSlug;
      return {
        ...prev,
        title: newTitle,
        slug: shouldAutoUpdateSlug ? generateSlug(newTitle) : prev.slug,
      };
    });
  };

  const handleTitleBlur = () => {
    setFormData((prev) => ({
      ...prev,
      slug: prev.slug || generateSlug(prev.title),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        includes: formData.includes.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (editingItem) {
        await shikshaBandhuAPI.updateItem(editingItem.id, payload);
      } else {
        await shikshaBandhuAPI.createItem(payload);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to permanently delete "${item.title || item.name}"? This action cannot be undone.`)) {
      try {
        await shikshaBandhuAPI.deleteItem(item.id);
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(err.response?.data?.error || "Failed to delete product.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
            Shiksha Portal Management
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1 uppercase tracking-tight">
            Shiksha Bandhu Products
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
            Manage mock test packages, prices, URL slugs, board details, and features displayed on referral landing pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            title="Refresh List"
            className="p-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Product / Mock Test
          </button>
        </div>
      </div>

      {/* Product List Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative transition ${
              item.status === "archived"
                ? "border-gray-200 opacity-60 bg-gray-50/50 dark:bg-slate-950/50"
                : "border-gray-200 dark:border-slate-800 hover:shadow-md"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                  {item.board} • {item.class_name || item.className}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    item.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}
                >
                  {item.status === "active" ? "Active" : "Archived"}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  {item.title}
                  {item.featured && (
                    <SparklesIcon className="w-4 h-4 text-amber-500 inline flex-shrink-0" title="Featured Package" />
                  )}
                </h3>
                {item.slug && (
                  <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                    slug: /{item.slug}
                  </span>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 leading-relaxed">
                  {item.description || "No description provided."}
                </p>
              </div>

              {item.includes && item.includes.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Included Features:</span>
                  <ul className="space-y-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {item.includes.map((inc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase block">Price</span>
                <span className="text-xl font-black text-[#66090D] dark:text-orange-500">
                  ₹{Number(item.price || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-extrabold flex items-center gap-1 transition"
                >
                  <PencilSquareIcon className="w-4 h-4 text-sky-600" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  title="Delete product permanently"
                  className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-extrabold transition"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-[#66090D] dark:text-orange-500 uppercase">
              {editingItem ? "Edit Product Item" : "Add New Mock Test Product"}
            </h3>

            {formError && (
              <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold text-gray-700 dark:text-gray-300">
              <div className="space-y-1">
                <label className="uppercase">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  placeholder="e.g. CBSE Class X Mock Test"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">URL Slug (Auto-generated on title change/blur) *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. cbse-x"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Exam Board *</label>
                  <input
                    type="text"
                    required
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                    placeholder="e.g. WBBSE, CBSE, ICSE"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Class / Level *</label>
                  <input
                    type="text"
                    required
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    placeholder="e.g. Class X, Class XII"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="uppercase">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="uppercase">Includes / Features (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.includes}
                  onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                  placeholder="e.g. Mock Test 1, Checked Scripts, Key Booklet"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#66090D] focus:ring-[#66090D]"
                />
                <label htmlFor="featured" className="uppercase cursor-pointer text-slate-900 dark:text-white">
                  Mark as Primary Featured Package
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-extrabold text-xs rounded-xl uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold text-xs rounded-xl uppercase shadow"
                >
                  {submitting ? "Saving..." : editingItem ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShikshaProductsManagement;
