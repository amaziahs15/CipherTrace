// ─── Route: /chat (AI Cybercrime Assistant Terminal with Multi-Conversation History) ───
import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bot, Zap, MessageSquare, Plus, History, Terminal } from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";
import ChatHistorySidebar from "@/components/ChatHistorySidebar";
import {
  type ChatConversation,
  getStoredConversations,
  saveStoredConversations,
  getStoredActiveConversationId,
  setStoredActiveConversationId,
  createNewConversation,
  deriveTitleFromFirstMessage,
} from "@/lib/chatHistoryStore";
import { type ChatMessage } from "@/components/ChatPanel";

const ChatPanel = lazy(() => import("@/components/ChatPanel"));

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Cybercrime Assistant · CipherTrace Intelligence" },
      {
        name: "description",
        content: "Investigative AI assistant powered by Groq LLM for ATM cluster analysis, 1930 freeze drafting, and fraud query resolution.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { t } = useI18n();

  // ── Conversation State (persisted via localStorage) ──
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize conversations from localStorage on client mount
  useEffect(() => {
    const list = getStoredConversations();
    const storedActive = getStoredActiveConversationId();
    const active =
      storedActive && list.some((c) => c.id === storedActive)
        ? storedActive
        : list[0]?.id || "";

    setConversations(list);
    setActiveId(active);
    setIsLoaded(true);
  }, []);

  // Sync active conversation ID to localStorage
  useEffect(() => {
    if (activeId) {
      setStoredActiveConversationId(activeId);
    }
  }, [activeId]);

  // Active Conversation Object
  const activeConversation =
    conversations.find((c) => c.id === activeId) || conversations[0] || null;

  // ── Handlers ──

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleNewChat = useCallback(() => {
    const fresh = createNewConversation("New Investigation");
    const updated = [fresh, ...conversations];
    setConversations(updated);
    setActiveId(fresh.id);
    saveStoredConversations(updated);
  }, [conversations]);

  const handleRenameConversation = useCallback(
    (id: string, newTitle: string) => {
      const updated = conversations.map((c) =>
        c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c,
      );
      setConversations(updated);
      saveStoredConversations(updated);
    },
    [conversations],
  );

  const handleDeleteConversation = useCallback(
    (id: string) => {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh = createNewConversation("New Investigation");
        setConversations([fresh]);
        setActiveId(fresh.id);
        saveStoredConversations([fresh]);
      } else {
        setConversations(remaining);
        if (activeId === id) {
          setActiveId(remaining[0].id);
        }
        saveStoredConversations(remaining);
      }
    },
    [conversations, activeId],
  );

  const handleMessagesChange = useCallback(
    (newMessages: ChatMessage[]) => {
      if (!activeId) return;
      const now = Date.now();
      const updated = conversations.map((c) =>
        c.id === activeId ? { ...c, messages: newMessages, updatedAt: now } : c,
      );
      setConversations(updated);
      saveStoredConversations(updated);
    },
    [activeId, conversations],
  );

  const handleFirstUserMessage = useCallback(
    (firstText: string) => {
      if (!activeId) return;
      const newTitle = deriveTitleFromFirstMessage(firstText);
      const updated = conversations.map((c) =>
        c.id === activeId && (c.title === "New Investigation" || c.title === "ATM Hotspot Analysis")
          ? { ...c, title: newTitle, updatedAt: Date.now() }
          : c,
      );
      setConversations(updated);
      saveStoredConversations(updated);
    },
    [activeId, conversations],
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-5">
        
        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40">
                <Bot className="size-4" />
              </span>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">
                  {t.aiAssistant}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t.aiSub}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-xs font-bold text-primary flex items-center gap-1.5 shadow-sm">
              <Zap className="size-3 text-warning" />
              {t.modelActive}
            </span>
          </div>
        </div>

        {/* ── Main Chat Terminal with History Sidebar ── */}
        <div className="panel flex h-[680px] overflow-hidden border-border/60 shadow-2xl p-0">
          <ClientOnly
            fallback={
              <div className="h-full w-full grid place-items-center text-sm text-muted-foreground">
                Loading AI Investigation Terminal…
              </div>
            }
          >
            {isLoaded && activeConversation ? (
              <div className="flex h-full w-full overflow-hidden">
                {/* ── Collapsible History Sidebar ── */}
                <ChatHistorySidebar
                  conversations={conversations}
                  activeId={activeId}
                  isOpen={isSidebarOpen}
                  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={handleNewChat}
                  onRenameConversation={handleRenameConversation}
                  onDeleteConversation={handleDeleteConversation}
                />

                {/* ── Active Conversation Main Chat View ── */}
                <div className="flex-1 flex flex-col h-full min-w-0 bg-card overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="h-full grid place-items-center text-sm text-muted-foreground">
                        Loading Chat History…
                      </div>
                    }
                  >
                    <ChatPanel
                      key={activeConversation.id}
                      prediction={null}
                      messages={activeConversation.messages}
                      onMessagesChange={handleMessagesChange}
                      onFirstUserMessage={handleFirstUserMessage}
                    />
                  </Suspense>
                </div>
              </div>
            ) : (
              <div className="h-full w-full grid place-items-center text-sm text-muted-foreground">
                Initializing Investigation Logs…
              </div>
            )}
          </ClientOnly>
        </div>
      </div>
    </DashboardLayout>
  );
}
