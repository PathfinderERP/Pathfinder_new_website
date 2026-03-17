import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { centresAPI } from "../../services/api";
import DragDropImageUpload from "../DragDropImageUpload";
import { clearAdminCache } from "../../hooks/useAdminCache";
import ImageModal from "../ImageModal";

const EXAM_OPTIONS = {
  "All India": ["JEE", "NEET", "WBJEE", "Others"],
  "Boards": ["CBSE-X", "CBSE-XII", "H.S", "ICSE", "ISC", "Madhyamik", "Others"],
  "Foundation": ["PHASE TEST 1", "PHASE TEST 2", "PHASE TEST 3", "Others"],
};

const CentreEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Refs for scrolling
  const toppersSectionRef = React.useRef(null);
  const topperRefs = React.useRef({});

  // Add modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalAlt, setModalAlt] = useState("");

  const [centreData, setCentreData] = useState({
    state: "West Bengal",
    district: "",
    centre: "",
    centre_type: "",
    location: "",
    address: "",
    toppers: [],
  });

  // Store files separately for upload
  const [logoFile, setLogoFile] = useState(null);
  const [topperFiles, setTopperFiles] = useState({});
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");

  // Handle scroll to section if requested
  useEffect(() => {
    if (!loading && location.state?.focusSection) {
      if (location.state.focusSection === 'toppers') {
        // Wait a tiny bit for render
        setTimeout(() => {
          if (location.state.topperIndex !== undefined && topperRefs.current[location.state.topperIndex]) {
            topperRefs.current[location.state.topperIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight effect
            topperRefs.current[location.state.topperIndex].classList.add('ring-2', 'ring-blue-500');
            setTimeout(() => {
              topperRefs.current[location.state.topperIndex]?.classList.remove('ring-2', 'ring-blue-500');
            }, 2000);
          } else if (toppersSectionRef.current) {
            toppersSectionRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [loading, location.state]);

  // Fetch centre data and initial data on component mount
  useEffect(() => {
    fetchCentreData();
    fetchInitialData();
  }, [id]);

  // Fetch districts when state changes
  useEffect(() => {
    if (centreData.state) {
      fetchDistricts(centreData.state);
    }
  }, [centreData.state]);

  // Add image click handlers
  const handleLogoClick = (logoUrl, centreName) => {
    if (logoUrl) {
      setSelectedImage(logoUrl);
      setModalAlt(`${centreName} Logo`);
    }
  };

  const handleTopperImageClick = (imageUrl, topperName) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setModalAlt(`${topperName} Photo`);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalAlt("");
  };

  const fetchCentreData = async () => {
    try {
      setLoading(true);
      const response = await centresAPI.getById(id);
      const centre = response.data;

      
      

      // Format the centre data for the form
      setCentreData({
        state: centre.state || "West Bengal",
        district: centre.district || "",
        centre: centre.centre || "",
        centre_type: centre.centre_type || "",
        location: centre.location || "",
        address: centre.address || "",
        logo_url: centre.logo_url || "", // Track logo URL in centreData
        toppers: (centre.toppers || []).map(topper => ({
          ...topper,
          name: topper.name || "",
          exam: topper.exam || "",
          category: topper.category || "All India",
          rank: topper.rank || "",
          topper_msg: topper.topper_msg || "",
          percentages: topper.percentages || "",
          year: topper.year || new Date().getFullYear(),
          marks_obtained: topper.marks_obtained || "",
          total_marks: topper.total_marks || "",
          badge: topper.badge || "",
          image_url: topper.image_url || "" // Track image URL in topper object
        })),
      });

      // Set current logo URL for display
      setCurrentLogoUrl(centre.logo_url || "");
    } catch (err) {
      setError("Failed to fetch centre data");
      console.error("Error fetching centre:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [statesResponse] = await Promise.all([centresAPI.getStates()]);
      setStates(statesResponse.data);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    }
  };

  const fetchDistricts = async (state) => {
    try {
      const response = await centresAPI.getDistricts(state);
      setDistricts(response.data);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  // Handle logo upload
  const handleLogoSelect = (file) => {
    setLogoFile(file);
  };

  // Handle topper image upload
  const handleTopperImageSelect = (file, topperIndex) => {
    if (!file) {
      // Remove file
      setTopperFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[topperIndex];
        return newFiles;
      });
      return;
    }

    // Store file for upload
    setTopperFiles((prev) => ({
      ...prev,
      [topperIndex]: file,
    }));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setCurrentLogoUrl("");
    setCentreData(prev => ({ ...prev, logo_url: "" }));
    
  };

  const handleRemoveTopperImage = (index) => {
    // Remove if there was a newly selected file
    setTopperFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });

    // Clear the existing URL in state
    setCentreData((prev) => {
      const updatedToppers = [...prev.toppers];
      updatedToppers[index] = {
        ...updatedToppers[index],
        image_url: ""
      };
      return { ...prev, toppers: updatedToppers };
    });
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      

      // VALIDATE GOOGLE MAPS URL - ACCEPT ALL FORMATS
      const isValidGoogleMapsUrl =
        centreData.location &&
        (centreData.location.startsWith("https://www.google.com/maps/") ||
          centreData.location.startsWith("https://maps.google.com/") ||
          centreData.location.startsWith("https://goo.gl/maps/") ||
          centreData.location.includes("google.com/maps/embed") ||
          centreData.location.includes("google.com/maps/d/embed"));

      if (!isValidGoogleMapsUrl) {
        setError("Please enter a valid Google Maps URL");
        setSaving(false);
        return;
      }

      

      // ✅ FIXED: Update centre data WITHOUT image fields to prevent data loss 
      // UNLESS they are explicitly cleared
      const dataToSend = {
        state: centreData.state,
        district: centreData.district,
        centre: centreData.centre,
        centre_type: centreData.centre_type,
        location: centreData.location,
        address: centreData.address,
        // Send clear signal for logo if removed
        logo: currentLogoUrl === "" ? "" : undefined,
        // ✅ Send topper text data
        toppers: centreData.toppers.map((topper) => ({
          name: topper.name,
          exam: topper.exam || "",
          category: topper.category || "All India",
          rank: topper.rank ? parseInt(topper.rank) : 0,
          topper_msg: topper.topper_msg || "",
          percentages: topper.percentages ? parseFloat(topper.percentages) : 0,
          year: topper.year ? parseInt(topper.year) : new Date().getFullYear(),
          marks_obtained: topper.marks_obtained ? parseFloat(topper.marks_obtained) : null,
          total_marks: topper.total_marks ? parseFloat(topper.total_marks) : null,
          badge: topper.badge || "",
          // Send clear signal for topper image if removed
          image: topper.image_url === "" ? "" : undefined,
        })),
      };

      
      
      await centresAPI.update(id, dataToSend);
      

      // Step 2: Upload new logo if provided
      if (logoFile) {
        try {
          
          await centresAPI.uploadCentreLogo(id, logoFile);
          
        } catch (logoError) {
          console.error("❌ Logo upload failed:", logoError);
          // Don't stop the process for logo errors
        }
      }

      // Step 3: Handle topper image updates for EXISTING toppers
      // Step 3: Handle topper image updates for EXISTING toppers
      

      const topperImageUploadPromises = Object.entries(topperFiles).map(
        async ([index, file]) => {
          const topperIndex = parseInt(index);
          const topper = centreData.toppers[topperIndex];

          if (!topper) {
            console.error(`❌ Topper not found at index ${topperIndex}`);
            return { success: false, error: "Topper not found" };
          }

          try {
            
            
            

            // ✅ Create FormData - SIMPLIFIED VERSION FOR TESTING
            const formData = new FormData();

            // ✅ CRITICAL: Make sure file is properly appended
            formData.append("image", file);
            formData.append("topper_index", topperIndex.toString());

            // ✅ DEBUG: Check FormData contents
            
            
            

            // Try to log FormData entries (this might not work in all browsers)
            try {
              for (let [key, value] of formData.entries()) {
                if (key === "image") {
                  
                } else {
                  
                }
              }
            } catch (e) {
              
            }

            // ✅ Use the API call with better error handling
            

            const response = await centresAPI.uploadTopperImage(id, formData);

            
            

            return {
              success: true,
              index: topperIndex,
              topperName: topper.name,
            };
          } catch (topperError) {
            console.error(
              `❌ Failed to upload image for topper "${topper.name}":`,
              topperError
            );

            // Log detailed error information
            if (topperError.response) {
              console.error(
                "📋 Error response data:",
                topperError.response.data
              );
              console.error("🔢 Error status:", topperError.response.status);
              console.error("📋 Error headers:", topperError.response.headers);
            } else if (topperError.request) {
              console.error("❌ No response received:", topperError.request);
            } else {
              console.error(
                "❌ Error setting up request:",
                topperError.message
              );
            }

            console.error("🔧 Error config:", topperError.config);

            return {
              success: false,
              index: topperIndex,
              topperName: topper.name,
              error: topperError.response?.data || topperError.message,
            };
          }
        }
      );

      // Wait for all topper image uploads to complete
      if (topperImageUploadPromises.length > 0) {
        
        const results = await Promise.allSettled(topperImageUploadPromises);

        // Count and log results
        let successCount = 0;
        let failCount = 0;

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const uploadResult = result.value;
            if (uploadResult.success) {
              
              successCount++;
            } else {
              
              failCount++;
            }
          } else {
            
            failCount++;
          }
        });

        
        
        
        
      } else {
        
      }

      
      alert("Centre updated successfully!");
      clearAdminCache("admin_centres");
      navigate("/business/admin/centres?refresh=true");
    } catch (err) {
      console.error("💥 CENTRE UPDATE FAILED:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to update centre"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCentreData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Topper Functions
  const addTopper = () => {
    setCentreData((prev) => ({
      ...prev,
      toppers: [
        ...prev.toppers,
        {
          name: "",
          exam: "",
          category: "All India",
          rank: "",
          topper_msg: "",
          percentages: "",
          year: new Date().getFullYear(),
          marks_obtained: "",
          total_marks: "",
          badge: "",
        },
      ],
    }));
  };

  const updateTopper = (index, field, value) => {
    setCentreData((prev) => {
      const updatedToppers = [...prev.toppers];
      updatedToppers[index] = {
        ...updatedToppers[index],
        [field]: value,
      };

      // Auto-calculate percentage when marks_obtained or total_marks changes
      if (field === "marks_obtained" || field === "total_marks") {
        const marksObtained = parseFloat(
          field === "marks_obtained" ? value : updatedToppers[index].marks_obtained
        );
        const totalMarks = parseFloat(
          field === "total_marks" ? value : updatedToppers[index].total_marks
        );

        if (!isNaN(marksObtained) && !isNaN(totalMarks) && totalMarks > 0) {
          const percentage = (marksObtained / totalMarks) * 100;
          updatedToppers[index].percentages = percentage.toFixed(2);
        }
      }

      return { ...prev, toppers: updatedToppers };
    });
  };

  const removeTopper = (index) => {
    setCentreData((prev) => ({
      ...prev,
      toppers: prev.toppers.filter((_, i) => i !== index),
    }));

    // Remove any stored file for this topper
    setTopperFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
  };

  const handleDeleteCentre = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this centre? This action cannot be undone."
      )
    ) {
      try {
        await centresAPI.delete(id);
        alert("Centre deleted successfully!");
        clearAdminCache("admin_centres");
        navigate("/business/admin/centres?refresh=true");
      } catch (err) {
        setError("Failed to delete centre");
        console.error("Delete centre error:", err);
      }
    }
  };

  // Helper function to get topper image URL
  const getTopperImageUrl = (topper) => {
    // Try different possible image URL fields
    if (topper.image_url) return topper.image_url;
    if (topper.image) return topper.image;
    if (topper.image_data && topper.image_content_type) {
      return `data:${topper.image_content_type};base64,${topper.image_data}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-6 transition-colors duration-300">
      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage}
        alt={modalAlt}
        onClose={closeModal}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Centre</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update centre details and information
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/business/admin/centres")}
              className="bg-gray-500 hover:bg-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Back to Centres
            </button>
            <button
              onClick={handleDeleteCentre}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Delete Centre
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <strong>Debug Info:</strong>
          <div className="text-sm mt-1">
            Centre ID: {id} | Toppers Count: {centreData.toppers.length}
          </div>
          {centreData.toppers.map((topper, index) => (
            <div key={index} className="text-sm mt-1">
              Topper {index + 1}: "{topper.name}" - Has Image:{" "}
              {getTopperImageUrl(topper) ? "Yes" : "No"}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-gray-200 dark:border-slate-800">
          <form onSubmit={handleSubmit}>
            {/* Centre Logo Upload Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Centre Logo
              </h3>
              <div className="max-w-xs">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Logo
                  </label>
                  {currentLogoUrl ? (
                    <div className="flex flex-col space-y-2">
                      <div
                        className="relative group cursor-pointer transform hover:scale-105 transition duration-200 inline-block"
                      >
                        <img
                          src={currentLogoUrl}
                          alt="Current centre logo"
                          className="h-20 w-20 rounded-lg object-cover border border-gray-300"
                          onClick={() =>
                            handleLogoClick(currentLogoUrl, centreData.centre)
                          }
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLogo();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Logo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-blue-600 text-center flex flex-col space-y-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleLogoClick(currentLogoUrl, centreData.centre)}
                          className="hover:underline"
                        >
                          Click to view full size
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-red-600 hover:text-red-700 font-medium hover:underline flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove Logo
                        </button>
                      </div>
                      <span className="text-sm text-green-600">
                        Logo is stored in database
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No logo uploaded yet
                    </div>
                  )}
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Logo
                </label>
                <DragDropImageUpload
                  onImageUpload={handleLogoSelect}
                  existingImageUrl=""
                  uploading={false}
                />
                {logoFile && (
                  <p className="text-sm text-blue-600 mt-2">
                    ✓ New logo ready for upload
                  </p>
                )}
              </div>
            </div>

            {/* Centre Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Centre Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <select
                    name="state"
                    value={centreData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    District *
                  </label>
                  <select
                    name="district"
                    value={centreData.district}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Centre Name *
                  </label>
                  <input
                    type="text"
                    name="centre"
                    value={centreData.centre}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="e.g., hazra, saltlake"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Centre Type *
                  </label>
                  <select
                    name="centre_type"
                    value={centreData.centre_type}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Instation">Instation</option>
                    <option value="Outstation">Outstation</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Location (Google Maps link) *
                  </label>
                  <textarea
                    name="location"
                    value={centreData.location}
                    onChange={handleChange}
                    rows={4}
                    className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 ${centreData.location &&
                      !(
                        centreData.location.startsWith(
                          "https://www.google.com/maps/"
                        ) ||
                        centreData.location.startsWith(
                          "https://maps.google.com/"
                        ) ||
                        centreData.location.startsWith(
                          "https://goo.gl/maps/"
                        ) ||
                        centreData.location.includes("google.com/maps/embed") ||
                        centreData.location.includes("google.com/maps/d/embed")
                      )
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                      }`}
                    required
                    placeholder="Any Google Maps URL"
                  />
                  {centreData.location &&
                    !(
                      centreData.location.startsWith(
                        "https://www.google.com/maps/"
                      ) ||
                      centreData.location.startsWith(
                        "https://maps.google.com/"
                      ) ||
                      centreData.location.startsWith("https://goo.gl/maps/") ||
                      centreData.location.includes("google.com/maps/embed") ||
                      centreData.location.includes("google.com/maps/d/embed")
                    ) && (
                      <p className="mt-1 text-sm text-red-600">
                        Please enter a valid Google Maps URL
                      </p>
                    )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Address *
                  </label>
                  <textarea
                    name="address"
                    value={centreData.address}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Complete address with pin code"
                  />
                </div>
              </div>
            </div>

            {/* Toppers Section */}
            <div className="mb-8" ref={toppersSectionRef}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Topper Details ({centreData.toppers.length})
                </h3>
                <button
                  type="button"
                  onClick={addTopper}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                >
                  Add Topper
                </button>
              </div>

              {centreData.toppers.map((topper, index) => {
                const imageUrl = getTopperImageUrl(topper);

                return (
                  <div
                    key={index}
                    ref={el => topperRefs.current[index] = el}
                    className="border border-gray-200 rounded-lg p-6 mb-4 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Topper #{index + 1}
                        <span className="ml-2 text-xs text-gray-500">
                          (Index: {index})
                        </span>
                        {topperFiles[index] && (
                          <span className="ml-2 text-sm text-blue-600">
                            (New image ready for upload)
                          </span>
                        )}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeTopper(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Topper
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Topper Name *
                        </label>
                        <input
                          type="text"
                          value={topper.name}
                          onChange={(e) =>
                            updateTopper(index, "name", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="Enter topper name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Exam *
                        </label>
                        <select
                          value={(() => {
                            const category = topper.category || "All India";
                            const options = EXAM_OPTIONS[category] || [];
                            if (options.includes(topper.exam)) return topper.exam;
                            if (topper.exam) return "Others";
                            return "";
                          })()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "Others") {
                              updateTopper(index, "exam", "Others");
                            } else {
                              updateTopper(index, "exam", val);
                            }
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 mb-2"
                        >
                          <option value="">Select Exam</option>
                          {(EXAM_OPTIONS[topper.category || "All India"] || []).filter(opt => opt !== "Others").map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                          <option value="Others">Others</option>
                        </select>
                        {(() => {
                          const category = topper.category || "All India";
                          const options = EXAM_OPTIONS[category] || [];
                          const isCustom = !options.includes(topper.exam) && topper.exam !== undefined;
                          return (topper.exam === "Others" || (isCustom && topper.exam !== ""));
                        })() && (
                            <input
                              type="text"
                              value={topper.exam === "Others" ? "" : topper.exam}
                              onChange={(e) =>
                                updateTopper(index, "exam", e.target.value === "" ? "Others" : e.target.value)
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                              placeholder="Enter Exam Name"
                              required
                              autoFocus
                            />
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Category *
                        </label>
                        <select
                          value={topper.category || "All India"}
                          onChange={(e) =>
                            updateTopper(index, "category", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          required
                        >
                          <option value="All India">All India</option>
                          <option value="Boards">Boards</option>
                          <option value="Foundation">Foundation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rank *
                        </label>
                        <input
                          type="number"
                          value={topper.rank}
                          onChange={(e) =>
                            updateTopper(index, "rank", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="e.g., 1, 25, 100"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Percentage (Auto-calculated)
                        </label>
                        <input
                          type="number"
                          value={topper.percentages}
                          readOnly
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed"
                          placeholder="Auto-calculated"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Year
                        </label>
                        <input
                          type="number"
                          value={topper.year}
                          onChange={(e) =>
                            updateTopper(index, "year", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="e.g., 2025"
                          min="2000"
                          max="2100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Marks Obtained
                        </label>
                        <input
                          type="number"
                          value={topper.marks_obtained}
                          onChange={(e) =>
                            updateTopper(index, "marks_obtained", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="e.g., 680"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Total Marks
                        </label>
                        <input
                          type="number"
                          value={topper.total_marks}
                          onChange={(e) =>
                            updateTopper(index, "total_marks", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="e.g., 720"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Badge
                        </label>
                        <input
                          type="text"
                          value={topper.badge}
                          onChange={(e) =>
                            updateTopper(index, "badge", e.target.value)
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="e.g., AIR 1, State Topper"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Topper Message
                        </label>
                        <textarea
                          value={topper.topper_msg}
                          onChange={(e) =>
                            updateTopper(index, "topper_msg", e.target.value)
                          }
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                          placeholder="Inspirational message from the topper"
                        />
                      </div>

                      {/* Topper Image Upload */}
                      <div className="md:col-span-2">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Topper Photo
                          </label>
                          {imageUrl ? (
                            <div className="flex flex-col space-y-2">
                              <div
                                className="relative group cursor-pointer transform hover:scale-110 transition duration-200 inline-block"
                              >
                                <img
                                  src={imageUrl}
                                  alt={topper.name}
                                  className="h-16 w-16 rounded-full object-cover border border-gray-300"
                                  onClick={() =>
                                    handleTopperImageClick(imageUrl, topper.name)
                                  }
                                  onError={(e) => {
                                    console.error(
                                      `Failed to load image for topper ${topper.name}:`,
                                      imageUrl
                                    );
                                    e.target.style.display = "none";
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveTopperImage(index);
                                  }}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove Photo"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div className="text-xs text-blue-600 text-center flex flex-col space-y-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => handleTopperImageClick(imageUrl, topper.name)}
                                  className="hover:underline"
                                >
                                  Click to view full size
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTopperImage(index)}
                                  className="text-red-600 hover:text-red-700 font-medium hover:underline flex items-center justify-center gap-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Remove Photo
                                </button>
                              </div>
                              <span className="text-sm text-green-600">
                                Photo stored in database
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              No photo uploaded yet
                            </div>
                          )}
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload New Photo
                        </label>
                        <DragDropImageUpload
                          onImageUpload={(file) =>
                            handleTopperImageSelect(file, index)
                          }
                          existingImageUrl=""
                          uploading={false}
                        />
                        {topperFiles[index] && (
                          <p className="text-sm text-blue-600 mt-2">
                            ✓ New photo ready for upload
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {centreData.toppers.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-gray-500">No toppers added yet</p>
                  <button
                    type="button"
                    onClick={addTopper}
                    className="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Add First Topper
                  </button>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-200 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating Centre...
                  </>
                ) : (
                  "Update Centre"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/business/admin/centres")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CentreEdit;
