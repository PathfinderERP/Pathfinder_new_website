import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, RocketLaunchIcon, ArrowRightIcon, SparklesIcon, StarIcon, FireIcon } from '@heroicons/react/24/outline';
import { siteConfigAPI } from '../../services/api';
import confetti from 'canvas-confetti';

const PredictionPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await siteConfigAPI.getPopupLatest();
                if (response.data && response.data.id && response.data.is_active !== false) {
                    setConfig(response.data);
                    
                    // Show popup after configured delay
                    const timer = setTimeout(() => {
                        triggerCelebration();
                        // Delay modal slightly so celebration starts first
                        setTimeout(() => setIsOpen(true), 300);
                    }, response.data.show_delay || 1500);

                    return () => clearTimeout(timer);
                }
            } catch (error) {
                console.error("Error fetching popup config:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const triggerCelebration = () => {
        const end = Date.now() + (3 * 1000);
        const colors = ['#f97316', '#ef4444', '#ffffff', '#fbbf24'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
                zIndex: 9999
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
                zIndex: 9999
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    if (loading || !config) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'rocket': return <RocketLaunchIcon className="w-8 h-8 text-white -rotate-3" />;
            case 'sparkles': return <SparklesIcon className="w-8 h-8 text-white -rotate-3" />;
            case 'star': return <StarIcon className="w-8 h-8 text-white -rotate-3" />;
            case 'fire': return <FireIcon className="w-8 h-8 text-white -rotate-3" />;
            default: return <RocketLaunchIcon className="w-8 h-8 text-white -rotate-3" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
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
                                {getIcon(config.icon_type)}
                            </div>

                            {/* Text */}
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                                {config.title} <br />
                                <span className="text-orange-500">{config.title_highlight}</span>
                            </h2>
                            <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8">
                                {config.description}
                            </p>

                            {/* CTA Button */}
                            <a 
                                href={config.button_link} 
                                className="group w-full flex items-center justify-between p-1 pl-6 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                            >
                                <span className="text-lg font-bold tracking-tight">{config.button_text}</span>
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                    <ArrowRightIcon className="w-6 h-6" />
                                </div>
                            </a>

                            <button 
                                onClick={handleClose}
                                className="w-full text-center mt-6 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                {config.maybe_later_text || "Maybe Later"}
                            </button>
                        </div>

                        {/* Bottom Banner */}
                        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-3">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{config.bottom_banner_text}</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PredictionPopup;
