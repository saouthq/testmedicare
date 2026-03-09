/**
 * doctorStore.ts — Shared doctor state for cross-page sync.
 * Manages: waiting room entries, consultation status, profile completion, renewal requests.
 *
 * // TODO BACKEND: Replace with real-time API + WebSocket subscriptions.
 */
import { createStore, useStore } from "./crossRoleStore";
import { mockTodaySchedule, mockDoctorProfile, mockDoctorConsultations } from "@/data/mockData";

// ─── Types ───────────────────────────────────────────────────
export type WaitingStatus = "scheduled" | "arrived" | "waiting" | "in_consultation" | "completed" | "absent";

export interface WaitingEntry {
  id: number;
  patient: string;
  avatar: string;
  time: string;
  motif: string;
  type: string;
  duration: string;
  status: WaitingStatus;
  arrivedAt?: string;
  phone?: string;
  assurance?: boolean;
  teleconsultation?: boolean;
  internalNote?: string;
  tags?: ("urgent" | "retard")[];
}

export type ConsultStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

export interface DoctorConsultEntry {
  id: number;
  patient: string;
  date: string;
  time: string;
  motif: string;
  notes: string;
  prescriptions: number;
  assurance: string;
  amount: string;
  avatar: string;
  status: ConsultStatus;
}

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
const initialWaiting: WaitingEntry[] = mockTodaySchedule.map((s, i) => ({
  id: i + 1,
  patient: s.patient,
  avatar: s.avatar,
  time: s.time,
  motif: s.motif,
  type: s.type,
  duration: s.duration,
  status: s.status === "done" ? "completed" : s.status === "current" ? "in_consultation" : "scheduled",
  arrivedAt: s.status === "done" ? s.time : s.status === "current" ? s.time : undefined,
  phone: s.phone,
  assurance: !!s.assurance,
  teleconsultation: s.teleconsultation,
  internalNote: "",
  tags: [],
}));

const initialConsultations: DoctorConsultEntry[] = mockDoctorConsultations.map(c => ({
  ...c,
  status: (c.status === "Terminée" ? "completed" : c.status === "Annulée" ? "cancelled" : "scheduled") as ConsultStatus,
}));

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
export const waitingRoomStore = createStore<WaitingEntry[]>("doctor_waiting_room", initialWaiting);
export const consultationsStore = createStore<DoctorConsultEntry[]>("doctor_consultations", initialConsultations);
export const renewalRequestsStore = createStore<RenewalRequest[]>("doctor_renewal_requests", initialRenewals);
export const profileCompletionStore = createStore<DoctorProfileCompletion>("doctor_profile_completion", initialProfileCompletion);

// ─── Hooks ───────────────────────────────────────────────────
export function useWaitingRoom() { return useStore(waitingRoomStore); }
export function useDoctorConsultations() { return useStore(consultationsStore); }
export function useRenewalRequests() { return useStore(renewalRequestsStore); }
export function useProfileCompletion() { return useStore(profileCompletionStore); }

// ─── Actions ─────────────────────────────────────────────────

/** Update waiting room entry status */
export function updateWaitingStatus(id: number, newStatus: WaitingStatus) {
  waitingRoomStore.set(prev => prev.map(e => {
    if (e.id !== id) return e;
    const updated = { ...e, status: newStatus };
    if (newStatus === "arrived" && !e.arrivedAt) {
      updated.arrivedAt = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    return updated;
  }));
}

/** Mark consultation complete — also updates waiting room */
export function completeConsultation(patientName: string) {
  // Update consultation store
  consultationsStore.set(prev => prev.map(c =>
    c.patient === patientName && c.status !== "completed" ? { ...c, status: "completed" } : c
  ));
  // Update waiting room
  waitingRoomStore.set(prev => prev.map(e =>
    e.patient === patientName && e.status === "in_consultation" ? { ...e, status: "completed" } : e
  ));
}

/** Start consultation — mark in_consultation in waiting room */
export function startConsultation(patientName: string) {
  waitingRoomStore.set(prev => prev.map(e =>
    e.patient === patientName ? { ...e, status: "in_consultation", arrivedAt: e.arrivedAt || new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) } : e
  ));
}

/** Handle renewal request */
export function handleRenewal(id: string, action: "approved" | "rejected") {
  renewalRequestsStore.set(prev => prev.map(r =>
    r.id === id ? { ...r, status: action } : r
  ));
}

/** Toggle waiting room tag */
export function toggleWaitingTag(id: number, tag: "urgent" | "retard") {
  waitingRoomStore.set(prev => prev.map(e => {
    if (e.id !== id) return e;
    const tags = e.tags || [];
    return { ...e, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] };
  }));
}

/** Save internal note on waiting entry */
export function saveWaitingNote(id: number, note: string) {
  waitingRoomStore.set(prev => prev.map(e => e.id === id ? { ...e, internalNote: note } : e));
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
