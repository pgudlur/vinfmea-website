import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { ScreenshotShowcase } from "@/components/ScreenshotShowcase";
import { ProtectedScreenshot } from "@/components/ProtectedScreenshot";

const features = [
  {
    icon: "S",
    color: "bg-red-100 text-red-700",
    title: "System FMEA (SFMEA)",
    desc: "Top-level system analysis linking safety goals to design and process. Full 4-level traceability: SFMEA \u2192 DFMEA \u2192 PFMEA \u2192 Control Plan.",
  },
  {
    icon: "D",
    color: "bg-blue-100 text-blue-700",
    title: "Design FMEA (DFMEA)",
    desc: "Comprehensive design failure analysis with AIAG-VDA 7-step methodology, Action Priority ratings, and CTQ classification.",
  },
  {
    icon: "P",
    color: "bg-green-100 text-green-700",
    title: "Process FMEA (PFMEA)",
    desc: "Process-focused failure analysis with auto-creation from DFMEA, process flow integration, and special characteristics.",
  },
  {
    icon: "CP",
    color: "bg-purple-100 text-purple-700",
    title: "Control Plans",
    desc: "Automatic Control Plan generation from PFMEA entries with process steps, measurement methods, and reaction plans.",
  },
  {
    icon: "\u26A1",
    color: "bg-orange-100 text-orange-700",
    title: "ISO 26262 Safety",
    desc: "Built-in functional safety: ASIL ratings (A\u2013D), Safety Goals, Safety Mechanisms, FTTI, Safe State, Diagnostic Coverage.",
  },
  {
    icon: "\uD83C\uDF10",
    color: "bg-cyan-100 text-cyan-700",
    title: "8-Language UI",
    desc: "Multi-language interface: English, German, French, Spanish, Chinese, Japanese, Korean, and Portuguese.",
  },
  {
    icon: "\uD83D\uDCCA",
    color: "bg-emerald-100 text-emerald-700",
    title: "Risk Matrix & Dashboard",
    desc: "Interactive 10\u00D710 risk heatmap, KPI dashboard, Pareto charts, and criticality distribution at a glance.",
  },
  {
    icon: "\uD83D\uDD12",
    color: "bg-yellow-100 text-yellow-700",
    title: "Floating Licenses",
    desc: "Network mode with concurrent seat management, heartbeat monitoring, pessimistic record locking, and SHA-256 audit trail.",
  },
  {
    icon: "\uD83D\uDCC4",
    color: "bg-indigo-100 text-indigo-700",
    title: "Report Builder",
    desc: "Custom report generation with selectable sections, filters, Excel & PDF export. Includes DRBFM, DVP&R, MSR worksheets.",
  },
];

const standards = [
  { name: "AIAG & VDA", desc: "FMEA Handbook, 1st Edition (2019)", icon: "\u2714" },
  { name: "ISO 26262", desc: "Functional Safety for Road Vehicles", icon: "\u2714" },
  { name: "IATF 16949", desc: "Quality Management System", icon: "\u2714" },
  { name: "APQP", desc: "Advanced Product Quality Planning", icon: "\u2714" },
];

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--navy)] via-[var(--navy-mid)] to-[var(--navy-light)] text-white pt-28 pb-20 lg:pt-36 lg:pb-28">
        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sm mb-6 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                AIAG-VDA &amp; ISO 26262 Compliant
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                Professional{" "}
                <span className="text-[var(--teal)]">FMEA</span> &amp;{" "}
                <span className="text-[var(--teal)]">Control Plan</span>{" "}
                Suite
              </h1>

              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed max-w-xl">
                The complete failure mode analysis solution. From system-level
                safety goals to process control plans &mdash; with full
                traceability, risk visualization, and team collaboration.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-7 py-3.5 rounded-lg bg-[var(--blue-dark)] text-white font-semibold text-base hover:bg-[#1D4ED8] transition-all shadow-lg shadow-blue-500/25"
                >
                  Start 14-Day Free Trial
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex items-center px-7 py-3.5 rounded-lg border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all"
                >
                  Request a Demo
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Full feature access
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Offline &amp; Network modes
                </span>
              </div>
            </div>

            {/* App preview — real screenshot */}
            <div className="hidden lg:block">
              <ProtectedScreenshot
                src="/screenshots/pfmea.png"
                alt="vinFMEA Pro PFMEA spreadsheet view"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 lg:py-28 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--navy)] mb-4">
              Everything You Need for World-Class FMEA
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From system-level safety analysis to shop-floor control plans.
              One integrated platform, fully traceable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[var(--blue)]/30 hover:shadow-lg transition-all group"
              >
                <div
                  className={`w-11 h-11 rounded-lg ${f.color} flex items-center justify-center font-bold text-sm mb-4`}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)] mb-2 group-hover:text-[var(--blue-dark)] transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SCREENSHOT SHOWCASE ===== */}
      <ScreenshotShowcase />

      {/* ===== TRACEABILITY ===== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--navy)] mb-4">
              Full 4-Level Traceability
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Every failure mode is traced from system safety goals down to shop-floor controls. Nothing falls through the cracks.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {[
              { id: "S-001", type: "SFMEA", label: "System Safety", color: "bg-red-500" },
              { id: "D-001", type: "DFMEA", label: "Design Analysis", color: "bg-blue-500" },
              { id: "P-001", type: "PFMEA", label: "Process Analysis", color: "bg-green-500" },
              { id: "CP-001", type: "Control Plan", label: "Shop Floor Control", color: "bg-purple-500" },
            ].map((step, i) => (
              <div key={step.type} className="flex items-center">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5 text-center min-w-[160px] hover:border-[var(--blue)] hover:shadow-md transition-all">
                  <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold mb-2 ${step.color}`}>
                    {step.id}
                  </div>
                  <div className="font-bold text-[var(--navy)]">{step.type}</div>
                  <div className="text-xs text-gray-400 mt-1">{step.label}</div>
                </div>
                {i < 3 && (
                  <div className="hidden md:flex items-center px-2">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STANDARDS ===== */}
      <section id="standards" className="py-20 lg:py-28 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--navy)] mb-4">
              Built on Industry Standards
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {standards.map((s) => (
              <div key={s.name} className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:shadow-md transition-all">
                <div className="text-2xl text-[var(--teal)] mb-3">{s.icon}</div>
                <div className="font-bold text-[var(--navy)] text-lg">{s.name}</div>
                <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-gradient-to-r from-[var(--blue-dark)] to-[#7C3AED] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your FMEA Process?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join quality engineers worldwide using vinFMEA Pro for safer, more reliable products.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-[var(--blue-dark)] font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              View Pricing
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center px-8 py-4 rounded-lg border-2 border-white/40 text-white font-bold hover:bg-white/10 transition-colors"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--navy)] mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-500">
              Request a demo, ask about pricing, or learn how vinFMEA Pro can improve your quality process.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
