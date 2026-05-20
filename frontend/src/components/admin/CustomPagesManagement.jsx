import React, { useState, useEffect } from "react";
import { customPagesAPI } from "../../services/api";
import { 
  PlusIcon, PencilIcon, TrashIcon, LinkIcon, EyeIcon, 
  CheckIcon, XMarkIcon, SparklesIcon, PhotoIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

export default function CustomPagesManagement() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create", "edit-sections"
  const [currentPage, setCurrentPage] = useState(null);

  // Form states for Create Page
  const [newPageData, setNewPageData] = useState({
    title: "",
    slug: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: ""
  });

  // CMS Edit States
  const [pendingImages, setPendingImages] = useState([]);
  const [editSections, setEditSections] = useState({
    hero: {},
    legacy: { milestones: [] },
    toppers: { toppers_list: [] },
    features: { features_list: [] },
    courses: { courses_list: [] },
    centers: { centers_list: [] },
    faq: { faqs_list: [] },
    contact: {}
  });

  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await customPagesAPI.getAll();
      setPages(response.data);
    } catch (err) {
      console.error("Failed to load pages:", err);
      toast.error("Failed to fetch custom pages.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!newPageData.title || !newPageData.slug) {
      toast.error("Title and URL Slug are required!");
      return;
    }

    // Clean slug
    const cleanSlug = newPageData.slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "-");

    try {
      await customPagesAPI.create({
        ...newPageData,
        slug: cleanSlug
      });
      toast.success("Dynamic Page created successfully with default templates!");
      setIsModalOpen(false);
      setNewPageData({
        title: "",
        slug: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: ""
      });
      fetchPages();
    } catch (err) {
      console.error("Create page error:", err);
      toast.error(err.response?.data?.error || "Failed to create page. Ensure slug is unique.");
    }
  };

  const handleToggleLive = async (page) => {
    try {
      await customPagesAPI.update(page.id, {
        is_live: !page.is_live
      });
      toast.success(`Page is now ${!page.is_live ? "Live" : "Draft"}`);
      fetchPages();
    } catch (err) {
      console.error("Toggle live status error:", err);
      toast.error("Failed to update page status.");
    }
  };

  const handleDeletePage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom page permanently?")) return;
    try {
      await customPagesAPI.delete(id);
      toast.success("Page deleted successfully.");
      fetchPages();
    } catch (err) {
      console.error("Delete page error:", err);
      toast.error("Failed to delete page.");
    }
  };

  const handleEditSectionsClick = (page) => {
    setCurrentPage(page);
    setEditSections({
      hero: page.hero || {},
      legacy: page.legacy || { milestones: [] },
      toppers: page.toppers || { toppers_list: [] },
      features: page.features || { features_list: [] },
      courses: page.courses || { courses_list: [] },
      centers: page.centers || { centers_list: [] },
      faq: page.faq || { faqs_list: [] },
      contact: page.contact || {}
    });
    setNewPageData({
      title: page.title,
      slug: page.slug,
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      meta_keywords: page.meta_keywords || ""
    });
    setPendingImages([]);
    setModalMode("edit-sections");
    setIsModalOpen(true);
  };

  const handleSaveSections = async () => {
    try {
      const toastId = toast.loading("Saving changes...");
      
      let updatedSections = { ...editSections };

      if (pendingImages.length > 0) {
        toast.update(toastId, { render: "Uploading images...", type: "info", isLoading: true });
        for (const pending of pendingImages) {
          const formData = new FormData();
          formData.append("file", pending.file);
          const res = await customPagesAPI.uploadImage(currentPage.id, formData);
          const url = res.data.url;
          
          if (pending.type === "hero") {
            updatedSections.hero.bg_image_url = url;
          } else if (pending.type === "topper" && pending.index !== undefined) {
            updatedSections.toppers.toppers_list[pending.index].image_url = url;
          }
        }
      }

      await customPagesAPI.update(currentPage.id, {
        title: newPageData.title,
        slug: newPageData.slug,
        meta_title: newPageData.meta_title,
        meta_description: newPageData.meta_description,
        meta_keywords: newPageData.meta_keywords,
        ...updatedSections
      });
      toast.update(toastId, { render: "Dynamic sections and content updated successfully!", type: "success", isLoading: false, autoClose: 3000 });
      setIsModalOpen(false);
      setPendingImages([]);
      fetchPages();
    } catch (err) {
      console.error("Failed to save dynamic content:", err);
      toast.dismiss();
      toast.error("Failed to update dynamic contents.");
    }
  };

  // Image Upload handlers for cloud storage
  const handleImageUpload = (e, type, listName = null, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    
    if (type === "hero") {
      setEditSections(prev => ({
        ...prev,
        hero: { ...prev.hero, bg_image_url: previewUrl }
      }));
      setPendingImages(prev => {
        const filtered = prev.filter(img => img.type !== "hero");
        return [...filtered, { type, file }];
      });
    } else if (type === "topper" && index !== null) {
      setEditSections(prev => {
        const list = [...prev.toppers.toppers_list];
        list[index].image_url = previewUrl;
        return { ...prev, toppers: { ...prev.toppers, toppers_list: list } };
      });
      setPendingImages(prev => {
        const filtered = prev.filter(img => !(img.type === "topper" && img.index === index));
        return [...filtered, { type, index, file }];
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-900 dark:text-white">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <SparklesIcon className="w-8 h-8 text-orange-500 animate-pulse" />
            Custom Pages (CMS)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Build, configure, and publish fully responsive custom landing pages instantly.
          </p>
        </div>
        <button
          onClick={() => {
            setModalMode("create");
            setIsModalOpen(true);
          }}
          className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Page
        </button>
      </div>

      {/* PAGES LISTING */}
      {loading ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 font-bold">Fetching custom pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm">
          <SparklesIcon className="w-16 h-16 text-gray-300 dark:text-gray-750 mx-auto mb-4" />
          <h3 className="font-bold text-xl mb-1">No Custom Pages Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm mb-6">
            Create your first page to start deploying fully functional landing pages to your website path.
          </p>
          <button
            onClick={() => {
              setModalMode("create");
              setIsModalOpen(true);
            }}
            className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm"
          >
            Create First Page
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div key={page.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-xl line-clamp-1">{page.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold mt-1">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>/{page.slug}</span>
                    </div>
                  </div>
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                    page.is_live 
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" 
                      : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                  }`}>
                    {page.is_live ? "Live" : "Draft"}
                  </span>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 pt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Created: {new Date(page.created_at).toLocaleDateString()}</div>
                  <div>Updated: {new Date(page.updated_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 p-4 grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleToggleLive(page)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                    page.is_live
                      ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-950/10 dark:text-amber-400"
                      : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-950/10 dark:text-emerald-400"
                  }`}
                  title={page.is_live ? "Change to Draft" : "Make Live"}
                >
                  {page.is_live ? "Draft" : "Go Live"}
                </button>
                <button
                  onClick={() => handleEditSectionsClick(page)}
                  className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-750 dark:text-gray-300"
                >
                  <PencilIcon className="w-3.5 h-3.5" /> Edit
                </button>
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-750 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-750 dark:text-gray-300"
                >
                  <EyeIcon className="w-3.5 h-3.5" /> View
                </a>
                <button
                  onClick={() => handleDeletePage(page.id)}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 dark:bg-red-950/10 dark:hover:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                >
                  <TrashIcon className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MODAL PAGE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className={`bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-150 dark:border-slate-800 space-y-6 ${
            modalMode === "edit-sections" ? "max-w-5xl" : "max-w-md"
          }`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
              <h2 className="text-2xl font-extrabold">
                {modalMode === "create" ? "Create Dynamic Page" : `Configure Sections: ${currentPage?.title}`}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* CREATE FORM */}
            {modalMode === "create" ? (
              <form onSubmit={handleCreatePage} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-400">Page Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEET Coaching in Kolkata"
                    value={newPageData.title}
                    onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-") })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none dark:bg-slate-850 dark:border-slate-750"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-400">URL path slug *</label>
                  <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-slate-750">
                    <span className="bg-gray-100 border-r border-gray-200 px-4 py-3 text-sm text-gray-500 dark:bg-slate-800 dark:border-slate-750 select-none">
                      /
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. neet-coaching-in-kolkata"
                      value={newPageData.slug}
                      onChange={(e) => setNewPageData({ ...newPageData, slug: e.target.value })}
                      className="w-full bg-gray-50 px-4 py-3 text-sm focus:bg-white transition-all outline-none dark:bg-slate-850"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">This will be the web path route e.g., pathfinder.edu.in/neet-coaching-in-kolkata</p>
                </div>
                
                <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all text-sm dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-755"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-md"
                  >
                    Create Page
                  </button>
                </div>
              </form>
            ) : (
              /* SECTION DYNAMIC CONFIG */
              <div className="space-y-6">
                
                {/* SETTINGS AND SEO TOP FIELDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-850 p-6 rounded-2xl border border-gray-100 dark:border-slate-750">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-650 dark:text-gray-400">Page Settings Title</label>
                    <input 
                      type="text"
                      value={newPageData.title}
                      onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value })}
                      className="w-full bg-white border border-gray-200 dark:bg-slate-900 dark:border-slate-750 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-650 dark:text-gray-400">SEO Custom Meta Title</label>
                    <input 
                      type="text"
                      value={newPageData.meta_title}
                      placeholder="Title inside search engine tabs"
                      onChange={(e) => setNewPageData({ ...newPageData, meta_title: e.target.value })}
                      className="w-full bg-white border border-gray-200 dark:bg-slate-900 dark:border-slate-750 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-650 dark:text-gray-400">SEO Meta Description</label>
                    <textarea 
                      value={newPageData.meta_description}
                      placeholder="Brief descriptive highlight shown in search engines"
                      onChange={(e) => setNewPageData({ ...newPageData, meta_description: e.target.value })}
                      className="w-full bg-white border border-gray-200 dark:bg-slate-900 dark:border-slate-750 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                      rows="2"
                    />
                  </div>
                </div>

                {/* TABS BUTTONS BAR */}
                <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto gap-2 py-1 scrollbar-hide">
                  {["hero", "legacy", "toppers", "features", "courses", "centers", "faq", "contact"].map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveTab(section)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeTab === section
                          ? "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30"
                          : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>

                {/* TAB LAYOUT AREAS */}
                <div className="py-4 space-y-4">
                  
                  {/* HERO TAB */}
                  {activeTab === "hero" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Hero Badge Text</label>
                        <input
                          type="text"
                          placeholder="e.g. Admissions Open 2026 - 27"
                          value={editSections.hero.badge_text || ""}
                          onChange={(e) => setEditSections({ ...editSections, hero: { ...editSections.hero, badge_text: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Hero Main Title</label>
                          <input
                            type="text"
                            value={editSections.hero.title || ""}
                            onChange={(e) => setEditSections({ ...editSections, hero: { ...editSections.hero, title: e.target.value } })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-slate-850 dark:border-slate-750"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Hero Highlight Title</label>
                          <input
                            type="text"
                            value={editSections.hero.title_highlight || ""}
                            onChange={(e) => setEditSections({ ...editSections, hero: { ...editSections.hero, title_highlight: e.target.value } })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-slate-850 dark:border-slate-750"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Hero Banner Description</label>
                        <textarea
                          value={editSections.hero.description || ""}
                          onChange={(e) => setEditSections({ ...editSections, hero: { ...editSections.hero, description: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none dark:bg-slate-850 dark:border-slate-750"
                          rows="3"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Background Image URL</label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="text"
                            value={editSections.hero.bg_image_url || ""}
                            onChange={(e) => setEditSections({ ...editSections, hero: { ...editSections.hero, bg_image_url: e.target.value } })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-slate-850 dark:border-slate-750"
                          />
                          <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200 dark:bg-slate-800 dark:border-slate-750 dark:text-gray-300 cursor-pointer text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0">
                            <PhotoIcon className="w-4 h-4" /> Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "hero")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LEGACY MILESTONES TAB */}
                  {activeTab === "legacy" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Section Title</label>
                        <input
                          type="text"
                          value={editSections.legacy.title || ""}
                          onChange={(e) => setEditSections({ ...editSections, legacy: { ...editSections.legacy, title: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm">Legacy Timeline Milestones</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(editSections.legacy.milestones || [])];
                              list.push({ year: "", title: "", description: "", icon: "Calendar" });
                              setEditSections({ ...editSections, legacy: { ...editSections.legacy, milestones: list } });
                            }}
                            className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-orange-100 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" /> Add Milestone
                          </button>
                        </div>
                        {editSections.legacy.milestones && editSections.legacy.milestones.map((item, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center relative pr-10">
                            <input
                              type="text"
                              placeholder="Year (e.g. 1991)"
                              value={item.year}
                              onChange={(e) => {
                                const list = [...editSections.legacy.milestones];
                                list[idx].year = e.target.value;
                                setEditSections({ ...editSections, legacy: { ...editSections.legacy, milestones: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              placeholder="Title"
                              value={item.title}
                              onChange={(e) => {
                                const list = [...editSections.legacy.milestones];
                                list[idx].title = e.target.value;
                                setEditSections({ ...editSections, legacy: { ...editSections.legacy, milestones: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                            <textarea
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => {
                                const list = [...editSections.legacy.milestones];
                                list[idx].description = e.target.value;
                                setEditSections({ ...editSections, legacy: { ...editSections.legacy, milestones: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900 col-span-2 resize-y"
                              rows="2"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...editSections.legacy.milestones];
                                list.splice(idx, 1);
                                setEditSections({ ...editSections, legacy: { ...editSections.legacy, milestones: list } });
                              }}
                              className="absolute right-2 top-2 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove milestone"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TOPPERS TAB */}
                  {activeTab === "toppers" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Section Title</label>
                        <input
                          type="text"
                          value={editSections.toppers.title || ""}
                          onChange={(e) => setEditSections({ ...editSections, toppers: { ...editSections.toppers, title: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm">Toppers spotlight cards</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(editSections.toppers.toppers_list || [])];
                              list.push({ name: "", score: "", rank: "", image: "" });
                              setEditSections({ ...editSections, toppers: { ...editSections.toppers, toppers_list: list } });
                            }}
                            className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-orange-100 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" /> Add Topper
                          </button>
                        </div>
                        {editSections.toppers.toppers_list && editSections.toppers.toppers_list.map((topper, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-850 border border-gray-250 dark:border-slate-750 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center relative pr-10">
                            <input
                              type="text"
                              placeholder="Topper Name"
                              value={topper.name}
                              onChange={(e) => {
                                const list = [...editSections.toppers.toppers_list];
                                list[idx].name = e.target.value;
                                setEditSections({ ...editSections, toppers: { ...editSections.toppers, toppers_list: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              placeholder="Score (e.g. 720/720)"
                              value={topper.score}
                              onChange={(e) => {
                                const list = [...editSections.toppers.toppers_list];
                                list[idx].score = e.target.value;
                                setEditSections({ ...editSections, toppers: { ...editSections.toppers, toppers_list: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              placeholder="Rank (e.g. AIR 1)"
                              value={topper.rank}
                              onChange={(e) => {
                                const list = [...editSections.toppers.toppers_list];
                                list[idx].rank = e.target.value;
                                setEditSections({ ...editSections, toppers: { ...editSections.toppers, toppers_list: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                            <div className="flex flex-col gap-2 items-center justify-center">
                              {topper.image_url && (
                                <img 
                                  src={topper.image_url} 
                                  alt="Preview" 
                                  className="h-10 w-10 object-cover rounded-lg border border-gray-200 shadow-sm" 
                                />
                              )}
                              <label className="bg-white border border-gray-200 hover:bg-gray-100 rounded-lg p-2 text-[10px] uppercase font-bold text-center cursor-pointer dark:bg-slate-900 dark:hover:bg-slate-800 w-full text-gray-500 whitespace-nowrap">
                                {topper.image_url ? "Change Image" : "Upload Image"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, "topper", null, idx)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...editSections.toppers.toppers_list];
                                list.splice(idx, 1);
                                setEditSections({ ...editSections, toppers: { ...editSections.toppers, toppers_list: list } });
                              }}
                              className="absolute right-2 top-2 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove topper"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FEATURES TAB */}
                  {activeTab === "features" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Section Title</label>
                        <input
                          type="text"
                          value={editSections.features.title || ""}
                          onChange={(e) => setEditSections({ ...editSections, features: { ...editSections.features, title: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm">Key Features</h4>
                        {editSections.features.features_list && editSections.features.features_list.map((feat, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <input
                              type="text"
                              placeholder="Feature Title"
                              value={feat.title}
                              onChange={(e) => {
                                const list = [...editSections.features.features_list];
                                list[idx].title = e.target.value;
                                setEditSections({ ...editSections, features: { ...editSections.features, features_list: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              placeholder="Feature Description"
                              value={feat.description}
                              onChange={(e) => {
                                const list = [...editSections.features.features_list];
                                list[idx].description = e.target.value;
                                setEditSections({ ...editSections, features: { ...editSections.features, features_list: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900 col-span-2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COURSES TAB */}
                  {activeTab === "courses" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Section Title</label>
                        <input
                          type="text"
                          value={editSections.courses.title || ""}
                          onChange={(e) => setEditSections({ ...editSections, courses: { ...editSections.courses, title: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-sm">Course Programs</h4>
                        {editSections.courses.courses_list && editSections.courses.courses_list.map((course, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-850 border border-gray-250 dark:border-slate-750 rounded-xl space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <input
                                type="text"
                                placeholder="Course Name"
                                value={course.name}
                                onChange={(e) => {
                                  const list = [...editSections.courses.courses_list];
                                  list[idx].name = e.target.value;
                                  setEditSections({ ...editSections, courses: { ...editSections.courses, courses_list: list } });
                                }}
                                className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                              />
                              <input
                                type="text"
                                placeholder="Duration"
                                value={course.duration}
                                onChange={(e) => {
                                  const list = [...editSections.courses.courses_list];
                                  list[idx].duration = e.target.value;
                                  setEditSections({ ...editSections, courses: { ...editSections.courses, courses_list: list } });
                                }}
                                className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                              />
                              <input
                                type="text"
                                placeholder="Target"
                                value={course.target}
                                onChange={(e) => {
                                  const list = [...editSections.courses.courses_list];
                                  list[idx].target = e.target.value;
                                  setEditSections({ ...editSections, courses: { ...editSections.courses, courses_list: list } });
                                }}
                                className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CENTERS TAB */}
                  {activeTab === "centers" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Section Title</label>
                        <input
                          type="text"
                          value={editSections.centers.title || ""}
                          onChange={(e) => setEditSections({ ...editSections, centers: { ...editSections.centers, title: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm">Center Locations</h4>
                        {editSections.centers.centers_list && editSections.centers.centers_list.map((center, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <input
                              type="text"
                              placeholder="Center Name"
                              value={center.name}
                              onChange={(e) => {
                                const list = [...editSections.centers.centers_list];
                                list[idx].name = e.target.value;
                                setEditSections({ ...editSections, centers: { ...editSections.centers, centers_list: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              placeholder="Phone"
                              value={center.phone}
                              onChange={(e) => {
                                const list = [...editSections.centers.centers_list];
                                list[idx].phone = e.target.value;
                                setEditSections({ ...editSections, centers: { ...editSections.centers, centers_list: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              placeholder="Address"
                              value={center.address}
                              onChange={(e) => {
                                const list = [...editSections.centers.centers_list];
                                list[idx].address = e.target.value;
                                setEditSections({ ...editSections, centers: { ...editSections.centers, centers_list: list } });
                              }}
                              className="bg-white border rounded-lg p-2 text-sm dark:bg-slate-900"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ TAB */}
                  {activeTab === "faq" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Section Title</label>
                        <input
                          type="text"
                          value={editSections.faq.title || ""}
                          onChange={(e) => setEditSections({ ...editSections, faq: { ...editSections.faq, title: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm">Frequently Asked Questions</h4>
                        {editSections.faq.faqs_list && editSections.faq.faqs_list.map((item, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-xl space-y-3">
                            <input
                              type="text"
                              placeholder="Question"
                              value={item.question}
                              onChange={(e) => {
                                const list = [...editSections.faq.faqs_list];
                                list[idx].question = e.target.value;
                                setEditSections({ ...editSections, faq: { ...editSections.faq, faqs_list: list } });
                              }}
                              className="w-full bg-white border rounded-lg p-2 text-sm dark:bg-slate-900 outline-none"
                            />
                            <textarea
                              placeholder="Answer text"
                              value={item.answer}
                              onChange={(e) => {
                                const list = [...editSections.faq.faqs_list];
                                list[idx].answer = e.target.value;
                                setEditSections({ ...editSections, faq: { ...editSections.faq, faqs_list: list } });
                              }}
                              className="w-full bg-white border rounded-lg p-2 text-sm dark:bg-slate-900 outline-none resize-none"
                              rows="2"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CONTACT FORM TAB */}
                  {activeTab === "contact" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Form Section Title</label>
                        <input
                          type="text"
                          value={editSections.contact.title || ""}
                          onChange={(e) => setEditSections({ ...editSections, contact: { ...editSections.contact, title: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Counselling Email Recipient</label>
                        <input
                          type="email"
                          value={editSections.contact.email_recipient || ""}
                          onChange={(e) => setEditSections({ ...editSections, contact: { ...editSections.contact, email_recipient: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* SAVE ACTIONS */}
                <div className="border-t border-gray-100 dark:border-slate-800 pt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-xl text-sm dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-750"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSections}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-extrabold px-8 py-3 rounded-xl text-sm shadow-md flex items-center gap-1.5"
                  >
                    <CheckIcon className="w-5 h-5" /> Save Changes
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
