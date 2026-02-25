import React from 'react';

const SidebarAcademicFilters = ({ activeCategory, selectedBoard, onBoardChange, selectedClass, onClassChange }) => {
    if (activeCategory === 'All') return null;

    return (
        <div className="p-6 border-t border-white/10 bg-black/5">
            <span className="text-[10px] font-black text-white/90 uppercase tracking-widest block mb-3">Academic Filters</span>
            <div className="space-y-4">
                {/* Board Filter - Hide for All India */}
                {activeCategory !== 'All India' && (
                    <div>
                        <label className="text-[10px] font-bold text-white/70 block mb-1.5 ml-1">Board</label>
                        <div className="space-y-1">
                            {['CBSE', 'ICSE', 'WB Board'].map(board => (
                                <button
                                    key={board}
                                    onClick={() => onBoardChange(selectedBoard === board ? '' : board)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all border ${selectedBoard === board
                                        ? 'bg-white text-orange-600 border-white shadow-sm'
                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
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
                    <label className="text-[10px] font-bold text-white/70 block mb-1.5 ml-1">
                        {activeCategory === 'All India' ? 'Target Exam' : 'Class'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(activeCategory === 'All India'
                            ? ['NEET', 'JEE', 'JEE Advance', 'WBJEE']
                            : ['8', '9', '10', '11', '12']
                        ).map(cls => (
                            <button
                                key={cls}
                                onClick={() => onClassChange(selectedClass === cls ? '' : cls)}
                                className={`text-center px-2 py-2 rounded-lg text-xs font-bold transition-all border ${selectedClass === cls
                                    ? 'bg-white text-orange-600 border-white shadow-sm'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cls}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarAcademicFilters;
