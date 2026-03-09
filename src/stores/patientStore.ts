/**
 * patientStore.ts — Centralized patient state shared across all patient pages.
 * Dashboard, Appointments, Booking, Health, Prescriptions all read/write from here.
 * Uses crossRoleStore for localStorage persistence + cross-tab sync.
 * TODO BACKEND: Replace with real API
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import {
  mockPatientAppointmentsFull,
  mockPastAppointments,
  mockCancelledAppointments,
  mockHealthSummary,
  mockFavoriteDoctors,
  mockRecentPrescriptions,
  mockPatientPrescriptions,
  mockHealthDocuments,
  mockAntecedents,
  mockTreatments,
  mockAllergies,
} from "@/data/mocks/patient";
import type { PatientAppointment, PastAppointment, CancelledAppointment } from "@/types";

// ── Patient Profile ──
export interface PatientProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  gouvernorat: string;
  bloodType: string;
  insurance: string;
  insuranceNumber: string;
  treatingDoctor: string;
  allergies: string[];
}

const defaultProfile: PatientProfile = {
  firstName: "Amine",
  lastName: "Ben Ali",
  email: "amine@email.tn",
  phone: "+216 22 345 678",
  dob: "1991-03-15",
  address: "El Manar, Tunis",
  gouvernorat: "Tunis",
  bloodType: "A+",
  insurance: "maghrebia",
  insuranceNumber: "MAG-2024-001234",
  treatingDoctor: "Dr. Ahmed Bouazizi",
  allergies: ["Pénicilline", "Acariens"],
};

// ── Stores ──
const profileStore = createStore<PatientProfile>("medicare_patient_profile", defaultProfile);
const appointmentsStore = createStore<PatientAppointment[]>("medicare_patient_appointments", mockPatientAppointmentsFull);
const pastAppointmentsStore = createStore<PastAppointment[]>("medicare_patient_past_appointments", mockPastAppointments);
const cancelledStore = createStore<CancelledAppointment[]>("medicare_patient_cancelled", mockCancelledAppointments);

// ── Hooks ──
export function usePatientProfile() { return useStore(profileStore); }
export function usePatientAppointments() { return useStore(appointmentsStore); }
export function usePatientPastAppointments() { return useStore(pastAppointmentsStore); }
export function usePatientCancelled() { return useStore(cancelledStore); }

// ── Actions ──

/** Book a new appointment — adds to the upcoming list */
export function bookAppointment(apt: Omit<PatientAppointment, "id">) {
  const newApt: PatientAppointment = {
    ...apt,
    id: Date.now(),
  };
  appointmentsStore.set(prev => [...prev, newApt]);

  pushNotification({
    type: "appointment_booked",
    title: "Nouveau RDV confirmé",
    message: `RDV avec ${apt.doctor} le ${apt.date} à ${apt.time}.`,
    targetRole: "patient",
    actionLink: "/dashboard/patient/appointments",
  });

  return newApt;
}

/** Cancel an appointment — moves to cancelled list */
export function cancelAppointment(id: number, reason?: string) {
  const appointments = appointmentsStore.read();
  const apt = appointments.find(a => a.id === id);
  if (!apt) return;

  appointmentsStore.set(prev => prev.filter(a => a.id !== id));
  cancelledStore.set(prev => [{
    id: apt.id,
    doctor: apt.doctor,
    specialty: apt.specialty,
    date: apt.date,
    time: apt.time,
    reason: reason || "Annulation par le patient",
    avatar: apt.avatar,
  }, ...prev]);
}

/** Reschedule an appointment */
export function rescheduleAppointment(id: number, newDate: string, newTime: string) {
  appointmentsStore.set(prev =>
    prev.map(a => a.id === id ? { ...a, date: newDate, time: newTime } : a)
  );
}

/** Update patient profile */
export function updatePatientProfile(updates: Partial<PatientProfile>) {
  profileStore.set(prev => ({ ...prev, ...updates }));
}

/** Get computed dashboard stats */
export function getDashboardStats() {
  const appointments = appointmentsStore.read();
  const prescriptions = mockPatientPrescriptions;
  const profile = profileStore.read();

  const todayApts = appointments.filter(a =>
    a.date.toLowerCase().includes("aujourd") || a.date === new Date().toLocaleDateString("fr-FR")
  );
  const activePrescriptions = prescriptions.filter(p => p.status === "active");
  const pendingResults = mockHealthDocuments.filter(d => d.type === "Analyse").length;

  return {
    nextApt: todayApts.length > 0 ? `Aujourd'hui ${todayApts[0].time}` : appointments.length > 0 ? `${appointments[0].date} ${appointments[0].time}` : "Aucun",
    upcomingCount: appointments.length,
    activePrescriptions: activePrescriptions.length,
    pendingResults,
    patientName: `${profile.firstName} ${profile.lastName}`,
    todayCount: todayApts.length,
    healthSummary: {
      bloodType: profile.bloodType,
      treatingDoctor: profile.treatingDoctor,
      insurance: profile.insurance === "maghrebia" ? "Assurances Maghrebia" :
                 profile.insurance === "publique" ? "Assurance publique" :
                 profile.insurance === "none" ? "Sans assurance" : profile.insurance,
      allergies: profile.allergies,
    },
  };
}

// Read-only access for non-React contexts
export const readProfile = () => profileStore.read();
export const readAppointments = () => appointmentsStore.read();
