import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { centresAPI } from "../../services/api";
import DragDropImageUpload from "../DragDropImageUpload";
import { clearAdminCache } from "../../hooks/useAdminCache";

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
      console.log("🚀 STARTING CENTRE CREATION PROCESS");

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
        setLoading(false);
        return;
      }

      console.log("✅ Google Maps URL is valid:", centreData.location);

      // OPTION 1: Create centre WITH toppers data first (RECOMMENDED)
      // This ensures all topper fields are saved properly
      const apiCentreData = {
        state: centreData.state,
        district: centreData.district,
        centre: centreData.centre,
        centre_type: centreData.centre_type,
        location: centreData.location,
        address: centreData.address,
        toppers: centreData.toppers
          .map((topper) => ({
            name: topper.name,
            exam: topper.exam || "",
            category: topper.category || "All India",
            rank: topper.rank ? parseInt(topper.rank) : 0,
            year: topper.year ? parseInt(topper.year) : new Date().getFullYear(),
            topper_msg: topper.topper_msg || "",
            percentages: topper.percentages
              ? parseFloat(topper.percentages)
              : 0,
            marks_obtained: topper.marks_obtained ? parseFloat(topper.marks_obtained) : null,
            total_marks: topper.total_marks ? parseFloat(topper.total_marks) : null,
            badge: topper.badge || "",
            // image_data will be added later via image upload
          }))
          .filter((topper) => topper.name && topper.exam && topper.rank), // Only include valid toppers
      };

      console.log("📤 Creating centre WITH toppers data:", apiCentreData);

      // Step 1: Create the centre first (WITH topper data)
      console.log("📝 Step 1: Creating centre...");
      const createResponse = await centresAPI.create(apiCentreData);
      const newCentre = createResponse.data;
      const centreId = newCentre.id;

      console.log("✅ Centre created successfully");
      console.log("🆕 Centre ID:", centreId);
      console.log("📋 Centre response:", newCentre);

      // Step 2: Upload logo if provided
      if (logoFile) {
        try {
          console.log("🖼️ Step 2: Uploading centre logo...");
          await centresAPI.uploadCentreLogo(centreId, logoFile);
          console.log("✅ Centre logo uploaded successfully");
        } catch (logoError) {
          console.error("❌ Logo upload failed:", logoError);
        }
      }

      // Step 3: Upload topper images for existing toppers
      console.log("👤 Step 3: Uploading topper images...");

      const topperUploadPromises = centreData.toppers.map(
        async (topper, index) => {
          console.log(`\n--- Uploading Image for Topper ${index + 1} ---`);
          console.log(`📝 Topper data:`, topper);

          // Validate topper has required data
          if (
            !topper.name ||
            topper.name.trim() === "" ||
            !topper.exam ||
            topper.exam.trim() === "" ||
            !topper.rank ||
            topper.rank.toString().trim() === ""
          ) {
            console.log(
              `⏭️ Skipping topper ${index + 1} - missing required fields`
            );
            return {
              success: false,
              skipped: true,
              reason: "Missing required fields",
            };
          }

          const file = topperFiles[index];
          if (!file) {
            console.log(`⏭️ Skipping topper ${index + 1} - no image file`);
            return { success: true, skipped: true, reason: "No image file" };
          }

          console.log(`📁 Uploading image for topper: "${topper.name}"`);

          try {
            // Send minimal data for image upload - the topper already exists
            const topperData = {
              name: topper.name.trim(),
              exam: topper.exam.trim(),
              rank: topper.rank.toString().trim(),
              topper_index: index.toString(), // Tell backend which topper to update
              // Include other fields to ensure they're processed
              topper_msg: (topper.topper_msg || "").trim(),
              year: topper.year || new Date().getFullYear(),
              percentages: topper.percentages || "",
              marks_obtained: topper.marks_obtained || "",
              total_marks: topper.total_marks || "",
              badge: topper.badge || "",
            };

            console.log(`📤 Sending topper data for image upload:`, topperData);

            // Create FormData for image upload
            const formData = new FormData();
            formData.append("image", file);
            formData.append("topper_index", index.toString());

            // This should update the existing topper with the image
            await centresAPI.uploadTopperImage(centreId, formData);

            console.log(
              `✅ Topper image uploaded successfully: ${topper.name}`
            );
            return { success: true, topperName: topper.name };
          } catch (topperError) {
            console.error(
              `❌ Topper image upload failed for "${topper.name}":`,
              topperError
            );
            return {
              success: false,
              topperName: topper.name,
              error: topperError.message,
            };
          }
        }
      );

      // Wait for all topper image uploads to complete
      if (topperUploadPromises.length > 0) {
        console.log("⏳ Waiting for topper image uploads...");
        const results = await Promise.allSettled(topperUploadPromises);

        // Count results
        let successCount = 0;
        let failCount = 0;
        let skipCount = 0;

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const uploadResult = result.value;
            if (uploadResult.skipped) {
              console.log(
                `   ${index + 1}. ⏭️ SKIPPED: ${uploadResult.reason}`
              );
              skipCount++;
            } else if (uploadResult.success) {
              console.log(
                `   ${index + 1}. ✅ SUCCESS: ${uploadResult.topperName}`
              );
              successCount++;
            } else {
              console.log(
                `   ${index + 1}. ❌ FAILED: ${uploadResult.topperName}`
              );
              failCount++;
            }
          } else {
            console.log(`   ${index + 1}. 💥 PROMISE REJECTED:`, result.reason);
            failCount++;
          }
        });

        console.log(`\n📈 TOPPER IMAGE UPLOAD SUMMARY:`);
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ⏭️ Skipped: ${skipCount}`);
        console.log(`   ❌ Failed: ${failCount}`);
        console.log(`   📊 Total Processed: ${results.length}`);
      } else {
        console.log("⏭️ No topper images to upload");
      }

      console.log("🎉 CENTRE CREATION PROCESS COMPLETED SUCCESSFULLY");
      alert("Centre created successfully!");
      clearAdminCache("admin_centres");
      navigate("/admin/centres?refresh=true");
    } catch (err) {
      console.error("💥 CENTRE CREATION FAILED:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to create centre"
      );
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
            onClick={() => navigate("/admin/centres")}
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

        {/* Debug Info */}
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <strong>Debug Info:</strong>
          {centreData.toppers.map((topper, index) => (
            <div key={index} className="text-sm mt-1">
              Topper {index + 1}: "{topper.name}" - "{topper.exam}" - Rank: "
              {topper.rank}"
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
                <DragDropImageUpload
                  onImageUpload={handleLogoSelect}
                  existingImageUrl=""
                  uploading={false}
                />
                {logoFile && (
                  <p className="text-sm text-blue-600 mt-2">
                    ✓ Logo ready for upload
                  </p>
                )}
              </div>
            </div>

            {/* Basic Information */}
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
            <div className="mb-8">
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

              {centreData.toppers.map((topper, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 mb-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Topper #{index + 1}
                      <span className="ml-2 text-xs text-gray-500">
                        (Index: {index})
                      </span>
                      {topperFiles[index] && (
                        <span className="ml-2 text-sm text-blue-600">
                          (Image ready for upload)
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
                            // Set to "Others" placeholder to show input, instead of clearing to ""
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

                      {/* Show input if "Others" is selected (placeholder) or value is custom */}
                      {(() => {
                        const category = topper.category || "All India";
                        const options = EXAM_OPTIONS[category] || [];
                        const isCustom = !options.includes(topper.exam) && topper.exam !== undefined;
                        // Show if explicitly "Others" or it's a custom value (not in list and not empty)
                        return (topper.exam === "Others" || (isCustom && topper.exam !== ""));
                      })() && (
                          <input
                            type="text"
                            value={topper.exam === "Others" ? "" : topper.exam}
                            onChange={(e) =>
                              // If user clears input, keep it as "Others" so input stays visible/valid logic works
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
                        min="0"
                        max="100"
                        step="0.01"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Topper Photo
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
                          ✓ Image ready for upload
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

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
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-200 disabled:opacity-50 flex items-center"
              >
                {loading ? (
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
                    Creating Centre & Uploading Images...
                  </>
                ) : (
                  "Create Centre"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/centres")}
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
