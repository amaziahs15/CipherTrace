// ─── Victim-Centric & Collective Threat Prioritization Dashboard Card ─────────
// Tagline: "A small loss should not mean a small signal."
// "Every victim matters. Every complaint can be a signal."

import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Sparkles,
  Info,
  Clock,
  MapPin,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Layers,
  HelpCircle,
  Radio,
  Building2,
  Calendar,
  X,
  ExternalLink,
} from "lucide-react";
import {
  SYNTHETIC_EMERGING_PATTERNS,
  DEFAULT_PRIORITY_WEIGHTS,
  type ThreatPriorityWeights,
  type EmergingCoordinatedPattern,
  calculateInvestigationPrioritySignal,
  VICTIM_CENTRIC_TEXT,
} from "@/lib/collectiveThreat";

export default function CollectiveThreatCard() {
  const [patterns, setPatterns] = useState<EmergingCoordinatedPattern[]>(SYNTHETIC_EMERGING_PATTERNS);
  const [selectedPattern, setSelectedPattern] = useState<EmergingCoordinatedPattern>(patterns[0]!);
  const [weights, setWeights] = useState<ThreatPriorityWeights>(DEFAULT_PRIORITY_WEIGHTS);
  const [showConfigWeights, setShowConfigWeights] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [activeTimelineTab, setActiveTimelineTab] = useState<string>(patterns[0]!.patternId);

  // Recalculate priority signals when weights change
  const evaluatedPatterns = useMemo(() => {
    return patterns.map((p) => ({
      ...p,
      investigationPrioritySignal: calculateInvestigationPrioritySignal(p, weights),
    }));
  }, [patterns, weights]);

  const activePattern = useMemo(() => {
    return evaluatedPatterns.find((p) => p.patternId === selectedPattern.patternId) || evaluatedPatterns[0]!;
  }, [evaluatedPatterns, selectedPattern]);

  return (
    <div className="panel overflow-hidden border-border/70 bg-card shadow-2xl space-y-6 p-6">
      
      {/* ── Top Header with Taglines, Tooltip & Synthetic Proof-of-Concept Badge ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
              <Radio className="size-4 animate-pulse" />
            </span>
            <h2 className="font-display text-lg font-bold text-foreground">
              Victim-Centric &amp; Collective Threat Prioritization
            </h2>
            <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400">
              {VICTIM_CENTRIC_TEXT.syntheticBadge}
            </span>
            <span className="rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-primary">
              ADDITIVE INTELLIGENCE LAYER
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <p className="text-xs font-semibold text-primary italic">
              "{VICTIM_CENTRIC_TEXT.tagline}"
            </p>
            <span className="text-muted-foreground/40">•</span>
            <p className="text-xs text-muted-foreground">
              {VICTIM_CENTRIC_TEXT.subTagline}
            </p>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
            Individually low-value complaints may represent an emerging coordinated fraud pattern. Feeds additional pattern intelligence into the existing prediction workflow.
          </p>
        </div>

        {/* Right Action Tools: Info Tooltip & Configurable Weights Toggle */}
        <div className="flex items-center gap-2">
          {/* Info Tooltip Popover */}
          <div className="relative">
            <button
              onClick={() => setShowTooltip((v) => !v)}
              title="View Guidance Information"
              className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              <Info className="size-3.5 text-primary" />
              <span>Context Info</span>
            </button>

            {showTooltip && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-4 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Victim-Centric Guidance
                  </span>
                  <button onClick={() => setShowTooltip(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">
                  {VICTIM_CENTRIC_TEXT.tooltip}
                </p>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-[10px] text-amber-700 dark:text-amber-300">
                  <strong>Important:</strong> Does not replace or override existing XGBoost predictions or confidence scores.
                </div>
              </div>
            )}
          </div>

          {/* Configurable Weights Inspector Button */}
          <button
            onClick={() => setShowConfigWeights((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
          >
            <Sliders className="size-3.5" />
            <span>Configure Factor Weights</span>
          </button>
        </div>
      </div>

      {/* ── Configurable Weights Drawer (Collapsible) ── */}
      {showConfigWeights && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground">
                Configurable Decision-Support Priority Weights (Dynamic Scoring Engine)
              </h4>
            </div>
            <button
              onClick={() => setWeights(DEFAULT_PRIORITY_WEIGHTS)}
              className="text-[10px] font-mono text-primary underline hover:opacity-80"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground flex justify-between">
                <span>Complaint Count Weight:</span>
                <span className="font-mono font-bold text-primary">{(weights.complaintCountWeight * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={weights.complaintCountWeight}
                onChange={(e) => setWeights({ ...weights, complaintCountWeight: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground flex justify-between">
                <span>Collective Impact Weight:</span>
                <span className="font-mono font-bold text-primary">{(weights.collectiveImpactWeight * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={weights.collectiveImpactWeight}
                onChange={(e) => setWeights({ ...weights, collectiveImpactWeight: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground flex justify-between">
                <span>Geographic Coherence:</span>
                <span className="font-mono font-bold text-primary">{(weights.geographicConcentrationWeight * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.05"
                max="0.3"
                step="0.05"
                value={weights.geographicConcentrationWeight}
                onChange={(e) => setWeights({ ...weights, geographicConcentrationWeight: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground flex justify-between">
                <span>Temporal Concentration:</span>
                <span className="font-mono font-bold text-primary">{(weights.temporalConcentrationWeight * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0.05"
                max="0.3"
                step="0.05"
                value={weights.temporalConcentrationWeight}
                onChange={(e) => setWeights({ ...weights, temporalConcentrationWeight: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Key Metrics Comparison: Individual Loss vs Collective Loss ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Individual vs Collective Loss Comparison */}
        <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Loss Dynamics
            </span>
            <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400">
              {activePattern.complaintCount} Victims
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Individual Avg:</span>
              <span className="font-mono text-sm font-bold text-foreground">
                ₹{activePattern.individualLossAvg.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-border/30 pt-1">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Collective Loss:</span>
              <span className="font-mono text-lg font-black text-rose-600 dark:text-rose-400">
                ₹{activePattern.collectiveLoss.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground/80 italic">
            *Never presented as proof of criminal linkage.
          </p>
        </div>

        {/* Metric 2: Activity Window & Spatial Radius */}
        <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Burst Window
            </span>
            <Clock className="size-3.5 text-primary" />
          </div>
          <p className="font-mono text-sm font-bold text-foreground">
            {activePattern.activityTimeWindow}
          </p>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
            <span className="text-muted-foreground">Spatial Radius:</span>
            <span className="font-mono font-bold text-primary">{activePattern.radiusKm} km cluster</span>
          </div>
        </div>

        {/* Metric 3: Pattern Coherence Strength */}
        <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Pattern Strength
            </span>
            <span className="font-mono text-xs font-bold text-primary">{activePattern.patternStrength}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden border border-border/40">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full"
              style={{ width: `${activePattern.patternStrength}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
            <span>Geo: {activePattern.geographicSimilarityStrength}%</span>
            <span>Time: {activePattern.temporalConcentration}%</span>
            <span>Modus: {activePattern.behavioralSimilarityScore}%</span>
          </div>
        </div>

        {/* Metric 4: Additive Investigation Priority Signal */}
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Priority Signal
            </span>
            <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
              {activePattern.investigationPrioritySignal}
            </p>
            <span className="text-[10px] font-mono text-muted-foreground">/ 100 Score</span>
          </div>
          <p className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
            Decision-support metric only · Does not replace existing risk tier
          </p>
        </div>
      </div>

      {/* ── EMERGING PATTERNS TABLE / LIST ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-bold text-foreground">
              Detected Emerging Micro-Loss Patterns ({evaluatedPatterns.length})
            </h3>
            <span className="rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-600 dark:text-rose-400">
              REQUIRES INVESTIGATOR VERIFICATION
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground">
                <th className="px-4 py-3 font-bold uppercase tracking-wider">Pattern ID</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider">Modus / Category</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider">Victims</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider">Collective Loss</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider">Geographic Area</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider">Predicted Cash-Out Zone</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider">Priority Signal</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {evaluatedPatterns.map((p) => {
                const isSelected = p.patternId === activePattern.patternId;
                return (
                  <tr
                    key={p.patternId}
                    onClick={() => setSelectedPattern(p)}
                    className={`border-b border-border/20 transition-colors cursor-pointer ${
                      isSelected ? "bg-primary/10 border-primary/40" : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {p.patternId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-xs">{p.behavioralSimilarity}</p>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {p.complaintCount} cases
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                      ₹{p.collectiveLoss.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[11px] max-w-xs truncate">
                      {p.geographicArea}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground truncate max-w-xs">{p.predictedCashoutZone}</p>
                      <span className="text-[10px] font-mono text-primary">{p.predictedZoneConfidence}% ML Confidence</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        {p.investigationPrioritySignal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPattern(p); }}
                        className="rounded-lg border border-border/50 bg-muted/30 px-2 py-1 text-[10px] font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
                      >
                        {isSelected ? "Active" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SEQUENCE TIMELINE SUB-COMPONENT ── */}
      <div className="rounded-2xl border border-border/60 bg-muted/15 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <h4 className="font-display text-xs font-bold text-foreground">
              Emerging Pattern Progression Sequence ({activePattern.patternId})
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Status: <strong className="text-amber-600 dark:text-amber-400">{activePattern.status}</strong>
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Shows how a series of small micro-complaints occurring within hours build into a collective pattern signal:
        </p>

        {/* Timeline Visual Track */}
        <div className="relative pl-6 space-y-4 border-l-2 border-primary/30 my-2">
          {activePattern.timeline.map((evt, idx) => (
            <div key={idx} className="relative group">
              {/* Dot Icon */}
              <span
                className={`absolute -left-[31px] top-1 size-4 rounded-full border-2 border-card flex items-center justify-center transition-all ${
                  evt.isTriggerEvent
                    ? "bg-rose-500 ring-4 ring-rose-500/30 scale-125"
                    : "bg-primary ring-2 ring-primary/20"
                }`}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-card p-3 shadow-sm hover:border-primary/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-primary">{evt.time}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">{evt.complaintId}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{evt.fraudType}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{evt.location}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                    ₹{evt.amount.toLocaleString("en-IN")}
                  </p>
                  {evt.isTriggerEvent ? (
                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                      ⚡ Threshold Reached → Pattern Signal Generated
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-foreground">Micro-loss signal</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Human-In-The-Loop Statement & Safeguards ── */}
      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 flex items-start gap-3 text-xs text-muted-foreground">
        <ShieldAlert className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">
            Human-in-the-Loop Operational Safeguard
          </p>
          <p className="leading-relaxed text-[11px]">
            {VICTIM_CENTRIC_TEXT.humanInTheLoop} The system surfaces potential emerging patterns for human review without automated enforcement, asset freeze, or guilt determination.
          </p>
        </div>
      </div>
    </div>
  );
}
