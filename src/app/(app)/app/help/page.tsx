"use client";

import { useState } from "react";
import { HelpCircle, BookOpen, ChevronRight } from "lucide-react";
import { HELP_TOPICS } from "@/lib/helpContent";

export default function HelpPage() {
  const [selectedKey, setSelectedKey] = useState(HELP_TOPICS[0]?.key ?? "overview");

  const selectedTopic = HELP_TOPICS.find((t) => t.key === selectedKey) ?? HELP_TOPICS[0];

  return (
    <div className="flex h-full">
      {/* Left sidebar — topic list */}
      <div className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Help Topics</h2>
          </div>
        </div>
        <nav className="p-2 space-y-0.5">
          {HELP_TOPICS.map((topic) => {
            const isActive = topic.key === selectedKey;
            return (
              <button
                key={topic.key}
                onClick={() => setSelectedKey(topic.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <BookOpen size={14} className={isActive ? "text-blue-500" : "text-gray-400"} />
                <span className="flex-1 truncate">{topic.title}</span>
                {isActive && <ChevronRight size={14} className="text-blue-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right content panel */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-8">
          {/* Topic title */}
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            {selectedTopic.title}
          </h1>

          {/* Sections */}
          <div className="space-y-6">
            {selectedTopic.sections.map((section, idx) => (
              <div key={idx}>
                {section.heading && (
                  <h3 className="mb-2 text-base font-semibold text-gray-800">
                    {section.heading}
                  </h3>
                )}
                <div className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
