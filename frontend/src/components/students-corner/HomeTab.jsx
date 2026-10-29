import { getImageUrl } from "../../utils/imageUtils";
import React, { useRef, useEffect, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';

const HomeTab = ({
    popularItems,
    studyMaterialsItems,
    iitJeeItems,
    foundationItems,
    olympiadsItems,
    boardsItems,
    cbse10Items,
    cbse12Items,
    timetablesItems,
    stationeryItems,
    merchandiseItems,
    onCategoryChange
}) => {
    // Utility to create scrollable section with both buttons and drag support
    const DraggableSection = ({ items, title, category, onCategoryChange }) => {
        const scrollContainerRef = useRef(null);

        const handleScroll = (direction) => {
            if (scrollContainerRef.current) {
                const scrollAmount = 600;
                scrollContainerRef.current.scrollBy({
                    left: direction === 'left' ? -scrollAmount : scrollAmount,
                    behavior: 'smooth'
                });
            }
        };

        return (
            <div className="mb-12 group/section">
                <div className="flex items-center justify-between mb-3 px-4 sm:px-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{items.length} Books Available</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Scroll Arrows */}
                        <div className="hidden sm:flex items-center gap-1.5 mr-2">
                            <button
                                onClick={() => handleScroll('left')}
                                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:border-[#FF7D54] hover:text-[#FF7D54] text-slate-600 flex items-center justify-center transition-all shadow-sm active:scale-90"
                                aria-label="Scroll left"
                            >
                                <ChevronRightIcon className="h-4 w-4 rotate-180" strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => handleScroll('right')}
                                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:border-[#FF7D54] hover:text-[#FF7D54] text-slate-600 flex items-center justify-center transition-all shadow-sm active:scale-90"
                                aria-label="Scroll right"
                            >
                                <ChevronRightIcon className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                        </div>

                        {category && (
                            <button
                                onClick={() => onCategoryChange(category)}
                                className="text-xs font-bold text-[#FF7D54] hover:text-orange-600 flex items-center gap-1 bg-orange-50 hover:bg-orange-100/80 px-3 py-1.5 rounded-xl transition-colors"
                            >
                                See all <ChevronRightIcon className="h-3 w-3" strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto scrollbar-hide px-3 sm:px-6 py-2 snap-x snap-mandatory"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="flex gap-2.5 sm:gap-6 w-max pb-3 sm:pb-4">
                        {items.map((item) => (
                            <div
                                key={item.id || item.unique_id}
                                className="w-[calc((100vw-38px)/2)] max-w-[210px] sm:w-[260px] lg:w-[275px] flex-shrink-0 select-none snap-start"
                            >
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 pb-20">
            {/* 1. Popular Items */}
            {popularItems.length > 0 && (
                <DraggableSection items={popularItems} title="Popular Books" />
            )}

            {/* 2. Study Materials */}
            {studyMaterialsItems.length > 0 && (
                <DraggableSection
                    items={studyMaterialsItems}
                    title="Study Materials"
                    category="Study Materials"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* 3. IIT JEE Books */}
            {iitJeeItems.length > 0 && (
                <DraggableSection
                    items={iitJeeItems}
                    title="Popular IIT JEE Books"
                    category="All India"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* Banner Row */}
            <div className="mb-14 px-6">
                <div className="rounded-3xl overflow-hidden shadow-xl shadow-orange-100/50">
                    <img
                        src={getImageUrl("/images/student corner/student corner home page  2nd banner.webp")}
                        alt="Pathfinder Promotion"
                        className="w-full h-auto block"
                    />
                </div>
            </div>

            {/* 4. Foundation */}
            {foundationItems.length > 0 && (
                <DraggableSection
                    items={foundationItems}
                    title="Foundation Courses"
                    category="Foundation"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* 5. Olympiads */}
            {olympiadsItems.length > 0 && (
                <DraggableSection
                    items={olympiadsItems}
                    title="Olympiad Prep"
                    category="Olympiads"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* 6. Boards General */}
            {boardsItems.length > 0 && (
                <DraggableSection
                    items={boardsItems}
                    title="Board Exam Essentials"
                    category="Boards"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* 7. CBSE 10th */}
            {cbse10Items.length > 0 && (
                <DraggableSection
                    items={cbse10Items}
                    title="Popular CBSE Class 10th Books"
                    category="Boards"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* 8. CBSE 12th */}
            {cbse12Items.length > 0 && (
                <DraggableSection
                    items={cbse12Items}
                    title="Popular CBSE Class 12th Books"
                    category="Boards"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* 9. Timetables */}
            {timetablesItems.length > 0 && (
                <DraggableSection
                    items={timetablesItems}
                    title="Study Timetables"
                    category="Timetables"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* 10. Merchandise */}
            {merchandiseItems.length > 0 && (
                <DraggableSection
                    items={merchandiseItems}
                    title="Popular Merchandise"
                    category="Merchandise"
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* 11. Stationery */}
            {stationeryItems.length > 0 && (
                <DraggableSection
                    items={stationeryItems}
                    title="Popular Stationery"
                    category="Stationery"
                    onCategoryChange={onCategoryChange}
                />
            )}
        </div>
    );
};

export default HomeTab;
