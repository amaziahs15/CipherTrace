/**
 * CyberShield AI — Session Audit Store
 * Append-only, localStorage-backed audit log for all actions taken in the session.
 * Mirrors the schema of the CCTNS audit_logs table.
 */

import type { AuditLogEntry } from "./mock-api/types";

const STORAGE_KEY = "cybershield_audit_log";

// ─── Pseudo-hash generator (deterministic stub, not real SHA-256) ─────────────
function pseudoHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Expand to 64-char hex-like string
  const base = Math.abs(hash).toString(16).padStart(8, "0");
  return (base.repeat(8)).slice(0, 64);
}

function loadLog(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLog(entries: AuditLogEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* storage full — silently ignore */
  }
}

export function appendAudit(
  entry: Omit<AuditLogEntry, "id" | "hash">
): AuditLogEntry {
  const log = loadLog();
  const lastEntry = log.length > 0 ? log[log.length - 1] : undefined;
  const prevHash = lastEntry?.hash ?? "GENESIS";
  const id = `SES-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const hash = pseudoHash(`${prevHash}:${id}:${entry.timestamp}:${entry.action}:${entry.detail}`);
  const full: AuditLogEntry = { ...entry, id, hash };
  log.push(full);
  saveLog(log);
  return full;
}

export function getAuditLog(): AuditLogEntry[] {
  return [...loadLog()].reverse(); // newest first
}

export function clearAuditLog(): void {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
