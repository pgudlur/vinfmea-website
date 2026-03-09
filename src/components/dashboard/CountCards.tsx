"use client";

import { FolderOpen, Package } from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";

interface CountCardsProps {
  counts: {
    projects: number;
    assemblies: number;
    parts: number;
    sfmea: number;
    dfmea: number;
    pfmea: number;
    control_plan: number;
  };
}

function FmeaIcon({ letter, bg }: { letter: string; bg: string }) {
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white ${bg}`}
    >
      {letter}
    </span>
  );
}

export default function CountCards({ counts }: CountCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        label="Projects"
        value={counts.projects}
        icon={<FolderOpen size={22} />}
        color="border-slate-400"
      />
      <KpiCard
        label="Parts"
        value={counts.parts}
        icon={<Package size={22} />}
        color="border-gray-400"
      />
      <KpiCard
        label="SFMEA"
        value={counts.sfmea}
        icon={<FmeaIcon letter="S" bg="bg-red-500" />}
        color="border-red-500"
      />
      <KpiCard
        label="DFMEA"
        value={counts.dfmea}
        icon={<FmeaIcon letter="D" bg="bg-blue-500" />}
        color="border-blue-500"
      />
      <KpiCard
        label="PFMEA"
        value={counts.pfmea}
        icon={<FmeaIcon letter="P" bg="bg-green-500" />}
        color="border-green-500"
      />
      <KpiCard
        label="Control Plans"
        value={counts.control_plan}
        icon={<FmeaIcon letter="CP" bg="bg-purple-500" />}
        color="border-purple-500"
      />
    </div>
  );
}
