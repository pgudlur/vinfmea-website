"use client";

import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function ProtectedScreenshot({
  src,
  alt,
  width = 1200,
  height = 700,
  priority = false,
}: Props) {
  return (
    <div
      className="screenshot-wrapper relative rounded-xl overflow-hidden shadow-2xl border border-white/10"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-[#1e293b] px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-gray-400 ml-2">vinFMEA Pro v4.0.0</span>
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="protected-image w-full h-auto"
        quality={85}
        priority={priority}
        draggable={false}
      />
    </div>
  );
}
