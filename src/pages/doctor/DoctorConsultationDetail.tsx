import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  FileSignature,
  FileText,
  Gauge,
  Heart,
  History,
  PenLine,
  Pill,
  Plus,
  Printer,
  Save,
  Scale,
  Search,
  Stethoscope,
  Thermometer,
  Trash2,
  X,
  Droplets,
  Sparkles,
  ClipboardList,
  PanelsRightBottom,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { mockConsultationPatient } from "@/data/mockData";

/**
 * DoctorConsultationDetail — Workbench (ultra centralisé)
 * Objectif UX : terminer une consultation SANS navigation, en 2–3 actions max.
 * - Centre : note de consultation (le cœur)
 * - Droite : Action Dock (Ordonnance / Analyses / Documents / Tâches)
 * - Gauche : Patient HUD + Antécédents + Constantes (rétractable)
 * - Slides (panneau latéral) : wizard pour générer/signer/imprimer (Ordonnance, Compte-rendu, Certificat, Arrêt, RDV)
 * - Bonus productivité : Command palette (Ctrl+K) + autosave (localStorage)
 */

type DockTab = "rx" | "labs" | "docs" | "tasks";
type SlideType = "rx" | "labs" | "report" | "certificate" | "sickleave" | "rdv";

type PrescriptionItem = {
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
};

type CommandAction = {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  onRun: () => void;
};

/**
 * Helper : échappement HTML simple (pour preview imprimable)
 */
function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Helper : scroll smooth vers une section (notes)
 */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const DoctorConsultationDetail = () => {
  const navigate = useNavigate();

  // -----------------------------
  // 1) Data patient (mock)
  // -----------------------------
  const patient = mockConsultationPatient;

  const patientKey = useMemo(() => {
    // Clé stable pour autosave (en mock : name + age)
    const name = (patient?.name || "patient").toString().toLowerCase().replace(/\s+/g, "-");
    const age = patient?.age ?? "na";
    return `medicare.workbench.draft.${name}.${age}`;
  }, [patient?.age, patient?.name]);

  // -----------------------------
  // 2) Workbench state (notes)
  // -----------------------------
  const [motif, setMotif] = useState("Suivi diabète de type 2");
  const [symptoms, setSymptoms] = useState(
    "Patient se plaint de fatigue accrue depuis 2 semaines. Pas de douleurs particulières. Sommeil perturbé.",
  );
  const [examination, setExamination] = useState(
    "Examen clinique normal. Abdomen souple, pas de masse palpable. Auscultation pulmonaire claire. Pas d'œdème des MI.",
  );
  const [diagnosis, setDiagnosis] = useState("Diabète de type 2 équilibré. Asthénie à surveiller.");
  const [conclusion, setConclusion] = useState(
    "Maintien du traitement actuel. Contrôle HbA1c dans 3 mois. Hygiène de vie : activité physique régulière recommandée.",
  );

  // -----------------------------
  // 3) Antécédents (édition libre, mais structurée)
  // Demande utilisateur : pas de tags/chips → 4 champs texte.
  // + Raccourci : champs plus courts (min-h faible + auto-grow plafonné)
  // -----------------------------
  const [antecedentsMedical, setAntecedentsMedical] = useState<string>("");
  const [antecedentsSurgical, setAntecedentsSurgical] = useState<string>("");
  const [antecedentsTrauma, setAntecedentsTrauma] = useState<string>("");
  const [antecedentsFamily, setAntecedentsFamily] = useState<string>("");

  // Auto-grow contrôlé (pour rester compact dans la colonne gauche)
  const autoGrowCompact = (el: HTMLTextAreaElement) => {
    try {
      // Reset puis recalcul → permet aussi de réduire si on efface
      el.style.height = "0px";
      const next = Math.min(el.scrollHeight, 120); // plafonné pour rester "court"
      el.style.height = `${next}px`;
    } catch {
      // no-op (sécurité)
    }
  };

  // -----------------------------
  // 4) Constantes / Vitals
  // -----------------------------
  const [vitals, setVitals] = useState({
    systolic: "130",
    diastolic: "80",
    heartRate: "72",
    temperature: "37.0",
    weight: "75",
    oxygenSat: "98",
    height: "175",
    respiratoryRate: "16",
  });

  // Constantes : affichage discret (édition à la demande)
  const [vitalsOpen, setVitalsOpen] = useState(false);

  // -----------------------------
  // 5) Ordonnance (liste + favoris)
  // -----------------------------
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      medication: "Metformine 850mg",
      dosage: "1 comprimé matin et soir",
      duration: "3 mois",
      instructions: "Pendant les repas",
    },
    {
      medication: "Glibenclamide 5mg",
      dosage: "1 comprimé le matin",
      duration: "3 mois",
      instructions: "Avant le petit déjeuner",
    },
  ]);

  const rxFavorites = useMemo(
    () => [
      { label: "Paracétamol 1g", dosage: "1 cp x3/j", duration: "3 jours", instructions: "Si douleur/fièvre" },
      { label: "Amoxicilline 1g", dosage: "1 cp x2/j", duration: "6 jours", instructions: "Selon indication" },
      { label: "IPP (Oméprazole 20mg)", dosage: "1 gélule/j", duration: "14 jours", instructions: "Le matin à jeun" },
    ],
    [],
  );

  const addPrescriptionItem = () =>
    setPrescriptionItems((prev) => [...prev, { medication: "", dosage: "", duration: "", instructions: "" }]);

  const removePrescriptionItem = (index: number) => setPrescriptionItems((prev) => prev.filter((_, i) => i !== index));

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    setPrescriptionItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addFavoriteToRx = (fav: (typeof rxFavorites)[number]) => {
    setPrescriptionItems((prev) => [
      ...prev,
      { medication: fav.label, dosage: fav.dosage, duration: fav.duration, instructions: fav.instructions },
    ]);
  };

  // -----------------------------
  // 6) Analyses (liste + suggestions)
  // -----------------------------
  const [analysePrescription, setAnalysePrescription] = useState<string[]>(["HbA1c", "Glycémie à jeun"]);
  const [newAnalyse, setNewAnalyse] = useState("");

  const labSuggestions = useMemo(() => {
    // Suggestion simple (règles légères) selon diagnostic/motif
    const blob = `${motif} ${diagnosis}`.toLowerCase();

    const base = ["NFS", "CRP", "Ionogramme", "Créatinine", "TSH", "Bilan lipidique"];
    const dt2 = ["HbA1c", "Glycémie à jeun", "Microalbuminurie", "Bilan lipidique", "Créatinine"];
    const angine = ["TDR streptocoque", "CRP", "NFS"];

    let list = base;
    if (blob.includes("diab") || blob.includes("hba1c")) list = Array.from(new Set([...base, ...dt2]));
    if (blob.includes("angine") || blob.includes("odynoph") || blob.includes("gorge"))
      list = Array.from(new Set([...base, ...angine]));

    // On retire celles déjà ajoutées
    return list.filter((x) => !analysePrescription.includes(x));
  }, [analysePrescription, diagnosis, motif]);

  const addAnalyse = (value?: string) => {
    const v = (value ?? newAnalyse).trim();
    if (!v) return;
    setAnalysePrescription((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setNewAnalyse("");
  };

  const removeAnalyse = (name: string) => setAnalysePrescription((prev) => prev.filter((x) => x !== name));

  // -----------------------------
  // 7) UI controls (dock / focus / drawers)
  // -----------------------------
  const [dockTab, setDockTab] = useState<DockTab>("rx");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closed, setClosed] = useState(false);

  // -----------------------------
  // 8) Slides (wizard) : docs + RDV
  // -----------------------------
  const [slideOpen, setSlideOpen] = useState(false);
  const [slideType, setSlideType] = useState<SlideType>("rx");
  const [slideStep, setSlideStep] = useState(0);
  const [slideFeedback, setSlideFeedback] = useState<string | null>(null);

  // Docs content (mock)
  const [rxNote, setRxNote] = useState("À prendre selon prescription. Lire attentivement les consignes.");
  const [rxSignedAt, setRxSignedAt] = useState<Date | null>(null);
  const [rxSendToPatient, setRxSendToPatient] = useState(true);
  const [rxSendToPharmacy, setRxSendToPharmacy] = useState(false);

  // Analyses (slide) : workflow proche de l’ordonnance (aperçu / impression / envoi)
  const [labsNote, setLabsNote] = useState(
    "Analyses à réaliser au laboratoire. Merci de respecter les consignes de jeûne si nécessaire.",
  );
  const [labsSignedAt, setLabsSignedAt] = useState<Date | null>(null);
  const [labsSendToLab, setLabsSendToLab] = useState(true);
  const [labsSendToPatient, setLabsSendToPatient] = useState(true);

  const [reportText, setReportText] = useState("");
  const [reportTouched, setReportTouched] = useState(false);
  const [reportSignedAt, setReportSignedAt] = useState<Date | null>(null);
  const [reportSendToPatient, setReportSendToPatient] = useState(true);

  const [certificateReason, setCertificateReason] = useState("Certificat médical");
  const [certificateComment, setCertificateComment] = useState("Certifie avoir examiné le patient ce jour.");
  const [certificateSignedAt, setCertificateSignedAt] = useState<Date | null>(null);

  const [sickLeaveStart, setSickLeaveStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [sickLeaveEnd, setSickLeaveEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [sickLeaveComment, setSickLeaveComment] = useState("Repos recommandé.");
  const [sickLeaveSignedAt, setSickLeaveSignedAt] = useState<Date | null>(null);

  // RDV (mock)
  const [rdvDate, setRdvDate] = useState("");
  const [rdvTime, setRdvTime] = useState("");
  const [rdvLocation, setRdvLocation] = useState("Cabinet");
  const [rdvConfirmedAt, setRdvConfirmedAt] = useState<Date | null>(null);

  // -----------------------------
  // 9) Extras : autosave + command palette
  // -----------------------------
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const paletteInputRef = useRef<HTMLInputElement | null>(null);

  // -----------------------------
  // Derived values
  // -----------------------------
  const initials = useMemo(() => {
    const safe = (patient?.name || "").trim();
    if (!safe) return "??";
    const parts = safe.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "?";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
  }, [patient?.name]);

  const bmi = useMemo(() => {
    if (!vitals.weight || !vitals.height) return "—";
    const w = parseFloat(vitals.weight);
    const h = parseFloat(vitals.height) / 100;
    if (!Number.isFinite(w) || !Number.isFinite(h) || h <= 0) return "—";
    return (w / Math.pow(h, 2)).toFixed(1);
  }, [vitals.height, vitals.weight]);

  // Drawer : past consults (mock)
  const pastConsults = useMemo(
    () => [
      {
        date: "15 Jan 2026",
        motif: "Suivi diabète",
        notes: "HbA1c à 7.1%. Bonne observance. Maintien traitement.",
        prescriptions: 1,
      },
      {
        date: "10 Oct 2025",
        motif: "Contrôle glycémie",
        notes: "Glycémie à jeun 1.15g/L. Ajustement posologie Metformine.",
        prescriptions: 1,
      },
      {
        date: "5 Juil 2025",
        motif: "Bilan annuel",
        notes: "Bilan complet. Fonction rénale normale. Fond d'œil RAS.",
        prescriptions: 2,
      },
    ],
    [],
  );

  // Completion logic (drive 2–3 actions)
  const completion = useMemo(() => {
    const vitalsOk =
      !!vitals.systolic &&
      !!vitals.diastolic &&
      !!vitals.heartRate &&
      !!vitals.temperature &&
      !!vitals.oxygenSat &&
      !!vitals.weight;

    const notesOk = !!motif.trim() && !!symptoms.trim() && !!examination.trim() && !!diagnosis.trim();

    const rxOk = prescriptionItems.some((p) => (p.medication || "").trim().length > 0);

    const docsOk = true; // optionnel
    const labsOk = true; // optionnel

    const doneCount = [vitalsOk, notesOk, rxOk, labsOk, docsOk].filter(Boolean).length;

    return { vitalsOk, notesOk, rxOk, labsOk, docsOk, doneCount, total: 5 };
  }, [diagnosis, examination, motif, prescriptionItems, symptoms, vitals]);

  const nextAction = useMemo(() => {
    if (!completion.notesOk) return { label: "Compléter les notes", onClick: () => scrollToId("notes") };
    if (!completion.rxOk) return { label: "Finaliser l’ordonnance", onClick: () => openSlide("rx", 0) };
    return { label: "Clôturer", onClick: () => setShowCloseModal(true) };
  }, [completion.notesOk, completion.rxOk]);

  // -----------------------------
  // Templates (1 clic = préremplissage)
  // -----------------------------
  const templates = useMemo(
    () => [
      {
        key: "dt2",
        label: "Suivi diabète T2",
        apply: () => {
          setMotif("Suivi diabète de type 2");
          setSymptoms(
            "Observance traitement : oui. Fatigue intermittente. Alimentation à rééquilibrer. Activité physique : irrégulière.",
          );
          setExamination(
            "TA correcte. Auscultation cardio-pulmonaire RAS. Pas d'œdème. Pied diabétique : pas de lésion.",
          );
          setDiagnosis("Diabète T2 — suivi. Objectifs glycémie à rappeler.");
          setConclusion("Renforcer hygiène de vie. Prescrire HbA1c + bilan lipidique. Contrôle dans 3 mois.");
          setAnalysePrescription((prev) => Array.from(new Set([...prev, "HbA1c", "Bilan lipidique", "Créatinine"])));
          setDockTab("rx");
        },
      },
      {
        key: "hta",
        label: "HTA — contrôle",
        apply: () => {
          setMotif("Contrôle hypertension");
          setSymptoms("Pas de céphalées. Pas de douleur thoracique. Bonne tolérance du traitement.");
          setExamination("TA à contrôler en automesure. Auscultation RAS. Pas d'œdème.");
          setDiagnosis("Hypertension artérielle — suivi.");
          setConclusion("Poursuite traitement. Bilan rénal/ionogramme si besoin. Contrôle dans 1–3 mois.");
          setDockTab("rx");
        },
      },
      {
        key: "angine",
        label: "Angine",
        apply: () => {
          setMotif("Odynophagie / suspicion angine");
          setSymptoms("Mal de gorge depuis 48h. Fièvre ? À préciser. Pas de dyspnée.");
          setExamination("Examen ORL : amygdales inflammatoires. Adénopathies cervicales ? À préciser.");
          setDiagnosis("Angine (à confirmer). Tests rapides si disponible.");
          setConclusion("Traitement symptomatique. ATB si critères / test positif. Surveillance 48–72h.");
          setDockTab("labs");
        },
      },
    ],
    [],
  );

  // -----------------------------
  // Slides helpers
  // -----------------------------
  const slideTitle = useMemo(() => {
    switch (slideType) {
      case "rx":
        return "Ordonnance";
      case "labs":
        return "Analyses";
      case "report":
        return "Compte-rendu";
      case "certificate":
        return "Certificat";
      case "sickleave":
        return "Arrêt de travail";
      case "rdv":
        return "Planifier RDV";
      default:
        return "Document";
    }
  }, [slideType]);

  const slideSteps = useMemo(
    () => (slideType === "rdv" ? ["Planifier", "Confirmer"] : ["Composer", "Aperçu", "Signer"]),
    [slideType],
  );

  const slideIsLastStep = slideStep >= slideSteps.length - 1;

  function flashFeedback(msg: string) {
    setSlideFeedback(msg);
    window.setTimeout(() => setSlideFeedback(null), 2200);
  }

  function openSlide(type: SlideType, step: number = 0) {
    setSlideType(type);
    setSlideStep(step);
    setSlideOpen(true);
    setSlideFeedback(null);

    // Préremplissage du compte-rendu (si pas encore touché)
    if (type === "report" && !reportTouched) {
      setReportText(defaultReportText);
    }
  }

  function closeSlide() {
    setSlideOpen(false);
    setSlideFeedback(null);
  }

  function handleSlidePrimary() {
    // Step suivant
    if (!slideIsLastStep) {
      setSlideStep((s) => Math.min(s + 1, slideSteps.length - 1));
      return;
    }

    // Dernière étape : "signature" mock
    const now = new Date();

    if (slideType === "rx") {
      setRxSignedAt(now);
      flashFeedback(rxSendToPatient || rxSendToPharmacy ? "Ordonnance signée et envoyée." : "Ordonnance signée.");
      closeSlide();
      return;
    }

    if (slideType === "labs") {
      setLabsSignedAt(now);
      const sent = labsSendToLab || labsSendToPatient;
      flashFeedback(sent ? "Analyses signées et envoyées." : "Analyses signées.");
      closeSlide();
      return;
    }

    if (slideType === "report") {
      setReportSignedAt(now);
      flashFeedback(reportSendToPatient ? "Compte-rendu signé et envoyé." : "Compte-rendu signé.");
      closeSlide();
      return;
    }

    if (slideType === "certificate") {
      setCertificateSignedAt(now);
      flashFeedback("Certificat signé.");
      closeSlide();
      return;
    }

    if (slideType === "sickleave") {
      setSickLeaveSignedAt(now);
      flashFeedback("Arrêt de travail signé.");
      closeSlide();
      return;
    }

    if (slideType === "rdv") {
      setRdvConfirmedAt(now);
      flashFeedback("RDV planifié.");
      closeSlide();
    }
  }

  function handleSlideSecondary() {
    // Back
    if (slideStep > 0) {
      setSlideStep((s) => Math.max(0, s - 1));
      return;
    }
    closeSlide();
  }

  /**
   * Impression mock : un HTML simple (pratique pour preview sans backend).
   */
  function openPrintWindow(title: string, bodyHtml: string) {
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) return;

    w.document.open();
    w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1,h2,h3 { margin: 0 0 10px 0; }
    .muted { color: #666; font-size: 12px; }
    .box { border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
    ul { padding-left: 18px; }
    li { margin: 6px 0; }
    .row { display: flex; justify-content: space-between; gap: 12px; }
    .badge { display:inline-block; padding: 2px 8px; border-radius: 999px; background: #f2f2f2; font-size: 12px; }
    hr { border: none; border-top: 1px solid #eee; margin: 14px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`);
    w.document.close();
    w.focus();

    window.setTimeout(() => {
      try {
        w.print();
      } catch {
        // no-op
      }
    }, 250);
  }

  // -----------------------------
  // Default report (prérempli) : inclut antécédents + constantes
  // -----------------------------
  const defaultReportText = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");

    const antecedentsBlock = [
      antecedentsMedical.trim() ? `- Médicaux : ${antecedentsMedical.trim()}` : "",
      antecedentsSurgical.trim() ? `- Chirurgicaux : ${antecedentsSurgical.trim()}` : "",
      antecedentsTrauma.trim() ? `- Traumatiques : ${antecedentsTrauma.trim()}` : "",
      antecedentsFamily.trim() ? `- Familiaux : ${antecedentsFamily.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const vitalsLine = `TA ${vitals.systolic}/${vitals.diastolic} · FC ${vitals.heartRate} · T° ${vitals.temperature} · SpO2 ${vitals.oxygenSat}% · Poids ${vitals.weight}kg · IMC ${bmi}`;

    return [
      `COMPTE-RENDU DE CONSULTATION — ${today}`,
      ``,
      `Patient : ${patient.name} (${patient.age} ans, ${patient.gender})`,
      `Motif : ${motif}`,
      ``,
      `Constantes : ${vitalsLine}`,
      antecedentsBlock ? `\nAntécédents :\n${antecedentsBlock}\n` : "",
      `Anamnèse / Symptômes :`,
      `${symptoms}`,
      ``,
      `Examen clinique :`,
      `${examination}`,
      ``,
      `Diagnostic :`,
      `${diagnosis}`,
      ``,
      `Plan / Conduite à tenir :`,
      `${conclusion}`,
    ].join("\n");
  }, [
    antecedentsFamily,
    antecedentsMedical,
    antecedentsSurgical,
    antecedentsTrauma,
    bmi,
    conclusion,
    diagnosis,
    examination,
    motif,
    patient.age,
    patient.gender,
    patient.name,
    symptoms,
    vitals.diastolic,
    vitals.heartRate,
    vitals.oxygenSat,
    vitals.systolic,
    vitals.temperature,
    vitals.weight,
  ]);

  // Print HTML (rx/report/cert/stop)
  const rxPrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    const meds = prescriptionItems
      .filter((p) => (p.medication || "").trim())
      .map(
        (p) =>
          `<li><b>${escapeHtml(p.medication)}</b> — ${escapeHtml(p.dosage)} · ${escapeHtml(p.duration)}<br/><span class="muted">${escapeHtml(
            p.instructions,
          )}</span></li>`,
      )
      .join("");

    return `
      <div class="box">
        <div class="row">
          <div>
            <h1>Ordonnance</h1>
            <div class="muted">Date : ${today}</div>
            <div class="muted">Patient : ${escapeHtml(patient.name)} — ${patient.age} ans</div>
          </div>
          <div class="muted" style="text-align:right">
            <div>Dr. (à configurer)</div>
            <div>Cabinet (à configurer)</div>
          </div>
        </div>
        <hr />
        <ul>${meds || "<li><i>Aucun médicament</i></li>"}</ul>
        <hr />
        <div class="muted"><b>Note :</b> ${escapeHtml(rxNote)}</div>
      </div>
    `;
  }, [patient.age, patient.name, prescriptionItems, rxNote]);

  const labsPrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    const items = analysePrescription.map((a) => `<li><b>${escapeHtml(a)}</b></li>`).join("");

    return `
      <div class="box">
        <div class="row">
          <div>
            <h1>Prescription d’analyses</h1>
            <div class="muted">Date : ${today}</div>
            <div class="muted">Patient : ${escapeHtml(patient.name)} — ${patient.age} ans</div>
          </div>
          <div class="muted" style="text-align:right">
            <div>Dr. (à configurer)</div>
            <div>Cabinet (à configurer)</div>
          </div>
        </div>
        <hr />
        <ul>${items || "<li><i>Aucune analyse</i></li>"}</ul>
        <hr />
        <div class="muted"><b>Consignes :</b> ${escapeHtml(labsNote)}</div>
      </div>
    `;
  }, [analysePrescription, labsNote, patient.age, patient.name]);

  const reportPrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");
    const safe = escapeHtml(reportText).replace(/\n/g, "<br/>");

    return `
      <div class="box">
        <div class="row">
          <div>
            <h1>Compte-rendu</h1>
            <div class="muted">Date : ${today}</div>
            <div class="muted">Patient : ${escapeHtml(patient.name)} — ${patient.age} ans</div>
          </div>
          <div class="muted" style="text-align:right">
            <div>Dr. (à configurer)</div>
            <div>Cabinet (à configurer)</div>
          </div>
        </div>
        <hr />
        <div style="font-size: 13px; line-height: 1.45">${safe}</div>
      </div>
    `;
  }, [patient.age, patient.name, reportText]);

  const certificatePrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");

    return `
      <div class="box">
        <h1>${escapeHtml(certificateReason)}</h1>
        <div class="muted">Date : ${today}</div>
        <hr />
        <p><b>Patient :</b> ${escapeHtml(patient.name)} — ${patient.age} ans</p>
        <p>${escapeHtml(certificateComment)}</p>
        <hr />
        <div class="muted">Signature : ${certificateSignedAt ? "Signé" : "Non signé"}</div>
      </div>
    `;
  }, [certificateComment, certificateReason, certificateSignedAt, patient.age, patient.name]);

  const sickLeavePrintHtml = useMemo(() => {
    const today = new Date().toLocaleDateString("fr-FR");

    return `
      <div class="box">
        <h1>Arrêt de travail</h1>
        <div class="muted">Date : ${today}</div>
        <hr />
        <p><b>Patient :</b> ${escapeHtml(patient.name)} — ${patient.age} ans</p>
        <p><b>Du :</b> ${escapeHtml(sickLeaveStart)} <b>au :</b> ${escapeHtml(sickLeaveEnd)}</p>
        <p>${escapeHtml(sickLeaveComment)}</p>
        <hr />
        <div class="muted">Signature : ${sickLeaveSignedAt ? "Signé" : "Non signé"}</div>
      </div>
    `;
  }, [patient.age, patient.name, sickLeaveComment, sickLeaveEnd, sickLeaveSignedAt, sickLeaveStart]);

  // -----------------------------
  // Autosave (localStorage)
  // -----------------------------
  useEffect(() => {
    // Load draft
    try {
      const raw = localStorage.getItem(patientKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as any;

      // Notes
      if (typeof draft.motif === "string") setMotif(draft.motif);
      if (typeof draft.symptoms === "string") setSymptoms(draft.symptoms);
      if (typeof draft.examination === "string") setExamination(draft.examination);
      if (typeof draft.diagnosis === "string") setDiagnosis(draft.diagnosis);
      if (typeof draft.conclusion === "string") setConclusion(draft.conclusion);

      // Antécédents
      if (typeof draft.antecedentsMedical === "string") setAntecedentsMedical(draft.antecedentsMedical);
      if (typeof draft.antecedentsSurgical === "string") setAntecedentsSurgical(draft.antecedentsSurgical);
      if (typeof draft.antecedentsTrauma === "string") setAntecedentsTrauma(draft.antecedentsTrauma);
      if (typeof draft.antecedentsFamily === "string") setAntecedentsFamily(draft.antecedentsFamily);

      // Vitals
      if (draft.vitals && typeof draft.vitals === "object") setVitals((v) => ({ ...v, ...draft.vitals }));

      // Rx/labs
      if (Array.isArray(draft.prescriptionItems)) setPrescriptionItems(draft.prescriptionItems);
      if (Array.isArray(draft.analysePrescription)) setAnalysePrescription(draft.analysePrescription);

      // Docs
      if (typeof draft.rxNote === "string") setRxNote(draft.rxNote);
      if (typeof draft.reportText === "string") setReportText(draft.reportText);

      setLastSavedAt(new Date());
    } catch {
      // no-op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Debounce save
    const t = window.setTimeout(() => {
      try {
        const draft = {
          motif,
          symptoms,
          examination,
          diagnosis,
          conclusion,
          antecedentsMedical,
          antecedentsSurgical,
          antecedentsTrauma,
          antecedentsFamily,
          vitals,
          prescriptionItems,
          analysePrescription,
          rxNote,
          reportText,
        };
        localStorage.setItem(patientKey, JSON.stringify(draft));
        setLastSavedAt(new Date());
      } catch {
        // no-op
      }
    }, 650);

    return () => window.clearTimeout(t);
  }, [
    analysePrescription,
    antecedentsFamily,
    antecedentsMedical,
    antecedentsSurgical,
    antecedentsTrauma,
    conclusion,
    diagnosis,
    examination,
    motif,
    patientKey,
    prescriptionItems,
    reportText,
    rxNote,
    symptoms,
    vitals,
  ]);

  // -----------------------------
  // Command palette (Ctrl+K)
  // -----------------------------
  const paletteActions: CommandAction[] = useMemo(
    () => [
      {
        id: "jump-notes",
        label: "Aller aux notes",
        hint: "Centre",
        icon: <PenLine className="h-4 w-4" />,
        onRun: () => scrollToId("notes"),
      },
      {
        id: "open-rx",
        label: "Ouvrir Ordonnance (slide)",
        hint: "Docs",
        icon: <Pill className="h-4 w-4" />,
        onRun: () => openSlide("rx", 0),
      },
      {
        id: "open-report",
        label: "Ouvrir Compte-rendu (slide)",
        hint: "Docs",
        icon: <FileText className="h-4 w-4" />,
        onRun: () => openSlide("report", 0),
      },
      {
        id: "open-cert",
        label: "Ouvrir Certificat (slide)",
        hint: "Docs",
        icon: <FileSignature className="h-4 w-4" />,
        onRun: () => openSlide("certificate", 0),
      },
      {
        id: "open-sick",
        label: "Ouvrir Arrêt de travail (slide)",
        hint: "Docs",
        icon: <Calendar className="h-4 w-4" />,
        onRun: () => openSlide("sickleave", 0),
      },
      {
        id: "open-rdv",
        label: "Planifier un RDV (slide)",
        hint: "Agenda",
        icon: <Clock className="h-4 w-4" />,
        onRun: () => openSlide("rdv", 0),
      },
      {
        id: "toggle-focus",
        label: leftCollapsed ? "Afficher panneau patient" : "Mode focus (réduire panneau patient)",
        hint: "UI",
        icon: <PanelsRightBottom className="h-4 w-4" />,
        onRun: () => setLeftCollapsed((v) => !v),
      },
      {
        id: "open-history",
        label: "Ouvrir Historique",
        hint: "Drawer",
        icon: <History className="h-4 w-4" />,
        onRun: () => setHistoryOpen(true),
      },
    ],
    [leftCollapsed, reportTouched],
  );

  const filteredPalette = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    const list = q
      ? paletteActions.filter((a) => `${a.label} ${a.hint || ""}`.toLowerCase().includes(q))
      : paletteActions;
    return list.slice(0, 8);
  }, [paletteActions, paletteQuery]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K = palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        setPaletteQuery("");
        setPaletteIndex(0);
        return;
      }

      if (!paletteOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setPaletteOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setPaletteIndex((i) => Math.min(i + 1, filteredPalette.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setPaletteIndex((i) => Math.max(0, i - 1));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const a = filteredPalette[paletteIndex];
        if (!a) return;
        setPaletteOpen(false);
        a.onRun();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredPalette, paletteIndex, paletteOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    window.setTimeout(() => paletteInputRef.current?.focus(), 50);
  }, [paletteOpen]);

  // -----------------------------
  // Close flow
  // -----------------------------
  const [nextRdv, setNextRdv] = useState("3 mois");
  const [consultAmount, setConsultAmount] = useState("35");

  const handleClose = () => {
    setClosed(true);
    setShowCloseModal(false);

    // On peut aussi nettoyer le draft (optionnel)
    try {
      localStorage.removeItem(patientKey);
    } catch {
      // no-op
    }
  };

  // -----------------------------
  // "Consultation terminée" view
  // -----------------------------
  if (closed) {
    return (
      <DashboardLayout role="doctor" title="Consultation terminée">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-xl border bg-card p-8 shadow-card text-center">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Consultation clôturée</h2>
            <p className="text-muted-foreground mt-2">
              La consultation avec {patient.name} a été clôturée avec succès.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Récapitulatif</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="font-medium text-foreground">{patient.name}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Diagnostic</p>
                <p className="font-medium text-foreground text-sm">{diagnosis}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Ordonnance</p>
                <p className="font-medium text-foreground">
                  {prescriptionItems.filter((p) => p.medication).length} médicament(s)
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">Analyses prescrites</p>
                <p className="font-medium text-foreground">{analysePrescription.length} analyse(s)</p>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs text-primary font-medium">Prochain RDV</p>
                <p className="font-medium text-foreground">{nextRdv}</p>
              </div>
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                <p className="text-xs text-accent font-medium">Montant</p>
                <p className="font-bold text-foreground">{consultAmount} DT</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => navigate("/dashboard/doctor/consultations")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button variant="outline" onClick={() => openPrintWindow("Ordonnance", rxPrintHtml)}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimer ordonnance
            </Button>
            <Button
              className="gradient-primary text-primary-foreground shadow-primary-glow"
              onClick={() => navigate("/dashboard/doctor/consultation/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle consultation
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // -----------------------------
  // Main workbench view
  // -----------------------------
  return (
    <DashboardLayout role="doctor" title="Consultation en cours">
      <div className="space-y-4">
        {/* ===================== Close modal ===================== */}
        {showCloseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="rounded-2xl border bg-card shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-foreground mb-1">Clôturer la consultation</h3>
              <p className="text-sm text-muted-foreground mb-5">Vérifiez les informations avant de clôturer.</p>

              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Diagnostic</p>
                  <p className="text-sm font-medium text-foreground">{diagnosis}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-2">Ordonnance</p>
                  <div className="space-y-1">
                    {prescriptionItems
                      .filter((p) => p.medication)
                      .slice(0, 6)
                      .map((p, i) => (
                        <p key={i} className="text-sm text-foreground flex items-center gap-1.5">
                          <Pill className="h-3 w-3 text-primary" />
                          {p.medication} — {p.dosage}
                        </p>
                      ))}
                    {prescriptionItems.filter((p) => p.medication).length > 6 && (
                      <p className="text-xs text-muted-foreground">+ autres médicaments…</p>
                    )}
                  </div>
                </div>

                {analysePrescription.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground mb-2">Analyses prescrites</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysePrescription.slice(0, 10).map((a) => (
                        <span key={a} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Prochain RDV</Label>
                    <select
                      value={nextRdv}
                      onChange={(e) => setNextRdv(e.target.value)}
                      className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm"
                    >
                      <option>1 semaine</option>
                      <option>2 semaines</option>
                      <option>1 mois</option>
                      <option>3 mois</option>
                      <option>6 mois</option>
                      <option>Non nécessaire</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Montant (DT)</Label>
                    <Input
                      value={consultAmount}
                      onChange={(e) => setConsultAmount(e.target.value)}
                      className="mt-1 h-9"
                      type="number"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Astuce : si tu veux aller vite, signe l’ordonnance (slide) puis clôture.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowCloseModal(false)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow"
                  onClick={handleClose}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== History drawer ===================== */}
        {historyOpen && (
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={() => setHistoryOpen(false)}>
            <div
              className="absolute right-0 top-0 h-full w-full max-w-xl bg-card border-l shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Historique</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setHistoryOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-3 overflow-auto flex-1 min-h-0">
                {pastConsults.map((c, idx) => (
                  <div key={idx} className="rounded-xl border bg-card p-4 shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{c.date}</p>
                        <p className="font-semibold text-foreground">{c.motif}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {c.prescriptions} Rx
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{c.notes}</p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          // Quick: copier les notes dans l'anamnèse (gain de temps)
                          setSymptoms((s) =>
                            s ? `${s}\n\n[Historique ${c.date}] ${c.notes}` : `[Historique ${c.date}] ${c.notes}`,
                          );
                          setHistoryOpen(false);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Insérer dans notes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== Command palette ===================== */}
        {paletteOpen && (
          <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={() => setPaletteOpen(false)}>
            <div
              className="max-w-lg w-[92%] mx-auto mt-24 rounded-2xl border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  ref={paletteInputRef}
                  value={paletteQuery}
                  onChange={(e) => {
                    setPaletteQuery(e.target.value);
                    setPaletteIndex(0);
                  }}
                  placeholder="Rechercher une action… (ex: ordonnance, historique, rdv)"
                  className="h-9"
                />
                <span className="text-[11px] text-muted-foreground px-2 py-1 rounded-full bg-muted">Ctrl+K</span>
              </div>

              <div className="p-2">
                {filteredPalette.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">Aucune action.</div>
                ) : (
                  <div className="space-y-1">
                    {filteredPalette.map((a, i) => (
                      <button
                        key={a.id}
                        className={
                          i === paletteIndex
                            ? "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-muted"
                            : "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-muted/60"
                        }
                        onMouseEnter={() => setPaletteIndex(i)}
                        onClick={() => {
                          setPaletteOpen(false);
                          a.onRun();
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{a.icon}</span>
                          <span className="text-sm font-medium text-foreground">{a.label}</span>
                        </div>
                        {a.hint && <span className="text-xs text-muted-foreground">{a.hint}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>↑ ↓ pour naviguer · Entrée pour lancer · Esc pour fermer</span>
                <Button variant="ghost" size="sm" className="h-8" onClick={() => setPaletteOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== Top bar ===================== */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <Link to="/dashboard/doctor/consultations">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground">{patient.name}</h2>
                  <span className="text-xs text-muted-foreground">
                    {patient.age} ans · {patient.gender}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">En cours</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> 12:45
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Save className="h-3.5 w-3.5" />
                    {lastSavedAt ? `Sauvegardé à ${lastSavedAt.toLocaleTimeString().slice(0, 5)}` : "Non sauvegardé"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5" /> {completion.doneCount}/{completion.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setPaletteOpen(true);
                  setPaletteQuery("");
                  setPaletteIndex(0);
                }}
              >
                <Search className="h-3.5 w-3.5 mr-1" />
                Actions
              </Button>

              <Button variant="outline" size="sm" className="text-xs" onClick={() => setLeftCollapsed((v) => !v)}>
                <Stethoscope className="h-3.5 w-3.5 mr-1" />
                {leftCollapsed ? "Afficher patient" : "Mode focus"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => openPrintWindow("Ordonnance", rxPrintHtml)}
              >
                <Printer className="h-3.5 w-3.5 mr-1" />
                Imprimer
              </Button>

              <Button
                size="sm"
                className="text-xs gradient-primary text-primary-foreground shadow-primary-glow"
                onClick={nextAction.onClick}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {nextAction.label}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.round((completion.doneCount / completion.total) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ===================== Workbench grid ===================== */}
        <div
          className={
            leftCollapsed
              ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]"
              : "grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)_360px]"
          }
        >
          {/* ===================== Left (Patient HUD) ===================== */}
          {!leftCollapsed && (
            <aside className="space-y-4 lg:sticky lg:top-[160px] lg:self-start">
              {/* Patient card */}
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="font-semibold text-foreground truncate">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.age} ans · {patient.gender}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/30 border p-2">
                    <p className="text-[10px] text-muted-foreground">IMC</p>
                    <p className="text-sm font-bold text-foreground">{bmi}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border p-2">
                    <p className="text-[10px] text-muted-foreground">TA</p>
                    <p className="text-sm font-bold text-foreground">
                      {vitals.systolic}/{vitals.diastolic}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => setHistoryOpen(true)}>
                    <History className="h-3.5 w-3.5 mr-1" />
                    Historique
                  </Button>
                  <Link to="/dashboard/doctor/patients/1" className="flex-1">
                    <Button variant="outline" size="sm" className="text-xs w-full">
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Dossier
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Antécédents (compact, champs courts) */}
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Antécédents
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Saisie libre</span>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Médicaux</Label>
                    <textarea
                      value={antecedentsMedical}
                      onChange={(e) => setAntecedentsMedical(e.target.value)}
                      onInput={(e) => autoGrowCompact(e.currentTarget)}
                      rows={2}
                      placeholder="Ex: diabète T2, HTA, asthme…"
                      className="mt-1 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm min-h-[56px] max-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">Chirurgicaux</Label>
                    <textarea
                      value={antecedentsSurgical}
                      onChange={(e) => setAntecedentsSurgical(e.target.value)}
                      onInput={(e) => autoGrowCompact(e.currentTarget)}
                      rows={2}
                      placeholder="Ex: appendicectomie 2015…"
                      className="mt-1 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm min-h-[56px] max-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">Traumatiques</Label>
                    <textarea
                      value={antecedentsTrauma}
                      onChange={(e) => setAntecedentsTrauma(e.target.value)}
                      onInput={(e) => autoGrowCompact(e.currentTarget)}
                      rows={2}
                      placeholder="Ex: fracture poignet 2022…"
                      className="mt-1 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm min-h-[56px] max-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">Familiaux</Label>
                    <textarea
                      value={antecedentsFamily}
                      onChange={(e) => setAntecedentsFamily(e.target.value)}
                      onInput={(e) => autoGrowCompact(e.currentTarget)}
                      rows={2}
                      placeholder="Ex: diabète, cardiopathie…"
                      className="mt-1 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm min-h-[56px] max-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              {/* Constantes */}
              <div className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Constantes
                  </h3>
                  <span
                    className={
                      completion.vitalsOk
                        ? "text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full"
                        : "text-[11px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full"
                    }
                  >
                    {completion.vitalsOk ? "OK" : "À compléter"}
                  </span>
                </div>

                {/* Résumé discret + édition à la demande */}
                <div className="mt-3 flex items-start justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground leading-4">
                    TA {vitals.systolic}/{vitals.diastolic} · FC {vitals.heartRate} · T° {vitals.temperature} · SpO2{" "}
                    {vitals.oxygenSat}% · Poids {vitals.weight}kg
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setVitalsOpen((v) => !v)}
                  >
                    {vitalsOpen ? "Réduire" : "Modifier"}
                  </Button>
                </div>

                {vitalsOpen && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border bg-muted/30 p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Gauge className="h-3 w-3 text-destructive" />
                        <Label className="text-[10px] text-muted-foreground">Tension</Label>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          value={vitals.systolic}
                          onChange={(e) => setVitals((v) => ({ ...v, systolic: e.target.value }))}
                          className="text-center h-8 text-xs font-semibold"
                        />
                        <span className="text-muted-foreground font-bold">/</span>
                        <Input
                          value={vitals.diastolic}
                          onChange={(e) => setVitals((v) => ({ ...v, diastolic: e.target.value }))}
                          className="text-center h-8 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Heart className="h-3 w-3 text-destructive" />
                        <Label className="text-[10px] text-muted-foreground">FC</Label>
                      </div>
                      <Input
                        value={vitals.heartRate}
                        onChange={(e) => setVitals((v) => ({ ...v, heartRate: e.target.value }))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Thermometer className="h-3 w-3 text-warning" />
                        <Label className="text-[10px] text-muted-foreground">Temp</Label>
                      </div>
                      <Input
                        value={vitals.temperature}
                        onChange={(e) => setVitals((v) => ({ ...v, temperature: e.target.value }))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Droplets className="h-3 w-3 text-primary" />
                        <Label className="text-[10px] text-muted-foreground">SpO2</Label>
                      </div>
                      <Input
                        value={vitals.oxygenSat}
                        onChange={(e) => setVitals((v) => ({ ...v, oxygenSat: e.target.value }))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-2 col-span-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Scale className="h-3 w-3 text-accent" />
                        <Label className="text-[10px] text-muted-foreground">Poids (kg)</Label>
                      </div>
                      <Input
                        value={vitals.weight}
                        onChange={(e) => setVitals((v) => ({ ...v, weight: e.target.value }))}
                        className="h-8 text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* ===================== Center (Notes) ===================== */}
          <main className="space-y-4 min-w-0">
            {/* Templates */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground">Raccourcis</p>
                  <h2 className="font-semibold text-foreground">Templates de consultation</h2>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setHistoryOpen(true)}>
                  <History className="h-3.5 w-3.5 mr-1" />
                  Voir historique
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.key}
                    className="px-3 py-2 rounded-xl border bg-background hover:bg-muted/40 text-sm font-medium"
                    onClick={t.apply}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-muted/30 border text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Astuce : clique un template → puis ouvre le slide Ordonnance/CR pour signer rapidement.
              </div>
            </div>

            {/* Notes */}
            <section id="notes" className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Le cœur de la consultation</p>
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-primary" />
                    Notes
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => openSlide("report", 0)}>
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Générer CR
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => openSlide("rx", 0)}>
                    <Pill className="h-3.5 w-3.5 mr-1" />
                    Ordonnance
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <Label className="text-xs">Motif</Label>
                  <Input value={motif} onChange={(e) => setMotif(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label className="text-xs">Anamnèse / Symptômes</Label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={5}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Examen clinique</Label>
                  <textarea
                    value={examination}
                    onChange={(e) => setExamination(e.target.value)}
                    rows={5}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label className="text-xs">Diagnostic</Label>
                    <textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Plan / Conduite à tenir</Label>
                    <textarea
                      value={conclusion}
                      onChange={(e) => setConclusion(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* ===================== Right (Action Dock) ===================== */}
          <aside className="space-y-4 lg:sticky lg:top-[160px] lg:self-start">
            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Action Dock
                </h3>
                <span className="text-[11px] text-muted-foreground">Tout sans navigation</span>
              </div>

              {/* Tabs (mobile-friendly) */}
              <div className="p-2 border-b bg-muted/20">
                <div className="grid grid-cols-4 gap-1">
                  <Button
                    variant={dockTab === "rx" ? "default" : "outline"}
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => setDockTab("rx")}
                  >
                    <Pill className="h-3.5 w-3.5 mr-1" />
                    Rx
                  </Button>
                  <Button
                    variant={dockTab === "labs" ? "default" : "outline"}
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => setDockTab("labs")}
                  >
                    <Activity className="h-3.5 w-3.5 mr-1" />
                    Analyses
                  </Button>
                  <Button
                    variant={dockTab === "docs" ? "default" : "outline"}
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => setDockTab("docs")}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Docs
                  </Button>
                  <Button
                    variant={dockTab === "tasks" ? "default" : "outline"}
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => setDockTab("tasks")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Tâches
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                {/* Rx tab */}
                {dockTab === "rx" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Ordonnance</p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openSlide("rx", 0)}>
                          <FileSignature className="h-3.5 w-3.5 mr-1" />
                          Finaliser
                        </Button>
                      </div>
                    </div>

                    {/* Favorites */}
                    <div className="rounded-xl border bg-muted/20 p-2">
                      <p className="text-[11px] text-muted-foreground mb-2">Favoris (1 clic)</p>
                      <div className="flex flex-wrap gap-2">
                        {rxFavorites.map((f) => (
                          <button
                            key={f.label}
                            onClick={() => addFavoriteToRx(f)}
                            className="px-2 py-1 rounded-lg border bg-background hover:bg-muted/60 text-xs"
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {prescriptionItems.map((item, idx) => (
                        <div key={idx} className="rounded-xl border bg-card p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground">#{idx + 1}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removePrescriptionItem(idx)}
                              aria-label="Supprimer"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <div className="mt-2 space-y-2">
                            <div>
                              <Label className="text-[11px] text-muted-foreground">Médicament</Label>
                              <Input
                                value={item.medication}
                                onChange={(e) => updatePrescriptionItem(idx, "medication", e.target.value)}
                                className="mt-1 h-9"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-[11px] text-muted-foreground">Posologie</Label>
                                <Input
                                  value={item.dosage}
                                  onChange={(e) => updatePrescriptionItem(idx, "dosage", e.target.value)}
                                  className="mt-1 h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-[11px] text-muted-foreground">Durée</Label>
                                <Input
                                  value={item.duration}
                                  onChange={(e) => updatePrescriptionItem(idx, "duration", e.target.value)}
                                  className="mt-1 h-9"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-[11px] text-muted-foreground">Consignes</Label>
                              <Input
                                value={item.instructions}
                                onChange={(e) => updatePrescriptionItem(idx, "instructions", e.target.value)}
                                className="mt-1 h-9"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={addPrescriptionItem}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Ajouter un médicament
                    </Button>

                    {rxSignedAt && (
                      <div className="rounded-xl border bg-accent/5 border-accent/20 p-3 text-xs text-muted-foreground">
                        <span className="font-semibold text-accent">Signée</span> à{" "}
                        {rxSignedAt.toLocaleTimeString().slice(0, 5)}
                      </div>
                    )}
                  </div>
                )}

                {/* Labs tab */}
                {dockTab === "labs" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">Analyses</p>
                        {labsSignedAt && (
                          <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                            Envoyées
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => openSlide("labs", 1)}
                        >
                          <FileSignature className="h-3.5 w-3.5 mr-1" />
                          Envoyer
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openPrintWindow("Prescription d’analyses", labsPrintHtml)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={newAnalyse}
                        onChange={(e) => setNewAnalyse(e.target.value)}
                        placeholder="Ajouter une analyse…"
                        className="h-9"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAnalyse();
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" className="h-9" onClick={() => addAnalyse()}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {labSuggestions.length > 0 && (
                      <div className="rounded-xl border bg-muted/20 p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Suggestions (1 clic)</p>
                        <div className="flex flex-wrap gap-2">
                          {labSuggestions.slice(0, 10).map((s) => (
                            <button
                              key={s}
                              onClick={() => addAnalyse(s)}
                              className="px-2 py-1 rounded-lg border bg-background hover:bg-muted/60 text-xs"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {analysePrescription.map((a) => (
                        <div key={a} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                          <span className="text-sm text-foreground">{a}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeAnalyse(a)}>
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      Tu peux garder Analyses optionnel : l’objectif est d’aller vite.
                    </div>
                  </div>
                )}

                {/* Docs tab */}
                {dockTab === "docs" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Documents</p>

                    <div className="grid gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => openSlide("report", 0)}
                      >
                        <FileText className="h-3.5 w-3.5 mr-2 text-primary" />
                        Compte-rendu
                        {reportSignedAt && <span className="ml-auto text-[11px] text-accent">Signé</span>}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => openSlide("certificate", 0)}
                      >
                        <FileSignature className="h-3.5 w-3.5 mr-2 text-warning" />
                        Certificat
                        {certificateSignedAt && <span className="ml-auto text-[11px] text-accent">Signé</span>}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => openSlide("sickleave", 0)}
                      >
                        <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
                        Arrêt de travail
                        {sickLeaveSignedAt && <span className="ml-auto text-[11px] text-accent">Signé</span>}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => openSlide("rdv", 0)}
                      >
                        <Clock className="h-3.5 w-3.5 mr-2 text-primary" />
                        Planifier RDV
                        {rdvConfirmedAt && <span className="ml-auto text-[11px] text-accent">OK</span>}
                      </Button>
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
                      <Printer className="h-4 w-4 text-primary" />
                      Les previews sont imprimables (mock) : utile pour tester le flow.
                    </div>
                  </div>
                )}

                {/* Tasks tab */}
                {dockTab === "tasks" && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Checklist (auto)</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
                        <span className="text-sm text-foreground">Constantes</span>
                        {completion.vitalsOk ? (
                          <span className="text-xs text-accent font-semibold">OK</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setLeftCollapsed(false)}
                          >
                            Remplir
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
                        <span className="text-sm text-foreground">Notes</span>
                        {completion.notesOk ? (
                          <span className="text-xs text-accent font-semibold">OK</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => scrollToId("notes")}
                          >
                            Compléter
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
                        <span className="text-sm text-foreground">Ordonnance</span>
                        {completion.rxOk ? (
                          <span className="text-xs text-accent font-semibold">OK</span>
                        ) : (
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDockTab("rx")}>
                            Ajouter
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
                        <span className="text-sm text-foreground">Signer / Envoyer</span>
                        {rxSignedAt || reportSignedAt ? (
                          <span className="text-xs text-accent font-semibold">OK</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => openSlide("rx", 0)}
                          >
                            Ouvrir
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Objectif : 2–3 actions → notes + Rx + clôture.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mini shortcuts */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <p className="text-xs text-muted-foreground mb-2">Actions rapides</p>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start"
                  onClick={() => openSlide("rdv", 0)}
                >
                  <Calendar className="h-3.5 w-3.5 mr-2 text-primary" />
                  Planifier prochain RDV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start"
                  onClick={() => openSlide("certificate", 0)}
                >
                  <FileSignature className="h-3.5 w-3.5 mr-2 text-warning" />
                  Certificat médical
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start"
                  onClick={() => setPaletteOpen(true)}
                >
                  <Bot className="h-3.5 w-3.5 mr-2 text-primary" />
                  Palette (Ctrl+K)
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* ===================== Slide panel (wizard) ===================== */}
        {slideOpen && (
          <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" onClick={closeSlide}>
            <div
              className="absolute right-0 top-0 h-full w-full max-w-2xl bg-card border-l shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{slideTitle}</p>
                  <h3 className="text-lg font-bold text-foreground">{slideSteps[slideStep]}</h3>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {slideSteps.map((s, i) => (
                      <span
                        key={s}
                        className={
                          i === slideStep
                            ? "text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                            : "text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                        }
                      >
                        {i + 1}. {s}
                      </span>
                    ))}
                    {slideFeedback && <span className="text-[11px] font-semibold text-accent">{slideFeedback}</span>}
                  </div>
                </div>

                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={closeSlide}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-auto flex-1 min-h-0">
                {/* ORD: Composer */}
                {slideType === "rx" && slideStep === 0 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      Ajuste l’ordonnance, puis passe à l’aperçu.
                    </div>

                    <div>
                      <Label className="text-xs">Note ordonnance</Label>
                      <textarea
                        value={rxNote}
                        onChange={(e) => setRxNote(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      {prescriptionItems.map((item, idx) => (
                        <div key={idx} className="rounded-xl border bg-card p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">
                              {item.medication || `Médicament #${idx + 1}`}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removePrescriptionItem(idx)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <div className="mt-2 grid gap-2">
                            <Input
                              value={item.medication}
                              onChange={(e) => updatePrescriptionItem(idx, "medication", e.target.value)}
                              placeholder="Médicament"
                              className="h-9"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={item.dosage}
                                onChange={(e) => updatePrescriptionItem(idx, "dosage", e.target.value)}
                                placeholder="Posologie"
                                className="h-9"
                              />
                              <Input
                                value={item.duration}
                                onChange={(e) => updatePrescriptionItem(idx, "duration", e.target.value)}
                                placeholder="Durée"
                                className="h-9"
                              />
                            </div>
                            <Input
                              value={item.instructions}
                              onChange={(e) => updatePrescriptionItem(idx, "instructions", e.target.value)}
                              placeholder="Consignes"
                              className="h-9"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={addPrescriptionItem}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Ajouter un médicament
                    </Button>
                  </div>
                )}

                {/* ORD: Aperçu */}
                {slideType === "rx" && slideStep === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                      <div className="text-sm text-foreground space-y-2">
                        {prescriptionItems
                          .filter((p) => p.medication.trim())
                          .map((p, i) => (
                            <div key={i} className="rounded-lg border bg-muted/20 p-3">
                              <p className="font-semibold">{p.medication}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.dosage} · {p.duration}
                              </p>
                              {p.instructions && <p className="text-xs text-muted-foreground">{p.instructions}</p>}
                            </div>
                          ))}
                        <div className="text-xs text-muted-foreground">
                          <b>Note :</b> {rxNote}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openPrintWindow("Ordonnance", rxPrintHtml)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setSlideStep(2)}>
                        <FileSignature className="h-4 w-4 mr-2" />
                        Signer
                      </Button>
                    </div>
                  </div>
                )}

                {/* ORD: Signer */}
                {slideType === "rx" && slideStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-primary" />
                      Choisis les destinataires, puis signe.
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={rxSendToPatient}
                          onChange={(e) => setRxSendToPatient(e.target.checked)}
                        />
                        Envoyer au patient
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={rxSendToPharmacy}
                          onChange={(e) => setRxSendToPharmacy(e.target.checked)}
                        />
                        Envoyer à la pharmacie
                      </label>
                    </div>

                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Résumé</p>
                      <p className="text-sm text-foreground font-semibold mt-1">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {prescriptionItems.filter((p) => p.medication.trim()).length} médicament(s)
                      </p>
                    </div>
                  </div>
                )}

                {/* LABS: Composer */}
                {slideType === "labs" && slideStep === 0 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Compose la prescription d’analyses, puis passe à l’aperçu.
                    </div>

                    <div>
                      <Label className="text-xs">Consignes laboratoire</Label>
                      <textarea
                        value={labsNote}
                        onChange={(e) => setLabsNote(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={newAnalyse}
                        onChange={(e) => setNewAnalyse(e.target.value)}
                        placeholder="Ajouter une analyse…"
                        className="h-9"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAnalyse();
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" className="h-9" onClick={() => addAnalyse()}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {labSuggestions.length > 0 && (
                      <div className="rounded-xl border bg-muted/20 p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Suggestions (1 clic)</p>
                        <div className="flex flex-wrap gap-2">
                          {labSuggestions.slice(0, 10).map((s) => (
                            <button
                              key={s}
                              onClick={() => addAnalyse(s)}
                              className="px-2 py-1 rounded-lg border bg-background hover:bg-muted/60 text-xs"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {analysePrescription.map((a) => (
                        <div key={a} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                          <span className="text-sm text-foreground">{a}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeAnalyse(a)}>
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      {analysePrescription.length === 0 && (
                        <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                          Aucune analyse — ajoute au moins un examen.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LABS: Aperçu */}
                {slideType === "labs" && slideStep === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                      <div className="space-y-2">
                        {analysePrescription.map((a) => (
                          <div key={a} className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-sm font-semibold text-foreground">{a}</p>
                          </div>
                        ))}
                        {analysePrescription.length === 0 && (
                          <p className="text-sm text-muted-foreground">Aucune analyse</p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          <b>Consignes :</b> {labsNote}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openPrintWindow("Prescription d’analyses", labsPrintHtml)}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setSlideStep(2)}>
                        <FileSignature className="h-4 w-4 mr-2" />
                        Signer
                      </Button>
                    </div>
                  </div>
                )}

                {/* LABS: Signer */}
                {slideType === "labs" && slideStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-primary" />
                      Choisis les destinataires, puis signe.
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={labsSendToLab}
                          onChange={(e) => setLabsSendToLab(e.target.checked)}
                        />
                        Envoyer au laboratoire
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={labsSendToPatient}
                          onChange={(e) => setLabsSendToPatient(e.target.checked)}
                        />
                        Envoyer au patient
                      </label>
                    </div>

                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Résumé</p>
                      <p className="text-sm text-foreground font-semibold mt-1">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{analysePrescription.length} analyse(s)</p>
                    </div>
                  </div>
                )}

                {/* REPORT: Composer */}
                {slideType === "report" && slideStep === 0 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Pré-rempli depuis les notes + antécédents + constantes. Tu peux modifier librement.
                    </div>

                    <div>
                      <Label className="text-xs">Compte-rendu</Label>
                      <textarea
                        value={reportText}
                        onChange={(e) => {
                          setReportText(e.target.value);
                          setReportTouched(true);
                        }}
                        rows={16}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* REPORT: Aperçu */}
                {slideType === "report" && slideStep === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                      <div className="text-sm text-foreground whitespace-pre-wrap">{reportText}</div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openPrintWindow("Compte-rendu", reportPrintHtml)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimer
                    </Button>
                  </div>
                )}

                {/* REPORT: Signer */}
                {slideType === "report" && slideStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-primary" />
                      Signe et (option) envoie au patient.
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={reportSendToPatient}
                        onChange={(e) => setReportSendToPatient(e.target.checked)}
                      />
                      Envoyer au patient
                    </label>

                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Résumé</p>
                      <p className="text-sm text-foreground font-semibold mt-1">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">Compte-rendu prêt</p>
                    </div>
                  </div>
                )}

                {/* CERT: Composer */}
                {slideType === "certificate" && slideStep === 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs">Titre</Label>
                      <Input
                        value={certificateReason}
                        onChange={(e) => setCertificateReason(e.target.value)}
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Texte</Label>
                      <textarea
                        value={certificateComment}
                        onChange={(e) => setCertificateComment(e.target.value)}
                        rows={6}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* CERT: Aperçu */}
                {slideType === "certificate" && slideStep === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                      <p className="text-sm font-semibold text-foreground">{certificateReason}</p>
                      <p className="text-sm text-foreground mt-2">{certificateComment}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openPrintWindow("Certificat", certificatePrintHtml)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimer
                    </Button>
                  </div>
                )}

                {/* CERT: Signer */}
                {slideType === "certificate" && slideStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-primary" />
                      Signature du certificat.
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Patient</p>
                      <p className="text-sm font-semibold text-foreground">{patient.name}</p>
                    </div>
                  </div>
                )}

                {/* SICK: Composer */}
                {slideType === "sickleave" && slideStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Début</Label>
                        <Input
                          value={sickLeaveStart}
                          onChange={(e) => setSickLeaveStart(e.target.value)}
                          className="mt-1 h-9"
                          type="date"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fin</Label>
                        <Input
                          value={sickLeaveEnd}
                          onChange={(e) => setSickLeaveEnd(e.target.value)}
                          className="mt-1 h-9"
                          type="date"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Commentaire</Label>
                      <textarea
                        value={sickLeaveComment}
                        onChange={(e) => setSickLeaveComment(e.target.value)}
                        rows={5}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* SICK: Aperçu */}
                {slideType === "sickleave" && slideStep === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground mb-2">Aperçu</p>
                      <p className="text-sm text-foreground">
                        <b>Du</b> {sickLeaveStart} <b>au</b> {sickLeaveEnd}
                      </p>
                      <p className="text-sm text-foreground mt-2">{sickLeaveComment}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openPrintWindow("Arrêt de travail", sickLeavePrintHtml)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimer
                    </Button>
                  </div>
                )}

                {/* SICK: Signer */}
                {slideType === "sickleave" && slideStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-primary" />
                      Signature de l’arrêt.
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Patient</p>
                      <p className="text-sm font-semibold text-foreground">{patient.name}</p>
                    </div>
                  </div>
                )}

                {/* RDV: Planifier */}
                {slideType === "rdv" && slideStep === 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Date</Label>
                        <Input
                          value={rdvDate}
                          onChange={(e) => setRdvDate(e.target.value)}
                          className="mt-1 h-9"
                          type="date"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Heure</Label>
                        <Input
                          value={rdvTime}
                          onChange={(e) => setRdvTime(e.target.value)}
                          className="mt-1 h-9"
                          type="time"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Lieu</Label>
                      <Input
                        value={rdvLocation}
                        onChange={(e) => setRdvLocation(e.target.value)}
                        className="mt-1 h-9"
                      />
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                      RDV mock : plus tard tu brancheras ça sur l’agenda + notifications.
                    </div>
                  </div>
                )}

                {/* RDV: Confirmer */}
                {slideType === "rdv" && slideStep === 1 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Confirmation</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{patient.name}</p>
                      <p className="text-sm text-foreground mt-2">
                        {rdvDate || "(date)"} à {rdvTime || "(heure)"}
                      </p>
                      <p className="text-xs text-muted-foreground">Lieu : {rdvLocation}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex items-center justify-between gap-3">
                <Button variant="outline" onClick={handleSlideSecondary}>
                  {slideStep > 0 ? "Retour" : "Fermer"}
                </Button>

                <div className="flex items-center gap-2">
                  {!slideIsLastStep && (
                    <Button
                      variant="outline"
                      onClick={() => setSlideStep((s) => Math.min(s + 1, slideSteps.length - 1))}
                    >
                      Suivant
                    </Button>
                  )}
                  <Button
                    className="gradient-primary text-primary-foreground shadow-primary-glow"
                    onClick={handleSlidePrimary}
                  >
                    {slideIsLastStep ? "Signer / Confirmer" : "Continuer"}
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

export default DoctorConsultationDetail;
