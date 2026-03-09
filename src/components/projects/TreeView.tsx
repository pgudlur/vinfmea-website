"use client";

import { useState } from "react";
import type { Assembly, Part } from "@/lib/types";
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Package,
  Plus,
} from "lucide-react";

interface TreeViewProps {
  assemblies: Assembly[];
  parts: Part[];
  selectedPartId: number | null;
  onSelectPart: (id: number) => void;
  onAddAssembly: () => void;
  onAddPart: (assemblyId: number) => void;
}

export default function TreeView({
  assemblies,
  parts,
  selectedPartId,
  onSelectPart,
  onAddAssembly,
  onAddPart,
}: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    // Expand all assemblies by default
    return new Set(assemblies.map((a) => a.id));
  });

  function toggleExpand(assemblyId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(assemblyId)) {
        next.delete(assemblyId);
      } else {
        next.add(assemblyId);
      }
      return next;
    });
  }

  function getPartsForAssembly(assemblyId: number): Part[] {
    return parts.filter((p) => p.assembly_id === assemblyId);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Project Structure
        </h3>
        <button
          onClick={onAddAssembly}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          <Plus size={14} />
          Add Assembly
        </button>
      </div>

      {/* Tree content */}
      <div className="p-2">
        {assemblies.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No assemblies yet. Add one to get started.
          </div>
        ) : (
          <div className="space-y-0.5">
            {assemblies.map((assembly) => {
              const isExpanded = expanded.has(assembly.id);
              const assemblyParts = getPartsForAssembly(assembly.id);

              return (
                <div key={assembly.id}>
                  {/* Assembly node */}
                  <div className="group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50">
                    <button
                      onClick={() => toggleExpand(assembly.id)}
                      className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    <Layers size={16} className="flex-shrink-0 text-blue-500" />
                    <span className="flex-1 truncate text-sm font-medium text-gray-800">
                      {assembly.name}
                    </span>
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      {assemblyParts.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddPart(assembly.id);
                      }}
                      className="rounded p-0.5 text-gray-300 opacity-0 transition-all hover:bg-blue-50 hover:text-blue-500 group-hover:opacity-100"
                      title="Add part"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Part children */}
                  {isExpanded && (
                    <div className="ml-6 space-y-0.5">
                      {assemblyParts.length === 0 ? (
                        <div className="py-1 pl-6 text-xs text-gray-300">
                          No parts
                        </div>
                      ) : (
                        assemblyParts.map((part) => {
                          const isSelected = selectedPartId === part.id;
                          return (
                            <button
                              key={part.id}
                              onClick={() => onSelectPart(part.id)}
                              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                                isSelected
                                  ? "bg-teal-50 text-teal-800"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <Package
                                size={14}
                                className={
                                  isSelected
                                    ? "flex-shrink-0 text-teal-500"
                                    : "flex-shrink-0 text-gray-400"
                                }
                              />
                              <span className="flex-1 truncate text-sm">
                                {part.name}
                              </span>
                              {part.part_number && (
                                <span className="text-xs text-gray-400">
                                  {part.part_number}
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
