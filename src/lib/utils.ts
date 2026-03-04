import type { Route } from "@/types";

export function formatElevation(meters: number): string {
  return meters.toLocaleString("fr-FR") + " m";
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export const DIFFICULTY_CONFIG: Record<
  Route["difficulty"],
  { label: string; color: string; bg: string; textColor: string }
> = {
  F: {
    label: "F — Facile",
    color: "border-emerald-500",
    bg: "bg-emerald-500/20",
    textColor: "text-emerald-400",
  },
  PD: {
    label: "PD — Peu Difficile",
    color: "border-lime-500",
    bg: "bg-lime-500/20",
    textColor: "text-lime-400",
  },
  AD: {
    label: "AD — Assez Difficile",
    color: "border-yellow-500",
    bg: "bg-yellow-500/20",
    textColor: "text-yellow-400",
  },
  D: {
    label: "D — Difficile",
    color: "border-orange-500",
    bg: "bg-orange-500/20",
    textColor: "text-orange-400",
  },
  TD: {
    label: "TD — Très Difficile",
    color: "border-red-500",
    bg: "bg-red-500/20",
    textColor: "text-red-400",
  },
  ED: {
    label: "ED — Extrêmement Difficile",
    color: "border-rose-400",
    bg: "bg-rose-400/20",
    textColor: "text-rose-300",
  },
};

export const CONTINENT_COLORS: Record<string, string> = {
  Europe: "text-blue-400 bg-blue-400/15 border-blue-400/30",
  Asie: "text-amber-400 bg-amber-400/15 border-amber-400/30",
  Afrique: "text-emerald-400 bg-emerald-400/15 border-emerald-400/30",
  "Amérique du Nord": "text-purple-400 bg-purple-400/15 border-purple-400/30",
  "Amérique du Sud": "text-rose-400 bg-rose-400/15 border-rose-400/30",
};
