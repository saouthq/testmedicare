import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileDown,
  FileText,
  Mail,
  MessageCircle,
  MoreVertical,
  Pencil,
  Phone,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { mockDoctorPrescriptions } from "@/data/mockData";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Prescription } from "@/data/mockData";

type PrescriptionFilter = "all" | "draft" | "sent" | "expired";

/**
 * On garde la forme Prescription (mockData) mais on enrichit côté UI
 * pour gérer : versioning, sentAt, notes, destinataires…
 * (Backend-ready : ces champs deviendront des colonnes/relations plus tard.)
 */
type RxRow = Prescription & {
  meta?: {
    baseId: string;
    version: number;
    notes?: string;
    sentAt?: string;
    to?: {
      patient: boolean;
      pharmacy: boolean;
      pharmacyName?: string;
    };
    createdAt?: string;
    updatedAt?: string;
  };
};

const DoctorPrescriptions = () => {
  // -----------------------------
  // Data state
  // -----------------------------
  const [prescriptions, setPrescriptions] = useState<RxRow[]>(
    mockDoctorPrescriptions.map((p) => ({
      ...p,
      meta: {
        baseId: p.id,
        version: 1,
        sentAt: p.sent ? `${p.date} · 10:12` : undefined,
      },
    })),
  );

  // -----------------------------
  // UI state
  // -----------------------------
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Search + filters (in-page)
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PrescriptionFilter>("all");

  // Action palette (Ctrl/Cmd+K)
  const [actionsOpen, setActionsOpen] = useState(false);

  // Composer sheet (intra-page workflow)
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerStep, setComposerStep] = useState<1 | 2 | 3>(1);
  const [composerMode, setComposerMode] = useState<"new" | "edit">("new");

  // Editing context
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAfterSent, setEditingAfterSent] = useState(false);

  // Form fields
  const [formPatient, setFormPatient] = useState("");
  const [formItems, setFormItems] = useState([{ medication: "", dosage: "", duration: "", instructions: "" }]);
  const [formCnam, setFormCnam] = useState(true);
  const [formNotes, setFormNotes] = useState("");
  const [formSigned, setFormSigned] = useState(false);
  const [sendToPatient, setSendToPatient] = useState(true);
  const [sendToPharmacy, setSendToPharmacy] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("");

  // Refs for UX
  const patientInputRef = useRef<HTMLInputElement | null>(null);

  // -----------------------------
  // Helpers
  // -----------------------------
  const nowAt = () => new Date().toLocaleString();
  const todayLabel = () => new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  const getBaseId = (id: string) => id.replace(/-v\d+$/i, "");
  const getVersionFromId = (id: string) => {
    const m = id.match(/-v(\d+)$/i);
    return m ? Number(m[1]) : 1;
  };
  const nextVersionForBase = (baseId: string) => {
    const versions = prescriptions.filter((p) => getBaseId(p.id) === baseId).map((p) => getVersionFromId(p.id));
    return (versions.length ? Math.max(...versions) : 1) + 1;
  };

  const makeNewId = () => {
    // Simple mock id generator (backend will generate)
    const seq = 46 + prescriptions.length + 1;
    return `ORD-2026-${String(seq).padStart(3, "0")}`;
  };

  const formatItems = () =>
    formItems
      .filter((i) => i.medication.trim().length > 0)
      .map((i) => {
        const med = i.medication.trim();
        const dose = i.dosage.trim();
        const dur = i.duration.trim();
        const instr = i.instructions.trim();
        const parts = [med];
        if (dose) parts.push(dose);
        if (dur) parts.push(dur);
        const base = parts.join(" — ");
        return instr ? `${base} (${instr})` : base;
      });

  const resetComposer = () => {
    setComposerStep(1);
    setComposerMode("new");
    setEditingId(null);
    setEditingAfterSent(false);

    setFormPatient("");
    setFormItems([{ medication: "", dosage: "", duration: "", instructions: "" }]);
    setFormCnam(true);
    setFormNotes("");
    setFormSigned(false);
    setSendToPatient(true);
    setSendToPharmacy(false);
    setPharmacyName("");
  };

  const openNewComposer = () => {
    resetComposer();
    setComposerOpen(true);
    // focus patient input on open
    setTimeout(() => patientInputRef.current?.focus(), 50);
  };

  const openEditComposer = (rx: RxRow, afterSent: boolean) => {
    // On transforme items string[] -> champs (best effort)
    const parsedItems = rx.items?.length
      ? rx.items.map((line) => {
          // Very light parse, keep safe
          const clean = String(line);
          const instrMatch = clean.match(/\((.+)\)$/);
          const instr = instrMatch ? instrMatch[1] : "";
          const noInstr = instrMatch ? clean.replace(/\s*\(.+\)\s*$/, "") : clean;
          const parts = noInstr.split(" — ").map((s) => s.trim());
          return {
            medication: parts[0] || "",
            dosage: parts[1] || "",
            duration: parts[2] || "",
            instructions: instr || "",
          };
        })
      : [{ medication: "", dosage: "", duration: "", instructions: "" }];

    setComposerOpen(true);
    setComposerMode("edit");
    setEditingId(rx.id);
    setEditingAfterSent(afterSent);

    setComposerStep(1);
    setFormPatient(rx.patient || "");
    setFormItems(parsedItems);
    setFormCnam(Boolean(rx.cnam));
    setFormNotes(rx.meta?.notes || "");
    setFormSigned(false); // Doctolib-like : re-signature à chaque modification
    setSendToPatient(rx.meta?.to?.patient ?? true);
    setSendToPharmacy(rx.meta?.to?.pharmacy ?? false);
    setPharmacyName(rx.meta?.to?.pharmacyName || rx.pharmacy || "");

    setTimeout(() => patientInputRef.current?.focus(), 50);
  };

  const getSelected = () => prescriptions.find((p) => p.id === selectedId) || null;

  // -----------------------------
  // Keyboard shortcut: Ctrl/Cmd + K
  // -----------------------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      const hasMod = e.metaKey || e.ctrlKey;
      if (hasMod && isK) {
        e.preventDefault();
        setActionsOpen(true);
      }
      if (e.key === "Escape") {
        // Ne pas forcer fermeture (Dialog gère), mais utile si autre UI ouverte
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // -----------------------------
  // Filtering
  // -----------------------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prescriptions.filter((p) => {
      if (q) {
        const blob = [p.id, p.patient || "", ...(p.items || []), p.pharmacy || "", p.status].join(" ").toLowerCase();
        if (!blob.includes(q)) return false;
      }

      if (filter === "draft") return !p.sent;
      if (filter === "sent") return Boolean(p.sent) && p.status === "active";
      if (filter === "expired") return p.status === "expired";
      return true;
    });
  }, [prescriptions, search, filter]);

  const counts = useMemo(() => {
    return {
      total: prescriptions.length,
      drafts: prescriptions.filter((p) => !p.sent).length,
      sent: prescriptions.filter((p) => Boolean(p.sent) && p.status === "active").length,
      expired: prescriptions.filter((p) => p.status === "expired").length,
    };
  }, [prescriptions]);

  // -----------------------------
  // Actions (UI only — backend later)
  // -----------------------------
  const handleSend = (id: string) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              sent: true,
              meta: {
                ...(p.meta || { baseId: getBaseId(p.id), version: getVersionFromId(p.id) }),
                sentAt: nowAt(),
                to: { patient: true, pharmacy: false },
                updatedAt: nowAt(),
              },
            }
          : p,
      ),
    );

    toast({
      title: "Ordonnance envoyée",
      description: "Statut mis à jour (mock).",
    });
  };

  const handleDuplicate = (rx: RxRow) => {
    openEditComposer(rx, false);
    setComposerMode("new");
    setEditingId(null);
    setEditingAfterSent(false);
    toast({ title: "Dupliquer", description: "Préremplissage effectué (mock)." });
  };

  const handleRenew = (rx: RxRow) => {
    // Renouveler = nouvelle version / nouveau numéro (mock)
    const base = getBaseId(rx.id);
    const v = nextVersionForBase(base);
    const newId = `${base}-v${v}`;

    setPrescriptions((prev) => [
      {
        ...rx,
        id: newId,
        date: todayLabel(),
        status: "active",
        sent: false,
        meta: {
          baseId: base,
          version: v,
          notes: rx.meta?.notes,
          createdAt: nowAt(),
        },
      },
      ...prev,
    ]);

    setExpandedId(newId);
    setSelectedId(newId);

    toast({
      title: "Renouvellement créé",
      description: `${newId} en brouillon (mock).`,
    });
  };

  const handleDelete = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
    if (selectedId === id) setSelectedId(null);

    toast({ title: "Supprimée", description: "Ordonnance supprimée (mock)." });
  };

  const handlePrint = (id: string) => {
    toast({
      title: "Imprimer",
      description: `Impression de ${id} (à brancher).`,
    });
  };

  const handleExportPdf = (id: string) => {
    toast({
      title: "Télécharger PDF",
      description: `Export PDF de ${id} (à brancher).`,
    });
  };

  const handleCopy = async (rx: RxRow) => {
    const lines = [`${rx.id} — ${rx.patient || ""} — ${rx.date}`, ...rx.items];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast({ title: "Copié", description: "Ordonnance copiée dans le presse-papiers." });
    } catch {
      toast({ title: "Copie impossible", description: "Votre navigateur a bloqué l’accès." });
    }
  };

  // -----------------------------
  // Composer submit (create / update) — UI-only
  // -----------------------------
  const upsertDraft = () => {
    const items = formatItems();
    if (!formPatient.trim()) {
      toast({ title: "Patient requis", description: "Veuillez renseigner le patient." });
      return false;
    }
    if (!items.length) {
      toast({ title: "Prescription vide", description: "Ajoutez au moins un médicament." });
      return false;
    }

    const dateLabel = todayLabel();

    // Si on modifie une ordonnance envoyée, on crée une nouvelle version
    const base = editingId ? getBaseId(editingId) : makeNewId();
    const isEdit = composerMode === "edit" && Boolean(editingId);

    let newId = base;
    let version = 1;

    if (isEdit) {
      // même ordonnance (brouillon) : on conserve l'id
      newId = editingId!;
      version = getVersionFromId(newId);

      // mais si "edit after sent" => nouvelle version
      if (editingAfterSent) {
        version = nextVersionForBase(base);
        newId = `${base}-v${version}`;
      }
    }

    const row: RxRow = {
      id: newId,
      doctor: "Dr. Bouazizi",
      patient: formPatient.trim(),
      date: dateLabel,
      items,
      status: "active",
      total: "— DT",
      cnam: Boolean(formCnam),
      pharmacy: sendToPharmacy ? pharmacyName.trim() || "Pharmacie (à choisir)" : null,
      sent: false,
      meta: {
        baseId: base,
        version,
        notes: formNotes.trim() ? formNotes.trim() : undefined,
        to: {
          patient: sendToPatient,
          pharmacy: sendToPharmacy,
          pharmacyName: pharmacyName.trim() || undefined,
        },
        updatedAt: nowAt(),
        createdAt: nowAt(),
      },
    };

    setPrescriptions((prev) => {
      // Remove old row if editing in place
      const withoutOld = isEdit && !editingAfterSent ? prev.filter((p) => p.id !== editingId) : prev;
      return [row, ...withoutOld];
    });

    setSelectedId(newId);
    setExpandedId(newId);

    toast({
      title: "Brouillon enregistré",
      description: `${newId} prêt à être envoyé.`,
    });

    return true;
  };

  const sendFromComposer = () => {
    // 1) Validate draft
    const ok = upsertDraft();
    if (!ok) return;

    // 2) The new row is now at top - we can mark it as sent
    const base = editingId ? getBaseId(editingId) : getBaseId(makeNewId()); // fallback
    // Find current selected row
    const currentId = selectedId || expandedId;
    if (!currentId) return;

    if (!formSigned) {
      toast({ title: "Signature requise", description: "Cochez la signature numérique avant l’envoi." });
      return;
    }
    if (!sendToPatient && !sendToPharmacy) {
      toast({ title: "Destinataire requis", description: "Choisissez au moins un destinataire." });
      return;
    }

    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === currentId
          ? {
              ...p,
              sent: true,
              pharmacy: sendToPharmacy ? pharmacyName.trim() || p.pharmacy || "Pharmacie (à choisir)" : null,
              meta: {
                ...(p.meta || { baseId, version: 1 }),
                sentAt: nowAt(),
                to: {
                  patient: sendToPatient,
                  pharmacy: sendToPharmacy,
                  pharmacyName: pharmacyName.trim() || undefined,
                },
                updatedAt: nowAt(),
              },
            }
          : p,
      ),
    );

    toast({
      title: "Envoyée",
      description: "Ordonnance envoyée (mock).",
    });

    // UX : rester sur l’étape 3 avec bannière “envoyée”
    setComposerStep(3);
    setEditingAfterSent(false);
  };

  // -----------------------------
  // UI building blocks
  // -----------------------------
  const StepPills = () => (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={composerStep === 1 ? "default" : "outline"}
        size="sm"
        className="text-xs"
        onClick={() => setComposerStep(1)}
      >
        1. Rédiger
      </Button>
      <Button
        type="button"
        variant={composerStep === 2 ? "default" : "outline"}
        size="sm"
        className="text-xs"
        onClick={() => setComposerStep(2)}
      >
        2. Signer
      </Button>
      <Button
        type="button"
        variant={composerStep === 3 ? "default" : "outline"}
        size="sm"
        className="text-xs"
        onClick={() => setComposerStep(3)}
      >
        3. Envoyer
      </Button>
    </div>
  );

  const selectedRx = getSelected();

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <DashboardLayout role="doctor" title="Ordonnances">
      <div className="space-y-6">
        {/* Sticky top bar (Doctolib-like) */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-background/80 backdrop-blur border-b">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une ordonnance (patient, n°, médicament, pharmacie)…"
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                title="Raccourci : Ctrl/Cmd+K"
                onClick={() => setActionsOpen(true)}
              >
                <Search className="h-3.5 w-3.5 mr-1" />
                Actions
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={() =>
                  toast({
                    title: "Exporter liste",
                    description: "Export CSV/PDF de la liste (à brancher).",
                  })
                }
              >
                <FileDown className="h-3.5 w-3.5 mr-1" />
                Export
              </Button>

              <Button
                size="sm"
                className="gradient-primary text-primary-foreground shadow-primary-glow text-xs shrink-0"
                onClick={openNewComposer}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Nouvelle
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-0.5 rounded-lg border bg-card p-0.5 w-fit">
              {(
                [
                  { key: "all" as const, label: "Toutes", count: counts.total },
                  { key: "draft" as const, label: "Brouillons", count: counts.drafts },
                  { key: "sent" as const, label: "Envoyées", count: counts.sent },
                  { key: "expired" as const, label: "Expirées", count: counts.expired },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> Total
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{counts.total}</div>
              <div className="text-xs text-muted-foreground">toutes périodes</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" /> Brouillons
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{counts.drafts}</div>
              <div className="text-xs text-muted-foreground">à envoyer</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <Send className="h-3.5 w-3.5" /> Envoyées
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{counts.sent}</div>
              <div className="text-xs text-muted-foreground">actives</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" /> Expirées
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{counts.expired}</div>
              <div className="text-xs text-muted-foreground">à renouveler</div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id;
            const isSelected = selectedId === p.id;
            const version = p.meta?.version || getVersionFromId(p.id);

            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border bg-card shadow-card overflow-hidden",
                  isSelected && "ring-2 ring-primary/30",
                )}
              >
                <div
                  className={cn("p-5 cursor-pointer hover:bg-muted/20 transition-colors")}
                  onClick={() => {
                    setSelectedId(p.id);
                    setExpandedId(isExpanded ? null : p.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground">{p.id}</h3>

                          {version > 1 && (
                            <Badge variant="secondary" className="text-[11px]">
                              v{version}
                            </Badge>
                          )}

                          {p.sent ? (
                            <Badge className="bg-accent/10 text-accent hover:bg-accent/10 text-[11px]">
                              <CheckCircle className="h-3 w-3 mr-1" /> Envoyée
                            </Badge>
                          ) : (
                            <Badge className="bg-warning/10 text-warning hover:bg-warning/10 text-[11px]">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Brouillon
                            </Badge>
                          )}

                          {p.status === "expired" && (
                            <Badge variant="secondary" className="text-[11px]">
                              Expirée
                            </Badge>
                          )}

                          {p.cnam && (
                            <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                              <Shield className="h-3 w-3" /> CNAM
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {p.patient || "—"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {p.date}
                          </span>
                          {p.pharmacy && (
                            <span className="inline-flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5" />
                              {p.pharmacy}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-1">
                          {p.items.slice(0, 2).map((item, i) => (
                            <p
                              key={i}
                              className="text-sm text-foreground flex items-center gap-2 truncate"
                              title={item}
                            >
                              <Pill className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">{item}</span>
                            </p>
                          ))}
                          {p.items.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{p.items.length - 2} autre(s) médicament(s)
                            </p>
                          )}
                        </div>

                        <p className="text-sm font-bold text-foreground mt-2">{p.total}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedId(p.id);
                              setExpandedId(p.id);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> Ouvrir
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleCopy(p)}>
                            <Copy className="h-4 w-4 mr-2" /> Copier
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {!p.sent && (
                            <DropdownMenuItem onClick={() => handleSend(p.id)}>
                              <Send className="h-4 w-4 mr-2" /> Envoyer
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => openEditComposer(p, Boolean(p.sent))}>
                            <Pencil className="h-4 w-4 mr-2" /> {p.sent ? "Modifier (nouvelle version)" : "Modifier"}
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleDuplicate(p)}>
                            <Copy className="h-4 w-4 mr-2" /> Dupliquer
                          </DropdownMenuItem>

                          {p.status === "expired" && (
                            <DropdownMenuItem onClick={() => handleRenew(p)}>
                              <RefreshCw className="h-4 w-4 mr-2" /> Renouveler
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem onClick={() => handlePrint(p.id)}>
                            <Printer className="h-4 w-4 mr-2" /> Imprimer
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleExportPdf(p.id)}>
                            <Download className="h-4 w-4 mr-2" /> Télécharger PDF
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <ChevronDown
                        className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded actions */}
                {isExpanded && (
                  <div className="border-t px-5 py-4 bg-muted/10 space-y-3">
                    {p.sent && p.meta?.sentAt && (
                      <div className="rounded-xl border bg-primary/5 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-foreground">Envoyée</div>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            {p.meta.sentAt}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Utilisez <span className="font-medium">Modifier</span> pour créer une nouvelle version
                          (traçabilité).
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {!p.sent && (
                        <Button
                          size="sm"
                          className="gradient-primary text-primary-foreground text-xs"
                          onClick={() => handleSend(p.id)}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Envoyer
                        </Button>
                      )}

                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleCopy(p)}>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copier
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => openEditComposer(p, Boolean(p.sent))}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        {p.sent ? "Modifier (v+1)" : "Modifier"}
                      </Button>

                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleDuplicate(p)}>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Dupliquer
                      </Button>

                      {p.status === "expired" && (
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => handleRenew(p)}>
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          Renouveler
                        </Button>
                      )}

                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handlePrint(p.id)}>
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        Imprimer
                      </Button>

                      <Button variant="outline" size="sm" className="text-xs" onClick={() => handleExportPdf(p.id)}>
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF
                      </Button>

                      {/* Contact shortcuts (UI-only) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          toast({
                            title: "WhatsApp",
                            description: "Ouverture WhatsApp (à brancher).",
                          })
                        }
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          toast({
                            title: "Email",
                            description: "Ouverture email (à brancher).",
                          })
                        }
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        Email
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          toast({
                            title: "Appeler",
                            description: "Appel (à brancher).",
                          })
                        }
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Appeler
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Aucune ordonnance trouvée</p>
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------
          ACTIONS PALETTE (Ctrl/Cmd+K)
          - Chercher une ordonnance/patient/médicament
          - Sélectionner une ordonnance
          - Lancer une action contextualisée
         ------------------------------------------- */}
      <CommandDialog open={actionsOpen} onOpenChange={setActionsOpen}>
        <CommandInput placeholder="Rechercher une action… (ex: envoyer, pdf, amine, metformine)" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>

          <CommandGroup heading="Général">
            <CommandItem
              value="nouvelle ordonnance créer composer"
              onSelect={() => {
                setActionsOpen(false);
                openNewComposer();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle ordonnance
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>

            <CommandItem
              value="export liste ordonnances csv pdf"
              onSelect={() => {
                setActionsOpen(false);
                toast({ title: "Export", description: "Export de liste (à brancher)." });
              }}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exporter la liste
            </CommandItem>

            <CommandItem
              value="reset recherche filtres"
              onSelect={() => {
                setActionsOpen(false);
                setSearch("");
                setFilter("all");
                toast({ title: "Réinitialisé", description: "Recherche & filtres remis à zéro." });
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réinitialiser (recherche + filtres)
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Ordonnances">
            {prescriptions.slice(0, 10).map((rx) => (
              <CommandItem
                key={rx.id}
                value={`${rx.id} ${rx.patient || ""} ${(rx.items || []).join(" ")} ${rx.status} ${rx.sent ? "envoyée" : "brouillon"}`}
                onSelect={() => {
                  setActionsOpen(false);
                  setSelectedId(rx.id);
                  setExpandedId(rx.id);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span className="font-medium">{rx.id}</span>
                <span className="ml-2 text-muted-foreground truncate">{rx.patient || "—"}</span>
                {rx.sent ? (
                  <Badge className="ml-auto bg-accent/10 text-accent hover:bg-accent/10 text-[11px]">Envoyée</Badge>
                ) : (
                  <Badge className="ml-auto bg-warning/10 text-warning hover:bg-warning/10 text-[11px]">
                    Brouillon
                  </Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions sur l’ordonnance sélectionnée">
            {selectedRx ? (
              <>
                {!selectedRx.sent && (
                  <CommandItem
                    value="envoyer ordonnance sélectionnée"
                    onSelect={() => {
                      setActionsOpen(false);
                      handleSend(selectedRx.id);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                    <CommandShortcut>↵</CommandShortcut>
                  </CommandItem>
                )}

                <CommandItem
                  value="modifier ordonnance sélectionnée"
                  onSelect={() => {
                    setActionsOpen(false);
                    openEditComposer(selectedRx, Boolean(selectedRx.sent));
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {selectedRx.sent ? "Modifier (nouvelle version)" : "Modifier"}
                </CommandItem>

                <CommandItem
                  value="dupliquer ordonnance sélectionnée"
                  onSelect={() => {
                    setActionsOpen(false);
                    handleDuplicate(selectedRx);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Dupliquer
                </CommandItem>

                <CommandItem
                  value="imprimer ordonnance sélectionnée"
                  onSelect={() => {
                    setActionsOpen(false);
                    handlePrint(selectedRx.id);
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </CommandItem>

                <CommandItem
                  value="télécharger pdf ordonnance sélectionnée"
                  onSelect={() => {
                    setActionsOpen(false);
                    handleExportPdf(selectedRx.id);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PDF
                </CommandItem>

                <CommandItem
                  value="copier ordonnance sélectionnée"
                  onSelect={() => {
                    setActionsOpen(false);
                    handleCopy(selectedRx);
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copier
                </CommandItem>
              </>
            ) : (
              <CommandItem value="aucune sélection">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Sélectionne une ordonnance dans la liste pour voir les actions.
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* -------------------------------------------
          COMPOSER (Sheet) — UI workflow in-page
          1. Rédiger → 2. Signer → 3. Envoyer
         ------------------------------------------- */}
      <Sheet
        open={composerOpen}
        onOpenChange={(open) => {
          setComposerOpen(open);
          if (!open) resetComposer();
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl p-0">
          <div className="flex h-full flex-col">
            <SheetHeader className="px-6 py-4 border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-base">
                    {composerMode === "new" ? "Nouvelle ordonnance" : `Modifier ordonnance — ${editingId}`}
                  </SheetTitle>
                  <SheetDescription>Workflow intra-page prêt à brancher (backend plus tard).</SheetDescription>
                </div>

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setComposerOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <StepPills />
                <Badge variant="secondary" className="text-[11px]">
                  Ctrl/Cmd+K pour Actions
                </Badge>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="px-6 py-5 space-y-5">
                {/* Step 1 — Rédiger */}
                {composerStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Patient *</Label>
                        <Input
                          ref={patientInputRef}
                          value={formPatient}
                          onChange={(e) => setFormPatient(e.target.value)}
                          placeholder="Nom du patient"
                          className="h-9 text-xs mt-1"
                        />
                      </div>
                      <div className="flex items-end gap-3">
                        <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                          <Checkbox checked={formCnam} onCheckedChange={(v) => setFormCnam(Boolean(v))} />
                          <span className="inline-flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5 text-primary" />
                            CNAM
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Médicaments</Label>

                      <div className="space-y-2">
                        {formItems.map((item, i) => (
                          <div key={i} className="grid gap-2 grid-cols-2 sm:grid-cols-6 items-center">
                            <Input
                              value={item.medication}
                              onChange={(e) => {
                                const u = [...formItems];
                                u[i].medication = e.target.value;
                                setFormItems(u);
                              }}
                              placeholder="Médicament"
                              className="h-9 text-xs col-span-2 sm:col-span-2"
                            />
                            <Input
                              value={item.dosage}
                              onChange={(e) => {
                                const u = [...formItems];
                                u[i].dosage = e.target.value;
                                setFormItems(u);
                              }}
                              placeholder="Posologie"
                              className="h-9 text-xs col-span-1 sm:col-span-1"
                            />
                            <Input
                              value={item.duration}
                              onChange={(e) => {
                                const u = [...formItems];
                                u[i].duration = e.target.value;
                                setFormItems(u);
                              }}
                              placeholder="Durée"
                              className="h-9 text-xs col-span-1 sm:col-span-1"
                            />
                            <Input
                              value={item.instructions}
                              onChange={(e) => {
                                const u = [...formItems];
                                u[i].instructions = e.target.value;
                                setFormItems(u);
                              }}
                              placeholder="Instructions"
                              className="h-9 text-xs col-span-2 sm:col-span-2"
                            />

                            {formItems.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-destructive"
                                onClick={() => setFormItems((prev) => prev.filter((_, j) => j !== i))}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          setFormItems((prev) => [
                            ...prev,
                            { medication: "", dosage: "", duration: "", instructions: "" },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Ajouter médicament
                      </Button>
                    </div>

                    <div>
                      <Label className="text-xs">Notes / indications</Label>
                      <Textarea
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        rows={3}
                        placeholder="Informations pour le patient / pharmacien…"
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2 — Signer */}
                {composerStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-4">
                      <div className="text-sm font-semibold">Résumé</div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{formPatient || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{todayLabel()}</span>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-1">
                        {formatItems().map((it, idx) => (
                          <div key={idx} className="text-sm flex items-start gap-2">
                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{it}</span>
                          </div>
                        ))}
                      </div>

                      {formNotes.trim() && (
                        <>
                          <Separator className="my-3" />
                          <div className="text-xs text-muted-foreground">
                            Notes : <span className="text-foreground">{formNotes.trim()}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
                      <Checkbox checked={formSigned} onCheckedChange={(v) => setFormSigned(Boolean(v))} />
                      <span>
                        <span className="font-medium">Signature numérique</span>
                        <span className="block text-xs text-muted-foreground">
                          La signature est requise avant l’envoi (traçabilité).
                        </span>
                      </span>
                    </label>

                    {!formSigned && (
                      <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        Cochez la signature pour continuer.
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3 — Envoyer */}
                {composerStep === 3 && (
                  <div className="space-y-4">
                    {/* Status banner if editing a sent one (or after send) */}
                    {selectedRx?.sent && selectedRx.meta?.sentAt && (
                      <div className="rounded-xl border bg-primary/5 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-foreground">Envoyée — {selectedRx.id}</div>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            {selectedRx.meta.sentAt}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Pour modifier : revenez à <span className="font-medium">Rédiger</span>, puis renvoyez
                          (nouvelle version).
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-semibold">Destinataires</div>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                          <Checkbox checked={sendToPatient} onCheckedChange={(v) => setSendToPatient(Boolean(v))} />
                          Envoyer au patient
                        </label>

                        <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
                          <Checkbox checked={sendToPharmacy} onCheckedChange={(v) => setSendToPharmacy(Boolean(v))} />
                          <span className="flex-1">
                            Envoyer à une pharmacie
                            <span className="block text-xs text-muted-foreground">
                              (Mock) Choix pharmacie à brancher plus tard
                            </span>
                          </span>
                        </label>

                        {sendToPharmacy && (
                          <div className="pl-6">
                            <Input
                              value={pharmacyName}
                              onChange={(e) => setPharmacyName(e.target.value)}
                              placeholder="Nom de la pharmacie (optionnel)"
                              className="h-9 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-4">
                      <div className="text-sm font-semibold flex items-center justify-between">
                        <span>Aperçu</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() =>
                            toast({
                              title: "Aperçu",
                              description: "Aperçu plein écran à brancher (ou modal).",
                            })
                          }
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Aperçu
                        </Button>
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-2 text-sm">
                        <div className="text-xs text-muted-foreground">
                          Patient : <span className="text-foreground font-medium">{formPatient || "—"}</span>
                        </div>
                        {formatItems().map((it, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                              {idx + 1}
                            </span>
                            <span>{it}</span>
                          </div>
                        ))}
                        {formCnam && (
                          <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-2 py-1 text-xs text-primary">
                            <Shield className="h-3.5 w-3.5" /> Prise en charge CNAM
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4 flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                {composerStep === 1 && "Renseignez le patient & les médicaments."}
                {composerStep === 2 && "Signature numérique requise avant envoi."}
                {composerStep === 3 && "Choisissez les destinataires puis envoyez."}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    if (composerStep === 1) return setComposerOpen(false);
                    setComposerStep((s) => (s === 3 ? 2 : 1));
                  }}
                >
                  Retour
                </Button>

                {composerStep < 3 ? (
                  <Button
                    size="sm"
                    className="gradient-primary text-primary-foreground shadow-primary-glow text-xs"
                    onClick={() => {
                      if (composerStep === 1) {
                        // validation minimale avant signature
                        if (!formPatient.trim()) {
                          toast({ title: "Patient requis", description: "Veuillez renseigner le patient." });
                          return;
                        }
                        if (!formatItems().length) {
                          toast({ title: "Prescription vide", description: "Ajoutez au moins un médicament." });
                          return;
                        }
                      }
                      if (composerStep === 2 && !formSigned) {
                        toast({ title: "Signature requise", description: "Cochez la signature numérique." });
                        return;
                      }
                      setComposerStep((s) => (s === 1 ? 2 : 3));
                    }}
                  >
                    Continuer
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => upsertDraft()}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Enregistrer
                    </Button>

                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                      onClick={() => sendFromComposer()}
                      disabled={!formSigned || (!sendToPatient && !sendToPharmacy)}
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Envoyer
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
