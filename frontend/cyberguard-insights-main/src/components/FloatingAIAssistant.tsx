// ─── Floating Shortcut Button & Compact AI Copilot Popup ──────────────────
// Pinned circular FAB in bottom-right corner that toggles a compact Intercom/Crisp-style
// chat popup floating card above the page content without resizing background maps/dashboards.

import React, { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bot, X, Sparkles, Maximize2 } from "lucide-react";
import { useAIDrawer } from "@/lib/aiDrawerStore";
import ChatPanel from "@/components/ChatPanel";

export default function FloatingAIAssistant() {
  const { isOpen, setIsOpen, toggle } = useAIDrawer();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Handle ESC key to close compact popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Hide floating shortcut button and popup on the dedicated full-screen /chat page
  if (currentPath === "/chat") return null;

  return (
    <>
      {/* ── Compact Chat Popup Window (Intercom / Crisp Style Card) ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-7.5rem)] sm:h-[580px] max-h-[620px] rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] shadow-cyan-950/20 overflow-hidden transition-all animate-in fade-in-0 zoom-in-95 duration-200 origin-bottom-right"
          role="dialog"
          aria-label="CipherTrace AI Assistant Popup"
        >
          {/* Popup Polished Header */}
          <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="grid size-8 place-items-center rounded-xl bg-cyan-500/20 text-primary ring-1 ring-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                  <Bot className="size-4" />
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 border-2 border-card animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xs font-bold text-foreground">
                    CipherTrace AI Copilot
                  </h3>
                  <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 font-mono text-[9px] font-bold text-primary">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  ATM Cluster &amp; Fraud Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Expand / Pop out to full /chat page */}
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                title="Expand to Full AI Assistant Page"
                className="grid size-7 place-items-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              >
                <Maximize2 className="size-3.5" />
              </Link>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close AI Assistant (ESC)"
                className="grid size-7 place-items-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/40"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Popup Chat Panel Body */}
          <div className="flex-1 overflow-hidden min-h-0">
            <ChatPanel prediction={null} />
          </div>
        </div>
      )}

      {/* ── Fixed Floating Action Button (FAB) Shortcut ── */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggle}
          title={isOpen ? "Close AI Copilot (ESC)" : "Open AI Fraud Investigation Copilot"}
          className="group relative flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 via-primary to-blue-600 text-white shadow-[0_0_30px_-4px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/40 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] focus:outline-none"
        >
          {/* Subtle Outer Ping Wave */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-cyan-400/20 animate-ping opacity-75" />
          )}

          {/* Icon Toggle (Bot <-> Close) */}
          <div className="relative flex items-center justify-center transition-transform duration-300">
            {isOpen ? (
              <X className="size-6 rotate-0 transition-transform duration-200" />
            ) : (
              <>
                <Bot className="size-6 transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-card animate-pulse">
                  <Sparkles className="size-2" />
                </span>
              </>
            )}
          </div>
        </button>
      </div>
    </>
  );
}
