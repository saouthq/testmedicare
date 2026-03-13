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
import { reportsStore, seedReportsIfEmpty } from "./reportsStore";
import { threadsStore, messagesItemsStore, seedMessagesIfEmpty } from "./messagesStore";
import { seedReviewsIfEmpty, reviewsStore } from "./reviewsStore";
import { seedDirectoryIfEmpty, directoryStore } from "./directoryStore";
import { seedProtocolsIfEmpty, doctorProtocolsStore } from "./doctorProtocolsStore";
import { seedDocTemplatesIfEmpty, doctorDocumentsStore } from "./doctorDocumentsStore";

// Mock data imports (used only for seeding)
import {
  mockHealthDocuments, mockAntecedents, mockTreatments, mockAllergies,
  mockHabits, mockFamilyHistory, mockSurgeries, mockVaccinations, mockMeasures,
} from "@/data/mocks/patient";
import { mockDoctorPrescriptions } from "@/data/mocks/doctor";
import { mockPharmacyStock, mockPharmacyPrescriptions } from "@/data/mocks/pharmacy";
import { mockSecretaryBillingInvoices } from "@/data/mocks/secretary";
import { mockLabDemands } from "@/data/mocks/lab";
import { seedAdminStoreIfEmpty, adminStore } from "./adminStore";
import { adminSeedData } from "@/data/mocks/adminSeed";
import { getAppMode } from "./authStore";

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
  reportsStore,
  threadsStore,
  messagesItemsStore,
  adminStore,
  reviewsStore,
  directoryStore,
  doctorProtocolsStore,
  doctorDocumentsStore,
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
  "medicare_reports",
  "medicare_chat_threads",
  "medicare_chat_messages",
  "medicare_admin",
  "medicare_reviews",
  "medicare_directory",
  "medicare_doctor_protocols",
  "medicare_doctor_templates",
  "doctor_renewal_requests",
  "doctor_profile_completion",
  "medicare_patient_profile",
  "medicare_favorite_doctors",
  SEED_DATE_KEY,
];

export function seedAllStores() {
  if (seeded) return;
  seeded = true;

  // ── In Production mode, skip ALL mock data seeding ──
  if (getAppMode() === "production") {
    console.log("[seedStores] Production mode — skipping mock data");
    return;
  }
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

  // ── Reports / Disputes ──
  seedReportsIfEmpty();

  // ── Messaging ──
  seedMessagesIfEmpty();

  // ── Admin central store ──
  seedAdminStoreIfEmpty(adminSeedData);

  // ── Reviews ──
  seedReviewsIfEmpty();

  // ── Directory (public data) ──
  seedDirectoryIfEmpty();

  // ── Doctor Protocols ──
  seedProtocolsIfEmpty([
    { id: 1, name: "Suivi diabète type 2", type: "followup", specialty: "Généraliste", description: "Protocole standard de suivi trimestriel du patient diabétique de type 2", steps: ["Contrôle glycémie à jeun + HbA1c", "Mesure TA + poids + IMC", "Examen des pieds", "Renouvellement traitement si stable", "Bilan rénal + lipidique annuel"], meds: ["Metformine 850mg x2/j", "Glibenclamide 5mg x1/j"], examens: ["HbA1c", "Glycémie à jeun", "Bilan rénal", "Bilan lipidique"], duration: "20 min", favorite: true, usageCount: 45, lastUsed: "20 Fév 2026" },
    { id: 2, name: "Bilan hypertension", type: "consultation", specialty: "Cardiologue", description: "Première consultation pour suspicion d'hypertension artérielle", steps: ["Anamnèse complète + ATCD familiaux", "Mesure TA bras droit + gauche", "ECG 12 dérivations", "Fond d'oeil si HTA sévère", "Bilan biologique complet"], examens: ["ECG", "Bilan rénal", "Ionogramme", "Bilan lipidique"], duration: "45 min", favorite: true, usageCount: 28, lastUsed: "19 Fév 2026" },
    { id: 3, name: "Rhinopharyngite aiguë", type: "prescription", specialty: "Généraliste", description: "Traitement standard de la rhinopharyngite virale de l'adulte", steps: ["Examen ORL", "Vérifier absence d'infection bactérienne", "Prescription traitement symptomatique"], meds: ["Paracétamol 1g x3/j pendant 5j", "Sérum physiologique lavage nasal", "Miel + citron"], duration: "15 min", favorite: false, usageCount: 62, lastUsed: "20 Fév 2026" },
    { id: 4, name: "Check-up annuel complet", type: "procedure", specialty: "Généraliste", description: "Bilan de santé annuel complet avec tous les examens recommandés", steps: ["Interrogatoire complet", "Examen clinique général", "Auscultation cardio-pulmonaire", "Palpation abdominale", "Examen neurologique de base", "Vérification calendrier vaccinal", "Prescription bilan biologique"], examens: ["NFS", "Glycémie", "Bilan lipidique", "Bilan hépatique", "Bilan rénal", "TSH", "Vitamine D"], duration: "60 min", favorite: true, usageCount: 15, lastUsed: "18 Fév 2026" },
  ]);

  // ── Doctor Document Templates ──
  seedDocTemplatesIfEmpty([
    { id: 1, name: "Certificat médical standard", category: "certificat", content: "Je soussigné Dr. {{NOM_MEDECIN}}, certifie avoir examiné ce jour {{DATE}} M./Mme {{NOM_PATIENT}}, né(e) le {{DATE_NAISSANCE}}.\n\nL'état de santé du patient nécessite un repos de {{DUREE}} jours à compter du {{DATE_DEBUT}}.\n\nCertificat établi à la demande de l'intéressé(e) pour servir et valoir ce que de droit.", variables: ["NOM_MEDECIN", "DATE", "NOM_PATIENT", "DATE_NAISSANCE", "DUREE", "DATE_DEBUT"], usageCount: 45, lastUsed: "10 Mar 2026", createdAt: "Jan 2025" },
    { id: 2, name: "Arrêt maladie", category: "arret", content: "Arrêt de travail pour maladie\n\nPatient : {{NOM_PATIENT}}\nDurée : {{DUREE}} jours\nDu {{DATE_DEBUT}} au {{DATE_FIN}}\nDiagnostic : {{DIAGNOSTIC}}\n\nDr. {{NOM_MEDECIN}}", variables: ["NOM_PATIENT", "DUREE", "DATE_DEBUT", "DATE_FIN", "DIAGNOSTIC", "NOM_MEDECIN"], usageCount: 32, lastUsed: "8 Mar 2026", createdAt: "Jan 2025" },
    { id: 3, name: "Lettre d'adressage", category: "courrier", content: "Cher(e) Confrère/Consœur,\n\nJe vous adresse M./Mme {{NOM_PATIENT}}, âgé(e) de {{AGE}} ans, pour {{MOTIF}}.\n\nAntécédents notables : {{ANTECEDENTS}}\nTraitement en cours : {{TRAITEMENT}}\n\nJe vous remercie de votre avis éclairé.\n\nConfraternellement,\nDr. {{NOM_MEDECIN}}", variables: ["NOM_PATIENT", "AGE", "MOTIF", "ANTECEDENTS", "TRAITEMENT", "NOM_MEDECIN"], usageCount: 18, lastUsed: "5 Mar 2026", createdAt: "Fév 2025" },
    { id: 4, name: "Certificat d'aptitude sportive", category: "certificat", content: "Je soussigné Dr. {{NOM_MEDECIN}}, certifie que M./Mme {{NOM_PATIENT}} a été examiné(e) ce jour et ne présente pas de contre-indication apparente à la pratique du sport en compétition / loisir.\n\nCertificat valable 1 an.", variables: ["NOM_MEDECIN", "NOM_PATIENT"], usageCount: 12, lastUsed: "1 Mar 2026", createdAt: "Mar 2025" },
    { id: 5, name: "Compte-rendu opératoire", category: "compte_rendu", content: "COMPTE-RENDU OPÉRATOIRE\n\nPatient : {{NOM_PATIENT}}\nDate : {{DATE}}\nIntervention : {{INTERVENTION}}\n\nDéroulement : {{DEROULEMENT}}\n\nSuites opératoires : {{SUITES}}\n\nDr. {{NOM_MEDECIN}}", variables: ["NOM_PATIENT", "DATE", "INTERVENTION", "DEROULEMENT", "SUITES", "NOM_MEDECIN"], usageCount: 7, lastUsed: "20 Fév 2026", createdAt: "Avr 2025" },
  ]);

  // ── Appointment reminders (simulated cron) ──
  import("./sharedAppointmentsStore").then(m => {
    if (m.checkUpcomingReminders) m.checkUpcomingReminders();
  }).catch(() => { /* ignore */ });
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

/**
 * Clear ALL mock data from localStorage and stores.
 * Used when switching to Production mode.
 */
export function clearAllMockData() {
  ALL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  ALL_STORES.forEach(s => s.reset());
  seeded = false;
  console.log("[seedStores] All mock data cleared for Production mode");
}
