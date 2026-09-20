// ─── Route: /complaint (New Complaint Intake & Geo-Hotspot Prediction) ─────────
import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useCallback, lazy, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  FilePlus,
  Radio,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Info,
  Shield,
  ShieldAlert,
  Send,
  Loader2,
  Layers,
  ExternalLink,
  ChevronRight,
  X,
  Share2,
} from "lucide-react";
import {
  predictFromApi,
  type Prediction,
  formatWindow,
  type FormState,
} from "@/lib/hotspots";
import { logActivity } from "@/lib/activityLog";
import { useI18n, formatActionText, formatWindowText, formatScreeningBadge } from "@/lib/i18n";
import ExplainPredictionAccordion from "@/components/ExplainPredictionAccordion";
import FundRecoveryEstimatorCard from "@/components/FundRecoveryEstimatorCard";
import { ClientOnly } from "@tanstack/react-router";
import LinkAnalysisGraph from "@/components/LinkAnalysisGraph";
import {
  crossReferenceComplaint,
  registerNewComplaint,
  type ComplaintEntity,
  getStoredComplaints,
} from "@/lib/complaintsStore";
import {
  evaluateCollectiveThreatSignal,
  VICTIM_CENTRIC_TEXT,
} from "@/lib/collectiveThreat";

const HotspotMap = lazy(() => import("@/components/HotspotMap"));
const ComplaintMapPreview = lazy(() => import("@/components/ComplaintMapPreview"));

export const Route = createFileRoute("/complaint")({
  head: () => ({
    meta: [
      { title: "New Complaint Intake · CipherTrace ML Prediction" },
      {
        name: "description",
        content: "File new fraud complaint to forecast withdrawal hotspot clusters and response vectors in real time.",
      },
    ],
  }),
  component: ComplaintPage,
});

const DEFAULT_FORM: FormState = {
  victim_lat: "28.6139",
  victim_lon: "77.2090",
  fraud_amount: "95000",
  suspect_account_age_days: "6",
  hour_of_day: "14",
  day_of_week: "2",
  fraud_type: "UPI Fraud",
  bank: "SBI",
  ip_incident_velocity_24h: "8",
  distance_victim_to_suspect_atm_km: "12.5",
  victim_risk_tier: "1",
};

const FRAUD_TYPES = ["UPI Fraud", "OTP Fraud", "Fake Investment", "Loan App Scam", "Phishing"];
const BANKS = ["SBI", "HDFC", "ICICI", "Axis Bank", "Punjab National Bank", "Bank of Baroda"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function ComplaintPage() {
  const { lang, t } = useI18n();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedComplaintId, setSubmittedComplaintId] = useState<string | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<"map" | "graph">("map");
  const [inspectedCaseId, setInspectedCaseId] = useState<string | null>(null);

  // Live Cross-reference against existing complaints
  const crossRef = React.useMemo(() => {
    return crossReferenceComplaint({
      bank: form.bank,
    });
  }, [form.bank]);

  // Live Collective Threat Signal Context (Additive signal for small-value complaints)
  const collectiveSignal = React.useMemo(() => {
    return evaluateCollectiveThreatSignal({
      amount: parseFloat(form.fraud_amount) || 0,
      fraudType: form.fraud_type,
      lat: parseFloat(form.victim_lat) || 28.6139,
      lon: parseFloat(form.victim_lon) || 77.209,
    });
  }, [form.fraud_amount, form.fraud_type, form.victim_lat, form.victim_lon]);

  // Find inspected case details if clicked
  const inspectedCase = React.useMemo(() => {
    if (!inspectedCaseId) return null;
    const all = getStoredComplaints();
    return all.find((c) => c.id === inspectedCaseId) || null;
  }, [inspectedCaseId]);

  const handleLocate = useCallback((lat: number, lon: number) => {
    setForm((prev) => ({
      ...prev,
      victim_lat: lat.toFixed(4),
      victim_lon: lon.toFixed(4),
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setErrorMsg(null);

    try {
      const generatedId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;

      logActivity({
        action: "Complaint Submitted",
        actor: "Citizen",
        details: `Victim lodged ${form.fraud_type} complaint for ₹${Number(form.fraud_amount).toLocaleString("en-IN")} via ${form.bank}.`,
        complaintId: generatedId,
        severity: "warning",
      });

      const pred = await predictFromApi({
        lat: parseFloat(form.victim_lat) || 28.6139,
        lng: parseFloat(form.victim_lon) || 77.209,
        amount: parseFloat(form.fraud_amount) || 95000,
        accountAge: parseInt(form.suspect_account_age_days) || 6,
        hour: parseInt(form.hour_of_day) || 14,
        day: parseInt(form.day_of_week) || 2,
        fraudType: form.fraud_type,
        bank: form.bank,
      });
      setPrediction(pred);
      setSubmittedComplaintId(generatedId);

      const zoneLabel = pred.zoneName || "NCR Hotspot";
      const cityLabel = (zoneLabel.split("—")[0] || "Delhi NCR").trim();

      // Register into Central Complaint Registry (auto-adds node to link-analysis graph!)
      registerNewComplaint({
        id: generatedId,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        fraudType: form.fraud_type,
        bank: form.bank,
        suspectAccountId: `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
        suspectPhone: "+91 98000 00000",
        victimCoords: `${parseFloat(form.victim_lat).toFixed(4)}°N, ${parseFloat(form.victim_lon).toFixed(4)}°E`,
        victimLat: parseFloat(form.victim_lat),
        victimLon: parseFloat(form.victim_lon),
        predictedHotspot: zoneLabel,
        hotspotCity: cityLabel,
        fraudAmount: parseFloat(form.fraud_amount) || 95000,
        confidence: pred.confidence,
        riskLevel: pred.screeningTier === "tier1_high_risk" ? "Tier 1: High Risk" : "Tier 1: Standard",
        suspectAccountAge: parseInt(form.suspect_account_age_days) || 6,
        ipVelocity: parseInt(form.ip_incident_velocity_24h) || 8,
        assignedUnit: "Cyber Crime Cell",
      });

      logActivity({
        action: "Prediction Generated",
        actor: "System (ML & Graph Engine)",
        details: `Linked complaint ${generatedId} to hotspot zone ${zoneLabel} and cross-referenced mule accounts`,
        complaintId: generatedId,
        severity: "info",
      });

      // Switch to graph tab to show newly injected node!
      setActiveBottomTab("graph");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate hotspot prediction. Please check ML backend.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40">
                <FilePlus className="size-4" />
              </span>
              <h1 className="font-display text-xl font-bold text-foreground">
                {t.newComplaint}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.newComplaintSub}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.modelActive}
            </span>
          </div>
        </div>

        {/* ── Top Row: Form Card & Prediction Result Card (Side-by-Side) ── */}
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          
          {/* Intake Form (Left 5 Cols) */}
          <section className="panel p-6 lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="font-display text-sm font-bold text-foreground">{t.newComplaint}</h2>
              <span className="text-[10px] font-mono text-muted-foreground">I4C STANDARD FORMAT</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">

              {/* Live Previously Reported Cross-Reference Flag */}
              {crossRef.hasMatch && (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                      <AlertTriangle className="size-4 animate-bounce" />
                      <span>PREVIOUSLY REPORTED ENTITY DETECTED</span>
                    </div>
                    <span className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-400">
                      {crossRef.matchCount} PRIOR COMPLAINT{crossRef.matchCount > 1 ? "S" : ""}
                    </span>
                  </div>

                  <p className="text-[11px] text-foreground/90">
                    Suspect account or phone number matches active police dockets:
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {crossRef.matchedComplaintIds.map((priorId) => (
                      <button
                        type="button"
                        key={priorId}
                        onClick={() => setInspectedCaseId(priorId)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 font-mono text-[11px] font-bold text-rose-300 hover:bg-rose-500/30 hover:scale-105 transition-all shadow-sm"
                      >
                        <span>{priorId}</span>
                        <ExternalLink className="size-2.5 opacity-70" />
                      </button>
                    ))}
                  </div>

                  {crossRef.suggestedSyndicate && (
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-rose-300 font-bold">
                      <span>Syndicate Cluster:</span>
                      <span className="underline decoration-rose-400">{crossRef.suggestedSyndicate}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Victim Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t.victimLat}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.victim_lat}
                    onChange={(e) => setForm({ ...form, victim_lat: e.target.value })}
                    className="h-9 w-full rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-mono text-foreground outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t.victimLon}</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.victim_lon}
                    onChange={(e) => setForm({ ...form, victim_lon: e.target.value })}
                    className="h-9 w-full rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-mono text-foreground outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Fraud Amount & Fraud Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t.fraudAmount}</label>
                  <input
                    type="number"
                    value={form.fraud_amount}
                    onChange={(e) => setForm({ ...form, fraud_amount: e.target.value })}
                    className="h-9 w-full rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t.fraudType}</label>
                  <select
                    value={form.fraud_type}
                    onChange={(e) => setForm({ ...form, fraud_type: e.target.value })}
                    className="h-9 w-full rounded-xl border border-border/60 bg-muted/30 px-2.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {FRAUD_TYPES.map((ft) => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bank & Suspect Account Age */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t.bank}</label>
                  <select
                    value={form.bank}
                    onChange={(e) => setForm({ ...form, bank: e.target.value })}
                    className="h-9 w-full rounded-xl border border-border/60 bg-muted/30 px-2.5 text-xs text-foreground outline-none focus:border-primary"
                  >
                    {BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t.accountAge}</label>
                  <input
                    type="number"
                    min={0}
                    value={form.suspect_account_age_days}
                    onChange={(e) => setForm({ ...form, suspect_account_age_days: e.target.value })}
                    className="h-9 w-full rounded-xl border border-border/60 bg-muted/30 px-3 text-xs font-mono text-foreground outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={predicting}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-[0_0_20px_-4px_oklch(0.68_0.16_248/0.7)] transition-all hover:scale-[1.01] disabled:opacity-60"
              >
                {predicting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t.predicting}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>{t.predict} & Link Graph Node</span>
                  </>
                )}
              </button>
            </form>

            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                {errorMsg}
              </div>
            )}
          </section>

          {/* ML Prediction & Hotspot Output Panel (Right 7 Cols) */}
          <section className="lg:col-span-7">
            {prediction ? (
              <div className="panel p-6 space-y-5 border-cyan-500/40 shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]">
                
                {/* Header Prediction Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/40 shadow-[0_0_15px_#f43f5e]">
                      <Radio className="size-6 animate-pulse" />
                    </span>
                    <div>
                      <p className="text-[10px] font-mono font-black uppercase text-rose-600 dark:text-rose-400 tracking-wider">
                        #1 Primary Predicted Extraction Zone
                      </p>
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {prediction.zoneName}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-2xl font-black text-primary">
                      {prediction.confidence}%
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Confidence Score</p>
                  </div>
                </div>

                {/* Critical Attributes Grid */}
                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5 text-primary" />
                      <span className="text-[10px] font-bold uppercase">Estimated Window</span>
                    </div>
                    <p className="font-mono font-bold text-foreground">
                      {formatWindowText(
                        lang,
                        prediction.timeWindowHours?.min ?? 2,
                        prediction.timeWindowHours?.max ?? 6,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="size-3.5 text-rose-600 dark:text-rose-400" />
                      <span className="text-[10px] font-bold uppercase">Zone Coordinates</span>
                    </div>
                    <p className="font-mono text-[11px] text-foreground">{prediction.lat.toFixed(4)}°N, {prediction.lng.toFixed(4)}°E</p>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Shield className="size-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-[10px] font-bold uppercase">Screening Tier</span>
                    </div>
                    <p className="font-mono font-bold text-foreground">
                      {formatScreeningBadge(lang, prediction.screeningTier)}
                    </p>
                  </div>
                </div>

                {/* Top Predicted Hotspot Zones */}
                {prediction.topPredictions && prediction.topPredictions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Top 3 Alternative Withdrawal Hotspots:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {prediction.topPredictions.slice(0, 3).map((tp, idx) => (
                        <div
                          key={tp.zoneId}
                          className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-2.5"
                        >
                          <div>
                            <span className="text-[9px] font-mono text-muted-foreground">#{idx + 1} Predicted</span>
                            <p className="text-xs font-bold text-foreground">{tp.zoneName}</p>
                          </div>
                          <div className="text-right font-mono text-xs font-bold text-primary">
                            {tp.confidence}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Operational Action */}
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <p className="text-xs font-black uppercase tracking-wider text-primary">
                      Recommended Law Enforcement Action
                    </p>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {formatActionText(lang, prediction)}
                  </p>
                </div>

                {/* ── Explain This Prediction Accordion ── */}
                <ExplainPredictionAccordion prediction={prediction} />

                {/* ── Fund Recovery Likelihood Estimator Card ── */}
                <FundRecoveryEstimatorCard prediction={prediction} />

                {/* ── Additive Feature: Victim-Centric & Collective Threat Context ── */}
                {collectiveSignal.isMatchedToEmergingPattern && (
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2.5 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                          Emerging Collective Pattern Signal
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {collectiveSignal.patternTitle} ({collectiveSignal.patternId})
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Individually low-value complaint (₹{parseFloat(form.fraud_amount).toLocaleString("en-IN")}) matches a coordinated cluster of <strong>{collectiveSignal.relatedComplaintsCount} victims</strong> totaling <strong>₹{collectiveSignal.collectiveLossTotal?.toLocaleString("en-IN")}</strong> collective loss.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-lg font-black text-amber-600 dark:text-amber-400">
                          {collectiveSignal.investigationPrioritySignal}
                        </span>
                        <p className="text-[9px] text-muted-foreground">Priority Signal</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-card/60 p-2 text-[10px] text-muted-foreground">
                      💡 <em>"{VICTIM_CENTRIC_TEXT.tagline}"</em> — {VICTIM_CENTRIC_TEXT.additiveLayerNotice}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="panel flex h-full min-h-[440px] flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
                <span className="grid size-16 place-items-center rounded-3xl bg-muted/40 text-muted-foreground ring-1 ring-border/40">
                  <Radio className="size-8 opacity-60" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Awaiting Complaint Attributes
                  </h3>
                  <p className="text-xs max-w-sm mt-1">
                    Fill in the suspect and victim report parameters on the left (or pin directly on the map below) and click <strong>{t.predict}</strong> to forecast withdrawal vectors and inject into the link-analysis graph.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── Bottom Section: Switchable Geospatial Map & Link-Analysis Graph ── */}
        <section className="w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveBottomTab("map")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeBottomTab === "map"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <MapPin className="size-3.5" />
                <span>🗺️ Live Geospatial Reference Map</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBottomTab("graph")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeBottomTab === "graph"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Layers className="size-3.5" />
                <span>🕸️ Entity Link-Analysis Network Graph</span>
                {submittedComplaintId && (
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground font-mono">
              {activeBottomTab === "map" ? "Natural Street Map · Two-Way Geocoding" : "Multi-Hop Cross-Case Mule Syndicate Intelligence"}
            </p>
          </div>

          {activeBottomTab === "map" ? (
            <ClientOnly fallback={<div className="h-[460px] bg-card/40 rounded-xl border border-border/50 animate-pulse flex items-center justify-center text-xs text-muted-foreground font-mono">Initializing GPS Geocoding Engine...</div>}>
              <Suspense fallback={<div className="h-[460px] bg-card/40 rounded-xl border border-border/50 animate-pulse flex items-center justify-center text-xs text-muted-foreground font-mono">Loading Tactical Incident Map...</div>}>
                <ComplaintMapPreview
                  victimLat={form.victim_lat}
                  victimLon={form.victim_lon}
                  prediction={prediction}
                  onSelectLocation={(lat, lon) => {
                    setForm((prev) => ({
                      ...prev,
                      victim_lat: String(lat),
                      victim_lon: String(lon),
                    }));
                  }}
                />
              </Suspense>
            </ClientOnly>
          ) : (
            <LinkAnalysisGraph
              activeHighlightId={submittedComplaintId || undefined}
              onSelectComplaint={(id) => setInspectedCaseId(id)}
            />
          )}
        </section>

        {/* ── Inspected Prior Case Popup Modal ── */}
        {inspectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-xl bg-rose-500/20 text-rose-400">
                    <ShieldAlert className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Prior Police Docket: {inspectedCase.id}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Reported {inspectedCase.timestamp}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedCaseId(null)}
                  className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Fraud Type</span>
                  <p className="font-semibold text-foreground">{inspectedCase.fraudType}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Fraud Amount</span>
                  <p className="font-mono font-bold text-rose-400">₹{inspectedCase.fraudAmount.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Suspect Account</span>
                  <p className="font-mono font-bold text-foreground">{inspectedCase.suspectAccountId || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Suspect Phone</span>
                  <p className="font-mono font-bold text-foreground">{inspectedCase.suspectPhone || "N/A"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3.5 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
                  <MapPin className="size-3.5" />
                  <span>Predicted Hotspot Cluster</span>
                </div>
                <p className="font-bold text-foreground">{inspectedCase.predictedHotspot}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <button
                  onClick={() => setInspectedCaseId(null)}
                  className="rounded-xl border border-border/60 bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80"
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
