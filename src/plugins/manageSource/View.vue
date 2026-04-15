<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div
      class="px-4 py-2 border-b border-gray-100 shrink-0 flex items-center justify-between gap-2"
    >
      <span class="text-sm font-medium text-gray-700 truncate">
        Information sources
      </span>
      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xs text-gray-500">
          {{ sources.length }} source{{ sources.length === 1 ? "" : "s" }}
        </span>
        <button
          class="px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          :disabled="busy === 'rebuild'"
          data-testid="sources-rebuild-btn"
          @click="rebuild"
        >
          <span class="material-icons text-sm align-middle">refresh</span>
          {{ busy === "rebuild" ? "Rebuilding…" : "Rebuild now" }}
        </button>
      </div>
    </div>

    <div
      v-if="actionMessage"
      class="px-4 py-2 text-xs border-b shrink-0"
      :class="
        actionError
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-green-50 text-green-700 border-green-200'
      "
      data-testid="sources-action-message"
    >
      {{ actionMessage }}
    </div>

    <div class="flex-1 overflow-y-auto">
      <div
        v-if="sources.length === 0"
        class="flex items-center justify-center h-full p-6 text-center text-sm text-gray-500 italic"
        data-testid="sources-empty"
      >
        No sources registered yet. Ask Claude to register one — e.g. “register
        the Hacker News RSS feed”.
      </div>
      <ul v-else class="divide-y divide-gray-100 border-b border-gray-100">
        <li
          v-for="source in sources"
          :key="source.slug"
          class="px-4 py-3 flex items-start gap-3"
          :class="{
            'bg-amber-50': source.slug === highlightSlug,
          }"
          :data-testid="`source-row-${source.slug}`"
        >
          <span
            class="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 mt-0.5 shrink-0"
            :class="kindBadgeClass(source.fetcherKind)"
          >
            {{ kindLabel(source.fetcherKind) }}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2">
              <a
                :href="source.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-medium text-blue-700 hover:underline truncate"
              >
                {{ source.title }}
              </a>
              <code class="text-[11px] text-gray-400 shrink-0">
                {{ source.slug }}
              </code>
            </div>
            <div class="text-xs text-gray-500 truncate">
              {{ source.url }}
            </div>
            <div
              v-if="source.categories.length > 0"
              class="mt-1 flex flex-wrap gap-1"
            >
              <span
                v-for="cat in source.categories"
                :key="cat"
                class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
              >
                {{ cat }}
              </span>
            </div>
            <div v-if="source.notes" class="mt-1 text-xs text-gray-600 italic">
              {{ source.notes }}
            </div>
          </div>
          <button
            class="text-xs text-red-600 hover:text-red-800 shrink-0 disabled:opacity-50"
            :disabled="busy === source.slug"
            :data-testid="`source-remove-${source.slug}`"
            @click="remove(source.slug)"
          >
            {{ busy === source.slug ? "Removing…" : "Remove" }}
          </button>
        </li>
      </ul>

      <!-- Today's brief. Auto-fetched on mount and refreshed after
           every Rebuild. Rendered as markdown so lists / headings
           feel like a document, not a dump. -->
      <div
        v-if="sources.length > 0 && (briefLoading || briefHtml || briefError)"
        class="p-4"
        data-testid="sources-brief"
      >
        <div class="flex items-baseline justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-800">
            Today's brief
            <span v-if="briefDate" class="text-xs text-gray-400 font-normal">
              ({{ briefDate }})
            </span>
          </h3>
          <button
            v-if="briefFilePath"
            class="text-[11px] text-gray-500 hover:text-gray-700"
            :title="briefFilePath"
          >
            {{ briefFilePath }}
          </button>
        </div>
        <div v-if="briefLoading" class="text-xs text-gray-500 italic">
          Loading today's brief…
        </div>
        <div
          v-else-if="briefError"
          class="text-xs text-gray-500 italic"
          data-testid="sources-brief-empty"
        >
          {{ briefError }}
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else class="markdown-content" v-html="briefHtml" />
      </div>
    </div>

    <div
      v-if="lastRebuild"
      class="px-4 py-2 border-t border-gray-100 shrink-0 text-xs text-gray-600"
      data-testid="sources-rebuild-summary"
    >
      Last rebuild ({{ lastRebuild.isoDate }}):
      <strong>{{ lastRebuild.itemCount }}</strong> items from
      <strong>{{ lastRebuild.plannedCount }}</strong> sources,
      <strong>{{ lastRebuild.duplicateCount }}</strong> duplicates dropped.
      <span v-if="lastRebuild.archiveErrors.length > 0" class="text-red-600">
        ({{ lastRebuild.archiveErrors.length }} archive errors)
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { marked } from "marked";
import type { ToolResultComplete } from "gui-chat-protocol/vue";
import type { ManageSourceData, RebuildSummary, Source } from "./index";

const props = defineProps<{
  selectedResult: ToolResultComplete<ManageSourceData>;
}>();

// Local mirror of the source list that we mutate after Remove /
// Rebuild button clicks, so the UI stays responsive without the LLM
// having to re-list. Initial value comes from the tool result.
const localSources = ref<Source[] | null>(null);
const lastRebuild = ref<RebuildSummary | null>(null);
const actionMessage = ref("");
const actionError = ref(false);
// Tracks the current button-driven request: either a slug (Remove) or
// the literal "rebuild". Used to disable/relabel the matching button.
const busy = ref<string | null>(null);

const sources = computed<Source[]>(() => {
  if (localSources.value !== null) return localSources.value;
  return props.selectedResult.data?.sources ?? [];
});

const highlightSlug = computed(
  () => props.selectedResult.data?.highlightSlug ?? null,
);

// Initialize lastRebuild from the result if the LLM-side rebuild
// landed before any in-View button click — but never overwrite a
// fresher result the user's own click produced.
if (
  lastRebuild.value === null &&
  props.selectedResult.data?.lastRebuild !== undefined
) {
  lastRebuild.value = props.selectedResult.data.lastRebuild;
}

function kindLabel(kind: Source["fetcherKind"]): string {
  switch (kind) {
    case "rss":
      return "RSS";
    case "github-releases":
      return "GitHub rel";
    case "github-issues":
      return "GitHub iss";
    case "arxiv":
      return "arXiv";
  }
}

function kindBadgeClass(kind: Source["fetcherKind"]): string {
  switch (kind) {
    case "rss":
      return "bg-orange-100 text-orange-700";
    case "github-releases":
      return "bg-purple-100 text-purple-700";
    case "github-issues":
      return "bg-indigo-100 text-indigo-700";
    case "arxiv":
      return "bg-emerald-100 text-emerald-700";
  }
}

function flash(message: string, isError = false): void {
  actionMessage.value = message;
  actionError.value = isError;
  setTimeout(() => {
    if (actionMessage.value === message) actionMessage.value = "";
  }, 4000);
}

async function refreshList(): Promise<void> {
  try {
    const res = await fetch("/api/sources");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { sources: Source[] };
    localSources.value = body.sources;
  } catch (err) {
    flash(
      `Failed to refresh sources: ${err instanceof Error ? err.message : String(err)}`,
      true,
    );
  }
}

async function remove(slug: string): Promise<void> {
  if (!confirm(`Remove source "${slug}"?`)) return;
  busy.value = slug;
  try {
    const res = await fetch(`/api/sources/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error ?? `HTTP ${res.status}`);
    }
    flash(`Removed "${slug}".`);
    await refreshList();
  } catch (err) {
    flash(
      `Remove failed: ${err instanceof Error ? err.message : String(err)}`,
      true,
    );
  } finally {
    busy.value = null;
  }
}

async function rebuild(): Promise<void> {
  busy.value = "rebuild";
  try {
    const res = await fetch("/api/sources/rebuild", { method: "POST" });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error ?? `HTTP ${res.status}`);
    }
    const summary = (await res.json()) as RebuildSummary;
    lastRebuild.value = summary;
    flash(
      `Rebuild complete: ${summary.itemCount} items from ${summary.plannedCount} sources.`,
    );
    await Promise.all([refreshList(), loadBrief(summary.isoDate)]);
  } catch (err) {
    flash(
      `Rebuild failed: ${err instanceof Error ? err.message : String(err)}`,
      true,
    );
  } finally {
    busy.value = null;
  }
}

// --- today's brief -------------------------------------------------------

// Fetched markdown (rendered via marked() into briefHtml below). Null
// while idle; "" after a confirmed empty/404 so the template can show
// a friendly message instead of a stuck spinner.
const briefMarkdown = ref<string | null>(null);
const briefError = ref("");
const briefLoading = ref(false);
const briefDate = ref("");
const briefFilePath = ref("");

// Build `news/daily/YYYY/MM/DD.md` from an ISO date. Local-time
// matches how the pipeline writes the file (see toLocalIsoDate).
function dailyPathFor(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `news/daily/${y}/${m}/${d}.md`;
}

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function loadBrief(isoDate: string): Promise<void> {
  briefLoading.value = true;
  briefError.value = "";
  briefDate.value = isoDate;
  const relPath = dailyPathFor(isoDate);
  briefFilePath.value = relPath;
  try {
    const res = await fetch(
      `/api/files/content?path=${encodeURIComponent(relPath)}`,
    );
    if (!res.ok) {
      if (res.status === 404) {
        briefMarkdown.value = "";
        briefError.value =
          "No brief written for this date yet. Click Rebuild now.";
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const body = (await res.json()) as { content?: string; kind?: string };
    briefMarkdown.value = body.content ?? "";
    if (!briefMarkdown.value.trim()) {
      briefError.value = "Today's brief is empty.";
    }
  } catch (err) {
    briefError.value =
      err instanceof Error ? err.message : "Failed to load brief";
  } finally {
    briefLoading.value = false;
  }
}

const briefHtml = computed(() => {
  if (!briefMarkdown.value) return "";
  return marked(briefMarkdown.value) as string;
});

// Load on mount — try today's brief first, then last rebuild's date
// if different (tool result may have been produced earlier in the day
// but the user only just opened this canvas).
onMounted(() => {
  const initial = lastRebuild.value?.isoDate ?? todayIsoDate();
  loadBrief(initial);
});

// Re-fetch when the selected result brings a new rebuild summary
// (e.g. the LLM triggered another rebuild).
watch(
  () => props.selectedResult.data?.lastRebuild?.isoDate,
  (next) => {
    if (next && next !== briefDate.value) loadBrief(next);
  },
);
</script>
