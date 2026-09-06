// ─── AI Copilot Side-by-Side Drawer Store ─────────────────────────────────────
// Controls responsive side-by-side desktop panel and mobile overlay with map resize triggers.

import { useState, useEffect, useCallback } from "react";

let globalAIDrawerOpen = false;

export function useAIDrawer() {
  const [isOpen, setIsOpenState] = useState(globalAIDrawerOpen);

  useEffect(() => {
    const handleToggleEvent = (e: any) => {
      if (typeof e.detail?.open === "boolean") {
        setIsOpenState(e.detail.open);
      }
    };
    window.addEventListener("ciphertrace:ai_drawer_toggle", handleToggleEvent);
    return () => window.removeEventListener("ciphertrace:ai_drawer_toggle", handleToggleEvent);
  }, []);

  const setIsOpen = useCallback((open: boolean) => {
    globalAIDrawerOpen = open;
    setIsOpenState(open);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ciphertrace:ai_drawer_toggle", { detail: { open } }));
      
      // Dispatch layout resize events for Leaflet map invalidateSize
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new CustomEvent("ciphertrace:layout_resize"));
      }, 50);
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new CustomEvent("ciphertrace:layout_resize"));
      }, 250);
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new CustomEvent("ciphertrace:layout_resize"));
      }, 400);
    }
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(!globalAIDrawerOpen);
  }, [setIsOpen]);

  return { isOpen, setIsOpen, toggle };
}
