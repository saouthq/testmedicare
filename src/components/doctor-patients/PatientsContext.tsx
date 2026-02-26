import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { mockPatients, type Patient } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { parseFrDate } from "@/components/consultation/helpers";

// ── Types ──

export type PatientFilter = "all" | "recent" | "chronic" | "new";
export type SortKey = "name" | "lastVisit" | "age";

type PaletteGroup = "Patients" | "Patient" | "Global" | "Filtrer" | "Trier";

export type PaletteItem = {
  id: string;
  group: PaletteGroup;
  title: string;
  hint?: string;
  disabled?: boolean;
  meta?: string;
  onRun: () => void;
};

export type NewPatientForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  cnamId: string;
};

const emptyNewForm: NewPatientForm = {
  firstName: "", lastName: "", phone: "", email: "",
  dob: "", bloodType: "A+", allergies: "", conditions: "", cnamId: "",
};

// ── Context Shape ──

interface PatientsCtx {
  patients: Patient[];
  search: string; setSearch: (v: string) => void;
  filter: PatientFilter; setFilter: (v: PatientFilter) => void;
  sortBy: SortKey; sortAsc: boolean; toggleSort: (key: SortKey) => void;
  sortedPatients: Patient[];
  selectedPatientId: number | null; setSelectedPatientId: (v: number | null) => void;
  selectedPatient: Patient | null;
  favoriteIds: number[]; isFavorite: (id: number) => boolean; toggleFavorite: (id: number) => void;
  // New patient
  showNewPatient: boolean; setShowNewPatient: (v: boolean) => void;
  newForm: NewPatientForm; setNewForm: React.Dispatch<React.SetStateAction<NewPatientForm>>;
  handleAddPatient: () => void;
  // Quick note
  noteOpen: boolean; setNoteOpen: (v: boolean) => void;
  noteText: string; setNoteText: (v: string) => void;
  notePatientId: number | null;
  openQuickNote: (p: Patient) => void;
  saveQuickNote: () => void;
  // Palette
  actionsOpen: boolean; setActionsOpen: (v: boolean) => void;
  actionsQ: string; setActionsQ: (v: string) => void;
  actionsIndex: number; setActionsIndex: React.Dispatch<React.SetStateAction<number>>;
  actionsInputRef: React.RefObject<HTMLInputElement | null>;
  paletteSections: { group: PaletteGroup; items: PaletteItem[] }[];
  paletteFlat: PaletteItem[];
  palettePatient: Patient | null;
  openPalette: () => void;
  // Actions
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  openPhone: (phone: string) => void;
  openWhatsApp: (phone: string) => void;
  openEmail: (email?: string, name?: string) => void;
  exportPatientRecord: (p: Patient) => void;
  printPatientRecord: (p: Patient) => void;
  planAppointment: (p: Patient) => void;
  startConsultation: (p: Patient) => void;
  copyToClipboard: (label: string, value: string) => Promise<void>;
  handleExportCSV: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

const Ctx = createContext<PatientsCtx | null>(null);
export const usePatients = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePatients must be used within PatientsProvider");
  return ctx;
};

// ── Provider ──

export function PatientsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PatientFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newForm, setNewForm] = useState<NewPatientForm>(emptyNewForm);
  const [noteOpen, setNoteOpen] = useState(false);
  const [notePatientId, setNotePatientId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Palette
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsQ, setActionsQ] = useState("");
  const [actionsIndex, setActionsIndex] = useState(0);
  const actionsInputRef = useRef<HTMLInputElement | null>(null);
  const [palettePatientId, setPalettePatientId] = useState<number | null>(null);

  const selectedPatient = useMemo(
    () => (selectedPatientId ? patients.find((p) => p.id === selectedPatientId) ?? null : null),
    [patients, selectedPatientId],
  );

  const palettePatient = useMemo(
    () => (palettePatientId ? patients.find((p) => p.id === palettePatientId) ?? null : null),
    [patients, palettePatientId],
  );

  const isFavorite = (id: number) => favoriteIds.includes(id);

  const toggleFavorite = (id: number) => {
    const was = favoriteIds.includes(id);
    setFavoriteIds((prev) => (was ? prev.filter((x) => x !== id) : [id, ...prev]));
    toast({ title: "Favoris", description: was ? "Retiré des favoris." : "Ajouté aux favoris." });
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc((v) => !v);
    else { setSortBy(key); setSortAsc(true); }
  };

  // ── Helpers ──
  const copyToClipboard = async (label: string, value: string) => {
    try { await navigator.clipboard.writeText(value); toast({ title: "Copié", description: `${label} copié dans le presse‑papiers.` }); }
    catch { toast({ title: "Copie impossible", description: "Votre navigateur a bloqué la copie.", variant: "destructive" }); }
  };
  const openPhone = (phone: string) => { if (!phone) { toast({ title: "Téléphone", description: "Numéro manquant.", variant: "destructive" }); return; } window.open(`tel:${phone.replace(/\s+/g, "")}`, "_self"); };
  const openEmail = (email?: string, name?: string) => { if (!email) { toast({ title: "Email", description: "Adresse email manquante.", variant: "destructive" }); return; } window.open(`mailto:${email}?subject=${encodeURIComponent(`Suivi médical — ${name || "Patient"}`)}`, "_self"); };
  const openWhatsApp = (phone: string) => { if (!phone) { toast({ title: "WhatsApp", description: "Numéro manquant.", variant: "destructive" }); return; } const d = phone.replace(/\D+/g, ""); if (!d) { toast({ title: "WhatsApp", description: "Numéro invalide.", variant: "destructive" }); return; } window.open(`https://wa.me/${d}`, "_blank", "noopener,noreferrer"); };
  const exportPatientRecord = (p: Patient) => toast({ title: "Exporter dossier", description: `Export PDF à brancher — ${p.name}.` });
  const printPatientRecord = (p: Patient) => toast({ title: "Imprimer dossier", description: `Impression à brancher — ${p.name}.` });
  const planAppointment = (p: Patient) => toast({ title: "Planifier RDV", description: `Workflow RDV à brancher — ${p.name}.` });
  const startConsultation = (p: Patient) => toast({ title: "Consultation", description: `Workflow consultation à brancher — ${p.name}.` });

  const openQuickNote = (p: Patient) => { setNotePatientId(p.id); setNoteText(""); setNoteOpen(true); };

  const saveQuickNote = () => {
    if (!notePatientId) return;
    const text = noteText.trim();
    if (!text) { toast({ title: "Note", description: "Écrivez une note avant d'enregistrer.", variant: "destructive" }); return; }
    setPatients((prev) => prev.map((p) => {
      if (p.id !== notePatientId) return p;
      const prevNote = (p.notes || "").trim();
      const stamp = new Date().toLocaleString();
      const merged = prevNote ? `${prevNote}\n\n— ${stamp}\n${text}` : `— ${stamp}\n${text}`;
      return { ...p, notes: merged };
    }));
    toast({ title: "Note enregistrée", description: "Ajoutée au dossier (mock)." });
    setNoteOpen(false);
  };

  // ── Filtering & Sorting ──
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

  const sortedPatients = useMemo(() => {
    const dir = sortAsc ? 1 : -1;
    return [...filteredPatients].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (sortBy === "age") return (a.age - b.age) * dir;
      return (parseFrDate(a.lastVisit) - parseFrDate(b.lastVisit)) * dir;
    });
  }, [filteredPatients, sortBy, sortAsc]);

  // ── Export CSV ──
  const handleExportCSV = () => {
    const header = "Nom,Âge,Téléphone,Email,Pathologies,Allergies,Dernière visite,Prochain RDV\n";
    const rows = sortedPatients.map((p) => `"${p.name}",${p.age},"${p.phone}","${p.email}","${p.chronicConditions.join(";")}","${p.allergies.map((a) => a.name).join(";")}","${p.lastVisit || "—"}","${p.nextAppointment || "—"}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "patients.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV", description: "Fichier généré (mock)." });
  };

  // ── Add Patient ──
  const handleAddPatient = () => {
    if (!newForm.firstName || !newForm.lastName) return;
    const name = `${newForm.firstName} ${newForm.lastName}`;
    const avatar = `${newForm.firstName[0]}${newForm.lastName[0]}`.toUpperCase();
    const newP: Patient = {
      id: patients.length + 100, name, avatar,
      age: newForm.dob ? Math.floor((Date.now() - new Date(newForm.dob).getTime()) / 31557600000) : 0,
      gender: "", dob: newForm.dob, address: "", ssn: "", mutuelle: "", treatingDoctor: "",
      registeredSince: "Fév 2026", conditions: [], gouvernorat: "", balance: 0, notes: "",
      phone: newForm.phone, email: newForm.email,
      chronicConditions: newForm.conditions ? newForm.conditions.split(",").map((s) => s.trim()).filter(Boolean) : [],
      allergies: newForm.allergies ? newForm.allergies.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name, severity: "Modéré" })) : [],
      isNew: true, lastVisit: null, nextAppointment: null, lastVitals: { ta: "—", glycemia: "—" },
      bloodType: newForm.bloodType, cnamId: newForm.cnamId,
    };
    setPatients((prev) => [newP, ...prev]);
    setSelectedPatientId(newP.id);
    setShowNewPatient(false);
    setNewForm(emptyNewForm);
    toast({ title: "Patient créé", description: `${newP.name} (mock).` });
  };

  // ── Palette ──
  const palettePatientMatches = useMemo(() => {
    if (palettePatientId) return [];
    const q = actionsQ.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchPhone = (p.phone || "").replace(/\s+/g, "").includes(q.replace(/\s+/g, ""));
      const matchEmail = (p.email || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail;
    }).slice(0, 7);
  }, [actionsQ, patients, palettePatientId]);

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const q = actionsQ.trim().toLowerCase();
    const items: PaletteItem[] = [];

    for (const p of palettePatientMatches) {
      items.push({ id: `patient-hit-${p.id}`, group: "Patients", title: p.name, hint: "Sélectionner", meta: p.phone || p.email || "",
        onRun: () => { setPalettePatientId(p.id); setSelectedPatientId(p.id); setActionsQ(""); setActionsIndex(0); } });
    }

    if (palettePatient) {
      const p = palettePatient;
      items.push({ id: "patient-change", group: "Patient", title: "Changer de patient", hint: "Revenir", onRun: () => { setPalettePatientId(null); setActionsQ(""); setActionsIndex(0); } });
      items.push({ id: "patient-open-record", group: "Patient", title: "Ouvrir le dossier", hint: "Voir dossier", onRun: () => { setActionsOpen(false); navigate(`/dashboard/doctor/patients/${p.id}`); } });
      items.push({ id: "patient-plan-appointment", group: "Patient", title: "Planifier un RDV", hint: "Workflow RDV", onRun: () => { setActionsOpen(false); planAppointment(p); } });
      items.push({ id: "patient-start-consult", group: "Patient", title: "Démarrer consultation", hint: "Workflow", onRun: () => { setActionsOpen(false); startConsultation(p); } });
      items.push({ id: "patient-note", group: "Patient", title: "Ajouter note rapide", hint: "Intra‑page", onRun: () => { setActionsOpen(false); openQuickNote(p); } });
      items.push({ id: "patient-call", group: "Patient", title: "Appeler", hint: p.phone, onRun: () => { setActionsOpen(false); openPhone(p.phone); } });
      items.push({ id: "patient-whatsapp", group: "Patient", title: "WhatsApp", hint: "wa.me", onRun: () => { setActionsOpen(false); openWhatsApp(p.phone); } });
      items.push({ id: "patient-email", group: "Patient", title: "Email", hint: "mailto:", disabled: !p.email, onRun: () => { setActionsOpen(false); openEmail(p.email, p.name); } });
      items.push({ id: "patient-export", group: "Patient", title: "Exporter (PDF)", hint: "À brancher", onRun: () => { setActionsOpen(false); exportPatientRecord(p); } });
      items.push({ id: "patient-print", group: "Patient", title: "Imprimer dossier", hint: "À brancher", onRun: () => { setActionsOpen(false); printPatientRecord(p); } });
      items.push({ id: "patient-copy-phone", group: "Patient", title: "Copier téléphone", hint: "Presse‑papiers", onRun: () => { setActionsOpen(false); copyToClipboard("Téléphone", p.phone); } });
      items.push({ id: "patient-copy-email", group: "Patient", title: "Copier email", hint: "Presse‑papiers", disabled: !p.email, onRun: () => { setActionsOpen(false); copyToClipboard("Email", p.email || ""); } });
      items.push({ id: "patient-fav", group: "Patient", title: isFavorite(p.id) ? "Retirer des favoris" : "Ajouter aux favoris", hint: "Marque‑page",
        onRun: () => { setActionsOpen(false); toggleFavorite(p.id); } });
    }

    items.push(
      { id: "global-new-patient", group: "Global", title: "Nouveau patient", hint: "Créer fiche", onRun: () => { setActionsOpen(false); setShowNewPatient(true); } },
      { id: "global-focus-search", group: "Global", title: "Rechercher", hint: "Focus recherche", onRun: () => { setActionsOpen(false); searchInputRef.current?.focus(); } },
      { id: "global-export-csv", group: "Global", title: "Exporter CSV", hint: "Liste filtrée", onRun: () => { setActionsOpen(false); handleExportCSV(); } },
      { id: "global-clear-search", group: "Global", title: "Effacer recherche", hint: "Réinitialiser", disabled: !search.trim(), onRun: () => { setActionsOpen(false); setSearch(""); } },
    );

    items.push(
      { id: "filter-all", group: "Filtrer", title: "Tous", onRun: () => { setActionsOpen(false); setFilter("all"); } },
      { id: "filter-recent", group: "Filtrer", title: "Récents", onRun: () => { setActionsOpen(false); setFilter("recent"); } },
      { id: "filter-chronic", group: "Filtrer", title: "Chroniques", onRun: () => { setActionsOpen(false); setFilter("chronic"); } },
      { id: "filter-new", group: "Filtrer", title: "Nouveaux", onRun: () => { setActionsOpen(false); setFilter("new"); } },
    );

    items.push(
      { id: "sort-name", group: "Trier", title: "Nom", hint: sortBy === "name" ? (sortAsc ? "A→Z" : "Z→A") : "", onRun: () => { setActionsOpen(false); toggleSort("name"); } },
      { id: "sort-age", group: "Trier", title: "Âge", hint: sortBy === "age" ? (sortAsc ? "↑" : "↓") : "", onRun: () => { setActionsOpen(false); toggleSort("age"); } },
      { id: "sort-last-visit", group: "Trier", title: "Dernière visite", hint: sortBy === "lastVisit" ? (sortAsc ? "Ancien→Récent" : "Récent→Ancien") : "", onRun: () => { setActionsOpen(false); toggleSort("lastVisit"); } },
    );

    if (!q) return items;
    return items.filter((it) => `${it.title} ${it.hint || ""} ${it.meta || ""}`.toLowerCase().includes(q));
  }, [actionsQ, favoriteIds, filter, navigate, palettePatient, palettePatientId, palettePatientMatches, patients, search, sortAsc, sortBy]);

  const paletteSections = useMemo(() => {
    const order: PaletteGroup[] = palettePatient ? ["Patient", "Global", "Filtrer", "Trier"] : ["Patients", "Global", "Filtrer", "Trier"];
    const map = new Map<PaletteGroup, PaletteItem[]>();
    for (const g of order) map.set(g, []);
    for (const a of paletteItems) map.get(a.group)?.push(a);
    return order.map((g) => ({ group: g, items: map.get(g) || [] })).filter((s) => s.items.length > 0);
  }, [paletteItems, palettePatient]);

  const openPalette = () => {
    setActionsOpen(true); setActionsQ(""); setActionsIndex(0);
    setPalettePatientId(selectedPatientId ?? null);
  };

  // ── Keyboard ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); openPalette(); return; }
      if (e.key === "/" && !actionsOpen) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || (t as any).isContentEditable)) return;
        e.preventDefault(); searchInputRef.current?.focus();
      }
      if (!actionsOpen) return;
      if (e.key === "Escape") { e.preventDefault(); setActionsOpen(false); }
      if (e.key === "ArrowDown") { e.preventDefault(); setActionsIndex((i) => Math.min(i + 1, Math.max(0, paletteItems.length - 1))); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActionsIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); const c = paletteItems[actionsIndex]; if (c && !c.disabled) c.onRun(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actionsOpen, actionsIndex, paletteItems, selectedPatientId]);

  useEffect(() => {
    if (!actionsOpen) return;
    const t = window.setTimeout(() => actionsInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [actionsOpen]);

  const value: PatientsCtx = {
    patients, search, setSearch, filter, setFilter, sortBy, sortAsc, toggleSort,
    sortedPatients, selectedPatientId, setSelectedPatientId, selectedPatient,
    favoriteIds, isFavorite, toggleFavorite,
    showNewPatient, setShowNewPatient, newForm, setNewForm, handleAddPatient,
    noteOpen, setNoteOpen, noteText, setNoteText, notePatientId, openQuickNote, saveQuickNote,
    actionsOpen, setActionsOpen, actionsQ, setActionsQ, actionsIndex, setActionsIndex,
    actionsInputRef, paletteSections, paletteFlat: paletteItems, palettePatient, openPalette,
    searchInputRef, openPhone, openWhatsApp, openEmail, exportPatientRecord, printPatientRecord,
    planAppointment, startConsultation, copyToClipboard, handleExportCSV, navigate,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
