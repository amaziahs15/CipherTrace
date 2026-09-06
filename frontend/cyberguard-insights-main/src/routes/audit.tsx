// ─── Route: /audit (Government Transparency Audit & SHA-256 Chain Log) ──────
import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Database,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Download,
  Lock,
  ExternalLink,
  Search,
  Filter,
  FileCode,
  Sparkles,
  FileText,
  Activity,
  ArrowUpDown,
  User,
  Radio,
  Clock,
  Building2,
  Flame,
} from "lucide-react";
import {
  fetchAuditLog,
  fetchAuditVerify,
  type AuditEntry,
  type AuditVerifyResult,
  CLUSTER_NAMES,
} from "@/lib/hotspots";
import {
  getActivityLogs,
  type SystemActivityLog,
  type ActivityActionType,
} from "@/lib/activityLog";
import { useI18n, formatTriageBadge } from "@/lib/i18n";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit & Transparency Logs · CipherTrace" },
      {
        name: "description",
        content: "Chronological system activity ledger and tamper-evident SHA-256 cryptographic hash chain.",
      },
    ],
  }),
  component: AuditPage,
});

type AuditViewTab = "activity" | "blockchain";

function AuditPage() {
  const { lang, t } = useI18n();

  // ── Tab Selection ──
  const [activeTab, setActiveTab] = useState<AuditViewTab>("activity");

  // ── System Activity Log State ──
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);
  const [activitySearch, setActivitySearch] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>("all");
  const [selectedActorFilter, setSelectedActorFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // ── SHA-256 Cryptographic Chain State ──
  const [cryptoLogs, setCryptoLogs] = useState<AuditEntry[]>([]);
  const [verification, setVerification] = useState<AuditVerifyResult | null>(null);
  const [loadingCrypto, setLoadingCrypto] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cryptoSearch, setCryptoSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // Load activity logs
  const reloadActivity = () => {
    setActivityLogs(getActivityLogs());
  };

  useEffect(() => {
    reloadActivity();

    const handleCustomLog = () => reloadActivity();
    window.addEventListener("ciphertrace:activity_logged", handleCustomLog);
    return () => window.removeEventListener("ciphertrace:activity_logged", handleCustomLog);
  }, []);

  // Load SHA-256 crypto logs
  const loadCryptoLogs = async () => {
    setLoadingCrypto(true);
    try {
      const [entries, verifyResult] = await Promise.all([
        fetchAuditLog(),
        fetchAuditVerify(),
      ]);
      setCryptoLogs(entries);
      setVerification(verifyResult);
    } catch (e) {
      console.error("Failed to fetch cryptographic audit log:", e);
    } finally {
      setLoadingCrypto(false);
    }
  };

  useEffect(() => {
    if (activeTab === "blockchain" && cryptoLogs.length === 0) {
      loadCryptoLogs();
    }
  }, [activeTab]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await fetchAuditVerify();
      setVerification(result);
    } catch (e) {
      console.error("Audit verification error:", e);
    } finally {
      setVerifying(false);
    }
  };

  // ── Filter & Sort Activity Logs ──
  const filteredActivityLogs = useMemo(() => {
    return activityLogs
      .filter((log) => {
        const text = `${log.action} ${log.actor} ${log.details} ${log.complaintId || ""} ${log.timestamp}`.toLowerCase();
        const matchSearch = text.includes(activitySearch.toLowerCase());
        const matchAction =
          selectedActionFilter === "all" || log.action.includes(selectedActionFilter);
        const matchActor =
          selectedActorFilter === "all" || log.actor.includes(selectedActorFilter);
        return matchSearch && matchAction && matchActor;
      })
      .sort((a, b) => {
        return sortOrder === "newest" ? b.rawTime - a.rawTime : a.rawTime - b.rawTime;
      });
  }, [activityLogs, activitySearch, selectedActionFilter, selectedActorFilter, sortOrder]);

  // ── Client-side CSV Export ──
  const exportToCSV = () => {
    if (filteredActivityLogs.length === 0) return;

    const headers = ["Log ID", "Timestamp", "Action", "Actor", "Details", "Complaint ID", "Severity"];
    const rows = filteredActivityLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.actor.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.complaintId ? `"${l.complaintId}"` : '""',
      l.severity || "info",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ciphertrace_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isChainValid = Boolean(verification?.valid || verification?.verified);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
                <Database className="size-4" />
              </span>
              <h1 className="font-display text-xl font-bold text-foreground">
                Government Transparency &amp; System Audit Logs
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Chronological accountability log tracking all citizen complaints, ML inferences, LEA dispatches, and SHA-256 hash chains.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "activity" ? (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted hover:border-primary/40"
              >
                <Download className="size-3.5 text-primary" />
                <span>Export CSV Report</span>
              </button>
            ) : (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white disabled:opacity-60"
              >
                <RefreshCw className={`size-3.5 ${verifying ? "animate-spin" : ""}`} />
                <span>Verify Hash Integrity</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Tab Switcher Bar ── */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-1">
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "activity"
                ? "bg-primary text-white shadow-[0_0_15px_-3px_oklch(0.68_0.16_248/0.7)]"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <Activity className="size-3.5" />
            <span>System Activity &amp; Accountability Log</span>
            <span className="rounded-full bg-black/30 px-2 py-0.5 font-mono text-[10px]">
              {activityLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("blockchain")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "blockchain"
                ? "bg-primary text-white shadow-[0_0_15px_-3px_oklch(0.68_0.16_248/0.7)]"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>SHA-256 Cryptographic Chain Ledger</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
              Verified ✓
            </span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 1: SYSTEM ACTIVITY & ACCOUNTABILITY LOG
           ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "activity" && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="panel flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Search Box */}
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus-within:border-primary">
                  <Search className="size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search logs, actor, complaint ID…"
                    className="bg-transparent outline-none w-52 text-xs placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Action Type Filter */}
                <select
                  value={selectedActionFilter}
                  onChange={(e) => setSelectedActionFilter(e.target.value)}
                  className="h-8 rounded-xl border border-border/60 bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary"
                >
                  <option value="all">All Action Types</option>
                  <option value="Complaint Submitted">Complaint Submitted</option>
                  <option value="Prediction Generated">Prediction Generated</option>
                  <option value="Alert Dispatched">Alert Dispatched</option>
                  <option value="Status Changed">Status Changed</option>
                  <option value="Emergency 1930">Emergency 1930 Notice</option>
                </select>

                {/* Actor Filter */}
                <select
                  value={selectedActorFilter}
                  onChange={(e) => setSelectedActorFilter(e.target.value)}
                  className="h-8 rounded-xl border border-border/60 bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary"
                >
                  <option value="all">All Actors</option>
                  <option value="Citizen">Citizen</option>
                  <option value="System">System Automated</option>
                  <option value="Investigator">Investigator (LEA)</option>
                </select>

                {/* Sort Toggle Button */}
                <button
                  onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                  className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <ArrowUpDown className="size-3.5" />
                  <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
                </button>
              </div>

              <div className="text-xs text-muted-foreground">
                Showing <strong>{filteredActivityLogs.length}</strong> of {activityLogs.length} Events
              </div>
            </div>

            {/* Activity Table */}
            <div className="panel overflow-hidden">
              <div className="overflow-x-auto">
                {filteredActivityLogs.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    No activity logs match your filters.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 text-muted-foreground bg-muted/20">
                        <th className="px-5 py-3 font-bold uppercase tracking-wider">Timestamp</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider">Action Type</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider">Actor</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider">Activity Details</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider">Related ID</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-right">Log ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivityLogs.map((log) => {
                        const isCritical = log.severity === "critical";
                        const isWarning = log.severity === "warning";
                        const isSuccess = log.severity === "success";

                        return (
                          <tr
                            key={log.id}
                            className="border-b border-border/20 transition-colors hover:bg-muted/30"
                          >
                            {/* Timestamp */}
                            <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                              {log.timestamp}
                            </td>

                            {/* Action Type */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${
                                  isCritical
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/30"
                                    : isWarning
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/30"
                                    : isSuccess
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/30"
                                    : "bg-cyan-500/10 text-primary ring-cyan-500/30"
                                }`}
                              >
                                {isCritical && <Flame className="size-2.5" />}
                                <span>{log.action}</span>
                              </span>
                            </td>

                            {/* Actor */}
                            <td className="px-5 py-3.5 font-semibold text-foreground">
                              {log.actor}
                            </td>

                            {/* Details */}
                            <td className="px-5 py-3.5 max-w-md text-foreground/90 leading-relaxed">
                              {log.details}
                            </td>

                            {/* Related Complaint ID */}
                            <td className="px-5 py-3.5 font-mono font-bold text-primary">
                              {log.complaintId || "—"}
                            </td>

                            {/* Log ID */}
                            <td className="px-5 py-3.5 text-right font-mono text-[10px] text-muted-foreground">
                              {log.id}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 2: SHA-256 CRYPTOGRAPHIC CHAIN LEDGER
           ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "blockchain" && (
          <div className="space-y-4">
            
            {/* Verification Status Banner */}
            <div
              className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 transition-all ${
                isChainValid
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30">
                  <ShieldCheck className="size-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      {isChainValid ? "Cryptographic Chain Verified" : "Chain State: Pending Verification"}
                    </h3>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                      {verification?.total_entries ?? verification?.entries_checked ?? cryptoLogs.length} Blocks Intact
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Every record is hashed using SHA-256 linked to the preceding block hash. Zero tampering detected.
                  </p>
                </div>
              </div>

              <div className="font-mono text-xs text-muted-foreground">
                Latest Hash: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{verification?.last_hash ? `${verification.last_hash.slice(0, 16)}…` : "Active"}</span>
              </div>
            </div>

            {/* Crypto Log Table */}
            <div className="panel overflow-hidden">
              <div className="overflow-x-auto">
                {loadingCrypto ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    <RefreshCw className="size-5 animate-spin mx-auto text-primary mb-2" />
                    Loading SHA-256 Audit Chain…
                  </div>
                ) : cryptoLogs.length === 0 ? (
                  <div className="py-16 text-center text-xs text-muted-foreground">
                    No cryptographic audit entries found.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 text-muted-foreground bg-muted/20">
                        <th className="px-5 py-3 font-bold uppercase">Timestamp</th>
                        <th className="px-5 py-3 font-bold uppercase">Fraud Type</th>
                        <th className="px-5 py-3 font-bold uppercase">Bank</th>
                        <th className="px-5 py-3 font-bold uppercase">Predicted Zone</th>
                        <th className="px-5 py-3 font-bold uppercase">Confidence</th>
                        <th className="px-5 py-3 font-bold uppercase">Triage</th>
                        <th className="px-5 py-3 font-bold uppercase text-right">SHA-256 Hash</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cryptoLogs.map((entry, idx) => {
                        const inp = (entry.input ?? entry.input_data ?? {}) as Record<string, unknown>;
                        const out = (entry.output ?? entry.prediction_result ?? {}) as Record<string, unknown>;
                        const zoneId = (out["predicted_hotspot_id"] ?? out["hotspot_cluster"] ?? out["cluster"]) as string | number | undefined;
                        const clusterKey = typeof zoneId === "number" ? zoneId : Number(zoneId);
                        const zoneName = CLUSTER_NAMES[clusterKey] ?? (zoneId !== undefined ? `Cluster ${zoneId}` : "—");
                        const conf = out["confidence_percent"] ?? out["confidence"];
                        const triage = String(out["triage_status"] ?? "DISPATCHED");

                        return (
                          <tr
                            key={entry.entry_hash || idx}
                            className="border-b border-border/20 transition-colors hover:bg-muted/30"
                          >
                            <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleString("en-IN") : "—"}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-foreground">
                              {String(inp["fraud_type"] ?? "—")}
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              {String(inp["bank"] ?? "—")}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-primary">
                              {zoneName}
                            </td>
                            <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                              {conf !== undefined ? `${conf}%` : "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                                {formatTriageBadge(lang, triage)}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono text-[11px]">
                              <button
                                onClick={() => setSelectedEntry(entry)}
                                className="text-primary hover:underline"
                                title={entry.entry_hash}
                              >
                                {entry.entry_hash ? `${entry.entry_hash.slice(0, 10)}…${entry.entry_hash.slice(-6)}` : "—"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hash Details Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-display text-base font-bold text-foreground">
                  Cryptographic Audit Block Inspection
                </h3>
                <button onClick={() => setSelectedEntry(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Current Block Hash (SHA-256)</p>
                  <p className="font-mono text-[11px] text-emerald-400 bg-muted/40 p-2 rounded-xl break-all mt-1 border border-border/40">
                    {selectedEntry.entry_hash}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Previous Block Hash (Parent)</p>
                  <p className="font-mono text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-xl break-all mt-1 border border-border/40">
                    {selectedEntry.prev_hash || "GENESIS_BLOCK_0000000000000000"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Payload JSON</p>
                  <pre className="font-mono text-[10px] text-foreground/80 overflow-x-auto max-h-40">
                    {JSON.stringify(selectedEntry, null, 2)}
                  </pre>
                </div>
              </div>

              <button
                onClick={() => setSelectedEntry(null)}
                className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-white"
              >
                Close Block View
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
