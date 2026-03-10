"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is a floating license?",
    a: "A floating license means your team shares a pool of concurrent seats. If you have 5 seats, any 5 team members can use the software simultaneously. When someone closes the app, that seat becomes available for another user. This is more cost-effective than individual licenses.",
  },
  {
    q: "Can I try before I buy?",
    a: "Yes! Every plan comes with a 14-day free trial with full feature access. No credit card required. At the end of your trial, you can choose to subscribe or your data remains accessible in offline mode.",
  },
  {
    q: "What standards does vinFMEA Pro support?",
    a: "vinFMEA Pro is fully compliant with the AIAG & VDA FMEA Handbook (1st Edition, 2019), ISO 26262 Functional Safety, IATF 16949, and APQP requirements. It includes all 7 steps of the AIAG-VDA methodology.",
  },
  {
    q: "Can I use my license on both desktop and web?",
    a: "Yes! Every vinFMEA Pro subscription includes access to both the desktop application and the web interface with a single license. An engineer can create an FMEA on the desktop app at their workstation and a manager can review it from a browser — same data, same project, same login. No separate purchase required.",
  },
  {
    q: "Is there a monthly billing option?",
    a: "Yes, the Professional plan is available at $199/month billed monthly, or $1,999/year billed annually (saving 17%). Team and Enterprise plans are billed annually. You can switch between billing intervals at any time from your account settings.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. The desktop application can work offline using a local SQLite database. However, offline data stays on your local machine and does not sync to the web version or other team members. For synchronized access across desktop and web, sign in to your server.",
  },
  {
    q: "What FMEA types are supported?",
    a: "vinFMEA Pro supports System FMEA (SFMEA), Design FMEA (DFMEA), Process FMEA (PFMEA), and Control Plans with full 4-level traceability. It also includes DRBFM, DVP&R, FMEA-MSR, Boundary Diagrams, and Function Analysis.",
  },
  {
    q: "How does the ISO 26262 integration work?",
    a: "Each FMEA entry can include ASIL ratings (A through D), Safety Goals, Safety Mechanisms, Fault Tolerant Time Interval (FTTI), Safe State definitions, and Diagnostic Coverage levels. The Report Builder can generate ISO 26262 Safety Summary reports.",
  },
  {
    q: "Can I switch from Professional to Team later?",
    a: "Absolutely. You can upgrade at any time. Your existing data, projects, and configurations are fully preserved. Our team will help you set up the license server for your team.",
  },
  {
    q: "What support is included?",
    a: "Professional plans include email support. Team plans include priority email support. Enterprise plans include a dedicated account manager, custom training, onboarding, and SLA-backed support.",
  },
];

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-semibold text-[var(--navy)] text-sm pr-4">
              {faq.q}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                openIndex === i ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
