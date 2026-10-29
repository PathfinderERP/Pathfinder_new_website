import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeftIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
    ArrowRightIcon,
    ShoppingBagIcon,
    ShieldCheckIcon,
    TagIcon,
    CheckCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const StudentBag = () => {
    const { 
        cartItems, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        cartTotal, 
        cartOriginalTotal, 
        cartSavings, 
        cartCount,
        getItemSellingPrice,
        getItemOriginalPrice
    } = useCart();
    const navigate = useNavigate();

    // Promo code state
    const [promoInput, setPromoInput] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');
    const [isPromoOpen, setIsPromoOpen] = useState(false);

    const handleApplyPromo = (codeToApply = null) => {
        const code = (codeToApply || promoInput).trim().toUpperCase();
        setPromoError('');

        if (!code) {
            setPromoError('Please enter a coupon code.');
            return;
        }

        if (code === 'PATHFINDER10') {
            const discount = Math.round(cartTotal * 0.10);
            setAppliedPromo({ code, discount, label: '10% OFF' });
            setPromoInput('');
        } else if (code === 'WELCOME50') {
            const discount = Math.min(50, cartTotal);
            setAppliedPromo({ code, discount, label: '₹50 OFF' });
            setPromoInput('');
        } else if (code === 'SUCCESS') {
            const discount = Math.round(cartTotal * 0.05);
            setAppliedPromo({ code, discount, label: '5% OFF' });
            setPromoInput('');
        } else {
            setPromoError('Invalid coupon code. Try PATHFINDER10 or WELCOME50.');
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoError('');
    };

    const promoDiscountAmount = appliedPromo ? appliedPromo.discount : 0;
    const finalPayableTotal = Math.max(0, cartTotal - promoDiscountAmount);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
            <div className="2xl:max-w-7xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 lg:px-8">
                {/* Header Navigation */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/students-corner')}
                            className="p-2 sm:p-2.5 bg-white border border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/50 rounded-2xl transition-all shadow-sm group"
                            title="Back to Students Corner"
                        >
                            <ChevronLeftIcon className="h-5 w-5 text-slate-700 group-hover:text-[#FF7D54]" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight italic uppercase">
                                Shopping Bag
                            </h1>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                                {cartCount} {cartCount === 1 ? 'item' : 'items'} in your bag
                            </p>
                        </div>
                    </div>

                    {cartItems.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to clear your shopping bag?')) {
                                    clearCart();
                                }
                            }}
                            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                        >
                            Clear Bag
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* Left Col: Cart Items */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <AnimatePresence mode="popLayout">
                            {cartItems.length > 0 ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-4"
                                >
                                    {cartItems.map((item) => {
                                        const itemId = item.id || item.unique_id;
                                        const sellingPrice = getItemSellingPrice ? getItemSellingPrice(item) : (parseFloat(item.discounted_price) || parseFloat(item.price) || 0);
                                        const originalPrice = getItemOriginalPrice ? getItemOriginalPrice(item) : (parseFloat(item.price) || sellingPrice);
                                        const hasDiscount = originalPrice > sellingPrice;
                                        const discountPercent = item.discount || (hasDiscount ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0);
                                        const qty = item.quantity || 1;

                                        return (
                                            <motion.div
                                                key={itemId}
                                                variants={itemVariants}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                layout
                                                className="group bg-white border border-slate-200/80 p-4 sm:p-5 rounded-3xl hover:border-orange-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                                    {/* Item Image */}
                                                    <div className="w-full sm:w-28 h-36 sm:h-28 bg-gradient-to-b from-slate-50 to-white rounded-2xl p-2.5 flex-shrink-0 flex items-center justify-center border border-slate-100">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <ShoppingBagIcon className="w-8 h-8 text-slate-300" />
                                                        )}
                                                    </div>

                                                    {/* Item Details */}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start gap-3">
                                                                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                                                                    {item.name}
                                                                </h3>
                                                                <button
                                                                    onClick={() => removeFromCart(itemId)}
                                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                                                                    title="Remove item"
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#FF7D54] mt-1">
                                                                <span>{item.category || 'Study Material'}</span>
                                                                {item.board && <span>• {item.board}</span>}
                                                                {item.class_level && <span>• Class {item.class_level}</span>}
                                                            </div>
                                                        </div>

                                                        {/* Quantity Controls & Line Total */}
                                                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                                                            {/* Stepper */}
                                                            <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200/80">
                                                                <button
                                                                    onClick={() => updateQuantity(itemId, -1)}
                                                                    disabled={qty <= 1}
                                                                    className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                                                                    title="Decrease quantity"
                                                                >
                                                                    <MinusIcon className="h-3.5 w-3.5 stroke-[3]" />
                                                                </button>
                                                                <span className="w-7 text-center text-xs font-black text-slate-900">
                                                                    {qty}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(itemId, 1)}
                                                                    className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-700 shadow-sm"
                                                                    title="Increase quantity"
                                                                >
                                                                    <PlusIcon className="h-3.5 w-3.5 stroke-[3]" />
                                                                </button>
                                                            </div>

                                                            {/* Price Breakdown */}
                                                            <div className="text-right">
                                                                <div className="flex items-baseline gap-1.5 justify-end">
                                                                    {discountPercent > 0 && (
                                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                                            {discountPercent}% OFF
                                                                        </span>
                                                                    )}
                                                                    <span className="text-base sm:text-lg font-black text-slate-900">
                                                                        ₹{(sellingPrice * qty).toLocaleString('en-IN')}
                                                                    </span>
                                                                </div>
                                                                {hasDiscount && (
                                                                    <span className="text-xs text-slate-400 font-semibold line-through">
                                                                        ₹{(originalPrice * qty).toLocaleString('en-IN')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 text-center px-6 shadow-sm"
                                >
                                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingBagIcon className="h-10 w-10 text-[#FF7D54]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">Your Bag is Empty</h2>
                                    <p className="text-slate-400 text-sm max-w-sm mb-8 font-medium">
                                        Explore our student corner to discover top-rated books, Olympiad prep materials, timetables, and merchandise!
                                    </p>
                                    <Link
                                        to="/students-corner"
                                        className="bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] hover:from-[#FF6B3D] hover:to-[#FF5E5E] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 active:scale-95 text-xs"
                                    >
                                        Explore Student's Corner <ArrowRightIcon className="h-4 w-4" />
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Return & Support policy banner */}
                        {cartItems.length > 0 && (
                            <div className="mt-6 bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-600">
                                <div className="flex items-center gap-2">
                                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                                    <span>Genuine Pathfinder Publications & Study Kits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5 text-orange-500" />
                                    <span>Fast Doorstep Delivery Across Bengal</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Col: Order Summary & Coupon */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-7 text-white shadow-2xl shadow-slate-300/40 relative overflow-hidden border border-white/10 lg:sticky lg:top-24">
                            {/* Ambient Glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                <h2 className="text-lg font-black uppercase tracking-wider">Order Summary</h2>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">
                                    {cartCount} Items
                                </span>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3.5 mb-6 text-xs">
                                <div className="flex justify-between font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Items Subtotal</span>
                                    <span className="text-white font-black">
                                        ₹{(cartOriginalTotal || cartTotal).toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {cartSavings > 0 && (
                                    <div className="flex justify-between font-bold text-emerald-400 uppercase tracking-wider">
                                        <span>Product Discount</span>
                                        <span>-₹{cartSavings.toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                {appliedPromo && (
                                    <div className="flex justify-between font-bold text-amber-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1">
                                            <TagIcon className="w-3.5 h-3.5" />
                                            Coupon ({appliedPromo.code})
                                        </span>
                                        <span>-₹{appliedPromo.discount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Delivery Fee</span>
                                    <span className="text-emerald-400 font-black">FREE</span>
                                </div>

                                <div className="flex justify-between font-bold text-slate-400 uppercase tracking-wider pt-3 border-t border-white/10">
                                    <span>Taxes & Fees</span>
                                    <span className="text-white font-black">₹0 (Included)</span>
                                </div>
                            </div>

                            {/* Total row */}
                            <div className="p-4 bg-white/5 rounded-2xl mb-6 border border-white/10">
                                <div className="flex justify-between items-baseline">
                                    <div>
                                        <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of all taxes</span>
                                    </div>
                                    <div className="text-right">
                                        {(cartSavings > 0 || appliedPromo) && (
                                            <span className="text-xs text-slate-400 line-through font-bold block">
                                                ₹{cartOriginalTotal.toLocaleString('en-IN')}
                                            </span>
                                        )}
                                        <span className="text-2xl sm:text-3xl font-black text-[#FF7D54] tracking-tight">
                                            ₹{finalPayableTotal.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout CTA */}
                            <button
                                onClick={() => navigate('/students-corner/checkout')}
                                disabled={cartItems.length === 0}
                                className="w-full bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] hover:from-[#FF6B3D] hover:to-[#FF5E5E] text-white py-4 rounded-2xl font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed group text-xs sm:text-sm active:scale-95"
                            >
                                <span>Proceed to Checkout</span>
                                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>

                            {/* Security Trust Badges */}
                            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1 text-emerald-400">
                                    <ShieldCheckIcon className="h-4 w-4" /> ICICI 3D Secure
                                </span>
                                <span>•</span>
                                <span>Fast Dispatch</span>
                                <span>•</span>
                                <span>100% Genuine</span>
                            </div>
                        </div>

                        {/* Interactive Coupon Code Card */}
                        {cartItems.length > 0 && (
                            <div className="mt-6 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
                                <div
                                    onClick={() => setIsPromoOpen(!isPromoOpen)}
                                    className="flex justify-between items-center cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF7D54]">
                                            <TagIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-xs sm:text-sm text-slate-900 block">Apply Coupon Code</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">Save extra on your order</span>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-[#FF7D54] p-1">
                                        <PlusIcon className={`w-4 h-4 transition-transform duration-200 ${isPromoOpen ? 'rotate-45' : ''}`} />
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {(isPromoOpen || appliedPromo) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden pt-4"
                                        >
                                            {appliedPromo ? (
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <SparklesIcon className="w-4 h-4 text-emerald-600" />
                                                        <div>
                                                            <p className="text-xs font-black text-emerald-900 uppercase">
                                                                Coupon {appliedPromo.code} Applied!
                                                            </p>
                                                            <p className="text-[10px] font-bold text-emerald-700">
                                                                You saved ₹{appliedPromo.discount.toLocaleString('en-IN')} extra
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleRemovePromo}
                                                        className="text-xs font-bold text-red-500 hover:underline uppercase"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={promoInput}
                                                            onChange={(e) => setPromoInput(e.target.value)}
                                                            placeholder="Enter promo code"
                                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-[#FF7D54]"
                                                        />
                                                        <button
                                                            onClick={() => handleApplyPromo()}
                                                            className="bg-slate-900 hover:bg-[#FF7D54] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>

                                                    {promoError && (
                                                        <p className="text-[11px] font-bold text-red-500 mb-2">{promoError}</p>
                                                    )}

                                                    {/* Quick Chips */}
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Popular:</span>
                                                        <button
                                                            onClick={() => handleApplyPromo('PATHFINDER10')}
                                                            className="text-[10px] font-black uppercase text-[#FF7D54] bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-lg hover:bg-orange-100"
                                                        >
                                                            PATHFINDER10 (10% OFF)
                                                        </button>
                                                        <button
                                                            onClick={() => handleApplyPromo('WELCOME50')}
                                                            className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg hover:bg-slate-200"
                                                        >
                                                            WELCOME50 (₹50 OFF)
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentBag;
