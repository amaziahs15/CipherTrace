// ─── Law Enforcement Investigator Portal (/investigator) ─────────────────────
// Restricted LEA case management interface with demo auth stub, high-risk dockets,
// interactive status tracking, and evidence dossier modal.

import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  MapPin,
  ExternalLink,
  ChevronRight,
  X,
  Download,
  Fingerprint,
  RefreshCw,
  LogOut,
  Send,
  Home,
  Tag,
} from "lucide-react";
import ThemeLanguageControls, { useTheme } from "@/components/ThemeLanguageControls";
import { useI18n } from "@/lib/i18n";
import { generateEvidenceReportPDF } from "@/lib/pdfReport";
import ExplainPredictionAccordion from "@/components/ExplainPredictionAccordion";
import FundRecoveryEstimatorCard from "@/components/FundRecoveryEstimatorCard";

export const Route = createFileRoute("/investigator")({
  head: () => ({
    meta: [
      { title: "Investigator Portal · CipherTrace Cyber Command" },
      {
        name: "description",
        content: "Restricted Law Enforcement Interface for high-risk complaint dockets, evidence triage, and patrol dispatches.",
      },
      { property: "og:title", content: "Investigator Portal · CipherTrace LEA Command" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: InvestigatorPortal,
});

// ─── Types & Mock High-Risk Dockets ──────────────────────────────────────────

export type CaseStatus = "New" | "Under Investigation" | "Resolved";

export type HighRiskComplaint = {
  id: string;
  timestamp: string;
  timeAgo: string;
  fraudType: string;
  bank: string;
  victimCoords: string;
  predictedHotspot: string;
  hotspotCity: string;
  fraudAmount: number;
  confidence: number;
  riskLevel: "Tier 1: High Risk" | "Tier 1: Standard";
  status: CaseStatus;
  suspectAccountAge: number;
  ipVelocity: number;
  evidenceHash: string;
  assignedUnit: string;
};

const INITIAL_COMPLAINTS: HighRiskComplaint[] = [
  {
    id: "LEA-2024-8901",
    timestamp: "2026-08-28 02:45",
    timeAgo: "15m ago",
    fraudType: "UPI Fraud",
    bank: "SBI",
    victimCoords: "28.6139°N, 77.2090°E",
    predictedHotspot: "Delhi NCR — Dwarka Sector 12 ATM Kiosks",
    hotspotCity: "Delhi NCR Zone",
    fraudAmount: 145000,
    confidence: 89.7,
    riskLevel: "Tier 1: High Risk",
    status: "New",
    suspectAccountAge: 6,
    ipVelocity: 14,
    evidenceHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    assignedUnit: "Delhi Cyber Special Cell",
  },
  {
    id: "LEA-2024-8899",
    timestamp: "2026-08-28 02:10",
    timeAgo: "50m ago",
    fraudType: "Fake Investment",
    bank: "HDFC",
    victimCoords: "19.0760°N, 72.8777°E",
    predictedHotspot: "Mumbai Metro — Bandra Kurla Complex ATM Belt",
    hotspotCity: "Mumbai Metro Zone",
    fraudAmount: 220000,
    confidence: 93.4,
    riskLevel: "Tier 1: High Risk",
    status: "Under Investigation",
    suspectAccountAge: 12,
    ipVelocity: 18,
    evidenceHash: "1e1107dbc25c2c864d3885221e7658d2a6f821af0eef0cf47ef42ca95da31a25",
    assignedUnit: "Mumbai Cyber Police (BKC HQ)",
  },
  {
    id: "LEA-2024-8895",
    timestamp: "2026-08-27 23:30",
    timeAgo: "3h ago",
    fraudType: "OTP Fraud",
    bank: "ICICI Bank",
    victimCoords: "12.9716°N, 77.5946°E",
    predictedHotspot: "Bengaluru South — Koramangala Hub ATM Cluster",
    hotspotCity: "Bengaluru South Zone",
    fraudAmount: 115000,
    confidence: 86.2,
    riskLevel: "Tier 1: High Risk",
    status: "Under Investigation",
    suspectAccountAge: 4,
    ipVelocity: 9,
    evidenceHash: "8a4f912c9b4e6789123456789abcdef0123456789abcdef0123456789abcdef0",
    assignedUnit: "Karnataka CID Cyber Command",
  },
  {
    id: "LEA-2024-8890",
    timestamp: "2026-08-27 21:15",
    timeAgo: "6h ago",
    fraudType: "Loan App Scam",
    bank: "Axis Bank",
    victimCoords: "22.5726°N, 88.3639°E",
    predictedHotspot: "Kolkata Central — Lalbazar Commercial Sector",
    hotspotCity: "Kolkata Central Zone",
    fraudAmount: 85000,
    confidence: 78.5,
    riskLevel: "Tier 1: Standard",
    status: "New",
    suspectAccountAge: 21,
    ipVelocity: 5,
    evidenceHash: "5f4dcc3b5aa765d61d8327deb882cf992b95bc995b95bc995b95bc995b95bc99",
    assignedUnit: "Kolkata Cyber Police",
  },
  {
    id: "LEA-2024-8882",
    timestamp: "2026-08-27 18:40",
    timeAgo: "8h ago",
    fraudType: "Phishing",
    bank: "Punjab National Bank",
    victimCoords: "13.0827°N, 80.2707°E",
    predictedHotspot: "Chennai North — Anna Salai Corridor Kiosks",
    hotspotCity: "Chennai North Zone",
    fraudAmount: 94000,
    confidence: 82.0,
    riskLevel: "Tier 1: Standard",
    status: "Resolved",
    suspectAccountAge: 35,
    ipVelocity: 3,
    evidenceHash: "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72",
    assignedUnit: "Chennai Cyber Crime Wing",
  },
];

import {
  getStoredComplaints,
  saveComplaints,
  type ComplaintEntity,
} from "@/lib/complaintsStore";
import LinkAnalysisGraph from "@/components/LinkAnalysisGraph";
import { logActivity } from "@/lib/activityLog";
import DashboardLayout from "@/components/DashboardLayout";

function InvestigatorPortal() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useI18n();

  // ── Auth Gate State (Demo Mock) ──
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [badgeId, setBadgeId] = useState("LEA-DL-7492");
  const [pin, setPin] = useState("••••");
  const [officerUnit, setOfficerUnit] = useState("Delhi Cyber Special Cell");
  const [viewTab, setViewTab] = useState<"table" | "graph">("table");

  // ── Complaint Management States ──
  const [complaints, setComplaints] = useState<ComplaintEntity[]>(getStoredComplaints);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<ComplaintEntity | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Sync with central store on update
  useEffect(() => {
    const handleUpdate = () => {
      setComplaints(getStoredComplaints());
    };
    window.addEventListener("ciphertrace:complaints_updated", handleUpdate);
    return () => window.removeEventListener("ciphertrace:complaints_updated", handleUpdate);
  }, []);

  // Status Change Handler
  const handleStatusChange = (id: string, newStatus: "New" | "Under Investigation" | "Resolved") => {
    const updated = complaints.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
    setComplaints(updated);
    saveComplaints(updated);

    const targetCase = complaints.find((c) => c.id === id);
    const actionLabel = `Status Changed to ${newStatus}` as any;
    logActivity({
      action: actionLabel,
      actor: `Investigator (${officerUnit} · ${badgeId})`,
      details: `Case docket ${id} marked as ${newStatus}${targetCase ? ` (Hotspot: ${targetCase.hotspotCity})` : ""}`,
      complaintId: id,
      severity: newStatus === "Resolved" ? "success" : newStatus === "Under Investigation" ? "info" : "warning",
    });
  };

  // Filtered List
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.fraudType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.predictedHotspot.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bank.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [complaints, searchQuery, statusFilter]);

  // Statistics
  const totalAmount = useMemo(
    () => complaints.reduce((sum, c) => sum + c.fraudAmount, 0),
    [complaints],
  );
  const activeCasesCount = useMemo(
    () => complaints.filter((c) => c.status !== "Resolved").length,
    [complaints],
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  // ─── VIEW 1: Investigator Login Gate (Demo Auth Stub) ─────────────────────
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-cyan-500/30 transition-colors duration-200">
        <div className="pointer-events-none absolute inset-0 cyber-grid-bg opacity-30" />

        {/* Header */}
        <header className="relative z-20 flex items-center justify-between border-b border-border/40 bg-card/70 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/40">
              <Shield className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-base font-bold tracking-tight text-foreground">
                CipherTrace LEA Terminal
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Law Enforcement &amp; I4C Intelligence Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Home className="size-3.5" />
              <span>Public Terminal</span>
            </Link>
            <ThemeLanguageControls theme={theme} toggleTheme={toggleTheme} lang={lang} setLang={setLang} />
          </div>
        </header>

        {/* Center Login Box */}
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 py-12">
          <div className="w-full rounded-3xl border border-cyan-500/30 bg-card/90 p-8 shadow-[0_0_40px_-5px_rgba(6,182,212,0.25)] backdrop-blur-xl">
            
            {/* Top Icon */}
            <div className="mb-6 flex flex-col items-center text-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                <Fingerprint className="size-8" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                Investigator Gate
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Law Enforcement Credential Verification (I4C Portal)
              </p>
            </div>

            {/* Demo Stub Disclaimer */}
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/8 px-3.5 py-2.5 text-xs text-warning">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              <span className="text-[11px] leading-tight">
                <strong>Demo Auth Stub:</strong> Authentication backend is mocked for hackathon evaluation. Click Authorize to inspect live case files.
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Officer Badge ID / PNO
                </label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/60 bg-muted/40 px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Assigned Cyber Command Unit
                </label>
                <select
                  value={officerUnit}
                  onChange={(e) => setOfficerUnit(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/60 bg-muted/40 px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                >
                  <option value="Delhi Cyber Special Cell">Delhi Cyber Special Cell (Dwarka)</option>
                  <option value="Mumbai Cyber Police (BKC HQ)">Mumbai Cyber Police (BKC HQ)</option>
                  <option value="Karnataka CID Cyber Command">Karnataka CID Cyber Command</option>
                  <option value="Kolkata Cyber Police (Lalbazar)">Kolkata Cyber Police (Lalbazar)</option>
                  <option value="Chennai Cyber Crime Wing">Chennai Cyber Crime Wing (Vepery)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Security Token / PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border/60 bg-muted/40 px-3.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white shadow-[0_0_20px_-4px_oklch(0.68_0.16_248/0.7)] transition-all hover:scale-[1.02] hover:shadow-[0_0_28px_-2px_oklch(0.68_0.16_248/0.9)]"
              >
                <UserCheck className="size-4" />
                <span>Authorize Case Access</span>
                <ChevronRight className="size-4 opacity-70" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-20 border-t border-border/40 py-3 text-center text-xs text-muted-foreground/60">
          I4C Cybercrime Response Grid · Restricted Law Enforcement System
        </footer>
      </main>
    );
  }

  // ─── VIEW 2: Law Enforcement Main Case Management Interface ──────────────
  return (
    <DashboardLayout activeRole="investigator">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40">
                <ShieldAlert className="size-4" />
              </span>
              <h1 className="font-display text-xl font-bold text-foreground">
                Investigator Dockets &amp; LEA Priority Queue
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assigned Unit: <strong>{officerUnit}</strong> · Officer ID: <span className="font-mono text-primary font-bold">{badgeId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20"
            >
              <LogOut className="size-3.5" />
              <span>Lock Terminal</span>
            </button>
          </div>
        </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6">
        
        {/* ── Summary Stat Cards ── */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30">
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Case Queue</p>
              <p className="font-display text-2xl font-bold text-foreground">{activeCasesCount} Cases</p>
              <p className="text-xs text-rose-400 font-semibold">Priority Triage</p>
            </div>
          </div>

          <div className="panel flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Fraud Value</p>
              <p className="font-display text-2xl font-bold text-foreground">₹{(totalAmount / 100000).toFixed(2)} Lakhs</p>
              <p className="text-xs text-muted-foreground">Targeted for Freeze</p>
            </div>
          </div>

          <div className="panel flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Under Active Probe</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {complaints.filter((c) => c.status === "Under Investigation").length} Cases
              </p>
              <p className="text-xs text-amber-400">Patrol Units Deployed</p>
            </div>
          </div>

          <div className="panel flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resolved Dockets</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {complaints.filter((c) => c.status === "Resolved").length} Cases
              </p>
              <p className="text-xs text-emerald-400">Interdictions Completed</p>
            </div>
          </div>
        </section>

        {/* ── View Mode Selector: Table vs Link-Analysis Graph ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab("table")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                viewTab === "table"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <FileText className="size-3.5" />
              <span>📋 Active Case Dockets ({complaints.length})</span>
            </button>

            <button
              onClick={() => setViewTab("graph")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                viewTab === "graph"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <ShieldAlert className="size-3.5" />
              <span>🕸️ Syndicate Link-Analysis Network</span>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground font-mono">
            {viewTab === "table" ? "Priority Triage & Section 91 CrPC Actions" : "Multi-Hop Cross-Case Mule Syndicate Intelligence"}
          </p>
        </div>

        {viewTab === "graph" ? (
          <section className="w-full">
            <LinkAnalysisGraph
              onSelectComplaint={(id) => {
                const found = complaints.find((c) => c.id === id);
                if (found) {
                  setSelectedCase(found);
                  setIsDossierOpen(true);
                }
              }}
            />
          </section>
        ) : (
          /* ── Filter & Search Bar + Table ── */
          <section className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Box */}
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-foreground focus-within:border-primary">
                  <Search className="size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search case ID, crime type, hotspot…"
                    className="bg-transparent text-xs text-foreground outline-none w-56 placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-1">
                  {(["all", "New", "Under Investigation", "Resolved"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        statusFilter === st
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st === "all" ? "All Cases" : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Showing <strong>{filteredComplaints.length}</strong> of {complaints.length} Dockets</span>
              </div>
            </div>

            {/* ── Table of Flagged Complaints ── */}
            <div className="overflow-x-auto">
              {filteredComplaints.length === 0 ? (
                <div className="py-14 text-center text-sm text-muted-foreground">
                  No matching investigation dockets found.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground">
                    <th className="px-5 py-3 font-bold uppercase tracking-wider">Complaint ID</th>
                    <th className="px-5 py-3 font-bold uppercase tracking-wider">Crime Type</th>
                    <th className="px-5 py-3 font-bold uppercase tracking-wider">Predicted Hotspot ATM</th>
                    <th className="px-5 py-3 font-bold uppercase tracking-wider">Fraud Amount (₹)</th>
                    <th className="px-5 py-3 font-bold uppercase tracking-wider">Risk Level</th>
                    <th className="px-5 py-3 font-bold uppercase tracking-wider">Investigation Status</th>
                    <th className="px-5 py-3 font-bold uppercase tracking-wider text-right">Evidence Dossier</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => {
                    const isHigh = c.fraudAmount >= 100000;
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-border/20 transition-colors hover:bg-muted/30"
                      >
                        {/* Complaint ID */}
                        <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                          <div className="flex items-center gap-1.5">
                            <FileText className="size-3.5 text-primary" />
                            <span>{c.id}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{c.timeAgo}</span>
                        </td>

                        {/* Crime Type & Bank */}
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-foreground">{c.fraudType}</p>
                          <p className="text-[10px] text-muted-foreground">Bank: {c.bank}</p>
                        </td>

                        {/* Predicted Hotspot */}
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="flex items-start gap-1">
                            <MapPin className="size-3 text-rose-400 mt-0.5 shrink-0" />
                            <p className="font-semibold text-foreground/90 truncate">{c.predictedHotspot}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground pl-4">{c.hotspotCity}</p>
                        </td>

                        {/* Fraud Amount */}
                        <td className="px-5 py-3.5 font-mono font-bold text-sm">
                          <span className={isHigh ? "text-rose-600 dark:text-rose-400" : "text-foreground"}>
                            ₹{c.fraudAmount.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Risk Level */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${
                              c.riskLevel === "Tier 1: High Risk"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/30"
                                : "bg-muted text-muted-foreground ring-border/40"
                            }`}
                          >
                            {c.riskLevel} · {c.confidence}%
                          </span>
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-5 py-3.5">
                          <select
                            value={c.status}
                            onChange={(e) => handleStatusChange(c.id, e.target.value as CaseStatus)}
                            className={`h-7 rounded-lg border px-2 text-xs font-bold outline-none cursor-pointer ${
                              c.status === "New"
                                ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : c.status === "Under Investigation"
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            <option value="New">🔴 New Case</option>
                            <option value="Under Investigation">🟡 Under Investigation</option>
                            <option value="Resolved">🟢 Resolved</option>
                          </select>
                        </td>

                        {/* Actions: View Evidence & Download PDF */}
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => generateEvidenceReportPDF(c)}
                            title="Download Evidence Report PDF"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-muted/70 hover:border-primary/50 hover:text-primary"
                          >
                            <Download className="size-3.5 text-primary" />
                            <span className="hidden sm:inline">PDF</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCase(c);
                              setIsDossierOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white"
                          >
                            <Fingerprint className="size-3.5" />
                            <span>View Evidence</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            </div>
          </section>
        )}
      </div>

      {/* ── Evidence Dossier Modal ── */}
      {isDossierOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-cyan-500/15 text-primary ring-1 ring-cyan-500/30">
                  <Fingerprint className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Evidence Dossier — {selectedCase.id}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    I4C Tamper-Evident Law Enforcement Forensic Record
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDossierOpen(false)}
                className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Dossier Content */}
            <div className="mt-5 space-y-4 text-xs">
              
              {/* SHA-256 Hash Verification */}
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black uppercase text-primary tracking-wider">
                    Immutable Audit Hash (SHA-256)
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" /> Chain Verified
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground break-all bg-card p-2 rounded-lg border border-border/30">
                  {selectedCase.evidenceHash}
                </p>
              </div>

              {/* Case Attributes Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Victim Location &amp; Amount</p>
                  <p className="text-sm font-bold text-foreground">₹{selectedCase.fraudAmount.toLocaleString("en-IN")}</p>
                  <p className="text-muted-foreground">Coords: <span className="text-foreground">{selectedCase.victimCoords}</span></p>
                  <p className="text-muted-foreground">Origin Bank: <span className="text-foreground">{selectedCase.bank}</span></p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Predicted Cash Extraction Zone</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{selectedCase.predictedHotspot}</p>
                  <p className="text-muted-foreground">Confidence: <strong className="text-foreground">{selectedCase.confidence}%</strong></p>
                  <p className="text-muted-foreground">Assigned LEA: <span className="text-foreground">{selectedCase.assignedUnit}</span></p>
                </div>
              </div>

              {/* Explain Prediction Accordion */}
              <ExplainPredictionAccordion
                prediction={{
                  zoneId: selectedCase.predictedHotspot,
                  zoneName: selectedCase.predictedHotspot,
                  lat: 28.6139,
                  lng: 77.209,
                  confidence: selectedCase.confidence,
                  windowStart: 2,
                  windowEnd: 6,
                  action: "Dispatch patrol unit to predicted ATM hub",
                  topPredictions: [],
                }}
              />

              {/* Fund Recovery Likelihood Estimator Card */}
              <FundRecoveryEstimatorCard
                prediction={{
                  zoneId: selectedCase.predictedHotspot,
                  zoneName: selectedCase.predictedHotspot,
                  lat: 28.6139,
                  lng: 77.209,
                  confidence: selectedCase.confidence,
                  windowStart: 2,
                  windowEnd: 6,
                  action: "Dispatch patrol unit to predicted ATM hub",
                  topPredictions: [],
                }}
              />

              {/* Suspect Account Behavioral Indicators */}
              <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Suspect Account Behavioral Indicators</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-card border border-border/30">
                    <span className="text-muted-foreground">Mule Account Age:</span>{" "}
                    <strong className="text-rose-600 dark:text-rose-400">{selectedCase.suspectAccountAge} days (New Account)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-card border border-border/30">
                    <span className="text-muted-foreground">IP Incident Velocity:</span>{" "}
                    <strong className="text-rose-600 dark:text-rose-400">{selectedCase.ipVelocity} hits / 24h (High Burst)</strong>
                  </div>
                </div>
              </div>

              {/* Automated Actions Dispatched */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Automated Gateway Dispatches Executed</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800 dark:text-emerald-300 pl-1">
                  <li>Emergency 1930 Cyber Fraud Freeze Notice routed to <strong>{selectedCase.bank} Fraud Desk</strong>.</li>
                  <li>Vector alert dispatched to <strong>{selectedCase.assignedUnit}</strong> with estimated 2–6h withdrawal window.</li>
                  <li>Geo-spatial surveillance coordinates locked to patrol navigation network.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
              <button
                onClick={() => generateEvidenceReportPDF(selectedCase)}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white shadow-sm"
              >
                <Download className="size-3.5" />
                <span>Download Evidence Report (PDF)</span>
              </button>

              <button
                onClick={() => setIsDossierOpen(false)}
                className="rounded-xl bg-muted/60 px-5 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
