import React from "react";

export const StatCard = ({ label, value, icon: Icon, accent = "default" }) => {
  const accentClasses = {
    default: "bg-white border-slate-200 text-slate-900",
    gold: "bg-amber-50/60 border-amber-200 text-slate-900",
    success: "bg-emerald-50/60 border-emerald-200 text-slate-900",
    maroon: "bg-[#66090D] text-white border-[#66090D]",
  };

  const iconClasses = {
    default: "bg-slate-100 text-slate-700",
    gold: "bg-amber-100 text-amber-800",
    success: "bg-emerald-100 text-emerald-800",
    maroon: "bg-white/20 text-white",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${accentClasses[accent] || accentClasses.default}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-extrabold uppercase tracking-wider ${accent === "maroon" ? "text-amber-300" : "text-slate-500"}`}>
          {label}
        </span>
        {Icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconClasses[accent] || iconClasses.default}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className={`mt-2 font-mono text-2xl font-black ${accent === "maroon" ? "text-white" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    Successful: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Pending: "bg-amber-100 text-amber-800 border-amber-300",
    Cancelled: "bg-slate-100 text-slate-600 border-slate-300",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};
