import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, Heart, Activity, FileText, Calendar, Phone, Mail, AlertTriangle,
  Pill, MessageSquare, Edit, Plus, Clock, Printer, Stethoscope, Shield, MapPin,
  User, Search, History, Syringe, TestTube, Camera, TrendingUp, ChevronRight,
  Download, Send, X, Eye, CheckCircle2, ChevronDown, ChevronUp, Menu,
  Droplets, Scale, Gauge, Thermometer, FileCheck, ClipboardList, Image
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
  { id: 1, src: "/placeholder.svg", tag: "Dermatologie", date: "10 Fév 2026" },
  { id: 2, src: "/placeholder.svg", tag: "Plaie", date: "5 Jan 2026" },
  { id: 3, src: "/placeholder.svg", tag: "Radio", date: "15 Déc 2025" },
];

// ─── Local mock for tasks ────────────────────────────────────
const initialTasks = [
  { id: 1, label: "Fond d'oeil à programmer", done: false },
  { id: 2, label: "Renouveler ordonnance Metformine", done: false },
  { id: 3, label: "Bilan lipidique à contrôler", done: false },
  { id: 4, label: "Rappel vaccin grippe", done: true },
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
  const items: { date: string; type: "consultation" | "ordonnance" | "analyse" | "document"; label: string; detail: string }[] = [];
  mockPatientConsultations.forEach(c => items.push({ date: c.date, type: "consultation", label: c.motif, detail: c.notes }));
  mockPatientDetailPrescriptions.forEach(p => items.push({ date: p.date, type: "ordonnance", label: `Ordonnance ${p.id}`, detail: p.items.join(", ") }));
  mockPatientAnalyses.forEach(a => items.push({ date: a.date, type: "analyse", label: a.type, detail: a.values.map(v => `${v.name}: ${v.value}`).join(", ") }));
  mockHealthDocuments.forEach(d => items.push({ date: d.date, type: "document", label: d.name, detail: `${d.source} — ${d.size}` }));
  return items;
};

const timelineTypeConfig = {
  consultation: { icon: Stethoscope, color: "bg-primary/10 text-primary", border: "border-primary/30" },
  ordonnance: { icon: Pill, color: "bg-accent/10 text-accent", border: "border-accent/30" },
  analyse: { icon: TestTube, color: "bg-warning/10 text-warning", border: "border-warning/30" },
  document: { icon: FileText, color: "bg-muted text-muted-foreground", border: "border-border" },
};

// ─── Sections menu ───────────────────────────────────────────
const sections: { key: Section; label: string; icon: any }[] = [
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
  { label: "Certificat médical", icon: FileCheck },
  { label: "Lettre d'adressage", icon: Send },
  { label: "Compte-rendu", icon: FileText },
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

  // Tasks
  const [tasks, setTasks] = useState(initialTasks);

  const timeline = buildTimeline();
  const filters = ["Tout", "Consultations", "Ordonnances", "Biologie", "Documents"];

  const toggleTask = (id: number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

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
      {/* Patient Identity Card */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">AB</div>
          <div className="min-w-0">
            <h2 className="font-bold text-foreground text-sm truncate">{patient.name}</h2>
            <p className="text-xs text-muted-foreground">{patient.age} ans · {patient.gender}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="rounded bg-muted/50 px-2 py-1.5"><span className="text-muted-foreground">Groupe</span><p className="font-medium text-foreground">{patient.bloodType}</p></div>
          <div className="rounded bg-primary/5 border border-primary/20 px-2 py-1.5"><span className="text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />Mutuelle</span><p className="font-medium text-foreground text-[11px]">{patient.mutuelle}</p></div>
        </div>
        <div className="space-y-1.5 mb-3">
          {patient.allergies.map(a => (
            <span key={a} className="flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-full w-fit"><AlertTriangle className="h-3 w-3" />{a}</span>
          ))}
          {patient.conditions.map(c => (
            <span key={c} className="block text-[11px] font-medium text-warning bg-warning/10 px-2 py-1 rounded-full w-fit">{c}</span>
          ))}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />71 234 567</p>
          <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />amine@email.tn</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-3 shadow-card space-y-1.5">
        <Link to="/dashboard/doctor/consultation/new"><Button size="sm" className="w-full text-xs gradient-primary text-primary-foreground shadow-primary-glow justify-start"><Plus className="h-3.5 w-3.5 mr-2" />Nouvelle consultation</Button></Link>
        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><FileText className="h-3.5 w-3.5 mr-2" />Ordonnance</Button>
        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Calendar className="h-3.5 w-3.5 mr-2" />Planifier RDV</Button>
        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><FileCheck className="h-3.5 w-3.5 mr-2" />Certificat</Button>
        <Button variant="outline" size="sm" className="w-full text-xs justify-start"><MessageSquare className="h-3.5 w-3.5 mr-2" />Message</Button>
        <Button variant="ghost" size="sm" className="w-full text-xs justify-start text-primary" onClick={() => { toast.success("Demande envoyée au patient"); }}>
          <Send className="h-3.5 w-3.5 mr-2" />Demander document
        </Button>
      </div>

      {/* Search */}
      <div className="rounded-xl border bg-card p-3 shadow-card space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher dans le dossier..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-8 text-xs pl-8" />
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.map(f => (
            <button key={f} onClick={() => setSearchFilter(f)} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${searchFilter === f ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:text-foreground border-border"}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Sections Menu */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setActiveSection(s.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors border-l-2 ${activeSection === s.key ? "bg-primary/5 text-primary border-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent"}`}>
              <Icon className="h-3.5 w-3.5 shrink-0" />{s.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── RIGHT COLUMN ────────────────────────────────────────
  const RightColumn = () => (
    <div className="space-y-4">
      {/* Care Plan */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />Plan de soins</h4>
        <div className="space-y-2">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5">
            <p className="text-[11px] text-primary font-medium">Prochain RDV</p>
            <p className="text-xs font-semibold text-foreground">20 Fév 2026 — 14:30</p>
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
        <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" />Tâches</h4>
        <div className="space-y-2">
          {tasks.map(t => (
            <label key={t.id} className="flex items-center gap-2 text-xs cursor-pointer group">
              <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} className="h-3.5 w-3.5" />
              <span className={`${t.done ? "line-through text-muted-foreground" : "text-foreground"} group-hover:text-primary transition-colors`}>{t.label}</span>
            </label>
          ))}
        </div>
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
          <div key={p.id} className="rounded-lg border p-2.5 mb-2 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-foreground">{p.id}</span>
              <span className="text-[10px] text-muted-foreground">{p.date}</span>
            </div>
            <div className="space-y-0.5">{p.items.map((item, i) => <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-primary shrink-0" />{item}</p>)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── CENTER CONTENT ──────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      case "historique":
        return (
          <div className="space-y-0 relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            {timeline.map((item, i) => {
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
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.color}`}>{item.type}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{item.detail}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 mt-1 shrink-0" />
                </button>
              );
            })}
          </div>
        );

      case "antecedents":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Antécédents médicaux</h4>
              <div className="space-y-2">{mockAntecedents.map((a, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex justify-between"><span className="text-sm font-medium text-foreground">{a.name}</span><span className="text-xs text-muted-foreground">{a.date}</span></div>
                  <p className="text-xs text-muted-foreground mt-1">{a.details}</p>
                </div>
              ))}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Antécédents familiaux</h4>
              <div className="space-y-2">{mockFamilyHistory.map((f, i) => (
                <div key={i} className="rounded-lg border p-3 flex justify-between"><span className="text-sm text-foreground">{f.name}</span><span className="text-xs text-muted-foreground">{f.details}</span></div>
              ))}</div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Chirurgies</h4>
              <div className="space-y-2">{mockSurgeries.map((s, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex justify-between"><span className="text-sm font-medium text-foreground">{s.name}</span><span className="text-xs text-muted-foreground">{s.date}</span></div>
                  <p className="text-xs text-muted-foreground mt-1">{s.hospital}</p>
                </div>
              ))}</div>
            </div>
          </div>
        );

      case "mesures":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mockMeasures.map((m, i) => (
                <div key={i} className="rounded-lg border p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-bold text-foreground">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.date}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="pb-2 text-left text-muted-foreground font-medium">Date</th><th className="pb-2 text-left text-muted-foreground font-medium">TA</th><th className="pb-2 text-left text-muted-foreground font-medium">FC</th><th className="pb-2 text-left text-muted-foreground font-medium">Poids</th><th className="pb-2 text-left text-muted-foreground font-medium">Glycémie</th></tr></thead>
                <tbody>{mockVitalsHistory.map((v, i) => (
                  <tr key={i} className="border-b last:border-0"><td className="py-2 text-muted-foreground">{v.date}</td><td className="py-2 text-foreground">{v.systolic}/{v.diastolic}</td><td className="py-2 text-foreground">{v.heartRate}</td><td className="py-2 text-foreground">{v.weight} kg</td><td className="py-2 font-medium text-foreground">{v.glycemia} g/L</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        );

      case "traitements":
        return (
          <div className="space-y-2">
            {mockTreatments.map((t, i) => (
              <div key={i} className={`rounded-lg border p-3 ${t.status === "active" ? "border-primary/20 bg-primary/5" : "opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{t.status === "active" ? "Actif" : "Arrêté"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t.dose} · Depuis {t.since} · {t.prescriber}</p>
              </div>
            ))}
          </div>
        );

      case "vaccins":
        return (
          <div className="space-y-2">
            {mockVaccinations.map((v, i) => (
              <div key={i} className="rounded-lg border p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.doses} · Dernière : {v.lastDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  {v.nextDate ? (
                    <>
                      <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full">À faire : {v.nextDate}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-primary" onClick={() => toast.success(`Rappel programmé : ${v.name}`)}>Rappel</Button>
                    </>
                  ) : (
                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />À jour</span>
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
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <p className="text-xs font-semibold text-warning flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Alertes biologiques</p>
                <div className="mt-2 space-y-1">
                  {mockPatientAnalyses.flatMap(a => a.values.filter(v => v.status !== "normal").map(v => (
                    <p key={v.name} className="text-xs text-foreground">⚠ {v.name}: <span className="font-semibold">{v.value}</span> <span className="text-muted-foreground">(réf: {v.ref})</span></p>
                  )))}
                </div>
              </div>
            )}
            {mockPatientAnalyses.map(a => (
              <div key={a.id} className="rounded-lg border overflow-hidden">
                <div className="bg-muted/30 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{a.type}</span>
                  <span className="text-[10px] text-muted-foreground">{a.date}</span>
                </div>
                <table className="w-full text-xs">
                  <tbody>{a.values.map((v, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-1.5 text-foreground">{v.name}</td>
                      <td className={`px-3 py-1.5 font-semibold ${v.status === "high" ? "text-destructive" : v.status === "low" ? "text-warning" : "text-foreground"}`}>
                        {v.status === "high" && "▲ "}{v.status === "low" && "▼ "}{v.value}
                      </td>
                      <td className="px-3 py-1.5 text-muted-foreground">{v.ref}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ))}
          </div>
        );

      case "documents":
        return (
          <div className="space-y-2">
            {mockHealthDocuments.map((d, i) => (
              <div key={i} className="rounded-lg border p-3 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.date} · {d.source} · {d.size}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success("Téléchargement...")}><Download className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success("Impression...")}><Printer className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success("Envoi au patient...")}><Send className="h-3.5 w-3.5" /></Button>
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
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Photo ajoutée")}><Camera className="h-3.5 w-3.5 mr-1" />Ajouter photo</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mockPhotos.map(p => (
                <div key={p.id} className="rounded-lg border overflow-hidden group cursor-pointer hover:shadow-card-hover transition-shadow" onClick={() => setDrawerItem({ type: "photo", ...p })}>
                  <div className="aspect-square bg-muted flex items-center justify-center"><Image className="h-8 w-8 text-muted-foreground/30" /></div>
                  <div className="p-2">
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{p.tag}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">{p.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "courbes":
        return (
          <div className="space-y-4">
            {[
              { key: "poids", label: "Poids (kg)", color: "hsl(205, 85%, 45%)", dataKey: "poids" },
              { key: "glycemie", label: "Glycémie (g/L)", color: "hsl(38, 92%, 50%)", dataKey: "glycemie" },
              { key: "systolic", label: "Tension systolique (mmHg)", color: "hsl(0, 72%, 55%)", dataKey: "systolic" },
            ].map(chart => (
              <div key={chart.key} className="rounded-lg border p-4">
                <p className="text-xs font-semibold text-foreground mb-3">{chart.label}</p>
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
        <span className="text-sm font-semibold text-foreground">{patient.name}</span>
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
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Observation</h3>
            <div className="space-y-3">
              <div><label className="text-[11px] font-medium text-muted-foreground">Motif</label><Input value={obsMotif} onChange={e => setObsMotif(e.target.value)} className="mt-1 h-8 text-xs" /></div>
              <div><label className="text-[11px] font-medium text-muted-foreground">Examen clinique</label><textarea value={obsExamen} onChange={e => setObsExamen(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
              <div><label className="text-[11px] font-medium text-muted-foreground">Synthèse</label><textarea value={obsSynthese} onChange={e => setObsSynthese(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
            </div>
          </div>

          {/* Section title */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{sections.find(s => s.key === activeSection)?.label}</h3>
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
      {drawerItem && !drawerItem.type?.startsWith?.("photo") && (
        <DrawerOverlay title={drawerItem.label || "Détail"} onClose={() => setDrawerItem(null)}>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-medium text-foreground capitalize">{drawerItem.type}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Date</p>
              <p className="text-sm font-medium text-foreground">{drawerItem.date}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Détails</p>
              <p className="text-sm text-foreground">{drawerItem.detail}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Téléchargement...")}><Download className="h-3.5 w-3.5 mr-1" />Télécharger</Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Impression...")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
            </div>
          </div>
        </DrawerOverlay>
      )}

      {/* Photo drawer */}
      {drawerItem?.type === "photo" && (
        <DrawerOverlay title="Photo" onClose={() => setDrawerItem(null)}>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center"><Image className="h-12 w-12 text-muted-foreground/30" /></div>
            <div className="flex gap-2"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{drawerItem.tag}</span><span className="text-xs text-muted-foreground">{drawerItem.date}</span></div>
          </div>
        </DrawerOverlay>
      )}

      {/* Document template drawer */}
      {docDrawer && (
        <DrawerOverlay title={docDrawer} onClose={() => setDocDrawer(null)}>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/30 text-xs text-foreground leading-relaxed">
              <p className="font-semibold mb-2">{docDrawer}</p>
              <p>Je soussigné(e) Dr. Ahmed Bouazizi, certifie avoir examiné ce jour M. {patient.name}, âgé de {patient.age} ans.</p>
              <p className="mt-2">Fait à Tunis, le {new Date().toLocaleDateString("fr-FR")}</p>
              <p className="mt-4 text-muted-foreground italic">— Aperçu du document —</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success("Document généré")}><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
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
            <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">Glycémie</p><p className="text-sm font-bold text-foreground">{chartDrawerPoint.glycemie} g/L</p></div>
            <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">TA Systolique</p><p className="text-sm font-bold text-foreground">{chartDrawerPoint.systolic}</p></div>
            <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-[10px] text-muted-foreground">TA Diastolique</p><p className="text-sm font-bold text-foreground">{chartDrawerPoint.diastolic}</p></div>
          </div>
        </DrawerOverlay>
      )}
    </DashboardLayout>
  );
};

export default DoctorPatientDetail;