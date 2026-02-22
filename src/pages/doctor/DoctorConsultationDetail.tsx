import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart, Thermometer, Activity, Plus, Save,
  AlertTriangle, Pill, ArrowLeft, Stethoscope, Droplets,
  Scale, Gauge, ChevronDown, ChevronUp, Printer, History,
  CheckCircle2, X, FileText, Calendar, Clock, Trash2, Bot, MessageSquare,
  Search, Star, Copy, Send, Eye, ClipboardList, TestTube, Tag,
  Lock, Bell, Download, Bookmark, CircleDot, BarChart3, Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { mockConsultationPatient, mockPatientConsultations, mockPatientDetailPrescriptions } from "@/data/mockData";

// ═══════════════════════════════════════════════════════════════
// LOCAL MOCK DATA (kept in this file per plan)
// ═══════════════════════════════════════════════════════════════

const mockDrugCatalog = [
  { name: "Metformine", dosage: "850mg", form: "Comprimé", category: "Antidiabétique" },
  { name: "Glibenclamide", dosage: "5mg", form: "Comprimé", category: "Antidiabétique" },
  { name: "Amlodipine", dosage: "5mg", form: "Comprimé", category: "Antihypertenseur" },
  { name: "Amlodipine", dosage: "10mg", form: "Comprimé", category: "Antihypertenseur" },
  { name: "Oméprazole", dosage: "20mg", form: "Gélule", category: "Gastro" },
  { name: "Paracétamol", dosage: "1g", form: "Comprimé", category: "Antalgique" },
  { name: "Ibuprofène", dosage: "400mg", form: "Comprimé", category: "AINS" },
  { name: "Amoxicilline", dosage: "1g", form: "Comprimé", category: "Antibiotique" },
  { name: "Atorvastatine", dosage: "20mg", form: "Comprimé", category: "Hypolipémiant" },
  { name: "Losartan", dosage: "50mg", form: "Comprimé", category: "Antihypertenseur" },
  { name: "Insuline Lantus", dosage: "100UI/mL", form: "Injectable", category: "Antidiabétique" },
  { name: "Salbutamol", dosage: "100µg", form: "Inhalateur", category: "Bronchodilatateur" },
  { name: "Lévothyroxine", dosage: "75µg", form: "Comprimé", category: "Thyroïde" },
  { name: "Bisoprolol", dosage: "5mg", form: "Comprimé", category: "Bêtabloquant" },
  { name: "Furosémide", dosage: "40mg", form: "Comprimé", category: "Diurétique" },
  { name: "Prednisone", dosage: "20mg", form: "Comprimé", category: "Corticoïde" },
  { name: "Clopidogrel", dosage: "75mg", form: "Comprimé", category: "Antiagrégant" },
  { name: "Tramadol", dosage: "50mg", form: "Gélule", category: "Antalgique" },
  { name: "Diclofénac", dosage: "75mg", form: "Comprimé", category: "AINS" },
  { name: "Pantoprazole", dosage: "40mg", form: "Comprimé", category: "Gastro" },
];

const mockCIM10Codes = [
  { code: "E11", label: "Diabète de type 2" },
  { code: "I10", label: "Hypertension essentielle" },
  { code: "J45", label: "Asthme" },
  { code: "E78", label: "Hyperlipidémie" },
  { code: "M54", label: "Dorsalgie" },
  { code: "J06", label: "Infection respiratoire haute" },
  { code: "K21", label: "Reflux gastro-œsophagien" },
  { code: "E03", label: "Hypothyroïdie" },
  { code: "N39", label: "Infection urinaire" },
  { code: "G43", label: "Migraine" },
  { code: "R51", label: "Céphalée" },
  { code: "M79", label: "Douleur des tissus mous" },
  { code: "B34", label: "Infection virale non précisée" },
  { code: "L30", label: "Dermatite" },
  { code: "F41", label: "Troubles anxieux" },
];

// Quick CIM-10 common codes for fast selection
const commonCIM10 = [
  { code: "E11", label: "Diabète T2" },
  { code: "I10", label: "HTA" },
  { code: "J06", label: "Infect. resp." },
  { code: "M54", label: "Dorsalgie" },
  { code: "R51", label: "Céphalée" },
  { code: "K21", label: "RGO" },
];

const mockPrescriptionTemplates = [
  { name: "Diabète T2", items: [
    { medication: "Metformine 850mg", dosage: "1 cp matin et soir", duration: "3 mois", instructions: "Pendant les repas", qsp: true },
    { medication: "Glibenclamide 5mg", dosage: "1 cp le matin", duration: "3 mois", instructions: "Avant le petit déjeuner", qsp: true },
  ]},
  { name: "HTA", items: [
    { medication: "Amlodipine 5mg", dosage: "1 cp le matin", duration: "3 mois", instructions: "", qsp: true },
    { medication: "Losartan 50mg", dosage: "1 cp le soir", duration: "3 mois", instructions: "", qsp: true },
  ]},
  { name: "Douleurs", items: [
    { medication: "Paracétamol 1g", dosage: "1 cp 3x/jour", duration: "7 jours", instructions: "Espacer de 6h min", qsp: false },
    { medication: "Ibuprofène 400mg", dosage: "1 cp 2x/jour", duration: "5 jours", instructions: "Pendant les repas", qsp: false },
  ]},
  { name: "Angine", items: [
    { medication: "Amoxicilline 1g", dosage: "1 cp 2x/jour", duration: "6 jours", instructions: "", qsp: false },
    { medication: "Paracétamol 1g", dosage: "Si douleur, 3x/jour max", duration: "5 jours", instructions: "Espacer de 6h", qsp: false },
  ]},
];

const mockDocTemplates = [
  { key: "certificat", label: "Certificat médical", content: (name: string, age: number) => `Je soussigné(e) Dr. Ahmed Bouazizi, certifie avoir examiné ce jour M./Mme ${name}, âgé(e) de ${age} ans.\n\nL'état de santé du patient ne nécessite pas d'arrêt de travail / nécessite un arrêt de travail de ___ jours.\n\nFait à Tunis, le ${new Date().toLocaleDateString("fr-FR")}` },
  { key: "arret", label: "Arrêt de travail", content: (name: string, age: number) => `ARRÊT DE TRAVAIL\n\nPatient : ${name}, ${age} ans\nDurée : ___ jours\nDu ___ au ___\nMotif médical : ___\n\nDr. Ahmed Bouazizi\nMédecin généraliste` },
  { key: "adressage", label: "Lettre d'adressage", content: (name: string, age: number) => `Cher(e) Confrère/Consœur,\n\nJe vous adresse M./Mme ${name}, ${age} ans, pour ___.\n\nAntécédents : ___\nTraitement actuel : ___\n\nMerci de votre avis.\n\nDr. Ahmed Bouazizi` },
  { key: "cr", label: "Compte-rendu", content: (name: string, age: number) => `COMPTE-RENDU DE CONSULTATION\n\nPatient : ${name}, ${age} ans\nDate : ${new Date().toLocaleDateString("fr-FR")}\nMotif : ___\nExamen : ___\nConclusion : ___\n\nDr. Ahmed Bouazizi` },
];

// Analysis categories
const analyseCategories = [
  { key: "all", label: "Tout" },
  { key: "hemato", label: "Hématologie", items: ["NFS", "VS", "Plaquettes", "TP/INR"] },
  { key: "biochimie", label: "Biochimie", items: ["Glycémie à jeun", "HbA1c", "Créatinine", "Urée", "Bilan lipidique", "Acide urique", "ASAT/ALAT"] },
  { key: "hormono", label: "Hormonologie", items: ["TSH", "T3/T4", "Cortisol", "Vitamine D", "Vitamine B12"] },
];

// Consultation tasks
const initialConsultTasks = [
  { id: 1, label: "Prendre constantes", done: false },
  { id: 2, label: "Examiner patient", done: false },
  { id: 3, label: "Rédiger ordonnance", done: false },
  { id: 4, label: "Prescrire analyses", done: false },
  { id: 5, label: "Planifier prochain RDV", done: false },
];

// Favorite drugs
const favoriteDrugs = ["Metformine 850mg", "Paracétamol 1g", "Amoxicilline 1g", "Oméprazole 20mg"];

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type PrescriptionItem = { medication: string; dosage: string; duration: string; instructions: string; qsp?: boolean };
type PrescriptionStatus = "brouillon" | "signee" | "envoyee";

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const DoctorConsultationDetail = () => {
  const navigate = useNavigate();
  const patient = mockConsultationPatient;

  // Vitals
  const [vitals, setVitals] = useState({ systolic: "130", diastolic: "80", heartRate: "72", temperature: "37.0", weight: "75", oxygenSat: "98", height: "175", respiratoryRate: "16" });
  const bmi = vitals.weight && vitals.height ? (parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1) : "—";

  // Vitals alerts
  const vitalsAlerts: string[] = [];
  if (parseFloat(vitals.systolic) >= 140) vitalsAlerts.push("TA systolique élevée");
  if (parseFloat(vitals.heartRate) > 100) vitalsAlerts.push("Tachycardie");
  if (parseFloat(vitals.temperature) >= 38) vitalsAlerts.push("Fièvre");
  if (parseFloat(vitals.oxygenSat) < 95) vitalsAlerts.push("SpO2 basse");

  // Notes
  const [motif, setMotif] = useState("Suivi diabète de type 2");
  const [symptoms, setSymptoms] = useState("Patient se plaint de fatigue accrue depuis 2 semaines.");
  const [examination, setExamination] = useState("Examen clinique normal. Abdomen souple.");
  const [diagnosis, setDiagnosis] = useState("Diabète de type 2 équilibré. Asthénie à surveiller.");
  const [conclusion, setConclusion] = useState("Maintien du traitement actuel. Contrôle HbA1c dans 3 mois.");

  // Private notes
  const [privateNotes, setPrivateNotes] = useState("");
  const [showPrivateNotes, setShowPrivateNotes] = useState(false);

  // Auto-save indicator
  const [autoSaved, setAutoSaved] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState("il y a 1 min");

  useEffect(() => {
    setAutoSaved(false);
    const timer = setTimeout(() => {
      setAutoSaved(true);
      setLastSavedTime("à l'instant");
    }, 1500);
    return () => clearTimeout(timer);
  }, [motif, symptoms, examination, diagnosis, conclusion, privateNotes]);

  // CIM-10
  const [cimSearch, setCimSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<{ code: string; label: string }[]>([{ code: "E11", label: "Diabète de type 2" }]);

  // Prescription
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { medication: "Metformine 850mg", dosage: "1 cp matin et soir", duration: "3 mois", instructions: "Pendant les repas", qsp: true },
    { medication: "Glibenclamide 5mg", dosage: "1 cp le matin", duration: "3 mois", instructions: "Avant le petit déjeuner", qsp: true },
  ]);
  const [prescriptionStatus, setPrescriptionStatus] = useState<PrescriptionStatus>("brouillon");
  const [drugSearch, setDrugSearch] = useState("");
  const [previewDrawer, setPreviewDrawer] = useState(false);
  const [saveFavDrawer, setSaveFavDrawer] = useState(false);
  const [favTemplateName, setFavTemplateName] = useState("");

  // Analyses
  const [analysePrescription, setAnalysePrescription] = useState<string[]>(["HbA1c", "Glycémie à jeun"]);
  const [analyseCategory, setAnalyseCategory] = useState("all");

  // Documents
  const [docDrawer, setDocDrawer] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<string[]>([]);

  // Tasks
  const [consultTasks, setConsultTasks] = useState(initialConsultTasks);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  // Close modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closed, setClosed] = useState(false);
  const [nextRdv, setNextRdv] = useState("3 mois");
  const [consultAmount, setConsultAmount] = useState("35");
  const [paymentMethod, setPaymentMethod] = useState("especes");
  const [sendOrdonnance, setSendOrdonnance] = useState(true);
  const [sendDocs, setSendDocs] = useState(false);
  const [createFollowUp, setCreateFollowUp] = useState(true);

  // Mobile
  const [leftAccordion, setLeftAccordion] = useState(false);
  const [rightAccordion, setRightAccordion] = useState(false);

  // Timer - live elapsed time
  const [elapsedSeconds, setElapsedSeconds] = useState(765); // starts at 12:45
  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const elapsedFormatted = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, "0")}`;

  // ─── Helpers ─────────────────────────────────────────────
  const addPrescriptionItem = (item?: PrescriptionItem) => setPrescriptionItems(prev => [...prev, item || { medication: "", dosage: "", duration: "", instructions: "", qsp: false }]);
  const removePrescriptionItem = (i: number) => setPrescriptionItems(prev => prev.filter((_, idx) => idx !== i));
  const updatePrescriptionItem = (i: number, field: string, value: any) => setPrescriptionItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const filteredDrugs = drugSearch.length >= 2 ? mockDrugCatalog.filter(d => d.name.toLowerCase().includes(drugSearch.toLowerCase()) || d.category.toLowerCase().includes(drugSearch.toLowerCase())) : [];
  const filteredCIM = cimSearch.length >= 2 ? mockCIM10Codes.filter(c => c.label.toLowerCase().includes(cimSearch.toLowerCase()) || c.code.toLowerCase().includes(cimSearch.toLowerCase())) : [];

  const addDrug = (name: string) => {
    addPrescriptionItem({ medication: name, dosage: "", duration: "", instructions: "", qsp: false });
    setDrugSearch("");
    toast.success(`${name} ajouté`);
  };

  const addCimCode = (code: { code: string; label: string }) => {
    if (!selectedCodes.find(c => c.code === code.code)) {
      setSelectedCodes(prev => [...prev, code]);
      setCimSearch("");
    }
  };

  const applyTemplate = (template: typeof mockPrescriptionTemplates[0]) => {
    setPrescriptionItems(template.items);
    toast.success(`Modèle "${template.name}" appliqué`);
  };

  const renewPrevious = () => {
    const lastPrescription = mockPatientDetailPrescriptions[0];
    if (lastPrescription) {
      setPrescriptionItems(lastPrescription.items.map(item => ({ medication: item, dosage: "", duration: "3 mois", instructions: "", qsp: true })));
      toast.success("Ordonnance précédente renouvelée");
    }
  };

  const handleClose = () => {
    setClosed(true);
    setShowCloseModal(false);
    if (sendOrdonnance) toast.success("Ordonnance envoyée au patient");
    if (sendDocs && generatedDocs.length > 0) toast.success(`${generatedDocs.length} document(s) envoyé(s) au patient`);
    if (createFollowUp) toast.success(`RDV de suivi créé dans ${nextRdv}`);
    // TODO: API call to save consultation
  };

  const toggleTask = (id: number) => setConsultTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addConsultTask = () => {
    if (!newTaskLabel.trim()) return;
    setConsultTasks(prev => [...prev, { id: Date.now(), label: newTaskLabel, done: false }]);
    setNewTaskLabel("");
    setShowAddTask(false);
  };

  const currentAnalyseItems = analyseCategory === "all"
    ? analyseCategories.flatMap(c => c.items || [])
    : analyseCategories.find(c => c.key === analyseCategory)?.items || [];

  // Task progress
  const tasksDone = consultTasks.filter(t => t.done).length;
  const tasksTotal = consultTasks.length;
  const taskProgress = tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0;

  // ─── Mini timeline ───────────────────────────────────────
  const miniTimeline = [
    ...mockPatientConsultations.slice(0, 2).map(c => ({ type: "consultation" as const, label: c.motif, date: c.date })),
    ...mockPatientDetailPrescriptions.slice(0, 1).map(p => ({ type: "ordonnance" as const, label: p.id, date: p.date })),
  ].slice(0, 3);

  // ─── CLOSED STATE ────────────────────────────────────────
  if (closed) {
    return (
      <DashboardLayout role="doctor" title="Consultation terminée">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-xl border bg-card p-8 shadow-card text-center">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="h-8 w-8 text-accent" /></div>
            <h2 className="text-xl font-bold text-foreground">Consultation clôturée</h2>
            <p className="text-muted-foreground mt-2">La consultation avec {patient.name} a été clôturée avec succès.</p>
            <p className="text-xs text-muted-foreground mt-1">Durée : {elapsedFormatted}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Récapitulatif</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium text-foreground">{patient.name}</p></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Diagnostic</p><p className="font-medium text-foreground text-sm">{diagnosis}</p></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">CIM-10</p><div className="flex flex-wrap gap-1 mt-1">{selectedCodes.map(c => <span key={c.code} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{c.code}</span>)}</div></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Ordonnance</p><p className="font-medium text-foreground">{prescriptionItems.length} médicament(s)</p></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Analyses</p><p className="font-medium text-foreground">{analysePrescription.length} analyse(s)</p></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Paiement</p><p className="font-medium text-foreground">{consultAmount} DT — {paymentMethod === "especes" ? "Espèces" : paymentMethod === "carte" ? "Carte" : paymentMethod === "cheque" ? "Chèque" : "Tiers payant"}</p></div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4"><p className="text-xs text-primary font-medium">Prochain RDV</p><p className="font-medium text-foreground">{nextRdv}</p></div>
              {generatedDocs.length > 0 && <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Documents</p><p className="font-medium text-foreground">{generatedDocs.join(", ")}</p></div>}
            </div>
            <div className="mt-4 space-y-1">
              {sendOrdonnance && <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Ordonnance envoyée au patient</p>}
              {sendDocs && generatedDocs.length > 0 && <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{generatedDocs.length} document(s) envoyé(s)</p>}
              {createFollowUp && <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />RDV de suivi créé ({nextRdv})</p>}
            </div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" onClick={() => navigate("/dashboard/doctor/consultations")}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button>
            <Button variant="outline"><Printer className="h-4 w-4 mr-2" />Imprimer</Button>
            <Link to="/dashboard/doctor/patients/1"><Button variant="outline"><ClipboardList className="h-4 w-4 mr-2" />Dossier patient</Button></Link>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => navigate("/dashboard/doctor/consultation/new")}><Plus className="h-4 w-4 mr-2" />Nouvelle consultation</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── DRAWER OVERLAY ──────────────────────────────────────
  const DrawerOverlay = ({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-card border-l shadow-elevated h-full overflow-y-auto animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b px-5 py-4 flex items-center justify-between z-10">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );

  // ─── LEFT COLUMN ─────────────────────────────────────────
  const LeftColumn = () => (
    <div className="space-y-4">
      {/* Patient card */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">AB</div>
          <div>
            <h2 className="font-bold text-foreground text-sm">{patient.name}</h2>
            <p className="text-[11px] text-muted-foreground">{patient.age} ans · {patient.gender} · {patient.bloodType}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {patient.allergies.map(a => (
            <span key={a} className="flex items-center gap-1 text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full w-fit"><AlertTriangle className="h-3 w-3" />ALLERGIE: {a}</span>
          ))}
          {patient.conditions.map(c => (
            <span key={c} className="block text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full w-fit">{c}</span>
          ))}
        </div>
        {/* Current treatment summary */}
        <div className="mt-3 pt-2 border-t space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Traitement en cours</p>
          <p className="text-[10px] text-foreground">Metformine 850mg · Glibenclamide 5mg</p>
        </div>
      </div>

      {/* Mini timeline */}
      <div className="rounded-xl border bg-card p-3 shadow-card">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Derniers éléments</h4>
        <div className="space-y-2">
          {miniTimeline.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/30 rounded p-1 -mx-1 transition-colors">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${item.type === "consultation" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                {item.type === "consultation" ? <Stethoscope className="h-3 w-3" /> : <Pill className="h-3 w-3" />}
              </div>
              <div className="min-w-0">
                <p className="text-foreground text-[11px] font-medium truncate">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full record link */}
      <Link to="/dashboard/doctor/patients/1"><Button variant="outline" size="sm" className="w-full text-xs"><History className="h-3.5 w-3.5 mr-2" />Dossier complet</Button></Link>

      {/* Private notes */}
      <Button variant="ghost" size="sm" className="w-full text-xs justify-start text-muted-foreground" onClick={() => setShowPrivateNotes(true)}>
        <Lock className="h-3.5 w-3.5 mr-2" />Notes privées
      </Button>
    </div>
  );

  // ─── RIGHT COLUMN ────────────────────────────────────────
  const RightColumn = () => (
    <div className="space-y-4">
      {/* A) PrescriptionBuilder */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="p-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Pill className="h-3.5 w-3.5 text-primary" />Ordonnance</h4>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${prescriptionStatus === "brouillon" ? "bg-muted text-muted-foreground" : prescriptionStatus === "signee" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                {prescriptionStatus === "brouillon" ? "Brouillon" : prescriptionStatus === "signee" ? "Signée" : "Envoyée"}
              </span>
              <span className="text-[10px] text-muted-foreground">{prescriptionItems.filter(p => p.medication).length} item(s)</span>
            </div>
          </div>
        </div>
        <div className="p-3 space-y-3">
          {/* Drug search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3 w-3 text-muted-foreground" />
            <Input placeholder="Rechercher médicament..." value={drugSearch} onChange={e => setDrugSearch(e.target.value)} className="h-7 text-[11px] pl-7" />
            {filteredDrugs.length > 0 && (
              <div className="absolute top-8 left-0 right-0 bg-card border rounded-lg shadow-elevated z-20 max-h-48 overflow-y-auto">
                {filteredDrugs.map((d, i) => (
                  <button key={i} onClick={() => addDrug(`${d.name} ${d.dosage}`)} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted/50 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-foreground">{d.name} {d.dosage}</span>
                      <span className="text-[9px] text-muted-foreground ml-1.5">{d.form}</span>
                    </div>
                    <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{d.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Favorites */}
          <div>
            <p className="text-[10px] text-muted-foreground font-medium mb-1 flex items-center gap-1"><Star className="h-3 w-3" />Favoris</p>
            <div className="flex flex-wrap gap-1">
              {favoriteDrugs.map(d => (
                <button key={d} onClick={() => addDrug(d)} className="text-[10px] border rounded-full px-2 py-0.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors">{d}</button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Modèles</p>
            <div className="flex flex-wrap gap-1">
              {mockPrescriptionTemplates.map(t => (
                <button key={t.name} onClick={() => applyTemplate(t)} className="text-[10px] bg-primary/5 text-primary border border-primary/20 rounded-full px-2 py-0.5 hover:bg-primary/10 transition-colors">{t.name}</button>
              ))}
            </div>
          </div>

          {/* Renew + save template */}
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7" onClick={renewPrevious}><Copy className="h-3 w-3 mr-1" />Renouveler</Button>
            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7" onClick={() => setSaveFavDrawer(true)}><Bookmark className="h-3 w-3 mr-1" />Sauv. modèle</Button>
          </div>

          {/* Items */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {prescriptionItems.map((item, i) => (
              <div key={i} className="rounded border bg-muted/20 p-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-primary">#{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <label className="flex items-center gap-1 text-[9px] text-muted-foreground cursor-pointer">
                      <Checkbox checked={item.qsp || false} onCheckedChange={v => updatePrescriptionItem(i, "qsp", !!v)} className="h-3 w-3" />
                      QSP
                    </label>
                    {prescriptionItems.length > 1 && <button onClick={() => removePrescriptionItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>}
                  </div>
                </div>
                <Input placeholder="Médicament" value={item.medication} onChange={e => updatePrescriptionItem(i, "medication", e.target.value)} className="h-6 text-[10px]" />
                <Input placeholder="Posologie (ex: 1 cp 2x/jour)" value={item.dosage} onChange={e => updatePrescriptionItem(i, "dosage", e.target.value)} className="h-6 text-[10px]" />
                <div className="grid grid-cols-2 gap-1">
                  <Input placeholder="Durée" value={item.duration} onChange={e => updatePrescriptionItem(i, "duration", e.target.value)} className="h-6 text-[10px]" />
                  <Input placeholder="Instructions" value={item.instructions} onChange={e => updatePrescriptionItem(i, "instructions", e.target.value)} className="h-6 text-[10px]" />
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full text-[10px] h-7" onClick={() => addPrescriptionItem()}><Plus className="h-3 w-3 mr-1" />Ajouter médicament</Button>

          {/* Actions */}
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7" onClick={() => setPreviewDrawer(true)}><Eye className="h-3 w-3 mr-1" />Aperçu</Button>
            <Button size="sm" className="flex-1 text-[10px] h-7 gradient-primary text-primary-foreground" onClick={() => { setPrescriptionStatus("envoyee"); toast.success("Ordonnance envoyée au patient"); }}>
              <Send className="h-3 w-3 mr-1" />Envoyer
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 text-primary" onClick={() => { setPrescriptionStatus("signee"); toast.success("Ordonnance signée"); }}><CheckCircle2 className="h-3 w-3 mr-1" />Signer l'ordonnance</Button>
        </div>
      </div>

      {/* B) Analyses */}
      <div className="rounded-xl border bg-card p-3 shadow-card">
        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><TestTube className="h-3.5 w-3.5 text-accent" />Analyses à prescrire</h4>
        <div className="flex flex-wrap gap-1 mb-2">
          {analyseCategories.map(c => (
            <button key={c.key} onClick={() => setAnalyseCategory(c.key)} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${analyseCategory === c.key ? "bg-accent text-accent-foreground border-accent" : "text-muted-foreground border-border hover:text-foreground"}`}>{c.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {analysePrescription.map(a => (
            <span key={a} className="flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">
              {a}<button onClick={() => setAnalysePrescription(prev => prev.filter(x => x !== a))} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {currentAnalyseItems.filter(s => !analysePrescription.includes(s)).slice(0, 8).map(s => (
            <button key={s} onClick={() => setAnalysePrescription(prev => [...prev, s])} className="text-[10px] border rounded-full px-2 py-0.5 text-muted-foreground hover:text-accent hover:border-accent transition-colors">{s}</button>
          ))}
        </div>
        {analysePrescription.length > 0 && (
          <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 mt-2 text-accent" onClick={() => toast.success("Bon d'analyse généré")}>
            <Printer className="h-3 w-3 mr-1" />Générer bon d'analyse
          </Button>
        )}
      </div>

      {/* C) Documents */}
      <div className="rounded-xl border bg-card p-3 shadow-card">
        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-warning" />Documents à générer</h4>
        <div className="space-y-1">
          {mockDocTemplates.map(d => (
            <Button key={d.key} variant="outline" size="sm" className={`w-full text-[10px] h-7 justify-start ${generatedDocs.includes(d.label) ? "border-accent/30 bg-accent/5" : ""}`} onClick={() => setDocDrawer(d.key)}>
              <FileText className="h-3 w-3 mr-1.5" />{d.label}
              {generatedDocs.includes(d.label) && <CheckCircle2 className="h-3 w-3 ml-auto text-accent" />}
            </Button>
          ))}
        </div>
      </div>

      {/* D) Tasks */}
      <div className="rounded-xl border bg-card p-3 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-primary" />Tâches</h4>
          <span className="text-[10px] text-muted-foreground">{tasksDone}/{tasksTotal}</span>
        </div>
        {/* Progress */}
        <div className="h-1.5 bg-muted rounded-full mb-2 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${taskProgress}%` }} />
        </div>
        <div className="space-y-1.5">
          {consultTasks.map(t => (
            <label key={t.id} className="flex items-center gap-2 text-[11px] cursor-pointer group">
              <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} className="h-3.5 w-3.5" />
              <span className={`flex-1 ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.label}</span>
              <button onClick={() => setConsultTasks(prev => prev.filter(x => x.id !== t.id))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
            </label>
          ))}
        </div>
        {showAddTask ? (
          <div className="flex gap-1 mt-2">
            <Input placeholder="Nouvelle tâche..." value={newTaskLabel} onChange={e => setNewTaskLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addConsultTask()} className="h-6 text-[10px] flex-1" autoFocus />
            <Button size="sm" className="h-6 text-[9px] px-2" onClick={addConsultTask}>OK</Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="w-full text-[10px] h-6 mt-1.5 text-primary" onClick={() => setShowAddTask(true)}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <DashboardLayout role="doctor" title="Consultation en cours">
      {/* ─── CLOSE MODAL ──────────────────────────────────── */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="rounded-2xl border bg-card shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-foreground mb-1">Clôturer la consultation</h3>
            <p className="text-sm text-muted-foreground mb-4">Vérifiez les informations avant de clôturer.</p>
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground mb-1">Diagnostic</p><p className="text-sm font-medium text-foreground">{diagnosis}</p></div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground mb-1">CIM-10</p>
                <div className="flex flex-wrap gap-1">{selectedCodes.map(c => <span key={c.code} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">{c.code} — {c.label}</span>)}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground mb-1">Ordonnance ({prescriptionStatus})</p>
                <div className="space-y-0.5">{prescriptionItems.filter(p => p.medication).map((p, i) => <p key={i} className="text-xs text-foreground flex items-center gap-1"><Pill className="h-3 w-3 text-primary" />{p.medication} — {p.dosage}</p>)}</div>
              </div>
              {analysePrescription.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Analyses prescrites</p>
                  <div className="flex flex-wrap gap-1">{analysePrescription.map(a => <span key={a} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{a}</span>)}</div>
                </div>
              )}
              {generatedDocs.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Documents générés</p>
                  <div className="flex flex-wrap gap-1">{generatedDocs.map(d => <span key={d} className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full">{d}</span>)}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-[10px]">Prochain RDV</Label><select value={nextRdv} onChange={e => setNextRdv(e.target.value)} className="mt-1 w-full h-8 rounded-md border bg-background px-2 text-xs"><option>1 semaine</option><option>2 semaines</option><option>1 mois</option><option>3 mois</option><option>6 mois</option><option>Non nécessaire</option></select></div>
                <div><Label className="text-[10px]">Montant (DT)</Label><Input value={consultAmount} onChange={e => setConsultAmount(e.target.value)} className="mt-1 h-8 text-xs" type="number" /></div>
              </div>
              <div>
                <Label className="text-[10px]">Mode de paiement</Label>
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {[
                    { key: "especes", label: "Espèces" },
                    { key: "carte", label: "Carte" },
                    { key: "cheque", label: "Chèque" },
                    { key: "tiers", label: "Tiers payant" },
                  ].map(p => (
                    <button key={p.key} onClick={() => setPaymentMethod(p.key)} className={`text-[10px] py-1.5 rounded-md border transition-colors ${paymentMethod === p.key ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"}`}>{p.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer"><Checkbox checked={sendOrdonnance} onCheckedChange={(v) => setSendOrdonnance(!!v)} className="h-3.5 w-3.5" />Envoyer ordonnance au patient</label>
                <label className="flex items-center gap-2 text-xs cursor-pointer"><Checkbox checked={sendDocs} onCheckedChange={(v) => setSendDocs(!!v)} className="h-3.5 w-3.5" />Envoyer documents générés ({generatedDocs.length})</label>
                <label className="flex items-center gap-2 text-xs cursor-pointer"><Checkbox checked={createFollowUp} onCheckedChange={(v) => setCreateFollowUp(!!v)} className="h-3.5 w-3.5" />Créer RDV de suivi</label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowCloseModal(false)}>Annuler</Button>
              <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleClose}><CheckCircle2 className="h-4 w-4 mr-2" />Confirmer</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Sticky header */}
        <div className="flex items-center justify-between flex-wrap gap-3 sticky top-16 z-20 bg-background/80 backdrop-blur-md py-3 -mx-6 px-6 border-b">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/doctor/consultations"><Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><span className="text-xs font-semibold text-primary">En cours — {elapsedFormatted}</span></div>
            {/* Auto-save indicator */}
            <span className={`text-[10px] flex items-center gap-1 ${autoSaved ? "text-accent" : "text-warning"}`}>
              {autoSaved ? <><CheckCircle2 className="h-3 w-3" />Sauvegardé</> : <><Clock className="h-3 w-3 animate-spin" />Enregistrement...</>}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Brouillon enregistré")}><Save className="h-3.5 w-3.5 mr-1" />Brouillon</Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Impression...")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowCloseModal(true)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Terminer</Button>
          </div>
        </div>

        {/* Vitals alerts */}
        {vitalsAlerts.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <div className="flex flex-wrap gap-2">
              {vitalsAlerts.map(a => <span key={a} className="text-xs font-medium text-destructive">{a}</span>)}
            </div>
          </div>
        )}

        {/* Mobile accordion — Left */}
        <div className="lg:hidden">
          <button onClick={() => setLeftAccordion(!leftAccordion)} className="w-full flex items-center justify-between rounded-xl border bg-card p-3 shadow-card">
            <span className="text-xs font-semibold text-foreground flex items-center gap-2">
              <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">AB</div>
              {patient.name}
              {patient.allergies.length > 0 && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">{patient.allergies.length} allergie(s)</span>}
            </span>
            {leftAccordion ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {leftAccordion && <div className="mt-3"><LeftColumn /></div>}
        </div>

        {/* 3-column layout */}
        <div className="flex gap-4">
          {/* Left — Desktop */}
          <div className="hidden lg:block w-[260px] shrink-0 sticky top-32 self-start">
            <LeftColumn />
          </div>

          {/* Center */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Vitals — always visible */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Constantes vitales</h3>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                <div className={`rounded-lg border p-2 ${parseFloat(vitals.systolic) >= 140 ? "border-destructive/30 bg-destructive/5" : "bg-muted/30"}`}>
                  <div className="flex items-center gap-1 mb-1"><Gauge className={`h-3 w-3 ${parseFloat(vitals.systolic) >= 140 ? "text-destructive" : "text-destructive/70"}`} /><span className="text-[10px] text-muted-foreground">Tension</span></div>
                  <div className="flex items-center gap-1"><Input value={vitals.systolic} onChange={e => setVitals(v => ({ ...v, systolic: e.target.value }))} className="text-center h-7 text-xs font-semibold" /><span className="text-muted-foreground font-bold">/</span><Input value={vitals.diastolic} onChange={e => setVitals(v => ({ ...v, diastolic: e.target.value }))} className="text-center h-7 text-xs font-semibold" /></div>
                </div>
                <div className={`rounded-lg border p-2 ${parseFloat(vitals.heartRate) > 100 ? "border-destructive/30 bg-destructive/5" : "bg-muted/30"}`}>
                  <div className="flex items-center gap-1 mb-1"><Heart className="h-3 w-3 text-destructive" /><span className="text-[10px] text-muted-foreground">FC</span></div>
                  <Input value={vitals.heartRate} onChange={e => setVitals(v => ({ ...v, heartRate: e.target.value }))} className="h-7 text-xs font-semibold" />
                </div>
                <div className={`rounded-lg border p-2 ${parseFloat(vitals.temperature) >= 38 ? "border-warning/30 bg-warning/5" : "bg-muted/30"}`}>
                  <div className="flex items-center gap-1 mb-1"><Thermometer className={`h-3 w-3 ${parseFloat(vitals.temperature) >= 38 ? "text-warning" : "text-warning/70"}`} /><span className="text-[10px] text-muted-foreground">Temp.</span></div>
                  <Input value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: e.target.value }))} className="h-7 text-xs font-semibold" />
                </div>
                <div className={`rounded-lg border p-2 ${parseFloat(vitals.oxygenSat) < 95 ? "border-destructive/30 bg-destructive/5" : "bg-muted/30"}`}>
                  <div className="flex items-center gap-1 mb-1"><Droplets className="h-3 w-3 text-primary" /><span className="text-[10px] text-muted-foreground">SpO2</span></div>
                  <Input value={vitals.oxygenSat} onChange={e => setVitals(v => ({ ...v, oxygenSat: e.target.value }))} className="h-7 text-xs font-semibold" />
                </div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Scale className="h-3 w-3 text-accent" /><span className="text-[10px] text-muted-foreground">Poids</span></div><Input value={vitals.weight} onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))} className="h-7 text-xs font-semibold" /></div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Activity className="h-3 w-3 text-primary" /><span className="text-[10px] text-muted-foreground">Taille</span></div><Input value={vitals.height} onChange={e => setVitals(v => ({ ...v, height: e.target.value }))} className="h-7 text-xs font-semibold" /></div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><BarChart3 className="h-3 w-3 text-primary" /><span className="text-[10px] text-muted-foreground">IMC</span></div><div className="h-7 flex items-center"><span className={`text-xs font-bold ${parseFloat(bmi) > 25 ? "text-warning" : parseFloat(bmi) > 30 ? "text-destructive" : "text-foreground"}`}>{bmi}</span><span className="text-[9px] text-muted-foreground ml-1">{parseFloat(bmi) > 30 ? "Obésité" : parseFloat(bmi) > 25 ? "Surpoids" : "Normal"}</span></div></div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Activity className="h-3 w-3 text-accent" /><span className="text-[10px] text-muted-foreground">FR</span></div><Input value={vitals.respiratoryRate} onChange={e => setVitals(v => ({ ...v, respiratoryRate: e.target.value }))} className="h-7 text-xs font-semibold" /></div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Notes de consultation</h3>
              <div className="space-y-3">
                <div><Label className="text-[10px] font-medium">Motif</Label><Input value={motif} onChange={e => setMotif(e.target.value)} className="mt-1 h-8 text-xs" /></div>
                <div><Label className="text-[10px] font-medium">Anamnèse</Label><textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
                <div><Label className="text-[10px] font-medium">Examen clinique</Label><textarea value={examination} onChange={e => setExamination(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
                <div><Label className="text-[10px] font-medium">Diagnostic</Label><textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
                <div><Label className="text-[10px] font-medium">Conduite à tenir</Label><textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
              </div>
            </div>

            {/* CIM-10 Codification */}
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2"><Tag className="h-4 w-4 text-primary" />Codification CIM-10</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedCodes.map(c => (
                  <span key={c.code} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {c.code} — {c.label}
                    <button onClick={() => setSelectedCodes(prev => prev.filter(x => x.code !== c.code))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              {/* Quick codes */}
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-[10px] text-muted-foreground mr-1">Courants :</span>
                {commonCIM10.filter(c => !selectedCodes.find(s => s.code === c.code)).map(c => (
                  <button key={c.code} onClick={() => addCimCode({ code: c.code, label: mockCIM10Codes.find(m => m.code === c.code)?.label || c.label })} className="text-[10px] border rounded-full px-2 py-0.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                    {c.code} {c.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher code CIM-10..." value={cimSearch} onChange={e => setCimSearch(e.target.value)} className="h-8 text-xs pl-8" />
                {filteredCIM.length > 0 && (
                  <div className="absolute top-9 left-0 right-0 bg-card border rounded-lg shadow-elevated z-20 max-h-40 overflow-y-auto">
                    {filteredCIM.map(c => (
                      <button key={c.code} onClick={() => addCimCode(c)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 flex gap-2">
                        <span className="font-mono font-semibold text-primary">{c.code}</span>
                        <span className="text-foreground">{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — Desktop */}
          <div className="hidden lg:block w-[320px] shrink-0">
            <RightColumn />
          </div>
        </div>

        {/* Mobile accordion — Right */}
        <div className="lg:hidden">
          <button onClick={() => setRightAccordion(!rightAccordion)} className="w-full flex items-center justify-between rounded-xl border bg-card p-3 shadow-card">
            <span className="text-xs font-semibold text-foreground">Ordonnance & Actions</span>
            {rightAccordion ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {rightAccordion && <div className="mt-3"><RightColumn /></div>}
        </div>
      </div>

      {/* ─── DRAWERS ──────────────────────────────────────── */}
      {/* Prescription preview */}
      {previewDrawer && (
        <DrawerOverlay title="Aperçu ordonnance" onClose={() => setPreviewDrawer(false)}>
          <div className="space-y-4">
            <div className="rounded-lg border p-5 bg-background text-sm leading-relaxed">
              <div className="text-center mb-4">
                <p className="font-bold text-foreground">Dr. Ahmed Bouazizi</p>
                <p className="text-xs text-muted-foreground">Médecin généraliste</p>
                <p className="text-xs text-muted-foreground">15 Av. de la Liberté, El Manar, Tunis</p>
                <p className="text-xs text-muted-foreground">Tél: +216 71 234 567</p>
              </div>
              <div className="border-t pt-3 mb-3">
                <p className="text-xs text-muted-foreground">Patient : <span className="text-foreground font-medium">{patient.name}</span> — {patient.age} ans</p>
                <p className="text-xs text-muted-foreground">Date : {new Date().toLocaleDateString("fr-FR")}</p>
              </div>
              <p className="font-semibold text-foreground mb-2">ORDONNANCE</p>
              {prescriptionItems.filter(p => p.medication).map((p, i) => (
                <div key={i} className="mb-3">
                  <p className="text-foreground font-medium">{i + 1}. {p.medication}</p>
                  <p className="text-muted-foreground text-xs ml-4">{p.dosage} — {p.duration}</p>
                  {p.instructions && <p className="text-muted-foreground text-xs ml-4 italic">{p.instructions}</p>}
                  {p.qsp && <p className="text-primary text-[10px] ml-4">QSP {p.duration}</p>}
                </div>
              ))}
              <div className="border-t mt-4 pt-3 text-xs text-muted-foreground italic">
                Signature : Dr. Ahmed Bouazizi
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Impression...")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("PDF téléchargé")}><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
              <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => { setPrescriptionStatus("envoyee"); toast.success("Ordonnance envoyée"); setPreviewDrawer(false); }}>
                <Send className="h-3.5 w-3.5 mr-1" />Envoyer
              </Button>
            </div>
          </div>
        </DrawerOverlay>
      )}

      {/* Document template preview */}
      {docDrawer && (() => {
        const template = mockDocTemplates.find(d => d.key === docDrawer);
        if (!template) return null;
        return (
          <DrawerOverlay title={template.label} onClose={() => setDocDrawer(null)}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-background text-xs text-foreground leading-relaxed whitespace-pre-line">
                {template.content(patient.name, patient.age)}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Impression...")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("PDF téléchargé")}><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
                <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => {
                  if (!generatedDocs.includes(template.label)) setGeneratedDocs(prev => [...prev, template.label]);
                  toast.success(`${template.label} généré et envoyé au patient`);
                  setDocDrawer(null);
                }}>
                  <Send className="h-3.5 w-3.5 mr-1" />Envoyer
                </Button>
              </div>
            </div>
          </DrawerOverlay>
        );
      })()}

      {/* Save as template drawer */}
      {saveFavDrawer && (
        <DrawerOverlay title="Sauvegarder comme modèle" onClose={() => setSaveFavDrawer(false)}>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Nom du modèle</Label>
              <Input value={favTemplateName} onChange={e => setFavTemplateName(e.target.value)} className="mt-1 h-8 text-xs" placeholder="Ex: Suivi diabète mensuel" />
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Contenu</p>
              <div className="space-y-1">{prescriptionItems.filter(p => p.medication).map((p, i) => <p key={i} className="text-xs text-foreground">{p.medication} — {p.dosage}</p>)}</div>
            </div>
            <Button size="sm" className="w-full gradient-primary text-primary-foreground" onClick={() => { toast.success(`Modèle "${favTemplateName || "Sans nom"}" sauvegardé`); setSaveFavDrawer(false); setFavTemplateName(""); }}>
              <Bookmark className="h-3.5 w-3.5 mr-1" />Sauvegarder
            </Button>
          </div>
        </DrawerOverlay>
      )}

      {/* Private notes drawer */}
      {showPrivateNotes && (
        <DrawerOverlay title="Notes privées" onClose={() => setShowPrivateNotes(false)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 rounded-lg p-3">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Ces notes sont visibles uniquement par vous.</span>
            </div>
            <textarea
              value={privateNotes}
              onChange={e => setPrivateNotes(e.target.value)}
              rows={6}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Notes privées sur cette consultation..."
            />
            <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => { toast.success("Notes sauvegardées"); setShowPrivateNotes(false); }}>
              <Save className="h-3.5 w-3.5 mr-1" />Enregistrer
            </Button>
          </div>
        </DrawerOverlay>
      )}
    </DashboardLayout>
  );
};

export default DoctorConsultationDetail;
