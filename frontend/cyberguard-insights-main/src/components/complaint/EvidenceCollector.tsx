import React, { useState, useEffect, useRef } from "react";
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
  const [toleranceMinutes, setToleranceMinutes] = useState<number>(15);
  const loggedMismatchesRef = useRef<Set<string>>(new Set());

  const getMinuteDifference = (collectedAt: string, fraudTimestamp: string) => {
    const d1 = new Date(collectedAt).getTime();
    const d2 = new Date(fraudTimestamp).getTime();
    if (isNaN(d1) || isNaN(d2)) return 0;
    return Math.abs(Math.round((d1 - d2) / (60 * 1000)));
  };

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
    {
      evidence_id: `EVD-${complaint.complaint_id}-03`,
      complaint_id: complaint.complaint_id,
      type: "CCTV_CLIP",
      description: `ATM Kiosk Overhead Camera Footage — Sector 12 ATM #04`,
      hash: "a4f81c9b2e6789123456789abcdef0123456789abcdef0123456789abcdef012",
      collected_at: new Date(new Date(complaint.fraud_timestamp).getTime() + 8 * 60000).toISOString(),
      collected_by: "Branch Security Office",
      chain_of_custody: [
        {
          timestamp: new Date(new Date(complaint.fraud_timestamp).getTime() + 8 * 60000).toISOString(),
          officer: "IO-104 (Sub-Inspector)",
          action: "COLLECTED",
        },
      ],
    },
    {
      evidence_id: `EVD-${complaint.complaint_id}-04`,
      complaint_id: complaint.complaint_id,
      type: "CALL_LOG",
      description: `Suspect VoIP Gateway Intercept & Call Detail Record (CDR)`,
      hash: "d3c107dbc25c2c864d3885221e7658d2a6f821af0eef0cf47ef42ca95da31a44",
      collected_at: new Date(new Date(complaint.fraud_timestamp).getTime() - 42 * 60000).toISOString(),
      collected_by: "Telecom Circle Nodal Desk",
      chain_of_custody: [
        {
          timestamp: new Date(new Date(complaint.fraud_timestamp).getTime() - 42 * 60000).toISOString(),
          officer: "Telecom Nodal Cell",
          action: "COLLECTED",
        },
      ],
    },
  ]);

  // Evaluate initial items and flag mismatches once
  useEffect(() => {
    evidenceItems.forEach((item) => {
      if (item.type === "CCTV_CLIP" || item.type === "CALL_LOG") {
        const diffMinutes = getMinuteDifference(item.collected_at, complaint.fraud_timestamp);
        if (diffMinutes > toleranceMinutes) {
          if (!loggedMismatchesRef.current.has(item.evidence_id)) {
            loggedMismatchesRef.current.add(item.evidence_id);
            appendAudit({
              timestamp: new Date().toISOString(),
              actor: "IO-104 (Evidence Vault)",
              action: "EVIDENCE_TIMESTAMP_MISMATCH_FLAGGED",
              complaint_id: complaint.complaint_id,
              detail: `Timestamp mismatch flagged for ${item.evidence_id} (${item.type}): difference of ${diffMinutes} min from fraud event exceeds tolerance of ${toleranceMinutes} min.`,
            });
          }
        }
      }
    });
  }, [evidenceItems, toleranceMinutes, complaint.fraud_timestamp, complaint.complaint_id]);

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

    // Immediate timestamp verification for new CCTV / Call Log items
    if (newType === "CCTV_CLIP" || newType === "CALL_LOG") {
      const diffMinutes = getMinuteDifference(now, complaint.fraud_timestamp);
      if (diffMinutes > toleranceMinutes) {
        if (!loggedMismatchesRef.current.has(newId)) {
          loggedMismatchesRef.current.add(newId);
          appendAudit({
            timestamp: now,
            actor: "IO-104 (Evidence Vault)",
            action: "EVIDENCE_TIMESTAMP_MISMATCH_FLAGGED",
            complaint_id: complaint.complaint_id,
            detail: `Timestamp mismatch flagged for ${newId} (${newType}): difference of ${diffMinutes} min from fraud event exceeds tolerance of ${toleranceMinutes} min.`,
          });
        }
      }
    }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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

        <div className="flex flex-wrap items-center gap-3">
          {/* Editable camera clock tolerance input */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <label className="text-[11px] text-slate-300 whitespace-nowrap">
              Camera clock tolerance (minutes):
            </label>
            <input
              type="number"
              min={1}
              max={720}
              value={toleranceMinutes}
              onChange={(e) => setToleranceMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-14 bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs rounded px-1.5 py-0.5 text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {evidenceItems.length} Artifacts Sealed
          </span>
        </div>
      </div>

      {/* Explanatory Caption */}
      <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Physical device clock verification flags CCTV footage and call record timestamps that diverge from the reported fraud event beyond the allowable tolerance.</span>
      </p>

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
                {(item.type === "CCTV_CLIP" || item.type === "CALL_LOG") && (() => {
                  const diffMinutes = getMinuteDifference(item.collected_at, complaint.fraud_timestamp);
                  const isVerified = diffMinutes <= toleranceMinutes;
                  return isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      ✓ Timestamp Verified (Δ {diffMinutes} min)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      ⚠ Timestamp Mismatch (Δ {diffMinutes} min from fraud event)
                    </span>
                  );
                })()}
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
