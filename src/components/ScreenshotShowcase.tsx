"use client";

import { useState } from "react";
import Image from "next/image";

const tabs = [
  {
    id: "pfmea",
    label: "PFMEA",
    src: "/screenshots/pfmea.png",
    alt: "vinFMEA Pro — Process FMEA spreadsheet view with S/O/D ratings, RPN calculations, and action tracking",
  },
  {
    id: "control-plan",
    label: "Control Plan",
    src: "/screenshots/control-plan.png",
    alt: "vinFMEA Pro — Control Plan auto-generated from PFMEA with process steps, measurements, and reaction plans",
  },
  {
    id: "risk-matrix",
    label: "Risk Matrix",
    src: "/screenshots/risk-matrix.png",
    alt: "vinFMEA Pro — Interactive 10x10 risk heatmap with initial and revised risk comparison",
  },
];

export function ScreenshotShowcase() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--navy)] mb-4">
            See It in Action
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Professional FMEA worksheets, auto-generated control plans, and
            interactive risk visualization — all in one application.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                active === i
                  ? "bg-[var(--blue-dark)] text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Screenshot display */}
        <div
          className="screenshot-wrapper rounded-xl overflow-hidden shadow-2xl border border-gray-200 max-w-6xl mx-auto"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Browser chrome */}
          <div className="bg-[#1e293b] px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-400 ml-2">
              vinFMEA Pro v4.0.0 — {tabs[active].label}
            </span>
          </div>

          {/* Screenshot image */}
          <div className="relative bg-gray-50">
            <Image
              src={tabs[active].src}
              alt={tabs[active].alt}
              width={1920}
              height={1080}
              className="protected-image w-full h-auto"
              quality={85}
              priority={active === 0}
              draggable={false}
            />
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-sm text-gray-400 mt-4">
          {tabs[active].alt.split(" — ")[1]}
        </p>
      </div>
    </section>
  );
}
