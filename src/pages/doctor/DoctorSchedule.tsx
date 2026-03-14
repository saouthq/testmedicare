// DoctorSchedule — Agenda médecin complet (refactored)
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  Lock,
  MoonStar,
  Palette,
  Plus,
  RefreshCcw,
  Search,
  CalendarClock,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  computeEndTime,
  DEFAULT_TYPE_COLORS,
} from "@/types/appointment";

import {
  DAY_START,
  DAY_END,
  SLOT_MINUTES,
  PX_PER_MINUTE,
  GRID_HEIGHT,
  SLOT_HEIGHT,
  DAYS_SHORT,
  MONTHS_LONG,
  ACTIVE_STATUSES,
  FILTER_OPTIONS,
  COLOR_STYLES,
  TYPE_COLOR_STORAGE_KEY,
  type ViewMode,
  type DraftMode,
  type AppointmentDraft,
  type BlockDraft,
  type BlockCalendarKind,
  type SlotActionState,
} from "@/components/doctor-schedule/scheduleConstants";

import {
  parseLocalDate,
  formatDateKey,
  toTimeLabel,
  getEndTimeLabel,
  timeToMinutes,
  addDays,
  addMonths,
  isSameDay,
  getWeekDays,
  getMonthMatrix,
  isWithinRange,
  formatHumanDate,
  weekHeaderLabel,
  getDayNameFromDateKey,
  getAvatar,
  getStatusLabel,
  getStatusMarkerClasses,
  buildAppointmentGroups,
  slotTop,
  slotHeight,
  getCurrentTimeLineTop,
  getBlockCalendarKind,
  displayBlockReason,
  normalizeBlockReason,
  createDraft,
  createBlockDraft,
} from "@/components/doctor-schedule/scheduleHelpers";

import AppointmentCard from "@/components/doctor-schedule/AppointmentCard";

import {
  AppointmentDetailSheet,
  CreateAppointmentSheet,
  ColorsSheet,
  BlockSheet,
  SlotActionSheet,
  BlockDetailSheet,
} from "@/components/doctor-schedule/ScheduleSheets";

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

  // ── Data loading ──
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
      const normalized = [...apts].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
      setAppointments(normalized);
      setPatients(pts);
      if (selectedAppointment) {
        setSelectedAppointment(normalized.find((i) => i.id === selectedAppointment.id) || null);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur agenda", description: "Impossible de charger les rendez-vous.", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadSchedule();
  }, [authLoading, user?.id, mode]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(TYPE_COLOR_STORAGE_KEY, JSON.stringify(typeColors));
  }, [typeColors]);

  const resolveTypeClasses = (type: AppointmentType) => COLOR_STYLES[typeColors[type] || DEFAULT_TYPE_COLORS[type]];

  // ── Computed data ──
  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const monthDays = useMemo(() => getMonthMatrix(anchorDate), [anchorDate]);
  const todayKey = formatDateKey(new Date());

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const haystack = [a.patient, a.motif, a.type, a.phone, a.assurance].join(" ").toLowerCase();
      const matchQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [appointments, query, statusFilter]);

  const visibleAppointments = useMemo(() => {
    if (view === "day") return filteredAppointments.filter((i) => i.date === formatDateKey(anchorDate));
    if (view === "week") return filteredAppointments.filter((i) => isWithinRange(i.date, weekDays[0], weekDays[6]));
    if (view === "month") return filteredAppointments.filter((i) => isWithinRange(i.date, monthDays[0], monthDays[monthDays.length - 1]));
    return filteredAppointments;
  }, [filteredAppointments, view, anchorDate, weekDays, monthDays]);

  const stats = useMemo(() => {
    const todayApts = appointments.filter((i) => i.date === todayKey);
    return {
      today: todayApts.length,
      waiting: todayApts.filter((i) => i.status === "arrived" || i.status === "in_waiting").length,
      teleconsultation: todayApts.filter((i) => i.teleconsultation).length,
    };
  }, [appointments, todayKey]);

  // ── Slot helpers ──
  const isClosedDay = (dateKey: string) => {
    const dayName = getDayNameFromDateKey(dateKey);
    return !availability.days?.[dayName]?.active;
  };

  function getAvailableSlots(dateKey: string, duration = SLOT_MINUTES, ignoreId?: string | null) {
    const dayName = getDayNameFromDateKey(dateKey);
    const dayConfig = availability.days?.[dayName];
    if (!dayConfig?.active) return [] as string[];
    const start = timeToMinutes(dayConfig.start || "08:00");
    const end = timeToMinutes(dayConfig.end || "18:00");
    const breakStart = dayConfig.breakStart ? timeToMinutes(dayConfig.breakStart) : null;
    const breakEnd = dayConfig.breakEnd ? timeToMinutes(dayConfig.breakEnd) : null;
    const dayApts = appointments.filter((i) => i.date === dateKey && i.id !== ignoreId && i.status !== "cancelled" && i.status !== "absent");
    const dayBlocks = blockedSlots.filter((i) => i.date === dateKey);
    const slots: string[] = [];
    for (let t = start; t + duration <= end; t += SLOT_MINUTES) {
      const slotEnd = t + duration;
      if (breakStart !== null && breakEnd !== null && t < breakEnd && slotEnd > breakStart) continue;
      if (dayApts.some((i) => { const s = timeToMinutes(i.startTime); return t < s + i.duration && slotEnd > s; })) continue;
      if (dayBlocks.some((i) => { const s = timeToMinutes(i.startTime); return t < s + i.duration && slotEnd > s; })) continue;
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
    const dayBlocks = blockedSlots.filter((i) => i.date === dateKey);
    const slots: string[] = [];
    for (let t = start; t + duration <= end; t += SLOT_MINUTES) {
      const slotEnd = t + duration;
      if (breakStart !== null && breakEnd !== null && t < breakEnd && slotEnd > breakStart) continue;
      if (dayBlocks.some((i) => { const s = timeToMinutes(i.startTime); return t < s + i.duration && slotEnd > s; })) continue;
      slots.push(toTimeLabel(t));
    }
    return slots;
  }

  function getAppointmentsOverlappingRange(dateKey: string, startTime: string, duration = SLOT_MINUTES) {
    const start = timeToMinutes(startTime);
    const end = start + duration;
    return appointments.filter((i) => {
      if (i.date !== dateKey || i.status === "cancelled" || i.status === "absent") return false;
      const s = timeToMinutes(i.startTime);
      return start < s + i.duration && end > s;
    });
  }

  const createAvailableSlots = useMemo(() => getAvailableSlots(draft.date, draft.duration, editingId), [draft.date, draft.duration, editingId, appointments, blockedSlots, availability]);
  const blockAvailableSlots = useMemo(() => getBlockStartOptions(blockDraft.date, blockDraft.duration), [blockDraft.date, blockDraft.duration, blockedSlots, availability]);
  const conflictingBlockAppointments = useMemo(() => getAppointmentsOverlappingRange(blockDraft.date, blockDraft.startTime, blockDraft.duration), [blockDraft.date, blockDraft.startTime, blockDraft.duration, appointments]);

  const rescheduleSuggestions = useMemo(() => {
    if (!selectedAppointment) return [];
    const suggestions: { date: string; startTime: string }[] = [];
    const baseDate = parseLocalDate(selectedAppointment.date);
    for (let offset = 0; offset < 14 && suggestions.length < 8; offset += 1) {
      const date = addDays(baseDate, offset);
      const dateKey = formatDateKey(date);
      const slots = getAvailableSlots(dateKey, selectedAppointment.duration, selectedAppointment.id)
        .filter((slot) => !(dateKey === selectedAppointment.date && slot === selectedAppointment.startTime))
        .slice(0, offset === 0 ? 2 : 3);
      slots.forEach((slot) => { if (suggestions.length < 8) suggestions.push({ date: dateKey, startTime: slot }); });
    }
    return suggestions;
  }, [selectedAppointment, appointments, blockedSlots, availability]);

  useEffect(() => {
    if (!showCreate || !createAvailableSlots.length || createAvailableSlots.includes(draft.startTime)) return;
    setDraft((p) => ({ ...p, startTime: createAvailableSlots[0] }));
  }, [showCreate, draft.startTime, createAvailableSlots]);

  useEffect(() => {
    if (!showBlock || !blockAvailableSlots.length || blockAvailableSlots.includes(blockDraft.startTime)) return;
    setBlockDraft((p) => ({ ...p, startTime: blockAvailableSlots[0] }));
  }, [showBlock, blockDraft.startTime, blockAvailableSlots]);

  // ── Actions ──
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
      date: appointment.date, startTime: appointment.startTime, duration: appointment.duration,
      type: appointment.type, motif: appointment.motif, teleconsultation: Boolean(appointment.teleconsultation),
      assurance: appointment.assurance, notes: appointment.notes || "",
      patientMode: appointment.patientId ? "existing" : "new",
      patientId: appointment.patientId ? String(appointment.patientId) : "",
      patientName: appointment.patient, phone: appointment.phone, email: "",
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

  const goToPrev = () => setAnchorDate((c) => view === "day" ? addDays(c, -1) : view === "month" ? addMonths(c, -1) : addDays(c, -7));
  const goToNext = () => setAnchorDate((c) => view === "day" ? addDays(c, 1) : view === "month" ? addMonths(c, 1) : addDays(c, 7));
  const goToday = () => { const t = new Date(); t.setHours(12, 0, 0, 0); setAnchorDate(t); };

  const updateStatus = async (appointment: SharedAppointment, status: AppointmentStatus) => {
    try {
      setSaving(true);
      await appointmentRepo.updateStatus(appointment.id, status, { status, waitTime: status === "arrived" || status === "in_waiting" ? appointment.waitTime || 0 : appointment.waitTime });
      toast({ title: `Rendez-vous ${getStatusLabel(status).toLowerCase()}` });
      await loadSchedule(true);
    } catch { toast({ title: "Impossible de mettre à jour le statut", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleSubmitAppointment = async () => {
    try {
      setSaving(true);
      let patientId: number | null = draft.patientMode === "existing" ? Number(draft.patientId || 0) || null : null;
      let patientName = draft.patientName.trim();
      let phone = draft.phone.trim();
      let assurance = draft.assurance.trim();

      if (draft.patientMode === "existing") {
        const sp = patients.find((i) => i.id === patientId);
        if (!sp) { toast({ title: "Sélectionnez un patient", variant: "destructive" }); return; }
        patientName = sp.name; phone = sp.phone; assurance = draft.assurance.trim() || sp.assurance;
      } else {
        if (!patientName) { toast({ title: "Nom du patient requis", variant: "destructive" }); return; }
        const created = await patientRepo.create({
          name: patientName, phone, email: draft.email, avatar: getAvatar(patientName),
          dob: "", assurance, numAssure: "", doctor: user?.doctorName || "",
          gouvernorat: "Tunis", lastVisit: "", nextAppointment: null, balance: 0,
          notes: draft.notes, history: [],
        });
        patientId = created.id;
      }

      const base = {
        date: draft.date, startTime: draft.startTime, duration: draft.duration,
        patient: patientName, patientId, avatar: getAvatar(patientName),
        phone, motif: draft.motif || draft.type, type: draft.type,
        status: draftMode === "create" ? "confirmed" : (selectedAppointment?.status || "confirmed"),
        assurance, doctor: user?.doctorName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        doctorId: user?.id, teleconsultation: draft.teleconsultation, notes: draft.notes,
        createdBy: "doctor" as const,
      };

      if (draftMode === "create") {
        const created = await appointmentRepo.create(base);
        toast({ title: "Rendez-vous créé", description: `${created.patient} · ${created.date} à ${created.startTime}` });
        setSelectedAppointment(created);
      } else if (editingId) {
        await appointmentRepo.updateStatus(editingId, base.status, { ...base, endTime: computeEndTime(base.startTime, base.duration) });
        toast({ title: "Rendez-vous mis à jour" });
      }
      setShowCreate(false);
      await loadSchedule(true);
    } catch { toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleCreateBlock = async () => {
    try {
      setSaving(true);
      let cancelledCount = 0;
      for (let w = 0; w < blockRepeatWeeks; w += 1) {
        const blockDate = formatDateKey(addDays(parseLocalDate(blockDraft.date), w * 7));
        const conflicts = getAppointmentsOverlappingRange(blockDate, blockDraft.startTime, blockDraft.duration);
        if (conflicts.length && blockConflictAction === "cancel") {
          await Promise.all(conflicts.map((i) => appointmentRepo.cancel(i.id)));
          cancelledCount += conflicts.length;
        }
        await addBlockedSlot({ date: blockDate, startTime: blockDraft.startTime, duration: blockDraft.duration, reason: normalizeBlockReason(blockDraft.reason, blockDraft.calendarKind), doctor: user?.doctorName || "" });
      }
      toast({ title: blockDraft.calendarKind === "personal" ? "Événement personnel ajouté" : "Créneau bloqué" });
      setShowBlock(false);
      await loadSchedule(true);
    } catch { toast({ title: "Impossible de bloquer le créneau", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try { await removeBlockedSlot(blockId); toast({ title: "Blocage supprimé" }); setSelectedBlock(null); }
    catch { toast({ title: "Impossible de supprimer le blocage", variant: "destructive" }); }
  };

  const handleQuickReschedule = async (appointment: SharedAppointment, date: string, startTime: string) => {
    try {
      setSaving(true);
      await appointmentRepo.updateStatus(appointment.id, appointment.status, { ...appointment, date, startTime, endTime: computeEndTime(startTime, appointment.duration) });
      toast({ title: "Rendez-vous reprogrammé", description: `${formatHumanDate(date)} · ${startTime}` });
      await loadSchedule(true);
    } catch { toast({ title: "Impossible de reprogrammer", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleCopySms = (appointment: SharedAppointment) => {
    const msg = `Bonjour ${appointment.patient}, votre rendez-vous est prévu le ${appointment.date} à ${appointment.startTime} avec ${appointment.doctor}.`;
    navigator.clipboard.writeText(msg).then(() => toast({ title: "Message copié" }));
  };

  const periodLabel = view === "day"
    ? formatHumanDate(formatDateKey(anchorDate))
    : view === "month"
      ? `${MONTHS_LONG[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
      : weekHeaderLabel(anchorDate);

  // ── Grid rendering ──
  const renderDayGrid = (date: Date) => {
    const dateKey = formatDateKey(date);
    const dayApts = visibleAppointments.filter((i) => i.date === dateKey);
    const groups = buildAppointmentGroups(dayApts);
    const dayBlocks = blockedSlots
      .filter((i) => i.date === dateKey)
      .filter((i) => calendarFilter === "all" || calendarFilter === getBlockCalendarKind(i.reason));
    const closed = isClosedDay(dateKey);
    const currentTop = getCurrentTimeLineTop(date);

    return (
      <div className="relative flex-1 border-l border-border/70 bg-background">
        {Array.from({ length: (DAY_END - DAY_START) / SLOT_MINUTES }).map((_, idx) => {
          const startMin = DAY_START + idx * SLOT_MINUTES;
          const time = toTimeLabel(startMin);
          return (
            <button
              key={`${dateKey}-${time}`}
              type="button"
              onClick={() => {
                setSelectedAppointment(null);
                setSelectedBlock(null);
                setSlotAction({ date: dateKey, startTime: time, endTime: getEndTimeLabel(time, SLOT_MINUTES), duration: SLOT_MINUTES, closedDay: closed, fromRange: false });
              }}
              className={`absolute left-0 right-0 border-t border-border/70 transition ${closed ? "hover:bg-muted/50" : "hover:bg-primary/5"}`}
              style={{ top: idx * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              aria-label={`Créneau ${dateKey} ${time}`}
            />
          );
        })}

        {currentTop !== null && (
          <div className="pointer-events-none absolute left-0 right-0 z-20" style={{ top: currentTop }} aria-hidden="true">
            <div className="relative h-0">
              <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500 shadow-sm ring-2 ring-background" />
              <div className="h-px w-full bg-red-500/90" />
            </div>
          </div>
        )}

        {closed && <div className="pointer-events-none absolute inset-0 bg-muted/25" />}

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

        {groups.map((group) => {
          const naturalHeight = Math.max(52, (group.end - group.start) * PX_PER_MINUTE);
          const top = Math.max(0, (group.start - DAY_START) * PX_PER_MINUTE);
          if (group.appointments.length === 1) {
            const a = group.appointments[0];
            return (
              <div key={a.id} className="absolute" style={{ top, height: Math.max(44, slotHeight(a.duration) - 2), left: 4, width: "calc(100% - 8px)", zIndex: 30 }}>
                <AppointmentCard appointment={a} colorClass={resolveTypeClasses(a.type)} compact={a.duration <= 25} onClick={() => setSelectedAppointment(a)} />
              </div>
            );
          }
          return (
            <div key={`${dateKey}-${group.start}-${group.end}`} className="absolute overflow-hidden rounded-xl border border-primary/20 bg-white/95 shadow-sm backdrop-blur-sm" style={{ top, height: naturalHeight, left: 4, width: "calc(100% - 8px)", zIndex: 34 }}>
              <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-2 py-1">
                <span className="text-[10px] font-semibold text-primary">{group.appointments.length} en conflit</span>
                <span className="text-[10px] text-muted-foreground">{toTimeLabel(group.start)} → {toTimeLabel(group.end)}</span>
              </div>
              <div className="h-[calc(100%-30px)] space-y-1 overflow-y-auto p-1">
                {group.appointments.map((a) => (
                  <div key={a.id} className="h-14">
                    <AppointmentCard appointment={a} colorClass={resolveTypeClasses(a.type)} compact={false} onClick={() => setSelectedAppointment(a)} />
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
    const isToday = isSameDay(date, new Date());
    return (
      <div className={`border-b border-border/70 px-3 py-3 text-center ${isToday ? "bg-primary/5" : "bg-muted/20"}`}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1]}</p>
        <p className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground"}`}>{date.getDate()}</p>
      </div>
    );
  };

  const renderWeekView = () => (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid" style={{ gridTemplateColumns: "72px repeat(7, minmax(0,1fr))" }}>
        <div className="border-b border-border/70 bg-muted/20" />
        {weekDays.map((d) => <div key={formatDateKey(d)}>{dayColumnLabel(d)}</div>)}
      </div>
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 172px)" }}>
        <div className="grid" style={{ gridTemplateColumns: "72px repeat(7, minmax(0,1fr))" }}>
          <div className="relative border-r border-border/70 bg-card" style={{ height: GRID_HEIGHT }}>
            {Array.from({ length: (DAY_END - DAY_START) / SLOT_MINUTES }).map((_, i) => {
              const min = DAY_START + i * SLOT_MINUTES;
              return i % 2 === 0 ? <div key={min} className="absolute right-2 text-[11px] text-muted-foreground" style={{ top: i * SLOT_HEIGHT - 8 }}>{toTimeLabel(min)}</div> : null;
            })}
          </div>
          {weekDays.map((d) => <div key={formatDateKey(d)} style={{ height: GRID_HEIGHT }}>{renderDayGrid(d)}</div>)}
        </div>
      </div>
    </div>
  );

  const renderDayView = () => (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b border-border/70 bg-muted/20 px-4 py-3">
        <h3 className="text-lg font-semibold">{formatHumanDate(formatDateKey(anchorDate))}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{visibleAppointments.length} rendez-vous</p>
      </div>
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 215px)" }}>
        <div className="grid" style={{ gridTemplateColumns: "72px minmax(0,1fr)" }}>
          <div className="relative border-r" style={{ height: GRID_HEIGHT }}>
            {Array.from({ length: (DAY_END - DAY_START) / SLOT_MINUTES }).map((_, i) => {
              const min = DAY_START + i * SLOT_MINUTES;
              return i % 2 === 0 ? <div key={min} className="absolute right-2 text-[11px] text-muted-foreground" style={{ top: i * SLOT_HEIGHT - 8 }}>{toTimeLabel(min)}</div> : null;
            })}
          </div>
          <div style={{ height: GRID_HEIGHT }}>{renderDayGrid(anchorDate)}</div>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/20">
        {DAYS_SHORT.map((d) => <div key={d} className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y">
        {monthDays.map((day) => {
          const dayKey = formatDateKey(day);
          const sameMonth = day.getMonth() === anchorDate.getMonth();
          const dayApts = visibleAppointments.filter((i) => i.date === dayKey);
          return (
            <button key={dayKey} type="button" onClick={() => { setAnchorDate(day); setView("day"); }}
              className={`min-h-[130px] px-2 py-2 text-left transition hover:bg-muted/30 ${sameMonth ? "bg-background" : "bg-muted/15 text-muted-foreground"}`}>
              <div className="flex items-center justify-between">
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${dayKey === todayKey ? "bg-primary text-primary-foreground" : ""}`}>{day.getDate()}</span>
                {dayApts.length > 0 && <span className="text-[10px] text-muted-foreground">{dayApts.length} RDV</span>}
              </div>
              <div className="mt-2 space-y-1">
                {dayApts.slice(0, 3).map((a) => (
                  <div key={a.id} className={`rounded-lg border px-2 py-1 text-[11px] ${resolveTypeClasses(a.type)} ${a.status === "done" ? "opacity-[0.60]" : a.status === "cancelled" || a.status === "absent" ? "opacity-[0.58]" : ""}`}>
                    <div className="flex items-center gap-1 truncate">
                      <span className="font-semibold">{a.startTime}</span>
                      <span className="truncate">{a.patient}</span>
                    </div>
                  </div>
                ))}
                {dayApts.length > 3 && <p className="text-[11px] font-medium text-primary">+{dayApts.length - 3} autres</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderListView = () => {
    const grouped = visibleAppointments.reduce<Record<string, SharedAppointment[]>>((acc, a) => { acc[a.date] ??= []; acc[a.date].push(a); return acc; }, {});
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
              {grouped[dateKey].sort((a, b) => a.startTime.localeCompare(b.startTime)).map((a) => (
                <button key={a.id} type="button" onClick={() => setSelectedAppointment(a)}
                  className={`flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-muted/20 ${a.status === "done" ? "opacity-[0.60]" : a.status === "cancelled" || a.status === "absent" ? "opacity-[0.58]" : ""}`}>
                  <div className="w-20 shrink-0">
                    <p className="font-semibold">{a.startTime}</p>
                    <p className="text-xs text-muted-foreground">{a.duration} min</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {a.avatar || getAvatar(a.patient)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{a.patient}</p>
                      <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        <span className={`h-2 w-2 rounded-full ${getStatusMarkerClasses(a.status)}`} />
                        {getStatusLabel(a.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{a.type} · {a.motif || "Sans motif"}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${resolveTypeClasses(a.type)}`}>{a.type}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPlanning = () => {
    if (!visibleAppointments.length && view === "list") return <EmptyPlanningState production={production} />;
    if (view === "day") return renderDayView();
    if (view === "month") return renderMonthView();
    if (view === "list") return renderListView();
    return renderWeekView();
  };

  if (authLoading || loading) {
    return <DashboardLayout role="doctor" title="Planning"><LoadingSkeleton type="table" /></DashboardLayout>;
  }

  return (
    <DashboardLayout role="doctor" title="Planning">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="rounded-2xl border bg-card px-4 py-2 shadow-sm sm:px-5">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[22px] font-bold tracking-tight">Planning</h1>
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">Auj. {stats.today}</span>
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">Attente {stats.waiting}</span>
                  <span className="rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">Visio {stats.teleconsultation}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => loadSchedule(true)} disabled={refreshing}>
                  {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />} Actualiser
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
                <Button variant="outline" size="icon" onClick={goToPrev}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="outline" onClick={goToday}>Aujourd'hui</Button>
                <div className="ml-1"><p className="text-base font-semibold leading-none sm:text-lg">{periodLabel}</p></div>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-end">
                <div className="relative min-w-[220px] flex-1 xl:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" placeholder="Rechercher un patient, motif..." />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-full xl:w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>{FILTER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="inline-flex rounded-xl border bg-muted/20 p-1">
                  {[{ key: "all", label: "Tous" }, { key: "cabinet", label: "Cabinet" }, { key: "personal", label: "Personnel" }].map((i) => (
                    <button key={i.key} type="button" onClick={() => setCalendarFilter(i.key as typeof calendarFilter)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${calendarFilter === i.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      {i.label}
                    </button>
                  ))}
                </div>
                <div className="inline-flex rounded-xl border bg-muted/20 p-1">
                  {[
                    { key: "week", label: "Semaine", icon: LayoutGrid },
                    { key: "day", label: "Journée", icon: CalendarDays },
                    { key: "month", label: "Mois", icon: MoonStar },
                    { key: "list", label: "Liste", icon: List },
                  ].map((i) => {
                    const Icon = i.icon;
                    return (
                      <button key={i.key} type="button" onClick={() => setView(i.key as ViewMode)}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${view === i.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                        <Icon className="h-4 w-4" /> {i.label}
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

      {/* Sheets */}
      <AppointmentDetailSheet
        appointment={selectedAppointment}
        open={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        saving={saving}
        onUpdateStatus={updateStatus}
        onEdit={openEdit}
        onCopySms={handleCopySms}
        rescheduleSuggestions={rescheduleSuggestions}
        onQuickReschedule={handleQuickReschedule}
      />

      <CreateAppointmentSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        draft={draft}
        setDraft={setDraft}
        draftMode={draftMode}
        saving={saving}
        patients={patients}
        availableSlots={createAvailableSlots}
        isClosedDay={isClosedDay(draft.date)}
        onSubmit={handleSubmitAppointment}
      />

      <ColorsSheet
        open={showColors}
        onClose={() => setShowColors(false)}
        typeColors={typeColors}
        setTypeColors={setTypeColors}
        resolveTypeClasses={resolveTypeClasses}
      />

      <BlockSheet
        open={showBlock}
        onClose={() => setShowBlock(false)}
        blockDraft={blockDraft}
        setBlockDraft={setBlockDraft}
        saving={saving}
        blockAvailableSlots={blockAvailableSlots}
        conflictingAppointments={conflictingBlockAppointments}
        blockConflictAction={blockConflictAction}
        setBlockConflictAction={setBlockConflictAction}
        blockRepeatWeeks={blockRepeatWeeks}
        setBlockRepeatWeeks={setBlockRepeatWeeks}
        isClosedDay={isClosedDay(blockDraft.date)}
        onSubmit={handleCreateBlock}
      />

      <SlotActionSheet
        slotAction={slotAction}
        onClose={() => setSlotAction(null)}
        onCreateAppointment={openCreate}
        onBlockCabinet={(d, t, dur) => openBlock(d, t, "cabinet", dur)}
        onBlockPersonal={(d, t, dur) => openBlock(d, t, "personal", dur)}
      />

      <BlockDetailSheet
        block={selectedBlock}
        onClose={() => setSelectedBlock(null)}
        onDelete={handleDeleteBlock}
        onCreateOnSlot={openCreate}
      />
    </DashboardLayout>
  );
}
