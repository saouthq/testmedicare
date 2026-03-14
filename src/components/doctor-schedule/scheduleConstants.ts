// Schedule constants and types
import type {
  AppointmentColorKey,
  AppointmentStatus,
  AppointmentType,
  SharedAppointment,
} from "@/types/appointment";
import {
  APPOINTMENT_STATUS_CONFIG,
  DEFAULT_TYPE_COLORS,
} from "@/types/appointment";

export const DAY_START = 8 * 60;
export const DAY_END = 19 * 60;
export const SLOT_MINUTES = 30;
export const PX_PER_MINUTE = 1.45;
export const GRID_HEIGHT = (DAY_END - DAY_START) * PX_PER_MINUTE;
export const SLOT_HEIGHT = SLOT_MINUTES * PX_PER_MINUTE;

export const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const MONTHS_LONG = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
export const MONTHS_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
export const WEEKDAY_LONG = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export const STATUS_ORDER: AppointmentStatus[] = [
  "pending", "confirmed", "arrived", "in_waiting", "in_progress", "done", "absent", "cancelled",
];

export const ACTIVE_STATUSES: AppointmentStatus[] = [
  "pending", "confirmed", "arrived", "in_waiting", "in_progress",
];

export const STATUS_ACTIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["arrived", "absent", "cancelled"],
  arrived: ["in_waiting", "in_progress", "absent"],
  in_waiting: ["in_progress", "absent"],
  in_progress: [],
  done: [],
  absent: [],
  cancelled: [],
};

export const TYPE_LABELS: AppointmentType[] = [
  "Consultation", "Suivi", "Première visite", "Contrôle", "Téléconsultation", "Urgence",
];

export const DURATION_PRESETS = [15, 20, 30, 45, 60, 90];

export type BlockCalendarKind = "cabinet" | "personal";

export const BLOCK_REASON_PRESETS: Record<BlockCalendarKind, string[]> = {
  cabinet: ["Pause", "Réunion", "Formation", "Fermeture exceptionnelle"],
  personal: ["Déjeuner", "Administratif", "Personnel", "Déplacement"],
};

export const COLOR_STYLES: Record<AppointmentColorKey, string> = {
  primary: "bg-primary/10 border-primary/25 text-primary",
  accent: "bg-accent/10 border-accent/25 text-accent",
  warning: "bg-warning/10 border-warning/25 text-warning",
  destructive: "bg-destructive/10 border-destructive/25 text-destructive",
  secondary: "bg-secondary border-secondary text-secondary-foreground",
  muted: "bg-muted border-border text-muted-foreground",
};

export const COLOR_OPTIONS: { key: AppointmentColorKey; label: string; className: string }[] = [
  { key: "primary", label: "Bleu", className: "bg-primary/15 border-primary/30 text-primary" },
  { key: "accent", label: "Vert", className: "bg-accent/15 border-accent/30 text-accent" },
  { key: "warning", label: "Orange", className: "bg-warning/15 border-warning/30 text-warning" },
  { key: "destructive", label: "Rouge", className: "bg-destructive/15 border-destructive/30 text-destructive" },
  { key: "secondary", label: "Violet", className: "bg-secondary text-secondary-foreground border-secondary" },
  { key: "muted", label: "Neutre", className: "bg-muted text-muted-foreground border-border" },
];

export const TYPE_COLOR_STORAGE_KEY = "medicare_doctor_schedule_type_colors";

export const FILTER_OPTIONS: { value: "all" | AppointmentStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "confirmed", label: "Confirmés" },
  { value: "arrived", label: "Arrivés" },
  { value: "in_waiting", label: "Salle d'attente" },
  { value: "in_progress", label: "En consultation" },
  { value: "done", label: "Terminés" },
  { value: "cancelled", label: "Annulés" },
  { value: "absent", label: "Absents" },
];

export type ViewMode = "week" | "day" | "month" | "list";
export type DraftMode = "create" | "edit";

export type AppointmentDraft = {
  date: string;
  startTime: string;
  duration: number;
  type: AppointmentType;
  motif: string;
  teleconsultation: boolean;
  assurance: string;
  notes: string;
  patientMode: "existing" | "new";
  patientId: string;
  patientName: string;
  phone: string;
  email: string;
};

export type BlockDraft = {
  date: string;
  startTime: string;
  duration: number;
  reason: string;
  calendarKind: BlockCalendarKind;
};

export type SlotActionState = {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  closedDay: boolean;
  fromRange: boolean;
};
