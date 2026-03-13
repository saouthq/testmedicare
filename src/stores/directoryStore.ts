/**
 * directoryStore.ts — Public directory data (doctors, clinics, hospitals, pharmacies, medicines).
 * Dual-mode: Supabase in production, localStorage for demo.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useDualQuery } from "@/hooks/useDualData";
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

// Individual stores for dual-mode per-entity queries
const doctorsListStore = createStore<Doctor[]>("medicare_dir_doctors", []);
const clinicsListStore = createStore<MockClinic[]>("medicare_dir_clinics", []);
const hospitalsListStore = createStore<MockHospital[]>("medicare_dir_hospitals", []);
const pharmaciesListStore = createStore<MockPublicPharmacy[]>("medicare_dir_pharmacies", []);
const medicinesListStore = createStore<MockMedicine[]>("medicare_dir_medicines", []);

export function useDirectory() {
  return useStore(directoryStore);
}

// ─── Dual-mode directory hooks ──────────────────────────────

function mapDoctorRow(row: any): Doctor {
  return {
    id: row.id,
    name: `Dr. ${row.first_name || ""} ${row.last_name || ""}`.trim() || row.id,
    specialty: row.specialty || "",
    city: row.city || "Tunis",
    address: row.address || "",
    phone: row.phone || "",
    rating: row.rating || 0,
    reviewCount: 0,
    photoUrl: row.photo_url || "",
    languages: row.languages || ["Français", "Arabe"],
    consultationPrice: row.consultation_price || 0,
    teleconsultation: row.teleconsultation || false,
    acceptsNewPatients: row.accepts_new_patients ?? true,
    verified: row.verified || false,
    bio: row.bio || "",
    lat: row.lat || 0,
    lng: row.lng || 0,
  };
}

function mapClinicRow(row: any): MockClinic {
  return {
    id: row.id,
    name: row.name || "",
    city: row.city || "Tunis",
    address: row.address || "",
    phone: row.phone || "",
    email: row.email || "",
    photoUrl: row.photo_url || "",
    rating: row.rating || 0,
    doctorsCount: row.doctors_count || 0,
    services: row.services || [],
    verified: row.verified || false,
  };
}

function mapHospitalRow(row: any): MockHospital {
  return {
    id: row.id,
    name: row.name || "",
    city: row.city || "Tunis",
    address: row.address || "",
    phone: row.phone || "",
    email: row.email || "",
    photoUrl: row.photo_url || "",
    rating: row.rating || 0,
    type: row.type || "public",
    bedsCount: row.beds_count || 0,
    departments: row.departments || [],
    verified: row.verified || false,
  };
}

function mapPharmacyRow(row: any): MockPublicPharmacy {
  return {
    id: row.id,
    name: row.name || "",
    city: row.city || "Tunis",
    address: row.address || "",
    phone: row.phone || "",
    photoUrl: row.photo_url || "",
    rating: row.rating || 0,
    isGuard: row.is_guard || false,
    guardDate: row.guard_date || "",
    lat: row.lat || 0,
    lng: row.lng || 0,
    verified: row.verified || false,
  };
}

function mapMedicineRow(row: any): MockMedicine {
  return {
    id: row.id,
    name: row.name || "",
    dci: row.dci || "",
    form: row.form || "",
    lab: row.lab || "",
    category: row.category || "",
    price: row.price || 0,
    description: row.description || "",
    photoUrl: row.photo_url || "",
  };
}

export function useDoctorsDirectory(): Doctor[] {
  // Sync from directoryStore to individual store for demo
  const [dirState] = useDirectory();
  if (dirState.doctors.length > 0 && doctorsListStore.read().length === 0) {
    doctorsListStore.set(dirState.doctors);
  }

  const [data] = useDualQuery<Doctor[]>({
    store: doctorsListStore,
    tableName: "doctors_directory",
    select: "*, profiles!doctors_directory_id_fkey(first_name, last_name)",
    queryKey: ["doctors_directory"],
    mapRowToLocal: (row: any) => ({
      ...mapDoctorRow(row),
      name: row.profiles ? `Dr. ${row.profiles.first_name} ${row.profiles.last_name}`.trim() : mapDoctorRow(row).name,
    }),
  });
  return data;
}

export function useClinicsDirectory(): MockClinic[] {
  const [dirState] = useDirectory();
  if (dirState.clinics.length > 0 && clinicsListStore.read().length === 0) {
    clinicsListStore.set(dirState.clinics);
  }
  const [data] = useDualQuery<MockClinic[]>({
    store: clinicsListStore,
    tableName: "clinics_directory",
    queryKey: ["clinics_directory"],
    mapRowToLocal: mapClinicRow,
  });
  return data;
}

export function useHospitalsDirectory(): MockHospital[] {
  const [dirState] = useDirectory();
  if (dirState.hospitals.length > 0 && hospitalsListStore.read().length === 0) {
    hospitalsListStore.set(dirState.hospitals);
  }
  const [data] = useDualQuery<MockHospital[]>({
    store: hospitalsListStore,
    tableName: "hospitals_directory",
    queryKey: ["hospitals_directory"],
    mapRowToLocal: mapHospitalRow,
  });
  return data;
}

export function usePharmaciesDirectory(): MockPublicPharmacy[] {
  const [dirState] = useDirectory();
  if (dirState.pharmacies.length > 0 && pharmaciesListStore.read().length === 0) {
    pharmaciesListStore.set(dirState.pharmacies);
  }
  const [data] = useDualQuery<MockPublicPharmacy[]>({
    store: pharmaciesListStore,
    tableName: "pharmacies_directory",
    queryKey: ["pharmacies_directory"],
    mapRowToLocal: mapPharmacyRow,
  });
  return data;
}

export function useMedicinesDirectory(): MockMedicine[] {
  const [dirState] = useDirectory();
  if (dirState.medicines.length > 0 && medicinesListStore.read().length === 0) {
    medicinesListStore.set(dirState.medicines);
  }
  const [data] = useDualQuery<MockMedicine[]>({
    store: medicinesListStore,
    tableName: "medicines",
    queryKey: ["medicines"],
    mapRowToLocal: mapMedicineRow,
  });
  return data;
}

/** Supabase-aware doctors directory hook (legacy compat) */
export function useDoctorsDirectorySupabase() {
  const doctors = useDoctorsDirectory();
  return { data: doctors, isLoading: false };
}

export function seedDirectoryIfEmpty() {
  const current = directoryStore.read();
  if (current.doctors.length === 0) {
    Promise.all([
      import("@/data/mocks/doctor"),
      import("@/data/mocks/establishments"),
      import("@/data/mocks/medicines"),
    ]).then(([docMod, estMod, medMod]) => {
      directoryStore.set({
        doctors: docMod.mockDoctors,
        clinics: estMod.mockClinics,
        hospitals: estMod.mockHospitals,
        pharmacies: estMod.mockPublicPharmacies,
        medicines: (medMod as any).mockMedicines || (medMod as any).mockTopMedicines || [],
      });
    });
  }
}
