/**
 * sharedBlockedSlotsStore.ts — Centralized blocked slots.
 * Used by: DoctorSchedule, SecretaryAgenda, PublicBooking
 *
 * // TODO BACKEND: Replace with API
 */
import { createStore, useStore } from "./crossRoleStore";
import type { SharedBlockedSlot } from "@/types/appointment";

const initialBlocks: SharedBlockedSlot[] = [];

const store = createStore<SharedBlockedSlot[]>("medicare_blocked_slots", initialBlocks);

export const sharedBlockedSlotsStore = store;

export function useSharedBlockedSlots() {
  return useStore(store);
}

export function addBlockedSlot(block: Omit<SharedBlockedSlot, "id">) {
  const id = `blk-${Date.now()}`;
  store.set(prev => [...prev, { ...block, id }]);
  return id;
}

export function updateBlockedSlot(id: string, update: Partial<SharedBlockedSlot>) {
  store.set(prev => prev.map(b => b.id === id ? { ...b, ...update } : b));
}

export function removeBlockedSlot(id: string) {
  store.set(prev => prev.filter(b => b.id !== id));
}

/** Get blocked slots for a specific date */
export function getBlockedSlotsForDate(blocks: SharedBlockedSlot[], date: string) {
  return blocks.filter(b => b.date === date);
}
