<script setup lang="ts">
import { ref } from "vue";
import { useNotifications } from "../composables/useNotifications";
import { NOTIFICATION_ICONS } from "../types/notification";
import type { NotificationPayload } from "../types/notification";

const { notifications, unreadCount, markAllRead, dismiss } = useNotifications();
const open = ref(false);

const emit = defineEmits<{
  navigate: [action: NotificationPayload["action"]];
}>();

function toggle(): void {
  open.value = !open.value;
  if (open.value) markAllRead();
}

function close(): void {
  open.value = false;
}

function iconName(n: NotificationPayload): string {
  return n.icon ?? NOTIFICATION_ICONS[n.kind] ?? "notifications";
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function handleClick(n: NotificationPayload): void {
  if (n.action.type === "navigate") {
    emit("navigate", n.action);
    close();
  }
}

function handleDismiss(e: Event, id: string): void {
  e.stopPropagation();
  dismiss(id);
}
</script>

<template>
  <div class="relative">
    <!-- Bell button -->
    <button
      class="relative p-1.5 rounded hover:bg-gray-100"
      data-testid="notification-bell"
      aria-label="Notifications"
      @click="toggle"
    >
      <span class="material-icons text-xl text-gray-500">notifications</span>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1"
        data-testid="notification-badge"
      >
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </button>

    <!-- Dropdown panel -->
    <div
      v-if="open"
      class="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-xl border border-gray-200 bg-white z-50"
      data-testid="notification-panel"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-2 border-b border-gray-100"
      >
        <span class="text-sm font-semibold text-gray-700">Notifications</span>
        <button
          class="text-xs text-blue-500 hover:text-blue-700"
          @click="markAllRead"
        >
          Mark all read
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="notifications.length === 0"
        class="py-8 text-center text-sm text-gray-400"
      >
        No notifications
      </div>

      <!-- Items -->
      <div v-else>
        <div
          v-for="n in notifications"
          :key="n.id"
          class="flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
          :data-testid="`notification-item-${n.id}`"
          @click="handleClick(n)"
        >
          <span
            class="material-icons text-lg mt-0.5 shrink-0"
            :class="n.priority === 'high' ? 'text-red-500' : 'text-gray-400'"
          >
            {{ iconName(n) }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-800 truncate">{{ n.title }}</p>
            <p v-if="n.body" class="text-xs text-gray-500 truncate mt-0.5">
              {{ n.body }}
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ formatTime(n.firedAt) }}
            </p>
          </div>
          <button
            class="text-gray-300 hover:text-gray-500 shrink-0 mt-0.5"
            aria-label="Dismiss"
            @click="handleDismiss($event, n.id)"
          >
            <span class="material-icons text-sm">close</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
