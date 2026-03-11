/**
 * sharedAppointmentsStore.ts — Single source of truth for ALL appointments.
 * Used by: DoctorSchedule, SecretaryAgenda, SecretaryDashboard, PublicBooking
 *
 * // TODO BACKEND: Replace with API + real-time subscriptions
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import type { SharedAppointment, AppointmentStatus, AppointmentType } from "@/types/appointment";
import { computeEndTime } from "@/types/appointment";

// ─── Seed data — single set of appointments ─────────────────
const SEED_APPOINTMENTS: SharedAppointment[] = [
  { id: "apt-001", date: "2026-02-20", startTime: "08:00", endTime: "08:30", duration: 30, patient: "Karim Mansour", patientId: 9, avatar: "KM", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Suivi diabète", status: "done", phone: "+216 71 111 111", assurance: "Assurance publique", notes: "Glycémie stable" },
  { id: "apt-002", date: "2026-02-20", startTime: "08:30", endTime: "09:00", duration: 30, patient: "Leila Chahed", patientId: 10, avatar: "LC", doctor: "Dr. Gharbi", type: "Suivi", motif: "Tension artérielle", status: "done", phone: "+216 71 222 222", assurance: "CNRPS" },
  { id: "apt-003", date: "2026-02-20", startTime: "09:00", endTime: "09:30", duration: 30, patient: "Hana Kammoun", patientId: null, avatar: "HK", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Douleurs dorsales", status: "done", phone: "+216 71 333 333", assurance: "Assurance publique" },
  { id: "apt-004", date: "2026-02-20", startTime: "09:30", endTime: "10:00", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Suivi diabète", status: "in_progress", phone: "+216 71 234 567", assurance: "Maghrebia", arrivedAt: "09:15" },
  { id: "apt-005", date: "2026-02-20", startTime: "09:45", endTime: "10:15", duration: 30, patient: "Fatma Trabelsi", patientId: 2, avatar: "FT", doctor: "Dr. Gharbi", type: "Suivi", motif: "Cardio - ECG", status: "in_waiting", phone: "+216 22 345 678", assurance: "Assurance publique", arrivedAt: "09:20", waitTime: 25 },
  { id: "apt-006", date: "2026-02-20", startTime: "10:00", endTime: "10:30", duration: 30, patient: "Mohamed Sfar", patientId: 3, avatar: "MS", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Post-opératoire", status: "in_waiting", phone: "+216 55 456 789", assurance: "Sans assurance", arrivedAt: "09:40", waitTime: 15 },
  { id: "apt-007", date: "2026-02-20", startTime: "10:30", endTime: "11:00", duration: 30, patient: "Nadia Jemni", patientId: 4, avatar: "NJ", doctor: "Dr. Hammami", type: "Première visite", motif: "Consultation dermatologique", status: "confirmed", phone: "+216 98 567 890", assurance: "Assurance publique" },
  { id: "apt-008", date: "2026-02-20", startTime: "11:00", endTime: "11:30", duration: 30, patient: "Sami Ayari", patientId: 5, avatar: "SA", doctor: "Dr. Bouazizi", type: "Première visite", motif: "Bilan complet", status: "confirmed", phone: "+216 29 678 901", assurance: "Assurance publique" },
  { id: "apt-009", date: "2026-02-20", startTime: "11:30", endTime: "12:00", duration: 30, patient: "Bilel Nasri", patientId: null, avatar: "BN", doctor: "Dr. Gharbi", type: "Suivi", motif: "Hypertension", status: "pending", phone: "+216 50 789 012", assurance: "STAR Assurances" },
  { id: "apt-010", date: "2026-02-20", startTime: "14:00", endTime: "14:30", duration: 30, patient: "Youssef Belhadj", patientId: 7, avatar: "YB", doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Renouvellement ordonnance", status: "confirmed", phone: "+216 71 890 123", assurance: "Sans assurance", teleconsultation: true },
  { id: "apt-011", date: "2026-02-20", startTime: "14:30", endTime: "15:00", duration: 30, patient: "Salma Dridi", patientId: 8, avatar: "SD", doctor: "Dr. Hammami", type: "Consultation", motif: "Acné sévère", status: "pending", phone: "+216 71 901 234", assurance: "Assurance publique" },
  { id: "apt-012", date: "2026-02-20", startTime: "15:00", endTime: "15:30", duration: 30, patient: "Olfa Ben Salah", patientId: null, avatar: "OB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Fatigue chronique", status: "pending", phone: "+216 55 012 345", assurance: "GAT Assurances" },
  { id: "apt-013", date: "2026-02-20", startTime: "15:30", endTime: "16:00", duration: 30, patient: "Rania Meddeb", patientId: 6, avatar: "RM", doctor: "Dr. Gharbi", type: "Contrôle", motif: "ECG de contrôle", status: "cancelled", phone: "+216 71 123 456", assurance: "CNRPS" },
  { id: "apt-014", date: "2026-02-20", startTime: "16:00", endTime: "16:30", duration: 30, patient: "Imen Bouhlel", patientId: null, avatar: "IB", doctor: "Dr. Bouazizi", type: "Urgence", motif: "Douleur thoracique", status: "pending", phone: "+216 50 234 567", assurance: "Assurance publique" },
  { id: "apt-015", date: "2026-02-20", startTime: "16:30", endTime: "17:00", duration: 30, patient: "Walid Jlassi", patientId: null, avatar: "WJ", doctor: "Dr. Hammami", type: "Consultation", motif: "Eczéma", status: "pending", phone: "+216 22 345 678", assurance: "Sans assurance" },
  // Additional days for week view
  { id: "apt-016", date: "2026-02-21", startTime: "09:00", endTime: "09:30", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Suivi", motif: "Contrôle glycémie", status: "confirmed", phone: "+216 71 234 567", assurance: "Maghrebia" },
  { id: "apt-017", date: "2026-02-21", startTime: "10:00", endTime: "11:00", duration: 60, patient: "Fatma Trabelsi", patientId: 2, avatar: "FT", doctor: "Dr. Gharbi", type: "Première visite", motif: "Bilan cardio complet", status: "confirmed", phone: "+216 22 345 678", assurance: "Assurance publique" },
  { id: "apt-018", date: "2026-02-21", startTime: "14:30", endTime: "15:00", duration: 30, patient: "Nadia Jemni", patientId: 4, avatar: "NJ", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Résultats analyses", status: "confirmed", phone: "+216 98 567 890", assurance: "Assurance publique" },
  { id: "apt-019", date: "2026-02-22", startTime: "09:00", endTime: "09:30", duration: 30, patient: "Mohamed Sfar", patientId: 3, avatar: "MS", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Post-opératoire J+30", status: "confirmed", phone: "+216 55 456 789", assurance: "Sans assurance" },
  { id: "apt-020", date: "2026-02-22", startTime: "10:00", endTime: "10:30", duration: 30, patient: "Sami Ayari", patientId: 5, avatar: "SA", doctor: "Dr. Gharbi", type: "Suivi", motif: "Suivi tension", status: "confirmed", phone: "+216 29 678 901", assurance: "Assurance publique" },
  { id: "apt-021", date: "2026-02-23", startTime: "08:00", endTime: "08:30", duration: 30, patient: "Karim Mansour", patientId: 9, avatar: "KM", doctor: "Dr. Bouazizi", type: "Urgence", motif: "Douleur thoracique", status: "confirmed", phone: "+216 71 111 111", assurance: "Assurance publique" },
  { id: "apt-022", date: "2026-02-23", startTime: "14:30", endTime: "15:00", duration: 30, patient: "Leila Chahed", patientId: 10, avatar: "LC", doctor: "Dr. Bouazizi", type: "Suivi", motif: "Résultats mammographie", status: "confirmed", phone: "+216 71 222 222", assurance: "CNRPS" },
  { id: "apt-023", date: "2026-02-24", startTime: "09:30", endTime: "10:00", duration: 30, patient: "Youssef Belhadj", patientId: 7, avatar: "YB", doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Suivi Rx", status: "confirmed", phone: "+216 71 890 123", assurance: "Sans assurance", teleconsultation: true },
  { id: "apt-024", date: "2026-02-24", startTime: "14:00", endTime: "15:00", duration: 60, patient: "Salma Dridi", patientId: 8, avatar: "SD", doctor: "Dr. Bouazizi", type: "Première visite", motif: "Bilan thyroïdien", status: "confirmed", phone: "+216 71 901 234", assurance: "Assurance publique" },
  { id: "apt-025", date: "2026-02-25", startTime: "09:00", endTime: "09:30", duration: 30, patient: "Rania Meddeb", patientId: 6, avatar: "RM", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Consultation générale", status: "confirmed", phone: "+216 71 123 456", assurance: "CNRPS" },
  // Week 2 (Feb 26 - Mar 1)
  { id: "apt-026", date: "2026-02-26", startTime: "09:00", endTime: "09:30", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Suivi HbA1c", status: "confirmed", phone: "+216 71 234 567", assurance: "Maghrebia" },
  { id: "apt-027", date: "2026-02-26", startTime: "10:00", endTime: "10:30", duration: 30, patient: "Hana Kammoun", patientId: null, avatar: "HK", doctor: "Dr. Gharbi", type: "Suivi", motif: "ECG de contrôle", status: "confirmed", phone: "+216 71 333 333", assurance: "Assurance publique" },
  { id: "apt-028", date: "2026-02-26", startTime: "14:00", endTime: "14:30", duration: 30, patient: "Fatma Trabelsi", patientId: 2, avatar: "FT", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Bilan lipidique", status: "confirmed", phone: "+216 22 345 678", assurance: "Assurance publique" },
  { id: "apt-029", date: "2026-02-27", startTime: "08:30", endTime: "09:00", duration: 30, patient: "Sami Ayari", patientId: 5, avatar: "SA", doctor: "Dr. Bouazizi", type: "Première visite", motif: "Check-up annuel", status: "confirmed", phone: "+216 29 678 901", assurance: "Assurance publique" },
  { id: "apt-030", date: "2026-02-27", startTime: "11:00", endTime: "11:30", duration: 30, patient: "Mohamed Sfar", patientId: 3, avatar: "MS", doctor: "Dr. Hammami", type: "Consultation", motif: "Suivi dermatologique", status: "confirmed", phone: "+216 55 456 789", assurance: "Sans assurance" },
  { id: "apt-031", date: "2026-02-28", startTime: "09:00", endTime: "09:30", duration: 30, patient: "Nadia Jemni", patientId: 4, avatar: "NJ", doctor: "Dr. Bouazizi", type: "Suivi", motif: "Résultats thyroïde", status: "confirmed", phone: "+216 98 567 890", assurance: "Assurance publique" },
  { id: "apt-032", date: "2026-02-28", startTime: "15:00", endTime: "15:30", duration: 30, patient: "Olfa Ben Salah", patientId: null, avatar: "OB", doctor: "Dr. Gharbi", type: "Téléconsultation", motif: "Renouvellement traitement", status: "confirmed", phone: "+216 55 012 345", assurance: "GAT Assurances", teleconsultation: true },
  // Week 3 (Mar 2 - Mar 6)
  { id: "apt-033", date: "2026-03-02", startTime: "08:00", endTime: "08:30", duration: 30, patient: "Karim Mansour", patientId: 9, avatar: "KM", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Suivi diabète mensuel", status: "confirmed", phone: "+216 71 111 111", assurance: "Assurance publique" },
  { id: "apt-034", date: "2026-03-02", startTime: "10:00", endTime: "10:30", duration: 30, patient: "Bilel Nasri", patientId: null, avatar: "BN", doctor: "Dr. Bouazizi", type: "Première visite", motif: "Consultation initiale", status: "confirmed", phone: "+216 50 789 012", assurance: "STAR Assurances" },
  { id: "apt-035", date: "2026-03-03", startTime: "09:30", endTime: "10:00", duration: 30, patient: "Walid Jlassi", patientId: null, avatar: "WJ", doctor: "Dr. Hammami", type: "Suivi", motif: "Eczéma — évolution", status: "confirmed", phone: "+216 22 345 678", assurance: "Sans assurance" },
  { id: "apt-036", date: "2026-03-03", startTime: "14:00", endTime: "15:00", duration: 60, patient: "Leila Chahed", patientId: 10, avatar: "LC", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Bilan complet annuel", status: "confirmed", phone: "+216 71 222 222", assurance: "CNRPS" },
  { id: "apt-037", date: "2026-03-04", startTime: "09:00", endTime: "09:30", duration: 30, patient: "Youssef Belhadj", patientId: 7, avatar: "YB", doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Suivi traitement", status: "confirmed", phone: "+216 71 890 123", assurance: "Sans assurance", teleconsultation: true },
  { id: "apt-038", date: "2026-03-05", startTime: "10:00", endTime: "10:30", duration: 30, patient: "Salma Dridi", patientId: 8, avatar: "SD", doctor: "Dr. Gharbi", type: "Suivi", motif: "Cardio — résultats", status: "confirmed", phone: "+216 71 901 234", assurance: "Assurance publique" },
  { id: "apt-039", date: "2026-03-06", startTime: "08:30", endTime: "09:00", duration: 30, patient: "Imen Bouhlel", patientId: null, avatar: "IB", doctor: "Dr. Bouazizi", type: "Urgence", motif: "Céphalées sévères", status: "confirmed", phone: "+216 50 234 567", assurance: "Assurance publique" },
];

const store = createStore<SharedAppointment[]>("medicare_shared_appointments", SEED_APPOINTMENTS);

export const sharedAppointmentsStore = store;

export function useSharedAppointments() {
  return useStore(store);
}

/** Update appointment status */
export function updateAppointmentStatus(id: string, status: AppointmentStatus, extra?: Partial<SharedAppointment>) {
  store.set(prev => prev.map(a => a.id === id ? { ...a, status, ...extra } : a));
}

/** Create a new appointment */
export function createAppointment(apt: Omit<SharedAppointment, "id" | "endTime">) {
  const id = `apt-${Date.now()}`;
  const endTime = computeEndTime(apt.startTime, apt.duration);
  const newApt: SharedAppointment = { ...apt, id, endTime };
  store.set(prev => [...prev, newApt].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)));

  // Notify doctor if created by secretary
  pushNotification({
    type: "generic",
    title: "Nouveau RDV",
    message: `${apt.patient} · ${apt.date} à ${apt.startTime} avec ${apt.doctor}`,
    targetRole: "doctor",
    actionLink: "/dashboard/doctor/schedule",
  });

  return id;
}

/** Reschedule an appointment */
export function rescheduleAppointment(id: string, newDate: string, newTime: string) {
  store.set(prev => prev.map(a => {
    if (a.id !== id) return a;
    return { ...a, date: newDate, startTime: newTime, endTime: computeEndTime(newTime, a.duration) };
  }));
}

/** Cancel an appointment */
export function cancelAppointment(id: string) {
  updateAppointmentStatus(id, "cancelled");
}

/** Mark patient as arrived */
export function markPatientArrived(id: string) {
  const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  updateAppointmentStatus(id, "arrived", { arrivedAt: now });
}

/** Send patient to waiting room */
export function sendToWaitingRoom(id: string) {
  const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  updateAppointmentStatus(id, "in_waiting", { arrivedAt: now, waitTime: 0 });
}

/** Start consultation */
export function startAppointmentConsultation(id: string) {
  updateAppointmentStatus(id, "in_progress");
}

/** Complete consultation */
export function completeAppointmentConsultation(id: string) {
  updateAppointmentStatus(id, "done");
}

/** Mark absent */
export function markAppointmentAbsent(id: string) {
  updateAppointmentStatus(id, "absent");
}

/** Toggle tag on appointment (urgent / retard) */
export function toggleAppointmentTag(id: string, tag: "urgent" | "retard") {
  store.set(prev => prev.map(a => {
    if (a.id !== id) return a;
    const tags = a.tags || [];
    return { ...a, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] };
  }));
}

/** Save internal note on appointment */
export function saveAppointmentNote(id: string, note: string) {
  store.set(prev => prev.map(a => a.id === id ? { ...a, internalNote: note } : a));
}

/** Get appointments for a specific date */
export function getAppointmentsForDate(appointments: SharedAppointment[], date: string) {
  return appointments.filter(a => a.date === date);
}

/** Get appointments for a doctor */
export function getAppointmentsForDoctor(appointments: SharedAppointment[], doctor: string) {
  return doctor === "Tous" ? appointments : appointments.filter(a => a.doctor === doctor);
}

/** Get today's date as YYYY-MM-DD */
export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Get appointments for a patient by patientId */
export function getAppointmentsForPatient(appointments: SharedAppointment[], patientId: number) {
  return appointments.filter(a => a.patientId === patientId);
}
