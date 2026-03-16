"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import {
  User,
  Mail,
  Building2,
  Shield,
  CheckCircle,
  BarChart3,
  Copy,
  Check,
} from "lucide-react";
import type { RegisterResponse } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const registerFn = useAuth((s) => s.register);
  const isLoading = useAuth((s) => s.isLoading);
  const storeError = useAuth((s) => s.error);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const error = localError ?? storeError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setLocalError("Please fill in your name and email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await registerFn({
        customer_name: customerName,
        customer_email: customerEmail,
        company_name: companyName,
      });
      setResult(res);
    } catch {
      // Error is handled by the store
    }
  };

  const copyKey = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.license_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success state
  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <CheckCircle className="h-8 w-8 text-[#2563EB]" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to vinFMEA!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your 14-day free trial is now active.
          </p>

          <div className="mt-6 rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#2563EB]">
              Your License Key
            </p>
            <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-[#1B2838]">
              {result.license_key}
            </p>
            <button
              onClick={copyKey}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Key
                </>
              )}
            </button>
          </div>

          <div className="mt-4 rounded-lg bg-gray-100 p-4 text-left text-sm">
            <p className="mb-2 font-semibold text-gray-700">
              Your Login Credentials:
            </p>
            <p className="text-gray-600">
              Username:{" "}
              <span className="font-mono font-medium text-gray-900">
                {result.username}
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              A temporary password has been emailed to you. Please change it
              after your first login.
            </p>
          </div>

          <button
            onClick={() => router.push("/app")}
            className="mt-6 w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
          >
            Go to Dashboard
          </button>

          <p className="mt-4 text-xs text-gray-400">
            Full access to SFMEA, DFMEA, PFMEA, Control Plans &amp; Dashboards
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%]">
        <div
          className="flex w-full flex-col justify-center px-12 xl:px-20"
          style={{
            background: "linear-gradient(135deg, #1B2838 0%, #34495E 100%)",
          }}
        >
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white">
              vin<span className="text-[#3498DB]">FMEA</span>
            </h1>
            <p className="mt-3 text-lg text-gray-300">
              Professional FMEA &amp; Control Plan Suite
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Shield className="h-5 w-5 text-[#3498DB]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  14-Day Free Trial
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Full access to all FMEA tools. No credit card required.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <CheckCircle className="h-5 w-5 text-[#1ABC9C]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  SFMEA &rarr; DFMEA &rarr; PFMEA &rarr; Control Plans
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  4-level traceability from system to process with linked
                  control plans.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <BarChart3 className="h-5 w-5 text-[#ADFF2F]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  AIAG-VDA &amp; ISO 26262 Compliant
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Built for automotive, aerospace, and medical device
                  manufacturers.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-16 text-xs text-gray-500">
            &copy; {new Date().getFullYear()} vinFMEA Pro. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - registration form */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2 xl:w-[55%]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-[#1B2838]">
              vin<span className="text-[#3498DB]">FMEA</span>
            </h1>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Start Free Trial
          </h2>
          <p className="mb-8 text-sm text-gray-500">
            14 days free &mdash; all tools included, no credit card required
          </p>

          {/* Error message */}
          {error && (
            <div className="animate-slide-up mb-6 rounded-lg bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="customer_name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="customer_name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label
                htmlFor="customer_email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Work Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="customer_email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="jane@company.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label
                htmlFor="company_name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Company Name{" "}
                <span className="text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Building2 className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="company_name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Manufacturing Inc."
                  autoComplete="organization"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {isLoading ? "Creating your account..." : "Start Free Trial"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
