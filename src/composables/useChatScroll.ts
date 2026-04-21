// Auto-scroll the sidebar chat list to the bottom when new results
// arrive or a run starts. Also re-focuses the chat input when a run
// finishes.

import { computed, nextTick, watch, type ComputedRef, type Ref } from "vue";
import type { ToolResultComplete } from "gui-chat-protocol/vue";

export function useChatScroll(opts: {
  toolResultsPanelRef: Ref<{ root: HTMLDivElement | null } | null>;
  toolResults: ComputedRef<ToolResultComplete[]>;
  isRunning: ComputedRef<boolean>;
  chatInputRef: Ref<{ focus: () => void } | null>;
}) {
  const { toolResultsPanelRef, toolResults, isRunning, chatInputRef } = opts;

  const chatListRef = computed(() => toolResultsPanelRef.value?.root ?? null);
  const toolResultsLength = computed(() => toolResults.value.length);

  function scrollChatToBottom(): void {
    nextTick(() => {
      if (chatListRef.value) {
        chatListRef.value.scrollTop = chatListRef.value.scrollHeight;
      }
    });
  }

  function focusChatInput(): void {
    chatInputRef.value?.focus();
  }

  watch(toolResultsLength, scrollChatToBottom);
  watch(isRunning, (running) => {
    if (running) {
      scrollChatToBottom();
    } else {
      nextTick(() => focusChatInput());
    }
  });

  return { scrollChatToBottom, focusChatInput };
}
