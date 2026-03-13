/**
 * doctorDocumentsStore.ts — Persisted document templates store.
 * // TODO BACKEND: Replace with API
 */
import { createStore, useStore } from "./crossRoleStore";

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

export function seedDocTemplatesIfEmpty(templates: DocTemplate[]) {
  const current = store.read();
  if (current.length === 0) {
    store.set(templates);
  }
}
