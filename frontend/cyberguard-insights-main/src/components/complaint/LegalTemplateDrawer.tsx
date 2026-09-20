import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Printer,
  FileCheck
} from "lucide-react";
import type { Complaint, AtmPrediction, LegalDocument } from "@/lib/mock-api/types";
import {
  generateFreezeRequest,
  generateCCTVRequest,
  generateLookoutNotice,
} from "@/lib/models/legal-template-generator";
import { appendAudit } from "@/lib/sessionAuditStore";

interface LegalTemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
  initialType?: "FREEZE_REQUEST" | "CCTV_REQUEST" | "LOOKOUT_NOTICE" | undefined;
  selectedAtm?: AtmPrediction | undefined;
}

export default function LegalTemplateDrawer({
  isOpen,
  onClose,
  complaint,
  initialType = "FREEZE_REQUEST",
  selectedAtm,
}: LegalTemplateDrawerProps) {
  const [docType, setDocType] = useState<"FREEZE_REQUEST" | "CCTV_REQUEST" | "LOOKOUT_NOTICE">(
    initialType
  );
  const [copied, setCopied] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (initialType) {
      setDocType(initialType);
    }
  }, [initialType]);

  if (!isOpen) return null;

  // Generate current document
  let doc: LegalDocument;
  if (docType === "FREEZE_REQUEST") {
    doc = generateFreezeRequest(complaint);
  } else if (docType === "CCTV_REQUEST") {
    // fallback synthetic ATM if none selected
    const atm: AtmPrediction = selectedAtm || {
      atm_id: "ATM-DEFAULT-001",
      bank: complaint.mule_bank || "SBI",
      address: "Primary Circle ATM, Vicinity of Mule KYC",
      lat: complaint.mule_kyc_lat,
      lon: complaint.mule_kyc_lon,
      cctv_available: true,
      cctv_retention_days: 30,
      cctv_spec: "1080p 15fps H.264 IP Camera",
      historical_fraud_count: 5,
      nodal_officer_name: "Amitabh Verma",
      nodal_officer_phone: "+91-98765-43210",
      nodal_officer_email: "nodal.cyber@bank.in",
      confidence_pct: 88,
      distance_km: 1.2,
      estimated_window_start: new Date(Date.now() + 30 * 60000).toISOString(),
      estimated_window_end: new Date(Date.now() + 180 * 60000).toISOString(),
      rank: 1,
      scoring_factors: ["High vicinity score"],
    };
    doc = generateCCTVRequest(complaint, atm);
  } else {
    doc = generateLookoutNotice(complaint);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([doc.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${docType.toLowerCase()}-${complaint.complaint_id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogAudit = () => {
    appendAudit({
      timestamp: new Date().toISOString(),
      actor: "Investigating Officer (IO-104)",
      action: "LEGAL_DRAFT_GENERATED",
      complaint_id: complaint.complaint_id,
      detail: `Generated draft ${docType} for complaint ${complaint.complaint_id}. Subject to manual IO review.`,
    });
    setLogged(true);
    setTimeout(() => setLogged(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">
                Legal Notice & Statutory Order Generator
              </h3>
              <p className="text-xs text-slate-400">
                Deterministic statutory templates · No AI hallucination risk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
          <button
            type="button"
            onClick={() => setDocType("FREEZE_REQUEST")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              docType === "FREEZE_REQUEST"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            Bank Freeze (Sec 102)
          </button>
          <button
            type="button"
            onClick={() => setDocType("CCTV_REQUEST")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              docType === "CCTV_REQUEST"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            CCTV Preservation (Sec 91)
          </button>
          <button
            type="button"
            onClick={() => setDocType("LOOKOUT_NOTICE")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              docType === "LOOKOUT_NOTICE"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            Lookout Circular (Sec 41A)
          </button>
        </div>

        {/* Prominent Mandatory Compliance & Officer Review Warning Strip */}
        <div className="p-4 bg-amber-500/15 border-b border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-1">
            <div className="font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <span>⚠ MANDATORY STATUTORY DRAFT COMPLIANCE NOTICE</span>
            </div>
            <p className="text-slate-100 font-semibold text-xs leading-snug">
              DRAFT — Requires officer review and signature before any real-world use. Not connected to live government or banking systems.
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              This document is a machine-assembled draft based on standard CrPC / BNSS provisions. It must be verified, signed, and stamped by the designated Investigating Officer prior to statutory transmission to banks or surveillance teams.
            </p>
            {doc.validation_errors.length > 0 && (
              <div className="mt-2 text-rose-400">
                <strong>Validation Issues Found:</strong>
                <ul className="list-disc ml-4 mt-0.5">
                  {doc.validation_errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Content Preview Container */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs relative">
          {/* Prominent Watermark */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-10 select-none text-center rotate-[-20deg] text-slate-300 px-6">
            <span className="text-5xl font-black tracking-widest uppercase">DRAFT · NOT FOR DISPATCH</span>
            <span className="text-xs font-mono font-bold mt-2 text-amber-400">REQUIRES OFFICER REVIEW &amp; SIGNATURE</span>
          </div>
          <pre className="whitespace-pre-wrap text-slate-300 leading-relaxed font-mono relative z-10">
            {doc.content}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Complaint Ref: <span className="text-slate-300 font-mono">{complaint.complaint_id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Text"}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>

            <button
              type="button"
              onClick={handleLogAudit}
              disabled={logged}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                logged
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              {logged ? "Logged to Session" : "Log Draft to CCTNS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
