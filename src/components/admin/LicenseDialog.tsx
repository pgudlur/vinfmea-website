"use client";

import { useState, useEffect } from "react";
import type { SaasLicense, SaasLicenseCreate, SaasLicenseUpdate } from "@/lib/types";

interface Props {
  license: SaasLicense | null; // null = create mode
  onSave: (data: SaasLicenseCreate | SaasLicenseUpdate) => Promise<void>;
  onClose: () => void;
}

const PLAN_OPTIONS = [
  { value: "trial", label: "Trial" },
  { value: "professional_monthly", label: "Professional Monthly" },
  { value: "professional_annual", label: "Professional Annual" },
  { value: "team_annual", label: "Team Annual" },
  { value: "enterprise", label: "Enterprise" },
];

const STATUS_OPTIONS = [
  { value: "trial", label: "Trial" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "expired", label: "Expired" },
  { value: "disabled", label: "Disabled" },
];

export default function LicenseDialog({ license, onSave, onClose }: Props) {
  const isEdit = !!license;
  const [customerName, setCustomerName] = useState(license?.customer_name ?? "");
  const [customerEmail, setCustomerEmail] = useState(license?.customer_email ?? "");
  const [plan, setPlan] = useState(license?.plan ?? "trial");
  const [maxSeats, setMaxSeats] = useState(license?.max_seats ?? 1);
  const [status, setStatus] = useState(license?.status ?? "trial");
  const [expiresAt, setExpiresAt] = useState(license?.expires_at?.slice(0, 10) ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        const data: SaasLicenseUpdate = {
          customer_name: customerName,
          customer_email: customerEmail,
          plan,
          max_seats: maxSeats,
          status,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        };
        await onSave(data);
      } else {
        const data: SaasLicenseCreate = {
          customer_name: customerName,
          customer_email: customerEmail,
          plan,
          max_seats: maxSeats,
          status,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        };
        await onSave(data);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit License" : "New License"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            {"\u2715"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {PLAN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Seats</label>
              <input
                type="number"
                min={1}
                max={999}
                value={maxSeats}
                onChange={(e) => setMaxSeats(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
