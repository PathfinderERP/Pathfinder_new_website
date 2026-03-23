import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import SidebarCategoryNav from './SidebarCategoryNav';
import SidebarPriceFilter from './SidebarPriceFilter';
import SidebarAcademicFilters from './SidebarAcademicFilters';

const Sidebar = ({
    activeCategory,
    onCategoryChange,
    priceFilter,
    onPriceChange,
    freeDelivery,
    onDeliveryChange,
    isOpen,
    onToggle,
    selectedBoard,
    onBoardChange,
    selectedClass,
    onClassChange
}) => {
    const categories = [
        'All',
        'Study Materials',
        'All India',
        'Foundation',
        'Olympiads',
        'Boards',
        'Timetables',
        'Stationery',
        'Merchandise'
    ];

    return (
        <>
            {/* Sidebar Overlay for Mobile */}
            {isOpen && (
                <>
                    <div
                        onClick={onToggle}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] lg:hidden"
                    />
                    <div
                        className="fixed left-0 top-0 bottom-0 w-[280px] bg-gradient-to-br from-[#FF9D66] to-[#FF6B3D] z-[2001] lg:hidden overflow-y-auto"
                    >
                        <div className="relative h-full flex flex-col pt-20">
                            <button
                                onClick={onToggle}
                                className="absolute right-4 top-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/20 shadow-lg transition-all active:scale-95"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <SidebarCategoryNav
                                categories={categories}
                                activeCategory={activeCategory}
                                onCategoryChange={onCategoryChange}
                                onToggle={onToggle}
                            />
                            <SidebarPriceFilter
                                priceFilter={priceFilter}
                                onPriceChange={onPriceChange}
                                freeDelivery={freeDelivery}
                                onDeliveryChange={onDeliveryChange}
                            />
                            <SidebarAcademicFilters
                                activeCategory={activeCategory}
                                selectedBoard={selectedBoard}
                                onBoardChange={onBoardChange}
                                selectedClass={selectedClass}
                                onClassChange={onClassChange}
                            />
                        </div>
                    </div>
                </>
            )}

            <div
                className={`hidden lg:flex relative transition-all duration-300 ${isOpen ? 'w-64 mr-6 opacity-100' : 'w-0 mr-0 opacity-0 overflow-hidden'}`}
                style={{ zIndex: 1001 }}
            >
                <aside
                    className="sticky top-[72px] h-[calc(100vh-72px)] w-60 bg-gradient-to-br from-[#FF9D66] to-[#FF6B3D] shadow-[15px_0_40px_rgba(0,0,0,0.05)] flex flex-col rounded-r-3xl"
                >
                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                    <div className="relative h-full flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {/* Internal Close Button Header */}
                        <div className="flex justify-end px-5 pt-5 pb-2">
                            <button
                                onClick={onToggle}
                                className="text-white/40 hover:text-white transition-all hover:rotate-90 duration-300 p-1 group z-20 bg-white/5 rounded-lg border border-white/10"
                                title="Close Sidebar"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* 1. Category Navigation */}
                        <SidebarCategoryNav
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategoryChange={onCategoryChange}
                            onToggle={onToggle}
                        />

                        {/* 2. Price & Delivery Filters */}
                        <SidebarPriceFilter
                            priceFilter={priceFilter}
                            onPriceChange={onPriceChange}
                            freeDelivery={freeDelivery}
                            onDeliveryChange={onDeliveryChange}
                        />

                        {/* 3. Academic Filters (Board & Class) */}
                        <SidebarAcademicFilters
                            activeCategory={activeCategory}
                            selectedBoard={selectedBoard}
                            onBoardChange={onBoardChange}
                            selectedClass={selectedClass}
                            onClassChange={onClassChange}
                        />
                    </div>
                </aside>
            </div>
        </>
    );
};

export default Sidebar;
