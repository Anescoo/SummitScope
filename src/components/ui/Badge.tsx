"use client";

import { cn } from "@/lib/cn";
import { DIFFICULTY_CONFIG, CONTINENT_COLORS } from "@/lib/utils";
import type { Route } from "@/types";

interface DifficultyBadgeProps {
  difficulty: Route["difficulty"];
  size?: "sm" | "md";
}

export function DifficultyBadge({
  difficulty,
  size = "md",
}: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold rounded border",
        config.bg,
        config.color,
        config.textColor,
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      )}
    >
      {difficulty}
    </span>
  );
}

interface ContinentBadgeProps {
  continent: string;
  size?: "sm" | "md";
}

export function ContinentBadge({
  continent,
  size = "sm",
}: ContinentBadgeProps) {
  const colorClass =
    CONTINENT_COLORS[continent] ||
    "text-slate-400 bg-slate-400/15 border-slate-400/30";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border font-medium",
        colorClass,
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"
      )}
    >
      {continent}
    </span>
  );
}
