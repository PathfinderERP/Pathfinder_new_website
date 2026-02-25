import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';

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
    merchandiseItems
}) => {
    return (
        <div className="flex-1">
            {/* Global Popular Items row (Curated) */}
            {popularItems.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Popular Books</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {popularItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Study Materials Row */}
            {studyMaterialsItems && studyMaterialsItems.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Study Materials</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {studyMaterialsItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular IIT JEE Books Section (All India) */}
            {iitJeeItems.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Popular IIT JEE Books</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {iitJeeItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Banner Row */}
            <div className="mb-14 ">
                <div className="">
                    <img
                        src="/images/student corner/student corner home page  2nd banner.png"
                        alt="Pathfinder Promotion"
                        className="w-full h-auto block"
                    />
                </div>
            </div>

            {/* Foundation Section */}
            {foundationItems && foundationItems.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Foundation Courses</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {foundationItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Olympiads Section */}
            {olympiadsItems && olympiadsItems.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Olympiad Prep</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {olympiadsItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Boards General Section */}
            {boardsItems && boardsItems.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Board Exam Essentials</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {boardsItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular CBSE Class 10th Books Section */}
            {cbse10Items && cbse10Items.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Popular CBSE Class 10th Books</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {cbse10Items.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular CBSE Class 12th Books Section */}
            {cbse12Items && cbse12Items.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Popular CBSE Class 12th Books</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {cbse12Items.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Timetables Section */}
            {timetablesItems && timetablesItems.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Study Timetables</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {timetablesItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Merchandise Section */}
            {merchandiseItems && merchandiseItems.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Popular Merchandise</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {merchandiseItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Stationery Section */}
            {stationeryItems && stationeryItems.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1 px-6">
                        <h2 className="text-2xl font-black text-slate-900">Popular Stationery</h2>
                        <button className="text-xs font-bold text-slate-400 hover:text-[#FF7D54] flex items-center gap-1 transition-colors">
                            See all <ChevronRightIcon className="h-3 w-3" strokeWidth={4} />
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pt-8 pb-8 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {stationeryItems.map((item) => (
                            <div key={item.id || item.unique_id} className="min-w-[240px] w-[240px]">
                                <ProductCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeTab;
