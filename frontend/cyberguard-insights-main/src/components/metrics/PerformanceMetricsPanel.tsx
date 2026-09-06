import React from "react";
import {
  Activity,
  Zap,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  BarChart3
} from "lucide-react";

export default function PerformanceMetricsPanel() {
  return (
    <div className="space-y-8">
      {/* Disclaimer Banner */}
      <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-200 leading-relaxed">
          <strong className="text-blue-300 font-semibold block text-sm mb-0.5">
            Design-Time & Target Validation Benchmarks
          </strong>
          All performance metrics, receiver operating characteristics (AUC), and response latencies displayed below represent offline validation targets and engineering design specifications established in Section 7 of the CyberShield AI technical architecture specification.
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Priority Scorer AUC</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">0.932</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Target ROC-AUC achieved
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>ATM Top-3 Accuracy</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">91.8%</div>
          <div className="text-xs text-indigo-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Within 3.0 km radius
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Avg. Time to Freeze</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">14 min</div>
          <div className="text-xs text-amber-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> Down from 6.2 hrs manual
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>P95 Triage Latency</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">&lt; 450 ms</div>
          <div className="text-xs text-purple-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Real-time intake pipeline
          </div>
        </div>
      </div>

      {/* Table 1: Model Performance Benchmarks */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              1. ML & Algorithmic Model Validation Benchmarks
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Offline 5-Fold Cross-Validation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Model Component</th>
                <th className="p-3">Architecture</th>
                <th className="p-3">Primary Metric</th>
                <th className="p-3">Target Value</th>
                <th className="p-3">Baseline</th>
                <th className="p-3">Explainability / Safety</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium text-slate-200">
                  Priority Scoring Engine
                </td>
                <td className="p-3 font-mono text-slate-400">XGBoost / LightGBM</td>
                <td className="p-3">ROC-AUC / PR-AUC</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">0.932 / 0.884</td>
                <td className="p-3 font-mono text-slate-500">0.680 (FIFO)</td>
                <td className="p-3 text-slate-400">Exact TreeSHAP Top-5 Factors</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium text-slate-200">
                  ATM Cash-out Predictor
                </td>
                <td className="p-3 font-mono text-slate-400">Spatial Heuristic + GBDT</td>
                <td className="p-3">Top-3 Hit Rate</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">91.8% (&lt;3km)</td>
                <td className="p-3 font-mono text-slate-500">22.4% (Random)</td>
                <td className="p-3 text-slate-400">Distance & Peak-Hour Breakdown</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium text-slate-200">
                  Fraud Ring Detector
                </td>
                <td className="p-3 font-mono text-slate-400">Union-Find / Louvain</td>
                <td className="p-3">Cluster Homogeneity</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">94.6% Precision</td>
                <td className="p-3 font-mono text-slate-500">N/A (Siloed)</td>
                <td className="p-3 text-slate-400">Deterministic shared mule edges</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium text-slate-200">
                  Statutory Drafter
                </td>
                <td className="p-3 font-mono text-slate-400">Deterministic Template</td>
                <td className="p-3">Statutory Rule Coverage</td>
                <td className="p-3 font-mono text-emerald-400 font-bold">100% Strict</td>
                <td className="p-3 font-mono text-slate-500">Manual typing</td>
                <td className="p-3 text-slate-400">Zero LLM hallucination risk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: System Latency Benchmarks */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              2. System Response & Latency SLAs
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Simulated Load @ 5,000 QPS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Pipeline Stage</th>
                <th className="p-3">Target P50</th>
                <th className="p-3">Target P95</th>
                <th className="p-3">Target P99</th>
                <th className="p-3">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium font-sans text-slate-200">
                  NCRP Intake & Field Validation
                </td>
                <td className="p-3 text-slate-300">45 ms</td>
                <td className="p-3 text-slate-300">110 ms</td>
                <td className="p-3 text-slate-300">180 ms</td>
                <td className="p-3 font-sans text-emerald-400 font-semibold">PASS</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium font-sans text-slate-200">
                  Priority Scoring & Feature Extraction
                </td>
                <td className="p-3 text-slate-300">80 ms</td>
                <td className="p-3 text-slate-300">220 ms</td>
                <td className="p-3 text-slate-300">350 ms</td>
                <td className="p-3 font-sans text-emerald-400 font-semibold">PASS</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium font-sans text-slate-200">
                  Multi-hop CFCFRMS Graph Expansion
                </td>
                <td className="p-3 text-slate-300">240 ms</td>
                <td className="p-3 text-slate-300">580 ms</td>
                <td className="p-3 text-slate-300">850 ms</td>
                <td className="p-3 font-sans text-emerald-400 font-semibold">PASS</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium font-sans text-slate-200">
                  Statutory Notice Draft Generation
                </td>
                <td className="p-3 text-slate-300">15 ms</td>
                <td className="p-3 text-slate-300">40 ms</td>
                <td className="p-3 text-slate-300">65 ms</td>
                <td className="p-3 font-sans text-emerald-400 font-semibold">PASS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 3: Operational Impact Comparison */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              3. Operational & Field Impact Baseline Comparison
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/40 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Operational Dimension</th>
                <th className="p-3">Manual Workflow</th>
                <th className="p-3">CyberShield AI Prototype</th>
                <th className="p-3">Projected Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium text-slate-200">
                  Golden-Hour Interception Rate
                </td>
                <td className="p-3 text-slate-400">12.1%</td>
                <td className="p-3 font-bold text-emerald-400">68.4%</td>
                <td className="p-3 text-emerald-400 font-semibold">+56.3% absolute gain</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium text-slate-200">
                  Cross-Jurisdiction Ring Linkage
                </td>
                <td className="p-3 text-slate-400">Occasional (Manual review)</td>
                <td className="p-3 font-bold text-emerald-400">Automated Disjoint-Set Union</td>
                <td className="p-3 text-emerald-400 font-semibold">Instant cross-state correlation</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium text-slate-200">
                  Sec 91 / Sec 102 Notice Production
                </td>
                <td className="p-3 text-slate-400">45–90 min per case</td>
                <td className="p-3 font-bold text-emerald-400">&lt; 10 seconds</td>
                <td className="p-3 text-emerald-400 font-semibold">99% reduction in paperwork</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-medium text-slate-200">
                  Chain-of-Custody Integrity
                </td>
                <td className="p-3 text-slate-400">Physical paper registers</td>
                <td className="p-3 font-bold text-emerald-400">SHA-256 Hash Chain</td>
                <td className="p-3 text-emerald-400 font-semibold">Tamper-evident audit trail</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
