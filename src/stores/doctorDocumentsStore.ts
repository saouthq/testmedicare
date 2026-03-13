/**
 * doctorDocumentsStore.ts — Persisted document templates store.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useSupabaseTable, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useDualQuery } from "@/hooks/useDualData";
import { mapDocTemplateRow } from "@/lib/supabaseMappers";
import { getAppMode } from "./authStore";

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

/** Create a new document template */
export async function createDocTemplate(template: Omit<DocTemplate, "id" | "usageCount" | "lastUsed" | "createdAt">) {
  const id = Date.now();
  const now = new Date().toISOString();
  const full: DocTemplate = { ...template, id, usageCount: 0, lastUsed: "", createdAt: now };
  store.set(prev => [full, ...prev]);

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await (supabase.from as any)("doctor_documents").insert({
          doctor_id: session.user.id,
          name: template.name,
          category: template.category,
          content: template.content,
          variables: template.variables,
        }).select("id").single();
        if (data?.id) {
          store.set(prev => prev.map(t => t.id === id ? { ...t, id: data.id } : t));
        }
      }
    } catch (e) {
      console.warn("[createDocTemplate] Supabase insert failed:", e);
    }
  }
  return id;
}

/** Update a document template */
export async function updateDocTemplate(id: number, update: Partial<DocTemplate>) {
  store.set(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));

  if (getAppMode() === "production") {
    try {
      const row: Record<string, any> = {};
      if (update.name !== undefined) row.name = update.name;
      if (update.category !== undefined) row.category = update.category;
      if (update.content !== undefined) row.content = update.content;
      if (update.variables !== undefined) row.variables = update.variables;
      if (update.usageCount !== undefined) row.usage_count = update.usageCount;
      if (update.lastUsed !== undefined) row.last_used = update.lastUsed;
      if (Object.keys(row).length > 0) {
        await (supabase.from as any)("doctor_documents").update(row).eq("id", id);
      }
    } catch (e) {
      console.warn("[updateDocTemplate] Supabase update failed:", e);
    }
  }
}

/** Delete a document template */
export async function deleteDocTemplate(id: number) {
  store.set(prev => prev.filter(t => t.id !== id));

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("doctor_documents").delete().eq("id", id);
    } catch (e) {
      console.warn("[deleteDocTemplate] Supabase delete failed:", e);
    }
  }
}
