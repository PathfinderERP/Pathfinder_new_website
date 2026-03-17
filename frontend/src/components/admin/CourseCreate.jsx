import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { coursesAPI, centresAPI } from "../../services/api";
import Papa from "papaparse";
import { clearAdminCache } from "../../hooks/useAdminCache";

const EXAM_OPTIONS = {
  "All India": ['JEE Main', 'JEE Advanced', 'NEET UG', 'NEET PG', 'WBJEE'],
  "Foundation": ['VSO', 'JBNSTS', 'INMO', 'IOQM'],
  "Boards": ['CBSE-X', 'CBSE-XII', 'H.S', 'ICSE', 'ICS', 'Madhyamik']
};

const CourseCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [centres, setCentres] = useState([]);
  const [selectedCentres, setSelectedCentres] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  const [fetchLoading, setFetchLoading] = useState({
    centres: false,
  });

  const [courseData, setCourseData] = useState({
    name: "",
    state: null,
    district: null,
    mode: "offline",
    course_price: "",
    class_level: "",
    duration: "",
    course_sessions: "",
    location: "",
    address: "",
    badge: "",
    offers: "",
    programme: "",
    discounted_price: "",
    is_active: true,
    fees_structures: [],
    toppers: [],
    teachers: [],
    free_contents: [],
    thumbnail_image_file: null,
    thumbnail_url: null,
    starting_date: "",
    language: "",
    course_title: "",
  });

  // Track which fields should be auto-filled per centre
  const [autoFillEnabled, setAutoFillEnabled] = useState({
    state: true,
    district: true,
    location: true,
    address: true,
  });

  // Fetch all centres on component mount
  useEffect(() => {
    fetchAllCentres();
  }, []);

  const fetchAllCentres = async () => {
    try {
      setFetchLoading((prev) => ({ ...prev, centres: true }));
      

      const response = await centresAPI.getAll();
      

      // Add virtual "Online" centre
      const centresWithOnline = [
        {
          id: "online",
          centre: "Online",
          state: null,
          district: null,
          location: "Online",
          address: "Virtual Classroom",
          is_virtual: true,
        },
        ...response.data.map(centre => ({
          ...centre,
          is_virtual: false,
        }))
      ];

      setCentres(centresWithOnline);
    } catch (err) {
      console.error("❌ Error fetching centres:", err);
      console.error("Error details:", err.response?.data);
      setError("Failed to load centres. Please refresh the page.");
    } finally {
      setFetchLoading((prev) => ({ ...prev, centres: false }));
    }
  };

  // Handle select all offline centres
  const handleSelectAllOffline = () => {
    const offlineCentres = centres.filter(c => c.id !== "online");
    const allSelected = offlineCentres.every(c => selectedCentres.some(sc => sc.id === c.id));

    if (allSelected) {
      // Unselect all offline
      setSelectedCentres(prev => prev.filter(c => c.id === "online"));
    } else {
      // Select all offline
      const onlineCentre = selectedCentres.find(c => c.id === "online");
      setSelectedCentres(onlineCentre ? [onlineCentre, ...offlineCentres] : offlineCentres);

      // Auto-fill from first offline centre if nothing was selected
      if (selectedCentres.length === 0 && offlineCentres.length > 0) {
        const first = offlineCentres[0];
        setCourseData(prev => ({
          ...prev,
          state: first.state || null,
          district: first.district || null,
          location: first.location || "",
          address: first.address || "",
        }));
      }
    }
  };

  // Handle centre selection (multiple)
  const handleCentreChange = (centreId) => {
    const centre = centres.find(c => c.id === centreId);

    if (!centre) return;

    const isSelected = selectedCentres.some(c => c.id === centreId);

    if (isSelected) {
      // Remove centre from selection
      setSelectedCentres(prev => prev.filter(c => c.id !== centreId));

      // If removing online centre, reset mode to offline
      if (centreId === "online") {
        setCourseData(prev => ({
          ...prev,
          mode: "offline",
        }));
      }
    } else {
      // Add centre to selection
      setSelectedCentres(prev => [...prev, centre]);

      // Auto-fill fields if first centre selected
      if (selectedCentres.length === 0) {
        const newCourseData = {
          ...courseData,
          state: centre.state || null,
          district: centre.district || null,
          location: centre.location || "",
          address: centre.address || "",
        };

        // If selecting online centre, set mode to online
        if (centreId === "online") {
          newCourseData.mode = "online";
          // For online courses, clear location-related fields
          newCourseData.state = null;
          newCourseData.district = null;
          newCourseData.location = "Online";
          newCourseData.address = "Virtual Classroom";

          // Disable auto-fill for location fields
          setAutoFillEnabled(prev => ({
            ...prev,
            state: false,
            district: false,
            location: true, // Keep location auto-filled as "Online"
            address: true,  // Keep address auto-filled as "Virtual Classroom"
          }));
        }

        setCourseData(newCourseData);
      } else {
        // If selecting online centre with other centres selected, show warning
        if (centreId === "online") {
          setError("Cannot select both Online and physical centres together. Please select only one type.");
          // Remove the online centre from selection
          setSelectedCentres(prev => prev.filter(c => c.id !== centreId));
          return;
        }
        // If selecting physical centre with online centre selected, show warning
        if (selectedCentres.some(c => c.id === "online")) {
          setError("Cannot select both Online and physical centres together. Please select only one type.");
          return;
        }
      }
    }
  };

  // Toggle auto-fill for specific fields
  const toggleAutoFill = (field) => {
    // Don't allow toggling off for online centre location/address
    const isOnlineCentreSelected = selectedCentres.some(c => c.id === "online");
    if (isOnlineCentreSelected && (field === "location" || field === "address")) {
      setError("Cannot disable auto-fill for location/address when Online centre is selected");
      return;
    }

    setAutoFillEnabled(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle mode change
  const handleModeChange = (e) => {
    const mode = e.target.value;
    setCourseData(prev => ({
      ...prev,
      mode: mode,
    }));

    // If changing to online mode, clear location data
    if (mode === "online") {
      setCourseData(prev => ({
        ...prev,
        state: null,
        district: null,
        location: "Online",
        address: "Virtual Classroom",
      }));

      // Disable auto-fill for location fields
      setAutoFillEnabled(prev => ({
        ...prev,
        state: false,
        district: false,
        location: true,
        address: true,
      }));
    } else {
      // When switching back to offline, re-enable auto-fill if needed
      setAutoFillEnabled(prev => ({
        ...prev,
        state: true,
        district: true,
      }));
    }
  };

  // Create course for a single centre
  const createCourseForCentre = async (centreData) => {
    const isOnlineCentre = centreData.id === "online" || centreData.centre === "Online";

    // Prepare the data object
    const dataToSend = {
      name: courseData.name,
      centre: centreData.centre,
      class_level: courseData.class_level,
      course_price: parseFloat(courseData.course_price) || 0,
      duration: courseData.duration,
      course_sessions: courseData.course_sessions,
      mode: isOnlineCentre ? "online" : courseData.mode,
      location: autoFillEnabled.location ? centreData.location || courseData.location : courseData.location,
      address: autoFillEnabled.address ? centreData.address || courseData.address : courseData.address,
      is_active: courseData.is_active,
      fees_structures: courseData.fees_structures.map((fee) => ({
        ...fee,
        amount: parseFloat(fee.amount) || 0,
      })),
      toppers: courseData.toppers || [],
      teachers: courseData.teachers || [],
      free_contents: courseData.free_contents || [],
      course_title: courseData.course_title,
    };

    // Add thumbnail if exists
    if (courseData.thumbnail_image_file) {
      dataToSend.thumbnail_image_file = courseData.thumbnail_image_file;
    }

    // Handle state and district based on mode
    if (isOnlineCentre) {
      // For online courses, send null for state and district
      dataToSend.state = null;
      dataToSend.district = null;
      dataToSend.location = "Online";
      dataToSend.address = "Virtual Classroom";
    } else {
      // For offline courses
      dataToSend.state = autoFillEnabled.state ? centreData.state || courseData.state : courseData.state;
      dataToSend.district = autoFillEnabled.district ? centreData.district || courseData.district : courseData.district;
    }

    // Add optional fields if they have values
    if (courseData.badge && courseData.badge.trim() !== "") dataToSend.badge = courseData.badge;
    if (courseData.offers && courseData.offers.trim() !== "") dataToSend.offers = courseData.offers;
    if (courseData.programme && courseData.programme.trim() !== "") dataToSend.programme = courseData.programme;
    if (courseData.discounted_price && courseData.discounted_price.trim() !== "") dataToSend.discounted_price = parseFloat(courseData.discounted_price) || null;
    if (courseData.starting_date && courseData.starting_date.trim() !== "") dataToSend.starting_date = courseData.starting_date;
    if (courseData.language && courseData.language.trim() !== "") dataToSend.language = courseData.language;

    // Clean up empty strings - convert to null
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === "") {
        dataToSend[key] = null;
      }
    });

    
    return await coursesAPI.create(dataToSend);
  };

  // Handle single course creation (for one centre)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCentres.length === 0) {
      setError("Please select at least one centre");
      return;
    }

    if (selectedCentres.length > 1) {
      setError("For single creation, please select only one centre. Use 'Create for All Selected' for multiple centres.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createCourseForCentre(selectedCentres[0]);
      clearAdminCache("admin_courses");
      setSuccess("Course created successfully!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        navigate("/business/admin/courses?refresh=true");
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to create course";
      const errorDetails = err.response?.data?.details;
      setError(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error("Create course error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Handle batch creation for multiple centres
  const handleBatchSubmit = async () => {
    if (selectedCentres.length === 0) {
      setError("Please select at least one centre");
      return;
    }

    // Check if mixing online and physical centres
    const hasOnline = selectedCentres.some(c => c.id === "online");
    const hasPhysical = selectedCentres.some(c => c.id !== "online");

    if (hasOnline && hasPhysical) {
      setError("Cannot create batch with both Online and physical centres. Please select only one type.");
      return;
    }

    if (!window.confirm(`Create this course for ${selectedCentres.length} centre(s)?`)) {
      return;
    }

    setBatchLoading(true);
    setError("");
    setSuccess("");
    const errors = [];
    let successCount = 0;

    try {
      for (const centre of selectedCentres) {
        try {
          await createCourseForCentre(centre);
          successCount++;
        } catch (err) {
          errors.push({
            centre: centre.centre,
            error: err.response?.data?.error || "Failed to create course"
          });
        }
      }

      if (errors.length === 0) {
        clearAdminCache("admin_courses");
        setSuccess(`✅ Successfully created course for ${successCount} centre(s)!`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          navigate("/business/admin/courses?refresh=true");
        }, 2000);
      } else {
        const errorMessages = errors.map(e => `${e.centre}: ${e.error}`).join('\n');
        setSuccess(`Created for ${successCount} centre(s). Errors:`);
        setError(errorMessages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError("Failed to process batch creation");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setBatchLoading(false);
    }
  };

  // Handle CSV file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFileName(file.name);
    setCsvData([]);
    setError("");
    setSuccess("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        

        // Validate CSV structure
        const requiredColumns = ['centre', 'name', 'class_level', 'course_price', 'duration', 'course_sessions', 'mode'];
        const headers = results.meta.fields || [];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          setError(`CSV missing required columns: ${missingColumns.join(', ')}`);
          return;
        }

        // Validate data
        const validRows = [];
        const errors = [];

        results.data.forEach((row, index) => {
          // Check if centre exists in our database or is "Online"
          const centreExists = row.centre === "Online" || centres.some(c => c.centre === row.centre);

          if (!centreExists) {
            errors.push(`Row ${index + 1}: Centre "${row.centre}" not found in database`);
            return;
          }

          if (!row.name || !row.class_level || !row.course_price) {
            errors.push(`Row ${index + 1}: Missing required fields`);
            return;
          }

          validRows.push({
            ...row,
            course_price: parseFloat(row.course_price) || 0,
            mode: row.mode || (row.centre === "Online" ? "online" : "offline"),
            is_active: row.is_active !== undefined ? row.is_active === 'true' : true,
            offers: row.offers || '',
            badge: row.badge || '',
          });
        });

        if (errors.length > 0) {
          setError(`CSV validation errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more errors` : ''}`);
        }

        if (validRows.length > 0) {
          setCsvData(validRows);
          setSuccess(`✅ CSV loaded successfully: ${validRows.length} valid course(s) found`);
        } else {
          setError("No valid course data found in CSV");
        }
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  // Download CSV template
  const downloadCsvTemplate = () => {
    const headers = [
      'centre', 'name', 'class_level', 'course_price', 'duration',
      'course_sessions', 'mode', 'badge', 'offers', 'is_active'
    ];

    const sampleData = [
      {
        centre: 'Online',
        name: 'NEET Online Course',
        class_level: 'Class 11',
        course_price: '25000',
        duration: '1 year',
        course_sessions: '200 sessions',
        mode: 'online',
        badge: 'Popular',
        offers: '20% discount for early birds',
        is_active: 'true'
      },
      {
        centre: 'Main Centre',
        name: 'NEET Foundation Course',
        class_level: 'Class 11',
        course_price: '25000',
        duration: '1 year',
        course_sessions: '200 sessions',
        mode: 'offline',
        badge: 'Popular',
        offers: '20% discount for early birds',
        is_active: 'true'
      }
    ];

    const csv = Papa.unparse({
      fields: headers,
      data: sampleData
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'course_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create courses from CSV data
  const handleCsvSubmit = async () => {
    if (csvData.length === 0) {
      setError("Please upload a CSV file first");
      return;
    }

    if (!window.confirm(`Create ${csvData.length} course(s) from CSV?`)) {
      return;
    }

    setCsvLoading(true);
    setError("");
    setSuccess("");
    const errors = [];
    let successCount = 0;

    try {
      for (const [index, row] of csvData.entries()) {
        try {
          // Find centre details or handle Online centre
          let centre;
          if (row.centre === "Online") {
            centre = {
              centre: "Online",
              state: null,
              district: null,
              location: "Online",
              address: "Virtual Classroom"
            };
          } else {
            centre = centres.find(c => c.centre === row.centre && c.id !== "online");
            if (!centre) {
              errors.push(`Row ${index + 1}: Centre "${row.centre}" not found`);
              continue;
            }
          }

          // Prepare course data
          const dataToSend = {
            name: row.name,
            class_level: row.class_level,
            course_price: parseFloat(row.course_price) || 0,
            duration: row.duration,
            course_sessions: row.course_sessions,
            mode: row.mode || (row.centre === "Online" ? "online" : "offline"),
            centre: row.centre,
            state: row.centre === "Online" ? null : (centre.state || ""),
            district: row.centre === "Online" ? null : (centre.district || ""),
            location: row.centre === "Online" ? "Online" : (centre.location || ""),
            address: row.centre === "Online" ? "Virtual Classroom" : (centre.address || ""),
            is_active: row.is_active !== undefined ? row.is_active : true,
            course_title: row.course_title || null,
            fees_structures: [],
            toppers: [],
          };

          // Add optional fields if they have values
          if (row.badge && row.badge.trim() !== "") dataToSend.badge = row.badge;
          if (row.offers && row.offers.trim() !== "") dataToSend.offers = row.offers;

          // Clean up empty strings
          Object.keys(dataToSend).forEach(key => {
            if (dataToSend[key] === "") {
              dataToSend[key] = null;
            }
          });

          
          await coursesAPI.create(dataToSend);
          successCount++;
        } catch (err) {
          errors.push({
            row: index + 1,
            centre: row.centre,
            error: err.response?.data?.error || "Failed to create course"
          });
        }
      }

      if (errors.length === 0) {
        clearAdminCache("admin_courses");
        setSuccess(`✅ Successfully created ${successCount} course(s) from CSV!`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          navigate("/business/admin/courses?refresh=true");
        }, 2000);
      } else {
        const errorMessages = errors.map(e => `Row ${e.row} (${e.centre}): ${e.error}`).join('\n');
        setSuccess(`Created ${successCount} course(s). ${errors.length} error(s):`);
        setError(errorMessages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError("Failed to process CSV upload");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setCsvLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : (value === "" ? null : value);

    setCourseData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };

      // Calculate discounted price if price or offers changes
      if (name === "course_price" || name === "offers") {
        const price = parseFloat(name === "course_price" ? newValue : prev.course_price) || 0;
        const offer = parseFloat(name === "offers" ? newValue : prev.offers) || 0;
        if (price > 0 && offer > 0) {
          updated.discounted_price = (price - (price * offer / 100)).toFixed(2);
        } else {
          updated.discounted_price = price > 0 ? price.toFixed(2) : "";
        }
      }

      return updated;
    });
  };

  const addFeeStructure = () => {
    setCourseData((prev) => ({
      ...prev,
      fees_structures: [...prev.fees_structures, { fees_type: "", amount: "" }],
    }));
  };

  const updateFeeStructure = (index, field, value) => {
    setCourseData((prev) => {
      const updatedFees = [...prev.fees_structures];
      updatedFees[index] = {
        ...updatedFees[index],
        [field]: field === "amount" ? (value === "" ? "" : value) : value,
      };
      return { ...prev, fees_structures: updatedFees };
    });
  };

  const removeFeeStructure = (index) => {
    setCourseData((prev) => ({
      ...prev,
      fees_structures: prev.fees_structures.filter((_, i) => i !== index),
    }));
  };

  // Check if online centre is selected
  const isOnlineCentreSelected = selectedCentres.some(c => c.id === "online");

  // Helper function to get display value for state/district
  const getDisplayValue = (value) => {
    return value === null ? "" : value;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Course(s)
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create courses for single or multiple centres
            </p>
          </div>
          <button
            onClick={() => navigate("/business/admin/courses")}
            className="bg-gray-500 hover:bg-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Back to Courses
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("manual")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "manual"
                  ? "border-orange-500 text-orange-600 dark:text-orange-500"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600"
                  }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab("csv")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "csv"
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600"
                  }`}
              >
                CSV Bulk Upload
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "manual" ? (
          /* MANUAL ENTRY FORM */
          <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-gray-200 dark:border-slate-800">
            <form onSubmit={handleSubmit}>
              {/* Centre Selection */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select Centre(s) *
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCentres.length} centre(s) selected
                    {isOnlineCentreSelected && " (Online)"}
                    <button
                      type="button"
                      onClick={handleSelectAllOffline}
                      className="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {centres.filter(c => c.id !== "online").every(c => selectedCentres.some(sc => sc.id === c.id))
                        ? "Unselect All Offline"
                        : "Select All Offline"}
                    </button>
                  </div>
                </div>

                {fetchLoading.centres ? (
                  <div className="text-center py-4">Loading centres...</div>
                ) : centres.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded">
                    {/* Online Centre Option - Always show first */}
                    <div
                      key="online"
                      className={`p-3 border rounded cursor-pointer transition duration-200 ${selectedCentres.some(c => c.id === "online")
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                      onClick={() => handleCentreChange("online")}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCentres.some(c => c.id === "online")}
                          onChange={() => { }}
                          className="h-4 w-4 text-green-600 dark:text-green-400 mr-2"
                        />
                        <div>
                          <div className="font-medium text-green-600 dark:text-green-400">Online</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Virtual Classroom
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Physical Centres */}
                    {centres
                      .filter(centre => centre.id !== "online")
                      .map((centre) => {
                        const isSelected = selectedCentres.some(c => c.id === centre.id);
                        return (
                          <div
                            key={centre.id}
                            className={`p-3 border rounded cursor-pointer transition duration-200 ${isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                              }`}
                            onClick={() => handleCentreChange(centre.id)}
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => { }}
                                className="h-4 w-4 text-blue-600 mr-2"
                              />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{centre.centre}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {centre.district || "N/A"}, {centre.state || "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No centres available
                  </div>
                )}

                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-700 mb-2">Auto-fill Settings:</div>
                  <div className="flex flex-wrap gap-3">
                    {Object.keys(autoFillEnabled).map((field) => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={autoFillEnabled[field]}
                          onChange={() => toggleAutoFill(field)}
                          disabled={isOnlineCentreSelected && (field === "location" || field === "address")}
                          className={`mr-2 h-4 w-4 ${isOnlineCentreSelected && (field === "location" || field === "address")
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600"
                            }`}
                        />
                        <span className={`text-sm capitalize ${isOnlineCentreSelected && (field === "location" || field === "address")
                          ? "text-gray-500"
                          : ""
                          }`}>
                          {field.replace('_', ' ')}
                          {isOnlineCentreSelected && (field === "location" || field === "address") && " (Locked)"}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isOnlineCentreSelected
                      ? "Online centre auto-fills Location and Address. State and District are not applicable."
                      : "When enabled, fields will be auto-filled from the selected centre"}
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Course Information
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Thumbnail Image Upload */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Thumbnail
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="h-32 w-48 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-slate-800">
                        {courseData.thumbnail_url ? (
                          <img
                            src={courseData.thumbnail_url}
                            alt="Course thumbnail"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">No image</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCourseData(prev => ({
                                  ...prev,
                                  thumbnail_image_file: reader.result,
                                  thumbnail_url: reader.result // Preview
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended size: 800x600px. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select a course *
                    </label>
                    <select
                      name="name"
                      value={courseData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select a course type</option>
                      <option value="All India">All India</option>
                      <option value="Boards">Boards</option>
                      <option value="Foundation">Foundation</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Course Title
                    </label>
                    <input
                      type="text"
                      name="course_title"
                      value={courseData.course_title || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      placeholder="e.g., Special Batch for JEE Main 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      name="class_level"
                      value={courseData.class_level}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      required
                      placeholder="e.g., Class 11, NEET, JEE"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mode *
                    </label>
                    <select
                      name="mode"
                      value={courseData.mode}
                      onChange={handleModeChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      required
                      disabled={isOnlineCentreSelected}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="centre">Centre</option>
                    </select>
                    {isOnlineCentreSelected && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mode is automatically set to "Online" for Online centre
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Programme
                    </label>
                    <select
                      name="programme"
                      value={courseData.programme || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Programme</option>
                      <option value="CRP">CRP</option>
                      <option value="NCRP">NCRP</option>
                    </select>
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Starting Date
                    </label>
                    <input
                      type="date"
                      name="starting_date"
                      value={courseData.starting_date || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language
                    </label>
                    <input
                      type="text"
                      name="language"
                      value={courseData.language || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      placeholder="e.g., English, Hindi, Bengali"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Course Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="course_price"
                      value={courseData.course_price}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration *
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={courseData.duration}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      required
                      placeholder="e.g., 6 months, 1 year"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Course Sessions *
                    </label>
                    <input
                      type="text"
                      name="course_sessions"
                      value={courseData.course_sessions}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      required
                      placeholder="e.g., 100 sessions, 200 hours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Badge
                    </label>
                    <input
                      type="text"
                      name="badge"
                      value={courseData.badge}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      placeholder="e.g., Popular, New, Best Seller"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Location Information
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      State {!isOnlineCentreSelected && "*"}
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={getDisplayValue(courseData.state)}
                      onChange={handleChange}
                      className={`mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${autoFillEnabled.state ? "bg-gray-50 dark:bg-slate-800" : ""
                        } ${isOnlineCentreSelected ? "bg-gray-100 dark:bg-slate-800" : ""}`}
                      required={!isOnlineCentreSelected}
                      readOnly={autoFillEnabled.state}
                      disabled={isOnlineCentreSelected}
                      placeholder={isOnlineCentreSelected ? "Not applicable for online courses" : (autoFillEnabled.state ? "Auto-filled from centre" : "Enter state")}
                    />
                    {isOnlineCentreSelected && (
                      <p className="text-xs text-gray-500 mt-1">State is not applicable for online courses</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      District {!isOnlineCentreSelected && "*"}
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={getDisplayValue(courseData.district)}
                      onChange={handleChange}
                      className={`mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${autoFillEnabled.district ? "bg-gray-50 dark:bg-slate-800" : ""
                        } ${isOnlineCentreSelected ? "bg-gray-100 dark:bg-slate-800" : ""}`}
                      required={!isOnlineCentreSelected}
                      readOnly={autoFillEnabled.district}
                      disabled={isOnlineCentreSelected}
                      placeholder={isOnlineCentreSelected ? "Not applicable for online courses" : (autoFillEnabled.district ? "Auto-filled from centre" : "Enter district")}
                    />
                    {isOnlineCentreSelected && (
                      <p className="text-xs text-gray-500 mt-1">District is not applicable for online courses</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={courseData.location}
                      onChange={handleChange}
                      className={`mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${autoFillEnabled.location ? "bg-gray-50 dark:bg-slate-800" : ""
                        }`}
                      required
                      readOnly={autoFillEnabled.location}
                      placeholder={autoFillEnabled.location ? "Auto-filled from centre" : "Enter location"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Address *
                    </label>
                    <textarea
                      name="address"
                      value={courseData.address}
                      onChange={handleChange}
                      rows={3}
                      className={`mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${autoFillEnabled.address ? "bg-gray-50 dark:bg-slate-800" : ""
                        }`}
                      required
                      readOnly={autoFillEnabled.address}
                      placeholder={autoFillEnabled.address ? "Auto-filled from centre" : "Enter address"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Offers (% Discount)
                    </label>
                    <input
                      type="number"
                      name="offers"
                      value={courseData.offers || ""}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                      placeholder="e.g., 20"
                    />
                    {courseData.discounted_price && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Discounted Price: ₹{courseData.discounted_price}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee Structures */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Fee Structures
                  </h3>
                  <button
                    type="button"
                    onClick={addFeeStructure}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Fee Type
                  </button>
                </div>

                {courseData.fees_structures.map((fee, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fee Type
                      </label>
                      <input
                        type="text"
                        value={fee.fees_type}
                        onChange={(e) =>
                          updateFeeStructure(index, "fees_type", e.target.value)
                        }
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Registration, Tuition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={fee.amount}
                        onChange={(e) =>
                          updateFeeStructure(index, "amount", e.target.value)
                        }
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeFeeStructure(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toppers Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Course Toppers
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setCourseData((prev) => ({
                        ...prev,
                        toppers: [
                          ...prev.toppers,
                          { name: "", rank: "", year: new Date().getFullYear(), exam: "", topper_msg: "", percentages: "", total_marks: "", obtained_marks: "", badge: "", image_file: "" },
                        ],
                      }))
                    }
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Topper
                  </button>
                </div>
                {courseData.toppers.map((topper, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        type="text"
                        value={topper.name}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newToppers = [...prev.toppers];
                            newToppers[index].name = e.target.value;
                            return { ...prev, toppers: newToppers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rank</label>
                      <input
                        type="number"
                        value={topper.rank}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newToppers = [...prev.toppers];
                            newToppers[index].rank = e.target.value;
                            return { ...prev, toppers: newToppers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                      <input
                        type="number"
                        value={topper.year || ""}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newToppers = [...prev.toppers];
                            newToppers[index].year = e.target.value;
                            return { ...prev, toppers: newToppers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam</label>
                      {EXAM_OPTIONS[courseData.name] && !['other', ...EXAM_OPTIONS[courseData.name]].includes(topper.exam) && (topper.exam || topper.exam === '__other__') ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={topper.exam === '__other__' ? '' : topper.exam}
                            onChange={(e) => {
                              setCourseData((prev) => {
                                const newToppers = [...prev.toppers];
                                newToppers[index].exam = e.target.value;
                                return { ...prev, toppers: newToppers };
                              });
                            }}
                            className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter Custom Exam"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCourseData((prev) => {
                                const newToppers = [...prev.toppers];
                                newToppers[index].exam = "";
                                return { ...prev, toppers: newToppers };
                              });
                            }}
                            className="mt-1 px-2 text-gray-500 hover:text-red-500"
                          >✕</button>
                        </div>
                      ) : (
                        <select
                          value={EXAM_OPTIONS[courseData.name]?.includes(topper.exam) ? topper.exam : (topper.exam ? 'other' : '')}
                          onChange={(e) => {
                            if (e.target.value === 'other') {
                              setCourseData((prev) => {
                                const newToppers = [...prev.toppers];
                                newToppers[index].exam = "__other__"; // Special token to trigger input mode with empty field
                                return { ...prev, toppers: newToppers };
                              });
                            } else {
                              setCourseData((prev) => {
                                const newToppers = [...prev.toppers];
                                newToppers[index].exam = e.target.value;
                                return { ...prev, toppers: newToppers };
                              });
                            }
                          }}
                          className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Exam</option>
                          {courseData.name && EXAM_OPTIONS[courseData.name]?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Marks Obtained</label>
                      <input
                        type="number"
                        value={topper.obtained_marks || ""}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newToppers = [...prev.toppers];
                            newToppers[index].obtained_marks = e.target.value;
                            // Auto calc percentage
                            const obtained = parseFloat(e.target.value) || 0;
                            const total = parseFloat(newToppers[index].total_marks) || 0;
                            if (total > 0) {
                              newToppers[index].percentages = ((obtained / total) * 100).toFixed(2);
                            }
                            return { ...prev, toppers: newToppers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Marks</label>
                      <input
                        type="number"
                        value={topper.total_marks || ""}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newToppers = [...prev.toppers];
                            newToppers[index].total_marks = e.target.value;
                            // Auto calc percentage
                            const total = parseFloat(e.target.value) || 0;
                            const obtained = parseFloat(newToppers[index].obtained_marks) || 0;
                            if (total > 0) {
                              newToppers[index].percentages = ((obtained / total) * 100).toFixed(2);
                            }
                            return { ...prev, toppers: newToppers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Percentage</label>
                      <input
                        type="number"
                        value={topper.percentages || ""}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Badge</label>
                      <input
                        type="text"
                        value={topper.badge || ""}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newToppers = [...prev.toppers];
                            newToppers[index].badge = e.target.value;
                            return { ...prev, toppers: newToppers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Gold, AIR 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topper Message</label>
                      <textarea
                        value={topper.topper_msg || ""}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newToppers = [...prev.toppers];
                            newToppers[index].topper_msg = e.target.value;
                            return { ...prev, toppers: newToppers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Message from topper"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCourseData((prev) => {
                                const newToppers = [...prev.toppers];
                                newToppers[index].image_file = reader.result;
                                return { ...prev, toppers: newToppers };
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {(topper.image_file || topper.image_url) && (
                        <div className="mt-2">
                          <img
                            src={topper.image_file || topper.image_url}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          setCourseData((prev) => ({
                            ...prev,
                            toppers: prev.toppers.filter((_, i) => i !== index)
                          }));
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm w-full"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Teachers Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Teachers
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setCourseData((prev) => ({
                        ...prev,
                        teachers: [
                          ...prev.teachers,
                          { name: "", subject: "", experience: "", message: "", profile_image_file: "" },
                        ],
                      }))
                    }
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Teacher
                  </button>
                </div>
                {courseData.teachers.map((teacher, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        type="text"
                        value={teacher.name}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newTeachers = [...prev.teachers];
                            newTeachers[index].name = e.target.value;
                            return { ...prev, teachers: newTeachers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subjects (comma sep)</label>
                      <input
                        type="text"
                        value={Array.isArray(teacher.subjects) ? teacher.subjects.join(", ") : teacher.subjects || ""}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newTeachers = [...prev.teachers];
                            newTeachers[index].subjects = e.target.value.split(',').map(s => s.trim());
                            return { ...prev, teachers: newTeachers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience (Years)</label>
                      <input
                        type="number"
                        value={teacher.experience}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newTeachers = [...prev.teachers];
                            newTeachers[index].experience = e.target.value;
                            return { ...prev, teachers: newTeachers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                      <textarea
                        value={teacher.message || ""}
                        onChange={(e) => {
                          setCourseData((prev) => {
                            const newTeachers = [...prev.teachers];
                            newTeachers[index].message = e.target.value;
                            return { ...prev, teachers: newTeachers };
                          });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Message from teacher"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCourseData((prev) => {
                                const newTeachers = [...prev.teachers];
                                newTeachers[index].profile_image_file = reader.result;
                                return { ...prev, teachers: newTeachers };
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {(teacher.profile_image_file || teacher.profile_image_url) && (
                        <div className="mt-2">
                          <img
                            src={teacher.profile_image_file || teacher.profile_image_url}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          setCourseData((prev) => ({
                            ...prev,
                            teachers: prev.teachers.filter((_, i) => i !== index)
                          }));
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm w-full"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Free Content / Demo Videos */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Demo Videos & Content
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setCourseData((prev) => ({
                        ...prev,
                        free_contents: [
                          ...prev.free_contents,
                          { title: "", content_type: "lecture", video_url: "" },
                        ],
                      }))
                    }
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Content
                  </button>
                </div>
                {courseData.free_contents.map((content, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                      <input
                        type="text"
                        value={content.title}
                        onChange={(e) => {
                          const newContent = [...courseData.free_contents];
                          newContent[index].title = e.target.value;
                          setCourseData({ ...courseData, free_contents: newContent });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Introductory Lecture"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                      <select
                        value={content.content_type}
                        onChange={(e) => {
                          const newContent = [...courseData.free_contents];
                          newContent[index].content_type = e.target.value;
                          setCourseData({ ...courseData, free_contents: newContent });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="lecture">Demo Lecture</option>
                        <option value="guide">Study Guide</option>
                        <option value="orientation">Orientation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video URL</label>
                      <input
                        type="url"
                        value={content.video_url}
                        onChange={(e) => {
                          const newContent = [...courseData.free_contents];
                          newContent[index].video_url = e.target.value;
                          setCourseData({ ...courseData, free_contents: newContent });
                        }}
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          const newContent = courseData.free_contents.filter((_, i) => i !== index);
                          setCourseData({ ...courseData, free_contents: newContent });
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm w-full"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="mb-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={courseData.is_active}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active Course
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between space-x-3 pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading || selectedCentres.length !== 1}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-200 disabled:opacity-50 flex items-center"
                    title={selectedCentres.length !== 1 ? "Select exactly one centre for single creation" : ""}
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
                        Creating...
                      </>
                    ) : (
                      `Create for ${isOnlineCentreSelected ? "Online" : "Single"} Centre`
                    )}
                  </button>

                  {!isOnlineCentreSelected && (
                    <button
                      type="button"
                      onClick={handleBatchSubmit}
                      disabled={batchLoading || selectedCentres.length === 0}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md transition duration-200 disabled:opacity-50 flex items-center"
                    >
                      {batchLoading ? (
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
                          Creating for {selectedCentres.length} centre(s)...
                        </>
                      ) : (
                        `Create for ${selectedCentres.length} Centre(s)`
                      )}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/business/admin/courses")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* CSV UPLOAD FORM */
          <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-gray-200 dark:border-slate-800">
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Bulk Upload Courses via CSV
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload a CSV file to create multiple courses at once for different centres.
              </p>

              {/* CSV Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 text-center mb-6">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>

                  <label className="cursor-pointer">
                    <span className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition duration-200 inline-block">
                      Choose CSV File
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="hidden"
                    />
                  </label>

                  <p className="text-sm text-gray-500 mt-3">
                    {csvFileName || "No file chosen"}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Supports .csv files only
                  </p>
                </div>
              </div>

              {/* CSV Data Preview */}
              {csvData.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    CSV Preview ({csvData.length} courses)
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Centre
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Course Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Class Level
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Price (₹)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Mode
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                        {csvData.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm">
                              <span className={`font-medium ${row.centre === "Online" ? "text-green-600 dark:text-green-400" : "text-gray-900"}`}>
                                {row.centre}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {row.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {row.class_level}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              ₹{parseFloat(row.course_price).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`capitalize ${row.mode === "online" ? "text-green-600 dark:text-green-400" : "text-gray-900"}`}>
                                {row.mode}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvData.length > 5 && (
                      <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 text-center">
                        ...and {csvData.length - 5} more courses
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Download Template */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Need a template?
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Download our CSV template with example data for both online and offline courses.
                    </p>
                  </div>
                  <button
                    onClick={downloadCsvTemplate}
                    className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Download Template
                  </button>
                </div>
              </div>

              {/* CSV Format Requirements */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  CSV Format Requirements
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Required columns:</strong> centre, name, class_level, course_price, duration, course_sessions, mode</li>
                  <li>• <strong>For Online courses:</strong> Use centre = "Online", mode = "online"</li>
                  <li>• <strong>For Offline courses:</strong> Centre name must match existing centres</li>
                  <li>• <strong>Optional columns:</strong> badge, offers, is_active (true/false)</li>
                  <li>• <strong>Mode options:</strong> online, offline, or centre</li>
                  <li>• <strong>Price:</strong> Should be a number (e.g., 25000)</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between space-x-3 pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={handleCsvSubmit}
                    disabled={csvLoading || csvData.length === 0}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition duration-200 disabled:opacity-50 flex items-center"
                  >
                    {csvLoading ? (
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
                        Creating {csvData.length} course(s)...
                      </>
                    ) : (
                      `Create ${csvData.length} Course(s) from CSV`
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/business/admin/courses")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
        }
      </div >
    </div >
  );
};

export default CourseCreate;