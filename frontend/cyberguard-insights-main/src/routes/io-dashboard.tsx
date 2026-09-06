import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  Building2,
  DollarSign,
  UserCheck,
  Zap,
  Flame,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { getComplaints } from "@/lib/mock-api/ncrp";
import type { Complaint, PriorityTier } from "@/lib/mock-api/types";
import PriorityBadge from "@/components/complaint/PriorityBadge";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/io-dashboard")({
  head: () => ({
    meta: [
      { title: "IO Priority Triage Dashboard · CyberShield AI" },
      {
        name: "description",
        content: "Prioritized complaint triage queue for cybercrime investigating officers.",
      },
    ],
  }),
  component: IODashboardPage,
});

function IODashboardPage() {
  const { lang, t } = useI18n();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Daily alert dispatch budget (heuristic safeguard against officer fatigue)
  const DAILY_ALERT_CAP = 15;
  const currentDispatches = 7;

  useEffect(() => {
    getComplaints().then((data) => {
      // Default sorted by priority_score descending
      const sorted = [...data].sort((a, b) => b.priority_score - a.priority_score);
      setComplaints(sorted);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.complaint_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.utr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.victim_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mule_account.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fraud_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = selectedTier === "ALL" || c.priority_tier === selectedTier;
      const matchesStatus = selectedStatus === "ALL" || c.withdrawal_status === selectedStatus;

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [complaints, searchQuery, selectedTier, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const high = complaints.filter((c) => c.priority_tier === "HIGH").length;
    const med = complaints.filter((c) => c.priority_tier === "MEDIUM").length;
    const low = complaints.filter((c) => c.priority_tier === "LOW").length;
    const totalAmount = complaints.reduce((sum, c) => sum + c.fraud_amount, 0);
    const pendingFreeze = complaints.filter((c) => c.freeze_status !== "FROZEN").length;
    return { high, med, low, totalAmount, pendingFreeze };
  }, [complaints]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>{t.simulatedXGBoostTriage}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
              {t.ioQueueTitle}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {t.ioQueueSub}
            </p>
          </div>

          {/* Daily Alert Cap Indicator */}
          <div className="bg-card border border-border rounded-xl p-3 shadow-sm flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-muted-foreground font-medium">{t.dailyAlertCap}</div>
                <div className="text-foreground font-bold font-mono">
                  {currentDispatches} / {DAILY_ALERT_CAP} Dispatched
                </div>
              </div>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(currentDispatches / DAILY_ALERT_CAP) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">
              <span>{t.highPriorityTier}</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">{stats.high}</div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">&gt; 0.70 Risk · Immediate Action</div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
              <span>{t.medPriorityTier}</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">{stats.med}</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">0.40–0.70 · Standard Freeze</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-1">
              <span>{t.pendingFreeze}</span>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">{stats.pendingFreeze}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Awaiting CFCFRMS Response</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-1">
              <span>{t.totalVolumeAtRisk}</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              ₹{(stats.totalAmount / 100000).toFixed(1)}L
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Across {complaints.length} Queue Cases</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 rounded-xl border border-border shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-muted/40 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-muted/40 border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">{t.allTiers}</option>
              <option value="HIGH">High Priority Only</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-muted/40 border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">{t.allCashoutStatus}</option>
              <option value="NOT_WITHDRAWN">{t.notWithdrawn}</option>
              <option value="WITHDRAWN_ATM">{t.withdrawnATM}</option>
              <option value="WITHDRAWN_POS">{t.withdrawnPOS}</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-3.5">{t.colPriority}</th>
                  <th className="p-3.5">{t.colComplaintId}</th>
                  <th className="p-3.5">{t.colVictimFraud}</th>
                  <th className="p-3.5">{t.colAmount}</th>
                  <th className="p-3.5">{t.colTargetBank}</th>
                  <th className="p-3.5">{t.colRecoveryProb}</th>
                  <th className="p-3.5">{t.colCashoutStatus}</th>
                  <th className="p-3.5 text-right">{t.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading priority intake queue...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No complaints matched the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.complaint_id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      <td className="p-3.5 whitespace-nowrap">
                        <PriorityBadge
                          tier={c.priority_tier}
                          score={c.priority_score}
                          compact
                        />
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                          {c.complaint_id}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          Ack: {c.ncrp_ack_id}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-foreground">{c.victim_name}</div>
                        <div className="text-[11px] text-muted-foreground">{c.fraud_type}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono font-bold text-foreground">
                        ₹{c.fraud_amount.toLocaleString("en-IN")}
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{c.mule_bank}</span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {c.mule_account}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-foreground">
                            {Math.round(c.recovery_probability * 100)}%
                          </span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.recovery_probability > 0.6
                                  ? "bg-emerald-500"
                                  : c.recovery_probability > 0.3
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${c.recovery_probability * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            c.withdrawal_status === "NOT_WITHDRAWN"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {c.withdrawal_status === "NOT_WITHDRAWN"
                            ? t.notWithdrawn
                            : c.withdrawal_status === "WITHDRAWN_ATM"
                            ? t.withdrawnATM
                            : t.withdrawnPOS}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <Link
                          to="/io-complaint/$id"
                          params={{ id: c.complaint_id }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                        >
                          <span>{t.investigate}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
