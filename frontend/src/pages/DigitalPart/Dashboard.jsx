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
        setMyCourses(coursesRes.data);
        setMyOrders(ordersRes.data || []);

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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row p-4 lg:p-6 gap-6 font-sans text-slate-900 pt-16 lg:pt-40 pb-12 sm:pb-16 2xl:max-w-7xl 2xl:mx-auto 2xl:shadow-2xl 2xl:rounded-[60px] 2xl:my-8 2xl:border 2xl:border-slate-100">

      <StudentSidebar />

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col gap-6 max-w-full overflow-hidden mt-2 lg:mt-0">

        {/* Desktop Search Bar - Kept for LG screens */}
        <div className="hidden lg:block px-2 mb-4 lg:mt-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="search"
              className="w-full bg-white border-none rounded-full py-4 pl-14 pr-6 text-sm shadow-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">

          {/* Left Column (Hero + Performance + Courses) */}
          <div className="xl:col-span-9 flex flex-col gap-8">

            {/* Hero Section */}
            <div className="bg-black rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[280px]">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="bg-white/10 self-start px-4 py-1 rounded-full text-xs font-medium text-slate-300 backdrop-blur-md">
                  {currentDate}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight">
                  Welcome back, <span className="text-[#FF8C61] underline decoration-white/20 underline-offset-8 decoration-2">{user?.fullName?.split(' ')[0] || 'Student'}</span>!
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base font-medium">
                  Always stay updated in your student portal
                </p>
              </div>

              {/* 3D Character - Absolute Positioning for better fit */}
              <div className="mt-8 md:mt-0 md:absolute right-8 bottom-0 w-64 h-64 md:w-80 md:h-80">
                <img
                  src={CHARACTER_IMG}
                  alt="3D Student Character"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Performance Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold px-2">Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: PERFORMANCE_ICONS.bars, color: "bg-white" },
                  { icon: PERFORMANCE_ICONS.pie, border: "border-orange-500", color: "bg-white" },
                  { icon: PERFORMANCE_ICONS.notebook, color: "bg-white" },
                ].map((item, i) => (
                  <div key={i} className={`${item.color} rounded-[32px] p-8 flex flex-col items-center justify-center shadow-sm border ${item.border || "border-white"} hover:border-orange-200 transition-all cursor-pointer group h-48`}>
                    <img src={item.icon} alt="stat icon" className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </section>

            {/* Enrolled Courses Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold">Enrolled Courses</h2>
                <button
                  onClick={() => navigate('/my-courses')}
                  className="text-sm font-semibold text-slate-400 hover:text-orange-500 transition-colors"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {myCourses && myCourses.length > 0 ? (
                  myCourses.slice(0, 2).map((course) => (
                    <div key={course.id || course._id} className="bg-[#FF8C61] rounded-[32px] p-6 md:p-8 flex items-center justify-between text-white relative overflow-hidden group hover:shadow-xl hover:shadow-orange-200/50 transition-all h-40 md:h-44">
                      <div className="relative z-10 flex flex-col items-start gap-3 md:gap-4">
                        <h3 className="text-lg md:text-xl font-black leading-tight max-w-[120px] line-clamp-2">{course.name}</h3>
                        <button
                          onClick={() => navigate('/my-courses')}
                          className="bg-black text-white px-6 md:px-8 py-2 md:py-2.5 rounded-2xl text-xs md:text-sm font-bold active:scale-95 transition-all"
                        >
                          View
                        </button>
                      </div>
                      <div className="absolute right-2 md:right-4 bottom-[-10px] w-32 h-32 md:w-40 md:h-40">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt="course" className="w-full h-full object-cover rounded-xl rotate-[-10deg] group-hover:rotate-0 transition-transform duration-500 opacity-80" />
                        ) : (
                          <img src={BOOKS_IMG} alt="books" className="w-full h-full object-contain rotate-[-10deg] group-hover:rotate-0 transition-transform duration-500" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 bg-white rounded-[32px] p-8 flex flex-col items-center justify-center text-center border dashed border-slate-200">
                    <p className="text-slate-500 mb-4">You haven't enrolled in any courses yet.</p>
                    <button
                      onClick={() => navigate('/all-india')}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
                    >
                      Explore Courses
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Physical Assets Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold">Physical Assets</h2>
                <button
                  onClick={() => navigate('/students-corner/orders', { state: { from: '/dashboard' } })}
                  className="text-sm font-semibold text-slate-400 hover:text-orange-500 transition-colors"
                >
                  See all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {myOrders && myOrders.length > 0 ? (
                  myOrders.slice(0, 2).map((order) => (
                    <div key={order.id || order._id} className="bg-white rounded-[32px] p-6 md:p-8 flex items-center justify-between shadow-sm border border-slate-100 group hover:border-orange-200 transition-all h-40 md:h-44">
                      <div className="flex flex-col items-start gap-2">
                        <div className="bg-orange-50 p-3 rounded-2xl group-hover:bg-orange-100 transition-colors w-14 h-14 flex items-center justify-center overflow-hidden border border-orange-100/50">
                          {(order.items?.[0]?.image || order.items?.[0]?.image_url || order.items?.[0]?.img || itemImages[order.items?.[0]?.id] || itemImages[order.items?.[0]?.unique_id]) ? (
                            <img
                              src={order.items[0].image || order.items[0].image_url || order.items[0].img || itemImages[order.items[0].id] || itemImages[order.items[0].unique_id]}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const icon = e.target.parentElement.querySelector('.fallback-icon-dash');
                                if (icon) icon.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <ShoppingBagIcon className={`fallback-icon-dash h-6 w-6 text-orange-600 ${(order.items?.[0]?.image || order.items?.[0]?.image_url || order.items?.[0]?.img || itemImages[order.items?.[0]?.id] || itemImages[order.items?.[0]?.unique_id]) ? 'hidden' : 'block'}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">#{order.payment_id?.substring(0, 10) || order.id?.substring(0, 8)}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{order.items?.length || 0} Items • {order.status}</p>
                        </div>
                        <button
                          onClick={() => navigate('/students-corner/orders', { state: { from: '/dashboard' } })}
                          className="text-orange-600 text-xs font-black uppercase tracking-widest mt-2 hover:underline"
                        >
                          Track Order
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 italic">₹{order.total_amount}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 bg-slate-50 rounded-[32px] p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 mb-4 font-medium uppercase text-xs tracking-widest">No Physical Assets Detected</p>
                    <button
                      onClick={() => navigate('/students-corner')}
                      className="bg-black text-white px-8 py-2.5 rounded-2xl text-xs font-bold hover:bg-orange-600 transition shadow-lg active:scale-95"
                    >
                      Visit Store
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column (Instructors + Chats) */}
          <div className="xl:col-span-3 flex flex-col gap-8">

            {/* Course Instructors */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold">Course instructors</h2>
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-100 flex-shrink-0">
                    <img src={`https://i.pravatar.cc/150?u=instructor${i}`} alt="Instructor" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>

            {/* Chat Room */}
            <section className="flex-1 flex flex-col space-y-4 bg-white rounded-[40px] p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-[#FF8C61] font-bold">Chat Room</h2>
                <button className="text-xs text-slate-400 font-bold uppercase tracking-wider hover:text-orange-500">See all</button>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
                {[
                  { name: "Anushuya", course: "Foundation", message: "Yo guys! What EXACTLY happened in R2 today??!!!" },
                  { name: "Reyan", course: "2 year CRP", message: "Bruoo that new reel dropped on the insta is FIREEEEE!!!! in fact i was a part of it actually! Go drop some love!!!" },
                ].map((chat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-bold text-slate-800">{chat.name},</span>
                      <span className="text-xs text-slate-400 font-medium">{chat.course}</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[24px] p-4 text-sm text-slate-700 leading-relaxed shadow-sm">
                      {chat.message}
                    </div>
                    <div className="flex items-center justify-end space-x-4 text-[10px] text-slate-400 font-bold px-2">
                      <span className="flex items-center space-x-1 hover:text-orange-500 cursor-pointer">
                        <HeartIcon className="h-3 w-3" />
                        <span>132</span>
                      </span>
                      <span className="flex items-center space-x-1 hover:text-blue-500 cursor-pointer">
                        <ChatBubbleBottomCenterTextIcon className="h-3 w-3" />
                        <span>422</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
