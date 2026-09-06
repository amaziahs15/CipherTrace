/**
 * DemoModeBanner — Persistent sticky warning shown on all dashboard routes.
 * Dismissable for the current session, but re-appears on page reload.
 */
import React, { useState, useEffect } from "react";
import { AlertTriangle, X, ShieldOff } from "lucide-react";

const SESSION_KEY = "cybershield_demo_dismissed";

export default function DemoModeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check session-level dismissal (not localStorage — reappears on reload)
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="relative z-50 flex items-start gap-3 border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs"
    >
      <ShieldOff className="mt-0.5 size-4 shrink-0 text-amber-500" />
      <div className="flex-1">
        <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
          ⚠ Demo Mode — Synthetic Data Only
        </span>
        <span className="ml-2 text-amber-700/80 dark:text-amber-300/80">
          This is a simulation using synthetic data. It is{" "}
          <strong>not connected</strong> to any live government or banking systems
          (NCRP, CFCFRMS, I4C, CCTNS). Generated freeze requests, CCTV requests,
          and lookout notices are{" "}
          <strong>drafts requiring human legal review and officer signature</strong>{" "}
          before any real-world use.
        </span>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss demo banner"
        className="ml-2 shrink-0 rounded p-1 text-amber-600 hover:bg-amber-500/20 transition-colors"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
