/**
 * directoryStore.ts — Public directory data (doctors, clinics, hospitals, pharmacies, medicines).
 * Seeded from mocks, manageable by admin.
 * // TODO BACKEND: Replace with API
 */
import { createStore, useStore } from "./crossRoleStore";
import type { Doctor } from "@/types";
import type { MockClinic, MockHospital, MockPublicPharmacy } from "@/data/mocks/establishments";
import type { MockMedicine } from "@/data/mocks/medicines";

export interface DirectoryState {
  doctors: Doctor[];
  clinics: MockClinic[];
  hospitals: MockHospital[];
  pharmacies: MockPublicPharmacy[];
  medicines: MockMedicine[];
}

const emptyState: DirectoryState = {
  doctors: [],
  clinics: [],
  hospitals: [],
  pharmacies: [],
  medicines: [],
};

export const directoryStore = createStore<DirectoryState>("medicare_directory", emptyState);

export function useDirectory() {
  return useStore(directoryStore);
}

export function useDoctorsDirectory() {
  const [state] = useDirectory();
  return state.doctors;
}

export function useClinicsDirectory() {
  const [state] = useDirectory();
  return state.clinics;
}

export function useHospitalsDirectory() {
  const [state] = useDirectory();
  return state.hospitals;
}

export function usePharmaciesDirectory() {
  const [state] = useDirectory();
  return state.pharmacies;
}

export function useMedicinesDirectory() {
  const [state] = useDirectory();
  return state.medicines;
}

export function seedDirectoryIfEmpty() {
  const current = directoryStore.read();
  if (current.doctors.length === 0) {
    // Lazy import to avoid circular deps
    const { mockDoctors } = require("@/data/mocks/doctor");
    const { mockClinics, mockHospitals, mockPublicPharmacies } = require("@/data/mocks/establishments");
    const { mockMedicines, mockTopMedicines } = require("@/data/mocks/medicines");
    directoryStore.set({
      doctors: mockDoctors,
      clinics: mockClinics,
      hospitals: mockHospitals,
      pharmacies: mockPublicPharmacies,
      medicines: mockMedicines || mockTopMedicines || [],
    });
  }
}
