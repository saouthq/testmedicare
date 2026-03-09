/**
 * notificationsStore.ts — Cross-role notification store (localStorage).
 * Any role can push notifications visible to patient or other roles.
 *
 * // TODO BACKEND: Replace with push notifications / Supabase Realtime
 */
import { createStore, useStore } from "./crossRoleStore";

export interface CrossNotification {
  id: string;
  type: "pharmacy_ready" | "care_sheet" | "lab_results" | "prescription_sent" | "appointment_absent" | "generic";
  title: string;
  message: string;
  targetRole: "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" | "admin";
  createdAt: string;
  read: boolean;
  actionLink?: string;
}

const store = createStore<CrossNotification[]>("medicare_notifications", []);

export const notificationsStore = store;

export function useNotifications(role?: string) {
  const [all, set] = useStore(store);
  const filtered = role ? all.filter((n) => n.targetRole === role) : all;
  return { notifications: filtered, setNotifications: set, allNotifications: all };
}

/** Push a new notification */
export function pushNotification(notif: Omit<CrossNotification, "id" | "createdAt" | "read">) {
  store.set((prev) => [
    {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
    },
    ...prev,
  ]);
}
