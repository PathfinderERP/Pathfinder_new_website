import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";
import { 
  AcademicCapIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { coursesAPI } from "../../services/api";

const MyCourses = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentBanner, setPaymentBanner] = useState(null);

    useEffect(() => {
        // Handle post-payment redirect params
        const queryParams = new URLSearchParams(location.search);
        const txnNo = queryParams.get("txnNo") || queryParams.get("merchantTxnNo") || queryParams.get("txnID");
        const status = queryParams.get("status") || queryParams.get("responseCode");
        
        if (status === "0000" || status === "SUCCESS" || status === "0") {
            setPaymentBanner({
                type: "success",
                title: "Payment Successful & Enrollment Activated!",
                message: `Your transaction (Ref: ${txnNo || 'Completed'}) was processed successfully. Welcome to your program!`,
            });
        } else if (status && status !== "UNKNOWN") {
            setPaymentBanner({
                type: "warning",
                title: "Payment Update",
                message: `Transaction response status: ${status}. If amount was deducted, your enrollment will auto-activate via webhook shortly.`,
            });
        }
    }, [location.search]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await coursesAPI.getMyCourses();
                setCourses(response.data || []);
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
                <header className="mb-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Enrolled Courses</h1>
                    <p className="text-slate-500 font-medium text-sm">Access your active learning modules, schedules & digital materials</p>
                </header>

                {/* Payment Status Notification Banner */}
                {paymentBanner && (
                    <div className={`p-5 rounded-2xl border flex items-start gap-4 shadow-sm transition-all ${
                        paymentBanner.type === 'success' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                        {paymentBanner.type === 'success' ? (
                            <CheckCircleIcon className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                            <ExclamationTriangleIcon className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <h3 className="font-bold text-base">{paymentBanner.title}</h3>
                            <p className="text-sm mt-0.5 opacity-90">{paymentBanner.message}</p>
                        </div>
                        <button 
                          onClick={() => setPaymentBanner(null)} 
                          className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
                        >
                          Dismiss
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white rounded-[32px] p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-3"></div>
                        <p className="text-slate-500 font-medium">Loading your enrolled courses...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 rounded-[32px] p-8 text-center border border-red-100 text-red-600 font-medium">
                        {error}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                        <div className="bg-orange-50 p-6 rounded-full mb-4">
                            <AcademicCapIcon className="h-14 w-14 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Course Enrolled</h2>
                        <p className="text-slate-500 max-w-md text-sm mb-8">
                            You haven't enrolled in any Pathfinder programs yet. Explore our top competitive exam & board preparation courses below!
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl text-left">
                            {[
                                { title: "JEE Advanced & Main", path: "/all-india", color: "from-orange-500 to-amber-500" },
                                { title: "NEET Medical Prep", path: "/all-india", color: "from-emerald-500 to-teal-500" },
                                { title: "Board Exams 10 & 12", path: "/boards", color: "from-blue-500 to-indigo-500" },
                                { title: "Foundation (Cl. 8-10)", path: "/foundation", color: "from-purple-500 to-pink-500" }
                            ].map((item, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => navigate(item.path)}
                                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white mb-3 shadow-sm`}>
                                            <SparklesIcon className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                                    </div>
                                    <span className="text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 mt-4">
                                        Explore <ArrowRightIcon className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id || course._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col h-full hover:shadow-md transition-all group">
                                {course.thumbnail_url ? (
                                    <div className="mb-4 h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                                        <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ) : (
                                    <div className="mb-4 h-44 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white p-4">
                                        <AcademicCapIcon className="w-16 h-16 opacity-80" />
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wide">
                                        {course.mode === 'online' ? 'Online Batch' : 'Classroom / Centre'}
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                        ID: {course.code || (course.id || '').substring(0, 6).toUpperCase()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-2">{course.name}</h3>
                                
                                {course.enrolled_at && (
                                    <div className="flex items-center text-slate-500 text-xs mb-4 gap-1.5">
                                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                                        <span>Enrolled on {new Date(course.enrolled_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                                    <button 
                                      onClick={() => alert(`Starting active batch portal for ${course.name}`)}
                                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition active:scale-95"
                                    >
                                        Access Batch
                                    </button>
                                    <button 
                                      onClick={() => navigate('/payment')}
                                      title="View Receipt"
                                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                                    >
                                        <DocumentTextIcon className="w-4 h-4" />
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

