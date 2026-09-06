/**
 * Mock I4C Suspect Registry Client
 *
 * DEMO MODE — No calls to i4c.gov.in or any government host.
 * Data served from local synthetic fixtures.
 * Real I4C Suspect Registry access requires MHA / I4C official partnership.
 */

import accountFlagsFixture from "./fixtures/account-flags.json";
import type { AccountFlag, AccountNetwork, AccountNetworkNode, AccountNetworkEdge } from "./types";

const FLAGS = accountFlagsFixture as AccountFlag[];

const delay = (ms = 40) => new Promise((r) => setTimeout(r, ms));

export async function getAccountFlags(account: string): Promise<AccountFlag | null> {
  await delay(35);
  return FLAGS.find((f) => f.account === account) ?? null;
}

export async function getMultipleAccountFlags(accounts: string[]): Promise<AccountFlag[]> {
  await delay(50);
  return FLAGS.filter((f) => accounts.includes(f.account));
}

export async function getAllFlags(): Promise<AccountFlag[]> {
  await delay(40);
  return [...FLAGS];
}

/**
 * Build an account network graph from flags.
 * Connects accounts via TRANSACTION (from fixtures), SHARED_PHONE, and SHARED_KYC relationships.
 */
export async function getAccountNetwork(seedAccount: string): Promise<AccountNetwork> {
  await delay(70);

  const visited = new Set<string>();
  const queue = [seedAccount];
  const nodes: AccountNetworkNode[] = [];
  const edges: AccountNetworkEdge[] = [];

  // BFS over the flag graph (max depth 2 to keep it manageable)
  let depth = 0;
  while (queue.length > 0 && depth < 3) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const flag = FLAGS.find((f) => f.account === current);
    const connections = flag
      ? flag.shared_phone_accounts.length + flag.shared_kyc_accounts.length
      : 0;

    nodes.push({
      account: current,
      bank: flag?.bank ?? "Unknown",
      is_master: false, // set below
      connection_count: connections,
      prior_fraud_count: flag?.prior_fraud_count ?? 0,
    });

    if (flag) {
      // SHARED_PHONE edges
      for (const related of flag.shared_phone_accounts) {
        if (!visited.has(related)) queue.push(related);
        if (!edges.some((e) => (e.from === current && e.to === related) || (e.from === related && e.to === current))) {
          edges.push({ from: current, to: related, relationship: "SHARED_PHONE", weight: 3 });
        }
      }
      // SHARED_KYC edges
      for (const related of flag.shared_kyc_accounts) {
        if (!visited.has(related)) queue.push(related);
        if (!edges.some((e) => (e.from === current && e.to === related) || (e.from === related && e.to === current))) {
          edges.push({ from: current, to: related, relationship: "SHARED_KYC", weight: 2 });
        }
      }
    }
    depth++;
  }

  // Find master account (highest connection count)
  const firstNode = nodes[0];
  const master = firstNode
    ? nodes.reduce((a, b) => (a.connection_count >= b.connection_count ? a : b), firstNode)
    : undefined;
  if (master) master.is_master = true;

  return {
    nodes,
    edges,
    master_account: master?.account ?? seedAccount,
  };
}
