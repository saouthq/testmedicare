/**
 * doctorProtocolsStore.ts — Persisted protocols store.
 * // TODO BACKEND: Replace with API
 */
import { createStore, useStore } from "./crossRoleStore";

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

export function seedProtocolsIfEmpty(protocols: Protocol[]) {
  const current = store.read();
  if (current.length === 0) {
    store.set(protocols);
  }
}
