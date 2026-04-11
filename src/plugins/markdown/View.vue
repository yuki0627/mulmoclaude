<template>
  <div class="markdown-container">
    <div
      v-if="!selectedResult.data?.markdown"
      class="min-h-full p-8 flex items-center justify-center"
    >
      <div class="text-gray-500">No markdown content available</div>
    </div>
    <template v-else>
      <div class="markdown-content-wrapper">
        <div class="p-4">
          <div class="header-row">
            <h1 class="document-title">
              {{ selectedResult.title || "Document" }}
            </h1>
            <div class="button-group">
              <button
                @click="downloadMarkdown"
                class="download-btn download-btn-green"
              >
                <span class="material-icons">download</span>
                MD
              </button>
            </div>
          </div>
          <div
            class="markdown-content prose prose-slate max-w-none"
            v-html="renderedHtml"
          ></div>
        </div>
      </div>

      <details class="markdown-source">
        <summary>Edit Markdown Source</summary>
        <textarea
          v-model="editableMarkdown"
          class="markdown-editor"
          spellcheck="false"
        ></textarea>
        <button
          @click="applyMarkdown"
          class="apply-btn"
          :disabled="!hasChanges"
        >
          Apply Changes
        </button>
      </details>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { marked } from "marked";
import type { ToolResult } from "gui-chat-protocol";
import type { MarkdownToolData } from "./definition";

const props = defineProps<{
  selectedResult: ToolResult<MarkdownToolData>;
}>();

const emit = defineEmits<{
  updateResult: [result: ToolResult<MarkdownToolData>];
}>();

const editableMarkdown = ref(props.selectedResult.data?.markdown || "");

// Check if markdown has been modified
const hasChanges = computed(() => {
  return editableMarkdown.value !== props.selectedResult.data?.markdown;
});

const renderedHtml = computed(() => {
  if (!props.selectedResult.data?.markdown) {
    console.error("No markdown data in result:", props.selectedResult);
    return "";
  }
  return marked(props.selectedResult.data.markdown);
});

// Watch for scroll requests from viewState
watch(
  () => props.selectedResult?.viewState?.scrollToAnchor as string | undefined,
  (anchorId) => {
    if (!anchorId) return;

    // Use nextTick to ensure the DOM is updated
    nextTick(() => {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        console.warn(`Anchor element with id "${anchorId}" not found`);
      }
    });
  },
);

const downloadMarkdown = () => {
  if (!props.selectedResult?.data?.markdown) return;

  const blob = new Blob([props.selectedResult.data.markdown], {
    type: "text/markdown",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const hint = props.selectedResult.data?.filenameHint;
  const filename = hint
    ? `${hint.replace(/[/\\:*?"<>|]/g, "_")}.md`
    : props.selectedResult.title
      ? `${props.selectedResult.title.replace(/[/\\:*?"<>|]/g, "_")}.md`
      : "document.md";
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function applyMarkdown() {
  // Update the result with new markdown content
  const updatedResult: ToolResult<MarkdownToolData> = {
    ...props.selectedResult,
    data: {
      ...props.selectedResult.data,
      markdown: editableMarkdown.value,
      // Reset pdfPath since markdown has changed
      pdfPath: undefined,
    },
  };

  emit("updateResult", updatedResult);
}

// Watch for external changes to selectedResult (when user clicks different result)
watch(
  () => props.selectedResult.data?.markdown,
  (newMarkdown) => {
    editableMarkdown.value = newMarkdown || "";
  },
);
</script>

<style scoped>
.markdown-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.markdown-content-wrapper {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1em;
}

.document-title {
  font-size: 2em;
  margin: 0;
}

.button-group {
  display: flex;
  gap: 0.5em;
}

.download-btn {
  padding: 0.5em 1em;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.download-btn-green {
  background-color: #4caf50;
}

.download-btn .material-icons {
  font-size: 1.2em;
}

.markdown-content :deep(h1) {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(h2) {
  font-size: 1.75rem;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(h3) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(h4) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(h5) {
  font-size: 1.125rem;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(h6) {
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-source {
  padding: 0.5rem;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  font-family: monospace;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.markdown-source summary {
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;
  background: #e8e8e8;
  border-radius: 4px;
  font-weight: 500;
  color: #333;
}

.markdown-source[open] summary {
  margin-bottom: 0.5rem;
}

.markdown-source summary:hover {
  background: #d8d8d8;
}

.markdown-editor {
  width: 100%;
  height: 40vh;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333;
  font-family: "Courier New", monospace;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.markdown-editor:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.apply-btn {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  font-weight: 500;
}

.apply-btn:hover {
  background: #45a049;
}

.apply-btn:active {
  background: #3d8b40;
}

.apply-btn:disabled {
  background: #cccccc;
  color: #666666;
  cursor: not-allowed;
  opacity: 0.6;
}

.apply-btn:disabled:hover {
  background: #cccccc;
}
</style>
