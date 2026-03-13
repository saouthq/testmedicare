/**
 * doctorPrescriptionsStore.ts — Doctor-side prescription management.
 * Cross-role: Doctor creates → Patient sees → Pharmacy receives.
 *
 * Dual-mode: Supabase when authenticated, localStorage fallback for demo.
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { useSupabaseTable, useSupabaseRealtime, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import type { Prescription } from "@/types";

const store = createStore<Prescription[]>("medicare_doctor_prescriptions", []);

export const doctorPrescriptionsStore = store;

export function useDoctorPrescriptions(): [Prescription[], (v: Prescription[] | ((prev: Prescription[]) => Prescription[])) => void] {
  return useStore(store);
}

/** Hook that tries Supabase first, falls back to localStorage */
export function useDoctorPrescriptionsSupabase() {
  const { userId, isAuthenticated } = useAuthReady();
  const [localPrescriptions] = useStore(store);

  const query = useSupabaseTable<Prescription>({
    queryKey: ["prescriptions", userId || ""],
    tableName: "prescriptions",
    filters: userId ? { doctor_id: userId } : undefined,
    orderBy: { column: "created_at", ascending: false },
    enabled: isAuthenticated,
    fallbackData: localPrescriptions,
  });

  // Realtime sync
  useSupabaseRealtime("prescriptions", [["prescriptions", userId || ""]], userId ? `doctor_id=eq.${userId}` : undefined);

  return query;
}

export function initDoctorPrescriptionsIfEmpty(items: Prescription[]) {
  if (store.read().length === 0) store.set(items);
}

/** Create a new prescription (from consultation) */
export async function createPrescription(rx: Omit<Prescription, "id">) {
  const id = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
  const full: Prescription = { ...rx, id };

  // Try Supabase first
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("prescriptions").insert({
        id,
        doctor_id: session.user.id,
        doctor_name: rx.doctor,
        patient_name: rx.patient || "",
        date: rx.date,
        items: rx.items,
        status: rx.status,
        total: rx.total,
        assurance: rx.assurance,
        pharmacy: rx.pharmacy,
        sent: rx.sent || false,
      });
    }
  } catch (e) {
    console.warn("[createPrescription] Supabase insert failed, using localStorage:", e);
  }

  // Always update localStorage for demo compatibility
  store.set(prev => [full, ...prev]);

  // Notify patient
  pushNotification({
    type: "prescription_sent",
    title: "Nouvelle ordonnance",
    message: `${rx.doctor} vous a prescrit une ordonnance (${rx.items.length} médicament${rx.items.length > 1 ? "s" : ""}).`,
    targetRole: "patient",
    actionLink: "/dashboard/patient/prescriptions",
  });

  return id;
}

/** Mark prescription as sent */
export async function markPrescriptionSent(id: string) {
  store.set(prev => prev.map(rx => rx.id === id ? { ...rx, sent: true } : rx));
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("prescriptions").update({ sent: true }).eq("id", id);
    }
  } catch {}
}

/** Duplicate a prescription */
export function duplicatePrescription(id: string) {
  const original = store.read().find(rx => rx.id === id);
  if (!original) return null;
  const newId = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
  const dup: Prescription = {
    ...original,
    id: newId,
    date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
    sent: false,
  };
  store.set(prev => [dup, ...prev]);
  return newId;
}
