import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, PlusIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ item }) => {
    const { addToCart, cartItems } = useCart();

    const itemId = item.id || item.unique_id;
    const inCartItem = cartItems?.find(cartItem => (cartItem.id || cartItem.unique_id) === itemId);
    const cartQuantity = inCartItem?.quantity || 0;

    const sellingPrice = parseFloat(item.discounted_price) || parseFloat(item.price) || 0;
    const originalPrice = parseFloat(item.price) || sellingPrice;
    const hasDiscount = originalPrice > sellingPrice;
    const discountPercent = item.discount || (hasDiscount ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0);

    // Clean class_level formatting to avoid "Class Class 12th"
    const classText = item.class_level
        ? (String(item.class_level).trim().toLowerCase().startsWith('class')
            ? item.class_level
            : `Class ${item.class_level}`)
        : null;

    // Badge configuration
    const renderBadge = () => {
        const tag = (item.tags && item.tags[0]) || (item.is_popular ? 'Trending' : null);
        if (!tag) return null;

        const tagUpper = String(tag).toUpperCase();
        let bgStyle = 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/20';

        if (tagUpper.includes('BEST')) {
            bgStyle = 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-rose-500/20';
        } else if (tagUpper.includes('NEW')) {
            bgStyle = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20';
        } else if (tagUpper.includes('POPULAR')) {
            bgStyle = 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20';
        }

        return (
            <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex items-center gap-0.5 sm:gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-md ${bgStyle}`}>
                <SparklesIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                <span>{tag}</span>
            </div>
        );
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
            className="group relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 hover:border-orange-400/60 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 h-full flex flex-col overflow-hidden w-full"
        >
            {/* Top Badge */}
            {renderBadge()}

            {/* Image Container */}
            <div className="relative bg-gradient-to-b from-slate-50 to-white/40 p-2 sm:p-4 pt-4 sm:pt-6 flex items-center justify-center h-36 sm:h-52 overflow-hidden">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full max-h-28 sm:max-h-44 object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl italic text-[10px] sm:text-xs text-slate-400 font-medium text-center p-2">
                        Pathfinder Study Material
                    </div>
                )}

                {/* Floating Add CTA inside image bottom */}
                <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                        }}
                        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 ${
                            cartQuantity > 0
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                                : 'bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] hover:from-[#FF6B3D] hover:to-[#FF5E5E] text-white shadow-orange-500/30'
                        }`}
                        title={cartQuantity > 0 ? `In bag (${cartQuantity}). Click to add more.` : 'Add to Bag'}
                    >
                        {cartQuantity > 0 ? (
                            <>
                                <CheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                                <span>{cartQuantity} in Bag</span>
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                                <span>ADD</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                    {/* Category / Sub-meta */}
                    <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-[#FF7D54] mb-1 truncate">
                        <span className="truncate">{item.category || 'Material'}</span>
                        {item.board && (
                            <>
                                <span className="flex-shrink-0">•</span>
                                <span className="flex-shrink-0">{item.board}</span>
                            </>
                        )}
                        {classText && (
                            <>
                                <span className="flex-shrink-0">•</span>
                                <span className="flex-shrink-0">{classText}</span>
                            </>
                        )}
                    </div>

                    {/* Book / Item Title */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight sm:leading-snug line-clamp-2 group-hover:text-[#FF7D54] transition-colors mb-2 sm:mb-3 min-h-[2rem] sm:min-h-[2.5rem]">
                        {item.name}
                    </h3>
                </div>

                {/* Price & Rating Row */}
                <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-end justify-between mt-auto gap-1">
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                            <span className="text-sm sm:text-lg font-black text-slate-900">
                                ₹{sellingPrice.toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-semibold">
                                    ₹{originalPrice.toLocaleString('en-IN')}
                                </span>
                            )}
                        </div>
                        {discountPercent > 0 && (
                            <span className="inline-block text-[8px] sm:text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mt-0.5">
                                {discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {/* Rating Pill */}
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-emerald-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-sm flex-shrink-0">
                        <StarIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                        <span className="text-[9px] sm:text-[11px] font-black leading-none">{item.rating || '4.8'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
