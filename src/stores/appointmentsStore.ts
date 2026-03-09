/**
 * appointmentsStore.ts — Cross-role appointment events (localStorage).
 * Secretary marks absent → Patient sees in "Absents".
 * Doctor ends consultation → Care sheet visible to patient.
 *
 * // TODO BACKEND: Replace with API + real-time
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";

export interface AppointmentEvent {
  id: string;
  type: "absent" | "consultation_ended" | "care_sheet_ready" | "cancelled" | "rescheduled";
  appointmentId: number;
  patientName: string;
  doctorName: string;
  date: string;
  details?: string;
  createdAt: string;
}

const store = createStore<AppointmentEvent[]>("medicare_appointment_events", []);

export const appointmentsStore = store;

export function useAppointmentEvents() {
  return useStore(store);
}

/** Secretary marks patient absent */
export function markPatientAbsent(appointmentId: number, patientName: string, doctorName: string) {
  const event: AppointmentEvent = {
    id: `evt-${Date.now()}`,
    type: "absent",
    appointmentId,
    patientName,
    doctorName,
    date: new Date().toLocaleDateString("fr-FR"),
    createdAt: new Date().toISOString(),
  };
  store.set((prev) => [event, ...prev]);

  pushNotification({
    type: "appointment_absent",
    title: "RDV marqué absent",
    message: `Votre rendez-vous du ${event.date} avec ${doctorName} a été marqué comme non honoré.`,
    targetRole: "patient",
    actionLink: "/dashboard/patient/appointments",
  });
}

/** Doctor ends consultation → generates care sheet */
export function endConsultation(appointmentId: number, patientName: string, doctorName: string) {
  const event: AppointmentEvent = {
    id: `evt-${Date.now()}`,
    type: "consultation_ended",
    appointmentId,
    patientName,
    doctorName,
    date: new Date().toLocaleDateString("fr-FR"),
    createdAt: new Date().toISOString(),
  };
  store.set((prev) => [event, ...prev]);

  // Also generate care sheet event
  const careSheet: AppointmentEvent = {
    id: `evt-${Date.now()}-cs`,
    type: "care_sheet_ready",
    appointmentId,
    patientName,
    doctorName,
    date: new Date().toLocaleDateString("fr-FR"),
    createdAt: new Date().toISOString(),
  };
  store.set((prev) => [careSheet, ...prev]);

  pushNotification({
    type: "care_sheet",
    title: "Feuille de soins disponible",
    message: `La feuille de soins de votre consultation avec ${doctorName} est disponible au téléchargement.`,
    targetRole: "patient",
    actionLink: "/dashboard/patient/health",
  });
}
