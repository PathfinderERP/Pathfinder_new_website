import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ item }) => {
    const { addToCart } = useCart();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-3xl border border-slate-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col"
        >
            {/* Tags Ribbon */}
            <div className="absolute -top-4 -left-4 z-50 flex flex-col gap-0 items-start w-[120px] pointer-events-none">
                {/* 1. Popular/Trending Badge if no specific tag overrides it, or as first badge */}
                {item.is_popular && (!item.tags || item.tags.length === 0) && (
                    <div className="relative flex items-center justify-center filter drop-shadow-md z-20">
                        <img src="/images/student corner/BADGE BG IMAGE.png" alt="" className="h-[35px] w-auto object-contain object-left" />
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold pb-1 pr-5 uppercase tracking-wider pl-2">
                            TRENDING
                        </span>
                    </div>
                )}

                {/* 2. Dynamic Tags (Best Seller, New, etc.) */}
                {item.tags && Array.isArray(item.tags) && item.tags.map((tag, i) => (
                    <div key={i} className={`relative flex items-center justify-center filter drop-shadow-md ${i > 0 || (item.is_popular && (!item.tags || item.tags.length === 0)) ? '-mt-2' : ''} z-${10 - i}`}>
                        <img
                            src="/images/student corner/BADGE BG IMAGE.png"
                            alt="badge bg"
                            className="h-[35px] w-auto object-contain"
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold pb-1 pr-5 uppercase tracking-wider pl-2">
                            {tag}
                        </span>
                    </div>
                ))}
            </div>

            {/* Image Area */}
            <div className="relative p-4 pt-6 pb-0 flex items-center justify-center h-56">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl italic text-slate-400">
                        No Image
                    </div>
                )}

                {/* ADD Button Overlay */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                    }}
                    className="absolute bottom-2 right-4 bg-[#FFBD99] hover:bg-[#FFAB76] text-[#A03605] text-sm font-bold px-6 py-2 rounded-lg shadow-sm transition-colors uppercase tracking-wide active:scale-95"
                >
                    ADD
                </button>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col justify-end">
                {/* Title */}
                <h3 className="text-[15px] font-medium text-slate-900 leading-snug mb-4 line-clamp-2">
                    {item.name}
                </h3>

                {/* Price & Rating Row */}
                <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-900">₹{item.discounted_price}</span>
                            {item.discount > 0 && (
                                <span className="text-sm font-bold text-[#22C55E] whitespace-nowrap">( {item.discount}% OFF )</span>
                            )}
                        </div>
                        {item.discount > 0 && (
                            <span className="text-sm text-slate-400 line-through font-medium mt-0.5">₹{item.price}</span>
                        )}
                    </div>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 bg-[#4CAF50] text-white px-2 py-1 rounded-[4px] shadow-sm mb-1">
                        <StarIcon className="h-3.5 w-3.5 fill-current" />
                        <span className="text-xs font-bold">{item.rating || '5'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
