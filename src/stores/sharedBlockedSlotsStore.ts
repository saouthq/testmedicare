/**
 * sharedBlockedSlotsStore.ts — Centralized blocked slots.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import type { SharedBlockedSlot } from "@/types/appointment";
import { useDualQuery } from "@/hooks/useDualData";
import { mapBlockedSlotRow } from "@/lib/supabaseMappers";
import { getAppMode } from "./authStore";
import { supabase } from "@/integrations/supabase/client";

const initialBlocks: SharedBlockedSlot[] = [];

const store = createStore<SharedBlockedSlot[]>("medicare_blocked_slots", initialBlocks);

export const sharedBlockedSlotsStore = store;

export function useSharedBlockedSlots() {
  return useDualQuery<SharedBlockedSlot[]>({
    store,
    tableName: "blocked_slots",
    queryKey: ["blocked_slots"],
    mapRowToLocal: mapBlockedSlotRow,
  });
}

export async function addBlockedSlot(block: Omit<SharedBlockedSlot, "id">) {
  const id = `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  store.set(prev => [...prev, { ...block, id }]);

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await (supabase.from as any)("blocked_slots").insert({
          id,
          doctor_id: session.user.id,
          doctor_name: block.doctor || "",
          date: block.date,
          start_time: block.startTime,
          duration: block.duration || 30,
          reason: block.reason || "",
        });
      }
    } catch (e) {
      console.warn("[addBlockedSlot] Supabase insert failed:", e);
    }
  }

  return id;
}

export function updateBlockedSlot(id: string, update: Partial<SharedBlockedSlot>) {
  store.set(prev => prev.map(b => b.id === id ? { ...b, ...update } : b));
}

export async function removeBlockedSlot(id: string) {
  store.set(prev => prev.filter(b => b.id !== id));

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await (supabase.from as any)("blocked_slots").delete().eq("id", id);
      }
    } catch (e) {
      console.warn("[removeBlockedSlot] Supabase delete failed:", e);
    }
  }
}

/** Get blocked slots for a specific date */
export function getBlockedSlotsForDate(blocks: SharedBlockedSlot[], date: string) {
  return blocks.filter(b => b.date === date);
}
