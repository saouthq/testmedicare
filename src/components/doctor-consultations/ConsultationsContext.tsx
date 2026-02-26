import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Calendar, CheckCircle2, ChevronDown, ClipboardList, Clock, Download,
  Pencil, Printer, Search, Stethoscope, X,
} from "lucide-react";
import { mockDoctorConsultations } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { parseFrDate, parseTimeToMinutes } from "@/components/consultation/helpers";

// ── Types ────────────────────────────────────────────────────

type Consultation = (typeof mockDoctorConsultations)[number];
export type ConsultFilter = "today" | "week" | "all";
export type ConsultStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

export type ConsultUi = Consultation & {
  status: ConsultStatus;
  closed?: boolean;
};

export type CloseFormState = {
  diagnosis: string;
  notes: string;
  prescriptions: { medication: string; dosage: string }[];
  analyses: string[];
  nextRdv: string;
  amount: string;
};

// ── Status badge helper ──────────────────────────────────────

export const statusBadge = (status: ConsultStatus) => {
  switch (status) {
    case "scheduled": return { label: "À venir", variant: "secondary" as const };
    case "in_progress": return { label: "En cours", variant: "default" as const };
    case "completed": return { label: "Terminée", variant: "outline" as const };
    case "cancelled": return { label: "Annulée", variant: "destructive" as const };
    case "no_show": return { label: "No-show", variant: "destructive" as const };
    default: return { label: "—", variant: "secondary" as const };
  }
};

// ── Context shape ────────────────────────────────────────────

interface ConsultationsCtx {
  // Filters
  range: ConsultFilter;
  setRange: (v: ConsultFilter) => void;
  statusFilter: "all" | ConsultStatus;
  setStatusFilter: (v: "all" | ConsultStatus) => void;
  q: string;
  setQ: (v: string) => void;

  // Data
  consultations: ConsultUi[];
  filtered: ConsultUi[];
  grouped: [string, ConsultUi[]][];
  stats: {
    todayCount: number; todayDone: number; todayInProgress: number;
    todayScheduled: number; todayNoShow: number; todayCa: number;
    rangeCount: number; rangeCa: number;
  };

  // UI
  expandedId: number | null;
  setExpandedId: (v: number | null) => void;

  // Actions palette
  actionsOpen: boolean;
  setActionsOpen: (v: boolean) => void;
  actionsQ: string;
  setActionsQ: (v: string) => void;
  actionsIdx: number;
  setActionsIdx: React.Dispatch<React.SetStateAction<number>>;
  actionsInputRef: React.RefObject<HTMLInputElement | null>;
  actionsItems: Array<{ key: string; label: string; hint?: string; icon: ReactNode; run: () => void; disabled?: boolean }>;

  // Close workflow
  closeOpen: boolean;
  setCloseOpen: (v: boolean) => void;
  closingId: number | null;
  closeStep: 1 | 2 | 3;
  setCloseStep: (v: 1 | 2 | 3) => void;
  closeForm: CloseFormState;
  setCloseForm: React.Dispatch<React.SetStateAction<CloseFormState>>;
  openClose: (c: ConsultUi) => void;
  confirmClose: () => void;

  // Reschedule workflow
  reschedOpen: boolean;
  setReschedOpen: (v: boolean) => void;
  reschedDate: string;
  setReschedDate: (v: string) => void;
  reschedTime: string;
  setReschedTime: (v: string) => void;
  openReschedule: (c: ConsultUi) => void;
  confirmReschedule: () => void;

  // Status mutations
  setStatus: (id: number, status: ConsultStatus) => void;
  consultLabel: (c: ConsultUi) => string;
  copy: (label: string, value: string) => Promise<void>;
}

const Ctx = createContext<ConsultationsCtx | null>(null);
export const useConsultations = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConsultations must be used within ConsultationsProvider");
  return ctx;
};

// ── Provider ─────────────────────────────────────────────────

export function ConsultationsProvider({ children }: { children: ReactNode }) {
  // Filters
  const [range, setRange] = useState<ConsultFilter>("today");
  const [statusFilter, setStatusFilter] = useState<"all" | ConsultStatus>("all");
  const [q, setQ] = useState("");

  // UI
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Actions palette
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsQ, setActionsQ] = useState("");
  const [actionsIdx, setActionsIdx] = useState(0);
  const actionsInputRef = useRef<HTMLInputElement | null>(null);

  // Close workflow
  const [closeOpen, setCloseOpen] = useState(false);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [closeStep, setCloseStep] = useState<1 | 2 | 3>(1);
  const [closeForm, setCloseForm] = useState<CloseFormState>({
    diagnosis: "", notes: "", prescriptions: [{ medication: "", dosage: "" }],
    analyses: [""], nextRdv: "", amount: "",
  });

  // Reschedule workflow
  const [reschedOpen, setReschedOpen] = useState(false);
  const [reschedId, setReschedId] = useState<number | null>(null);
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");

  // Data
  const [consultations, setConsultations] = useState<ConsultUi[]>(
    mockDoctorConsultations.map((c) => ({
      ...c,
      status: (c.status as ConsultStatus) ?? "completed",
      closed: (c as any).closed ?? c.status === "completed",
    })),
  );

  const anchorToday = "20 Fév 2026";
  const anchorTs = useMemo(() => parseFrDate(anchorToday), []);

  const byRange = useMemo(() => {
    return consultations.filter((c) => {
      const ts = parseFrDate(c.date);
      if (range === "today") return c.date === anchorToday;
      if (range === "week") return ts >= anchorTs - 6 * 24 * 3600 * 1000 && ts <= anchorTs;
      return true;
    });
  }, [consultations, range, anchorTs]);

  const filtered = useMemo(() => {
    const qv = q.trim().toLowerCase();
    return byRange
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) => (!qv ? true : `${c.patient} ${c.motif} ${c.date} ${c.time}`.toLowerCase().includes(qv)))
      .sort((a, b) => {
        const d = parseFrDate(b.date) - parseFrDate(a.date);
        if (d !== 0) return d;
        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
      });
  }, [byRange, q, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, ConsultUi[]>();
    for (const c of filtered) {
      if (!map.has(c.date)) map.set(c.date, []);
      map.get(c.date)!.push(c);
    }
    return Array.from(map.entries()).sort((a, b) => parseFrDate(b[0]) - parseFrDate(a[0]));
  }, [filtered]);

  const stats = useMemo(() => {
    const today = consultations.filter((c) => c.date === anchorToday);
    const sumDt = (list: ConsultUi[]) =>
      list.reduce((acc, c) => acc + Number(String(c.amount).replace(/[^\d.]/g, "") || 0), 0);
    return {
      todayCount: today.length,
      todayDone: today.filter((c) => c.status === "completed").length,
      todayInProgress: today.filter((c) => c.status === "in_progress").length,
      todayScheduled: today.filter((c) => c.status === "scheduled").length,
      todayNoShow: today.filter((c) => c.status === "no_show").length,
      todayCa: sumDt(today.filter((c) => c.status === "completed")),
      rangeCount: byRange.length,
      rangeCa: sumDt(byRange.filter((c) => c.status === "completed")),
    };
  }, [byRange, consultations]);

  // ── Actions ──

  const consultLabel = (c: ConsultUi) => `${c.patient} · ${c.date} à ${c.time}`;

  const setStatus = (id: number, status: ConsultStatus) => {
    setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, status } as ConsultUi : c)));
  };

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copié", description: `${label} copié dans le presse-papiers.` });
    } catch {
      toast({ title: "Copie", description: "Impossible de copier (permissions navigateur)." });
    }
  };

  const openClose = (c: ConsultUi) => {
    setClosingId(c.id);
    setCloseStep(1);
    setCloseForm({
      diagnosis: "", notes: c.notes || "",
      prescriptions: [{ medication: "", dosage: "" }], analyses: [""],
      nextRdv: "15 jours", amount: String(c.amount).replace(/[^\d.]/g, ""),
    });
    setCloseOpen(true);
  };

  const confirmClose = () => {
    if (!closingId) return;
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === closingId
          ? { ...c, closed: true, status: "completed", notes: closeForm.notes || c.notes, amount: `${closeForm.amount || String(c.amount).replace(/[^\d.]/g, "")} DT` } as ConsultUi
          : c,
      ),
    );
    toast({ title: "Consultation clôturée", description: "La clôture a été enregistrée (mock)." });
    setCloseOpen(false);
    setExpandedId(null);
  };

  const openReschedule = (c: ConsultUi) => {
    setReschedId(c.id);
    setReschedDate(c.date);
    setReschedTime(c.time);
    setReschedOpen(true);
  };

  const confirmReschedule = () => {
    if (!reschedId) return;
    if (!reschedDate.trim() || !reschedTime.trim()) {
      toast({ title: "Reprogrammer", description: "Renseigne une date et une heure." });
      return;
    }
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === reschedId
          ? { ...c, date: reschedDate.trim(), time: reschedTime.trim(), status: c.status === "completed" ? "completed" : "scheduled" } as ConsultUi
          : c,
      ),
    );
    toast({ title: "RDV reprogrammé", description: "RDV mis à jour (mock)." });
    setReschedOpen(false);
  };

  // ── Palette keyboard ──

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActionsOpen(true);
        setActionsQ("");
        setActionsIdx(0);
        setTimeout(() => actionsInputRef.current?.focus(), 0);
      }
      if (!actionsOpen) return;
      if (e.key === "Escape") { e.preventDefault(); setActionsOpen(false); }
      if (e.key === "ArrowDown") { e.preventDefault(); setActionsIdx((v) => v + 1); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActionsIdx((v) => Math.max(0, v - 1)); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actionsOpen]);

  // ── Palette items ──

  const actionsItems = useMemo(() => {
    const qv = actionsQ.trim().toLowerCase();
    const global = [
      { key: "new", label: "Nouvelle consultation", hint: "Créer un RDV (mock)", icon: <Stethoscope className="h-3.5 w-3.5" />, run: () => toast({ title: "Nouvelle consultation", description: "Flow à brancher." }) },
      { key: "export-day", label: "Exporter la journée (CSV)", hint: "À brancher", icon: <Download className="h-3.5 w-3.5" />, run: () => toast({ title: "Export CSV", description: "Export à brancher." }) },
      { key: "print-day", label: "Imprimer la journée", hint: "À brancher", icon: <Printer className="h-3.5 w-3.5" />, run: () => toast({ title: "Impression", description: "Impression à brancher." }) },
      { key: "filter-today", label: "Filtrer : Aujourd'hui", hint: "Range = today", icon: <Clock className="h-3.5 w-3.5" />, run: () => setRange("today") },
      { key: "filter-week", label: "Filtrer : Cette semaine", hint: "Range = week", icon: <Calendar className="h-3.5 w-3.5" />, run: () => setRange("week") },
      { key: "filter-all", label: "Filtrer : Tout", hint: "Range = all", icon: <ClipboardList className="h-3.5 w-3.5" />, run: () => setRange("all") },
    ];

    const matches = consultations
      .filter((c) => qv && `${c.patient} ${c.motif} ${c.date} ${c.time}`.toLowerCase().includes(qv))
      .sort((a, b) => parseFrDate(b.date) - parseFrDate(a.date) || parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))
      .slice(0, 4);

    const contextual = matches.flatMap((c) => {
      const base = `${c.patient} — ${c.date} ${c.time}`;
      const isDone = c.status === "completed";
      const isCancelled = c.status === "cancelled" || c.status === "no_show";
      return [
        { key: `open-${c.id}`, label: `Ouvrir : ${base}`, hint: "Déplier la carte", icon: <ChevronDown className="h-3.5 w-3.5" />, run: () => { setExpandedId(c.id); setActionsOpen(false); } },
        { key: `start-${c.id}`, label: `Démarrer : ${base}`, hint: isDone ? "Déjà terminée" : isCancelled ? "Annulée" : "Mettre en cours", icon: <Stethoscope className="h-3.5 w-3.5" />, disabled: isDone || isCancelled, run: () => { setStatus(c.id, "in_progress"); toast({ title: "Consultation en cours", description: base }); setActionsOpen(false); } },
        { key: `close-${c.id}`, label: `Clôturer : ${base}`, hint: isDone ? "Déjà clôturée" : "Ouvrir la feuille", icon: <CheckCircle2 className="h-3.5 w-3.5" />, disabled: isDone || isCancelled, run: () => { openClose(c); setActionsOpen(false); } },
        { key: `resched-${c.id}`, label: `Reprogrammer : ${base}`, hint: "Changer date/heure", icon: <Pencil className="h-3.5 w-3.5" />, disabled: isDone, run: () => { openReschedule(c); setActionsOpen(false); } },
        { key: `print-${c.id}`, label: `Imprimer CR : ${base}`, hint: "À brancher", icon: <Printer className="h-3.5 w-3.5" />, run: () => { toast({ title: "Imprimer CR", description: base }); setActionsOpen(false); } },
        { key: `export-${c.id}`, label: `Exporter PDF : ${base}`, hint: "À brancher", icon: <Download className="h-3.5 w-3.5" />, run: () => { toast({ title: "Exporter PDF", description: base }); setActionsOpen(false); } },
      ];
    });

    const all = [...global, ...contextual].filter((it) => !qv || `${it.label} ${it.hint}`.toLowerCase().includes(qv));
    return all.slice(0, 12);
  }, [actionsQ, consultations]);

  // Normalize index
  useEffect(() => {
    if (!actionsOpen) return;
    setActionsIdx((i) => Math.min(i, Math.max(0, actionsItems.length - 1)));
  }, [actionsOpen, actionsItems.length]);

  // Enter triggers action
  useEffect(() => {
    if (!actionsOpen) return;
    const onEnter = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !actionsOpen) return;
      const item = actionsItems[actionsIdx];
      if (!item || (item as any).disabled) return;
      item.run();
    };
    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, [actionsOpen, actionsIdx, actionsItems]);

  const value: ConsultationsCtx = {
    range, setRange, statusFilter, setStatusFilter, q, setQ,
    consultations, filtered, grouped, stats,
    expandedId, setExpandedId,
    actionsOpen, setActionsOpen, actionsQ, setActionsQ, actionsIdx, setActionsIdx,
    actionsInputRef, actionsItems,
    closeOpen, setCloseOpen, closingId, closeStep, setCloseStep, closeForm, setCloseForm,
    openClose, confirmClose,
    reschedOpen, setReschedOpen, reschedDate, setReschedDate, reschedTime, setReschedTime,
    openReschedule, confirmReschedule,
    setStatus, consultLabel, copy,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
