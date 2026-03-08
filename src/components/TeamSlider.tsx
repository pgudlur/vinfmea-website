"use client";

import { useState } from "react";

// Volume discount tiers
function getPricePerSeat(seats: number): number {
  if (seats >= 50) return 949;
  if (seats >= 25) return 999;
  if (seats >= 15) return 1049;
  if (seats >= 10) return 1099;
  return 1199; // 2-9 seats
}

function getDiscount(seats: number): number {
  const base = 1199;
  const actual = getPricePerSeat(seats);
  return Math.round(((base - actual) / base) * 100);
}

const presets = [3, 5, 7, 10, 15, 25];

export function TeamSlider() {
  const [seats, setSeats] = useState(5);
  const [showModal, setShowModal] = useState(false);

  const perSeat = getPricePerSeat(seats);
  const total = perSeat * seats;
  const discount = getDiscount(seats);

  return (
    <>
      {/* Preset cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
        {presets.map((n) => {
          const ps = getPricePerSeat(n);
          const t = ps * n;
          const d = getDiscount(n);
          return (
            <button
              key={n}
              onClick={() => setSeats(n)}
              className={`rounded-xl p-4 text-center transition-all border-2 ${
                seats === n
                  ? "border-[var(--blue-dark)] bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl font-bold text-[var(--navy)]">{n}</div>
              <div className="text-xs text-gray-500">seats</div>
              <div className="text-sm font-bold text-[var(--navy)] mt-2">
                ${t.toLocaleString()}/yr
              </div>
              {d > 0 ? (
                <div className="text-xs text-green-600 font-semibold">${ps}/seat</div>
              ) : (
                <div className="text-xs text-gray-400">${ps}/seat</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom slider CTA */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-3">
          Click a preset above or choose a custom seat count below.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--blue-dark)] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Choose Custom Seat Count
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              {"\u2715"}
            </button>

            <h3 className="text-xl font-bold text-[var(--navy)] mb-1">Team License</h3>
            <p className="text-sm text-gray-500 mb-6">Number of Seats</p>

            {/* +/- controls */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSeats(Math.max(2, seats - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={seats}
                min={2}
                max={50}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 2;
                  setSeats(Math.max(2, Math.min(50, v)));
                }}
                className="w-20 h-10 text-center text-2xl font-bold border border-gray-300 rounded-lg outline-none focus:border-[var(--blue-dark)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setSeats(Math.min(50, seats + 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <input
                type="range"
                min={2}
                max={50}
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--blue-dark)]"
                style={{
                  background: `linear-gradient(to right, var(--blue-dark) 0%, var(--blue-dark) ${((seats - 2) / 48) * 100}%, #e5e7eb ${((seats - 2) / 48) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>2 seats</span>
                <span>50 seats</span>
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Per seat</span>
                <span className="font-semibold text-[var(--navy)]">
                  ${perSeat.toLocaleString()}/yr
                  {discount > 0 && (
                    <span className="ml-2 text-xs text-green-600 font-bold">
                      {discount}% off
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-gray-200">
                <span className="text-gray-500">Total ({seats} seats)</span>
                <span className="text-2xl font-bold text-[var(--navy)]">
                  ${total.toLocaleString()}/yr
                </span>
              </div>
            </div>

            {/* Purchase button */}
            <button className="w-full py-3.5 rounded-xl bg-[var(--blue-dark)] text-white font-bold hover:bg-[#1D4ED8] transition-colors shadow-md">
              Purchase {seats} Seats &mdash; ${total.toLocaleString()}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              1-year license. Floating seats (shared pool). Secure payment via Stripe.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
