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
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onToggle}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1100] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[280px] bg-gradient-to-br from-[#FF9D66] to-[#FF6B3D] z-[1200] lg:hidden overflow-y-auto"
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
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <motion.div
                initial={false}
                animate={{
                    width: isOpen ? 240 : 0,
                    marginRight: isOpen ? 20 : 0,
                    opacity: isOpen ? 1 : 0
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="hidden lg:flex overflow-hidden relative z-30 -mt-20"
            >
                <motion.aside
                    className="sticky top-[100px] h-[calc(100vh-100px)] w-60 bg-gradient-to-br from-[#FF9D66] to-[#FF6B3D] shadow-[15px_0_40px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col rounded-r-3xl"
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
                </motion.aside>
            </motion.div>
        </>
    );
};

export default Sidebar;
