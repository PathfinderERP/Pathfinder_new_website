import React from 'react';
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
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] lg:hidden"
                    />
                    <div
                        className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-[2001] lg:hidden overflow-y-auto shadow-2xl flex flex-col"
                    >
                        {/* Mobile Drawer Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                                Categories & Filters
                            </h3>
                            <button
                                onClick={onToggle}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
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

            {/* Desktop Sidebar */}
            <div
                className={`hidden lg:flex relative transition-all duration-300 ${isOpen ? 'w-64 mr-6 opacity-100' : 'w-0 mr-0 opacity-0 overflow-hidden'}`}
                style={{ zIndex: 30 }}
            >
                <aside
                    className="sticky top-[80px] h-[calc(100vh-100px)] w-64 bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col overflow-hidden"
                >
                    <div className="relative h-full flex flex-col overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
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
