"use client";

import { usePeakStore } from "@/store/peakStore";
import { cn } from "@/lib/cn";
import type { TabKey } from "@/types";
import InfoTab from "./InfoTab";
import RoutesTab from "./RoutesTab";
import WeatherTab from "./WeatherTab";
import HistoryTab from "./HistoryTab";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "info",
    label: "Infos",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "routes",
    label: "Routes",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    key: "weather",
    label: "Météo",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    key: "history",
    label: "Histoire",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function PeakDetail() {
  const { selectedPeak, activeTab, setActiveTab } = usePeakStore();

  if (!selectedPeak) return null;

  return (
    <div className="absolute right-4 top-4 bottom-4 z-20 w-80 glass-panel flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{selectedPeak.flagEmoji}</span>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-100 leading-tight truncate">
              {selectedPeak.name}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {selectedPeak.range} · {selectedPeak.country}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200",
              activeTab === tab.key
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-slate-500 hover:text-slate-300 border-b-2 border-transparent"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activeTab === "info" && <InfoTab />}
        {activeTab === "routes" && <RoutesTab />}
        {activeTab === "weather" && <WeatherTab />}
        {activeTab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}
