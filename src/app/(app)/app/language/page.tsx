"use client";

import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { LOCALES, getLocale, setLocale, type Locale } from "@/lib/i18n";
import { useUI } from "@/stores/useUI";

export default function LanguagePage() {
  const addToast = useUI((s) => s.addToast);
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  useEffect(() => {
    setCurrentLocale(getLocale());
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setCurrentLocale(code);
    addToast({
      type: "success",
      message: `Language changed to ${LOCALES.find((l) => l.code === code)?.nativeName}`,
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Globe size={22} className="text-gray-500" />
        <h1 className="text-xl font-bold text-gray-900">Language Settings</h1>
      </div>

      <p className="text-sm text-gray-600">
        Select your preferred language. UI labels and navigation text will be displayed in the selected language.
      </p>

      {/* Language grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LOCALES.map((locale) => {
          const isActive = locale.code === currentLocale;
          return (
            <button
              key={locale.code}
              onClick={() => handleSelect(locale.code)}
              className={`relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? "border-blue-300 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-3xl">{locale.flag}</span>
              <div>
                <p className={`text-sm font-semibold ${isActive ? "text-blue-900" : "text-gray-800"}`}>
                  {locale.nativeName}
                </p>
                <p className="text-xs text-gray-500">{locale.name}</p>
              </div>
              {isActive && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Note */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Note</p>
        <p>
          Language preference is saved to your browser. FMEA data (failure modes, effects, causes) remains in the language
          in which it was originally entered. Only UI labels, navigation, and system text are translated.
        </p>
      </div>
    </div>
  );
}
