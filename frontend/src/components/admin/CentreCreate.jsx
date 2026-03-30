import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { centresAPI } from "../../services/api";
import DragDropImageUpload from "../DragDropImageUpload";
import { clearAdminCache, clearPublicCache } from "../../hooks/useAdminCache";
import { fileToBase64, compressImage } from "../../utils/fileUtils";

const EXAM_OPTIONS = {
  "All India": ["JEE", "NEET", "WBJEE", "Others"],
  "Boards": ["CBSE-X", "CBSE-XII", "H.S", "ICSE", "ISC", "Madhyamik", "Others"],
  "Foundation": ["PHASE TEST 1", "PHASE TEST 2", "PHASE TEST 3", "Others"],
};

const CentreCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

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

  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (centreData.state) {
      fetchDistricts(centreData.state);
    }
  }, [centreData.state]);

  const fetchStates = async () => {
    try {
      const response = await centresAPI.getStates();
      setStates(response.data);
    } catch (err) {
      console.error("Error fetching states:", err);
    }
  };

  const fetchDistricts = async (state) => {
    try {
      const response = await centresAPI.getDistricts(state);
      setDistricts(response.data);
      setCentreData((prev) => ({ ...prev, district: "" }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Prepare Base64 data for logo if a file was selected
      let logoBase64 = null;
      if (logoFile) {
        try {
          const compressedLogo = await compressImage(logoFile, { maxWidth: 1000, quality: 0.75 });
          logoBase64 = await fileToBase64(compressedLogo);
        } catch (err) {
          console.error("❌ Failed to compress logo:", err);
        }
      }

      // 2. Prepare Base64 data for topper images
      const topperImagesBase64 = {};
      for (const [index, file] of Object.entries(topperFiles)) {
        try {
          const compressedTopper = await compressImage(file, { maxWidth: 800, quality: 0.7 });
          topperImagesBase64[index] = await fileToBase64(compressedTopper);
        } catch (err) {
          console.error(`❌ Failed to compress topper ${index} image:`, err);
        }
      }

      // 3. Prepare consolidated API data
      const apiCentreData = {
        state: centreData.state,
        district: centreData.district,
        centre: centreData.centre,
        centre_type: centreData.centre_type,
        location: centreData.location,
        address: centreData.address,
        // Include Base64 logo only if we have one
        ...(logoBase64 && { logo_file: logoBase64 }),
        // Include toppers with their images
        toppers: centreData.toppers
          .map((topper, index) => {
            const topperPayload = {
              name: topper.name,
              exam: topper.exam || "",
              category: topper.category || "All India",
              rank: topper.rank ? parseInt(topper.rank) : null,
              year: topper.year ? parseInt(topper.year) : new Date().getFullYear(),
              topper_msg: topper.topper_msg || "",
              percentages: topper.percentages ? parseFloat(topper.percentages) : 0,
              marks_obtained: topper.marks_obtained ? parseFloat(topper.marks_obtained) : null,
              total_marks: topper.total_marks ? parseFloat(topper.total_marks) : null,
              badge: topper.badge || "",
            };

            // Only include image_file if we have a base64 string
            if (topperImagesBase64[index]) {
              topperPayload.image_file = topperImagesBase64[index];
            }

            return topperPayload;
          })
          .filter((topper) => topper.name && topper.exam), // Basic validation
      };

      // Create the centre with all data and images in ONE request
      await centresAPI.create(apiCentreData);

      toast.success("Centre created successfully!");
      clearAdminCache("admin_centres");
      clearPublicCache("centres");
      clearPublicCache("toppers");
      navigate("/business/admin/centres?refresh=true");
    } catch (err) {
      console.error("💥 CENTRE CREATION FAILED:", err);
      // Recursive function to parse potential DRF validation errors
      const parseBackendErrors = (errors, prefix = "") => {
        if (typeof errors === 'string') return `${prefix}${errors}`;
        if (Array.isArray(errors)) {
          return errors.map(err => parseBackendErrors(err, prefix)).join(" | ");
        }
        if (typeof errors === 'object' && errors !== null) {
          return Object.entries(errors)
            .map(([key, value]) => {
              const currentPrefix = isNaN(key) ? `${key}: ` : `[Topper ${parseInt(key) + 1}]: `;
              return parseBackendErrors(value, currentPrefix);
            })
            .filter(msg => msg !== "")
            .join(" | ");
        }
        return "";
      };

      let errorMessage = "Failed to create centre";
      if (err.response?.data) {
        errorMessage = parseBackendErrors(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
          year: new Date().getFullYear(),
          topper_msg: "",
          percentages: "",
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

      // Auto-calculate percentage
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
        } else {
          updatedToppers[index].percentages = "";
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

    // Remove file
    setTopperFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Centre
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add a new centre to your academy
            </p>
          </div>
          <button
            onClick={() => navigate("/business/admin/centres")}
            className="bg-gray-500 hover:bg-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Back to Centres
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-gray-200 dark:border-slate-800">
          <form onSubmit={handleSubmit}>
            {/* Centre Logo */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Centre Logo
              </h3>
              <div className="max-w-xs">
                <DragDropImageUpload
                  onImageUpload={handleLogoSelect}
                  existingImageUrl=""
                  uploading={false}
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Centre Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 uppercase">
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
                  <label className="block text-sm font-medium text-gray-700 uppercase">
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
                  <label className="block text-sm font-medium text-gray-700 uppercase">
                    Centre Name *
                  </label>
                  <input
                    type="text"
                    name="centre"
                    value={centreData.centre}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 uppercase">
                    Type *
                  </label>
                  <select
                    name="centre_type"
                    value={centreData.centre_type}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Instation">Instation</option>
                    <option value="Outstation">Outstation</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 uppercase">
                    Map Location URL *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={centreData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                    placeholder="Google Maps URL"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 uppercase">
                    Full Address *
                  </label>
                  <textarea
                    name="address"
                    value={centreData.address}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Toppers */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Toppers ({centreData.toppers.length})
                </h3>
                <button
                  type="button"
                  onClick={addTopper}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                >
                  Add Topper
                </button>
              </div>

              {centreData.toppers.map((topper, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 mb-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Topper #{index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeTopper(index)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        value={topper.name}
                        onChange={(e) => updateTopper(index, "name", e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Enter topper name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Exam *</label>
                      <select
                        value={topper.exam}
                        onChange={(e) => updateTopper(index, "exam", e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      >
                        <option value="">Select Exam</option>
                        {(EXAM_OPTIONS[topper.category || "All India"] || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="Others">Others</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category *</label>
                      <select
                        value={topper.category || "All India"}
                        onChange={(e) => updateTopper(index, "category", e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                      >
                        <option value="All India">All India</option>
                        <option value="Boards">Boards</option>
                        <option value="Foundation">Foundation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rank</label>
                      <input
                        type="number"
                        value={topper.rank}
                        onChange={(e) => updateTopper(index, "rank", e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="e.g., 1, 25, 100"
                        min="1"
                      />
                    </div>                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Marks</label>
                      <input
                        type="number"
                        value={topper.total_marks}
                        onChange={(e) => updateTopper(index, "total_marks", e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="e.g., 500"
                      />
                    </div>
 
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Marks Obtained</label>
                      <input
                        type="number"
                        value={topper.marks_obtained}
                        onChange={(e) => updateTopper(index, "marks_obtained", e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="e.g., 450"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Percentage (Auto-calculated)</label>
                      <input
                        type="number"
                        value={topper.percentages}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed dark:bg-slate-800 dark:text-gray-300"
                        placeholder="Auto-calculated"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year</label>
                      <input
                        type="number"
                        value={topper.year}
                        onChange={(e) => updateTopper(index, "year", e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="e.g., 2026"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Topper Message</label>
                      <textarea
                        value={topper.topper_msg}
                        onChange={(e) => updateTopper(index, "topper_msg", e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Inspirational message from the topper"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Photo</label>
                      <DragDropImageUpload
                        onImageUpload={(file) => handleTopperImageSelect(file, index)}
                        existingImageUrl=""
                        uploading={false}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-200 disabled:opacity-50"
              >
                {loading ? "Creating Centre..." : "Create Centre"}
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

export default CentreCreate;
