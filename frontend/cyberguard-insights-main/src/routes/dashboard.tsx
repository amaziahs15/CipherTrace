// ─── Route: /dashboard (Overview · Risk Heatmap & Hotspot Intelligence) ───────
import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Shield,
  Activity,
  MapPin,
  Flame,
  Radio,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  Database,
  Building2,
  ChevronRight,
  FilePlus,
  Bot,
  Layers,
} from "lucide-react";
import {
  fetchHotspots,
  type Hotspot,
  type Prediction,
} from "@/lib/hotspots";
import { useI18n } from "@/lib/i18n";
import { ClientOnly } from "@tanstack/react-router";
import CollectiveThreatCard from "@/components/CollectiveThreatCard";
import ModelTransparencyCard from "@/components/ModelTransparencyCard";

const HotspotMap = lazy(() => import("@/components/HotspotMap"));

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview · CipherTrace Cybercrime Command" },
      {
        name: "description",
        content: "High-level risk heatmap, real-time hotspot clusters, and ML telemetry overview.",
      },
    ],
  }),
  component: DashboardOverviewPage,
});

const STATIC_HOTSPOTS: Hotspot[] = [
  { id: "HZ-01", name: "Mumbai Metro Zone", lat: 19.076, lng: 72.8777, withdrawals: 142 },
  { id: "HZ-02", name: "Kolkata Central Zone", lat: 22.5726, lng: 88.3639, withdrawals: 98 },
  { id: "HZ-03", name: "Chennai North Zone", lat: 13.0827, lng: 80.2707, withdrawals: 76 },
  { id: "HZ-04", name: "Delhi NCR Zone", lat: 28.6139, lng: 77.209, withdrawals: 189 },
  { id: "HZ-05", name: "Bengaluru South Zone", lat: 12.9716, lng: 77.5946, withdrawals: 114 },
];

function DashboardOverviewPage() {
  const { lang, t } = useI18n();
  const [hotspots, setHotspots] = useState<Hotspot[]>(STATIC_HOTSPOTS);

  useEffect(() => {
    fetchHotspots()
      .then((data) => {
        if (data && data.length > 0) setHotspots(data);
      })
      .catch((err) => console.error("Error fetching live hotspots:", err));
  }, []);

  const totalWithdrawals = hotspots.reduce((s, h) => s + (h.withdrawals || 0), 0);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40">
                <Flame className="size-4" />
              </span>
              <h1 className="font-display text-xl font-bold text-foreground">
                {t.mapTitle}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.mapSub}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/complaint"
              className="inline-flex min-w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-[0_0_15px_-3px_oklch(0.68_0.16_248/0.7)] transition-all hover:scale-[1.02] whitespace-nowrap"
            >
              <FilePlus className="size-4 shrink-0" />
              <span>{t.newComplaint}</span>
            </Link>
          </div>
        </div>

        {/* ── Key Metrics Bar ── */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-cyan-500/15 text-primary ring-1 ring-cyan-500/30">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.activeHotspots}</p>
              <p className="font-display text-2xl font-bold text-foreground">{hotspots.length} Hubs</p>
              <p className="text-xs text-primary font-semibold">{t.zonesUnder}</p>
            </div>
          </div>

          <div className="panel flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30">
              <Flame className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.complaintsProcessed}</p>
              <p className="font-display text-2xl font-bold text-foreground">{totalWithdrawals.toLocaleString("en-IN")}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{t.rolling30}</p>
            </div>
          </div>

          <div className="panel flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
              <Cpu className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.modelActive}</p>
              <p className="font-display text-2xl font-bold text-foreground">&lt; 85ms</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{t.topFraudSub}</p>
            </div>
          </div>

          <div className="panel flex items-center gap-4 p-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
              <Database className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.auditLog}</p>
              <p className="font-display text-2xl font-bold text-foreground">{t.chainVerified}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{t.auditSub}</p>
            </div>
          </div>
        </section>

        {/* ── Risk Heatmap with Integrated Drill-Down Filters ── */}
        <section className="panel overflow-hidden border-border/60 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 px-6 py-4">
            <div>
              <h2 className="font-display text-base font-bold">{t.mapTitle}</h2>
              <p className="text-xs text-muted-foreground">{t.mapSub}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-primary ring-2 ring-primary/30" />{t.knownHotspot}</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-danger ring-2 ring-danger/30" />{t.pred1}</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-warning ring-2 ring-warning/30" />{t.pred2}</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-muted-foreground/60 ring-2 ring-muted-foreground/20" />{t.pred3}</span>
            </div>
          </div>

          <div className="h-[580px] w-full">
            <ClientOnly fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">{t.loadingMap}</div>}>
              <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">{t.loadingMap}</div>}>
                <HotspotMap
                  hotspots={hotspots}
                  prediction={null}
                  onLocate={() => {}}
                />
              </Suspense>
            </ClientOnly>
          </div>
        </section>

        {/* ── Hotspot Hub Cards Grid ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Active Regional Triage Hubs
            </h3>
            <span className="text-xs text-primary font-semibold">5 Hotspot Clusters</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {hotspots.map((h) => (
              <div
                key={h.id}
                className="panel p-4 space-y-2 transition-all hover:border-primary/50 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-primary/10 border border-primary/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary">
                    {h.id}
                  </span>
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground truncate">{h.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{h.lat.toFixed(2)}°N, {h.lng.toFixed(2)}°E</p>
                </div>
                <div className="pt-1 border-t border-border/30 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Logged:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{h.withdrawals} hits</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Model Transparency & Algorithmic Accountability Panel ── */}
        <section className="space-y-3">
          <ModelTransparencyCard />
        </section>

        {/* ── Additive Feature: Victim-Centric & Collective Threat Prioritization ── */}
        <section className="space-y-3">
          <CollectiveThreatCard />
        </section>
      </div>
    </DashboardLayout>
  );
}
