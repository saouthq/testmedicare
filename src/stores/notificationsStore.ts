/**
 * notificationsStore.ts — Cross-role notification store.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { toast } from "sonner";
import { getCurrentRole, getAppMode } from "./authStore";
import { useSupabaseTable, useSupabaseRealtime, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useDualQuery } from "@/hooks/useDualData";
import { mapNotificationRow } from "@/lib/supabaseMappers";

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
  const [all, set] = useDualQuery<CrossNotification[]>({
    store,
    tableName: "notifications",
    queryKey: ["notifications"],
    mapRowToLocal: mapNotificationRow,
    orderBy: { column: "created_at", ascending: false },
  });
  const filtered = role ? all.filter((n) => n.targetRole === role) : all;
  return { notifications: filtered, setNotifications: set, allNotifications: all };
}

/** Supabase-aware hook */
export function useNotificationsSupabase() {
  const { userId, isAuthenticated } = useAuthReady();
  const [localNotifs] = useStore(store);

  const query = useSupabaseTable<CrossNotification>({
    queryKey: ["notifications", userId || ""],
    tableName: "notifications",
    filters: userId ? { user_id: userId } : undefined,
    orderBy: { column: "created_at", ascending: false },
    enabled: isAuthenticated,
    fallbackData: localNotifs,
  });

  useSupabaseRealtime("notifications", [["notifications", userId || ""]], userId ? `user_id=eq.${userId}` : undefined);

  return query;
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
  const currentRole = getCurrentRole();
  if (currentRole === notif.targetRole) {
    toast.info(notif.title, { description: notif.message });
  }
}

/** Mark a single notification as read */
export async function markNotificationRead(id: string) {
  store.set((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("notifications").update({ read: true }).eq("id", id);
    }
  } catch {}
}

/** Mark all notifications for a role as read */
export async function markAllRead(role?: string) {
  store.set((prev) => prev.map((n) => (role && n.targetRole !== role) ? n : { ...n, read: true }));
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("notifications").update({ read: true }).eq("user_id", session.user.id);
    }
  } catch {}
}

/** Delete a notification */
export async function deleteNotification(id: string) {
  store.set((prev) => prev.filter((n) => n.id !== id));
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("notifications").delete().eq("id", id);
    }
  } catch {}
}

// ─── High-level notification helpers ────────────────────────

export function notifyPatient(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "patient", actionLink });
}

export function notifyDoctor(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "doctor", actionLink });
}

export function notifySecretary(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "secretary", actionLink });
}

export function notifyAdmin(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "admin", actionLink });
}

export function notifyPharmacy(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "pharmacy", actionLink });
}

export function notifyLaboratory(title: string, message: string, actionLink?: string, type: CrossNotification["type"] = "generic") {
  pushNotification({ type, title, message, targetRole: "laboratory", actionLink });
}

/** Seed initial demo notifications */
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
    { id: "notif-seed-8", type: "appointment_booked", title: "Nouveau RDV", message: "Amine Ben Ali a réservé un RDV pour demain à 09:00.", targetRole: "doctor", createdAt: ago(2), read: false, actionLink: "/dashboard/doctor/schedule" },
    { id: "notif-seed-9", type: "generic", title: "Demande de renouvellement", message: "Fatma Trabelsi demande le renouvellement de l'ordonnance RX-003.", targetRole: "doctor", createdAt: ago(4), read: false, actionLink: "/dashboard/doctor/prescriptions" },
    { id: "notif-seed-10", type: "appointment_booked", title: "Nouveau RDV en ligne", message: "Un patient a réservé en ligne pour Dr. Bouazizi demain à 09:00.", targetRole: "secretary", createdAt: ago(2), read: false, actionLink: "/dashboard/secretary/agenda" },
    { id: "notif-seed-11", type: "system", title: "Nouvelle inscription", message: "Dr. Hammami a soumis sa demande d'inscription. Vérification KYC requise.", targetRole: "admin", createdAt: ago(6), read: false, actionLink: "/dashboard/admin/verifications" },
  ];

  store.set(seeds);
}
