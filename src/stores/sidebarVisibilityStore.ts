/**
 * sidebarVisibilityStore.ts — Admin-controlled sidebar item visibility per role & specialty.
 * Allows admin to show/hide specific sidebar items for each role.
 *
 * Structure: { [role]: { [itemUrl]: boolean } }
 * Missing entries default to true (visible).
 *
 * // TODO BACKEND: Replace with GET/PUT /api/admin/sidebar-visibility
 */
import { createStore, useStore } from "./crossRoleStore";
import { appendLog } from "@/services/admin/adminAuditService";
import { saveAdminConfig, loadAdminConfig } from "./adminConfigSync";

export interface SidebarVisibilityConfig {
  /** Per-role visibility: role → url → enabled */
  byRole: Record<string, Record<string, boolean>>;
  /** Per-specialty overrides (optional): specialty → url → enabled */
  bySpecialty: Record<string, Record<string, boolean>>;
}

const defaultConfig: SidebarVisibilityConfig = {
  byRole: {},
  bySpecialty: {},
};

const store = createStore<SidebarVisibilityConfig>("medicare_sidebar_visibility", defaultConfig);

export function useSidebarVisibility() {
  return useStore(store);
}

export function readSidebarVisibility(): SidebarVisibilityConfig {
  return store.read();
}

/**
 * Check if a sidebar item is visible for a given role and optional specialty.
 * Returns true by default (visible) if no explicit config exists.
 */
export function isSidebarItemVisible(role: string, url: string, specialty?: string): boolean {
  const config = store.read();

  // Check specialty override first (more specific)
  if (specialty && config.bySpecialty[specialty]) {
    const specVal = config.bySpecialty[specialty][url];
    if (specVal === false) return false;
  }

  // Check role-level
  if (config.byRole[role]) {
    const roleVal = config.byRole[role][url];
    if (roleVal === false) return false;
  }

  return true;
}

/**
 * Toggle a sidebar item for a specific role.
 */
export function toggleSidebarItem(role: string, url: string, enabled: boolean, adminName = "Admin") {
  store.set(prev => ({
    ...prev,
    byRole: {
      ...prev.byRole,
      [role]: {
        ...(prev.byRole[role] || {}),
        [url]: enabled,
      },
    },
  }));

  appendLog(
    enabled ? "sidebar_item_enabled" : "sidebar_item_disabled",
    "sidebar",
    `${role}:${url}`,
    `Sidebar "${url}" ${enabled ? "activé" : "désactivé"} pour le rôle "${role}" par ${adminName}`,
    adminName
  );
  saveAdminConfig("sidebar_visibility", store.read());
}

/**
 * Toggle a sidebar item for a specific specialty.
 */
export function toggleSidebarItemBySpecialty(specialty: string, url: string, enabled: boolean, adminName = "Admin") {
  store.set(prev => ({
    ...prev,
    bySpecialty: {
      ...prev.bySpecialty,
      [specialty]: {
        ...(prev.bySpecialty[specialty] || {}),
        [url]: enabled,
      },
    },
  }));

  appendLog(
    enabled ? "sidebar_item_enabled" : "sidebar_item_disabled",
    "sidebar_specialty",
    `${specialty}:${url}`,
    `Sidebar "${url}" ${enabled ? "activé" : "désactivé"} pour la spécialité "${specialty}" par ${adminName}`,
    adminName
  );
  saveAdminConfig("sidebar_visibility", store.read());
}

/**
 * Reset all visibility config to defaults (everything visible).
 */
export function resetSidebarVisibility() {
  store.set(defaultConfig);
}
