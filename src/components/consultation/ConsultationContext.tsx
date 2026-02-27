import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar, Clock, FileSignature, FileText, History, PenLine, Pill, PanelsRightBottom,
} from "lucide-react";
import {
  mockConsultationPatient, mockRxFavorites, mockPastConsults,
  mockLabSuggestionsBase, mockLabSuggestionsDT2, mockLabSuggestionsAngine,
  mockConsultationInitialVitals, mockConsultationInitialNotes,
  mockConsultationInitialPrescription, mockConsultationInitialAnalyses,
  mockConsultationTemplates, mockPatients,
  type RxFavorite,
} from "@/data/mockData";
import type { DockTab, SlideType, PrescriptionItem, VitalsState, CompletionState, CommandAction } from "./types";
import { escapeHtml, scrollToId, openPrintWindow } from "./helpers";

// ── Context type ─────────────────────────────────────────────
interface Ctx {
  patient: typeof mockConsultationPatient;
  navigate: ReturnType<typeof useNavigate>;
  // Notes
  motif: string; setMotif: (v: string) => void;
  symptoms: string; setSymptoms: (v: string) => void;
  examination: string; setExamination: (v: string) => void;
  diagnosis: string; setDiagnosis: (v: string) => void;
  conclusion: string; setConclusion: (v: string) => void;
  // Antecedents
  antMed: string; setAntMed: (v: string) => void;
  antSurg: string; setAntSurg: (v: string) => void;
  antTrauma: string; setAntTrauma: (v: string) => void;
  antFamily: string; setAntFamily: (v: string) => void;
  // Vitals
  vitals: VitalsState; setVitals: React.Dispatch<React.SetStateAction<VitalsState>>;
  vitalsOpen: boolean; setVitalsOpen: (v: boolean) => void;
  // Prescription
  rxItems: PrescriptionItem[];
  addRxItem: () => void;
  removeRxItem: (i: number) => void;
  updateRxItem: (i: number, f: keyof PrescriptionItem, v: string) => void;
  addFavToRx: (f: RxFavorite) => void;
  rxFavorites: RxFavorite[];
  // Analyses
  analyses: string[];
  newAnalyse: string; setNewAnalyse: (v: string) => void;
  addAnalyse: (v?: string) => void;
  removeAnalyse: (n: string) => void;
  labSuggestions: string[];
  // UI
  dockTab: DockTab; setDockTab: (v: DockTab) => void;
  leftCollapsed: boolean; setLeftCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  historyOpen: boolean; setHistoryOpen: (v: boolean) => void;
  showCloseModal: boolean; setShowCloseModal: (v: boolean) => void;
  closed: boolean;
  // Slide
  slideOpen: boolean; slideType: SlideType; slideStep: number;
  setSlideStep: React.Dispatch<React.SetStateAction<number>>;
  slideFeedback: string | null; slideTitle: string; slideSteps: string[];
  slideIsLastStep: boolean;
  openSlide: (t: SlideType, s?: number) => void;
  closeSlide: () => void;
  handleSlidePrimary: () => void;
  handleSlideSecondary: () => void;
  // Docs
  rxNote: string; setRxNote: (v: string) => void;
  rxSignedAt: Date | null;
  rxSendToPatient: boolean; setRxSendToPatient: (v: boolean) => void;
  rxSendToPharmacy: boolean; setRxSendToPharmacy: (v: boolean) => void;
  labsNote: string; setLabsNote: (v: string) => void;
  labsSignedAt: Date | null;
  labsSendToLab: boolean; setLabsSendToLab: (v: boolean) => void;
  labsSendToPatient: boolean; setLabsSendToPatient: (v: boolean) => void;
  reportText: string; setReportText: (v: string) => void;
  reportTouched: boolean; setReportTouched: (v: boolean) => void;
  reportSignedAt: Date | null;
  reportSendToPatient: boolean; setReportSendToPatient: (v: boolean) => void;
  certReason: string; setCertReason: (v: string) => void;
  certComment: string; setCertComment: (v: string) => void;
  certSignedAt: Date | null;
  slStart: string; setSlStart: (v: string) => void;
  slEnd: string; setSlEnd: (v: string) => void;
  slComment: string; setSlComment: (v: string) => void;
  slSignedAt: Date | null;
  rdvDate: string; setRdvDate: (v: string) => void;
  rdvTime: string; setRdvTime: (v: string) => void;
  rdvLocation: string; setRdvLocation: (v: string) => void;
  rdvConfirmedAt: Date | null;
  // Close
  nextRdv: string; setNextRdv: (v: string) => void;
  consultAmount: string; setConsultAmount: (v: string) => void;
  handleClose: () => void;
  // Palette
  paletteOpen: boolean; setPaletteOpen: (v: boolean) => void;
  paletteQuery: string; setPaletteQuery: (v: string) => void;
  paletteIndex: number; setPaletteIndex: React.Dispatch<React.SetStateAction<number>>;
  paletteInputRef: React.RefObject<HTMLInputElement>;
  filteredPalette: CommandAction[];
  // Derived
  initials: string; bmi: string;
  completion: CompletionState;
  nextAction: { label: string; onClick: () => void };
  lastSavedAt: Date | null;
  templates: Array<{ key: string; label: string; apply: () => void }>;
  pastConsults: typeof mockPastConsults;
  // Print
  rxPrintHtml: string; labsPrintHtml: string; reportPrintHtml: string;
  certPrintHtml: string; slPrintHtml: string;
  doPrint: (title: string, html: string) => void;
  setAnalyses: React.Dispatch<React.SetStateAction<string[]>>;
}

const C = createContext<Ctx | null>(null);

export function useConsultation() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useConsultation must be inside ConsultationProvider");
  return ctx;
}

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Load patient from query param or fallback to default
  const patient = useMemo(() => {
    const patientId = searchParams.get("patient");
    if (patientId) {
      const found = mockPatients.find(p => p.id === parseInt(patientId));
      if (found) {
        return {
          name: found.name,
          age: found.age,
          gender: found.gender,
          bloodType: found.bloodType,
          allergies: found.allergies.map(a => a.name),
          conditions: found.chronicConditions,
          lastVisit: found.lastVisit || "—",
          ssn: found.ssn,
          mutuelle: found.mutuelle,
          medecinTraitant: found.treatingDoctor,
        };
      }
    }
    return mockConsultationPatient;
  }, [searchParams]);

  const patientKey = useMemo(() => {
    const n = (patient?.name || "patient").toLowerCase().replace(/\s+/g, "-");
    return `medicare.workbench.draft.${n}.${patient?.age ?? "na"}`;
  }, [patient?.age, patient?.name]);

  // Notes
  const [motif, setMotif] = useState(mockConsultationInitialNotes.motif);
  const [symptoms, setSymptoms] = useState(mockConsultationInitialNotes.symptoms);
  const [examination, setExamination] = useState(mockConsultationInitialNotes.examination);
  const [diagnosis, setDiagnosis] = useState(mockConsultationInitialNotes.diagnosis);
  const [conclusion, setConclusion] = useState(mockConsultationInitialNotes.conclusion);

  // Antecedents
  const [antMed, setAntMed] = useState("");
  const [antSurg, setAntSurg] = useState("");
  const [antTrauma, setAntTrauma] = useState("");
  const [antFamily, setAntFamily] = useState("");

  // Vitals
  const [vitals, setVitals] = useState<VitalsState>(mockConsultationInitialVitals);
  const [vitalsOpen, setVitalsOpen] = useState(false);

  // Prescription
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>(mockConsultationInitialPrescription);
  const rxFavorites = mockRxFavorites;
  const addRxItem = () => setRxItems(p => [...p, { medication: "", dosage: "", duration: "", instructions: "" }]);
  const removeRxItem = (i: number) => setRxItems(p => p.filter((_, idx) => idx !== i));
  const updateRxItem = (i: number, f: keyof PrescriptionItem, v: string) =>
    setRxItems(p => p.map((item, idx) => idx === i ? { ...item, [f]: v } : item));
  const addFavToRx = (fav: RxFavorite) =>
    setRxItems(p => [...p, { medication: fav.label, dosage: fav.dosage, duration: fav.duration, instructions: fav.instructions }]);

  // Analyses
  const [analyses, setAnalyses] = useState<string[]>(mockConsultationInitialAnalyses);
  const [newAnalyse, setNewAnalyse] = useState("");
  const labSuggestions = useMemo(() => {
    const blob = `${motif} ${diagnosis}`.toLowerCase();
    let list = [...mockLabSuggestionsBase];
    if (blob.includes("diab") || blob.includes("hba1c")) list = Array.from(new Set([...list, ...mockLabSuggestionsDT2]));
    if (blob.includes("angine") || blob.includes("gorge")) list = Array.from(new Set([...list, ...mockLabSuggestionsAngine]));
    return list.filter(x => !analyses.includes(x));
  }, [analyses, diagnosis, motif]);
  const addAnalyse = (v?: string) => {
    const val = (v ?? newAnalyse).trim();
    if (!val) return;
    setAnalyses(p => p.includes(val) ? p : [...p, val]);
    setNewAnalyse("");
  };
  const removeAnalyse = (n: string) => setAnalyses(p => p.filter(x => x !== n));

  // UI
  const [dockTab, setDockTab] = useState<DockTab>("rx");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closed, setClosed] = useState(false);

  // Slide
  const [slideOpen, setSlideOpen] = useState(false);
  const [slideType, setSlideType] = useState<SlideType>("rx");
  const [slideStep, setSlideStep] = useState(0);
  const [slideFeedback, setSlideFeedback] = useState<string | null>(null);

  // Docs
  const [rxNote, setRxNote] = useState("À prendre selon prescription. Lire attentivement les consignes.");
  const [rxSignedAt, setRxSignedAt] = useState<Date | null>(null);
  const [rxSendToPatient, setRxSendToPatient] = useState(true);
  const [rxSendToPharmacy, setRxSendToPharmacy] = useState(false);
  const [labsNote, setLabsNote] = useState("Analyses à réaliser au laboratoire. Merci de respecter les consignes de jeûne si nécessaire.");
  const [labsSignedAt, setLabsSignedAt] = useState<Date | null>(null);
  const [labsSendToLab, setLabsSendToLab] = useState(true);
  const [labsSendToPatient, setLabsSendToPatient] = useState(true);
  const [reportText, setReportText] = useState("");
  const [reportTouched, setReportTouched] = useState(false);
  const [reportSignedAt, setReportSignedAt] = useState<Date | null>(null);
  const [reportSendToPatient, setReportSendToPatient] = useState(true);
  const [certReason, setCertReason] = useState("Certificat médical");
  const [certComment, setCertComment] = useState("Certifie avoir examiné le patient ce jour.");
  const [certSignedAt, setCertSignedAt] = useState<Date | null>(null);
  const [slStart, setSlStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [slEnd, setSlEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [slComment, setSlComment] = useState("Repos recommandé.");
  const [slSignedAt, setSlSignedAt] = useState<Date | null>(null);
  const [rdvDate, setRdvDate] = useState("");
  const [rdvTime, setRdvTime] = useState("");
  const [rdvLocation, setRdvLocation] = useState("Cabinet");
  const [rdvConfirmedAt, setRdvConfirmedAt] = useState<Date | null>(null);

  // Close
  const [nextRdv, setNextRdv] = useState("3 mois");
  const [consultAmount, setConsultAmount] = useState("35");

  // Palette
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const paletteInputRef = useRef<HTMLInputElement | null>(null);

  // Derived
  const initials = useMemo(() => {
    const parts = (patient?.name || "").trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || "?") + (parts.length > 1 ? parts[parts.length - 1]?.[0] : "")).toUpperCase();
  }, [patient?.name]);

  const bmi = useMemo(() => {
    const w = parseFloat(vitals.weight), h = parseFloat(vitals.height) / 100;
    if (!Number.isFinite(w) || !Number.isFinite(h) || h <= 0) return "—";
    return (w / (h * h)).toFixed(1);
  }, [vitals.height, vitals.weight]);

  const completion = useMemo<CompletionState>(() => {
    const vitalsOk = !!(vitals.systolic && vitals.diastolic && vitals.heartRate && vitals.temperature && vitals.oxygenSat && vitals.weight);
    const notesOk = !!(motif.trim() && symptoms.trim() && examination.trim() && diagnosis.trim());
    const rxOk = rxItems.some(p => (p.medication || "").trim().length > 0);
    const labsOk = true, docsOk = true;
    const doneCount = [vitalsOk, notesOk, rxOk, labsOk, docsOk].filter(Boolean).length;
    return { vitalsOk, notesOk, rxOk, labsOk, docsOk, doneCount, total: 5 };
  }, [diagnosis, examination, motif, rxItems, symptoms, vitals]);

  // Slide helpers
  const slideTitle = useMemo(() => {
    const map: Record<SlideType, string> = { rx: "Ordonnance", labs: "Analyses", report: "Compte-rendu", certificate: "Certificat", sickleave: "Arrêt de travail", rdv: "Planifier RDV" };
    return map[slideType] || "Document";
  }, [slideType]);
  const slideSteps = useMemo(() => slideType === "rdv" ? ["Planifier", "Confirmer"] : ["Composer", "Aperçu", "Signer"], [slideType]);
  const slideIsLastStep = slideStep >= slideSteps.length - 1;

  const flash = (msg: string) => { setSlideFeedback(msg); window.setTimeout(() => setSlideFeedback(null), 2200); };

  // Default report
  const defaultReportText = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    const antBlock = [antMed.trim() && `- Médicaux : ${antMed.trim()}`, antSurg.trim() && `- Chirurgicaux : ${antSurg.trim()}`, antTrauma.trim() && `- Traumatiques : ${antTrauma.trim()}`, antFamily.trim() && `- Familiaux : ${antFamily.trim()}`].filter(Boolean).join("\n");
    const vLine = `TA ${vitals.systolic}/${vitals.diastolic} · FC ${vitals.heartRate} · T° ${vitals.temperature} · SpO2 ${vitals.oxygenSat}% · Poids ${vitals.weight}kg · IMC ${bmi}`;
    return [`COMPTE-RENDU DE CONSULTATION — ${today}`, "", `Patient : ${patient.name} (${patient.age} ans, ${patient.gender})`, `Motif : ${motif}`, "", `Constantes : ${vLine}`, antBlock ? `\nAntécédents :\n${antBlock}\n` : "", `Anamnèse / Symptômes :`, symptoms, "", `Examen clinique :`, examination, "", `Diagnostic :`, diagnosis, "", `Plan / Conduite à tenir :`, conclusion].join("\n");
  }, [antFamily, antMed, antSurg, antTrauma, bmi, conclusion, diagnosis, examination, motif, patient, symptoms, vitals]);

  const openSlide = (type: SlideType, step = 0) => {
    setSlideType(type); setSlideStep(step); setSlideOpen(true); setSlideFeedback(null);
    if (type === "report" && !reportTouched) setReportText(defaultReportText);
  };
  const closeSlide = () => { setSlideOpen(false); setSlideFeedback(null); };

  const handleSlidePrimary = () => {
    if (!slideIsLastStep) { setSlideStep(s => s + 1); return; }
    const now = new Date();
    if (slideType === "rx") { setRxSignedAt(now); flash(rxSendToPatient || rxSendToPharmacy ? "Ordonnance signée et envoyée." : "Ordonnance signée."); closeSlide(); return; }
    if (slideType === "labs") { setLabsSignedAt(now); flash(labsSendToLab || labsSendToPatient ? "Analyses signées et envoyées." : "Analyses signées."); closeSlide(); return; }
    if (slideType === "report") { setReportSignedAt(now); flash(reportSendToPatient ? "Compte-rendu signé et envoyé." : "Compte-rendu signé."); closeSlide(); return; }
    if (slideType === "certificate") { setCertSignedAt(now); flash("Certificat signé."); closeSlide(); return; }
    if (slideType === "sickleave") { setSlSignedAt(now); flash("Arrêt de travail signé."); closeSlide(); return; }
    if (slideType === "rdv") { setRdvConfirmedAt(now); flash("RDV planifié."); closeSlide(); }
  };
  const handleSlideSecondary = () => { if (slideStep > 0) { setSlideStep(s => s - 1); return; } closeSlide(); };

  const nextAction = useMemo(() => {
    if (!completion.notesOk) return { label: "Compléter les notes", onClick: () => scrollToId("notes") };
    if (!completion.rxOk) return { label: "Finaliser l'ordonnance", onClick: () => openSlide("rx", 0) };
    return { label: "Clôturer", onClick: () => setShowCloseModal(true) };
  }, [completion.notesOk, completion.rxOk]);

  // Templates
  const templates = useMemo(() => mockConsultationTemplates.map(t => ({
    key: t.key, label: t.label,
    apply: () => {
      setMotif(t.motif); setSymptoms(t.symptoms); setExamination(t.examination);
      setDiagnosis(t.diagnosis); setConclusion(t.conclusion);
      if (t.extraAnalyses) setAnalyses(prev => Array.from(new Set([...prev, ...t.extraAnalyses!])));
      setDockTab(t.defaultDockTab as DockTab);
    },
  })), []);

  // Close
  const handleClose = () => {
    setClosed(true); setShowCloseModal(false);
    try { localStorage.removeItem(patientKey); } catch { /* no-op */ }
  };

  // Print HTML
  const rxPrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    const meds = rxItems.filter(p => p.medication.trim()).map(p => `<li><b>${escapeHtml(p.medication)}</b> — ${escapeHtml(p.dosage)} · ${escapeHtml(p.duration)}<br/><span class="muted">${escapeHtml(p.instructions)}</span></li>`).join("");
    return `<div class="box"><div class="row"><div><h1>Ordonnance</h1><div class="muted">Date : ${today}</div><div class="muted">Patient : ${escapeHtml(patient.name)} — ${patient.age} ans</div></div></div><hr/><ul>${meds || "<li><i>Aucun médicament</i></li>"}</ul><hr/><div class="muted"><b>Note :</b> ${escapeHtml(rxNote)}</div></div>`;
  }, [patient, rxItems, rxNote]);

  const labsPrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    const items = analyses.map(a => `<li><b>${escapeHtml(a)}</b></li>`).join("");
    return `<div class="box"><div class="row"><div><h1>Prescription d'analyses</h1><div class="muted">Date : ${today}</div><div class="muted">Patient : ${escapeHtml(patient.name)} — ${patient.age} ans</div></div></div><hr/><ul>${items || "<li><i>Aucune analyse</i></li>"}</ul><hr/><div class="muted"><b>Consignes :</b> ${escapeHtml(labsNote)}</div></div>`;
  }, [analyses, labsNote, patient]);

  const reportPrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    return `<div class="box"><div class="row"><div><h1>Compte-rendu</h1><div class="muted">Date : ${today}</div><div class="muted">Patient : ${escapeHtml(patient.name)} — ${patient.age} ans</div></div></div><hr/><div style="font-size:13px;line-height:1.45">${escapeHtml(reportText).replace(/\n/g, "<br/>")}</div></div>`;
  }, [patient, reportText]);

  const certPrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    return `<div class="box"><h1>${escapeHtml(certReason)}</h1><div class="muted">Date : ${today}</div><hr/><p><b>Patient :</b> ${escapeHtml(patient.name)} — ${patient.age} ans</p><p>${escapeHtml(certComment)}</p><hr/><div class="muted">Signature : ${certSignedAt ? "Signé" : "Non signé"}</div></div>`;
  }, [certComment, certReason, certSignedAt, patient]);

  const slPrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    return `<div class="box"><h1>Arrêt de travail</h1><div class="muted">Date : ${today}</div><hr/><p><b>Patient :</b> ${escapeHtml(patient.name)} — ${patient.age} ans</p><p><b>Du :</b> ${escapeHtml(slStart)} <b>au :</b> ${escapeHtml(slEnd)}</p><p>${escapeHtml(slComment)}</p><hr/><div class="muted">Signature : ${slSignedAt ? "Signé" : "Non signé"}</div></div>`;
  }, [patient, slComment, slEnd, slSignedAt, slStart]);

  // Command palette
  const paletteActions: CommandAction[] = useMemo(() => [
    { id: "jump-notes", label: "Aller aux notes", hint: "Centre", icon: <PenLine className="h-4 w-4" />, onRun: () => scrollToId("notes") },
    { id: "open-rx", label: "Ouvrir Ordonnance", hint: "Docs", icon: <Pill className="h-4 w-4" />, onRun: () => openSlide("rx", 0) },
    { id: "open-report", label: "Ouvrir Compte-rendu", hint: "Docs", icon: <FileText className="h-4 w-4" />, onRun: () => openSlide("report", 0) },
    { id: "open-cert", label: "Ouvrir Certificat", hint: "Docs", icon: <FileSignature className="h-4 w-4" />, onRun: () => openSlide("certificate", 0) },
    { id: "open-sick", label: "Ouvrir Arrêt de travail", hint: "Docs", icon: <Calendar className="h-4 w-4" />, onRun: () => openSlide("sickleave", 0) },
    { id: "open-rdv", label: "Planifier un RDV", hint: "Agenda", icon: <Clock className="h-4 w-4" />, onRun: () => openSlide("rdv", 0) },
    { id: "toggle-focus", label: leftCollapsed ? "Afficher panneau patient" : "Mode focus", hint: "UI", icon: <PanelsRightBottom className="h-4 w-4" />, onRun: () => setLeftCollapsed(v => !v) },
    { id: "open-history", label: "Ouvrir Historique", hint: "Drawer", icon: <History className="h-4 w-4" />, onRun: () => setHistoryOpen(true) },
  ], [leftCollapsed]);

  const filteredPalette = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    return (q ? paletteActions.filter(a => `${a.label} ${a.hint || ""}`.toLowerCase().includes(q)) : paletteActions).slice(0, 8);
  }, [paletteActions, paletteQuery]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(true); setPaletteQuery(""); setPaletteIndex(0); return; }
      if (!paletteOpen) return;
      if (e.key === "Escape") { e.preventDefault(); setPaletteOpen(false); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setPaletteIndex(i => Math.min(i + 1, filteredPalette.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setPaletteIndex(i => Math.max(0, i - 1)); return; }
      if (e.key === "Enter") { e.preventDefault(); const a = filteredPalette[paletteIndex]; if (a) { setPaletteOpen(false); a.onRun(); } }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filteredPalette, paletteIndex, paletteOpen]);

  useEffect(() => { if (paletteOpen) window.setTimeout(() => paletteInputRef.current?.focus(), 50); }, [paletteOpen]);

  // Autosave
  useEffect(() => {
    try {
      const raw = localStorage.getItem(patientKey);
      if (!raw) return;
      const d = JSON.parse(raw) as any;
      if (typeof d.motif === "string") setMotif(d.motif);
      if (typeof d.symptoms === "string") setSymptoms(d.symptoms);
      if (typeof d.examination === "string") setExamination(d.examination);
      if (typeof d.diagnosis === "string") setDiagnosis(d.diagnosis);
      if (typeof d.conclusion === "string") setConclusion(d.conclusion);
      if (typeof d.antMed === "string") setAntMed(d.antMed);
      if (typeof d.antSurg === "string") setAntSurg(d.antSurg);
      if (typeof d.antTrauma === "string") setAntTrauma(d.antTrauma);
      if (typeof d.antFamily === "string") setAntFamily(d.antFamily);
      if (d.vitals && typeof d.vitals === "object") setVitals(v => ({ ...v, ...d.vitals }));
      if (Array.isArray(d.rxItems)) setRxItems(d.rxItems);
      if (Array.isArray(d.analyses)) setAnalyses(d.analyses);
      if (typeof d.rxNote === "string") setRxNote(d.rxNote);
      if (typeof d.reportText === "string") setReportText(d.reportText);
      setLastSavedAt(new Date());
    } catch { /* no-op */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(patientKey, JSON.stringify({ motif, symptoms, examination, diagnosis, conclusion, antMed, antSurg, antTrauma, antFamily, vitals, rxItems, analyses, rxNote, reportText }));
        setLastSavedAt(new Date());
      } catch { /* no-op */ }
    }, 650);
    return () => window.clearTimeout(t);
  }, [analyses, antFamily, antMed, antSurg, antTrauma, conclusion, diagnosis, examination, motif, patientKey, rxItems, reportText, rxNote, symptoms, vitals]);

  const value: Ctx = {
    patient, navigate, motif, setMotif, symptoms, setSymptoms, examination, setExamination, diagnosis, setDiagnosis, conclusion, setConclusion,
    antMed, setAntMed, antSurg, setAntSurg, antTrauma, setAntTrauma, antFamily, setAntFamily,
    vitals, setVitals, vitalsOpen, setVitalsOpen,
    rxItems, addRxItem, removeRxItem, updateRxItem, addFavToRx, rxFavorites,
    analyses, setAnalyses, newAnalyse, setNewAnalyse, addAnalyse, removeAnalyse, labSuggestions,
    dockTab, setDockTab, leftCollapsed, setLeftCollapsed, historyOpen, setHistoryOpen, showCloseModal, setShowCloseModal, closed,
    slideOpen, slideType, slideStep, setSlideStep, slideFeedback, slideTitle, slideSteps, slideIsLastStep, openSlide, closeSlide, handleSlidePrimary, handleSlideSecondary,
    rxNote, setRxNote, rxSignedAt, rxSendToPatient, setRxSendToPatient, rxSendToPharmacy, setRxSendToPharmacy,
    labsNote, setLabsNote, labsSignedAt, labsSendToLab, setLabsSendToLab, labsSendToPatient, setLabsSendToPatient,
    reportText, setReportText, reportTouched, setReportTouched, reportSignedAt, reportSendToPatient, setReportSendToPatient,
    certReason, setCertReason, certComment, setCertComment, certSignedAt,
    slStart, setSlStart, slEnd, setSlEnd, slComment, setSlComment, slSignedAt,
    rdvDate, setRdvDate, rdvTime, setRdvTime, rdvLocation, setRdvLocation, rdvConfirmedAt,
    nextRdv, setNextRdv, consultAmount, setConsultAmount, handleClose,
    paletteOpen, setPaletteOpen, paletteQuery, setPaletteQuery, paletteIndex, setPaletteIndex, paletteInputRef, filteredPalette,
    initials, bmi, completion, nextAction, lastSavedAt, templates, pastConsults: mockPastConsults,
    rxPrintHtml, labsPrintHtml, reportPrintHtml, certPrintHtml, slPrintHtml,
    doPrint: openPrintWindow,
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}
