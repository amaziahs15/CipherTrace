import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, ShieldCheck, Flame } from "lucide-react";

interface GoldenHourCountdownProps {
  fraudTimestamp: string;
  windowHours?: number; // default 4 hours
}

export default function GoldenHourCountdown({
  fraudTimestamp,
  windowHours = 4,
}: GoldenHourCountdownProps) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  useEffect(() => {
    const calculateRemaining = () => {
      const fraudTime = new Date(fraudTimestamp).getTime();
      const deadline = fraudTime + windowHours * 3600 * 1000;
      const now = Date.now();
      return deadline - now;
    };

    setTimeLeftMs(calculateRemaining());

    const interval = setInterval(() => {
      setTimeLeftMs(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [fraudTimestamp, windowHours]);

  const isExpired = timeLeftMs <= 0;

  const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatUnit = (val: number) => String(val).padStart(2, "0");

  // Color states based on remaining time
  const isUrgent = !isExpired && timeLeftMs < 60 * 60 * 1000; // less than 1 hr
  const isModerate = !isExpired && !isUrgent && timeLeftMs < 2 * 60 * 60 * 1000; // 1-2 hrs

  return (
    <div
      className={`rounded-xl border p-4 backdrop-blur-sm transition-all shadow-md ${
        isExpired
          ? "bg-rose-950/40 border-rose-900/60 text-rose-300"
          : isUrgent
          ? "bg-rose-950/30 border-rose-600/50 text-rose-200 animate-pulse"
          : isModerate
          ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
          : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          {isExpired ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : isUrgent ? (
            <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
          ) : (
            <Clock className="w-4 h-4 text-emerald-400" />
          )}
          <span>Golden Hour Recovery Window</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10">
          {windowHours}h Target
        </span>
      </div>

      {isExpired ? (
        <div>
          <div className="text-xl font-bold font-mono tracking-wide text-rose-400">
            00:00:00 — WINDOW EXPIRED
          </div>
          <p className="text-xs text-rose-400/80 mt-1">
            Funds likely layered or withdrawn at ATM. Prioritize account freezing and CCTV preservation immediately.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tracking-wider">
              {formatUnit(hours)}:{formatUnit(minutes)}:{formatUnit(seconds)}
            </span>
            <span className="text-xs uppercase font-medium text-slate-400">Time Remaining</span>
          </div>
          <p className="text-xs mt-1 text-slate-300/90">
            {isUrgent
              ? "Critical freeze window closing! High risk of immediate ATM cash-out."
              : "Active interception window open. Fast-track CFCFRMS freeze request."}
          </p>
        </div>
      )}
    </div>
  );
}
