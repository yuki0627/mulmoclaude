// Composable that owns the active role list, the currently
// selected role id, and the refresh-from-server fetch. The merge
// rule lives in src/utils/roleMerge so it can be unit-tested
// independently.

import { computed, ref, type ComputedRef, type Ref } from "vue";
import { ROLES, type Role } from "../config/roles";
import { mergeRoles } from "../utils/role/merge";

export function useRoles(): {
  roles: Ref<Role[]>;
  currentRoleId: Ref<string>;
  currentRole: ComputedRef<Role>;
  refreshRoles: () => Promise<void>;
} {
  const roles = ref<Role[]>(ROLES);
  const currentRoleId = ref(ROLES[0].id);
  const currentRole = computed(
    () =>
      roles.value.find((r) => r.id === currentRoleId.value) ?? roles.value[0],
  );

  async function refreshRoles(): Promise<void> {
    try {
      const res = await fetch("/api/roles");
      const customRoles: Role[] = await res.json();
      roles.value = mergeRoles(ROLES, customRoles);
    } catch {
      // keep current roles on error
    }
  }

  return { roles, currentRoleId, currentRole, refreshRoles };
}
