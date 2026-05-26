import React, { useState, useEffect, useMemo } from "react";
import { customPagesAPI, coursesAPI, centresAPI } from "../../services/api";
import { 
  PlusIcon, PencilIcon, TrashIcon, LinkIcon, EyeIcon, 
  CheckIcon, XMarkIcon, SparklesIcon, PhotoIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import CourseDetailModal from "../CourseDetailModal";

export default function CustomPagesManagement() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create", "edit-sections"
  const [currentPage, setCurrentPage] = useState(null);

  // Course details & modal states for checklist
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

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
    courses: { courses_list: [], course_ids: [] },
    centers: { centers_list: [] },
    faq: { faqs_list: [] },
    contact: {}
  });

  const [activeTab, setActiveTab] = useState("hero");

  // Course Picker States (for Courses Tab)
  const [allCourses, setAllCourses] = useState([]);
  const [coursesLoadingAdmin, setCoursesLoadingAdmin] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");

  // Centres Picker States (for Centres Tab)
  const [allCentres, setAllCentres] = useState([]);
  const [centresLoadingAdmin, setCentresLoadingAdmin] = useState(false);
  const [centreSearchQuery, setCentreSearchQuery] = useState("");
  const [filterCentreState, setFilterCentreState] = useState("All");
  const [filterCentreDistrict, setFilterCentreDistrict] = useState("All");

  // Helper memo to get actual selected centre objects
  const selectedCentresObjects = useMemo(() => {
    return allCentres.filter(dbCentre => {
      return (editSections.centers.centers_list || []).some(
        selected => selected.name === dbCentre.centre
      );
    });
  }, [allCentres, editSections.centers.centers_list]);

  // Unique lists for the centre dropdown filters
  const uniqueCentreStatesAdmin = useMemo(() => {
    const s = new Set(allCentres.map(c => c.state).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [allCentres]);

  const uniqueCentreDistrictsAdmin = useMemo(() => {
    let filtered = allCentres;
    if (filterCentreState !== "All") {
      filtered = filtered.filter(c => c.state === filterCentreState);
    }
    const s = new Set(filtered.map(c => c.district).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [allCentres, filterCentreState]);

  // Detailed dropdown filter states
  const [filterCentre, setFilterCentre] = useState("All");
  const [filterProgramme, setFilterProgramme] = useState("All");
  const [filterMode, setFilterMode] = useState("All");
  const [filterDuration, setFilterDuration] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  // Helper memo to get actual selected course objects
  const selectedCoursesObjects = useMemo(() => {
    return allCourses.filter(c => {
      const cId = c.id || c._id?.$oid || c._id;
      return (editSections.courses.course_ids || []).map(String).includes(String(cId));
    });
  }, [allCourses, editSections.courses.course_ids]);

  // Unique lists for the dropdown filters
  const uniqueCentresAdmin = useMemo(() => {
    const s = new Set(allCourses.map(c => c.centre).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [allCourses]);

  const uniqueProgrammesAdmin = useMemo(() => {
    const s = new Set(allCourses.map(c => c.programme).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [allCourses]);

  const uniqueModesAdmin = useMemo(() => {
    const s = new Set(allCourses.map(c => c.mode).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [allCourses]);

  const uniqueDurationsAdmin = useMemo(() => {
    const s = new Set(allCourses.map(c => c.duration).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [allCourses]);

  const uniqueYearsAdmin = useMemo(() => {
    const s = new Set(allCourses.map(c => {
      const date = c.start_date || c.starting_date;
      if (!date) return null;
      try {
        return new Date(date).getFullYear().toString();
      } catch(e) {
        return null;
      }
    }).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [allCourses]);

  useEffect(() => {
    fetchPages();
  }, []);

  // Fetch all available courses when the edit modal opens
  useEffect(() => {
    if (isModalOpen && modalMode === "edit-sections") {
      const fetchAllCourses = async () => {
        setCoursesLoadingAdmin(true);
        try {
          const response = await coursesAPI.getAll();
          setAllCourses(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
          console.error("Failed to fetch courses for picker:", err);
          setAllCourses([]);
        } finally {
          setCoursesLoadingAdmin(false);
        }
      };

      const fetchAllCentres = async () => {
        setCentresLoadingAdmin(true);
        try {
          const response = await centresAPI.getAll();
          const centresData = Array.isArray(response.data)
            ? response.data
            : (response.data?.results || []);
          setAllCentres(centresData);
        } catch (err) {
          console.error("Failed to fetch centres for picker:", err);
          setAllCentres([]);
        } finally {
          setCentresLoadingAdmin(false);
        }
      };

      fetchAllCourses();
      fetchAllCentres();
    } else {
      setCourseSearchQuery("");
      setFilterCentre("All");
      setFilterProgramme("All");
      setFilterMode("All");
      setFilterDuration("All");
      setFilterYear("All");
      setCentreSearchQuery("");
      setFilterCentreState("All");
      setFilterCentreDistrict("All");
    }
  }, [isModalOpen, modalMode]);

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
      courses: page.courses || { courses_list: [], course_ids: [] },
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
                          placeholder="e.g. Our Programs"
                          value={editSections.courses.title || ""}
                          onChange={(e) => setEditSections({ ...editSections, courses: { ...editSections.courses, title: e.target.value } })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750 outline-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Select Courses to Display</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Checked courses appear on this page with live filter UI</p>
                          </div>
                          <span className="bg-orange-100 text-orange-700 text-xs font-extrabold px-3 py-1 rounded-full dark:bg-orange-950/20 dark:text-orange-400">
                            {(editSections.courses.course_ids || []).length} selected
                          </span>
                        </div>

                        {/* Selected Courses Display Panel */}
                        {selectedCoursesObjects.length > 0 && (
                          <div className="bg-orange-50/40 dark:bg-orange-950/5 border border-orange-100 dark:border-orange-900/20 rounded-xl p-3 space-y-2">
                            <span className="text-[10px] font-extrabold text-orange-700 dark:text-orange-400 uppercase tracking-wider block">Selected Courses (Click to remove)</span>
                            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                              {selectedCoursesObjects.map(course => {
                                const courseId = course.id || course._id?.$oid || course._id;
                                return (
                                  <div
                                    key={courseId}
                                    className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-full px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-red-400 hover:text-red-500 dark:hover:border-red-900/60 dark:hover:text-red-400 cursor-pointer group shrink-0"
                                    onClick={() => {
                                      const ids = [...(editSections.courses.course_ids || [])];
                                      setEditSections({
                                        ...editSections,
                                        courses: {
                                          ...editSections.courses,
                                          course_ids: ids.filter(id => String(id) !== String(courseId))
                                        }
                                      });
                                    }}
                                  >
                                    <span className="font-semibold truncate max-w-[150px]">{course.name}</span>
                                    {course.centre && <span className="text-[10px] text-gray-400 font-medium">({course.centre})</span>}
                                    <XMarkIcon className="w-3 h-3 text-gray-400 group-hover:text-red-500 transition-colors" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Search Bar */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by name, centre, programme..."
                            value={courseSearchQuery}
                            onChange={(e) => setCourseSearchQuery(e.target.value)}
                            className="w-full border border-gray-200 dark:border-slate-750 rounded-xl px-4 py-2.5 pl-9 text-sm dark:bg-slate-850 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          />
                          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>

                        {/* Dropdown Filters */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 bg-gray-50 dark:bg-slate-850 p-3 rounded-xl border border-gray-150 dark:border-slate-800">
                          {/* Centre Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Centre</label>
                            <select
                              value={filterCentre}
                              onChange={(e) => setFilterCentre(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-gray-200"
                            >
                              {uniqueCentresAdmin.map(opt => (
                                <option key={opt} value={opt}>{opt === "All" ? "All Centres" : opt}</option>
                              ))}
                            </select>
                          </div>

                          {/* Programme Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Programme</label>
                            <select
                              value={filterProgramme}
                              onChange={(e) => setFilterProgramme(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-gray-200"
                            >
                              {uniqueProgrammesAdmin.map(opt => (
                                <option key={opt} value={opt}>{opt === "All" ? "All Programmes" : opt}</option>
                              ))}
                            </select>
                          </div>

                          {/* Mode Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Mode</label>
                            <select
                              value={filterMode}
                              onChange={(e) => setFilterMode(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-gray-200"
                            >
                              {uniqueModesAdmin.map(opt => (
                                <option key={opt} value={opt}>{opt === "All" ? "All Modes" : opt}</option>
                              ))}
                            </select>
                          </div>

                          {/* Duration Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Duration</label>
                            <select
                              value={filterDuration}
                              onChange={(e) => setFilterDuration(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-gray-200"
                            >
                              {uniqueDurationsAdmin.map(opt => (
                                <option key={opt} value={opt}>{opt === "All" ? "All Durations" : opt}</option>
                              ))}
                            </select>
                          </div>

                          {/* Year Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Year</label>
                            <select
                              value={filterYear}
                              onChange={(e) => setFilterYear(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-gray-200"
                            >
                              {uniqueYearsAdmin.map(opt => (
                                <option key={opt} value={opt}>{opt === "All" ? "All Years" : opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        {allCourses.length > 0 && (
                          <div className="flex gap-2 justify-between items-center">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const visible = allCourses.filter(c => {
                                    const matchSearch = !courseSearchQuery ||
                                      c.name?.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                                      c.centre?.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                                      c.programme?.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                                      c.target_exam?.toLowerCase().includes(courseSearchQuery.toLowerCase());

                                    const matchCentre = filterCentre === "All" || c.centre === filterCentre;
                                    const matchProgramme = filterProgramme === "All" || c.programme === filterProgramme;
                                    const matchMode = filterMode === "All" || c.mode === filterMode;
                                    const matchDuration = filterDuration === "All" || c.duration === filterDuration;

                                    let matchYear = true;
                                    if (filterYear !== "All") {
                                      const date = c.start_date || c.starting_date;
                                      if (date) {
                                        try {
                                          matchYear = new Date(date).getFullYear().toString() === filterYear;
                                        } catch (e) {
                                          matchYear = false;
                                        }
                                      } else {
                                        matchYear = false;
                                      }
                                    }

                                    return matchSearch && matchCentre && matchProgramme && matchMode && matchDuration && matchYear;
                                  });

                                  const visibleIds = visible.map(c => c.id || c._id?.$oid || c._id).filter(Boolean);
                                  const newIds = [...new Set([...(editSections.courses.course_ids || []), ...visibleIds])];
                                  setEditSections({
                                    ...editSections,
                                    courses: { ...editSections.courses, course_ids: newIds }
                                  });
                                }}
                                className="text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                ✓ Select all filtered
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditSections({ ...editSections, courses: { ...editSections.courses, course_ids: [] } })}
                                className="text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Clear all
                              </button>
                            </div>
                            {(filterCentre !== "All" || filterProgramme !== "All" || filterMode !== "All" || filterDuration !== "All" || filterYear !== "All" || courseSearchQuery) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCourseSearchQuery("");
                                  setFilterCentre("All");
                                  setFilterProgramme("All");
                                  setFilterMode("All");
                                  setFilterDuration("All");
                                  setFilterYear("All");
                                }}
                                className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1 rounded transition-all animate-pulse"
                              >
                                Reset Filters
                              </button>
                            )}
                          </div>
                        )}

                        {/* Course Checklist */}
                        {coursesLoadingAdmin ? (
                          <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-xl">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              <p className="text-xs text-gray-500">Loading courses...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="max-h-80 overflow-y-auto border border-gray-200 dark:border-slate-750 rounded-xl bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
                            {(() => {
                              const filtered = allCourses.filter(c => {
                                const matchSearch = !courseSearchQuery ||
                                  c.name?.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                                  c.centre?.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                                  c.programme?.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                                  c.target_exam?.toLowerCase().includes(courseSearchQuery.toLowerCase());

                                const matchCentre = filterCentre === "All" || c.centre === filterCentre;
                                const matchProgramme = filterProgramme === "All" || c.programme === filterProgramme;
                                const matchMode = filterMode === "All" || c.mode === filterMode;
                                const matchDuration = filterDuration === "All" || c.duration === filterDuration;

                                let matchYear = true;
                                if (filterYear !== "All") {
                                  const date = c.start_date || c.starting_date;
                                  if (date) {
                                    try {
                                      matchYear = new Date(date).getFullYear().toString() === filterYear;
                                    } catch (e) {
                                      matchYear = false;
                                    }
                                  } else {
                                    matchYear = false;
                                  }
                                }

                                return matchSearch && matchCentre && matchProgramme && matchMode && matchDuration && matchYear;
                              });

                              if (allCourses.length === 0) {
                                return (
                                  <div className="text-center py-10">
                                    <div className="text-3xl mb-2">📚</div>
                                    <p className="text-sm text-gray-400">No courses found in the system</p>
                                    <p className="text-xs text-gray-400 mt-1">Add courses via the Courses management section first</p>
                                  </div>
                                );
                              }
                                if (filtered.length === 0) {
                                return (
                                  <div className="text-center py-10 text-sm text-gray-400">No courses match your search</div>
                                );
                              }

                              return filtered.map((course) => {
                                const courseId = course.id || course._id?.$oid || course._id;
                                const isSelected = (editSections.courses.course_ids || []).map(String).includes(String(courseId));
                                const isExpanded = expandedCourseId === courseId;

                                return (
                                  <div key={courseId} className="border-b border-gray-100 dark:border-slate-800 last:border-b-0">
                                    <div
                                      className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-orange-50/60 dark:hover:bg-slate-800 ${isSelected ? 'bg-orange-50/40 dark:bg-orange-950/10' : ''}`}
                                      onClick={() => {
                                        const ids = [...(editSections.courses.course_ids || [])];
                                        setEditSections({
                                          ...editSections,
                                          courses: {
                                            ...editSections.courses,
                                            course_ids: isSelected
                                              ? ids.filter(id => String(id) !== String(courseId))
                                              : [...ids, courseId]
                                          }
                                        });
                                      }}
                                    >
                                      {/* Checkbox */}
                                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-slate-600'}`}>
                                        {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                      </div>
                                      {/* Info */}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{course.name}</div>
                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                          {course.centre && <span>📍 {course.centre}</span>}
                                          {course.duration && <span>⏳ {course.duration}{parseInt(course.duration) > 1 ? ' yrs' : parseInt(course.duration) === 1 ? ' yr' : ''}</span>}
                                          {course.mode && <span>🎥 {course.mode}</span>}
                                          {course.programme && <span>📖 {course.programme}</span>}
                                        </div>
                                      </div>
                                      {/* Actions */}
                                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        {course.target_exam && (
                                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400 px-2 py-0.5 rounded-full shrink-0">
                                            {course.target_exam}
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedCourseForModal(course);
                                            setIsCourseModalOpen(true);
                                          }}
                                          className="text-[10px] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-2 py-1 rounded transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
                                        >
                                          View Details
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setExpandedCourseId(isExpanded ? null : courseId)}
                                          className="p-1 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 rounded transition-all"
                                        >
                                          <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Inline Details Dropdown */}
                                    {isExpanded && (
                                      <div className="px-12 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-gray-100 dark:border-slate-800/85 text-xs text-gray-600 dark:text-gray-300 space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Course Title</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{course.course_title || "N/A"}</span>
                                          </div>
                                          <div>
                                            <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Language</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{course.language || "English"}</span>
                                          </div>
                                          <div>
                                            <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Base Price</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">₹{parseFloat(course.course_price || 0).toLocaleString()}</span>
                                          </div>
                                          <div>
                                            <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Discounted Price</span>
                                            <span className="font-semibold text-red-600 dark:text-red-400">
                                              {course.discounted_price ? `₹${parseFloat(course.discounted_price).toLocaleString()}` : "N/A"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Start Date</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                              {course.start_date || course.starting_date ? new Date(course.start_date || course.starting_date).toLocaleDateString() : "Coming Soon"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Validity</span>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">
                                              {course.validity_date ? new Date(course.validity_date).toLocaleDateString() : "N/A"}
                                            </span>
                                          </div>
                                        </div>
                                        {course.description && (
                                          <div>
                                            <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-wider text-[9px]">Description</span>
                                            <p className="leading-relaxed text-slate-700 dark:text-slate-300">{course.description}</p>
                                          </div>
                                        )}
                                        {course.plans && course.plans.length > 0 && (
                                          <div>
                                            <span className="font-bold text-gray-400 block mb-1 uppercase tracking-wider text-[9px]">Infinity Plans ({course.plans.length})</span>
                                            <div className="space-y-1 bg-white dark:bg-slate-950 p-2 rounded-lg border border-gray-150 dark:border-slate-850">
                                              {course.plans.map((p, pIdx) => (
                                                <div key={pIdx} className="flex justify-between items-center py-0.5 border-b border-gray-50 dark:border-slate-900 last:border-b-0">
                                                  <span className="font-bold text-slate-800 dark:text-slate-200">{p.name || `Plan ${pIdx+1}`}</span>
                                                  <span className="text-slate-650 dark:text-slate-350">
                                                    ₹{parseFloat(p.discounted_price || p.base_price).toLocaleString()} 
                                                    {parseFloat(p.base_price) > parseFloat(p.discounted_price) && (
                                                      <span className="text-[10px] text-gray-450 line-through ml-1.5">₹{parseFloat(p.base_price).toLocaleString()}</span>
                                                    )}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        )}

                        {/* Selected Summary */}
                        {(editSections.courses.course_ids || []).length > 0 && (
                          <div className="bg-green-50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/20 rounded-xl p-3 flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                            <CheckIcon className="w-4 h-4 shrink-0" />
                            <span className="font-bold">{editSections.courses.course_ids.length} course{editSections.courses.course_ids.length !== 1 ? 's' : ''} selected</span>
                            <span className="text-green-600/70 dark:text-green-500/60">— Shown with live Centre, Programme &amp; Mode filters on the page</span>
                          </div>
                        )}
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
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm dark:bg-slate-850 dark:border-slate-750 outline-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">Select Centers to Display</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Checked centers appear on this page with coordinates/address details</p>
                          </div>
                          <span className="bg-orange-100 text-orange-700 text-xs font-extrabold px-3 py-1 rounded-full dark:bg-orange-950/20 dark:text-orange-400">
                            {(editSections.centers.centers_list || []).length} selected
                          </span>
                        </div>

                        {/* Selected Centers Display Panel */}
                        {(editSections.centers.centers_list || []).length > 0 && (
                          <div className="bg-orange-50/40 dark:bg-orange-950/5 border border-orange-100 dark:border-orange-900/20 rounded-xl p-3 space-y-2">
                            <span className="text-[10px] font-extrabold text-orange-700 dark:text-orange-400 uppercase tracking-wider block">Selected Centers (Click to remove)</span>
                            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                              {(editSections.centers.centers_list || []).map(centre => {
                                return (
                                  <div
                                    key={centre.name}
                                    className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-orange-200 dark:border-slate-700 rounded-full px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-red-400 hover:text-red-500 dark:hover:border-red-900/60 dark:hover:text-red-400 cursor-pointer group shrink-0"
                                    onClick={() => {
                                      const list = [...(editSections.centers.centers_list || [])];
                                      setEditSections({
                                        ...editSections,
                                        centers: {
                                          ...editSections.centers,
                                          centers_list: list.filter(item => item.name !== centre.name)
                                        }
                                      });
                                    }}
                                  >
                                    <span className="font-semibold truncate max-w-[150px]">{centre.name}</span>
                                    {centre.district && <span className="text-[10px] text-gray-400 font-medium">({centre.district})</span>}
                                    <XMarkIcon className="w-3 h-3 text-gray-400 group-hover:text-red-500 transition-colors" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Search Bar */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by name, state, district..."
                            value={centreSearchQuery}
                            onChange={(e) => setCentreSearchQuery(e.target.value)}
                            className="w-full border border-gray-200 dark:border-slate-750 rounded-xl px-4 py-2.5 pl-9 text-sm dark:bg-slate-850 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                          />
                          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>

                        {/* Dropdown Filters */}
                        <div className="grid grid-cols-2 gap-2.5 bg-gray-50 dark:bg-slate-850 p-3 rounded-xl border border-gray-150 dark:border-slate-800">
                          {/* State Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">State Jurisdiction</label>
                            <select
                              value={filterCentreState}
                              onChange={(e) => {
                                setFilterCentreState(e.target.value);
                                setFilterCentreDistrict("All");
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-gray-200"
                            >
                              {uniqueCentreStatesAdmin.map(opt => (
                                <option key={opt} value={opt}>{opt === "All" ? "All States" : opt}</option>
                              ))}
                            </select>
                          </div>

                          {/* District Filter */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">District Sector</label>
                            <select
                              value={filterCentreDistrict}
                              onChange={(e) => setFilterCentreDistrict(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 dark:text-gray-200"
                            >
                              {uniqueCentreDistrictsAdmin.map(opt => (
                                <option key={opt} value={opt}>{opt === "All" ? "All Districts" : opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        {allCentres.length > 0 && (
                          <div className="flex gap-2 justify-between items-center">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const visible = allCentres.filter(c => {
                                    const matchSearch = !centreSearchQuery ||
                                      c.centre?.toLowerCase().includes(centreSearchQuery.toLowerCase()) ||
                                      c.district?.toLowerCase().includes(centreSearchQuery.toLowerCase()) ||
                                      c.state?.toLowerCase().includes(centreSearchQuery.toLowerCase());

                                    const matchState = filterCentreState === "All" || c.state === filterCentreState;
                                    const matchDistrict = filterCentreDistrict === "All" || c.district === filterCentreDistrict;

                                    return matchSearch && matchState && matchDistrict;
                                  });

                                  const list = [...(editSections.centers.centers_list || [])];
                                  visible.forEach(dbCentre => {
                                    if (!list.some(item => item.name === dbCentre.centre)) {
                                      list.push({
                                        name: dbCentre.centre,
                                        phone: dbCentre.mobile || dbCentre.phone || "",
                                        address: dbCentre.address,
                                        location: dbCentre.location || "",
                                        id: dbCentre.id || dbCentre._id?.$oid || dbCentre._id,
                                        logo_url: dbCentre.logo_url || "",
                                        centre_type: dbCentre.centre_type || "",
                                        is_franchise: dbCentre.is_franchise || false,
                                        district: dbCentre.district || "",
                                        state: dbCentre.state || "",
                                        toppers: dbCentre.toppers || [],
                                        centre_code: dbCentre.centre_code || "",
                                        email: dbCentre.email || ""
                                      });
                                    }
                                  });
                                  setEditSections({
                                    ...editSections,
                                    centers: { ...editSections.centers, centers_list: list }
                                  });
                                }}
                                className="text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                ✓ Select all filtered
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditSections({ ...editSections, centers: { ...editSections.centers, centers_list: [] } })}
                                className="text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Clear all
                              </button>
                            </div>
                            {(filterCentreState !== "All" || filterCentreDistrict !== "All" || centreSearchQuery) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCentreSearchQuery("");
                                  setFilterCentreState("All");
                                  setFilterCentreDistrict("All");
                                }}
                                className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 py-1 rounded transition-all animate-pulse"
                              >
                                Reset Filters
                              </button>
                            )}
                          </div>
                        )}

                        {/* Centre Checklist */}
                        {centresLoadingAdmin ? (
                          <div className="flex items-center justify-center py-12 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-750 rounded-xl">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              <p className="text-xs text-gray-500">Loading network centres...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="max-h-[640px] overflow-y-auto border border-gray-200 dark:border-slate-750 rounded-xl bg-gray-50 dark:bg-slate-900 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(() => {
                              const filtered = allCentres.filter(c => {
                                const matchSearch = !centreSearchQuery ||
                                  c.centre?.toLowerCase().includes(centreSearchQuery.toLowerCase()) ||
                                  c.district?.toLowerCase().includes(centreSearchQuery.toLowerCase()) ||
                                  c.state?.toLowerCase().includes(centreSearchQuery.toLowerCase());

                                const matchState = filterCentreState === "All" || c.state === filterCentreState;
                                const matchDistrict = filterCentreDistrict === "All" || c.district === filterCentreDistrict;

                                return matchSearch && matchState && matchDistrict;
                              });

                              if (allCentres.length === 0) {
                                return (
                                  <div className="text-center py-10">
                                    <div className="text-3xl mb-2">📍</div>
                                    <p className="text-sm text-gray-400">No centres found in the system</p>
                                    <p className="text-xs text-gray-400 mt-1">Add centres via the Network management section first</p>
                                  </div>
                                );
                              }
                              if (filtered.length === 0) {
                                return (
                                  <div className="text-center py-10 text-sm text-gray-400">No centres match your search</div>
                                );
                              }

                              return filtered.map((centre) => {
                                const centreId = centre.id || centre._id?.$oid || centre._id;
                                const isSelected = (editSections.centers.centers_list || []).some(
                                  item => item.name === centre.centre
                                );

                                return (
                                  <div
                                    key={centreId}
                                    onClick={() => {
                                      const list = [...(editSections.centers.centers_list || [])];
                                      if (isSelected) {
                                        setEditSections({
                                          ...editSections,
                                          centers: {
                                            ...editSections.centers,
                                            centers_list: list.filter(item => item.name !== centre.centre)
                                          }
                                        });
                                      } else {
                                        setEditSections({
                                          ...editSections,
                                          centers: {
                                            ...editSections.centers,
                                            centers_list: [
                                              ...list,
                                              {
                                                name: centre.centre,
                                                phone: centre.mobile || centre.phone || "",
                                                address: centre.address,
                                                location: centre.location || "",
                                                id: centreId,
                                                logo_url: centre.logo_url || "",
                                                centre_type: centre.centre_type || "",
                                                is_franchise: centre.is_franchise || false,
                                                district: centre.district || "",
                                                state: centre.state || "",
                                                toppers: centre.toppers || [],
                                                centre_code: centre.centre_code || "",
                                                email: centre.email || ""
                                              }
                                            ]
                                          }
                                        });
                                      }
                                    }}
                                    className={`group relative bg-white rounded-2xl border-2 p-3.5 cursor-pointer transition-all duration-300 overflow-hidden select-none
                                      ${ isSelected
                                        ? 'border-orange-500 shadow-lg shadow-orange-500/20 -translate-y-0.5'
                                        : 'border-slate-100 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-0.5 hover:border-orange-200'
                                      }`}
                                  >
                                    {/* Selected glow overlay */}
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-orange-500/5 pointer-events-none rounded-2xl" />
                                    )}

                                    {/* Top Row: Logo + Badges + Checkbox */}
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                      {/* Logo */}
                                      <div className={`h-11 w-11 rounded-xl border flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-sm ${ isSelected ? 'border-orange-300' : 'bg-neutral-100 border-slate-100 group-hover:border-orange-200' }`}>
                                        <img
                                          src={centre.logo_url || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=200&auto=format&fit=crop"}
                                          alt={centre.centre}
                                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=200&auto=format&fit=crop"; }}
                                        />
                                      </div>

                                      {/* Right side: badges + checkbox */}
                                      <div className="flex flex-col items-end gap-1.5">
                                        {/* Checkbox */}
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${ isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-800' }`}>
                                          {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                                        </div>
                                        {/* Type badge */}
                                        {centre.centre_type && (
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${ centre.centre_type === 'Instation' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700' }`}>
                                            {centre.centre_type}
                                          </span>
                                        )}
                                        {centre.is_franchise && (
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                                            Franchise
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Centre Name & Location */}
                                    <div className="mb-2.5 relative z-10">
                                      <h3 className={`text-sm font-black truncate transition-colors duration-300 ${ isSelected ? 'text-orange-600' : 'text-slate-900 group-hover:text-orange-600' }`}>
                                        {centre.centre}
                                      </h3>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {[centre.district, centre.state].filter(Boolean).join(", ")}
                                      </p>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 gap-2 mb-2.5 relative z-10">
                                      <div className={`rounded-xl p-2 border transition-all duration-300 ${ isSelected ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100 group-hover:bg-white group-hover:border-orange-100' }`}>
                                        <div className="text-[9px] font-bold text-slate-500 mb-0.5">Toppers</div>
                                        <div className="flex items-center gap-1">
                                          <svg className="w-3 h-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                          <span className="text-xs font-black text-slate-900">{centre.toppers?.length || 0}+</span>
                                        </div>
                                      </div>
                                      <div className={`rounded-xl p-2 border transition-all duration-300 ${ isSelected ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100 group-hover:bg-white group-hover:border-orange-100' }`}>
                                        <div className="text-[9px] font-bold text-slate-500 mb-0.5">Code</div>
                                        <div className="flex items-center gap-1">
                                          <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                          <span className="text-xs font-black text-slate-900 truncate">{centre.centre_code || "—"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Address */}
                                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 min-h-[16px] relative z-10">
                                      {centre.address || "Address details being updated."}
                                    </p>

                                    {/* Bottom selection indicator */}
                                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-orange-500 transition-all duration-500 ${ isSelected ? 'w-full' : 'w-0 group-hover:w-full' }`} />
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        )}
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

      {/* CourseDetailModal for previewing course details inside Admin Panel */}
      <CourseDetailModal
        course={selectedCourseForModal}
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setSelectedCourseForModal(null);
        }}
      />
    </div>
  );
}
