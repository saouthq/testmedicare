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

export function seedAllStores() {
  if (seeded) return;
  seeded = true;

  // ── Auto-refresh appointments when day changes ──
  // The seed data uses relDate() which computes dates relative to today.
  // If localStorage was seeded yesterday, the "today" appointments are now stale.
  const today = new Date().toISOString().slice(0, 10);
  const lastSeedDate = localStorage.getItem(SEED_DATE_KEY);
  if (lastSeedDate !== today) {
    // Clear appointment store to re-seed with fresh relative dates
    localStorage.removeItem("medicare_shared_appointments");
    localStorage.setItem(SEED_DATE_KEY, today);
    // The store will read initialData (fresh seed) since localStorage is empty
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
}
