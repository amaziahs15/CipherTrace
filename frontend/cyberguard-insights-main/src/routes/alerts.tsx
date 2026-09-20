// ─── Route: /alerts (Live Law Enforcement & Bank Fraud Desk Dispatches) ────────
import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ShieldAlert,
  Send,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  AlertTriangle,
  Radio,
  ExternalLink,
  Info,
  CheckCheck,
  Flame,
} from "lucide-react";
import { useAlerts, type ThreatAlert } from "@/lib/alertsStore";
import { useI18n } from "@/lib/i18n";
import MultiAgencyResponseChain from "@/components/MultiAgencyResponseChain";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Live LEA & Bank Dispatches · CipherTrace" },
      {
        name: "description",
        content: "Real-time automated law enforcement patrol vectoring and 1930 bank fraud desk freeze dispatches.",
      },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { lang, t } = useI18n();
  const { alerts, unreadCount, markAllAsRead } = useAlerts();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const matchSeverity = severityFilter === "all" || a.severity === severityFilter;
      const matchSearch =
        a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.lea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.fraudType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchSearch;
    });
  }, [alerts, severityFilter, searchQuery]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/40">
                <ShieldAlert className="size-4" />
              </span>
              <h1 className="font-display text-xl font-bold text-foreground">
                {t.navAlerts || "Live Law Enforcement & Bank Dispatches"}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Automated high-risk interdiction stream routed to state cyber police units and bank fraud desks.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted hover:border-primary/40"
              >
                <CheckCheck className="size-3.5 text-primary" />
                <span>Mark All Read ({unreadCount})</span>
              </button>
            )}
            <span className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-mono text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 animate-pulse">
              <span className="size-2 rounded-full bg-rose-500" />
              I4C Gateway Stream Live
            </span>
          </div>
        </div>

        {/* System Info Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-xs text-primary">
          <Info className="size-4 shrink-0 text-cyan-400" />
          <span>
            <strong>Real-Time Stream:</strong> Alerts in this console trigger automatically based on high-risk anomaly thresholds (&gt;₹80,000 or high transaction velocity) with dispatch via I4C gateway.
          </span>
        </div>

        {/* Filters */}
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus-within:border-primary">
              <Search className="size-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, bank, LEA..."
                className="bg-transparent outline-none w-48 text-xs placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-1">
              {(["all", "critical", "high", "warning"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                    severityFilter === sev
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sev === "all" ? "All Severities" : sev}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of {alerts.length} dispatches
          </div>
        </div>

        {/* Dispatch Grid Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((alt) => {
            const isCritical = alt.severity === "critical";
            const isHigh = alt.severity === "high";

            return (
              <div
                key={alt.id}
                className="panel relative overflow-hidden p-5 space-y-3 transition-all hover:border-primary/50"
              >
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    isCritical ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" : isHigh ? "bg-amber-500" : "bg-cyan-500"
                  }`}
                />

                <div className="flex items-start justify-between gap-2 pl-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-black uppercase ${
                        isCritical
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : isHigh
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                          : "bg-cyan-500/20 text-primary border border-cyan-500/30"
                      }`}
                    >
                      {alt.id}
                    </span>
                    <span className="font-bold text-foreground text-sm">{alt.city}</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{alt.timeAgo || alt.timestamp}</span>
                </div>

                <div className="pl-2 space-y-2 text-xs">
                  <p className="font-semibold text-foreground/90">
                    ⚠ High-Risk Incident —{" "}
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                      ₹{alt.amount.toLocaleString("en-IN")}
                    </span>{" "}
                    ({alt.fraudType})
                  </p>

                  <div className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="size-3.5 text-primary shrink-0" />
                      <span><strong className="text-foreground">LEA Assigned:</strong> {alt.lea}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Send className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span><strong className="text-foreground">Bank Freeze Desk:</strong> {alt.bank}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="size-3.5" /> Notice Dispatched via Gateway
                    </span>
                    <span className="font-mono text-muted-foreground">{alt.timestamp}</span>
                  </div>

                  {/* ── Multi-Agency Response Chain Visual ── */}
                  <MultiAgencyResponseChain
                    timestamp={alt.timestamp}
                    city={alt.city}
                    bank={alt.bank}
                    lea={alt.lea}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
