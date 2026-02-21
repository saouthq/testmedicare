import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart, Thermometer, Activity, Plus, Save,
  AlertTriangle, Pill, ArrowLeft, Stethoscope, Droplets,
  Scale, Gauge, ChevronDown, ChevronUp, Printer, History,
  CheckCircle2, X, FileText, Calendar, Clock, Trash2, Bot, MessageSquare
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { mockConsultationPatient } from "@/data/mockData";

const DoctorConsultationDetail = () => {
  const navigate = useNavigate();
  const [vitals, setVitals] = useState({ systolic: "130", diastolic: "80", heartRate: "72", temperature: "37.0", weight: "75", oxygenSat: "98", height: "175", respiratoryRate: "16" });
  const [motif, setMotif] = useState("Suivi diabète de type 2");
  const [symptoms, setSymptoms] = useState("Patient se plaint de fatigue accrue depuis 2 semaines. Pas de douleurs particulières. Sommeil perturbé.");
  const [examination, setExamination] = useState("Examen clinique normal. Abdomen souple, pas de masse palpable. Auscultation pulmonaire claire. Pas d'oedème des MI.");
  const [diagnosis, setDiagnosis] = useState("Diabète de type 2 équilibré. Asthénie à surveiller.");
  const [conclusion, setConclusion] = useState("Maintien du traitement actuel. Contrôle HbA1c dans 3 mois. Hygiène de vie : activité physique régulière recommandée.");
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medication: "Metformine 850mg", dosage: "1 comprimé matin et soir", duration: "3 mois", instructions: "Pendant les repas" },
    { medication: "Glibenclamide 5mg", dosage: "1 comprimé le matin", duration: "3 mois", instructions: "Avant le petit déjeuner" },
  ]);
  const [showVitals, setShowVitals] = useState(true);
  const [showPrescription, setShowPrescription] = useState(true);
  const [showAnalyses, setShowAnalyses] = useState(true);
  const [analysePrescription, setAnalysePrescription] = useState<string[]>(["HbA1c", "Glycémie à jeun"]);
  const [newAnalyse, setNewAnalyse] = useState("");
  const [elapsed] = useState("12:45");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closed, setClosed] = useState(false);
  const [nextRdv, setNextRdv] = useState("3 mois");
  const [consultAmount, setConsultAmount] = useState("35");
  const [activeTab, setActiveTab] = useState<"notes" | "history">("notes");

  const patient = mockConsultationPatient;
  const bmi = vitals.weight && vitals.height ? (parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1) : "—";

  const addPrescriptionItem = () => setPrescriptionItems(prev => [...prev, { medication: "", dosage: "", duration: "", instructions: "" }]);
  const removePrescriptionItem = (index: number) => setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  const updatePrescriptionItem = (index: number, field: string, value: string) => {
    setPrescriptionItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addAnalyse = () => {
    if (newAnalyse.trim()) {
      setAnalysePrescription(prev => [...prev, newAnalyse.trim()]);
      setNewAnalyse("");
    }
  };

  const handleClose = () => { setClosed(true); setShowCloseModal(false); };

  // Past consultations for history tab
  const pastConsults = [
    { date: "15 Jan 2026", motif: "Suivi diabète", notes: "HbA1c à 7.1%. Bonne observance. Maintien traitement.", prescriptions: 1 },
    { date: "10 Oct 2025", motif: "Contrôle glycémie", notes: "Glycémie à jeun 1.15g/L. Ajustement posologie Metformine.", prescriptions: 1 },
    { date: "5 Juil 2025", motif: "Bilan annuel", notes: "Bilan complet. Fonction rénale normale. Fond d'œil RAS.", prescriptions: 2 },
  ];

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
              <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Analyses prescrites</p><p className="font-medium text-foreground">{analysePrescription.length} analyse(s)</p></div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4"><p className="text-xs text-primary font-medium">Prochain RDV</p><p className="font-medium text-foreground">{nextRdv}</p></div>
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-4"><p className="text-xs text-accent font-medium">Montant</p><p className="font-bold text-foreground">{consultAmount} DT</p></div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/dashboard/doctor/consultations")}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button>
            <Button variant="outline"><Printer className="h-4 w-4 mr-2" />Imprimer ordonnance</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => navigate("/dashboard/doctor/consultation/new")}><Plus className="h-4 w-4 mr-2" />Nouvelle consultation</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor" title="Consultation en cours">
      <div className="space-y-4">
        {/* Close modal */}
        {showCloseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="rounded-2xl border bg-card shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-foreground mb-1">Clôturer la consultation</h3>
              <p className="text-sm text-muted-foreground mb-5">Vérifiez les informations avant de clôturer.</p>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground mb-1">Diagnostic</p><p className="text-sm font-medium text-foreground">{diagnosis}</p></div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground mb-1">Ordonnance</p>
                  <div className="space-y-1">{prescriptionItems.filter(p => p.medication).map((p, i) => <p key={i} className="text-sm text-foreground flex items-center gap-1.5"><Pill className="h-3 w-3 text-primary" />{p.medication} — {p.dosage}</p>)}</div>
                </div>
                {analysePrescription.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Analyses prescrites</p>
                    <div className="flex flex-wrap gap-1.5">{analysePrescription.map(a => <span key={a} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{a}</span>)}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Prochain RDV</Label><select value={nextRdv} onChange={e => setNextRdv(e.target.value)} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm"><option>1 semaine</option><option>2 semaines</option><option>1 mois</option><option>3 mois</option><option>6 mois</option><option>Non nécessaire</option></select></div>
                  <div><Label className="text-xs">Montant (DT)</Label><Input value={consultAmount} onChange={e => setConsultAmount(e.target.value)} className="mt-1 h-9" type="number" /></div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20"><AlertTriangle className="h-4 w-4 text-warning shrink-0" /><p className="text-xs text-muted-foreground">L'ordonnance et les résultats seront envoyés au patient et à la pharmacie.</p></div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setShowCloseModal(false)}>Annuler</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleClose}><CheckCircle2 className="h-4 w-4 mr-2" />Confirmer la clôture</Button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky header */}
        <div className="flex items-center justify-between flex-wrap gap-3 sticky top-16 z-20 bg-background/80 backdrop-blur-md py-3 -mx-6 px-6 border-b">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/doctor/consultations"><Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1.5"><div className="h-2 w-2 rounded-full bg-primary animate-pulse" /><span className="text-xs font-semibold text-primary">En cours — {elapsed}</span></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs"><Save className="h-3.5 w-3.5 mr-1" />Brouillon</Button>
            <Button variant="outline" size="sm" className="text-xs"><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowCloseModal(true)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Clôturer consultation</Button>
          </div>
        </div>

        {/* Patient card */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">AB</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground">{patient.name}</h2>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{patient.age} ans · {patient.gender}</span>
                  <span className="text-xs bg-primary/10 px-2 py-0.5 rounded text-primary font-medium">Groupe {patient.bloodType}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {patient.allergies.map(a => <span key={a} className="flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" />ALLERGIE: {a}</span>)}
                  {patient.conditions.map(c => <span key={c} className="text-[11px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{c}</span>)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/dashboard/doctor/patients/1"><Button variant="outline" size="sm" className="text-xs"><History className="h-3.5 w-3.5 mr-1" />Dossier</Button></Link>
              <Button variant="outline" size="sm" className="text-xs"><MessageSquare className="h-3.5 w-3.5 mr-1" />Message</Button>
            </div>
          </div>
        </div>

        {/* Tab: Notes / History */}
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
          <button onClick={() => setActiveTab("notes")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === "notes" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Consultation</button>
          <button onClick={() => setActiveTab("history")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === "history" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Historique</button>
        </div>

        {activeTab === "notes" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {/* Vitals */}
              <div className="rounded-xl border bg-card shadow-card overflow-hidden">
                <button onClick={() => setShowVitals(!showVitals)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />Constantes vitales</h3>
                  {showVitals ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showVitals && (
                  <div className="px-4 pb-4">
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                      <div className="rounded-lg border p-3 bg-muted/30"><div className="flex items-center gap-1.5 mb-1.5"><Gauge className="h-3 w-3 text-destructive" /><Label className="text-[11px] text-muted-foreground">Tension</Label></div><div className="flex items-center gap-1"><Input value={vitals.systolic} onChange={e => setVitals(v => ({ ...v, systolic: e.target.value }))} className="text-center h-8 text-sm font-semibold" /><span className="text-muted-foreground font-bold">/</span><Input value={vitals.diastolic} onChange={e => setVitals(v => ({ ...v, diastolic: e.target.value }))} className="text-center h-8 text-sm font-semibold" /></div></div>
                      <div className="rounded-lg border p-3 bg-muted/30"><div className="flex items-center gap-1.5 mb-1.5"><Heart className="h-3 w-3 text-destructive" /><Label className="text-[11px] text-muted-foreground">FC (bpm)</Label></div><Input value={vitals.heartRate} onChange={e => setVitals(v => ({ ...v, heartRate: e.target.value }))} className="h-8 text-sm font-semibold" /></div>
                      <div className="rounded-lg border p-3 bg-muted/30"><div className="flex items-center gap-1.5 mb-1.5"><Thermometer className="h-3 w-3 text-warning" /><Label className="text-[11px] text-muted-foreground">Temp. (°C)</Label></div><Input value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: e.target.value }))} className="h-8 text-sm font-semibold" /></div>
                      <div className="rounded-lg border p-3 bg-muted/30"><div className="flex items-center gap-1.5 mb-1.5"><Droplets className="h-3 w-3 text-primary" /><Label className="text-[11px] text-muted-foreground">SpO2 (%)</Label></div><Input value={vitals.oxygenSat} onChange={e => setVitals(v => ({ ...v, oxygenSat: e.target.value }))} className="h-8 text-sm font-semibold" /></div>
                      <div className="rounded-lg border p-3 bg-muted/30"><div className="flex items-center gap-1.5 mb-1.5"><Scale className="h-3 w-3 text-accent" /><Label className="text-[11px] text-muted-foreground">Poids (kg)</Label></div><Input value={vitals.weight} onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))} className="h-8 text-sm font-semibold" /></div>
                      <div className="rounded-lg border p-3 bg-muted/30"><div className="flex items-center gap-1.5 mb-1.5"><Activity className="h-3 w-3 text-primary" /><Label className="text-[11px] text-muted-foreground">IMC</Label></div><div className="h-8 flex items-center"><span className={`text-sm font-bold ${parseFloat(bmi) > 25 ? "text-warning" : "text-foreground"}`}>{bmi}</span></div></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Notes de consultation</h3>
                <div className="space-y-4">
                  <div><Label className="text-xs font-medium">Motif de consultation</Label><Input value={motif} onChange={e => setMotif(e.target.value)} className="mt-1" /></div>
                  <div><Label className="text-xs font-medium">Anamnèse / Symptômes</Label><textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
                  <div><Label className="text-xs font-medium">Examen clinique</Label><textarea value={examination} onChange={e => setExamination(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
                  <div><Label className="text-xs font-medium">Diagnostic / Conclusion</Label><textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
                  <div><Label className="text-xs font-medium">Conduite à tenir</Label><textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
                </div>
              </div>
            </div>

            {/* Right column: Prescription + Analyses */}
            <div className="space-y-4">
              {/* Prescription */}
              <div className="rounded-xl border bg-card shadow-card overflow-hidden">
                <button onClick={() => setShowPrescription(!showPrescription)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Pill className="h-4 w-4 text-primary" />Ordonnance</h3>
                  {showPrescription ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showPrescription && (
                  <div className="px-4 pb-4 space-y-3">
                    {prescriptionItems.map((item, i) => (
                      <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary">Médicament {i + 1}</span>
                          {prescriptionItems.length > 1 && <button onClick={() => removePrescriptionItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>}
                        </div>
                        <Input placeholder="Médicament" value={item.medication} onChange={e => updatePrescriptionItem(i, "medication", e.target.value)} className="h-8 text-xs" />
                        <Input placeholder="Posologie" value={item.dosage} onChange={e => updatePrescriptionItem(i, "dosage", e.target.value)} className="h-8 text-xs" />
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Durée" value={item.duration} onChange={e => updatePrescriptionItem(i, "duration", e.target.value)} className="h-8 text-xs" />
                          <Input placeholder="Instructions" value={item.instructions} onChange={e => updatePrescriptionItem(i, "instructions", e.target.value)} className="h-8 text-xs" />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={addPrescriptionItem}><Plus className="h-3.5 w-3.5 mr-1" />Ajouter un médicament</Button>
                  </div>
                )}
              </div>

              {/* Analyses */}
              <div className="rounded-xl border bg-card shadow-card overflow-hidden">
                <button onClick={() => setShowAnalyses(!showAnalyses)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Activity className="h-4 w-4 text-accent" />Analyses à prescrire</h3>
                  {showAnalyses ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showAnalyses && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {analysePrescription.map(a => (
                        <span key={a} className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                          {a}
                          <button onClick={() => setAnalysePrescription(prev => prev.filter(x => x !== a))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Ajouter une analyse..." value={newAnalyse} onChange={e => setNewAnalyse(e.target.value)} onKeyDown={e => e.key === "Enter" && addAnalyse()} className="h-8 text-xs flex-1" />
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addAnalyse}><Plus className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-medium">Suggestions</p>
                      <div className="flex flex-wrap gap-1">
                        {["NFS", "CRP", "Créatinine", "Bilan lipidique", "TSH", "Vitamine D"].filter(s => !analysePrescription.includes(s)).map(s => (
                          <button key={s} onClick={() => setAnalysePrescription(prev => [...prev, s])} className="text-[10px] border rounded-full px-2 py-0.5 text-muted-foreground hover:text-primary hover:border-primary transition-colors">{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="rounded-xl border bg-card p-4 shadow-card space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Actions rapides</h4>
                <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Calendar className="h-3.5 w-3.5 mr-2 text-primary" />Planifier prochain RDV</Button>
                <Button variant="outline" size="sm" className="w-full text-xs justify-start"><FileText className="h-3.5 w-3.5 mr-2 text-warning" />Certificat médical</Button>
                <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Bot className="h-3.5 w-3.5 mr-2 text-primary" />Aide IA diagnostic</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm text-muted-foreground">Consultations précédentes de {patient.name}</p>
            {pastConsults.map((c, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Calendar className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h4 className="font-semibold text-foreground">{c.motif}</h4>
                      <p className="text-xs text-muted-foreground">{c.date}</p>
                      <p className="text-sm text-foreground mt-2">{c.notes}</p>
                      {c.prescriptions > 0 && <span className="text-xs text-primary flex items-center gap-1 mt-2"><FileText className="h-3 w-3" />{c.prescriptions} ordonnance(s)</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorConsultationDetail;
