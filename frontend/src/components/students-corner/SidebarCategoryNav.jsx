import React from 'react';
import {
    ChevronRightIcon,
    HomeIcon,
    BookOpenIcon,
    AcademicCapIcon,
    SparklesIcon,
    TrophyIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon,
    PencilSquareIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';

const categoryIcons = {
    'All': HomeIcon,
    'Study Materials': BookOpenIcon,
    'All India': AcademicCapIcon,
    'Foundation': SparklesIcon,
    'Olympiads': TrophyIcon,
    'Boards': ClipboardDocumentCheckIcon,
    'Timetables': ClockIcon,
    'Stationery': PencilSquareIcon,
    'Merchandise': ShoppingBagIcon,
};

const SidebarCategoryNav = ({ categories, activeCategory, onCategoryChange, onToggle }) => {
    return (
        <nav className="flex-1 px-3 space-y-1 py-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 block">
                Categories
            </span>
            {categories.map((cat) => {
                const IconComponent = categoryIcons[cat] || BookOpenIcon;
                const isActive = activeCategory === cat;

                return (
                    <button
                        key={cat}
                        onClick={() => {
                            onCategoryChange(cat);
                            if (window.innerWidth < 1024) onToggle();
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 group ${
                            isActive
                                ? 'bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] text-white shadow-md shadow-orange-500/20 font-bold'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-orange-50/70 font-semibold'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <IconComponent className={`h-4 w-4 transition-colors ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#FF7D54]'
                            }`} />
                            <span className="text-xs tracking-tight">
                                {cat === 'All' ? 'All Items / Home' : cat}
                            </span>
                        </div>
                        <ChevronRightIcon className={`h-3 w-3 transition-transform duration-200 ${
                            isActive ? 'translate-x-0.5 text-white' : 'opacity-0 group-hover:opacity-100 text-slate-400'
                        }`} />
                    </button>
                );
            })}
        </nav>
    );
};

export default SidebarCategoryNav;
