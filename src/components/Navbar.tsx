"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-[var(--navy)] flex items-center justify-center">
              <span className="text-[var(--red-brand)] font-black text-sm leading-none">
                V
              </span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-[var(--green-accent)]" style={{ textShadow: "0 0 0 #2C3E50" }}>
                <span className="text-[#6B8E23]">vin</span>
              </span>
              <span className="text-[var(--navy)]">FMEA</span>
              <sup className="text-xs text-gray-400 ml-0.5">{"\u2122"}</sup>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm font-medium text-gray-600 hover:text-[var(--navy)] transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-600 hover:text-[var(--navy)] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/#standards"
              className="text-sm font-medium text-gray-600 hover:text-[var(--navy)] transition-colors"
            >
              Standards
            </Link>
            <Link
              href="/#contact"
              className="text-sm font-medium text-gray-600 hover:text-[var(--navy)] transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-5 py-2 rounded-lg bg-[var(--blue-dark)] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/#features" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">Features</Link>
            <Link href="/pricing" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">Pricing</Link>
            <Link href="/#standards" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">Standards</Link>
            <Link href="/#contact" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded">Contact</Link>
            <Link href="/pricing" className="block px-3 py-2 text-sm font-semibold text-white bg-[var(--blue-dark)] rounded-lg text-center">Start Free Trial</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
