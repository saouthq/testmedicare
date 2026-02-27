/**
 * PatientDetailContext — Centralise TOUT le state et les handlers du dossier patient.
 * Les composants enfants consomment via usePatientDetail().
 *
 * // TODO BACKEND: Remplacer mockData par des appels API (React Query).
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockConsultationPatient,
  mockPatientAnalyses,
  mockPatientConsultations,
  mockPatientDetailPrescriptions,
  mockVitalsHistory,
} from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import type {
  MainTab, HistFilter, DrawerKind, DocFileKind, DocTemplate, WorkflowStep,
  TimelineEvent, PatientFile, Ante, VersionText, VersionAnte, VersionVitals,
  VitalsData, RxDraftItem, LabPanel,
} from "./types";
import { makeCode, nowAt, dateLabel, buildRxItemsLabel } from "./helpers";

/* ---- Context value type ---- */
interface PatientDetailValue {
  patient: any;
  patientId: string;
  navigate: ReturnType<typeof useNavigate>;

  // Tabs & search
  tab: MainTab; setTab: (t: MainTab) => void;
  q: string; setQ: (v: string) => void;
  histFilter: HistFilter; setHistFilter: (f: HistFilter) => void;

  // Notes
  notes: string; setNotes: (v: string) => void;
  notesHistory: VersionText[]; saveNotes: () => void;
  privateNotes: string; setPrivateNotes: (v: string) => void;
  privateHistory: VersionText[]; savePrivate: () => void;

  // Antecedents
  ante: Ante; setAnte: (v: Ante) => void;
  anteHistory: VersionAnte[]; saveAnte: () => void;

  // Vitals
  vitals: VitalsData; setVitals: React.Dispatch<React.SetStateAction<VitalsData>>;
  vitalsHistory: VersionVitals[]; saveVitals: () => void;

  // Documents
  files: PatientFile[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  photoInputRef: React.RefObject<HTMLInputElement | null>;
  addFiles: (list: FileList | null, kind: DocFileKind) => void;
  removeFile: (id: string) => void;

  // Records
  consultRecords: any[]; setConsultRecords: React.Dispatch<React.SetStateAction<any[]>>;
  rxRecords: any[]; setRxRecords: React.Dispatch<React.SetStateAction<any[]>>;
  labRecords: any[]; setLabRecords: React.Dispatch<React.SetStateAction<any[]>>;

  // Timeline
  timeline: TimelineEvent[];

  // Active Rx
  activeRx: any[];
  activeTreatments: string[];

  // Quick notes
  quickNotes: string; setQuickNotes: (v: string) => void;
  quickNotesSavedAt: Date | null;
  quickNotesRef: React.RefObject<HTMLDivElement | null>;
  scrollToQuickNotes: () => void;
  appendQuickNote: (note: string) => void;

  // Actions palette
  actionsOpen: boolean; setActionsOpen: (v: boolean) => void;
  actionsQ: string; setActionsQ: (v: string) => void;
  actionsIndex: number; setActionsIndex: React.Dispatch<React.SetStateAction<number>>;
  actionsInputRef: React.RefObject<HTMLInputElement | null>;
  actions: Array<{ id: string; label: string; hint?: string; icon: ReactNode; run: () => void; group?: string }>;

  // Create menu
  createOpen: boolean; setCreateOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createWrapRef: React.RefObject<HTMLDivElement | null>;

  // Drawers
  drawer: DrawerKind; setDrawer: (v: DrawerKind) => void;

  // Detail slide
  detailEvent: TimelineEvent | null; setDetailEvent: (v: TimelineEvent | null) => void;
  detailEdit: boolean; setDetailEdit: (v: boolean) => void;
  detailDraft: string; setDetailDraft: (v: string) => void;
  detailNameDraft: string; setDetailNameDraft: (v: string) => void;

  // Rx workflow
  rxStep: WorkflowStep; setRxStep: (v: WorkflowStep) => void;
  rxItems: RxDraftItem[]; setRxItems: React.Dispatch<React.SetStateAction<RxDraftItem[]>>;
  rxNote: string; setRxNote: (v: string) => void;
  rxSigned: boolean; setRxSigned: (v: boolean) => void;
  rxSendToPatient: boolean; setRxSendToPatient: (v: boolean) => void;
  rxSendToPharmacy: boolean; setRxSendToPharmacy: (v: boolean) => void;
  rxSendStatus: { code: string; version: number; sentAt: string } | null;
  setRxSendStatus: React.Dispatch<React.SetStateAction<{ code: string; version: number; sentAt: string } | null>>;
  rxEditingAfterSend: boolean; setRxEditingAfterSend: (v: boolean) => void;
  rxPreview: string;
  openRx: () => void;

  // Labs workflow
  labsStep: WorkflowStep; setLabsStep: (v: WorkflowStep) => void;
  labPanels: LabPanel[];
  labsSelected: Record<string, boolean>; setLabsSelected: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  labsCustom: string; setLabsCustom: (v: string) => void;
  labsNote: string; setLabsNote: (v: string) => void;
  labsSendToPatient: boolean; setLabsSendToPatient: (v: boolean) => void;
  labsSendToLab: boolean; setLabsSendToLab: (v: boolean) => void;
  labsValidated: boolean; setLabsValidated: (v: boolean) => void;
  labsSendStatus: { code: string; version: number; sentAt: string } | null;
  setLabsSendStatus: React.Dispatch<React.SetStateAction<{ code: string; version: number; sentAt: string } | null>>;
  labsEditingAfterSend: boolean; setLabsEditingAfterSend: (v: boolean) => void;
  labsPreview: string;
  openLabs: () => void;
  selectedLabLabels: () => string[];

  // Doc workflow
  docStep: WorkflowStep; setDocStep: (v: WorkflowStep) => void;
  docTemplate: DocTemplate; setDocTemplate: (v: DocTemplate) => void;
  docBody: string; setDocBody: (v: string) => void;
  docSigned: boolean; setDocSigned: (v: boolean) => void;
  docSendToPatient: boolean; setDocSendToPatient: (v: boolean) => void;
  docSendStatus: { fileId: string; version: number; sentAt: string } | null;
  setDocSendStatus: React.Dispatch<React.SetStateAction<{ fileId: string; version: number; sentAt: string } | null>>;
  docEditingAfterSend: boolean; setDocEditingAfterSend: (v: boolean) => void;
  docTitle: string;
  docPreview: string;
  openDoc: (template?: DocTemplate) => void;

  // Files (direct setter for doc drawer)
  setFiles: React.Dispatch<React.SetStateAction<PatientFile[]>>;
  // Misc
  printDossier: () => void;
}

const Ctx = createContext<PatientDetailValue | null>(null);

export function usePatientDetail() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePatientDetail must be used within PatientDetailProvider");
  return v;
}

export function PatientDetailProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const patient = mockConsultationPatient as any;
  const patientId = String(patient?.id ?? patient?.email ?? patient?.name ?? "patient");

  // ── Records ──
  const [consultRecords, setConsultRecords] = useState<any[]>(() =>
    (mockPatientConsultations || []).map((c: any, idx: number) => ({ ...c, _id: c.id ?? `CONS-${idx}` })),
  );
  const [rxRecords, setRxRecords] = useState<any[]>(() =>
    (mockPatientDetailPrescriptions || []).map((r: any, idx: number) => ({ ...r, _id: r.id ?? `RX-${idx}` })),
  );
  const [labRecords, setLabRecords] = useState<any[]>(() =>
    (mockPatientAnalyses || []).map((a: any, idx: number) => ({ ...a, _id: a.id ?? `LAB-${idx}` })),
  );

  // ── Quick notes (localStorage) ──
  const quickNotesRef = useRef<HTMLDivElement | null>(null);
  const QUICK_NOTES_KEY = `medicare.patient.${patientId}.quickNotes.v1`;
  const [quickNotes, setQuickNotes] = useState<string>(() => {
    try { return localStorage.getItem(QUICK_NOTES_KEY) || ""; } catch { return ""; }
  });
  const [quickNotesSavedAt, setQuickNotesSavedAt] = useState<Date | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => {
      try { localStorage.setItem(QUICK_NOTES_KEY, quickNotes); setQuickNotesSavedAt(new Date()); } catch {}
    }, 450);
    return () => window.clearTimeout(t);
  }, [QUICK_NOTES_KEY, quickNotes]);

  const scrollToQuickNotes = () => {
    window.setTimeout(() => {
      quickNotesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const el = document.getElementById("patient-quick-notes-textarea");
      if (el instanceof HTMLTextAreaElement) el.focus();
    }, 0);
  };

  // ── Navigation / tabs ──
  const [tab, setTab] = useState<MainTab>("historique");
  const [q, setQ] = useState("");
  const [histFilter, setHistFilter] = useState<HistFilter>("all");

  // ── Detail slide ──
  const [detailEvent, setDetailEvent] = useState<TimelineEvent | null>(null);
  const [detailEdit, setDetailEdit] = useState(false);
  const [detailDraft, setDetailDraft] = useState("");
  const [detailNameDraft, setDetailNameDraft] = useState("");

  // ── Actions palette ──
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsQ, setActionsQ] = useState("");
  const [actionsIndex, setActionsIndex] = useState(0);
  const actionsInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActionsOpen(true); setActionsQ(""); setActionsIndex(0);
      }
      if (e.key === "Escape") setActionsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!actionsOpen) return;
    setActionsIndex(0);
    const t = window.setTimeout(() => actionsInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [actionsOpen, actionsQ]);

  // ── Create menu ──
  const [createOpen, setCreateOpen] = useState(false);
  const createWrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!createOpen) return;
      const el = createWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setCreateOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (createOpen && e.key === "Escape") setCreateOpen(false); };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousedown", onDown); window.removeEventListener("keydown", onKey); };
  }, [createOpen]);

  // ── Drawers ──
  const [drawer, setDrawer] = useState<DrawerKind>(null);

  // ── Rx workflow ──
  const [rxStep, setRxStep] = useState<WorkflowStep>(1);
  const [rxItems, setRxItems] = useState<RxDraftItem[]>([{ medication: "", dosage: "", duration: "", instructions: "" }]);
  const [rxNote, setRxNote] = useState("");
  const [rxSigned, setRxSigned] = useState(false);
  const [rxSendToPatient, setRxSendToPatient] = useState(true);
  const [rxSendToPharmacy, setRxSendToPharmacy] = useState(false);
  const [rxSendStatus, setRxSendStatus] = useState<{ code: string; version: number; sentAt: string } | null>(null);
  const [rxEditingAfterSend, setRxEditingAfterSend] = useState(false);

  // ── Labs workflow ──
  const labPanels = useMemo<LabPanel[]>(() => [
    { key: "nfs", label: "NFS", hint: "Bilan sanguin" },
    { key: "gly", label: "Glycémie", hint: "à jeun" },
    { key: "hba1c", label: "HbA1c", hint: "3 mois" },
    { key: "lip", label: "Bilan lipidique", hint: "cholestérol" },
    { key: "crp", label: "CRP", hint: "inflammation" },
    { key: "tsh", label: "TSH", hint: "thyroïde" },
    { key: "iono", label: "Ionogramme", hint: "Na/K/Cl" },
    { key: "creat", label: "Créatinine", hint: "fonction rénale" },
  ], []);

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
  const [labsSendStatus, setLabsSendStatus] = useState<{ code: string; version: number; sentAt: string } | null>(null);
  const [labsEditingAfterSend, setLabsEditingAfterSend] = useState(false);

  // ── Doc workflow ──
  const [docStep, setDocStep] = useState<WorkflowStep>(1);
  const [docTemplate, setDocTemplate] = useState<DocTemplate>("report");
  const [docBody, setDocBody] = useState("");
  const [docSigned, setDocSigned] = useState(false);
  const [docSendToPatient, setDocSendToPatient] = useState(true);
  const [docSendStatus, setDocSendStatus] = useState<{ fileId: string; version: number; sentAt: string } | null>(null);
  const [docEditingAfterSend, setDocEditingAfterSend] = useState(false);

  useEffect(() => {
    if (drawer !== "doc") return;
    if ((docBody || "").trim().length > 0) return;
    const name = patient?.name || "le patient";
    const date = new Date().toLocaleDateString();
    switch (docTemplate) {
      case "certificate": setDocBody(`Je soussigné(e), Dr. ________, certifie avoir examiné ${name} en date du ${date}.\n\nConclusion : ________.\n\nFait pour servir et valoir ce que de droit.`); return;
      case "referral": setDocBody(`Cher/Chère confrère/consœur,\n\nJe vous adresse ${name} pour avis spécialisé concernant : ________.\n\nContexte / éléments cliniques :\n- ________\n\nJe vous remercie par avance.\n\nCordialement,\nDr. ________`); return;
      case "sickleave": setDocBody(`Je soussigné(e), Dr. ________, certifie que l'état de santé de ${name} nécessite un arrêt de travail du __/__/____ au __/__/____.\n\nMotif (optionnel) : ________.\n\nFait à ________, le ${date}.`); return;
      default: setDocBody(`Compte-rendu de consultation — ${date}\n\nMotif : ________.\n\nExamen / Synthèse :\n- ________\n\nConclusion / Conduite à tenir :\n- ________`); return;
    }
  }, [docBody, docTemplate, drawer, patient?.name]);

  // ── Notes ──
  const [notes, setNotes] = useState("Suivi régulier diabète type 2. Bonne observance thérapeutique. Contrôle trimestriel HbA1c. Fond d'œil annuel à programmer.");
  const [notesHistory, setNotesHistory] = useState<VersionText[]>([]);
  const [privateNotes, setPrivateNotes] = useState("");
  const [privateHistory, setPrivateHistory] = useState<VersionText[]>([]);

  const saveNotes = () => { const ts = Date.now(); const at = new Date().toLocaleString(); setNotesHistory((p) => [{ id: `n-${ts}`, at, ts, text: notes }, ...p]); };
  const savePrivate = () => { const ts = Date.now(); const at = new Date().toLocaleString(); setPrivateHistory((p) => [{ id: `pn-${ts}`, at, ts, text: privateNotes }, ...p]); };

  // ── Antecedents ──
  const [ante, setAnte] = useState<Ante>({ medical: "", surgical: "", traumatic: "", family: "" });
  const [anteHistory, setAnteHistory] = useState<VersionAnte[]>([]);
  const saveAnte = () => { const ts = Date.now(); const at = new Date().toLocaleString(); setAnteHistory((p) => [{ id: `a-${ts}`, at, ts, data: { ...ante } }, ...p]); };

  // ── Vitals ──
  const lastVitals = useMemo(() => (mockVitalsHistory || [])[0], []);
  const [vitals, setVitals] = useState<VitalsData>({
    ta: lastVitals ? `${lastVitals.systolic}/${lastVitals.diastolic}` : "130/80",
    fc: String(lastVitals?.heartRate ?? "72"),
    weight: String(lastVitals?.weight ?? "75"),
    gly: String(lastVitals?.glycemia ?? "1.05 g/L"),
  });
  const [vitalsHistory, setVitalsHistory] = useState<VersionVitals[]>(() =>
    (mockVitalsHistory || []).map((v: any, i: number) => ({
      id: `vh-${i}`, at: v.date, ts: Date.parse(v.date) || Date.now() - i * 1000,
      data: { ta: `${v.systolic ?? ""}/${v.diastolic ?? ""}`, fc: String(v.heartRate ?? ""), weight: String(v.weight ?? ""), gly: String(v.glycemia ?? "") },
    })),
  );
  const saveVitals = () => { const ts = Date.now(); const at = new Date().toLocaleString(); setVitalsHistory((p) => [{ id: `vh-${ts}`, at, ts, data: { ...vitals } }, ...p]); };

  // ── Documents ──
  const [files, setFiles] = useState<PatientFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const addFiles = (list: FileList | null, kind: DocFileKind) => {
    if (!list || !list.length) return;
    const ts = Date.now(); const at = new Date().toLocaleString();
    const items: PatientFile[] = Array.from(list).map((f, i) => ({
      id: `pf-${ts}-${i}-${Math.random().toString(16).slice(2)}`, at, ts: ts + i, kind,
      name: f.name, mime: f.type || (kind === "photo" ? "image/*" : "application/octet-stream"),
      size: f.size, url: URL.createObjectURL(f),
    }));
    setFiles((p) => [...items, ...p]);
  };
  const removeFile = (id: string) => {
    setFiles((p) => {
      const f = p.find((x) => x.id === id);
      if (f?.url) { try { URL.revokeObjectURL(f.url); } catch {} }
      return p.filter((x) => x.id !== id);
    });
  };

  // ── Timeline ──
  const mockTimeline = useMemo<TimelineEvent[]>(() => {
    const consults = consultRecords.map((c: any, idx: number) => ({
      id: `c-${c._id ?? idx}`, at: c.date, ts: Date.parse(c.date) || Date.now() - idx * 1000,
      type: "consult" as const, title: c.motif, desc: c.notes, payload: c, open: { kind: "consult" as const },
    }));
    const rxs = rxRecords.map((p: any) => ({
      id: `rx-${p._id ?? p.id}`, at: p.date, ts: Date.parse(p.date) || Date.now() - 2000,
      type: "rx" as const, title: `Ordonnance ${p.id}`, desc: p.items?.[0] ? `${p.items[0]}${p.items.length > 1 ? ` • +${p.items.length - 1}` : ""}` : "—",
      payload: p, open: { kind: "rx" as const },
    }));
    const labs = labRecords.map((a: any) => ({
      id: `lab-${a._id ?? a.id}`, at: a.date, ts: Date.parse(a.date) || Date.now() - 3000,
      type: "lab" as const, title: a.type, desc: a.values?.[0] ? `${a.values[0].name}: ${a.values[0].value}` : "—",
      payload: a, open: { kind: "lab" as const },
    }));
    const docs = files.slice(0, 10).map((f) => ({
      id: `doc-${f.id}`, at: f.at, ts: f.ts, type: "doc" as const,
      title: f.kind === "photo" ? "Photo importée" : "Document importé", desc: f.name,
      open: { kind: "doc" as const }, payload: f,
    }));
    return [...docs, ...consults, ...rxs, ...labs].sort((x, y) => y.ts - x.ts);
  }, [files, consultRecords, rxRecords, labRecords]);

  const timeline = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return mockTimeline
      .filter((e) => (histFilter === "all" ? true : e.type === histFilter))
      .filter((e) => (!qq ? true : `${e.title} ${e.desc || ""}`.toLowerCase().includes(qq)));
  }, [mockTimeline, q, histFilter]);

  useEffect(() => {
    if (drawer !== "detail" || !detailEvent) return;
    if (detailEvent.type === "consult") setDetailDraft(String(detailEvent.payload?.notes || detailEvent.desc || ""));
    if (detailEvent.type === "doc") setDetailNameDraft(String(detailEvent.payload?.name || detailEvent.desc || ""));
    setDetailEdit(false);
  }, [detailEvent, drawer]);

  // ── Active Rx ──
  const activeRx = useMemo(() => rxRecords.filter((p: any) => p.status === "active"), [rxRecords]);
  const activeTreatments = useMemo(() => activeRx.flatMap((p: any) => p.items), [activeRx]);

  // ── Workflow openers ──
  // TODO BACKEND: POST /api/prescriptions — créer une ordonnance
  const openRx = () => {
    setRxItems([{ medication: "", dosage: "", duration: "", instructions: "" }]);
    setRxNote(""); setRxSigned(false); setRxSendToPatient(true); setRxSendToPharmacy(false);
    setRxStep(1); setRxSendStatus(null); setRxEditingAfterSend(false); setDrawer("rx");
  };

  // TODO BACKEND: POST /api/lab-requests — créer une demande d'analyses
  const openLabs = () => {
    setLabsSelected(() => { const init: Record<string, boolean> = {}; labPanels.forEach((p) => (init[p.key] = false)); return init; });
    setLabsCustom(""); setLabsNote(""); setLabsSendToPatient(true); setLabsSendToLab(true);
    setLabsValidated(false); setLabsStep(1); setLabsSendStatus(null); setLabsEditingAfterSend(false); setDrawer("lab");
  };

  // TODO BACKEND: POST /api/documents — générer un document
  const openDoc = (template?: DocTemplate) => {
    setDocSendToPatient(true); setDocSigned(false); setDocStep(1);
    setDocSendStatus(null); setDocEditingAfterSend(false);
    if (template) { setDocTemplate(template); setDocBody(""); }
    setDrawer("doc");
  };

  // ── Previews ──
  const rxPreview = useMemo(() => {
    const who = patient?.name ? `Patient: ${patient.name}` : "Patient: —";
    const meds = rxItems.filter((it) => `${it.medication}${it.dosage}${it.duration}${it.instructions}`.trim().length > 0)
      .map((it, idx) => {
        const head = it.medication?.trim() || "—";
        const meta = [it.dosage, it.duration].map((x) => (x || "").trim()).filter(Boolean).join(" · ");
        const instr = (it.instructions || "").trim();
        return `${idx + 1}. ${head}${meta ? ` — ${meta}` : ""}${instr ? ` (${instr})` : ""}`;
      });
    return `ORDONNANCE\n${who}\n\n${meds.length ? meds.join("\n") : "Aucun médicament."}\n\nNote: ${(rxNote || "").trim() || "—"}`;
  }, [patient, rxItems, rxNote]);

  const selectedLabLabels = () => {
    const arr = labPanels.filter((p) => Boolean(labsSelected[p.key])).map((p) => p.label);
    const custom = (labsCustom || "").trim();
    if (custom) arr.push(custom);
    return arr;
  };

  const labsPreview = useMemo(() => {
    const who = patient?.name ? `Patient: ${patient.name}` : "Patient: —";
    const selected = labPanels.filter((p) => Boolean(labsSelected[p.key])).map((p) => `- ${p.label}${p.hint ? ` (${p.hint})` : ""}`);
    const custom = (labsCustom || "").trim();
    if (custom) selected.push(`- Autres: ${custom}`);
    return `DEMANDE D'ANALYSES\n${who}\n\n${selected.length ? selected.join("\n") : "- (aucune analyse sélectionnée)"}\n\nNote: ${(labsNote || "").trim() || "—"}`;
  }, [labPanels, labsCustom, labsNote, labsSelected, patient]);

  const docTitle = useMemo(() => {
    switch (docTemplate) {
      case "certificate": return "Certificat médical";
      case "referral": return "Lettre d'adressage";
      case "sickleave": return "Arrêt de travail";
      default: return "Compte-rendu";
    }
  }, [docTemplate]);

  const docPreview = useMemo(() => {
    const who = patient?.name ? `Patient: ${patient.name}` : "Patient: —";
    return `${docTitle.toUpperCase()}\n${who}\n\n${(docBody || "").trim() || "—"}`;
  }, [docBody, docTitle, patient]);

  // ── Append quick note to clinical ──
  const appendQuickNote = (note: string) => {
    const merged = notes ? `${notes}\n\n[Note rapide] ${note}` : `[Note rapide] ${note}`;
    setNotes(merged);
    const ts = Date.now(); const at = new Date().toLocaleString();
    setNotesHistory((p) => [{ id: `n-${ts}`, at, ts, text: merged }, ...p]);
  };

  // ── Actions palette items ──
  const actions = useMemo(() => {
    type AG = "Consultation" | "Créer" | "Dossier" | "Communication" | "Utilitaires";
    const { Stethoscope, Pill, Droplets, FileText, ChevronRight, ClipboardList, History, MessageSquare, Phone, Calendar, Printer } = require("lucide-react");
    const items: Array<{ id: string; group: AG; label: string; hint?: string; icon: ReactNode; run: () => void }> = [
      { id: "new-consult", group: "Consultation", label: "Nouvelle consultation", hint: "Ouvrir le module", icon: <Stethoscope className="h-4 w-4" />, run: () => toast({ title: "Nouvelle consultation", description: "Workflow intra‑page (UI). À brancher." }) },
      { id: "rx", group: "Créer", label: "Créer une ordonnance", hint: "Composer → signer → envoyer", icon: <Pill className="h-4 w-4" />, run: openRx },
      { id: "labs", group: "Créer", label: "Créer une demande d'analyses", hint: "Sélection → valider → envoyer", icon: <Droplets className="h-4 w-4" />, run: openLabs },
      { id: "docs", group: "Créer", label: "Générer un document", hint: "CR / Certif / Lettre / Arrêt", icon: <FileText className="h-4 w-4" />, run: () => openDoc() },
      { id: "latest", group: "Dossier", label: "Ouvrir le dernier élément", hint: "Slide détail", icon: <ChevronRight className="h-4 w-4" />, run: () => { const last = mockTimeline?.[0]; if (!last) return; setDetailEvent(last); setDetailEdit(false); setDrawer("detail"); } },
      { id: "quick-notes", group: "Dossier", label: "Ajouter une note rapide", hint: "Card Notes", icon: <ClipboardList className="h-4 w-4" />, run: scrollToQuickNotes },
      { id: "tab-n", group: "Dossier", label: "Aller à Notes cliniques", icon: <ClipboardList className="h-4 w-4" />, run: () => setTab("notes") },
      { id: "tab-pn", group: "Dossier", label: "Aller à Notes privées", icon: <ClipboardList className="h-4 w-4" />, run: () => setTab("notes_prive") },
      { id: "tab-a", group: "Dossier", label: "Aller à Antécédents", icon: <History className="h-4 w-4" />, run: () => setTab("antecedents") },
      { id: "tab-v", group: "Dossier", label: "Aller à Constantes", icon: <Droplets className="h-4 w-4" />, run: () => setTab("constantes") },
      { id: "tab-d", group: "Dossier", label: "Aller à Documents", icon: <FileText className="h-4 w-4" />, run: () => setTab("documents") },
      { id: "msg", group: "Communication", label: "Envoyer un message au patient", icon: <MessageSquare className="h-4 w-4" />, run: () => toast({ title: "Message", description: "À brancher : ouvrir la messagerie." }) },
      { id: "call", group: "Communication", label: "Appeler le patient", hint: patient?.phone || "Téléphone", icon: <Phone className="h-4 w-4" />, run: () => toast({ title: "Appel", description: `À brancher : appeler ${patient?.phone || "—"}.` }) },
      { id: "plan", group: "Utilitaires", label: "Planifier un RDV", icon: <Calendar className="h-4 w-4" />, run: () => toast({ title: "Rendez‑vous", description: "À brancher." }) },
      { id: "print", group: "Utilitaires", label: "Imprimer le dossier", icon: <Printer className="h-4 w-4" />, run: () => toast({ title: "Impression", description: "À brancher." }) },
    ];

    const qq = actionsQ.trim().toLowerCase();
    const filtered = qq ? items.filter((a) => `${a.label} ${a.hint || ""}`.toLowerCase().includes(qq)) : items;
    return filtered.slice(0, 14);
  }, [actionsQ, openLabs, openRx, patient?.phone, scrollToQuickNotes, mockTimeline]);

  const printDossier = () => toast({ title: "Impression", description: "À brancher : impression / export PDF du dossier." });

  const value: PatientDetailValue = {
    patient, patientId, navigate,
    tab, setTab, q, setQ, histFilter, setHistFilter,
    notes, setNotes, notesHistory, saveNotes,
    privateNotes, setPrivateNotes, privateHistory, savePrivate,
    ante, setAnte, anteHistory, saveAnte,
    vitals, setVitals, vitalsHistory, saveVitals,
    files, setFiles, fileInputRef, photoInputRef, addFiles, removeFile,
    consultRecords, setConsultRecords, rxRecords, setRxRecords, labRecords, setLabRecords,
    timeline, activeRx, activeTreatments,
    quickNotes, setQuickNotes, quickNotesSavedAt, quickNotesRef, scrollToQuickNotes, appendQuickNote,
    actionsOpen, setActionsOpen, actionsQ, setActionsQ, actionsIndex, setActionsIndex, actionsInputRef, actions,
    createOpen, setCreateOpen, createWrapRef,
    drawer, setDrawer,
    detailEvent, setDetailEvent, detailEdit, setDetailEdit, detailDraft, setDetailDraft, detailNameDraft, setDetailNameDraft,
    rxStep, setRxStep, rxItems, setRxItems, rxNote, setRxNote, rxSigned, setRxSigned,
    rxSendToPatient, setRxSendToPatient, rxSendToPharmacy, setRxSendToPharmacy,
    rxSendStatus, setRxSendStatus, rxEditingAfterSend, setRxEditingAfterSend, rxPreview, openRx,
    labsStep, setLabsStep, labPanels, labsSelected, setLabsSelected, labsCustom, setLabsCustom,
    labsNote, setLabsNote, labsSendToPatient, setLabsSendToPatient, labsSendToLab, setLabsSendToLab,
    labsValidated, setLabsValidated, labsSendStatus, setLabsSendStatus,
    labsEditingAfterSend, setLabsEditingAfterSend, labsPreview, openLabs, selectedLabLabels,
    docStep, setDocStep, docTemplate, setDocTemplate, docBody, setDocBody, docSigned, setDocSigned,
    docSendToPatient, setDocSendToPatient, docSendStatus, setDocSendStatus,
    docEditingAfterSend, setDocEditingAfterSend, docTitle, docPreview, openDoc,
    printDossier,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
