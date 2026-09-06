/**
 * SIMULATED MODEL — ATM Withdrawal Location Predictor
 *
 * Ranks candidate ATMs by heuristic scoring: distance from mule KYC location,
 * historical fraud count at the ATM, and peak-hour match.
 * NOT a real geospatial ML model — deterministic heuristic only.
 *
 * See docs/ML_NOTES.md for the design rationale.
 */

import atmsFixture from "../mock-api/fixtures/atms.json";
import type { AtmFixture, AtmPrediction } from "../mock-api/types";

const ATMS = atmsFixture as AtmFixture[];

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Peak hour heuristic ──────────────────────────────────────────────────────
function isPeakHour(fraudTimestamp: string): boolean {
  const hour = new Date(fraudTimestamp).getHours();
  // Fraudsters typically withdraw between 8:00–13:00 to avoid detection
  return hour >= 8 && hour <= 13;
}

/** Estimate the withdrawal window based on fraud timestamp + heuristics */
function estimateWithdrawalWindow(
  fraudTimestamp: string,
  peakHour: boolean
): { start: string; end: string } {
  const t = new Date(fraudTimestamp).getTime();
  const windowHours = peakHour ? 2 : 4; // faster turnaround during peak hours
  return {
    start: new Date(t + 30 * 60_000).toISOString(),          // +30 min (min laundering delay)
    end: new Date(t + windowHours * 3_600_000).toISOString(), // +2–4h
  };
}

/**
 * Rank ATMs for a given mule KYC location and fraud timestamp.
 * Returns top 3 ranked predictions.
 *
 * // SIMULATED MODEL — see docs/ML_NOTES.md
 */
export function rankAtms(
  muleKycLat: number,
  muleKycLon: number,
  fraudTimestamp: string,
  topN = 3
): AtmPrediction[] {
  const peak = isPeakHour(fraudTimestamp);
  const window = estimateWithdrawalWindow(fraudTimestamp, peak);

  const MAX_FRAUD_COUNT = Math.max(...ATMS.map((a) => a.historical_fraud_count));
  const MAX_DIST_KM = 80; // ignore ATMs beyond 80 km

  const scored = ATMS.map((atm) => {
    const dist = haversine(muleKycLat, muleKycLon, atm.lat, atm.lon);
    if (dist > MAX_DIST_KM) return null;

    // Distance score: inverse, capped
    const distScore = Math.max(0, 1 - dist / MAX_DIST_KM);
    // Fraud history score
    const historyScore = atm.historical_fraud_count / MAX_FRAUD_COUNT;
    // Peak hour bonus
    const peakBonus = peak ? 0.15 : 0;

    const rawScore = distScore * 0.45 + historyScore * 0.40 + peakBonus;
    const confidence_pct = Math.min(98, Math.round(rawScore * 100));

    const factors: string[] = [];
    if (distScore > 0.7) factors.push(`Only ${dist.toFixed(1)} km from mule KYC`);
    if (historyScore > 0.5) factors.push(`${atm.historical_fraud_count} prior fraud incidents`);
    if (peak) factors.push("Matches peak withdrawal hour (08:00–13:00)");
    if (atm.cctv_available) factors.push("CCTV available — high evidentiary value");

    return {
      ...atm,
      confidence_pct,
      distance_km: parseFloat(dist.toFixed(2)),
      estimated_window_start: window.start,
      estimated_window_end: window.end,
      rank: 0, // assigned below
      scoring_factors: factors,
    } as AtmPrediction;
  })
    .filter((x): x is AtmPrediction => x !== null)
    .sort((a, b) => b.confidence_pct - a.confidence_pct)
    .slice(0, topN);

  // Assign ranks
  scored.forEach((atm, idx) => {
    atm.rank = idx + 1;
  });

  return scored;
}
