"use client";

import { usePeakStore } from "@/store/peakStore";
import { ContinentBadge } from "@/components/ui/Badge";
import { formatElevation } from "@/lib/utils";
import { cn } from "@/lib/cn";
import type { Peak } from "@/types";

interface PeakListItemProps {
  peak: Peak;
}

export default function PeakListItem({ peak }: PeakListItemProps) {
  const { selectedPeak, selectPeak } = usePeakStore();
  const isSelected = selectedPeak?.id === peak.id;

  return (
    <button
      onClick={() => selectPeak(isSelected ? null : peak)}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group",
        isSelected
          ? "bg-cyan-500/15 border border-cyan-500/30"
          : "hover:bg-slate-700/50 border border-transparent hover:border-slate-600/40"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl flex-shrink-0">{peak.flagEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span
              className={cn(
                "font-semibold text-sm truncate",
                isSelected ? "text-cyan-300" : "text-slate-200 group-hover:text-white"
              )}
            >
              {peak.name}
            </span>
            <span
              className={cn(
                "font-mono text-xs flex-shrink-0 tabular-nums",
                isSelected ? "text-cyan-400" : "text-slate-400"
              )}
            >
              {peak.elevation.toLocaleString("fr-FR")} m
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <ContinentBadge continent={peak.continent} />
            <span className="text-xs text-slate-500 truncate">{peak.range}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
