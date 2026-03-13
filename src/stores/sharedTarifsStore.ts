/**
 * sharedTarifsStore.ts — Centralized tarifs/actes configuration.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import type { SharedActe } from "@/types/appointment";
import { useDualQuery } from "@/hooks/useDualData";
import { mapTarifRow } from "@/lib/supabaseMappers";

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

export function updateActe(id: number, update: Partial<SharedActe>) {
  store.set(prev => prev.map(a => a.id === id ? { ...a, ...update } : a));
}

export function addActe(acte: Omit<SharedActe, "id">) {
  const id = Date.now();
  store.set(prev => [...prev, { ...acte, id }]);
  return id;
}

export function removeActe(id: number) {
  store.set(prev => prev.filter(a => a.id !== id));
}

/** Get active actes for billing */
export function getActiveActes(actes: SharedActe[]) {
  return actes.filter(a => a.active);
}
