"use client";

import { useState, useMemo } from "react";
import { usePeakStore } from "@/store/peakStore";
import PeakListItem from "./PeakListItem";
import type { SortKey } from "@/types";

export default function PeakSidebar() {
  const { peaks, isSidebarOpen, toggleSidebar, searchQuery, setSearchQuery, sortKey, setSortKey } =
    usePeakStore();

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const list = query
      ? peaks.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.country.toLowerCase().includes(query) ||
            p.continent.toLowerCase().includes(query) ||
            p.range.toLowerCase().includes(query)
        )
      : [...peaks];

    return list.sort((a, b) => {
      if (sortKey === "elevation") return b.elevation - a.elevation;
      if (sortKey === "name") return a.name.localeCompare(b.name, "fr");
      if (sortKey === "continent") return a.continent.localeCompare(b.continent, "fr");
      return 0;
    });
  }, [peaks, searchQuery, sortKey]);

  return (
    <>
      {/* Toggle button when closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 glass-panel p-2 hover:bg-slate-700/80 transition-all"
          title="Ouvrir la liste des sommets"
        >
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Sidebar panel */}
      <div
        className={`absolute left-4 top-4 bottom-4 z-20 w-72 glass-panel flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-[110%] opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-700/50">
          <div>
            <h1 className="text-base font-bold gradient-text">PeakAtlas 3D</h1>
            <p className="text-xs text-slate-500 mt-0.5">{peaks.length} sommets</p>
          </div>
          <button
            onClick={toggleSidebar}
            className="btn-ghost p-1.5"
            title="Fermer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-slate-700/50">
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un sommet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-600/40 rounded-lg pl-8 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex gap-1 px-3 py-2 border-b border-slate-700/50">
          {(["elevation", "name", "continent"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`flex-1 py-1 text-xs rounded transition-all ${
                sortKey === key
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/40"
              }`}
            >
              {key === "elevation" ? "Altitude" : key === "name" ? "Nom" : "Continent"}
            </button>
          ))}
        </div>

        {/* Peak list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-8">Aucun résultat</p>
          ) : (
            filtered.map((peak) => (
              <PeakListItem key={peak.id} peak={peak} />
            ))
          )}
        </div>

        {/* Footer elevation bar */}
        <div className="px-3 pb-3 pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-600 mb-1.5">Comparaison d'altitude</p>
          {filtered.slice(0, 5).map((peak) => {
            const maxElev = 8849;
            const pct = (peak.elevation / maxElev) * 100;
            return (
              <div key={peak.id} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 w-3">{peak.flagEmoji}</span>
                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 tabular-nums w-16 text-right">
                  {peak.elevation.toLocaleString("fr-FR")} m
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
