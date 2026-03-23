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
    // Utility to create drag constraints for a section
    const DraggableSection = ({ items, title, category, onCategoryChange }) => {
        const carouselRef = useRef(null);
        const [constraints, setConstraints] = useState({ left: 0, right: 0 });

        useEffect(() => {
            if (carouselRef.current) {
                const scrollWidth = carouselRef.current.scrollWidth;
                const offsetWidth = carouselRef.current.offsetWidth;
                setConstraints({ left: -(scrollWidth - offsetWidth + 48), right: 0 });
            }
        }, [items]);

        return (
            <div className="mb-10 group/section">
                <div className="flex items-center justify-between mb-1 px-6">
                    <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                    {category && (
                        <button
                            onClick={() => onCategoryChange(category)}
                            className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors"
                        >
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    )}
                </div>

                <div className="relative overflow-hidden cursor-grab active:cursor-grabbing px-6">
                    <motion.div
                        ref={carouselRef}
                        drag="x"
                        dragConstraints={constraints}
                        dragElastic={0.1}
                        className="grid grid-rows-2 grid-flow-col gap-x-4 gap-y-8 pt-6 pb-14 w-fit"
                    >
                        {items.map((item) => (
                            <div
                                key={item.id || item.unique_id}
                                className="min-w-[280px] w-[280px] flex-shrink-0 select-none px-2"
                            >
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </motion.div>
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
