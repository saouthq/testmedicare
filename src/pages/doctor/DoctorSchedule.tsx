// DoctorSchedule — Agenda médecin complet
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  Loader2,
  Lock,
  MessageSquare,
  MoonStar,
  Phone,
  Plus,
  Search,
  Palette,
  UserRound,
  UserX,
  Video,
  CheckCircle2,
  Stethoscope,
  RefreshCcw,
  CalendarClock,
  LayoutGrid,
  Printer,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { useAuth, useAppMode } from "@/stores/authStore";
import { getAppointmentRepo } from "@/modules/appointments";
import { getPatientRepo } from "@/modules/patients";
import { useSharedAvailability, WEEK_DAYS } from "@/stores/sharedAvailabilityStore";
import {
  addBlockedSlot,
  removeBlockedSlot,
  useSharedBlockedSlots,
} from "@/stores/sharedBlockedSlotsStore";
import type { SharedPatient } from "@/stores/sharedPatientsStore";
import type {
  AppointmentColorKey,
  AppointmentStatus,
  AppointmentType,
  SharedAppointment,
  SharedBlockedSlot,
} from "@/types/appointment";
import {
  APPOINTMENT_STATUS_CONFIG,
  computeEndTime,
  DEFAULT_TYPE_COLORS,
} from "@/types/appointment";

const DAY_START = 8 * 60;
const DAY_END = 19 * 60;
const SLOT_MINUTES = 30;
const PX_PER_MINUTE = 1.45;
const GRID_HEIGHT = (DAY_END - DAY_START) * PX_PER_MINUTE;
const SLOT_HEIGHT = SLOT_MINUTES * PX_PER_MINUTE;

const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_LONG = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const MONTHS_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const WEEKDAY_LONG = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const STATUS_ORDER: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "arrived",
  "in_waiting",
  "in_progress",
  "done",
  "absent",
  "cancelled",
];
const ACTIVE_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "arrived",
  "in_waiting",
  "in_progress",
];

const STATUS_ACTIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["arrived", "absent", "cancelled"],
  arrived: ["in_waiting", "in_progress", "absent"],
  in_waiting: ["in_progress", "absent"],
  in_progress: [],
  done: [],
  absent: [],
  cancelled: [],
};

const TYPE_LABELS: AppointmentType[] = [
  "Consultation",
  "Suivi",
  "Première visite",
  "Contrôle",
  "Téléconsultation",
  "Urgence",
];

const DURATION_PRESETS = [15, 20, 30, 45, 60, 90];

const BLOCK_REASON_PRESETS: Record<BlockCalendarKind, string[]> = {
  cabinet: ["Pause", "Réunion", "Formation", "Fermeture exceptionnelle"],
  personal: ["Déjeuner", "Administratif", "Personnel", "Déplacement"],
};

const COLOR_STYLES: Record<AppointmentColorKey, string> = {
  primary: "bg-primary/10 border-primary/25 text-primary",
  accent: "bg-accent/10 border-accent/25 text-accent",
  warning: "bg-warning/10 border-warning/25 text-warning",
  destructive: "bg-destructive/10 border-destructive/25 text-destructive",
  secondary: "bg-secondary border-secondary text-secondary-foreground",
  muted: "bg-muted border-border text-muted-foreground",
};

const COLOR_OPTIONS: { key: AppointmentColorKey; label: string; className: string }[] = [
  { key: "primary", label: "Bleu", className: "bg-primary/15 border-primary/30 text-primary" },
  { key: "accent", label: "Vert", className: "bg-accent/15 border-accent/30 text-accent" },
  { key: "warning", label: "Orange", className: "bg-warning/15 border-warning/30 text-warning" },
  { key: "destructive", label: "Rouge", className: "bg-destructive/15 border-destructive/30 text-destructive" },
  { key: "secondary", label: "Violet", className: "bg-secondary text-secondary-foreground border-secondary" },
  { key: "muted", label: "Neutre", className: "bg-muted text-muted-foreground border-border" },
];


const TYPE_COLOR_STORAGE_KEY = "medicare_doctor_schedule_type_colors";

const FILTER_OPTIONS: { value: "all" | AppointmentStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "confirmed", label: "Confirmés" },
  { value: "arrived", label: "Arrivés" },
  { value: "in_waiting", label: "Salle d'attente" },
  { value: "in_progress", label: "En consultation" },
  { value: "done", label: "Terminés" },
  { value: "cancelled", label: "Annulés" },
  { value: "absent", label: "Absents" },
];

type ViewMode = "week" | "day" | "month" | "list";
type DraftMode = "create" | "edit";

type AppointmentDraft = {
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

type BlockCalendarKind = "cabinet" | "personal";

type BlockDraft = {
  date: string;
  startTime: string;
  duration: number;
  reason: string;
  calendarKind: BlockCalendarKind;
};

type SlotActionState = {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  closedDay: boolean;
  fromRange: boolean;
};

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
}

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toTimeLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function getEndTimeLabel(startTime: string, duration: number) {
  return toTimeLabel(timeToMinutes(startTime) + duration);
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getWeekStart(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay() === 0 ? 7 : copy.getDay();
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function addMonths(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + amount);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function isSameDay(a: Date, b: Date) {
  return formatDateKey(a) === formatDateKey(b);
}

function getWeekDays(anchor: Date) {
  const start = getWeekStart(anchor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function getMonthMatrix(anchor: Date) {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);
  const firstDay = start.getDay() === 0 ? 6 : start.getDay() - 1;
  start.setDate(start.getDate() - firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function isWithinRange(dateKey: string, start: Date, end: Date) {
  const current = parseLocalDate(dateKey).getTime();
  return current >= start.getTime() && current <= end.getTime();
}

function formatHumanDate(dateKey: string) {
  const date = parseLocalDate(dateKey);
  return `${WEEKDAY_LONG[date.getDay()]} ${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

function getAvatar(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusLabel(status: AppointmentStatus) {
  return APPOINTMENT_STATUS_CONFIG[status]?.label || status;
}

function getStatusClasses(status: AppointmentStatus) {
  return APPOINTMENT_STATUS_CONFIG[status]?.className || "bg-muted text-muted-foreground";
}

function getStatusMarkerClasses(status: AppointmentStatus) {
  switch (status) {
    case "confirmed":
      return "bg-accent";
    case "arrived":
      return "bg-sky-500";
    case "in_waiting":
    case "pending":
      return "bg-warning";
    case "in_progress":
      return "bg-primary";
    case "done":
      return "bg-slate-400";
    case "absent":
      return "bg-orange-500";
    case "cancelled":
      return "bg-destructive";
    default:
      return "bg-muted-foreground";
  }
}

function getStatusActionIcon(status: AppointmentStatus) {
  switch (status) {
    case "confirmed":
      return CheckCircle2;
    case "arrived":
      return UserRound;
    case "in_waiting":
      return Clock3;
    case "in_progress":
      return Stethoscope;
    case "done":
      return CheckCircle2;
    case "absent":
      return UserX;
    case "cancelled":
      return X;
    default:
      return CalendarClock;
  }
}

function getTypeClasses(type: AppointmentType) {
  return COLOR_STYLES[DEFAULT_TYPE_COLORS[type]];
}

function getStepIndex(status: AppointmentStatus) {
  if (status === "pending" || status === "confirmed") return 0;
  if (status === "arrived") return 1;
  if (status === "in_waiting") return 2;
  if (status === "in_progress") return 3;
  return 4;
}

function statusActionLabel(status: AppointmentStatus) {
  switch (status) {
    case "confirmed":
      return "Confirmer";
    case "arrived":
      return "Marquer arrivé";
    case "in_waiting":
      return "Mettre en attente";
    case "in_progress":
      return "Ouvrir la consultation";
    case "done":
      return "Clôturer depuis la consultation";
    case "absent":
      return "Patient absent";
    case "cancelled":
      return "Annuler";
    default:
      return status;
  }
}

function getRecommendedNextStatus(status: AppointmentStatus): AppointmentStatus | null {
  switch (status) {
    case "pending":
      return "confirmed";
    case "confirmed":
      return "arrived";
    case "arrived":
      return "in_waiting";
    case "in_waiting":
      return "in_progress";
    case "in_progress":
      return null;
    default:
      return null;
  }
}

function getWorkflowHint(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return "Le rendez-vous doit être confirmé avant l'accueil du patient.";
    case "confirmed":
      return "Le patient est attendu. À son arrivée, passez-le à l'étape suivante.";
    case "arrived":
      return "Le patient est sur place. Vous pouvez le mettre en attente ou le prendre immédiatement.";
    case "in_waiting":
      return "Le patient attend d'être appelé. Lancez la consultation au bon moment.";
    case "in_progress":
      return "La consultation est en cours. La clôture se fait uniquement depuis la page Consultation.";
    case "done":
      return "Rendez-vous terminé. Le dossier patient et la consultation restent accessibles.";
    case "absent":
      return "Patient absent. Vous pouvez reprogrammer ce rendez-vous si besoin.";
    case "cancelled":
      return "Rendez-vous annulé. Vous pouvez créer un nouveau créneau si nécessaire.";
    default:
      return "Suivez les actions proposées pour garder un agenda cohérent.";
  }
}

function createDraft(date?: string, time?: string): AppointmentDraft {
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

function createBlockDraft(date?: string, time?: string, calendarKind: BlockCalendarKind = "cabinet"): BlockDraft {
  return {
    date: date || formatDateKey(new Date()),
    startTime: time || "12:00",
    duration: 30,
    reason: "Pause",
    calendarKind,
  };
}

function getConsultationHref(appointment: SharedAppointment) {
  return `/dashboard/doctor/consultation/new?patient=${appointment.patientId ?? ""}&aptId=${appointment.id}${appointment.teleconsultation ? "&teleconsult=true" : ""}`;
}

function getDayNameFromDateKey(dateKey: string) {
  const date = parseLocalDate(dateKey);
  return WEEK_DAYS[(date.getDay() + 6) % 7];
}

function getBlockCalendarKind(reason: string | undefined): BlockCalendarKind {
  return String(reason || "").startsWith("[Personnel]") ? "personal" : "cabinet";
}

function normalizeBlockReason(reason: string, calendarKind: BlockCalendarKind) {
  const clean = String(reason || "").replace(/^\[Personnel\]\s*/, "").trim() || "Blocage";
  return calendarKind === "personal" ? `[Personnel] ${clean}` : clean;
}

function displayBlockReason(reason: string | undefined) {
  return String(reason || "").replace(/^\[Personnel\]\s*/, "").trim() || "Blocage";
}

function slotTop(time: string) {
  return Math.max(0, (timeToMinutes(time) - DAY_START) * PX_PER_MINUTE);
}

function slotHeight(duration: number) {
  return Math.max(28, duration * PX_PER_MINUTE);
}

function getCurrentTimeLineTop(date: Date) {
  const now = new Date();
  if (!isSameDay(date, now)) return null;
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < DAY_START || minutes > DAY_END) return null;
  return Math.max(0, (minutes - DAY_START) * PX_PER_MINUTE);
}

function weekHeaderLabel(anchor: Date) {
  const days = getWeekDays(anchor);
  const start = days[0];
  const end = days[6];
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${MONTHS_LONG[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}


type AppointmentGroup = {
  appointments: SharedAppointment[];
  start: number;
  end: number;
};

function buildAppointmentGroups(items: SharedAppointment[]): AppointmentGroup[] {
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

function getStripeClassFromColorClass(colorClass: string) {
  if (colorClass.includes("destructive")) return "bg-destructive";
  if (colorClass.includes("warning")) return "bg-warning";
  if (colorClass.includes("accent")) return "bg-accent";
  if (colorClass.includes("secondary")) return "bg-secondary";
  if (colorClass.includes("muted")) return "bg-muted-foreground";
  return "bg-primary";
}


function AppointmentCard({
  appointment,
  colorClass,
  compact = false,
  onClick,
}: {
  appointment: SharedAppointment;
  colorClass: string;
  compact?: boolean;
  onClick: () => void;
}) {
  const isCancelled = appointment.status === "cancelled" || appointment.status === "absent";
  const isDone = appointment.status === "done";
  const stripeClass = getStripeClassFromColorClass(colorClass);
  const surfaceClass = isCancelled
    ? "border-red-200/70 bg-red-50/55 text-slate-700 opacity-[0.58]"
    : isDone
      ? "border-slate-200 bg-slate-100/80 text-slate-700 opacity-[0.60]"
      : "border-slate-200 bg-white text-slate-800 shadow-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative h-full w-full overflow-hidden rounded-lg border text-left transition-all hover:border-primary/30 hover:shadow-md ${surfaceClass}`}
      title={`${appointment.patient} · ${appointment.startTime}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1.5 ${stripeClass}`} />
      <div className="flex h-full flex-col justify-between p-2 pl-3">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{appointment.startTime}</span>
            {appointment.teleconsultation ? <Video className="h-3.5 w-3.5 shrink-0 text-primary" /> : null}
          </div>
          <p className={`mt-0.5 truncate font-bold ${compact ? "text-[11px]" : "text-xs"}`}>
            {appointment.patient}
          </p>
          {!compact ? (
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {appointment.motif || appointment.type}
            </p>
          ) : null}
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
            {appointment.type}
          </span>
          {!compact ? (
            <span className="text-[10px] font-medium text-slate-500">{appointment.duration} min</span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function EmptyPlanningState({ production }: { production: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
      <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Aucun rendez-vous sur cette période</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {production
          ? "Supabase ne renvoie encore aucun rendez-vous pour ce praticien."
          : "Ajoutez un rendez-vous ou changez la période pour remplir l'agenda."}
      </p>
    </div>
  );
}

export default function DoctorSchedule() {
  const { user, loading: authLoading } = useAuth();
  const [mode] = useAppMode();
  const production = mode === "production";
  const appointmentRepo = useMemo(() => getAppointmentRepo(), [mode]);
  const patientRepo = useMemo(() => getPatientRepo(), [mode]);
  const [availability] = useSharedAvailability();
  const [blockedSlots] = useSharedBlockedSlots();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<SharedAppointment[]>([]);
  const [patients, setPatients] = useState<SharedPatient[]>([]);
  const [view, setView] = useState<ViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return today;
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<SharedAppointment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [slotAction, setSlotAction] = useState<SlotActionState | null>(null);
  const [calendarFilter, setCalendarFilter] = useState<"all" | BlockCalendarKind>("all");
  const [draftMode, setDraftMode] = useState<DraftMode>("create");
  const [draft, setDraft] = useState<AppointmentDraft>(createDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [blockDraft, setBlockDraft] = useState<BlockDraft>(createBlockDraft());
  const [selectedBlock, setSelectedBlock] = useState<SharedBlockedSlot | null>(null);
  const [saving, setSaving] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [blockConflictAction, setBlockConflictAction] = useState<"keep" | "cancel">("keep");
  const [blockRepeatWeeks, setBlockRepeatWeeks] = useState(1);
  const [typeColors, setTypeColors] = useState<Record<AppointmentType, AppointmentColorKey>>(() => {
    if (typeof window === "undefined") return { ...DEFAULT_TYPE_COLORS };
    try {
      const raw = window.localStorage.getItem(TYPE_COLOR_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_TYPE_COLORS };
      return { ...DEFAULT_TYPE_COLORS, ...(JSON.parse(raw) as Partial<Record<AppointmentType, AppointmentColorKey>>) };
    } catch {
      return { ...DEFAULT_TYPE_COLORS };
    }
  });

  const loadSchedule = async (silent = false) => {
    if (!user?.id) {
      setAppointments([]);
      setPatients([]);
      setLoading(false);
      return;
    }

    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const [apts, pts] = await Promise.all([
        appointmentRepo.listByDoctor(user.id),
        patientRepo.listByDoctor(user.id),
      ]);

      const normalized = [...apts].sort((a, b) => {
        const aDateTime = `${a.date} ${a.startTime}`;
        const bDateTime = `${b.date} ${b.startTime}`;
        return aDateTime.localeCompare(bDateTime);
      });

      setAppointments(normalized);
      setPatients(pts);

      if (selectedAppointment) {
        const updatedSelection = normalized.find((item) => item.id === selectedAppointment.id) || null;
        setSelectedAppointment(updatedSelection);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur agenda",
        description: "Impossible de charger les rendez-vous du praticien.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadSchedule();
    }
  }, [authLoading, user?.id, mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TYPE_COLOR_STORAGE_KEY, JSON.stringify(typeColors));
  }, [typeColors]);

  const resolveTypeClasses = (type: AppointmentType) => COLOR_STYLES[typeColors[type] || DEFAULT_TYPE_COLORS[type]];

  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const monthDays = useMemo(() => getMonthMatrix(anchorDate), [anchorDate]);
  const todayKey = formatDateKey(new Date());

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchStatus = statusFilter === "all" ? true : appointment.status === statusFilter;
      const haystack = [
        appointment.patient,
        appointment.motif,
        appointment.type,
        appointment.phone,
        appointment.assurance,
      ]
        .join(" ")
        .toLowerCase();
      const matchQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [appointments, query, statusFilter]);

  const visibleAppointments = useMemo(() => {
    if (view === "day") {
      return filteredAppointments.filter((item) => item.date === formatDateKey(anchorDate));
    }

    if (view === "week") {
      const start = weekDays[0];
      const end = weekDays[6];
      return filteredAppointments.filter((item) => isWithinRange(item.date, start, end));
    }

    if (view === "month") {
      const start = monthDays[0];
      const end = monthDays[monthDays.length - 1];
      return filteredAppointments.filter((item) => isWithinRange(item.date, start, end));
    }

    return filteredAppointments;
  }, [filteredAppointments, view, anchorDate, weekDays, monthDays]);

  const stats = useMemo(() => {
    const todayAppointments = appointments.filter((item) => item.date === todayKey);
    return {
      today: todayAppointments.length,
      waiting: todayAppointments.filter((item) => item.status === "arrived" || item.status === "in_waiting").length,
      teleconsultation: todayAppointments.filter((item) => item.teleconsultation).length,
      active: todayAppointments.filter((item) => ACTIVE_STATUSES.includes(item.status)).length,
    };
  }, [appointments, todayKey]);

  const createAvailableSlots = useMemo(
    () => getAvailableSlots(draft.date, draft.duration, editingId),
    [draft.date, draft.duration, editingId, appointments, blockedSlots, availability],
  );

  const blockAvailableSlots = useMemo(
    () => getBlockStartOptions(blockDraft.date, blockDraft.duration),
    [blockDraft.date, blockDraft.duration, blockedSlots, availability],
  );

  const conflictingBlockAppointments = useMemo(
    () => getAppointmentsOverlappingRange(blockDraft.date, blockDraft.startTime, blockDraft.duration),
    [blockDraft.date, blockDraft.startTime, blockDraft.duration, appointments],
  );

  const rescheduleSuggestions = useMemo(() => {
    if (!selectedAppointment) return [] as Array<{ date: string; startTime: string }>;
    const suggestions: Array<{ date: string; startTime: string }> = [];
    const baseDate = parseLocalDate(selectedAppointment.date);
    for (let offset = 0; offset < 14 && suggestions.length < 8; offset += 1) {
      const date = addDays(baseDate, offset);
      const dateKey = formatDateKey(date);
      const slots = getAvailableSlots(dateKey, selectedAppointment.duration, selectedAppointment.id)
        .filter((slot) => !(dateKey === selectedAppointment.date && slot === selectedAppointment.startTime))
        .slice(0, offset === 0 ? 2 : 3);
      slots.forEach((slot) => {
        if (suggestions.length < 8) suggestions.push({ date: dateKey, startTime: slot });
      });
    }
    return suggestions;
  }, [selectedAppointment, appointments, blockedSlots, availability]);

  const isClosedDay = (dateKey: string) => {
    const dayName = getDayNameFromDateKey(dateKey);
    return !availability.days?.[dayName]?.active;
  };

  function getAvailableSlots(dateKey: string, duration = SLOT_MINUTES, ignoreAppointmentId?: string | null) {
    const dayName = getDayNameFromDateKey(dateKey);
    const dayConfig = availability.days?.[dayName];
    if (!dayConfig?.active) return [] as string[];
    const start = timeToMinutes(dayConfig.start || "08:00");
    const end = timeToMinutes(dayConfig.end || "18:00");
    const breakStart = dayConfig.breakStart ? timeToMinutes(dayConfig.breakStart) : null;
    const breakEnd = dayConfig.breakEnd ? timeToMinutes(dayConfig.breakEnd) : null;
    const dayAppointments = appointments.filter((item) => item.date === dateKey && item.id !== ignoreAppointmentId && item.status !== "cancelled" && item.status !== "absent");
    const dayBlocks = blockedSlots.filter((item) => item.date === dateKey);
    const slots: string[] = [];
    for (let t = start; t + duration <= end; t += SLOT_MINUTES) {
      const slotEnd = t + duration;
      const overlapsBreak = breakStart !== null && breakEnd !== null && t < breakEnd && slotEnd > breakStart;
      if (overlapsBreak) continue;
      const appointmentConflict = dayAppointments.some((item) => {
        const itemStart = timeToMinutes(item.startTime);
        const itemEnd = itemStart + item.duration;
        return t < itemEnd && slotEnd > itemStart;
      });
      if (appointmentConflict) continue;
      const blockConflict = dayBlocks.some((item) => {
        const itemStart = timeToMinutes(item.startTime);
        const itemEnd = itemStart + item.duration;
        return t < itemEnd && slotEnd > itemStart;
      });
      if (blockConflict) continue;
      slots.push(toTimeLabel(t));
    }
    return slots;
  }

  function getBlockStartOptions(dateKey: string, duration = SLOT_MINUTES) {
    const dayName = getDayNameFromDateKey(dateKey);
    const dayConfig = availability.days?.[dayName];
    const start = dayConfig?.start ? timeToMinutes(dayConfig.start) : DAY_START;
    const end = dayConfig?.end ? timeToMinutes(dayConfig.end) : DAY_END;
    const breakStart = dayConfig?.breakStart ? timeToMinutes(dayConfig.breakStart) : null;
    const breakEnd = dayConfig?.breakEnd ? timeToMinutes(dayConfig.breakEnd) : null;
    const dayBlocks = blockedSlots.filter((item) => item.date === dateKey);
    const slots: string[] = [];
    for (let t = start; t + duration <= end; t += SLOT_MINUTES) {
      const slotEnd = t + duration;
      const overlapsBreak = breakStart !== null && breakEnd !== null && t < breakEnd && slotEnd > breakStart;
      if (overlapsBreak) continue;
      const blockConflict = dayBlocks.some((item) => {
        const itemStart = timeToMinutes(item.startTime);
        const itemEnd = itemStart + item.duration;
        return t < itemEnd && slotEnd > itemStart;
      });
      if (blockConflict) continue;
      slots.push(toTimeLabel(t));
    }
    return slots;
  }

  function getAppointmentsOverlappingRange(dateKey: string, startTime: string, duration = SLOT_MINUTES) {
    const start = timeToMinutes(startTime);
    const end = start + duration;
    return appointments.filter((item) => {
      if (item.date !== dateKey) return false;
      if (item.status === "cancelled" || item.status === "absent") return false;
      const itemStart = timeToMinutes(item.startTime);
      const itemEnd = itemStart + item.duration;
      return start < itemEnd && end > itemStart;
    });
  }

  useEffect(() => {
    if (!showCreate) return;
    if (!createAvailableSlots.length) return;
    if (createAvailableSlots.includes(draft.startTime)) return;
    setDraft((prev) => ({ ...prev, startTime: createAvailableSlots[0] }));
  }, [showCreate, draft.startTime, createAvailableSlots]);

  useEffect(() => {
    if (!showBlock) return;
    if (!blockAvailableSlots.length) return;
    if (blockAvailableSlots.includes(blockDraft.startTime)) return;
    setBlockDraft((prev) => ({ ...prev, startTime: blockAvailableSlots[0] }));
  }, [showBlock, blockDraft.startTime, blockAvailableSlots]);

  const openSlotActions = (date: string, time: string) => {
    setSelectedAppointment(null);
    setSelectedBlock(null);
    setSlotAction({
      date,
      startTime: time,
      endTime: getEndTimeLabel(time, SLOT_MINUTES),
      duration: SLOT_MINUTES,
      closedDay: isClosedDay(date),
      fromRange: false,
    });
  };

  const openCreate = (date?: string, time?: string, duration = SLOT_MINUTES) => {
    setSlotAction(null);
    setDraftMode("create");
    setEditingId(null);
    const next = createDraft(date, time);
    next.duration = duration;
    setDraft(next);
    setShowCreate(true);
  };

  const openEdit = (appointment: SharedAppointment) => {
    setSlotAction(null);
    setDraftMode("edit");
    setEditingId(appointment.id);
    setDraft({
      date: appointment.date,
      startTime: appointment.startTime,
      duration: appointment.duration,
      type: appointment.type,
      motif: appointment.motif,
      teleconsultation: Boolean(appointment.teleconsultation),
      assurance: appointment.assurance,
      notes: appointment.notes || "",
      patientMode: appointment.patientId ? "existing" : "new",
      patientId: appointment.patientId ? String(appointment.patientId) : "",
      patientName: appointment.patient,
      phone: appointment.phone,
      email: "",
    });
    setShowCreate(true);
  };

  const openBlock = (date?: string, time?: string, calendarKind: BlockCalendarKind = "cabinet", duration = SLOT_MINUTES) => {
    setSlotAction(null);
    setSelectedBlock(null);
    setBlockConflictAction("keep");
    setBlockRepeatWeeks(1);
    const next = createBlockDraft(date, time, calendarKind);
    next.duration = duration;
    setBlockDraft(next);
    setShowBlock(true);
  };

  const goToPrev = () => {
    setAnchorDate((current) => {
      if (view === "day") return addDays(current, -1);
      if (view === "month") return addMonths(current, -1);
      return addDays(current, -7);
    });
  };

  const goToNext = () => {
    setAnchorDate((current) => {
      if (view === "day") return addDays(current, 1);
      if (view === "month") return addMonths(current, 1);
      return addDays(current, 7);
    });
  };

  const goToday = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    setAnchorDate(today);
  };

  const updateStatus = async (appointment: SharedAppointment, status: AppointmentStatus) => {
    try {
      setSaving(true);
      await appointmentRepo.updateStatus(appointment.id, status, {
        status,
        waitTime: status === "arrived" || status === "in_waiting" ? appointment.waitTime || 0 : appointment.waitTime,
      });
      toast({ title: `Rendez-vous ${getStatusLabel(status).toLowerCase()}` });
      await loadSchedule(true);
    } catch (error) {
      console.error(error);
      toast({ title: "Impossible de mettre à jour le statut", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAppointment = async () => {
    try {
      setSaving(true);

      let patientId: number | null = draft.patientMode === "existing" ? Number(draft.patientId || 0) || null : null;
      let patientName = draft.patientName.trim();
      let phone = draft.phone.trim();
      let assurance = draft.assurance.trim();

      if (draft.patientMode === "existing") {
        const selectedPatient = patients.find((item) => item.id === patientId);
        if (!selectedPatient) {
          toast({ title: "Sélectionnez un patient", variant: "destructive" });
          return;
        }
        patientName = selectedPatient.name;
        phone = selectedPatient.phone;
        assurance = draft.assurance.trim() || selectedPatient.assurance;
      } else {
        if (!patientName) {
          toast({ title: "Nom du patient requis", variant: "destructive" });
          return;
        }

        const createdPatient = await patientRepo.create({
          name: patientName,
          phone,
          email: draft.email,
          avatar: getAvatar(patientName),
          dob: "",
          assurance,
          numAssure: "",
          doctor: user?.doctorName || "",
          gouvernorat: "Tunis",
          lastVisit: "",
          nextAppointment: null,
          balance: 0,
          notes: draft.notes,
          history: [],
        });
        patientId = createdPatient.id;
      }

      const baseAppointment = {
        date: draft.date,
        startTime: draft.startTime,
        duration: draft.duration,
        patient: patientName,
        patientId,
        avatar: getAvatar(patientName),
        phone,
        motif: draft.motif || draft.type,
        type: draft.type,
        status: draftMode === "create" ? "confirmed" : (selectedAppointment?.status || "confirmed"),
        assurance,
        doctor: user?.doctorName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        doctorId: user?.id,
        teleconsultation: draft.teleconsultation,
        notes: draft.notes,
        createdBy: "doctor" as const,
      };

      if (draftMode === "create") {
        const created = await appointmentRepo.create(baseAppointment);
        toast({ title: "Rendez-vous créé", description: `${created.patient} · ${created.date} à ${created.startTime}` });
        setSelectedAppointment(created);
      } else if (editingId) {
        await appointmentRepo.updateStatus(editingId, baseAppointment.status, {
          ...baseAppointment,
          endTime: computeEndTime(baseAppointment.startTime, baseAppointment.duration),
        });
        toast({ title: "Rendez-vous mis à jour" });
      }

      setShowCreate(false);
      await loadSchedule(true);
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBlock = async () => {
    try {
      setSaving(true);
      let cancelledCount = 0;
      let keptConflictCount = 0;
      for (let weekOffset = 0; weekOffset < blockRepeatWeeks; weekOffset += 1) {
        const blockDate = formatDateKey(addDays(parseLocalDate(blockDraft.date), weekOffset * 7));
        const conflicts = getAppointmentsOverlappingRange(blockDate, blockDraft.startTime, blockDraft.duration);
        if (conflicts.length && blockConflictAction === "cancel") {
          await Promise.all(conflicts.map((item) => appointmentRepo.cancel(item.id)));
          cancelledCount += conflicts.length;
        } else {
          keptConflictCount += conflicts.length;
        }
        await addBlockedSlot({
          date: blockDate,
          startTime: blockDraft.startTime,
          duration: blockDraft.duration,
          reason: normalizeBlockReason(blockDraft.reason, blockDraft.calendarKind),
          doctor: user?.doctorName || "",
        });
      }
      toast({
        title: blockDraft.calendarKind === "personal" ? "Événement personnel ajouté" : "Créneau bloqué",
        description:
          blockRepeatWeeks > 1
            ? `${blockRepeatWeeks} semaines créées${cancelledCount ? ` · ${cancelledCount} rendez-vous annulés` : keptConflictCount ? ` · ${keptConflictCount} rendez-vous conservés` : ""}`
            : cancelledCount
              ? `${cancelledCount} rendez-vous concernés ont été annulés.`
              : keptConflictCount
                ? `${keptConflictCount} rendez-vous restent conservés sur la plage bloquée.`
                : undefined,
      });
      setShowBlock(false);
      await loadSchedule(true);
    } catch (error) {
      console.error(error);
      toast({ title: "Impossible de bloquer le créneau", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await removeBlockedSlot(blockId);
      toast({ title: "Blocage supprimé" });
      setSelectedBlock(null);
    } catch (error) {
      console.error(error);
      toast({ title: "Impossible de supprimer le blocage", variant: "destructive" });
    }
  };

  const handleQuickReschedule = async (appointment: SharedAppointment, date: string, startTime: string) => {
    try {
      setSaving(true);
      await appointmentRepo.updateStatus(appointment.id, appointment.status, {
        ...appointment,
        date,
        startTime,
        endTime: computeEndTime(startTime, appointment.duration),
      });
      toast({ title: "Rendez-vous reprogrammé", description: `${formatHumanDate(date)} · ${startTime}` });
      await loadSchedule(true);
      const refreshed = appointments.find((item) => item.id === appointment.id);
      if (refreshed) {
        setSelectedAppointment({ ...refreshed, date, startTime, endTime: computeEndTime(startTime, refreshed.duration) });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Impossible de reprogrammer", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateAppointment = (appointment: SharedAppointment) => {
    setDraftMode("create");
    setEditingId(null);
    setDraft({
      date: appointment.date,
      startTime: appointment.startTime,
      duration: appointment.duration,
      type: appointment.type,
      motif: appointment.motif,
      teleconsultation: Boolean(appointment.teleconsultation),
      assurance: appointment.assurance,
      notes: appointment.notes || "",
      patientMode: appointment.patientId ? "existing" : "new",
      patientId: appointment.patientId ? String(appointment.patientId) : "",
      patientName: appointment.patient,
      phone: appointment.phone,
      email: "",
    });
    setShowCreate(true);
  };

  const handleCopySms = (appointment: SharedAppointment) => {
    const message = `Bonjour ${appointment.patient}, votre rendez-vous est prévu le ${appointment.date} à ${appointment.startTime} avec ${appointment.doctor}.`;
    navigator.clipboard.writeText(message).then(() => {
      toast({ title: "Message copié" });
    });
  };

  const selectedSlotPreview = slotAction
    ? { date: slotAction.date, startTime: slotAction.startTime, endTime: slotAction.endTime }
    : null;

  const periodLabel =
    view === "day"
      ? formatHumanDate(formatDateKey(anchorDate))
      : view === "month"
        ? `${MONTHS_LONG[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
        : weekHeaderLabel(anchorDate);

  const renderDayGrid = (date: Date) => {
    const dateKey = formatDateKey(date);
    const dayAppointments = visibleAppointments.filter((item) => item.date === dateKey);
    const appointmentGroups = buildAppointmentGroups(dayAppointments);
    const dayBlocks = blockedSlots
      .filter((item) => item.date === dateKey)
      .filter((item) => calendarFilter === "all" || calendarFilter === getBlockCalendarKind(item.reason));
    const closedDay = isClosedDay(dateKey);
    const currentTimeLineTop = getCurrentTimeLineTop(date);

    return (
      <div className="relative flex-1 border-l border-border/70 bg-background">
        {Array.from({ length: (DAY_END - DAY_START) / SLOT_MINUTES }).map((_, index) => {
          const startMinutes = DAY_START + index * SLOT_MINUTES;
          const timeLabel = toTimeLabel(startMinutes);
          const isSelectedRange = selectedSlotPreview?.date === dateKey
            && startMinutes >= timeToMinutes(selectedSlotPreview.startTime)
            && startMinutes < timeToMinutes(selectedSlotPreview.endTime);
          return (
            <button
              key={`${dateKey}-${timeLabel}`}
              type="button"
              onClick={() => openSlotActions(dateKey, timeLabel)}
              className={`absolute left-0 right-0 border-t border-border/70 transition ${closedDay ? "hover:bg-muted/50" : "hover:bg-primary/5"} ${isSelectedRange ? "bg-primary/8" : ""}`}
              style={{ top: index * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              aria-label={`Gérer le créneau du ${dateKey} à ${timeLabel}`}
            />
          );
        })}

        {currentTimeLineTop !== null ? (
          <div
            className="pointer-events-none absolute left-0 right-0 z-20"
            style={{ top: currentTimeLineTop }}
            aria-hidden="true"
          >
            <div className="relative h-0">
              <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500 shadow-sm ring-2 ring-background" />
              <div className="h-px w-full bg-red-500/90 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]" />
            </div>
          </div>
        ) : null}

        {closedDay ? <div className="pointer-events-none absolute inset-0 bg-muted/25" /> : null}

        {dayBlocks.map((block) => {
          const kind = getBlockCalendarKind(block.reason);
          const blockClass = kind === "personal"
            ? "border-violet-300/70 bg-violet-50 text-violet-700"
            : "border-muted-foreground/35 bg-muted/70 text-muted-foreground";
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => setSelectedBlock(block)}
              className={`absolute left-1 right-1 rounded-xl border px-2 py-1 text-left shadow-sm ${blockClass}`}
              style={{ top: slotTop(block.startTime), height: slotHeight(block.duration) }}
            >
              <div className="flex items-center gap-1 text-xs font-medium">
                <Lock className="h-3 w-3" />
                <span className="truncate">{displayBlockReason(block.reason)}</span>
              </div>
              <p className="mt-1 text-[10px] opacity-80">
                {block.startTime} · {block.duration} min · {kind === "personal" ? "Personnel" : "Cabinet"}
              </p>
            </button>
          );
        })}

        {appointmentGroups.map((group) => {
          const naturalHeight = Math.max(52, (group.end - group.start) * PX_PER_MINUTE);
          const top = Math.max(0, (group.start - DAY_START) * PX_PER_MINUTE);
          const isConflictGroup = group.appointments.length > 1;

          if (!isConflictGroup) {
            const appointment = group.appointments[0];
            return (
              <div
                key={appointment.id}
                className="absolute"
                style={{
                  top,
                  height: Math.max(44, slotHeight(appointment.duration) - 2),
                  left: 4,
                  width: "calc(100% - 8px)",
                  zIndex: 30,
                }}
              >
                <AppointmentCard
                  appointment={appointment}
                  colorClass={resolveTypeClasses(appointment.type)}
                  compact={appointment.duration <= 25}
                  onClick={() => setSelectedAppointment(appointment)}
                />
              </div>
            );
          }

          return (
            <div
              key={`${dateKey}-${group.start}-${group.end}`}
              className="absolute overflow-hidden rounded-xl border border-primary/20 bg-white/95 shadow-sm backdrop-blur-sm"
              style={{
                top,
                height: naturalHeight,
                left: 4,
                width: "calc(100% - 8px)",
                zIndex: 34,
              }}
            >
              <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-2 py-1">
                <span className="text-[10px] font-semibold text-primary">
                  {group.appointments.length} rendez-vous en conflit
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {toTimeLabel(group.start)} → {toTimeLabel(group.end)}
                </span>
              </div>
              <div className="h-[calc(100%-30px)] space-y-1 overflow-y-auto p-1">
                {group.appointments.map((appointment) => (
                  <div key={appointment.id} className="h-14">
                    <AppointmentCard
                      appointment={appointment}
                      colorClass={resolveTypeClasses(appointment.type)}
                      compact={false}
                      onClick={() => setSelectedAppointment(appointment)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const dayColumnLabel = (date: Date) => {
    const isTodayColumn = isSameDay(date, new Date());
    return (
      <div className={`border-b border-border/70 px-3 py-3 text-center ${isTodayColumn ? "bg-primary/5" : "bg-muted/20"}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}
        </p>
        <p className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isTodayColumn ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground"}`}>
          {date.getDate()}
        </p>
      </div>
    );
  };

  const renderWeekView = () => (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid" style={{ gridTemplateColumns: "72px repeat(7, minmax(0,1fr))" }}>
        <div className="border-b border-border/70 bg-muted/20" />
        {weekDays.map((day) => (
          <div key={formatDateKey(day)}>{dayColumnLabel(day)}</div>
        ))}
      </div>

      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 172px)" }}>
        <div className="grid" style={{ gridTemplateColumns: "72px repeat(7, minmax(0,1fr))" }}>
          <div className="relative border-r border-border/70 bg-card" style={{ height: GRID_HEIGHT }}>
            {Array.from({ length: (DAY_END - DAY_START) / SLOT_MINUTES }).map((_, index) => {
              const startMinutes = DAY_START + index * SLOT_MINUTES;
              const timeLabel = toTimeLabel(startMinutes);
              return index % 2 === 0 ? (
                <div
                  key={timeLabel}
                  className="absolute right-2 text-[11px] text-muted-foreground"
                  style={{ top: index * SLOT_HEIGHT - 8 }}
                >
                  {timeLabel}
                </div>
              ) : null;
            })}
          </div>

          {weekDays.map((day) => (
            <div key={formatDateKey(day)} style={{ height: GRID_HEIGHT }}>
              {renderDayGrid(day)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDayView = () => (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b border-border/70 bg-muted/20 px-4 py-3">
        <h3 className="text-lg font-semibold">{formatHumanDate(formatDateKey(anchorDate))}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {visibleAppointments.length} rendez-vous sur cette journée
        </p>
      </div>
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 215px)" }}>
        <div className="grid" style={{ gridTemplateColumns: "72px minmax(0,1fr)" }}>
          <div className="relative border-r" style={{ height: GRID_HEIGHT }}>
            {Array.from({ length: (DAY_END - DAY_START) / SLOT_MINUTES }).map((_, index) => {
              const startMinutes = DAY_START + index * SLOT_MINUTES;
              const timeLabel = toTimeLabel(startMinutes);
              return index % 2 === 0 ? (
                <div
                  key={timeLabel}
                  className="absolute right-2 text-[11px] text-muted-foreground"
                  style={{ top: index * SLOT_HEIGHT - 8 }}
                >
                  {timeLabel}
                </div>
              ) : null;
            })}
          </div>
          <div style={{ height: GRID_HEIGHT }}>{renderDayGrid(anchorDate)}</div>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const monthKey = `${anchorDate.getFullYear()}-${anchorDate.getMonth()}`;
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid grid-cols-7 border-b bg-muted/20">
          {DAYS_SHORT.map((day) => (
            <div key={`${monthKey}-${day}`} className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y">
          {monthDays.map((day) => {
            const dayKey = formatDateKey(day);
            const sameMonth = day.getMonth() === anchorDate.getMonth();
            const dayAppointments = visibleAppointments.filter((item) => item.date === dayKey);
            return (
              <button
                key={dayKey}
                type="button"
                onClick={() => {
                  setAnchorDate(day);
                  setView("day");
                }}
                className={`min-h-[130px] px-2 py-2 text-left transition hover:bg-muted/30 ${sameMonth ? "bg-background" : "bg-muted/15 text-muted-foreground"}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${dayKey === todayKey ? "bg-primary text-primary-foreground" : ""}`}>
                    {day.getDate()}
                  </span>
                  {dayAppointments.length > 0 && <span className="text-[10px] text-muted-foreground">{dayAppointments.length} RDV</span>}
                </div>
                <div className="mt-2 space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className={`rounded-lg border px-2 py-1 text-[11px] ${resolveTypeClasses(appointment.type)} ${appointment.status === "done" ? "opacity-[0.60]" : appointment.status === "cancelled" || appointment.status === "absent" ? "opacity-[0.58]" : ""}`}>
                      <div className="flex items-center gap-1 truncate">
                        <span className="font-semibold">{appointment.startTime}</span>
                        <span className="truncate">{appointment.patient}</span>
                      </div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <p className="text-[11px] font-medium text-primary">+{dayAppointments.length - 3} autres</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const grouped = visibleAppointments.reduce<Record<string, SharedAppointment[]>>((acc, appointment) => {
      acc[appointment.date] ??= [];
      acc[appointment.date].push(appointment);
      return acc;
    }, {});

    const keys = Object.keys(grouped).sort();

    if (!keys.length) return <EmptyPlanningState production={production} />;

    return (
      <div className="space-y-4">
        {keys.map((dateKey) => (
          <div key={dateKey} className="overflow-hidden rounded-2xl border bg-card">
            <div className="border-b bg-muted/20 px-4 py-3">
              <h3 className="font-semibold">{formatHumanDate(dateKey)}</h3>
              <p className="text-xs text-muted-foreground">{grouped[dateKey].length} rendez-vous</p>
            </div>
            <div className="divide-y">
              {grouped[dateKey]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => setSelectedAppointment(appointment)}
                    className={`flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-muted/20 ${appointment.status === "done" ? "opacity-[0.60]" : appointment.status === "cancelled" || appointment.status === "absent" ? "opacity-[0.58]" : ""}`}
                  >
                    <div className="w-20 shrink-0">
                      <p className="font-semibold">{appointment.startTime}</p>
                      <p className="text-xs text-muted-foreground">{appointment.duration} min</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {appointment.avatar || getAvatar(appointment.patient)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{appointment.patient}</p>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          <span className={`h-2 w-2 rounded-full ${getStatusMarkerClasses(appointment.status)}`} />
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {appointment.type} · {appointment.motif || "Sans motif"}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${resolveTypeClasses(appointment.type)}`}>
                      {appointment.type}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPlanning = () => {
    if (!visibleAppointments.length && view === "list") {
      return <EmptyPlanningState production={production} />;
    }

    if (view === "day") return renderDayView();
    if (view === "month") return renderMonthView();
    if (view === "list") return renderListView();
    return renderWeekView();
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="doctor" title="Planning">
        <LoadingSkeleton type="table" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor" title="Planning">
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card px-4 py-2 shadow-sm sm:px-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[22px] font-bold tracking-tight">Planning</h1>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${production ? "border-accent/30 bg-accent/10 text-accent" : "border-primary/30 bg-primary/10 text-primary"}`}>
                    {production ? "Supabase" : "Démo"}
                  </span>
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">Auj. {stats.today}</span>
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">Attente {stats.waiting}</span>
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">Visio {stats.teleconsultation}</span>
                                  </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => loadSchedule(true)} disabled={refreshing}>
                  {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                  Actualiser
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowColors(true)}>
                  <Palette className="mr-2 h-4 w-4" /> Couleurs
                </Button>
                <Button variant="outline" size="sm" onClick={() => openBlock(undefined, undefined, "cabinet")}>
                  <Lock className="mr-2 h-4 w-4" /> Bloquer cabinet
                </Button>
                <Button variant="outline" size="sm" onClick={() => openBlock(undefined, undefined, "personal")}>
                  <CalendarClock className="mr-2 h-4 w-4" /> Indispo perso
                </Button>
                <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => openCreate()}>
                  <Plus className="mr-2 h-4 w-4" /> Créer un rendez-vous
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToday}>Aujourd'hui</Button>
                <div className="ml-1">
                  <p className="text-base font-semibold leading-none sm:text-lg">{periodLabel}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-end">
                <div className="relative min-w-[220px] flex-1 xl:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Rechercher un patient, motif, téléphone..."
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                  <SelectTrigger className="w-full xl:w-[160px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="inline-flex rounded-xl border bg-muted/20 p-1">
                  {[
                    { key: "all", label: "Tous" },
                    { key: "cabinet", label: "Cabinet" },
                    { key: "personal", label: "Personnel" },
                  ].map((item) => {
                    const active = calendarFilter === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setCalendarFilter(item.key as typeof calendarFilter)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="inline-flex rounded-xl border bg-muted/20 p-1">
                  {[
                    { key: "week", label: "Semaine", icon: LayoutGrid },
                    { key: "day", label: "Journée", icon: CalendarDays },
                    { key: "month", label: "Mois", icon: MoonStar },
                    { key: "list", label: "Liste", icon: List },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = view === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setView(item.key as ViewMode)}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPlanning()}
      </div>

      <Sheet open={Boolean(selectedAppointment)} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          {selectedAppointment && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-base font-bold text-primary">
                    {selectedAppointment.avatar || getAvatar(selectedAppointment.patient)}
                  </span>
                  <span>
                    <span className="block text-lg sm:text-xl">{selectedAppointment.patient}</span>
                    <span className={`mt-1 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(selectedAppointment.status)}`}>
                      {(() => {
                        const StatusIcon = getStatusActionIcon(selectedAppointment.status);
                        return <StatusIcon className="h-3.5 w-3.5" />;
                      })()}
                      <span>{getStatusLabel(selectedAppointment.status)}</span>
                    </span>
                  </span>
                </SheetTitle>
                <SheetDescription>
                  {selectedAppointment.type} · {selectedAppointment.motif || "Sans motif"}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</p>
                  <p className="mt-2 text-lg font-semibold">{formatHumanDate(selectedAppointment.date)}</p>
                </div>
                <div className="rounded-xl border bg-muted/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Heure</p>
                  <p className="mt-2 text-lg font-semibold">
                    {selectedAppointment.startTime} · {selectedAppointment.duration} min
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assurance</p>
                  <p className="mt-2 text-sm font-medium">{selectedAppointment.assurance || "—"}</p>
                </div>
                <div className="rounded-xl border bg-muted/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Téléphone</p>
                  <p className="mt-2 text-sm font-medium">{selectedAppointment.phone || "—"}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">Progression du rendez-vous</h3>
                  <span className="text-xs text-muted-foreground">source réelle : {selectedAppointment.date} · {selectedAppointment.startTime}</span>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[
                    "Confirmé",
                    "Arrivé",
                    "Salle d'attente",
                    "Consultation",
                    "Terminé",
                  ].map((step, index) => {
                    const active = index <= getStepIndex(selectedAppointment.status);
                    return (
                      <div key={step} className="space-y-2 text-center">
                        <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {index + 1}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{step}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border bg-primary/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Étape recommandée</p>
                      <h3 className="mt-1 font-semibold text-foreground">
                        {getRecommendedNextStatus(selectedAppointment.status)
                          ? statusActionLabel(getRecommendedNextStatus(selectedAppointment.status) as AppointmentStatus)
                          : "Aucune transition immédiate"}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{getWorkflowHint(selectedAppointment.status)}</p>
                    </div>
                    <CalendarClock className="mt-0.5 h-5 w-5 text-primary" />
                  </div>
                  {selectedAppointment.status === "in_progress" ? (
                    <Button asChild className="mt-4 w-full gradient-primary text-primary-foreground">
                      <Link to={getConsultationHref(selectedAppointment)}>
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Revenir à la consultation
                      </Link>
                    </Button>
                  ) : getRecommendedNextStatus(selectedAppointment.status) ? (
                    <Button
                      className="mt-4 w-full gradient-primary text-primary-foreground"
                      disabled={saving}
                      onClick={() => updateStatus(selectedAppointment, getRecommendedNextStatus(selectedAppointment.status) as AppointmentStatus)}
                    >
                      {(() => {
                        const ActionIcon = getStatusActionIcon(getRecommendedNextStatus(selectedAppointment.status) as AppointmentStatus);
                        return <ActionIcon className="mr-2 h-4 w-4" />;
                      })()}
                      {statusActionLabel(getRecommendedNextStatus(selectedAppointment.status) as AppointmentStatus)}
                    </Button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Actions du rendez-vous</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {STATUS_ACTIONS[selectedAppointment.status].map((nextStatus) => {
                      const ActionIcon = getStatusActionIcon(nextStatus);
                      return (
                        <Button
                          key={nextStatus}
                          variant={nextStatus === "cancelled" || nextStatus === "absent" ? "outline" : "default"}
                          className={nextStatus === "cancelled" || nextStatus === "absent" ? "justify-start" : "justify-start gradient-primary text-primary-foreground"}
                          disabled={saving}
                          onClick={() => updateStatus(selectedAppointment, nextStatus)}
                        >
                          <ActionIcon className="mr-2 h-4 w-4" />
                          {statusActionLabel(nextStatus)}
                        </Button>
                      );
                    })}
                    <Button variant="outline" className="justify-start" onClick={() => openEdit(selectedAppointment)}>
                      <Clock3 className="mr-2 h-4 w-4" /> Modifier / reprogrammer
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => window.print()}>
                      <Printer className="mr-2 h-4 w-4" /> Imprimer la fiche
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => handleCopySms(selectedAppointment)}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Copier le rappel
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                      <a href={`tel:${selectedAppointment.phone}`}>
                        <Phone className="mr-2 h-4 w-4" /> Appeler le patient
                      </a>
                    </Button>
                    {selectedAppointment.patientId ? (
                      <Button asChild variant="outline" className="justify-start">
                        <Link to={`/dashboard/doctor/patients/${selectedAppointment.patientId}`}>
                          <UserRound className="mr-2 h-4 w-4" /> Ouvrir le dossier patient
                        </Link>
                      </Button>
                    ) : null}
                    <Button asChild variant="outline" className="justify-start">
                      <Link to={getConsultationHref(selectedAppointment)}>
                        {selectedAppointment.teleconsultation ? <Video className="mr-2 h-4 w-4" /> : <Stethoscope className="mr-2 h-4 w-4" />}
                        {selectedAppointment.teleconsultation ? "Rejoindre la téléconsultation" : "Ouvrir la consultation"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Créneaux suggérés</h3>
                    <p className="text-sm text-muted-foreground">2 créneaux proches.</p>
                  </div>
                  <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                </div>
                {rescheduleSuggestions.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rescheduleSuggestions.slice(0, 2).map((slot) => (
                      <button
                        key={`${slot.date}-${slot.startTime}`}
                        type="button"
                        onClick={() => handleQuickReschedule(selectedAppointment, slot.date, slot.startTime)}
                        className="rounded-full border px-3 py-2 text-left text-sm transition hover:border-primary/35 hover:bg-primary/5"
                        disabled={saving}
                      >
                        {formatHumanDate(slot.date)} · {slot.startTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Aucun créneau compatible trouvé.</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="justify-start" onClick={() => openEdit(selectedAppointment)}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Plus de créneaux
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => handleDuplicateAppointment(selectedAppointment)}>
                    <Plus className="mr-2 h-4 w-4" /> Dupliquer
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={showCreate} onOpenChange={setShowCreate}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <div className="-mx-6 border-b bg-background px-6 pb-4 pt-6">
            <SheetHeader>
              <SheetTitle>{draftMode === "create" ? "Nouveau rendez-vous" : "Modifier le rendez-vous"}</SheetTitle>
              <SheetDescription>
                Création rapide : créneau réel, patient existant ou nouveau patient.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 rounded-2xl border bg-muted/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Créneau retenu</p>
                  <p className="mt-1 text-lg font-semibold leading-tight">
                    {formatHumanDate(draft.date)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {draft.startTime} → {getEndTimeLabel(draft.startTime, draft.duration)} · {draft.duration} min
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    {draft.teleconsultation ? "Visio" : "Cabinet"}
                  </span>
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    Auto-confirmé
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr,0.9fr]">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={draft.date}
                    onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
                  />
                </div>
                <div>
                  <Label>Durée</Label>
                  <Select
                    value={String(draft.duration)}
                    onValueChange={(value) => setDraft((prev) => ({ ...prev, duration: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Durée" />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 20, 30, 45, 60, 90].map((duration) => (
                        <SelectItem key={duration} value={String(duration)}>
                          {duration} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {DURATION_PRESETS.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, duration }))}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${draft.duration === duration ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                  >
                    {duration} min
                  </button>
                ))}
                {createAvailableSlots[0] ? (
                  <button
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, startTime: createAvailableSlots[0] }))}
                    className="rounded-full border border-dashed px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  >
                    Premier libre · {createAvailableSlots[0]}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Horaires disponibles</h3>
                  <p className="text-sm text-muted-foreground">Choisissez directement l'horaire utile. Le reste du formulaire s'adapte à ce créneau.</p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{getDayNameFromDateKey(draft.date)}</span>
              </div>
              {isClosedDay(draft.date) ? (
                <p className="mt-3 text-sm text-amber-600">Cabinet fermé ce jour. Ouvrez la plage depuis le planning ou passez en événement personnel.</p>
              ) : createAvailableSlots.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {createAvailableSlots.slice(0, 24).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, startTime: slot }))}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${draft.startTime === slot ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Aucun créneau libre sur cette durée pour cette date.</p>
              )}
            </div>
          </div>

          <div className="space-y-5 px-0 pb-2 pt-5">
            <div>
              <Label>Type de rendez-vous</Label>
              <Select
                value={draft.type}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    type: value as AppointmentType,
                    teleconsultation: value === "Téléconsultation" ? true : prev.teleconsultation,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_LABELS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Patient</h3>
                  <p className="text-sm text-muted-foreground">Choisir un patient existant ou créer un nouveau dossier.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={draft.patientMode === "existing" ? "default" : "outline"}
                    className={draft.patientMode === "existing" ? "gradient-primary text-primary-foreground" : ""}
                    onClick={() => setDraft((prev) => ({ ...prev, patientMode: "existing" }))}
                  >
                    Patient existant
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={draft.patientMode === "new" ? "default" : "outline"}
                    className={draft.patientMode === "new" ? "gradient-primary text-primary-foreground" : ""}
                    onClick={() => setDraft((prev) => ({ ...prev, patientMode: "new" }))}
                  >
                    Nouveau patient
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                {draft.patientMode === "existing" ? (
                  <>
                    <Label>Patient</Label>
                    <Select
                      value={draft.patientId}
                      onValueChange={(value) => {
                        const found = patients.find((item) => String(item.id) === value);
                        setDraft((prev) => ({
                          ...prev,
                          patientId: value,
                          patientName: found?.name || "",
                          phone: found?.phone || prev.phone,
                          assurance: found?.assurance || prev.assurance,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={String(patient.id)}>
                            {patient.name} · {patient.phone || "sans téléphone"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {draft.patientId ? (() => {
                      const selectedPatient = patients.find((item) => String(item.id) === draft.patientId);
                      return selectedPatient ? (
                        <div className="mt-3 rounded-2xl border bg-muted/10 p-3 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{selectedPatient.name}</p>
                              <p className="mt-1 text-muted-foreground">{selectedPatient.phone || "Téléphone non renseigné"}</p>
                              <p className="text-muted-foreground">{selectedPatient.assurance || "Assurance non renseignée"}</p>
                            </div>
                            <span className="rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">Patient existant</span>
                          </div>
                        </div>
                      ) : null;
                    })() : null}
                  </>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Nom du patient</Label>
                      <Input
                        value={draft.patientName}
                        onChange={(event) => setDraft((prev) => ({ ...prev, patientName: event.target.value }))}
                        placeholder="Nom et prénom"
                      />
                    </div>
                    <div>
                      <Label>Téléphone</Label>
                      <Input
                        value={draft.phone}
                        onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="+216 ..."
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={draft.email}
                        onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="patient@email.tn"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Motif</Label>
                <Input
                  value={draft.motif}
                  onChange={(event) => setDraft((prev) => ({ ...prev, motif: event.target.value }))}
                  placeholder="Motif médical ou administratif"
                />
              </div>
              <div>
                <Label>Assurance</Label>
                <Input
                  value={draft.assurance}
                  onChange={(event) => setDraft((prev) => ({ ...prev, assurance: event.target.value }))}
                  placeholder="Assurance / mutuelle"
                />
              </div>
              <div>
                <Label>Canal</Label>
                <Select
                  value={draft.teleconsultation ? "oui" : "non"}
                  onValueChange={(value) => setDraft((prev) => ({ ...prev, teleconsultation: value === "oui" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non">Cabinet</SelectItem>
                    <SelectItem value="oui">Vidéo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Notes internes</Label>
                <Textarea
                  value={draft.notes}
                  onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Instructions internes, documents à préparer, remarques de secrétariat..."
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
              <p>
                Le rendez-vous sera enregistré avec sa vraie date <strong className="text-foreground">{draft.date}</strong> et son vrai créneau <strong className="text-foreground">{draft.startTime} → {getEndTimeLabel(draft.startTime, draft.duration)}</strong>.
                Le drawer du planning lira ensuite exactement cet objet, ce qui supprime les décalages visuels de date.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)} disabled={saving}>
                Annuler
              </Button>
              <Button className="gradient-primary text-primary-foreground" onClick={handleSubmitAppointment} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {draftMode === "create" ? "Créer le rendez-vous" : "Enregistrer les modifications"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showColors} onOpenChange={setShowColors}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Couleurs du planning</SheetTitle>
            <SheetDescription>
              Personnalisez la couleur des cartes par type de rendez-vous. Préférence enregistrée pour ce médecin sur ce navigateur.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            {TYPE_LABELS.map((type) => (
              <div key={type} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{type}</p>
                    <p className="text-xs text-muted-foreground">Aperçu dans l'agenda</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${resolveTypeClasses(type)}`}>{type}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={`${type}-${option.key}`}
                      type="button"
                      onClick={() => setTypeColors((prev) => ({ ...prev, [type]: option.key }))}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${typeColors[type] === option.key ? "ring-2 ring-primary/30" : "hover:border-primary/30"} ${option.className}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => setTypeColors({ ...DEFAULT_TYPE_COLORS })}>
              Réinitialiser les couleurs
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showBlock} onOpenChange={setShowBlock}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <div className="-mx-6 border-b bg-background px-6 pb-4 pt-6">
            <SheetHeader>
              <SheetTitle>{blockDraft.calendarKind === "personal" ? "Événement personnel" : "Bloquer un créneau"}</SheetTitle>
              <SheetDescription>{blockDraft.calendarKind === "personal" ? "Déjeuner, administratif, déplacement ou agenda personnel visible dans le planning." : "Pause, réunion, formation, fermeture exceptionnelle ou créneau réservé."}</SheetDescription>
            </SheetHeader>

            <div className="mt-4 rounded-2xl border bg-muted/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Plage sélectionnée</p>
              <p className="mt-1 text-base font-semibold">{formatHumanDate(blockDraft.date)} · {blockDraft.startTime} → {getEndTimeLabel(blockDraft.startTime, blockDraft.duration)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Calendrier {blockDraft.calendarKind === "personal" ? "personnel" : "cabinet"} · durée {blockDraft.duration} min</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={blockDraft.date}
                  onChange={(event) => setBlockDraft((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>
              <div>
                <Label>Durée libre (minutes)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={String(blockDraft.duration)}
                  onChange={(event) =>
                    setBlockDraft((prev) => ({
                      ...prev,
                      duration: Math.max(5, Number(event.target.value) || 5),
                    }))
                  }
                  placeholder="Ex. 210"
                />
              </div>
              <div>
                <Label>Calendrier</Label>
                <Select
                  value={blockDraft.calendarKind}
                  onValueChange={(value) => setBlockDraft((prev) => ({ ...prev, calendarKind: value as BlockCalendarKind, reason: BLOCK_REASON_PRESETS[value as BlockCalendarKind][0] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cabinet">Cabinet</SelectItem>
                    <SelectItem value="personal">Personnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Motif</Label>
                <Input
                  value={blockDraft.reason}
                  onChange={(event) => setBlockDraft((prev) => ({ ...prev, reason: event.target.value }))}
                  placeholder={blockDraft.calendarKind === "personal" ? "Déjeuner, administratif, personnel..." : "Pause, réunion, fermeture exceptionnelle..."}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {BLOCK_REASON_PRESETS[blockDraft.calendarKind].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBlockDraft((prev) => ({ ...prev, reason: preset }))}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${blockDraft.reason === preset ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[15, 30, 45, 60, 90, 120, 180].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setBlockDraft((prev) => ({ ...prev, duration }))}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${blockDraft.duration === duration ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                    >
                      {duration >= 120 ? `${duration / 60}h` : `${duration} min`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Répéter ce blocage</h3>
                  <p className="text-sm text-muted-foreground">Utile pour une pause récurrente, une fermeture hebdomadaire ou un agenda personnel.</p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">hebdomadaire</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 4, 8].map((weeks) => (
                  <button
                    key={weeks}
                    type="button"
                    onClick={() => setBlockRepeatWeeks(weeks)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${blockRepeatWeeks === weeks ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                  >
                    {weeks === 1 ? "Une seule fois" : `${weeks} semaines`}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Heure du blocage</h3>
                  <p className="text-sm text-muted-foreground">Vous pouvez bloquer même s'il existe déjà des rendez-vous sur la plage. Les conflits seront gérés juste en dessous.</p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{getDayNameFromDateKey(blockDraft.date)}</span>
              </div>
              {isClosedDay(blockDraft.date) ? (
                <p className="mt-3 text-sm text-amber-600">Cabinet fermé ce jour. Utilisez ce blocage surtout pour l'agenda personnel ou une fermeture exceptionnelle visible dans l'agenda.</p>
              ) : blockAvailableSlots.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {blockAvailableSlots.slice(0, 24).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBlockDraft((prev) => ({ ...prev, startTime: slot }))}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${blockDraft.startTime === slot ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Aucune plage libre compatible avec cette durée sur cette date.</p>
              )}
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Rendez-vous concernés</h3>
                  <p className="text-sm text-muted-foreground">Si la plage chevauche des rendez-vous, choisissez comment les gérer avant de bloquer.</p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{conflictingBlockAppointments.length}</span>
              </div>
              {conflictingBlockAppointments.length ? (
                <>
                  <div className="mt-3 space-y-2">
                    {conflictingBlockAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-xl border bg-muted/10 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{appointment.patient}</p>
                          <p className="text-xs text-muted-foreground">{appointment.startTime} · {appointment.duration} min · {appointment.type}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground`}>
                          <span className={`h-2 w-2 rounded-full ${getStatusMarkerClasses(appointment.status)}`} />
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setBlockConflictAction("keep")}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${blockConflictAction === "keep" ? "border-primary bg-primary/5 text-foreground" : "bg-background hover:border-primary/30"}`}
                    >
                      <p className="font-medium">Laisser les rendez-vous</p>
                      <p className="mt-1 text-xs text-muted-foreground">La plage sera marquée bloquée mais les rendez-vous existants restent en place.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlockConflictAction("cancel")}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${blockConflictAction === "cancel" ? "border-destructive bg-destructive/5 text-foreground" : "bg-background hover:border-destructive/30"}`}
                    >
                      <p className="font-medium">Annuler les rendez-vous</p>
                      <p className="mt-1 text-xs text-muted-foreground">Les rendez-vous concernés passeront en annulé au moment du blocage.</p>
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Aucun rendez-vous ne chevauche ce blocage.</p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setShowBlock(false)} disabled={saving}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleCreateBlock} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                Bloquer le créneau
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(slotAction)} onOpenChange={(open) => !open && setSlotAction(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {slotAction && (
            <>
              <SheetHeader>
                <SheetTitle>{slotAction.fromRange ? "Plage sélectionnée" : "Créneau sélectionné"}</SheetTitle>
                <SheetDescription>
                  {formatHumanDate(slotAction.date)} · {slotAction.startTime} → {slotAction.endTime}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  <p>
                    {slotAction.closedDay
                      ? "Cabinet fermé ce jour. Vous pouvez quand même réserver cette plage ponctuellement ou la garder en personnel."
                      : "Action centralisée : créez un rendez-vous ou transformez directement cette plage en blocage cabinet/personnel."}
                  </p>
                  <p className="mt-2 font-medium text-foreground">Durée sélectionnée : {slotAction.duration} min</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DURATION_PRESETS.map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setSlotAction((prev) => prev ? ({ ...prev, duration, endTime: getEndTimeLabel(prev.startTime, duration) }) : prev)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${slotAction.duration === duration ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background hover:border-primary/40 hover:text-foreground"}`}
                      >
                        {duration} min
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={() => openCreate(slotAction.date, slotAction.startTime, slotAction.duration)}>
                  <Plus className="mr-2 h-4 w-4" /> Créer un rendez-vous
                </Button>
                <Button variant="outline" className="w-full" onClick={() => openBlock(slotAction.date, slotAction.startTime, "cabinet", slotAction.duration)}>
                  <Lock className="mr-2 h-4 w-4" /> Bloquer en cabinet
                </Button>
                <Button variant="outline" className="w-full" onClick={() => openBlock(slotAction.date, slotAction.startTime, "personal", slotAction.duration)}>
                  <CalendarClock className="mr-2 h-4 w-4" /> Bloquer en personnel
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => { setSlotAction(null); }}>
                  Effacer la sélection
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(selectedBlock)} onOpenChange={(open) => !open && setSelectedBlock(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {selectedBlock && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" /> {displayBlockReason(selectedBlock.reason)}
                </SheetTitle>
                <SheetDescription>
                  {formatHumanDate(selectedBlock.date)} · {selectedBlock.startTime} · {selectedBlock.duration} min
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  Type de calendrier : <strong className="text-foreground">{getBlockCalendarKind(selectedBlock.reason) === "personal" ? "Personnel" : "Cabinet"}</strong><br />
                  Motif : <strong className="text-foreground">{displayBlockReason(selectedBlock.reason)}</strong>
                </div>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={() => openCreate(selectedBlock.date, selectedBlock.startTime, selectedBlock.duration)}>
                  <Plus className="mr-2 h-4 w-4" /> Créer un rendez-vous sur ce créneau
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => handleDeleteBlock(selectedBlock.id)}>
                  <X className="mr-2 h-4 w-4" /> Supprimer le blocage
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
