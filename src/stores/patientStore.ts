/**
 * patientStore.ts — Patient profile state.
 * Appointments are now managed via sharedAppointmentsStore.
 * TODO BACKEND: Replace with real API
 */
import { createStore, useStore } from "./crossRoleStore";

// ── Patient Profile ──
export interface PatientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  gouvernorat: string;
  bloodType: string;
  insurance: string;
  insuranceNumber: string;
  treatingDoctor: string;
  allergies: string[];
}

const defaultProfile: PatientProfile = {
  firstName: "Amine",
  lastName: "Ben Ali",
  email: "amine@email.tn",
  phone: "+216 22 345 678",
  dob: "1991-03-15",
  address: "El Manar, Tunis",
  gouvernorat: "Tunis",
  bloodType: "A+",
  insurance: "maghrebia",
  insuranceNumber: "MAG-2024-001234",
  treatingDoctor: "Dr. Ahmed Bouazizi",
  allergies: ["Pénicilline", "Acariens"],
};

// ── Store ──
const profileStore = createStore<PatientProfile>("medicare_patient_profile", defaultProfile);

// ── Hooks ──
export function usePatientProfile() { return useStore(profileStore); }

// ── Actions ──
/** Update patient profile */
export function updatePatientProfile(updates: Partial<PatientProfile>) {
  profileStore.set(prev => ({ ...prev, ...updates }));
}

// Read-only access for non-React contexts
export const readProfile = () => profileStore.read();
