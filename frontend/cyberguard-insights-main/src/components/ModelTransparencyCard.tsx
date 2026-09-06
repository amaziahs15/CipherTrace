// ─── Model Transparency & Evaluation Metrics Card ───────────────────────────
// Displays empirical evaluation metrics (accuracy, precision, recall) and feature importances
// fetched dynamically from the /model-metrics endpoint or generated model_metrics.json.

import React, { useEffect, useState } from "react";
import { Cpu, BarChart2, ShieldCheck, AlertCircle } from "lucide-react";
import { fetchModelMetrics, type ModelMetrics } from "@/lib/hotspots";

export default function ModelTransparencyCard() {
  const [metricsData, setMetricsData] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelMetrics()
      .then((data) => {
        if (data) setMetricsData(data);
      })
      .catch((err) => console.error("Error loading model metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="panel p-6 text-center text-xs text-muted-foreground animate-pulse">
        Loading model evaluation telemetry &amp; feature metrics…
      </div>
    );
  }

  if (!metricsData) return null;

  const { metrics, feature_importances, label_note, model_type } = metricsData;

  // Sort feature importances descending
  const sortedFeatures = [...feature_importances].sort((a, b) => b.importance - a.importance);
  const maxImportance = Math.max(...sortedFeatures.map((f) => f.importance), 0.01);

  return (
    <div className="panel p-5 sm:p-6 space-y-6 border-border/60 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Cpu className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-foreground">
                Model Transparency &amp; Performance Metrics
              </h2>
              <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                {model_type || "XGBoost Classifier"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Empirical evaluation on held-out test dataset for algorithmic accountability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="size-3.5" />
          <span>Verified Test Metrics</span>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Accuracy Tile */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Overall Accuracy
          </p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-black text-cyan-400">
              {(metrics.accuracy * 100).toFixed(1)}%
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {metrics.accuracy.toFixed(4)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Exact match ratio across candidate withdrawal clusters.
          </p>
        </div>

        {/* Precision Tile */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Precision (Weighted)
          </p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-black text-emerald-400">
              {(metrics.precision * 100).toFixed(1)}%
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {metrics.precision.toFixed(4)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            True positive rate minimizing false patrol dispatches.
          </p>
        </div>

        {/* Recall Tile */}
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Recall (Weighted)
          </p>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-black text-amber-400">
              {(metrics.recall * 100).toFixed(1)}%
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {metrics.recall.toFixed(4)}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Sensitivity ratio across active cash-out extraction events.
          </p>
        </div>
      </div>

      {/* Feature Importance Horizontal Bar Chart */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="size-4 text-cyan-400" />
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
              Feature Importance Ranking (8 Core Features)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Sorted Highest to Lowest
          </span>
        </div>

        <div className="space-y-2.5 rounded-2xl border border-border/60 bg-muted/10 p-4">
          {sortedFeatures.map((feat) => {
            const pct = (feat.importance * 100).toFixed(1);
            const widthPct = Math.max((feat.importance / maxImportance) * 100, 4);

            return (
              <div key={feat.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{feat.name}</span>
                  <span className="font-mono text-xs font-bold text-cyan-400">{pct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/40 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factual Note Requirement */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="size-3.5 text-primary shrink-0" />
          <span>{label_note}</span>
        </div>
        <span className="font-mono text-[10px]">
          {metricsData.test_samples ? `${metricsData.test_samples} test samples` : "10,000 synthetic dataset split"}
        </span>
      </div>
    </div>
  );
}
