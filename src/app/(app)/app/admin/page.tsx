"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "@/stores/useAdmin";
import { adminLicenses } from "@/lib/api";
import LicenseDialog from "@/components/admin/LicenseDialog";
import type { SaasLicense, SaasLicenseCreate, SaasLicenseUpdate } from "@/lib/types";

// ── Status badge colors ──────────────────────────────────────
const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trial: "bg-blue-100 text-blue-700",
  suspended: "bg-amber-100 text-amber-700",
  expired: "bg-gray-100 text-gray-500",
  disabled: "bg-red-100 text-red-700",
};

const planLabels: Record<string, string> = {
  trial: "Trial",
  professional_monthly: "Pro Monthly",
  professional_annual: "Pro Annual",
  team_annual: "Team Annual",
  enterprise: "Enterprise",
};

export default function AdminDashboardPage() {
  const {
    licenses, licensesTotal, summary,
    licenseSearch, licensePlanFilter, licenseStatusFilter, licensePage,
    isLoadingSummary, isLoadingLicenses,
    fetchSummary, fetchLicenses,
    setLicenseSearch, setLicensePlanFilter, setLicenseStatusFilter, setLicensePage,
  } = useAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<SaasLicense | null>(null);
  const [searchInput, setSearchInput] = useState(licenseSearch);
  const [error, setError] = useState<string | null>(null);

  // Fetch summary on mount
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Fetch licenses when filters change (also runs on mount)
  useEffect(() => {
    fetchLicenses();
  }, [licenseSearch, licensePlanFilter, licenseStatusFilter, licensePage, fetchLicenses]);

  const handleSearch = useCallback(() => {
    setLicenseSearch(searchInput);
  }, [searchInput, setLicenseSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleNewLicense = () => {
    setEditingLicense(null);
    setDialogOpen(true);
  };

  const handleEditLicense = (lic: SaasLicense) => {
    setEditingLicense(lic);
    setDialogOpen(true);
  };

  const handleSaveLicense = async (data: SaasLicenseCreate | SaasLicenseUpdate) => {
    try {
      setError(null);
      if (editingLicense) {
        await adminLicenses.update(editingLicense.id, data as SaasLicenseUpdate);
      } else {
        await adminLicenses.create(data as SaasLicenseCreate);
      }
      setDialogOpen(false);
      fetchSummary();
      fetchLicenses();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save license";
      setError(msg);
      throw err; // Re-throw so dialog knows it failed
    }
  };

  const handleDisable = async (lic: SaasLicense) => {
    if (!confirm(`Disable license ${lic.license_key}?`)) return;
    try {
      setError(null);
      await adminLicenses.disable(lic.id);
      fetchSummary();
      fetchLicenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable license");
    }
  };

  const handleEnable = async (lic: SaasLicense) => {
    try {
      setError(null);
      await adminLicenses.enable(lic.id);
      fetchSummary();
      fetchLicenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable license");
    }
  };

  const totalPages = Math.ceil(licensesTotal / 50);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">&times;</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard
          label="Total Licenses"
          value={summary?.total_licenses ?? 0}
          color="text-gray-900"
          bg="bg-white"
          loading={isLoadingSummary}
        />
        <SummaryCard
          label="Active"
          value={summary?.active_licenses ?? 0}
          color="text-green-700"
          bg="bg-green-50"
          loading={isLoadingSummary}
        />
        <SummaryCard
          label="Trials"
          value={summary?.trial_licenses ?? 0}
          color="text-blue-700"
          bg="bg-blue-50"
          loading={isLoadingSummary}
        />
        <SummaryCard
          label="Expiring 30d"
          value={summary?.expiring_30d ?? 0}
          color="text-amber-700"
          bg="bg-amber-50"
          loading={isLoadingSummary}
        />
        <SummaryCard
          label="Disabled"
          value={summary?.disabled_licenses ?? 0}
          color="text-red-700"
          bg="bg-red-50"
          loading={isLoadingSummary}
        />
      </div>

      {/* Search + Filters + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by key, name, email..."
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
          value={licensePlanFilter}
          onChange={(e) => setLicensePlanFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Plans</option>
          <option value="trial">Trial</option>
          <option value="professional_monthly">Pro Monthly</option>
          <option value="professional_annual">Pro Annual</option>
          <option value="team_annual">Team Annual</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={licenseStatusFilter}
          onChange={(e) => setLicenseStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
          <option value="disabled">Disabled</option>
        </select>

        <button
          onClick={handleSearch}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Search
        </button>

        <button
          onClick={() => { fetchSummary(); fetchLicenses(); }}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={handleNewLicense}
          className="ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New License
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">License Key</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Plan</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Seats</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Expires</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingLicenses ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No licenses found
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{lic.license_key}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{lic.customer_name}</div>
                      <div className="text-xs text-gray-500">{lic.customer_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {planLabels[lic.plan] ?? lic.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">{lic.activated_seats}</span>
                      <span className="text-gray-400">/{lic.max_seats}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lic.expires_at
                        ? new Date(lic.expires_at).toLocaleDateString()
                        : "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[lic.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {lic.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditLicense(lic)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {lic.status === "disabled" ? (
                          <button
                            onClick={() => handleEnable(lic)}
                            className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
                            title="Enable"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisable(lic)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                            title="Disable"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
              Showing {licensePage * 50 + 1}–{Math.min((licensePage + 1) * 50, licensesTotal)} of {licensesTotal}
            </p>
            <div className="flex gap-1">
              <button
                disabled={licensePage === 0}
                onClick={() => setLicensePage(licensePage - 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={licensePage >= totalPages - 1}
                onClick={() => setLicensePage(licensePage + 1)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <LicenseDialog
          license={editingLicense}
          onSave={handleSaveLicense}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}

// ── Summary Card ─────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
  bg,
  loading,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  loading: boolean;
}) {
  return (
    <div className={`${bg} rounded-xl border border-gray-200 p-4`}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
      ) : (
        <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
      )}
    </div>
  );
}
