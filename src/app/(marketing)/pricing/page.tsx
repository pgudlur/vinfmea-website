import { PricingCards } from "@/components/PricingCards";
import { TeamSlider } from "@/components/TeamSlider";
import { PricingFAQ } from "@/components/PricingFAQ";
import Link from "next/link";

export const metadata = {
  title: "Pricing - vinFMEA Pro",
  description:
    "Simple, transparent pricing for professional FMEA software. Individual, Team, and Enterprise plans with volume discounts.",
};

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-[var(--bg)] to-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-[var(--navy)] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required.
            Choose the plan that fits your team.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <PricingCards />
      </section>

      {/* Unified License Bridge */}
      <section className="py-16 bg-gradient-to-r from-[var(--navy)] to-[#1e3a5f] text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              One License. Desktop + Web.
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Your subscription works seamlessly across both the desktop application
              and the web interface. No separate purchases required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-[var(--blue-dark)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Desktop App</h3>
              <p className="text-gray-300 text-sm">
                Full-featured Windows application for engineers on the factory floor.
                Works online or offline with local SQLite backup.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-[var(--blue-dark)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Seamless Switching</h3>
              <p className="text-gray-300 text-sm">
                Start an FMEA on your desktop, review it from a browser.
                Same data, same project, same login &mdash; zero friction.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-[var(--blue-dark)] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Web Access</h3>
              <p className="text-gray-300 text-sm">
                Browser-based interface for managers and remote reviewers.
                No installation needed &mdash; just sign in from any device.
              </p>
            </div>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            All plans include both desktop and web access. Your team can mix and match however they prefer.
          </p>
        </div>
      </section>

      {/* Team Slider */}
      <section className="py-20 bg-[var(--bg)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--navy)] mb-3">
              Team Pricing &mdash; Adjust to Your Size
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Buy exactly the number of seats you need. Floating licenses &mdash;
              your team shares a pool of concurrent sessions.
            </p>
          </div>
          <TeamSlider />
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--navy)] text-center mb-12">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-[var(--navy)]">Professional</th>
                  <th className="text-center py-3 px-4 font-semibold text-[var(--blue-dark)]">Team</th>
                  <th className="text-center py-3 px-4 font-semibold text-[var(--navy)]">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Desktop + Web Access (One License)", true, true, true],
                  ["SFMEA / DFMEA / PFMEA / Control Plan", true, true, true],
                  ["ISO 26262 (ASIL, Safety Goals, FTTI)", true, true, true],
                  ["AIAG-VDA 7-Step Methodology", true, true, true],
                  ["Risk Matrix & Dashboard", true, true, true],
                  ["Report Builder (Excel & PDF)", true, true, true],
                  ["8-Language UI", true, true, true],
                  ["DRBFM / DVP&R / MSR Worksheets", true, true, true],
                  ["4-Level Traceability Chain", true, true, true],
                  ["Monthly Billing Option", true, false, false],
                  ["Concurrent Users", "1", "2\u201350", "Unlimited"],
                  ["Floating License Server", false, true, true],
                  ["Record Locking", false, true, true],
                  ["SHA-256 Audit Trail", "Local", "Server", "Server + Export"],
                  ["SSO Integration", false, false, true],
                  ["Dedicated Account Manager", false, false, true],
                  ["Custom Training", false, false, true],
                  ["SLA & Priority Support", false, false, true],
                ].map(([feature, pro, team, ent], i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{feature as string}</td>
                    {[pro, team, ent].map((val, j) => (
                      <td key={j} className="text-center py-3 px-4">
                        {val === true ? (
                          <span className="text-green-500 font-bold">{"\u2713"}</span>
                        ) : val === false ? (
                          <span className="text-gray-300">&mdash;</span>
                        ) : (
                          <span className="text-gray-700 font-medium">{val as string}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[var(--bg)]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--navy)] text-center mb-12">
            Frequently Asked Questions
          </h2>
          <PricingFAQ />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[var(--navy)] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-6">
            Start your 14-day free trial today. Full feature access, no credit card required.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center px-8 py-3.5 rounded-lg bg-[var(--blue-dark)] text-white font-semibold hover:bg-[#1D4ED8] transition-colors shadow-lg"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </>
  );
}
