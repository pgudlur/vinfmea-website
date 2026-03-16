"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  BarChart3,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const isLoading = useAuth((s) => s.isLoading);
  const storeError = useAuth((s) => s.error);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError ?? storeError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password.trim()) {
      setLocalError("Please enter both username and password.");
      return;
    }

    try {
      await login(username, password);
      router.push("/app");
    } catch {
      // Error is handled by the store
    }
  };

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
          {/* Logo / Brand */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white">
              vin<span className="text-[#3498DB]">FMEA</span>
            </h1>
            <p className="mt-3 text-lg text-gray-300">
              Professional FMEA &amp; Control Plan Suite
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Shield className="h-5 w-5 text-[#3498DB]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  AIAG-VDA &amp; ISO 26262 Compliant
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Built to the latest automotive quality and functional safety
                  standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <CheckCircle className="h-5 w-5 text-[#1ABC9C]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  4-Level Traceability: SFMEA &rarr; DFMEA &rarr; PFMEA &rarr;
                  CP
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Full traceability from system to process with linked control
                  plans.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <BarChart3 className="h-5 w-5 text-[#ADFF2F]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Real-time Risk Visualization &amp; Dashboards
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Interactive charts and KPIs for instant risk insights across
                  projects.
                </p>
              </div>
            </div>
          </div>

          {/* Footer text */}
          <p className="mt-16 text-xs text-gray-500">
            &copy; {new Date().getFullYear()} vinFMEA Pro. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2 xl:w-[55%]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <h1 className="text-3xl font-bold text-[#1B2838]">
              vin<span className="text-[#3498DB]">FMEA</span>
            </h1>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Sign in to vinFMEA
          </h2>
          <p className="mb-8 text-sm text-gray-500">
            Enter your credentials to access your workspace.
          </p>

          {/* Error message */}
          {error && (
            <div className="animate-slide-up mb-6 rounded-lg bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
            >
              Start Free Trial
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
