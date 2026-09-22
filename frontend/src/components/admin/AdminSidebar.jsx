import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    Squares2X2Icon,
    AcademicCapIcon,
    UserGroupIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    BuildingStorefrontIcon,
    UserIcon,
    BookOpenIcon,
    NewspaperIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    MegaphoneIcon,
    PresentationChartLineIcon,
    RocketLaunchIcon,
    TrophyIcon,
    ChevronDownIcon,
    ShoppingBagIcon
} from "@heroicons/react/24/outline";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const { admin } = useAuth();
    const location = useLocation();
    const [shikshaMenuOpen, setShikshaMenuOpen] = useState(
        location.pathname.includes("/shiksha")
    );

    const isActiveLink = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + "/");
    };

    const navItems = [
        { name: "Dashboard",        path: "/business/admin/dashboard",          icon: Squares2X2Icon,          permission: "view_dashboard" },
        { name: "Courses",          path: "/business/admin/courses",             icon: AcademicCapIcon,         permission: "manage_courses" },
        { name: "Mock Tests",       path: "/business/admin/mocktests",           icon: TrophyIcon,              permission: "manage_mocktests" },
        { name: "Applicants",       path: "/business/admin/course-applications", icon: DocumentTextIcon,        permission: "manage_applications" },
        { name: "Ads Leads",        path: "/business/admin/ads-leads",           icon: UserGroupIcon,           permission: "manage_ads_leads" },
        { name: "PNTSE Management", path: "/business/admin/pntse",               icon: TrophyIcon,              permission: "manage_ads_leads" },
        { 
          name: "Shiksha Portal",       
          icon: UserGroupIcon,           
          permission: "manage_ads_leads",
          isParent: true,
          subItems: [
            { name: "Leads & Partners", path: "/business/admin/shiksha-hub", icon: UserGroupIcon },
            { name: "Shiksha Bandhu Products", path: "/business/admin/shiksha-products", icon: ShoppingBagIcon }
          ]
        },
        { name: "Franchise",        path: "/business/admin/franchise-inquiries", icon: BuildingStorefrontIcon,  permission: "manage_franchise" },
        { name: "Counselling",      path: "/business/admin/counselling-bookings", icon: UserIcon,                permission: "manage_counselling_bookings" },
        { name: "Centres",          path: "/business/admin/centres",             icon: BuildingOfficeIcon,      permission: "manage_centres" },
        { name: "Alumni",           path: "/business/admin/alumni",              icon: UserGroupIcon,           permission: "manage_alumni" },
        { name: "Users",            path: "/business/admin/users",               icon: UserIcon,                permission: "manage_users" },
        { name: "Student Corner",   path: "/business/admin/student-corner",      icon: BookOpenIcon,            permission: "manage_student_corner" },
        { name: "Blog",             path: "/business/admin/blog",                icon: NewspaperIcon,           permission: "manage_blogs" },
        { name: "Top Banner",       path: "/business/admin/announcements",       icon: MegaphoneIcon,           permission: "manage_announcements" },
        { name: "Jobs",             path: "/business/admin/jobs",                icon: BriefcaseIcon,           permission: "manage_jobs" },
        { name: "WBJEE Analysis",   path: "/business/admin/wbjee-analysis",      icon: PresentationChartLineIcon, permission: "manage_wbjee_analysis" },
        { name: "NEET Analysis",    path: "/business/admin/neet-analysis",       icon: PresentationChartLineIcon, permission: "manage_neet_analysis" },
        { name: "JEE Analysis",     path: "/business/admin/jee-analysis",        icon: PresentationChartLineIcon, permission: "manage_jee_analysis" },
        { name: "Prediction Popup", path: "/business/admin/popups",              icon: RocketLaunchIcon,        permission: "manage_popups" },
        { name: "Custom Pages",     path: "/business/admin/custom-pages",        icon: DocumentTextIcon,        permission: "manage_custom_pages" },
    ];

    // Filter items based on permissions
    const filteredNavItems = navItems.filter(item => {
        if (admin?.is_superuser) return true;
        if (!item.permission) return true;
        return admin?.permissions?.includes(item.permission);
    });

    if (admin?.is_superuser) {
        filteredNavItems.push({ name: "Admin Management", path: "/business/admin/management", icon: Cog6ToothIcon });
    }

    if (admin?.is_superuser || admin?.permissions?.includes("system_settings")) {
        filteredNavItems.push({ name: "Settings", path: "/business/admin/settings", icon: Cog6ToothIcon });
    }

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-20 lg:translate-x-0"
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Logo Section */}
                <div className={`flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-800 ${isOpen ? "justify-between" : "justify-center"}`}>
                    <Link to="/business/admin/dashboard" className={`flex items-center ${isOpen ? "space-x-2" : ""}`}>
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">P</span>
                        </div>
                        <span className={`text-xl font-bold text-gray-900 dark:text-white transition-opacity duration-200 ${isOpen ? "opacity-100" : "hidden opacity-0 w-0 overflow-hidden"}`}>Pathfinder</span>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                    {filteredNavItems.map((item) => {
                        if (item.isParent) {
                            const isParentActive = item.subItems.some(sub => isActiveLink(sub.path));
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => setShikshaMenuOpen(!shikshaMenuOpen)}
                                        className={`w-full flex items-center justify-between py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${isOpen ? "px-3" : "px-2 justify-center"} ${isParentActive
                                            ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon
                                                className={`w-5 h-5 transition-colors duration-200 flex-shrink-0 ${isOpen ? "mr-3" : "mr-0"} ${isParentActive
                                                    ? "text-orange-600 dark:text-orange-500"
                                                    : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                                                    }`}
                                            />
                                            <span className={`whitespace-nowrap transition-opacity duration-200 ${isOpen ? "opacity-100" : "hidden opacity-0 w-0 overflow-hidden"}`}>
                                                {item.name}
                                            </span>
                                        </div>
                                        {isOpen && (
                                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${shikshaMenuOpen ? "transform rotate-180" : ""}`} />
                                        )}
                                    </button>

                                    {/* Submenu */}
                                    {shikshaMenuOpen && (
                                        <div className={`space-y-1 ${isOpen ? "pl-7" : "pl-0"}`}>
                                            {item.subItems.map((sub) => (
                                                <Link
                                                    key={sub.path}
                                                    to={sub.path}
                                                    title={!isOpen ? sub.name : ""}
                                                    className={`flex items-center py-1.5 text-xs font-semibold rounded-md transition-all duration-200 group ${isOpen ? "px-3" : "px-2 justify-center"} ${isActiveLink(sub.path)
                                                        ? "text-orange-600 dark:text-orange-500 font-bold"
                                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                        }`}
                                                >
                                                    <span className={`whitespace-nowrap ${isOpen ? "opacity-100" : "hidden opacity-0 w-0 overflow-hidden"}`}>
                                                        • {sub.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={!isOpen ? item.name : ""}
                                className={`flex items-center py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${isOpen ? "px-3" : "px-2 justify-center"} ${isActiveLink(item.path)
                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                <item.icon
                                    className={`w-5 h-5 transition-colors duration-200 flex-shrink-0 ${isOpen ? "mr-3" : "mr-0"} ${isActiveLink(item.path)
                                        ? "text-orange-600 dark:text-orange-500"
                                        : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                                        }`}
                                />
                                <span className={`whitespace-nowrap transition-opacity duration-200 ${isOpen ? "opacity-100" : "hidden opacity-0 w-0 overflow-hidden"}`}>
                                    {item.name}
                                </span>
                                {isActiveLink(item.path) && isOpen && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-500 flex-shrink-0" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-800">
                    <div className={`flex items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-800/50 ${isOpen ? "" : "justify-center"}`}>
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500 font-bold flex-shrink-0">
                            {admin?.full_name?.charAt(0) || "A"}
                        </div>
                        <div className={`ml-3 overflow-hidden transition-all duration-200 ${isOpen ? "opacity-100 w-auto" : "hidden opacity-0 w-0"}`}>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {admin?.full_name || "Admin"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {admin?.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
