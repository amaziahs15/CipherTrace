// ─── Persistent Left Sidebar Dashboard Layout ─────────────────────────────────
// Professional command-center layout with expandable sidebar, active route glows,
// role indicator, top bar controls, and responsive drawer navigation.

import React, { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Shield,
  LayoutDashboard,
  FilePlus,
  Bot,
  ShieldAlert,
  Fingerprint,
  Database,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  User,
  Zap,
  Radio,
  Sparkles,
  Maximize2,
  Layers,
} from "lucide-react";
import ThemeLanguageControls, { useTheme } from "@/components/ThemeLanguageControls";
import AlertNotificationPanel from "@/components/AlertNotificationPanel";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import { useI18n } from "@/lib/i18n";
import DemoModeBanner from "@/components/layout/DemoModeBanner";

export type RoleType = "citizen" | "investigator";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeRole?: RoleType;
  onRoleChange?: (role: RoleType) => void;
}

export default function DashboardLayout({
  children,
  activeRole: propRole,
  onRoleChange,
}: DashboardLayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<RoleType>(propRole || "citizen");

  const handleRoleToggle = () => {
    const nextRole = role === "citizen" ? "investigator" : "citizen";
    setRole(nextRole);
    if (onRoleChange) onRoleChange(nextRole);
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const navItems = [
    {
      label: t.navOverview || "Overview",
      description: t.navOverviewSub || "Risk Heatmap & Filters",
      icon: LayoutDashboard,
      to: "/dashboard",
      badge: t.badgeLive || "LIVE",
    },
    {
      label: t.navIODashboard || "IO Dashboard",
      description: t.navIODashboardSub || "Prioritized Complaint Queue",
      icon: Layers,
      to: "/io-dashboard",
      badge: t.badgeNew || "NEW",
    },
    {
      label: t.newComplaint || "New Complaint",
      description: t.navNewComplaintSub || "Intake & Hotspot Prediction",
      icon: FilePlus,
      to: "/complaint",
      badge: t.badgeML || "ML",
    },
    {
      label: t.aiAssistant || "AI Assistant",
      description: t.navAIAssistantSub || "Groq Intelligence Chat",
      icon: Bot,
      to: "/chat",
      badge: "AI",
    },
    {
      label: t.navAlerts || "Live Alerts",
      description: t.navAlertsSub || "LEA & Bank Dispatches",
      icon: ShieldAlert,
      to: "/alerts",
      badge: t.badgeAuto || "AUTO",
    },
    {
      label: t.navFraudRings || "Fraud Rings",
      description: t.navFraudRingsSub || "Cluster & Ring Detection",
      icon: Radio,
      to: "/fraud-rings",
      badge: t.badgeML || "ML",
    },
    {
      label: t.navInvestigator || "Investigator View",
      description: t.navInvestigatorSub || "LEA Case Dockets",
      icon: Fingerprint,
      to: "/investigator",
      badge: t.badgeRestricted || "RESTRICTED",
      restricted: true,
    },
    {
      label: t.auditLog || "Audit Logs",
      description: t.navAuditSub || "SHA-256 Hash Chain",
      icon: Database,
      to: "/audit",
      badge: t.badgeVerified || "VERIFIED",
    },
    {
      label: t.navMetrics || "System Metrics",
      description: t.navMetricsSub || "Benchmark & Performance",
      icon: Sparkles,
      to: "/metrics",
      badge: t.badgeRef || "REF",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-cyan-500/30">
      {/* ── Demo Mode Warning Banner ── */}
      <DemoModeBanner />

      {/* ── Top Header Navigation Bar ── */}
      <header className="header-gradient sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-card/85 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid size-9 place-items-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          {/* CipherTrace Brand Mark */}
          <Link to="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <span className="grid size-10 place-items-center rounded-xl bg-cyan-500/20 text-primary ring-1 ring-cyan-500/40 shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)] transition-transform group-hover:scale-105">
              <Shield className="size-5" />
            </span>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black tracking-widest text-foreground uppercase">
                  CipherTrace
                </span>
                <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-primary uppercase">
                  Command v2.1
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {t.appSub}
              </p>
            </div>
          </Link>
        </div>

        {/* Top Bar Status, Role Switcher & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live radar badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="size-1.5 animate-ping rounded-full bg-emerald-400" />
            <span>{t.radarActive || "RADAR ACTIVE"}</span>
          </div>

          {/* Role Switcher Pill */}
          <button
            onClick={handleRoleToggle}
            title="Switch User Role (Citizen / Investigator)"
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition-all ${
              role === "investigator"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                : "border-primary/40 bg-primary/10 text-primary shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            }`}
          >
            <User className="size-3.5" />
            <span className="hidden sm:inline">Role:</span>
            <span>{role === "investigator" ? (t.roleInvestigator || "Investigator (LEA)") : (t.roleCitizen || "Citizen Triage")}</span>
          </button>

          {/* Quick Landing Page Portal Link */}
          <Link
            to="/"
            title="Return to Cinematic Landing Portal"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            <Home className="size-3.5" />
            <span className="hidden md:inline">{t.portal || "Portal"}</span>
          </Link>

          {/* Live Alert Dispatch Notification Panel */}
          <AlertNotificationPanel />

          {/* Theme & Multi-Language Controls */}
          <ThemeLanguageControls
            theme={theme}
            toggleTheme={toggleTheme}
            lang={lang}
            setLang={setLang}
          />
        </div>
      </header>

      {/* ── Main Body with Fixed Sidebar + Content ── */}
      <div className="relative flex flex-1 overflow-hidden">
        
        {/* ── Fixed Desktop Left Sidebar ── */}
        <aside
          className={`hidden md:flex flex-col justify-between border-r border-border/50 bg-card/60 backdrop-blur-xl transition-all duration-300 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Navigation Links */}
          <div className="p-3 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
              {!collapsed ? "Command Modules" : "• • •"}
            </div>

            {navItems.map((item) => {
              const isActive = currentPath === item.to || (item.to !== "/dashboard" && currentPath.startsWith(item.to));
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-200 ${
                    isActive
                      ? "bg-primary/15 text-primary shadow-[0_0_20px_-4px_oklch(0.68_0.16_248/0.5)] ring-1 ring-primary/40 font-bold"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground font-medium"
                  }`}
                >
                  {/* Active glowing indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary shadow-[0_0_10px_#00f0ff]" />
                  )}

                  <Icon
                    className={`size-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "text-muted-foreground"
                    }`}
                  />

                  {!collapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                      <div className="min-w-0 pr-1">
                        <p className="text-xs leading-snug font-semibold">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground/80 leading-tight mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      {item.badge && (
                        <span
                          className={`ml-1 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-tight uppercase whitespace-nowrap ${
                            item.restricted
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-muted text-muted-foreground border border-border/60"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer Controls */}
          <div className="p-3 border-t border-border/40 space-y-2">
            {!collapsed && (
              <div className="rounded-xl border border-border/40 bg-muted/20 p-2.5 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-[10px] font-bold uppercase text-primary">
                    {t.i4cClusterLink || "I4C Cluster Link"}
                  </span>
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-muted-foreground/80 leading-tight">
                  {t.hotspotInferenceActive || "Hotspot inference active · SHA-256 verified"}
                </p>
              </div>
            )}

            {/* Collapse/Expand Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/40 bg-muted/30 p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <>
                  <ChevronLeft className="size-4" />
                  <span>{t.collapseNav || "Collapse Navigation"}</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ── Mobile Drawer Sidebar ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden bg-black/70 backdrop-blur-sm">
            <div className="w-72 bg-card border-r border-border/60 p-4 flex flex-col justify-between h-full shadow-2xl">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Shield className="size-5 text-primary" />
                    <span className="font-mono text-sm font-bold text-foreground">CipherTrace</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                    <X className="size-5" />
                  </button>
                </div>

                <div className="space-y-1 pt-2">
                  {navItems.map((item) => {
                    const isActive = currentPath === item.to;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                          isActive
                            ? "bg-primary/20 text-primary border border-primary/40"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border/40">
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 rounded-xl bg-muted/40 p-2.5 text-xs font-semibold text-muted-foreground"
                >
                  <Home className="size-4" />
                  <span>Return to Landing</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Central Main Page Content Area ── */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Main Page View */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 min-w-0 transition-all duration-300">
            {children}
          </main>
        </div>
      </div>

      {/* ── Global Floating AI Assistant Shortcut ── */}
      <FloatingAIAssistant />
    </div>
  );
}
