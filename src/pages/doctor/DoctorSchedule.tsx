/**
 * DoctorSchedule — Agenda médecin complet
 * Design : cohérent avec le reste du site (tokens primary/accent/warning/destructive)
 * Features :
 *   • 4 vues : Semaine · Jour · Mois · Liste
 *   • Clic sur créneau vide → popup Créer RDV / Bloquer
 *   • Blocage avec durée libre (heures + minutes) → affiché grisé dans grille
 *   • Couleurs d'étiquettes configurables par le médecin par type de RDV
 *   • Créer RDV pour patient inscrit OU nouveau patient (champs libres)
 *   • Confirmations ConfirmDialog avant chaque action destructive
 *   • Actions uniquement au clic (plus de hover actions)
 *   • Statut "absent" (plus de "no_show")
 */

import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  LayoutGrid,
  List as ListIcon,
  Search,
  Phone,
  X,
  CheckCircle2,
  Ban,
  MessageSquare,
  Calendar as CalIcon,
  Repeat,
  Printer,
  UserCheck,
  CalendarDays,
  UserX,
  Activity,
  CalendarClock,
  RefreshCw,
  Timer,
  Lock,
  Clock,
  UserPlus,
  User,
  Settings2,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import UpgradeBanner from "@/components/shared/UpgradeBanner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DoctorJoinTeleconsultButton from "@/components/teleconsultation/DoctorJoinTeleconsultButton";
import { useTeleconsultSessions } from "@/components/teleconsultation/teleconsultSessionStore";
import { useSharedAppointments, updateAppointmentStatus, createAppointment as storeCreateAppointment, rescheduleAppointment } from "@/stores/sharedAppointmentsStore";
import { useSharedBlockedSlots, addBlockedSlot, updateBlockedSlot as storeUpdateBlock, removeBlockedSlot } from "@/stores/sharedBlockedSlotsStore";
import { useSharedAvailability } from "@/stores/sharedAvailabilityStore";
import { useSharedLeaves } from "@/stores/sharedLeavesStore";
import { useSharedPatients } from "@/stores/sharedPatientsStore";
import { pushNotification } from "@/stores/notificationsStore";
import type { SharedAppointment, SharedBlockedSlot, AppointmentType, AppointmentColorKey, AvailabilityDay, SharedLeave } from "@/types/appointment";
import { computeEndTime, DEFAULT_TYPE_COLORS as SHARED_TYPE_COLORS, type AppointmentStatus } from "@/types/appointment";

// ─── Types (aliases to shared types) ──────────────────────────
type ViewMode = "week" | "day" | "month" | "list";
type ApptStatus = AppointmentStatus;
type ApptType = AppointmentType;
type ColorKey = AppointmentColorKey;
type Appt = SharedAppointment;
type BlockedSlot = SharedBlockedSlot;

import { readAuthUser } from "@/stores/authStore";
const getCurrentDoctor = () => readAuthUser()?.doctorName || "Dr. Bouazizi";
const CURRENT_DOCTOR = getCurrentDoctor();

interface SlotCtx {
  date: string;
  time: string;
  x: number;
  y: number;
}

// ─── Couleurs — tokens du site uniquement ─────────────────────
const COLOR_OPTIONS: {
  key: ColorKey;
  label: string;
  bg: string;
  border: string;
  text: string;
  leftBar: string;
  pill: string;
  dot: string;
}[] = [
  {
    key: "primary",
    label: "Bleu",
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    leftBar: "border-l-primary",
    pill: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  {
    key: "accent",
    label: "Vert",
    bg: "bg-accent/10",
    border: "border-accent/30",
    text: "text-accent",
    leftBar: "border-l-accent",
    pill: "bg-accent/10 text-accent",
    dot: "bg-accent",
  },
  {
    key: "warning",
    label: "Orange",
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    leftBar: "border-l-warning",
    pill: "bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  {
    key: "destructive",
    label: "Rouge",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    leftBar: "border-l-destructive",
    pill: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  {
    key: "secondary",
    label: "Gris-bleu",
    bg: "bg-secondary",
    border: "border-secondary-foreground/20",
    text: "text-secondary-foreground",
    leftBar: "border-l-secondary-foreground/40",
    pill: "bg-secondary text-secondary-foreground",
    dot: "bg-secondary-foreground/60",
  },
  {
    key: "muted",
    label: "Gris",
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    leftBar: "border-l-muted-foreground/40",
    pill: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
];

const colorStyle = (key: ColorKey) => COLOR_OPTIONS.find((c) => c.key === key)!;

// Couleurs par défaut par type — from shared config
const DEFAULT_TYPE_COLORS: Record<ApptType, ColorKey> = { ...SHARED_TYPE_COLORS };

// ─── Statuts ──────────────────────────────────────────────────
const STATUS_LABEL: Record<ApptStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  arrived: "Arrivé",
  in_waiting: "En salle d'attente",
  in_progress: "En cours",
  done: "Terminé",
  cancelled: "Annulé",
  absent: "Absent",
};
const STATUS_CLS: Record<ApptStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-accent/10 text-accent border-accent/20",
  arrived: "bg-primary/10 text-primary border-primary/20",
  in_waiting: "bg-warning/10 text-warning border-warning/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  done: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  absent: "bg-destructive/10 text-destructive border-destructive/20",
};
const STATUS_LEFT: Record<ApptStatus, string> = {
  pending: "border-l-warning",
  confirmed: "border-l-accent",
  arrived: "border-l-primary",
  in_waiting: "border-l-warning",
  in_progress: "border-l-primary",
  done: "border-l-muted-foreground/30",
  cancelled: "border-l-destructive/40",
  absent: "border-l-destructive/30",
};

// ─── Layout constants ─────────────────────────────────────────
const DAY_START = 8 * 60;
const DAY_END = 19 * 60;
const PX_PER_MIN = 1.4;
const GRID_H = (DAY_END - DAY_START) * PX_PER_MIN;
const SLOT_H = 30 * PX_PER_MIN;
const HOUR_LABELS = Array.from({ length: (DAY_END - DAY_START) / 30 }, (_, i) => {
  const m = DAY_START + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

// ─── I18n ─────────────────────────────────────────────────────
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
const MONTHS_SH = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const JS_DAY_TO_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const normalizeDoctorName = (value?: string) =>
  (value || "")
    .toLowerCase()
    .replace(/dr\.?\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

const doctorMatches = (a?: string, b?: string) => {
  const na = normalizeDoctorName(a);
  const nb = normalizeDoctorName(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
};

// ─── Date helpers ─────────────────────────────────────────────
const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const addMonths = (d: Date, n: number) => {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
};
const isToday = (s: string) => {
  const d = new Date();
  return s === `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const t2min = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const min2t = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const endTime = (s: string, d: number) => min2t(t2min(s) + d);
const apptTop = (t: string) => Math.max(0, (t2min(t) - DAY_START) * PX_PER_MIN);
const apptH = (d: number) => Math.max(d * PX_PER_MIN, 22);
const dow = (d: Date) => (d.getDay() === 0 ? 6 : d.getDay() - 1);
function weekStart(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - dow(r));
  return r;
}
const weekDays = (ws: Date) => Array.from({ length: 7 }, (_, i) => addDays(ws, i));
function monthCells(y: number, m: number): (Date | null)[] {
  const first = new Date(y, m, 1),
    total = new Date(y, m + 1, 0).getDate(),
    pad = dow(first);
  return [...Array(pad).fill(null), ...Array.from({ length: total }, (_, i) => new Date(y, m, i + 1))];
}

// ─── Data now comes from shared stores ────────────────────────

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ─── Appointment card (click → action, pas hover) ─────────────
function ApptCard({
  apt,
  height,
  colorKey,
  onClick,
}: {
  apt: Appt;
  height: number;
  colorKey: ColorKey;
  onClick: () => void;
}) {
  const s = colorStyle(colorKey);
  const tiny = height < 30;
  const small = height < 58;
  const large = height >= 96;
  const faded = ["cancelled", "absent", "done"].includes(apt.status);

  return (
    <div
      onClick={onClick}
      className={`h-full w-full rounded-md border border-l-[3px] overflow-hidden cursor-pointer
        transition-all hover:shadow-md select-none relative group
        ${s.bg} ${s.border} ${STATUS_LEFT[apt.status]} ${faded ? "opacity-40" : ""}`}
    >
      <div className="px-2 py-1 h-full flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center gap-1 min-w-0">
          <span className={`font-semibold truncate leading-tight ${tiny ? "text-[9px]" : "text-[11px]"} ${s.text}`}>
            {apt.patient}
          </span>
          {apt.teleconsultation && <Video className="h-2.5 w-2.5 shrink-0 text-primary" />}
          {apt.isNew && !tiny && <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />}
          {apt.status === "pending" && !tiny && (
            <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0 animate-pulse" />
          )}
          {apt.status === "arrived" && !tiny && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
          {apt.status === "in_progress" && !tiny && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
          )}
        </div>
        {!small && <p className="text-[9px] text-muted-foreground truncate mt-0.5">{apt.motif}</p>}
        {large && (
          <div className="flex items-center gap-1 mt-auto">
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${s.pill}`}>{apt.type}</span>
            <span className="text-[9px] text-muted-foreground">
              {apt.startTime}–{endTime(apt.startTime, apt.duration)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Blocked slot card ────────────────────────────────────────
function BlockCard({ block, height, onClick }: { block: BlockedSlot; height: number; onClick: () => void }) {
  const tiny = height < 26;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="h-full w-full rounded-md border border-dashed border-muted-foreground/40 bg-muted/50 overflow-hidden select-none cursor-pointer group hover:bg-muted/70 hover:border-muted-foreground/60 transition-colors"
    >
      <div className="px-2 py-1 flex items-center gap-1.5 h-full">
        <Lock
          className={`shrink-0 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors ${tiny ? "h-2.5 w-2.5" : "h-3 w-3"}`}
        />
        {!tiny && <span className="text-[10px] text-muted-foreground/80 font-medium truncate">{block.reason}</span>}
      </div>
    </div>
  );
}

// ─── Current time line ────────────────────────────────────────
function NowLine() {
  const calc = () => (new Date().getHours() * 60 + new Date().getMinutes() - DAY_START) * PX_PER_MIN;
  const [top, setTop] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTop(calc()), 30000);
    return () => clearInterval(id);
  }, []);
  if (top < 0 || top > GRID_H) return null;
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top }}>
      <div className="h-2.5 w-2.5 rounded-full bg-destructive -ml-1 shrink-0" />
      <div className="flex-1 h-px bg-destructive opacity-60" />
    </div>
  );
}

// ─── Slot popup (clic sur case vide) ─────────────────────────
function SlotPopup({
  ctx,
  onRdv,
  onBlock,
  onClose,
}: {
  ctx: SlotCtx;
  onRdv: () => void;
  onBlock: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ top: ctx.y + 8, left: ctx.x });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", h), 0);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  useEffect(() => {
    if (!ref.current) return;
    const { innerWidth: W, innerHeight: H } = window;
    const { offsetWidth: w, offsetHeight: h } = ref.current;
    setStyle({
      top: ctx.y + h + 8 > H ? Math.max(4, ctx.y - h - 4) : ctx.y + 8,
      left: ctx.x + w > W ? Math.max(4, ctx.x - w) : ctx.x,
    });
  }, [ctx]);

  const d = new Date(ctx.date + "T00:00:00");
  const label = `${DAYS_SHORT[dow(d)]} ${d.getDate()} ${MONTHS_SH[d.getMonth()]} — ${ctx.time}`;

  return (
    <div
      ref={ref}
      className="fixed z-[60] w-52 rounded-xl border bg-card shadow-elevated overflow-hidden"
      style={style}
    >
      <div className="px-3 py-2 border-b bg-muted/40">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Créneau libre</p>
        <p className="text-xs font-semibold text-foreground mt-0.5">{label}</p>
      </div>
      <div className="p-1.5 space-y-1">
        <button
          onClick={onRdv}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium
            text-foreground hover:bg-primary/8 hover:text-primary transition-colors text-left"
        >
          <Plus className="h-4 w-4 text-primary shrink-0" />
          Nouveau rendez-vous
        </button>
        <button
          onClick={onBlock}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium
            text-foreground hover:bg-muted/60 transition-colors text-left"
        >
          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          Bloquer ce créneau
        </button>
      </div>
    </div>
  );
}

// ─── Unified Block Modal ──────────────────────────────────────
// Utilisé depuis : toolbar "Bloquer" ET popup slot (date/heure pré-remplies)
function UnifiedBlockModal({
  initDate,
  initTime,
  onClose,
  onBlock,
}: {
  initDate?: string;
  initTime?: string;
  onClose: () => void;
  onBlock: (b: BlockedSlot) => void;
}) {
  const [reason, setReason] = useState("Pause");
  const [date, setDate] = useState(initDate ?? fmtDate(new Date()));
  const [time, setTime] = useState(initTime ?? "08:00");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const REASONS = [
    "Pause",
    "Réunion",
    "Déjeuner",
    "Formation",
    "Congé",
    "Jour férié",
    "Déplacement",
    "Personnel",
    "Autre",
  ];
  const totalMin = hours * 60 + minutes;
  const endT = totalMin > 0 ? endTime(time, totalMin) : "—";

  const SHORTCUTS: [string, number, number][] = [
    ["30 min", 0, 30],
    ["1h", 1, 0],
    ["2h", 2, 0],
    ["4h", 4, 0],
    ["Journée", 9, 0],
  ];

  const handle = () => {
    if (totalMin < 15) {
      toast({ title: "Durée minimum : 15 minutes", variant: "destructive" });
      return;
    }
    onBlock({ id: `blk-${Date.now()}`, date, startTime: time, duration: totalMin, reason, doctor: CURRENT_DOCTOR });
    toast({ title: "Créneau bloqué", description: `${date} ${time}→${endT} · ${reason}` });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border bg-card shadow-elevated mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            {initTime ? "Bloquer ce créneau" : "Bloquer une période"}
          </h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Date + heure début */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Heure début</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 h-9" />
            </div>
          </div>

          {/* Durée */}
          <div>
            <Label className="text-xs text-muted-foreground">Durée du blocage</Label>
            <div className="flex items-end gap-2 mt-1.5">
              <div className="flex-1">
                <Input
                  type="number"
                  min={0}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))}
                  className="h-9 text-center"
                />
                <p className="text-[10px] text-muted-foreground text-center mt-0.5">heures</p>
              </div>
              <span className="text-base font-bold text-muted-foreground pb-3">:</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  step={5}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="h-9 text-center"
                />
                <p className="text-[10px] text-muted-foreground text-center mt-0.5">minutes</p>
              </div>
              <div className="flex-1 text-center pb-0.5">
                <p className="text-[10px] text-muted-foreground">Fin estimée</p>
                <p className="text-sm font-semibold text-foreground">{endT}</p>
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              {SHORTCUTS.map(([lbl, h, m]) => (
                <button
                  key={lbl}
                  onClick={() => {
                    setHours(h);
                    setMinutes(m);
                  }}
                  className={`flex-1 rounded-lg border text-xs py-1.5 font-medium transition-colors
                    ${
                      hours === h && minutes === m
                        ? "border-primary/50 bg-primary/8 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Motif */}
          <div>
            <Label className="text-xs text-muted-foreground">Motif</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors
                    ${reason === r ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Résumé */}
          {totalMin >= 15 && (
            <div className="rounded-lg bg-muted/40 border px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3 shrink-0" />
              <span>
                <span className="font-semibold text-foreground">{date}</span> · {time} → {endT} ·{" "}
                <span className="font-semibold text-foreground">{reason}</span>
              </span>
            </div>
          )}
        </div>

        <div className="px-5 pb-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handle}>
            <Lock className="h-3.5 w-3.5 mr-1.5" /> Bloquer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Block Modal ─────────────────────────────────────────
function EditBlockModal({
  block,
  onClose,
  onUpdate,
  onDelete,
}: {
  block: BlockedSlot;
  onClose: () => void;
  onUpdate: (b: BlockedSlot) => void;
  onDelete: (id: string) => void;
}) {
  const [reason, setReason] = useState(block.reason);
  const [date, setDate] = useState(block.date);
  const [time, setTime] = useState(block.startTime);
  const [hours, setHours] = useState(Math.floor(block.duration / 60));
  const [minutes, setMinutes] = useState(block.duration % 60);
  const [askDel, setAskDel] = useState(false);
  const REASONS = [
    "Pause",
    "Réunion",
    "Déjeuner",
    "Formation",
    "Congé",
    "Jour férié",
    "Déplacement",
    "Personnel",
    "Autre",
  ];
  const totalMin = hours * 60 + minutes;
  const endT = totalMin > 0 ? endTime(time, totalMin) : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border bg-card shadow-elevated mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" /> Modifier le blocage
          </h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Heure début</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Durée</Label>
            <div className="flex items-end gap-2 mt-1.5">
              <div className="flex-1">
                <Input
                  type="number"
                  min={0}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))}
                  className="h-9 text-center"
                />
                <p className="text-[10px] text-muted-foreground text-center mt-0.5">h</p>
              </div>
              <span className="text-base font-bold text-muted-foreground pb-3">:</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  step={5}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="h-9 text-center"
                />
                <p className="text-[10px] text-muted-foreground text-center mt-0.5">min</p>
              </div>
              <div className="flex-1 text-center pb-0.5">
                <p className="text-[10px] text-muted-foreground">Fin</p>
                <p className="text-sm font-semibold text-foreground">{endT}</p>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Motif</Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors
                    ${reason === r ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {askDel ? (
          <div className="px-5 pb-4 space-y-2">
            <p className="text-sm text-destructive font-medium">Confirmer la suppression ?</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setAskDel(false)}>
                Non
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onDelete(block.id);
                  onClose();
                  toast({ title: "Blocage supprimé" });
                }}
              >
                Oui, supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => setAskDel(true)}
            >
              <X className="h-3.5 w-3.5 mr-1" /> Supprimer
            </Button>
            <Button
              className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow"
              onClick={() => {
                if (totalMin < 15) {
                  toast({ title: "Durée minimum : 15 minutes", variant: "destructive" });
                  return;
                }
                onUpdate({ ...block, date, startTime: time, duration: totalMin, reason });
                toast({ title: "Blocage modifié" });
                onClose();
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Enregistrer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Day column ───────────────────────────────────────────────
function DayCol({
  date,
  apts,
  blocks,
  typeColors,
  dayConfig,
  leave,
  onSlotClick,
  onAptClick,
  onBlockClick,
}: {
  date: Date;
  apts: Appt[];
  blocks: BlockedSlot[];
  typeColors: Record<ApptType, ColorKey>;
  dayConfig?: AvailabilityDay;
  leave?: SharedLeave;
  onSlotClick: (t: string, x: number, y: number) => void;
  onAptClick: (a: Appt) => void;
  onBlockClick: (b: BlockedSlot) => void;
}) {
  const ds = fmtDate(date);
  // Occupied mins (apts + blocks)
  const isOccupied = (slotMin: number) => {
    const aptOcc = apts.some((a) => {
      const st = t2min(a.startTime);
      return slotMin >= st && slotMin < st + a.duration;
    });
    const blkOcc = blocks.some((b) => {
      const st = t2min(b.startTime);
      return slotMin >= st && slotMin < st + b.duration;
    });
    return aptOcc || blkOcc;
  };

  const isOpenByAvailability = (slotMin: number) => {
    if (!dayConfig?.active || leave) return false;
    const dayStart = t2min(dayConfig.start);
    const dayEnd = t2min(dayConfig.end);
    if (slotMin < dayStart || slotMin + 30 > dayEnd) return false;

    if (dayConfig.breakStart && dayConfig.breakEnd) {
      const breakStart = t2min(dayConfig.breakStart);
      const breakEnd = t2min(dayConfig.breakEnd);
      if (slotMin < breakEnd && slotMin + 30 > breakStart) return false;
    }

    return true;
  };

  return (
    <div className="relative flex-1 min-w-0" style={{ height: GRID_H }}>
      {/* Grid lines */}
      {HOUR_LABELS.map((_, i) => (
        <div
          key={i}
          className={`absolute left-0 right-0 pointer-events-none border-t ${i % 2 === 0 ? "border-border/50" : "border-dashed border-border/25"}`}
          style={{ top: i * SLOT_H }}
        />
      ))}
      {/* Empty slot zones */}
      {HOUR_LABELS.map((h, i) => {
        const m = DAY_START + i * 30;
        return isOccupied(m) ? null : (
          <div
            key={h}
            className="absolute left-0 right-0 cursor-pointer hover:bg-primary/5 transition-colors group/slot z-0"
            style={{ top: i * SLOT_H, height: SLOT_H }}
            onClick={(e) => onSlotClick(h, e.clientX, e.clientY)}
          >
            <div className="opacity-0 group-hover/slot:opacity-100 absolute inset-0.5 rounded border border-dashed border-primary/30 flex items-center justify-center transition-opacity">
              <Plus className="h-3 w-3 text-primary/40" />
            </div>
          </div>
        );
      })}
      {/* Blocked slots */}
      {blocks
        .filter((b) => b.date === ds)
        .map((b) => (
          <div
            key={b.id}
            style={{
              position: "absolute",
              top: apptTop(b.startTime),
              left: 2,
              right: 2,
              height: apptH(b.duration),
              zIndex: 8,
            }}
          >
            <BlockCard block={b} height={apptH(b.duration)} onClick={() => onBlockClick(b)} />
          </div>
        ))}
      {/* Appointments */}
      {apts.map((a) => (
        <div
          key={a.id}
          style={{
            position: "absolute",
            top: apptTop(a.startTime),
            left: 2,
            right: 2,
            height: apptH(a.duration),
            zIndex: 10,
          }}
        >
          <ApptCard apt={a} height={apptH(a.duration)} colorKey={typeColors[a.type]} onClick={() => onAptClick(a)} />
        </div>
      ))}
      {isToday(ds) && <NowLine />}
    </div>
  );
}

// ─── Week view ────────────────────────────────────────────────
function WeekView({
  days,
  apts,
  blocks,
  typeColors,
  getDayConfig,
  getLeaveForDate,
  onSlot,
  onApt,
  onBlock,
}: {
  days: Date[];
  apts: Appt[];
  blocks: BlockedSlot[];
  typeColors: Record<ApptType, ColorKey>;
  getDayConfig: (date: Date) => AvailabilityDay | undefined;
  getLeaveForDate: (date: Date) => SharedLeave | undefined;
  onSlot: (date: Date, t: string, x: number, y: number) => void;
  onApt: (a: Appt) => void;
  onBlock: (b: BlockedSlot) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const n = new Date();
    scrollRef.current?.scrollTo({
      top: Math.max(0, (n.getHours() * 60 + n.getMinutes() - DAY_START) * PX_PER_MIN - 140),
    });
  }, []);

  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      <div className="flex border-b bg-card sticky top-0 z-30">
        <div className="w-12 shrink-0" />
        {days.map((d) => {
          const ds = fmtDate(d);
          const cnt = apts.filter((a) => a.date === ds && !["cancelled", "absent"].includes(a.status)).length;
          const tod = isToday(ds);
          return (
            <div
              key={ds}
              className={`flex-1 min-w-0 py-2.5 px-1 text-center border-l border-border/40 ${tod ? "bg-primary/5" : ""}`}
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {DAYS_SHORT[dow(d)]}
              </p>
              <div
                className={`mx-auto mt-0.5 h-7 w-7 flex items-center justify-center rounded-full text-sm font-bold
                ${tod ? "bg-primary text-primary-foreground" : "text-foreground"}`}
              >
                {d.getDate()}
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">{cnt > 0 ? `${cnt} rdv` : "—"}</p>
            </div>
          );
        })}
      </div>
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 330px)" }}>
        <div className="flex">
          <div className="w-12 shrink-0 relative select-none" style={{ height: GRID_H }}>
            {HOUR_LABELS.map(
              (h, i) =>
                i % 2 === 0 && (
                  <div
                    key={h}
                    className="absolute right-1.5 text-[9px] text-muted-foreground -translate-y-2.5 leading-none"
                    style={{ top: i * SLOT_H }}
                  >
                    {h}
                  </div>
                ),
            )}
          </div>
          {days.map((d) => (
            <div
              key={fmtDate(d)}
              className={`flex-1 min-w-[70px] border-l border-border/40 relative ${isToday(fmtDate(d)) ? "bg-primary/[0.015]" : ""}`}
            >
              <DayCol
                date={d}
                apts={apts.filter((a) => a.date === fmtDate(d))}
                blocks={blocks.filter((b) => b.date === fmtDate(d))}
                typeColors={typeColors}
                dayConfig={getDayConfig(d)}
                leave={getLeaveForDate(d)}
                onSlotClick={(t, x, y) => onSlot(d, t, x, y)}
                onAptClick={onApt}
                onBlockClick={onBlock}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Day view ─────────────────────────────────────────────────
function DayView({
  date,
  apts,
  blocks,
  typeColors,
  onSlot,
  onApt,
  onBlock,
}: {
  date: Date;
  apts: Appt[];
  blocks: BlockedSlot[];
  typeColors: Record<ApptType, ColorKey>;
  onSlot: (t: string, x: number, y: number) => void;
  onApt: (a: Appt) => void;
  onBlock: (b: BlockedSlot) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const n = new Date();
    scrollRef.current?.scrollTo({
      top: Math.max(0, (n.getHours() * 60 + n.getMinutes() - DAY_START) * PX_PER_MIN - 140),
    });
  }, []);
  const ds = fmtDate(date);
  const dayA = apts.filter((a) => a.date === ds);
  const dayB = blocks.filter((b) => b.date === ds);
  const cnt = dayA.filter((a) => !["cancelled", "absent"].includes(a.status)).length;
  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      <div
        className={`px-5 py-3.5 border-b flex items-center justify-between ${isToday(ds) ? "bg-primary/5" : "bg-muted/20"}`}
      >
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {DAYS_SHORT[dow(date)]}
          </p>
          <h2 className="text-lg font-bold text-foreground mt-0.5">
            {date.getDate()} {MONTHS_LONG[date.getMonth()]} {date.getFullYear()}
            {isToday(ds) && (
              <span className="ml-2 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Aujourd'hui
              </span>
            )}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{cnt}</p>
          <p className="text-xs text-muted-foreground">RDV prévus</p>
        </div>
      </div>
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 330px)" }}>
        <div className="flex">
          <div className="w-12 shrink-0 relative select-none" style={{ height: GRID_H }}>
            {HOUR_LABELS.map(
              (h, i) =>
                i % 2 === 0 && (
                  <div
                    key={h}
                    className="absolute right-1.5 text-[9px] text-muted-foreground -translate-y-2.5 leading-none"
                    style={{ top: i * SLOT_H }}
                  >
                    {h}
                  </div>
                ),
            )}
          </div>
          <div className="flex-1 border-l border-border/40 relative">
            <DayCol
              date={date}
              apts={dayA}
              blocks={dayB}
              typeColors={typeColors}
              onSlotClick={onSlot}
              onAptClick={onApt}
              onBlockClick={onBlock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Month view ───────────────────────────────────────────────
function MonthView({
  year,
  month,
  apts,
  typeColors,
  onDayClick,
  onAptClick,
}: {
  year: number;
  month: number;
  apts: Appt[];
  typeColors: Record<ApptType, ColorKey>;
  onDayClick: (d: Date) => void;
  onAptClick: (a: Appt) => void;
}) {
  const cells = monthCells(year, month),
    todS = fmtDate(new Date());
  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/20">
        {DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-border/30">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="min-h-[90px] bg-muted/10" />;
          const ds = fmtDate(d),
            da = apts.filter((a) => a.date === ds && !["cancelled", "absent"].includes(a.status));
          const isT = ds === todS;
          return (
            <div
              key={ds}
              onClick={() => onDayClick(d)}
              className={`min-h-[90px] p-1.5 cursor-pointer hover:bg-muted/20 transition-colors ${isT ? "bg-primary/3" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                  ${isT ? "bg-primary text-primary-foreground" : "text-foreground"}`}
                >
                  {d.getDate()}
                </span>
                {da.length > 0 && <span className="text-[9px] text-muted-foreground">{da.length}</span>}
              </div>
              <div className="space-y-0.5">
                {da.slice(0, 3).map((a) => {
                  const s = colorStyle(typeColors[a.type]);
                  return (
                    <div
                      key={a.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAptClick(a);
                      }}
                      className={`flex items-center gap-1 rounded px-1 py-0.5 text-[9px] truncate cursor-pointer hover:opacity-70 ${s.bg} ${s.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
                      <span className="font-semibold">{a.startTime}</span>
                      <span className="truncate opacity-80">{a.patient.split(" ")[0]}</span>
                    </div>
                  );
                })}
                {da.length > 3 && <p className="text-[9px] font-semibold text-primary px-1">+{da.length - 3} autres</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── List view ────────────────────────────────────────────────
function ListView({
  apts,
  typeColors,
  onAptClick,
}: {
  apts: Appt[];
  typeColors: Record<ApptType, ColorKey>;
  onAptClick: (a: Appt) => void;
}) {
  const sorted = [...apts]
    .filter((a) => !["cancelled", "absent"].includes(a.status))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const groups = sorted.reduce<Record<string, Appt[]>>((acc, a) => {
    (acc[a.date] ??= []).push(a);
    return acc;
  }, {});
  if (!sorted.length)
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Aucun RDV sur cette période</p>
      </div>
    );
  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([ds, da]) => {
        const d = new Date(ds + "T00:00:00"),
          it = isToday(ds);
        return (
          <div key={ds} className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className={`flex items-center gap-3 px-4 py-3 border-b ${it ? "bg-primary/5" : "bg-muted/20"}`}>
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0
                ${it ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                {d.getDate()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {DAYS_SHORT[dow(d)]} {d.getDate()} {MONTHS_LONG[d.getMonth()]}
                  {it && <span className="ml-2 text-xs font-normal text-primary">Aujourd'hui</span>}
                </p>
                <p className="text-xs text-muted-foreground">{da.length} rendez-vous</p>
              </div>
            </div>
            <div className="divide-y divide-border/40">
              {da.map((a) => {
                const s = colorStyle(typeColors[a.type]);
                return (
                  <div
                    key={a.id}
                    onClick={() => onAptClick(a)}
                    className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="w-12 shrink-0">
                      <p className="text-sm font-semibold text-foreground">{a.startTime}</p>
                      <p className="text-[10px] text-muted-foreground">{a.duration} min</p>
                    </div>
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.bg} ${s.text}`}
                    >
                      {a.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground">{a.patient}</p>
                        {a.teleconsultation && <Video className="h-3 w-3 text-primary shrink-0" />}
                        {a.isNew && (
                          <span className="text-[9px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{a.motif}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.pill}`}>{a.type}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_CLS[a.status]}`}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── RDV Panel ────────────────────────────────────────────────
function RdvPanel({
  apt,
  typeColors,
  onClose,
  onAction,
  tcSessions,
  reschApts,
  reschBlocks,
}: {
  apt: Appt;
  typeColors: Record<ApptType, ColorKey>;
  onClose: () => void;
  onAction: (action: string, id: string, payload?: Record<string, string>) => void;
  tcSessions: ReturnType<typeof useTeleconsultSessions>;
  reschApts: Appt[];
  reschBlocks: BlockedSlot[];
}) {
  const [resched, setResched] = useState(false);
  const [nDate, setNDate] = useState(apt.date);
  const [nTime, setNTime] = useState(apt.startTime);
  const [confirm, setConfirm] = useState<null | {
    action: string;
    title: string;
    desc: string;
    variant?: "danger" | "warning";
  }>(null);

  const s = colorStyle(typeColors[apt.type]);
  const d = new Date(apt.date + "T00:00:00");
  const faded = ["cancelled", "absent"].includes(apt.status);
  const STEPS: ApptStatus[] = ["confirmed", "arrived", "in_progress", "done"];
  const step = STEPS.indexOf(apt.status);
  const tcSess = tcSessions.find((ts) => ts.patientName === apt.patient);

  const ask = (action: string, title: string, desc: string, variant?: "danger" | "warning") => {
    setConfirm({ action, title, desc, variant });
  };

  const doAction = (action: string) => {
    onAction(action, apt.id);
    setConfirm(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
        <div
          className="absolute right-0 top-0 h-full w-full max-w-[400px] bg-card border-l shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-5 py-4 border-b ${s.bg}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${s.bg} ${s.text} border ${s.border}`}
                >
                  {apt.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground truncate">{apt.patient}</h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_CLS[apt.status]}`}
                    >
                      {STATUS_LABEL[apt.status]}
                    </span>
                    {apt.teleconsultation && (
                      <span className="text-[10px] font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Video className="h-2.5 w-2.5" /> Vidéo
                      </span>
                    )}
                    {apt.isNew && (
                      <span className="text-[10px] font-medium text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full">
                        Nouveau patient
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/40 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Infos */}
            <div className="px-5 py-4 border-b grid grid-cols-2 gap-2.5">
              <div className="rounded-lg bg-muted/30 px-3 py-2.5">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm font-semibold text-foreground">
                  {DAYS_SHORT[dow(d)]} {d.getDate()} {MONTHS_SH[d.getMonth()]}
                </p>
              </div>
              <div className="rounded-lg bg-muted/30 px-3 py-2.5">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Heure</p>
                <p className="text-sm font-semibold text-foreground">
                  {apt.startTime}
                  <span className="text-xs font-normal text-muted-foreground"> ({apt.duration} min)</span>
                </p>
              </div>
              <div className="col-span-2 rounded-lg bg-muted/30 px-3 py-2.5">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Motif</p>
                <p className="text-sm font-semibold text-foreground">{apt.motif}</p>
              </div>
              <div className="rounded-lg bg-muted/30 px-3 py-2.5">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">Type</p>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.pill}`}>{apt.type}</span>
              </div>
              <div className="rounded-lg bg-muted/30 px-3 py-2.5">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">Assurance</p>
                <p className="text-xs font-semibold text-foreground">{apt.assurance}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-muted/30 px-3 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">
                    Téléphone
                  </p>
                  <p className="text-sm font-semibold text-foreground">{apt.phone || "—"}</p>
                </div>
                {apt.phone && (
                  <a
                    href={`tel:${apt.phone}`}
                    className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent hover:bg-accent/20 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Progression */}
            {!faded && step >= 0 && (
              <div className="px-5 py-4 border-b">
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mb-4">
                  Progression
                </p>
                <div className="flex items-start">
                  {STEPS.map((st, i) => (
                    <div key={st} className={`flex flex-col items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                      <div className="flex items-center w-full">
                        <div
                          className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0 transition-all
                          ${
                            i < step
                              ? "border-accent bg-accent text-accent-foreground"
                              : i === step
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {i < step ? "✓" : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 ${i < step ? "bg-accent" : "bg-muted"}`} />
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-medium mt-1 text-center whitespace-nowrap
                        ${i === step ? "text-primary" : i < step ? "text-accent" : "text-muted-foreground"}`}
                      >
                        {STATUS_LABEL[st]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reporter avec créneaux disponibles */}
            {resched && (
              <div className="px-5 py-4 border-b bg-warning/5 space-y-3">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-warning" /> Reporter le RDV
                </p>
                <div>
                  <Label className="text-xs text-muted-foreground">Nouvelle date</Label>
                  <Input type="date" value={nDate} onChange={(e) => setNDate(e.target.value)} className="mt-1 h-9" />
                </div>
                {/* Créneaux disponibles pour la date choisie */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Créneaux disponibles — {nDate}</Label>
                  <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
                    {HOUR_LABELS.map((slot) => {
                      const slotMin = t2min(slot);
                      const taken = reschApts.some((a) => {
                        if (a.id === apt.id || ["cancelled", "absent"].includes(a.status) || a.date !== nDate)
                          return false;
                        const st = t2min(a.startTime);
                        return slotMin >= st && slotMin < st + a.duration;
                      });
                      const blocked = reschBlocks.some((b) => {
                        if (b.date !== nDate) return false;
                        const st = t2min(b.startTime);
                        return slotMin >= st && slotMin < st + b.duration;
                      });
                      const unavail = taken || blocked;
                      return (
                        <button
                          key={slot}
                          disabled={unavail}
                          onClick={() => setNTime(slot)}
                          className={`rounded-lg border py-2 text-xs font-medium transition-all
                            ${
                              unavail
                                ? "opacity-30 cursor-not-allowed border-border bg-muted/30 text-muted-foreground"
                                : nTime === slot
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-border hover:border-primary/50 hover:bg-primary/5 text-foreground"
                            }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {nTime && (
                    <p className="text-xs text-primary font-medium mt-2">
                      Sélectionné : {nTime} ({apt.duration} min)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setResched(false)}>
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gradient-primary text-primary-foreground"
                    disabled={!nTime}
                    onClick={() => {
                      onAction("reschedule", apt.id, { newDate: nDate, newTime: nTime });
                      setResched(false);
                    }}
                  >
                    <CalendarClock className="h-3.5 w-3.5 mr-1.5" /> Confirmer
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-5 py-4 space-y-2">
              {apt.status === "pending" && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-10"
                  onClick={() =>
                    ask(
                      "confirm",
                      "Confirmer ce RDV ?",
                      `Confirmer le rendez-vous de ${apt.patient} le ${apt.date} à ${apt.startTime}.`,
                    )
                  }
                >
                  <CheckCircle2 className="h-4 w-4 mr-2.5 text-accent" /> Confirmer le RDV
                </Button>
              )}
              {apt.status === "confirmed" && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-10"
                  onClick={() =>
                    ask("arrived", "Marquer comme arrivé ?", `${apt.patient} est arrivé en salle d'attente.`)
                  }
                >
                  <UserCheck className="h-4 w-4 mr-2.5 text-primary" /> Marquer arrivé
                </Button>
              )}
              {["confirmed", "arrived"].includes(apt.status) && !apt.teleconsultation && (
                <Link to={`/dashboard/doctor/consultation/new?patient=${apt.patientId ?? 1}`}>
                  <Button
                    className="w-full justify-start h-10 gradient-primary text-primary-foreground mb-1"
                    onClick={onClose}
                  >
                    <Activity className="h-4 w-4 mr-2.5" /> Démarrer la consultation
                  </Button>
                </Link>
              )}
              {apt.teleconsultation && tcSess && <DoctorJoinTeleconsultButton sessionId={tcSess.id} />}
              {apt.status === "in_progress" && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-10"
                  onClick={() => ask("done", "Terminer la consultation ?", "Marquer ce RDV comme terminé.")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2.5 text-accent" /> Marquer terminé
                </Button>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => setResched((v) => !v)}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-warning" /> Reporter
                </Button>
                <Link to="/dashboard/doctor/messages" className="flex-1">
                  <Button variant="outline" className="w-full h-9 text-xs">
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-primary" /> Message
                  </Button>
                </Link>
                <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => {
                  toast({ title: "Impression en cours", description: `Fiche RDV de ${apt.patient} — ${apt.date} à ${apt.startTime}` });
                  window.print();
                }}>
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Imprimer
                </Button>
              </div>

              {!faded && (
                <>
                  <div className="border-t pt-2 space-y-1.5">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-10 text-warning border-warning/30 hover:bg-warning/5"
                      onClick={() =>
                        ask(
                          "absent",
                          "Marquer le patient absent ?",
                          `${apt.patient} n'est pas venu à son rendez-vous.`,
                          "warning",
                        )
                      }
                    >
                      <UserX className="h-4 w-4 mr-2.5" /> Patient absent
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start h-10 text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() =>
                        ask("cancel", "Annuler ce RDV ?", `Le rendez-vous de ${apt.patient} sera annulé.`, "danger")
                      }
                    >
                      <X className="h-4 w-4 mr-2.5" /> Annuler le RDV
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm dialogs */}
      {confirm && (
        <ConfirmDialog
          open={true}
          title={confirm.title}
          description={confirm.desc}
          confirmLabel="Confirmer"
          cancelLabel="Annuler"
          variant={confirm.variant ?? "default"}
          onConfirm={() => doAction(confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}

// ─── Create RDV modal ─────────────────────────────────────────
function CreateModal({
  defDate,
  defTime,
  typeColors,
  onClose,
  onCreate,
}: {
  defDate?: string;
  defTime?: string;
  typeColors: Record<ApptType, ColorKey>;
  onClose: () => void;
  onCreate: (a: Appt) => void;
}) {
  const [mode, setMode] = useState<"registered" | "new">("registered");
  const [q, setQ] = useState("");
  const [patient, setPatient] = useState<{ name: string; id: number | null; avatar: string; phone: string; assurance: string } | null>(null);
  // Nouveau patient
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [tel, setTel] = useState("");
  const [assur, setAssur] = useState("");
  // RDV
  const [date, setDate] = useState(defDate ?? fmtDate(new Date()));
  const [time, setTime] = useState(defTime ?? "09:00");
  const [type, setType] = useState<ApptType>("Consultation");
  const [duration, setDuration] = useState(30);
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState("");
  const [tele, setTele] = useState(false);
  const [showDrop, setShowDrop] = useState(false);

  const [sharedPats] = useSharedPatients();
  const allPats = useMemo(() => {
    return sharedPats.map(p => ({
      name: p.name,
      id: p.id,
      avatar: p.avatar,
      phone: p.phone,
      assurance: p.assurance,
    }));
  }, [sharedPats]);

  const filtered =
    q.length > 0 ? allPats.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];

  const TYPES: ApptType[] = ["Consultation", "Suivi", "Première visite", "Contrôle", "Urgence", "Téléconsultation"];

  const canSubmit = mode === "registered" ? !!patient : nom.trim().length > 0 && prenom.trim().length > 0;

  const handleCreate = () => {
    if (!canSubmit) return;
    const isNew = mode === "new";
    const finalPatient = isNew
      ? {
          name: `${prenom.trim()} ${nom.trim()}`,
          id: null,
          avatar: `${prenom[0]}${nom[0]}`.toUpperCase(),
          phone: tel,
          assurance: assur || "—",
        }
      : patient!;
    const a: Appt = {
      id: `new-${Date.now()}`,
      date,
      startTime: time,
      endTime: computeEndTime(time, duration),
      duration,
      patient: finalPatient.name,
      patientId: finalPatient.id,
      avatar: finalPatient.avatar,
      phone: finalPatient.phone,
      motif: motif || type,
      type,
      status: "confirmed",
      assurance: finalPatient.assurance,
      doctor: CURRENT_DOCTOR,
      teleconsultation: tele || type === "Téléconsultation",
      notes,
      isNew,
    };
    onCreate(a);
    toast({ title: "RDV créé", description: `${finalPatient.name} — ${date} à ${time}` });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border bg-card shadow-elevated mx-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalIcon className="h-4 w-4 text-primary" /> Nouveau rendez-vous
          </h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Toggle patient inscrit / nouveau */}
          <div className="flex rounded-lg border bg-muted/30 p-0.5 gap-0.5">
            <button
              onClick={() => setMode("registered")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors
                ${mode === "registered" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <User className="h-3.5 w-3.5" /> Patient inscrit
            </button>
            <button
              onClick={() => setMode("new")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors
                ${mode === "new" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <UserPlus className="h-3.5 w-3.5" /> Nouveau patient
            </button>
          </div>

          {/* Recherche patient inscrit */}
          {mode === "registered" && (
            <div>
              <Label className="text-xs text-muted-foreground">Patient *</Label>
              {patient ? (
                <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border bg-muted/20 px-3 py-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {patient.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{patient.name}</p>
                    <p className="text-[10px] text-muted-foreground">{patient.phone}</p>
                  </div>
                  <button
                    onClick={() => {
                      setPatient(null);
                      setQ("");
                    }}
                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setShowDrop(true);
                    }}
                    onFocus={() => setShowDrop(true)}
                    placeholder="Rechercher un patient…"
                    className="pl-9 h-9"
                  />
                  {showDrop && filtered.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border bg-card shadow-elevated overflow-hidden">
                      {filtered.map((p) => (
                        <button
                          key={p.id}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                          onClick={() => {
                            setPatient(p);
                            setQ("");
                            setShowDrop(false);
                          }}
                        >
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {p.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nouveau patient libre */}
          {mode === "new" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Prénom *</Label>
                  <Input
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Prénom"
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Nom *</Label>
                  <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" className="mt-1 h-9" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Téléphone</Label>
                <Input
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                  placeholder="+216 XX XXX XXX"
                  className="mt-1 h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Assurance</Label>
                <Input
                  value={assur}
                  onChange={(e) => setAssur(e.target.value)}
                  placeholder="CNAM, CNSS, Privée…"
                  className="mt-1 h-9"
                />
              </div>
            </div>
          )}

          {/* Date & heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Heure *</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 h-9" />
            </div>
          </div>

          {/* Type */}
          <div>
            <Label className="text-xs text-muted-foreground">Type</Label>
            <div className="grid grid-cols-3 gap-1.5 mt-1.5">
              {TYPES.map((t) => {
                const cs = colorStyle(typeColors[t]);
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setType(t);
                      if (t === "Téléconsultation") setTele(true);
                    }}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all text-center
                      ${type === t ? `${cs.bg} ${cs.border} ${cs.text}` : "border-border text-muted-foreground hover:bg-muted/30"}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Durée */}
          <div>
            <Label className="text-xs text-muted-foreground">Durée</Label>
            <select
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 h-9 text-sm focus:outline-none"
            >
              {[15, 20, 30, 45, 60, 90].map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>

          {/* Motif */}
          <div>
            <Label className="text-xs text-muted-foreground">Motif</Label>
            <Input
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Suivi diabète, Renouvellement Rx…"
              className="mt-1 h-9"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs text-muted-foreground">Notes internes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Visible uniquement par le médecin…"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none"
            />
          </div>

          {/* Téléconsultation */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative h-5 w-9 rounded-full transition-colors ${tele ? "bg-primary" : "bg-muted-foreground/30"}`}
              onClick={() => setTele((v) => !v)}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${tele ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-sm text-foreground">
              Téléconsultation
              <span className="text-xs text-muted-foreground font-normal ml-1">
                (le patient se connecte à distance)
              </span>
            </span>
          </label>
        </div>

        <div className="px-5 pb-4 flex gap-2 pt-2 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            disabled={!canSubmit}
            className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow"
            onClick={handleCreate}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Créer le RDV
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Couleurs modal (médecin configure) ──────────────────────
function ColorsModal({
  typeColors,
  onChange,
  onClose,
}: {
  typeColors: Record<ApptType, ColorKey>;
  onChange: (t: ApptType, c: ColorKey) => void;
  onClose: () => void;
}) {
  const TYPES: ApptType[] = ["Consultation", "Suivi", "Première visite", "Contrôle", "Urgence", "Téléconsultation"];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border bg-card shadow-elevated mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" /> Couleurs des étiquettes
          </h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-5">
          <p className="text-xs text-muted-foreground">
            Choisissez la couleur pour chaque type de RDV. Les couleurs s'appliquent immédiatement dans l'agenda.
          </p>
          {TYPES.map((t) => {
            const current = typeColors[t];
            const cs = colorStyle(current);
            return (
              <div key={t} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full shrink-0 ${cs.dot}`} />
                  <p className="text-xs font-semibold text-foreground">{t}</p>
                  <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${cs.pill}`}>
                    {cs.label}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => onChange(t, c.key)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all
                        ${
                          current === c.key
                            ? `${c.bg} ${c.border} ${c.text} ring-1 ring-offset-1 ring-primary/30`
                            : "border-border text-muted-foreground hover:bg-muted/40"
                        }`}
                    >
                      <span className={`h-3 w-3 rounded-full shrink-0 ${c.dot}`} />
                      {c.label}
                      {current === c.key && <CheckCircle2 className="h-3 w-3 ml-0.5" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 pb-5 border-t pt-4">
          <Button
            className="w-full gradient-primary text-primary-foreground shadow-primary-glow"
            onClick={() => {
              toast({ title: "Couleurs enregistrées ✓" });
              onClose();
            }}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Enregistrer et fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Disponibilités modal ─────────────────────────────────────
function AvailModal({ onClose }: { onClose: () => void }) {
  type DC = { on: boolean; start: string; end: string };
  const [cfg, setCfg] = useState<Record<string, DC>>({
    Lun: { on: true, start: "08:00", end: "18:00" },
    Mar: { on: true, start: "08:00", end: "18:00" },
    Mer: { on: true, start: "08:00", end: "18:00" },
    Jeu: { on: true, start: "08:00", end: "18:00" },
    Ven: { on: true, start: "08:00", end: "18:00" },
    Sam: { on: false, start: "08:00", end: "13:00" },
    Dim: { on: false, start: "09:00", end: "12:00" },
  });
  const [slot, setSlot] = useState(30);
  const toggle = (d: string) => setCfg((p) => ({ ...p, [d]: { ...p[d], on: !p[d].on } }));
  const update = (d: string, k: "start" | "end", v: string) => setCfg((p) => ({ ...p, [d]: { ...p[d], [k]: v } }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border bg-card shadow-elevated mx-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Repeat className="h-4 w-4 text-primary" /> Disponibilités récurrentes
          </h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-2">
          {DAYS_SHORT.map((d) => (
            <div
              key={d}
              className={`rounded-lg border px-4 py-3 transition-all ${cfg[d]?.on ? "border-primary/30 bg-primary/3" : "opacity-50"}`}
            >
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none w-16 shrink-0">
                  <input
                    type="checkbox"
                    checked={!!cfg[d]?.on}
                    onChange={() => toggle(d)}
                    className="rounded border-input"
                  />
                  <span className="text-sm font-medium text-foreground">{d}</span>
                </label>
                {cfg[d]?.on ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={cfg[d].start}
                      onChange={(e) => update(d, "start", e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <span className="text-xs text-muted-foreground">→</span>
                    <Input
                      type="time"
                      value={cfg[d].end}
                      onChange={(e) => update(d, "end", e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Fermé</span>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Label className="text-xs text-muted-foreground">Durée par créneau</Label>
            <select
              value={slot}
              onChange={(e) => setSlot(+e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 h-9 text-sm"
            >
              {[15, 20, 30, 45, 60].map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button
              className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow"
              onClick={() => {
                toast({ title: "Disponibilités enregistrées" });
                onClose();
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Enregistrer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────
function StatsBar({ apts }: { apts: Appt[] }) {
  const todS = fmtDate(new Date()),
    todA = apts.filter((a) => a.date === todS);
  const active = todA.filter((a) => !["cancelled", "absent"].includes(a.status)).length;
  const inRoom = todA.filter((a) => ["arrived", "in_progress"].includes(a.status)).length;
  const pend = todA.filter((a) => a.status === "pending").length;
  const week = apts.filter((a) => !["cancelled", "absent"].includes(a.status)).length;
  const items = [
    { label: "Aujourd'hui", val: active, icon: CalendarDays, cls: "text-primary" },
    { label: "En salle", val: inRoom, icon: Timer, cls: "text-primary" },
    { label: "À confirmer", val: pend, icon: Clock, cls: "text-warning" },
    { label: "Cette semaine", val: week, icon: Activity, cls: "text-accent" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border bg-card shadow-sm px-4 py-3 flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 ${it.cls}`}>
            <it.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground leading-none">{it.val}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{it.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Search overlay ───────────────────────────────────────────
function SearchOverlay({
  apts,
  typeColors,
  onSelect,
  onClose,
}: {
  apts: Appt[];
  typeColors: Record<ApptType, ColorKey>;
  onSelect: (a: Appt) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTimeout(() => ref.current?.focus(), 30);
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const res =
    q.length > 1
      ? apts
          .filter(
            (a) => a.patient.toLowerCase().includes(q.toLowerCase()) || a.motif.toLowerCase().includes(q.toLowerCase()),
          )
          .slice(0, 8)
      : [];
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-foreground/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl border bg-card shadow-elevated overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un patient ou un motif…"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {res.length > 0 ? (
            res.map((a) => {
              const s = colorStyle(typeColors[a.type]);
              const d = new Date(a.date + "T00:00:00");
              return (
                <button
                  key={a.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b last:border-0"
                  onClick={() => {
                    onSelect(a);
                    onClose();
                  }}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${s.bg} ${s.text}`}
                  >
                    {a.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.patient}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.motif}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-foreground">
                      {d.getDate()} {MONTHS_SH[d.getMonth()]}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{a.startTime}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {q.length > 1 ? `Aucun résultat pour « ${q} »` : "Tapez pour rechercher…"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
const DoctorSchedule = () => {
  const tcSessions = useTeleconsultSessions();

  const [view, setView] = useState<ViewMode>("week");
  const [current, setCurrent] = useState(() => new Date());
  const [allApts, , { isLoading: aptsLoading }] = useSharedAppointments();
  const [allBlocks] = useSharedBlockedSlots();
  const [availConfig] = useSharedAvailability();
  const [allLeaves] = useSharedLeaves();
  const apts = useMemo(() => allApts.filter(a => a.doctor === CURRENT_DOCTOR), [allApts]);
  const blocks = useMemo(() => allBlocks.filter(b => b.doctor === CURRENT_DOCTOR), [allBlocks]);

  const getDayConfig = useCallback((date: Date): AvailabilityDay | undefined => {
    const DAYS_MAP = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const dayName = DAYS_MAP[date.getDay()];
    return availConfig.days[dayName];
  }, [availConfig]);

  const getLeaveForDate = useCallback((date: Date): SharedLeave | undefined => {
    const ds = fmtDate(date);
    return allLeaves.find(l => l.status === "upcoming" && ds >= l.startDate && ds <= l.endDate);
  }, [allLeaves]);
  const [typeColors, setTypeColors] = useState<Record<ApptType, ColorKey>>(DEFAULT_TYPE_COLORS);

  // Modal state
  const [selApt, setSelApt] = useState<Appt | null>(null);
  const [slotCtx, setSlotCtx] = useState<SlotCtx | null>(null);
  const [blockModal, setBlockModal] = useState<{ initDate?: string; initTime?: string } | null>(null);
  const [editBlock, setEditBlock] = useState<BlockedSlot | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [defDate, setDefDate] = useState<string | undefined>();
  const [defTime, setDefTime] = useState<string | undefined>();
  const [showAvail, setShowAvail] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Ctrl+K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const ws = useMemo(() => weekStart(current), [current]);
  const wds = useMemo(() => weekDays(ws), [ws]);

  const nav = (dir: -1 | 1) =>
    setCurrent((d) => (view === "day" ? addDays(d, dir) : view === "month" ? addMonths(d, dir) : addDays(d, dir * 7)));

  const rangeLabel = useMemo(() => {
    if (view === "week") {
      const e = wds[6];
      return ws.getMonth() === e.getMonth()
        ? `${ws.getDate()} – ${e.getDate()} ${MONTHS_LONG[ws.getMonth()]} ${ws.getFullYear()}`
        : `${ws.getDate()} ${MONTHS_SH[ws.getMonth()]} – ${e.getDate()} ${MONTHS_SH[e.getMonth()]} ${ws.getFullYear()}`;
    }
    if (view === "day")
      return `${DAYS_SHORT[dow(current)]} ${current.getDate()} ${MONTHS_LONG[current.getMonth()]} ${current.getFullYear()}`;
    return `${MONTHS_LONG[current.getMonth()]} ${current.getFullYear()}`;
  }, [view, current, ws, wds]);

  const handleAction = useCallback(
    (action: string, id: string, payload?: Record<string, string>) => {
      // Write to shared store
      switch (action) {
        case "confirm": updateAppointmentStatus(id, "confirmed"); break;
        case "arrived": updateAppointmentStatus(id, "arrived"); break;
        case "start": updateAppointmentStatus(id, "in_progress"); break;
        case "done": updateAppointmentStatus(id, "done"); break;
        case "cancel": updateAppointmentStatus(id, "cancelled"); break;
        case "absent": updateAppointmentStatus(id, "absent"); break;
        case "reschedule":
          if (payload) rescheduleAppointment(id, payload.newDate, payload.newTime);
          break;
      }
      // Status is already synced via sharedAppointmentsStore — no need for separate waitingRoom sync
      const MSGS: Record<string, string> = {
        confirm: "RDV confirmé", arrived: "Patient arrivé", start: "Consultation démarrée",
        done: "Consultation terminée", cancel: "RDV annulé", absent: "Patient marqué absent",
        reschedule: "RDV reporté",
      };
      toast({ title: MSGS[action] ?? "Mise à jour" });
      if (action === "reschedule" && payload)
        setSelApt((p) => (p ? { ...p, date: payload.newDate, startTime: payload.newTime, endTime: computeEndTime(payload.newTime, p.duration) } : p));
    },
    [apts],
  );

  const listApts = useMemo(() => {
    const s = fmtDate(ws),
      e = fmtDate(addDays(ws, 6));
    return apts.filter((a) => a.date >= s && a.date <= e);
  }, [apts, ws]);

  const handleSlotClick = (date: Date, time: string, x: number, y: number) => {
    setSlotCtx({ date: fmtDate(date), time, x, y });
  };

  if (aptsLoading) {
    return (
      <DashboardLayout role="doctor" title="Planning">
        <LoadingSkeleton type="dashboard" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor" title="Planning">
      <div className="space-y-4">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => nav(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => nav(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setCurrent(new Date())}>
              Aujourd'hui
            </Button>
            <span className="text-base font-semibold text-foreground hidden md:block ml-1">{rangeLabel}</span>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 rounded-lg border bg-card p-0.5">
            {(
              [
                ["month", "Mois", CalIcon],
                ["week", "Semaine", LayoutGrid],
                ["day", "Jour", ListIcon],
                ["list", "Liste", ListIcon],
              ] as const
            ).map(([v, lbl, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                  ${view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lbl}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              title="Rechercher (Ctrl+K)"
              onClick={() => setShowSearch(true)}
              className="h-9 w-9 rounded-lg border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <Button variant="outline" size="sm" className="text-xs h-9" onClick={() => setShowColors(true)}>
              <Palette className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Couleurs</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-9" onClick={() => setShowAvail(true)}>
              <Repeat className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Disponibilités</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-9" onClick={() => setBlockModal({})}>
              <Ban className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Bloquer</span>
            </Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground shadow-primary-glow text-xs h-9"
              onClick={() => {
                setDefDate(undefined);
                setDefTime(undefined);
                setShowCreate(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Nouveau RDV
            </Button>
          </div>
        </div>

        {/* Mobile label */}
        <p className="text-sm font-semibold text-foreground md:hidden">{rangeLabel}</p>

        {/* Stats */}
        <StatsBar apts={apts} />

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {(Object.entries(typeColors) as [ApptType, ColorKey][]).map(([t, ck]) => {
            const s = colorStyle(ck);
            return (
              <div key={t} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                {t}
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 pl-3 border-l">
            <div className="w-3 h-px bg-destructive" />
            Heure actuelle
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Lock className="h-2.5 w-2.5" />
            Créneau bloqué
          </div>
        </div>

        {/* Views */}
        {view === "week" && (
          <WeekView
            days={wds}
            apts={apts}
            blocks={blocks}
            typeColors={typeColors}
            getDayConfig={getDayConfig}
            getLeaveForDate={getLeaveForDate}
            onSlot={handleSlotClick}
            onApt={setSelApt}
            onBlock={setEditBlock}
          />
        )}
        {view === "day" && (
          <DayView
            date={current}
            apts={apts}
            blocks={blocks}
            typeColors={typeColors}
            onSlot={(t, x, y) => handleSlotClick(current, t, x, y)}
            onApt={setSelApt}
            onBlock={setEditBlock}
          />
        )}
        {view === "month" && (
          <MonthView
            year={current.getFullYear()}
            month={current.getMonth()}
            apts={apts}
            typeColors={typeColors}
            onDayClick={(d) => {
              setCurrent(d);
              setView("day");
            }}
            onAptClick={setSelApt}
          />
        )}
        {view === "list" && <ListView apts={listApts} typeColors={typeColors} onAptClick={setSelApt} />}

        <UpgradeBanner
          feature="Statistiques avancées"
          description="Analysez vos taux de remplissage, no-show et revenus avec le plan Pro."
        />
      </div>

      {/* Slot popup */}
      {slotCtx && (
        <SlotPopup
          ctx={slotCtx}
          onRdv={() => {
            setDefDate(slotCtx.date);
            setDefTime(slotCtx.time);
            setSlotCtx(null);
            setShowCreate(true);
          }}
          onBlock={() => {
            setBlockModal({ initDate: slotCtx.date, initTime: slotCtx.time });
            setSlotCtx(null);
          }}
          onClose={() => setSlotCtx(null)}
        />
      )}

      {/* Unified block modal (toolbar + slot popup → même modal) */}
      {blockModal !== null && (
        <UnifiedBlockModal
          initDate={blockModal.initDate}
          initTime={blockModal.initTime}
          onClose={() => setBlockModal(null)}
          onBlock={(b) => {
            addBlockedSlot({ date: b.date, startTime: b.startTime, duration: b.duration, reason: b.reason, doctor: CURRENT_DOCTOR });
            setBlockModal(null);
          }}
        />
      )}

      {/* Edit / delete existing block */}
      {editBlock && (
        <EditBlockModal
          block={editBlock}
          onClose={() => setEditBlock(null)}
          onUpdate={(b) => {
            storeUpdateBlock(b.id, { date: b.date, startTime: b.startTime, duration: b.duration, reason: b.reason });
            setEditBlock(null);
          }}
          onDelete={(id) => {
            removeBlockedSlot(id);
            setEditBlock(null);
          }}
        />
      )}

      {/* RDV panel */}
      {selApt && (
        <RdvPanel
          apt={selApt}
          typeColors={typeColors}
          onClose={() => setSelApt(null)}
          onAction={handleAction}
          tcSessions={tcSessions}
          reschApts={apts}
          reschBlocks={blocks}
        />
      )}

      {/* Create */}
      {showCreate && (
        <CreateModal
          defDate={defDate}
          defTime={defTime}
          typeColors={typeColors}
          onClose={() => {
            setShowCreate(false);
            setDefDate(undefined);
            setDefTime(undefined);
          }}
          onCreate={(a) => {
            storeCreateAppointment({
              date: a.date, startTime: a.startTime, duration: a.duration,
              patient: a.patient, patientId: a.patientId, avatar: a.avatar,
              phone: a.phone, motif: a.motif, type: a.type, status: a.status,
              assurance: a.assurance, doctor: CURRENT_DOCTOR,
              teleconsultation: a.teleconsultation, notes: a.notes, isNew: a.isNew,
            });
          }}
        />
      )}

      {/* Couleurs */}
      {showColors && (
        <ColorsModal
          typeColors={typeColors}
          onChange={(t, c) => setTypeColors((p) => ({ ...p, [t]: c }))}
          onClose={() => setShowColors(false)}
        />
      )}

      {showAvail && <AvailModal onClose={() => setShowAvail(false)} />}
      {showSearch && (
        <SearchOverlay
          apts={apts}
          typeColors={typeColors}
          onSelect={(a) => {
            setSelApt(a);
            setCurrent(new Date(a.date + "T00:00:00"));
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default DoctorSchedule;
