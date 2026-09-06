// ─── Multi-Agency Response Chain Visual Component ──────────────────────────
// Step-flow visualizing sequential agency intelligence handoffs (I4C -> LEA -> Bank -> 1930)

import React, { useState } from "react";
import {
  Shield,
  Radio,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  Info,
  Check,
} from "lucide-react";

export type AgencyStage = {
  id: string;
  name: string;
  agency: string;
  timestamp: string;
  status: "completed" | "in_progress" | "pending";
  details: string;
};

export function generateAgencyChain(
  baseTimestampStr: string,
  city: string,
  bank: string,
  lea: string,
): AgencyStage[] {
  let baseTime = new Date();
  const timeMatch = baseTimestampStr.match(/(\d+):(\d+):?(\d+)?\s*(AM|PM)?/i);

  let hh = 22, mm = 38, ss = 2;
  if (timeMatch) {
    hh = parseInt(timeMatch[1], 10);
    mm = parseInt(timeMatch[2], 10);
    if (timeMatch[3]) ss = parseInt(timeMatch[3], 10);
    if (timeMatch[4]?.toUpperCase() === "PM" && hh < 12) hh += 12;
    if (timeMatch[4]?.toUpperCase() === "AM" && hh === 12) hh = 0;
  }
  baseTime.setHours(hh, mm, ss);

  const formatTime = (dt: Date) =>
    dt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const t1 = new Date(baseTime.getTime());
  const t2 = new Date(baseTime.getTime() + 2000); // +2s
  const t3 = new Date(baseTime.getTime() + 5000); // +5s
  const t4 = new Date(baseTime.getTime() + 9000); // +9s

  return [
    {
      id: "stage-1",
      name: "I4C Gateway Received",
      agency: "National Cybercrime Portal (I4C)",
      timestamp: formatTime(t1),
      status: "completed",
      details: "High-risk incident ingest & SHA-256 hash log registered",
    },
    {
      id: "stage-2",
      name: "State LEA Notified",
      agency: lea || `${city} Cyber Police Command`,
      timestamp: formatTime(t2),
      status: "completed",
      details: "Geospatial patrol vectoring dispatched to regional unit",
    },
    {
      id: "stage-3",
      name: "Bank Fraud Desk Alerted",
      agency: `${bank} FRM Operations Desk`,
      timestamp: formatTime(t3),
      status: "completed",
      details: "Emergency debit freeze & ATM card blocking directive sent",
    },
    {
      id: "stage-4",
      name: "1930 Helpline Notified",
      agency: "National 1930 Emergency Response Desk",
      timestamp: formatTime(t4),
      status: "completed",
      details: "Golden hour interdiction docket logged across jurisdictions",
    },
  ];
}

interface MultiAgencyResponseChainProps {
  timestamp: string;
  city: string;
  bank: string;
  lea: string;
  className?: string;
}

export default function MultiAgencyResponseChain({
  timestamp,
  city,
  bank,
  lea,
  className = "",
}: MultiAgencyResponseChainProps) {
  const [expanded, setExpanded] = useState(false);

  const stages = generateAgencyChain(timestamp, city, bank, lea);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Expand/Collapse Trigger */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="group flex items-center justify-between w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground hover:border-primary/40"
      >
        <div className="flex items-center gap-2">
          <Layers className="size-3.5 text-primary transition-transform group-hover:scale-110" />
          <span>Multi-Agency Response Chain</span>
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-400">
            4/4 Stages Verified
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <span>{expanded ? "Hide Flow" : "Expand Handoff"}</span>
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </div>
      </button>

      {/* Expanded Step-Flow Visual */}
      {expanded && (
        <div className="rounded-2xl border border-border/60 bg-card/90 p-4 space-y-4 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-lg bg-primary/20 text-primary">
                <Layers className="size-3.5" />
              </span>
              <h4 className="font-display text-xs font-bold text-foreground">
                Sequential Inter-Agency Handoff Stream
              </h4>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              Cross-Jurisdictional Protocol
            </span>
          </div>

          {/* Sequential Step Timeline */}
          <div className="relative pl-4 space-y-4">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[27px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-cyan-500 via-emerald-500 to-primary/60" />

            {stages.map((st, idx) => (
              <div key={st.id} className="relative flex items-start gap-3 text-xs">
                {/* Step Node Icon */}
                <div className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-black ring-4 ring-card shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  <Check className="size-3.5 stroke-[3]" />
                </div>

                {/* Step Content Card */}
                <div className="flex-1 rounded-xl border border-border/50 bg-muted/20 p-2.5 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{st.name}</span>
                      <span className="rounded bg-primary/10 border border-primary/30 px-1.5 py-0.2 font-mono text-[9px] text-primary">
                        Stage {idx + 1}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Clock className="size-3 text-emerald-400" />
                      {st.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-cyan-400">
                    {st.agency}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {st.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Requirement 4: Simulated Dispatch Label */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
            <Info className="size-3.5 text-primary shrink-0" />
            <span>Simulated dispatch chain for demonstration — production integrates with I4C's live gateway and state LEA systems.</span>
          </div>
        </div>
      )}
    </div>
  );
}
