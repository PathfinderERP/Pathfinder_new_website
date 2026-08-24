import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Squares2X2Icon,
  AcademicCapIcon,
  UserGroupIcon,
  BanknotesIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { DEMO_BANDHU } from "../ShikshaBandhuData";

const NAV_ITEMS = [
  { path: "/shiksha-bandhu/dashboard", label: "Dashboard", icon: Squares2X2Icon },
  { path: "/shiksha-bandhu/mock-tests", label: "Mock Tests", icon: AcademicCapIcon },
  { path: "/shiksha-bandhu/referrals", label: "My Referrals", icon: UserGroupIcon },
  { path: "/shiksha-bandhu/earnings", label: "Earnings", icon: BanknotesIcon },
  { path: "/shiksha-bandhu/profile", label: "Profile", icon: UserIcon },
];

export const ShikshaBandhuLayout = ({ children, user = DEMO_BANDHU }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("shiksha_bandhu_user");
    navigate("/shiksha-bandhu/login");
  };

  const activeUser = (() => {
    try {
      const saved = localStorage.getItem("shiksha_bandhu_user");
      return saved ? JSON.parse(saved) : user;
    } catch {
      return user;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 md:pb-8">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Portal Title */}
          <Link to="/shiksha-bandhu/dashboard" className="flex items-center gap-3">
            <img
              src="/images/icon/logo-1.svg"
              alt="Pathfinder Logo"
              className="h-9 w-auto filter drop-shadow"
            />
            <span className="hidden sm:inline-block h-6 w-px bg-slate-200"></span>
            <span className="hidden sm:inline-block text-xs font-black uppercase tracking-wider text-[#66090D] bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
              Shiksha Bandhu Portal
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#66090D] text-white shadow-sm"
                      : "text-slate-600 hover:text-[#66090D] hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right User Bar */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full text-xs font-mono font-black">
              ID: {activeUser.id}
            </span>

            <Link
              to="/shiksha-bandhu/profile"
              className="w-9 h-9 rounded-full bg-[#66090D] text-amber-300 font-black text-xs flex items-center justify-center border-2 border-white shadow hover:scale-105 transition"
            >
              {activeUser.name ? activeUser.name.charAt(0) : "S"}
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children(activeUser)}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-slate-200 grid grid-cols-5 md:hidden shadow-lg">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2.5 text-[10px] font-extrabold transition-colors ${
                isActive ? "text-[#66090D] bg-red-50/50" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[#66090D]" : "text-slate-400"}`} />
              <span className="mt-0.5 truncate max-w-[64px]">{item.label.replace("My ", "")}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
