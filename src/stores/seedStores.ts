/**
 * seedStores.ts — Centralized initialization of ALL shared stores.
 * Called once at app startup from App.tsx.
 * Seeds each store with mock data if it's empty (first load).
 *
 * This eliminates per-page seeding, mock fallbacks, and the confusion
 * between mock data and localStorage state.
 */
import { initHealthStoreIfEmpty, type HealthState } from "./healthStore";
import { initStockIfEmpty, initPharmacyRxIfEmpty, type StockItem } from "./pharmacyStore";
import { initDoctorPrescriptionsIfEmpty } from "./doctorPrescriptionsStore";
import { initBillingStoreIfEmpty, type SharedInvoice } from "./billingStore";
import { initLabStoreIfEmpty, type SharedLabDemand } from "./labStore";

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

export function seedAllStores() {
  if (seeded) return;
  seeded = true;

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
