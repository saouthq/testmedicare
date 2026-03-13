/**
 * sharedTarifsStore.ts — Centralized tarifs/actes configuration.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import type { SharedActe } from "@/types/appointment";
import { useDualQuery } from "@/hooks/useDualData";
import { mapTarifRow } from "@/lib/supabaseMappers";
import { getAppMode } from "./authStore";
import { supabase } from "@/integrations/supabase/client";

const initialActes: SharedActe[] = [
  { id: 1, code: "CS", name: "Consultation standard", price: 35, conventionne: true, duration: 30, active: true },
  { id: 2, code: "CS-P", name: "Première consultation", price: 50, conventionne: true, duration: 45, active: true },
  { id: 3, code: "CS-S", name: "Consultation de suivi", price: 25, conventionne: true, duration: 20, active: true },
  { id: 4, code: "TC", name: "Téléconsultation", price: 30, conventionne: false, duration: 20, active: true },
  { id: 5, code: "CERT", name: "Certificat médical", price: 20, conventionne: false, duration: 15, active: true },
  { id: 6, code: "ECG", name: "Électrocardiogramme", price: 40, conventionne: true, duration: 20, active: true },
  { id: 7, code: "ECHO", name: "Échographie abdominale", price: 60, conventionne: true, duration: 30, active: true },
  { id: 8, code: "VAC", name: "Vaccination", price: 25, conventionne: true, duration: 15, active: true },
  { id: 9, code: "BIL", name: "Bilan de santé complet", price: 80, conventionne: false, duration: 60, active: true },
  { id: 10, code: "SPIRO", name: "Spirométrie", price: 45, conventionne: true, duration: 25, active: false },
];

const store = createStore<SharedActe[]>("medicare_tarifs", initialActes);

export const sharedTarifsStore = store;

export function useSharedTarifs() {
  return useDualQuery<SharedActe[]>({
    store,
    tableName: "tarifs",
    queryKey: ["tarifs"],
    mapRowToLocal: mapTarifRow,
    orderBy: { column: "created_at", ascending: true },
  });
}

export async function updateActe(id: number, update: Partial<SharedActe>) {
  store.set(prev => prev.map(a => a.id === id ? { ...a, ...update } : a));

  if (getAppMode() === "production") {
    try {
      const row: Record<string, any> = {};
      if (update.code !== undefined) row.code = update.code;
      if (update.name !== undefined) row.name = update.name;
      if (update.price !== undefined) row.price = update.price;
      if (update.conventionne !== undefined) row.conventionne = update.conventionne;
      if (update.duration !== undefined) row.duration = update.duration;
      if (update.active !== undefined) row.active = update.active;
      if (Object.keys(row).length > 0) {
        await (supabase.from as any)("tarifs").update(row).eq("id", id);
      }
    } catch (e) {
      console.warn("[updateActe] Supabase update failed:", e);
    }
  }
}

export async function addActe(acte: Omit<SharedActe, "id">) {
  const id = Date.now();
  store.set(prev => [...prev, { ...acte, id }]);

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await (supabase.from as any)("tarifs").insert({
          doctor_id: session.user.id,
          code: acte.code,
          name: acte.name,
          price: acte.price,
          conventionne: acte.conventionne ?? true,
          duration: acte.duration || 30,
          active: acte.active ?? true,
        }).select("id").single();
        // Update local id with server id
        if (data?.id) {
          store.set(prev => prev.map(a => a.id === id ? { ...a, id: data.id } : a));
        }
      }
    } catch (e) {
      console.warn("[addActe] Supabase insert failed:", e);
    }
  }

  return id;
}

export async function removeActe(id: number) {
  store.set(prev => prev.filter(a => a.id !== id));

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("tarifs").delete().eq("id", id);
    } catch (e) {
      console.warn("[removeActe] Supabase delete failed:", e);
    }
  }
}

/** Get active actes for billing */
export function getActiveActes(actes: SharedActe[]) {
  return actes.filter(a => a.active);
}
