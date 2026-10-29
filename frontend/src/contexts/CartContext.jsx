import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ShoppingBagIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useNavigate, useLocation } from 'react-router-dom';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('student_corner_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });

    const [toast, setToast] = useState(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const toastTimeoutRef = useRef(null);

    useEffect(() => {
        try {
            localStorage.setItem('student_corner_cart', JSON.stringify(cartItems));
        } catch (e) {
            console.error('Failed to save cart to localStorage', e);
        }
    }, [cartItems]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    const showToast = (message, item = null) => {
        // Clear previous timeout so subsequent adds never hide the banner prematurely
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        setIsDismissed(false);
        setToast({ message, item, timestamp: Date.now() });

        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
            toastTimeoutRef.current = null;
        }, 4000);
    };

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const prodId = product.id || product.unique_id;
            const existingItem = prevItems.find(item => (item.id || item.unique_id) === prodId);
            if (existingItem) {
                return prevItems.map(item =>
                    (item.id || item.unique_id) === prodId
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
        showToast('Added to your bag!', product);
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => (item.id || item.unique_id) !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if ((item.id || item.unique_id) === productId) {
                    const newQuantity = (item.quantity || 1) + delta;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
        setToast(null);
    };

    const getItemSellingPrice = (item) => {
        if (!item) return 0;
        const discounted = parseFloat(item.discounted_price);
        const original = parseFloat(item.price);
        if (!isNaN(discounted) && discounted > 0) {
            return discounted;
        }
        return !isNaN(original) ? original : 0;
    };

    const getItemOriginalPrice = (item) => {
        if (!item) return 0;
        const original = parseFloat(item.price);
        const discounted = parseFloat(item.discounted_price);
        if (!isNaN(original) && original > 0) {
            return original;
        }
        return !isNaN(discounted) && discounted > 0 ? discounted : 0;
    };

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (getItemSellingPrice(item) * (item.quantity || 1)), 0);
    const cartOriginalTotal = cartItems.reduce((acc, item) => acc + (getItemOriginalPrice(item) * (item.quantity || 1)), 0);
    const cartSavings = Math.max(0, cartOriginalTotal - cartTotal);

    // Don't show floating cart on Bag or Checkout pages
    const isCartOrCheckout = location.pathname.includes('/bag') || location.pathname.includes('/checkout');
    const shouldShowFloatingCart = !isCartOrCheckout && cartCount > 0 && !isDismissed;

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            cartOriginalTotal,
            cartSavings,
            getItemSellingPrice,
            getItemOriginalPrice
        }}>
            {children}

            {/* Persistent & Interactive Floating Cart Bar */}
            <AnimatePresence>
                {shouldShowFloatingCart && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 60, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[94%] max-w-lg"
                    >
                        <div
                            onClick={() => navigate('/students-corner/bag')}
                            className="group relative flex items-center justify-between gap-3 bg-[#0F172A]/95 text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-white/15 backdrop-blur-xl cursor-pointer hover:bg-black transition-all hover:border-orange-500/50 hover:shadow-orange-500/10"
                        >
                            {/* Ambient Glow */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />

                            {/* Left: Thumbnail & Status */}
                            <div className="flex items-center gap-3 relative z-10 min-w-0">
                                <div className="w-12 h-12 bg-gradient-to-tr from-[#FF7D54] to-[#FF5E5E] rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                                    {toast?.item?.image_url ? (
                                        <img src={toast.item.image_url} alt="" className="w-9 h-9 object-contain" />
                                    ) : (
                                        <ShoppingBagIcon className="w-6 h-6 text-white" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        {toast ? (
                                            <>
                                                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 truncate">
                                                    Added to Bag!
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                                                Shopping Bag
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[220px]">
                                        {toast?.item?.name ? toast.item.name : `${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your bag`}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Total Price & CTA Button */}
                            <div className="flex items-center gap-2 sm:gap-3 relative z-10 flex-shrink-0">
                                <div className="text-right border-r border-white/10 pr-2.5 sm:pr-3">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-tight">Total</span>
                                    <span className="text-sm sm:text-base font-black text-white italic">
                                        ₹{cartTotal.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/30 group-hover:from-orange-600 group-hover:to-orange-500 transition-all">
                                    <span className="hidden xs:inline">View Bag</span>
                                    <span className="xs:hidden">Bag</span>
                                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </div>

                                {/* Dismiss button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsDismissed(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-1"
                                    title="Dismiss bar"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CartContext.Provider>
    );
};
