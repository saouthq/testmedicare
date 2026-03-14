// Schedule helper functions
import {
  CheckCircle2,
  Clock3,
  UserRound,
  UserX,
  Stethoscope,
  CalendarClock,
  X,
} from "lucide-react";
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
import { WEEK_DAYS } from "@/stores/sharedAvailabilityStore";
import {
  DAY_START,
  SLOT_MINUTES,
  PX_PER_MINUTE,
  MONTHS_LONG,
  MONTHS_SHORT,
  WEEKDAY_LONG,
  COLOR_STYLES,
  type AppointmentDraft,
  type BlockDraft,
  type BlockCalendarKind,
} from "./scheduleConstants";

// ── Date helpers ──

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
}

export function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toTimeLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function getEndTimeLabel(startTime: string, duration: number) {
  return toTimeLabel(timeToMinutes(startTime) + duration);
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() === 0 ? 7 : copy.getDay();
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

export function addMonths(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + amount);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

export function isSameDay(a: Date, b: Date) {
  return formatDateKey(a) === formatDateKey(b);
}

export function getWeekDays(anchor: Date) {
  const start = getWeekStart(anchor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function getMonthMatrix(anchor: Date) {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);
  const firstDay = start.getDay() === 0 ? 6 : start.getDay() - 1;
  start.setDate(start.getDate() - firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function isWithinRange(dateKey: string, start: Date, end: Date) {
  const current = parseLocalDate(dateKey).getTime();
  return current >= start.getTime() && current <= end.getTime();
}

export function formatHumanDate(dateKey: string) {
  const date = parseLocalDate(dateKey);
  return `${WEEKDAY_LONG[date.getDay()]} ${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function weekHeaderLabel(anchor: Date) {
  const days = getWeekDays(anchor);
  const start = days[0];
  const end = days[6];
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${MONTHS_LONG[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}

export function getDayNameFromDateKey(dateKey: string) {
  const date = parseLocalDate(dateKey);
  return WEEK_DAYS[(date.getDay() + 6) % 7];
}

// ── Avatar ──

export function getAvatar(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Status helpers ──

export function getStatusLabel(status: AppointmentStatus) {
  return APPOINTMENT_STATUS_CONFIG[status]?.label || status;
}

export function getStatusClasses(status: AppointmentStatus) {
  return APPOINTMENT_STATUS_CONFIG[status]?.className || "bg-muted text-muted-foreground";
}

export function getStatusMarkerClasses(status: AppointmentStatus) {
  switch (status) {
    case "confirmed": return "bg-accent";
    case "arrived": return "bg-sky-500";
    case "in_waiting":
    case "pending": return "bg-warning";
    case "in_progress": return "bg-primary";
    case "done": return "bg-slate-400";
    case "absent": return "bg-orange-500";
    case "cancelled": return "bg-destructive";
    default: return "bg-muted-foreground";
  }
}

export function getStatusActionIcon(status: AppointmentStatus) {
  switch (status) {
    case "confirmed": return CheckCircle2;
    case "arrived": return UserRound;
    case "in_waiting": return Clock3;
    case "in_progress": return Stethoscope;
    case "done": return CheckCircle2;
    case "absent": return UserX;
    case "cancelled": return X;
    default: return CalendarClock;
  }
}

export function getTypeClasses(type: AppointmentType) {
  return COLOR_STYLES[DEFAULT_TYPE_COLORS[type]];
}

export function getStepIndex(status: AppointmentStatus) {
  if (status === "pending" || status === "confirmed") return 0;
  if (status === "arrived") return 1;
  if (status === "in_waiting") return 2;
  if (status === "in_progress") return 3;
  return 4;
}

export function statusActionLabel(status: AppointmentStatus) {
  switch (status) {
    case "confirmed": return "Confirmer";
    case "arrived": return "Marquer arrivé";
    case "in_waiting": return "Mettre en attente";
    case "in_progress": return "Ouvrir la consultation";
    case "done": return "Clôturer depuis la consultation";
    case "absent": return "Patient absent";
    case "cancelled": return "Annuler";
    default: return status;
  }
}

export function getRecommendedNextStatus(status: AppointmentStatus): AppointmentStatus | null {
  switch (status) {
    case "pending": return "confirmed";
    case "confirmed": return "arrived";
    case "arrived": return "in_waiting";
    case "in_waiting": return "in_progress";
    case "in_progress": return null;
    default: return null;
  }
}

export function getWorkflowHint(status: AppointmentStatus) {
  switch (status) {
    case "pending": return "Le rendez-vous doit être confirmé avant l'accueil du patient.";
    case "confirmed": return "Le patient est attendu. À son arrivée, passez-le à l'étape suivante.";
    case "arrived": return "Le patient est sur place. Vous pouvez le mettre en attente ou le prendre immédiatement.";
    case "in_waiting": return "Le patient attend d'être appelé. Lancez la consultation au bon moment.";
    case "in_progress": return "La consultation est en cours. La clôture se fait uniquement depuis la page Consultation.";
    case "done": return "Rendez-vous terminé. Le dossier patient et la consultation restent accessibles.";
    case "absent": return "Patient absent. Vous pouvez reprogrammer ce rendez-vous si besoin.";
    case "cancelled": return "Rendez-vous annulé. Vous pouvez créer un nouveau créneau si nécessaire.";
    default: return "Suivez les actions proposées pour garder un agenda cohérent.";
  }
}

// ── Draft factories ──

export function createDraft(date?: string, time?: string): AppointmentDraft {
  return {
    date: date || formatDateKey(new Date()),
    startTime: time || "09:00",
    duration: 30,
    type: "Consultation",
    motif: "",
    teleconsultation: false,
    assurance: "",
    notes: "",
    patientMode: "existing",
    patientId: "",
    patientName: "",
    phone: "",
    email: "",
  };
}

export function createBlockDraft(date?: string, time?: string, calendarKind: BlockCalendarKind = "cabinet"): BlockDraft {
  return {
    date: date || formatDateKey(new Date()),
    startTime: time || "12:00",
    duration: 30,
    reason: "Pause",
    calendarKind,
  };
}

// ── Navigation / block helpers ──

export function getConsultationHref(appointment: SharedAppointment) {
  return `/dashboard/doctor/consultation/new?patient=${appointment.patientId ?? ""}&aptId=${appointment.id}${appointment.teleconsultation ? "&teleconsult=true" : ""}`;
}

export function getBlockCalendarKind(reason: string | undefined): BlockCalendarKind {
  return String(reason || "").startsWith("[Personnel]") ? "personal" : "cabinet";
}

export function normalizeBlockReason(reason: string, calendarKind: BlockCalendarKind) {
  const clean = String(reason || "").replace(/^\[Personnel\]\s*/, "").trim() || "Blocage";
  return calendarKind === "personal" ? `[Personnel] ${clean}` : clean;
}

export function displayBlockReason(reason: string | undefined) {
  return String(reason || "").replace(/^\[Personnel\]\s*/, "").trim() || "Blocage";
}

// ── Grid positioning ──

export function slotTop(time: string) {
  return Math.max(0, (timeToMinutes(time) - DAY_START) * PX_PER_MINUTE);
}

export function slotHeight(duration: number) {
  return Math.max(28, duration * PX_PER_MINUTE);
}

export function getCurrentTimeLineTop(date: Date) {
  const now = new Date();
  if (!isSameDay(date, now)) return null;
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < DAY_START || minutes > (19 * 60)) return null;
  return Math.max(0, (minutes - DAY_START) * PX_PER_MINUTE);
}

// ── Appointment grouping ──

export type AppointmentGroup = {
  appointments: SharedAppointment[];
  start: number;
  end: number;
};

export function buildAppointmentGroups(items: SharedAppointment[]): AppointmentGroup[] {
  const sorted = [...items].sort((a, b) => {
    const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (diff !== 0) return diff;
    return a.duration - b.duration;
  });

  const groups: AppointmentGroup[] = [];
  let cluster: SharedAppointment[] = [];
  let clusterEnd = -1;

  const flushCluster = () => {
    if (!cluster.length) return;
    const start = Math.min(...cluster.map((item) => timeToMinutes(item.startTime)));
    const end = Math.max(...cluster.map((item) => timeToMinutes(item.startTime) + item.duration));
    groups.push({ appointments: [...cluster], start, end });
    cluster = [];
    clusterEnd = -1;
  };

  sorted.forEach((appointment) => {
    const start = timeToMinutes(appointment.startTime);
    const end = start + appointment.duration;
    if (!cluster.length) {
      cluster = [appointment];
      clusterEnd = end;
      return;
    }
    if (start < clusterEnd) {
      cluster.push(appointment);
      clusterEnd = Math.max(clusterEnd, end);
      return;
    }
    flushCluster();
    cluster = [appointment];
    clusterEnd = end;
  });

  flushCluster();
  return groups;
}

export function getStripeClassFromColorClass(colorClass: string) {
  if (colorClass.includes("destructive")) return "bg-destructive";
  if (colorClass.includes("warning")) return "bg-warning";
  if (colorClass.includes("accent")) return "bg-accent";
  if (colorClass.includes("secondary")) return "bg-secondary";
  if (colorClass.includes("muted")) return "bg-muted-foreground";
  return "bg-primary";
}
