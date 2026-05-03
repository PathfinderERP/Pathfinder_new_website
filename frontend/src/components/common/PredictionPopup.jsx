import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, RocketLaunchIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const PredictionPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show popup after a short delay when the page loads
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-white/20"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Content */}
                        <div className="relative p-8 md:p-12">
                            {/* Close Button */}
                            <button 
                                onClick={handleClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            {/* Header Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20 rotate-3">
                                <RocketLaunchIcon className="w-8 h-8 text-white -rotate-3" />
                            </div>

                            {/* Text */}
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                                NEET 2026 <br />
                                <span className="text-orange-500">Answer Key</span>
                            </h2>
                            <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8">
                                Download the official NEET 2026 Answer Key and Question Paper solutions. Check your performance and calculate your expected score instantly.
                            </p>

                            {/* CTA Button */}
                            <a 
                                href="https://pathfinder.edu.in/blog/neet-2026-answer-key" 
                                className="group w-full flex items-center justify-between p-1 pl-6 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                            >
                                <span className="text-lg font-bold tracking-tight">Download Answer Key</span>
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                    <ArrowRightIcon className="w-6 h-6" />
                                </div>
                            </a>

                            <button 
                                onClick={handleClose}
                                className="w-full text-center mt-6 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>

                        {/* Bottom Banner */}
                        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-3">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Prediction Portal is Now Open</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PredictionPopup;
