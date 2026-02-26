import DashboardLayout from "@/components/layout/DashboardLayout";
/**
 * DoctorPatients.tsx
 * Page "Mes patients" — UI Doctolib-like, prête à brancher (mocks + workflows intra-page).
 *
 * Objectifs (UI/UX) :
 * - Pleine largeur (pas de colonne droite)
 * - Barre d’actions sticky (recherche + filtres + actions)
 * - Palette "Actions" (Ctrl/Cmd+K) :
 *   - rechercher un patient → sélectionner → proposer actions contextualisées (WhatsApp/Email/Export/Print/etc.)
 *   - navigation clavier (↑ ↓ Entrée Esc)
 * - Menus actions par patient (kebab) avec workflows pratiques
 *
 * ⚠️ Backend : volontairement non branché. Les actions “export/print/consultation/rdv” sont des placeholders (toast)
 * pour que tu puisses brancher API/Supabase plus tard sans changer l’UI.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Copy,
  Download,
  Droplet,
  Eye,
  FileText,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  Printer,
  Search,
  SortAsc,
  SortDesc,
  Star,
  UserPlus,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { mockPatients } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Patient = (typeof mockPatients)[number];

type PatientFilter = "all" | "recent" | "chronic" | "new";
type SortKey = "name" | "lastVisit" | "age";

/** Parsing "10 Fév 2026" (format mock) -> timestamp pour un tri stable. */
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
    avr: 3,
    mai: 4,
    juin: 5,
    juil: 6,
    aou: 7,
    aoû: 7,
    aout: 7,
    août: 7,
    sep: 8,
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11,
    déc: 11,
  };

  const mon = monthMap[monRaw] ?? monthMap[monRaw.replace(".", "")] ?? 0;
  const ts = Date.UTC(Number.isFinite(year) ? year : 1970, mon, Number.isFinite(day) ? day : 1);
  return Number.isFinite(ts) ? ts : 0;
};

type PaletteGroup = "Patients" | "Patient" | "Global" | "Filtrer" | "Trier";

type PaletteItem = {
  id: string;
  group: PaletteGroup;
  title: string;
  hint?: string;
  disabled?: boolean;
  /** Optionnel : petit texte secondaire (ex : téléphone). */
  meta?: string;
  onRun: () => void;
};

const DoctorPatients = () => {
  const navigate = useNavigate();

  // --- UI state ---
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PatientFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  // Sélection (pour actions rapides au-dessus de la liste)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Favoris (UI)
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // New patient modal
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newForm, setNewForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dob: "",
    bloodType: "A+",
    allergies: "",
    conditions: "",
    cnamId: "",
  });

  // Note rapide (workflow UI)
  const [noteOpen, setNoteOpen] = useState(false);
  const [notePatientId, setNotePatientId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  // --- Refs ---
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // --- Actions palette (Ctrl/Cmd+K) ---
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsQ, setActionsQ] = useState("");
  const [actionsIndex, setActionsIndex] = useState(0);
  const actionsInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Palette : patient “contexte” (peut être différent de la sélection en page).
   * UX : tu tapes un nom → tu sélectionnes le patient → la palette te propose les actions pour ce patient.
   */
  const [palettePatientId, setPalettePatientId] = useState<number | null>(null);

  const selectedPatient = useMemo(
    () => (selectedPatientId ? patients.find((p) => p.id === selectedPatientId) : null),
    [patients, selectedPatientId],
  );

  const palettePatient = useMemo(
    () => (palettePatientId ? patients.find((p) => p.id === palettePatientId) : null),
    [patients, palettePatientId],
  );

  // --- Helpers ---
  const isFavorite = (id: number) => favoriteIds.includes(id);

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
    toast({
      title: "Favoris",
      description: prevIncludes(favoriteIds, id) ? "Retiré des favoris." : "Ajouté aux favoris.",
    });
  };

  /** Helper : copie presse-papiers */
  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copié", description: `${label} copié dans le presse‑papiers.` });
    } catch {
      toast({ title: "Copie impossible", description: "Votre navigateur a bloqué la copie.", variant: "destructive" });
    }
  };

  /** Helpers contact (UI) — prêt à brancher */
  const openPhone = (phone: string) => {
    if (!phone) {
      toast({ title: "Téléphone", description: "Numéro manquant.", variant: "destructive" });
      return;
    }
    window.open(`tel:${phone.replace(/\s+/g, "")}`, "_self");
  };

  const openEmail = (email?: string, name?: string) => {
    if (!email) {
      toast({ title: "Email", description: "Adresse email manquante.", variant: "destructive" });
      return;
    }
    const subject = encodeURIComponent(`Suivi médical — ${name || "Patient"}`);
    window.open(`mailto:${email}?subject=${subject}`, "_self");
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) {
      toast({ title: "WhatsApp", description: "Numéro manquant.", variant: "destructive" });
      return;
    }
    const digits = phone.replace(/\D+/g, "");
    if (!digits) {
      toast({ title: "WhatsApp", description: "Numéro invalide.", variant: "destructive" });
      return;
    }
    window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
  };

  const exportPatientRecord = (p: Patient) => {
    toast({ title: "Exporter dossier", description: `Export PDF à brancher — ${p.name}.` });
  };

  const printPatientRecord = (p: Patient) => {
    toast({ title: "Imprimer dossier", description: `Impression à brancher — ${p.name}.` });
  };

  const planAppointment = (p: Patient) => {
    toast({ title: "Planifier RDV", description: `Workflow RDV à brancher — ${p.name}.` });
  };

  const startConsultation = (p: Patient) => {
    toast({ title: "Consultation", description: `Workflow consultation à brancher — ${p.name}.` });
  };

  const openQuickNote = (p: Patient) => {
    setNotePatientId(p.id);
    setNoteText("");
    setNoteOpen(true);
  };

  const saveQuickNote = () => {
    if (!notePatientId) return;
    const text = noteText.trim();
    if (!text) {
      toast({ title: "Note", description: "Écrivez une note avant d’enregistrer.", variant: "destructive" });
      return;
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== notePatientId) return p;
        const prevNote = (p.notes || "").trim();
        const stamp = new Date().toLocaleString();
        const merged = prevNote ? `${prevNote}\n\n— ${stamp}\n${text}` : `— ${stamp}\n${text}`;
        return { ...p, notes: merged };
      }),
    );

    toast({ title: "Note enregistrée", description: "Ajoutée au dossier (mock)." });
    setNoteOpen(false);
  };

  /** Export CSV (mock) */
  const handleExportCSV = () => {
    const header = "Nom,Âge,Téléphone,Email,Pathologies,Allergies,Dernière visite,Prochain RDV\n";
    const rows = sortedPatients
      .map((p) => {
        const pathos = p.chronicConditions.join(";");
        const allergies = p.allergies.map((a) => a.name).join(";");
        return `"${p.name}",${p.age},"${p.phone}","${p.email}","${pathos}","${allergies}","${p.lastVisit || "—"}","${
          p.nextAppointment || "—"
        }"`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patients.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Export CSV", description: "Fichier généré (mock)." });
  };

  /** Ajout patient (mock) */
  const handleAddPatient = () => {
    if (!newForm.firstName || !newForm.lastName) return;

    const name = `${newForm.firstName} ${newForm.lastName}`;
    const avatar = `${newForm.firstName[0]}${newForm.lastName[0]}`.toUpperCase();

    const newP: Patient = {
      id: patients.length + 100,
      name,
      avatar,
      age: newForm.dob ? Math.floor((Date.now() - new Date(newForm.dob).getTime()) / 31557600000) : 0,
      gender: "",
      dob: newForm.dob,
      address: "",
      ssn: "",
      mutuelle: "",
      treatingDoctor: "",
      registeredSince: "Fév 2026",
      conditions: [],
      gouvernorat: "",
      balance: 0,
      notes: "",
      phone: newForm.phone,
      email: newForm.email,
      chronicConditions: newForm.conditions
        ? newForm.conditions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      allergies: newForm.allergies
        ? newForm.allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((name) => ({ name, severity: "Modéré" }))
        : [],
      isNew: true,
      lastVisit: null,
      nextAppointment: null,
      lastVitals: { ta: "—", glycemia: "—" },
      bloodType: newForm.bloodType,
      cnamId: newForm.cnamId,
    };

    setPatients((prev) => [newP, ...prev]);
    setSelectedPatientId(newP.id);
    setShowNewPatient(false);

    setNewForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dob: "",
      bloodType: "A+",
      allergies: "",
      conditions: "",
      cnamId: "",
    });

    toast({ title: "Patient créé", description: `${newP.name} (mock).` });
  };

  /** Toggle tri : même clé -> inverse l'ordre */
  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc((v) => !v);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  /** Filtrage côté UI (mock) */
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchPhone = (p.phone || "").includes(search.trim());
        const matchEmail = (p.email || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail) return false;
      }

      if (filter === "recent") return p.lastVisit !== null;
      if (filter === "chronic") return p.chronicConditions.length > 0;
      if (filter === "new") return p.isNew;
      return true;
    });
  }, [patients, search, filter]);

  /** Tri (name/age/lastVisit) */
  const sortedPatients = useMemo(() => {
    const dir = sortAsc ? 1 : -1;
    return [...filteredPatients].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (sortBy === "age") return (a.age - b.age) * dir;

      // lastVisit : null -> "plus ancien"
      const ta = parseFrDate(a.lastVisit);
      const tb = parseFrDate(b.lastVisit);
      return (ta - tb) * dir;
    });
  }, [filteredPatients, sortBy, sortAsc]);

  /**
   * Palette : suggestions patient quand on tape un nom/tel/email.
   * Affichées uniquement quand aucun patient n'est "locké" dans la palette.
   */
  const palettePatientMatches = useMemo(() => {
    if (palettePatientId) return [];
    const q = actionsQ.trim().toLowerCase();
    if (!q) return [];

    return patients
      .filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchPhone = (p.phone || "").replace(/\s+/g, "").includes(q.replace(/\s+/g, ""));
        const matchEmail = (p.email || "").toLowerCase().includes(q);
        return matchName || matchPhone || matchEmail;
      })
      .slice(0, 7);
  }, [actionsQ, patients, palettePatientId]);

  /** Palette : items (actions) */
  const paletteItems = useMemo<PaletteItem[]>(() => {
    const q = actionsQ.trim().toLowerCase();

    const items: PaletteItem[] = [];

    // 1) Patients (résultats de recherche)
    for (const p of palettePatientMatches) {
      items.push({
        id: `patient-hit-${p.id}`,
        group: "Patients",
        title: p.name,
        hint: "Sélectionner ce patient",
        meta: p.phone || p.email || "",
        onRun: () => {
          // On “lock” le patient dans la palette + on le sélectionne sur la page (workflow intra-page)
          setPalettePatientId(p.id);
          setSelectedPatientId(p.id);
          setActionsQ("");
          setActionsIndex(0);
        },
      });
    }

    // 2) Patient contextualisé
    if (palettePatient) {
      const p = palettePatient;

      items.push({
        id: "patient-change",
        group: "Patient",
        title: "Changer de patient",
        hint: "Revenir à la recherche",
        onRun: () => {
          setPalettePatientId(null);
          setActionsQ("");
          setActionsIndex(0);
        },
      });

      items.push({
        id: "patient-open-record",
        group: "Patient",
        title: "Ouvrir le dossier",
        hint: "Voir le dossier complet",
        onRun: () => {
          setActionsOpen(false);
          navigate(`/dashboard/doctor/patients/${p.id}`);
        },
      });

      items.push({
        id: "patient-plan-appointment",
        group: "Patient",
        title: "Planifier un RDV",
        hint: "Workflow RDV (UI)",
        onRun: () => {
          setActionsOpen(false);
          planAppointment(p);
        },
      });

      items.push({
        id: "patient-start-consult",
        group: "Patient",
        title: "Démarrer une consultation",
        hint: "Workflow consultation (UI)",
        onRun: () => {
          setActionsOpen(false);
          startConsultation(p);
        },
      });

      items.push({
        id: "patient-note",
        group: "Patient",
        title: "Ajouter une note rapide",
        hint: "Intra‑page",
        onRun: () => {
          setActionsOpen(false);
          openQuickNote(p);
        },
      });

      items.push({
        id: "patient-call",
        group: "Patient",
        title: "Appeler",
        hint: p.phone,
        onRun: () => {
          setActionsOpen(false);
          openPhone(p.phone);
        },
      });

      items.push({
        id: "patient-whatsapp",
        group: "Patient",
        title: "Contacter WhatsApp",
        hint: "Ouvrir wa.me",
        onRun: () => {
          setActionsOpen(false);
          openWhatsApp(p.phone);
        },
      });

      items.push({
        id: "patient-email",
        group: "Patient",
        title: "Contacter par email",
        hint: "mailto:",
        disabled: !p.email,
        onRun: () => {
          setActionsOpen(false);
          openEmail(p.email, p.name);
        },
      });

      items.push({
        id: "patient-export",
        group: "Patient",
        title: "Exporter le dossier (PDF)",
        hint: "À brancher",
        onRun: () => {
          setActionsOpen(false);
          exportPatientRecord(p);
        },
      });

      items.push({
        id: "patient-print",
        group: "Patient",
        title: "Imprimer le dossier",
        hint: "À brancher",
        onRun: () => {
          setActionsOpen(false);
          printPatientRecord(p);
        },
      });

      items.push({
        id: "patient-copy-phone",
        group: "Patient",
        title: "Copier téléphone",
        hint: "Presse‑papiers",
        onRun: () => {
          setActionsOpen(false);
          copyToClipboard("Téléphone", p.phone);
        },
      });

      items.push({
        id: "patient-copy-email",
        group: "Patient",
        title: "Copier email",
        hint: "Presse‑papiers",
        disabled: !p.email,
        onRun: () => {
          setActionsOpen(false);
          copyToClipboard("Email", p.email || "");
        },
      });

      items.push({
        id: "patient-fav",
        group: "Patient",
        title: isFavorite(p.id) ? "Retirer des favoris" : "Ajouter aux favoris",
        hint: "Marque‑page",
        onRun: () => {
          setActionsOpen(false);
          setFavoriteIds((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [p.id, ...prev]));
          toast({ title: "Favoris", description: prevIncludes(favoriteIds, p.id) ? "Retiré." : "Ajouté." });
        },
      });
    }

    // 3) Global
    items.push(
      {
        id: "global-new-patient",
        group: "Global",
        title: "Nouveau patient",
        hint: "Créer une fiche",
        onRun: () => {
          setActionsOpen(false);
          setShowNewPatient(true);
        },
      },
      {
        id: "global-focus-search",
        group: "Global",
        title: "Rechercher dans la liste",
        hint: "Focus sur le champ recherche",
        onRun: () => {
          setActionsOpen(false);
          searchInputRef.current?.focus();
        },
      },
      {
        id: "global-export-csv",
        group: "Global",
        title: "Exporter CSV",
        hint: "Liste filtrée",
        onRun: () => {
          setActionsOpen(false);
          handleExportCSV();
        },
      },
      {
        id: "global-clear-search",
        group: "Global",
        title: "Effacer la recherche",
        hint: "Réinitialiser",
        disabled: !search.trim(),
        onRun: () => {
          setActionsOpen(false);
          setSearch("");
          toast({ title: "Recherche", description: "Réinitialisée." });
        },
      },
    );

    // 4) Filtrer
    items.push(
      {
        id: "filter-all",
        group: "Filtrer",
        title: "Filtre : Tous",
        hint: "Afficher tout",
        onRun: () => {
          setActionsOpen(false);
          setFilter("all");
        },
      },
      {
        id: "filter-recent",
        group: "Filtrer",
        title: "Filtre : Récents",
        hint: "Dernière visite",
        onRun: () => {
          setActionsOpen(false);
          setFilter("recent");
        },
      },
      {
        id: "filter-chronic",
        group: "Filtrer",
        title: "Filtre : Chroniques",
        hint: "Pathologies",
        onRun: () => {
          setActionsOpen(false);
          setFilter("chronic");
        },
      },
      {
        id: "filter-new",
        group: "Filtrer",
        title: "Filtre : Nouveaux",
        hint: "Nouveaux patients",
        onRun: () => {
          setActionsOpen(false);
          setFilter("new");
        },
      },
    );

    // 5) Trier
    items.push(
      {
        id: "sort-name",
        group: "Trier",
        title: "Trier : Nom",
        hint: sortBy === "name" ? (sortAsc ? "A → Z" : "Z → A") : "Activer",
        onRun: () => {
          setActionsOpen(false);
          toggleSort("name");
        },
      },
      {
        id: "sort-age",
        group: "Trier",
        title: "Trier : Âge",
        hint: sortBy === "age" ? (sortAsc ? "Croissant" : "Décroissant") : "Activer",
        onRun: () => {
          setActionsOpen(false);
          toggleSort("age");
        },
      },
      {
        id: "sort-last-visit",
        group: "Trier",
        title: "Trier : Dernière visite",
        hint: sortBy === "lastVisit" ? (sortAsc ? "Ancien → Récent" : "Récent → Ancien") : "Activer",
        onRun: () => {
          setActionsOpen(false);
          toggleSort("lastVisit");
        },
      },
    );

    // Filtrage par query (sur title/hint/meta)
    if (!q) return items;

    return items.filter((it) => {
      const t = it.title.toLowerCase();
      const h = (it.hint || "").toLowerCase();
      const m = (it.meta || "").toLowerCase();
      return t.includes(q) || h.includes(q) || m.includes(q);
    });
  }, [
    actionsQ,
    favoriteIds,
    filter,
    handleExportCSV,
    navigate,
    palettePatient,
    palettePatientId,
    palettePatientMatches,
    patients,
    search,
    sortAsc,
    sortBy,
  ]);

  /** Palette : sections groupées pour le rendu */
  const paletteSections = useMemo(() => {
    const order: PaletteGroup[] = palettePatient
      ? ["Patient", "Global", "Filtrer", "Trier"]
      : ["Patients", "Global", "Filtrer", "Trier"];

    const map = new Map<PaletteGroup, PaletteItem[]>();
    for (const g of order) map.set(g, []);
    for (const a of paletteItems) map.get(a.group)?.push(a);

    return order.map((g) => ({ group: g, items: map.get(g) || [] })).filter((s) => s.items.length > 0);
  }, [paletteItems, palettePatient]);

  /** Palette : flat list pour navigation clavier */
  const paletteFlat = useMemo(() => paletteItems, [paletteItems]);

  const openPalette = () => {
    setActionsOpen(true);
    setActionsQ("");
    setActionsIndex(0);
    // UX : si un patient est déjà sélectionné sur la page, on le pré-sélectionne dans la palette
    setPalettePatientId(selectedPatientId ?? null);
  };

  /** Keybindings : Ctrl/Cmd+K (palette), "/" (focus search), Esc */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K");
      if (isCmdK) {
        e.preventDefault();
        openPalette();
        return;
      }

      // Focus la recherche avec "/" (si pas dans un input)
      if (e.key === "/" && !actionsOpen) {
        const target = e.target as HTMLElement | null;
        const isTyping =
          target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || (target as any).isContentEditable);
        if (!isTyping) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }

      // Navigation clavier dans la palette
      if (!actionsOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setActionsOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActionsIndex((i) => Math.min(i + 1, Math.max(0, paletteFlat.length - 1)));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActionsIndex((i) => Math.max(i - 1, 0));
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const chosen = paletteFlat[actionsIndex];
        if (chosen && !chosen.disabled) chosen.onRun();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actionsOpen, actionsIndex, paletteFlat, selectedPatientId]);

  /** Focus auto sur le champ de recherche quand la palette s'ouvre */
  useEffect(() => {
    if (!actionsOpen) return;
    const t = window.setTimeout(() => actionsInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [actionsOpen]);

  // --- Render ---
  return (
    <DashboardLayout role="doctor" title="Mes patients">
      <div className="space-y-6">
        {/* Sticky controls */}
        <div className="sticky top-0 z-20 -mx-1 px-1 pt-2 pb-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Rechercher un patient (nom, téléphone, email)…  (raccourci : /)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            <div className="flex gap-2 flex-wrap items-center justify-end">
              {/* Segmented filter */}
              <div className="flex gap-1 rounded-lg border bg-card p-0.5">
                {[
                  { key: "all" as PatientFilter, label: "Tous" },
                  { key: "recent" as PatientFilter, label: "Récents" },
                  { key: "chronic" as PatientFilter, label: "Chroniques" },
                  { key: "new" as PatientFilter, label: "Nouveaux" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      filter === f.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Actions palette */}
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                title="Raccourci : Ctrl/Cmd+K"
                onClick={openPalette}
              >
                <Search className="h-3.5 w-3.5 mr-1" />
                Actions
              </Button>

              <Button variant="outline" size="sm" className="text-xs" onClick={handleExportCSV}>
                <Download className="h-3.5 w-3.5 mr-1" />
                Export CSV
              </Button>

              <Button
                size="sm"
                className="gradient-primary text-primary-foreground shadow-primary-glow text-xs"
                onClick={() => setShowNewPatient(true)}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Nouveau patient
              </Button>
            </div>
          </div>

          {/* Sort controls */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Trier :</span>

            {[
              { key: "name" as SortKey, label: "Nom" },
              { key: "age" as SortKey, label: "Âge" },
              { key: "lastVisit" as SortKey, label: "Dernière visite" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => toggleSort(s.key)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                  sortBy === s.key ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                }`}
              >
                {s.label}
                {sortBy === s.key && (sortAsc ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
              </button>
            ))}

            <span className="ml-auto text-muted-foreground">{sortedPatients.length} patient(s)</span>
          </div>
        </div>

        {/* Stats (compact, utiles) */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className="text-xl font-bold text-foreground">{patients.length}</p>
            <p className="text-[11px] text-muted-foreground">Total patients</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className="text-xl font-bold text-primary">
              {patients.filter((p) => p.chronicConditions.length > 0).length}
            </p>
            <p className="text-[11px] text-muted-foreground">Chroniques</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className="text-xl font-bold text-accent">{patients.filter((p) => p.nextAppointment).length}</p>
            <p className="text-[11px] text-muted-foreground">RDV planifiés</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className="text-xl font-bold text-warning">{patients.filter((p) => p.isNew).length}</p>
            <p className="text-[11px] text-muted-foreground">Nouveaux</p>
          </div>
        </div>

        {/* Patient sélectionné (actions rapides) */}
        {selectedPatient && (
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                  {selectedPatient.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{selectedPatient.name}</p>
                    {isFavorite(selectedPatient.id) && <Star className="h-4 w-4 text-warning fill-warning" />}
                    <span className="text-xs text-muted-foreground shrink-0">{selectedPatient.age} ans</span>
                    {selectedPatient.nextAppointment && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-medium shrink-0">
                        <Calendar className="h-3 w-3" />
                        {selectedPatient.nextAppointment}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedPatient.chronicConditions.slice(0, 2).map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                    {selectedPatient.allergies.slice(0, 1).map((a) => (
                      <span
                        key={a.name}
                        className="flex items-center gap-0.5 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"
                      >
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {a.name}
                      </span>
                    ))}
                    {selectedPatient.lastVisit && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        Dernière visite : {selectedPatient.lastVisit}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:ml-auto" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => openPhone(selectedPatient.phone)}
                >
                  <Phone className="mr-1 h-3.5 w-3.5" /> Appeler
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => openWhatsApp(selectedPatient.phone)}
                >
                  <MessageSquare className="mr-1 h-3.5 w-3.5" /> WhatsApp
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={!selectedPatient.email}
                  onClick={() => openEmail(selectedPatient.email, selectedPatient.name)}
                >
                  <Mail className="mr-1 h-3.5 w-3.5" /> Email
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => planAppointment(selectedPatient)}
                >
                  <Calendar className="mr-1 h-3.5 w-3.5" /> RDV
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => startConsultation(selectedPatient)}
                >
                  <FileText className="mr-1 h-3.5 w-3.5" /> Consulter
                </Button>

                <Button variant="outline" size="sm" className="text-xs" onClick={() => openQuickNote(selectedPatient)}>
                  <FileText className="mr-1 h-3.5 w-3.5" /> Note
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => exportPatientRecord(selectedPatient)}
                >
                  <Download className="mr-1 h-3.5 w-3.5" /> Export
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => printPatientRecord(selectedPatient)}
                >
                  <Printer className="mr-1 h-3.5 w-3.5" /> Imprimer
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    setFavoriteIds((prev) =>
                      prev.includes(selectedPatient.id)
                        ? prev.filter((x) => x !== selectedPatient.id)
                        : [selectedPatient.id, ...prev],
                    )
                  }
                >
                  <Star
                    className={`mr-1 h-3.5 w-3.5 ${isFavorite(selectedPatient.id) ? "fill-warning text-warning" : ""}`}
                  />
                  Favori
                </Button>

                <Link to={`/dashboard/doctor/patients/${selectedPatient.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Ouvrir <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Désélectionner"
                  onClick={() => setSelectedPatientId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Liste (pleine largeur) */}
        <div className="space-y-3">
          {sortedPatients.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer group ${
                selectedPatientId === p.id ? "ring-2 ring-primary border-primary/30" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar (click -> dossier) */}
                <Link
                  to={`/dashboard/doctor/patients/${p.id}`}
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 hover:opacity-80 transition-opacity ${
                    p.isNew
                      ? "bg-warning/10 text-warning border-2 border-warning/30"
                      : "gradient-primary text-primary-foreground"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {p.avatar}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          to={`/dashboard/doctor/patients/${p.id}`}
                          className="font-semibold text-foreground text-sm hover:text-primary transition-colors truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.name}
                        </Link>

                        {isFavorite(p.id) && <Star className="h-4 w-4 text-warning fill-warning" />}

                        <span className="text-xs text-muted-foreground">
                          {p.age} ans{p.gouvernorat ? ` • ${p.gouvernorat}` : ""}
                        </span>

                        {p.isNew && (
                          <span className="text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                            Nouveau
                          </span>
                        )}

                        {p.nextAppointment && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-medium">
                            <Calendar className="h-3 w-3" />
                            {p.nextAppointment}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {p.chronicConditions.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                          >
                            {c}
                          </span>
                        ))}
                        {p.chronicConditions.length > 2 && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            +{p.chronicConditions.length - 2}
                          </span>
                        )}
                        {p.allergies.slice(0, 1).map((a) => (
                          <span
                            key={a.name}
                            className="flex items-center gap-0.5 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {a.name}
                          </span>
                        ))}
                        {p.allergies.length > 1 && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            +{p.allergies.length - 1}
                          </span>
                        )}
                        {p.lastVisit && (
                          <span className="text-[11px] text-muted-foreground">Dernière visite : {p.lastVisit}</span>
                        )}
                      </div>
                    </div>

                    {/* Row actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/dashboard/doctor/patients/${p.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Ouvrir <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Actions patient">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-72">
                          <DropdownMenuLabel className="text-xs">Actions patient</DropdownMenuLabel>

                          <DropdownMenuItem
                            className="text-xs"
                            onClick={() => navigate(`/dashboard/doctor/patients/${p.id}`)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-2" /> Ouvrir dossier
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-xs" onClick={() => planAppointment(p)}>
                            <Calendar className="h-3.5 w-3.5 mr-2" /> Planifier RDV
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-xs" onClick={() => startConsultation(p)}>
                            <FileText className="h-3.5 w-3.5 mr-2" /> Démarrer consultation
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-xs" onClick={() => openQuickNote(p)}>
                            <FileText className="h-3.5 w-3.5 mr-2" /> Ajouter note rapide
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground">Contact</DropdownMenuLabel>

                          <DropdownMenuItem className="text-xs" onClick={() => openPhone(p.phone)}>
                            <Phone className="h-3.5 w-3.5 mr-2" /> Appeler
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-xs" onClick={() => openWhatsApp(p.phone)}>
                            <MessageSquare className="h-3.5 w-3.5 mr-2" /> WhatsApp
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-xs"
                            disabled={!p.email}
                            onClick={() => openEmail(p.email, p.name)}
                          >
                            <Mail className="h-3.5 w-3.5 mr-2" /> Email
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground">Dossier</DropdownMenuLabel>

                          <DropdownMenuItem className="text-xs" onClick={() => exportPatientRecord(p)}>
                            <Download className="h-3.5 w-3.5 mr-2" /> Exporter dossier (PDF)
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-xs" onClick={() => printPatientRecord(p)}>
                            <Printer className="h-3.5 w-3.5 mr-2" /> Imprimer dossier
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground">Pratique</DropdownMenuLabel>

                          <DropdownMenuItem className="text-xs" onClick={() => copyToClipboard("Téléphone", p.phone)}>
                            <Copy className="h-3.5 w-3.5 mr-2" /> Copier téléphone
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-xs"
                            disabled={!p.email}
                            onClick={() => copyToClipboard("Email", p.email || "")}
                          >
                            <Copy className="h-3.5 w-3.5 mr-2" /> Copier email
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-xs"
                            onClick={() => {
                              setFavoriteIds((prev) =>
                                prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [p.id, ...prev],
                              );
                              toast({ title: "Favoris", description: isFavorite(p.id) ? "Retiré." : "Ajouté." });
                            }}
                          >
                            <Star
                              className={`h-3.5 w-3.5 mr-2 ${isFavorite(p.id) ? "fill-warning text-warning" : ""}`}
                            />
                            {isFavorite(p.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {p.phone}
                    </span>

                    {p.email && (
                      <span className="flex items-center gap-1 min-w-0">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[220px]">{p.email}</span>
                      </span>
                    )}

                    {p.lastVitals.ta !== "—" && (
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        TA {p.lastVitals.ta}
                      </span>
                    )}

                    {p.lastVitals.glycemia !== "—" && (
                      <span className="flex items-center gap-1">
                        <Droplet className="h-3 w-3" />
                        Glycémie {p.lastVitals.glycemia}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {sortedPatients.length === 0 && (
            <div className="rounded-xl border bg-card p-8 text-center">
              <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Aucun patient trouvé</p>
              <p className="text-xs text-muted-foreground mt-1">Essayez un autre filtre ou modifiez la recherche.</p>
            </div>
          )}
        </div>

        {/* Actions palette modal */}
        {actionsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setActionsOpen(false)}
          >
            <div
              className="bg-card rounded-xl border shadow-elevated w-full max-w-xl mx-4 animate-scale-in overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={actionsInputRef}
                      value={actionsQ}
                      onChange={(e) => {
                        setActionsQ(e.target.value);
                        setActionsIndex(0);
                      }}
                      placeholder={
                        palettePatient
                          ? `Action pour ${palettePatient.name}… (ex : WhatsApp, export, note)`
                          : "Rechercher un patient ou une action… (ex : Amine, WhatsApp, exporter)"
                      }
                      className="pl-10 h-10"
                    />
                  </div>

                  {palettePatient && (
                    <button
                      className="rounded-lg border bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setPalettePatientId(null);
                        setActionsQ("");
                        setActionsIndex(0);
                      }}
                      title="Changer de patient"
                    >
                      {palettePatient.avatar} · Changer
                    </button>
                  )}

                  <span className="rounded-lg border bg-muted px-2 py-1 text-[11px] text-muted-foreground">Ctrl+K</span>
                </div>

                {!palettePatient && (
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Astuce : tape un nom/téléphone/email → Entrée pour sélectionner le patient → actions
                    contextualisées.
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="max-h-[52vh] overflow-y-auto">
                {paletteSections.map((section) => (
                  <div key={section.group} className="py-2">
                    <div className="px-4 py-1 text-[11px] font-semibold text-muted-foreground">{section.group}</div>
                    <div className="px-2">
                      {section.items.map((a) => {
                        const idx = paletteFlat.findIndex((x) => x.id === a.id);
                        const active = idx === actionsIndex;

                        return (
                          <button
                            key={a.id}
                            disabled={a.disabled}
                            onMouseEnter={() => setActionsIndex(idx)}
                            onClick={() => !a.disabled && a.onRun()}
                            className={`w-full rounded-xl px-3 py-2 text-left transition-colors ${
                              a.disabled
                                ? "opacity-50 cursor-not-allowed"
                                : active
                                  ? "bg-primary/10"
                                  : "hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">{a.title}</div>
                                {a.meta && <div className="text-[11px] text-muted-foreground truncate">{a.meta}</div>}
                              </div>
                              <div className="text-xs text-muted-foreground">{a.hint}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {paletteFlat.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-sm font-medium text-foreground">Aucune action</p>
                    <p className="text-xs text-muted-foreground mt-1">Essayez un autre mot-clé.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t flex items-center justify-between">
                <div className="text-xs text-muted-foreground">↑↓ naviguer · Entrée lancer · Esc fermer</div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setActionsOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick note modal */}
        {noteOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setNoteOpen(false)}
          >
            <div
              className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-lg mx-4 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-foreground">Note rapide</h3>
                <button onClick={() => setNoteOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                Cette note sera ajoutée au dossier (mock) avec horodatage. À brancher plus tard sur ton backend.
              </p>

              <textarea
                className="w-full min-h-[140px] rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ex : Patient stable, renouvellement traitement, contrôle HbA1c…"
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setNoteOpen(false)}>
                  Annuler
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  onClick={saveQuickNote}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New patient modal */}
        {showNewPatient && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowNewPatient(false)}
          >
            <div
              className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-lg mx-4 animate-scale-in max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Nouveau patient
                </h3>
                <button
                  onClick={() => setShowNewPatient(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Prénom *</Label>
                    <Input
                      value={newForm.firstName}
                      onChange={(e) => setNewForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="mt-1 h-9"
                      placeholder="Prénom"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Nom *</Label>
                    <Input
                      value={newForm.lastName}
                      onChange={(e) => setNewForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="mt-1 h-9"
                      placeholder="Nom"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Date de naissance</Label>
                    <Input
                      type="date"
                      value={newForm.dob}
                      onChange={(e) => setNewForm((f) => ({ ...f, dob: e.target.value }))}
                      className="mt-1 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Téléphone</Label>
                    <Input
                      value={newForm.phone}
                      onChange={(e) => setNewForm((f) => ({ ...f, phone: e.target.value }))}
                      className="mt-1 h-9"
                      placeholder="+216 XX XXX XXX"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={newForm.email}
                      onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))}
                      className="mt-1 h-9"
                      placeholder="email@..."
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Groupe sanguin</Label>
                    <Input
                      value={newForm.bloodType}
                      onChange={(e) => setNewForm((f) => ({ ...f, bloodType: e.target.value }))}
                      className="mt-1 h-9"
                      placeholder="A+"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Allergies (séparées par des virgules)</Label>
                    <Input
                      value={newForm.allergies}
                      onChange={(e) => setNewForm((f) => ({ ...f, allergies: e.target.value }))}
                      className="mt-1 h-9"
                      placeholder="Pénicilline, AINS..."
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Pathologies chroniques (séparées par des virgules)</Label>
                    <Input
                      value={newForm.conditions}
                      onChange={(e) => setNewForm((f) => ({ ...f, conditions: e.target.value }))}
                      className="mt-1 h-9"
                      placeholder="Diabète type 2, HTA..."
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs">Identifiant CNAM (optionnel)</Label>
                    <Input
                      value={newForm.cnamId}
                      onChange={(e) => setNewForm((f) => ({ ...f, cnamId: e.target.value }))}
                      className="mt-1 h-9"
                      placeholder="CNAM..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowNewPatient(false)}>
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                    onClick={handleAddPatient}
                    disabled={!newForm.firstName || !newForm.lastName}
                  >
                    Créer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

/**
 * Petit helper : évite les warnings quand on veut “utiliser” un state dans toast juste après setState.
 * On ne “dépend” pas de ce helper côté backend, c’est juste UX.
 */
const prevIncludes = (arr: number[], id: number) => arr.includes(id);

export default DoctorPatients;
