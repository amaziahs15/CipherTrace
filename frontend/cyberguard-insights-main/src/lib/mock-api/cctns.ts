/**
 * Mock CCTNS (Crime and Criminal Tracking Network & Systems) Client
 *
 * DEMO MODE — No calls to cctns.gov.in or any government host.
 * Data served from local synthetic fixtures and in-memory session store.
 * Real CCTNS integration requires MHA / NCRB official partnership and credentials.
 */

import type { CctnsCase, AuditLogEntry } from "./types";

const delay = (ms = 40) => new Promise((r) => setTimeout(r, ms));

/** In-memory case store for the current session */
const cases: CctnsCase[] = [
  {
    fir_number: "FIR/2024/CYBER/DL/001234",
    complaint_ids: ["NCRP-2024-001234", "NCRP-2024-001236"],
    filing_officer: "IO Sharma",
    station: "Cyber Crime PS, Delhi",
    filed_at: "2026-09-06T10:30:00+05:30",
    sections: ["66C IT Act 2000", "66D IT Act 2000", "420 IPC"],
    status: "FILED",
  },
  {
    fir_number: "FIR/2024/CYBER/MH/005678",
    complaint_ids: ["NCRP-2024-001235"],
    filing_officer: "IO Patil",
    station: "Cyber Crime PS, Mumbai",
    filed_at: "2026-09-06T11:00:00+05:30",
    sections: ["66C IT Act 2000", "420 IPC", "34 IPC"],
    status: "CHARGE_SHEET_PENDING",
  },
];

/** In-memory audit log for the current session */
const auditLog: AuditLogEntry[] = [
  {
    id: "AUDIT-0001",
    timestamp: "2026-09-06T08:16:00+05:30",
    actor: "SYSTEM",
    action: "COMPLAINT_RECEIVED",
    complaint_id: "NCRP-2024-001234",
    detail: "Complaint ingested from NCRP feed.",
    hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  },
  {
    id: "AUDIT-0002",
    timestamp: "2026-09-06T08:17:00+05:30",
    actor: "SYSTEM",
    action: "ML_PRIORITY_SCORED",
    complaint_id: "NCRP-2024-001234",
    detail: "Priority score 92 computed. Tier: HIGH.",
    hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
  },
];

export async function getCases(): Promise<CctnsCase[]> {
  await delay(50);
  return [...cases];
}

export async function getCaseByFirNumber(firNumber: string): Promise<CctnsCase | null> {
  await delay(30);
  return cases.find((c) => c.fir_number === firNumber) ?? null;
}

export async function fileFir(firData: Omit<CctnsCase, "status">): Promise<CctnsCase> {
  await delay(100);
  const newCase: CctnsCase = { ...firData, status: "FILED" };
  cases.push(newCase);
  return newCase;
}

export async function appendAuditEntry(entry: Omit<AuditLogEntry, "id">): Promise<AuditLogEntry> {
  await delay(20);
  const full: AuditLogEntry = {
    ...entry,
    id: `AUDIT-${String(auditLog.length + 1).padStart(4, "0")}`,
  };
  auditLog.push(full);
  return full;
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  await delay(30);
  return [...auditLog].reverse(); // newest first
}
