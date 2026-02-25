import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jobAPI } from "../services/jobAPI";

const JobApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    applicant_address: "",
    total_experience: "",
    current_company: "",
    current_position: "",
    current_salary: "",
    expected_salary: "",
    notice_period: "",
    highest_education: "",
    skills: "",
    portfolio_url: "",
    linkedin_url: "",
    additional_info: "",
  });

  const [workExperience, setWorkExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getJobById(id);
        setJob(response.data);
      } catch (err) {
        setError("Failed to fetch job details");
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updatedExperience = [...workExperience];
    updatedExperience[index][field] = value;
    setWorkExperience(updatedExperience);
  };

  const addWorkExperience = () => {
    setWorkExperience((prev) => [
      ...prev,
      {
        company: "",
        position: "",
        start_date: "",
        end_date: "",
        currently_working: false,
        description: "",
      },
    ]);
  };

  const removeWorkExperience = (index) => {
    if (workExperience.length > 0) {
      setWorkExperience((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...education];
    updatedEducation[index][field] = value;
    setEducation(updatedEducation);
  };

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      {
        institution: "",
        degree: "",
        field_of_study: "",
        year_completed: "",
        percentage: "",
      },
    ]);
  };

  const removeEducation = (index) => {
    if (education.length > 0) {
      setEducation((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB");
        return;
      }

      // Check file type for CV (PDF, DOC, DOCX)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload PDF, DOC, or DOCX files for CV");
        return;
      }
      setCvFile(file);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields - Only personal details and CV
    if (!formData.applicant_name.trim())
      errors.applicant_name = "Full name is required";
    if (!formData.applicant_email.trim())
      errors.applicant_email = "Email is required";
    if (!formData.applicant_phone.trim())
      errors.applicant_phone = "Phone number is required";
    if (!cvFile) errors.cvFile = "CV is required";

    // Email validation
    if (
      formData.applicant_email &&
      !/\S+@\S+\.\S+/.test(formData.applicant_email)
    ) {
      errors.applicant_email = "Email is invalid";
    }

    // Phone validation (basic)
    if (
      formData.applicant_phone &&
      !/^\d{10}$/.test(formData.applicant_phone.replace(/\D/g, ""))
    ) {
      errors.applicant_phone = "Phone number should be 10 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Prepare application data
      const applicationData = {
        job_post: id,
        applicant_name: formData.applicant_name,
        applicant_email: formData.applicant_email,
        applicant_phone: formData.applicant_phone,
        applicant_address: formData.applicant_address || "",
        total_experience: formData.total_experience
          ? parseFloat(formData.total_experience)
          : 0,
        current_company: formData.current_company || "",
        current_position: formData.current_position || "",
        current_salary: formData.current_salary || "",
        expected_salary: formData.expected_salary || "",
        notice_period: formData.notice_period || "",
        highest_education: formData.highest_education || "",
        portfolio_url: formData.portfolio_url || "",
        linkedin_url: formData.linkedin_url || "",
        additional_info: formData.additional_info || "",
      };

      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append all basic form data
      Object.keys(applicationData).forEach((key) => {
        formDataToSend.append(key, applicationData[key]);
      });

      // Handle skills - append as individual form fields
      const skillsArray = formData.skills
        ? formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill)
        : [];

      console.log("Skills array:", skillsArray);
      skillsArray.forEach((skill, index) => {
        formDataToSend.append(`skills[${index}]`, skill);
      });

      // Handle work experience - append as individual form fields
      const filteredWorkExperience = workExperience.filter(
        (exp) => exp.company.trim() && exp.position.trim()
      );

      console.log("Work experience:", filteredWorkExperience);
      filteredWorkExperience.forEach((exp, index) => {
        Object.keys(exp).forEach((field) => {
          let value = exp[field];
          // Convert boolean to string
          if (typeof value === "boolean") {
            value = value.toString();
          }
          // Ensure empty dates are sent as empty strings
          if (field.includes("date") && !value) {
            value = "";
          }
          console.log(`Adding work_experience[${index}][${field}] =`, value);
          formDataToSend.append(`work_experience[${index}][${field}]`, value);
        });
      });

      // Handle education - append as individual form fields
      const filteredEducation = education.filter(
        (edu) => edu.institution.trim() && edu.degree.trim()
      );

      console.log("Education details:", filteredEducation);
      filteredEducation.forEach((edu, index) => {
        Object.keys(edu).forEach((field) => {
          let value = edu[field];
          // Ensure empty values are sent as empty strings
          if (!value) {
            value = "";
          }
          console.log(`Adding education_details[${index}][${field}] =`, value);
          formDataToSend.append(`education_details[${index}][${field}]`, value);
        });
      });

      // Append CV file
      formDataToSend.append("cv_file", cvFile);

      // Debug: Log the complete FormData contents
      console.log("=== COMPLETE FORMDATA CONTENTS ===");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }
      console.log("=== END FORMDATA CONTENTS ===");

      // Check if arrays are empty
      if (filteredWorkExperience.length === 0) {
        console.log("No work experience to send");
      }
      if (filteredEducation.length === 0) {
        console.log("No education details to send");
      }
      if (skillsArray.length === 0) {
        console.log("No skills to send");
      }

      await jobAPI.createApplication(formDataToSend);

      setSuccess(
        "Application submitted successfully! We will review your application and get back to you soon."
      );

      // Redirect to career page after 3 seconds
      setTimeout(() => {
        navigate("/career");
      }, 3000);
    } catch (err) {
      console.error("Full error response:", err.response);
      console.error("Error details:", err.response?.data);
      setError(
        err.response?.data?.message ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            Job not found
          </div>
          <Link
            to="/career"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-20 pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to={`/career/job/${id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Job Details
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-xl text-gray-600">
            {job.company} • {job.location}
          </p>
        </div>
      </div>

      {/* Application Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="applicant_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="applicant_name"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.applicant_name
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {formErrors.applicant_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.applicant_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="applicant_email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="applicant_email"
                  name="applicant_email"
                  value={formData.applicant_email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.applicant_email
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
                {formErrors.applicant_email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.applicant_email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="applicant_phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="applicant_phone"
                  name="applicant_phone"
                  value={formData.applicant_phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.applicant_phone
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your phone number"
                />
                {formErrors.applicant_phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.applicant_phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="total_experience"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Total Experience (Years)
                </label>
                <input
                  type="number"
                  id="total_experience"
                  name="total_experience"
                  value={formData.total_experience}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3.5"
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="applicant_address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address
              </label>
              <textarea
                id="applicant_address"
                name="applicant_address"
                value={formData.applicant_address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your complete address"
              />
            </div>
          </div>

          {/* Current Employment */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
              Current Employment (Optional)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="current_company"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Current Company
                </label>
                <input
                  type="text"
                  id="current_company"
                  name="current_company"
                  value={formData.current_company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current company name"
                />
              </div>

              <div>
                <label
                  htmlFor="current_position"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Current Position
                </label>
                <input
                  type="text"
                  id="current_position"
                  name="current_position"
                  value={formData.current_position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current position"
                />
              </div>

              <div>
                <label
                  htmlFor="current_salary"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Current Salary
                </label>
                <input
                  type="text"
                  id="current_salary"
                  name="current_salary"
                  value={formData.current_salary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ₹8,00,000 per annum"
                />
              </div>

              <div>
                <label
                  htmlFor="expected_salary"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Expected Salary
                </label>
                <input
                  type="text"
                  id="expected_salary"
                  name="expected_salary"
                  value={formData.expected_salary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ₹10,00,000 per annum"
                />
              </div>

              <div>
                <label
                  htmlFor="notice_period"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notice Period
                </label>
                <select
                  id="notice_period"
                  name="notice_period"
                  value={formData.notice_period}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select notice period</option>
                  <option value="Immediate">Immediate</option>
                  <option value="15 days">15 days</option>
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                  <option value="90 days">90 days</option>
                  <option value="Serving Notice">Serving Notice</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b">
                Work Experience (Optional)
              </h2>
              <button
                type="button"
                onClick={addWorkExperience}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Add Experience
              </button>
            </div>

            {workExperience.length === 0 && (
              <p className="text-gray-500 text-sm mb-4">
                No work experience added. Click "Add Experience" to add your
                work history.
              </p>
            )}

            {workExperience.map((exp, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg mb-4 border"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Experience #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeWorkExperience(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        handleWorkExperienceChange(
                          index,
                          "company",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) =>
                        handleWorkExperienceChange(
                          index,
                          "position",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Job title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={exp.start_date}
                      onChange={(e) =>
                        handleWorkExperienceChange(
                          index,
                          "start_date",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exp.end_date}
                      onChange={(e) =>
                        handleWorkExperienceChange(
                          index,
                          "end_date",
                          e.target.value
                        )
                      }
                      disabled={exp.currently_working}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={exp.currently_working}
                        onChange={(e) =>
                          handleWorkExperienceChange(
                            index,
                            "currently_working",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        I currently work here
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) =>
                        handleWorkExperienceChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your responsibilities and achievements"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b">
                Education (Optional)
              </h2>
              <button
                type="button"
                onClick={addEducation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Add Education
              </button>
            </div>

            {education.length === 0 && (
              <p className="text-gray-500 text-sm mb-4">
                No education details added. Click "Add Education" to add your
                educational background.
              </p>
            )}

            {education.map((edu, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg mb-4 border"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Education #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "institution",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="School/College/University"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        handleEducationChange(index, "degree", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., B.Tech, MBA, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={edu.field_of_study}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "field_of_study",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Computer Science, Marketing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year Completed
                    </label>
                    <input
                      type="number"
                      value={edu.year_completed}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "year_completed",
                          e.target.value
                        )
                      }
                      min="1950"
                      max="2030"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2020"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Percentage/CGPA
                    </label>
                    <input
                      type="text"
                      value={edu.percentage}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "percentage",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 85% or 8.5 CGPA"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills & Additional Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
              Skills & Additional Information (Optional)
            </h2>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="highest_education"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Highest Education
                </label>
                <input
                  type="text"
                  id="highest_education"
                  name="highest_education"
                  value={formData.highest_education}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Master's Degree, Bachelor's Degree, etc."
                />
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Skills (comma separated)
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., JavaScript, React, Node.js, Python, Project Management"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="portfolio_url"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    id="portfolio_url"
                    name="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="linkedin_url"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="additional_info"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Additional Information
                </label>
                <textarea
                  id="additional_info"
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information you'd like to share (cover letter, achievements, etc.)"
                />
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b">
              Documents
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CV/Resume * (PDF, DOC, DOCX - Max 10MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.cvFile ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {formErrors.cvFile && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.cvFile}
                  </p>
                )}
                {cvFile && (
                  <p className="mt-2 text-sm text-green-600">✓ {cvFile.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to={`/career/job/${id}`}
              className="bg-white py-3 px-6 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplication;
