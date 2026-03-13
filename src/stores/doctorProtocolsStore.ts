/**
 * doctorProtocolsStore.ts — Persisted protocols store.
 * Dual-mode: Supabase + localStorage fallback.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useSupabaseTable, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";

export type ProtocolType = "consultation" | "prescription" | "procedure" | "followup";

export interface Protocol {
  id: number; name: string; type: ProtocolType; specialty: string;
  description: string; steps: string[]; meds?: string[];
  examens?: string[]; duration?: string; favorite: boolean;
  usageCount: number; lastUsed: string;
}

const store = createStore<Protocol[]>("medicare_doctor_protocols", []);

export const doctorProtocolsStore = store;

export function useDoctorProtocols() {
  return useStore(store);
}

/** Supabase-aware hook */
export function useDoctorProtocolsSupabase() {
  const { userId, isAuthenticated } = useAuthReady();
  const [localProtocols] = useStore(store);

  return useSupabaseTable<Protocol>({
    queryKey: ["doctor_protocols", userId || ""],
    tableName: "doctor_protocols",
    filters: userId ? { doctor_id: userId } : undefined,
    enabled: isAuthenticated,
    fallbackData: localProtocols,
  });
}

export function seedProtocolsIfEmpty(protocols: Protocol[]) {
  const current = store.read();
  if (current.length === 0) {
    store.set(protocols);
  }
}
