<template>
  <div class="text-sm">
    <div class="font-medium text-gray-700 truncate mb-1">
      {{ title }}
    </div>
    <div class="text-xs text-gray-500 mb-1">
      {{ beats.length }} beat{{ beats.length !== 1 ? "s" : "" }}
    </div>
    <div class="flex flex-wrap gap-1">
      <span
        v-for="(count, type) in typeCounts"
        :key="type"
        class="text-xs px-1.5 py-0.5 rounded-full"
        :class="badgeClass(type)"
      >
        {{ count }}× {{ type }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ToolResultComplete } from "gui-chat-protocol/vue";
import type { MulmoScriptData } from "./index";

const props = defineProps<{ result: ToolResultComplete }>();

const data = computed(() => props.result.data as MulmoScriptData | undefined);
const script = computed(
  () => (data.value?.script ?? {}) as Record<string, unknown>,
);
const title = computed(
  () =>
    (script.value.title as string) ||
    data.value?.filePath?.split("/").pop() ||
    "MulmoScript",
);
const beats = computed(
  () => (script.value.beats as { image?: { type?: string } }[]) ?? [],
);

const typeCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const beat of beats.value) {
    const t = beat.image?.type ?? "none";
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return counts;
});

const TYPE_BADGE: Record<string, string> = {
  markdown: "bg-blue-100 text-blue-700",
  textSlide: "bg-green-100 text-green-700",
  imagePrompt: "bg-purple-100 text-purple-700",
  moviePrompt: "bg-orange-100 text-orange-700",
  mermaid: "bg-teal-100 text-teal-700",
  chart: "bg-yellow-100 text-yellow-700",
  html_tailwind: "bg-pink-100 text-pink-700",
};

function badgeClass(type: string): string {
  return TYPE_BADGE[type] ?? "bg-gray-100 text-gray-600";
}
</script>
