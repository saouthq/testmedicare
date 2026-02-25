import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ClipboardList,
  Droplets,
  FileText,
  History,
  Mail,
  MessageSquare,
  Phone,
  Pill,
  Plus,
  Printer,
  Search,
  Send,
  Stethoscope,
  X,
} from "lucide-react";

import {
  mockConsultationPatient,
  mockPatientAnalyses,
  mockPatientConsultations,
  mockPatientDetailPrescriptions,
  mockVitalsHistory,
} from "@/data/mockData";

/**
 * DoctorPatientDetail — Render Complete V2
 * - Conserve le layout validé (toolbar, onglets, timeline, documents)
 * - Réactive : Notes / Notes privées / Antécédents / Constantes / Traitement
 * - Réactive : bouton Actions (palette + recherche) + raccourci Ctrl/Cmd+K
 * - Menu Créer complet (ordonnance, analyses, docs, importer, demander document)
 *
 * IMPORTANT : tout est “safe” (pas de JSX fragile, pas de blocs copiés-collés cassés).
 */

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

/* ---------------------------------- */
/* Types                               */
/* ---------------------------------- */

type MainTab = "historique" | "antecedents" | "traitement" | "constantes" | "notes" | "notes_prive" | "documents";
type HistFilter = "all" | "consult" | "rx" | "lab" | "doc";

type TimelineOpen = { kind: "consult" | "rx" | "lab" | "doc" };

type TimelineEvent = {
  id: string;
  at: string;
  ts: number;
  type: HistFilter;
  title: string;
  desc?: string;
  open?: TimelineOpen;
};

type DocFileKind = "document" | "photo";
type PatientFile = {
  id: string;
  at: string;
  ts: number;
  kind: DocFileKind;
  name: string;
  mime: string;
  size?: number;
  url?: string;
};

type Ante = { medical: string; surgical: string; traumatic: string; family: string };
type VersionText = { id: string; at: string; ts: number; text: string };
type VersionAnte = { id: string; at: string; ts: number; data: Ante };
type VersionVitals = {
  id: string;
  at: string;
  ts: number;
  data: { ta: string; fc: string; weight: string; gly: string };
};

/**
 * Workflows (UI) — utilisés dans les drawers Ordonnance / Analyses / Documents.
 * Objectif : donner un parcours complet au frontend, puis brancher le backend ensuite.
 */
type WorkflowStep = 1 | 2 | 3;

type RxDraftItem = {
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
};

type LabPanel = {
  key: string;
  label: string;
  hint?: string;
};

type DocTemplate = "report" | "certificate" | "referral" | "sickleave";

/* ---------------------------------- */
/* UI building blocks                  */
/* ---------------------------------- */

function Card({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {right}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function TabsBar({
  value,
  onChange,
  options,
}: {
  value: MainTab;
  onChange: (v: MainTab) => void;
  options: Array<{ value: MainTab; label: string }>;
}) {
  return (
    <div className="inline-flex rounded-2xl border bg-card p-1 shadow-sm">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "rounded-xl px-3 py-2 text-sm font-medium transition",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={cx("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div
        className={cx("absolute inset-0 bg-black/30 transition-opacity", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <div
        className={cx(
          "absolute right-0 top-0 h-full w-full max-w-xl bg-card shadow-2xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-semibold text-foreground">{title}</div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">{children}</div>
          {footer ? <div className="border-t bg-card px-4 py-3">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

function humanSize(bytes?: number) {
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} Ko`;
  return `${(kb / 1024).toFixed(1)} Mo`;
}

/* ---------------------------------- */
/* Main page                           */
/* ---------------------------------- */

export default function DoctorPatientDetail() {
  const navigate = useNavigate();
  const patient = mockConsultationPatient as any;

  const [tab, setTab] = useState<MainTab>("historique");
  const [q, setQ] = useState("");
  const [histFilter, setHistFilter] = useState<HistFilter>("all");

  /* ---------- Actions palette (alignée sur DoctorConsultationDetail) ---------- */
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsQ, setActionsQ] = useState("");
  const [actionsIndex, setActionsIndex] = useState(0);
  const actionsInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Raccourci global : Ctrl/Cmd + K
   * - Ouvre la palette d’actions, sans casser le workflow de la page.
   * - Esc ferme la palette.
   *
   * NB: navigation ↑↓ + Entrée gérée dans l’Input (onKeyDown) pour rester stable.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setActionsOpen(true);
        setActionsQ("");
        setActionsIndex(0);
        return;
      }
      if (e.key === "Escape") setActionsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset index + focus sur la recherche quand la palette s’ouvre / quand on retape.
  useEffect(() => {
    if (!actionsOpen) return;
    setActionsIndex(0);
    const t = window.setTimeout(() => actionsInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [actionsOpen, actionsQ]);

  /* ---------- Create menu ---------- */
  const [createOpen, setCreateOpen] = useState(false);
  const createWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!createOpen) return;
      const el = createWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setCreateOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!createOpen) return;
      if (e.key === "Escape") setCreateOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [createOpen]);

  /* ---------- Drawers (Rx/Labs/Docs) : workflows complets (UI only) ---------- */
  const [drawer, setDrawer] = useState<null | "rx" | "lab" | "doc">(null);

  // -----------------------------
  // Ordonnance (Rx) — workflow 1/2/3
  // -----------------------------
  const [rxStep, setRxStep] = useState<WorkflowStep>(1);
  const [rxItems, setRxItems] = useState<RxDraftItem[]>([
    { medication: "", dosage: "", duration: "", instructions: "" },
  ]);
  const [rxNote, setRxNote] = useState("");
  const [rxSigned, setRxSigned] = useState(false);
  const [rxSendToPatient, setRxSendToPatient] = useState(true);
  const [rxSendToPharmacy, setRxSendToPharmacy] = useState(false);

  // -----------------------------
  // Analyses (Labs) — workflow 1/2/3
  // -----------------------------
  const labPanels = useMemo<LabPanel[]>(
    () => [
      { key: "nfs", label: "NFS", hint: "Bilan sanguin" },
      { key: "gly", label: "Glycémie", hint: "à jeun" },
      { key: "hba1c", label: "HbA1c", hint: "3 mois" },
      { key: "lip", label: "Bilan lipidique", hint: "cholestérol" },
      { key: "crp", label: "CRP", hint: "inflammation" },
      { key: "tsh", label: "TSH", hint: "thyroïde" },
      { key: "iono", label: "Ionogramme", hint: "Na/K/Cl" },
      { key: "creat", label: "Créatinine", hint: "fonction rénale" },
    ],
    [],
  );

  const [labsStep, setLabsStep] = useState<WorkflowStep>(1);
  const [labsSelected, setLabsSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    labPanels.forEach((p) => (init[p.key] = false));
    return init;
  });
  const [labsCustom, setLabsCustom] = useState("");
  const [labsNote, setLabsNote] = useState("");
  const [labsSendToPatient, setLabsSendToPatient] = useState(true);
  const [labsSendToLab, setLabsSendToLab] = useState(true);
  const [labsValidated, setLabsValidated] = useState(false);

  // -----------------------------
  // Documents — workflow 1/2/3
  // -----------------------------
  const [docStep, setDocStep] = useState<WorkflowStep>(1);
  const [docTemplate, setDocTemplate] = useState<DocTemplate>("report");
  const [docBody, setDocBody] = useState("");
  const [docSigned, setDocSigned] = useState(false);
  /**
   * Pré-remplissage (UX) : quand on ouvre le drawer "Documents",
   * on propose un texte de base (modifiable) selon le template.
   */
  useEffect(() => {
    if (drawer !== "doc") return;
    if ((docBody || "").trim().length > 0) return;

    const name = patient?.name || "le patient";
    const date = new Date().toLocaleDateString();

    switch (docTemplate) {
      case "certificate":
        setDocBody(
          `Je soussigné(e), Dr. ________, certifie avoir examiné ${name} en date du ${date}.\n\nConclusion : ________.\n\nFait pour servir et valoir ce que de droit.`,
        );
        return;
      case "referral":
        setDocBody(
          `Cher/Chère confrère/consœur,\n\nJe vous adresse ${name} pour avis spécialisé concernant : ________.\n\nContexte / éléments cliniques :\n- ________\n\nJe vous remercie par avance.\n\nCordialement,\nDr. ________`,
        );
        return;
      case "sickleave":
        setDocBody(
          `Je soussigné(e), Dr. ________, certifie que l’état de santé de ${name} nécessite un arrêt de travail du __/__/____ au __/__/____.\n\nMotif (optionnel) : ________.\n\nFait à ________, le ${date}.`,
        );
        return;
      case "report":
      default:
        setDocBody(
          `Compte-rendu de consultation — ${date}\n\nMotif : ________.\n\nExamen / Synthèse :\n- ________\n\nConclusion / Conduite à tenir :\n- ________`,
        );
        return;
    }
  }, [docBody, docTemplate, drawer, patient?.name]);

  const [docSendToPatient, setDocSendToPatient] = useState(true);

  /**
   * Open helpers
   * NOTE: on garde les mêmes fonctions (openRx/openLabs/openDoc) pour simplifier le branchement backend + routing.
   */
  const openRx = () => {
    setDrawer("rx");
    setRxStep(1);
    setRxSigned(false);
  };

  const openLabs = () => {
    setDrawer("lab");
    setLabsStep(1);
    setLabsValidated(false);
  };

  const openDoc = (template?: DocTemplate) => {
    if (template) {
      setDocTemplate(template);
      // On force le pré-remplissage du bon template (voir useEffect plus bas)
      setDocBody("");
    }
    setDrawer("doc");
    setDocStep(1);
    setDocSigned(false);
  };

  /* ---------- Notes + versions ---------- */
  const [notes, setNotes] = useState(
    "Suivi régulier diabète type 2. Bonne observance thérapeutique. Contrôle trimestriel HbA1c. Fond d'œil annuel à programmer.",
  );
  const [notesHistory, setNotesHistory] = useState<VersionText[]>([]);
  const [privateNotes, setPrivateNotes] = useState("");
  const [privateHistory, setPrivateHistory] = useState<VersionText[]>([]);

  const saveNotes = () => {
    const ts = Date.now();
    const at = new Date().toLocaleString();
    setNotesHistory((p) => [{ id: `n-${ts}`, at, ts, text: notes }, ...p]);
  };
  const savePrivate = () => {
    const ts = Date.now();
    const at = new Date().toLocaleString();
    setPrivateHistory((p) => [{ id: `pn-${ts}`, at, ts, text: privateNotes }, ...p]);
  };

  /* ---------- Antecedents + versions ---------- */
  const [ante, setAnte] = useState<Ante>({ medical: "", surgical: "", traumatic: "", family: "" });
  const [anteHistory, setAnteHistory] = useState<VersionAnte[]>([]);
  const saveAnte = () => {
    const ts = Date.now();
    const at = new Date().toLocaleString();
    setAnteHistory((p) => [{ id: `a-${ts}`, at, ts, data: { ...ante } }, ...p]);
  };

  /* ---------- Vitals + versions ---------- */
  const lastVitals = useMemo(() => (mockVitalsHistory || [])[0], []);
  const [vitals, setVitals] = useState({
    ta: lastVitals?.ta ?? "130/80",
    fc: String(lastVitals?.fc ?? "72"),
    weight: String(lastVitals?.weight ?? "75"),
    gly: String(lastVitals?.glycemia ?? "1.05 g/L"),
  });
  const [vitalsHistory, setVitalsHistory] = useState<VersionVitals[]>(() =>
    (mockVitalsHistory || []).map((v: any, i: number) => ({
      id: `vh-${i}`,
      at: v.date,
      ts: Date.parse(v.date) || Date.now() - i * 1000,
      data: { ta: v.ta, fc: String(v.fc), weight: String(v.weight ?? ""), gly: String(v.glycemia ?? "") },
    })),
  );
  const saveVitals = () => {
    const ts = Date.now();
    const at = new Date().toLocaleString();
    setVitalsHistory((p) => [{ id: `vh-${ts}`, at, ts, data: { ...vitals } }, ...p]);
  };

  /* ---------- Documents (imports local mock) ---------- */
  const [files, setFiles] = useState<PatientFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (list: FileList | null, kind: DocFileKind) => {
    if (!list || !list.length) return;
    const ts = Date.now();
    const at = new Date().toLocaleString();
    const items: PatientFile[] = Array.from(list).map((f, i) => ({
      id: `pf-${ts}-${i}-${Math.random().toString(16).slice(2)}`,
      at,
      ts: ts + i,
      kind,
      name: f.name,
      mime: f.type || (kind === "photo" ? "image/*" : "application/octet-stream"),
      size: f.size,
      url: URL.createObjectURL(f),
    }));
    setFiles((p) => [...items, ...p]);
  };

  const removeFile = (id: string) => {
    setFiles((p) => {
      const f = p.find((x) => x.id === id);
      if (f?.url) {
        try {
          URL.revokeObjectURL(f.url);
        } catch {
          // ignore
        }
      }
      return p.filter((x) => x.id !== id);
    });
  };

  /* ---------- Timeline (unifiée) ---------- */
  const mockTimeline = useMemo<TimelineEvent[]>(() => {
    const consults = mockPatientConsultations.map((c: any, idx: number) => ({
      id: `c-${idx}`,
      at: c.date,
      ts: Date.parse(c.date) || Date.now() - idx * 1000,
      type: "consult" as const,
      title: c.motif,
      desc: c.notes,
      open: { kind: "consult" as const },
    }));

    const rxs = mockPatientDetailPrescriptions.map((p: any) => ({
      id: `rx-${p.id}`,
      at: p.date,
      ts: Date.parse(p.date) || Date.now() - 2000,
      type: "rx" as const,
      title: `Ordonnance ${p.id}`,
      desc: p.items?.[0] ? `${p.items[0]}${p.items.length > 1 ? ` • +${p.items.length - 1}` : ""}` : "—",
      open: { kind: "rx" as const },
    }));

    const labs = mockPatientAnalyses.map((a: any) => ({
      id: `lab-${a.id}`,
      at: a.date,
      ts: Date.parse(a.date) || Date.now() - 3000,
      type: "lab" as const,
      title: a.type,
      desc: a.values?.[0] ? `${a.values[0].name}: ${a.values[0].value}` : "—",
      open: { kind: "lab" as const },
    }));

    // Files imported also appear as "doc" timeline events (mock)
    const docs = files.slice(0, 10).map((f) => ({
      id: `doc-${f.id}`,
      at: f.at,
      ts: f.ts,
      type: "doc" as const,
      title: f.kind === "photo" ? "Photo importée" : "Document importé",
      desc: f.name,
      open: { kind: "doc" as const },
    }));

    return [...docs, ...consults, ...rxs, ...labs].sort((x, y) => y.ts - x.ts);
  }, [files]);

  const timeline = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return mockTimeline
      .filter((e) => (histFilter === "all" ? true : e.type === histFilter))
      .filter((e) => (!qq ? true : `${e.title} ${e.desc || ""}`.toLowerCase().includes(qq)));
  }, [mockTimeline, q, histFilter]);

  /* ---------- Right panel data ---------- */
  const activeRx = useMemo(() => mockPatientDetailPrescriptions.filter((p: any) => p.status === "active"), []);
  const activeTreatments = useMemo(() => activeRx.flatMap((p: any) => p.items), [activeRx]);

  /* ---------- Actions palette items ---------- */
  const actions = useMemo(() => {
    const items: Array<{ id: string; label: string; hint?: string; icon: ReactNode; run: () => void }> = [
      // Raccourcis (médecin)
      {
        id: "new-consult",
        label: "Nouvelle consultation",
        hint: "Aller à la page consultation",
        icon: <Stethoscope className="h-4 w-4" />,
        run: () => navigate("/dashboard/doctor/consultation/new"),
      },
      {
        id: "rx",
        label: "Créer / reprendre une ordonnance",
        hint: "Composer → signer → envoyer",
        icon: <Pill className="h-4 w-4" />,
        run: openRx,
      },
      {
        id: "labs",
        label: "Créer / reprendre une demande d’analyses",
        hint: "Valider → envoyer labo/patient",
        icon: <Droplets className="h-4 w-4" />,
        run: openLabs,
      },
      {
        id: "docs",
        label: "Générer un document (CR / Certif / Lettre / Arrêt)",
        hint: "Rédiger → signer → envoyer",
        icon: <FileText className="h-4 w-4" />,
        run: openDoc,
      },

      // Dossier
      {
        id: "tab-h",
        label: "Aller à Historique",
        hint: "Timeline",
        icon: <History className="h-4 w-4" />,
        run: () => setTab("historique"),
      },
      {
        id: "tab-a",
        label: "Aller à Antécédents",
        hint: "Saisir + historique",
        icon: <History className="h-4 w-4" />,
        run: () => setTab("antecedents"),
      },
      {
        id: "tab-t",
        label: "Aller à Traitements",
        hint: "Traitement actif",
        icon: <Pill className="h-4 w-4" />,
        run: () => setTab("traitement"),
      },
      {
        id: "tab-v",
        label: "Aller à Constantes",
        hint: "Mesures + historique",
        icon: <Droplets className="h-4 w-4" />,
        run: () => setTab("constantes"),
      },
      {
        id: "tab-n",
        label: "Aller à Notes cliniques",
        hint: "Notes + versions",
        icon: <ClipboardList className="h-4 w-4" />,
        run: () => setTab("notes"),
      },
      {
        id: "tab-pn",
        label: "Aller à Notes privées",
        hint: "Interne uniquement",
        icon: <ClipboardList className="h-4 w-4" />,
        run: () => setTab("notes_prive"),
      },
      {
        id: "tab-d",
        label: "Aller à Documents",
        hint: "Importer / Photos",
        icon: <FileText className="h-4 w-4" />,
        run: () => setTab("documents"),
      },

      // Communication
      {
        id: "msg",
        label: "Envoyer un message au patient",
        hint: "Messagerie",
        icon: <MessageSquare className="h-4 w-4" />,
        run: () => window.alert("Message patient — mock"),
      },
      {
        id: "call",
        label: "Appeler le patient",
        hint: patient?.phone ? patient.phone : "Téléphone",
        icon: <Phone className="h-4 w-4" />,
        run: () => window.alert(`Appel — ${patient?.phone || "—"}`),
      },

      // Organisation / administratif (mock)
      {
        id: "plan",
        label: "Planifier un RDV",
        hint: "Créer un rendez-vous",
        icon: <Calendar className="h-4 w-4" />,
        run: () => window.alert("Planifier RDV — mock"),
      },
      {
        id: "task",
        label: "Ajouter une tâche",
        hint: "Organisation",
        icon: <ClipboardList className="h-4 w-4" />,
        run: () => window.alert("Ajouter tâche — mock"),
      },
      {
        id: "request-doc",
        label: "Demander un document au patient",
        hint: "Ex: ancien bilan, radio…",
        icon: <Send className="h-4 w-4" />,
        run: () => window.alert("Demander document — mock"),
      },

      // Utilitaires
      {
        id: "print",
        label: "Imprimer le dossier",
        hint: "Aperçu / impression",
        icon: <Printer className="h-4 w-4" />,
        run: () => window.alert("Imprimer dossier — mock"),
      },
    ];

    const qq = actionsQ.trim().toLowerCase();
    const filtered = items.filter((a) => (!qq ? true : `${a.label} ${a.hint || ""}`.toLowerCase().includes(qq)));
    // On limite volontairement pour garder une fenêtre compacte (comme ConsultationDetail).
    return filtered.slice(0, 10);
  }, [actionsQ, navigate, patient]);

  /* ---------- Helpers ---------- */
  const printDossier = () => window.alert("Imprimer dossier — mock");

  /**
   * Previews (UI only)
   * - Objectif : permettre un vrai parcours utilisateur (Aperçu → Signer → Envoyer),
   *   même tant que le backend n’est pas branché.
   * - TODO backend : générer un PDF côté serveur + stocker dans le dossier patient.
   */
  const rxPreview = useMemo(() => {
    const who = patient?.name ? `Patient: ${patient.name}` : "Patient: —";
    const header = `ORDONNANCE\n${who}`;
    const meds = rxItems
      .filter((it) => `${it.medication}${it.dosage}${it.duration}${it.instructions}`.trim().length > 0)
      .map((it, idx) => {
        const head = it.medication?.trim() ? it.medication.trim() : "—";
        const meta = [it.dosage, it.duration]
          .map((x) => (x || "").trim())
          .filter(Boolean)
          .join(" · ");
        const instr = (it.instructions || "").trim();
        return `${idx + 1}. ${head}${meta ? ` — ${meta}` : ""}${instr ? ` (${instr})` : ""}`;
      });
    const body = meds.length ? meds.join("\n") : "Aucun médicament.";
    const note = (rxNote || "").trim();
    return `${header}\n\n${body}\n\nNote: ${note || "—"}`;
  }, [patient, rxItems, rxNote]);

  const labsPreview = useMemo(() => {
    const who = patient?.name ? `Patient: ${patient.name}` : "Patient: —";
    const header = `DEMANDE D’ANALYSES\n${who}`;
    const selected = labPanels
      .filter((p) => Boolean(labsSelected[p.key]))
      .map((p) => `- ${p.label}${p.hint ? ` (${p.hint})` : ""}`);
    const custom = (labsCustom || "").trim();
    if (custom) selected.push(`- Autres: ${custom}`);
    const body = selected.length ? selected.join("\n") : "- (aucune analyse sélectionnée)";
    const note = (labsNote || "").trim();
    return `${header}\n\n${body}\n\nNote: ${note || "—"}`;
  }, [labPanels, labsCustom, labsNote, labsSelected, patient]);

  const docTitle = useMemo(() => {
    switch (docTemplate) {
      case "certificate":
        return "Certificat médical";
      case "referral":
        return "Lettre d’adressage";
      case "sickleave":
        return "Arrêt de travail";
      case "report":
      default:
        return "Compte-rendu";
    }
  }, [docTemplate]);

  const docPreview = useMemo(() => {
    const who = patient?.name ? `Patient: ${patient.name}` : "Patient: —";
    const header = `${docTitle.toUpperCase()}\n${who}`;
    const body = (docBody || "").trim() || "—";
    return `${header}\n\n${body}`;
  }, [docBody, docTitle, patient]);

  return (
    <DashboardLayout role="doctor" title="Dossier patient">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Retour">
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <div className="text-lg font-semibold text-foreground">{patient?.name || "Patient"}</div>
              <div className="text-xs text-muted-foreground">
                {patient?.age ?? "-"} ans • {patient?.gender || ""} • {patient?.city || "Tunis"}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {patient?.phone || "—"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {patient?.email || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Actions — même style que DoctorConsultationDetail */}
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              title="Raccourci : Ctrl/Cmd+K"
              onClick={() => {
                setActionsOpen(true);
                setActionsQ("");
              }}
            >
              <Search className="h-3.5 w-3.5 mr-1" />
              Actions
            </Button>

            <Button variant="outline" onClick={() => window.alert("Message — mock")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>

            <Button variant="outline" onClick={printDossier}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>

            {/* Créer placé juste avant Nouvelle consultation */}
            <div ref={createWrapRef} className="relative">
              <Button variant="outline" onClick={() => setCreateOpen((v) => !v)} aria-label="Créer">
                <Plus className="mr-2 h-4 w-4" />
                Créer
              </Button>

              {createOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-2xl border bg-card p-2 shadow-lg">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Créer</div>

                  <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Soins</div>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setCreateOpen(false);
                      openRx();
                    }}
                  >
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Ordonnance</span>
                    <span className="text-[11px] text-muted-foreground">Créer</span>
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setCreateOpen(false);
                      openLabs();
                    }}
                  >
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Demande d’analyses</span>
                    <span className="text-[11px] text-muted-foreground">Créer</span>
                  </button>

                  <div className="my-1 h-px bg-border" />

                  <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Documents</div>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setCreateOpen(false);
                      openDoc("report");
                    }}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Compte-rendu</span>
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setCreateOpen(false);
                      openDoc("certificate");
                    }}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Certificat médical</span>
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setCreateOpen(false);
                      openDoc("referral");
                    }}
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Lettre d’adressage</span>
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setCreateOpen(false);
                      openDoc("sickleave");
                    }}
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Arrêt de travail</span>
                  </button>

                  <div className="my-1 h-px bg-border" />

                  <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">Dossier</div>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setCreateOpen(false);
                      setTab("documents");
                    }}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Importer document / photo</span>
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setCreateOpen(false);
                      window.alert("Demander un document (patient) — mock");
                    }}
                  >
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">Demander un document</span>
                  </button>
                </div>
              ) : null}
            </div>

            <Link to="/dashboard/doctor/consultation/new">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Stethoscope className="mr-2 h-4 w-4" />
                Nouvelle consultation
              </Button>
            </Link>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(patient?.allergies || []).map((a: string) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {a}
            </span>
          ))}
          {(patient?.conditions || []).map((c: string) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <Card title="Recherche dossier">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher dans le dossier… (ordonnance, analyse, note, date)"
                  className="pl-9"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <TabsBar
                  value={tab}
                  onChange={setTab}
                  options={[
                    { value: "historique", label: "Historique" },
                    { value: "antecedents", label: "Antécédents" },
                    { value: "traitement", label: "Traitement" },
                    { value: "constantes", label: "Constantes" },
                    { value: "notes", label: "Notes clinique" },
                    { value: "notes_prive", label: "Notes privé" },
                    { value: "documents", label: "Documents" },
                  ]}
                />
                <div className="text-xs text-muted-foreground">La recherche filtre la timeline</div>
              </div>
            </Card>

            {/* Historique */}
            {tab === "historique" ? (
              <Card
                title="Timeline"
                right={
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["all", "Tout"],
                        ["consult", "Consult"],
                        ["rx", "Rx"],
                        ["lab", "Analyses"],
                        ["doc", "Docs"],
                      ] as const
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setHistFilter(k)}
                        className={cx(
                          "rounded-full border px-3 py-1 text-xs",
                          histFilter === k
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="space-y-2">
                  {timeline.slice(0, 20).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="flex w-full items-start justify-between gap-3 rounded-xl border bg-background px-3 py-2 text-left hover:bg-muted"
                      onClick={() => {
                        if (e.open?.kind === "rx") openRx();
                        else if (e.open?.kind === "lab") openLabs();
                        else if (e.open?.kind === "consult") window.alert("Ouvrir consultation — mock");
                        else openDoc();
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-semibold text-foreground">{e.title}</div>
                          <div className="text-xs text-muted-foreground">{e.at}</div>
                        </div>
                        {e.desc ? <div className="text-xs text-muted-foreground line-clamp-1">{e.desc}</div> : null}
                      </div>
                      <div className="text-xs text-muted-foreground">Ouvrir</div>
                    </button>
                  ))}
                </div>
              </Card>
            ) : null}

            {/* Antécédents */}
            {tab === "antecedents" ? (
              <>
                <Card
                  title="Antécédents"
                  right={
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAnte({ medical: "", surgical: "", traumatic: "", family: "" })}
                      >
                        Vider
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={saveAnte}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  }
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    {(
                      [
                        ["Médicaux", "medical"],
                        ["Chirurgicaux", "surgical"],
                        ["Traumatiques", "traumatic"],
                        ["Familiaux", "family"],
                      ] as const
                    ).map(([label, key]) => (
                      <div key={key}>
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <textarea
                          value={(ante as any)[key]}
                          onChange={(e) => setAnte((p) => ({ ...p, [key]: e.target.value }))}
                          rows={4}
                          className="mt-1 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/25"
                          placeholder="Saisir…"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Chaque enregistrement crée une version datée (traçabilité).
                  </div>
                </Card>

                <Card title="Historique antécédents (versions)">
                  {anteHistory.length ? (
                    <div className="space-y-2">
                      {anteHistory.slice(0, 10).map((h) => (
                        <div key={h.id} className="rounded-xl border bg-background px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-foreground">{h.at}</div>
                            <Button variant="outline" size="sm" onClick={() => setAnte(h.data)}>
                              Restaurer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Aucun historique pour le moment.</div>
                  )}
                </Card>
              </>
            ) : null}

            {/* Traitement */}
            {tab === "traitement" ? (
              <Card
                title="Traitements actifs"
                right={
                  <Button variant="outline" size="sm" onClick={openRx}>
                    <Pill className="mr-2 h-4 w-4" />
                    Ordonnance
                  </Button>
                }
              >
                {activeTreatments.length ? (
                  <ul className="space-y-2">
                    {activeTreatments.map((t: string, idx: number) => (
                      <li key={idx} className="rounded-xl border bg-background px-3 py-2 text-sm text-foreground">
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">Aucun traitement actif.</div>
                )}
              </Card>
            ) : null}

            {/* Constantes */}
            {tab === "constantes" ? (
              <>
                <Card
                  title="Constantes"
                  right={
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={saveVitals}
                    >
                      Enregistrer
                    </Button>
                  }
                >
                  <div className="grid gap-3 md:grid-cols-4">
                    {(
                      [
                        ["TA", "ta"],
                        ["FC", "fc"],
                        ["Poids", "weight"],
                        ["Glycémie", "gly"],
                      ] as const
                    ).map(([label, key]) => (
                      <div key={key}>
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <Input
                          value={(vitals as any)[key]}
                          onChange={(e) => setVitals((p) => ({ ...p, [key]: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Historique constantes">
                  {vitalsHistory.length ? (
                    <div className="space-y-2">
                      {vitalsHistory.slice(0, 10).map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground">{h.at}</div>
                            <div className="text-xs text-muted-foreground">
                              TA {h.data.ta} • FC {h.data.fc} • {h.data.weight} kg • {h.data.gly}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setVitals(h.data)}>
                            Restaurer
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Aucun historique.</div>
                  )}
                </Card>
              </>
            ) : null}

            {/* Notes cliniques */}
            {tab === "notes" ? (
              <>
                <Card
                  title="Notes cliniques"
                  right={
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setNotes("")}>
                        Vider
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={saveNotes}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  }
                >
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={12}
                    className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/25"
                  />
                </Card>

                <Card title="Historique notes cliniques">
                  {notesHistory.length ? (
                    <div className="space-y-2">
                      {notesHistory.slice(0, 10).map((h) => (
                        <div key={h.id} className="rounded-xl border bg-background px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-foreground">{h.at}</div>
                            <Button variant="outline" size="sm" onClick={() => setNotes(h.text)}>
                              Restaurer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Aucune version enregistrée.</div>
                  )}
                </Card>
              </>
            ) : null}

            {/* Notes privées */}
            {tab === "notes_prive" ? (
              <>
                <Card
                  title="Notes privées (internes)"
                  right={
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPrivateNotes("")}>
                        Vider
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={savePrivate}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  }
                >
                  <div className="text-xs text-muted-foreground">Non partagées au patient.</div>
                  <textarea
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                    rows={10}
                    className="mt-3 w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/25"
                  />
                </Card>

                <Card title="Historique notes privées">
                  {privateHistory.length ? (
                    <div className="space-y-2">
                      {privateHistory.slice(0, 10).map((h) => (
                        <div key={h.id} className="rounded-xl border bg-background px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-foreground">{h.at}</div>
                            <Button variant="outline" size="sm" onClick={() => setPrivateNotes(h.text)}>
                              Restaurer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Aucune version enregistrée.</div>
                  )}
                </Card>
              </>
            ) : null}

            {/* Documents */}
            {tab === "documents" ? (
              <Card
                title="Documents"
                right={
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        addFiles(e.target.files, "document");
                        e.currentTarget.value = "";
                      }}
                    />
                    <input
                      ref={photoInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        addFiles(e.target.files, "photo");
                        e.currentTarget.value = "";
                      }}
                    />

                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <FileText className="mr-2 h-4 w-4" />
                      Importer document
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Importer photo
                    </Button>
                  </div>
                }
              >
                <div className="text-xs text-muted-foreground">
                  Mock : stockage local navigateur. (Backend → Supabase Storage).
                </div>

                <div className="mt-3 space-y-2">
                  {files.length ? (
                    files.slice(0, 30).map((f) => (
                      <div
                        key={f.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium text-foreground">{f.name}</span>
                            <span
                              className={cx(
                                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                                f.kind === "photo" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                              )}
                            >
                              {f.kind === "photo" ? "Photo" : "Document"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{f.at}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {f.mime}
                            {typeof f.size === "number" ? ` • ${humanSize(f.size)}` : ""}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {f.url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(f.url, "_blank", "noopener,noreferrer")}
                            >
                              Ouvrir
                            </Button>
                          ) : null}

                          <Button variant="outline" size="sm" onClick={() => removeFile(f.id)}>
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border bg-muted px-3 py-8 text-center text-sm text-muted-foreground">
                      Aucun document importé.
                    </div>
                  )}
                </div>
              </Card>
            ) : null}
          </div>

          {/* Right */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <Card title="Rappels">
              <div className="space-y-2">
                <div className="rounded-xl border bg-warning/10 px-3 py-2">
                  <div className="text-sm font-medium text-foreground">Bilan HbA1c à prescrire</div>
                  <div className="text-xs text-muted-foreground">3 mois</div>
                </div>
                <div className="rounded-xl border bg-background px-3 py-2">
                  <div className="text-sm font-medium text-foreground">Fond d'œil annuel</div>
                  <div className="text-xs text-muted-foreground">à prévoir</div>
                </div>
              </div>
            </Card>

            <Card
              title="Traitements / ordonnance active"
              right={
                <Button variant="outline" size="sm" onClick={openRx}>
                  Ouvrir
                </Button>
              }
            >
              <div className="rounded-xl border bg-background px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">{activeRx?.[0]?.id || "ORD-045"}</div>
                  <div className="text-xs text-muted-foreground">{activeRx?.[0]?.date || "—"}</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {activeTreatments.length ? activeTreatments.join(" • ") : "Aucun traitement actif."}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ===================== Actions (palette) ===================== */}
        {actionsOpen && (
          <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => setActionsOpen(false)}>
            <div
              className="max-w-lg w-[92%] mx-auto mt-24 rounded-2xl border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  ref={actionsInputRef}
                  value={actionsQ}
                  onChange={(e) => {
                    setActionsQ(e.target.value);
                    setActionsIndex(0);
                  }}
                  placeholder="Rechercher une action… (ex: ordonnance, analyses, doc, notes)"
                  className="h-9"
                  onKeyDown={(e) => {
                    // Navigation clavier (même logique que ConsultationDetail)
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActionsIndex((i) => Math.min(i + 1, Math.max(0, actions.length - 1)));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActionsIndex((i) => Math.max(i - 1, 0));
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const a = actions[actionsIndex];
                      if (!a) return;
                      setActionsOpen(false);
                      a.run();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setActionsOpen(false);
                    }
                  }}
                />
                <span className="text-[11px] text-muted-foreground px-2 py-1 rounded-full bg-muted">Ctrl+K</span>
              </div>

              <div className="p-2">
                {actions.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">Aucune action.</div>
                ) : (
                  <div className="space-y-1">
                    {actions.map((a, i) => (
                      <button
                        key={a.id}
                        type="button"
                        className={
                          i === actionsIndex
                            ? "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-muted"
                            : "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-muted/60"
                        }
                        onMouseEnter={() => setActionsIndex(i)}
                        onClick={() => {
                          setActionsOpen(false);
                          a.run();
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-muted-foreground">{a.icon}</span>
                          <span className="text-sm font-medium text-foreground truncate">{a.label}</span>
                        </div>
                        {a.hint ? <span className="text-xs text-muted-foreground">{a.hint}</span> : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>↑ ↓ pour naviguer · Entrée pour lancer · Esc pour fermer</span>
                <Button variant="ghost" size="sm" className="h-8" onClick={() => setActionsOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Drawers (mock workflow, stable) */}
        <Drawer
          open={drawer === "rx"}
          title={`Ordonnance — ${patient?.name || "Patient"}`}
          onClose={() => setDrawer(null)}
          footer={
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <Button variant="outline" onClick={() => window.alert(rxPreview)}>
                <Printer className="mr-2 h-4 w-4" />
                Aperçu
              </Button>

              {rxStep === 1 ? (
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setRxStep(2)}>
                  Continuer
                </Button>
              ) : null}

              {rxStep === 2 ? (
                <>
                  <Button variant="outline" onClick={() => setRxStep(1)}>
                    Retour
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      // On force une validation simple avant l’envoi
                      if (!rxSigned) {
                        window.alert("Veuillez signer/valider l’ordonnance avant de continuer.");
                        return;
                      }
                      setRxStep(3);
                    }}
                  >
                    Continuer
                  </Button>
                </>
              ) : null}

              {rxStep === 3 ? (
                <>
                  <Button variant="outline" onClick={() => setRxStep(2)}>
                    Retour
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!rxSigned || (!rxSendToPatient && !rxSendToPharmacy)}
                    onClick={() => {
                      // TODO backend : générer PDF + créer enregistrement ordonnance + routage patient/pharmacie
                      window.alert(
                        `Ordonnance envoyée (mock)\n- Patient: ${rxSendToPatient ? "oui" : "non"}\n- Pharmacie: ${
                          rxSendToPharmacy ? "oui" : "non"
                        }`,
                      );
                      setDrawer(null);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </Button>
                </>
              ) : null}

              <Button variant="outline" onClick={() => setDrawer(null)}>
                Fermer
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Stepper */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRxStep(1)}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  rxStep === 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                1. Composer
              </button>
              <button
                type="button"
                onClick={() => setRxStep(2)}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  rxStep === 2
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                2. Signer
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!rxSigned) {
                    window.alert("Veuillez signer/valider avant d’aller à l’étape d’envoi.");
                    return;
                  }
                  setRxStep(3);
                }}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  rxStep === 3
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                3. Envoyer
              </button>
            </div>

            {rxStep === 1 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Composez l’ordonnance (UI). Ensuite : <span className="font-medium">Signer</span> puis{" "}
                  <span className="font-medium">Envoyer</span>.
                </div>

                {/* Médicaments */}
                <div className="space-y-3">
                  {rxItems.map((it, idx) => (
                    <div key={idx} className="rounded-2xl border bg-card p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-foreground">Médicament {idx + 1}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setRxItems((items) => {
                              if (items.length <= 1)
                                return [{ medication: "", dosage: "", duration: "", instructions: "" }];
                              return items.filter((_, i) => i !== idx);
                            });
                          }}
                          aria-label="Supprimer"
                          title="Supprimer"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-3 grid grid-cols-12 gap-2">
                        <div className="col-span-12 md:col-span-5">
                          <Label className="text-xs">Médicament</Label>
                          <Input
                            value={it.medication}
                            onChange={(e) =>
                              setRxItems((items) =>
                                items.map((x, i) => (i === idx ? { ...x, medication: e.target.value } : x)),
                              )
                            }
                            placeholder="Ex: Metformine 850mg"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-3">
                          <Label className="text-xs">Dosage</Label>
                          <Input
                            value={it.dosage}
                            onChange={(e) =>
                              setRxItems((items) =>
                                items.map((x, i) => (i === idx ? { ...x, dosage: e.target.value } : x)),
                              )
                            }
                            placeholder="Ex: 1 cp matin"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-2">
                          <Label className="text-xs">Durée</Label>
                          <Input
                            value={it.duration}
                            onChange={(e) =>
                              setRxItems((items) =>
                                items.map((x, i) => (i === idx ? { ...x, duration: e.target.value } : x)),
                              )
                            }
                            placeholder="Ex: 30 j"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-2">
                          <Label className="text-xs">Instructions</Label>
                          <Input
                            value={it.instructions}
                            onChange={(e) =>
                              setRxItems((items) =>
                                items.map((x, i) => (i === idx ? { ...x, instructions: e.target.value } : x)),
                              )
                            }
                            placeholder="Ex: après repas"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      setRxItems((items) => [...items, { medication: "", dosage: "", duration: "", instructions: "" }])
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter un médicament
                  </Button>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <Label className="text-xs">Note / recommandations (optionnel)</Label>
                  <textarea
                    value={rxNote}
                    onChange={(e) => setRxNote(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Refaire HbA1c dans 3 mois…"
                  />
                </div>

                {/* Preview inline */}
                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{rxPreview}</pre>
                </div>
              </div>
            ) : null}

            {rxStep === 2 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Vérifiez puis signez/validez. (UI) — le backend branchera la signature électronique plus tard.
                </div>

                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{rxPreview}</pre>
                </div>

                <div className="rounded-2xl border bg-card p-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={rxSigned}
                      onChange={(e) => setRxSigned(e.target.checked)}
                    />
                    <div>
                      <div className="text-sm font-semibold text-foreground">Je valide et signe l’ordonnance</div>
                      <div className="text-xs text-muted-foreground">
                        (Mock) À brancher sur signature/certificat côté backend.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ) : null}

            {rxStep === 3 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Choisissez les destinataires (patient / pharmacie).</div>

                <div className="rounded-2xl border bg-card p-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={rxSendToPatient}
                      onChange={(e) => setRxSendToPatient(e.target.checked)}
                    />
                    Envoyer au patient
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={rxSendToPharmacy}
                      onChange={(e) => setRxSendToPharmacy(e.target.checked)}
                    />
                    Envoyer à une pharmacie (plus tard : choisir la pharmacie)
                  </label>

                  {!rxSendToPatient && !rxSendToPharmacy ? (
                    <div className="text-xs text-destructive">Sélectionnez au moins un destinataire.</div>
                  ) : null}
                </div>

                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{rxPreview}</pre>
                </div>
              </div>
            ) : null}
          </div>
        </Drawer>

        <Drawer
          open={drawer === "lab"}
          title={`Demande d’analyses — ${patient?.name || "Patient"}`}
          onClose={() => setDrawer(null)}
          footer={
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <Button variant="outline" onClick={() => window.alert(labsPreview)}>
                <Printer className="mr-2 h-4 w-4" />
                Aperçu
              </Button>

              {labsStep === 1 ? (
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setLabsStep(2)}
                >
                  Continuer
                </Button>
              ) : null}

              {labsStep === 2 ? (
                <>
                  <Button variant="outline" onClick={() => setLabsStep(1)}>
                    Retour
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      if (!labsValidated) {
                        window.alert("Veuillez valider la demande d’analyses avant de continuer.");
                        return;
                      }
                      setLabsStep(3);
                    }}
                  >
                    Continuer
                  </Button>
                </>
              ) : null}

              {labsStep === 3 ? (
                <>
                  <Button variant="outline" onClick={() => setLabsStep(2)}>
                    Retour
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!labsValidated || (!labsSendToPatient && !labsSendToLab)}
                    onClick={() => {
                      // TODO backend : créer demande + routage patient/labo + statut "en attente"
                      window.alert(
                        `Demande d’analyses envoyée (mock)\n- Patient: ${labsSendToPatient ? "oui" : "non"}\n- Laboratoire: ${
                          labsSendToLab ? "oui" : "non"
                        }`,
                      );
                      setDrawer(null);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </Button>
                </>
              ) : null}

              <Button variant="outline" onClick={() => setDrawer(null)}>
                Fermer
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Stepper */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLabsStep(1)}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  labsStep === 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                1. Sélection
              </button>
              <button
                type="button"
                onClick={() => setLabsStep(2)}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  labsStep === 2
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                2. Valider
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!labsValidated) {
                    window.alert("Veuillez valider avant d’aller à l’étape d’envoi.");
                    return;
                  }
                  setLabsStep(3);
                }}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  labsStep === 3
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                3. Envoyer
              </button>
            </div>

            {labsStep === 1 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Sélectionnez les analyses. (UI) — plus tard, ces choix seront envoyés au module Laboratoire.
                </div>

                <div className="grid grid-cols-12 gap-2">
                  {labPanels.map((p) => (
                    <label
                      key={p.key}
                      className="col-span-12 md:col-span-6 rounded-2xl border bg-card p-3 flex items-start gap-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={Boolean(labsSelected[p.key])}
                        onChange={(e) => setLabsSelected((s) => ({ ...s, [p.key]: e.target.checked }))}
                      />
                      <div>
                        <div className="text-sm font-semibold text-foreground">{p.label}</div>
                        {p.hint ? <div className="text-xs text-muted-foreground">{p.hint}</div> : null}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Autres analyses (optionnel)</Label>
                  <Input
                    value={labsCustom}
                    onChange={(e) => setLabsCustom(e.target.value)}
                    placeholder="Ex: Vitamine D, Ferritine…"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Note (optionnel)</Label>
                  <textarea
                    value={labsNote}
                    onChange={(e) => setLabsNote(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: à jeun, urgence, antécédents…"
                  />
                </div>

                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{labsPreview}</pre>
                </div>
              </div>
            ) : null}

            {labsStep === 2 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Vérifiez puis validez la demande.</div>

                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{labsPreview}</pre>
                </div>

                <div className="rounded-2xl border bg-card p-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={labsValidated}
                      onChange={(e) => setLabsValidated(e.target.checked)}
                    />
                    <div>
                      <div className="text-sm font-semibold text-foreground">Je valide la demande d’analyses</div>
                      <div className="text-xs text-muted-foreground">
                        (Mock) À brancher sur règles métiers + statut côté backend.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ) : null}

            {labsStep === 3 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Choisissez les destinataires (patient / laboratoire).
                </div>

                <div className="rounded-2xl border bg-card p-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={labsSendToPatient}
                      onChange={(e) => setLabsSendToPatient(e.target.checked)}
                    />
                    Envoyer au patient
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={labsSendToLab}
                      onChange={(e) => setLabsSendToLab(e.target.checked)}
                    />
                    Envoyer au laboratoire (plus tard : choisir le laboratoire)
                  </label>

                  {!labsSendToPatient && !labsSendToLab ? (
                    <div className="text-xs text-destructive">Sélectionnez au moins un destinataire.</div>
                  ) : null}
                </div>

                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{labsPreview}</pre>
                </div>
              </div>
            ) : null}
          </div>
        </Drawer>

        <Drawer
          open={drawer === "doc"}
          title={`${docTitle} — ${patient?.name || "Patient"}`}
          onClose={() => setDrawer(null)}
          footer={
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <Button variant="outline" onClick={() => window.alert(docPreview)}>
                <Printer className="mr-2 h-4 w-4" />
                Aperçu
              </Button>

              {docStep === 1 ? (
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setDocStep(2)}
                >
                  Continuer
                </Button>
              ) : null}

              {docStep === 2 ? (
                <>
                  <Button variant="outline" onClick={() => setDocStep(1)}>
                    Retour
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      if (!docSigned) {
                        window.alert("Veuillez signer/valider le document avant de continuer.");
                        return;
                      }
                      setDocStep(3);
                    }}
                  >
                    Continuer
                  </Button>
                </>
              ) : null}

              {docStep === 3 ? (
                <>
                  <Button variant="outline" onClick={() => setDocStep(2)}>
                    Retour
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!docSigned || !docSendToPatient}
                    onClick={() => {
                      // TODO backend : générer PDF + stocker + envoyer au patient / attacher à la consultation
                      window.alert("Document envoyé au patient (mock).");
                      setDrawer(null);
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
                  </Button>
                </>
              ) : null}

              <Button variant="outline" onClick={() => setDrawer(null)}>
                Fermer
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Stepper */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDocStep(1)}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  docStep === 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                1. Rédiger
              </button>
              <button
                type="button"
                onClick={() => setDocStep(2)}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  docStep === 2
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                2. Signer
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!docSigned) {
                    window.alert("Veuillez signer/valider avant d’aller à l’étape d’envoi.");
                    return;
                  }
                  setDocStep(3);
                }}
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-semibold border",
                  docStep === 3
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                3. Envoyer
              </button>
            </div>

            {docStep === 1 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Choisissez un template puis rédigez. (UI) — backend : stockage + signature + PDF.
                </div>

                {/* Templates */}
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { k: "report", label: "Compte-rendu" },
                      { k: "certificate", label: "Certificat" },
                      { k: "referral", label: "Lettre" },
                      { k: "sickleave", label: "Arrêt" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.k}
                      type="button"
                      onClick={() => {
                        setDocTemplate(t.k);
                        // On laisse le prefill (useEffect) s’appliquer si le body est vide.
                      }}
                      className={cx(
                        "rounded-xl px-3 py-2 text-xs font-semibold border",
                        docTemplate === t.k
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <Label className="text-xs">Contenu</Label>
                  <textarea
                    value={docBody}
                    onChange={(e) => setDocBody(e.target.value)}
                    rows={10}
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Rédigez le document…"
                  />
                </div>

                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{docPreview}</pre>
                </div>
              </div>
            ) : null}

            {docStep === 2 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Vérifiez puis signez/validez.</div>

                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{docPreview}</pre>
                </div>

                <div className="rounded-2xl border bg-card p-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={docSigned}
                      onChange={(e) => setDocSigned(e.target.checked)}
                    />
                    <div>
                      <div className="text-sm font-semibold text-foreground">Je valide et signe le document</div>
                      <div className="text-xs text-muted-foreground">
                        (Mock) À brancher sur signature électronique côté backend.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ) : null}

            {docStep === 3 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Choisissez les destinataires.</div>

                <div className="rounded-2xl border bg-card p-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={docSendToPatient}
                      onChange={(e) => setDocSendToPatient(e.target.checked)}
                    />
                    Envoyer au patient
                  </label>

                  {!docSendToPatient ? (
                    <div className="text-xs text-destructive">Sélectionnez un destinataire.</div>
                  ) : null}
                </div>

                <div className="rounded-2xl border bg-muted p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Aperçu</div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground">{docPreview}</pre>
                </div>
              </div>
            ) : null}
          </div>
        </Drawer>
      </div>
    </DashboardLayout>
  );
}
