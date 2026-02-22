import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Heart, Activity, FileText, Calendar, Phone, Mail, AlertTriangle,
  Pill, MessageSquare, Edit, Plus, Clock, Printer, Stethoscope, Shield, MapPin,
  User, Search, History, Syringe, TestTube, Camera, TrendingUp, ChevronRight,
  Download, Send, X, Eye, CheckCircle2, ChevronDown, ChevronUp, Menu,
  Droplets, Scale, Gauge, Thermometer, FileCheck, ClipboardList, Image,
  Save, Trash2, Copy, Lock, Bell, Share2, BarChart3, CircleDot, Bookmark
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  mockConsultationPatient, mockVitalsHistory, mockPatientConsultations,
  mockPatientDetailPrescriptions, mockPatientAnalyses, mockAntecedents,
  mockTreatments, mockAllergies, mockVaccinations, mockMeasures,
  mockHealthDocuments, mockFamilyHistory, mockSurgeries
} from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Types ───────────────────────────────────────────────────
type Section = "historique" | "antecedents" | "mesures" | "traitements" | "vaccins" | "biologie" | "documents" | "photos" | "courbes";

// ─── Local mock data for photos ──────────────────────────────
const mockPhotos = [
  { id: 1, src: "/placeholder.svg", tag: "Dermatologie", date: "10 Fév 2026", note: "Lésion cutanée bras droit" },
  { id: 2, src: "/placeholder.svg", tag: "Plaie", date: "5 Jan 2026", note: "Suivi cicatrisation" },
  { id: 3, src: "/placeholder.svg", tag: "Radio", date: "15 Déc 2025", note: "Radio thorax face" },
];

// ─── Local mock for tasks ────────────────────────────────────
const initialTasks = [
  { id: 1, label: "Fond d'oeil à programmer", done: false, priority: "high" as const },
  { id: 2, label: "Renouveler ordonnance Metformine", done: false, priority: "medium" as const },
  { id: 3, label: "Bilan lipidique à contrôler", done: false, priority: "medium" as const },
  { id: 4, label: "Rappel vaccin grippe", done: true, priority: "low" as const },
];

// ─── Charts data ─────────────────────────────────────────────
const chartData = mockVitalsHistory.map(v => ({
  date: v.date,
  poids: v.weight,
  glycemie: v.glycemia,
  systolic: v.systolic,
  diastolic: v.diastolic,
}));

// ─── Timeline builder ────────────────────────────────────────
const buildTimeline = () => {
  const items: { date: string; type: "consultation" | "ordonnance" | "analyse" | "document"; label: string; detail: string; id?: string }[] = [];
  mockPatientConsultations.forEach((c, idx) => items.push({ date: c.date, type: "consultation", label: c.motif, detail: c.notes, id: `c-${idx}` }));
  mockPatientDetailPrescriptions.forEach(p => items.push({ date: p.date, type: "ordonnance", label: `Ordonnance ${p.id}`, detail: p.items.join(", "), id: `p-${p.id}` }));
  mockPatientAnalyses.forEach(a => items.push({ date: a.date, type: "analyse", label: a.type, detail: a.values.map(v => `${v.name}: ${v.value}`).join(", "), id: `a-${a.id}` }));
  mockHealthDocuments.forEach(d => items.push({ date: d.date, type: "document", label: d.name, detail: `${d.source} — ${d.size}` }));
  // Sort by date descending (most recent first)
  return items.sort((a, b) => {
    const parseDate = (d: string) => {
      const months: Record<string, number> = { "Jan": 0, "Fév": 1, "Mar": 2, "Avr": 3, "Mai": 4, "Juin": 5, "Juil": 6, "Aoû": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Déc": 11 };
      const parts = d.split(" ");
      if (parts.length === 3) return new Date(parseInt(parts[2]), months[parts[1]] || 0, parseInt(parts[0])).getTime();
      return 0;
    };
    return parseDate(b.date) - parseDate(a.date);
  });
};

const timelineTypeConfig = {
  consultation: { icon: Stethoscope, color: "bg-primary/10 text-primary", border: "border-primary/30", label: "Consultation" },
  ordonnance: { icon: Pill, color: "bg-accent/10 text-accent", border: "border-accent/30", label: "Ordonnance" },
  analyse: { icon: TestTube, color: "bg-warning/10 text-warning", border: "border-warning/30", label: "Analyse" },
  document: { icon: FileText, color: "bg-muted text-muted-foreground", border: "border-border", label: "Document" },
};

// ─── Sections menu ───────────────────────────────────────────
const sections: { key: Section; label: string; icon: any; count?: number }[] = [
  { key: "historique", label: "Historique", icon: History },
  { key: "antecedents", label: "Antécédents", icon: ClipboardList },
  { key: "mesures", label: "Mesures", icon: Activity },
  { key: "traitements", label: "Traitements", icon: Pill },
  { key: "vaccins", label: "Vaccins", icon: Syringe },
  { key: "biologie", label: "Biologie", icon: TestTube },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "photos", label: "Photos", icon: Camera },
  { key: "courbes", label: "Courbes", icon: TrendingUp },
];

// ─── Document templates ──────────────────────────────────────
const docTemplates = [
  { label: "Certificat médical", icon: FileCheck, content: (name: string, age: number) => `Je soussigné(e) Dr. Ahmed Bouazizi, certifie avoir examiné ce jour M./Mme ${name}, âgé(e) de ${age} ans.\n\nL'état de santé du patient ne nécessite pas d'arrêt de travail / nécessite un arrêt de travail de ___ jours.\n\nFait à Tunis, le ${new Date().toLocaleDateString("fr-FR")}` },
  { label: "Lettre d'adressage", icon: Send, content: (name: string, age: number) => `Cher(e) Confrère/Consœur,\n\nJe vous adresse M./Mme ${name}, ${age} ans, pour ___.\n\nAntécédents : ___\nTraitement actuel : ___\n\nMerci de votre avis.\n\nDr. Ahmed Bouazizi` },
  { label: "Compte-rendu", icon: FileText, content: (name: string, age: number) => `COMPTE-RENDU DE CONSULTATION\n\nPatient : ${name}, ${age} ans\nDate : ${new Date().toLocaleDateString("fr-FR")}\nMotif : ___\nExamen : ___\nConclusion : ___\n\nDr. Ahmed Bouazizi` },
  { label: "Arrêt de travail", icon: Calendar, content: (name: string, age: number) => `ARRÊT DE TRAVAIL\n\nPatient : ${name}, ${age} ans\nDurée : ___ jours\nDu ___ au ___\nMotif médical : ___\n\nDr. Ahmed Bouazizi` },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const DoctorPatientDetail = () => {
  const patient = mockConsultationPatient;
  const [activeSection, setActiveSection] = useState<Section>("historique");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("Tout");
  const [drawerItem, setDrawerItem] = useState<any>(null);
  const [docDrawer, setDocDrawer] = useState<string | null>(null);
  const [chartDrawerPoint, setChartDrawerPoint] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightAccordionOpen, setRightAccordionOpen] = useState(true);

  // Observation state
  const [obsMotif, setObsMotif] = useState("Suivi diabète de type 2");
  const [obsExamen, setObsExamen] = useState("Examen clinique normal. Abdomen souple.");
  const [obsSynthese, setObsSynthese] = useState("Maintien traitement. Contrôle HbA1c dans 3 mois.");
  const [obsSaved, setObsSaved] = useState(true);
  const [obsLastSaved, setObsLastSaved] = useState("il y a 2 min");

  // Private notes
  const [privateNotes, setPrivateNotes] = useState("Patient anxieux, à rassurer. Compliance médicamenteuse à surveiller.");
  const [showPrivateNotes, setShowPrivateNotes] = useState(false);

  // Tasks
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  // Add forms
  const [showAddAntecedent, setShowAddAntecedent] = useState(false);
  const [addAntForm, setAddAntForm] = useState({ name: "", date: "", details: "" });
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [addTreatForm, setAddTreatForm] = useState({ name: "", dose: "", since: "" });
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [addAllergyForm, setAddAllergyForm] = useState({ name: "", severity: "Modéré", reaction: "" });

  // Document request
  const [showDocRequest, setShowDocRequest] = useState(false);
  const [docRequestType, setDocRequestType] = useState("");
  const [docRequestMessage, setDocRequestMessage] = useState("");

  // Timeline filter
  const [timelineTypeFilter, setTimelineTypeFilter] = useState<string>("all");

  // Local antecedents/treatments/allergies state for inline adds
  const [localAntecedents, setLocalAntecedents] = useState(mockAntecedents);
  const [localTreatments, setLocalTreatments] = useState(mockTreatments);
  const [localAllergies, setLocalAllergies] = useState(mockAllergies);

  // Photo tags
  const [photoTagEdit, setPhotoTagEdit] = useState<number | null>(null);

  const timeline = buildTimeline();
  const filters = ["Tout", "Consultations", "Ordonnances", "Biologie", "Documents"];

  // Section counts
  const sectionCounts: Record<string, number> = {
    historique: timeline.length,
    antecedents: localAntecedents.length + mockFamilyHistory.length + mockSurgeries.length,
    mesures: mockMeasures.length,
    traitements: localTreatments.length,
    vaccins: mockVaccinations.length,
    biologie: mockPatientAnalyses.length,
    documents: mockHealthDocuments.length,
    photos: mockPhotos.length,
    courbes: 3,
  };

  // Obs auto-save
  useEffect(() => {
    setObsSaved(false);
    const timer = setTimeout(() => {
      setObsSaved(true);
      setObsLastSaved("à l'instant");
    }, 1500);
    return () => clearTimeout(timer);
  }, [obsMotif, obsExamen, obsSynthese]);

  const toggleTask = (id: number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = () => {
    if (!newTaskLabel.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), label: newTaskLabel, done: false, priority: "medium" as const }]);
    setNewTaskLabel("");
    setShowAddTask(false);
    toast.success("Tâche ajoutée");
  };
  const removeTask = (id: number) => setTasks(prev => prev.filter(t => t.id !== id));

  // Filtered timeline
  const filteredTimeline = timeline.filter(item => {
    const matchType = timelineTypeFilter === "all" || item.type === timelineTypeFilter;
    const matchSearch = !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase()) || item.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = searchFilter === "Tout" ||
      (searchFilter === "Consultations" && item.type === "consultation") ||
      (searchFilter === "Ordonnances" && item.type === "ordonnance") ||
      (searchFilter === "Biologie" && item.type === "analyse") ||
      (searchFilter === "Documents" && item.type === "document");
    return matchType && matchSearch && matchFilter;
  });

  // ─── DRAWER OVERLAY ──────────────────────────────────────
  const DrawerOverlay = ({ onClose, title, children, wide }: { onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) => (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} bg-card border-l shadow-elevated h-full overflow-y-auto animate-in slide-in-from-right`} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b px-5 py-4 flex items-center justify-between z-10">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );

  // ─── ADD MODAL ───────────────────────────────────────────
  const AddModal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div className="rounded-xl border bg-card shadow-xl p-5 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        {children}
      </div>
    </div>
  );

  // ─── LEFT COLUMN ─────────────────────────────────────────
  const LeftColumn = () => (
    <div className="space-y-4">
      {/* Patient Identity Card */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">AB</div>
          <div className="min-w-0">
            <h2 className="font-bold text-foreground text-sm truncate">{patient.name}</h2>
            <p className="text-xs text-muted-foreground">{patient.age} ans · {patient.gender}</p>
            <p className="text-[10px] text-muted-foreground">Depuis Jan 2022</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="rounded bg-muted/50 px-2 py-1.5"><span className="text-muted-foreground">Groupe</span><p className="font-medium text-foreground">{patient.bloodType}</p></div>
          <div className="rounded bg-primary/5 border border-primary/20 px-2 py-1.5"><span className="text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />Mutuelle</span><p className="font-medium text-foreground text-[11px]">{patient.mutuelle}</p></div>
        </div>

        {/* Allergies */}
        <div className="space-y-1.5 mb-3">
          {localAllergies.map((a, i) => (
            <span key={i} className="flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-full w-fit">
              <AlertTriangle className="h-3 w-3" />{a.name}
              <span className="text-[9px] font-normal ml-0.5">({a.severity})</span>
            </span>
          ))}
          {patient.conditions.map(c => (
            <span key={c} className="block text-[11px] font-medium text-warning bg-warning/10 px-2 py-1 rounded-full w-fit">{c}</span>
          ))}
          <button onClick={() => setShowAddAllergy(true)} className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1">
            <Plus className="h-3 w-3" />Ajouter allergie
          </button>
        </div>

        {/* Contact */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
          <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />71 234 567</p>
          <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />amine@email.tn</p>
          <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />El Manar, Tunis</p>
        </div>

        {/* Last visit summary */}
        <div className="mt-3 rounded-lg bg-primary/5 border border-primary/10 p-2">
          <p className="text-[10px] text-muted-foreground">Dernière consultation</p>
          <p className="text-xs font-medium text-foreground">{mockPatientConsultations[0]?.motif}</p>
          <p className="text-[10px] text-muted-foreground">{mockPatientConsultations[0]?.date}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-3 shadow-card space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Actions rapides</p>
        <Link to="/dashboard/doctor/consultation/new"><Button size="sm" className="w-full text-xs gradient-primary text-primary-foreground shadow-primary-glow justify-start"><Plus className="h-3.5 w-3.5 mr-2" />Nouvelle consultation</Button></Link>
        <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => toast.success("Ordonnance créée en brouillon")}><FileText className="h-3.5 w-3.5 mr-2" />Ordonnance</Button>
        <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => toast.success("Redirection planification RDV...")}><Calendar className="h-3.5 w-3.5 mr-2" />Planifier RDV</Button>
        <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => setDocDrawer("Certificat médical")}><FileCheck className="h-3.5 w-3.5 mr-2" />Certificat</Button>
        <Button variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => toast.success("Ouverture messagerie...")}><MessageSquare className="h-3.5 w-3.5 mr-2" />Message</Button>
        <div className="border-t pt-1.5 mt-1.5">
          <Button variant="ghost" size="sm" className="w-full text-xs justify-start text-primary" onClick={() => setShowDocRequest(true)}>
            <Send className="h-3.5 w-3.5 mr-2" />Demander document
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-xs justify-start" onClick={() => setShowPrivateNotes(true)}>
            <Lock className="h-3.5 w-3.5 mr-2" />Notes privées
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-xs justify-start" onClick={() => toast.success("Impression du dossier complet...")}>
            <Printer className="h-3.5 w-3.5 mr-2" />Imprimer dossier
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border bg-card p-3 shadow-card space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher dans le dossier..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-8 text-xs pl-8" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.map(f => (
            <button key={f} onClick={() => setSearchFilter(f)} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${searchFilter === f ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground border-border"}`}>{f}</button>
          ))}
        </div>
        {searchQuery && (
          <p className="text-[10px] text-muted-foreground">{filteredTimeline.length} résultat(s) trouvé(s)</p>
        )}
      </div>

      {/* Sections Menu */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-3 pt-3 pb-1">Sections du dossier</p>
        {sections.map(s => {
          const Icon = s.icon;
          const count = sectionCounts[s.key];
          return (
            <button key={s.key} onClick={() => setActiveSection(s.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors border-l-2 ${activeSection === s.key ? "bg-primary/5 text-primary border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent"}`}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left">{s.label}</span>
              {count !== undefined && <span className="text-[10px] bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── RIGHT COLUMN ────────────────────────────────────────
  const RightColumn = () => {
    const tasksDone = tasks.filter(t => t.done).length;
    const tasksTotal = tasks.length;
    const taskProgress = tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0;

    return (
      <div className="space-y-4">
        {/* Care Plan */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />Plan de soins</h4>
          <div className="space-y-2">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5">
              <p className="text-[11px] text-primary font-medium">Prochain RDV</p>
              <p className="text-xs font-semibold text-foreground">20 Fév 2026 — 14:30</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Suivi diabète</p>
            </div>
            <div className="rounded-lg bg-accent/5 border border-accent/20 p-2.5">
              <p className="text-[11px] text-accent font-medium">Objectifs thérapeutiques</p>
              <p className="text-[10px] text-foreground mt-1">• HbA1c &lt; 7%</p>
              <p className="text-[10px] text-foreground">• TA &lt; 130/80 mmHg</p>
              <p className="text-[10px] text-foreground">• Poids cible : 72 kg</p>
            </div>
            {mockTreatments.filter(t => t.status === "active").map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-xs rounded bg-muted/50 p-2">
                <Pill className="h-3 w-3 text-primary shrink-0" />
                <div className="min-w-0"><p className="font-medium text-foreground truncate">{t.name}</p><p className="text-muted-foreground text-[10px]">{t.dose}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" />Tâches</h4>
            <span className="text-[10px] text-muted-foreground">{tasksDone}/{tasksTotal}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${taskProgress}%` }} />
          </div>
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-xs group">
                <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} className="h-3.5 w-3.5" />
                <span className={`flex-1 ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.label}</span>
                {t.priority === "high" && !t.done && <span className="h-2 w-2 rounded-full bg-destructive shrink-0" />}
                <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          {showAddTask ? (
            <div className="flex gap-1.5 mt-2">
              <Input placeholder="Nouvelle tâche..." value={newTaskLabel} onChange={e => setNewTaskLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()} className="h-7 text-[11px] flex-1" autoFocus />
              <Button size="sm" className="h-7 text-[10px]" onClick={addTask}>OK</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setShowAddTask(false)}>✕</Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 mt-2 text-primary" onClick={() => setShowAddTask(true)}>
              <Plus className="h-3 w-3 mr-1" />Ajouter tâche
            </Button>
          )}
        </div>

        {/* Documents to generate */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-warning" />Documents à générer</h4>
          <div className="space-y-1.5">
            {docTemplates.map(d => (
              <Button key={d.label} variant="outline" size="sm" className="w-full text-xs justify-start" onClick={() => setDocDrawer(d.label)}>
                <d.icon className="h-3.5 w-3.5 mr-2" />{d.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Active prescriptions summary */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Pill className="h-3.5 w-3.5 text-primary" />Ordonnances actives</h4>
          {mockPatientDetailPrescriptions.filter(p => p.status === "active").map(p => (
            <div key={p.id} className="rounded-lg border p-2.5 mb-2 last:mb-0 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setDrawerItem({ type: "ordonnance", label: `Ordonnance ${p.id}`, date: p.date, detail: p.items.join(", ") })}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-foreground">{p.id}</span>
                <span className="text-[10px] text-muted-foreground">{p.date}</span>
              </div>
              <div className="space-y-0.5">{p.items.map((item, i) => <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-primary shrink-0" />{item}</p>)}</div>
              <div className="flex gap-1.5 mt-2">
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary px-2" onClick={(e) => { e.stopPropagation(); toast.success("Ordonnance dupliquée"); }}><Copy className="h-3 w-3 mr-1" />Dupliquer</Button>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={(e) => { e.stopPropagation(); toast.success("Ordonnance renouvelée"); }}><Bell className="h-3 w-3 mr-1" />Renouveler</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming alerts */}
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3">
          <h4 className="text-xs font-semibold text-warning flex items-center gap-1.5 mb-2"><Bell className="h-3.5 w-3.5" />Rappels</h4>
          <div className="space-y-1.5 text-[11px]">
            <p className="text-foreground flex items-center gap-1.5"><CircleDot className="h-3 w-3 text-destructive" />Bilan HbA1c à prescrire (3 mois)</p>
            <p className="text-foreground flex items-center gap-1.5"><CircleDot className="h-3 w-3 text-warning" />Fond d'oeil annuel — prévoir</p>
            <p className="text-foreground flex items-center gap-1.5"><CircleDot className="h-3 w-3 text-primary" />Vaccin grippe — octobre 2026</p>
          </div>
        </div>
      </div>
    );
  };

  // ─── CENTER CONTENT ──────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      case "historique":
        return (
          <div className="space-y-3">
            {/* Timeline type filters */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "Tous", count: timeline.length },
                { key: "consultation", label: "Consultations", count: timeline.filter(t => t.type === "consultation").length },
                { key: "ordonnance", label: "Ordonnances", count: timeline.filter(t => t.type === "ordonnance").length },
                { key: "analyse", label: "Analyses", count: timeline.filter(t => t.type === "analyse").length },
                { key: "document", label: "Documents", count: timeline.filter(t => t.type === "document").length },
              ].map(f => (
                <button key={f.key} onClick={() => setTimelineTypeFilter(f.key)} className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${timelineTypeFilter === f.key ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border hover:text-foreground"}`}>
                  {f.label}<span className="opacity-70">({f.count})</span>
                </button>
              ))}
            </div>

            <div className="space-y-0 relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              {filteredTimeline.map((item, i) => {
                const config = timelineTypeConfig[item.type];
                const Icon = config.icon;
                return (
                  <button key={i} onClick={() => setDrawerItem(item)} className="relative w-full flex items-start gap-4 pl-8 py-3 text-left hover:bg-muted/30 rounded-lg transition-colors group">
                    <div className={`absolute left-2 top-4 h-5 w-5 rounded-full flex items-center justify-center ${config.color} ring-2 ring-card`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{item.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.color}`}>{config.label}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.detail}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 mt-1 shrink-0" />
                  </button>
                );
              })}
              {filteredTimeline.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs">Aucun élément trouvé</div>
              )}
            </div>
          </div>
        );

      case "antecedents":
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-foreground">Antécédents médicaux</h4>
                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowAddAntecedent(true)}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
              </div>
              <div className="space-y-2">{localAntecedents.map((a, i) => (
                <div key={i} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between"><span className="text-sm font-medium text-foreground">{a.name}</span><span className="text-xs text-muted-foreground">{a.date}</span></div>
                  <p className="text-xs text-muted-foreground mt-1">{a.details}</p>
                </div>
              ))}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Antécédents familiaux</h4>
              <div className="space-y-2">{mockFamilyHistory.map((f, i) => (
                <div key={i} className="rounded-lg border p-3 flex justify-between hover:bg-muted/30 transition-colors"><span className="text-sm text-foreground">{f.name}</span><span className="text-xs text-muted-foreground">{f.details}</span></div>
              ))}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Chirurgies</h4>
              <div className="space-y-2">{mockSurgeries.map((s, i) => (
                <div key={i} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex justify-between"><span className="text-sm font-medium text-foreground">{s.name}</span><span className="text-xs text-muted-foreground">{s.date}</span></div>
                  <p className="text-xs text-muted-foreground mt-1">{s.hospital}</p>
                </div>
              ))}</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-foreground">Allergies & intolérances</h4>
                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowAddAllergy(true)}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
              </div>
              <div className="space-y-2">{localAllergies.map((a, i) => (
                <div key={i} className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-destructive flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />{a.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.severity === "Sévère" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>{a.severity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.reaction}</p>
                </div>
              ))}</div>
            </div>
          </div>
        );

      case "mesures":
        return (
          <div className="space-y-4">
            {/* Current vitals highlight */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Tension", value: `${mockVitalsHistory[0]?.systolic}/${mockVitalsHistory[0]?.diastolic}`, unit: "mmHg", icon: Gauge, warn: (mockVitalsHistory[0]?.systolic || 0) > 140 },
                { label: "FC", value: `${mockVitalsHistory[0]?.heartRate}`, unit: "bpm", icon: Heart, warn: false },
                { label: "Poids", value: `${mockVitalsHistory[0]?.weight}`, unit: "kg", icon: Scale, warn: false },
                { label: "Glycémie", value: `${mockVitalsHistory[0]?.glycemia}`, unit: "g/L", icon: Droplets, warn: (mockVitalsHistory[0]?.glycemia || 0) > 1.26 },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className={`rounded-lg border p-3 text-center ${m.warn ? "border-destructive/30 bg-destructive/5" : ""}`}>
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${m.warn ? "text-destructive" : "text-primary"}`} />
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    <p className={`text-sm font-bold ${m.warn ? "text-destructive" : "text-foreground"}`}>{m.value}</p>
                    <p className="text-[9px] text-muted-foreground">{m.unit}</p>
                  </div>
                );
              })}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="pb-2 text-left text-muted-foreground font-medium">Date</th><th className="pb-2 text-left text-muted-foreground font-medium">TA</th><th className="pb-2 text-left text-muted-foreground font-medium">FC</th><th className="pb-2 text-left text-muted-foreground font-medium">Poids</th><th className="pb-2 text-left text-muted-foreground font-medium">Glycémie</th></tr></thead>
                <tbody>{mockVitalsHistory.map((v, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2 text-muted-foreground">{v.date}</td>
                    <td className={`py-2 font-medium ${v.systolic > 140 ? "text-destructive" : "text-foreground"}`}>{v.systolic}/{v.diastolic}</td>
                    <td className="py-2 text-foreground">{v.heartRate}</td>
                    <td className="py-2 text-foreground">{v.weight} kg</td>
                    <td className={`py-2 font-medium ${v.glycemia > 1.26 ? "text-destructive" : "text-foreground"}`}>{v.glycemia} g/L</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        );

      case "traitements":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{mockTreatments.filter(t => t.status === "active").length} actif(s)</span>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{mockTreatments.filter(t => t.status !== "active").length} arrêté(s)</span>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => setShowAddTreatment(true)}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
            </div>
            {localTreatments.map((t, i) => (
              <div key={i} className={`rounded-lg border p-3 ${t.status === "active" ? "border-primary/20 bg-primary/5" : "opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{t.status === "active" ? "Actif" : "Arrêté"}</span>
                    {t.status === "active" && (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary px-1.5" onClick={() => toast.success("Ordonnance de renouvellement créée")}><Bell className="h-3 w-3" /></Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.dose} · Depuis {t.since} · {t.prescriber}</p>
              </div>
            ))}
          </div>
        );

      case "vaccins":
        return (
          <div className="space-y-2">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-3">
              <p className="text-xs font-semibold text-primary">Calendrier vaccinal</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {mockVaccinations.filter(v => v.nextDate).length} vaccin(s) à programmer · {mockVaccinations.filter(v => !v.nextDate).length} à jour
              </p>
            </div>
            {mockVaccinations.map((v, i) => (
              <div key={i} className={`rounded-lg border p-3 flex items-center justify-between ${v.nextDate ? "border-warning/20" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.doses} · Dernière : {v.lastDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  {v.nextDate ? (
                    <>
                      <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">À faire : {v.nextDate}</span>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => toast.success(`Rappel programmé : ${v.name}`)}><Bell className="h-3 w-3 mr-1" />Rappel</Button>
                    </>
                  ) : (
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"><CheckCircle2 className="h-3 w-3" />À jour</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case "biologie":
        return (
          <div className="space-y-4">
            {/* Alerts block */}
            {mockPatientAnalyses.some(a => a.values.some(v => v.status !== "normal")) && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-semibold text-destructive flex items-center gap-1.5 mb-2"><AlertTriangle className="h-3.5 w-3.5" />Alertes biologiques</p>
                <div className="space-y-1">
                  {mockPatientAnalyses.flatMap(a => a.values.filter(v => v.status !== "normal").map(v => (
                    <p key={v.name} className="text-xs text-foreground flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${v.status === "high" ? "bg-destructive" : "bg-warning"}`} />
                      {v.name}: <span className="font-semibold">{v.value}</span>
                      <span className="text-muted-foreground">(réf: {v.ref})</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${v.status === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                        {v.status === "high" ? "↑ Élevé" : "↓ Bas"}
                      </span>
                    </p>
                  )))}
                </div>
              </div>
            )}
            {mockPatientAnalyses.map(a => (
              <div key={a.id} className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{a.type}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${a.status === "completed" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}>{a.status === "completed" ? "Terminé" : "En cours"}</span>
                    <span className="text-[10px] text-muted-foreground">{a.date}</span>
                  </div>
                </div>
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Paramètre</th><th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Résultat</th><th className="px-3 py-1.5 text-left text-muted-foreground font-medium">Référence</th></tr></thead>
                  <tbody>{a.values.map((v, i) => (
                    <tr key={i} className="border-t hover:bg-muted/20">
                      <td className="px-3 py-1.5 text-foreground">{v.name}</td>
                      <td className={`px-3 py-1.5 font-semibold ${v.status === "high" ? "text-destructive" : v.status === "low" ? "text-warning" : "text-foreground"}`}>
                        {v.status === "high" && "▲ "}{v.status === "low" && "▼ "}{v.value}
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">{v.ref}</td>
                    </tr>
                  ))}</tbody>
                </table>
                <div className="px-3 py-2 bg-muted/10 flex gap-2 border-t">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => toast.success("PDF téléchargé")}><Download className="h-3 w-3 mr-1" />PDF</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => toast.success("Envoyé au patient")}><Send className="h-3 w-3 mr-1" />Envoyer</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => toast.success("Ajouté aux courbes")}><TrendingUp className="h-3 w-3 mr-1" />Courbe</Button>
                </div>
              </div>
            ))}
          </div>
        );

      case "documents":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{mockHealthDocuments.length} document(s)</p>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => toast.success("Zone d'import ouverte")}><Plus className="h-3 w-3 mr-1" />Importer</Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => toast.success("Scan démarré")}><Camera className="h-3 w-3 mr-1" />Scanner</Button>
              </div>
            </div>
            {mockHealthDocuments.map((d, i) => (
              <div key={i} className="rounded-lg border p-3 flex items-center justify-between group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setDrawerItem({ type: "document", label: d.name, date: d.date, detail: `Source : ${d.source}\nTaille : ${d.size}\nType : ${d.type}` })}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.date} · {d.source} · {d.size}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toast.success("Téléchargement..."); }}><Download className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toast.success("Impression..."); }}><Printer className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toast.success("Envoyé au patient"); }}><Send className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        );

      case "photos":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{mockPhotos.length} photo(s)</p>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Photo ajoutée au dossier")}><Camera className="h-3.5 w-3.5 mr-1" />Ajouter photo</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockPhotos.map(p => (
                <div key={p.id} className="rounded-lg border overflow-hidden group cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => setDrawerItem({ type: "photo", ...p })}>
                  <div className="aspect-square bg-muted flex items-center justify-center"><Image className="h-8 w-8 text-muted-foreground/30" /></div>
                  <div className="p-2">
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{p.tag}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">{p.date}</p>
                    <p className="text-[10px] text-foreground truncate">{p.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "courbes":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Cliquez sur un point pour voir les détails</span>
            </div>
            {[
              { key: "poids", label: "Poids (kg)", color: "hsl(205, 85%, 45%)", dataKey: "poids", target: "72 kg", unit: "kg" },
              { key: "glycemie", label: "Glycémie (g/L)", color: "hsl(38, 92%, 50%)", dataKey: "glycemie", target: "< 1.26 g/L", unit: "g/L" },
              { key: "systolic", label: "Tension systolique (mmHg)", color: "hsl(0, 72%, 55%)", dataKey: "systolic", target: "< 140 mmHg", unit: "mmHg" },
            ].map(chart => (
              <div key={chart.key} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-foreground">{chart.label}</p>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Objectif : {chart.target}</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} onClick={(data: any) => { if (data?.activePayload) setChartDrawerPoint(data.activePayload[0]?.payload); }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215, 15%, 50%)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 15%, 50%)" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Line type="monotone" dataKey={chart.dataKey} stroke={chart.color} strokeWidth={2} dot={{ r: 4, cursor: "pointer" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <DashboardLayout role="doctor" title="Dossier patient">
      {/* Mobile menu button */}
      <div className="lg:hidden flex items-center gap-2 mb-4">
        <Link to="/dashboard/doctor/patients"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <Button variant="outline" size="sm" onClick={() => setMobileMenuOpen(true)}><Menu className="h-4 w-4 mr-1" />Menu dossier</Button>
        <span className="text-sm font-semibold text-foreground flex-1 truncate">{patient.name}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success("Impression du dossier...")}><Printer className="h-4 w-4" /></Button>
      </div>

      {/* Mobile drawer for left column */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-80 max-w-[85vw] bg-card h-full overflow-y-auto border-r shadow-elevated animate-in slide-in-from-left p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-foreground text-sm">Dossier patient</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <LeftColumn />
          </div>
        </div>
      )}

      <div className="flex gap-5">
        {/* Left Column — Desktop */}
        <div className="hidden lg:block w-[280px] shrink-0 space-y-4">
          <Link to="/dashboard/doctor/patients"><Button variant="ghost" size="sm" className="text-xs"><ArrowLeft className="h-3.5 w-3.5 mr-1" />Retour patients</Button></Link>
          <LeftColumn />
        </div>

        {/* Center Column */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Observation block */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Observation</h3>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] flex items-center gap-1 ${obsSaved ? "text-accent" : "text-warning"}`}>
                  {obsSaved ? <><CheckCircle2 className="h-3 w-3" />Sauvegardé {obsLastSaved}</> : <><Clock className="h-3 w-3 animate-spin" />Enregistrement...</>}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div><label className="text-[11px] font-medium text-muted-foreground">Motif</label><Input value={obsMotif} onChange={e => setObsMotif(e.target.value)} className="mt-1 h-8 text-xs" /></div>
              <div><label className="text-[11px] font-medium text-muted-foreground">Examen clinique</label><textarea value={obsExamen} onChange={e => setObsExamen(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
              <div><label className="text-[11px] font-medium text-muted-foreground">Synthèse</label><textarea value={obsSynthese} onChange={e => setObsSynthese(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
            </div>
          </div>

          {/* Section title */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{sections.find(s => s.key === activeSection)?.label}</h3>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{sectionCounts[activeSection]} élément(s)</span>
          </div>

          {/* Active section content */}
          {renderSection()}
        </div>

        {/* Right Column — Desktop */}
        <div className="hidden lg:block w-[280px] shrink-0">
          <RightColumn />
        </div>
      </div>

      {/* Right Column — Mobile accordion */}
      <div className="lg:hidden mt-6">
        <button onClick={() => setRightAccordionOpen(!rightAccordionOpen)} className="w-full flex items-center justify-between rounded-xl border bg-card p-3 shadow-card">
          <span className="text-xs font-semibold text-foreground">Plan de soins & Tâches</span>
          {rightAccordionOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {rightAccordionOpen && <div className="mt-3"><RightColumn /></div>}
      </div>

      {/* ─── DRAWERS ──────────────────────────────────────────── */}
      {/* Timeline detail drawer */}
      {drawerItem && drawerItem.type !== "photo" && (
        <DrawerOverlay title={drawerItem.label || "Détail"} onClose={() => setDrawerItem(null)}>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-medium text-foreground capitalize flex items-center gap-2">
                {drawerItem.type}
                {drawerItem.type && timelineTypeConfig[drawerItem.type as keyof typeof timelineTypeConfig] && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${timelineTypeConfig[drawerItem.type as keyof typeof timelineTypeConfig].color}`}>
                    {timelineTypeConfig[drawerItem.type as keyof typeof timelineTypeConfig].label}
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Date</p>
              <p className="text-sm font-medium text-foreground">{drawerItem.date}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Détails</p>
              <p className="text-sm text-foreground whitespace-pre-line">{drawerItem.detail}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Téléchargement...")}><Download className="h-3.5 w-3.5 mr-1" />Télécharger</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Impression...")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Envoyé au patient")}><Send className="h-3.5 w-3.5 mr-1" />Envoyer</Button>
              <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => { toast.success("Ajouté aux favoris"); }}><Bookmark className="h-3.5 w-3.5 mr-1" />Marquer</Button>
            </div>
          </div>
        </DrawerOverlay>
      )}

      {/* Photo drawer */}
      {drawerItem?.type === "photo" && (
        <DrawerOverlay title="Photo" onClose={() => setDrawerItem(null)}>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center"><Image className="h-12 w-12 text-muted-foreground/30" /></div>
            <div className="flex gap-2 items-center">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{drawerItem.tag}</span>
              <span className="text-xs text-muted-foreground">{drawerItem.date}</span>
            </div>
            {drawerItem.note && <p className="text-xs text-foreground">{drawerItem.note}</p>}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Téléchargement...")}><Download className="h-3.5 w-3.5 mr-1" />Télécharger</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Envoyé au patient")}><Send className="h-3.5 w-3.5 mr-1" />Envoyer</Button>
            </div>
          </div>
        </DrawerOverlay>
      )}

      {/* Document template drawer */}
      {docDrawer && (
        <DrawerOverlay title={docDrawer} onClose={() => setDocDrawer(null)}>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-background text-xs text-foreground leading-relaxed whitespace-pre-line">
              {docTemplates.find(d => d.label === docDrawer)?.content(patient.name, patient.age) ||
                `${docDrawer}\n\nPatient : ${patient.name}, ${patient.age} ans\n\nFait à Tunis, le ${new Date().toLocaleDateString("fr-FR")}\n\nDr. Ahmed Bouazizi`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Document généré")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("PDF téléchargé")}><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
              <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => { toast.success("Document envoyé au patient"); setDocDrawer(null); }}><Send className="h-3.5 w-3.5 mr-1" />Envoyer</Button>
            </div>
          </div>
        </DrawerOverlay>
      )}

      {/* Chart point drawer */}
      {chartDrawerPoint && (
        <DrawerOverlay title={`Mesures du ${chartDrawerPoint.date}`} onClose={() => setChartDrawerPoint(null)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">Poids</p><p className="text-sm font-bold text-foreground">{chartDrawerPoint.poids} kg</p></div>
            <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">Glycémie</p><p className={`text-sm font-bold ${chartDrawerPoint.glycemie > 1.26 ? "text-destructive" : "text-foreground"}`}>{chartDrawerPoint.glycemie} g/L</p></div>
            <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">TA Systolique</p><p className={`text-sm font-bold ${chartDrawerPoint.systolic > 140 ? "text-destructive" : "text-foreground"}`}>{chartDrawerPoint.systolic}</p></div>
            <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">TA Diastolique</p><p className="text-sm font-bold text-foreground">{chartDrawerPoint.diastolic}</p></div>
          </div>
        </DrawerOverlay>
      )}

      {/* Private notes drawer */}
      {showPrivateNotes && (
        <DrawerOverlay title="Notes privées" onClose={() => setShowPrivateNotes(false)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 rounded-lg p-3">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Ces notes sont visibles uniquement par vous et ne sont pas partagées avec le patient.</span>
            </div>
            <textarea
              value={privateNotes}
              onChange={e => setPrivateNotes(e.target.value)}
              rows={8}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Notes privées..."
            />
            <Button size="sm" className="text-xs gradient-primary text-primary-foreground" onClick={() => { toast.success("Notes sauvegardées"); setShowPrivateNotes(false); }}>
              <Save className="h-3.5 w-3.5 mr-1" />Enregistrer
            </Button>
          </div>
        </DrawerOverlay>
      )}

      {/* Document request modal */}
      {showDocRequest && (
        <AddModal title="Demander un document au patient" onClose={() => setShowDocRequest(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground">Type de document</label>
              <select
                value={docRequestType}
                onChange={e => setDocRequestType(e.target.value)}
                className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-xs"
              >
                <option value="">Sélectionner...</option>
                <option>Carte d'identité</option>
                <option>Carte mutuelle</option>
                <option>Résultats d'analyses</option>
                <option>Compte-rendu opératoire</option>
                <option>Imagerie médicale</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Message (optionnel)</label>
              <textarea
                value={docRequestMessage}
                onChange={e => setDocRequestMessage(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Précisez votre demande..."
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowDocRequest(false)}>Annuler</Button>
              <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={() => {
                toast.success("Demande envoyée au patient");
                setShowDocRequest(false);
                setDocRequestType("");
                setDocRequestMessage("");
              }}><Send className="h-3.5 w-3.5 mr-1" />Envoyer demande</Button>
            </div>
          </div>
        </AddModal>
      )}

      {/* Add antecedent modal */}
      {showAddAntecedent && (
        <AddModal title="Ajouter un antécédent" onClose={() => setShowAddAntecedent(false)}>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-foreground">Nom</label><Input value={addAntForm.name} onChange={e => setAddAntForm(f => ({ ...f, name: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Ex: Asthme" /></div>
            <div><label className="text-xs font-medium text-foreground">Date</label><Input value={addAntForm.date} onChange={e => setAddAntForm(f => ({ ...f, date: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Ex: 2020" /></div>
            <div><label className="text-xs font-medium text-foreground">Détails</label><Input value={addAntForm.details} onChange={e => setAddAntForm(f => ({ ...f, details: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Détails..." /></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowAddAntecedent(false)}>Annuler</Button>
              <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={() => {
                if (!addAntForm.name) return toast.error("Nom requis");
                setLocalAntecedents(prev => [...prev, { name: addAntForm.name, date: addAntForm.date || "2026", details: addAntForm.details }]);
                setAddAntForm({ name: "", date: "", details: "" });
                setShowAddAntecedent(false);
                toast.success("Antécédent ajouté");
              }}>Ajouter</Button>
            </div>
          </div>
        </AddModal>
      )}

      {/* Add allergy modal */}
      {showAddAllergy && (
        <AddModal title="Ajouter une allergie" onClose={() => setShowAddAllergy(false)}>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-foreground">Nom</label><Input value={addAllergyForm.name} onChange={e => setAddAllergyForm(f => ({ ...f, name: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Ex: Pénicilline" /></div>
            <div>
              <label className="text-xs font-medium text-foreground">Sévérité</label>
              <select value={addAllergyForm.severity} onChange={e => setAddAllergyForm(f => ({ ...f, severity: e.target.value }))} className="mt-1 w-full h-8 rounded-md border bg-background px-3 text-xs">
                <option>Léger</option>
                <option>Modéré</option>
                <option>Sévère</option>
              </select>
            </div>
            <div><label className="text-xs font-medium text-foreground">Réaction</label><Input value={addAllergyForm.reaction} onChange={e => setAddAllergyForm(f => ({ ...f, reaction: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Ex: Urticaire" /></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowAddAllergy(false)}>Annuler</Button>
              <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={() => {
                if (!addAllergyForm.name) return toast.error("Nom requis");
                setLocalAllergies(prev => [...prev, { name: addAllergyForm.name, severity: addAllergyForm.severity, reaction: addAllergyForm.reaction }]);
                setAddAllergyForm({ name: "", severity: "Modéré", reaction: "" });
                setShowAddAllergy(false);
                toast.success("Allergie ajoutée — attention mise à jour du dossier");
              }}>Ajouter</Button>
            </div>
          </div>
        </AddModal>
      )}

      {/* Add treatment modal */}
      {showAddTreatment && (
        <AddModal title="Ajouter un traitement" onClose={() => setShowAddTreatment(false)}>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-foreground">Médicament</label><Input value={addTreatForm.name} onChange={e => setAddTreatForm(f => ({ ...f, name: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Ex: Amlodipine 5mg" /></div>
            <div><label className="text-xs font-medium text-foreground">Posologie</label><Input value={addTreatForm.dose} onChange={e => setAddTreatForm(f => ({ ...f, dose: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Ex: 1 cp/jour" /></div>
            <div><label className="text-xs font-medium text-foreground">Depuis</label><Input value={addTreatForm.since} onChange={e => setAddTreatForm(f => ({ ...f, since: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Ex: Fév 2026" /></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowAddTreatment(false)}>Annuler</Button>
              <Button size="sm" className="flex-1 gradient-primary text-primary-foreground" onClick={() => {
                if (!addTreatForm.name) return toast.error("Nom requis");
                setLocalTreatments(prev => [...prev, { name: addTreatForm.name, dose: addTreatForm.dose, prescriber: "Dr. Ahmed Bouazizi", since: addTreatForm.since || "Fév 2026", status: "active" }]);
                setAddTreatForm({ name: "", dose: "", since: "" });
                setShowAddTreatment(false);
                toast.success("Traitement ajouté");
              }}>Ajouter</Button>
            </div>
          </div>
        </AddModal>
      )}
    </DashboardLayout>
  );
};

export default DoctorPatientDetail;
