// ─── Theme + Language Controls Component ─────────────────────────────────────
// Drop-in header component with theme toggle (dark/light) and language selector.

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sun, Moon, Globe, Check, ChevronDown } from "lucide-react";
import { LANGUAGES, useI18n, type LangCode } from "@/lib/i18n";

// ─── Theme re-export from central store ──────────────────────────────────────
export { useTheme, type Theme } from "@/lib/theme";
import { useTheme, type Theme } from "@/lib/theme";

// ─── ThemeLanguageControls component ─────────────────────────────────────────

interface Props {
  theme: Theme;
  toggleTheme: () => void;
  lang: LangCode;
  setLang: (l: LangCode) => void;
}

export default function ThemeLanguageControls({ theme, toggleTheme, lang, setLang }: Props) {
  const [langOpen, setLangOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    if (langOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [langOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]!;

  return (
    <div className="flex items-center gap-2">
      {/* ── Theme toggle ── */}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="group relative grid size-9 place-items-center rounded-xl border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
      >
        <span
          className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{ opacity: theme === "dark" ? 1 : 0, transform: theme === "dark" ? "scale(1)" : "scale(0.6)" }}
        >
          <Moon className="size-4" />
        </span>
        <span
          className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{ opacity: theme === "light" ? 1 : 0, transform: theme === "light" ? "scale(1)" : "scale(0.6)" }}
        >
          <Sun className="size-4" />
        </span>
      </button>

      {/* ── Language selector ── */}
      <div ref={dropRef} className="relative">
        <button
          onClick={() => setLangOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Globe className="size-3.5 shrink-0" />
          <span className="max-w-[72px] truncate">{currentLang.native}</span>
          <ChevronDown
            className="size-3 shrink-0 transition-transform duration-200"
            style={{ transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>

        {/* Dropdown */}
        {langOpen && (
          <div
            className="lang-dropdown-open absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-2xl border border-border/60 shadow-2xl"
            style={{ background: "var(--card)", backdropFilter: "blur(20px)" }}
          >
            <div className="border-b border-border/30 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Select Language
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-primary/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{l.native}</p>
                    <p className="text-[10px] text-muted-foreground">{l.label}</p>
                  </div>
                  {lang === l.code && (
                    <Check className="size-3.5 shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
