import { useState, useCallback } from "react";
import { coursesAPI } from "../services/api";

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (err) {
      setError("Failed to fetch courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(
    async (courseData) => {
      setLoading(true);
      setError("");
      try {
        const response = await coursesAPI.create(courseData);
        await fetchCourses(); // Refresh the list
        return { success: true, data: response.data };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to create course";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [fetchCourses]
  );

  const updateCourse = useCallback(
    async (id, courseData) => {
      setLoading(true);
      setError("");
      try {
        const response = await coursesAPI.update(id, courseData);
        await fetchCourses(); // Refresh the list
        return { success: true, data: response.data };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to update course";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [fetchCourses]
  );

  const deleteCourse = useCallback(
    async (id) => {
      setLoading(true);
      setError("");
      try {
        await coursesAPI.delete(id);
        await fetchCourses(); // Refresh the list
        return { success: true };
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Failed to delete course";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [fetchCourses]
  );

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
  };
};
