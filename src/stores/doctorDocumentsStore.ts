/**
 * doctorDocumentsStore.ts — Persisted document templates store.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useSupabaseTable, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useDualQuery } from "@/hooks/useDualData";
import { mapDocTemplateRow } from "@/lib/supabaseMappers";

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
  return useDualQuery<DocTemplate[]>({
    store,
    tableName: "doctor_documents",
    queryKey: ["doctor_documents"],
    mapRowToLocal: mapDocTemplateRow,
    orderBy: { column: "created_at", ascending: false },
  });
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
