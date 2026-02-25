import React, { useEffect, useState } from "react";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";
import { AcademicCapIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { coursesAPI } from "../../services/api";

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await coursesAPI.getMyCourses();
                setCourses(response.data);
            } catch (err) {
                console.error("Failed to fetch my courses:", err);
                setError("Failed to load your courses.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-40 lg:pt-36 pb-12 sm:pb-16 2xl:max-w-7xl 2xl:mx-auto 2xl:shadow-2xl 2xl:rounded-[60px] 2xl:my-8 2xl:border 2xl:border-slate-100">
            <StudentSidebar />
            <main className="flex-1 flex flex-col gap-6 max-w-full overflow-hidden">
                <header className="mb-4">
                    <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
                    <p className="text-slate-500">Access your active learning modules</p>
                </header>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500 py-12">{error}</div>
                ) : courses.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px] text-center">
                        <div className="bg-orange-50 p-6 rounded-full mb-6">
                            <AcademicCapIcon className="h-16 w-16 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Active Courses</h2>
                        <p className="text-slate-500 max-w-md">
                            You haven't purchased any courses yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id || course._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
                                {course.thumbnail_url && (
                                    <div className="mb-4 h-40 rounded-xl overflow-hidden bg-slate-100">
                                        <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="mb-2">
                                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                        {course.mode === 'online' ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{course.name}</h3>
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-tight">ID: {course.code}</span>
                                </div>
                                {course.is_missing && (
                                    <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Records Only - Data Sync Pending</p>
                                    </div>
                                )}
                                {course.enrolled_at && (
                                    <div className="flex items-center text-slate-500 text-sm mb-4">
                                        <CalendarIcon className="w-4 h-4 mr-1" />
                                        <span>Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <button className="w-full py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">
                                        Start Learning
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyCourses;
