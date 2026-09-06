import React from "react";
import type { PriorityTier } from "@/lib/mock-api/types";

interface PriorityBadgeProps {
  tier: PriorityTier;
  score: number;
  recommendedAction?: string;
  compact?: boolean;
}

const TIER_STYLES: Record<PriorityTier, { badge: string; dot: string; label: string }> = {
  HIGH: {
    badge: "border-rose-500/50 bg-rose-500/15 text-rose-400",
    dot: "bg-rose-500 animate-pulse",
    label: "HIGH PRIORITY",
  },
  MEDIUM: {
    badge: "border-amber-500/50 bg-amber-500/15 text-amber-400",
    dot: "bg-amber-400",
    label: "MEDIUM PRIORITY",
  },
  LOW: {
    badge: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
    dot: "bg-emerald-400",
    label: "LOW PRIORITY",
  },
};

export default function PriorityBadge({ tier, score, recommendedAction, compact }: PriorityBadgeProps) {
  const s = TIER_STYLES[tier];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.badge}`}>
        <span className={`size-1.5 rounded-full ${s.dot}`} />
        {s.label} · {score}
      </span>
    );
  }

  return (
    <div className={`rounded-xl border p-3 ${s.badge}`}>
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${s.dot}`} />
        <span className="font-mono text-xs font-black tracking-widest">{s.label}</span>
        <span className="ml-auto font-mono text-lg font-black">{score}<span className="text-xs opacity-60">/100</span></span>
      </div>
      {recommendedAction && (
        <p className="mt-1.5 text-[11px] opacity-80 leading-snug">{recommendedAction}</p>
      )}
    </div>
  );
}
