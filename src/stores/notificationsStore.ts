/**
 * notificationsStore.ts — Cross-role notification store (localStorage).
 * Any role can push notifications visible to patient or other roles.
 *
 * // TODO BACKEND: Replace with push notifications / Supabase Realtime
 */
import { createStore, useStore } from "./crossRoleStore";
import { toast } from "sonner";
import { getCurrentRole } from "./authStore";

export interface CrossNotification {
  id: string;
  type: "pharmacy_ready" | "care_sheet" | "lab_results" | "prescription_sent" | "appointment_absent" | "appointment_booked" | "appointment_rescheduled" | "generic" | "billing" | "appointment" | "result" | "message" | "reminder" | "system" | "renewal_accepted" | "renewal_rejected" | "kyc_approved" | "kyc_rejected" | "report_resolved";
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
  // Show toast if current user is the target
  const currentRole = getCurrentRole();
  if (currentRole === notif.targetRole) {
    toast.info(notif.title, { description: notif.message });
  }
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

// ─── High-level notification helpers ────────────────────────
// Use these from any store action to notify the right role.

/** Notify patient about an event */
export function notifyPatient(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "patient", actionLink });
}

/** Notify doctor about an event */
export function notifyDoctor(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "doctor", actionLink });
}

/** Notify secretary about an event */
export function notifySecretary(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "secretary", actionLink });
}

/** Notify admin about an event */
export function notifyAdmin(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "admin", actionLink });
}

/** Notify pharmacy about an event */
export function notifyPharmacy(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "pharmacy", actionLink });
}

/** Notify laboratory about an event */
export function notifyLaboratory(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "laboratory", actionLink });
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
    // Doctor notifications
    { id: "notif-seed-8", type: "appointment_booked", title: "Nouveau RDV", message: "Amine Ben Ali a réservé un RDV pour demain à 09:00.", targetRole: "doctor", createdAt: ago(2), read: false, actionLink: "/dashboard/doctor/schedule" },
    { id: "notif-seed-9", type: "generic", title: "Demande de renouvellement", message: "Fatma Trabelsi demande le renouvellement de l'ordonnance RX-003.", targetRole: "doctor", createdAt: ago(4), read: false, actionLink: "/dashboard/doctor/prescriptions" },
    // Secretary notifications
    { id: "notif-seed-10", type: "appointment_booked", title: "Nouveau RDV en ligne", message: "Un patient a réservé en ligne pour Dr. Bouazizi demain à 09:00.", targetRole: "secretary", createdAt: ago(2), read: false, actionLink: "/dashboard/secretary/agenda" },
    // Admin notifications
    { id: "notif-seed-11", type: "system", title: "Nouvelle inscription", message: "Dr. Hammami a soumis sa demande d'inscription. Vérification KYC requise.", targetRole: "admin", createdAt: ago(6), read: false, actionLink: "/dashboard/admin/verifications" },
  ];

  store.set(seeds);
}
