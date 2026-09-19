import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    UserCircleIcon,
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    AcademicCapIcon,
    TrophyIcon,
    UserIcon,
    Squares2X2Icon,
    CreditCardIcon,
    IdentificationIcon,
    BellIcon,
    CalendarIcon,
    ChatBubbleLeftRightIcon,
    ShoppingBagIcon,
    ArrowRightOnRectangleIcon,
    CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const StudentSidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleToggle = () => setIsMenuOpen(prev => !prev);
        window.addEventListener('toggle-student-menu', handleToggle);
        return () => window.removeEventListener('toggle-student-menu', handleToggle);
    }, []);

    const menuItems = [
        { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
        { name: "My Courses", href: "/my-courses", icon: AcademicCapIcon },
        { name: "Payment Info", href: "/payment", icon: CreditCardIcon },
        { name: "Physical Assets", href: "/students-corner/orders", icon: ShoppingBagIcon },
        { name: "Registration", href: "/portal-registration", icon: IdentificationIcon },
        { name: "Results", href: "/student-results", icon: TrophyIcon },
        { name: "Profile", href: "/profile", icon: UserIcon },
    ];

    const currentPath = location.pathname;

    return (
        <>
            {/* Mobile Header / Quick Dock */}
            <div className="lg:hidden w-full mb-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-sm flex items-center justify-between">
                    <div 
                      onClick={() => navigate('/profile')}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center shadow-sm text-base">
                            {(user?.fullName || user?.full_name || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1">
                                {user?.fullName || user?.full_name || "Student"}
                                <CheckBadgeIcon className="w-4 h-4 text-emerald-600 inline shrink-0" />
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">Class {user?.studentClass || user?.student_class || "N/A"}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 transition"
                    >
                        <Squares2X2Icon className="h-5 w-5" />
                    </button>
                </div>

                {/* Mobile Slide-over Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-end"
                        >
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                                className="w-4/5 max-w-sm bg-white h-full p-6 flex flex-col shadow-2xl overflow-y-auto"
                            >
                                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Student Portal</h3>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                                        {(user?.fullName || "S").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">{user?.fullName || "Student"}</h4>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <nav className="space-y-1.5 flex-1">
                                    {menuItems.map((item) => {
                                        const isActive = currentPath === item.href;
                                        return (
                                            <button
                                                key={item.name}
                                                onClick={() => {
                                                    navigate(item.href);
                                                    setIsMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                                                    isActive 
                                                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                                                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                }`}
                                            >
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="pt-6 border-t border-slate-100 mt-6">
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 h-fit sticky top-28 shrink-0">
                {/* User Profile Card */}
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0">
                        {user?.profile_image_url ? (
                            <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            (user?.fullName || user?.full_name || "S").charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="truncate">
                        <h4 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                            {user?.fullName || user?.full_name || "Student"}
                        </h4>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                            Class {user?.studentClass || user?.student_class || "12"}
                        </span>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = currentPath === item.href;

                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.href)}
                                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 text-left ${
                                    isActive
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 font-bold"
                                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                                }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? "text-orange-400" : "text-slate-400"}`} />
                                <span className="uppercase tracking-wider">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Logout */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-all uppercase tracking-wider"
                    >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default StudentSidebar;

