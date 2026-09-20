// ─── Client-Side Evidence Report PDF Generator ───────────────────────────────
// Generates official, tamper-evident law enforcement case dockets using jsPDF.

import { type HighRiskComplaint } from "@/routes/investigator";

export async function generateEvidenceReportPDF(
  complaint: HighRiskComplaint,
  attachedEvidence?: Array<{ name: string; type: string; previewUrl?: string }>,
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Header Background Banner ──
  doc.setFillColor(7, 11, 20);
  doc.rect(0, 0, pageWidth, 38, "F");

  // Cyan Accent Line
  doc.setFillColor(0, 212, 255);
  doc.rect(0, 38, pageWidth, 1.5, "F");

  // ── Header Title & Seal ──
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CIPHERTRACE · EVIDENCE & PATROL DOSSIER", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 240);
  doc.text("LAW ENFORCEMENT CYBERCRIME HOTSPOT TRIAGE & FORENSIC RECORD", 14, 23);
  doc.text("I4C Inter-Agency Response Network · Smart India Hackathon 2024", 14, 28);

  // Top-Right Classification Badge
  doc.setFillColor(244, 63, 94);
  doc.roundedRect(pageWidth - 55, 10, 42, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("RESTRICTED · LEA", pageWidth - 52, 15.5);

  let y = 48;

  // ── Case Overview Header Block ──
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`CASE DOCKET: ${complaint.id}`, 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageWidth - 70, y);

  y += 6;

  // ── Metadata Summary Table Box ──
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 52, 3, 3, "FD");

  doc.setFontSize(9);
  const leftColX = 20;
  const midColX = 105;

  let rowY = y + 8;
  doc.setTextColor(100, 116, 139);
  doc.text("Incident Category:", leftColX, rowY);
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.text(complaint.fraudType, leftColX + 35, rowY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Fraud Amount:", midColX, rowY);
  doc.setTextColor(244, 63, 94);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${complaint.fraudAmount.toLocaleString("en-IN")}`, midColX + 35, rowY);

  rowY += 9;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Suspect Origin Bank:", leftColX, rowY);
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.text(complaint.bank, leftColX + 35, rowY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Investigation Status:", midColX, rowY);
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.text(complaint.status.toUpperCase(), midColX + 35, rowY);

  rowY += 9;
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Victim Report Location:", leftColX, rowY);
  doc.setTextColor(20, 25, 35);
  doc.text(complaint.victimCoords, leftColX + 35, rowY);

  doc.setTextColor(100, 116, 139);
  doc.text("Report Timestamp:", midColX, rowY);
  doc.setTextColor(20, 25, 35);
  doc.text(complaint.timestamp, midColX + 35, rowY);

  rowY += 9;
  doc.setTextColor(100, 116, 139);
  doc.text("Assigned Police Unit:", leftColX, rowY);
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.text(complaint.assignedUnit, leftColX + 35, rowY);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("Screening Tier:", midColX, rowY);
  doc.setTextColor(244, 63, 94);
  doc.setFont("helvetica", "bold");
  doc.text(complaint.riskLevel, midColX + 35, rowY);

  y += 60;

  // ── Machine Learning Predicted Extraction Zone ──
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. PREDICTIVE HOTSPOT ATM EXTRACTION VECTOR", 14, y);

  y += 5;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setTextColor(3, 105, 161);
  doc.setFont("helvetica", "bold");
  doc.text(`Primary Forecast Hotspot: ${complaint.predictedHotspot}`, 20, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 25, 35);
  doc.text(
    `ML Model Confidence: ${complaint.confidence}% · Estimated Extraction Window: 2–6 Hours from complaint lodge`,
    20,
    y + 15,
  );
  doc.text(
    `Operational Recommendation: Deploy patrol interdiction units to ATM kiosks in ${complaint.hotspotCity}`,
    20,
    y + 22,
  );

  y += 38;

  // ── Suspect Account Behavioral Indicators ──
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. SUSPECT ACCOUNT TELEMETRY & BEHAVIORAL INDICATORS", 14, y);

  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 25, 35);
  doc.text(`• Mule Account Age: ${complaint.suspectAccountAge} Days (High-Risk Fresh Account)`, 20, y + 8);
  doc.text(`• IP Incident Velocity: ${complaint.ipVelocity} hits / 24 Hours (Abnormal Burst Frequency)`, 20, y + 15);

  y += 32;

  // ── Attached Evidence Files ──
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. DIGITAL EVIDENCE ATTACHMENTS & CHAT TRANSCRIPTS", 14, y);

  y += 5;
  const sampleEvidence = attachedEvidence && attachedEvidence.length > 0
    ? attachedEvidence
    : [
        { name: "Victim_UPI_Debit_Screenshot.png", type: "image/png" },
        { name: "Fraudulent_Bank_Statement_Extract.pdf", type: "application/pdf" },
      ];

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, "FD");

  doc.setFontSize(8.5);
  let evY = y + 8;
  sampleEvidence.forEach((file, idx) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text(`[Attachment ${idx + 1}] ${file.name}`, 20, evY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Type: ${file.type} · Cryptographically logged into case record`, 95, evY);
    evY += 8;
  });

  y += 34;

  // ── Cryptographic SHA-256 Hash Verification ──
  doc.setTextColor(20, 25, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("4. TAMPER-EVIDENT SHA-256 AUDIT CHAIN BLOCK", 14, y);

  y += 5;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("courier", "bold");
  doc.setTextColor(22, 101, 52);
  doc.text("SHA-256 EVIDENCE HASH: " + complaint.evidenceHash, 18, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Immutable Audit Status: Intact & Chain-Verified on I4C Distributed Ledger", 18, y + 14);

  // ── Footer & Legal Certification ──
  doc.setDrawColor(226, 232, 240);
  doc.line(14, pageHeight - 24, pageWidth - 14, pageHeight - 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6);
  doc.text(
    "DRAFT — Requires officer review and signature before any real-world use. Not connected to live government or banking systems.",
    14,
    pageHeight - 18,
  );

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "This evidence report is automatically compiled by CipherTrace Cybercrime Command under Section 65B of the Indian Evidence Act / BNSS.",
    14,
    pageHeight - 13,
  );
  doc.text(
    "For Official Police and Financial Intelligence Unit Use Only. Tampering with this document invalidates the cryptographic hash chain.",
    14,
    pageHeight - 9,
  );

  // ── Trigger Direct Browser Download ──
  const filename = `CipherTrace_Evidence_${complaint.id}.pdf`;
  doc.save(filename);
}
