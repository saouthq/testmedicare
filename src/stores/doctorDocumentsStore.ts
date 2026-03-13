/**
 * doctorDocumentsStore.ts — Persisted document templates store.
 * Dual-mode: Supabase + localStorage fallback.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useSupabaseTable, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";

export interface DocTemplate {
  id: number;
  name: string;
  category: "certificat" | "courrier" | "arret" | "compte_rendu" | "autre";
  content: string;
  variables: string[];
  usageCount: number;
  lastUsed: string;
  createdAt: string;
}

const store = createStore<DocTemplate[]>("medicare_doctor_templates", []);

export const doctorDocumentsStore = store;

export function useDoctorDocTemplates() {
  return useStore(store);
}

/** Supabase-aware hook */
export function useDoctorDocTemplatesSupabase() {
  const { userId, isAuthenticated } = useAuthReady();
  const [localTemplates] = useStore(store);

  return useSupabaseTable<DocTemplate>({
    queryKey: ["doctor_documents", userId || ""],
    tableName: "doctor_documents",
    filters: userId ? { doctor_id: userId } : undefined,
    enabled: isAuthenticated,
    fallbackData: localTemplates,
  });
}

export function seedDocTemplatesIfEmpty(templates: DocTemplate[]) {
  const current = store.read();
  if (current.length === 0) {
    store.set(templates);
  }
}
