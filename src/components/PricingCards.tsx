"use client";

import { useState } from "react";
import Link from "next/link";
import { stripeApi } from "@/lib/api";

type BillingInterval = "monthly" | "annual";

const plans = [
  {
    name: "Professional",
    subtitle: "For individual engineers",
    pricing: {
      monthly: { price: "$199", period: "/month", note: "$1,999/yr if billed annually (save 17%)", stripePlan: "professional_monthly" },
      annual: { price: "$1,999", period: "/year", note: "$167/mo — save 17% vs monthly", stripePlan: "professional_annual" },
    },
    popular: false,
    cta: "Start Free Trial",
    features: [
      "Desktop + Web access (one license)",
      "SFMEA / DFMEA / PFMEA / Control Plan",
      "ISO 26262 functional safety",
      "Report Builder (Excel & PDF)",
      "8-language UI",
      "All Tier 3 analysis tools",
      "Risk Matrix & Dashboard",
      "Local audit trail",
      "Email support",
    ],
  },
  {
    name: "Team",
    subtitle: "2\u201350 floating seats",
    pricing: {
      monthly: { price: "$1,799", period: "/seat/year", note: "Volume discounts up to 33% off", stripePlan: "team_annual" },
      annual: { price: "$1,799", period: "/seat/year", note: "Volume discounts up to 33% off", stripePlan: "team_annual" },
    },
    popular: true,
    cta: "Start Free Trial",
    features: [
      "Everything in Professional",
      "Floating license server",
      "Concurrent session management",
      "Pessimistic record locking",
      "SHA-256 audit trail (server)",
      "60s heartbeat monitoring",
      "5-min stale session cleanup",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    subtitle: "Unlimited seats, dedicated support",
    pricing: {
      monthly: { price: "Custom", period: "", note: "Starting at $30,000/yr", stripePlan: "" },
      annual: { price: "Custom", period: "", note: "Starting at $30,000/yr", stripePlan: "" },
    },
    popular: false,
    cta: "Contact Sales",
    features: [
      "Everything in Team",
      "Unlimited concurrent sessions",
      "SSO integration (SAML/OIDC)",
      "Compliance audit export",
      "Dedicated account manager",
      "Custom training & onboarding",
      "SLA & priority support",
      "Custom integrations",
    ],
  },
];

export function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingInterval>("annual");

  const handleCheckout = async (plan: typeof plans[0]) => {
    const tier = plan.pricing[billing];
    if (!tier.stripePlan) return; // Enterprise → contact
    setLoading(plan.name);
    try {
      const res = await stripeApi.createCheckoutSession({
        plan: tier.stripePlan,
        quantity: 1,
      });
      window.location.href = res.checkout_url;
    } catch {
      alert("Unable to start checkout. Please try again or contact support.");
      window.location.href = "/#contact";
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-[var(--navy)]" : "text-gray-400"}`}>
          Monthly
        </span>
        <button
          onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
          className="relative w-14 h-7 rounded-full bg-[var(--blue-dark)] transition-colors"
          aria-label="Toggle billing interval"
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
              billing === "annual" ? "translate-x-7" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billing === "annual" ? "text-[var(--navy)]" : "text-gray-400"}`}>
          Annual
        </span>
        {billing === "annual" && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            Save 17%
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan) => {
          const tier = plan.pricing[billing];
          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-white border-2 border-[var(--blue-dark)] shadow-xl scale-[1.02]"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--blue-dark)] text-white text-xs font-bold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[var(--navy)]">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--navy)]">{tier.price}</span>
                  <span className="text-gray-500 text-sm">{tier.period}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{tier.note}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className={f === "Desktop + Web access (one license)" ? "text-[var(--blue-dark)] font-semibold" : "text-gray-600"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.stripePlan ? (
                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.name}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? "bg-[var(--blue-dark)] text-white hover:bg-[#1D4ED8]"
                      : "bg-gray-100 text-[var(--navy)] hover:bg-gray-200"
                  } disabled:opacity-60`}
                >
                  {loading === plan.name ? "Redirecting..." : plan.cta}
                </button>
              ) : (
                <Link
                  href="/#contact"
                  className="block w-full text-center py-3 rounded-lg font-semibold transition-colors bg-gray-100 text-[var(--navy)] hover:bg-gray-200"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
