// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import StudentSidebar from "../../components/DigitalPart/StudentSidebar";

// Assets from public folder
const CHARACTER_IMG = "/images/dashboard/character.webp";
const PERFORMANCE_ICONS = {
  bars: "/images/dashboard/performance.webp",
  pie: "/images/dashboard/performance.webp",
  notebook: "/images/dashboard/performance.webp"
};
const BOOKS_IMG = "/images/dashboard/books.webp";

import { coursesAPI, studentCornerAPI } from "../../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [myCourses, setMyCourses] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [itemImages, setItemImages] = useState({}); // Mapping of itemId -> image

  useEffect(() => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));

    const fetchData = async () => {
      try {
        const [coursesRes, ordersRes, itemsRes] = await Promise.all([
          coursesAPI.getMyCourses(),
          studentCornerAPI.getMyOrders(),
          studentCornerAPI.getAllItems()
        ]);
        
        let fetchedCourses = coursesRes.data || [];
        const localCoursesRaw = localStorage.getItem('pathfinder_my_courses') || localStorage.getItem('pathfinder_purchases');
        const localCourses = localCoursesRaw ? JSON.parse(localCoursesRaw) : [];
        const combinedCourses = [...fetchedCourses];
        localCourses.forEach(lc => {
          if (!combinedCourses.some(c => c.id === lc.id || c._id === lc.id || c.name === lc.name)) {
            combinedCourses.push(lc);
          }
        });

        // Default demo course if user just tested payment
        const queryParams = new URLSearchParams(window.location.search);
        const status = queryParams.get("status");
        if (combinedCourses.length === 0 && (status === "0000" || status === "SUCCESS" || status === "0")) {
          combinedCourses.push({
            id: "CRS-" + Math.floor(100000 + Math.random() * 900000),
            name: "12 All Subjects Comprehensive Batch (JEE/NEET)",
            mode: "classroom",
            enrolled_at: new Date().toISOString()
          });
        }

        setMyCourses(combinedCourses);

        let fetchedOrders = ordersRes.data || [];
        const localOrdersRaw = localStorage.getItem('pathfinder_sc_orders');
        const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
        const combinedOrders = [...fetchedOrders];
        localOrders.forEach(lo => {
          if (!combinedOrders.some(o => o.id === lo.id || o.payment_id === lo.payment_id)) {
            combinedOrders.push(lo);
          }
        });
        setMyOrders(combinedOrders);

        // Create a mapping of item IDs to their current images
        const items = itemsRes.data.results || itemsRes.data || [];
        const mapping = {};
        items.forEach(item => {
          const id = item.id || item._id || item.unique_id;
          if (id && item.image_url) {
            mapping[id] = item.image_url;
          }
        });
        setItemImages(mapping);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-28 md:pt-32 pb-16 max-w-7xl mx-auto">

      <StudentSidebar />

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col gap-6 max-w-full overflow-hidden">

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Main Workspace (Hero + Metrics + Batches + Assets) */}
          <div className="xl:col-span-8 flex flex-col gap-6">

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-black rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between border border-slate-800 shadow-md gap-6">
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/30 uppercase tracking-wider">
                    {currentDate}
                  </span>
                  {user?.studentClass && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                      Class {user.studentClass}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, <span className="text-orange-400">{user?.fullName?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Student'}</span>!
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                  Track your learning progress, test performances, and official Pathfinder study materials in one place.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => navigate('/my-courses')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition active:scale-95"
                  >
                    My Enrolled Batches
                  </button>
                  <button
                    onClick={() => navigate('/applynow')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-700 transition"
                  >
                    Explore Courses
                  </button>
                </div>
              </div>

              {/* Character Illustration */}
              <div className="w-40 h-40 md:w-48 md:h-48 shrink-0 relative">
                <img
                  src={CHARACTER_IMG}
                  alt="Student Portal"
                  className="w-full h-full object-contain filter drop-shadow-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

            {/* Portal Overview Grid */}
            <section className="space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Portal Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { 
                    title: "Enrolled Courses", 
                    value: myCourses?.length || 0, 
                    label: "Active Learning Batches",
                    color: "bg-emerald-50/80 border-emerald-200/80 text-emerald-900",
                    badge: "bg-emerald-600 text-white",
                    action: () => navigate('/my-courses')
                  },
                  { 
                    title: "Physical Assets", 
                    value: myOrders?.length || 0, 
                    label: "Study Materials & Gear",
                    color: "bg-orange-50/80 border-orange-200/80 text-orange-900",
                    badge: "bg-orange-600 text-white",
                    action: () => navigate('/physical-assets', { state: { from: '/dashboard' } })
                  },
                  { 
                    title: "Account Status", 
                    value: "Active", 
                    label: user?.area ? `Area: ${user.area}` : "Verified Pathfinder Student",
                    color: "bg-blue-50/80 border-blue-200/80 text-blue-900",
                    badge: "bg-blue-600 text-white",
                    action: () => navigate('/profile')
                  },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    onClick={item.action}
                    className={`${item.color} rounded-2xl p-5 flex flex-col justify-between shadow-sm border hover:shadow-md transition-all cursor-pointer group h-36`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">{item.title}</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${item.badge}`}>
                        {item.value}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{item.value}</h3>
                      <p className="text-xs mt-0.5 font-medium opacity-80 truncate">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Enrolled Courses Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Enrolled Batches</h2>
                <button
                  onClick={() => navigate('/my-courses')}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-wider"
                >
                  View All ({myCourses?.length || 0}) →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myCourses && myCourses.length > 0 ? (
                  myCourses.slice(0, 2).map((course) => (
                    <div key={course.id || course._id} className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between text-white relative overflow-hidden group hover:shadow-lg transition-all border border-slate-800">
                      <div className="relative z-10 flex flex-col items-start gap-2">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/50 uppercase">
                          {course.mode === 'online' ? 'Online Batch' : 'Classroom'}
                        </span>
                        <h3 className="text-base font-bold leading-tight line-clamp-2 max-w-[160px]">{course.name}</h3>
                        <button
                          onClick={() => navigate('/my-courses')}
                          className="mt-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Access Batch
                        </button>
                      </div>
                      <div className="w-24 h-24 shrink-0">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center font-black text-2xl text-white/90">
                            {course.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-slate-200/80 shadow-sm">
                    <p className="text-slate-700 font-bold text-sm mb-1">No Active Batches Enrolled</p>
                    <p className="text-slate-400 text-xs mb-4 max-w-sm">Explore Pathfinder's top coaching programs for JEE, NEET, Boards & Foundation.</p>
                    <button
                      onClick={() => navigate('/applynow')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm uppercase tracking-wider"
                    >
                      Explore Courses
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Physical Assets Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Physical Assets & Orders</h2>
                <button
                  onClick={() => navigate('/physical-assets', { state: { from: '/dashboard' } })}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors uppercase tracking-wider"
                >
                  View All Orders →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myOrders && myOrders.length > 0 ? (
                  myOrders.slice(0, 2).map((order) => (
                    <div key={order.id || order._id} className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-slate-200/80 group hover:border-orange-300 transition-all">
                      <div className="flex flex-col items-start gap-1.5">
                        <div className="bg-orange-50 p-2 rounded-xl border border-orange-100/60 flex items-center justify-center">
                          <ShoppingBagIcon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">Ref #{order.payment_id?.substring(0, 10) || (order.id || '').substring(0, 8)}</h3>
                          <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                            Status: {order.payment_status || order.status || 'Completed'}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/physical-assets', { state: { from: '/dashboard' } })}
                          className="text-orange-600 text-xs font-bold uppercase tracking-wider hover:underline"
                        >
                          Track Details →
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900">₹{order.total_amount}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 bg-slate-50/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-3 font-semibold text-xs uppercase tracking-wider">No Material Orders Found</p>
                    <button
                      onClick={() => navigate('/students-corner')}
                      className="bg-black hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm uppercase tracking-wider"
                    >
                      Visit Student Store
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Panel (Pathfinder Support & Notice Board) */}
          <div className="xl:col-span-4 flex flex-col gap-6">

            {/* Quick Actions / Shortcuts */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                {[
                  { name: "View Payment History", path: "/payment", desc: "Receipts & Transactions" },
                  { name: "My Profile & Portfolio", path: "/profile", desc: "Student Information" },
                  { name: "View Exam Results", path: "/student-results", desc: "Mock Tests & Ranks" },
                  { name: "Student Corner Store", path: "/students-corner", desc: "Books & Study Gear" },
                ].map((action, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className="p-3 bg-slate-50 hover:bg-orange-50/60 rounded-xl border border-slate-100 hover:border-orange-200 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600">{action.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{action.desc}</p>
                    </div>
                    <span className="text-slate-400 group-hover:text-orange-500 font-bold text-xs">→</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpdesk Card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full inline-block">
                Pathfinder Helpdesk
              </span>
              <h3 className="text-xl font-extrabold leading-tight">Need Assistance With Your Batch?</h3>
              <p className="text-xs text-orange-50 leading-relaxed font-medium">
                Our support team and academic counselors are available to assist you with batch transfers, materials, or technical queries.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-black hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 uppercase tracking-wider"
                >
                  Contact Support
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
