import React from 'react';

const SidebarAcademicFilters = ({ activeCategory, selectedBoard, onBoardChange, selectedClass, onClassChange }) => {
    if (activeCategory === 'All') return null;

    const hasFilters = Boolean(selectedBoard || selectedClass);

    return (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Academic Filters
                </span>
                {hasFilters && (
                    <button
                        onClick={() => {
                            onBoardChange('');
                            onClassChange('');
                        }}
                        className="text-[10px] font-bold text-[#FF7D54] hover:underline"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {/* Board Filter - Hide for All India */}
                {activeCategory !== 'All India' && (
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5 ml-0.5">Board</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {['CBSE', 'ICSE', 'WB Board'].map(board => (
                                <button
                                    key={board}
                                    onClick={() => onBoardChange(selectedBoard === board ? '' : board)}
                                    className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all border text-center ${
                                        selectedBoard === board
                                            ? 'bg-orange-50 border-[#FF7D54] text-[#FF7D54] shadow-sm'
                                            : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                                >
                                    {board}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Class/Exam Filter */}
                <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1.5 ml-0.5">
                        {activeCategory === 'All India' ? 'Target Exam' : 'Class'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {(activeCategory === 'All India'
                            ? ['NEET', 'JEE', 'WBJEE']
                            : ['8', '9', '10', '11', '12']
                        ).map(cls => (
                            <button
                                key={cls}
                                onClick={() => onClassChange(selectedClass === cls ? '' : cls)}
                                className={`text-center px-2 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                    selectedClass === cls
                                        ? 'bg-orange-50 border-[#FF7D54] text-[#FF7D54] shadow-sm'
                                        : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                }`}
                            >
                                {activeCategory === 'All India' ? cls : `Cl ${cls}`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarAcademicFilters;
