import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PerformanceMetricsPanel from "@/components/metrics/PerformanceMetricsPanel";
import { Sparkles, Shield, Cpu } from "lucide-react";

export const Route = createFileRoute("/metrics")({
  head: () => ({
    meta: [
      { title: "System Benchmarks & Architectural Metrics · CyberShield AI" },
      {
        name: "description",
        content: "Design-time target metrics and operational benchmarks for CyberShield AI.",
      },
    ],
  }),
  component: MetricsPage,
});

function MetricsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Section 7 Engineering Architecture Specifications</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
              System Targets & Model Performance Benchmarks
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Comprehensive offline cross-validation AUC figures, P95 pipeline latency SLAs, and operational impact comparisons.
            </p>
          </div>
        </div>

        {/* Performance Metrics Panel */}
        <PerformanceMetricsPanel />
      </div>
    </DashboardLayout>
  );
}
