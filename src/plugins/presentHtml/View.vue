<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div
      class="px-4 py-2 border-b border-gray-100 shrink-0 flex items-center justify-between"
    >
      <span class="text-sm font-medium text-gray-700 truncate">{{
        title ?? "HTML Page"
      }}</span>
      <button
        class="ml-3 px-2 py-1 text-xs rounded border border-gray-300 text-gray-500 hover:bg-gray-50 shrink-0"
        @click="sourceOpen = !sourceOpen"
      >
        {{ sourceOpen ? "Hide Source <>" : "Show Source <>" }}
      </button>
    </div>
    <div v-if="sourceOpen" class="border-b border-gray-100 shrink-0">
      <textarea
        :value="html"
        readonly
        class="w-full text-xs text-gray-600 bg-gray-50 p-3 font-mono resize-none outline-none"
        rows="16"
      />
    </div>
    <iframe
      :srcdoc="html"
      sandbox="allow-scripts allow-same-origin"
      class="flex-1 w-full border-0"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ToolResultComplete } from "gui-chat-protocol/vue";
import type { PresentHtmlData } from "./index";

const props = defineProps<{
  selectedResult: ToolResultComplete<PresentHtmlData>;
}>();

const data = computed(() => props.selectedResult.data);
const html = computed(() => data.value?.html ?? "");
const title = computed(() => data.value?.title);

const sourceOpen = ref(false);
</script>
