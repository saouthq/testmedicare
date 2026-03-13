/**
 * Demo implementation of PatientRepository.
 */
import type { PatientRepository } from "./repository";
import type { SharedPatient } from "@/stores/sharedPatientsStore";
import { sharedPatientsStore, addPatient } from "@/stores/sharedPatientsStore";

export const demoPatientRepo: PatientRepository = {
  async listByDoctor() {
    return sharedPatientsStore.read();
  },

  async getById(id: number) {
    return sharedPatientsStore.read().find(p => p.id === id) || null;
  },

  async create(patient) {
    const id = await addPatient(patient);
    return sharedPatientsStore.read().find(p => p.id === id)!;
  },

  async update(id, data) {
    sharedPatientsStore.set(prev =>
      prev.map(p => p.id === id ? { ...p, ...data } : p)
    );
  },
};
