import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeftIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
    ArrowRightIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const StudentBag = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="min-h-screen bg-white font-sans pt-[80px] lg:pt-[120px] pb-20">
            <div className="2xl:max-w-7xl mx-auto px-6 md:py-6 lg:px-8">
                {/* Header Navigation */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate('/students-corner')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ChevronLeftIcon className="h-6 w-6 text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">My Bag</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{cartCount} Items in your bag</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Col: Cart Items */}
                    <div className="lg:col-span-8 relative">
                        <AnimatePresence mode="popLayout">
                            {cartItems.length > 0 ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-6"
                                >
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id || item.unique_id}
                                            variants={itemVariants}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                            className="group flex flex-col sm:flex-row gap-6 bg-white border border-slate-200 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 relative overflow-hidden"
                                        >
                                            {/* Item Image */}
                                            <div className="w-full sm:w-32 h-48 sm:h-32 bg-slate-50 rounded-2xl p-4 flex-shrink-0 flex items-center justify-center relative z-10">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
                                                <div>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                                                            {item.name}
                                                        </h3>
                                                        <button
                                                            onClick={() => removeFromCart(item.id || item.unique_id)}
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-slate-400 text-sm font-bold uppercase mt-1">
                                                        {item.category} {item.board && `• ${item.board}`} {item.class_level && `• Class ${item.class_level}`}
                                                    </p>
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-2 border border-slate-200">
                                                        <button
                                                            onClick={() => updateQuantity(item.id || item.unique_id, -1)}
                                                            className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm disabled:opacity-30"
                                                        >
                                                            <MinusIcon className="h-3.5 w-3.5 text-slate-900" strokeWidth={3} />
                                                        </button>
                                                        <span className="w-6 text-center text-sm font-black text-slate-900">
                                                            {item.quantity || 1}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id || item.unique_id, 1)}
                                                            className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm"
                                                        >
                                                            <PlusIcon className="h-3.5 w-3.5 text-slate-900" strokeWidth={3} />
                                                        </button>
                                                    </div>

                                                    {/* Price Info */}
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            {item.discount > 0 && (
                                                                <span className="text-xs font-black text-green-500">-{item.discount}%</span>
                                                            )}
                                                            <span className="text-xl font-black text-[#FF7D54]">₹{item.discounted_price * (item.quantity || 1)}</span>
                                                        </div>
                                                        {item.discount > 0 && (
                                                            <span className="text-sm text-slate-400 font-bold line-through tracking-tighter">₹{item.price * (item.quantity || 1)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Decoration */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 opacity-50 pointer-events-none" />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-200 text-center px-6"
                                >
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8">
                                        <ShoppingBagIcon className="h-10 w-10 text-[#FF7D54]" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase italic mb-4">Your bag is empty</h2>
                                    <p className="text-slate-500 font-medium max-w-sm mb-10">
                                        Looks like you haven't added anything to your bag yet. Explore our student corner for awesome books and merchandise!
                                    </p>
                                    <Link
                                        to="/students-corner"
                                        className="bg-[#FF7D54] hover:bg-[#FF6B3D] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all flex items-center gap-3 active:scale-95"
                                    >
                                        Start Shopping <ArrowRightIcon className="h-5 w-5" />
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Col: Order Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-[150px] h-fit">
                        <div className="bg-[#161616] rounded-[40px] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />

                            <h2 className="text-2xl font-black uppercase italic mb-8 relative z-10">Order Summary</h2>

                            <div className="space-y-4 mb-8 relative z-10">
                                <div className="flex justify-between font-bold text-gray-400 uppercase text-sm tracking-widest">
                                    <span>Subtotal ({cartCount} Items)</span>
                                    <span className="text-white">₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-400 uppercase text-sm tracking-widest">
                                    <span>Delivery</span>
                                    <span className="text-green-400">FREE</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-400 uppercase text-sm tracking-widest pt-4 border-t border-white/10">
                                    <span>Estimated Tax</span>
                                    <span className="text-white">₹0</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-10 relative z-10">
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-lg">Total</span>
                                <div className="text-right">
                                    <span className="text-4xl font-black italic">₹{cartTotal}</span>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Inclusive of all taxes</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/students-corner/checkout')}
                                disabled={cartItems.length === 0}
                                className="w-full bg-white text-[#161616] hover:bg-[#FF7D54] hover:text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group relative z-10"
                            >
                                Checkout Now <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-8 flex items-center justify-center gap-6 text-gray-500 font-bold text-[10px] uppercase tracking-widest relative z-10">
                                <span className="flex items-center gap-1"><TrashIcon className="h-3 w-3" /> Secure Payment</span>
                                <span className="flex items-center gap-1 text-green-500/50 italic">Easy Returns</span>
                            </div>
                        </div>

                        {/* Promo Code Option */}
                        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex justify-between items-center group cursor-pointer hover:border-[#FF7D54] transition-colors">
                            <span className="font-bold text-slate-900 group-hover:text-[#FF7D54] transition-colors">Apply Promo Code</span>
                            <PlusIcon className="h-5 w-5 text-slate-400 group-hover:text-[#FF7D54]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentBag;
