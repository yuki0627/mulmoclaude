// Keep in-memory session state in sync with the server via pub/sub.
// Subscribes to the global `sessions` channel and refetches summaries
// whenever any session's state changes. Also provides markSessionRead
// for clearing the unread flag on the server.

import type { Ref } from "vue";
import type { ActiveSession, SessionSummary } from "../types/session";
import { usePubSub } from "./usePubSub";
import { PUBSUB_CHANNELS } from "../config/pubsubChannels";
import { apiPost } from "../utils/api";
import { API_ROUTES } from "../config/apiRoutes";

export function useSessionSync(opts: {
  sessionMap: Map<string, ActiveSession>;
  currentSessionId: Ref<string>;
  fetchSessions: () => Promise<SessionSummary[]>;
}) {
  const { sessionMap, currentSessionId, fetchSessions } = opts;
  const { subscribe } = usePubSub();

  async function refreshSessionStates(): Promise<void> {
    const summaries = await fetchSessions();
    for (const s of summaries) {
      const live = sessionMap.get(s.id);
      if (!live) continue;
      live.isRunning = s.isRunning ?? false;
      live.statusMessage = s.statusMessage ?? "";
      const unread = s.hasUnread ?? false;
      if (!(unread && s.id === currentSessionId.value)) {
        live.hasUnread = unread;
      }
    }
  }

  async function markSessionRead(id: string): Promise<void> {
    const result = await apiPost<{ ok: boolean }>(
      API_ROUTES.sessions.markRead.replace(":id", encodeURIComponent(id)),
    );
    if (!result.ok || result.data.ok === false) {
      await refreshSessionStates();
    }
  }

  subscribe(PUBSUB_CHANNELS.sessions, () => {
    refreshSessionStates();
  });

  return { refreshSessionStates, markSessionRead };
}
