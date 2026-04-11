<template>
  <div class="text-center p-4 bg-purple-100 rounded">
    <div class="text-purple-600 font-medium">Document</div>
    <div class="text-sm text-gray-800 mt-1 font-medium truncate">
      {{ displayTitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ToolResult } from "gui-chat-protocol";
import type { MarkdownToolData } from "./definition";

const props = defineProps<{
  result: ToolResult<MarkdownToolData>;
}>();

const displayTitle = computed(() => {
  // Use the title from the result if available
  if (props.result.title) {
    return props.result.title;
  }

  // Otherwise extract first # heading from markdown
  if (props.result.data?.markdown) {
    const match = props.result.data.markdown.match(/^#\s+(.+)$/m);
    if (match) {
      return match[1];
    }
  }

  return "Markdown Document";
});
</script>
