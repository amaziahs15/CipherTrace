/**
 * Mock CFCFRMS (Citizen Financial Cyber Frauds Reporting & Management System) Client
 *
 * DEMO MODE — No real bank or government API calls are made.
 * All data served from local synthetic fixtures.
 * Real CFCFRMS integration requires RBI/I4C coordination and banking partner agreements.
 */

import transactionsFixture from "./fixtures/transactions.json";
import type { Transaction, FreezeRequest, FreezeStatus } from "./types";

const TRANSACTIONS = transactionsFixture as Record<string, Transaction[]>;

const delay = (ms = 40) => new Promise((r) => setTimeout(r, ms));

/** In-memory freeze request store for the current session */
const freezeRequests: FreezeRequest[] = [];

export async function getTransactionTrail(utr: string): Promise<Transaction[]> {
  await delay(60);
  return TRANSACTIONS[utr] ?? [];
}

export async function getAllTrails(): Promise<Record<string, Transaction[]>> {
  await delay(50);
  return TRANSACTIONS;
}

export async function submitFreezeRequest(
  req: Omit<FreezeRequest, "freeze_request_id" | "submitted_at" | "status">
): Promise<FreezeRequest> {
  await delay(80);
  const freezeReq: FreezeRequest = {
    ...req,
    freeze_request_id: `FRZ-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    submitted_at: new Date().toISOString(),
    status: "REQUESTED",
  };
  freezeRequests.push(freezeReq);
  return freezeReq;
}

export async function getFreezeStatus(freeze_request_id: string): Promise<FreezeStatus> {
  await delay(30);
  const req = freezeRequests.find((r) => r.freeze_request_id === freeze_request_id);
  return req?.status ?? "NOT_REQUESTED";
}

export function getSessionFreezeRequests(): FreezeRequest[] {
  return [...freezeRequests];
}
