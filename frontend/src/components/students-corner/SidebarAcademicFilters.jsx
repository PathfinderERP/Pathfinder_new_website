import React from 'react';

const SidebarAcademicFilters = ({ activeCategory, selectedBoard, onBoardChange, selectedClass, onClassChange }) => {
    const hasFilters = Boolean(selectedBoard || selectedClass);
    const isAllIndia = activeCategory === 'All India';
    const isAll = activeCategory === 'All';

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
                {/* Board Filter - Displayed when not in 'All India' */}
                {!isAllIndia && (
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5 ml-0.5">Board</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {['CBSE', 'ICSE', 'WB Board'].map(board => (
                                <button
                                    key={board}
                                    type="button"
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

                {/* Class Filter - Displayed when not in 'All India' */}
                {!isAllIndia && (
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5 ml-0.5">
                            Class
                        </label>
                        <div className="grid grid-cols-5 gap-1">
                            {['8', '9', '10', '11', '12'].map(cls => (
                                <button
                                    key={cls}
                                    type="button"
                                    onClick={() => onClassChange(selectedClass === cls ? '' : cls)}
                                    className={`text-center py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                        selectedClass === cls
                                            ? 'bg-orange-50 border-[#FF7D54] text-[#FF7D54] shadow-sm'
                                            : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                                >
                                    Cl {cls}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Target Exam Filter - Displayed for 'All India' or 'All' */}
                {(isAllIndia || isAll) && (
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5 ml-0.5">
                            Target Exam
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {['NEET', 'JEE', 'WBJEE'].map(exam => (
                                <button
                                    key={exam}
                                    type="button"
                                    onClick={() => onClassChange(selectedClass === exam ? '' : exam)}
                                    className={`text-center px-2 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                        selectedClass === exam
                                            ? 'bg-orange-50 border-[#FF7D54] text-[#FF7D54] shadow-sm'
                                            : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                                >
                                    {exam}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SidebarAcademicFilters;
