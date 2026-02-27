import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * DoctorConsultations — V4 design conservé + FIX workflow
 * -----------------------------------------------------------------------------
 * FIXES (demandés) :
 * 1) Menu "⋯" -> Annuler / No-show / etc : ne doit PLUS ouvrir la sidebar + confirm derrière
 *    - Anti "click-through" : ignoreNextRowClickRef (250ms) + stop pointerdown/select
 *    - openConfirm() ferme la sidebar AVANT d’ouvrir la confirmation (avec setTimeout 0)
 *
 * 2) Sidebar (Sheet) : scroll OK
 *    - SheetContent => overflow-y-auto + max-h-screen
 *
 * 3) Bouton "Actions" : UI/UX alignée avec la page Patients (même style)
 *    - Dialog avec barre de recherche + sections + footer
 *    - Recherche patient/heure/motif + actions contextualisées
 *
 * 4) Détails consultation : Historique de ce qui a été fait + aperçu documents générés
 *
 * Notes :
 * - CNAM retiré
 * - "En cours" section supprimée (scheduled + in_progress => "À venir")
 * - UI-only / backend-ready (toast + logs)
 */

import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  Eye,
  FileDown,
  FileText,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  Printer,
  Search,
  Stethoscope,
  User,
  X,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { toast } from "@/hooks/use-toast";
import { mockDoctorConsultations } from "@/data/mockData";
import { cn } from "@/lib/utils";

type ConsultFilter = "today" | "week" | "all";
type ConsultStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

type DoctorConsultationUI = (typeof mockDoctorConsultations)[number] & {
  status: ConsultStatus;
  email?: string;
  phone?: string;
};

type GeneratedDocKind = "rx" | "lab" | "report";
type GeneratedDoc = {
  id: string;
  kind: GeneratedDocKind;
  title: string;
  date: string;
  status: "Brouillon" | "Signé" | "Envoyé" | "En attente";
};

type LogItem = {
  id: string;
  at: string;
  label: string;
  meta?: string;
};

const TODAY = "20 Fév 2026";
const WEEK = ["20 Fév 2026", "18 Fév 2026", "17 Fév 2026", "15 Fév 2026"];

const statusMeta: Record<
  ConsultStatus,
  { label: string; badgeVariant: "default" | "secondary" | "destructive" | "outline"; dot: string }
> = {
  scheduled: { label: "À venir", badgeVariant: "secondary", dot: "bg-blue-500" },
  in_progress: { label: "En cours", badgeVariant: "default", dot: "bg-emerald-500" },
  completed: { label: "Terminée", badgeVariant: "outline", dot: "bg-muted-foreground" },
  cancelled: { label: "Annulée", badgeVariant: "destructive", dot: "bg-red-500" },
  no_show: { label: "No-show", badgeVariant: "destructive", dot: "bg-amber-500" },
};

const nowHHMM = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const toMailto = (email?: string) => (email ? `mailto:${email}` : "");
const toWhatsApp = (phone?: string) => {
  if (!phone) return "";
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};

const stopMenuEvent = (e: any) => {
  e?.preventDefault?.();
  e?.stopPropagation?.();
};

const StatPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border bg-card px-3 py-2 shadow-card">
    <div className="text-[11px] text-muted-foreground">{label}</div>
    <div className="text-sm font-semibold text-foreground">{value}</div>
  </div>
);

const StatusBadge = ({ status }: { status: ConsultStatus }) => (
  <Badge variant={statusMeta[status].badgeVariant} className="text-[11px]">
    <span className={cn("mr-1 inline-block h-2 w-2 rounded-full", statusMeta[status].dot)} />
    {statusMeta[status].label}
  </Badge>
);

const docIcon = (k: GeneratedDocKind) => {
  if (k === "rx") return <FileText className="h-4 w-4" />;
  if (k === "lab") return <ClipboardList className="h-4 w-4" />;
  return <FileDown className="h-4 w-4" />;
};

const buildGeneratedDocs = (c: DoctorConsultationUI): GeneratedDoc[] => {
  const base = String(c.id);
  const rxCount = Number(c.prescriptions || 0);
  const labsCount = c.id % 3 === 0 ? 2 : c.id % 2 === 0 ? 1 : 0;
  const hasReport = Boolean(c.notes) || c.status !== "scheduled";

  const docs: GeneratedDoc[] = [];

  for (let i = 0; i < rxCount; i++) {
    docs.push({
      id: `${base}-rx-${i + 1}`,
      kind: "rx",
      title: `Ordonnance ${i + 1}`,
      date: c.date,
      status: c.status === "completed" ? "Envoyé" : "Brouillon",
    });
  }

  for (let i = 0; i < labsCount; i++) {
    docs.push({
      id: `${base}-lab-${i + 1}`,
      kind: "lab",
      title: i === 0 ? "Demande analyses — Bilan sanguin" : "Demande analyses — HbA1c",
      date: c.date,
      status: c.status === "completed" ? "Envoyé" : "En attente",
    });
  }

  if (hasReport) {
    docs.push({
      id: `${base}-report-1`,
      kind: "report",
      title: "Compte-rendu de consultation (PDF)",
      date: c.date,
      status: c.status === "completed" ? "Signé" : "Brouillon",
    });
  }

  return docs;
};

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className={cn("text-xs", active ? "gradient-primary text-primary-foreground shadow-primary-glow" : "")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ConsultationSection({
  title,
  count,
  defaultOpen,
  emptyHint,
  children,
}: {
  title: string;
  count: number;
  defaultOpen: boolean;
  emptyHint: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-90 transition-opacity">
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition-transform", open ? "rotate-0" : "-rotate-90")}
            />
            {title}
            <span className="rounded-full border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">{count}</span>
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="mt-2 space-y-2">
        {count === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">{emptyHint}</div>
        ) : (
          children
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ConsultationRow({
  c,
  onOpen,
  onStart,
  onJoin,
  onStatus,
  markIgnoreNextRowClick,
}: {
  c: DoctorConsultationUI;
  onOpen: () => void;
  onStart: () => void;
  onJoin: () => void;
  onStatus: (s: ConsultStatus) => void;
  markIgnoreNextRowClick: () => void;
}) {
  const primary =
    c.status === "scheduled"
      ? { label: "Démarrer", icon: <Stethoscope className="mr-1 h-3.5 w-3.5" />, onClick: onStart }
      : c.status === "in_progress"
        ? { label: "Rejoindre", icon: <Stethoscope className="mr-1 h-3.5 w-3.5" />, onClick: onJoin }
        : { label: "Détails", icon: <User className="mr-1 h-3.5 w-3.5" />, onClick: onOpen };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all",
        c.status === "cancelled" || c.status === "no_show" ? "opacity-75" : "",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" ? onOpen() : null)}
        className="w-full text-left p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-[120px]">
            <div className="w-14">
              <div className="text-sm font-semibold text-foreground">{c.time}</div>
              <div className="text-[11px] text-muted-foreground">{c.date}</div>
            </div>
            <div className="hidden sm:flex flex-col items-start gap-1">
              <StatusBadge status={c.status} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {c.avatar}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{c.patient}</div>
                <div className="truncate text-xs text-muted-foreground">{c.motif}</div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:hidden">
              <StatusBadge status={c.status} />
              {c.prescriptions ? (
                <Badge variant="outline" className="text-[11px]">
                  {c.prescriptions} ordonnance(s)
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <div className="text-sm font-semibold text-foreground">{c.amount}</div>
              <div className="text-[11px] text-muted-foreground">{c.prescriptions ? `${c.prescriptions} Rx` : "—"}</div>
            </div>

            <div className="flex items-center gap-2" data-row-ignore="true">
              <Button
                size="sm"
                className={cn(
                  "text-xs",
                  c.status === "scheduled" || c.status === "in_progress"
                    ? "gradient-primary text-primary-foreground shadow-primary-glow"
                    : "bg-primary/10 text-primary hover:bg-primary/15",
                )}
                onPointerDown={() => markIgnoreNextRowClick()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  markIgnoreNextRowClick();
                  primary.onClick();
                }}
              >
                {primary.icon}
                {primary.label}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    data-row-ignore="true"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      markIgnoreNextRowClick();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markIgnoreNextRowClick();
                    }}
                    title="Actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>

                  <DropdownMenuItem
                    className="text-xs"
                    onPointerDown={() => markIgnoreNextRowClick()}
                    onSelect={(e) => {
                      stopMenuEvent(e);
                      markIgnoreNextRowClick();
                      toast({ title: "Imprimer", description: "UI mock — à brancher." });
                    }}
                  >
                    <Printer className="mr-2 h-3.5 w-3.5" />
                    Imprimer
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-xs"
                    onPointerDown={() => markIgnoreNextRowClick()}
                    onSelect={(e) => {
                      stopMenuEvent(e);
                      markIgnoreNextRowClick();
                      toast({ title: "Exporter PDF", description: "UI mock — à brancher." });
                    }}
                  >
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Exporter dossier (PDF)
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {c.status === "scheduled" ? (
                    <DropdownMenuItem
                      className="text-xs"
                      onPointerDown={() => markIgnoreNextRowClick()}
                      onSelect={(e) => {
                        stopMenuEvent(e);
                        markIgnoreNextRowClick();
                        onStatus("in_progress");
                      }}
                    >
                      <Stethoscope className="mr-2 h-3.5 w-3.5" />
                      Démarrer
                    </DropdownMenuItem>
                  ) : null}

                  {c.status !== "completed" ? (
                    <DropdownMenuItem
                      className="text-xs"
                      onPointerDown={() => markIgnoreNextRowClick()}
                      onSelect={(e) => {
                        stopMenuEvent(e);
                        markIgnoreNextRowClick();
                        onStatus("completed");
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                      Marquer terminée
                    </DropdownMenuItem>
                  ) : null}

                  <DropdownMenuItem
                    className="text-xs"
                    onPointerDown={() => markIgnoreNextRowClick()}
                    onSelect={(e) => {
                      stopMenuEvent(e);
                      markIgnoreNextRowClick();
                      onStatus("no_show");
                    }}
                  >
                    <XCircle className="mr-2 h-3.5 w-3.5" />
                    Marquer no-show
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-xs"
                    onPointerDown={() => markIgnoreNextRowClick()}
                    onSelect={(e) => {
                      stopMenuEvent(e);
                      markIgnoreNextRowClick();
                      onStatus("cancelled");
                    }}
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Annuler
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-xs"
                    onPointerDown={() => markIgnoreNextRowClick()}
                    onSelect={(e) => {
                      stopMenuEvent(e);
                      markIgnoreNextRowClick();
                      toast({ title: "Message", description: "UI mock — messagerie sécurisée." });
                    }}
                  >
                    <MessageSquare className="mr-2 h-3.5 w-3.5" />
                    Envoyer message
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-xs"
                    onPointerDown={() => markIgnoreNextRowClick()}
                    onSelect={(e) => {
                      stopMenuEvent(e);
                      markIgnoreNextRowClick();
                      toast({ title: "Email", description: "UI mock — à brancher." });
                    }}
                  >
                    <Mail className="mr-2 h-3.5 w-3.5" />
                    Contacter par email
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-xs"
                    onPointerDown={() => markIgnoreNextRowClick()}
                    onSelect={(e) => {
                      stopMenuEvent(e);
                      markIgnoreNextRowClick();
                      toast({ title: "Appeler", description: "UI mock — à brancher." });
                    }}
                  >
                    <Phone className="mr-2 h-3.5 w-3.5" />
                    Appeler
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <div className="px-2 py-2 text-[11px] font-semibold text-muted-foreground">{title}</div>;
}

function ActionLine({
  title,
  hint,
  icon,
  onClick,
  disabled,
}: {
  title: string;
  hint?: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-full rounded-xl px-3 py-2 text-left hover:bg-muted/30 transition flex items-center justify-between gap-2",
        disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "",
      )}
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground">
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{title}</div>
        </div>
      </div>
      {hint ? <div className="text-[11px] text-muted-foreground">{hint}</div> : null}
    </button>
  );
}

const DoctorConsultations = () => {
  const [filter, setFilter] = useState<ConsultFilter>("today");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConsultStatus | "all">("all");

  const [consultations, setConsultations] = useState<DoctorConsultationUI[]>(() => {
    const base = mockDoctorConsultations.map((c) => ({
      ...c,
      status: (c.status as ConsultStatus) || "completed",
      email: `${String(c.patient || "patient")
        .split(" ")[0]
        .toLowerCase()}@example.tn`,
      phone: "+216 22 345 678",
    }));

    const today = base.filter((c) => c.date === TODAY).sort((a, b) => a.time.localeCompare(b.time));
    if (today.length >= 2) {
      today[0].status = "scheduled";
      today[1].status = "in_progress";
    } else if (today.length === 1) {
      today[0].status = "scheduled";
    }

    return base.map((c) => today.find((t) => t.id === c.id) ?? c);
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [noteDraft, setNoteDraft] = useState("");
  const [activityLogs, setActivityLogs] = useState<Record<number, LogItem[]>>({});

  type ConfirmKind = "cancel" | "no_show" | "mark_done";
  const [confirm, setConfirm] = useState<{ open: boolean; kind: ConfirmKind; id: number | null }>({
    open: false,
    kind: "cancel",
    id: null,
  });

  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsQ, setActionsQ] = useState("");

  /**
   * Actions palette — contexte patient
   * - On peut chercher un patient => sélectionner => afficher actions contextualisées.
   * - On garde aussi le "selected" (consultation) pour actions consultation.
   */
  const [actionPatientKey, setActionPatientKey] = useState<string | null>(null);

  type ActionPatient = {
    key: string;
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
    /** ids de consultations liées (triées) */
    consultationIds: number[];
    /** prochaine consultation (à venir / en cours) */
    nextConsultationId?: number;
    /** dernière consultation (historique) */
    lastConsultationId?: number;
  };

  const patientsIndex = useMemo<ActionPatient[]>(() => {
    // On déduit les patients à partir des consultations (UI-only)
    const map = new Map<string, ActionPatient>();

    const byId = new Map<number, DoctorConsultationUI>();
    consultations.forEach((c) => byId.set(c.id, c));

    consultations.forEach((c) => {
      const key = String(c.patient || "").trim() || `patient-${c.id}`;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          key,
          name: String(c.patient || key),
          avatar: c.avatar,
          email: c.email,
          phone: c.phone,
          consultationIds: [c.id],
        });
      } else {
        existing.consultationIds.push(c.id);
        // garder une avatar si manquante
        if (!existing.avatar && c.avatar) existing.avatar = c.avatar;
        if (!existing.email && c.email) existing.email = c.email;
        if (!existing.phone && c.phone) existing.phone = c.phone;
      }
    });

    // enrichir next/last consultation
    const score = (c: DoctorConsultationUI) => `${c.date} ${c.time}`;

    const list = Array.from(map.values()).map((p) => {
      const cons = p.consultationIds.map((id) => byId.get(id)).filter(Boolean) as DoctorConsultationUI[];

      const upcoming = cons
        .filter((c) => c.status === "scheduled" || c.status === "in_progress")
        .sort((a, b) => score(a).localeCompare(score(b)));

      const history = cons
        .filter((c) => c.status === "completed" || c.status === "cancelled" || c.status === "no_show")
        .sort((a, b) => score(b).localeCompare(score(a)));

      return {
        ...p,
        consultationIds: cons.sort((a, b) => score(b).localeCompare(score(a))).map((c) => c.id),
        nextConsultationId: upcoming[0]?.id,
        lastConsultationId: history[0]?.id,
      };
    });

    // tri alpha
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [consultations]);

  const actionPatient = useMemo(() => {
    if (!actionPatientKey) return null;
    return patientsIndex.find((p) => p.key === actionPatientKey) ?? null;
  }, [actionPatientKey, patientsIndex]);

  const patientMatches = useMemo(() => {
    const qq = actionsQ.trim().toLowerCase();
    if (!qq) return patientsIndex.slice(0, 8);

    return patientsIndex
      .filter((p) => {
        const hay = `${p.name} ${p.email ?? ""} ${p.phone ?? ""}`.toLowerCase();
        return hay.includes(qq);
      })
      .slice(0, 10);
  }, [actionsQ, patientsIndex]);

  const patientConsultations = useMemo(() => {
    if (!actionPatient) return [];
    const map = new Map<number, DoctorConsultationUI>();
    consultations.forEach((c) => map.set(c.id, c));
    return actionPatient.consultationIds.map((id) => map.get(id)).filter(Boolean) as DoctorConsultationUI[];
  }, [actionPatient, consultations]);

  const ignoreNextRowClickRef = useRef(false);
  const markIgnoreNextRowClick = () => {
    ignoreNextRowClickRef.current = true;
    window.setTimeout(() => {
      ignoreNextRowClickRef.current = false;
    }, 250);
  };

  const selected = useMemo(() => consultations.find((c) => c.id === selectedId) ?? null, [consultations, selectedId]);

  const filtered = useMemo(() => {
    const byPeriod = consultations.filter((c) => {
      if (filter === "today") return c.date === TODAY;
      if (filter === "week") return WEEK.includes(c.date);
      return true;
    });

    const byStatus = byPeriod.filter((c) => (statusFilter === "all" ? true : c.status === statusFilter));

    const query = q.trim().toLowerCase();
    if (!query) return byStatus;

    return byStatus.filter((c) => `${c.patient} ${c.motif} ${c.date} ${c.time}`.toLowerCase().includes(query));
  }, [consultations, filter, q, statusFilter]);

  const groups = useMemo(() => {
    const upcoming = filtered
      .filter((c) => c.status === "scheduled" || c.status === "in_progress")
      .sort((a, b) => a.time.localeCompare(b.time));

    const historyAll = filtered
      .filter((c) => c.status === "completed" || c.status === "cancelled" || c.status === "no_show")
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

    return { upcoming, history: historyAll.slice(0, 8), historyAll };
  }, [filtered]);

  const isHistoryMode = statusFilter === "completed" || statusFilter === "cancelled" || statusFilter === "no_show";

  const todayAll = useMemo(() => consultations.filter((c) => c.date === TODAY), [consultations]);
  const todayDone = useMemo(() => todayAll.filter((c) => c.status === "completed").length, [todayAll]);
  const todayNoShow = useMemo(() => todayAll.filter((c) => c.status === "no_show").length, [todayAll]);
  const todayCount = todayAll.length;
  const todayCA = useMemo(() => {
    const sum = todayAll.reduce((acc, c) => {
      const v = parseInt(String(c.amount).replace(/[^\d]/g, ""), 10);
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);
    return `${sum} DT`;
  }, [todayAll]);

  const pushLog = (id: number, label: string, meta?: string) => {
    const item: LogItem = {
      id: `${id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: nowHHMM(),
      label,
      meta,
    };

    setActivityLogs((prev) => {
      const list = prev[id] ?? [];
      return { ...prev, [id]: [item, ...list] };
    });
  };

  const applyStatus = (id: number, next: ConsultStatus) => {
    setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)));
    pushLog(id, "Statut modifié", statusMeta[next].label);
  };

  const openDetails = (id: number) => {
    if (ignoreNextRowClickRef.current) return;

    setActionsOpen(false);
    setSelectedId(id);
    setDetailsOpen(true);

    const c = consultations.find((x) => x.id === id);
    setNoteDraft(c?.notes || "");
    pushLog(id, "Ouverture détails");
  };

  const closeConfirm = () => setConfirm((p) => ({ ...p, open: false, id: null }));

  const openConfirm = (kind: ConfirmKind, id: number) => {
    markIgnoreNextRowClick();
    setSelectedId(id);
    setDetailsOpen(false);

    window.setTimeout(() => {
      setConfirm({ open: true, kind, id });
    }, 0);
  };

  const handleConfirm = () => {
    if (!confirm.open || confirm.id == null) return;
    const id = confirm.id;

    if (confirm.kind === "cancel") applyStatus(id, "cancelled");
    if (confirm.kind === "no_show") applyStatus(id, "no_show");
    if (confirm.kind === "mark_done") applyStatus(id, "completed");

    closeConfirm();
  };

  const startConsultation = (id: number) => {
    applyStatus(id, "in_progress");
    toast({ title: "Consultation démarrée", description: "Statut passé en “En cours” (mock)." });
  };

  const joinConsultation = (id: number) => {
    toast({ title: "Rejoindre", description: "UI-only (visio/salle à brancher plus tard)." });
    pushLog(id, "Rejoindre la consultation");
  };

  const quickAction = (id: number | null, action: string) => {
    toast({ title: action, description: "Workflow UI prêt à brancher (backend plus tard)." });
    if (id != null) pushLog(id, action);
  };

  const saveNote = (id: number) => {
    setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, notes: noteDraft } : c)));
    pushLog(id, "Note enregistrée");
    toast({ title: "Note enregistrée", description: "Mock — à brancher au dossier patient." });
  };

  const requestStatusChange = (id: number, next: ConsultStatus) => {
    if (next === "cancelled") return openConfirm("cancel", id);
    if (next === "no_show") return openConfirm("no_show", id);
    if (next === "completed") return openConfirm("mark_done", id);
    if (next === "in_progress") return startConsultation(id);
    return applyStatus(id, next);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && isK) {
        e.preventDefault();
        setActionsOpen(true);
      }
      if (e.key === "Escape") setActionsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const generatedDocs = useMemo(() => (selected ? buildGeneratedDocs(selected) : []), [selected]);

  const historySystem = useMemo<LogItem[]>(() => {
    if (!selected) return [];
    const baseId = selected.id;

    const system: LogItem[] = [
      { id: `${baseId}-sys-1`, at: selected.time, label: "Rendez-vous planifié", meta: selected.date },
      { id: `${baseId}-sys-status`, at: selected.time, label: "Statut", meta: statusMeta[selected.status].label },
    ];

    if (selected.prescriptions) {
      system.push({
        id: `${baseId}-sys-rx`,
        at: selected.time,
        label: "Ordonnance(s) associée(s)",
        meta: `${selected.prescriptions} Rx`,
      });
    }

    if (selected.notes) {
      system.push({
        id: `${baseId}-sys-note`,
        at: selected.time,
        label: "Note clinique",
        meta: "Une note est enregistrée",
      });
    }

    return system;
  }, [selected]);

  const historyUI = useMemo(() => {
    if (!selected) return [];
    return activityLogs[selected.id] ?? [];
  }, [activityLogs, selected]);

  const combinedHistory = useMemo(() => [...historyUI, ...historySystem], [historyUI, historySystem]);

  const actionMatches = useMemo(() => {
    const qq = actionsQ.trim().toLowerCase();
    if (!qq) return filtered.slice(0, 8);
    return filtered
      .filter((c) => `${c.patient} ${c.motif} ${c.date} ${c.time}`.toLowerCase().includes(qq))
      .slice(0, 12);
  }, [actionsQ, filtered]);

  const selectionLabel = selected ? `${selected.patient} • ${selected.date} ${selected.time}` : "Aucune sélection";

  return (
    <DashboardLayout role="doctor" title="Consultations">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-bold text-foreground">Consultations</div>
            <div className="text-sm text-muted-foreground">
              Historique + gestion des rendez-vous • aperçu des ordonnances, analyses et documents
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => quickAction(null, "Nouvelle consultation (UI)")}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Nouvelle
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setActionsOpen(true)}
              title="Ctrl/Cmd + K"
            >
              <Search className="mr-1 h-3.5 w-3.5" />
              Actions
            </Button>

            <Button variant="outline" size="sm" className="text-xs" onClick={() => quickAction(null, "Export (UI)")}>
              <Download className="mr-1 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatPill label="Aujourd’hui" value={`${todayCount} RDV`} />
          <StatPill label="Terminées" value={`${todayDone}/${todayCount}`} />
          <StatPill label="No-show" value={`${todayNoShow}`} />
          <StatPill label="CA jour" value={todayCA} />
        </div>

        <div className="rounded-2xl border bg-card shadow-card p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <FilterPill active={filter === "today"} onClick={() => setFilter("today")}>
                Aujourd’hui
              </FilterPill>
              <FilterPill active={filter === "week"} onClick={() => setFilter("week")}>
                7 jours
              </FilterPill>
              <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
                Tout
              </FilterPill>

              <Separator orientation="vertical" className="hidden lg:block h-6 mx-2" />

              <div className="hidden lg:flex items-center gap-2">
                <FilterPill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                  Tous
                </FilterPill>
                <FilterPill active={statusFilter === "scheduled"} onClick={() => setStatusFilter("scheduled")}>
                  À venir
                </FilterPill>
                <FilterPill active={statusFilter === "in_progress"} onClick={() => setStatusFilter("in_progress")}>
                  En cours
                </FilterPill>
                <FilterPill active={statusFilter === "completed"} onClick={() => setStatusFilter("completed")}>
                  Terminées
                </FilterPill>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-2 lg:justify-end">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher patient, motif, date..."
                  className="h-9 pl-9 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-2 flex lg:hidden items-center gap-2">
            <FilterPill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
              Tous
            </FilterPill>
            <FilterPill active={statusFilter === "scheduled"} onClick={() => setStatusFilter("scheduled")}>
              À venir
            </FilterPill>
            <FilterPill active={statusFilter === "in_progress"} onClick={() => setStatusFilter("in_progress")}>
              En cours
            </FilterPill>
            <FilterPill active={statusFilter === "completed"} onClick={() => setStatusFilter("completed")}>
              Terminées
            </FilterPill>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Aucune consultation pour cette période</p>
          </div>
        ) : (
          <div className="space-y-3">
            {!isHistoryMode ? (
              <>
                <ConsultationSection
                  title="À venir"
                  count={groups.upcoming.length}
                  defaultOpen
                  emptyHint="Aucune consultation à venir."
                >
                  {groups.upcoming.map((c) => (
                    <ConsultationRow
                      key={c.id}
                      c={c}
                      onOpen={() => openDetails(c.id)}
                      onStart={() => startConsultation(c.id)}
                      onJoin={() => joinConsultation(c.id)}
                      onStatus={(s) => requestStatusChange(c.id, s)}
                      markIgnoreNextRowClick={markIgnoreNextRowClick}
                    />
                  ))}
                </ConsultationSection>

                <div className="rounded-xl border bg-card shadow-card">
                  <div className="flex items-start justify-between gap-2 px-4 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">Historique récent</div>
                      <div className="text-xs text-muted-foreground">
                        Terminées, annulées, no-show • utilisez le filtre <span className="font-medium">Statut</span>{" "}
                        pour afficher tout l’historique.
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[11px]">
                      {groups.historyAll.length}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="p-3 sm:p-4 space-y-2">
                    {groups.history.length === 0 ? (
                      <div className="text-xs text-muted-foreground">Aucun élément d’historique sur cette période.</div>
                    ) : (
                      groups.history.map((c) => (
                        <ConsultationRow
                          key={c.id}
                          c={c}
                          onOpen={() => openDetails(c.id)}
                          onStart={() => startConsultation(c.id)}
                          onJoin={() => joinConsultation(c.id)}
                          onStatus={(s) => requestStatusChange(c.id, s)}
                          markIgnoreNextRowClick={markIgnoreNextRowClick}
                        />
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border bg-card shadow-card">
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Historique</div>
                    <div className="text-xs text-muted-foreground">Résultats filtrés par statut.</div>
                  </div>
                  <Badge variant="secondary" className="text-[11px]">
                    {groups.historyAll.length}
                  </Badge>
                </div>
                <Separator />
                <div className="p-3 sm:p-4 space-y-2">
                  {groups.historyAll.map((c) => (
                    <ConsultationRow
                      key={c.id}
                      c={c}
                      onOpen={() => openDetails(c.id)}
                      onStart={() => startConsultation(c.id)}
                      onJoin={() => joinConsultation(c.id)}
                      onStatus={(s) => requestStatusChange(c.id, s)}
                      markIgnoreNextRowClick={markIgnoreNextRowClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto max-h-screen">
            {selected ? (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {selected.avatar}
                      </span>
                      <span className="leading-tight">
                        <span className="block text-base">{selected.patient}</span>
                        <span className="block text-xs text-muted-foreground">
                          {selected.date} • {selected.time}
                        </span>
                      </span>
                    </span>
                    <StatusBadge status={selected.status} />
                  </SheetTitle>

                  <SheetDescription className="text-xs">
                    {selected.motif}
                    {selected.prescriptions ? ` • ${selected.prescriptions} ordonnance(s)` : ""}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4 pb-6">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-foreground">Note de consultation</div>
                    <div className="rounded-xl border bg-card p-3 space-y-2">
                      <Textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Synthèse, recommandations, conduite à tenir…"
                        className="min-h-[90px]"
                      />
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => saveNote(selected.id)}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-foreground">Documents générés</div>
                      <Badge variant="secondary" className="text-[11px]">
                        {generatedDocs.length}
                      </Badge>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-2">
                      {generatedDocs.length === 0 ? (
                        <div className="text-xs text-muted-foreground">Aucun document pour le moment.</div>
                      ) : (
                        generatedDocs.map((d) => (
                          <div key={d.id} className="rounded-lg border bg-background p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 min-w-0">
                                <div className="mt-0.5 text-muted-foreground">{docIcon(d.kind)}</div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-foreground truncate">{d.title}</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {d.date} • {d.status}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => quickAction(selected.id, `Aperçu: ${d.title}`)}
                                >
                                  <Eye className="mr-1 h-3.5 w-3.5" />
                                  Aperçu
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => quickAction(selected.id, `Télécharger: ${d.title}`)}
                                >
                                  <Download className="mr-1 h-3.5 w-3.5" />
                                  Télécharger
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-foreground">Historique de la consultation</div>
                      <Badge variant="secondary" className="text-[11px]">
                        {combinedHistory.length}
                      </Badge>
                    </div>

                    <div className="rounded-xl border bg-card p-3 space-y-2">
                      {combinedHistory.length === 0 ? (
                        <div className="text-xs text-muted-foreground">Aucun événement.</div>
                      ) : (
                        combinedHistory.slice(0, 18).map((e) => (
                          <div
                            key={e.id}
                            className="flex items-start justify-between gap-2 rounded-lg border bg-background p-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground">{e.label}</div>
                              {e.meta ? <div className="text-[11px] text-muted-foreground">{e.meta}</div> : null}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                              <Clock className="h-3.5 w-3.5" />
                              {e.at}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <SheetFooter className="mt-4">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setDetailsOpen(false)}>
                    Fermer
                  </Button>
                </SheetFooter>
              </>
            ) : null}
          </SheetContent>
        </Sheet>

        <AlertDialog open={confirm.open} onOpenChange={(open) => (!open ? closeConfirm() : null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer</AlertDialogTitle>
              <AlertDialogDescription>
                {confirm.id != null && (
                  <span className="block mb-2 text-xs text-muted-foreground">
                    {consultations.find((c) => c.id === confirm.id)?.patient} •{" "}
                    {consultations.find((c) => c.id === confirm.id)?.date}{" "}
                    {consultations.find((c) => c.id === confirm.id)?.time}
                  </span>
                )}
                {confirm.kind === "cancel"
                  ? "Annuler cette consultation ?"
                  : confirm.kind === "no_show"
                    ? "Marquer en no-show ?"
                    : "Marquer comme terminée ?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Retour</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog
          open={actionsOpen}
          onOpenChange={(open) => {
            setActionsOpen(open);
            // Quand on ferme Actions, on ne garde pas un patient "collé" sauf si tu veux.
            if (!open) {
              setActionsQ("");
              setActionPatientKey(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            {/* Header (même style que Patients) */}
            <div className="p-3 border-b bg-card">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={actionsQ}
                    onChange={(e) => setActionsQ(e.target.value)}
                    onKeyDown={(e) => {
                      // UX : Entrée sur un patient => contexte patient
                      if (e.key === "Enter" && !actionPatient && patientMatches[0]) {
                        setActionPatientKey(patientMatches[0].key);
                      }
                    }}
                    placeholder="Rechercher un patient ou une action… (ex : Amine, WhatsApp, export)"
                    className="h-10 pl-9 text-sm"
                    autoFocus
                  />
                </div>
                <span className="rounded-md border bg-background px-2 py-1 text-[11px] text-muted-foreground">
                  Ctrl+K
                </span>
              </div>

              <div className="mt-2 text-[11px] text-muted-foreground">
                Astuce : tape un <span className="font-medium">patient</span> → Entrée pour le sélectionner → actions
                contextualisées.
              </div>

              {/* Contexte patient */}
              {actionPatient ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[11px]">
                    Patient : {actionPatient.name}
                  </Badge>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setActionPatientKey(null)}>
                    Changer
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="max-h-[520px] overflow-auto p-2">
              {/* Si pas de patient sélectionné, on propose d'abord des patients */}
              {!actionPatient ? (
                <>
                  <SectionTitle title="Patients" />
                  {patientMatches.length === 0 ? (
                    <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                      Aucun patient trouvé.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {patientMatches.map((p) => (
                        <button
                          key={`pat-${p.key}`}
                          className="w-full rounded-xl px-3 py-2 text-left hover:bg-muted/30 transition flex items-center justify-between gap-2"
                          onClick={() => setActionPatientKey(p.key)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                              {p.avatar ??
                                p.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((x) => x[0])
                                  .join("")
                                  .toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">{p.name}</div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {p.phone ?? "—"} {p.email ? `• ${p.email}` : ""}
                              </div>
                            </div>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            Actions <ArrowRight className="h-4 w-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <Separator className="my-2" />

                  <SectionTitle title="Global" />
                  <ActionLine
                    title="Nouvelle consultation"
                    hint="Créer une fiche"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(null, "Nouvelle consultation (UI)");
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Exporter PDF"
                    hint="Liste filtrée"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(null, "Exporter (UI)");
                      setActionsOpen(false);
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Actions contextualisées patient */}
                  <SectionTitle title="Patient" />
                  <ActionLine
                    title="Voir dossier patient"
                    hint="UI-only"
                    icon={<User className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Dossier patient: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Envoyer message"
                    hint="Messagerie"
                    icon={<MessageSquare className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Message patient: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Contacter par email"
                    hint="mailto"
                    icon={<Mail className="h-4 w-4" />}
                    disabled={!actionPatient.email}
                    onClick={() => {
                      if (actionPatient.email) window.location.href = toMailto(actionPatient.email);
                      quickAction(selectedId ?? null, `Email patient: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Contacter WhatsApp"
                    hint="wa.me"
                    icon={<MessageSquare className="h-4 w-4" />}
                    disabled={!actionPatient.phone}
                    onClick={() => {
                      const url = toWhatsApp(actionPatient.phone);
                      if (url) window.open(url, "_blank");
                      quickAction(selectedId ?? null, `WhatsApp patient: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Appeler"
                    hint="Téléphone"
                    icon={<Phone className="h-4 w-4" />}
                    disabled={!actionPatient.phone}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Appel patient: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />

                  <Separator className="my-2" />

                  <SectionTitle title="Créer (pour ce patient)" />
                  <ActionLine
                    title="Créer une consultation"
                    hint="UI-only"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Créer consultation: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Créer une ordonnance"
                    hint="UI-only"
                    icon={<FileText className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Créer ordonnance: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Créer une demande d'analyses"
                    hint="UI-only"
                    icon={<ClipboardList className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Créer demande analyses: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Générer un document (CR / Certificat)"
                    hint="UI-only"
                    icon={<FileDown className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Générer document: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />

                  <Separator className="my-2" />

                  <SectionTitle title="Consultations du patient" />
                  {patientConsultations.length === 0 ? (
                    <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                      Aucune consultation trouvée pour ce patient.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {patientConsultations.slice(0, 8).map((c) => (
                        <button
                          key={`pc-${c.id}`}
                          className="w-full rounded-xl border bg-background px-3 py-2 text-left hover:bg-muted/30 transition"
                          onClick={() => {
                            // Ouvre directement le détail consultation
                            setActionPatientKey(null);
                            openDetails(c.id);
                            setActionsOpen(false);
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">
                                {c.date} • {c.time}
                              </div>
                              <div className="truncate text-[11px] text-muted-foreground">{c.motif}</div>
                            </div>
                            <StatusBadge status={c.status} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <Separator className="my-2" />

                  <SectionTitle title="Dossier (exports)" />
                  <ActionLine
                    title="Exporter dossier patient (PDF)"
                    hint="UI-only"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Exporter dossier patient: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                  <ActionLine
                    title="Imprimer dossier patient"
                    hint="UI-only"
                    icon={<Printer className="h-4 w-4" />}
                    onClick={() => {
                      quickAction(selectedId ?? null, `Imprimer dossier patient: ${actionPatient.name}`);
                      setActionsOpen(false);
                    }}
                  />
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
              <span>↑↓ naviguer • Entrée lancer • Esc fermer</span>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setActionsOpen(false)}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConsultations;
