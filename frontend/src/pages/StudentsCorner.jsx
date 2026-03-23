import { getImageUrl } from "../utils/imageUtils";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    ShoppingBagIcon,
    CubeIcon,
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { studentCornerAPI } from '../services/api';
import ProductCard from '../components/students-corner/ProductCard';
import Sidebar from '../components/students-corner/Sidebar';
import HomeTab from '../components/students-corner/HomeTab';
import { useCart } from '../contexts/CartContext';
import { useCachedData } from '../hooks/useCachedData';

import LoadingSpinner from '../components/common/LoadingSpinner';

export default function StudentsCorner() {
    const { cartCount } = useCart();
    // Global items cache
    const { data: allItemsRaw, loading: globalLoading } = useCachedData("student_corner_all", () => studentCornerAPI.getAllItems());

    const [activeCategory, setActiveCategory] = useState('All');
    const [priceFilter, setPriceFilter] = useState(null);
    const [freeDelivery, setFreeDelivery] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState('');
    const [selectedClass, setSelectedClass] = useState('');

    useEffect(() => {
        // Show sidebar by default on desktop
        if (window.innerWidth >= 1024) {
            setIsSidebarOpen(true);
        }
    }, []);


    const allItems = useMemo(() => {
        const raw = allItemsRaw?.results || allItemsRaw || [];
        return Array.isArray(raw) ? raw : [];
    }, [allItemsRaw]);

    const popularItems = useMemo(() => allItems.filter(item => item.popular), [allItems]);
    const studyMaterialsItems = useMemo(() => allItems.filter(item => item.category === 'Study Materials'), [allItems]);
    const iitJeeItems = useMemo(() => allItems.filter(item => item.category === 'All India'), [allItems]);
    const foundationItems = useMemo(() => allItems.filter(item => item.category === 'Foundation'), [allItems]);
    const olympiadsItems = useMemo(() => allItems.filter(item => item.category === 'Olympiads'), [allItems]);
    const boardsItems = useMemo(() => allItems.filter(item => item.category === 'Boards'), [allItems]);
    const cbse10Items = useMemo(() => allItems.filter(item => item.board === 'CBSE' && item.class_level === '10'), [allItems]);
    const cbse12Items = useMemo(() => allItems.filter(item => item.board === 'CBSE' && item.class_level === '12'), [allItems]);
    const timetablesItems = useMemo(() => allItems.filter(item => item.category === 'Timetables'), [allItems]);
    const stationeryItems = useMemo(() => allItems.filter(item => item.category === 'Stationery'), [allItems]);
    const merchandiseItems = useMemo(() => allItems.filter(item => item.category === 'Merchandise'), [allItems]);

    const filteredItems = useMemo(() => {
        let result = allItems;
        if (activeCategory !== 'All') {
            result = result.filter(item => item.category === activeCategory);
        }
        if (freeDelivery) {
            result = result.filter(item => item.free_delivery);
        }
        if (priceFilter) {
            const min = priceFilter.min || 0;
            const max = priceFilter.max || Infinity;
            result = result.filter(item => item.price >= min && item.price <= max);
        }
        if (selectedBoard) {
            result = result.filter(item => item.board === selectedBoard);
        }
        if (selectedClass) {
            result = result.filter(item => item.class_level === selectedClass);
        }
        return result;
    }, [allItems, activeCategory, freeDelivery, priceFilter, selectedBoard, selectedClass]);

    const handleCategoryChange = useCallback((cat) => {
        setActiveCategory(cat);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSidebarToggle = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen font-sans pt-[56px] lg:pt-[140px] bg-slate-50 text-slate-900">
            <div className="2xl:max-w-[1600px] mx-auto bg-white sm:shadow-2xl sm:shadow-gray-200 sm:border-x sm:border-gray-100 min-h-screen">
                <style>
                    {`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        display: inline-block;
                        animation: marquee 100s linear infinite;
                        white-space: nowrap;
                    }
                    .animate-marquee:hover {
                        animation-play-state: paused;
                    }
                    `}
                </style>

                {/* Christmas Ticker */}
                <div className="bg-gradient-to-r from-[#FFB36D] to-[#FF5E5E] py-2.5 overflow-hidden border-b border-white/10 tracking-widest text-[11px] font-bold">
                    <div className="animate-marquee">
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="mx-8 whitespace-nowrap">
                                <span className="text-black font-black">BIG NEWS!</span>
                                <span className="text-white"> | WE ARE OFFERING AWESOME CHRISTMAS DISCOUNT AND GIFTS ON REFERRALS!</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Header Layer: Sticky on mobile, relative on desktop */}
                <header className="sticky top-[56px] lg:relative lg:top-0 z-[40] lg:z-[60] bg-white border-b border-gray-100 py-3 lg:py-3 px-4 sm:px-6 lg:px-8 shadow-sm lg:shadow-none">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 lg:gap-12">
                        {/* Left Side: Toggle (Mobile) or Branding (Desktop) */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSidebarToggle}
                                className="relative z-[70] p-2 sm:p-2.5 bg-[#FF7D54] text-white rounded-xl shadow-lg shadow-orange-200 hover:bg-[#FF6B3D] transition-all active:scale-95 flex-shrink-0"
                            >
                                {isSidebarOpen ? (
                                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                ) : (
                                    <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                )}
                            </button>
                            <h1 className="hidden xl:block text-xl font-black text-slate-900 italic uppercase tracking-tighter">
                                Students<span className="text-[#FF7D54]">Corner</span>
                            </h1>
                        </div>

                        {/* Center: Search Bar - Limited width on desktop */}
                        <div className="flex-1 max-w-2xl">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search for books, materials, stationery..."
                                    className="w-full border border-slate-200 rounded-2xl py-2 sm:py-3 pl-4 sm:pl-6 pr-12 focus:outline-none focus:ring-4 focus:ring-[#FF7D54]/10 focus:border-[#FF7D54] placeholder:text-slate-400 font-medium text-sm transition-all bg-slate-50 focus:bg-white"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF7D54] transition-all">
                                    <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Right: User Actions - Vertical on desktop */}
                        <div className="flex items-center gap-3 sm:gap-8 flex-shrink-0">
                            <Link to="/students-corner/orders" className="flex flex-col items-center group transition-all text-slate-600 hover:text-[#FF7D54]">
                                <div className="p-1 px-2 rounded-xl group-hover:bg-orange-50 transition-colors">
                                    <CubeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <span className="hidden sm:block text-[10px] font-bold mt-0.5 uppercase tracking-wide">Orders</span>
                            </Link>
                            <Link to="/students-corner/bag" className="flex flex-col items-center group transition-all text-slate-600 hover:text-[#FF7D54] relative">
                                <div className="p-1 px-2 rounded-xl group-hover:bg-orange-50 transition-colors relative">
                                    <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#FF7D54] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden sm:block text-[10px] font-bold mt-0.5 uppercase tracking-wide">My Bag</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Non-Sticky Mobile Category Nav (Scrolls with page) */}
                <div className="lg:hidden bg-slate-50/50 py-3 px-4 overflow-x-auto whitespace-nowrap border-b border-gray-100 scrollbar-hide">
                    <div className="flex gap-2">
                        {['All', 'Study Materials', 'All India', 'Foundation', 'Olympiads', 'Boards', 'Timetables', 'Stationery', 'Merchandise'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${activeCategory === cat
                                    ? 'bg-[#FF7D54] text-white border-[#FF7D54] shadow-md shadow-orange-100'
                                    : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                                    }`}
                            >
                                {cat === 'All' ? 'Home' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mx-auto max-w-[1600px] relative">
                    <div className="flex flex-col lg:flex-row min-h-screen">
                        {/* Sidebar: Handles both Mobile and Desktop internally */}
                        <Sidebar
                            activeCategory={activeCategory}
                            onCategoryChange={handleCategoryChange}
                            priceFilter={priceFilter}
                            onPriceChange={setPriceFilter}
                            freeDelivery={freeDelivery}
                            onDeliveryChange={setFreeDelivery}
                            isOpen={isSidebarOpen}
                            onToggle={handleSidebarToggle}
                            selectedBoard={selectedBoard}
                            onBoardChange={setSelectedBoard}
                            selectedClass={selectedClass}
                            onClassChange={setSelectedClass}
                        />

                        {/* Main Content Area */}
                        <div className="flex-1 w-full lg:overflow-visible px-4 sm:px-6 lg:px-0">
                            {/* Persistent Hero Banner */}
                            <div className="mb-8 overflow-hidden aspect-[21/9] lg:aspect-auto">
                                <img
                                    src={getImageUrl("/images/student corner/student coner hero image.webp")}
                                    alt="Pathfinder Topper"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {activeCategory === 'All' ? (
                                <HomeTab
                                    popularItems={popularItems}
                                    studyMaterialsItems={studyMaterialsItems}
                                    iitJeeItems={iitJeeItems}
                                    foundationItems={foundationItems}
                                    olympiadsItems={olympiadsItems}
                                    boardsItems={boardsItems}
                                    cbse10Items={cbse10Items}
                                    cbse12Items={cbse12Items}
                                    timetablesItems={timetablesItems}
                                    stationeryItems={stationeryItems}
                                    merchandiseItems={merchandiseItems}
                                    onCategoryChange={handleCategoryChange}
                                />
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6 px-2">
                                        <h2 className="text-2xl font-black text-slate-900">
                                            {activeCategory}
                                        </h2>
                                        <span className="text-sm font-bold text-slate-400">
                                            {filteredItems.length} Result{filteredItems.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="min-h-[600px]">
                                        {globalLoading ? (
                                            <div className="flex items-center justify-center h-96">
                                                <LoadingSpinner />
                                            </div>
                                        ) : (
                                            <motion.div
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 relative"
                                            >
                                                {filteredItems.length > 0 ? (
                                                    filteredItems.map((item) => (
                                                        <ProductCard key={item.id || item.unique_id} item={item} />
                                                    ))
                                                ) : (
                                                    <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                                            <MagnifyingGlassIcon className="h-10 w-10 text-slate-300" />
                                                        </div>
                                                        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">No items found</h3>
                                                        <p className="text-slate-500 font-medium max-w-xs">
                                                            Try adjusting your filters or selecting a different category.
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
