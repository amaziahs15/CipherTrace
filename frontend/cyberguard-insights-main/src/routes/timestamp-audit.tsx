import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ScanEye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Camera,
  Database,
  Search,
  Filter,
  RefreshCw,
  Layers,
  ShieldCheck,
  Building2,
  ExternalLink,
  HelpCircle,
  ArrowUpDown,
  FileText
} from "lucide-react";

import { getComplaints } from "@/lib/mock-api/ncrp";
import { getTransactionTrail } from "@/lib/mock-api/cfcfrms";
import { rankAtms } from "@/lib/models/atm-predictor";
import atmsFixture from "@/lib/mock-api/fixtures/atms.json";
import type { Complaint, Transaction, AtmFixture, AtmPrediction } from "@/lib/mock-api/types";

export const Route = createFileRoute("/timestamp-audit")({
  head: () => ({
    meta: [
      { title: "Timestamp & CCTV Cross-Verification Audit · CyberShield AI" },
      {
        name: "description",
        content: "Real cross-verification of predicted ATM cash-outs against recorded CFCFRMS switch transactions and branch CCTV retention.",
      },
    ],
  }),
  component: TimestampAuditPage,
});

export type AuditVerdict =
  | "FULLY_VERIFIED"
  | "WRONG_ATM_PREDICTED"
  | "OUTSIDE_TIME_WINDOW"
  | "FOOTAGE_EXPIRED"
  | "DATA_GAP"
  | "NO_WITHDRAWAL_YET";

interface AuditComparisonRow {
  complaint: Complaint;
  realTxn: Transaction | null;
  predictedAtms: AtmPrediction[];
  wasPredicted: boolean;
  matchingPrediction: AtmPrediction | null;
  withinWindow: boolean | null;
  realAtmFixture: AtmFixture | null;
  daysElapsed: number | null;
  retentionDays: number | null;
  cctvAvailable: boolean | null;
  footageRetrievable: boolean;
  verdict: AuditVerdict;
}

function TimestampAuditPage() {
  const [rows, setRows] = useState<AuditComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("ALL");

  useEffect(() => {
    async function runCrossVerification() {
      setLoading(true);
      const complaints = await getComplaints();
      const atms = atmsFixture as AtmFixture[];
      const now = Date.now();

      const comparisonPromises = complaints.map(async (complaint) => {
        // 1. Transaction hop where atm_id is not null
        const trail = await getTransactionTrail(complaint.utr);
        const realTxn =
          trail.find((tx) => tx.atm_id !== null && tx.atm_id !== undefined && tx.atm_id.trim() !== "") || null;

        // 2. Rank ATMs for model predictions
        const predictedAtms = rankAtms(
          complaint.mule_kyc_lat,
          complaint.mule_kyc_lon,
          complaint.fraud_timestamp,
          3
        );

        // 3. If no real withdrawal transaction exists
        if (!realTxn) {
          const verdict: AuditVerdict =
            complaint.withdrawal_status === "NOT_WITHDRAWN"
              ? "NO_WITHDRAWAL_YET"
              : "DATA_GAP";

          return {
            complaint,
            realTxn: null,
            predictedAtms,
            wasPredicted: false,
            matchingPrediction: null,
            withinWindow: null,
            realAtmFixture: null,
            daysElapsed: null,
            retentionDays: null,
            cctvAvailable: null,
            footageRetrievable: false,
            verdict,
          };
        }

        // 4. Real withdrawal exists
        const matchingPrediction = predictedAtms.find((p) => p.atm_id === realTxn.atm_id) || null;
        const wasPredicted = matchingPrediction !== null;

        let withinWindow: boolean | null = null;
        if (wasPredicted && matchingPrediction) {
          const txTime = new Date(realTxn.timestamp).getTime();
          const winStart = new Date(matchingPrediction.estimated_window_start).getTime();
          const winEnd = new Date(matchingPrediction.estimated_window_end).getTime();
          withinWindow = txTime >= winStart && txTime <= winEnd;
        }

        const realAtmFixture = atms.find((a) => a.atm_id === realTxn.atm_id) || null;
        const txTime = new Date(realTxn.timestamp).getTime();
        const daysElapsed = Math.max(0, Math.floor((now - txTime) / (1000 * 60 * 60 * 24)));
        const retentionDays = realAtmFixture ? realAtmFixture.cctv_retention_days : null;
        const cctvAvailable = realAtmFixture ? realAtmFixture.cctv_available : null;
        const footageRetrievable = !!(cctvAvailable && retentionDays !== null && daysElapsed <= retentionDays);

        let verdict: AuditVerdict;
        if (!wasPredicted) {
          verdict = "WRONG_ATM_PREDICTED";
        } else if (!withinWindow) {
          verdict = "OUTSIDE_TIME_WINDOW";
        } else if (!footageRetrievable) {
          verdict = "FOOTAGE_EXPIRED";
        } else {
          verdict = "FULLY_VERIFIED";
        }

        return {
          complaint,
          realTxn,
          predictedAtms,
          wasPredicted,
          matchingPrediction,
          withinWindow,
          realAtmFixture,
          daysElapsed,
          retentionDays,
          cctvAvailable,
          footageRetrievable,
          verdict,
        };
      });

      const results = await Promise.all(comparisonPromises);
      setRows(results);
      setLoading(false);
    }

    runCrossVerification();
  }, []);

  // Summary Stat Calculations
  const stats = useMemo(() => {
    const total = rows.length;
    const recordedWithdrawals = rows.filter((r) => r.realTxn !== null).length;
    const fullyVerified = rows.filter((r) => r.verdict === "FULLY_VERIFIED").length;
    const wrongAtm = rows.filter((r) => r.verdict === "WRONG_ATM_PREDICTED").length;
    const outsideWindowOrExpired = rows.filter(
      (r) => r.verdict === "OUTSIDE_TIME_WINDOW" || r.verdict === "FOOTAGE_EXPIRED"
    ).length;
    const dataGaps = rows.filter((r) => r.verdict === "DATA_GAP").length;

    return {
      total,
      recordedWithdrawals,
      fullyVerified,
      wrongAtm,
      outsideWindowOrExpired,
      dataGaps,
    };
  }, [rows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Verdict filter
      if (verdictFilter !== "ALL") {
        if (verdictFilter === "VERIFIED" && row.verdict !== "FULLY_VERIFIED") return false;
        if (verdictFilter === "WRONG_ATM" && row.verdict !== "WRONG_ATM_PREDICTED") return false;
        if (
          verdictFilter === "WINDOW_OR_EXPIRED" &&
          row.verdict !== "OUTSIDE_TIME_WINDOW" &&
          row.verdict !== "FOOTAGE_EXPIRED"
        )
          return false;
        if (verdictFilter === "DATA_GAP" && row.verdict !== "DATA_GAP") return false;
        if (verdictFilter === "NO_WITHDRAWAL" && row.verdict !== "NO_WITHDRAWAL_YET") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cid = row.complaint.complaint_id.toLowerCase();
        const vname = row.complaint.victim_name.toLowerCase();
        const ftype = row.complaint.fraud_type.toLowerCase();
        const atmId = (row.realTxn?.atm_id || "").toLowerCase();
        const bank = (row.complaint.mule_bank || "").toLowerCase();
        return cid.includes(q) || vname.includes(q) || ftype.includes(q) || atmId.includes(q) || bank.includes(q);
      }

      return true;
    });
  }, [rows, verdictFilter, searchQuery]);

  const renderVerdictBadge = (verdict: AuditVerdict) => {
    switch (verdict) {
      case "FULLY_VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            Fully Verified
          </span>
        );
      case "WRONG_ATM_PREDICTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap">
            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            Wrong ATM Predicted
          </span>
        );
      case "OUTSIDE_TIME_WINDOW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Outside Time Window
          </span>
        );
      case "FOOTAGE_EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
            <Camera className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            CCTV Footage Expired
          </span>
        );
      case "DATA_GAP":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            Data Gap (No Trail)
          </span>
        );
      case "NO_WITHDRAWAL_YET":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700/60 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            No Withdrawal Yet
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <ScanEye className="w-4 h-4" />
              <span>Multi-Source Evidentiary Reconciliation</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
              Timestamp &amp; CCTV Cross-Verification Audit
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cross-checks predictive ML cash-out models against real CFCFRMS switch transactions and banking CCTV preservation limits across active police dockets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
              {stats.total} Complaints Scanned
            </span>
          </div>
        </div>

        {/* Summary Stat Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium block">Total Scanned</span>
            <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">
              {stats.total}
            </span>
            <span className="text-[10px] text-slate-500">Active NCRP Dockets</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium block">Recorded Withdrawals</span>
            <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">
              {stats.recordedWithdrawals}
            </span>
            <span className="text-[10px] text-slate-500">Real Switch Trail Hops</span>
          </div>

          <div className="bg-slate-900/80 border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-emerald-400 font-medium block">Fully Verified</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              {stats.fullyVerified}
            </span>
            <span className="text-[10px] text-emerald-500/80">Predicted + In Window + CCTV</span>
          </div>

          <div className="bg-slate-900/80 border border-rose-500/30 bg-rose-500/5 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-rose-400 font-medium block">Wrong ATM</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
              {stats.wrongAtm}
            </span>
            <span className="text-[10px] text-rose-500/80">Off-target model spatial rank</span>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/30 bg-amber-500/5 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-amber-400 font-medium block">Window / Expired</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
              {stats.outsideWindowOrExpired}
            </span>
            <span className="text-[10px] text-amber-500/80">Timing or CCTV limit breach</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-sm">
            <span className="text-[11px] text-slate-400 font-medium block">Data Gaps</span>
            <span className="text-xl font-bold font-mono text-slate-400 mt-1 block">
              {stats.dataGaps}
            </span>
            <span className="text-[10px] text-slate-500">Missing switch trail hops</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Filter by complaint ID, ATM, bank, or victim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-200 outline-none placeholder:text-slate-500 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "ALL", label: "All Cases" },
              { id: "VERIFIED", label: "Fully Verified" },
              { id: "WRONG_ATM", label: "Wrong ATM" },
              { id: "WINDOW_OR_EXPIRED", label: "Window / Expired" },
              { id: "DATA_GAP", label: "Data Gaps" },
              { id: "NO_WITHDRAWAL", label: "Unwithdrawn" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setVerdictFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  verdictFilter === f.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Cross-Verification Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
              <p className="text-sm font-medium">Reconciling transaction switches &amp; CCTV footprints...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="text-sm">No cross-verification rows match the selected filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Complaint ID &amp; Type</th>
                    <th className="py-3 px-4">Fraud Reported At</th>
                    <th className="py-3 px-4">Real Withdrawal Time</th>
                    <th className="py-3 px-4">Actual ATM ID</th>
                    <th className="py-3 px-4">Predicted Window</th>
                    <th className="py-3 px-4">Real CCTV Retention Info</th>
                    <th className="py-3 px-4 text-right">Audit Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-normal">
                  {filteredRows.map((row) => {
                    const c = row.complaint;
                    const rtx = row.realTxn;
                    const match = row.matchingPrediction;
                    const topPick = row.predictedAtms[0];

                    return (
                      <tr
                        key={c.complaint_id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* 1. Complaint ID & Type */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <Link
                              to="/io-complaint/$id"
                              params={{ id: c.complaint_id }}
                              className="font-mono font-bold text-slate-100 hover:text-indigo-300 inline-flex items-center gap-1 group-hover:underline"
                            >
                              <span>{c.complaint_id}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </Link>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                                {c.fraud_type}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                ₹{c.fraud_amount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Fraud Reported At */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(c.fraud_timestamp).toLocaleString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* 3. Real Withdrawal Time */}
                        <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                          {rtx ? (
                            <div>
                              <span className="text-slate-200 font-medium block">
                                {new Date(rtx.timestamp).toLocaleString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Hop #{rtx.hop_index} · ₹{rtx.amount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono">—</span>
                          )}
                        </td>

                        {/* 4. Actual ATM ID */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {rtx?.atm_id ? (
                            <div>
                              <span className="text-slate-200 font-bold block">{rtx.atm_id}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">
                                {row.realAtmFixture?.address || rtx.to_bank}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono">—</span>
                          )}
                        </td>

                        {/* 5. Predicted Window */}
                        <td className="py-3.5 px-4 text-[11px]">
                          {match ? (
                            <div>
                              <div className="flex items-center gap-1 font-mono text-emerald-400 font-semibold text-[10px]">
                                <span>Rank #{match.rank} Match</span>
                                <span>({match.confidence_pct}%)</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 block whitespace-nowrap">
                                {new Date(match.estimated_window_start).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                →{" "}
                                {new Date(match.estimated_window_end).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ) : topPick ? (
                            <div>
                              <span className="text-slate-400 font-mono text-[10px] block">
                                #1: {topPick.atm_id}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 block whitespace-nowrap">
                                {new Date(topPick.estimated_window_start).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                →{" "}
                                {new Date(topPick.estimated_window_end).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono">—</span>
                          )}
                        </td>

                        {/* 6. Real CCTV Retention Info */}
                        <td className="py-3.5 px-4 text-[11px]">
                          {row.realAtmFixture ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                {row.realAtmFixture.cctv_available ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                    <Camera className="w-3 h-3" /> Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                                    <XCircle className="w-3 h-3" /> Inactive
                                  </span>
                                )}
                                <span className="text-slate-500 font-mono text-[10px]">
                                  ({row.retentionDays}d max)
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {row.daysElapsed}d elapsed ·{" "}
                                {row.footageRetrievable ? (
                                  <strong className="text-emerald-400 font-medium">Retrievable</strong>
                                ) : (
                                  <strong className="text-rose-400 font-medium">Archived/Lost</strong>
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono">—</span>
                          )}
                        </td>

                        {/* 7. Verdict Badge */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {renderVerdictBadge(row.verdict)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Explanatory Multi-Factor Standard Box */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Factor Evidentiary Standard for "Fully Verified"</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            In CyberShield AI, a complaint achieves a <strong className="text-emerald-400 font-semibold">Fully Verified</strong> status only when three strict independent criteria are satisfied concurrently:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="font-bold text-slate-200 block mb-1">1. Spatial Coincidence</span>
              <p className="text-[11px] text-slate-400">
                The actual transaction switch withdrawal ATM must match one of the model's Top-3 ranked candidate ATM locations computed from the suspect KYC locus.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="font-bold text-slate-200 block mb-1">2. Temporal Coincidence</span>
              <p className="text-[11px] text-slate-400">
                The actual NPCI/CFCFRMS transaction hop timestamp must fall strictly inside the model's estimated cash-out laundering window (start to end).
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="font-bold text-slate-200 block mb-1">3. Digital Evidentiary Viability</span>
              <p className="text-[11px] text-slate-400">
                The ATM terminal must maintain active CCTV recording capability, and the calendar days elapsed since the cash-out must not exceed the bank's statutory physical recording preservation window.
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800/80">
            Cases failing any factor are immediately flagged for IO intervention — triggering immediate Section 91 CrPC CCTV preservation notices before archival expiration, or re-tasking patrol coverage to the correct cluster.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
