"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { usePeakStore } from "@/store/peakStore";

interface AltitudeCompareProps {
  highlightId?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-2.5 py-1.5 text-xs">
      <p className="text-slate-300 font-semibold truncate max-w-32">{label}</p>
      <p className="text-cyan-400 font-mono font-bold">
        {payload[0].value.toLocaleString("fr-FR")} m
      </p>
    </div>
  );
};

export default function AltitudeCompare({ highlightId }: AltitudeCompareProps) {
  const { peaks, selectPeak } = usePeakStore();

  const data = [...peaks]
    .sort((a, b) => b.elevation - a.elevation)
    .map((p) => ({
      id: p.id,
      name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
      elevation: p.elevation,
      flagEmoji: p.flagEmoji,
    }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 0, bottom: 20, left: -20 }}
        onClick={(e) => {
          if (e?.activePayload?.[0]) {
            const id = (e.activePayload[0].payload as { id: string }).id;
            const peak = peaks.find((p) => p.id === id);
            if (peak) selectPeak(peak);
          }
        }}
      >
        <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: "#64748b" }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#64748b" }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b80" }} />
        <Bar dataKey="elevation" radius={[3, 3, 0, 0]} cursor="pointer">
          {data.map((entry) => (
            <Cell
              key={entry.id}
              fill={
                entry.id === highlightId
                  ? "#22d3ee"
                  : "#1e4e6e"
              }
              opacity={entry.id === highlightId ? 1 : 0.7}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
