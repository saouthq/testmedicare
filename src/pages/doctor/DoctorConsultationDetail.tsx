import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart, Thermometer, Activity, Plus, Save, Send, Trash2,
  AlertTriangle, Pill, ArrowLeft, Stethoscope, Droplets,
  Scale, Gauge, ChevronDown, ChevronUp, Printer, History,
  CheckCircle2, Calendar, X, FileText, Clock
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const patient = {
  name: "Amine Ben Ali", age: 34, gender: "Homme", bloodType: "A+",
  allergies: ["Pénicilline"], conditions: ["Diabète type 2"], lastVisit: "10 Fév 2026",
  ssn: "1 91 03 75 012 035 42", mutuelle: "Assurances Maghrebia", medecinTraitant: "Dr. Ahmed Bouazizi",
};

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
  const [analysePrescription, setAnalysePrescription] = useState<string[]>(["HbA1c", "Glycémie à jeun"]);
  const [elapsed] = useState("12:45");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closed, setClosed] = useState(false);
  const [nextRdv, setNextRdv] = useState("3 mois");
  const [consultAmount, setConsultAmount] = useState("35");

  const addPrescriptionItem = () => setPrescriptionItems(prev => [...prev, { medication: "", dosage: "", duration: "", instructions: "" }]);
  const removePrescriptionItem = (index: number) => setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  const bmi = vitals.weight && vitals.height ? (parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1) : "—";

  const handleClose = () => {
    setClosed(true);
    setShowCloseModal(false);
  };

  if (closed) {
    return (
      <DashboardLayout role="doctor" title="Consultation terminée">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-xl border bg-card p-8 shadow-card text-center">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Consultation clôturée</h2>
            <p className="text-muted-foreground mt-2">La consultation avec {patient.name} a été clôturée avec succès.</p>
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
                <p className="font-medium text-foreground">{prescriptionItems.length} médicament(s)</p>
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

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/dashboard/doctor/consultations")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Retour aux consultations
            </Button>
            <Button variant="outline"><Printer className="h-4 w-4 mr-2" />Imprimer ordonnance</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => navigate("/dashboard/doctor/consultation/new")}>
              <Plus className="h-4 w-4 mr-2" />Nouvelle consultation
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor" title="Consultation en cours">
      <div className="space-y-4">
        {/* Close consultation modal */}
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
                  <p className="text-xs text-muted-foreground mb-1">Ordonnance</p>
                  <div className="space-y-1">
                    {prescriptionItems.filter(p => p.medication).map((p, i) => (
                      <p key={i} className="text-sm text-foreground flex items-center gap-1.5"><Pill className="h-3 w-3 text-primary" />{p.medication} — {p.dosage}</p>
                    ))}
                  </div>
                </div>

                {analysePrescription.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Analyses prescrites</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysePrescription.map(a => <span key={a} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{a}</span>)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Prochain RDV</Label>
                    <select value={nextRdv} onChange={e => setNextRdv(e.target.value)} className="mt-1 w-full h-9 rounded-md border bg-background px-3 text-sm">
                      <option>1 semaine</option><option>2 semaines</option><option>1 mois</option><option>3 mois</option><option>6 mois</option><option>Non nécessaire</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Montant (DT)</Label>
                    <Input value={consultAmount} onChange={e => setConsultAmount(e.target.value)} className="mt-1 h-9" type="number" />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                  <p className="text-xs text-muted-foreground">L'ordonnance et les résultats seront envoyés au patient et à la pharmacie.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <Button variant="outline" className="flex-1" onClick={() => setShowCloseModal(false)}>Annuler</Button>
                <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleClose}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />Confirmer la clôture
                </Button>
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
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowCloseModal(true)}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Clôturer consultation
            </Button>
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
            <Link to="/dashboard/doctor/patients/1"><Button variant="outline" size="sm" className="text-xs"><History className="h-3.5 w-3.5 mr-1" />Historique</Button></Link>
          </div>
        </div>

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
                <div><Label className="text-xs font-medium">Diagnostic</Label><Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs font-medium">Conclusion & conduite à tenir</Label><textarea value={conclusion} onChange={e => setConclusion(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" /></div>
              </div>
            </div>

            {/* Prescription */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground flex items-center gap-2"><Pill className="h-4 w-4 text-warning" />Ordonnance médicamenteuse</h3><Button variant="outline" size="sm" onClick={addPrescriptionItem} className="text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Ajouter médicament</Button></div>
              <div className="space-y-3">
                {prescriptionItems.map((item, i) => (
                  <div key={i} className="rounded-lg border p-4 bg-muted/20 relative group">
                    <button onClick={() => removePrescriptionItem(i)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      <div><Label className="text-[11px] text-muted-foreground">Médicament</Label><Input value={item.medication} onChange={e => { const u = [...prescriptionItems]; u[i].medication = e.target.value; setPrescriptionItems(u); }} className="mt-1 h-9" placeholder="Ex: Metformine 850mg" /></div>
                      <div><Label className="text-[11px] text-muted-foreground">Posologie</Label><Input value={item.dosage} onChange={e => { const u = [...prescriptionItems]; u[i].dosage = e.target.value; setPrescriptionItems(u); }} className="mt-1 h-9" placeholder="Ex: 1 cp matin et soir" /></div>
                      <div><Label className="text-[11px] text-muted-foreground">Durée</Label><Input value={item.duration} onChange={e => { const u = [...prescriptionItems]; u[i].duration = e.target.value; setPrescriptionItems(u); }} className="mt-1 h-9" placeholder="Ex: 3 mois" /></div>
                      <div><Label className="text-[11px] text-muted-foreground">Instructions</Label><Input value={item.instructions} onChange={e => { const u = [...prescriptionItems]; u[i].instructions = e.target.value; setPrescriptionItems(u); }} className="mt-1 h-9" placeholder="Ex: pendant les repas" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyses */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-foreground flex items-center gap-2"><Activity className="h-4 w-4 text-accent" />Prescription d'analyses</h3></div>
              <div className="flex flex-wrap gap-2">
                {["HbA1c", "Glycémie à jeun", "NFS", "Bilan lipidique", "Créatinine", "TSH", "Bilan hépatique", "CRP", "Vitamine D"].map(a => (
                  <button key={a} onClick={() => setAnalysePrescription(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${analysePrescription.includes(a) ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}>
                    {analysePrescription.includes(a) && "✓ "}{a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><History className="h-4 w-4 text-primary" />Historique récent</h3>
              <div className="space-y-3">
                {[
                  { date: "10 Fév", motif: "Suivi diabète", diag: "Glycémie stable" },
                  { date: "15 Jan", motif: "Bilan annuel", diag: "RAS" },
                  { date: "5 Déc", motif: "Dermato", diag: "Eczéma léger" },
                ].map((h, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground">{h.motif}</p>
                      <span className="text-[10px] text-muted-foreground">{h.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{h.diag}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-accent" />Résumé actuel</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Motif</span><span className="font-medium text-foreground text-right max-w-[140px] truncate">{motif}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Médicaments</span><span className="font-medium text-foreground">{prescriptionItems.filter(p => p.medication).length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Analyses</span><span className="font-medium text-foreground">{analysePrescription.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Durée</span><span className="font-medium text-foreground">{elapsed}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConsultationDetail;
