import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  Radio,
  Crosshair,
  Lock,
  ChevronRight,
  Activity,
  Cpu,
  Database,
  Terminal,
  Sparkles,
  MapPin,
  Flame,
} from "lucide-react";
import ThemeLanguageControls, { useTheme } from "@/components/ThemeLanguageControls";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CipherTrace · Predictive Cybercrime Intelligence" },
      {
        name: "description",
        content:
          "Law-enforcement command center predicting cash withdrawal hotspots and geo-spatial fraud patterns in real time.",
      },
      { property: "og:title", content: "CipherTrace · Cybercrime Intelligence Terminal" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

// ─── Hotspot telemetry nodes for radar visualization ─────────────────────────

const RADAR_HOTSPOTS = [
  {
    id: "HZ-01",
    name: "Mumbai Metro",
    coords: "19.07°N · 72.87°E",
    status: "CRITICAL ALERT",
    threat: "high",
    angle: 320,
    radius: 175,
    delay: "0s",
  },
  {
    id: "HZ-04",
    name: "Delhi NCR Zone",
    coords: "28.61°N · 77.20°E",
    status: "ACTIVE PATROL",
    threat: "high",
    angle: 45,
    radius: 190,
    delay: "1.2s",
  },
  {
    id: "HZ-02",
    name: "Kolkata Central",
    coords: "22.57°N · 88.36°E",
    status: "MONITORING",
    threat: "med",
    angle: 120,
    radius: 165,
    delay: "2.4s",
  },
  {
    id: "HZ-03",
    name: "Chennai North",
    coords: "13.08°N · 80.27°E",
    status: "SURVEILLANCE",
    threat: "low",
    angle: 215,
    radius: 180,
    delay: "3.6s",
  },
  {
    id: "HZ-05",
    name: "Bengaluru South",
    coords: "12.97°N · 77.59°E",
    status: "TRIAGE VERIFIED",
    threat: "med",
    angle: 260,
    radius: 145,
    delay: "4.8s",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const [launching, setLaunching] = useState(false);
  const [activeNode, setActiveNode] = useState(0);
  const [terminalText, setTerminalText] = useState("SECURE PROTOCOL INITIALIZED · READY");

  // Cycle active hotspot node highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % RADAR_HOTSPOTS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = () => {
    setLaunching(true);
    setTerminalText("AUTHENTICATING COMMAND CREDENTIALS… DISPATCHING TO RADAR TERMINAL");
    setTimeout(() => {
      navigate({ to: "/dashboard" });
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col justify-between selection:bg-cyan-500/30 transition-colors duration-200">
      {/* ── Background Cyber Grid & Surveillance Atmosphere ── */}
      <div className="pointer-events-none absolute inset-0 cyber-grid-bg opacity-35" />

      {/* Radial glow auras */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-primary/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 size-[400px] rounded-full bg-blue-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 size-[350px] rounded-full bg-indigo-600/10 blur-[100px]" />

      {/* Launching Transition Overlay */}
      {launching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md transition-opacity duration-300">
          <div className="relative flex flex-col items-center gap-4">
            <span className="grid size-20 place-items-center rounded-3xl bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_50px_oklch(0.68_0.16_248/0.8)] animate-pulse">
              <Shield className="size-10" />
            </span>
            <p className="font-mono text-sm tracking-widest text-primary uppercase animate-pulse">
              {terminalText}
            </p>
            <div className="h-1 w-64 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-[gridScroll_0.8s_linear_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header Navigation Bar ── */}
      <header className="relative z-20 flex items-center justify-between border-b border-border/40 bg-card/70 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-cyan-500/15 text-primary ring-1 ring-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]">
            <Shield className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black tracking-widest text-foreground uppercase">
                {t.appName || "CipherTrace"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {t.appSub || "Cybercrime Cash Withdrawal Intelligence"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live telemetry badge */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="size-2 animate-ping rounded-full bg-emerald-500" />
            <span>{t.radarActive || "RADAR ACTIVE"}</span>
          </div>

          <Link
            to="/investigator"
            className="flex items-center gap-1.5 rounded-xl border border-rose-600/40 bg-rose-500/15 px-3.5 py-1.5 text-xs font-bold text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300 transition-colors hover:bg-rose-500/25"
          >
            <ShieldAlert className="size-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">{t.investigatorGate || "Investigator Gate"}</span>
          </Link>

          <ThemeLanguageControls
            theme={theme}
            toggleTheme={toggleTheme}
            lang={lang}
            setLang={setLang}
          />
        </div>
      </header>

      {/* ── Central Hero Section ── */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        
        {/* Security Classification Pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-600/40 bg-cyan-500/15 px-4 py-1.5 text-xs font-bold text-cyan-900 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 backdrop-blur-md shadow-sm">
          <Lock className="size-3.5 text-cyan-700 dark:text-cyan-400" />
          <span className="tracking-wider uppercase">{t.restrictedIntel || "Restricted Law Enforcement Intelligence"}</span>
          <span className="size-1 rounded-full bg-cyan-500" />
          <span className="font-mono text-[11px] text-cyan-700 dark:text-cyan-400">{t.liveFeed || "LIVE FEED"}</span>
        </div>

        {/* ── Interactive Central Radar & Network Motif ── */}
        <div className="relative mb-8 flex size-[320px] sm:size-[420px] items-center justify-center">
          
          {/* Concentric Radar Pulse Rings */}
          <div className="pointer-events-none absolute inset-0 rounded-full border border-cyan-600/35 dark:border-cyan-500/20" />
          <div className="pointer-events-none absolute inset-[18%] rounded-full border border-cyan-600/40 dark:border-cyan-500/25" />
          <div className="pointer-events-none absolute inset-[36%] rounded-full border border-blue-600/45 dark:border-blue-500/30" />
          <div className="pointer-events-none absolute inset-[54%] rounded-full border border-cyan-600/50 dark:border-cyan-400/35" />

          {/* Expanding Radar Wave Pulses */}
          <div className="pointer-events-none absolute inset-0 rounded-full border border-cyan-500/50 animate-radar-wave-1" />
          <div className="pointer-events-none absolute inset-0 rounded-full border border-cyan-500/50 animate-radar-wave-2" />

          {/* Rotating Radar Sweep Beam */}
          <div className="pointer-events-none absolute inset-0 rounded-full animate-radar-sweep overflow-hidden">
            <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-gradient-to-bl from-cyan-600/40 via-cyan-500/20 to-transparent dark:from-cyan-400/30 dark:via-cyan-500/10 dark:to-transparent origin-bottom-left" />
            <div className="absolute top-0 left-1/2 h-1/2 w-[2px] bg-gradient-to-b from-cyan-600 to-transparent dark:from-cyan-300" />
          </div>

          {/* Connecting Crosshairs & Telemetry Lines */}
          <div className="pointer-events-none absolute top-1/2 left-0 w-full h-[1px] bg-cyan-600/30 dark:bg-cyan-500/20" />
          <div className="pointer-events-none absolute top-0 left-1/2 h-full w-[1px] bg-cyan-600/30 dark:bg-cyan-500/20" />

          {/* Hotspot Node Markers Positioned Around Radar */}
          {RADAR_HOTSPOTS.map((node, index) => {
            const rad = (node.angle * Math.PI) / 180;
            // Radius scales down on smaller screens
            const r = typeof window !== "undefined" && window.innerWidth < 640 ? node.radius * 0.72 : node.radius;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            const isActive = activeNode === index;
            const isAlert = node.threat === "high";

            return (
              <div
                key={node.id}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className={`absolute z-20 flex flex-col items-center ${
                  isActive ? "scale-110" : "scale-95 opacity-85"
                }`}
              >
                {/* Node Dot */}
                <div className="relative">
                  <span
                    className={`block size-3.5 rounded-full border-2 transition-all duration-300 ${
                      isAlert
                        ? "bg-rose-500 border-white shadow-[0_0_15px_#f43f5e]"
                        : "bg-cyan-500 border-white shadow-[0_0_15px_#06b6d4]"
                    }`}
                  />
                  {isActive && (
                    <span
                      className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${
                        isAlert ? "bg-rose-500" : "bg-cyan-400"
                      }`}
                    />
                  )}
                </div>

                {/* Node Pill Tag */}
                <div
                  className={`mt-1.5 whitespace-nowrap rounded-lg px-2 py-0.5 text-[10px] font-mono tracking-tight backdrop-blur-md border transition-all ${
                    isActive
                      ? "bg-primary/20 border-primary text-primary font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                      : "bg-card/90 border-border/80 text-foreground font-medium shadow-sm"
                  }`}
                >
                  <span>{node.name}</span>
                </div>
              </div>
            );
          })}

          {/* Center Shield Icon */}
          <div className="relative z-10 grid size-24 place-items-center rounded-3xl bg-card border-2 border-primary text-primary shadow-[0_0_35px_oklch(0.68_0.16_248/0.7)] backdrop-blur-md">
            <img
              src="/favicon.svg"
              alt="CipherTrace Shield"
              className="size-16 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            />
          </div>
        </div>

        {/* ── Main Title with Scanline Glitch Reveal ── */}
        <h1 className="animate-title-scan font-display text-4xl font-black tracking-tight text-foreground sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-600 dark:from-foreground dark:via-primary dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            CIPHERTRACE
          </span>
        </h1>

        {/* Tagline */}
        <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-slate-700 dark:text-muted-foreground sm:text-base md:text-lg">
          {t.heroTagline || "Predictive Fraud Intelligence — Mapping ATM Cash Withdrawal Hotspots & Geo-Spatial Escape Vectors in Real Time"}
        </p>

        {/* Terminal Sub-banner */}
        <div className="mt-3 flex items-center gap-2 font-mono text-xs font-semibold text-primary">
          <Terminal className="size-3.5" />
          <span>{t.terminalFeatures || "ML CLUSTER FORECASTING · SHA-256 AUDIT LOG · GROQ AI ASSISTANT"}</span>
        </div>

        {/* ── Prominent CTA Launch Button ── */}
        <div className="mt-9 flex flex-col items-center gap-3">
          <button
            onClick={handleLaunch}
            disabled={launching}
            className="animate-cta-glow group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-cyan-400 bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 px-8 py-4 text-base font-black tracking-widest text-white uppercase shadow-[0_8px_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_45px_rgba(6,182,212,0.8)] active:scale-95 disabled:opacity-75 cursor-pointer"
          >
            {/* Shimmer sweep effect */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <Radio className="size-5 animate-pulse text-white shrink-0" />
            <span>{t.launchDashboard || "Launch Command Dashboard"}</span>
            <ChevronRight className="size-5 transition-transform group-hover:translate-x-1 shrink-0" />
          </button>

          <p className="font-mono text-[11px] text-muted-foreground tracking-wider font-medium">
            {t.pressToInitialize || "PRESS TO INITIALIZE REAL-TIME SURVEILLANCE FEED"}
          </p>
        </div>
      </main>

      {/* ── Footer Telemetry Stat Chips ── */}
      <footer className="relative z-20 border-t border-border/60 bg-card/85 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
          {/* Stat Chip 1 */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 shadow-sm">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span className="font-mono font-bold text-foreground">{t.hotspotsTracked || "5 Major Hotspot Clusters"}</span>
            <span className="text-[10px] text-muted-foreground font-medium">{t.trackedLabel || "Tracked"}</span>
          </div>

          {/* Stat Chip 2 */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 shadow-sm">
            <Cpu className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-mono font-bold text-foreground">{t.realtimeML || "Real-Time ML Inference"}</span>
            <span className="text-[10px] text-muted-foreground font-medium">&lt;100ms</span>
          </div>

          {/* Stat Chip 3 */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 shadow-sm">
            <Database className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-mono font-bold text-foreground">{t.auditChain || "SHA-256 Audit Chain"}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{t.verifiedLabel || "Verified ✓"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
