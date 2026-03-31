<template>
  <div class="h-full bg-white flex flex-col">
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
    >
      <h2 class="text-lg font-semibold text-gray-800">Custom Roles</h2>
      <span class="text-sm text-gray-500">
        {{ customRoles.length }}
        role{{ customRoles.length !== 1 ? "s" : "" }}
      </span>
    </div>

    <div
      v-if="customRoles.length === 0"
      class="flex-1 flex items-center justify-center text-gray-400 text-sm"
    >
      No custom roles yet. Ask Claude to create one.
    </div>

    <ul v-else class="flex-1 overflow-y-auto p-4 space-y-2">
      <li
        v-for="role in customRoles"
        :key="role.id"
        class="rounded-lg border"
        :class="
          selectedId === role.id ? 'border-blue-400' : 'border-gray-200'
        "
      >
        <!-- Role header row -->
        <div
          class="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
          :class="selectedId === role.id ? 'rounded-b-none' : ''"
          @click="selectRole(role)"
        >
          <span class="material-icons text-gray-500">{{ role.icon }}</span>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm text-gray-800">{{ role.name }}</div>
            <div class="text-xs text-gray-400 truncate">
              {{ role.availablePlugins.join(", ") }}
            </div>
          </div>
          <span class="material-icons text-gray-400 text-sm">
            {{ selectedId === role.id ? "expand_less" : "expand_more" }}
          </span>
        </div>

        <!-- Inline editor -->
        <div
          v-if="selectedId === role.id"
          class="border-t border-blue-100 bg-blue-50 p-4 space-y-3 rounded-b-lg"
        >
          <!-- Name + Icon row -->
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-xs font-medium text-gray-600 mb-1"
                >Name</label
              >
              <input
                v-model="editForm.name"
                type="text"
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-400"
              />
            </div>
            <div class="w-32">
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Icon
                <a
                  class="text-blue-400 font-normal ml-1"
                  href="https://fonts.google.com/icons"
                  target="_blank"
                  rel="noopener"
                  >?</a
                >
              </label>
              <input
                v-model="editForm.icon"
                type="text"
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <!-- Prompt -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1"
              >Prompt</label
            >
            <textarea
              v-model="editForm.prompt"
              rows="6"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded font-mono resize-y focus:outline-none focus:border-blue-400"
              spellcheck="false"
            />
          </div>

          <!-- Plugins -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Plugins
              <span class="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              v-model="editForm.pluginsText"
              type="text"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:border-blue-400"
            />
          </div>

          <!-- Starter queries -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">
              Starter queries
              <span class="text-gray-400 font-normal">(one per line)</span>
            </label>
            <textarea
              v-model="editForm.queriesText"
              rows="3"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded resize-y focus:outline-none focus:border-blue-400"
            />
          </div>

          <!-- Buttons -->
          <div class="flex items-center justify-between pt-1">
            <div class="flex gap-2">
              <button
                class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                :disabled="saving"
                @click="saveEdit(role.id)"
              >
                {{ saving ? "Saving…" : "Save" }}
              </button>
              <button
                class="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                @click="selectedId = null"
              >
                Cancel
              </button>
            </div>
            <button
              class="px-3 py-1.5 text-sm rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50"
              :disabled="saving"
              @click="deleteRole(role.id)"
            >
              Delete
            </button>
          </div>
          <div v-if="saveError" class="text-xs text-red-500">
            {{ saveError }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ToolResultComplete } from "gui-chat-protocol/vue";
import type { CustomRole, ManageRolesData } from "./index";

const props = defineProps<{ selectedResult: ToolResultComplete }>();
const emit = defineEmits<{ updateResult: [result: ToolResultComplete] }>();

const customRoles = computed(
  () => (props.selectedResult.data as ManageRolesData)?.customRoles ?? [],
);

// ── Selection & edit form ─────────────────────────────────────────────────────

const selectedId = ref<string | null>(null);
const saving = ref(false);
const saveError = ref("");

interface EditForm {
  name: string;
  icon: string;
  prompt: string;
  pluginsText: string;
  queriesText: string;
}

const editForm = ref<EditForm>({
  name: "",
  icon: "",
  prompt: "",
  pluginsText: "",
  queriesText: "",
});

function selectRole(role: CustomRole) {
  if (selectedId.value === role.id) {
    selectedId.value = null;
    return;
  }
  selectedId.value = role.id;
  saveError.value = "";
  editForm.value = {
    name: role.name,
    icon: role.icon,
    prompt: role.prompt,
    pluginsText: role.availablePlugins.join(", "),
    queriesText: (role.queries ?? []).join("\n"),
  };
}

// ── API ───────────────────────────────────────────────────────────────────────

async function callManage(body: Record<string, unknown>) {
  const res = await fetch("/api/roles/manage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function refreshList() {
  const result = await callManage({ action: "list" });
  if (result.success) {
    emit("updateResult", {
      ...props.selectedResult,
      ...result,
      uuid: props.selectedResult.uuid,
    });
    // Let App.vue know the dropdown needs to refresh
    window.dispatchEvent(new CustomEvent("roles-updated"));
  }
}

async function saveEdit(id: string) {
  saving.value = true;
  saveError.value = "";
  const role: CustomRole = {
    id,
    name: editForm.value.name.trim(),
    icon: editForm.value.icon.trim(),
    prompt: editForm.value.prompt,
    availablePlugins: editForm.value.pluginsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    queries: editForm.value.queriesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  const result = await callManage({ action: "update", role });
  if (result.success) {
    selectedId.value = null;
    await refreshList();
  } else {
    saveError.value = result.error ?? "Save failed";
  }
  saving.value = false;
}

async function deleteRole(id: string) {
  saving.value = true;
  saveError.value = "";
  const result = await callManage({ action: "delete", roleId: id });
  if (result.success) {
    selectedId.value = null;
    await refreshList();
  } else {
    saveError.value = result.error ?? "Delete failed";
  }
  saving.value = false;
}
</script>
