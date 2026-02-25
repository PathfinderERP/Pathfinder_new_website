import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('student_corner_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [toast, setToast] = useState(null);

    useEffect(() => {
        localStorage.setItem('student_corner_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const showToast = (message, item = null) => {
        setToast({ message, item });
        setTimeout(() => setToast(null), 3000);
    };

    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => (item.id || item.unique_id) === (product.id || product.unique_id));
            if (existingItem) {
                return prevItems.map(item =>
                    (item.id || item.unique_id) === (product.id || product.unique_id)
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
    };

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}

            {/* Custom Premium Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        onClick={() => {
                            window.location.href = '/students-corner/bag';
                        }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-4 bg-[#161616] text-white p-4 pr-6 rounded-[24px] shadow-2xl shadow-black/40 border border-white/10 backdrop-blur-xl cursor-pointer hover:bg-black transition-colors group/toast"
                    >
                        <div className="w-12 h-12 bg-[#FF7D54] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 group-hover/toast:scale-105 transition-transform">
                            {toast.item?.image_url ? (
                                <img src={toast.item.image_url} alt="" className="w-8 h-8 object-contain" />
                            ) : (
                                <ShoppingBagIcon className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                <p className="text-xs font-black uppercase tracking-widest text-[#FF7D54]">Success</p>
                            </div>
                            <p className="text-sm font-bold text-gray-100 whitespace-nowrap">{toast.message}</p>
                        </div>
                        <div className="ml-4 pl-4 border-l border-white/10">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Total Items</p>
                            <p className="text-lg font-black italic -mt-1 leading-none text-white">{cartCount}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CartContext.Provider>
    );
};
