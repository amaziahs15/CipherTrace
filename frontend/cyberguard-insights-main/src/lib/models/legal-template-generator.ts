/**
 * SIMULATED MODEL — Legal Template Generator
 *
 * Fills lawyer-reviewed static templates with complaint-specific fields.
 * NO LLM calls, NO external network calls — pure string interpolation.
 * All generated documents carry a mandatory DRAFT watermark and require
 * human legal review before any real-world use.
 *
 * See docs/ML_NOTES.md for the design rationale.
 */

import type { Complaint, LegalDocument, AtmPrediction } from "../mock-api/types";

// ─── Required field validators ────────────────────────────────────────────────

const REQUIRED_FREEZE_FIELDS: Array<keyof Complaint> = [
  "complaint_id",
  "mule_account",
  "mule_ifsc",
  "mule_bank",
  "fraud_amount",
  "fraud_timestamp",
  "utr",
];

export function validateFreezeRequest(complaint: Complaint): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_FREEZE_FIELDS) {
    if (!complaint[field]) errors.push(`Missing required field: ${field}`);
  }

  if (!complaint.fraud_amount || complaint.fraud_amount <= 0) {
    errors.push("Freeze amount must be positive");
  }

  // Proportionality — cannot freeze more than 3x the fraud amount
  // (not applicable here since we freeze exact amount, included for demo)

  return errors;
}

// ─── Template: Bank Freeze Request ───────────────────────────────────────────

export function generateFreezeRequest(complaint: Complaint): LegalDocument {
  const errors = validateFreezeRequest(complaint);
  const now = new Date().toISOString();
  const amountWords = complaint.fraud_amount.toLocaleString("en-IN");

  const content = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠  DRAFT — REQUIRES OFFICER REVIEW AND SIGNATURE  ⚠
DRAFT — Requires officer review and signature before any real-world use. Not connected to live government or banking systems.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANK ACCOUNT FREEZE REQUEST

Ref. No.: FREEZE-DRAFT-${complaint.complaint_id}
Date: ${new Date(now).toLocaleDateString("en-IN", { dateStyle: "long" })}

To,
The Nodal Officer (Cybercrime Compliance)
${complaint.mule_bank} Bank
[Branch Address]

Subject: Request for Immediate Freeze of Bank Account under Section 102
CrPC / Section 17A PMLA in connection with NCRP Complaint
${complaint.complaint_id}

Sir/Ma'am,

This is to inform you that a cybercrime complaint has been registered on the
National Cybercrime Reporting Portal (NCRP) bearing reference number
${complaint.ncrp_ack_id}, alleging ${complaint.fraud_type} resulting in a loss
of INR ${amountWords}/- (Rupees ${amountWords} only) from the victim's account
on ${new Date(complaint.fraud_timestamp).toLocaleString("en-IN")}.

The fraudulent amount has been traced to the following mule account in your bank:

  Account Number : ${complaint.mule_account}
  IFSC Code      : ${complaint.mule_ifsc}
  Bank           : ${complaint.mule_bank}
  UTR Reference  : ${complaint.utr}

You are hereby requested to immediately freeze the above-mentioned account and
hold all debit transactions to prevent further dissipation of funds. This request
is issued on grounds of proportionality — only the amount of INR ${amountWords}/-
equivalent to the defrauded sum is subject to freeze.

Legal Provision: Section 102 CrPC / Section 17A PMLA / Section 66 IT Act 2000

Please acknowledge receipt and confirm freeze within 2 hours as per NPCI/RBI
cybercrime SOP guidelines.

[Officer Name & Designation]
[Station / Unit]
[Date & Stamp]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠  DRAFT — REQUIRES OFFICER REVIEW AND SIGNATURE  ⚠
DRAFT — Requires officer review and signature before any real-world use. Not connected to live government or banking systems.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

  return {
    doc_type: "FREEZE_REQUEST",
    complaint_id: complaint.complaint_id,
    generated_at: now,
    content,
    validation_errors: errors,
    is_valid: errors.length === 0,
  };
}

// ─── Template: CCTV Request ───────────────────────────────────────────────────

export function generateCCTVRequest(complaint: Complaint, atm: AtmPrediction): LegalDocument {
  const errors: string[] = [];
  if (!atm.atm_id) errors.push("ATM ID is required");
  if (!atm.nodal_officer_name) errors.push("Nodal officer name is required");
  const now = new Date().toISOString();

  const content = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠  DRAFT — REQUIRES OFFICER REVIEW AND SIGNATURE  ⚠
DRAFT — Requires officer review and signature before any real-world use. Not connected to live government or banking systems.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CCTV FOOTAGE REQUEST

Ref. No.: CCTV-DRAFT-${complaint.complaint_id}-${atm.atm_id}
Date: ${new Date(now).toLocaleDateString("en-IN", { dateStyle: "long" })}

To,
${atm.nodal_officer_name}
Nodal Officer, ${atm.bank} Bank
ATM ID: ${atm.atm_id}
Location: ${atm.address}

Subject: Urgent Request for CCTV Footage — ATM ${atm.atm_id} in connection
with Cybercrime Complaint ${complaint.complaint_id}

Sir/Ma'am,

In connection with the cybercrime complaint ${complaint.complaint_id} registered
under NCRP Ack. No. ${complaint.ncrp_ack_id}, you are requested to immediately
preserve and furnish CCTV footage of ATM ${atm.atm_id} for the following period:

  From : ${new Date(atm.estimated_window_start).toLocaleString("en-IN")}
  To   : ${new Date(atm.estimated_window_end).toLocaleString("en-IN")}

The footage is required for identification of the suspect involved in a
${complaint.fraud_type} transaction (UTR: ${complaint.utr}).

ATM CCTV Specification on record: ${atm.cctv_spec}
Retention Period: ${atm.cctv_retention_days} days

Please ensure the footage is NOT overwritten and is handed over in its original
format along with a certificate of authenticity as per Section 65B Evidence Act.

Legal Provision: Section 91 CrPC / Section 91 BNSS / Section 65B Indian Evidence Act

[Officer Name & Designation]
[Station / Unit]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠  DRAFT — REQUIRES OFFICER REVIEW AND SIGNATURE  ⚠
DRAFT — Requires officer review and signature before any real-world use. Not connected to live government or banking systems.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

  return {
    doc_type: "CCTV_REQUEST",
    complaint_id: complaint.complaint_id,
    generated_at: now,
    content,
    validation_errors: errors,
    is_valid: errors.length === 0,
  };
}

// ─── Template: Lookout Notice ─────────────────────────────────────────────────

export function generateLookoutNotice(complaint: Complaint): LegalDocument {
  const errors: string[] = [];
  if (!complaint.mule_account) errors.push("Mule account required");
  const now = new Date().toISOString();

  const content = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠  DRAFT — REQUIRES OFFICER REVIEW AND SIGNATURE  ⚠
DRAFT — Requires officer review and signature before any real-world use. Not connected to live government or banking systems.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOOKOUT CIRCULAR / NOTICE

Ref. No.: LOC-DRAFT-${complaint.complaint_id}
Date: ${new Date(now).toLocaleDateString("en-IN", { dateStyle: "long" })}

To,
All Police Stations / ATM Surveillance Units
[Region]

Subject: Lookout Notice for Suspect Linked to Cybercrime Complaint
${complaint.complaint_id} — ${complaint.fraud_type}

A cybercrime complaint has been registered (NCRP Ack: ${complaint.ncrp_ack_id})
involving ${complaint.fraud_type} of INR ${complaint.fraud_amount.toLocaleString("en-IN")}.

SUSPECT MULE ACCOUNT DETAILS:
  Account : ${complaint.mule_account}
  Bank    : ${complaint.mule_bank}
  IFSC    : ${complaint.mule_ifsc}

PROBABLE WITHDRAWAL ZONE:
  KYC Coordinates: ${complaint.mule_kyc_lat.toFixed(4)}°N, ${complaint.mule_kyc_lon.toFixed(4)}°E
  Fraud Timestamp : ${new Date(complaint.fraud_timestamp).toLocaleString("en-IN")}

All ATMs within a 15 km radius of the above coordinates are requested to:
1. Alert the CMS/Switch on any withdrawal attempt from the above account
2. Preserve CCTV footage for the next 48 hours
3. Immediately report any suspicious activity to the nearest Cyber Cell

Legal Provision: Section 41A CrPC / Section 35 BNSS

[Officer Name & Designation]
[Station / Unit]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠  DRAFT — REQUIRES OFFICER REVIEW AND SIGNATURE  ⚠
DRAFT — Requires officer review and signature before any real-world use. Not connected to live government or banking systems.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

  return {
    doc_type: "LOOKOUT_NOTICE",
    complaint_id: complaint.complaint_id,
    generated_at: now,
    content,
    validation_errors: errors,
    is_valid: errors.length === 0,
  };
}
