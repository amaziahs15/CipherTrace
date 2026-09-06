// ─── Chat Conversation Storage & History Management (LocalStorage) ─────────
import { type AttachedFile, type ChatMessage } from "@/components/ChatPanel";

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = "ciphertrace_chat_history_v1";
const ACTIVE_ID_KEY = "ciphertrace_active_chat_id_v1";

export const DEFAULT_INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  text: "Greetings, Officer / Citizen. I am **CipherTrace AI**, your predictive fraud intelligence assistant. You can ask me about ATM hotspot extraction patterns, generate investigation flowcharts, draft emergency 1930 bank freeze notices, attach transaction evidence, or dictate queries via voice.",
  timestamp: "Just now",
};

/**
 * Creates a brand new conversation session
 */
export function createNewConversation(title?: string): ChatConversation {
  const now = Date.now();
  const id = `conv_${now}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    title: title || "New Investigation",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        ...DEFAULT_INITIAL_MESSAGE,
        timestamp: new Date(now).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ],
  };
}

/**
 * Load all stored conversations from localStorage
 */
export function getStoredConversations(): ChatConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createNewConversation("ATM Hotspot Analysis");
      saveStoredConversations([initial]);
      return [initial];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    const initial = createNewConversation("ATM Hotspot Analysis");
    saveStoredConversations([initial]);
    return [initial];
  } catch (err) {
    console.warn("[ChatHistory] Failed to read localStorage:", err);
    return [];
  }
}

/**
 * Save conversations list to localStorage
 */
export function saveStoredConversations(conversations: ChatConversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.warn("[ChatHistory] Failed to write localStorage:", err);
  }
}

/**
 * Get active conversation ID from localStorage
 */
export function getStoredActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_ID_KEY);
}

/**
 * Set active conversation ID in localStorage
 */
export function setStoredActiveConversationId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

/**
 * Auto-generate a descriptive conversation title from the first user query
 */
export function deriveTitleFromFirstMessage(text: string): string {
  if (!text) return "New Investigation";
  // Strip evidence prefix if present
  let clean = text.replace(/^\[Attached Evidence[^\]]*\]\.\s*/i, "").trim();
  // Strip markdown code fences
  clean = clean.replace(/```[\s\S]*?```/g, "").trim();
  // Remove markdown bold
  clean = clean.replace(/\*\*/g, "").trim();

  if (clean.length <= 38) return clean || "New Investigation";
  return clean.slice(0, 36).trim() + "…";
}

/**
 * Formats a timestamp into human-readable relative string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats full conversation history into a shareable plain text transcript
 */
export function generateShareableTranscript(conversation: ChatConversation): string {
  const dateStr = new Date(conversation.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines: string[] = [
    "==================================================================",
    "  CIPHERTRACE · AI CYBERCRIME INTELLIGENCE CHAT TRANSCRIPT",
    "==================================================================",
    `Case Topic:  ${conversation.title}`,
    `Recorded On: ${dateStr}`,
    `Total Logs:  ${conversation.messages.length} messages`,
    "==================================================================\n",
  ];

  for (const msg of conversation.messages) {
    const sender = msg.role === "user" ? "OFFICER / CITIZEN" : "CIPHERTRACE AI ASSISTANT";
    const time = msg.timestamp || "";
    lines.push(`[${sender}]  ${time ? `(${time})` : ""}`);

    if (msg.attachment) {
      lines.push(`[Attached Evidence: ${msg.attachment.name} (${Math.round(msg.attachment.size / 1024)} KB)]`);
    }

    // Clean text: if contains mermaid diagrams, provide a note
    let content = msg.text;
    if (content.includes("```mermaid")) {
      content = content.replace(/```mermaid[\s\S]*?```/gi, "[Visual Investigation Flowchart Diagram]");
    }

    lines.push(content);
    lines.push("\n------------------------------------------------------------------\n");
  }

  lines.push("End of Transcript · Generated by CipherTrace Multi-Agency Network");
  return lines.join("\n");
}
