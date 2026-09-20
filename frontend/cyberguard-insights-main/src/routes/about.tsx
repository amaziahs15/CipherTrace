import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Lock,
  Scale,
  Database,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Building2,
  ServerOff,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Compliance, Architecture & Legal Framework · CipherTrace" },
      {
        name: "description",
        content:
          "Operational compliance, system architecture, and statutory draft review guidelines for CipherTrace.",
      },
    ],
  }),
  component: AboutCompliancePage,
});

function AboutCompliancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Page Header */}
        <div className="border-b border-border/40 pb-6">
          <div className="flex items-center gap-2 text-cyan-500 font-semibold text-xs uppercase tracking-wider">
            <ShieldAlert className="size-4" />
            <span>Operational Compliance & Legal Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1.5">
            About CipherTrace & Compliance Guidelines
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
            CipherTrace is a predictive cybercrime triage and withdrawal interdiction platform developed for the Smart India Hackathon. This document sets out the operational boundaries, system architecture, and statutory legal compliance procedures.
          </p>
        </div>

        {/* Grid of 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pillar 1: Architecture & Isolation */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-6 space-y-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-primary">
                <ServerOff className="size-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  1. Secure Architecture &amp; System Isolation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Zero unauthorized access to external production databases
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              To prevent data contamination and comply with regulatory privacy mandates, CipherTrace operates with strict compartmentalization and deterministic heuristics:
            </p>

            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>NCRP &amp; CFCFRMS:</strong> Adheres to strict data protection standards for complaints and incident records.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Banking &amp; NPCI Networks:</strong> All mule account numbers, IFSC codes, and transaction references adhere strictly to standard regulatory masking and security formats.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Edge ML Inference:</strong> ATM withdrawal spatial clustering runs via local high-speed mathematical heuristics.
                </span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Statutory Drafts & Human Legal Review */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-6 space-y-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                <Scale className="size-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  2. Statutory Notice Protocols
                </h3>
                <p className="text-xs text-muted-foreground">
                  Mandatory human verification and signature
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              CipherTrace incorporates a Legal Notice Generator providing deterministic statutory templates under Indian criminal law:
            </p>

            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Bank Account Freeze (Sec 102 CrPC / Sec 17A PMLA):</strong> Draft requisition to freeze identified mule accounts within proportionality limits.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>CCTV Preservation (Sec 91 CrPC / BNSS):</strong> Statutory notice to preserve ATM video footage within the predicted window.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Lookout Circular (Sec 41A CrPC / Sec 35 BNSS):</strong> Interdiction alert dispatched to patrol teams in probable withdrawal zones.
                </span>
              </li>
            </ul>

            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[11px] text-rose-600 dark:text-rose-300">
              <strong>Human-in-the-Loop Requirement:</strong> Under statutory provisions, no autonomous algorithmic software may dispatch binding legal orders. Every generated draft must be reviewed, stamped, and signed by an authorized Investigating Officer (IO).
            </div>
          </div>

          {/* Pillar 3: Section 65B Indian Evidence Act */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-6 space-y-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Database className="size-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  3. Forensic Chain of Custody (Sec 65B)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cryptographic SHA-256 tamper-evident audit logging
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              In accordance with Section 65B of the Indian Evidence Act (and corresponding Bharatiya Sakshya Adhiniyam provisions), all investigative actions are cryptographically sealed:
            </p>

            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Immutable Audit Chain:</strong> Every complaint registration, prediction query, and notice generation produces an incremental SHA-256 hash.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Admissibility Dockets:</strong> Generated PDF evidence reports include root hashes and timestamp signatures suitable for judicial submission.
                </span>
              </li>
            </ul>
          </div>

          {/* Pillar 4: Security & Privacy Guarantees */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-6 space-y-4 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400">
                <Lock className="size-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  4. Role Segregation & Privacy
                </h3>
                <p className="text-xs text-muted-foreground">
                  Role-based access boundaries and local state
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              CipherTrace implements clear operational boundaries between public-facing triage and sensitive investigative commands:
            </p>

            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Citizen Triage Role:</strong> Limited to filing complaints, tracking incident status, and reviewing educational cyber advisories.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Investigator (LEA) Role:</strong> Access to restricted cross-jurisdictional link-analysis graphs, ATM spatial vectors, and statutory draft generators.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Local Session Storage:</strong> No user inputs are sent to remote tracking servers or cloud telemetry aggregators.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Navigation Footer */}
        <div className="rounded-2xl border border-border/50 bg-muted/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-foreground">Ready to explore the prototype?</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Navigate back to the interactive triage console or review the system metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="rounded-xl border border-border/60 bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/metrics"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              System Metrics & SLAs
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
