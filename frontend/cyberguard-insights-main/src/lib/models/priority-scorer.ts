/**
 * SIMULATED MODEL — Priority Scorer
 *
 * Emulates an XGBoost-style complaint priority scorer.
 * This is a deterministic, rule/heuristic-based function — NOT a real trained ML model.
 * Output matches the documented model API shape (priority_score, priority_tier, shap_factors).
 *
 * See docs/ML_NOTES.md for the design rationale.
 */

import type { Complaint, MlPrediction, PriorityTier, ShapFactor } from "../mock-api/types";

// ─── Feature weights (mirrors documented XGBoost feature importances) ─────────
const WEIGHTS = {
  mule_prior_fraud_count: 0.25,    // strongest signal
  ip_incident_velocity_24h: 0.20,
  fraud_amount_normalized: 0.18,
  mule_account_age_days_inv: 0.15, // younger account = higher risk
  withdrawal_not_yet: 0.12,        // funds still moveable
  freeze_not_requested: 0.10,
};

const MAX_AMOUNT = 500_000; // INR normalisation ceiling

/** Compute a 0–100 priority score from complaint features */
export function scorePriority(complaint: Complaint): MlPrediction {
  // ─── Raw feature values ───────────────────────────────────────────────────
  const fraudCountScore = Math.min(complaint.mule_prior_fraud_count / 12, 1);
  const velocityScore = Math.min(complaint.ip_incident_velocity_24h / 25, 1);
  const amountScore = Math.min(complaint.fraud_amount / MAX_AMOUNT, 1);
  const ageScore = complaint.mule_account_age_days <= 30
    ? 1 - complaint.mule_account_age_days / 30
    : 0;
  const withdrawalScore = complaint.withdrawal_status === "NOT_WITHDRAWN" ? 1 : 0;
  const freezeScore = complaint.freeze_status === "NOT_REQUESTED" ? 1 : 0;

  // ─── Weighted sum → 0–1 ───────────────────────────────────────────────────
  const raw =
    fraudCountScore * WEIGHTS.mule_prior_fraud_count +
    velocityScore * WEIGHTS.ip_incident_velocity_24h +
    amountScore * WEIGHTS.fraud_amount_normalized +
    ageScore * WEIGHTS.mule_account_age_days_inv +
    withdrawalScore * WEIGHTS.withdrawal_not_yet +
    freezeScore * WEIGHTS.freeze_not_requested;

  // ─── Scale to 0–100, add small deterministic jitter ──────────────────────
  const jitter = (parseInt(complaint.complaint_id.slice(-3), 16) % 7) - 3; // -3..+3
  const priority_score = Math.max(0, Math.min(100, Math.round(raw * 100 + jitter)));

  // ─── Tier assignment ──────────────────────────────────────────────────────
  const priority_tier: PriorityTier =
    priority_score >= 80 ? "HIGH" : priority_score >= 50 ? "MEDIUM" : "LOW";

  // ─── SIMULATED SHAP-style factors (deterministic) ─────────────────────────
  const shap_factors: ShapFactor[] = [
    {
      feature: "mule_prior_fraud_count",
      label: "Mule flagged in prior frauds",
      value: complaint.mule_prior_fraud_count,
      impact_pct: +(fraudCountScore * WEIGHTS.mule_prior_fraud_count * 100).toFixed(1),
      direction: "increase" as const,
    },
    {
      feature: "ip_incident_velocity_24h",
      label: "IP incident velocity (24h)",
      value: complaint.ip_incident_velocity_24h,
      impact_pct: +(velocityScore * WEIGHTS.ip_incident_velocity_24h * 100).toFixed(1),
      direction: "increase" as const,
    },
    {
      feature: "fraud_amount",
      label: "Fraud amount (INR)",
      value: complaint.fraud_amount,
      impact_pct: +(amountScore * WEIGHTS.fraud_amount_normalized * 100).toFixed(1),
      direction: "increase" as const,
    },
    {
      feature: "mule_account_age_days",
      label: "Mule account age (days)",
      value: complaint.mule_account_age_days,
      impact_pct: +(ageScore * WEIGHTS.mule_account_age_days_inv * 100).toFixed(1),
      direction: (ageScore > 0 ? "increase" : "decrease") as "increase" | "decrease",
    },
    {
      feature: "withdrawal_status",
      label: "Funds not yet withdrawn",
      value: complaint.withdrawal_status,
      impact_pct: +(withdrawalScore * WEIGHTS.withdrawal_not_yet * 100).toFixed(1),
      direction: (withdrawalScore ? "increase" : "decrease") as "increase" | "decrease",
    },
    {
      feature: "freeze_status",
      label: "No freeze order in place",
      value: complaint.freeze_status,
      impact_pct: +(freezeScore * WEIGHTS.freeze_not_requested * 100).toFixed(1),
      direction: (freezeScore ? "increase" : "decrease") as "increase" | "decrease",
    },
  ].sort((a, b) => b.impact_pct - a.impact_pct);

  // ─── Recovery probability estimate ────────────────────────────────────────
  const recovery_probability = parseFloat(
    (withdrawalScore * 0.5 + (1 - amountScore) * 0.3 + (1 - fraudCountScore) * 0.2).toFixed(2)
  );

  // ─── Recommended action ───────────────────────────────────────────────────
  const recommended_action =
    priority_tier === "HIGH"
      ? "Immediate freeze request + ATM alert dispatch within 30 minutes"
      : priority_tier === "MEDIUM"
      ? "File freeze request and monitor ATM cluster in next 2 hours"
      : "Standard triage — schedule investigation within 24 hours";

  return {
    complaint_id: complaint.complaint_id,
    priority_score,
    priority_tier,
    recovery_probability,
    recommended_action,
    shap_factors,
    predicted_atm_ids: [],  // populated by atm-predictor separately
    model_version: "priority-scorer-v1.0-simulated",
    computed_at: new Date().toISOString(),
  };
}

/** Batch-score a list of complaints, returns sorted highest-first */
export function batchScorePriority(complaints: Complaint[]): MlPrediction[] {
  return complaints
    .map(scorePriority)
    .sort((a, b) => b.priority_score - a.priority_score);
}
