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
    const [searchQuery, setSearchQuery] = useState('');

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

    const popularItems = useMemo(() => allItems.filter(item => item.popular || item.is_popular), [allItems]);
    const studyMaterialsItems = useMemo(() => allItems.filter(item => item.category === 'Study Materials'), [allItems]);
    const iitJeeItems = useMemo(() => allItems.filter(item => item.category === 'All India'), [allItems]);
    const foundationItems = useMemo(() => allItems.filter(item => item.category === 'Foundation'), [allItems]);
    const olympiadsItems = useMemo(() => allItems.filter(item => item.category === 'Olympiads'), [allItems]);
    const boardsItems = useMemo(() => allItems.filter(item => item.category === 'Boards'), [allItems]);
    const cbse10Items = useMemo(() => allItems.filter(item => item.board === 'CBSE' && String(item.class_level) === '10'), [allItems]);
    const cbse12Items = useMemo(() => allItems.filter(item => item.board === 'CBSE' && String(item.class_level) === '12'), [allItems]);
    const timetablesItems = useMemo(() => allItems.filter(item => item.category === 'Timetables'), [allItems]);
    const stationeryItems = useMemo(() => allItems.filter(item => item.category === 'Stationery'), [allItems]);
    const merchandiseItems = useMemo(() => allItems.filter(item => item.category === 'Merchandise'), [allItems]);

    const filteredItems = useMemo(() => {
        let result = allItems;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.name?.toLowerCase().includes(q) ||
                item.category?.toLowerCase().includes(q) ||
                item.board?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
            );
        }
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
            result = result.filter(item => String(item.class_level) === String(selectedClass));
        }
        return result;
    }, [allItems, searchQuery, activeCategory, freeDelivery, priceFilter, selectedBoard, selectedClass]);

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
                staggerChildren: 0.05
            }
        }
    };

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="min-h-screen font-sans bg-[#F8FAFC] text-slate-900">
            <div className="2xl:max-w-[1600px] mx-auto bg-white min-h-screen border-x border-slate-200/60 shadow-xl shadow-slate-100">
                <style>
                    {`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        display: inline-block;
                        animation: marquee 80s linear infinite;
                        white-space: nowrap;
                    }
                    .animate-marquee:hover {
                        animation-play-state: paused;
                    }
                    `}
                </style>

                {/* Promotional Top Ticker */}
                <div className="bg-gradient-to-r from-[#FF7D54] via-[#FF6B3D] to-[#FF5E5E] py-2 overflow-hidden text-[11px] font-black tracking-widest text-white shadow-sm">
                    <div className="animate-marquee">
                        {[...Array(8)].map((_, i) => (
                            <span key={i} className="mx-8 whitespace-nowrap">
                                <span className="bg-white/20 px-2 py-0.5 rounded-full mr-2">NEW</span>
                                <span>GET UP TO 20% DISCOUNT ON ALL ACADEMIC BOOKS & STUDY MATERIALS | FREE EXPRESS DELIVERY ON ALL ORDERS</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Header Layer: Modern Glassmorphic Bar */}
                <header className="sticky top-[56px] lg:top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 sm:gap-6 lg:gap-10">
                        {/* Left Side: Sidebar Toggle & Branding */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSidebarToggle}
                                className="p-2 sm:p-2.5 bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] text-white rounded-2xl shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-orange-500 transition-all active:scale-95 flex-shrink-0"
                                title="Toggle categories filter"
                            >
                                {isSidebarOpen ? (
                                    <XMarkIcon className="h-5 w-5 sm:h-5 sm:w-5 stroke-[2.5]" />
                                ) : (
                                    <Bars3Icon className="h-5 w-5 sm:h-5 sm:w-5 stroke-[2.5]" />
                                )}
                            </button>
                            <Link to="/students-corner" className="hidden sm:block">
                                <h1 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">
                                    Students<span className="text-[#FF7D54]">Corner</span>
                                </h1>
                            </Link>
                        </div>

                        {/* Center: Live Search Bar */}
                        <div className="flex-1 max-w-2xl">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by book title, subject, board, class..."
                                    className="w-full border border-slate-200 rounded-2xl py-2 sm:py-2.5 pl-10 sm:pl-11 pr-10 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF7D54] placeholder:text-slate-400 font-medium text-xs sm:text-sm transition-all bg-slate-50 focus:bg-white"
                                />
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF7D54] transition-colors pointer-events-none">
                                    <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
                                </div>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right: User Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <Link
                                to="/students-corner/orders"
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl text-slate-700 hover:text-[#FF7D54] hover:bg-orange-50/70 transition-all font-bold text-xs uppercase tracking-wider border border-transparent hover:border-orange-200/60"
                            >
                                <CubeIcon className="h-5 w-5 text-slate-500" strokeWidth={2} />
                                <span className="hidden md:inline">Orders</span>
                            </Link>

                            <Link
                                to="/students-corner/bag"
                                className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-orange-50 hover:bg-orange-100/80 text-[#FF7D54] transition-all font-black text-xs uppercase tracking-wider border border-orange-200/60 active:scale-95"
                            >
                                <ShoppingBagIcon className="h-5 w-5" strokeWidth={2.2} />
                                <span className="hidden md:inline">Bag</span>
                                {cartCount > 0 && (
                                    <span className="bg-[#FF7D54] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Mobile Horizontal Category Pills */}
                <div className="lg:hidden bg-slate-50/90 py-2.5 px-4 overflow-x-auto whitespace-nowrap border-b border-slate-200/70 scrollbar-hide">
                    <div className="flex gap-2">
                        {['All', 'Study Materials', 'All India', 'Foundation', 'Olympiads', 'Boards', 'Timetables', 'Stationery', 'Merchandise'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${activeCategory === cat
                                    ? 'bg-[#FF7D54] text-white border-[#FF7D54] shadow-sm shadow-orange-500/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                {cat === 'All' ? 'All Items' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mx-auto max-w-[1600px] relative px-2.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                    <div className="flex flex-col lg:flex-row min-h-screen">
                        {/* Sidebar */}
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
                        <div className="flex-1 w-full min-w-0 pb-20">
                            {/* Hero Banner (Shown when not searching and on All category) */}
                            {!isSearching && activeCategory === 'All' && (
                                <div className="mb-10 rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100">
                                    <img
                                        src={getImageUrl("/images/student corner/student coner hero image.webp")}
                                        alt="Pathfinder Student's Corner"
                                        className="w-full h-auto object-cover max-h-[380px]"
                                    />
                                </div>
                            )}

                            {/* Section content */}
                            {isSearching ? (
                                <div>
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                                Search Results for "{searchQuery}"
                                            </h2>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                Found {filteredItems.length} book{filteredItems.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="text-xs font-bold text-[#FF7D54] hover:underline"
                                        >
                                            Clear Search
                                        </button>
                                    </div>

                                    {globalLoading ? (
                                        <div className="flex items-center justify-center h-96">
                                            <LoadingSpinner />
                                        </div>
                                    ) : (
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6"
                                        >
                                            {filteredItems.length > 0 ? (
                                                filteredItems.map((item) => (
                                                    <ProductCard key={item.id || item.unique_id} item={item} />
                                                ))
                                            ) : (
                                                <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                                                    <MagnifyingGlassIcon className="h-12 w-12 text-slate-300 mb-4" />
                                                    <h3 className="text-xl font-black text-slate-800 mb-2">No matching books found</h3>
                                                    <p className="text-slate-400 text-sm max-w-sm mb-6">
                                                        Try searching with different keywords or browse our categories.
                                                    </p>
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="bg-[#FF7D54] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#FF6B3D] transition-colors"
                                                    >
                                                        View All Books
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            ) : activeCategory === 'All' ? (
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
                                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                                {activeCategory}
                                            </h2>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                                Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleCategoryChange('All')}
                                            className="text-xs font-bold text-[#FF7D54] hover:underline"
                                        >
                                            ← Back to All
                                        </button>
                                    </div>

                                    <div className="min-h-[500px]">
                                        {globalLoading ? (
                                            <div className="flex items-center justify-center h-96">
                                                <LoadingSpinner />
                                            </div>
                                        ) : (
                                            <motion.div
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6"
                                            >
                                                {filteredItems.length > 0 ? (
                                                    filteredItems.map((item) => (
                                                        <ProductCard key={item.id || item.unique_id} item={item} />
                                                    ))
                                                ) : (
                                                    <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                                                        <MagnifyingGlassIcon className="h-12 w-12 text-slate-300 mb-4" />
                                                        <h3 className="text-xl font-black text-slate-800 mb-2">No items found</h3>
                                                        <p className="text-slate-400 text-sm max-w-sm mb-6">
                                                            Try adjusting your price range or academic filters.
                                                        </p>
                                                        <button
                                                            onClick={() => {
                                                                setPriceFilter(null);
                                                                setSelectedBoard('');
                                                                setSelectedClass('');
                                                            }}
                                                            className="bg-[#FF7D54] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#FF6B3D] transition-colors"
                                                        >
                                                            Reset Filters
                                                        </button>
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
