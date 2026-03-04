"use client";

import { usePeakStore } from "@/store/peakStore";
import { formatElevation, formatCoordinates } from "@/lib/utils";
import { ContinentBadge } from "@/components/ui/Badge";
import AltitudeCompare from "@/components/charts/AltitudeCompare";

export default function InfoTab() {
  const { selectedPeak } = usePeakStore();
  if (!selectedPeak) return null;

  return (
    <div className="space-y-4">
      {/* Hero elevation display */}
      <div className="glass-card p-4 text-center">
        <div className="text-5xl font-bold gradient-text tabular-nums">
          {selectedPeak.elevation.toLocaleString("fr-FR")}
          <span className="text-2xl ml-1 text-slate-400"> m</span>
        </div>
        <div className="text-sm text-slate-400 mt-1">Altitude au-dessus du niveau de la mer</div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Pays</div>
          <div className="text-sm text-slate-200 font-medium">{selectedPeak.country}</div>
        </div>
        <div className="glass-card p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Continent</div>
          <ContinentBadge continent={selectedPeak.continent} size="md" />
        </div>
        <div className="glass-card p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Massif</div>
          <div className="text-sm text-slate-200 font-medium">{selectedPeak.range}</div>
        </div>
        <div className="glass-card p-3">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">1ère ascension</div>
          <div className="text-sm text-cyan-400 font-bold">{selectedPeak.firstAscent.year}</div>
        </div>
      </div>

      {/* Coordinates */}
      <div className="glass-card p-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Coordonnées GPS</div>
        <div className="font-mono text-sm text-slate-300">
          {formatCoordinates(selectedPeak.location.lat, selectedPeak.location.lng)}
        </div>
      </div>

      {/* First ascent detail */}
      <div className="glass-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wide">Première ascension</div>
        </div>
        <div className="text-sm font-bold text-cyan-300">{selectedPeak.firstAscent.year}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {selectedPeak.firstAscent.climbers.join(", ")}
        </div>
      </div>

      {/* Description */}
      <div className="glass-card p-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">À propos</div>
        <p className="text-sm text-slate-300 leading-relaxed">{selectedPeak.description}</p>
      </div>

      {/* Altitude comparison mini chart */}
      <div className="glass-card p-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">
          Comparaison — tous les sommets
        </div>
        <AltitudeCompare highlightId={selectedPeak.id} />
      </div>
    </div>
  );
}
