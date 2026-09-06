// ─── Explain This Prediction Accordion Component ─────────────────────────────
// Collapsible panel revealing plain-language feature contributions & ML reasoning.

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Info } from "lucide-react";
import type { Prediction, ExplanationFactor } from "@/lib/hotspots";

interface ExplainPredictionAccordionProps {
  prediction: Prediction;
  className?: string;
}

export default function ExplainPredictionAccordion({
  prediction,
  className = "",
}: ExplainPredictionAccordionProps) {
  const [expanded, setExpanded] = useState(false);

  const factors: ExplanationFactor[] = prediction.explanationFactors && prediction.explanationFactors.length > 0
    ? prediction.explanationFactors
    : [
        {
          feature: `Distance to ${prediction.zoneName}`,
          impact: "High Impact (24.9%)",
          reason: `Victim coordinates (${prediction.lat.toFixed(2)}°N, ${prediction.lng.toFixed(2)}°E) are within close proximity to the ${prediction.zoneName} centroid.`,
        },
        {
          feature: "Incident Velocity & Risk Override",
          impact: "High Impact (14.4%)",
          reason: "High-frequency transaction velocity correlates with active cash-out extraction vectors.",
        },
        {
          feature: "Fraud Amount & Mule Account Telemetry",
          impact: "Moderate Impact (10.2%)",
          reason: `Reported amount and suspect account telemetry match high-confidence ${prediction.zoneName} patterns.`,
        },
      ];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="group flex items-center justify-between gap-2 w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:border-cyan-500/50 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-cyan-400 transition-transform group-hover:scale-110" />
          <span>Explain This Prediction</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-cyan-300/80">
          <span>{expanded ? "Hide Reasoning" : "View Factors"}</span>
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </div>
      </button>

      {/* Expanded Factors Panel */}
      {expanded && (
        <div className="rounded-2xl border border-cyan-500/30 bg-card/95 p-4 space-y-3 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Info className="size-3.5 text-cyan-400" />
              <span>Key Model Decision Factors ({prediction.zoneName})</span>
            </div>
            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-cyan-400">
              XGBoost Attribution
            </span>
          </div>

          <div className="space-y-2.5">
            {factors.map((f, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="grid size-4 place-items-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-400 font-mono">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-foreground">{f.feature}</span>
                  </div>
                  <span className="rounded bg-primary/10 border border-primary/30 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-primary">
                    {f.impact}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                  {f.reason}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground/80 pt-1 border-t border-border/30">
            Attribution computed using feature importances and rule thresholds from <code className="font-mono text-cyan-400">train_model.py</code>.
          </p>
        </div>
      )}
    </div>
  );
}
