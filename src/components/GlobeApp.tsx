"use client";

import { usePeakStore } from "@/store/peakStore";
import GlobeViewer from "@/components/globe/GlobeViewer";
import PeakSidebar from "@/components/sidebar/PeakSidebar";
import PeakDetail from "@/components/detail/PeakDetail";

export default function GlobeApp() {
  const { selectedPeak, selectPeak } = usePeakStore();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Full-screen globe */}
      <div className="absolute inset-0">
        <GlobeViewer />
      </div>

      {/* Left sidebar: peak list */}
      <PeakSidebar />

      {/* Right panel: peak detail */}
      {selectedPeak && <PeakDetail />}

      {/* Top center header hint (when nothing selected) */}
      {!selectedPeak && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in">
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
            <span className="text-sm text-slate-300">
              Cliquez sur un sommet pour l'explorer
            </span>
          </div>
        </div>
      )}

      {/* Close detail button */}
      {selectedPeak && (
        <button
          onClick={() => selectPeak(null)}
          className="absolute right-[336px] top-4 z-30 glass-card p-1.5 hover:bg-slate-600/60 transition-all"
          title="Fermer"
        >
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Coordinates display bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="glass-panel px-3 py-1.5 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            PeakAtlas 3D
          </span>
          <span>7 sommets · 4 continents</span>
          <span className="text-slate-600">CesiumJS · Next.js</span>
        </div>
      </div>
    </div>
  );
}
