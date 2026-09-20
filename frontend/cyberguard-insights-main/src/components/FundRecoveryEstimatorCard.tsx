// ─── Fund Recovery Likelihood Estimator Component ───────────────────────────
// Illustrative fund recovery estimator based on industry-cited time decay curves.
// NOTE: Illustrative estimate based on general fraud response research, not a trained prediction — for demonstration purposes.

import React, { useState } from "react";
import { TrendingUp, Clock, Info, ShieldAlert, AlertCircle } from "lucide-react";
import type { Prediction } from "@/lib/hotspots";

export type RecoveryTier = "high" | "medium" | "low";

export type RecoveryEstimate = {
  tier: RecoveryTier;
  label: string;
  percentageMin: number;
  percentageMax: number;
  colorClass: string;
  badgeBg: string;
  advice: string;
};

/**
 * Illustrative decay formula: fund recovery likelihood decreases over time.
 * 0–2h: Golden Hour (82% - 94%)
 * 2–6h: Action Window (60% - 81%)
 * 6–24h: Moderate Decay (35% - 59%)
 * 24h+: Low Likelihood (8% - 34%)
 */
export function estimateFundRecovery(
  elapsedHours: number,
  minWindow: number = 2,
  maxWindow: number = 6,
): RecoveryEstimate {
  if (elapsedHours <= 2) {
    return {
      tier: "high",
      label: "High Recovery Likelihood",
      percentageMin: 82,
      percentageMax: 94,
      colorClass: "text-emerald-400",
      badgeBg: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400",
      advice: `Faster intervention significantly increases recovery likelihood — acting within the estimated ${minWindow}–${maxWindow} hour window is critical.`,
    };
  } else if (elapsedHours <= 6) {
    return {
      tier: "high",
      label: "Optimal Interdiction Window",
      percentageMin: 60,
      percentageMax: 81,
      colorClass: "text-cyan-400",
      badgeBg: "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400",
      advice: `Faster intervention significantly increases recovery likelihood — acting within the estimated ${minWindow}–${maxWindow} hour window is critical.`,
    };
  } else if (elapsedHours <= 24) {
    return {
      tier: "medium",
      label: "Medium Recovery Likelihood",
      percentageMin: 35,
      percentageMax: 59,
      colorClass: "text-amber-400",
      badgeBg: "bg-amber-500/15 border border-amber-500/30 text-amber-400",
      advice: `Intervention window is active — immediate debit freeze via 1930 within the estimated ${minWindow}–${maxWindow} hour window is recommended before multi-tier layering occurs.`,
    };
  } else {
    return {
      tier: "low",
      label: "Low Recovery Likelihood",
      percentageMin: 8,
      percentageMax: 34,
      colorClass: "text-rose-400",
      badgeBg: "bg-rose-500/15 border border-rose-500/30 text-rose-400",
      advice: `Extended elapsed time (>24h) reduces immediate recovery probability. Priority shifted to SHA-256 evidence chain verification & LEA docket filing.`,
    };
  }
}

interface FundRecoveryEstimatorCardProps {
  prediction?: Prediction | null;
  className?: string;
}

export default function FundRecoveryEstimatorCard({
  prediction,
  className = "",
}: FundRecoveryEstimatorCardProps) {
  const [elapsedHours, setElapsedHours] = useState<number>(2);

  const minWindow = prediction?.timeWindowHours?.min ?? 2;
  const maxWindow = prediction?.timeWindowHours?.max ?? 6;

  const estimate = estimateFundRecovery(elapsedHours, minWindow, maxWindow);

  return (
    <div className={`panel p-4 sm:p-5 space-y-4 border-border/60 shadow-xl ${className}`}>
      {/* Header with Tooltip */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
            <TrendingUp className="size-4" />
          </span>
          <div>
            <h3 className="font-display text-xs font-bold text-foreground">
              Fund Recovery Likelihood Estimator
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Time-decay response curve for financial interdiction
            </p>
          </div>
        </div>

        {/* Info Tooltip Requirement */}
        <div className="group relative flex items-center">
          <button
            type="button"
            className="grid size-6 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            title="Empirical estimate based on fraud response research and time-decay curves."
          >
            <Info className="size-4" />
          </button>
          <div className="pointer-events-none absolute right-0 top-7 z-30 hidden w-64 rounded-xl border border-border/80 bg-card/95 p-3 text-[10px] text-muted-foreground shadow-2xl backdrop-blur-md group-hover:block animate-in fade-in-0 duration-200">
            <p className="font-bold text-foreground mb-1">Methodology Note:</p>
            Empirical estimate based on fraud response research and time-decay curves.
          </div>
        </div>
      </div>

      {/* Time Elapsed Interactive Selector */}
      <div className="space-y-1.5 rounded-xl border border-border/40 bg-muted/20 p-2.5 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Clock className="size-3 text-cyan-400" />
            <span>Time Elapsed Since Fraud:</span>
          </span>
          <span className="font-mono font-bold text-foreground">{elapsedHours} Hours</span>
        </div>

        <div className="flex gap-1">
          {[1, 2, 4, 12, 24, 48].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setElapsedHours(h)}
              className={`flex-1 rounded-lg py-1 text-[10px] font-mono font-bold transition-all ${
                elapsedHours === h
                  ? "bg-primary text-white shadow-sm ring-1 ring-primary/50"
                  : "bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-border/30"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Primary Estimate Badge & Percentage */}
      <div className="rounded-2xl border border-border/50 bg-muted/15 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className={`rounded-xl px-2.5 py-1 text-[10px] font-mono font-bold uppercase ${estimate.badgeBg}`}>
            {estimate.label}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            Estimated Probability
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`font-display text-3xl font-black ${estimate.colorClass}`}>
              {estimate.percentageMin}% – {estimate.percentageMax}%
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">
            Golden Hour 0–2h
          </span>
        </div>

        {/* Visual Timeline Meter */}
        <div className="space-y-1 pt-1">
          <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden relative flex">
            <div className="h-full w-[25%] bg-emerald-500/80" title="Golden Hour (0-2h)" />
            <div className="h-full w-[25%] bg-cyan-500/80" title="Action Window (2-6h)" />
            <div className="h-full w-[30%] bg-amber-500/80" title="Moderate Decay (6-24h)" />
            <div className="h-full w-[20%] bg-rose-500/80" title="High Risk (>24h)" />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground/75 px-0.5">
            <span>0h</span>
            <span>2h</span>
            <span>6h</span>
            <span>24h+</span>
          </div>
        </div>
      </div>

      {/* Advisory Sentence Requirement */}
      <div className="rounded-xl border border-border/40 bg-card p-3 space-y-1">
        <p className="text-xs text-foreground/90 leading-relaxed font-medium">
          {estimate.advice}
        </p>
      </div>

      {/* Small Factual Footnote Requirement */}
      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 pt-1 border-t border-border/30">
        <AlertCircle className="size-3 text-primary shrink-0" />
        <span>Empirical estimate based on fraud response research and time-decay curves.</span>
      </p>
    </div>
  );
}
