// ─── AI Cybercrime Assistant Component with Voice, Attachments, Flowcharts & Edit ────
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Bot,
  User,
  Send,
  Loader2,
  MessageSquare,
  Sparkles,
  XCircle,
  Mic,
  MicOff,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  Radio,
  Download,
  AlertTriangle,
  Pencil,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { fetchChat, type Prediction } from "@/lib/hotspots";
import { useI18n } from "@/lib/i18n";
import MermaidDiagram from "@/components/MermaidDiagram";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AttachedFile = {
  name: string;
  size: number;
  type: string;
  previewUrl?: string | undefined;
};

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  attachment?: AttachedFile | undefined;
  timestamp?: string | undefined;
};

// ─── Message Parsing for Text & Mermaid Diagrams ───────────────────────────────

type ContentSegment =
  | { type: "text"; content: string }
  | { type: "mermaid"; content: string };

function parseMessageSegments(text: string): ContentSegment[] {
  // Matches ```mermaid ... ``` or ``` ... (if containing graph/flowchart/sequenceDiagram) ```
  const regex = /```(?:mermaid\b)?\s*([\s\S]*?)```/gi;
  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = text.slice(lastIndex, match.index);
      if (textChunk.trim()) {
        segments.push({ type: "text", content: textChunk });
      }
    }

    const blockContent = match[1].trim();
    // Check if this block is actually a Mermaid diagram
    const isMermaid =
      match[0].toLowerCase().startsWith("```mermaid") ||
      /^(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|quadrantChart|mindmap|timeline)/i.test(
        blockContent,
      );

    if (isMermaid && blockContent) {
      segments.push({ type: "mermaid", content: blockContent });
    } else if (match[0].trim()) {
      segments.push({ type: "text", content: match[0] });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const textChunk = text.slice(lastIndex);
    if (textChunk.trim()) {
      segments.push({ type: "text", content: textChunk });
    }
  }

  if (segments.length === 0 && text.trim()) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}

import ReactMarkdown from "react-markdown";

// ─── Clean text for Clipboard Copy (removes raw Mermaid syntax) ────────────────

function getCopyableText(text: string): string {
  const cleaned = text
    .replace(/```(?:mermaid\b)?[\s\S]*?```/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return cleaned || text;
}

// ─── Render plain text for User Messages ───────────────────────────────────────

function renderText(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-inherit">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

// ─── Rich Markdown Renderer for AI Assistant Responses ─────────────────────────

function AiMarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-xs sm:text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mt-3 mb-2 font-display text-base font-bold text-cyan-300 border-b border-border/40 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-3 mb-1.5 font-display text-sm font-bold text-cyan-400">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-2.5 mb-1.5 font-display text-xs sm:text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-cyan-400" />
              <span>{children}</span>
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-2 mb-1 font-display text-xs font-bold text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-foreground/95">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-2 ml-4 list-disc space-y-1 text-foreground/90 marker:text-cyan-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 list-decimal space-y-1 text-foreground/90 marker:text-cyan-400 marker:font-mono marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-bold text-foreground text-inherit">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          code: ({ children, ...props }: any) => (
            <code
              className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300 border border-border/40"
              {...props}
            >
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-primary/60 bg-primary/5 pl-3 py-1 text-xs italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-left text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border/60 bg-muted/40 p-2 font-mono font-bold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/40 p-2 text-muted-foreground">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── ChatPanel Component ───────────────────────────────────────────────────────

export interface ChatPanelProps {
  prediction?: Prediction | null;
  messages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
  onFirstUserMessage?: (text: string) => void;
}

export default function ChatPanel({
  prediction,
  messages: externalMessages,
  onMessagesChange,
  onFirstUserMessage,
}: ChatPanelProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (externalMessages && externalMessages.length > 0) return externalMessages;
    return [
      {
        role: "assistant",
        text: "Greetings, Officer / Citizen. I am **CipherTrace AI**, your predictive fraud intelligence assistant. You can ask me about ATM hotspot extraction patterns, generate investigation flowcharts, draft emergency 1930 bank freeze notices, attach transaction evidence, or dictate queries via voice.",
        timestamp: "Just now",
      },
    ];
  });

  // Sync when parent changes the active conversation
  useEffect(() => {
    if (externalMessages && externalMessages !== messages) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Message Editing State ──
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // ── Message Copying State ──
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // ── Voice Recording State (Web Speech API) ──
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // ── Attached Evidence File State ──
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    "Show a flowchart of how UPI fraud is traced to ATM cashouts",
    "Identify nearest ATM cluster for victim at Connaught Place",
    "Draft emergency 1930 bank freeze notice for SBI account",
    "Diagram the multi-agency 1930 freeze response workflow",
  ];

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus on edit textarea when editing begins
  useEffect(() => {
    if (editingIndex !== null) {
      editTextareaRef.current?.focus();
      editTextareaRef.current?.select();
    }
  }, [editingIndex]);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] Error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or a WebSpeech-compatible browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn("[SpeechRecognition] Start error:", err);
      }
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined;

    setAttachedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
    });
    setError(null);
  };

  const removeAttachedFile = () => {
    if (attachedFile?.previewUrl) {
      URL.revokeObjectURL(attachedFile.previewUrl);
    }
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send Message
  const send = useCallback(
    async (text: string) => {
      const msg = text.trim();
      const currentAttachment = attachedFile;

      if ((!msg && !currentAttachment) || loading) return;

      setInput("");
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError(null);

      const timestamp = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Construct prompt including attachment note if present
      let finalPrompt = msg;
      if (currentAttachment && !msg) {
        finalPrompt = `[Attached Evidence Document: ${currentAttachment.name} (${Math.round(
          currentAttachment.size / 1024,
        )} KB)]. Please review this evidence for fraud triage.`;
      } else if (currentAttachment) {
        finalPrompt = `[Attached Evidence: ${currentAttachment.name}]. ${msg}`;
      }

      const userMsg: ChatMessage = {
        role: "user",
        text: msg || `Uploaded evidence: ${currentAttachment?.name}`,
        attachment: currentAttachment ?? undefined,
        timestamp,
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      onMessagesChange?.(updatedHistory);

      // Notify parent if this is the first user prompt in the session
      if (onFirstUserMessage && messages.filter((m) => m.role === "user").length === 0) {
        onFirstUserMessage(msg || currentAttachment?.name || "New Investigation");
      }

      setLoading(true);

      try {
        const reply = await fetchChat(finalPrompt, prediction);
        const finalHistory: ChatMessage[] = [
          ...updatedHistory,
          {
            role: "assistant",
            text: reply,
            timestamp: new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
        setMessages(finalHistory);
        onMessagesChange?.(finalHistory);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.aiChatFailed);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [loading, prediction, attachedFile, t.aiChatFailed, messages, onMessagesChange, onFirstUserMessage],
  );

  // Edit and Regenerate from a previous User Message
  const handleSaveEdit = async (index: number) => {
    const updatedText = editText.trim();
    if (!updatedText || loading) return;

    const originalAttachment = messages[index]?.attachment;
    const newTimestamp = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Truncate message history to this message and replace it
    const updatedUserMsg: ChatMessage = {
      role: "user",
      text: updatedText,
      attachment: originalAttachment,
      timestamp: newTimestamp,
    };

    const newHistory = [...messages.slice(0, index), updatedUserMsg];
    setMessages(newHistory);
    onMessagesChange?.(newHistory);
    setEditingIndex(null);
    setEditText("");
    setError(null);
    setLoading(true);

    let finalPrompt = updatedText;
    if (originalAttachment) {
      finalPrompt = `[Attached Evidence: ${originalAttachment.name}]. ${updatedText}`;
    }

    try {
      const reply = await fetchChat(finalPrompt, prediction);
      const finalHistory: ChatMessage[] = [
        ...newHistory,
        {
          role: "assistant",
          text: reply,
          timestamp: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ];
      setMessages(finalHistory);
      onMessagesChange?.(finalHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.aiChatFailed);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  // Copy plain text to clipboard
  const handleCopy = async (index: number, text: string) => {
    const cleanText = getCopyableText(text);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(cleanText);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch (copyErr) {
      console.warn("[ChatPanel] Clipboard write failed:", copyErr);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col justify-between bg-card text-foreground">
      
      {/* ── Chat Messages Container ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          const isEditingThis = editingIndex === idx;
          const isCopiedThis = copiedIndex === idx;

          return (
            <div
              key={idx}
              className={`group flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-cyan-500/20 text-primary ring-1 ring-cyan-500/30">
                  <Bot className="size-4" />
                </span>
              )}

              <div
                className={`relative max-w-[88%] sm:max-w-[84%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 transition-all ${
                  isUser
                    ? "bg-primary text-primary-foreground font-medium rounded-br-sm shadow-md"
                    : "bg-muted/40 text-foreground border border-border/60 rounded-bl-sm shadow-sm"
                }`}
              >
                {/* ── INLINE EDIT MODE (User Messages) ── */}
                {isUser && isEditingThis ? (
                  <div className="space-y-3 min-w-[240px] sm:min-w-[320px]">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary-foreground/90">
                      <Pencil className="size-3" />
                      <span>Edit message:</span>
                    </div>

                    <textarea
                      ref={editTextareaRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveEdit(idx);
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      rows={3}
                      className="w-full rounded-xl border border-white/30 bg-black/30 p-2.5 text-xs text-white placeholder:text-white/50 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/40"
                    />

                    <div className="flex items-center justify-end gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-lg border border-white/20 bg-black/20 px-2.5 py-1 font-mono text-white/80 transition-colors hover:bg-black/40 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(idx)}
                        disabled={!editText.trim() || loading}
                        className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 font-mono font-bold text-primary transition-all hover:bg-white/90 disabled:opacity-50"
                      >
                        <Check className="size-3" />
                        <span>Save &amp; Submit</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Attached File Inside Bubble */}
                    {m.attachment && (
                      <div
                        className={`flex items-center gap-2 rounded-xl p-2.5 text-[11px] font-mono border ${
                          isUser
                            ? "bg-black/20 border-white/20 text-primary-foreground"
                            : "bg-card border-border/50 text-foreground"
                        }`}
                      >
                        {m.attachment.type.startsWith("image/") ? (
                          <ImageIcon className="size-4 shrink-0 text-primary" />
                        ) : (
                          <FileText className="size-4 shrink-0 text-amber-500 dark:text-amber-400" />
                        )}
                        <span className="truncate font-bold">{m.attachment.name}</span>
                        <span className="text-[10px] opacity-80">
                          ({Math.round(m.attachment.size / 1024)} KB)
                        </span>
                      </div>
                    )}

                    {/* Message Text & Flowchart Segments */}
                    {isUser ? (
                      <div dir="auto" className="whitespace-pre-wrap leading-relaxed">
                        {renderText(m.text)}
                      </div>
                    ) : (
                      <div dir="auto" className="space-y-3">
                        {parseMessageSegments(m.text).map((segment, segIdx) =>
                          segment.type === "mermaid" ? (
                            <MermaidDiagram key={segIdx} chart={segment.content} />
                          ) : (
                            <AiMarkdownContent key={segIdx} content={segment.content} />
                          ),
                        )}
                      </div>
                    )}

                    {/* Footer Row: Timestamp, Copy Button & Edit Button */}
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/20 text-[10px] font-mono">
                      {/* Left action (Copy button for Assistant) */}
                      {!isUser ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(idx, m.text)}
                          title="Copy message text"
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground opacity-80 group-hover:opacity-100"
                        >
                          {isCopiedThis ? (
                            <>
                              <Check className="size-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div />
                      )}

                      {/* Right action (Timestamp and Edit button for User) */}
                      <div className="flex items-center gap-2">
                        {m.timestamp && (
                          <span
                            className={
                              isUser ? "text-primary-foreground/75" : "text-muted-foreground"
                            }
                          >
                            {m.timestamp}
                          </span>
                        )}

                        {/* Edit Button for User Messages */}
                        {isUser && !loading && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndex(idx);
                              setEditText(m.text);
                            }}
                            title="Edit message & regenerate response"
                            className="flex items-center gap-1 rounded-md bg-black/20 px-1.5 py-0.5 text-white/80 transition-all hover:bg-black/40 hover:text-white opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="size-2.5" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isUser && (
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
                  <User className="size-4" />
                </span>
              )}
            </div>
          );
        })}

        {/* Thinking / Typing Indicator */}
        {loading && (
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-cyan-500/20 text-primary ring-1 ring-cyan-500/30">
              <Bot className="size-4" />
            </span>
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground shadow-sm">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Analyzing fraud telemetry &amp; generating response…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick Prompt Suggestions ── */}
      <div className="border-t border-border/40 bg-muted/15 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Suggested Investigative Queries:
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => send(sug)}
              className="rounded-xl border border-border/60 bg-card/70 px-3 py-1.5 text-[11px] text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary shadow-sm"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Box Container with Voice & File Attachment ── */}
      <div className="border-t border-border/40 bg-card p-4 space-y-2">
        
        {/* Error Alert */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)}>
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Attached File Preview Chip (Before sending) */}
        {attachedFile && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-mono text-primary shadow-sm">
            {attachedFile.type.startsWith("image/") ? (
              <ImageIcon className="size-3.5 text-cyan-400" />
            ) : (
              <FileText className="size-3.5 text-amber-400" />
            )}
            <span className="font-bold truncate max-w-xs">{attachedFile.name}</span>
            <span className="text-[10px] opacity-75">
              ({Math.round(attachedFile.size / 1024)} KB)
            </span>
            <button
              onClick={removeAttachedFile}
              className="ml-1 text-muted-foreground hover:text-rose-400"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Recording Wave Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 animate-pulse">
            <span className="size-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-bold">Listening via Web Speech API… Speak now</span>
          </div>
        )}

        {/* Main Input Row */}
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/25 p-2 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/40 transition-all shadow-sm">
          
          {/* File Upload Button (Hidden input) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Evidence (Screenshot / Transaction PDF)"
            className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/60 hover:text-primary"
          >
            <Paperclip className="size-4" />
          </button>

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            title={
              speechSupported
                ? isRecording
                ? "Stop Recording"
                : "Dictate via Voice"
                : "Voice input unsupported in this browser"
            }
            className={`grid size-9 place-items-center rounded-xl transition-all ${
              isRecording
                ? "bg-rose-500 text-white shadow-[0_0_15px_#f43f5e] animate-pulse"
                : "text-muted-foreground hover:bg-muted/60 hover:text-primary"
            }`}
          >
            {isRecording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              isRecording
                ? "Listening..."
                : prediction
                ? `Ask CipherTrace AI about ${prediction.zoneName}…`
                : "Ask about ATM clusters, 1930 freeze notices, or fraud patterns…"
            }
            disabled={loading}
            className="flex-1 bg-transparent px-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => send(input)}
            disabled={(!input.trim() && !attachedFile) || loading}
            className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
