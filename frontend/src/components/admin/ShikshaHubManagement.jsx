import React, { useState, useEffect } from "react";
import {
  UserGroupIcon,
  CursorArrowRaysIcon,
  UserPlusIcon,
  BanknotesIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { shikshaBandhuAPI } from "../../services/api";

const ShikshaHubManagement = () => {
  const [activeTab, setActiveTab] = useState("partners"); // 'partners' | 'referrals'
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPartners: 0,
    totalClicks: 0,
    totalLeads: 0,
    totalPayouts: 0,
  });
  const [partners, setPartners] = useState([]);
  const [referrals, setReferrals] = useState([]);

  // Create Partner Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    partner_id: "",
    name: "",
    mobile: "",
    email: "",
    password: "demo123",
  });
  const [submittingPartner, setSubmittingPartner] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partnersRes, refRes] = await Promise.all([
        shikshaBandhuAPI.adminGetPartners(),
        shikshaBandhuAPI.adminGetReferrals(),
      ]);

      if (partnersRes.data) {
        setSummary(partnersRes.data.summary || {});
        setPartners(partnersRes.data.partners || []);
      }
      if (refRes.data) {
        setReferrals(refRes.data.referrals || []);
      }
    } catch (err) {
      console.error("Error fetching Shiksha Hub data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmittingPartner(true);

    try {
      const res = await shikshaBandhuAPI.adminCreatePartner(newPartner);
      if (res.data && res.data.success) {
        setCreateModalOpen(false);
        setNewPartner({ partner_id: "", name: "", mobile: "", email: "", password: "demo123" });
        fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create partner");
    } finally {
      setSubmittingPartner(false);
    }
  };

  const handleStatusChange = async (refId, newStatus, currentBonus, partnerId) => {
    try {
      await shikshaBandhuAPI.adminUpdateReferral(refId, {
        status: newStatus,
        bonus_amount: currentBonus || 250,
        partner_id: partnerId,
      });

      // Update local state smoothly
      setReferrals((prev) =>
        prev.map((item) => (item.id === refId ? { ...item, status: newStatus } : item))
      );
      fetchData();
    } catch (err) {
      console.error("Error updating referral status:", err);
    }
  };

  const handleBonusChange = async (refId, newBonus, currentStatus, partnerId) => {
    try {
      await shikshaBandhuAPI.adminUpdateReferral(refId, {
        status: currentStatus,
        bonus_amount: newBonus,
        partner_id: partnerId,
      });

      setReferrals((prev) =>
        prev.map((item) => (item.id === refId ? { ...item, bonusAmount: newBonus } : item))
      );
      fetchData();
    } catch (err) {
      console.error("Error updating bonus amount:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
            Pathfinder Partner System
          </span>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1 uppercase tracking-tight">
            Shiksha Hub Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
            Manage Shiksha Bandhu referral partners, track clicks, leads, and control bonus payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Partner
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Total Partners</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <UserGroupIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-black text-gray-900 dark:text-white mt-2">
            {summary.totalPartners || partners.length || 1}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Total Clicks</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CursorArrowRaysIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-black text-gray-900 dark:text-white mt-2">
            {summary.totalClicks || 128}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Referred Leads</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserPlusIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-black text-gray-900 dark:text-white mt-2">
            {summary.totalLeads || referrals.length || 24}
          </p>
        </div>

        <div className="bg-[#66090D] text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">Total Payouts</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <BanknotesIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="font-mono text-3xl font-black text-white mt-2">
            ₹{(summary.totalPayouts || 3000).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-800 flex gap-4">
        <button
          onClick={() => setActiveTab("partners")}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "partners"
              ? "border-[#66090D] text-[#66090D] dark:text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Partner Accounts ({partners.length})
        </button>
        <button
          onClick={() => setActiveTab("referrals")}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "referrals"
              ? "border-[#66090D] text-[#66090D] dark:text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Referred Leads & Bonuses ({referrals.length})
        </button>
      </div>

      {/* Tab 1: Partners Table */}
      {activeTab === "partners" && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold text-[11px] border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 text-left">Partner ID</th>
                  <th className="px-5 py-3.5 text-left">Name</th>
                  <th className="px-5 py-3.5 text-left">Contact Info</th>
                  <th className="px-5 py-3.5 text-center">Clicks</th>
                  <th className="px-5 py-3.5 text-center">Leads</th>
                  <th className="px-5 py-3.5 text-center">Successful</th>
                  <th className="px-5 py-3.5 text-right">Earned Bonus</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-semibold text-gray-800 dark:text-gray-200">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4 font-mono font-black text-[#66090D] dark:text-orange-500">{p.id}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">{p.name}</td>
                    <td className="px-5 py-4 text-gray-500">
                      <div>{p.mobile}</div>
                      <div className="text-[10px] text-gray-400">{p.email}</div>
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold">{p.clicks}</td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-amber-600">{p.leads}</td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-emerald-600">{p.successful}</td>
                    <td className="px-5 py-4 text-right font-mono font-black text-[#66090D] dark:text-orange-400">
                      ₹{(p.totalEarnings || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          p.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Referrals Table */}
      {activeTab === "referrals" && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-extrabold text-[11px] border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 text-left">Lead ID</th>
                  <th className="px-5 py-3.5 text-left">Partner ID</th>
                  <th className="px-5 py-3.5 text-left">Student Info</th>
                  <th className="px-5 py-3.5 text-left">Program</th>
                  <th className="px-5 py-3.5 text-left">Date</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Bonus Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-semibold text-gray-800 dark:text-gray-200">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4 font-mono font-bold text-gray-500">{r.displayId || r.id}</td>
                    <td className="px-5 py-4 font-mono font-black text-[#66090D] dark:text-orange-500">{r.partnerId}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{r.studentName}</div>
                      <div className="text-[10px] text-gray-400">{r.mobile}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">{r.program}</td>
                    <td className="px-5 py-4 text-gray-400">{r.date}</td>
                    <td className="px-5 py-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value, r.bonusAmount, r.partnerId)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase border focus:outline-none cursor-pointer ${
                          r.status === "Successful"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : r.status === "Pending"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Successful">Successful (Credit Bonus)</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-400">₹</span>
                        <input
                          type="number"
                          value={r.bonusAmount || 250}
                          onChange={(e) => handleBonusChange(r.id, parseInt(e.target.value) || 0, r.status, r.partnerId)}
                          className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-right font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Partner Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-[#66090D] dark:text-orange-500 uppercase">Add Shiksha Bandhu Partner</h3>

            {formError && (
              <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs font-bold text-gray-700 dark:text-gray-300">
              <div className="space-y-1">
                <label className="uppercase">Partner ID (e.g. SB005)</label>
                <input
                  type="text"
                  required
                  value={newPartner.partner_id}
                  onChange={(e) => setNewPartner({ ...newPartner, partner_id: e.target.value })}
                  placeholder="SB005"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Partner Name</label>
                <input
                  type="text"
                  required
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  placeholder="Enter Full Name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={newPartner.mobile}
                  onChange={(e) => setNewPartner({ ...newPartner, mobile: e.target.value })}
                  placeholder="+91 Mobile Number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Email Address</label>
                <input
                  type="email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={newPartner.password}
                  onChange={(e) => setNewPartner({ ...newPartner, password: e.target.value })}
                  placeholder="demo123"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-extrabold text-xs rounded-xl uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPartner}
                  className="flex-1 py-3 bg-[#66090D] hover:bg-[#800b11] text-white font-extrabold text-xs rounded-xl uppercase shadow"
                >
                  {submittingPartner ? "Saving..." : "Create Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShikshaHubManagement;
