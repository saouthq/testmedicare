/**
 * Shared appointment types — single source of truth for all roles.
 * Used by: DoctorSchedule, SecretaryAgenda, SecretaryDashboard, PublicBooking, WaitingRoom
 */

/** Unified appointment status enum */
export type AppointmentStatus =
  | "pending"       // En attente de confirmation
  | "confirmed"     // Confirmé
  | "arrived"       // Patient arrivé
  | "in_waiting"    // En salle d'attente
  | "in_progress"   // En consultation
  | "done"          // Terminé
  | "cancelled"     // Annulé
  | "absent";       // Patient absent (no_show)

/** Appointment type labels */
export type AppointmentType =
  | "Consultation"
  | "Suivi"
  | "Première visite"
  | "Contrôle"
  | "Téléconsultation"
  | "Urgence";

/** Color key for appointment type styling */
export type AppointmentColorKey = "primary" | "accent" | "warning" | "destructive" | "secondary" | "muted";

/** Shared appointment interface */
export interface SharedAppointment {
  id: string;
  date: string;         // YYYY-MM-DD
  startTime: string;    // HH:MM
  endTime: string;      // HH:MM
  duration: number;     // minutes
  patient: string;
  patientId: number | null;
  avatar: string;
  phone: string;
  motif: string;
  type: AppointmentType;
  status: AppointmentStatus;
  assurance: string;
  doctor: string;
  teleconsultation?: boolean;
  notes?: string;
  isNew?: boolean;
  arrivedAt?: string;
  waitTime?: number;
  tags?: ("urgent" | "retard")[];
  internalNote?: string;
  createdBy?: "doctor" | "secretary" | "patient" | "public";
}

/** Blocked slot interface */
export interface SharedBlockedSlot {
  id: string;
  date: string;         // YYYY-MM-DD
  startTime: string;    // HH:MM
  duration: number;     // minutes
  reason: string;
  doctor: string;
  recurring?: boolean;
  recurringDays?: number[];  // 0=Lun, 6=Dim
}

/** Leave / absence interface */
export interface SharedLeave {
  id: number;
  startDate: string;
  endDate: string;
  motif: string;
  type: "conge" | "formation" | "maladie" | "personnel";
  replacementDoctor: string;
  notifyPatients: boolean;
  status: "upcoming" | "active" | "past";
  affectedAppointments: number;
  doctor: string;
}

/** Availability day configuration */
export interface AvailabilityDay {
  active: boolean;
  start: string;      // HH:MM
  end: string;         // HH:MM
  breakStart: string;  // HH:MM or empty
  breakEnd: string;    // HH:MM or empty
}

/** Full availability config */
export interface AvailabilityConfig {
  days: Record<string, AvailabilityDay>;
  slotDuration: number; // minutes
  doctor: string;
}

/** Acte / tarif */
export interface SharedActe {
  id: number;
  code: string;
  name: string;
  price: number;
  conventionne: boolean;
  duration: number;
  active: boolean;
}

/** Status display config */
export const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, {
  label: string;
  className: string;
  bgClassName: string;
}> = {
  pending:     { label: "En attente",        className: "bg-warning/15 text-warning border border-warning/30",           bgClassName: "hover:bg-warning/5" },
  confirmed:   { label: "Confirmé",          className: "bg-accent/15 text-accent border border-accent/30",             bgClassName: "hover:bg-accent/5" },
  arrived:     { label: "Arrivé",            className: "bg-primary/15 text-primary border border-primary/30",          bgClassName: "bg-primary/5 border-l-4 border-l-primary" },
  in_waiting:  { label: "En salle d'attente", className: "bg-warning/15 text-warning border border-warning/30",         bgClassName: "bg-warning/5 border-l-4 border-l-warning" },
  in_progress: { label: "En consultation",   className: "bg-primary/15 text-primary border border-primary/30",          bgClassName: "bg-primary/5 border-l-4 border-l-primary" },
  done:        { label: "Terminé",           className: "bg-muted text-muted-foreground",                               bgClassName: "bg-muted/30 opacity-60" },
  cancelled:   { label: "Annulé",            className: "bg-destructive/10 text-destructive",                           bgClassName: "opacity-40 line-through" },
  absent:      { label: "Absent",            className: "bg-destructive/15 text-destructive border border-destructive/30", bgClassName: "opacity-50 bg-destructive/5" },
};

/** Type color mapping defaults */
export const DEFAULT_TYPE_COLORS: Record<AppointmentType, AppointmentColorKey> = {
  Consultation: "primary",
  Suivi: "accent",
  "Première visite": "warning",
  Urgence: "destructive",
  Téléconsultation: "primary",
  Contrôle: "accent",
};

/** Helper: compute endTime from start + duration (handles hour rollover) */
export function computeEndTime(startTime: string, durationMin: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const totalMin = h * 60 + m + durationMin;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
}
