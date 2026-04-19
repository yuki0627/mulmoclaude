// Web-side subscriber for the `notifications` pub-sub channel.
// Stores incoming NotificationPayloads for the bell badge + panel.

import { onUnmounted, ref, computed, type Ref, type ComputedRef } from "vue";
import { PUBSUB_CHANNELS } from "../config/pubsubChannels";
import { usePubSub } from "./usePubSub";
import type { NotificationPayload } from "../types/notification";

const MAX_RECENT = 50;

function isNotificationPayload(value: unknown): value is NotificationPayload {
  if (value === null || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.kind === "string" &&
    typeof v.title === "string" &&
    typeof v.firedAt === "string"
  );
}

// Module-level state so all components share the same list.
const notifications = ref<NotificationPayload[]>([]);
const readAt = ref<string | null>(null);

export function useNotifications(): {
  notifications: Ref<NotificationPayload[]>;
  latest: ComputedRef<NotificationPayload | null>;
  unreadCount: ComputedRef<number>;
  markAllRead: () => void;
  dismiss: (id: string) => void;
} {
  const { subscribe } = usePubSub();
  const unsubscribe = subscribe(PUBSUB_CHANNELS.notifications, (data) => {
    if (!isNotificationPayload(data)) return;
    notifications.value = [data, ...notifications.value].slice(0, MAX_RECENT);
  });

  onUnmounted(() => {
    unsubscribe();
  });

  const latest = computed(() => notifications.value[0] ?? null);

  const unreadCount = computed(() => {
    if (!readAt.value) return notifications.value.length;
    return notifications.value.filter((n) => n.firedAt > readAt.value!).length;
  });

  function markAllRead(): void {
    if (notifications.value.length > 0) {
      readAt.value = notifications.value[0].firedAt;
    }
  }

  function dismiss(id: string): void {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  return { notifications, latest, unreadCount, markAllRead, dismiss };
}
