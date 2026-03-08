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
                  ["SFMEA / DFMEA / PFMEA / Control Plan", true, true, true],
                  ["ISO 26262 (ASIL, Safety Goals, FTTI)", true, true, true],
                  ["AIAG-VDA 7-Step Methodology", true, true, true],
                  ["Risk Matrix & Dashboard", true, true, true],
                  ["Report Builder (Excel & PDF)", true, true, true],
                  ["8-Language UI", true, true, true],
                  ["DRBFM / DVP&R / MSR Worksheets", true, true, true],
                  ["4-Level Traceability Chain", true, true, true],
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
