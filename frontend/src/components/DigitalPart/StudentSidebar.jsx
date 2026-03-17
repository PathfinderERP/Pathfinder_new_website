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
    MagnifyingGlassIcon,
    ShoppingBagIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const StudentSidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);

    React.useEffect(() => {
        const handleToggle = () => setIsMenuOpen(prev => !prev);
        window.addEventListener('toggle-student-menu', handleToggle);
        return () => window.removeEventListener('toggle-student-menu', handleToggle);
    }, []);

    const menuItems = [
        { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
        { name: "Payment Info", href: "/payment", icon: CreditCardIcon },
        { name: "Registration", href: "/portal-registration", icon: IdentificationIcon },
        { name: "Courses", href: "/my-courses", icon: AcademicCapIcon },
        { name: "Result", href: "/student-results", icon: TrophyIcon },
        { name: "Physical Assets", href: "/students-corner/orders", icon: ShoppingBagIcon },
        { name: "Notice", href: "/notices", icon: BellIcon },
        { name: "Schedule", href: "/schedule", icon: CalendarIcon },
        { name: "CHATS", href: "/chats", icon: ChatBubbleLeftRightIcon },
        { name: "Profile", href: "/profile", icon: UserIcon },
    ];

    const currentPath = location.pathname;

    // Mobile specific dock items
    const dockItems = [
        { name: "Dash", href: "/dashboard", icon: HomeIcon },
        { name: "Courses", href: "/my-courses", icon: AcademicCapIcon },
        { name: "Result", href: "/student-results", icon: TrophyIcon },
        { name: "Profile", href: "/profile", icon: UserIcon },
    ];

    return (
        <>
            {/* Mobile Experience - Floating Top Dock */}
            <div className="lg:hidden">
                {/* Full Screen Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: "-100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-0 z-[60] bg-black p-8 flex flex-col pt-24"
                        >
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="absolute top-8 right-8 p-3 bg-white/10 rounded-full text-white"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <div className="mb-12">
                                <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2">Navigation</h3>
                                <div className="h-1 w-12 bg-[#FF7D54]"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto no-scrollbar pb-12">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            navigate(item.href, { state: { from: location.pathname } });
                                            setIsMenuOpen(false);
                                        }}
                                        className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all text-center"
                                    >
                                        <item.icon className="h-6 w-6 text-[#FF7D54]" />
                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">{item.name}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex flex-col items-center justify-center gap-3 text-red-500 col-span-2 mt-4"
                                >
                                    <span className="text-sm font-black uppercase tracking-[0.2em]">Logout Session</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Navigation Dock - Top */}
                <div className="relative z-10 w-full max-w-xl mx-auto mb-2">
                    <div className="bg-black/90 border border-white/10 rounded-[28px] p-1.5 flex items-center justify-between shadow-xl relative">
                        {dockItems.map((item) => {
                            const isActive = currentPath === item.href;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => navigate(item.href, { state: { from: location.pathname } })}
                                    className={`relative px-4 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300
                                        ${isActive ? "text-[#FF7D54] bg-[#FF7D54]/10" : "text-white/40 hover:text-white"}
                                    `}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">{item.name}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="dock-active"
                                            className="absolute -bottom-1 w-1 h-1 bg-[#FF7D54] rounded-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className={`px-4 py-3 transition-all ${isSearchOpen ? "text-[#FF7D54]" : "text-white/40 hover:text-white"}`}
                            >
                                <MagnifyingGlassIcon className={`h-5 w-5 ${isSearchOpen ? "scale-110" : ""}`} />
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="bg-[#FF7D54] p-3.5 rounded-2xl text-black shadow-lg shadow-[#FF7D54]/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Squares2X2Icon className="h-6 w-6 font-bold" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Search Bar - Positioned "Between Two" (Dock and Content) */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative z-20 w-full max-w-xl mx-auto px-4 mb-4"
                        >
                            <div className="bg-white rounded-[28px] p-2 shadow-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shrink-0">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-[#FF7D54]" />
                                </div>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search portal..."
                                    className="flex-1 bg-transparent border-none outline-none text-slate-800 font-bold placeholder:text-slate-400 text-sm"
                                />
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-900 transition-all"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-[#FF7D54] rounded-[45px] pt-12 pb-8 text-white shadow-2xl relative h-full flex-shrink-0 mt-0 overflow-hidden">
                {/* Top Icon Block */}
                <div className="flex justify-center mb-10 px-6">
                    <div className="bg-gradient-to-br from-[#FF9B7A] to-[#FF7D54] w-28 h-28 rounded-[35px] flex items-center justify-center shadow-lg border border-white/20 overflow-hidden">
                        {user?.profile_image_url ? (
                            <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="h-16 w-16 text-black" />
                        )}
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 flex flex-col space-y-1 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = currentPath === item.href;

                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.href, { state: { from: location.pathname } })}
                                className={`w-full transition-all duration-300 group py-4 px-10 relative text-left
                                    ${isActive
                                        ? "bg-black text-white font-black italic tracking-widest scale-x-105"
                                        : "text-white/80 hover:text-white font-medium hover:bg-white/5"}
                                `}
                            >
                                <span className="text-base uppercase">
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom logout section */}
                <div className="mt-12">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center py-4 text-white font-bold hover:scale-105 transition-all"
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default StudentSidebar;
