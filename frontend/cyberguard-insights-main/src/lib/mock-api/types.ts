/**
 * CyberShield AI — Shared Type Definitions
 * Mirrors the database schema and API response shapes described in the design doc.
 * These are used by mock API clients, simulated ML models, and UI components.
 */

// ─── Core DB-Mirroring Types ──────────────────────────────────────────────────

export type PriorityTier = "HIGH" | "MEDIUM" | "LOW";
export type WithdrawalStatus = "NOT_WITHDRAWN" | "WITHDRAWN_ATM" | "WITHDRAWN_POS";
export type FreezeStatus = "NOT_REQUESTED" | "REQUESTED" | "FROZEN" | "REJECTED";
export type ComplaintStatus = "NEW" | "TRIAGED" | "UNDER_INVESTIGATION" | "FIR_FILED" | "CLOSED";

export interface Complaint {
  complaint_id: string;
  utr: string;
  fraud_timestamp: string;
  victim_name: string;
  victim_phone: string;
  victim_lat: number;
  victim_lon: number;
  fraud_amount: number;
  fraud_type: "UPI Fraud" | "Phishing" | "Fake Investment" | "OTP Fraud" | "Loan App Scam";
  mule_account: string;
  mule_ifsc: string;
  mule_bank: string;
  mule_kyc_lat: number;
  mule_kyc_lon: number;
  mule_account_age_days: number;
  mule_prior_fraud_count: number;
  ip_incident_velocity_24h: number;
  withdrawal_status: WithdrawalStatus;
  freeze_status: FreezeStatus;
  priority_score: number;
  priority_tier: PriorityTier;
  recovery_probability: number;
  cluster_id: string | null;
  status: ComplaintStatus;
  assigned_unit: string;
  ncrp_ack_id: string;
}

export interface ShapFactor {
  feature: string;
  label: string;
  value: string | number;
  impact_pct: number;
  direction: "increase" | "decrease";
}

export interface MlPrediction {
  complaint_id: string;
  priority_score: number;
  priority_tier: PriorityTier;
  recovery_probability: number;
  recommended_action: string;
  shap_factors: ShapFactor[];
  predicted_atm_ids: string[];
  model_version: string;
  computed_at: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  complaint_id: string | null;
  detail: string;
  hash: string;
}

export interface Transaction {
  txn_id: string;
  utr: string;
  from_account: string;
  from_bank: string;
  to_account: string;
  to_bank: string;
  to_ifsc: string;
  amount: number;
  timestamp: string;
  hop_index: number;
  withdrawal_status: WithdrawalStatus;
  freeze_status: FreezeStatus;
  atm_id: string | null;
}

export interface FreezeRequest {
  freeze_request_id: string;
  complaint_id: string;
  account: string;
  bank: string;
  amount_to_freeze: number;
  status: FreezeStatus;
  submitted_at: string;
  legal_provision: string;
  proportionality_statement: string;
  submitted_by: string;
}

export interface AccountFlag {
  account: string;
  bank: string;
  ifsc: string;
  prior_fraud_count: number;
  flagged_at: string[];
  shared_phone_accounts: string[];
  shared_kyc_accounts: string[];
  mule_confidence: number;
}

export interface AccountNetworkNode {
  account: string;
  bank: string;
  is_master: boolean;
  connection_count: number;
  prior_fraud_count: number;
}

export interface AccountNetworkEdge {
  from: string;
  to: string;
  relationship: "TRANSACTION" | "SHARED_PHONE" | "SHARED_KYC";
  weight: number;
}

export interface AccountNetwork {
  nodes: AccountNetworkNode[];
  edges: AccountNetworkEdge[];
  master_account: string;
}

export interface AtmFixture {
  atm_id: string;
  bank: string;
  address: string;
  lat: number;
  lon: number;
  cctv_available: boolean;
  cctv_retention_days: number;
  cctv_spec: string;
  historical_fraud_count: number;
  nodal_officer_name: string;
  nodal_officer_phone: string;
  nodal_officer_email: string;
}

export interface AtmPrediction extends AtmFixture {
  confidence_pct: number;
  distance_km: number;
  estimated_window_start: string;
  estimated_window_end: string;
  rank: number;
  scoring_factors: string[];
}

export interface FraudRing {
  cluster_id: string;
  complaint_ids: string[];
  mule_accounts: string[];
  total_amount: number;
  linked_complaint_count: number;
  master_account: string;
  ring_label: string;
  detected_at: string;
  consolidated: boolean;
}

export interface LegalDocument {
  doc_type: "FREEZE_REQUEST" | "CCTV_REQUEST" | "LOOKOUT_NOTICE";
  complaint_id: string;
  generated_at: string;
  content: string;
  validation_errors: string[];
  is_valid: boolean;
}

export interface CustodyEntry {
  timestamp: string;
  officer: string;
  action: "COLLECTED" | "ACCESSED" | "EXPORTED" | "SEALED";
}

export interface EvidenceItem {
  evidence_id: string;
  complaint_id: string;
  type: "CCTV_CLIP" | "TRANSACTION_LOG" | "KYC_DOCUMENT" | "CALL_LOG";
  description: string;
  hash: string;
  collected_at: string;
  collected_by: string;
  chain_of_custody: CustodyEntry[];
}

export interface CctnsCase {
  fir_number: string;
  complaint_ids: string[];
  filing_officer: string;
  station: string;
  filed_at: string;
  sections: string[];
  status: "DRAFT" | "FILED" | "CHARGE_SHEET_PENDING" | "CHARGE_SHEET_FILED";
}
