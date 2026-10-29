import React, { useState } from 'react';

const SidebarPriceFilter = ({ priceFilter, onPriceChange }) => {
    const [minPrice, setMinPrice] = useState(priceFilter?.min || '');
    const [maxPrice, setMaxPrice] = useState(priceFilter?.max || '');

    const applyPriceFilter = () => {
        onPriceChange({ min: minPrice, max: maxPrice });
    };

    const handleReset = () => {
        setMinPrice('');
        setMaxPrice('');
        onPriceChange(null);
    };

    const defaultPriceRanges = [
        { label: 'Under ₹200', min: 0, max: 200 },
        { label: '₹200 - ₹500', min: 200, max: 500 },
        { label: '₹500 - ₹1000', min: 500, max: 1000 },
        { label: '₹1000+', min: 1000, max: '' },
    ];

    const hasActiveFilter = Boolean(priceFilter && (priceFilter.min !== undefined || priceFilter.max !== undefined));

    return (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Price Range
                </span>
                {hasActiveFilter && (
                    <button
                        onClick={handleReset}
                        className="text-[10px] font-bold text-[#FF7D54] hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="space-y-2 mb-3">
                {defaultPriceRanges.map((range) => {
                    const isSelected = priceFilter?.min === range.min && priceFilter?.max === range.max;
                    return (
                        <button
                            key={range.label}
                            onClick={() => {
                                if (isSelected) {
                                    handleReset();
                                } else {
                                    setMinPrice(range.min);
                                    setMaxPrice(range.max);
                                    onPriceChange({ min: range.min, max: range.max });
                                }
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isSelected
                                    ? 'bg-orange-50 border-[#FF7D54] text-[#FF7D54] shadow-sm'
                                    : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                            }`}
                        >
                            {range.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-1.5 mb-2">
                <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-2 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF7D54] transition-all font-semibold"
                    />
                </div>
                <span className="text-slate-300 font-bold text-xs">-</span>
                <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-2 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF7D54] transition-all font-semibold"
                    />
                </div>
            </div>

            <button
                onClick={applyPriceFilter}
                className="w-full bg-gradient-to-r from-[#FF7D54] to-[#FF6B3D] text-white py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:from-[#FF6B3D] hover:to-[#FF5E5E] active:scale-95 transition-all"
            >
                Apply Range
            </button>
        </div>
    );
};

export default SidebarPriceFilter;
