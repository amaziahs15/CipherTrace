import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Network,
  Radio,
  Building2,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Users,
  Layers,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  Briefcase
} from "lucide-react";
import { getComplaints } from "@/lib/mock-api/ncrp";
import { detectRings } from "@/lib/models/fraud-ring-detector";
import { fileFir } from "@/lib/mock-api/cctns";
import { appendAudit } from "@/lib/sessionAuditStore";
import type { Complaint, FraudRing } from "@/lib/mock-api/types";

export const Route = createFileRoute("/fraud-rings")({
  head: () => ({
    meta: [
      { title: "Organized Cyber Fraud Rings · CyberShield AI" },
      {
        name: "description",
        content: "Multi-jurisdiction syndicate clustering and joint FIR consolidation.",
      },
    ],
  }),
  component: FraudRingsPage,
});

function FraudRingsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [rings, setRings] = useState<FraudRing[]>([]);
  const [consolidatedRings, setConsolidatedRings] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedRing, setSelectedRing] = useState<FraudRing | null>(null);

  useEffect(() => {
    getComplaints().then((data) => {
      setComplaints(data);
      const detected = detectRings(data, 2);
      setRings(detected);
      if (detected.length > 0) {
        setSelectedRing(detected[0] ?? null);
      }
      setLoading(false);
    });
  }, []);

  const handleConsolidateFIR = async (ring: FraudRing) => {
    const firNum = `FIR/2026/CYBER/DL/${Math.floor(100000 + Math.random() * 900000)}`;

    await fileFir({
      fir_number: firNum,
      complaint_ids: ring.complaint_ids,
      filing_officer: "Investigating Officer (IO-104)",
      station: "Central Cyber Crime Police Station, Special Cell",
      filed_at: new Date().toISOString(),
      sections: [
        "66C Information Technology Act 2000 (Identity Theft)",
        "66D Information Technology Act 2000 (Cheating by Personation)",
        "420 Indian Penal Code (Cheating & Dishonestly Inducing Delivery)",
        "120B Indian Penal Code (Criminal Conspiracy)",
      ],
    });

    appendAudit({
      timestamp: new Date().toISOString(),
      actor: "Investigating Officer (IO-104)",
      action: "JOINT_FIR_CONSOLIDATED",
      complaint_id: ring.complaint_ids[0] ?? null,
      detail: `Consolidated ${ring.linked_complaint_count} multi-state complaints under joint FIR: ${firNum} for Syndicate [${ring.cluster_id}]`,
    });

    setConsolidatedRings((prev) => new Set([...prev, ring.cluster_id]));
  };

  const getComplaintsForRing = (ring: FraudRing) => {
    return complaints.filter((c) => ring.complaint_ids.includes(c.complaint_id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
              <Network className="w-4 h-4" />
              <span>Cross-Jurisdictional Graph Clustering</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
              Organized Cyber Fraud Rings & Syndicates
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Automated Disjoint-Set Union (DSU) graph linking disparate NCRP complaints by shared mule accounts, phone fingerprints, and IFSC clusters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <strong className="text-amber-400">{rings.length}</strong> Syndicates Detected
            </span>
          </div>
        </div>

        {/* 2-Column Layout: Ring Cards & Ring Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ring List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Detected Clusters ({rings.length})
            </h3>

            {rings.map((ring) => {
              const isConsolidated =
                ring.consolidated || consolidatedRings.has(ring.cluster_id);
              const isSelected = selectedRing?.cluster_id === ring.cluster_id;

              return (
                <div
                  key={ring.cluster_id}
                  onClick={() => setSelectedRing(ring)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {ring.cluster_id}
                    </span>
                    {isConsolidated ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Joint FIR Filed
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        Pending Consolidation
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-200 mb-2">
                    {ring.ring_label}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Linked Complaints</span>
                      <span className="text-slate-200 font-bold font-mono">
                        {ring.linked_complaint_count} NCRP Cases
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Total Siphoned</span>
                      <span className="text-slate-100 font-bold font-mono">
                        ₹{ring.total_amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    Master Mule: <span className="text-slate-300">{ring.master_account}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ring Detailed Inspector (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedRing ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                {/* Syndicate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {selectedRing.cluster_id}
                      </span>
                      <span className="text-xs text-slate-400">
                        Detected: {new Date(selectedRing.detected_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {selectedRing.ring_label}
                    </h2>
                  </div>

                  {/* Consolidate FIR Button */}
                  <div>
                    {selectedRing.consolidated || consolidatedRings.has(selectedRing.cluster_id) ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Joint FIR Registered</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConsolidateFIR(selectedRing)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md hover:shadow-amber-600/30 hover:scale-[1.02]"
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Consolidate into Joint FIR</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Syndicate Value</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      ₹{selectedRing.total_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Linked NCRP Cases</span>
                    <span className="text-lg font-bold font-mono text-slate-100">
                      {selectedRing.linked_complaint_count}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Unique Mules</span>
                    <span className="text-lg font-bold font-mono text-indigo-400">
                      {selectedRing.mule_accounts.length}
                    </span>
                  </div>
                </div>

                {/* Mule Accounts Section */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Identified Mule Accounts in Syndicate
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRing.mule_accounts.map((acc, idx) => (
                      <span
                        key={idx}
                        className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
                          acc === selectedRing.master_account
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold ring-1 ring-amber-500/30"
                            : "bg-slate-950 text-slate-300 border-slate-800"
                        }`}
                      >
                        {acc} {acc === selectedRing.master_account && "★ (Master)"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Linked Complaints Table */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Linked NCRP Complaints Across Jurisdictions
                  </h4>

                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Complaint ID</th>
                          <th className="p-2.5">Victim</th>
                          <th className="p-2.5">Amount</th>
                          <th className="p-2.5">Mule Account</th>
                          <th className="p-2.5 text-right">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {getComplaintsForRing(selectedRing).map((c) => (
                          <tr key={c.complaint_id} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-mono font-bold text-slate-200">
                              {c.complaint_id}
                            </td>
                            <td className="p-2.5 text-slate-300">{c.victim_name}</td>
                            <td className="p-2.5 font-mono text-slate-100">
                              ₹{c.fraud_amount.toLocaleString("en-IN")}
                            </td>
                            <td className="p-2.5 font-mono text-slate-400">{c.mule_account}</td>
                            <td className="p-2.5 text-right">
                              <Link
                                to="/io-complaint/$id"
                                params={{ id: c.complaint_id }}
                                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                              >
                                View <ChevronRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                Select a syndicate from the list to inspect its graph clusters.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
