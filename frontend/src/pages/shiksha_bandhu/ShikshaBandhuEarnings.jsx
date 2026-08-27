import React, { useState, useEffect } from "react";
import { ClockIcon, CalendarIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { ShikshaBandhuLayout } from "./components/ShikshaBandhuLayout";
import { StatCard, StatusBadge } from "./components/StatCard";
import { DEMO_BONUS_HISTORY, formatINR } from "./ShikshaBandhuData";
import { shikshaBandhuAPI } from "../../services/api";

export const ShikshaBandhuEarnings = () => {
  const [liveData, setLiveData] = useState(null);

  return (
    <ShikshaBandhuLayout>
      {(user) => {
        useEffect(() => {
          if (user?.id) {
            shikshaBandhuAPI.getStats(user.id).then((res) => {
              if (res.data) setLiveData(res.data);
            }).catch((err) => console.error(err));
          }
        }, [user?.id]);

        const stats = liveData?.stats || user.stats || {
          totalBonus: 0,
          pendingBonus: 0,
          thisMonth: 0,
          successfulReferrals: 0
        };
        const bonusHistory = liveData?.bonusHistory || DEMO_BONUS_HISTORY;

        return (
          <div className="space-y-6 pb-12">
            <div>
              <h1 className="text-2xl font-black text-[#66090D]">My Earnings</h1>
              <p className="mt-1 text-xs text-slate-500 font-semibold">
                Track your total earned bonus, pending bonus payouts, and complete bonus calculation log.
              </p>
            </div>

            {/* Highlight Card */}
            <section className="rounded-3xl bg-gradient-to-r from-[#66090D] via-[#800b11] to-[#66090D] p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                  Total Earned Bonus
                </span>
                <p className="mt-1 font-mono text-4xl font-black text-white">
                  {formatINR(stats.totalBonus)}
                </p>
                <p className="mt-1 text-xs text-red-100 font-semibold">
                  Directly calculated from verified student admissions.
                </p>
              </div>

              <button
                onClick={() => alert("Payment details & bank account linking will be enabled shortly.")}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl uppercase tracking-wider shadow transition shrink-0"
              >
                View Payment Details
              </button>
            </section>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-3.5">
              <StatCard label="Pending Bonus" value={formatINR(stats.pendingBonus)} icon={ClockIcon} accent="gold" />
              <StatCard label="This Month" value={formatINR(stats.thisMonth)} icon={CalendarIcon} />
              <StatCard label="Successful Referrals" value={stats.successfulReferrals} icon={CheckCircleIcon} accent="success" />
            </div>

            {/* Bonus History Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm space-y-3">
              <div className="px-6 pt-5 pb-2">
                <h2 className="text-base font-black text-slate-900">Bonus History Log</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-xs">
                  <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Program</th>
                      <th className="px-6 py-3.5">Referral</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Bonus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {bonusHistory.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 text-slate-500">{row.date}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{row.program}</td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-600">{row.referral}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-6 py-4 text-right font-black text-[#66090D] font-mono text-sm">
                          {formatINR(row.bonus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }}
    </ShikshaBandhuLayout>
  );
};
