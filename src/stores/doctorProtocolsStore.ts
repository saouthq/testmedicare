/**
 * doctorProtocolsStore.ts — Persisted protocols store.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useSupabaseTable, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useDualQuery } from "@/hooks/useDualData";
import { mapProtocolRow } from "@/lib/supabaseMappers";
import { getAppMode } from "./authStore";

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
  return useDualQuery<Protocol[]>({
    store,
    tableName: "doctor_protocols",
    queryKey: ["doctor_protocols"],
    mapRowToLocal: mapProtocolRow,
    orderBy: { column: "created_at", ascending: false },
  });
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

/** Create a new protocol */
export async function createProtocol(protocol: Omit<Protocol, "id" | "usageCount" | "lastUsed">) {
  const id = Date.now();
  const full: Protocol = { ...protocol, id, usageCount: 0, lastUsed: "" };
  store.set(prev => [full, ...prev]);

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await (supabase.from as any)("doctor_protocols").insert({
          doctor_id: session.user.id,
          name: protocol.name,
          type: protocol.type,
          specialty: protocol.specialty || "",
          description: protocol.description || "",
          steps: protocol.steps || [],
          meds: protocol.meds || [],
          examens: protocol.examens || [],
          duration: protocol.duration || "",
          favorite: protocol.favorite ?? false,
        }).select("id").single();
        if (data?.id) {
          store.set(prev => prev.map(p => p.id === id ? { ...p, id: data.id } : p));
        }
      }
    } catch (e) {
      console.warn("[createProtocol] Supabase insert failed:", e);
    }
  }
  return id;
}

/** Update a protocol */
export async function updateProtocol(id: number, update: Partial<Protocol>) {
  store.set(prev => prev.map(p => p.id === id ? { ...p, ...update } : p));

  if (getAppMode() === "production") {
    try {
      const row: Record<string, any> = {};
      if (update.name !== undefined) row.name = update.name;
      if (update.type !== undefined) row.type = update.type;
      if (update.specialty !== undefined) row.specialty = update.specialty;
      if (update.description !== undefined) row.description = update.description;
      if (update.steps !== undefined) row.steps = update.steps;
      if (update.meds !== undefined) row.meds = update.meds;
      if (update.examens !== undefined) row.examens = update.examens;
      if (update.duration !== undefined) row.duration = update.duration;
      if (update.favorite !== undefined) row.favorite = update.favorite;
      if (update.usageCount !== undefined) row.usage_count = update.usageCount;
      if (update.lastUsed !== undefined) row.last_used = update.lastUsed;
      if (Object.keys(row).length > 0) {
        await (supabase.from as any)("doctor_protocols").update(row).eq("id", id);
      }
    } catch (e) {
      console.warn("[updateProtocol] Supabase update failed:", e);
    }
  }
}

/** Delete a protocol */
export async function deleteProtocol(id: number) {
  store.set(prev => prev.filter(p => p.id !== id));

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("doctor_protocols").delete().eq("id", id);
    } catch (e) {
      console.warn("[deleteProtocol] Supabase delete failed:", e);
    }
  }
}
