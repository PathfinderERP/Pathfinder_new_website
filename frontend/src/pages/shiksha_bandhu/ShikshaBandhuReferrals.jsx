import React, { useState, useEffect } from "react";
import { CursorArrowRaysIcon, UserPlusIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { ShikshaBandhuLayout } from "./components/ShikshaBandhuLayout";
import { StatCard, StatusBadge } from "./components/StatCard";
import { DEMO_REFERRALS, formatINR } from "./ShikshaBandhuData";
import { shikshaBandhuAPI } from "../../services/api";

export const ShikshaBandhuReferrals = () => {
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

        const stats = liveData?.stats || user.stats || { clicks: 128, registrations: 24, successfulReferrals: 12 };
        const referralsList = liveData?.referrals || DEMO_REFERRALS;

        return (
          <div className="space-y-6 pb-12">
            <div>
              <h1 className="text-2xl font-black text-[#66090D]">My Referrals</h1>
              <p className="mt-1 text-xs text-slate-500 font-semibold">
                Track clicks, registrations and successful referrals. Student identities are masked for privacy protection.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3.5">
              <StatCard label="Total Clicks" value={stats.clicks} icon={CursorArrowRaysIcon} />
              <StatCard label="Registrations" value={stats.registrations} icon={UserPlusIcon} accent="gold" />
              <StatCard label="Successful" value={stats.successfulReferrals} icon={CheckCircleIcon} accent="success" />
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900">Referral Tracking Log</h2>
                <span className="text-[11px] font-bold text-slate-400">Total Records: {referralsList.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-xs">
                  <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Student ID</th>
                      <th className="px-6 py-3.5">Program</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Bonus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {referralsList.map((row, i) => (
                      <tr key={row.id || i} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-bold text-slate-900 font-mono">{row.student}</td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">{row.program}</td>
                        <td className="px-6 py-4 text-slate-500">{row.date}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-6 py-4 text-right font-black text-[#66090D] font-mono text-sm">
                          {row.bonus ? formatINR(row.bonus) : "—"}
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
