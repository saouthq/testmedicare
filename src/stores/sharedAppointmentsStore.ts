/**
 * sharedAppointmentsStore.ts — Single source of truth for ALL appointments.
 * Used by: DoctorSchedule, SecretaryAgenda, SecretaryDashboard, PublicBooking
 *
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { createInvoice } from "./billingStore";
import { sharedTarifsStore } from "./sharedTarifsStore";
import type { SharedAppointment, AppointmentStatus, AppointmentType } from "@/types/appointment";
import { computeEndTime } from "@/types/appointment";
import { useDualQuery } from "@/hooks/useDualData";
import { mapAppointmentRow, mapAppointmentToRow } from "@/lib/supabaseMappers";
import { readAuthUser, getAppMode } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

// ─── Helper: generate YYYY-MM-DD relative to today ──────────
function relDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TODAY = relDate(0);

// ─── Seed data — dates relative to today ─────────────────────
const SEED_APPOINTMENTS: SharedAppointment[] = [
  // ── Today (offset 0) ──────────────────────────────
  { id: "apt-001", date: TODAY, startTime: "08:00", endTime: "08:30", duration: 30, patient: "Karim Mansour", patientId: 9, avatar: "KM", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Suivi diabète", status: "done", phone: "+216 71 111 111", assurance: "Assurance publique", notes: "Glycémie stable" },
  { id: "apt-002", date: TODAY, startTime: "08:30", endTime: "09:00", duration: 30, patient: "Leila Chahed", patientId: 10, avatar: "LC", doctor: "Dr. Gharbi", type: "Suivi", motif: "Tension artérielle", status: "done", phone: "+216 71 222 222", assurance: "CNRPS" },
  { id: "apt-003", date: TODAY, startTime: "09:00", endTime: "09:30", duration: 30, patient: "Hana Kammoun", patientId: null, avatar: "HK", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Douleurs dorsales", status: "done", phone: "+216 71 333 333", assurance: "Assurance publique" },
  { id: "apt-004", date: TODAY, startTime: "09:30", endTime: "10:00", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Suivi diabète", status: "in_progress", phone: "+216 71 234 567", assurance: "Maghrebia", arrivedAt: "09:15" },
  { id: "apt-005", date: TODAY, startTime: "09:45", endTime: "10:15", duration: 30, patient: "Fatma Trabelsi", patientId: 2, avatar: "FT", doctor: "Dr. Gharbi", type: "Suivi", motif: "Cardio - ECG", status: "in_waiting", phone: "+216 22 345 678", assurance: "Assurance publique", arrivedAt: "09:20", waitTime: 25 },
  { id: "apt-006", date: TODAY, startTime: "10:00", endTime: "10:30", duration: 30, patient: "Mohamed Sfar", patientId: 3, avatar: "MS", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Post-opératoire", status: "in_waiting", phone: "+216 55 456 789", assurance: "Sans assurance", arrivedAt: "09:40", waitTime: 15 },
  { id: "apt-007", date: TODAY, startTime: "10:30", endTime: "11:00", duration: 30, patient: "Nadia Jemni", patientId: 4, avatar: "NJ", doctor: "Dr. Hammami", type: "Première visite", motif: "Consultation dermatologique", status: "confirmed", phone: "+216 98 567 890", assurance: "Assurance publique" },
  { id: "apt-008", date: TODAY, startTime: "11:00", endTime: "11:30", duration: 30, patient: "Sami Ayari", patientId: 5, avatar: "SA", doctor: "Dr. Bouazizi", type: "Première visite", motif: "Bilan complet", status: "confirmed", phone: "+216 29 678 901", assurance: "Assurance publique" },
  { id: "apt-009", date: TODAY, startTime: "11:30", endTime: "12:00", duration: 30, patient: "Bilel Nasri", patientId: null, avatar: "BN", doctor: "Dr. Gharbi", type: "Suivi", motif: "Hypertension", status: "pending", phone: "+216 50 789 012", assurance: "STAR Assurances" },
  { id: "apt-010", date: TODAY, startTime: "14:00", endTime: "14:30", duration: 30, patient: "Youssef Belhadj", patientId: 7, avatar: "YB", doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Renouvellement ordonnance", status: "confirmed", phone: "+216 71 890 123", assurance: "Sans assurance", teleconsultation: true },
  { id: "apt-011", date: TODAY, startTime: "14:30", endTime: "15:00", duration: 30, patient: "Salma Dridi", patientId: 8, avatar: "SD", doctor: "Dr. Hammami", type: "Consultation", motif: "Acné sévère", status: "pending", phone: "+216 71 901 234", assurance: "Assurance publique" },
  { id: "apt-012", date: TODAY, startTime: "15:00", endTime: "15:30", duration: 30, patient: "Olfa Ben Salah", patientId: null, avatar: "OB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Fatigue chronique", status: "pending", phone: "+216 55 012 345", assurance: "GAT Assurances" },
  { id: "apt-013", date: TODAY, startTime: "15:30", endTime: "16:00", duration: 30, patient: "Rania Meddeb", patientId: 6, avatar: "RM", doctor: "Dr. Gharbi", type: "Contrôle", motif: "ECG de contrôle", status: "cancelled", phone: "+216 71 123 456", assurance: "CNRPS" },
  { id: "apt-014", date: TODAY, startTime: "16:00", endTime: "16:30", duration: 30, patient: "Imen Bouhlel", patientId: null, avatar: "IB", doctor: "Dr. Bouazizi", type: "Urgence", motif: "Douleur thoracique", status: "pending", phone: "+216 50 234 567", assurance: "Assurance publique" },
  { id: "apt-015", date: TODAY, startTime: "16:30", endTime: "17:00", duration: 30, patient: "Walid Jlassi", patientId: null, avatar: "WJ", doctor: "Dr. Hammami", type: "Consultation", motif: "Eczéma", status: "pending", phone: "+216 22 345 678", assurance: "Sans assurance" },

  // ── Tomorrow (+1) ──────────────────────────────
  { id: "apt-016", date: relDate(1), startTime: "09:00", endTime: "09:30", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Suivi", motif: "Contrôle glycémie", status: "confirmed", phone: "+216 71 234 567", assurance: "Maghrebia" },
  { id: "apt-017", date: relDate(1), startTime: "10:00", endTime: "11:00", duration: 60, patient: "Fatma Trabelsi", patientId: 2, avatar: "FT", doctor: "Dr. Gharbi", type: "Première visite", motif: "Bilan cardio complet", status: "confirmed", phone: "+216 22 345 678", assurance: "Assurance publique" },
  { id: "apt-018", date: relDate(1), startTime: "14:30", endTime: "15:00", duration: 30, patient: "Nadia Jemni", patientId: 4, avatar: "NJ", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Résultats analyses", status: "confirmed", phone: "+216 98 567 890", assurance: "Assurance publique" },

  // ── Day +2 ──────────────────────────────
  { id: "apt-019", date: relDate(2), startTime: "09:00", endTime: "09:30", duration: 30, patient: "Mohamed Sfar", patientId: 3, avatar: "MS", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Post-opératoire J+30", status: "confirmed", phone: "+216 55 456 789", assurance: "Sans assurance" },
  { id: "apt-020", date: relDate(2), startTime: "10:00", endTime: "10:30", duration: 30, patient: "Sami Ayari", patientId: 5, avatar: "SA", doctor: "Dr. Gharbi", type: "Suivi", motif: "Suivi tension", status: "confirmed", phone: "+216 29 678 901", assurance: "Assurance publique" },

  // ── Day +3
  { id: "apt-021", date: relDate(3), startTime: "08:00", endTime: "08:30", duration: 30, patient: "Karim Mansour", patientId: 9, avatar: "KM", doctor: "Dr. Bouazizi", type: "Urgence", motif: "Douleur thoracique", status: "confirmed", phone: "+216 71 111 111", assurance: "Assurance publique" },
  { id: "apt-022", date: relDate(3), startTime: "14:30", endTime: "15:00", duration: 30, patient: "Leila Chahed", patientId: 10, avatar: "LC", doctor: "Dr. Bouazizi", type: "Suivi", motif: "Résultats mammographie", status: "confirmed", phone: "+216 71 222 222", assurance: "CNRPS" },

  // ── Day +4
  { id: "apt-023", date: relDate(4), startTime: "09:30", endTime: "10:00", duration: 30, patient: "Youssef Belhadj", patientId: 7, avatar: "YB", doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Suivi Rx", status: "confirmed", phone: "+216 71 890 123", assurance: "Sans assurance", teleconsultation: true },
  { id: "apt-024", date: relDate(4), startTime: "14:00", endTime: "15:00", duration: 60, patient: "Salma Dridi", patientId: 8, avatar: "SD", doctor: "Dr. Bouazizi", type: "Première visite", motif: "Bilan thyroïdien", status: "confirmed", phone: "+216 71 901 234", assurance: "Assurance publique" },

  // ── Day +5
  { id: "apt-025", date: relDate(5), startTime: "09:00", endTime: "09:30", duration: 30, patient: "Rania Meddeb", patientId: 6, avatar: "RM", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Consultation générale", status: "confirmed", phone: "+216 71 123 456", assurance: "CNRPS" },

  // ── Day +6
  { id: "apt-026", date: relDate(6), startTime: "09:00", endTime: "09:30", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Suivi HbA1c", status: "confirmed", phone: "+216 71 234 567", assurance: "Maghrebia" },
  { id: "apt-027", date: relDate(6), startTime: "10:00", endTime: "10:30", duration: 30, patient: "Hana Kammoun", patientId: null, avatar: "HK", doctor: "Dr. Gharbi", type: "Suivi", motif: "ECG de contrôle", status: "confirmed", phone: "+216 71 333 333", assurance: "Assurance publique" },
  { id: "apt-028", date: relDate(6), startTime: "14:00", endTime: "14:30", duration: 30, patient: "Fatma Trabelsi", patientId: 2, avatar: "FT", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Bilan lipidique", status: "confirmed", phone: "+216 22 345 678", assurance: "Assurance publique" },

  // ── Day +7
  { id: "apt-029", date: relDate(7), startTime: "08:30", endTime: "09:00", duration: 30, patient: "Sami Ayari", patientId: 5, avatar: "SA", doctor: "Dr. Bouazizi", type: "Première visite", motif: "Check-up annuel", status: "confirmed", phone: "+216 29 678 901", assurance: "Assurance publique" },
  { id: "apt-030", date: relDate(7), startTime: "11:00", endTime: "11:30", duration: 30, patient: "Mohamed Sfar", patientId: 3, avatar: "MS", doctor: "Dr. Hammami", type: "Consultation", motif: "Suivi dermatologique", status: "confirmed", phone: "+216 55 456 789", assurance: "Sans assurance" },

  // ── Day +8
  { id: "apt-031", date: relDate(8), startTime: "09:00", endTime: "09:30", duration: 30, patient: "Nadia Jemni", patientId: 4, avatar: "NJ", doctor: "Dr. Bouazizi", type: "Suivi", motif: "Résultats thyroïde", status: "confirmed", phone: "+216 98 567 890", assurance: "Assurance publique" },
  { id: "apt-032", date: relDate(8), startTime: "15:00", endTime: "15:30", duration: 30, patient: "Olfa Ben Salah", patientId: null, avatar: "OB", doctor: "Dr. Gharbi", type: "Téléconsultation", motif: "Renouvellement traitement", status: "confirmed", phone: "+216 55 012 345", assurance: "GAT Assurances", teleconsultation: true },

  // ── Day +10
  { id: "apt-033", date: relDate(10), startTime: "08:00", endTime: "08:30", duration: 30, patient: "Karim Mansour", patientId: 9, avatar: "KM", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Suivi diabète mensuel", status: "confirmed", phone: "+216 71 111 111", assurance: "Assurance publique" },
  { id: "apt-034", date: relDate(10), startTime: "10:00", endTime: "10:30", duration: 30, patient: "Bilel Nasri", patientId: null, avatar: "BN", doctor: "Dr. Bouazizi", type: "Première visite", motif: "Consultation initiale", status: "confirmed", phone: "+216 50 789 012", assurance: "STAR Assurances" },

  // ── Day +11
  { id: "apt-035", date: relDate(11), startTime: "09:30", endTime: "10:00", duration: 30, patient: "Walid Jlassi", patientId: null, avatar: "WJ", doctor: "Dr. Hammami", type: "Suivi", motif: "Eczéma — évolution", status: "confirmed", phone: "+216 22 345 678", assurance: "Sans assurance" },
  { id: "apt-036", date: relDate(11), startTime: "14:00", endTime: "15:00", duration: 60, patient: "Leila Chahed", patientId: 10, avatar: "LC", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Bilan complet annuel", status: "confirmed", phone: "+216 71 222 222", assurance: "CNRPS" },

  // ── Day +12
  { id: "apt-037", date: relDate(12), startTime: "09:00", endTime: "09:30", duration: 30, patient: "Youssef Belhadj", patientId: 7, avatar: "YB", doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Suivi traitement", status: "confirmed", phone: "+216 71 890 123", assurance: "Sans assurance", teleconsultation: true },

  // ── Day +13
  { id: "apt-038", date: relDate(13), startTime: "10:00", endTime: "10:30", duration: 30, patient: "Salma Dridi", patientId: 8, avatar: "SD", doctor: "Dr. Gharbi", type: "Suivi", motif: "Cardio — résultats", status: "confirmed", phone: "+216 71 901 234", assurance: "Assurance publique" },

  // ── Day +14
  { id: "apt-039", date: relDate(14), startTime: "08:30", endTime: "09:00", duration: 30, patient: "Imen Bouhlel", patientId: null, avatar: "IB", doctor: "Dr. Bouazizi", type: "Urgence", motif: "Céphalées sévères", status: "confirmed", phone: "+216 50 234 567", assurance: "Assurance publique" },

  // ── Past days (history) ──────────────────────────────
  { id: "apt-040", date: relDate(-1), startTime: "09:00", endTime: "09:30", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Suivi diabète", status: "done", phone: "+216 71 234 567", assurance: "Maghrebia" },
  { id: "apt-041", date: relDate(-2), startTime: "10:00", endTime: "10:30", duration: 30, patient: "Fatma Trabelsi", patientId: 2, avatar: "FT", doctor: "Dr. Gharbi", type: "Suivi", motif: "ECG de contrôle", status: "done", phone: "+216 22 345 678", assurance: "Assurance publique" },
  { id: "apt-042", date: relDate(-3), startTime: "14:00", endTime: "14:30", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Résultats analyses", status: "done", phone: "+216 71 234 567", assurance: "Maghrebia" },
  { id: "apt-043", date: relDate(-5), startTime: "09:30", endTime: "10:00", duration: 30, patient: "Nadia Jemni", patientId: 4, avatar: "NJ", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Bilan thyroïdien", status: "done", phone: "+216 98 567 890", assurance: "Assurance publique" },
  { id: "apt-044", date: relDate(-7), startTime: "11:00", endTime: "11:30", duration: 30, patient: "Amine Ben Ali", patientId: 1, avatar: "AB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Bilan initial", status: "done", phone: "+216 71 234 567", assurance: "Maghrebia" },
  { id: "apt-045", date: relDate(-4), startTime: "15:00", endTime: "15:30", duration: 30, patient: "Sami Ayari", patientId: 5, avatar: "SA", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Check-up", status: "absent", phone: "+216 29 678 901", assurance: "Assurance publique" },
  { id: "apt-046", date: relDate(-6), startTime: "16:00", endTime: "16:30", duration: 30, patient: "Rania Meddeb", patientId: 6, avatar: "RM", doctor: "Dr. Gharbi", type: "Suivi", motif: "Contrôle ECG", status: "cancelled", phone: "+216 71 123 456", assurance: "CNRPS" },
];

const store = createStore<SharedAppointment[]>("medicare_shared_appointments", SEED_APPOINTMENTS);

export const sharedAppointmentsStore = store;

export function useSharedAppointments() {
  return useDualQuery<SharedAppointment[]>({
    store,
    tableName: "appointments",
    queryKey: ["appointments"],
    mapRowToLocal: mapAppointmentRow,
    orderBy: { column: "date", ascending: true },
  });
}

// ─── Supabase write helper ──────────────────────────────────
async function supabaseUpdateAppointment(id: string, update: Partial<SharedAppointment>) {
  if (getAppMode() !== "production") return;
  try {
    const row = mapAppointmentToRow(update);
    delete row.id;
    if (Object.keys(row).length > 0) {
      await (supabase.from as any)("appointments").update(row).eq("id", id);
    }
  } catch (e) {
    console.warn("[sharedAppointmentsStore] Supabase update failed:", e);
  }
}

async function supabaseInsertAppointment(apt: SharedAppointment) {
  if (getAppMode() !== "production") return;
  try {
    const currentUser = readAuthUser();
    const row = mapAppointmentToRow(apt);
    if (!row.doctor_id && currentUser?.role === "doctor") {
      row.doctor_id = currentUser.id;
    }
    await (supabase.from as any)("appointments").insert(row);
  } catch (e) {
    console.warn("[sharedAppointmentsStore] Supabase insert failed:", e);
  }
}

/** Update appointment status */
export function updateAppointmentStatus(id: string, status: AppointmentStatus, extra?: Partial<SharedAppointment>) {
  store.set(prev => prev.map(a => a.id === id ? { ...a, status, ...extra } : a));
  supabaseUpdateAppointment(id, { status, ...extra });
}

/** Create a new appointment */
export function createAppointment(apt: Omit<SharedAppointment, "id" | "endTime">) {
  const id = `apt-${Date.now()}`;
  const endTime = computeEndTime(apt.startTime, apt.duration);
  const currentUser = readAuthUser();
  const doctorId = apt.doctorId || (currentUser?.role === "doctor" ? currentUser.id : undefined);
  const newApt: SharedAppointment = { ...apt, id, endTime, doctorId };
  store.set(prev => [...prev, newApt].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)));

  // Persist to Supabase
  supabaseInsertAppointment(newApt);

  // Notify doctor
  pushNotification({
    type: "appointment_booked",
    title: "Nouveau RDV",
    message: `${apt.patient} · ${apt.date} à ${apt.startTime} avec ${apt.doctor}`,
    targetRole: "doctor",
    actionLink: "/dashboard/doctor/schedule",
  });

  // Notify secretary
  pushNotification({
    type: "appointment_booked",
    title: "Nouveau RDV ajouté",
    message: `${apt.patient} — ${apt.type} avec ${apt.doctor} le ${apt.date} à ${apt.startTime}`,
    targetRole: "secretary",
    actionLink: "/dashboard/secretary/agenda",
  });

  // Notify patient if they have an ID
  if (apt.patientId) {
    pushNotification({
      type: "appointment_booked",
      title: "RDV confirmé",
      message: `Votre RDV avec ${apt.doctor} est confirmé le ${apt.date} à ${apt.startTime}.`,
      targetRole: "patient",
      actionLink: "/dashboard/patient/appointments",
    });
  }

  return id;
}

/** Reschedule an appointment */
export function rescheduleAppointment(id: string, newDate: string, newTime: string) {
  const apt = store.read().find(a => a.id === id);
  const endTime = apt ? computeEndTime(newTime, apt.duration) : newTime;
  store.set(prev => prev.map(a => {
    if (a.id !== id) return a;
    return { ...a, date: newDate, startTime: newTime, endTime: computeEndTime(newTime, a.duration) };
  }));

  supabaseUpdateAppointment(id, { date: newDate, startTime: newTime, endTime } as any);

  if (apt) {
    pushNotification({
      type: "appointment_rescheduled",
      title: "RDV reprogrammé",
      message: `${apt.patient} : reprogrammé au ${newDate} à ${newTime}`,
      targetRole: "doctor",
      actionLink: "/dashboard/doctor/schedule",
    });
    if (apt.patientId) {
      pushNotification({
        type: "appointment_rescheduled",
        title: "RDV reprogrammé",
        message: `Votre RDV avec ${apt.doctor} a été déplacé au ${newDate} à ${newTime}.`,
        targetRole: "patient",
        actionLink: "/dashboard/patient/appointments",
      });
    }
  }
}

/** Cancel an appointment */
export function cancelAppointment(id: string) {
  const apt = store.read().find(a => a.id === id);
  updateAppointmentStatus(id, "cancelled");

  if (apt) {
    pushNotification({
      type: "generic",
      title: "RDV annulé",
      message: `Le RDV de ${apt.patient} (${apt.date} à ${apt.startTime}) a été annulé.`,
      targetRole: "doctor",
      actionLink: "/dashboard/doctor/schedule",
    });
    pushNotification({
      type: "generic",
      title: "RDV annulé",
      message: `Le RDV de ${apt.patient} (${apt.date} à ${apt.startTime}) a été annulé.`,
      targetRole: "secretary",
      actionLink: "/dashboard/secretary/agenda",
    });
    if (apt.patientId) {
      pushNotification({
        type: "generic",
        title: "RDV annulé",
        message: `Votre RDV avec ${apt.doctor} le ${apt.date} à ${apt.startTime} a été annulé.`,
        targetRole: "patient",
        actionLink: "/dashboard/patient/appointments",
      });
    }
  }
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

/** Complete consultation — auto-creates invoice if tarif exists */
export function completeAppointmentConsultation(id: string) {
  updateAppointmentStatus(id, "done");

  const apt = store.read().find(a => a.id === id);
  if (apt?.patientId) {
    pushNotification({
      type: "care_sheet",
      title: "Consultation terminée",
      message: `Votre consultation avec ${apt.doctor} est terminée. Consultez votre dossier médical.`,
      targetRole: "patient",
      actionLink: "/dashboard/patient/health",
    });
  }

  // Auto-create invoice from tarifs
  if (apt) {
    try {
      const allTarifs = sharedTarifsStore.read();
      const typeMap: Record<string, string> = {
        "Consultation": "CS", "Première visite": "CS-P", "Suivi": "CS-S",
        "Contrôle": "CS-S", "Téléconsultation": "TC", "Certificat": "CERT",
      };
      const code = typeMap[apt.type] || "CS";
      const tarif = allTarifs.find((t: any) => t.code === code && t.active);
      if (tarif) {
        createInvoice({
          patient: apt.patient,
          avatar: apt.avatar || apt.patient.split(" ").map((w: string) => w[0]).join("").toUpperCase(),
          doctor: apt.doctor,
          date: apt.date,
          amount: tarif.price,
          type: tarif.name,
          payment: "En attente",
          status: "pending" as const,
          assurance: apt.assurance || "Sans assurance",
          createdBy: "system" as const,
        });
      }
    } catch { /* billing store not available */ }
  }
}

/** Mark absent */
export function markAppointmentAbsent(id: string) {
  const apt = store.read().find(a => a.id === id);
  updateAppointmentStatus(id, "absent");

  if (apt?.patientId) {
    pushNotification({
      type: "appointment_absent",
      title: "Absence enregistrée",
      message: `Vous avez été marqué absent pour votre RDV du ${apt.date} à ${apt.startTime} avec ${apt.doctor}.`,
      targetRole: "patient",
      actionLink: "/dashboard/patient/appointments",
    });
  }
}

/** Toggle tag on appointment (urgent / retard) */
export function toggleAppointmentTag(id: string, tag: "urgent" | "retard") {
  store.set(prev => prev.map(a => {
    if (a.id !== id) return a;
    const tags = a.tags || [];
    const newTags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
    return { ...a, tags: newTags };
  }));
  // Read updated tags
  const apt = store.read().find(a => a.id === id);
  if (apt) supabaseUpdateAppointment(id, { tags: apt.tags } as any);
}

/** Save internal note on appointment */
export function saveAppointmentNote(id: string, note: string) {
  store.set(prev => prev.map(a => a.id === id ? { ...a, internalNote: note } : a));
  supabaseUpdateAppointment(id, { internalNote: note } as any);
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

/**
 * Check if teleconsultation payment is completed.
 */
export function isTeleconsultPaid(appointment: SharedAppointment): boolean {
  if (!appointment.teleconsultation) return true;
  return appointment.paymentStatus === "paid";
}

/**
 * Mark appointment as paid.
 */
export function markAppointmentPaid(id: string, amount: number) {
  store.set(prev => prev.map(a => a.id === id ? { ...a, paymentStatus: "paid" as const, paidAmount: amount } : a));
  supabaseUpdateAppointment(id, { paymentStatus: "paid", paidAmount: amount } as any);
}

/**
 * Book an appointment — high-level business action.
 */
export function bookAppointment(payload: {
  date: string;
  startTime: string;
  duration: number;
  patient: string;
  patientId: number | null;
  avatar: string;
  phone: string;
  motif: string;
  type: AppointmentType;
  doctor: string;
  doctorId?: string;
  assurance: string;
  teleconsultation?: boolean;
  createdBy?: "doctor" | "secretary" | "patient" | "public";
}): { success: boolean; id?: string; error?: string } {
  const booked = getBookedSlotsForDate(payload.date, payload.doctor);
  if (booked.includes(payload.startTime)) {
    return { success: false, error: "Ce créneau est déjà pris." };
  }
  const id = createAppointment({
    ...payload,
    status: "confirmed",
  });
  return { success: true, id };
}

export { addBlockedSlot as blockSlot } from "./sharedBlockedSlotsStore";

/** Get booked slots for a given date and doctor */
export function getBookedSlotsForDate(date: string, doctor?: string): string[] {
  const apts = store.read().filter(a => 
    a.date === date && 
    !["cancelled", "absent"].includes(a.status) &&
    (!doctor || a.doctor === doctor)
  );
  return apts.map(a => a.startTime);
}

/** Cancel appointments that conflict with new availability */
export function cancelConflictingAppointments(dayName: string, newStart: string, newEnd: string, breakStart?: string, breakEnd?: string): number {
  const dayMap: Record<string, number> = { "Dimanche": 0, "Lundi": 1, "Mardi": 2, "Mercredi": 3, "Jeudi": 4, "Vendredi": 5, "Samedi": 6 };
  const jsDay = dayMap[dayName];
  if (jsDay === undefined) return 0;

  const apts = store.read();
  let cancelledCount = 0;

  const toCancel = apts.filter(a => {
    if (["cancelled", "absent", "done"].includes(a.status)) return false;
    const aptDate = new Date(a.date + "T00:00:00");
    if (aptDate.getDay() !== jsDay) return false;
    if (a.date < getTodayDate()) return false;

    const aptStartMin = timeToMin(a.startTime);
    const aptEndMin = aptStartMin + a.duration;
    const dayStartMin = timeToMin(newStart);
    const dayEndMin = timeToMin(newEnd);

    if (aptStartMin < dayStartMin || aptEndMin > dayEndMin) return true;

    if (breakStart && breakEnd) {
      const bsMin = timeToMin(breakStart);
      const beMin = timeToMin(breakEnd);
      if (aptStartMin < beMin && aptEndMin > bsMin) return true;
    }

    return false;
  });

  toCancel.forEach(apt => {
    cancelAppointment(apt.id);
    cancelledCount++;
  });

  return cancelledCount;
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Check upcoming appointments in next 24h and send reminder notifications.
 */
export function checkUpcomingReminders() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const apts = store.read();
  const upcomingApts = apts.filter(a =>
    a.date === tomorrowStr &&
    !["cancelled", "absent", "done"].includes(a.status) &&
    !(a as any).reminderSent
  );

  if (upcomingApts.length === 0) return;

  for (const apt of upcomingApts) {
    if (apt.patientId) {
      pushNotification({
        type: "reminder",
        title: "Rappel RDV demain",
        message: `Votre RDV avec ${apt.doctor} est prévu demain à ${apt.startTime}.`,
        targetRole: "patient",
        actionLink: "/dashboard/patient/appointments",
      });
    }

    store.set(prev => prev.map(a =>
      a.id === apt.id ? { ...a, reminderSent: true } as any : a
    ));
  }
}
