<template>
  <div class="text-sm">
    <div class="font-medium text-gray-700 truncate mb-1">
      {{ title }}
    </div>
    <div v-if="hint" class="text-xs text-gray-500 leading-relaxed truncate">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ToolResultComplete } from "gui-chat-protocol/vue";
import type { PresentHtmlData } from "./index";

const props = defineProps<{ result: ToolResultComplete<PresentHtmlData> }>();

const data = computed(() => props.result.data);
const title = computed(() => data.value?.title ?? "HTML Page");
const hint = computed(() => {
  const raw = data.value?.html ?? "";
  const stripped = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.slice(0, 60);
});
</script>
