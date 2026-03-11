/**
 * seedStores.ts — Centralized initialization of ALL shared stores.
 * Called once at app startup from App.tsx.
 * Seeds each store with mock data if it's empty (first load).
 * Auto-refreshes appointments when the day changes (dates are relative to today).
 *
 * This eliminates per-page seeding, mock fallbacks, and the confusion
 * between mock data and localStorage state.
 */
import { initHealthStoreIfEmpty, type HealthState } from "./healthStore";
import { initStockIfEmpty, initPharmacyRxIfEmpty, type StockItem } from "./pharmacyStore";
import { initDoctorPrescriptionsIfEmpty } from "./doctorPrescriptionsStore";
import { initBillingStoreIfEmpty, type SharedInvoice } from "./billingStore";
import { initLabStoreIfEmpty, type SharedLabDemand } from "./labStore";
import { sharedAppointmentsStore } from "./sharedAppointmentsStore";
import { seedNotificationsIfEmpty, notificationsStore } from "./notificationsStore";
import { sharedPatientsStore } from "./sharedPatientsStore";
import { sharedAvailabilityStore } from "./sharedAvailabilityStore";
import { sharedBlockedSlotsStore } from "./sharedBlockedSlotsStore";
import { sharedLeavesStore } from "./sharedLeavesStore";
import { sharedTarifsStore } from "./sharedTarifsStore";
import { doctorProfileStore } from "./doctorProfileStore";

// Mock data imports (used only for seeding)
import {
  mockHealthDocuments, mockAntecedents, mockTreatments, mockAllergies,
  mockHabits, mockFamilyHistory, mockSurgeries, mockVaccinations, mockMeasures,
} from "@/data/mocks/patient";
import { mockDoctorPrescriptions } from "@/data/mocks/doctor";
import { mockPharmacyStock, mockPharmacyPrescriptions } from "@/data/mocks/pharmacy";
import { mockSecretaryBillingInvoices } from "@/data/mocks/secretary";
import { mockLabDemands } from "@/data/mocks/lab";

let seeded = false;

const SEED_DATE_KEY = "medicare_seed_date";

/** All store instances for reset */
const ALL_STORES = [
  sharedAppointmentsStore,
  sharedPatientsStore,
  sharedAvailabilityStore,
  sharedBlockedSlotsStore,
  sharedLeavesStore,
  sharedTarifsStore,
  notificationsStore,
  doctorProfileStore,
];

const ALL_STORAGE_KEYS = [
  "medicare_shared_appointments",
  "medicare_shared_patients",
  "medicare_availability",
  "medicare_blocked_slots",
  "medicare_leaves",
  "medicare_tarifs",
  "medicare_notifications",
  "medicare_doctor_profile",
  "medicare_health",
  "medicare_doctor_prescriptions",
  "medicare_pharmacy_stock",
  "medicare_pharmacy_prescriptions",
  "medicare_billing",
  "medicare_lab_demands",
  "medicare_shared_prescriptions",
  "doctor_renewal_requests",
  "doctor_profile_completion",
  "medicare_patient_profile",
  "medicare_favorite_doctors",
  SEED_DATE_KEY,
];

export function seedAllStores() {
  if (seeded) return;
  seeded = true;

  // ── Auto-refresh appointments when day changes ──
  const today = new Date().toISOString().slice(0, 10);
  const lastSeedDate = localStorage.getItem(SEED_DATE_KEY);
  if (lastSeedDate !== today) {
    localStorage.removeItem("medicare_shared_appointments");
    localStorage.setItem(SEED_DATE_KEY, today);
    sharedAppointmentsStore.set(sharedAppointmentsStore.read());
  }

  // ── Patient Health ──
  const healthData: HealthState = {
    documents: mockHealthDocuments,
    antecedents: mockAntecedents,
    treatments: mockTreatments,
    allergies: mockAllergies,
    habits: mockHabits,
    familyHistory: mockFamilyHistory,
    surgeries: mockSurgeries,
    vaccinations: mockVaccinations,
    measures: mockMeasures,
  };
  initHealthStoreIfEmpty(healthData);

  // ── Doctor Prescriptions ──
  initDoctorPrescriptionsIfEmpty(mockDoctorPrescriptions);

  // ── Pharmacy ──
  initStockIfEmpty(mockPharmacyStock as StockItem[]);
  initPharmacyRxIfEmpty(mockPharmacyPrescriptions);

  // ── Billing ──
  const billingData: SharedInvoice[] = mockSecretaryBillingInvoices.map(inv => ({
    ...inv,
    status: inv.status as "paid" | "pending" | "overdue",
    createdBy: "secretary" as const,
  }));
  initBillingStoreIfEmpty(billingData);

  // ── Lab ──
  initLabStoreIfEmpty(mockLabDemands as SharedLabDemand[]);

  // ── Notifications ──
  seedNotificationsIfEmpty();
}

/**
 * Reset ALL stores and re-seed with fresh demo data.
 * Used by SimulationPanel "⚡ Réinitialiser".
 */
export function resetDemo() {
  // Clear all localStorage keys
  ALL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));

  // Reset all stores to initial data
  ALL_STORES.forEach(s => s.reset());

  // Force re-seed
  seeded = false;
  seedAllStores();
}
