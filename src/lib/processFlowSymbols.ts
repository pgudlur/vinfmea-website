/**
 * ASME Y14.5 / ISO 5807 Process Flow Step Symbols
 */

export interface ProcessSymbol {
  key: string;
  name: string;
  symbol: string;
  color: string;
}

export const PROCESS_SYMBOLS: ProcessSymbol[] = [
  { key: "operation", name: "Operation", symbol: "\u25A0", color: "#3B82F6" },
  { key: "transport", name: "Transport", symbol: "\u25B6", color: "#F59E0B" },
  { key: "inspection", name: "Inspection", symbol: "\u25C7", color: "#22C55E" },
  { key: "delay", name: "Delay", symbol: "\u25D4", color: "#EF4444" },
  { key: "storage", name: "Storage", symbol: "\u25BD", color: "#8B5CF6" },
  { key: "decision", name: "Decision", symbol: "\u25C6", color: "#EC4899" },
  { key: "rework", name: "Rework / Repair", symbol: "\u21BA", color: "#F97316" },
];

export function getSymbolByKey(key: string): ProcessSymbol | undefined {
  return PROCESS_SYMBOLS.find((s) => s.key === key);
}
