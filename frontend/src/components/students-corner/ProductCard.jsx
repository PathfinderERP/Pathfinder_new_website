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
            <div className={`absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md ${bgStyle}`}>
                <SparklesIcon className="w-2.5 h-2.5" />
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
            className="group relative bg-white rounded-3xl border border-slate-200/80 hover:border-orange-400/60 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 h-full flex flex-col overflow-hidden"
        >
            {/* Top Badge */}
            {renderBadge()}

            {/* Image Container */}
            <div className="relative bg-gradient-to-b from-slate-50 to-white/40 p-4 pt-6 flex items-center justify-center h-52 overflow-hidden">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full max-h-44 object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl italic text-xs text-slate-400 font-medium">
                        Pathfinder Study Material
                    </div>
                )}

                {/* Floating Add CTA inside image bottom */}
                <div className="absolute bottom-3 right-3 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 ${
                            cartQuantity > 0
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                                : 'bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] hover:from-[#FF6B3D] hover:to-[#FF5E5E] text-white shadow-orange-500/30'
                        }`}
                        title={cartQuantity > 0 ? `In bag (${cartQuantity}). Click to add more.` : 'Add to Bag'}
                    >
                        {cartQuantity > 0 ? (
                            <>
                                <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                                <span>{cartQuantity} in Bag</span>
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-3.5 h-3.5 stroke-[3]" />
                                <span>ADD</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                    {/* Category / Sub-meta */}
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF7D54] mb-1">
                        <span>{item.category || 'Study Material'}</span>
                        {item.board && (
                            <>
                                <span>•</span>
                                <span>{item.board}</span>
                            </>
                        )}
                        {item.class_level && (
                            <>
                                <span>•</span>
                                <span>Class {item.class_level}</span>
                            </>
                        )}
                    </div>

                    {/* Book / Item Title */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#FF7D54] transition-colors mb-3">
                        {item.name}
                    </h3>
                </div>

                {/* Price & Rating Row */}
                <div className="pt-2 border-t border-slate-100 flex items-end justify-between mt-auto">
                    <div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-slate-900">
                                ₹{sellingPrice.toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through font-semibold">
                                    ₹{originalPrice.toLocaleString('en-IN')}
                                </span>
                            )}
                        </div>
                        {discountPercent > 0 && (
                            <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                                {discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {/* Rating Pill */}
                    <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-1 rounded-lg shadow-sm">
                        <StarIcon className="h-3 w-3 fill-current" />
                        <span className="text-[11px] font-black leading-none">{item.rating || '4.8'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
