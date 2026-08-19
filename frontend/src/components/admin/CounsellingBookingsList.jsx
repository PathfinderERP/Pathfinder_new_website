import React, { useState, useEffect } from "react";
import { counsellingAPI } from "../../services/api";
import { UserIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

const CounsellingBookingsList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await counsellingAPI.getAll();
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch counselling bookings:", err);
      setError("Failed to load counselling submissions. Please check if you have permissions.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filter & Search Logic
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search);
      
    const matchesCourse = filterCourse 
      ? b.preferred_course?.toLowerCase().includes(filterCourse.toLowerCase()) 
      : true;

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
            Counselling Bookings
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            View and manage student requests for free career counselling sessions.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by student name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-slate-400" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All Preferred Programs</option>
              <option value="JEE">JEE / WBJEE Prep</option>
              <option value="NEET">NEET Prep</option>
              <option value="Foundation">Foundation</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="p-4">Student Info</th>
                    <th className="p-4">Phone Number</th>
                    <th className="p-4">Preferred Program</th>
                    <th className="p-4">Time Slot</th>
                    <th className="p-4">Submission Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredBookings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800">{item.full_name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.phone}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                          {item.preferred_course}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{item.preferred_time_slot}</td>
                      <td className="p-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(item.submitted_at)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-12 text-slate-400">
                        No counselling bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CounsellingBookingsList;
