import React from "react";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/24/outline";
import { formatINR } from "../ShikshaBandhuData";

export const ProgramCard = ({ program, onShare }) => {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg relative overflow-hidden">
      {program.featured && (
        <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
          Featured
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase text-orange-600 border border-orange-200">
            {program.board} • {program.className}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900">{program.name}</h3>
          <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">
            {program.description}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-700">
          {program.includes.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Price</span>
          <span className="text-xl font-black text-[#66090D]">{formatINR(program.price)}</span>
        </div>

        <button
          onClick={() => onShare(program)}
          className="px-4 py-2.5 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm hover:shadow"
        >
          <ShareIcon className="w-4 h-4" />
          Share Program
        </button>
      </div>
    </div>
  );
};
