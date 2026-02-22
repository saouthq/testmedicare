import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart, Thermometer, Activity, Plus, Save,
  AlertTriangle, Pill, ArrowLeft, Stethoscope, Droplets,
  Scale, Gauge, ChevronDown, ChevronUp, Printer, History,
  CheckCircle2, X, FileText, Calendar, Clock, Trash2, Bot, MessageSquare,
  Search, Star, Copy, Send, Eye, ClipboardList, TestTube, Tag
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { mockConsultationPatient, mockPatientConsultations, mockPatientDetailPrescriptions } from "@/data/mockData";

// ═══════════════════════════════════════════════════════════════
// LOCAL MOCK DATA (kept in this file per plan)
// ═══════════════════════════════════════════════════════════════

const mockDrugCatalog = [
  { name: "Metformine", dosage: "850mg", form: "Comprimé" },
  { name: "Glibenclamide", dosage: "5mg", form: "Comprimé" },
  { name: "Amlodipine", dosage: "5mg", form: "Comprimé" },
  { name: "Amlodipine", dosage: "10mg", form: "Comprimé" },
  { name: "Oméprazole", dosage: "20mg", form: "Gélule" },
  { name: "Paracétamol", dosage: "1g", form: "Comprimé" },
  { name: "Ibuprofène", dosage: "400mg", form: "Comprimé" },
  { name: "Amoxicilline", dosage: "1g", form: "Comprimé" },
  { name: "Atorvastatine", dosage: "20mg", form: "Comprimé" },
  { name: "Losartan", dosage: "50mg", form: "Comprimé" },
  { name: "Insuline Lantus", dosage: "100UI/mL", form: "Injectable" },
  { name: "Salbutamol", dosage: "100µg", form: "Inhalateur" },
  { name: "Lévothyroxine", dosage: "75µg", form: "Comprimé" },
  { name: "Bisoprolol", dosage: "5mg", form: "Comprimé" },
  { name: "Furosémide", dosage: "40mg", form: "Comprimé" },
  { name: "Prednisone", dosage: "20mg", form: "Comprimé" },
  { name: "Clopidogrel", dosage: "75mg", form: "Comprimé" },
  { name: "Tramadol", dosage: "50mg", form: "Gélule" },
  { name: "Diclofénac", dosage: "75mg", form: "Comprimé" },
  { name: "Pantoprazole", dosage: "40mg", form: "Comprimé" },
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

const mockPrescriptionTemplates = [
  { name: "Diabète T2", items: [
    { medication: "Metformine 850mg", dosage: "1 cp matin et soir", duration: "3 mois", instructions: "Pendant les repas" },
    { medication: "Glibenclamide 5mg", dosage: "1 cp le matin", duration: "3 mois", instructions: "Avant le petit déjeuner" },
  ]},
  { name: "HTA", items: [
    { medication: "Amlodipine 5mg", dosage: "1 cp le matin", duration: "3 mois", instructions: "" },
    { medication: "Losartan 50mg", dosage: "1 cp le soir", duration: "3 mois", instructions: "" },
  ]},
  { name: "Douleurs", items: [
    { medication: "Paracétamol 1g", dosage: "1 cp 3x/jour", duration: "7 jours", instructions: "Espacer de 6h min" },
    { medication: "Ibuprofène 400mg", dosage: "1 cp 2x/jour", duration: "5 jours", instructions: "Pendant les repas" },
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
type PrescriptionItem = { medication: string; dosage: string; duration: string; instructions: string };
type PrescriptionStatus = "brouillon" | "signee" | "envoyee";
type LeftSection = "constantes" | "notes" | "ordonnance" | "analyses" | "documents" | "taches";

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const DoctorConsultationDetail = () => {
  const navigate = useNavigate();
  const patient = mockConsultationPatient;

  // Vitals
  const [vitals, setVitals] = useState({ systolic: "130", diastolic: "80", heartRate: "72", temperature: "37.0", weight: "75", oxygenSat: "98", height: "175", respiratoryRate: "16" });
  const bmi = vitals.weight && vitals.height ? (parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1) : "—";

  // Notes
  const [motif, setMotif] = useState("Suivi diabète de type 2");
  const [symptoms, setSymptoms] = useState("Patient se plaint de fatigue accrue depuis 2 semaines.");
  const [examination, setExamination] = useState("Examen clinique normal. Abdomen souple.");
  const [diagnosis, setDiagnosis] = useState("Diabète de type 2 équilibré. Asthénie à surveiller.");
  const [conclusion, setConclusion] = useState("Maintien du traitement actuel. Contrôle HbA1c dans 3 mois.");

  // CIM-10
  const [cimSearch, setCimSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<{ code: string; label: string }[]>([{ code: "E11", label: "Diabète de type 2" }]);

  // Prescription
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { medication: "Metformine 850mg", dosage: "1 cp matin et soir", duration: "3 mois", instructions: "Pendant les repas" },
    { medication: "Glibenclamide 5mg", dosage: "1 cp le matin", duration: "3 mois", instructions: "Avant le petit déjeuner" },
  ]);
  const [prescriptionStatus, setPrescriptionStatus] = useState<PrescriptionStatus>("brouillon");
  const [drugSearch, setDrugSearch] = useState("");
  const [previewDrawer, setPreviewDrawer] = useState(false);

  // Analyses
  const [analysePrescription, setAnalysePrescription] = useState<string[]>(["HbA1c", "Glycémie à jeun"]);
  const [analyseCategory, setAnalyseCategory] = useState("all");
  const [newAnalyse, setNewAnalyse] = useState("");

  // Documents
  const [docDrawer, setDocDrawer] = useState<string | null>(null);

  // Tasks
  const [consultTasks, setConsultTasks] = useState(initialConsultTasks);

  // Close modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closed, setClosed] = useState(false);
  const [nextRdv, setNextRdv] = useState("3 mois");
  const [consultAmount, setConsultAmount] = useState("35");
  const [sendOrdonnance, setSendOrdonnance] = useState(true);
  const [sendDocs, setSendDocs] = useState(false);
  const [createFollowUp, setCreateFollowUp] = useState(true);

  // Mobile
  const [leftAccordion, setLeftAccordion] = useState(false);
  const [rightAccordion, setRightAccordion] = useState(false);

  // Timer
  const [elapsed] = useState("12:45");

  // ─── Helpers ─────────────────────────────────────────────
  const addPrescriptionItem = (item?: PrescriptionItem) => setPrescriptionItems(prev => [...prev, item || { medication: "", dosage: "", duration: "", instructions: "" }]);
  const removePrescriptionItem = (i: number) => setPrescriptionItems(prev => prev.filter((_, idx) => idx !== i));
  const updatePrescriptionItem = (i: number, field: string, value: string) => setPrescriptionItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const filteredDrugs = drugSearch.length >= 2 ? mockDrugCatalog.filter(d => d.name.toLowerCase().includes(drugSearch.toLowerCase())) : [];
  const filteredCIM = cimSearch.length >= 2 ? mockCIM10Codes.filter(c => c.label.toLowerCase().includes(cimSearch.toLowerCase()) || c.code.toLowerCase().includes(cimSearch.toLowerCase())) : [];

  const addDrug = (name: string) => {
    addPrescriptionItem({ medication: name, dosage: "", duration: "", instructions: "" });
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
      setPrescriptionItems(lastPrescription.items.map(item => ({ medication: item, dosage: "", duration: "3 mois", instructions: "" })));
      toast.success("Ordonnance précédente renouvelée");
    }
  };

  const handleClose = () => {
    setClosed(true);
    setShowCloseModal(false);
    if (sendOrdonnance) toast.success("Ordonnance envoyée au patient");
    if (sendDocs) toast.success("Documents envoyés au patient");
    if (createFollowUp) toast.success("RDV de suivi créé");
  };

  const toggleTask = (id: number) => setConsultTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const currentAnalyseItems = analyseCategory === "all"
    ? analyseCategories.flatMap(c => c.items || [])
    : analyseCategories.find(c => c.key === analyseCategory)?.items || [];

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
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Récapitulatif</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium text-foreground">{patient.name}</p></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Diagnostic</p><p className="font-medium text-foreground text-sm">{diagnosis}</p></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Ordonnance</p><p className="font-medium text-foreground">{prescriptionItems.length} médicament(s)</p></div>
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Analyses</p><p className="font-medium text-foreground">{analysePrescription.length} analyse(s)</p></div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4"><p className="text-xs text-primary font-medium">Prochain RDV</p><p className="font-medium text-foreground">{nextRdv}</p></div>
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-4"><p className="text-xs text-accent font-medium">Montant</p><p className="font-bold text-foreground">{consultAmount} DT</p></div>
            </div>
            <div className="mt-4 space-y-1">
              {sendOrdonnance && <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Ordonnance envoyée au patient</p>}
              {sendDocs && <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Documents envoyés</p>}
              {createFollowUp && <p className="text-xs text-accent flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />RDV de suivi créé</p>}
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/dashboard/doctor/consultations")}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button>
            <Button variant="outline"><Printer className="h-4 w-4 mr-2" />Imprimer</Button>
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
            <p className="text-[11px] text-muted-foreground">{patient.age} ans · {patient.gender}</p>
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
      </div>

      {/* Mini timeline */}
      <div className="rounded-xl border bg-card p-3 shadow-card">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Derniers éléments</h4>
        <div className="space-y-2">
          {miniTimeline.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
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
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${prescriptionStatus === "brouillon" ? "bg-muted text-muted-foreground" : prescriptionStatus === "signee" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
              {prescriptionStatus === "brouillon" ? "Brouillon" : prescriptionStatus === "signee" ? "Signée" : "Envoyée"}
            </span>
          </div>
        </div>
        <div className="p-3 space-y-3">
          {/* Drug search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3 w-3 text-muted-foreground" />
            <Input placeholder="Rechercher médicament..." value={drugSearch} onChange={e => setDrugSearch(e.target.value)} className="h-7 text-[11px] pl-7" />
            {filteredDrugs.length > 0 && (
              <div className="absolute top-8 left-0 right-0 bg-card border rounded-lg shadow-elevated z-20 max-h-40 overflow-y-auto">
                {filteredDrugs.map((d, i) => (
                  <button key={i} onClick={() => addDrug(`${d.name} ${d.dosage}`)} className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted/50 flex justify-between">
                    <span className="font-medium text-foreground">{d.name} {d.dosage}</span>
                    <span className="text-muted-foreground">{d.form}</span>
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

          {/* Renew button */}
          <Button variant="outline" size="sm" className="w-full text-[10px] h-7" onClick={renewPrevious}><Copy className="h-3 w-3 mr-1" />Renouveler précédente</Button>

          {/* Items */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {prescriptionItems.map((item, i) => (
              <div key={i} className="rounded border bg-muted/20 p-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-primary">#{i + 1}</span>
                  {prescriptionItems.length > 1 && <button onClick={() => removePrescriptionItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>}
                </div>
                <Input placeholder="Médicament" value={item.medication} onChange={e => updatePrescriptionItem(i, "medication", e.target.value)} className="h-6 text-[10px]" />
                <Input placeholder="Posologie" value={item.dosage} onChange={e => updatePrescriptionItem(i, "dosage", e.target.value)} className="h-6 text-[10px]" />
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
          <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 text-primary" onClick={() => setPrescriptionStatus("signee")}><CheckCircle2 className="h-3 w-3 mr-1" />Signer l'ordonnance</Button>
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
      </div>

      {/* C) Documents */}
      <div className="rounded-xl border bg-card p-3 shadow-card">
        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-warning" />Documents à générer</h4>
        <div className="space-y-1">
          {mockDocTemplates.map(d => (
            <Button key={d.key} variant="outline" size="sm" className="w-full text-[10px] h-7 justify-start" onClick={() => setDocDrawer(d.key)}>
              <FileText className="h-3 w-3 mr-1.5" />{d.label}
            </Button>
          ))}
        </div>
      </div>

      {/* D) Tasks */}
      <div className="rounded-xl border bg-card p-3 shadow-card">
        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-primary" />Tâches consultation</h4>
        <div className="space-y-1.5">
          {consultTasks.map(t => (
            <label key={t.id} className="flex items-center gap-2 text-[11px] cursor-pointer group">
              <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} className="h-3.5 w-3.5" />
              <span className={`${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.label}</span>
            </label>
          ))}
        </div>
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
                  <p className="text-[10px] text-muted-foreground mb-1">Analyses</p>
                  <div className="flex flex-wrap gap-1">{analysePrescription.map(a => <span key={a} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{a}</span>)}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-[10px]">Prochain RDV</Label><select value={nextRdv} onChange={e => setNextRdv(e.target.value)} className="mt-1 w-full h-8 rounded-md border bg-background px-2 text-xs"><option>1 semaine</option><option>2 semaines</option><option>1 mois</option><option>3 mois</option><option>6 mois</option><option>Non nécessaire</option></select></div>
                <div><Label className="text-[10px]">Montant (DT)</Label><Input value={consultAmount} onChange={e => setConsultAmount(e.target.value)} className="mt-1 h-8 text-xs" type="number" /></div>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer"><Checkbox checked={sendOrdonnance} onCheckedChange={(v) => setSendOrdonnance(!!v)} className="h-3.5 w-3.5" />Envoyer ordonnance au patient</label>
                <label className="flex items-center gap-2 text-xs cursor-pointer"><Checkbox checked={sendDocs} onCheckedChange={(v) => setSendDocs(!!v)} className="h-3.5 w-3.5" />Envoyer documents générés</label>
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
            <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><span className="text-xs font-semibold text-primary">En cours — {elapsed}</span></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs"><Save className="h-3.5 w-3.5 mr-1" />Brouillon</Button>
            <Button variant="outline" size="sm" className="text-xs"><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowCloseModal(true)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Terminer</Button>
          </div>
        </div>

        {/* Mobile accordion — Left */}
        <div className="lg:hidden">
          <button onClick={() => setLeftAccordion(!leftAccordion)} className="w-full flex items-center justify-between rounded-xl border bg-card p-3 shadow-card">
            <span className="text-xs font-semibold text-foreground flex items-center gap-2">
              <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">AB</div>
              {patient.name}
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
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Gauge className="h-3 w-3 text-destructive" /><span className="text-[10px] text-muted-foreground">Tension</span></div><div className="flex items-center gap-1"><Input value={vitals.systolic} onChange={e => setVitals(v => ({ ...v, systolic: e.target.value }))} className="text-center h-7 text-xs font-semibold" /><span className="text-muted-foreground font-bold">/</span><Input value={vitals.diastolic} onChange={e => setVitals(v => ({ ...v, diastolic: e.target.value }))} className="text-center h-7 text-xs font-semibold" /></div></div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Heart className="h-3 w-3 text-destructive" /><span className="text-[10px] text-muted-foreground">FC</span></div><Input value={vitals.heartRate} onChange={e => setVitals(v => ({ ...v, heartRate: e.target.value }))} className="h-7 text-xs font-semibold" /></div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Thermometer className="h-3 w-3 text-warning" /><span className="text-[10px] text-muted-foreground">Temp.</span></div><Input value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: e.target.value }))} className="h-7 text-xs font-semibold" /></div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Droplets className="h-3 w-3 text-primary" /><span className="text-[10px] text-muted-foreground">SpO2</span></div><Input value={vitals.oxygenSat} onChange={e => setVitals(v => ({ ...v, oxygenSat: e.target.value }))} className="h-7 text-xs font-semibold" /></div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Scale className="h-3 w-3 text-accent" /><span className="text-[10px] text-muted-foreground">Poids</span></div><Input value={vitals.weight} onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))} className="h-7 text-xs font-semibold" /></div>
                <div className="rounded-lg border p-2 bg-muted/30"><div className="flex items-center gap-1 mb-1"><Activity className="h-3 w-3 text-primary" /><span className="text-[10px] text-muted-foreground">IMC</span></div><div className="h-7 flex items-center"><span className={`text-xs font-bold ${parseFloat(bmi) > 25 ? "text-warning" : "text-foreground"}`}>{bmi}</span></div></div>
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
              </div>
              <div className="border-t pt-3 mb-3">
                <p className="text-xs text-muted-foreground">Patient : <span className="text-foreground font-medium">{patient.name}</span></p>
                <p className="text-xs text-muted-foreground">Date : {new Date().toLocaleDateString("fr-FR")}</p>
              </div>
              <p className="font-semibold text-foreground mb-2">ORDONNANCE</p>
              {prescriptionItems.filter(p => p.medication).map((p, i) => (
                <div key={i} className="mb-2">
                  <p className="text-foreground font-medium">{i + 1}. {p.medication}</p>
                  <p className="text-muted-foreground text-xs ml-4">{p.dosage} — {p.duration}</p>
                  {p.instructions && <p className="text-muted-foreground text-xs ml-4 italic">{p.instructions}</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Impression...")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Impression...")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
                <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => { toast.success("Document envoyé au patient"); setDocDrawer(null); }}>
                  <Send className="h-3.5 w-3.5 mr-1" />Envoyer
                </Button>
              </div>
            </div>
          </DrawerOverlay>
        );
      })()}
    </DashboardLayout>
  );
};

export default DoctorConsultationDetail;