import React, { useState, useEffect, useCallback } from "react";
import { adminManagementAPI } from "../../services/api";
import { useAdminCache, clearAdminCache } from "../../hooks/useAdminCache";
import { RefreshCw } from "lucide-react";

const AdminManagement = () => {
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // --- Caching Hook Implementation ---
  const fetchAdminsData = useCallback(async () => {
    const response = await adminManagementAPI.getAllAdmins();
    return {
      admins: response.data.admins || [],
      pagination: response.data.pagination || {}
    };
  }, []);

  const {
    data: fetchedData,
    loading,
    error: cacheError,
    refresh: refreshAdmins
  } = useAdminCache("admin_management_list", fetchAdminsData, {
    initialData: { admins: [], pagination: {} }
  });

  const { admins, pagination } = fetchedData;

  // Match EXACTLY with your backend AVAILABLE_PERMISSIONS
  const availablePermissions = [
    { key: "view_dashboard", label: "View Dashboard" },
    { key: "manage_courses", label: "Manage Courses" },
    { key: "manage_users", label: "Manage Users" },
    { key: "manage_admins", label: "Manage Admins" },
    { key: "manage_applications", label: "Manage Applications" },
    { key: "manage_blogs", label: "Manage Blogs" },
    { key: "system_settings", label: "System Settings" },
  ];

  const [adminData, setAdminData] = useState({
    email: "",
    full_name: "",
    phone: "",
    password: "",
    is_superuser: false,
    permissions: ["view_dashboard"], // Default permission
  });

  const [inviteData, setInviteData] = useState({
    email: "",
    full_name: "",
    permissions: ["view_dashboard"], // Default permission
  });

  useEffect(() => {
    if (cacheError) setError("Failed to fetch admins");
  }, [cacheError]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Ensure permissions are valid
      const validPermissions = adminData.permissions.filter((perm) =>
        availablePermissions.some((availPerm) => availPerm.key === perm)
      );

      const dataToSend = {
        ...adminData,
        permissions: validPermissions,
      };

      await adminManagementAPI.createAdmin(dataToSend);
      setShowCreateForm(false);
      setAdminData({
        email: "",
        full_name: "",
        phone: "",
        password: "",
        is_superuser: false,
        permissions: ["view_dashboard"],
      });
      clearAdminCache("admin_management_list");
      refreshAdmins();
      alert("Admin created successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create admin");
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Ensure permissions are valid
      const validPermissions = inviteData.permissions.filter((perm) =>
        availablePermissions.some((availPerm) => availPerm.key === perm)
      );

      const dataToSend = {
        ...inviteData,
        permissions: validPermissions,
      };

      await adminManagementAPI.inviteAdmin(dataToSend);
      setShowInviteForm(false);
      setInviteData({
        email: "",
        full_name: "",
        permissions: ["view_dashboard"],
      });
      clearAdminCache("admin_management_list");
      refreshAdmins();
      alert("Invitation sent successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send invitation");
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setAdminData({
      email: admin.email,
      full_name: admin.full_name,
      phone: admin.phone || "",
      password: "", // Don't pre-fill password for security
      is_superuser: admin.is_superuser,
      permissions: admin.permissions || ["view_dashboard"],
    });
    setShowCreateForm(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Remove password from update if empty
      const updateData = { ...adminData };
      if (!updateData.password) {
        delete updateData.password;
      }

      // Ensure permissions are valid
      const validPermissions = updateData.permissions.filter((perm) =>
        availablePermissions.some((availPerm) => availPerm.key === perm)
      );

      updateData.permissions = validPermissions;

      await adminManagementAPI.updateAdmin(editingAdmin.id, updateData);
      setShowCreateForm(false);
      setEditingAdmin(null);
      setAdminData({
        email: "",
        full_name: "",
        phone: "",
        password: "",
        is_superuser: false,
        permissions: ["view_dashboard"],
      });
      clearAdminCache("admin_management_list");
      refreshAdmins();
      alert("Admin updated successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update admin");
    }
  };

  const handlePermissionToggle = (
    permission,
    currentPermissions,
    setPermissions
  ) => {
    if (currentPermissions.includes(permission)) {
      setPermissions(currentPermissions.filter((p) => p !== permission));
    } else {
      setPermissions([...currentPermissions, permission]);
    }
  };

  const handleStatusToggle = async (adminId, currentStatus) => {
    try {
      await adminManagementAPI.updateAdminPermissions(adminId, {
        is_active: !currentStatus,
      });
      clearAdminCache("admin_management_list");
      refreshAdmins();
      alert(
        `Admin ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
    } catch (err) {
      setError("Failed to update admin status");
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (
      window.confirm(
        `Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`
      )
    ) {
      try {
        await adminManagementAPI.deleteAdmin(adminId);
        clearAdminCache("admin_management_list");
        refreshAdmins();
        alert("Admin deleted successfully!");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete admin");
      }
    }
  };

  const handleUpdatePermissions = async (adminId, newPermissions) => {
    try {
      // Ensure permissions are valid
      const validPermissions = newPermissions.filter((perm) =>
        availablePermissions.some((availPerm) => availPerm.key === perm)
      );

      await adminManagementAPI.updateAdminPermissions(adminId, {
        permissions: validPermissions,
      });
      clearAdminCache("admin_management_list");
      refreshAdmins();
      alert("Permissions updated successfully!");
    } catch (err) {
      setError("Failed to update permissions");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingAdmin(null);
    setAdminData({
      email: "",
      full_name: "",
      phone: "",
      password: "",
      is_superuser: false,
      permissions: ["view_dashboard"],
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage administrator accounts, permissions, and access levels
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              clearAdminCache("admin_management_list");
              refreshAdmins();
            }}
            className="p-2 text-gray-400 hover:text-orange-600 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-md transition duration-200"
            title="Refresh Admins"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setEditingAdmin(null);
              setShowCreateForm(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Admin
          </button>
          <button
            onClick={() => setShowInviteForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Invite Admin
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Create/Edit Admin Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 mb-6 border-2 border-blue-200 dark:border-blue-900/30">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingAdmin
              ? `Edit Admin: ${editingAdmin.full_name}`
              : "Create New Admin"}
          </h2>
          <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={adminData.full_name}
                  onChange={(e) =>
                    setAdminData({ ...adminData, full_name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email *
                </label>
                <input
                  type="email"
                  value={adminData.email}
                  onChange={(e) =>
                    setAdminData({ ...adminData, email: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-50"
                  required
                  disabled={!!editingAdmin}
                />
                {editingAdmin && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="text"
                  value={adminData.phone}
                  onChange={(e) =>
                    setAdminData({ ...adminData, phone: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password {!editingAdmin && "*"}
                </label>
                <input
                  type="password"
                  value={adminData.password}
                  onChange={(e) =>
                    setAdminData({ ...adminData, password: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-700 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required={!editingAdmin}
                  minLength={6}
                  placeholder={
                    editingAdmin ? "Leave blank to keep current password" : ""
                  }
                />
                {editingAdmin && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave blank to keep current password
                  </p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Permissions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePermissions.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-start p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={adminData.permissions.includes(perm.key)}
                      onChange={() =>
                        handlePermissionToggle(
                          perm.key,
                          adminData.permissions,
                          (newPerms) =>
                            setAdminData({
                              ...adminData,
                              permissions: newPerms,
                            })
                        )
                      }
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {perm.label}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Super Admin Toggle */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={adminData.is_superuser}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      is_superuser: e.target.checked,
                      // If making super admin, grant all permissions
                      permissions: e.target.checked
                        ? availablePermissions.map((p) => p.key)
                        : adminData.permissions,
                    })
                  }
                  className="mr-3 h-5 w-5 text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Super Administrator
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Grant full system access and all permissions
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {editingAdmin ? "Update Admin" : "Create Admin"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Admin Form */}
      {showInviteForm && (
        <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 mb-6 border-2 border-green-200 dark:border-green-900/30">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Invite New Admin
          </h2>
          <form onSubmit={handleInviteAdmin}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={inviteData.full_name}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, full_name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, email: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* Permissions for Invite */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Permissions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePermissions.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-start p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={inviteData.permissions.includes(perm.key)}
                      onChange={() =>
                        handlePermissionToggle(
                          perm.key,
                          inviteData.permissions,
                          (newPerms) =>
                            setInviteData({
                              ...inviteData,
                              permissions: newPerms,
                            })
                        )
                      }
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {perm.label}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md transition duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Invitation
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-lg border dark:border-slate-800">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-slate-800">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Administrator Accounts
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage all administrator accounts and their permissions
          </p>
        </div>

        <ul className="divide-y divide-gray-200 dark:divide-slate-800">
          {admins.length > 0 ? (
            admins.map((admin) => (
              <li
                key={admin.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
              >
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {admin.full_name?.charAt(0)?.toUpperCase() || "A"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {admin.full_name}
                          </h4>
                          {admin.is_superuser && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {admin.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Joined: {formatDate(admin.created_at)}
                          {admin.last_login &&
                            ` • Last login: ${formatDate(admin.last_login)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${admin.is_active
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          }`}
                      >
                        {admin.is_active ? "Active" : "Inactive"}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                          title="Edit Admin"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>

                        {/* Status Toggle */}
                        <button
                          onClick={() =>
                            handleStatusToggle(admin.id, admin.is_active)
                          }
                          className={`p-2 rounded-full transition-colors duration-200 ${admin.is_active
                            ? "text-orange-600 dark:text-orange-500 hover:text-orange-900 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                            : "text-green-600 dark:text-green-500 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                            }`}
                          title={admin.is_active ? "Deactivate" : "Activate"}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {admin.is_active ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            )}
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDeleteAdmin(admin.id, admin.full_name)
                          }
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                          title="Delete Admin"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Display and Management */}
                  {!admin.is_superuser && (
                    <div className="mt-4 pl-16">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Permissions:
                        </div>
                        <button
                          onClick={() => {
                            const newPermissions = admin.permissions.includes(
                              "manage_courses"
                            )
                              ? admin.permissions.filter(
                                (p) => p !== "manage_courses"
                              )
                              : [...admin.permissions, "manage_courses"];
                            handleUpdatePermissions(admin.id, newPermissions);
                          }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Quick Toggle Courses
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availablePermissions.map((perm) => (
                          <span
                            key={perm.key}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${admin.permissions.includes(perm.key)
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700"
                              }`}
                          >
                            {perm.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li>
              <div className="px-4 py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No administrators
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new administrator.
                </p>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Summary */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Total Admins:{" "}
          <span className="font-semibold">
            {pagination.total_admins || admins.length}
          </span>
          {pagination.total_admins && (
            <span className="ml-4">
              Active:{" "}
              <span className="font-semibold text-green-600">
                {admins.filter((a) => a.is_active).length}
              </span>
            </span>
          )}
        </p>
        <div className="text-xs text-gray-500">
          Super Admins: {admins.filter((a) => a.is_superuser).length}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
