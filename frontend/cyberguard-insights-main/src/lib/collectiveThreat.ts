// ─── Victim-Centric & Collective Threat Prioritization Model ─────────────────
// Tagline: "A small loss should not mean a small signal."
// Detects when multiple individually small-value complaints occur in proximity
// and generate an additive "Potential Emerging Coordinated Pattern" signal.
//
// SYNTHETIC DATA — PROOF OF CONCEPT
// Disclaimer: This feature provides additional investigative intelligence.
// Final investigation and operational decisions remain with authorized investigators.

export type ThreatPriorityWeights = {
  individualLossWeight: number;
  complaintCountWeight: number;
  collectiveImpactWeight: number;
  temporalConcentrationWeight: number;
  geographicConcentrationWeight: number;
  behavioralSimilarityWeight: number;
  hotspotProximityWeight: number;
  predictionConfidenceWeight: number;
};

export const DEFAULT_PRIORITY_WEIGHTS: ThreatPriorityWeights = {
  individualLossWeight: 0.10,
  complaintCountWeight: 0.20,
  collectiveImpactWeight: 0.20,
  temporalConcentrationWeight: 0.15,
  geographicConcentrationWeight: 0.15,
  behavioralSimilarityWeight: 0.10,
  hotspotProximityWeight: 0.05,
  predictionConfidenceWeight: 0.05,
};

export type PatternTimelineEvent = {
  time: string;
  complaintId: string;
  amount: number;
  fraudType: string;
  location: string;
  isTriggerEvent?: boolean;
};

export type EmergingCoordinatedPattern = {
  patternId: string;
  title: string;
  complaintCount: number;
  individualLossAvg: number;
  individualLossMin: number;
  individualLossMax: number;
  collectiveLoss: number;
  activityTimeWindow: string;
  timeWindowHours: number;
  geographicArea: string;
  lat: number;
  lng: number;
  radiusKm: number;
  geographicSimilarityStrength: number; // 0 - 100%
  temporalConcentration: number;        // 0 - 100%
  behavioralSimilarity: string;
  behavioralSimilarityScore: number;    // 0 - 100%
  patternStrength: number;              // 0 - 100%
  predictedCashoutZone: string;
  predictedZoneConfidence: number;      // from existing XGBoost
  investigationPrioritySignal: number;  // 0 - 100
  status: "Potential emerging threat — investigator verification required";
  timeline: PatternTimelineEvent[];
  sampleComplaintIds: string[];
};

// ─── Synthetic Proof-of-Concept Patterns Dataset ─────────────────────────────

export const SYNTHETIC_EMERGING_PATTERNS: EmergingCoordinatedPattern[] = [
  {
    patternId: "PAT-2026-0814",
    title: "Micro-Phishing Electricity Disconnection Phish",
    complaintCount: 8,
    individualLossAvg: 2950,
    individualLossMin: 1500,
    individualLossMax: 4800,
    collectiveLoss: 23600,
    activityTimeWindow: "08:15 – 12:30 (Last 4h 15m)",
    timeWindowHours: 4.25,
    geographicArea: "Delhi NCR — Dwarka & Janakpuri Residential Belt",
    lat: 28.5921,
    lng: 77.0460,
    radiusKm: 4.8,
    geographicSimilarityStrength: 94.2,
    temporalConcentration: 91.5,
    behavioralSimilarity: "Identical fake BSES power bill warning SMS with rogue APK link",
    behavioralSimilarityScore: 96.0,
    patternStrength: 93.8,
    predictedCashoutZone: "Delhi NCR — Dwarka Sector 12 ATM Kiosks",
    predictedZoneConfidence: 89.7,
    investigationPrioritySignal: 88.4,
    status: "Potential emerging threat — investigator verification required",
    timeline: [
      { time: "08:15", complaintId: "CMP-9102", amount: 2200, fraudType: "Phishing", location: "Dwarka Sec 6" },
      { time: "09:04", complaintId: "CMP-9105", amount: 3500, fraudType: "Phishing", location: "Dwarka Sec 10" },
      { time: "09:48", complaintId: "CMP-9112", amount: 1800, fraudType: "Phishing", location: "Janakpuri West" },
      { time: "10:32", complaintId: "CMP-9118", amount: 4800, fraudType: "Phishing", location: "Dwarka Sec 14" },
      { time: "11:15", complaintId: "CMP-9124", amount: 2900, fraudType: "Phishing", location: "Uttam Nagar" },
      { time: "12:05", complaintId: "CMP-9131", amount: 3100, fraudType: "Phishing", location: "Dwarka Sec 12" },
      { time: "12:30", complaintId: "CMP-9139", amount: 2600, fraudType: "Phishing", location: "Janakpuri C-Block", isTriggerEvent: true },
    ],
    sampleComplaintIds: ["CMP-9102", "CMP-9105", "CMP-9112", "CMP-9118", "CMP-9124", "CMP-9131", "CMP-9139"],
  },
  {
    patternId: "PAT-2026-0811",
    title: "Small-Value Instant QR Merchant Cashback Scam",
    complaintCount: 6,
    individualLossAvg: 4200,
    individualLossMin: 2100,
    individualLossMax: 6500,
    collectiveLoss: 25200,
    activityTimeWindow: "14:10 – 17:40 (Last 3h 30m)",
    timeWindowHours: 3.5,
    geographicArea: "Mumbai Metro — Bandra Kurla & Santacruz Commercial Hub",
    lat: 19.0657,
    lng: 72.8682,
    radiusKm: 3.5,
    geographicSimilarityStrength: 91.0,
    temporalConcentration: 88.0,
    behavioralSimilarity: "Fake BharatPe Merchant Reverse-UPI payment scan prompt",
    behavioralSimilarityScore: 89.5,
    patternStrength: 87.2,
    predictedCashoutZone: "Mumbai Metro — Bandra Kurla Complex ATM Belt",
    predictedZoneConfidence: 93.4,
    investigationPrioritySignal: 85.0,
    status: "Potential emerging threat — investigator verification required",
    timeline: [
      { time: "14:10", complaintId: "CMP-8812", amount: 3200, fraudType: "UPI Fraud", location: "BKC G-Block" },
      { time: "15:05", complaintId: "CMP-8819", amount: 5100, fraudType: "UPI Fraud", location: "Santacruz East" },
      { time: "15:52", complaintId: "CMP-8827", amount: 2100, fraudType: "UPI Fraud", location: "Bandra East" },
      { time: "16:40", complaintId: "CMP-8835", amount: 6500, fraudType: "UPI Fraud", location: "Kalanagar" },
      { time: "17:40", complaintId: "CMP-8842", amount: 4300, fraudType: "UPI Fraud", location: "BKC North Gate", isTriggerEvent: true },
    ],
    sampleComplaintIds: ["CMP-8812", "CMP-8819", "CMP-8827", "CMP-8835", "CMP-8842"],
  },
  {
    patternId: "PAT-2026-0807",
    title: "Micro-Loan Processing Fee Extortion Cluster",
    complaintCount: 5,
    individualLossAvg: 3800,
    individualLossMin: 2000,
    individualLossMax: 5500,
    collectiveLoss: 19000,
    activityTimeWindow: "10:00 – 15:15 (Last 5h 15m)",
    timeWindowHours: 5.25,
    geographicArea: "Bengaluru South — Koramangala & HSR Layout Sector",
    lat: 12.9352,
    lng: 77.6245,
    radiusKm: 4.2,
    geographicSimilarityStrength: 86.5,
    temporalConcentration: 84.0,
    behavioralSimilarity: "Instant ₹10,000 pre-approved loan disbursement verification fee",
    behavioralSimilarityScore: 92.0,
    patternStrength: 83.4,
    predictedCashoutZone: "Bengaluru South — Koramangala Hub ATM Cluster",
    predictedZoneConfidence: 86.2,
    investigationPrioritySignal: 81.6,
    status: "Potential emerging threat — investigator verification required",
    timeline: [
      { time: "10:00", complaintId: "CMP-7711", amount: 2000, fraudType: "Loan App Scam", location: "Koramangala 4th Block" },
      { time: "11:30", complaintId: "CMP-7718", amount: 4500, fraudType: "Loan App Scam", location: "HSR Sector 1" },
      { time: "13:20", complaintId: "CMP-7729", amount: 3200, fraudType: "Loan App Scam", location: "Koramangala 6th Block" },
      { time: "15:15", complaintId: "CMP-7741", amount: 5500, fraudType: "Loan App Scam", location: "BTM Layout 2nd Stage", isTriggerEvent: true },
    ],
    sampleComplaintIds: ["CMP-7711", "CMP-7718", "CMP-7729", "CMP-7741"],
  },
];

// ─── Mathematical Priority Signal Calculator ──────────────────────────────────

/**
 * Calculates the Investigation Priority Signal based on configurable multi-factor weights
 */
export function calculateInvestigationPrioritySignal(
  pattern: {
    individualLossAvg: number;
    complaintCount: number;
    collectiveLoss: number;
    temporalConcentration: number;
    geographicSimilarityStrength: number;
    behavioralSimilarityScore: number;
    predictedZoneConfidence: number;
  },
  weights: ThreatPriorityWeights = DEFAULT_PRIORITY_WEIGHTS
): number {
  // Normalize factors to 0 - 100
  const normIndividualLoss = Math.min(100, (pattern.individualLossAvg / 50000) * 100);
  const normCount = Math.min(100, (pattern.complaintCount / 10) * 100);
  const normCollective = Math.min(100, (pattern.collectiveLoss / 100000) * 100);
  const normTemporal = pattern.temporalConcentration;
  const normGeo = pattern.geographicSimilarityStrength;
  const normBehavioral = pattern.behavioralSimilarityScore;
  const normHotspot = 85.0; // High proximity to known cluster
  const normConfidence = pattern.predictedZoneConfidence;

  const rawScore =
    normIndividualLoss * weights.individualLossWeight +
    normCount * weights.complaintCountWeight +
    normCollective * weights.collectiveImpactWeight +
    normTemporal * weights.temporalConcentrationWeight +
    normGeo * weights.geographicConcentrationWeight +
    normBehavioral * weights.behavioralSimilarityWeight +
    normHotspot * weights.hotspotProximityWeight +
    normConfidence * weights.predictionConfidenceWeight;

  return Math.round(Math.min(99.4, Math.max(15.0, rawScore)) * 10) / 10;
}

// ─── Real-Time Additive Signal Merger ─────────────────────────────────────────

export type CollectiveSignalContext = {
  isMatchedToEmergingPattern: boolean;
  patternId?: string | undefined;
  patternTitle?: string | undefined;
  relatedComplaintsCount?: number | undefined;
  collectiveLossTotal?: number | undefined;
  investigationPrioritySignal?: number | undefined;
  patternStrength?: number | undefined;
  message: string;
};

/**
 * Evaluates a single complaint to see if it contributes to an emerging small-loss pattern
 */
export function evaluateCollectiveThreatSignal(complaint: {
  amount: number;
  fraudType: string;
  lat: number;
  lon: number;
}): CollectiveSignalContext {
  // Check if this is a low-to-medium value loss (< ₹25,000)
  const isSmallLoss = complaint.amount <= 25000;

  if (!isSmallLoss) {
    return {
      isMatchedToEmergingPattern: false,
      message: "Individual loss exceeds small-loss threshold; evaluated via standard high-value XGBoost pipeline.",
    };
  }

  // Match against synthetic emerging patterns by geographic distance (< 15km) and fraud type
  for (const pattern of SYNTHETIC_EMERGING_PATTERNS) {
    const latDiff = Math.abs(complaint.lat - pattern.lat);
    const lonDiff = Math.abs(complaint.lon - pattern.lng);
    const approxDistKm = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111;

    if (approxDistKm <= pattern.radiusKm * 2.5) {
      return {
        isMatchedToEmergingPattern: true,
        patternId: pattern.patternId,
        patternTitle: pattern.title,
        relatedComplaintsCount: pattern.complaintCount + 1,
        collectiveLossTotal: pattern.collectiveLoss + complaint.amount,
        investigationPrioritySignal: calculateInvestigationPrioritySignal(pattern),
        patternStrength: pattern.patternStrength,
        message: "Feeds additional pattern intelligence into the existing prediction workflow.",
      };
    }
  }

  return {
    isMatchedToEmergingPattern: false,
    message: "Isolated low-value entry; no coordinated micro-pattern detected at this time.",
  };
}

// ─── Standard Disclaimers and Guidance Text ───────────────────────────────────

export const VICTIM_CENTRIC_TEXT = {
  tagline: "A small loss should not mean a small signal.",
  subTagline: "Every victim matters. Every complaint can be a signal.",
  tooltip:
    "Financial loss is one signal, but not the only signal. Multiple individually low-value complaints can collectively provide an early indication of an emerging fraud pattern. This additional intelligence can strengthen the existing cash-withdrawal prediction workflow.",
  humanInTheLoop:
    "This feature provides additional investigative intelligence. Final investigation and operational decisions remain with authorized investigators.",
  syntheticBadge: "",
  additiveLayerNotice: "Feeds additional pattern intelligence into the existing prediction workflow.",
};
