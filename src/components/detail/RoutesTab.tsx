"use client";

import { usePeakStore } from "@/store/peakStore";
import { DifficultyBadge } from "@/components/ui/Badge";
import { DIFFICULTY_CONFIG } from "@/lib/utils";

export default function RoutesTab() {
  const { selectedPeak } = usePeakStore();
  if (!selectedPeak) return null;

  return (
    <div className="space-y-3">
      {/* Routes count */}
      <div className="glass-card p-3 flex items-center justify-between">
        <span className="text-sm text-slate-400">Voies répertoriées</span>
        <span className="text-2xl font-bold gradient-text">{selectedPeak.routes.length}</span>
      </div>

      {/* Difficulty scale legend */}
      <div className="glass-card p-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Échelle de difficulté</div>
        <div className="grid grid-cols-3 gap-1">
          {(["F", "PD", "AD", "D", "TD", "ED"] as const).map((d) => {
            const cfg = DIFFICULTY_CONFIG[d];
            return (
              <div key={d} className="flex items-center gap-1.5">
                <DifficultyBadge difficulty={d} size="sm" />
                <span className="text-xs text-slate-500 truncate">{d === "F" ? "Facile" : d === "PD" ? "Peu Diff." : d === "AD" ? "Assez Diff." : d === "D" ? "Difficile" : d === "TD" ? "Très Diff." : "Extrême"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Routes list */}
      {selectedPeak.routes.map((route, idx) => (
        <div key={idx} className="glass-card p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-slate-100 text-sm">{route.name}</h3>
              </div>
            </div>
            <DifficultyBadge difficulty={route.difficulty} />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-3">{route.description}</p>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {route.coordinates?.length ?? 0} points GPS
            </div>
            <div className={`px-2 py-0.5 rounded text-xs ${DIFFICULTY_CONFIG[route.difficulty].bg} ${DIFFICULTY_CONFIG[route.difficulty].textColor}`}>
              {DIFFICULTY_CONFIG[route.difficulty].label}
            </div>
          </div>
        </div>
      ))}

      {/* Camps section */}
      {selectedPeak.camps.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 px-1">
            Camps / Refuges
          </div>
          <div className="space-y-2">
            {selectedPeak.camps.map((camp, idx) => (
              <div key={idx} className="glass-card p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17l9-14 9 14H3z" opacity="0.7" />
                    <path d="M3 17l9-14 9 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{camp.name}</div>
                  <div className="text-xs text-amber-400 font-mono">{camp.elevation.toLocaleString("fr-FR")} m</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
