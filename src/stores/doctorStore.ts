/**
 * doctorStore.ts — Doctor-specific state (renewal requests, profile completion).
 * Waiting room and consultations are now managed via sharedAppointmentsStore.
 *
 * // TODO BACKEND: Replace with real-time API + WebSocket subscriptions.
 */
import { createStore, useStore } from "./crossRoleStore";
import { notifyPatient, notifyDoctor } from "./notificationsStore";
import { appendLog } from "@/services/admin/adminAuditService";
export interface RenewalRequest {
  id: string;
  patientName: string;
  patientAvatar: string;
  prescriptionId: string;
  items: string[];
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface DoctorProfileCompletion {
  identity: boolean;
  cabinet: boolean;
  motifs: boolean;
  horaires: boolean;
  photo: boolean;
  diplomas: boolean;
  presentation: boolean;
}

// ─── Initial data ────────────────────────────────────────────
const initialRenewals: RenewalRequest[] = [
  {
    id: "ren-1",
    patientName: "Amine Ben Ali",
    patientAvatar: "AB",
    prescriptionId: "RX-001",
    items: ["Metformine 850mg", "Glibenclamide 5mg"],
    requestedAt: "2026-03-08T10:30:00",
    status: "pending",
  },
  {
    id: "ren-2",
    patientName: "Fatma Trabelsi",
    patientAvatar: "FT",
    prescriptionId: "RX-003",
    items: ["Levothyrox 75µg"],
    requestedAt: "2026-03-07T14:00:00",
    status: "pending",
  },
];

const initialProfileCompletion: DoctorProfileCompletion = {
  identity: true,
  cabinet: true,
  motifs: true,
  horaires: true,
  photo: false,
  diplomas: true,
  presentation: true,
};

// ─── Stores ──────────────────────────────────────────────────
export const renewalRequestsStore = createStore<RenewalRequest[]>("doctor_renewal_requests", initialRenewals);
export const profileCompletionStore = createStore<DoctorProfileCompletion>("doctor_profile_completion", initialProfileCompletion);

// ─── Hooks ───────────────────────────────────────────────────
export function useRenewalRequests() { return useStore(renewalRequestsStore); }
export function useProfileCompletion() { return useStore(profileCompletionStore); }

// ─── Actions ─────────────────────────────────────────────────

/** Handle renewal request */
export function handleRenewal(id: string, action: "approved" | "rejected") {
  renewalRequestsStore.set(prev => prev.map(r =>
    r.id === id ? { ...r, status: action } : r
  ));
}

/** Compute profile completion percentage */
export function getProfileCompletionPercent(profile: DoctorProfileCompletion): number {
  const vals = Object.values(profile);
  return Math.round((vals.filter(Boolean).length / vals.length) * 100);
}

/** Request renewal from patient side — creates a pending request in doctor's store */
export function requestRenewal(data: {
  patientName: string;
  patientAvatar: string;
  prescriptionId: string;
  items: string[];
}) {
  const id = `ren-${Date.now()}`;
  renewalRequestsStore.set(prev => [
    {
      id,
      patientName: data.patientName,
      patientAvatar: data.patientAvatar,
      prescriptionId: data.prescriptionId,
      items: data.items,
      requestedAt: new Date().toISOString(),
      status: "pending" as const,
    },
    ...prev,
  ]);
  return id;
}
