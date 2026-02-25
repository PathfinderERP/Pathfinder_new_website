import React, { useState } from 'react';

const SidebarPriceFilter = ({ priceFilter, onPriceChange, freeDelivery, onDeliveryChange }) => {
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const applyPriceFilter = () => {
        onPriceChange({ min: minPrice, max: maxPrice });
    };

    const defaultPriceRanges = [
        { label: '₹0 - ₹200', min: 0, max: 200 },
        { label: '₹200 - ₹500', min: 200, max: 500 },
        { label: '₹500 - ₹1000', min: 500, max: 1000 },
        { label: '₹1000+', min: 1000, max: '' },
    ];

    return (
        <div className="p-6 border-t border-white/10 bg-black/5">
            <div className="space-y-6">
                <div>
                    <span className="text-[10px] font-black text-white/90 uppercase tracking-widest block mb-3">Price Range</span>
                    <div className="space-y-3">
                        <div className="space-y-1 mb-2">
                            {defaultPriceRanges.map((range) => (
                                <button
                                    key={range.label}
                                    onClick={() => {
                                        setMinPrice(range.min);
                                        setMaxPrice(range.max);
                                        onPriceChange({ min: range.min, max: range.max });
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${priceFilter?.min === range.min && priceFilter?.max === range.max
                                        ? 'bg-white/20 text-white shadow-inner'
                                        : 'text-white/80 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all font-medium"
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={applyPriceFilter}
                            className="w-full bg-white text-[#FF7D54] py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-900/10 hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Apply Range
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => onDeliveryChange(!freeDelivery)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${freeDelivery ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-white'}`}
                >
                    <span className="text-xs font-bold">Free Delivery</span>
                    <div className={`w-8 h-4 rounded-full relative transition-all ${freeDelivery ? 'bg-white/20' : 'bg-black/20'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${freeDelivery ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default SidebarPriceFilter;
