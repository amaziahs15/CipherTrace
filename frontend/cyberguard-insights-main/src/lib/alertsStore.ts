// ─── Unified Threat Alerts Store ─────────────────────────────────────────────
// Shared reactive alert and dispatch state across Header Bell, Toasts, and /alerts page.

import { useState, useEffect, useCallback } from "react";
import { logActivity } from "./activityLog";

export type AlertSeverity = "critical" | "high" | "warning" | "info";

export type ThreatAlert = {
  id: string;
  city: string;
  lea: string;
  bank: string;
  amount: number;
  fraudType: string;
  timestamp: string;
  timeAgo: string;
  severity: AlertSeverity;
  dispatched: boolean;
  read?: boolean;
  createdAt: number;
};

export const LEA_NAMES: Record<string, string> = {
  "Mumbai Metro Zone": "Mumbai Cyber Police (BKC HQ)",
  "Delhi NCR Zone": "Delhi Cyber Special Cell (Dwarka)",
  "Kolkata Central Zone": "Kolkata Cyber Police (Lalbazar)",
  "Chennai North Zone": "Chennai Cyber Crime Wing (Vepery)",
  "Bengaluru South Zone": "Karnataka CID Cyber Command",
  "Mumbai Metro": "Mumbai Cyber Police (BKC HQ)",
  "Delhi NCR": "Delhi Cyber Special Cell (Dwarka)",
  "Kolkata Central": "Kolkata Cyber Police (Lalbazar)",
  "Chennai North": "Chennai Cyber Crime Wing (Vepery)",
  "Bengaluru South": "Karnataka CID Cyber Command",
};

export const SAMPLE_BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Bank of Baroda"];
export const SAMPLE_CITIES = ["Delhi NCR Zone", "Mumbai Metro Zone", "Kolkata Central Zone", "Bengaluru South Zone", "Chennai North Zone"];
export const SAMPLE_FRAUDS = ["UPI Fraud", "OTP Fraud", "Fake Investment", "Loan App Scam", "Phishing"];

const STORAGE_KEY_ALERTS = "ciphertrace_alerts_store_v2";

const INITIAL_ALERTS: ThreatAlert[] = [
  {
    id: "ALT-8901",
    city: "Delhi NCR Zone",
    lea: "Delhi Cyber Special Cell (Dwarka)",
    bank: "SBI Fraud Desk",
    amount: 145000,
    fraudType: "UPI Fraud",
    timestamp: "Just now",
    timeAgo: "2m ago",
    severity: "critical",
    dispatched: true,
    read: false,
    createdAt: Date.now() - 2 * 60 * 1000,
  },
  {
    id: "ALT-8900",
    city: "Mumbai Metro Zone",
    lea: "Mumbai Cyber Police (BKC HQ)",
    bank: "HDFC Fraud Desk",
    amount: 98000,
    fraudType: "Fake Investment",
    timestamp: "12m ago",
    timeAgo: "12m ago",
    severity: "high",
    dispatched: true,
    read: false,
    createdAt: Date.now() - 12 * 60 * 1000,
  },
  {
    id: "ALT-8899",
    city: "Bengaluru South Zone",
    lea: "Karnataka CID Cyber Command",
    bank: "ICICI Fraud Desk",
    amount: 120000,
    fraudType: "OTP Fraud",
    timestamp: "28m ago",
    timeAgo: "28m ago",
    severity: "high",
    dispatched: true,
    read: true,
    createdAt: Date.now() - 28 * 60 * 1000,
  },
  {
    id: "ALT-8898",
    city: "Kolkata Central Zone",
    lea: "Kolkata Cyber Police (Lalbazar)",
    bank: "Axis Bank Fraud Desk",
    amount: 85000,
    fraudType: "Loan App Scam",
    timestamp: "45m ago",
    timeAgo: "45m ago",
    severity: "warning",
    dispatched: true,
    read: true,
    createdAt: Date.now() - 45 * 60 * 1000,
  },
];

export function getStoredAlerts(): ThreatAlert[] {
  if (typeof localStorage === "undefined") return INITIAL_ALERTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return JSON.parse(raw) as ThreatAlert[];
  } catch {
    return INITIAL_ALERTS;
  }
}

export function saveAlerts(alerts: ThreatAlert[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ciphertrace:alerts_updated", { detail: alerts }));
    }
  } catch (e) {
    console.warn("Failed to persist alerts:", e);
  }
}

export function triggerSystemAlert(params: {
  city: string;
  bank?: string | undefined;
  amount: number;
  fraudType?: string | undefined;
  severity?: AlertSeverity | undefined;
  lea?: string | undefined;
}) {
  const current = getStoredAlerts();
  const city = params.city || "Delhi NCR Zone";
  const lea = params.lea || LEA_NAMES[city] || "State Cyber Crime Cell";
  const bank = params.bank ? `${params.bank} Fraud Desk` : "Lead Bank Fraud Desk";
  const amount = params.amount || 95000;
  const fraudType = params.fraudType || "UPI Fraud";
  const severity: AlertSeverity = params.severity || (amount > 150000 ? "critical" : amount > 80000 ? "high" : "warning");

  const newAlert: ThreatAlert = {
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    city,
    lea,
    bank,
    amount,
    fraudType,
    timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    timeAgo: "Just now",
    severity,
    dispatched: true,
    read: false,
    createdAt: Date.now(),
  };

  const updated = [newAlert, ...current.slice(0, 49)];
  saveAlerts(updated);

  // Dispatch toast event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ciphertrace:new_toast_alert", { detail: newAlert }));
  }

  // Log to audit log
  logActivity({
    action: "Alert Dispatched",
    actor: "System (I4C Gateway)",
    details: `High-risk interdiction alert sent to ${lea} + ${bank} (₹${amount.toLocaleString("en-IN")})`,
    complaintId: newAlert.id,
    severity: severity === "critical" ? "critical" : "warning",
  });

  return newAlert;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<ThreatAlert[]>(() => getStoredAlerts());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setAlerts(e.detail);
      } else {
        setAlerts(getStoredAlerts());
      }
    };
    window.addEventListener("ciphertrace:alerts_updated", handleUpdate);
    return () => window.removeEventListener("ciphertrace:alerts_updated", handleUpdate);
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllAsRead = useCallback(() => {
    const updated = alerts.map((a) => ({ ...a, read: true }));
    setAlerts(updated);
    saveAlerts(updated);
  }, [alerts]);

  const markAsRead = useCallback((id: string) => {
    const updated = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    setAlerts(updated);
    saveAlerts(updated);
  }, [alerts]);

  const dismissAlert = useCallback((id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  }, [alerts]);

  return {
    alerts,
    unreadCount,
    markAllAsRead,
    markAsRead,
    dismissAlert,
    triggerAlert: triggerSystemAlert,
  };
}
