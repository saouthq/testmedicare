import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Heart, Thermometer, Activity, FileText, Plus, Save, Send, Trash2,
  AlertTriangle, Pill, ArrowLeft, Clock, Stethoscope, Eye, Droplets,
  Scale, Gauge, ChevronDown, ChevronUp, Printer, Share2, History
} from "lucide-react";
import { Link } from "react-router-dom";

const patient = {
  name: "Marie Dupont",
  age: 34,
  gender: "Femme",
  bloodType: "A+",
  allergies: ["Pénicilline"],
  conditions: ["Diabète type 2"],
  lastVisit: "10 Fév 2026",
  ssn: "2 85 03 75 ***",
  mutuelle: "MGEN",
  medecinTraitant: "Dr. Sophie Martin",
};

const DoctorConsultationDetail = () => {
  const [vitals, setVitals] = useState({
    systolic: "130", diastolic: "80", heartRate: "72",
    temperature: "37.0", weight: "65", oxygenSat: "98",
    height: "165", respiratoryRate: "16",
  });
  const [motif, setMotif] = useState("Suivi diabète de type 2");
  const [symptoms, setSymptoms] = useState("Patiente se plaint de fatigue accrue depuis 2 semaines. Pas de douleurs particulières. Sommeil perturbé.");
  const [examination, setExamination] = useState("Examen clinique normal. Abdomen souple, pas de masse palpable. Auscultation pulmonaire claire. Pas d'oedème des MI.");
  const [diagnosis, setDiagnosis] = useState("Diabète de type 2 équilibré. Asthénie à surveiller.");
  const [conclusion, setConclusion] = useState("Maintien du traitement actuel. Contrôle HbA1c dans 3 mois. Hygiène de vie : activité physique régulière recommandée.");
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medication: "Metformine 850mg", dosage: "1 comprimé matin et soir", duration: "3 mois", instructions: "Pendant les repas" },
    { medication: "Glibenclamide 5mg", dosage: "1 comprimé le matin", duration: "3 mois", instructions: "Avant le petit déjeuner" },
  ]);
  const [showVitals, setShowVitals] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [analysePrescription, setAnalysePrescription] = useState<string[]>(["HbA1c", "Glycémie à jeun"]);
  const [elapsed, setElapsed] = useState("12:45");

  const addPrescriptionItem = () => {
    setPrescriptionItems(prev => [...prev, { medication: "", dosage: "", duration: "", instructions: "" }]);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  };

  const bmi = vitals.weight && vitals.height 
    ? (parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1) 
    : "—";

  return (
    <DashboardLayout role="doctor" title="Consultation en cours">
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 sticky top-16 z-20 bg-background/80 backdrop-blur-md py-3 -mx-6 px-6 border-b">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/doctor/consultations">
              <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary">En cours — {elapsed}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Save className="h-3.5 w-3.5 mr-1" />Brouillon
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Printer className="h-3.5 w-3.5 mr-1" />Imprimer
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
              <Send className="h-3.5 w-3.5 mr-1" />Clôturer consultation
            </Button>
          </div>
        </div>

        {/* Patient banner */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                MD
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground">{patient.name}</h2>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{patient.age} ans · {patient.gender}</span>
                  <span className="text-xs bg-primary/10 px-2 py-0.5 rounded text-primary font-medium">Groupe {patient.bloodType}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {patient.allergies.map(a => (
                    <span key={a} className="flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="h-3 w-3" />ALLERGIE: {a}
                    </span>
                  ))}
                  {patient.conditions.map(c => (
                    <span key={c} className="text-[11px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/dashboard/doctor/patient/1">
                <Button variant="outline" size="sm" className="text-xs">
                  <History className="h-3.5 w-3.5 mr-1" />Historique
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main consultation form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Vitals */}
            <div className="rounded-xl border bg-card shadow-card overflow-hidden">
              <button 
                onClick={() => setShowVitals(!showVitals)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />Constantes vitales
                </h3>
                {showVitals ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {showVitals && (
                <div className="px-4 pb-4">
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Gauge className="h-3 w-3 text-destructive" />
                        <Label className="text-[11px] text-muted-foreground">Tension (mmHg)</Label>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input value={vitals.systolic} onChange={e => setVitals(v => ({ ...v, systolic: e.target.value }))} className="text-center h-8 text-sm font-semibold" />
                        <span className="text-muted-foreground font-bold">/</span>
                        <Input value={vitals.diastolic} onChange={e => setVitals(v => ({ ...v, diastolic: e.target.value }))} className="text-center h-8 text-sm font-semibold" />
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Heart className="h-3 w-3 text-destructive" />
                        <Label className="text-[11px] text-muted-foreground">FC (bpm)</Label>
                      </div>
                      <Input value={vitals.heartRate} onChange={e => setVitals(v => ({ ...v, heartRate: e.target.value }))} className="h-8 text-sm font-semibold" />
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Thermometer className="h-3 w-3 text-warning" />
                        <Label className="text-[11px] text-muted-foreground">Temp. (°C)</Label>
                      </div>
                      <Input value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: e.target.value }))} className="h-8 text-sm font-semibold" />
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Droplets className="h-3 w-3 text-primary" />
                        <Label className="text-[11px] text-muted-foreground">SpO2 (%)</Label>
                      </div>
                      <Input value={vitals.oxygenSat} onChange={e => setVitals(v => ({ ...v, oxygenSat: e.target.value }))} className="h-8 text-sm font-semibold" />
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Scale className="h-3 w-3 text-accent" />
                        <Label className="text-[11px] text-muted-foreground">Poids (kg)</Label>
                      </div>
                      <Input value={vitals.weight} onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))} className="h-8 text-sm font-semibold" />
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <Label className="text-[11px] text-muted-foreground">Taille (cm)</Label>
                      </div>
                      <Input value={vitals.height} onChange={e => setVitals(v => ({ ...v, height: e.target.value }))} className="h-8 text-sm font-semibold" />
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Activity className="h-3 w-3 text-primary" />
                        <Label className="text-[11px] text-muted-foreground">IMC</Label>
                      </div>
                      <div className="h-8 flex items-center">
                        <span className={`text-sm font-bold ${parseFloat(bmi) > 25 ? "text-warning" : "text-foreground"}`}>{bmi}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border p-3 bg-muted/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Activity className="h-3 w-3 text-accent" />
                        <Label className="text-[11px] text-muted-foreground">FR (c/min)</Label>
                      </div>
                      <Input value={vitals.respiratoryRate} onChange={e => setVitals(v => ({ ...v, respiratoryRate: e.target.value }))} className="h-8 text-sm font-semibold" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Consultation notes */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />Notes de consultation
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium">Motif de consultation</Label>
                  <Input value={motif} onChange={e => setMotif(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Anamnèse / Symptômes</Label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Examen clinique</Label>
                  <textarea value={examination} onChange={e => setExamination(e.target.value)} rows={3}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Diagnostic</Label>
                  <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-medium">Conclusion & conduite à tenir</Label>
                  <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={2}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              </div>
            </div>

            {/* Prescription */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Pill className="h-4 w-4 text-warning" />Ordonnance médicamenteuse
                </h3>
                <Button variant="outline" size="sm" onClick={addPrescriptionItem} className="text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />Ajouter médicament
                </Button>
              </div>
              <div className="space-y-3">
                {prescriptionItems.map((item, i) => (
                  <div key={i} className="rounded-lg border p-4 bg-muted/20 relative group">
                    <button 
                      onClick={() => removePrescriptionItem(i)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <div>
                        <Label className="text-[11px] text-muted-foreground">Médicament + dosage</Label>
                        <Input value={item.medication} onChange={e => { const u = [...prescriptionItems]; u[i].medication = e.target.value; setPrescriptionItems(u); }} className="mt-1 h-9" placeholder="Ex: Metformine 850mg" />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">Posologie</Label>
                        <Input value={item.dosage} onChange={e => { const u = [...prescriptionItems]; u[i].dosage = e.target.value; setPrescriptionItems(u); }} className="mt-1 h-9" placeholder="Ex: 1 cp matin et soir" />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">Durée</Label>
                        <Input value={item.duration} onChange={e => { const u = [...prescriptionItems]; u[i].duration = e.target.value; setPrescriptionItems(u); }} className="mt-1 h-9" placeholder="Ex: 3 mois" />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">Instructions</Label>
                        <Input value={item.instructions} onChange={e => { const u = [...prescriptionItems]; u[i].instructions = e.target.value; setPrescriptionItems(u); }} className="mt-1 h-9" placeholder="Ex: pendant les repas" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyse prescription */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />Prescription d'analyses
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {["HbA1c", "Glycémie à jeun", "NFS", "Bilan lipidique", "Créatinine", "TSH", "Bilan hépatique", "CRP", "Vitamine D"].map(a => (
                  <button
                    key={a}
                    onClick={() => setAnalysePrescription(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      analysePrescription.includes(a)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    {analysePrescription.includes(a) && "✓ "}{a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />Historique récent
              </h3>
              <div className="space-y-2">
                {[
                  { date: "10 Fév", motif: "Suivi diabète", notes: "Glycémie stable 1.05 g/L" },
                  { date: "15 Jan", motif: "Bilan cardiaque", notes: "ECG normal, TA 13/8" },
                  { date: "5 Déc", motif: "Dermatologie", notes: "Eczéma atopique léger" },
                ].map((h, i) => (
                  <div key={i} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{h.motif}</p>
                      <span className="text-[10px] text-muted-foreground">{h.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{h.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Pill className="h-4 w-4 text-warning" />Traitements en cours
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Metformine 850mg", dosage: "2x/jour", since: "Jan 2024" },
                  { name: "Glibenclamide 5mg", dosage: "1x/jour", since: "Mar 2025" },
                ].map((t, i) => (
                  <div key={i} className="rounded-lg bg-warning/5 border border-warning/20 p-3">
                    <div className="flex items-center gap-2">
                      <Pill className="h-3.5 w-3.5 text-warning shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.dosage} · Depuis {t.since}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Documents rapides</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-xs h-9" size="sm">
                  <FileText className="h-3.5 w-3.5 mr-2 text-primary" />Certificat médical
                </Button>
                <Button variant="outline" className="w-full justify-start text-xs h-9" size="sm">
                  <FileText className="h-3.5 w-3.5 mr-2 text-accent" />Arrêt de travail
                </Button>
                <Button variant="outline" className="w-full justify-start text-xs h-9" size="sm">
                  <Share2 className="h-3.5 w-3.5 mr-2 text-warning" />Lettre de liaison
                </Button>
                <Button variant="outline" className="w-full justify-start text-xs h-9" size="sm">
                  <User className="h-3.5 w-3.5 mr-2 text-primary" />Orienter vers spécialiste
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConsultationDetail;
