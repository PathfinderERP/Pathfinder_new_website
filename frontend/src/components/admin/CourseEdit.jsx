// React import remains the same
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { coursesAPI, centresAPI } from "../../services/api";
import { clearAdminCache } from "../../hooks/useAdminCache";

const EXAM_OPTIONS = {
  "All India": ['JEE Main', 'JEE Advanced', 'NEET UG', 'NEET PG', 'WBJEE'],
  "Foundation": ['VSO', 'JBNSTS', 'INMO', 'IOQM'],
  "Boards": ['CBSE-X', 'CBSE-XII', 'H.S', 'ICSE', 'ICS', 'Madhyamik']
};

const CourseEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [centres, setCentres] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [fetchLoading, setFetchLoading] = useState({
    centres: false,
  });

  const [courseData, setCourseData] = useState({
    name: "",
    state: null,
    district: null,
    centre: "",
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
    toppers: [], // Keep empty toppers array for backend requirement
    teachers: [],
    free_contents: [],
    thumbnail_image_file: null,
    thumbnail_url: null,
    course_title: "",
  });

  // Fetch course data and centres on component mount
  useEffect(() => {
    fetchCourseData();
    fetchAllCentres();
  }, [id]);

  // Handle scroll to hash after loading
  useEffect(() => {
    if (!loading && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [loading, location.hash]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getById(id);
      const course = response.data;

      // Format the course data for the form
      setCourseData({
        name: course.name || "",
        state: course.state || null,
        district: course.district || null,
        centre: course.centre || "",
        mode: course.mode || "offline",
        course_price: course.course_price || "",
        class_level: course.class_level || "",
        duration: course.duration || "",
        course_sessions: course.course_sessions || "",
        location: course.location || "",
        address: course.address || "",
        badge: course.badge || "",
        offers: course.offers || "",
        programme: course.programme || "",
        discounted_price: course.discounted_price || (course.course_price && course.offers ? (parseFloat(course.course_price) - (parseFloat(course.course_price) * parseFloat(course.offers) / 100)).toFixed(2) : ""),
        is_active: course.is_active !== undefined ? course.is_active : true,
        fees_structures: (course.fees_structures || []).map(fee => ({
          ...fee,
          fees_type: fee.fees_type || "",
          amount: fee.amount || ""
        })),
        toppers: (course.toppers || []).map(topper => ({
          ...topper,
          name: topper.name || "",
          rank: topper.rank || "",
          year: topper.year || new Date().getFullYear(),
          exam: topper.exam || "",
          obtained_marks: topper.obtained_marks || "",
          total_marks: topper.total_marks || "",
          percentages: topper.percentages || "",
          badge: topper.badge || "",
          topper_msg: topper.topper_msg || "",
          image_file: null // clear file input
        })),
        teachers: (course.teachers || []).map(teacher => ({
          ...teacher,
          name: teacher.name || "",
          subjects: teacher.subjects || "",
          experience: teacher.experience || "",
          message: teacher.message || "",
          profile_image_file: null // clear file input
        })),
        free_contents: (course.free_contents || []).map(content => ({
          ...content,
          title: content.title || "",
          content_type: content.content_type || "lecture",
          video_url: content.video_url || ""
        })),
        thumbnail_url: course.thumbnail_url || null,
        starting_date: course.starting_date || "",
        language: course.language || "",
        course_title: course.course_title || "",
      });

      // Set the selected centre for the dropdown
      setSelectedCentre(course.centre || "");
    } catch (err) {
      setError("Failed to fetch course data");
      console.error("Error fetching course:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCentres = async () => {
    try {
      setFetchLoading((prev) => ({ ...prev, centres: true }));
      

      const response = await centresAPI.getAll();
      

      setCentres(response.data);
    } catch (err) {
      console.error("❌ Error fetching centres:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setFetchLoading((prev) => ({ ...prev, centres: false }));
    }
  };

  // Auto-fill ALL fields when centre is selected (like VLOOKUP)
  const handleCentreChange = (centreName) => {
    
    setSelectedCentre(centreName);

    if (centreName) {
      // Find the selected centre from the centres array
      const selectedCentreData = centres.find(
        (centre) => centre.centre === centreName
      );
      

      if (selectedCentreData) {
        // Auto-fill ALL related fields (like VLOOKUP)
        setCourseData((prev) => ({
          ...prev,
          state: selectedCentreData.state || null,
          district: selectedCentreData.district || null,
          location: selectedCentreData.location || "",
          address: selectedCentreData.address || "",
          centre: selectedCentreData.centre || centreName,
          // If centre is "Online", set mode to online automatically
          mode: selectedCentreData.centre === "Online" ? "online" : prev.mode,
        }));
        
      } else {
        console.error("❌ Centre data not found for:", centreName);
        // Reset fields if centre not found
        setCourseData((prev) => ({
          ...prev,
          state: null,
          district: null,
          location: "",
          address: "",
          centre: centreName,
          // If centre is "Online", set mode to online automatically
          mode: centreName === "Online" ? "online" : prev.mode,
        }));
      }
    } else {
      // Reset fields if no centre selected
      setCourseData((prev) => ({
        ...prev,
        state: null,
        district: null,
        location: "",
        address: "",
        centre: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validation
    if (!courseData.centre) {
      setError("Please select a centre");
      setSaving(false);
      return;
    }

    try {
      // Prepare data for API
      // Process image uploads - remove empty image_file fields to avoid backend errors
      const processedToppers = (courseData.toppers || []).map(t => {
        const topperData = {
          ...t,
          percentages: t.percentages ? parseFloat(t.percentages) : null,
          total_marks: t.total_marks ? parseFloat(t.total_marks) : null,
          obtained_marks: t.obtained_marks ? parseFloat(t.obtained_marks) : null
        };
        // Remove image_file if it's null/empty to allow backend to keep existing image
        if (!topperData.image_file) {
          delete topperData.image_file;
        }
        return topperData;
      });

      const processedTeachers = (courseData.teachers || []).map(t => {
        const teacherData = { ...t };
        // Remove profile_image_file if it's null/empty
        if (!teacherData.profile_image_file) {
          delete teacherData.profile_image_file;
        }
        return teacherData;
      });

      // Prepare data for API
      const dataToSend = {
        ...courseData,
        course_price: parseFloat(courseData.course_price) || 0,
        offers: courseData.offers ? parseFloat(courseData.offers) : null,
        discounted_price: courseData.discounted_price ? parseFloat(courseData.discounted_price) : null,
        fees_structures: courseData.fees_structures.map((fee) => ({
          ...fee,
          amount: parseFloat(fee.amount) || 0,
        })),
        toppers: processedToppers,
        detail_sections: courseData.detail_sections || [],
        plans: courseData.plans || [],
        teachers: processedTeachers,
        free_contents: courseData.free_contents || [],
      };

      // Handle online courses
      if (dataToSend.mode === "online" || dataToSend.centre === "Online") {
        dataToSend.state = null;
        dataToSend.district = null;
        dataToSend.location = "Online";
        dataToSend.address = "Virtual Classroom";
        dataToSend.mode = "online";
      }

      // Clean up empty strings - convert to null
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === "") {
          dataToSend[key] = null;
        }
      });

      // Remove slug and code if they exist (they should be auto-generated)
      delete dataToSend.slug;
      delete dataToSend.code;

      

      await coursesAPI.update(id, dataToSend);
      clearAdminCache("admin_courses");
      alert("Course updated successfully!");
      navigate("/business/admin/courses?refresh=true");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update course";
      const errorDetails = err.response?.data?.details;

      setError(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`);
      console.error("Update course error:", err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Convert empty strings to null for non-checkbox inputs
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
          updated.discounted_price = price > 0 ? price.toFixed(2) : ""; // Or keep empty if no offer? User asked for discount calc.
        }
      }

      return updated;
    });
  };

  // Handle mode change
  const handleModeChange = (e) => {
    const mode = e.target.value;
    setCourseData((prev) => ({
      ...prev,
      mode: mode,
    }));

    // If changing to online mode, clear location data
    if (mode === "online") {
      setCourseData((prev) => ({
        ...prev,
        state: null,
        district: null,
        location: "Online",
        address: "Virtual Classroom",
      }));
    }
  };

  // Fee Structure Functions
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

  const handleDeleteCourse = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        await coursesAPI.delete(id);
        clearAdminCache("admin_courses");
        alert("Course deleted successfully!");
        navigate("/business/admin/courses?refresh=true");
      } catch (err) {
        setError("Failed to delete course");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.error("Delete course error:", err);
      }
    }
  };

  // Helper function to get display value for state/district
  const getDisplayValue = (value) => {
    return value === null ? "" : value;
  };

  // Check if course is online
  const isOnlineCourse = courseData.mode === "online" || courseData.centre === "Online";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-gray-200 dark:border-slate-800">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update course details and information
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/business/admin/courses")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Back to Courses
            </button>
            <button
              onClick={handleDeleteCourse}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Delete Course
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 border border-gray-200 dark:border-slate-800">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Thumbnail Image Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Thumbnail
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="h-32 w-48 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
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
                    <div className="flex flex-col items-start justify-center">
                      <input
                        id="thumbnail_input"
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
                      {courseData.thumbnail_url && (
                        <button
                          type="button"
                          onClick={() => {
                            setCourseData(prev => ({
                              ...prev,
                              thumbnail_image_file: null,
                              thumbnail_url: null
                            }));
                            const fileInput = document.getElementById('thumbnail_input');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="mt-2 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Centre Dropdown - ONLY THIS DROPDOWN */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Centre *
                  </label>
                  <select
                    value={selectedCentre}
                    onChange={(e) => handleCentreChange(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                    required
                    disabled={fetchLoading.centres}
                  >
                    <option value="">Choose a Centre</option>
                    <option value="Online">Online (Virtual Classroom)</option>
                    {fetchLoading.centres ? (
                      <option value="" disabled>
                        Loading centres...
                      </option>
                    ) : centres.length > 0 ? (
                      centres.map((centre) => (
                        <option key={centre.id} value={centre.centre}>
                          {centre.centre} - {centre.district || "N/A"}, {centre.state || "N/A"}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No centres available
                      </option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {fetchLoading.centres
                      ? "Loading centres..."
                      : centres.length > 0
                        ? `Found ${centres.length} centre(s) - Selecting a centre will auto-fill all location fields`
                        : "No centres found in database"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select a course *
                  </label>
                  <select
                    name="name"
                    value={courseData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                    required
                    placeholder="e.g., Class 11, NEET, JEE"
                  />
                </div>

                {/* State Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State {!isOnlineCourse && "*"}
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={getDisplayValue(courseData.state)}
                    onChange={handleChange}
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${isOnlineCourse ? "bg-gray-100" : "bg-gray-50"
                      }`}
                    required={!isOnlineCourse}
                    readOnly
                    disabled={isOnlineCourse}
                    placeholder={isOnlineCourse ? "Not applicable for online courses" : "Auto-filled from centre selection"}
                  />
                  {isOnlineCourse && (
                    <p className="text-xs text-gray-500 mt-1">
                      State is not applicable for online courses
                    </p>
                  )}
                </div>

                {/* District Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    District {!isOnlineCourse && "*"}
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={getDisplayValue(courseData.district)}
                    onChange={handleChange}
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${isOnlineCourse ? "bg-gray-100" : "bg-gray-50"
                      }`}
                    required={!isOnlineCourse}
                    readOnly
                    disabled={isOnlineCourse}
                    placeholder={isOnlineCourse ? "Not applicable for online courses" : "Auto-filled from centre selection"}
                  />
                  {isOnlineCourse && (
                    <p className="text-xs text-gray-500 mt-1">
                      District is not applicable for online courses
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mode *
                  </label>
                  <select
                    name="mode"
                    value={courseData.mode}
                    onChange={handleModeChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                    required
                    disabled={isOnlineCourse}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="centre">Centre</option>
                  </select>
                  {isOnlineCourse && (
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    value={courseData.starting_date ? courseData.starting_date.split('T')[0] : ""}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Popular, New, Best Seller"
                  />
                </div>
              </div>
            </div>

            {/* Location Information - Auto-filled when centre is selected */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Location Information {isOnlineCourse ? "(Online Course)" : "(Auto-filled from Centre)"}
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={courseData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
                    required
                    readOnly
                    placeholder={isOnlineCourse ? "Online" : "Auto-filled from centre selection"}
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
                    required
                    readOnly
                    placeholder={isOnlineCourse ? "Virtual Classroom" : "Auto-filled from centre selection"}
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
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 20"
                  />
                  {courseData.discounted_price && (
                    <p className="text-sm text-green-600 mt-1">
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
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded bg-gray-50 dark:bg-slate-800/50"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
            {/* Toppers Section */}
            <div className="mb-8" id="toppers-section">
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
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded bg-gray-50 dark:bg-slate-800/50"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                          className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Percentage</label>
                    <input
                      type="number"
                      value={topper.percentages || ""}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      <div className="mt-2 text-center">
                        <img
                          src={topper.image_file || topper.image_url}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded mx-auto border border-gray-200"
                        />
                        <p className="text-xs text-green-600 mt-1">
                          {topper.image_file ? "New image selected" : "Current image"}
                        </p>
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
            < div className="mb-8" id="teachers-section" >
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
              {
                courseData.teachers.map((teacher, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded bg-gray-50 dark:bg-slate-800/50"
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
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                        className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                        <div className="mt-2 text-center">
                          <img
                            src={teacher.profile_image_file || teacher.profile_image_url}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded mx-auto border border-gray-200"
                          />
                          <p className="text-xs text-green-600 mt-1">
                            {teacher.profile_image_file ? "New image selected" : "Current image"}
                          </p>
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
                ))
              }
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
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 dark:border-slate-700 rounded bg-gray-50 dark:bg-slate-800/50"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                      className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-orange-500 focus:border-orange-500"
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
                    Updating...
                  </>
                ) : (
                  "Update Course"
                )}
              </button>
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
      </div >
    </div >
  );
};

export default CourseEdit;
