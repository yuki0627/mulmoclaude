// Server-side session state store. Replaces the lightweight
// `server/sessions.ts` SSE-send registry with a pub/sub-backed
// store that holds authoritative state per chat session. Multiple
// clients can subscribe to the same session channel and receive
// identical events.

import { appendFile } from "fs/promises";
import type { IPubSub } from "../pub-sub/index.js";
import { log } from "../logger/index.js";

// ── Types ──────────────────────────────────────────────────────

export interface ToolCallHistoryItem {
  toolUseId: string;
  toolName: string;
  args: unknown;
  timestamp: number;
  result?: string;
  error?: string;
}

export interface ServerSession {
  chatSessionId: string;
  roleId: string;
  isRunning: boolean;
  hasUnread: boolean;
  statusMessage: string;
  toolCallHistory: ToolCallHistoryItem[];
  resultsFilePath: string;
  selectedImageData?: string;
  startedAt: string;
  updatedAt: string;
  /** Kills the spawned Claude CLI process for this session. */
  abortRun?: () => void;
}

/** Lightweight projection for the `sessions` channel. */
export interface SessionStateEvent {
  type: "session_state_changed";
  chatSessionId: string;
  roleId: string;
  isRunning: boolean;
  hasUnread: boolean;
  statusMessage: string;
  updatedAt: string;
}

/** Sent on the `sessions` channel when a session is evicted. */
export interface SessionRemovedEvent {
  type: "session_removed";
  chatSessionId: string;
}

// ── Constants ──────────────────────────────────────────────────

const IDLE_EVICTION_MS = 60 * 60 * 1000; // 1 hour
const EVICTION_CHECK_INTERVAL_MS = 5 * 60 * 1000; // check every 5 min

// ── Store ──────────────────────────────────────────────────────

const store = new Map<string, ServerSession>();
let pubsub: IPubSub | null = null;
let evictionTimer: ReturnType<typeof setInterval> | null = null;

export function initSessionStore(ps: IPubSub): void {
  pubsub = ps;
  evictionTimer = setInterval(evictIdleSessions, EVICTION_CHECK_INTERVAL_MS);
}

export function shutdownSessionStore(): void {
  if (evictionTimer) {
    clearInterval(evictionTimer);
    evictionTimer = null;
  }
  store.clear();
  pubsub = null;
}

// ── Session lifecycle ──────────────────────────────────────────

export function getSession(chatSessionId: string): ServerSession | undefined {
  return store.get(chatSessionId);
}

export function getOrCreateSession(
  chatSessionId: string,
  opts: {
    roleId: string;
    resultsFilePath: string;
    selectedImageData?: string;
    startedAt: string;
    updatedAt: string;
  },
): ServerSession {
  const existing = store.get(chatSessionId);
  if (existing) {
    existing.selectedImageData = opts.selectedImageData;
    existing.updatedAt = opts.updatedAt;
    return existing;
  }
  const session: ServerSession = {
    chatSessionId,
    roleId: opts.roleId,
    isRunning: false,
    hasUnread: false,
    statusMessage: "",
    toolCallHistory: [],
    resultsFilePath: opts.resultsFilePath,
    selectedImageData: opts.selectedImageData,
    startedAt: opts.startedAt,
    updatedAt: opts.updatedAt,
  };
  store.set(chatSessionId, session);
  return session;
}

export function removeSession(chatSessionId: string): void {
  store.delete(chatSessionId);
  publishToSessions({ type: "session_removed", chatSessionId });
}

// ── State mutations (publish to pub/sub) ───────────────────────

/** Mark a session as running. Rejects if already running (409). */
export function beginRun(chatSessionId: string, abortRun: () => void): boolean {
  const session = store.get(chatSessionId);
  if (!session) return false;
  if (session.isRunning) return false;
  session.isRunning = true;
  session.statusMessage = "";
  session.toolCallHistory = [];
  session.abortRun = abortRun;
  session.updatedAt = new Date().toISOString();
  publishStateChanged(session);
  return true;
}

/** Mark a session as finished. Sets hasUnread = true. */
export function endRun(chatSessionId: string): void {
  const session = store.get(chatSessionId);
  if (!session) return;
  session.isRunning = false;
  session.hasUnread = true;
  session.statusMessage = "";
  session.abortRun = undefined;
  session.updatedAt = new Date().toISOString();
  publishToSessionChannel(chatSessionId, { type: "session_finished" });
  publishStateChanged(session);
}

/** Cancel a running session by killing the child process. */
export function cancelRun(chatSessionId: string): boolean {
  const session = store.get(chatSessionId);
  if (!session?.isRunning || !session.abortRun) return false;
  session.abortRun();
  return true;
}

/** Clear the unread flag (called when a client views the session). */
export function markRead(chatSessionId: string): boolean {
  const session = store.get(chatSessionId);
  if (!session) return false;
  if (!session.hasUnread) return true;
  session.hasUnread = false;
  publishStateChanged(session);
  return true;
}

// ── Event publishing ───────────────────────────────────────────

/** Publish an agent event to the session's channel + update store. */
export function pushSessionEvent(
  chatSessionId: string,
  event: Record<string, unknown>,
): void {
  const session = store.get(chatSessionId);
  if (!session) return;

  const type = event.type as string;

  if (type === "tool_call") {
    session.toolCallHistory.push({
      toolUseId: event.toolUseId as string,
      toolName: event.toolName as string,
      args: event.args,
      timestamp: Date.now(),
    });
  } else if (type === "tool_call_result") {
    const entry = session.toolCallHistory.find(
      (e) => e.toolUseId === event.toolUseId,
    );
    if (entry) entry.result = event.content as string;
  } else if (type === "status") {
    session.statusMessage = event.message as string;
    publishStateChanged(session);
  }

  publishToSessionChannel(chatSessionId, event);
}

/** Push a tool_result event and persist to JSONL. */
export async function pushToolResult(
  chatSessionId: string,
  result: unknown,
): Promise<boolean> {
  const session = store.get(chatSessionId);
  if (!session) return false;

  const event = { type: "tool_result", result };
  publishToSessionChannel(chatSessionId, event);

  await appendFile(
    session.resultsFilePath,
    JSON.stringify({ source: "tool", type: "tool_result", result }) + "\n",
  );
  return true;
}

// ── Query helpers ──────────────────────────────────────────────

export function getSessionImageData(chatSessionId: string): string | undefined {
  return store.get(chatSessionId)?.selectedImageData;
}

export function getActiveSessionIds(): Set<string> {
  const ids = new Set<string>();
  for (const [id, session] of store) {
    if (session.isRunning) ids.add(id);
  }
  return ids;
}

// ── Internal helpers ───────────────────────────────────────────

function publishToSessionChannel(chatSessionId: string, data: unknown): void {
  pubsub?.publish(`session.${chatSessionId}`, data);
}

function publishToSessions(
  data: SessionStateEvent | SessionRemovedEvent,
): void {
  pubsub?.publish("sessions", data);
}

function publishStateChanged(session: ServerSession): void {
  publishToSessions(toStateEvent(session));
}

function toStateEvent(session: ServerSession): SessionStateEvent {
  return {
    type: "session_state_changed",
    chatSessionId: session.chatSessionId,
    roleId: session.roleId,
    isRunning: session.isRunning,
    hasUnread: session.hasUnread,
    statusMessage: session.statusMessage,
    updatedAt: session.updatedAt,
  };
}

function evictIdleSessions(): void {
  const now = Date.now();
  for (const [id, session] of store) {
    if (session.isRunning) continue;
    const age = now - new Date(session.updatedAt).getTime();
    if (age > IDLE_EVICTION_MS) {
      log.info("session-store", "evicting idle session", {
        chatSessionId: id,
      });
      removeSession(id);
    }
  }
}
