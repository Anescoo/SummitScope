"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { usePeakStore } from "@/store/peakStore";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-3 py-2 text-xs">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="leading-5">
          {entry.name}: <span className="font-mono font-bold">{entry.value}</span>
          {entry.name === "Temp. (°C)" ? "°C" : entry.name === "Vent (km/h)" ? " km/h" : " mm"}
        </p>
      ))}
    </div>
  );
};

export default function WeatherTab() {
  const { selectedPeak } = usePeakStore();
  if (!selectedPeak) return null;

  const { weather } = selectedPeak;

  const minTemp = Math.min(...weather.map((w) => w.avgTemp));
  const maxTemp = Math.max(...weather.map((w) => w.avgTemp));
  const maxWind = Math.max(...weather.map((w) => w.windKmh));
  const bestMonth = weather.reduce(
    (best, curr) =>
      curr.avgTemp > best.avgTemp ? curr : best,
    weather[0]
  );

  return (
    <div className="space-y-4">
      {/* Weather stats summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">Temp. min.</div>
          <div className="text-lg font-bold text-blue-400 tabular-nums">{minTemp}°</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">Temp. max.</div>
          <div className="text-lg font-bold text-amber-400 tabular-nums">{maxTemp}°</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">Vent max.</div>
          <div className="text-lg font-bold text-cyan-400 tabular-nums">{maxWind}</div>
          <div className="text-xs text-slate-600">km/h</div>
        </div>
      </div>

      {/* Meilleur mois */}
      <div className="glass-card p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <div className="text-xs text-slate-500">Meilleur mois pour l'ascension</div>
          <div className="text-sm font-bold text-cyan-300">{bestMonth.month}</div>
          <div className="text-xs text-slate-400">{bestMonth.avgTemp}°C · {bestMonth.windKmh} km/h</div>
        </div>
      </div>

      {/* Temperature chart */}
      <div className="glass-card p-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">
          Température moyenne au sommet (°C)
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={weather} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="avgTemp"
              name="Temp. (°C)"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={{ r: 3, fill: "#22d3ee" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wind & precipitation chart */}
      <div className="glass-card p-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">
          Vent (km/h) et précipitations (mm)
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={weather} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "10px", color: "#64748b" }} />
            <Line
              type="monotone"
              dataKey="windKmh"
              name="Vent (km/h)"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="precipMm"
              name="Précip. (mm)"
              stroke="#818cf8"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-600 text-center">
        * Données météorologiques simulées à titre indicatif
      </p>
    </div>
  );
}
