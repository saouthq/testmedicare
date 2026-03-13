/**
 * Demo implementation of PrescriptionRepository.
 */
import type { PrescriptionRepository } from "./repository";
import type { Prescription } from "@/types/prescription";
import { doctorPrescriptionsStore } from "@/stores/doctorPrescriptionsStore";

export const demoPrescriptionRepo: PrescriptionRepository = {
  async listByDoctor() {
    return doctorPrescriptionsStore.read();
  },

  async listByPatient(patientId: number) {
    // In demo mode, filter by patient name since we don't have IDs on all prescriptions
    return doctorPrescriptionsStore.read();
  },

  async getById(id: string) {
    return doctorPrescriptionsStore.read().find(p => p.id === id) || null;
  },

  async create(rx) {
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const newRx: Prescription = { ...rx, id };
    doctorPrescriptionsStore.set(prev => [newRx, ...prev]);
    return newRx;
  },

  async update(id, data) {
    doctorPrescriptionsStore.set(prev =>
      prev.map(p => p.id === id ? { ...p, ...data } : p)
    );
  },

  async sendToPharmacy(id, pharmacy) {
    doctorPrescriptionsStore.set(prev =>
      prev.map(p => p.id === id ? { ...p, pharmacy, sent: true } : p)
    );
  },
};
