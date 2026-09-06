// ─── Shared Activity & Audit Log Manager (Government Transparency Ledger) ───
// Chronological system event tracking across complaints, predictions, alerts, and investigations.

export type ActivityActionType =
  | "Complaint Submitted"
  | "Prediction Generated"
  | "Alert Dispatched"
  | "Status Changed to Under Investigation"
  | "Status Changed to Resolved"
  | "Status Changed to New"
  | "Evidence Dossier Inspected"
  | "Emergency 1930 Notice Triggered";

export type ActivityActorType =
  | "Citizen"
  | "System (ML Engine)"
  | "System (I4C Gateway)"
  | "Investigator (Delhi Cyber Special Cell)"
  | "Investigator (Mumbai Cyber Police)"
  | "Investigator (Karnataka CID Cyber)"
  | string;

export type SystemActivityLog = {
  id: string;
  timestamp: string;
  rawTime: number;
  action: ActivityActionType;
  actor: ActivityActorType;
  details: string;
  complaintId?: string | undefined;
  severity?: "info" | "warning" | "critical" | "success" | undefined;
};

const STORAGE_KEY_ACTIVITY = "ciphertrace_activity_logs_v1";

const INITIAL_ACTIVITY_LOGS: SystemActivityLog[] = [
  {
    id: "LOG-1094",
    timestamp: "2026-08-28 04:15:22",
    rawTime: Date.now() - 15 * 60 * 1000,
    action: "Alert Dispatched",
    actor: "System (I4C Gateway)",
    details: "High-risk dispatch routed to Delhi Cyber Special Cell + SBI Fraud Desk (₹1,45,000)",
    complaintId: "LEA-2024-8901",
    severity: "critical",
  },
  {
    id: "LOG-1093",
    timestamp: "2026-08-28 04:14:50",
    rawTime: Date.now() - 16 * 60 * 1000,
    action: "Prediction Generated",
    actor: "System (ML Engine)",
    details: "Predicted primary cash withdrawal hotspot: Delhi NCR (Dwarka Sector 12, 89.7% confidence)",
    complaintId: "LEA-2024-8901",
    severity: "info",
  },
  {
    id: "LOG-1092",
    timestamp: "2026-08-28 04:14:10",
    rawTime: Date.now() - 17 * 60 * 1000,
    action: "Complaint Submitted",
    actor: "Citizen",
    details: "Victim reported unauthorized UPI debit of ₹1,45,000 from SBI Account",
    complaintId: "LEA-2024-8901",
    severity: "warning",
  },
  {
    id: "LOG-1091",
    timestamp: "2026-08-28 03:42:15",
    rawTime: Date.now() - 50 * 60 * 1000,
    action: "Status Changed to Under Investigation",
    actor: "Investigator (Mumbai Cyber Police)",
    details: "Docket LEA-2024-8899 assigned to BKC Quick Response Team for CCTV retrieval",
    complaintId: "LEA-2024-8899",
    severity: "info",
  },
  {
    id: "LOG-1090",
    timestamp: "2026-08-28 03:30:04",
    rawTime: Date.now() - 62 * 60 * 1000,
    action: "Emergency 1930 Notice Triggered",
    actor: "System (I4C Gateway)",
    details: "Emergency freeze request sent to HDFC Bank Fraud Desk for suspect account (Age: 12 days)",
    complaintId: "LEA-2024-8899",
    severity: "critical",
  },
  {
    id: "LOG-1089",
    timestamp: "2026-08-28 02:20:18",
    rawTime: Date.now() - 130 * 60 * 1000,
    action: "Status Changed to Resolved",
    actor: "Investigator (Chennai Cyber Crime Wing)",
    details: "Suspect ATM card cloning operative apprehended at Anna Salai kiosk; ₹94,000 recovered",
    complaintId: "LEA-2024-8882",
    severity: "success",
  },
  {
    id: "LOG-1088",
    timestamp: "2026-08-28 01:10:45",
    rawTime: Date.now() - 200 * 60 * 1000,
    action: "Evidence Dossier Inspected",
    actor: "Investigator (Karnataka CID Cyber)",
    details: "Officer inspected SHA-256 tamper-evident evidence chain for case LEA-2024-8895",
    complaintId: "LEA-2024-8895",
    severity: "info",
  },
];

export function getActivityLogs(): SystemActivityLog[] {
  if (typeof localStorage === "undefined") return INITIAL_ACTIVITY_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
      return INITIAL_ACTIVITY_LOGS;
    }
    return JSON.parse(raw) as SystemActivityLog[];
  } catch (e) {
    return INITIAL_ACTIVITY_LOGS;
  }
}

export function logActivity(entry: {
  action: ActivityActionType;
  actor: ActivityActorType;
  details: string;
  complaintId?: string | undefined;
  severity?: "info" | "warning" | "critical" | "success" | undefined;
}): void {
  if (typeof localStorage === "undefined") return;
  try {
    const existing = getActivityLogs();
    const now = new Date();
    const newLog: SystemActivityLog = {
      id: `LOG-${Math.floor(1100 + Math.random() * 8900)}`,
      timestamp: now.toISOString().replace("T", " ").slice(0, 19),
      rawTime: now.getTime(),
      action: entry.action,
      actor: entry.actor,
      details: entry.details,
      complaintId: entry.complaintId,
      severity: entry.severity || "info",
    };

    const updated = [newLog, ...existing.slice(0, 99)];
    localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(updated));

    // Dispatch a custom event so open views update in real time
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ciphertrace:activity_logged", { detail: newLog }));
    }
  } catch (e) {
    console.warn("Failed to persist activity log:", e);
  }
}
