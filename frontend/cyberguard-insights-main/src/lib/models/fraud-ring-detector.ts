/**
 * SIMULATED MODEL — Fraud Ring Detector
 *
 * Clusters complaints into fraud rings using Union-Find (Disjoint Set Union) over
 * shared mule account and shared mule phone number relationships.
 * NOT a real graph ML model — deterministic union-find algorithm only.
 *
 * See docs/ML_NOTES.md for the design rationale.
 */

import type { Complaint, FraudRing } from "../mock-api/types";

// ─── Union-Find ───────────────────────────────────────────────────────────────
class UnionFind {
  private parent: Map<string, string> = new Map();

  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    const p = this.parent.get(x)!;
    if (p !== x) this.parent.set(x, this.find(p)); // path compression
    return this.parent.get(x)!;
  }

  union(x: string, y: string) {
    const px = this.find(x);
    const py = this.find(y);
    if (px !== py) this.parent.set(px, py);
  }
}

/**
 * Detect fraud rings from a list of complaints.
 * Rings with ≥ minSize linked complaints are returned.
 *
 * // SIMULATED MODEL — see docs/ML_NOTES.md
 */
export function detectRings(complaints: Complaint[], minSize = 2): FraudRing[] {
  const uf = new UnionFind();

  // ─── Union complaints that share mule_account or mule_ifsc ───────────────
  for (let i = 0; i < complaints.length; i++) {
    for (let j = i + 1; j < complaints.length; j++) {
      const a = complaints[i];
      const b = complaints[j];
      if (!a || !b) continue;
      if (
        a.mule_account === b.mule_account ||
        a.mule_ifsc === b.mule_ifsc ||
        // Also group by cluster_id if pre-assigned
        (a.cluster_id && a.cluster_id === b.cluster_id)
      ) {
        uf.union(a.complaint_id, b.complaint_id);
      }
    }
  }

  // ─── Group by root ────────────────────────────────────────────────────────
  const groups = new Map<string, Complaint[]>();
  for (const c of complaints) {
    const root = uf.find(c.complaint_id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(c);
  }

  // ─── Build FraudRing for each group meeting minSize ───────────────────────
  const rings: FraudRing[] = [];
  let ringIdx = 1;

  for (const [, members] of groups) {
    if (members.length < minSize) continue;

    const mule_accounts = [...new Set(members.map((m) => m.mule_account))];
    const total_amount = members.reduce((s, m) => s + m.fraud_amount, 0);

    // Master account = account belonging to the complaint with most connections
    const master = mule_accounts[0] ?? "UNKNOWN_MASTER";

    // Use existing cluster_id if available, else generate
    const firstMember = members[0];
    const cluster_id = firstMember?.cluster_id ?? `CLU-AUTO-${String(ringIdx).padStart(3, "0")}`;

    // Ring label derived from cluster_id
    let ring_label = cluster_id;
    if (cluster_id.includes("JAMTARA")) ring_label = "Jamtara UPI Syndicate";
    else if (cluster_id.includes("MEWAT")) ring_label = "Mewat Investment Ring";
    else ring_label = `Detected Ring ${ringIdx}`;

    rings.push({
      cluster_id,
      complaint_ids: members.map((m) => m.complaint_id),
      mule_accounts,
      total_amount,
      linked_complaint_count: members.length,
      master_account: master,
      ring_label,
      detected_at: new Date().toISOString(),
      consolidated: false,
    });

    ringIdx++;
  }

  return rings.sort((a, b) => b.linked_complaint_count - a.linked_complaint_count);
}

/** Mark a ring as consolidated (mock FIR merge) */
export function consolidateRing(ring: FraudRing): FraudRing {
  return { ...ring, consolidated: true };
}
