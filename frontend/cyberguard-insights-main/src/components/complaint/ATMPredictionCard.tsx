import React, { useState } from "react";
import {
  MapPin,
  Camera,
  UserCheck,
  Phone,
  Mail,
  Send,
  FileText,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import type { AtmPrediction, Complaint } from "@/lib/mock-api/types";
import { appendAudit } from "@/lib/sessionAuditStore";

interface ATMPredictionCardProps {
  prediction: AtmPrediction;
  complaint: Complaint;
  onOpenLegalDrawer?: (type: "CCTV_REQUEST" | "LOOKOUT_NOTICE", atm?: AtmPrediction) => void;
}

export default function ATMPredictionCard({
  prediction,
  complaint,
  onOpenLegalDrawer,
}: ATMPredictionCardProps) {
  const [alertSent, setAlertSent] = useState(false);

  const handleSendAlert = () => {
    appendAudit({
      timestamp: new Date().toISOString(),
      actor: "Investigating Officer (Demo IO-104)",
      action: "ATM_ALERT_DISPATCHED",
      complaint_id: complaint.complaint_id,
      detail: `Alert dispatched to ${prediction.bank} Nodal Officer ${prediction.nodal_officer_name} (${prediction.nodal_officer_phone}) for ATM ${prediction.atm_id}`,
    });
    setAlertSent(true);
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-rose-500/20 text-rose-400 border-rose-500/40 ring-1 ring-rose-500/30";
      case 2:
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-slate-700">
      {/* Top Banner with Rank and Confidence */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getRankBadge(
              prediction.rank
            )}`}
          >
            Rank #{prediction.rank}
          </span>
          <span className="font-semibold text-slate-200 text-sm">{prediction.bank} ATM</span>
          <span className="text-xs font-mono text-slate-500">[{prediction.atm_id}]</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
          <span className="font-semibold text-sm">{prediction.confidence_pct}%</span>
          <span className="text-[10px] uppercase text-emerald-500/80">Confidence</span>
        </div>
      </div>

      {/* Address & Distance */}
      <div className="flex items-start gap-2 mb-3 text-slate-300 text-sm">
        <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium leading-snug">{prediction.address}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Approx. <span className="font-semibold text-slate-200">{prediction.distance_km.toFixed(1)} km</span> from mule KYC registered location
          </p>
        </div>
      </div>

      {/* Estimated Window & CCTV details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3 border-y border-slate-800/80 my-3 text-xs">
        <div className="flex items-start gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-slate-400 font-medium">Est. Withdrawal Window</div>
            <div className="text-slate-200 font-mono text-[11px] mt-0.5">
              {new Date(prediction.estimated_window_start).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              {" — "}
              {new Date(prediction.estimated_window_end).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Camera className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-slate-400 font-medium flex items-center gap-1">
              CCTV Surveillance
              {prediction.cctv_available ? (
                <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-500/10">Active</span>
              ) : (
                <span className="text-[10px] text-rose-400 font-semibold px-1 rounded bg-rose-500/10">Unavailable</span>
              )}
            </div>
            <div className="text-slate-300 text-[11px] mt-0.5">
              {prediction.cctv_spec} • {prediction.cctv_retention_days}d retention
            </div>
          </div>
        </div>
      </div>

      {/* Nodal Officer Contact */}
      <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/60 mb-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Bank Nodal Officer</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
          <span className="font-semibold text-slate-200">{prediction.nodal_officer_name}</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Phone className="w-3 h-3" /> {prediction.nodal_officer_phone}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Mail className="w-3 h-3" /> {prediction.nodal_officer_email}
          </span>
        </div>
      </div>

      {/* Heuristic Factors */}
      {prediction.scoring_factors && prediction.scoring_factors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prediction.scoring_factors.map((factor, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
            >
              {factor}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleSendAlert}
          disabled={alertSent}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            alertSent
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
              : "bg-rose-600 hover:bg-rose-500 text-white shadow-sm hover:shadow-rose-600/30"
          }`}
        >
          {alertSent ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Alert Dispatched
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Send Alert to Nodal
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onOpenLegalDrawer?.("CCTV_REQUEST", prediction)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-indigo-400" />
          Request CCTV (Sec 91)
        </button>

        <button
          type="button"
          onClick={() => onOpenLegalDrawer?.("LOOKOUT_NOTICE", prediction)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          Lookout Notice
        </button>
      </div>
    </div>
  );
}
