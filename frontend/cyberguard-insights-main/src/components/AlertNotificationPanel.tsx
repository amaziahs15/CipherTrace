// ─── Header Notification Bell & Global Toast Dispatch System ──────────────────
// Dropdown popover and floating live toasts connected to the unified alert store.

import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  ShieldAlert,
  Send,
  Building2,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  ChevronRight,
  Flame,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import {
  useAlerts,
  triggerSystemAlert,
  SAMPLE_CITIES,
  SAMPLE_BANKS,
  SAMPLE_FRAUDS,
  type ThreatAlert,
} from "@/lib/alertsStore";

interface AlertPanelProps {
  latestPrediction?: {
    zoneName: string;
    amount?: number | undefined;
    fraudType?: string | undefined;
    bank?: string | undefined;
    screeningTier?: string | undefined;
    confidence?: number | undefined;
  } | null | undefined;
}

export default function AlertNotificationPanel({ latestPrediction }: AlertPanelProps) {
  const { alerts, unreadCount, markAllAsRead, markAsRead, dismissAlert } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [toastAlert, setToastAlert] = useState<ThreatAlert | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevPredictionRef = useRef<any>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Listen to new toast notifications globally
  useEffect(() => {
    const handleNewToast = (e: any) => {
      if (e.detail) {
        setToastAlert(e.detail);
      }
    };
    window.addEventListener("ciphertrace:new_toast_alert", handleNewToast);
    return () => window.removeEventListener("ciphertrace:new_toast_alert", handleNewToast);
  }, []);

  // Auto-dismiss toast after 6.5s
  useEffect(() => {
    if (!toastAlert) return;
    const timer = setTimeout(() => setToastAlert(null), 6500);
    return () => clearTimeout(timer);
  }, [toastAlert]);

  // Watch for high-risk predictions (> 80k or high tier)
  useEffect(() => {
    if (!latestPrediction || latestPrediction === prevPredictionRef.current) return;
    prevPredictionRef.current = latestPrediction;

    const amount = Number(latestPrediction.amount) || 95000;
    const isHighRisk =
      amount >= 80000 ||
      latestPrediction.screeningTier === "tier1_high_risk" ||
      (latestPrediction.confidence ?? 0) >= 75;

    if (isHighRisk) {
      triggerSystemAlert({
        city: latestPrediction.zoneName || "Delhi NCR Zone",
        bank: latestPrediction.bank,
        amount,
        fraudType: latestPrediction.fraudType,
        severity: amount > 150000 ? "critical" : "high",
      });
    }
  }, [latestPrediction]);

  // Periodic simulation interval (~50s) for live hackathon demonstration
  useEffect(() => {
    const timer = setInterval(() => {
      const city = SAMPLE_CITIES[Math.floor(Math.random() * SAMPLE_CITIES.length)] ?? "Delhi NCR Zone";
      const bank = SAMPLE_BANKS[Math.floor(Math.random() * SAMPLE_BANKS.length)] ?? "SBI";
      const fraudType = SAMPLE_FRAUDS[Math.floor(Math.random() * SAMPLE_FRAUDS.length)] ?? "UPI Fraud";
      const amount = Math.floor(84000 + Math.random() * 185000);

      triggerSystemAlert({
        city,
        bank,
        amount,
        fraudType,
        severity: amount > 150000 ? "critical" : "high",
      });
    }, 52000);

    return () => clearInterval(timer);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      markAllAsRead();
    }
    setIsOpen((prev) => !prev);
  };

  const recentAlerts = alerts.slice(0, 8);

  return (
    <>
      {/* ── 1. Top-Right Bell Button in Header ── */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={handleToggle}
          title="Notification Center &amp; Live Dispatches"
          className="group relative grid size-9 place-items-center rounded-xl border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[9px] font-black text-white shadow-[0_0_10px_#f43f5e] animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* ── Bell Dropdown Panel ── */}
        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-border/80 bg-card p-0 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* Dropdown Header */}
            <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-4 text-rose-600 dark:text-rose-400" />
                <span className="font-display text-xs font-bold text-foreground">
                  Notifications &amp; LEA Dispatches
                </span>
              </div>
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
              >
                <CheckCheck className="size-3" />
                <span>Mark all read</span>
              </button>
            </div>

            {/* Scrollable Alert List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/20">
              {recentAlerts.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No active threat notifications.
                </div>
              ) : (
                recentAlerts.map((alt) => {
                  const isCritical = alt.severity === "critical";
                  const isHigh = alt.severity === "high";

                  return (
                    <div
                      key={alt.id}
                      className={`p-3.5 transition-colors hover:bg-muted/30 text-xs space-y-1.5 ${
                        !alt.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`grid size-5 shrink-0 place-items-center rounded-lg ${
                              isCritical
                                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                                : isHigh
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                : "bg-cyan-500/20 text-primary"
                            }`}
                          >
                            {isCritical ? (
                              <Flame className="size-3" />
                            ) : (
                              <AlertTriangle className="size-3" />
                            )}
                          </span>
                          <span className="font-bold text-foreground">{alt.city}</span>
                        </div>

                        <span className="font-mono text-[10px] text-muted-foreground">
                          {alt.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-foreground/90 leading-snug pl-6.5">
                        High-Risk {alt.fraudType} alert for{" "}
                        <strong className="text-rose-600 dark:text-rose-400 font-mono">
                          ₹{alt.amount.toLocaleString("en-IN")}
                        </strong>{" "}
                        routed to {alt.bank}.
                      </p>

                      <div className="flex items-center justify-between pl-6.5 text-[10px] text-muted-foreground">
                        <span>{alt.lea}</span>
                        {!alt.read && (
                          <span className="size-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer Link */}
            <div className="border-t border-border/40 bg-muted/20 p-2.5 text-center">
              <Link
                to="/alerts"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <span>View Full Dispatches &amp; History</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Global Floating Toast Notification ── */}
      {toastAlert && (
        <aside
          aria-live="polite"
          className="fixed top-20 right-4 z-50 w-80 sm:w-96 rounded-2xl border border-rose-500/50 bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/40 shadow-[0_0_12px_#f43f5e]">
                <ShieldAlert className="size-4.5" />
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
                    High-Risk LEA Dispatch
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {toastAlert.id}
                  </span>
                </div>
                <p className="font-bold text-foreground text-sm">
                  {toastAlert.city}
                </p>
                <p className="text-foreground/90 text-[11px] leading-snug">
                  Automated vector interdiction alert sent to{" "}
                  <strong>{toastAlert.lea}</strong> +{" "}
                  <strong>{toastAlert.bank}</strong> for{" "}
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    ₹{toastAlert.amount.toLocaleString("en-IN")}
                  </span>
                  .
                </p>
              </div>
            </div>

            <button
              onClick={() => setToastAlert(null)}
              className="grid size-6 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-[10px]">
            <Link
              to="/alerts"
              onClick={() => setToastAlert(null)}
              className="font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View in Alerts Feed</span>
              <ExternalLink className="size-2.5" />
            </Link>
            <span className="font-mono text-muted-foreground">
              {toastAlert.timestamp}
            </span>
          </div>
        </aside>
      )}
    </>
  );
}
