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
    avatar: row.photo_url || "",
    address: row.address || "",
    phone: row.phone || "",
    reviewCount: 0,
    price: row.consultation_price || 0,
    languages: row.languages || ["Français", "Arabe"],
    teleconsultation: row.teleconsultation || false,
    acceptsInsurance: true,
    nextSlot: "",
    availAM: [true, true, true, true, true, true, false],
    availPM: [true, true, false, true, true, false, false],
  };
}

function mapClinicRow(row: any): MockClinic {
  return {
    id: row.id,
    name: row.name || "",
    slug: (row.name || "").toLowerCase().replace(/\s+/g, "-"),
    city: row.city || "Tunis",
    address: row.address || "",
    phone: row.phone || "",
    services: row.services || [],
    description: "",
  };
}

function mapHospitalRow(row: any): MockHospital {
  return {
    id: row.id,
    name: row.name || "",
    slug: (row.name || "").toLowerCase().replace(/\s+/g, "-"),
    city: row.city || "Tunis",
    address: row.address || "",
    phone: row.phone || "",
    services: row.departments || [],
    urgences: true,
    description: "",
  };
}

function mapPharmacyRow(row: any): MockPublicPharmacy {
  return {
    id: row.id,
    name: row.name || "",
    slug: (row.name || "").toLowerCase().replace(/\s+/g, "-"),
    city: row.city || "Tunis",
    address: row.address || "",
    phone: row.phone || "",
    horaires: "",
    deGarde: row.is_guard || false,
  };
}

function mapMedicineRow(row: any): MockMedicine {
  return {
    id: row.id,
    name: row.name || "",
    slug: (row.name || "").toLowerCase().replace(/\s+/g, "-"),
    dosage: "",
    form: row.form || "",
    category: row.category || "",
    summary: row.description || "",
    indications: [],
    dosageText: "",
    contraindications: [],
    sideEffects: [],
    interactions: [],
    warnings: [],
    pregnancyInfo: "",
    storage: "",
    faq: [],
    similarSlugs: [],
  };
}

export function useDoctorsDirectory(): Doctor[] {
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

/** Legacy compat */
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
