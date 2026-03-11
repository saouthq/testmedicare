/**
 * notificationsStore.ts — Cross-role notification store (localStorage).
 * Any role can push notifications visible to patient or other roles.
 *
 * // TODO BACKEND: Replace with push notifications / Supabase Realtime
 */
import { createStore, useStore } from "./crossRoleStore";

export interface CrossNotification {
  id: string;
  type: "pharmacy_ready" | "care_sheet" | "lab_results" | "prescription_sent" | "appointment_absent" | "appointment_booked" | "appointment_rescheduled" | "generic" | "billing" | "appointment" | "result" | "message" | "reminder" | "system";
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
  // TODO BACKEND: POST /api/notifications
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

/** Mark a single notification as read */
export function markNotificationRead(id: string) {
  // TODO BACKEND: PATCH /api/notifications/:id
  store.set((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
}

/** Mark all notifications for a role as read */
export function markAllRead(role?: string) {
  // TODO BACKEND: PATCH /api/notifications/mark-all-read
  store.set((prev) => prev.map((n) => (role && n.targetRole !== role) ? n : { ...n, read: true }));
}

/** Delete a notification */
export function deleteNotification(id: string) {
  // TODO BACKEND: DELETE /api/notifications/:id
  store.set((prev) => prev.filter((n) => n.id !== id));
}

/** Seed initial demo notifications (called by seedStores) */
export function seedNotificationsIfEmpty() {
  if (store.read().length > 0) return;
  const now = new Date();
  const ago = (hours: number) => new Date(now.getTime() - hours * 3600_000).toISOString();

  const seeds: CrossNotification[] = [
    { id: "notif-seed-1", type: "appointment", title: "Rappel de RDV", message: "Votre rendez-vous avec Dr. Bouazizi est demain à 14h30 au cabinet El Manar.", targetRole: "patient", createdAt: ago(1), read: false, actionLink: "/dashboard/patient/appointments" },
    { id: "notif-seed-2", type: "result", title: "Résultats disponibles", message: "Les résultats de votre bilan sanguin sont prêts. Consultez-les dans votre dossier médical.", targetRole: "patient", createdAt: ago(3), read: false, actionLink: "/dashboard/patient/health" },
    { id: "notif-seed-3", type: "message", title: "Nouveau message", message: "Dr. Gharbi vous a envoyé un message concernant votre dernière consultation.", targetRole: "patient", createdAt: ago(5), read: false, actionLink: "/dashboard/patient/messages" },
    { id: "notif-seed-4", type: "prescription_sent", title: "Ordonnance prête à retirer", message: "Votre ordonnance ORD-2026-045 est prête à retirer chez Pharmacie El Amal.", targetRole: "patient", createdAt: ago(6), read: false, actionLink: "/dashboard/patient/prescriptions" },
    { id: "notif-seed-5", type: "care_sheet", title: "Feuille de soins disponible", message: "La feuille de soins de votre consultation du 10 Fév est disponible au téléchargement.", targetRole: "patient", createdAt: ago(24), read: true, actionLink: "/dashboard/patient/health" },
    { id: "notif-seed-6", type: "appointment", title: "RDV confirmé", message: "Votre rendez-vous du 23 Fév avec Dr. Gharbi (Cardiologue) est confirmé.", targetRole: "patient", createdAt: ago(48), read: true, actionLink: "/dashboard/patient/appointments" },
    { id: "notif-seed-7", type: "system", title: "Mise à jour du profil", message: "Pensez à compléter vos informations d'assurance dans votre profil.", targetRole: "patient", createdAt: ago(72), read: true },
  ];

  store.set(seeds);
}
