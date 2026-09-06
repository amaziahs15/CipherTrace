import React from "react";
import { Link } from "@tanstack/react-router";
import { Network, AlertTriangle, ArrowRight, ShieldCheck, Layers } from "lucide-react";
import type { FraudRing } from "@/lib/mock-api/types";

interface FraudRingAlertProps {
  ring: FraudRing;
  currentComplaintId: string;
}

export default function FraudRingAlert({ ring, currentComplaintId }: FraudRingAlertProps) {
  return (
    <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Organized Fraud Ring Detected
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {ring.cluster_id}
              </span>
            </div>
            <h4 className="text-base font-semibold text-slate-100 mt-0.5">
              {ring.ring_label}
            </h4>
          </div>
        </div>

        <Link
          to="/fraud-rings"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors w-fit"
        >
          <span>View Cluster Graph</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        This complaint is strongly linked to <strong className="text-amber-300">{ring.linked_complaint_count} other cases</strong> across state jurisdictions via shared mule infrastructure (Master Account: <code className="text-slate-200 bg-black/40 px-1 py-0.5 rounded">{ring.master_account}</code>).
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
        <div>
          <span className="text-slate-500 text-[11px] block">Total Siphoned</span>
          <span className="text-slate-200 font-bold font-mono">
            ₹{ring.total_amount.toLocaleString("en-IN")}
          </span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Linked Complaints</span>
          <span className="text-slate-200 font-bold">{ring.linked_complaint_count} FIRs / NCRP</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Mule Nodes</span>
          <span className="text-slate-200 font-bold">{ring.mule_accounts.length} Identified</span>
        </div>
        <div>
          <span className="text-slate-500 text-[11px] block">Joint FIR Status</span>
          <span className="text-amber-400 font-medium flex items-center gap-1">
            {ring.consolidated ? "Consolidated" : "Action Recommended"}
          </span>
        </div>
      </div>
    </div>
  );
}
