"use client";

import { usePeakStore } from "@/store/peakStore";

export default function HistoryTab() {
  const { selectedPeak } = usePeakStore();
  if (!selectedPeak) return null;

  const { legendaryAscents, firstAscent } = selectedPeak;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">1ère ascension</div>
            <div className="text-xl font-bold gradient-text">{firstAscent.year}</div>
            <div className="text-sm text-slate-300 mt-0.5">
              {firstAscent.climbers.join(" & ")}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-3 px-1">
          Ascensions légendaires
        </div>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/40 via-slate-700/40 to-transparent" />

          <div className="space-y-2">
            {legendaryAscents.map((ascent, idx) => (
              <div key={idx} className="flex gap-3 group">
                {/* Node */}
                <div className="relative flex-shrink-0 mt-1">
                  <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/60 group-hover:border-cyan-500/40 transition-colors flex items-center justify-center z-10 relative">
                    <span className="text-xs font-bold text-cyan-400 tabular-nums">
                      {ascent.year}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="glass-card flex-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-200 leading-tight">
                        {ascent.climbers.join(", ")}
                      </div>
                      {ascent.note && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {ascent.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Years span */}
      {legendaryAscents.length > 1 && (
        <div className="glass-card p-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">Période couverte</span>
          <span className="text-sm font-mono text-slate-300">
            {legendaryAscents[0].year} — {legendaryAscents[legendaryAscents.length - 1].year}
          </span>
        </div>
      )}
    </div>
  );
}
