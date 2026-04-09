<template>
  <div class="h-full flex bg-white">
    <!-- Tree pane -->
    <div
      class="w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto p-2 bg-gray-50"
    >
      <div v-if="treeError" class="p-2 text-xs text-red-600">
        {{ treeError }}
      </div>
      <div v-else-if="!tree" class="p-2 text-xs text-gray-400">Loading...</div>
      <FileTree
        v-else
        :node="tree"
        :selected-path="selectedPath"
        :recent-paths="recentPaths"
        @select="selectFile"
      />
    </div>
    <!-- Content pane -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div
        v-if="selectedPath"
        class="px-4 py-2 border-b border-gray-200 text-xs text-gray-500 font-mono shrink-0 flex items-center gap-2"
      >
        <span class="truncate">{{ selectedPath }}</span>
        <span v-if="content" class="text-gray-400 shrink-0"
          >· {{ formatBytes(content.size) }}</span
        >
        <span v-if="content?.modifiedMs" class="text-gray-400 shrink-0"
          >· {{ formatTime(content.modifiedMs) }}</span
        >
      </div>
      <div class="flex-1 overflow-auto min-h-0">
        <div
          v-if="!selectedPath"
          class="h-full flex items-center justify-center text-gray-400 text-sm"
        >
          Select a file
        </div>
        <div v-else-if="contentError" class="p-4 text-sm text-red-600">
          {{ contentError }}
        </div>
        <div v-else-if="contentLoading" class="p-4 text-sm text-gray-400">
          Loading...
        </div>
        <template v-else-if="content">
          <template v-if="content.kind === 'text'">
            <!-- Markdown: use the same renderer as chat responses -->
            <div v-if="isMarkdown" class="h-full">
              <TextResponseView
                :selected-result="markdownResult(content.content)"
              />
            </div>
            <!-- HTML: sandboxed iframe preview (scripts disabled) -->
            <iframe
              v-else-if="isHtml"
              :srcdoc="content.content"
              class="w-full h-full border-0"
              sandbox=""
              title="HTML preview"
            />
            <!-- JSON: pretty-printed with simple syntax coloring. Fall
                 back to raw content if the file is malformed. -->
            <pre
              v-else-if="isJson"
              class="p-4 text-xs whitespace-pre-wrap font-mono text-gray-800"
            ><span
              v-for="(tok, i) in jsonTokens"
              :key="i"
              :class="JSON_TOKEN_CLASS[tok.type]"
            >{{ tok.value }}</span></pre>
            <!-- Plain text fallback -->
            <pre
              v-else
              class="p-4 text-xs whitespace-pre-wrap font-mono text-gray-800"
              >{{ content.content }}</pre
            >
          </template>
          <!-- Image -->
          <div
            v-else-if="content.kind === 'image'"
            class="h-full flex items-center justify-center p-4"
          >
            <img
              :src="rawUrl(selectedPath)"
              :alt="selectedPath"
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <!-- PDF -->
          <iframe
            v-else-if="content.kind === 'pdf'"
            :src="rawUrl(selectedPath)"
            class="w-full h-full border-0"
            title="PDF preview"
          />
          <!-- Binary or too-large -->
          <div v-else class="p-4 text-sm text-gray-500">
            {{ content.message }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import FileTree, { type TreeNode } from "./FileTree.vue";
import TextResponseView from "../plugins/textResponse/View.vue";
import type { ToolResultComplete } from "gui-chat-protocol/vue";
import type { TextResponseData } from "@gui-chat-plugin/text-response";

const STORAGE_KEY = "files_selected_path";
const RECENT_THRESHOLD_MS = 60 * 1000;

interface TextContent {
  kind: "text";
  path: string;
  content: string;
  size: number;
  modifiedMs: number;
}

interface MetaContent {
  kind: "image" | "pdf" | "binary" | "too-large";
  path: string;
  size: number;
  modifiedMs: number;
  message?: string;
}

type FileContent = TextContent | MetaContent;

const props = defineProps<{
  refreshToken?: number;
}>();

const tree = ref<TreeNode | null>(null);
const treeError = ref<string | null>(null);
const selectedPath = ref<string | null>(null);

const content = ref<FileContent | null>(null);
const contentLoading = ref(false);
const contentError = ref<string | null>(null);

function hasExt(filePath: string | null, exts: string[]): boolean {
  if (!filePath) return false;
  const lower = filePath.toLowerCase();
  return exts.some((ext) => lower.endsWith(ext));
}

const isMarkdown = computed(() =>
  hasExt(selectedPath.value, [".md", ".markdown"]),
);
const isHtml = computed(() => hasExt(selectedPath.value, [".html", ".htm"]));
const isJson = computed(() => hasExt(selectedPath.value, [".json"]));

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    // Malformed JSON — show the raw text so the user can still read it
    return raw;
  }
}

type JsonTokenType =
  | "key"
  | "string"
  | "number"
  | "keyword"
  | "punct"
  | "whitespace";

interface JsonToken {
  type: JsonTokenType;
  value: string;
}

const JSON_TOKEN_CLASS: Record<JsonTokenType, string> = {
  key: "text-blue-700",
  string: "text-green-700",
  number: "text-orange-600",
  keyword: "text-purple-700",
  punct: "text-gray-500",
  whitespace: "",
};

// Regex splits a JSON document into recognisable tokens. Strings are
// matched before numbers/keywords so escaped quotes inside strings
// stay together. Anything that doesn't match (syntax errors, stray
// chars) is emitted as a "punct" token so the user still sees it.
const JSON_TOKEN_RE =
  /("(?:[^"\\]|\\.)*")|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\s+)|([{}[\]:,])/g;

function tokenizeJson(raw: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  JSON_TOKEN_RE.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null = JSON_TOKEN_RE.exec(raw);
  while (match !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "punct", value: raw.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined)
      tokens.push({ type: "string", value: match[1] });
    else if (match[2] !== undefined)
      tokens.push({ type: "keyword", value: match[2] });
    else if (match[3] !== undefined)
      tokens.push({ type: "number", value: match[3] });
    else if (match[4] !== undefined)
      tokens.push({ type: "whitespace", value: match[4] });
    else if (match[5] !== undefined)
      tokens.push({ type: "punct", value: match[5] });
    lastIndex = JSON_TOKEN_RE.lastIndex;
    match = JSON_TOKEN_RE.exec(raw);
  }
  if (lastIndex < raw.length) {
    tokens.push({ type: "punct", value: raw.slice(lastIndex) });
  }
  // A string that precedes ":" (skipping whitespace) is an object key.
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== "string") continue;
    let j = i + 1;
    while (j < tokens.length && tokens[j].type === "whitespace") j++;
    if (
      j < tokens.length &&
      tokens[j].type === "punct" &&
      tokens[j].value === ":"
    ) {
      tokens[i] = { type: "key", value: tokens[i].value };
    }
  }
  return tokens;
}

const jsonTokens = computed(() => {
  if (!content.value || content.value.kind !== "text") return [];
  return tokenizeJson(prettyJson(content.value.content));
});

function markdownResult(text: string): ToolResultComplete<TextResponseData> {
  return {
    uuid: "files-preview",
    toolName: "text-response",
    message: text,
    title: selectedPath.value ?? "",
    // role: "user" hides the PDF download button in TextResponseView
    data: { text, role: "user", transportKind: "text-rest" },
  };
}

const recentPaths = computed(() => {
  const set = new Set<string>();
  const now = Date.now();
  function visit(node: TreeNode) {
    if (
      node.type === "file" &&
      node.modifiedMs &&
      now - node.modifiedMs < RECENT_THRESHOLD_MS
    ) {
      set.add(node.path);
    }
    if (node.children) node.children.forEach(visit);
  }
  if (tree.value) visit(tree.value);
  return set;
});

function rawUrl(filePath: string): string {
  return `/api/files/raw?path=${encodeURIComponent(filePath)}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadTree(): Promise<void> {
  treeError.value = null;
  try {
    const res = await fetch("/api/files/tree");
    if (!res.ok) throw new Error(`tree: ${res.status}`);
    tree.value = await res.json();
  } catch (err) {
    treeError.value = err instanceof Error ? err.message : String(err);
  }
}

// Tracks the currently in-flight content fetch so a stale response from
// a previously-clicked file can't overwrite the latest selection.
let contentAbort: AbortController | null = null;

async function loadContent(filePath: string): Promise<void> {
  contentAbort?.abort();
  const controller = new AbortController();
  contentAbort = controller;

  contentLoading.value = true;
  contentError.value = null;
  content.value = null;
  try {
    const res = await fetch(
      `/api/files/content?path=${encodeURIComponent(filePath)}`,
      { signal: controller.signal },
    );
    if (controller.signal.aborted) return;
    if (!res.ok) {
      const errBody: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(errBody.error ?? `HTTP ${res.status}`);
    }
    const body: FileContent = await res.json();
    if (controller.signal.aborted) return;
    content.value = body;
  } catch (err) {
    if (controller.signal.aborted) return;
    if (err instanceof DOMException && err.name === "AbortError") return;
    contentError.value = err instanceof Error ? err.message : String(err);
  } finally {
    if (contentAbort === controller) {
      contentLoading.value = false;
      contentAbort = null;
    }
  }
}

function selectFile(filePath: string): void {
  selectedPath.value = filePath;
  localStorage.setItem(STORAGE_KEY, filePath);
  loadContent(filePath);
}

watch(
  () => props.refreshToken,
  () => {
    loadTree();
    if (selectedPath.value) loadContent(selectedPath.value);
  },
);

onMounted(async () => {
  await loadTree();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) selectFile(saved);
});

onUnmounted(() => {
  contentAbort?.abort();
});
</script>
