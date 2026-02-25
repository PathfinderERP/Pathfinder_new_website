import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const SidebarCategoryNav = ({ categories, activeCategory, onCategoryChange, onToggle }) => {
    return (
        <nav className="flex-1 px-4 space-y-1">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => {
                        onCategoryChange(cat);
                        if (window.innerWidth < 1024) onToggle();
                    }}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-left transition-all duration-300 group ${activeCategory === cat
                        ? 'bg-white text-orange-600 shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <span className="text-sm font-bold tracking-tight">
                        {cat === 'All' ? 'Home' : cat}
                    </span>
                    <ChevronRightIcon className={`h-3 w-3 transition-transform duration-300 ${activeCategory === cat ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
            ))}
        </nav>
    );
};

export default SidebarCategoryNav;
