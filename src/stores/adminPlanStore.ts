/**
 * adminPlanStore.ts — Admin CRUD for subscription plans per role.
 * Plans have monthly/annual pricing, descriptions, features, and status.
 * Persists in localStorage.
 * // TODO BACKEND: Replace with real API
 */
import { createStore, useStore } from "./crossRoleStore";
import { appendLog } from "@/services/admin/adminAuditService";
import { saveAdminConfig, loadAdminConfig } from "./adminConfigSync";

export type PlanRole = "doctor" | "pharmacy" | "laboratory" | "clinic" | "hospital";
export type PlanBillingCycle = "monthly" | "annual";
export type PlanStatus = "active" | "draft" | "archived";

export interface AdminPlan {
  id: string;
  role: PlanRole;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number; // per month when billed annually
  trialDays: number;
  status: PlanStatus;
  highlighted: boolean;
  features: string[]; // feature IDs from featureCatalog
  maxUsers?: number; // for clinic/hospital
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const roleLabels: Record<PlanRole, string> = {
  doctor: "Médecin",
  pharmacy: "Pharmacie",
  laboratory: "Laboratoire",
  clinic: "Clinique",
  hospital: "Hôpital",
};

export { roleLabels as planRoleLabels };

const defaultPlans: AdminPlan[] = [
  // Doctor plans
  { id: "plan-doc-essential", role: "doctor", name: "Essentiel", description: "Gestion agenda et dossier patient basique", monthlyPrice: 49, annualPrice: 39, trialDays: 14, status: "active", highlighted: false, features: ["agenda_online", "sms_reminders", "recurring_slots", "patient_file_basic", "support_email", "stats_basic"], sortOrder: 1, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  { id: "plan-doc-pro", role: "doctor", name: "Pro", description: "Gestion complète du cabinet avec téléconsultation", monthlyPrice: 149, annualPrice: 129, trialDays: 14, status: "active", highlighted: true, features: ["agenda_online", "sms_reminders", "recurring_slots", "patient_file_basic", "patient_file_full", "vitals_tracking", "medical_history", "prescription_basic", "prescription_digital_send", "prescription_templates", "teleconsult_video", "teleconsult_chat", "lab_request", "lab_results_view", "ai_assistant", "stats_basic", "stats_advanced", "support_email", "support_priority"], sortOrder: 2, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  { id: "plan-doc-cabinet", role: "doctor", name: "Cabinet+", description: "Multi-praticiens avec secrétariat partagé", monthlyPrice: 299, annualPrice: 249, trialDays: 14, status: "active", highlighted: false, features: ["agenda_online", "sms_reminders", "recurring_slots", "multi_location", "patient_queue", "patient_file_basic", "patient_file_full", "vitals_tracking", "medical_history", "shared_records", "prescription_basic", "prescription_specialized", "prescription_digital_send", "prescription_renewal", "prescription_templates", "teleconsult_video", "teleconsult_chat", "teleconsult_screen_share", "lab_request", "lab_results_view", "ai_assistant", "ai_specialized", "auto_report", "stats_basic", "stats_advanced", "multi_practitioners", "shared_secretary", "centralized_billing", "api_integrations", "account_manager", "support_email", "support_priority", "onsite_training"], maxUsers: 5, sortOrder: 3, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  // Pharmacy plans
  { id: "plan-pha-standard", role: "pharmacy", name: "Standard", description: "Gestion pharmacie basique", monthlyPrice: 79, annualPrice: 59, trialDays: 14, status: "active", highlighted: false, features: ["rx_reception", "stock_basic", "guard_schedule", "support_email"], sortOrder: 1, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  { id: "plan-pha-premium", role: "pharmacy", name: "Premium", description: "Pharmacie connectée avec stock avancé", monthlyPrice: 149, annualPrice: 129, trialDays: 14, status: "active", highlighted: true, features: ["rx_reception", "stock_basic", "stock_advanced", "substitution_auto", "guard_schedule", "support_email", "support_priority"], sortOrder: 2, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  // Laboratory plans
  { id: "plan-lab-standard", role: "laboratory", name: "Standard", description: "Gestion labo basique", monthlyPrice: 79, annualPrice: 59, trialDays: 14, status: "active", highlighted: false, features: ["lab_request", "lab_results_view", "support_email"], sortOrder: 1, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  { id: "plan-lab-premium", role: "laboratory", name: "Premium", description: "Labo connecté avec automates", monthlyPrice: 149, annualPrice: 129, trialDays: 14, status: "active", highlighted: true, features: ["lab_request", "lab_results_view", "lab_auto_integration", "support_email", "support_priority"], sortOrder: 2, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  // Clinic
  { id: "plan-cli-pro", role: "clinic", name: "Établissement", description: "Gestion multi-services pour cliniques", monthlyPrice: 499, annualPrice: 399, trialDays: 30, status: "active", highlighted: true, features: ["agenda_online", "sms_reminders", "patient_file_full", "multi_practitioners", "shared_secretary", "centralized_billing", "support_priority"], maxUsers: 20, sortOrder: 1, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  // Hospital
  { id: "plan-hos-pro", role: "hospital", name: "Hospitalier", description: "Gestion hospitalière complète", monthlyPrice: 999, annualPrice: 799, trialDays: 30, status: "active", highlighted: true, features: ["agenda_online", "patient_file_full", "shared_records", "multi_practitioners", "centralized_billing", "api_integrations", "account_manager", "support_priority", "onsite_training"], maxUsers: 50, sortOrder: 1, createdAt: "2025-01-01", updatedAt: "2025-01-01" },
];

const store = createStore<AdminPlan[]>("medicare_admin_plans", defaultPlans);

export function useAdminPlans() {
  return useStore(store);
}

export function getPlans(): AdminPlan[] {
  return store.read();
}

export function getPlansByRole(role: PlanRole): AdminPlan[] {
  return getPlans().filter(p => p.role === role && p.status === "active").sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPlanById(id: string): AdminPlan | undefined {
  return getPlans().find(p => p.id === id);
}

export function createPlan(plan: Omit<AdminPlan, "id" | "createdAt" | "updatedAt">, motif: string): AdminPlan {
  const entry: AdminPlan = {
    ...plan,
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.set(prev => [entry, ...prev]);
  appendLog("plan_created", "plan", entry.id, `Plan "${entry.name}" (${roleLabels[entry.role]}) créé — ${motif}`);
  return entry;
}

export function updatePlan(id: string, updates: Partial<AdminPlan>, motif: string) {
  store.set(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  appendLog("plan_updated", "plan", id, `Plan modifié — ${motif}`);
}

export function togglePlanStatus(id: string, status: PlanStatus, motif: string) {
  store.set(prev => prev.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p));
  const plan = getPlanById(id);
  appendLog("plan_status_changed", "plan", id, `Plan "${plan?.name}" → ${status} — ${motif}`);
}

export function deletePlan(id: string, motif: string) {
  const plan = getPlanById(id);
  store.set(prev => prev.filter(p => p.id !== id));
  appendLog("plan_deleted", "plan", id, `Plan "${plan?.name}" supprimé — ${motif}`);
}
