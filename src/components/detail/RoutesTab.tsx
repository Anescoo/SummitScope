"use client";

import { usePeakStore } from "@/store/peakStore";
import { DifficultyBadge } from "@/components/ui/Badge";
import { DIFFICULTY_CONFIG } from "@/lib/utils";

// Must match routeColors in GlobeViewer
const ROUTE_COLORS = ["#22d3ee", "#f59e0b", "#f87171"];

export default function RoutesTab() {
  const {
    selectedPeak,
    visibleRouteIndices,
    toggleRoute,
    setAllRoutesVisible,
    clearAllRoutes,
    requestCampFly,
  } = usePeakStore();

  if (!selectedPeak) return null;

  const allVisible = selectedPeak.routes.every((_, i) => visibleRouteIndices.includes(i));

  return (
    <div className="space-y-3">
      {/* Header row: count + select all/none */}
      <div className="glass-card p-3 flex items-center justify-between">
        <span className="text-sm text-slate-400">Voies répertoriées</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">{selectedPeak.routes.length}</span>
          <button
            onClick={() =>
              allVisible
                ? clearAllRoutes()
                : setAllRoutesVisible(selectedPeak.routes.length)
            }
            className="text-xs px-2 py-1 rounded border border-slate-600/50 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
          >
            {allVisible ? "Tout masquer" : "Tout afficher"}
          </button>
        </div>
      </div>

      {/* Difficulty scale legend */}
      <div className="glass-card p-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Échelle de difficulté</div>
        <div className="grid grid-cols-3 gap-1">
          {(["F", "PD", "AD", "D", "TD", "ED"] as const).map((d) => (
            <div key={d} className="flex items-center gap-1.5">
              <DifficultyBadge difficulty={d} size="sm" />
              <span className="text-xs text-slate-500 truncate">
                {d === "F" ? "Facile" : d === "PD" ? "Peu Diff." : d === "AD" ? "Assez Diff." : d === "D" ? "Difficile" : d === "TD" ? "Très Diff." : "Extrême"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Routes list */}
      {selectedPeak.routes.map((route, idx) => {
        const isVisible = visibleRouteIndices.includes(idx);
        const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
        return (
          <div
            key={idx}
            className={`glass-card p-4 transition-all duration-200 ${isVisible ? "opacity-100" : "opacity-40"}`}
            style={isVisible ? { borderLeft: `3px solid ${color}` } : { borderLeft: "3px solid transparent" }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${color}22`, border: `1px solid ${color}66`, color }}
                >
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-slate-100 text-sm truncate">{route.name}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <DifficultyBadge difficulty={route.difficulty} />
                <button
                  onClick={() => toggleRoute(idx)}
                  title={isVisible ? "Masquer sur la carte" : "Afficher sur la carte"}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-700/60 transition-all"
                >
                  {isVisible ? (
                    <svg className="w-4 h-4" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
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
        );
      })}

      {/* Camps / Refuges — clickable to fly camera */}
      {selectedPeak.camps.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 px-1">
            Camps / Refuges
          </div>
          <div className="space-y-2">
            {selectedPeak.camps.map((camp, idx) => (
              <button
                key={idx}
                onClick={() => requestCampFly(camp)}
                className="w-full glass-card p-3 flex items-center gap-3 hover:bg-slate-700/40 hover:border-amber-500/30 transition-all text-left group"
                title="Centrer la carte sur ce camp"
              >
                <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17l9-14 9 14H3z" opacity="0.7" />
                    <path d="M3 17l9-14 9 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{camp.name}</div>
                  <div className="text-xs text-amber-400 font-mono">{camp.elevation.toLocaleString("fr-FR")} m</div>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
