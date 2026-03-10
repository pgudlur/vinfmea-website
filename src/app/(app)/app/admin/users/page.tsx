"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "@/stores/useAdmin";
import { adminUsers } from "@/lib/api";
import UserDialog from "@/components/admin/UserDialog";
import type { UserWithSession, AdminUserCreate, AdminUserUpdate } from "@/lib/types";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  editor: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-600",
};

export default function UserManagementPage() {
  const {
    users, usersTotal,
    userSearch, userRoleFilter, userStatusFilter, userPage,
    isLoadingUsers,
    fetchUsers,
    setUserSearch, setUserRoleFilter, setUserStatusFilter, setUserPage,
  } = useAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithSession | null>(null);
  const [searchInput, setSearchInput] = useState(userSearch);
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [resetUsername, setResetUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch users when filters change (also runs on mount)
  useEffect(() => {
    fetchUsers();
  }, [userSearch, userRoleFilter, userStatusFilter, userPage, fetchUsers]);

  const handleSearch = useCallback(() => {
    setUserSearch(searchInput);
  }, [searchInput, setUserSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (u: UserWithSession) => {
    setEditingUser(u);
    setDialogOpen(true);
  };

  const handleSaveUser = async (data: AdminUserCreate | AdminUserUpdate) => {
    try {
      setError(null);
      if (editingUser) {
        await adminUsers.update(editingUser.id, data as AdminUserUpdate);
      } else {
        await adminUsers.create(data as AdminUserCreate);
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save user";
      setError(msg);
      throw err;
    }
  };

  const handleDisable = async (u: UserWithSession) => {
    if (!confirm(`Disable user "${u.username}"? This will release their seat.`)) return;
    try {
      setError(null);
      await adminUsers.disable(u.id);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable user");
    }
  };

  const handleEnable = async (u: UserWithSession) => {
    try {
      setError(null);
      await adminUsers.enable(u.id);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable user");
    }
  };

  const handleResetPassword = async () => {
    if (!resetUserId || !newPassword) return;
    try {
      setError(null);
      await adminUsers.resetPassword(resetUserId, newPassword);
      setResetUserId(null);
      setResetUsername("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  const totalPages = Math.ceil(usersTotal / 50);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">&times;</button>
        </div>
      )}

      {/* Search + Filters + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, username, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <select
          value={userRoleFilter}
          onChange={(e) => setUserRoleFilter(e.target.value)}
          aria-label="Filter by role"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>

        <select
          value={userStatusFilter}
          onChange={(e) => setUserStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>

        <button
          onClick={handleSearch}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Search
        </button>

        <button
          onClick={fetchUsers}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={handleNewUser}
          className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Username</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Display Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Session</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.username}</td>
                    <td className="px-4 py-3 text-gray-700">{u.display_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email || "\u2014"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${roleColors[u.role] ?? "bg-gray-100 text-gray-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.is_active ? (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.has_active_seat ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-gray-500">
                            {u.last_heartbeat ? timeAgo(u.last_heartbeat) : "Online"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Offline</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setResetUserId(u.id); setResetUsername(u.username); setNewPassword(""); }}
                          className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50"
                          title="Reset Password"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        {u.is_active ? (
                          <button
                            onClick={() => handleDisable(u)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                            title="Disable"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnable(u)}
                            className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
                            title="Enable"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {userPage * 50 + 1}–{Math.min((userPage + 1) * 50, usersTotal)} of {usersTotal}
            </p>
            <div className="flex gap-1">
              <button
                disabled={userPage === 0}
                onClick={() => setUserPage(userPage - 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={userPage >= totalPages - 1}
                onClick={() => setUserPage(userPage + 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Dialog */}
      {dialogOpen && (
        <UserDialog
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {/* Password Reset Dialog */}
      {resetUserId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter a new password for user &quot;{resetUsername}&quot;.
            </p>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResetUserId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Format a timestamp as relative time (e.g. "2m ago") */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff) || diff < 0) return "just now";
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}
