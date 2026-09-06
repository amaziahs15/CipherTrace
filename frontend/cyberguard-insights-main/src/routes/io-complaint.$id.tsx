import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  FileText,
  Building2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Camera,
  Layers,
  Phone,
  User,
  ExternalLink,
  Snowflake,
  RefreshCw
} from "lucide-react";
import { getComplaintById, getComplaints } from "@/lib/mock-api/ncrp";
import { getTransactionTrail } from "@/lib/mock-api/cfcfrms";
import { getAccountFlags } from "@/lib/mock-api/i4c-suspect-registry";
import { rankAtms } from "@/lib/models/atm-predictor";
import { detectRings } from "@/lib/models/fraud-ring-detector";
import { scorePriority } from "@/lib/models/priority-scorer";
import { appendAudit } from "@/lib/sessionAuditStore";
import type {
  Complaint,
  Transaction,
  AccountFlag,
  AtmPrediction,
  FraudRing
} from "@/lib/mock-api/types";

import PriorityBadge from "@/components/complaint/PriorityBadge";
import FinancialTrailFlowchart from "@/components/complaint/FinancialTrailFlowchart";
import ATMPredictionCard from "@/components/complaint/ATMPredictionCard";
import GoldenHourCountdown from "@/components/complaint/GoldenHourCountdown";
import FraudRingAlert from "@/components/complaint/FraudRingAlert";
import LegalTemplateDrawer from "@/components/complaint/LegalTemplateDrawer";
import EvidenceCollector from "@/components/complaint/EvidenceCollector";

export const Route = createFileRoute("/io-complaint/$id")({
  head: () => ({
    meta: [
      { title: "Complaint Investigation Dossier · CyberShield AI" },
      {
        name: "description",
        content: "Investigative cyber-fraud dossier with financial trail and ATM prediction.",
      },
    ],
  }),
  component: IOComplaintDetailPage,
});

function IOComplaintDetailPage() {
  const { id } = useParams({ from: "/io-complaint/$id" });
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountFlags, setAccountFlags] = useState<Record<string, AccountFlag>>({});
  const [atmPredictions, setAtmPredictions] = useState<AtmPrediction[]>([]);
  const [fraudRing, setFraudRing] = useState<FraudRing | null>(null);
  const [loading, setLoading] = useState(true);

  // Legal Drawer state
  const [isLegalDrawerOpen, setIsLegalDrawerOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<
    "FREEZE_REQUEST" | "CCTV_REQUEST" | "LOOKOUT_NOTICE"
  >("FREEZE_REQUEST");
  const [selectedAtm, setSelectedAtm] = useState<AtmPrediction | undefined>();

  // Freeze action state
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const all = await getComplaints();
      let target = await getComplaintById(id);
      if (!target && all.length > 0) {
        target = all[0] ?? null;
      }

      if (target) {
        setComplaint(target);
        setFrozen(target.freeze_status === "FROZEN");

        // Financial trail
        const trail = await getTransactionTrail(target.utr);
        setTransactions(trail);

        // Mule account flags
        const flagsMap: Record<string, AccountFlag> = {};
        const muleAccounts = new Set<string>();
        if (target.mule_account) muleAccounts.add(target.mule_account);
        trail.forEach((tx) => muleAccounts.add(tx.to_account));

        for (const acc of Array.from(muleAccounts)) {
          const flag = await getAccountFlags(acc);
          if (flag) flagsMap[acc] = flag;
        }
        setAccountFlags(flagsMap);

        // ATM predictions
        const atms = rankAtms(
          target.mule_kyc_lat,
          target.mule_kyc_lon,
          target.fraud_timestamp,
          3
        );
        setAtmPredictions(atms);

        // Rings
        const rings = detectRings(all);
        const ring = rings.find((r) => r.complaint_ids.includes(target!.complaint_id));
        if (ring) {
          setFraudRing(ring);
        }
      }
      setLoading(false);
    }

    loadData();
  }, [id]);

  const handleOpenLegalDrawer = (
    type: "FREEZE_REQUEST" | "CCTV_REQUEST" | "LOOKOUT_NOTICE",
    atm?: AtmPrediction
  ) => {
    setLegalDocType(type);
    setSelectedAtm(atm);
    setIsLegalDrawerOpen(true);
  };

  const handleQuickFreeze = () => {
    if (!complaint) return;
    setFrozen(true);
    appendAudit({
      timestamp: new Date().toISOString(),
      actor: "Investigating Officer (IO-104)",
      action: "CFCFRMS_FREEZE_DISPATCHED",
      complaint_id: complaint.complaint_id,
      detail: `Emergency Sec 102 CrPC freeze order issued for A/C ${complaint.mule_account} (${complaint.mule_bank}) — ₹${complaint.fraud_amount.toLocaleString("en-IN")}`,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
          <p className="text-sm font-medium">Assembling cyber-investigation dossier...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-slate-400">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <p className="text-base font-semibold text-slate-200">Complaint Not Found</p>
          <Link
            to="/io-dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Model SHAP factor evaluation
  const scored = scorePriority(complaint);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/io-dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to IO Queue</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Status: <span className="text-slate-300 font-semibold">{complaint.status}</span>
            </span>
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="font-mono text-lg font-bold text-slate-100">
                  {complaint.complaint_id}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700">
                  NCRP Ack: {complaint.ncrp_ack_id}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {complaint.fraud_type}
                </span>
                <PriorityBadge
                  tier={complaint.priority_tier}
                  score={complaint.priority_score}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Victim Name</span>
                  <span className="text-slate-200 font-semibold">{complaint.victim_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Siphoned Amount</span>
                  <span className="text-slate-100 font-mono font-bold text-sm">
                    ₹{complaint.fraud_amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Transaction UTR</span>
                  <span className="text-slate-200 font-mono text-[11px] truncate block max-w-[180px]">
                    {complaint.utr}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Assigned Cyber Unit</span>
                  <span className="text-slate-200 font-semibold">{complaint.assigned_unit}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Station */}
            <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={handleQuickFreeze}
                disabled={frozen}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                  frozen
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 hover:scale-[1.02]"
                }`}
              >
                <Snowflake className="w-4 h-4" />
                {frozen ? "Mule Account Frozen" : "Emergency Sec 102 Freeze"}
              </button>

              <button
                type="button"
                onClick={() => handleOpenLegalDrawer("FREEZE_REQUEST")}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                Statutory Notice Drafter
              </button>
            </div>
          </div>
        </div>

        {/* Live Golden Hour Countdown */}
        <GoldenHourCountdown
          fraudTimestamp={complaint.fraud_timestamp}
          windowHours={4}
        />

        {/* Organized Fraud Ring Alert if part of cluster */}
        {fraudRing && (
          <FraudRingAlert
            ring={fraudRing}
            currentComplaintId={complaint.complaint_id}
          />
        )}

        {/* Financial Trail Flowchart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Multi-Hop Financial Transaction Trail
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              CFCFRMS Switch Trace · {transactions.length} Hops Identified
            </span>
          </div>

          <FinancialTrailFlowchart
            transactions={transactions}
            accountFlags={accountFlags}
          />
        </div>

        {/* 2-Column: Predicted ATM Cash-outs & SHAP Scoring Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ATM Predictions (2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Predicted ATM Cash-out Locations
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Top 3 Candidate ATMs · Spatial & Temporal Heuristic
              </span>
            </div>

            <div className="space-y-4">
              {atmPredictions.map((pred) => (
                <ATMPredictionCard
                  key={pred.atm_id}
                  prediction={pred}
                  complaint={complaint}
                  onOpenLegalDrawer={handleOpenLegalDrawer}
                />
              ))}
            </div>
          </div>

          {/* Explainability & SHAP Factors (1 column) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Explainable Risk SHAP Breakdown
              </h3>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg text-xs space-y-4">
              <div>
                <span className="text-slate-500 block text-[11px]">Recommended Triage Directive</span>
                <p className="text-slate-200 font-medium mt-1 leading-snug">
                  {scored.recommended_action}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-slate-400 font-semibold block mb-2 text-[11px] uppercase tracking-wider">
                  Top Feature Contributions:
                </span>
                <div className="space-y-2.5">
                  {scored.shap_factors.map((factor, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div className="flex items-center justify-between font-medium text-slate-200 mb-1">
                        <span>{factor.label}</span>
                        <span
                          className={`font-mono font-bold ${
                            factor.direction === "increase" ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {factor.direction === "increase" ? "+" : "-"}
                          {factor.impact_pct}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Observed: <strong className="text-slate-300">{factor.value}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 leading-relaxed">
                Deterministic XGBoost feature weights trained on simulated historical complaint datasets. Zero opaque black-box inference.
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Vault & Chain of Custody */}
        <EvidenceCollector complaint={complaint} />

        {/* Legal Template Drawer Component */}
        <LegalTemplateDrawer
          isOpen={isLegalDrawerOpen}
          onClose={() => setIsLegalDrawerOpen(false)}
          complaint={complaint}
          initialType={legalDocType}
          selectedAtm={selectedAtm}
        />
      </div>
    </DashboardLayout>
  );
}
