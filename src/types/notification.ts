// Notification payload — shared by server (publish) and frontend (subscribe).

export const NOTIFICATION_KINDS = {
  todo: "todo",
  scheduler: "scheduler",
  agent: "agent",
  journal: "journal",
  push: "push",
  bridge: "bridge",
} as const;

export type NotificationKind =
  (typeof NOTIFICATION_KINDS)[keyof typeof NOTIFICATION_KINDS];

export const NOTIFICATION_ICONS: Record<NotificationKind, string> = {
  todo: "check_circle",
  scheduler: "event",
  agent: "smart_toy",
  journal: "auto_stories",
  push: "notifications",
  bridge: "chat",
};

export type NotificationAction =
  | {
      type: "navigate";
      view: "todos" | "scheduler" | "files" | "chat";
      path?: string;
      sessionId?: string;
      itemId?: string;
    }
  | { type: "none" };

export type NotificationPriority = "normal" | "high";

export interface NotificationPayload {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  icon?: string;
  action: NotificationAction;
  firedAt: string;
  priority: NotificationPriority;
  sessionId?: string;
  transportId?: string;
}
