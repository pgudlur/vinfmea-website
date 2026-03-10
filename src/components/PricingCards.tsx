"use client";

import { useState } from "react";
import Link from "next/link";
import { stripeApi } from "@/lib/api";

const plans = [
  {
    name: "Professional",
    subtitle: "For individual engineers",
    price: "$1,999",
    period: "/year",
    monthly: "or $199/mo billed monthly",
    popular: false,
    cta: "Start Free Trial",
    stripePlan: "professional_annual",
    features: [
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
    price: "$1,799",
    period: "/seat/year",
    monthly: "Volume discounts up to 33% off",
    popular: true,
    cta: "Start Free Trial",
    stripePlan: "team_annual",
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
    price: "Custom",
    period: "",
    monthly: "Starting at $30,000/yr",
    popular: false,
    cta: "Contact Sales",
    stripePlan: "",
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

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (!plan.stripePlan) return; // Enterprise → contact
    setLoading(plan.name);
    try {
      const res = await stripeApi.createCheckoutSession({
        plan: plan.stripePlan,
        quantity: plan.name === "Team" ? 5 : 1,
      });
      window.location.href = res.checkout_url;
    } catch {
      // Fallback to contact form if Stripe isn't configured yet
      window.location.href = "/#contact";
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan) => (
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
                <span className="text-4xl font-bold text-[var(--navy)]">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{plan.monthly}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{f}</span>
                </li>
              ))}
            </ul>

            {plan.stripePlan ? (
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
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors bg-gray-100 text-[var(--navy)] hover:bg-gray-200`}
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
