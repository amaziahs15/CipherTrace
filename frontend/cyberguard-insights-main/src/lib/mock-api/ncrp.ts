/**
 * Mock NCRP (National Cybercrime Reporting Portal) Client
 *
 * DEMO MODE — No real government API calls are made.
 * All data is served from local synthetic fixtures.
 * Real NCRP integration requires MHA/I4C official partnership and credentials.
 */

import complaintsFixture from "./fixtures/complaints.json";
import type { Complaint } from "./types";

const COMPLAINTS = complaintsFixture as Complaint[];

/** Simulate a small network delay for realism */
const delay = (ms = 40) => new Promise((r) => setTimeout(r, ms));

export async function getComplaints(): Promise<Complaint[]> {
  await delay(50);
  return [...COMPLAINTS].sort((a, b) => b.priority_score - a.priority_score);
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  await delay(30);
  return COMPLAINTS.find((c) => c.complaint_id === id) ?? null;
}

export async function searchComplaints(query: string): Promise<Complaint[]> {
  await delay(40);
  const q = query.toLowerCase();
  return COMPLAINTS.filter(
    (c) =>
      c.complaint_id.toLowerCase().includes(q) ||
      c.mule_account.toLowerCase().includes(q) ||
      c.fraud_type.toLowerCase().includes(q) ||
      c.victim_name.toLowerCase().includes(q)
  );
}
