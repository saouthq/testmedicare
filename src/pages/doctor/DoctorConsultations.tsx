import DashboardLayout from "@/components/layout/DashboardLayout";
/**
 * DoctorConsultations.tsx
 * Page "Consultations" — UI Doctolib-like, prête à brancher (workflows intra-page).
 *
 * Objectifs :
 * - Barre d'actions sticky (recherche + filtres + actions)
 * - Palette "Actions" (Ctrl/Cmd+K) : recherche patient/motif → actions contextualisées
 * - Workflows utiles sans navigation inter-page : démarrer / clôturer / reprogrammer / annuler / no-show / imprimer / exporter
 *
 * ⚠️ Backend : volontairement non branché. Les actions "print/export" sont des placeholders (toast).
 * Tu pourras connecter API/Supabase plus tard sans changer l’UI.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Download,
  FileText,
  MoreVertical,
  Pencil,
  Printer,
  Search,
  Send,
  Stethoscope,
  User,
  X,
} from "lucide-react";

import { mockDoctorConsultations } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Consultation = (typeof mockDoctorConsultations)[number];
type ConsultFilter = "today" | "week" | "all";

/**
 * Statuts (UI-only).
 * Le mock contient surtout "completed", mais on gère aussi scheduled/in_progress/cancelled/no_show pour le workflow.
 */
type ConsultStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

type ConsultUi = Consultation & {
  /** statut manipulable côté UI */
  status: ConsultStatus;
  /** indiquant si la consultation est clôturée (redondant avec status=completed, mais pratique) */
  closed?: boolean;
};

type CloseFormState = {
  diagnosis: string;
  notes: string;
  prescriptions: { medication: string; dosage: string }[];
  analyses: string[];
  nextRdv: string;
  amount: string;
};

/** Parsing "20 Fév 2026" (format mock) -> timestamp pour filtres/tri stables. */
const parseFrDate = (value: string | null): number => {
  if (!value) return 0;

  const parts = value.trim().split(/\s+/);
  if (parts.length < 3) return 0;

  const day = Number(parts[0]);
  const monRaw = parts[1].toLowerCase();
  const year = Number(parts[2]);

  const monthMap: Record<string, number> = {
    jan: 0,
    janv: 0,
    fev: 1,
    fév: 1,
    fevr: 1,
    févr: 1,
    mar: 2,
    mars: 2,
    avr: 3,
    avril: 3,
    mai: 4,
    jun: 5,
    juin: 5,
    jul: 6,
    juil: 6,
    aou: 7,
    août: 7,
    sep: 8,
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11,
    déc: 11,
  };

  const key = monRaw.replace(".", "");
  const month = monthMap[key] ?? monthMap[key.slice(0, 3)] ?? 0;

  const d = new Date(year, month, Number.isFinite(day) ? day : 1);
  return d.getTime();
};

/** Parsing "09:30" -> minutes */
const parseTimeToMinutes = (t: string): number => {
  const [hh, mm] = (t || "").split(":");
  const h = Number(hh);
  const m = Number(mm);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
};

/** Badge UI par statut */
const statusBadge = (status: ConsultStatus) => {
  switch (status) {
    case "scheduled":
      return { label: "À venir", variant: "secondary" as const };
    case "in_progress":
      return { label: "En cours", variant: "default" as const };
    case "completed":
      return { label: "Terminée", variant: "outline" as const };
    case "cancelled":
      return { label: "Annulée", variant: "destructive" as const };
    case "no_show":
      return { label: "No-show", variant: "destructive" as const };
    default:
      return { label: "—", variant: "secondary" as const };
  }
};

const DoctorConsultations = () => {
  /** Filtres */
  const [range, setRange] = useState<ConsultFilter>("today");
  const [statusFilter, setStatusFilter] = useState<"all" | ConsultStatus>("all");
  const [q, setQ] = useState("");

  /** UI interactions */
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /** Actions palette */
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsQ, setActionsQ] = useState("");
  const [actionsIdx, setActionsIdx] = useState(0);
  const actionsInputRef = useRef<HTMLInputElement | null>(null);

  /** Workflow "Clôturer" (Sheet) */
  const [closeOpen, setCloseOpen] = useState(false);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [closeStep, setCloseStep] = useState<1 | 2 | 3>(1);
  const [closeForm, setCloseForm] = useState<CloseFormState>({
    diagnosis: "",
    notes: "",
    prescriptions: [{ medication: "", dosage: "" }],
    analyses: [""],
    nextRdv: "",
    amount: "",
  });

  /** Workflow "Reprogrammer" (Sheet) */
  const [reschedOpen, setReschedOpen] = useState(false);
  const [reschedId, setReschedId] = useState<number | null>(null);
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");

  /** Data UI (mock + statuts manipulables) */
  const [consultations, setConsultations] = useState<ConsultUi[]>(
    mockDoctorConsultations.map((c) => ({
      ...c,
      // Le mock a "completed" : on garde.
      status: (c.status as ConsultStatus) ?? "completed",
      closed: (c as any).closed ?? c.status === "completed",
    })),
  );

  /**
   * Notre "aujourd'hui" pour les mocks : 20 Fév 2026
   * (le but est UI-only ; tu remplaceras par une vraie date plus tard)
   */
  const anchorToday = "20 Fév 2026";
  const anchorTs = useMemo(() => parseFrDate(anchorToday), [anchorToday]);

  /** Applique filtre de période (today/week/all) */
  const byRange = useMemo(() => {
    return consultations.filter((c) => {
      const ts = parseFrDate(c.date);
      if (range === "today") return c.date === anchorToday;
      if (range === "week") return ts >= anchorTs - 6 * 24 * 3600 * 1000 && ts <= anchorTs;
      return true;
    });
  }, [consultations, range, anchorToday, anchorTs]);

  /** Applique filtre de statut + recherche */
  const filtered = useMemo(() => {
    const qv = q.trim().toLowerCase();
    return byRange
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) => {
        if (!qv) return true;
        return `${c.patient} ${c.motif} ${c.date} ${c.time}`.toLowerCase().includes(qv);
      })
      .sort((a, b) => {
        // Tri par date desc puis heure asc
        const d = parseFrDate(b.date) - parseFrDate(a.date);
        if (d !== 0) return d;
        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
      });
  }, [byRange, q, statusFilter]);

  /** Grouping par date */
  const grouped = useMemo(() => {
    const map = new Map<string, ConsultUi[]>();
    for (const c of filtered) {
      if (!map.has(c.date)) map.set(c.date, []);
      map.get(c.date)!.push(c);
    }
    // Retourne un array trié (date desc)
    return Array.from(map.entries()).sort((a, b) => parseFrDate(b[0]) - parseFrDate(a[0]));
  }, [filtered]);

  /** Stats utiles médecin */
  const stats = useMemo(() => {
    const inRange = byRange;
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
      rangeCount: inRange.length,
      rangeCa: sumDt(inRange.filter((c) => c.status === "completed")),
    };
  }, [byRange, consultations, anchorToday]);

  /** Ouvre la Sheet "Clôture" sur une consultation donnée */
  const openClose = (c: ConsultUi) => {
    setClosingId(c.id);
    setCloseStep(1);
    setCloseForm({
      diagnosis: "",
      notes: c.notes || "",
      prescriptions: [{ medication: "", dosage: "" }],
      analyses: [""],
      nextRdv: "15 jours",
      amount: String(c.amount).replace(/[^\d.]/g, ""),
    });
    setCloseOpen(true);
  };

  /** Valide la clôture (UI-only) */
  const confirmClose = () => {
    if (!closingId) return;

    setConsultations((prev) =>
      prev.map((c) =>
        c.id === closingId
          ? ({
              ...c,
              closed: true,
              status: "completed",
              notes: closeForm.notes || c.notes,
              amount: `${closeForm.amount || String(c.amount).replace(/[^\d.]/g, "")} DT`,
            } as ConsultUi)
          : c,
      ),
    );

    toast({
      title: "Consultation clôturée",
      description: "UI mock : la clôture a été enregistrée (à brancher plus tard).",
    });

    setCloseOpen(false);
    setExpandedId(null);
  };

  /** Ouvre la Sheet "Reprogrammer" */
  const openReschedule = (c: ConsultUi) => {
    setReschedId(c.id);
    setReschedDate(c.date);
    setReschedTime(c.time);
    setReschedOpen(true);
  };

  /** Confirme reprogrammation (UI-only) */
  const confirmReschedule = () => {
    if (!reschedId) return;

    if (!reschedDate.trim() || !reschedTime.trim()) {
      toast({ title: "Reprogrammer", description: "Renseigne une date et une heure." });
      return;
    }

    setConsultations((prev) =>
      prev.map((c) =>
        c.id === reschedId
          ? ({
              ...c,
              date: reschedDate.trim(),
              time: reschedTime.trim(),
              status: c.status === "completed" ? "completed" : "scheduled",
            } as ConsultUi)
          : c,
      ),
    );

    toast({ title: "RDV reprogrammé", description: "UI mock : RDV mis à jour." });
    setReschedOpen(false);
  };

  /** Mutations de statut (UI-only) */
  const setStatus = (id: number, status: ConsultStatus) => {
    setConsultations((prev) => prev.map((c) => (c.id === id ? ({ ...c, status } as ConsultUi) : c)));
  };

  /** Helper : copie dans le presse-papiers */
  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copié", description: `${label} copié dans le presse-papiers.` });
    } catch {
      toast({ title: "Copie", description: "Impossible de copier (permissions navigateur)." });
    }
  };

  /** Palette Ctrl/Cmd+K */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && isK) {
        e.preventDefault();
        setActionsOpen(true);
        setActionsQ("");
        setActionsIdx(0);
        // Focus après render
        setTimeout(() => actionsInputRef.current?.focus(), 0);
      }

      if (!actionsOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setActionsOpen(false);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActionsIdx((v) => v + 1);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActionsIdx((v) => Math.max(0, v - 1));
      }

      if (e.key === "Enter") {
        // Entrée : on lance l'action actuellement sélectionnée.
        e.preventDefault();
        // On déclenche dans le render via ref "actionsItems" (voir plus bas)
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actionsOpen]);

  /**
   * Actions palette : liste d’actions globales + actions contextualisées sur consultations qui matchent.
   * UX :
   * - Si tu tapes un nom de patient → on propose "Ouvrir", "Démarrer", "Clôturer", "Reprogrammer", "Imprimer", "Exporter".
   */
  const actionsItems = useMemo(() => {
    const qv = actionsQ.trim().toLowerCase();

    const global = [
      {
        key: "new",
        label: "Nouvelle consultation",
        hint: "Créer un RDV/consultation (UI mock)",
        icon: <Stethoscope className="h-3.5 w-3.5" />,
        run: () =>
          toast({
            title: "Nouvelle consultation",
            description: "UI mock : ouvre un flow (à brancher).",
          }),
      },
      {
        key: "export-day",
        label: "Exporter la journée (CSV)",
        hint: "À brancher",
        icon: <Download className="h-3.5 w-3.5" />,
        run: () => toast({ title: "Export CSV", description: "UI mock : export à brancher." }),
      },
      {
        key: "print-day",
        label: "Imprimer la journée",
        hint: "À brancher",
        icon: <Printer className="h-3.5 w-3.5" />,
        run: () => toast({ title: "Impression", description: "UI mock : impression à brancher." }),
      },
      {
        key: "filter-today",
        label: "Filtrer : Aujourd'hui",
        hint: "Range = today",
        icon: <Clock className="h-3.5 w-3.5" />,
        run: () => setRange("today"),
      },
      {
        key: "filter-week",
        label: "Filtrer : Cette semaine",
        hint: "Range = week",
        icon: <Calendar className="h-3.5 w-3.5" />,
        run: () => setRange("week"),
      },
      {
        key: "filter-all",
        label: "Filtrer : Tout",
        hint: "Range = all",
        icon: <ClipboardList className="h-3.5 w-3.5" />,
        run: () => setRange("all"),
      },
    ];

    // Match consultations
    const matches = consultations
      .filter((c) => {
        if (!qv) return false;
        const hay = `${c.patient} ${c.motif} ${c.date} ${c.time}`.toLowerCase();
        return hay.includes(qv);
      })
      .sort(
        (a, b) => parseFrDate(b.date) - parseFrDate(a.date) || parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
      )
      .slice(0, 4);

    const contextual = matches.flatMap((c) => {
      const base = `${c.patient} — ${c.date} ${c.time}`;
      const isDone = c.status === "completed";
      const isInProgress = c.status === "in_progress";
      const isCancelled = c.status === "cancelled" || c.status === "no_show";

      return [
        {
          key: `open-${c.id}`,
          label: `Ouvrir : ${base}`,
          hint: "Déplier la carte",
          icon: <ChevronDown className="h-3.5 w-3.5" />,
          run: () => {
            setExpandedId(c.id);
            setActionsOpen(false);
          },
        },
        {
          key: `start-${c.id}`,
          label: `Démarrer : ${base}`,
          hint: isDone ? "Déjà terminée" : isCancelled ? "Annulée/No-show" : "Mettre en cours",
          icon: <Stethoscope className="h-3.5 w-3.5" />,
          disabled: isDone || isCancelled,
          run: () => {
            setStatus(c.id, "in_progress");
            toast({ title: "Consultation en cours", description: base });
            setActionsOpen(false);
          },
        },
        {
          key: `close-${c.id}`,
          label: `Clôturer : ${base}`,
          hint: isDone ? "Déjà clôturée" : isCancelled ? "Annulée/No-show" : "Ouvrir la feuille de clôture",
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          disabled: isDone || isCancelled,
          run: () => {
            openClose(c);
            setActionsOpen(false);
          },
        },
        {
          key: `resched-${c.id}`,
          label: `Reprogrammer : ${base}`,
          hint: "Changer date/heure",
          icon: <Pencil className="h-3.5 w-3.5" />,
          disabled: isDone,
          run: () => {
            openReschedule(c);
            setActionsOpen(false);
          },
        },
        {
          key: `print-${c.id}`,
          label: `Imprimer CR : ${base}`,
          hint: "À brancher",
          icon: <Printer className="h-3.5 w-3.5" />,
          run: () => {
            toast({ title: "Imprimer CR", description: base });
            setActionsOpen(false);
          },
        },
        {
          key: `export-${c.id}`,
          label: `Exporter PDF : ${base}`,
          hint: "À brancher",
          icon: <Download className="h-3.5 w-3.5" />,
          run: () => {
            toast({ title: "Exporter PDF", description: base });
            setActionsOpen(false);
          },
        },
      ];
    });

    // Filtrage simple sur le libellé
    const all = [...global, ...contextual].filter((it) => {
      if (!qv) return true;
      return `${it.label} ${it.hint}`.toLowerCase().includes(qv);
    });

    return all.slice(0, 12);
  }, [actionsQ, consultations, anchorToday]);

  /** Normalise l’index sélectionné (palette) */
  useEffect(() => {
    if (!actionsOpen) return;
    setActionsIdx((i) => Math.min(i, Math.max(0, actionsItems.length - 1)));
  }, [actionsOpen, actionsItems.length]);

  /** Entrée dans la palette = lancer l’action sélectionnée */
  useEffect(() => {
    if (!actionsOpen) return;

    const onEnter = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!actionsOpen) return;

      const item = actionsItems[actionsIdx];
      if (!item || (item as any).disabled) return;

      (item as any).run?.();
    };

    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, [actionsOpen, actionsIdx, actionsItems]);

  /** UI helper : libellé d’une consultation */
  const consultLabel = (c: ConsultUi) => `${c.patient} · ${c.date} à ${c.time}`;

  return (
    <DashboardLayout role="doctor" title="Consultations">
      <div className="space-y-6">
        {/* ───────────────────────── Sticky toolbar ───────────────────────── */}
        <div className="sticky top-0 z-10 -mx-2 px-2 py-2 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="rounded-xl border bg-card p-3 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="relative">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Rechercher (patient, motif, date, heure)…"
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  title="Raccourci : Ctrl/Cmd+K"
                  onClick={() => {
                    setActionsOpen(true);
                    setActionsQ("");
                    setActionsIdx(0);
                    setTimeout(() => actionsInputRef.current?.focus(), 0);
                  }}
                >
                  <Search className="mr-1 h-3.5 w-3.5" />
                  Actions
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => toast({ title: "Export CSV", description: "UI mock : export à brancher." })}
                >
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Export CSV
                </Button>

                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  onClick={() => toast({ title: "Nouvelle consultation", description: "UI mock : flow à brancher." })}
                >
                  <Stethoscope className="mr-1 h-3.5 w-3.5" />
                  Nouvelle consultation
                </Button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Range */}
                <Tabs value={range} onValueChange={(v) => setRange(v as ConsultFilter)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="today" className="text-xs px-3">
                      Aujourd&apos;hui
                    </TabsTrigger>
                    <TabsTrigger value="week" className="text-xs px-3">
                      7 jours
                    </TabsTrigger>
                    <TabsTrigger value="all" className="text-xs px-3">
                      Tout
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Status filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Statut :</span>
                  {[
                    { key: "all", label: "Tous" },
                    { key: "scheduled", label: "À venir" },
                    { key: "in_progress", label: "En cours" },
                    { key: "completed", label: "Terminées" },
                    { key: "cancelled", label: "Annulées" },
                    { key: "no_show", label: "No-show" },
                  ].map((s) => (
                    <Button
                      key={s.key}
                      variant={statusFilter === (s.key as any) ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-8 px-3"
                      onClick={() => setStatusFilter(s.key as any)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────── Stats ───────────────────────── */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card className="rounded-2xl">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Aujourd&apos;hui</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-semibold">{stats.todayCount}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {stats.todayDone} terminées • {stats.todayInProgress} en cours • {stats.todayScheduled} à venir
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">CA jour</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-semibold">{stats.todayCa} DT</div>
              <div className="mt-1 text-xs text-muted-foreground">Basé sur les consultations terminées</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">No-show</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-semibold">{stats.todayNoShow}</div>
              <div className="mt-1 text-xs text-muted-foreground">À suivre / reprogrammer</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Période</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-semibold">{stats.rangeCount}</div>
              <div className="mt-1 text-xs text-muted-foreground">Consultations dans la période</div>
            </CardContent>
          </Card>
        </div>

        {/* ───────────────────────── List ───────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Aucune consultation pour ces filtres</p>
            <p className="text-xs text-muted-foreground mt-1">Ajuste la période, le statut ou la recherche.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([date, items]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{date}</h3>
                  <span className="text-xs text-muted-foreground">{items.length} consultation(s)</span>
                </div>

                <div className="space-y-2">
                  {items.map((c) => {
                    const isExpanded = expandedId === c.id;
                    const badge = statusBadge(c.status);

                    return (
                      <div
                        key={c.id}
                        className={`rounded-2xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden ${
                          c.status === "cancelled" || c.status === "no_show" ? "opacity-70" : ""
                        }`}
                      >
                        {/* Header row */}
                        <div
                          role="button"
                          tabIndex={0}
                          className="w-full text-left p-4 cursor-pointer select-none"
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedId(isExpanded ? null : c.id);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Time bubble */}
                              <div className="hidden sm:flex h-10 w-10 rounded-xl border bg-muted/30 items-center justify-center">
                                <span className="text-xs font-semibold text-foreground">{c.time}</span>
                              </div>

                              {/* Avatar */}
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                {c.avatar}
                              </div>

                              {/* Main info */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-foreground truncate">{c.patient}</span>
                                  <Badge variant={badge.variant} className="text-[11px] px-2 py-0.5">
                                    {badge.label}
                                  </Badge>
                                  {(c as any).cnam && (
                                    <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                                      CNAM
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {c.motif} •{" "}
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {c.time}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right actions */}
                            <div className="flex items-center gap-2">
                              <span className="hidden md:inline text-sm font-semibold text-foreground">{c.amount}</span>

                              {/* Quick primary action */}
                              {c.status === "scheduled" && (
                                <Button
                                  size="sm"
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStatus(c.id, "in_progress");
                                    toast({ title: "Consultation en cours", description: consultLabel(c) });
                                  }}
                                >
                                  <Stethoscope className="mr-1 h-3.5 w-3.5" />
                                  Démarrer
                                </Button>
                              )}

                              {c.status === "in_progress" && (
                                <Button
                                  size="sm"
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openClose(c);
                                  }}
                                >
                                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                  Clôturer
                                </Button>
                              )}

                              {/* Kebab menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setExpandedId(c.id);
                                      toast({ title: "Dossier patient", description: "UI mock : à brancher." });
                                    }}
                                  >
                                    <User className="mr-2 h-4 w-4" />
                                    Ouvrir dossier patient
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      toast({ title: "Message", description: "UI mock : messagerie à brancher." });
                                    }}
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    Envoyer un message
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => openReschedule(c)}
                                    disabled={c.status === "completed"}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Reprogrammer
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setStatus(c.id, "cancelled");
                                      toast({ title: "Annulé", description: consultLabel(c) });
                                    }}
                                    disabled={c.status === "completed"}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Annuler
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setStatus(c.id, "no_show");
                                      toast({ title: "No-show", description: consultLabel(c) });
                                    }}
                                    disabled={c.status === "completed"}
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Marquer No-show
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() =>
                                      toast({ title: "Imprimer CR", description: "UI mock : à brancher." })
                                    }
                                  >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimer CR
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toast({ title: "Exporter PDF", description: "UI mock : à brancher." })
                                    }
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Exporter PDF
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem onClick={() => copy("Consultation", consultLabel(c))}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Copier résumé
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>

                              <ChevronDown
                                className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t bg-muted/10 p-4 space-y-3">
                            <div className="grid gap-3 md:grid-cols-3">
                              <div className="md:col-span-2">
                                <div className="text-xs font-medium text-muted-foreground mb-1">Notes</div>
                                <div className="text-sm text-foreground">{c.notes || "—"}</div>
                              </div>

                              <div className="md:col-span-1">
                                <div className="text-xs font-medium text-muted-foreground mb-1">Raccourcis</div>
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                      toast({ title: "Imprimer CR", description: "UI mock : à brancher." })
                                    }
                                  >
                                    <Printer className="mr-1 h-3.5 w-3.5" />
                                    Imprimer
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => toast({ title: "PDF", description: "UI mock : export à brancher." })}
                                  >
                                    <Download className="mr-1 h-3.5 w-3.5" />
                                    PDF
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => openReschedule(c)}
                                    disabled={c.status === "completed"}
                                  >
                                    <Pencil className="mr-1 h-3.5 w-3.5" />
                                    Reprogrammer
                                  </Button>

                                  {c.status !== "completed" && (
                                    <Button
                                      size="sm"
                                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                                      onClick={() => openClose(c)}
                                      disabled={c.status === "cancelled" || c.status === "no_show"}
                                    >
                                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                      Clôturer
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="text-xs text-muted-foreground">
                                {c.prescriptions > 0 ? (
                                  <span className="inline-flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5" />
                                    {c.prescriptions} ordonnance{c.prescriptions > 1 ? "s" : ""} générée
                                    {c.prescriptions > 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  "Aucune ordonnance liée"
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() =>
                                    toast({ title: "Dossier patient", description: "UI mock : à brancher." })
                                  }
                                >
                                  <User className="mr-1 h-3.5 w-3.5" />
                                  Dossier patient
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() =>
                                    toast({ title: "Envoyer ordonnance", description: "UI mock : à brancher." })
                                  }
                                >
                                  <Send className="mr-1 h-3.5 w-3.5" />
                                  Envoyer ordonnance
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <p className="text-xs text-muted-foreground text-center">{filtered.length} consultation(s) affichée(s)</p>
          </div>
        )}

        {/* ───────────────────────── Actions palette (Dialog) ───────────────────────── */}
        <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
          <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden">
            <div className="border-b p-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  ref={actionsInputRef}
                  value={actionsQ}
                  onChange={(e) => {
                    setActionsQ(e.target.value);
                    setActionsIdx(0);
                  }}
                  placeholder="Rechercher une action… (ex: amine, clôturer, reprogrammer, pdf)"
                  className="h-9"
                />
                <Badge variant="secondary" className="text-[11px]">
                  Ctrl+K
                </Badge>
              </div>
            </div>

            <div className="max-h-[420px] overflow-auto">
              {actionsItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Aucune action trouvée</div>
              ) : (
                <div className="p-2">
                  {actionsItems.map((item, idx) => {
                    const disabled = (item as any).disabled;
                    const selected = idx === actionsIdx;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        disabled={disabled}
                        className={`w-full text-left rounded-xl px-3 py-2 transition-colors ${
                          selected ? "bg-primary/10" : "hover:bg-muted/40"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        onMouseEnter={() => setActionsIdx(idx)}
                        onClick={() => {
                          if (disabled) return;
                          (item as any).run?.();
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-muted-foreground">{item.icon}</span>
                            <span className="text-sm font-medium text-foreground truncate">{item.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.hint}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t p-3 flex items-center justify-between text-xs text-muted-foreground">
              <div>↑ ↓ pour naviguer · Entrée pour lancer · Esc pour fermer</div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActionsOpen(false)}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ───────────────────────── Sheet : Clôturer ───────────────────────── */}
        <Sheet open={closeOpen} onOpenChange={setCloseOpen}>
          <SheetContent side="right" className="w-full sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle className="text-base">Clôture de consultation</SheetTitle>
              <SheetDescription>
                {closingId ? `Consultation #${closingId}` : "—"} • Workflow intra-page (mock)
              </SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-4">
              {/* Stepper */}
              <div className="flex items-center gap-2">
                {([1, 2, 3] as const).map((s) => (
                  <Button
                    key={s}
                    variant={closeStep === s ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8 px-3"
                    onClick={() => setCloseStep(s)}
                  >
                    {s === 1 ? "1. Compte-rendu" : s === 2 ? "2. Prescriptions" : "3. Facturation"}
                  </Button>
                ))}
              </div>

              {/* Step 1 */}
              {closeStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Diagnostic</Label>
                    <Input
                      value={closeForm.diagnosis}
                      onChange={(e) => setCloseForm((f) => ({ ...f, diagnosis: e.target.value }))}
                      placeholder="Ex: Angine virale, HTA non contrôlée…"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Compte-rendu</Label>
                    <Textarea
                      value={closeForm.notes}
                      onChange={(e) => setCloseForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={5}
                      className="mt-1"
                    />
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Conseil : structure courte (motif → examen → décision).
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {closeStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">Ordonnance</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          setCloseForm((f) => ({
                            ...f,
                            prescriptions: [...f.prescriptions, { medication: "", dosage: "" }],
                          }))
                        }
                      >
                        + Ajouter
                      </Button>
                    </div>

                    {closeForm.prescriptions.map((p, i) => (
                      <div key={i} className="flex gap-2 items-center mb-2">
                        <Input
                          value={p.medication}
                          onChange={(e) => {
                            const u = [...closeForm.prescriptions];
                            u[i] = { ...u[i], medication: e.target.value };
                            setCloseForm((f) => ({ ...f, prescriptions: u }));
                          }}
                          placeholder="Médicament"
                          className="h-9 text-xs"
                        />
                        <Input
                          value={p.dosage}
                          onChange={(e) => {
                            const u = [...closeForm.prescriptions];
                            u[i] = { ...u[i], dosage: e.target.value };
                            setCloseForm((f) => ({ ...f, prescriptions: u }));
                          }}
                          placeholder="Posologie"
                          className="h-9 text-xs"
                        />
                        {closeForm.prescriptions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={() =>
                              setCloseForm((f) => ({ ...f, prescriptions: f.prescriptions.filter((_, j) => j !== i) }))
                            }
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">Analyses prescrites</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setCloseForm((f) => ({ ...f, analyses: [...f.analyses, ""] }))}
                      >
                        + Ajouter
                      </Button>
                    </div>

                    {closeForm.analyses.map((a, i) => (
                      <div key={i} className="flex gap-2 items-center mb-2">
                        <Input
                          value={a}
                          onChange={(e) => {
                            const u = [...closeForm.analyses];
                            u[i] = e.target.value;
                            setCloseForm((f) => ({ ...f, analyses: u }));
                          }}
                          placeholder="Type d'analyse"
                          className="h-9 text-xs"
                        />
                        {closeForm.analyses.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0"
                            onClick={() =>
                              setCloseForm((f) => ({ ...f, analyses: f.analyses.filter((_, j) => j !== i) }))
                            }
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {closeStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Prochain RDV</Label>
                      <select
                        value={closeForm.nextRdv}
                        onChange={(e) => setCloseForm((f) => ({ ...f, nextRdv: e.target.value }))}
                        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-xs"
                      >
                        <option value="">Pas de suivi</option>
                        <option value="1 semaine">1 semaine</option>
                        <option value="15 jours">15 jours</option>
                        <option value="1 mois">1 mois</option>
                        <option value="3 mois">3 mois</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Montant facturé (DT)</Label>
                      <Input
                        value={closeForm.amount}
                        onChange={(e) => setCloseForm((f) => ({ ...f, amount: e.target.value }))}
                        className="mt-1 h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Aperçu
                    </div>

                    <div className="text-sm font-medium text-foreground">
                      {closingId ? `Consultation #${closingId}` : "—"}
                    </div>

                    <div className="text-xs text-muted-foreground">Diagnostic : {closeForm.diagnosis || "—"}</div>

                    <div className="text-xs text-muted-foreground">
                      Ordonnance : {closeForm.prescriptions.filter((p) => p.medication.trim()).length} médicament(s)
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Analyses : {closeForm.analyses.filter((a) => a.trim()).length} item(s)
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Suivi : {closeForm.nextRdv || "—"} • Montant : {closeForm.amount || "—"} DT
                    </div>
                  </div>
                </div>
              )}
            </div>

            <SheetFooter className="mt-4">
              <div className="flex items-center justify-between w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    toast({ title: "Imprimer", description: "UI mock : à brancher." });
                  }}
                >
                  <Printer className="mr-1 h-3.5 w-3.5" />
                  Imprimer
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCloseOpen(false)}>
                    Annuler
                  </Button>

                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                    onClick={confirmClose}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Valider
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* ───────────────────────── Sheet : Reprogrammer ───────────────────────── */}
        <Sheet open={reschedOpen} onOpenChange={setReschedOpen}>
          <SheetContent side="right" className="w-full sm:max-w-[420px]">
            <SheetHeader>
              <SheetTitle className="text-base">Reprogrammer</SheetTitle>
              <SheetDescription>Modifier la date et l’heure (UI mock).</SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-3">
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                  className="mt-1"
                  placeholder="Ex: 22 Fév 2026"
                />
              </div>

              <div>
                <Label className="text-xs">Heure</Label>
                <Input
                  value={reschedTime}
                  onChange={(e) => setReschedTime(e.target.value)}
                  className="mt-1"
                  placeholder="Ex: 14:30"
                />
              </div>

              <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                Astuce : garde le format mock (ex: <span className="font-medium">20 Fév 2026</span>).
              </div>
            </div>

            <SheetFooter className="mt-4">
              <div className="flex items-center justify-between w-full gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setReschedOpen(false)}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  onClick={confirmReschedule}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Confirmer
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConsultations;
