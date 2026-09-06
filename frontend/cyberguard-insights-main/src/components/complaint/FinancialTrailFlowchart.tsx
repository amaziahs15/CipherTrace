import React from "react";
import { ArrowRight, AlertTriangle, CheckCircle, Clock, Snowflake } from "lucide-react";
import type { Transaction, AccountFlag, WithdrawalStatus, FreezeStatus } from "@/lib/mock-api/types";

interface FinancialTrailFlowchartProps {
  transactions: Transaction[];
  accountFlags: Record<string, AccountFlag>;
}

const WITHDRAWAL_LABELS: Record<WithdrawalStatus, { label: string; color: string }> = {
  NOT_WITHDRAWN: { label: "Funds Present", color: "text-emerald-400" },
  WITHDRAWN_ATM: { label: "Withdrawn (ATM)", color: "text-rose-400" },
  WITHDRAWN_POS: { label: "Withdrawn (POS)", color: "text-orange-400" },
};

const FREEZE_LABELS: Record<FreezeStatus, { label: string; color: string; icon: React.ReactNode }> = {
  NOT_REQUESTED: { label: "No Freeze", color: "text-muted-foreground", icon: <Clock className="size-3" /> },
  REQUESTED: { label: "Freeze Requested", color: "text-amber-400", icon: <Clock className="size-3" /> },
  FROZEN: { label: "Frozen ✓", color: "text-emerald-400", icon: <Snowflake className="size-3" /> },
  REJECTED: { label: "Freeze Rejected", color: "text-rose-400", icon: <AlertTriangle className="size-3" /> },
};

function AccountNode({
  account,
  bank,
  amount,
  isVictim,
  isLast,
  flag,
  withdrawal,
  freeze,
}: {
  account: string;
  bank: string;
  amount: number;
  isVictim?: boolean | undefined;
  isLast?: boolean | undefined;
  flag?: AccountFlag | undefined;
  withdrawal: WithdrawalStatus;
  freeze: FreezeStatus;
}) {
  const ws = WITHDRAWAL_LABELS[withdrawal];
  const fs = FREEZE_LABELS[freeze];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative rounded-xl border p-3.5 text-xs transition-all ${
          isVictim
            ? "border-blue-500/40 bg-blue-950/20 text-blue-200"
            : flag && flag.prior_fraud_count > 0
            ? "border-rose-500/50 bg-rose-950/30 text-rose-200 shadow-rose-900/20 shadow-md"
            : "border-border/60 bg-card text-foreground"
        } min-w-[200px] max-w-[220px]`}
      >
        {/* Node header */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
            {isVictim ? "Victim Source" : "Mule Account"}
          </span>
          {flag && flag.prior_fraud_count > 0 && (
            <span className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="size-2.5" />
              I4C Flag ({flag.prior_fraud_count})
            </span>
          )}
        </div>

        {/* Account identifier */}
        <div className="font-mono font-bold text-xs truncate" title={account}>
          {account}
        </div>
        <div className="text-[11px] text-muted-foreground">{bank}</div>

        {/* Amount */}
        <div className="mt-2 font-mono font-semibold text-xs text-foreground">
          ₹{amount.toLocaleString("en-IN")}
        </div>

        {/* Status badges */}
        {!isVictim && (
          <div className="mt-2 flex flex-col gap-1 border-t border-border/40 pt-2">
            <span className={`text-[10px] font-medium ${ws.color}`}>
              ● {ws.label}
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-medium ${fs.color}`}>
              {fs.icon}
              {fs.label}
            </span>
          </div>
        )}
      </div>

      {!isLast && (
        <ArrowRight className="size-4 shrink-0 text-muted-foreground/60" />
      )}
    </div>
  );
}

export default function FinancialTrailFlowchart({
  transactions,
  accountFlags,
}: FinancialTrailFlowchartProps) {
  const firstTxn = transactions[0];
  if (!transactions.length || !firstTxn) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        No transaction trail available for this complaint.
      </div>
    );
  }

  // Build ordered node list: victim + each mule in hop order
  const nodes: {
    account: string;
    bank: string;
    amount: number;
    isVictim?: boolean | undefined;
    txn: Transaction;
  }[] = [];

  nodes.push({
    account: firstTxn.from_account,
    bank: firstTxn.from_bank,
    amount: firstTxn.amount,
    isVictim: true,
    txn: firstTxn,
  });

  transactions.forEach((txn) => {
    nodes.push({
      account: txn.to_account,
      bank: txn.to_bank,
      amount: txn.amount,
      txn,
    });
  });

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center gap-2 min-w-max">
        {nodes.map((node, idx) => {
          const flag = accountFlags[node.account];
          const isLast = idx === nodes.length - 1;
          return (
            <React.Fragment key={node.account + idx}>
              <AccountNode
                account={node.account}
                bank={node.bank}
                amount={node.amount}
                isVictim={node.isVictim}
                isLast={isLast}
                flag={flag}
                withdrawal={node.txn.withdrawal_status}
                freeze={node.txn.freeze_status}
              />
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        <span className="font-bold text-rose-400">I4C ×N</span> = flagged in N prior frauds in the I4C Suspect Registry (Simulated)
      </p>
    </div>
  );
}
