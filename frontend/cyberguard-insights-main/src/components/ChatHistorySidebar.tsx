import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  MoreVertical,
  Share2,
  Pencil,
  Trash2,
  Check,
  X,
  PanelLeftClose,
  PanelLeft,
  Clock,
  ChevronRight,
  Shield,
  Sparkles,
  Copy,
  AlertCircle,
} from "lucide-react";
import {
  type ChatConversation,
  formatRelativeTime,
  generateShareableTranscript,
} from "@/lib/chatHistoryStore";

interface ChatHistorySidebarProps {
  conversations: ChatConversation[];
  activeId: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
}

export default function ChatHistorySidebar({
  conversations,
  activeId,
  isOpen,
  onToggle,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
}: ChatHistorySidebarProps) {
  // Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sharedToastId, setSharedToastId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  const handleStartRename = (conv: ChatConversation) => {
    setRenamingId(conv.id);
    setRenameText(conv.title);
    setOpenMenuId(null);
    setDeletingId(null);
  };

  const handleSaveRename = (id: string) => {
    const trimmed = renameText.trim();
    if (trimmed) {
      onRenameConversation(id, trimmed);
    }
    setRenamingId(null);
    setRenameText("");
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setRenameText("");
  };

  const handleShare = async (conv: ChatConversation) => {
    const transcript = generateShareableTranscript(conv);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(transcript);
        setSharedToastId(conv.id);
        setOpenMenuId(null);
        setTimeout(() => setSharedToastId(null), 2500);
      }
    } catch (err) {
      console.warn("[ChatHistorySidebar] Clipboard write failed:", err);
    }
  };

  const handleStartDelete = (id: string) => {
    setDeletingId(id);
    setOpenMenuId(null);
    setRenamingId(null);
  };

  const handleConfirmDelete = (id: string) => {
    onDeleteConversation(id);
    setDeletingId(null);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center border-r border-border/50 bg-card/60 p-2.5 backdrop-blur-md">
        <button
          type="button"
          onClick={onToggle}
          title="Open Conversation History"
          className="grid size-9 place-items-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-95"
        >
          <PanelLeft className="size-4" />
        </button>

        <div className="my-3 h-px w-6 bg-border/40" />

        <button
          type="button"
          onClick={onNewChat}
          title="Start New Investigation Chat"
          className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="relative flex h-full w-64 sm:w-72 md:w-80 shrink-0 flex-col border-r border-border/50 bg-card/80 backdrop-blur-md transition-all duration-300">
      
      {/* ── Top Bar with Title & Collapse ── */}
      <div className="flex items-center justify-between border-b border-border/40 p-3.5">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-cyan-500/15 text-cyan-400">
            <MessageSquare className="size-3.5" />
          </div>
          <div>
            <h2 className="font-display text-xs font-bold text-foreground">
              Investigation Logs
            </h2>
            <p className="text-[10px] text-muted-foreground font-mono">
              {conversations.length} {conversations.length === 1 ? "session" : "sessions"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          title="Collapse Sidebar"
          className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      {/* ── "+ New Chat" Button ── */}
      <div className="p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 font-mono text-xs font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          <span>New Investigation Chat</span>
        </button>
      </div>

      {/* ── Share Confirmation Toast Banner ── */}
      {sharedToastId && (
        <div className="mx-3 mb-2 flex items-center justify-between gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-400 shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <Check className="size-3.5 shrink-0" />
            <span className="truncate">Transcript copied to clipboard!</span>
          </div>
          <button onClick={() => setSharedToastId(null)} className="text-emerald-400/80 hover:text-emerald-300">
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* ── Conversations List ── */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {conversations.length === 0 ? (
          <div className="grid place-items-center p-6 text-center text-xs text-muted-foreground">
            <Clock className="size-6 mb-2 opacity-40 text-primary" />
            <p>No previous conversations.</p>
            <p className="text-[10px] opacity-75 mt-0.5">Click New Chat to begin triage.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const isRenaming = renamingId === conv.id;
            const isDeleting = deletingId === conv.id;
            const isMenuOpen = openMenuId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative rounded-xl border transition-all ${
                  isActive
                    ? "border-primary/50 bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/20"
                    : "border-transparent bg-muted/20 text-muted-foreground hover:border-border/60 hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                {/* Inline Rename Mode */}
                {isRenaming ? (
                  <div className="p-2 space-y-2">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(conv.id);
                        if (e.key === "Escape") handleCancelRename();
                      }}
                      className="w-full rounded-lg border border-primary/60 bg-black/40 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex items-center justify-end gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        className="rounded px-2 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveRename(conv.id)}
                        className="flex items-center gap-1 rounded bg-primary px-2 py-0.5 font-bold text-primary-foreground hover:brightness-110"
                      >
                        <Check className="size-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : isDeleting ? (
                  /* Inline Delete Confirmation Popover */
                  <div className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 space-y-2">
                    <div className="flex items-start gap-1.5 text-[11px] text-rose-300 font-medium">
                      <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-rose-400" />
                      <span>Delete this conversation? Cannot be undone.</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={handleCancelDelete}
                        className="rounded px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(conv.id)}
                        className="flex items-center gap-1 rounded bg-rose-600 px-2.5 py-1 font-bold text-white transition-all hover:bg-rose-500 shadow-sm"
                      >
                        <Trash2 className="size-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Conversation Row */
                  <div className="flex items-center justify-between p-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectConversation(conv.id)}
                      className="flex min-w-0 flex-1 flex-col text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        {isActive && (
                          <span className="size-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
                        )}
                        <span className={`truncate text-xs font-medium ${isActive ? "text-primary font-bold" : "text-foreground"}`}>
                          {conv.title}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <span>{formatRelativeTime(conv.updatedAt)}</span>
                        <span>·</span>
                        <span>{conv.messages.length} msgs</span>
                      </div>
                    </button>

                    {/* Three-Dot Menu Trigger */}
                    <div className="relative shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : conv.id);
                        }}
                        title="Conversation Actions"
                        className={`grid size-7 place-items-center rounded-lg text-muted-foreground transition-all hover:bg-muted/70 hover:text-foreground ${
                          isMenuOpen ? "bg-muted text-foreground" : "opacity-70 group-hover:opacity-100"
                        }`}
                      >
                        <MoreVertical className="size-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-8 z-50 min-w-[140px] rounded-xl border border-border/80 bg-slate-950/95 p-1 text-xs shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(conv);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                          >
                            <Share2 className="size-3.5" />
                            <span>Share Transcript</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRename(conv);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                          >
                            <Pencil className="size-3.5" />
                            <span>Rename</span>
                          </button>

                          <div className="my-1 h-px bg-border/40" />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartDelete(conv.id);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-rose-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer Info ── */}
      <div className="border-t border-border/40 p-2.5 text-center">
        <p className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">
          CipherTrace Intelligence Logs
        </p>
      </div>
    </aside>
  );
}
