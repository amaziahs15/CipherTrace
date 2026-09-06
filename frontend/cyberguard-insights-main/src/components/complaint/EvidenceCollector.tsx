import React, { useState, useEffect } from "react";
import {
  Shield,
  FileCheck,
  Hash,
  Clock,
  User,
  Plus,
  Lock,
  ExternalLink,
  Camera,
  CreditCard,
  FileText
} from "lucide-react";
import type { Complaint, EvidenceItem } from "@/lib/mock-api/types";
import { getAuditLog, appendAudit } from "@/lib/sessionAuditStore";

interface EvidenceCollectorProps {
  complaint: Complaint;
}

export default function EvidenceCollector({ complaint }: EvidenceCollectorProps) {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([
    {
      evidence_id: `EVD-${complaint.complaint_id}-01`,
      complaint_id: complaint.complaint_id,
      type: "TRANSACTION_LOG",
      description: `NPCI/CFCFRMS Payment Switch Trail for UTR ${complaint.utr}`,
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      collected_at: complaint.fraud_timestamp,
      collected_by: "NCRP Gateway API Sync",
      chain_of_custody: [
        {
          timestamp: complaint.fraud_timestamp,
          officer: "System Automated Import",
          action: "COLLECTED",
        },
        {
          timestamp: new Date().toISOString(),
          officer: "IO-104 (Sub-Inspector)",
          action: "ACCESSED",
        },
      ],
    },
    {
      evidence_id: `EVD-${complaint.complaint_id}-02`,
      complaint_id: complaint.complaint_id,
      type: "KYC_DOCUMENT",
      description: `Mule Account Master KYC — Bank: ${complaint.mule_bank}, A/C: ${complaint.mule_account}`,
      hash: "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
      collected_at: new Date(Date.now() - 3600000).toISOString(),
      collected_by: "I4C Suspect Registry Service",
      chain_of_custody: [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          officer: "I4C Nodal Integration",
          action: "COLLECTED",
        },
      ],
    },
  ]);

  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<EvidenceItem["type"]>("CCTV_CLIP");

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    // Pseudo-hash
    const hash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    const newId = `EVD-${complaint.complaint_id}-${String(evidenceItems.length + 1).padStart(2, "0")}`;
    const now = new Date().toISOString();

    const item: EvidenceItem = {
      evidence_id: newId,
      complaint_id: complaint.complaint_id,
      type: newType,
      description: newDesc,
      hash,
      collected_at: now,
      collected_by: "IO-104 (Current Session)",
      chain_of_custody: [
        {
          timestamp: now,
          officer: "IO-104 (Sub-Inspector)",
          action: "COLLECTED",
        },
      ],
    };

    setEvidenceItems((prev) => [...prev, item]);
    appendAudit({
      timestamp: now,
      actor: "IO-104",
      action: "EVIDENCE_SEALED",
      complaint_id: complaint.complaint_id,
      detail: `New evidence item ${newId} (${newType}) secured with SHA-256 seal: ${hash.slice(0, 16)}...`,
    });

    setNewDesc("");
  };

  const getTypeIcon = (type: EvidenceItem["type"]) => {
    switch (type) {
      case "CCTV_CLIP":
        return <Camera className="w-4 h-4 text-indigo-400" />;
      case "TRANSACTION_LOG":
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case "KYC_DOCUMENT":
        return <FileCheck className="w-4 h-4 text-blue-400" />;
      default:
        return <FileText className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Digital Evidence Vault & Chain of Custody
            </h3>
            <p className="text-xs text-slate-400">
              Sec 65B Indian Evidence Act compliant hash-chained audit manifest
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {evidenceItems.length} Artifacts Sealed
        </span>
      </div>

      {/* Items list */}
      <div className="space-y-3 mb-5">
        {evidenceItems.map((item) => (
          <div
            key={item.evidence_id}
            className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(item.type)}
                <span className="font-mono font-bold text-slate-200">{item.evidence_id}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {item.type.replace("_", " ")}
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Secured: {new Date(item.collected_at).toLocaleString("en-IN")}
              </span>
            </div>

            <p className="text-slate-300 font-medium mb-2">{item.description}</p>

            <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 overflow-x-auto mb-2.5">
              <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-500 select-none">SHA-256:</span>
              <span className="text-indigo-300">{item.hash}</span>
            </div>

            {/* Custody trail */}
            <div className="border-t border-slate-900 pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">Chain of Custody:</span>
              {item.chain_of_custody.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-300">{c.officer}</span>
                  <span className="text-slate-500">({c.action})</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Form to attach new mock evidence */}
      <form onSubmit={handleAddEvidence} className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
        <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          Seal Additional Case Artifact
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as EvidenceItem["type"])}
            className="sm:col-span-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="CCTV_CLIP">CCTV Footage Clip</option>
            <option value="TRANSACTION_LOG">Bank Transaction Log</option>
            <option value="KYC_DOCUMENT">Aadhaar/PAN KYC Dossier</option>
            <option value="CALL_LOG">CDR (Call Detail Record)</option>
          </select>
          <input
            type="text"
            placeholder="Evidence description / source reference..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="sm:col-span-2 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newDesc.trim()}
            className="sm:col-span-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors flex items-center justify-center gap-1"
          >
            <Lock className="w-3 h-3" />
            Hash & Seal
          </button>
        </div>
      </form>
    </div>
  );
}
