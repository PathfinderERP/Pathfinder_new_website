import React, { useState, useEffect } from "react";
import { userManagementAPI, studentCornerAPI } from "../../services/api";
import {
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  UserGroupIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Key,
  Database,
  RefreshCcw,
  Plus as PlusIcon,
  Lock,
  History,
  ShoppingBag,
} from "lucide-react";
import { useCallback } from "react";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";

const UserAvatar = ({ user }) => {
  const [imgError, setImgError] = useState(false);
  // Ensure we have a valid URL string
  const imageUrl = user.profile_image_url;
  const name = user.fullName || user.full_name || "User";

  if (imageUrl && !imgError) {
    return (
      <div className="h-12 w-12 shrink-0">
        <img
          className="h-full w-full rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-lg group-hover:scale-110 transition-transform duration-500"
          src={imageUrl}
          alt={name}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-500 font-black text-lg shadow-inner">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const UsersManagement = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sort: "newest", // Default sort
    page: 1,
    page_size: 10,
  });

  // --- Caching Hook Implementation ---
  const fetchUsersData = useCallback(async () => {
    const response = await userManagementAPI.getAllUsers(filters);
    return {
      users: response.data.users || response.data.data || [],
      pagination: response.data.pagination || {}
    };
  }, [filters]);

  const isDefaultView = filters.page === 1 && !filters.search && !filters.status && filters.sort === "newest";

  const {
    data: fetchedData,
    loading,
    error: cacheError,
    refresh: refreshUsers
  } = useAdminCache(
    isDefaultView ? "admin_users_main" : null,
    fetchUsersData,
    {
      initialData: { users: [], pagination: {} },
      expiryMinutes: 5 // Users list should refresh more often than 24h
    }
  );

  const { users, pagination } = fetchedData;
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  // pagination state removed (derived from cache)

  useEffect(() => {
    if (cacheError) setError(cacheError);
  }, [cacheError]);
  const [jumpPage, setJumpPage] = useState("");
  const [recentUsers, setRecentUsers] = useState([]); // For last 7 days users

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [userSCOrders, setUserSCOrders] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Only fetch stats and recent on mount, not on every filter change
    fetchUserStats();
    fetchRecentUsers();
  }, []);

  // Removed old fetchUsers, handled by hook

  const fetchUserStats = async () => {
    try {
      const response = await userManagementAPI.getUserStats();
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const formattedDate = sevenDaysAgo.toISOString().split("T")[0];

      const response = await userManagementAPI.getAllUsers({
        registered_after: formattedDate,
        page_size: 50,
      });

      const recentData = response.data.users || response.data.data || [];
      setRecentUsers(recentData.slice(0, 10));
    } catch (err) {
      console.error("Error fetching recent users:", err);
    }
  };

  const fetchUserEnrollments = async (userId) => {
    setEnrollmentsLoading(true);
    try {
      // Parallel fetch for better performance
      const [enrollmentsRes, scOrdersRes] = await Promise.all([
        userManagementAPI.getUserEnrollments(userId),
        studentCornerAPI.getUserOrders(userId)
      ]);

      setUserEnrollments(enrollmentsRes.data || []);
      setUserSCOrders(scOrdersRes.data || []);
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Fallback
      if (!userEnrollments.length) setUserEnrollments([]);
      if (!userSCOrders.length) setUserSCOrders([]);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1,
    }));
  };

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: status,
      page: 1,
    }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      sort: e.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await userManagementAPI.updateUserStatus(userId, !currentStatus);
      clearAdminCache("admin_users_main");
      refreshUsers();
      fetchRecentUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, is_active: !currentStatus }));
      }
    } catch (err) {
      setError("Failed to update user status");
      console.error("Error updating user status:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await userManagementAPI.deleteUser(userId);
        clearAdminCache("admin_users_main");
        refreshUsers();
        fetchRecentUsers();
        if (selectedUser && selectedUser.id === userId) {
          closeModal();
        }
      } catch (err) {
        setError("Failed to delete user");
        console.error("Error deleting user:", err);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || resetPassword.length < 6) {
      setResetMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    try {
      await userManagementAPI.resetUserPassword(selectedUser.id, resetPassword);
      setResetMessage({ type: "success", text: "Password reset successfully." });
      setResetPassword("");
    } catch (err) {
      setResetMessage({ type: "error", text: err.response?.data?.error || "Failed to reset password." });
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    fetchUserEnrollments(user.id);
    setResetMessage({ type: "", text: "" });
    setResetPassword("");
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
    setUserEnrollments([]);
    setUserSCOrders([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isRecentUser = (user) => {
    const userDateStr = user.created_at || user.registration_date || user.createdAt;
    if (!userDateStr) return false;
    const userDate = new Date(userDateStr);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return userDate >= sevenDaysAgo;
  };

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage);
    if (pageNum > 0 && pageNum <= pagination.total_pages) {
      handlePageChange(pageNum);
      setJumpPage("");
    } else {
      alert(`Please enter a page between 1 and ${pagination.total_pages}`);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-0">
      {/* Identity Nexus Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Identity Nexus</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Orchestrate user authentication and authorization protocols</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              clearAdminCache("admin_users_main");
              refreshUsers();
            }}
            className="p-2 text-gray-500 hover:text-orange-600 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl transition-all shadow-sm"
            title="Reload Database"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          <div className="flex bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button className="px-4 py-1.5 text-xs font-black text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-lg uppercase tracking-widest">
              Live Assets
            </button>
            <button className="px-4 py-1.5 text-xs font-black text-gray-400 hover:text-gray-300 dark:hover:text-slate-500 rounded-lg uppercase tracking-widest transition-all">
              Archived
            </button>
          </div>
        </div>
      </div>

      {/* Intelligence Dashboard - Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Network Reach', value: stats.total_users || users.length, icon: Users, color: 'blue', desc: 'Total Identities' },
            { label: 'Active Signals', value: stats.active_users || users.filter((u) => u.is_active).length, icon: UserCheck, color: 'green', desc: 'Verified Live' },
            { label: 'Restricted', value: stats.inactive_users || users.filter((u) => !u.is_active).length, icon: UserX, color: 'red', desc: 'Security Holds' },
            { label: 'New Nodes', value: recentUsers.length, icon: UserPlusIcon, color: 'purple', desc: 'Last 7 Days' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-bl-[80px] -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
              <div className="relative">
                <div className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-500`} />
                </div>
                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</h4>
                  <span className="text-[10px] text-gray-400 dark:text-slate-600 font-bold uppercase">{stat.desc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discovery & Filter System */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Discovery Core</h3>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">Filter neural pathways and user nodes</p>
            </div>
          </div>
          <button
            onClick={() => setFilters({ ...filters, search: "", status: "", page: 1 })}
            className="group flex items-center gap-2 px-5 py-3 text-[11px] font-black text-gray-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 uppercase tracking-widest transition-all"
          >
            <History className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Restore Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Neural Search */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Identity Resonance</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within/input:text-orange-600 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold placeholder-gray-400 dark:text-white focus:ring-2 focus:ring-orange-600/20 transition-all shadow-inner"
                placeholder="Query name, digital address or system ID..."
                value={filters.search}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Status Matrix */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Signal Frequency</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-slate-800/50 rounded-2xl shadow-inner">
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status === 'all' ? '' : status)}
                  className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${(filters.status || 'all') === status
                    ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
          <InformationCircleIcon className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-tight">{error}</span>
        </div>
      )}

      {/* Identity Manifest - Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                <th className="px-8 py-5 text-left">
                  <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Network Entity</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Communication Channel</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Temporal Ingress</span>
                </th>
                <th className="px-8 py-5 text-left">
                  <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Status Protocol</span>
                </th>
                <th className="px-8 py-5 text-right">
                  <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Control Matrix</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <UserAvatar user={user} />
                          {user.is_active && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.fullName || user.full_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{user.student_class} Node</span>
                            {isRecentUser(user) && (
                              <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 rounded text-[8px] font-black uppercase tracking-tighter">New Asset</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold truncate max-w-[180px]">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold">{formatDate(user.created_at || user.registration_date || user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${user.is_active
                        ? 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-500 border border-green-100 dark:border-green-900/20'
                        : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 border border-red-100 dark:border-red-900/20'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {user.is_active ? 'Online' : 'Restricted'}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="p-2.5 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                          title="View Intelligence"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user.id, user.is_active)}
                          className={`p-2.5 rounded-xl transition-all ${user.is_active
                            ? "text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            : "text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                            }`}
                        >
                          {user.is_active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2.5 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Identity Vacuum</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No neural signatures detected matching your current discovery parameters.</p>
                      <button
                        onClick={() => setFilters({ ...filters, search: "", status: "", page: 1 })}
                        className="mt-6 px-8 py-3 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20"
                      >
                        Reset Local Protocol
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistence Controls - Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest px-4">
              Streaming <span className="text-gray-900 dark:text-white">{users.length}</span> of <span className="text-gray-900 dark:text-white">{pagination.total_users || users.length}</span> Inbound Assets
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center bg-gray-50 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_previous}
                  className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl disabled:opacity-20 transition-all shadow-sm"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center px-4 gap-1">
                  {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                    let pageNum = pagination.current_page <= 3
                      ? i + 1
                      : pagination.current_page >= pagination.total_pages - 2
                        ? pagination.total_pages - 4 + i
                        : pagination.current_page - 2 + i;

                    if (pageNum <= 0 || pageNum > pagination.total_pages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 text-[11px] font-black rounded-xl transition-all ${pagination.current_page === pageNum
                          ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                          : "text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                  className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl disabled:opacity-20 transition-all shadow-sm"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-3 border-l border-gray-100 dark:border-slate-800 pl-6">
                <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">Warp to:</span>
                <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={pagination.total_pages}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    className="w-16 h-10 px-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-600/20 dark:text-white transition-all shadow-inner"
                  />
                  <button type="submit" className="h-10 px-4 bg-gray-900 dark:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-md">Execute</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
        Showing <span className="font-bold text-gray-900">{users.length}</span> results of <span className="font-bold text-gray-900">{pagination.total_users || users.length}</span> total students
      </div>

      {/* Identity Intelligence Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={closeModal} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-slate-900 rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-100 dark:border-slate-800">
              {/* Modal Header */}
              <div className="px-8 py-8 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {selectedUser.profile_image_url ? (
                      <img className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl" src={selectedUser.profile_image_url} alt="" />
                    ) : (
                      <div className="h-20 w-20 rounded-3xl bg-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                        {(selectedUser.fullName || selectedUser.full_name)?.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-lg">
                      <ShieldCheckIcon className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedUser.fullName || selectedUser.full_name}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="px-3 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Digital Asset</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">UID: {selectedUser.id.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>
                <button onClick={closeModal} className="p-3 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-2xl transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {/* Neural Meta Data */}
                  <div className="space-y-8 md:col-span-1">
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                        <Mail className="w-3 h-3" /> Communication Node
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase mb-1">Electronic Mail</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white break-all">{selectedUser.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase mb-1">Signal Protocol</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase mb-1">Geographical Sector</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.area || "Unknown Sector"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50 dark:border-slate-800">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                        <Lock className="w-3 h-3" /> Security Protocol
                      </h4>
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-inner">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">Initialize Reset</label>
                        <div className="relative mb-3">
                          <input
                            type={showResetPassword ? "text" : "password"}
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border-none rounded-2xl text-xs font-bold dark:text-white shadow-sm focus:ring-2 focus:ring-orange-600/20"
                            placeholder="New Alpha Protocol"
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600"
                          >
                            {showResetPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                        </div>
                        <button
                          onClick={handleResetPassword}
                          className="w-full py-3 bg-gray-900 dark:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-lg active:scale-95"
                        >
                          Override Access
                        </button>
                        {resetMessage.text && (
                          <p className={`mt-3 text-[10px] font-bold text-center ${resetMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>
                            {resetMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operational Data */}
                  <div className="md:col-span-2 space-y-10">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-inner">
                        <p className="text-[8px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest mb-1">Academic Stratum</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedUser.studentClass || selectedUser.student_class}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-inner">
                        <p className="text-[8px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest mb-1">Temporal Origin</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{formatDate(selectedUser.created_at || selectedUser.registration_date || selectedUser.createdAt)}</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-3xl border border-orange-100 dark:border-orange-900/20 shadow-inner">
                        <p className="text-[8px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Total Enrolled Assets</p>
                        <p className="text-lg font-black text-orange-700 dark:text-orange-300 uppercase tracking-tight">{userEnrollments.length + userSCOrders.length} Items</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6 border-b border-gray-50 dark:border-slate-800 pb-4">
                        <Database className="w-3 h-3" /> Transnational Records
                      </h4>
                      {enrollmentsLoading ? (
                        <div className="flex flex-col items-center py-12">
                          <RefreshCcw className="w-8 h-8 text-orange-600 animate-spin mb-4" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Decrypting Records...</p>
                        </div>
                      ) : userEnrollments.length > 0 ? (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {userEnrollments.map((enrollment, idx) => (
                            <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px] flex flex-col gap-6 group/record hover:border-orange-200 dark:hover:border-orange-900/30 transition-all shadow-sm">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                  <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-2xl">
                                    <Database className="w-5 h-5 text-orange-600" />
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover/record:text-orange-600 transition-colors">{enrollment.course_name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(enrollment.enrolled_at)}</span>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${enrollment.course_mode === 'online'
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/10'
                                        : enrollment.course_mode === 'offline'
                                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/10'
                                          : 'bg-gray-50 text-gray-600 dark:bg-slate-800'
                                        }`}>
                                        {enrollment.course_mode === 'unknown' ? enrollment.course_code : enrollment.course_mode}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">₹{enrollment.amount_paid}</p>
                                  <div className="flex items-center gap-1.5 justify-end mt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${enrollment.payment_status === 'completed' ? 'bg-green-500' :
                                      enrollment.payment_status === 'failed' ? 'bg-red-500' : 'bg-orange-500'
                                      }`}></div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{enrollment.payment_status}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-50 dark:border-slate-800/50">
                                <div>
                                  <p className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Course Registry</p>
                                  <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 font-mono tracking-tighter uppercase">{enrollment.course_code || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Payment Protocol</p>
                                  <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate font-mono tracking-tighter uppercase">{enrollment.payment_id}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Asset Status</p>
                                  <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tighter">{enrollment.status}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Secure Key</p>
                                  <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 font-mono tracking-tighter truncate uppercase">E-{enrollment.id?.substring(0, 8)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-slate-800">
                          <Database className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Records Detected</p>
                        </div>
                      )}
                    </div>

                    {/* Student Corner Assets */}
                    <div className="mt-8">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6 border-b border-gray-50 dark:border-slate-800 pb-4">
                        <ShoppingBag className="w-3 h-3" /> Materials & Stationery
                      </h4>
                      {enrollmentsLoading ? (
                        <div className="flex flex-col items-center py-12">
                          <RefreshCcw className="w-8 h-8 text-orange-600 animate-spin mb-4" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Decrypting Inventory...</p>
                        </div>
                      ) : userSCOrders.length > 0 ? (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {userSCOrders.map((order, idx) => (
                            <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px] flex flex-col gap-6 group/record hover:border-blue-200 dark:hover:border-blue-900/30 transition-all shadow-sm">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                  <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl">
                                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover/record:text-blue-600 transition-colors">Multiple Items ({order.items?.length || 0})</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(order.created_at)}</span>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/10">
                                        {order.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-gray-900 dark:text-white tracking-tighter">₹{order.total_amount}</p>
                                  <div className="flex items-center gap-1.5 justify-end mt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${order.payment_status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{order.payment_status}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-50 dark:border-slate-800/50">
                                <p className="text-[8px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">Registry Protocol: {order.payment_id}</p>
                                <div className="space-y-2">
                                  {order.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold text-gray-700 dark:text-gray-300">
                                      <div className="flex items-center gap-2">
                                        {item.image && (
                                          <img src={item.image} alt="" className="w-5 h-5 rounded object-cover border border-gray-100" />
                                        )}
                                        <span>{item.name} <span className="text-gray-400 text-[10px]">x{item.quantity}</span></span>
                                      </div>
                                      <span>₹{item.price * (item.quantity || 1)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-slate-800">
                          <ShoppingBag className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Physical Assets Detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-50 dark:border-slate-800 flex justify-end gap-4">
                <button onClick={closeModal} className="px-8 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 font-black rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-[10px] uppercase tracking-widest">
                  Terminate Intel
                </button>
                <button className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-500/20 text-[10px] uppercase tracking-widest">
                  Secure Identity
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default UsersManagement;
