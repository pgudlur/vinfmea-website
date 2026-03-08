"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">{"\u2714\uFE0F"}</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Thank you!</h3>
        <p className="text-green-600">We&apos;ll be in touch within 1 business day.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again or email us directly.");
      }
    } catch {
      setError("Network error. Please try again or email support@vinreliability.net directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg)] rounded-xl p-8 border border-gray-200"
    >
      {/* Web3Forms access key — submissions emailed to support@vinreliability.net */}
      <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
      <input type="hidden" name="subject" value="vinFMEA Pro — New Contact Form Submission" />
      <input type="hidden" name="from_name" value="vinFMEA Website" />
      {/* Honeypot spam protection */}
      <input type="checkbox" name="botcheck" className="hidden" />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[var(--blue-dark)] focus:ring-2 focus:ring-[var(--blue-dark)]/20 outline-none transition-all"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
          <input
            type="text"
            name="company"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[var(--blue-dark)] focus:ring-2 focus:ring-[var(--blue-dark)]/20 outline-none transition-all"
            placeholder="Automotive Corp"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[var(--blue-dark)] focus:ring-2 focus:ring-[var(--blue-dark)]/20 outline-none transition-all"
            placeholder="john@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interest</label>
          <select
            name="interest"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[var(--blue-dark)] focus:ring-2 focus:ring-[var(--blue-dark)]/20 outline-none transition-all bg-white"
          >
            <option>Free Trial</option>
            <option>Professional License</option>
            <option>Team License</option>
            <option>Enterprise / Custom</option>
            <option>Demo Request</option>
          </select>
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          name="message"
          rows={4}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[var(--blue-dark)] focus:ring-2 focus:ring-[var(--blue-dark)]/20 outline-none transition-all resize-none"
          placeholder="Tell us about your FMEA needs..."
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-lg bg-[var(--blue-dark)] text-white font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
