import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, Heart, Thermometer, Activity, FileText, Plus, Save, Send,
  ChevronDown, AlertTriangle, Pill, ArrowLeft, Clock
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
};

const PatientBanner = () => (
  <div className="rounded-xl border bg-card p-4 shadow-card">
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
          MD
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{patient.name}</h2>
          <p className="text-sm text-muted-foreground">{patient.age} ans · {patient.gender} · Groupe {patient.bloodType}</p>
          <div className="flex items-center gap-3 mt-1">
            {patient.allergies.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                <AlertTriangle className="h-3 w-3" />Allergie: {patient.allergies.join(", ")}
              </span>
            )}
            {patient.conditions.map(c => (
              <span key={c} className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right text-sm text-muted-foreground">
        <p>Dernière visite : {patient.lastVisit}</p>
        <p>N° SS : {patient.ssn}</p>
      </div>
    </div>
  </div>
);

const DoctorConsultationDetail = () => {
  const [vitals, setVitals] = useState({
    systolic: "130",
    diastolic: "80",
    heartRate: "72",
    temperature: "37.0",
    weight: "65",
    oxygenSat: "98",
  });
  const [motif, setMotif] = useState("Suivi diabète de type 2");
  const [symptoms, setSymptoms] = useState("Patiente se plaint de fatigue accrue depuis 2 semaines. Pas de douleurs particulières.");
  const [examination, setExamination] = useState("Examen clinique normal. Abdomen souple, pas de masse palpable. Auscultation pulmonaire claire.");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medication: "Metformine 850mg", dosage: "2 fois/jour", duration: "3 mois", instructions: "Pendant les repas" },
  ]);

  const addPrescriptionItem = () => {
    setPrescriptionItems(prev => [...prev, { medication: "", dosage: "", duration: "", instructions: "" }]);
  };

  return (
    <DashboardLayout role="doctor" title="Consultation en cours">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/doctor/consultations">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Consultation en cours — 09:30</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-1" />Brouillon
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
              <Send className="h-4 w-4 mr-1" />Terminer
            </Button>
          </div>
        </div>

        <PatientBanner />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main consultation form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vitals */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />Constantes vitales
              </h3>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Tension (mmHg)</Label>
                  <div className="flex gap-1 mt-1">
                    <Input value={vitals.systolic} onChange={e => setVitals(v => ({ ...v, systolic: e.target.value }))} className="text-center" />
                    <span className="self-center text-muted-foreground">/</span>
                    <Input value={vitals.diastolic} onChange={e => setVitals(v => ({ ...v, diastolic: e.target.value }))} className="text-center" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fréquence cardiaque</Label>
                  <Input value={vitals.heartRate} onChange={e => setVitals(v => ({ ...v, heartRate: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Température (°C)</Label>
                  <Input value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Poids (kg)</Label>
                  <Input value={vitals.weight} onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">SpO2 (%)</Label>
                  <Input value={vitals.oxygenSat} onChange={e => setVitals(v => ({ ...v, oxygenSat: e.target.value }))} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Consultation notes */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />Notes de consultation
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Motif de consultation</Label>
                  <Input value={motif} onChange={e => setMotif(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Symptômes / Anamnèse</Label>
                  <textarea
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <Label>Examen clinique</Label>
                  <textarea
                    value={examination}
                    onChange={e => setExamination(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <Label>Diagnostic</Label>
                  <Input
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="Ex: Diabète type 2 équilibré"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Notes complémentaires</Label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Notes internes, recommandations..."
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Prescription */}
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />Ordonnance
                </h3>
                <Button variant="outline" size="sm" onClick={addPrescriptionItem}>
                  <Plus className="h-4 w-4 mr-1" />Ajouter
                </Button>
              </div>
              <div className="space-y-4">
                {prescriptionItems.map((item, i) => (
                  <div key={i} className="grid gap-3 grid-cols-2 sm:grid-cols-4 rounded-lg border p-3 bg-muted/30">
                    <div>
                      <Label className="text-xs">Médicament</Label>
                      <Input
                        value={item.medication}
                        onChange={e => {
                          const updated = [...prescriptionItems];
                          updated[i].medication = e.target.value;
                          setPrescriptionItems(updated);
                        }}
                        className="mt-1"
                        placeholder="Nom + dosage"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Posologie</Label>
                      <Input
                        value={item.dosage}
                        onChange={e => {
                          const updated = [...prescriptionItems];
                          updated[i].dosage = e.target.value;
                          setPrescriptionItems(updated);
                        }}
                        className="mt-1"
                        placeholder="2x/jour"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Durée</Label>
                      <Input
                        value={item.duration}
                        onChange={e => {
                          const updated = [...prescriptionItems];
                          updated[i].duration = e.target.value;
                          setPrescriptionItems(updated);
                        }}
                        className="mt-1"
                        placeholder="3 mois"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Instructions</Label>
                      <Input
                        value={item.instructions}
                        onChange={e => {
                          const updated = [...prescriptionItems];
                          updated[i].instructions = e.target.value;
                          setPrescriptionItems(updated);
                        }}
                        className="mt-1"
                        placeholder="Pendant repas"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Patient history */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Historique récent</h3>
              <div className="space-y-3">
                {[
                  { date: "10 Fév", motif: "Suivi diabète", notes: "Glycémie stable" },
                  { date: "15 Jan", motif: "Bilan cardiaque", notes: "ECG normal" },
                  { date: "5 Déc", motif: "Dermatologie", notes: "Eczéma atopique" },
                ].map((h, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="text-sm font-medium text-foreground">{h.motif}</p>
                    <p className="text-xs text-muted-foreground">{h.date} — {h.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Traitements en cours</h3>
              <div className="space-y-2">
                {[
                  { name: "Metformine 850mg", dosage: "2x/jour" },
                  { name: "Glibenclamide 5mg", dosage: "1x/jour" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Pill className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground">{t.name}</span>
                    <span className="text-muted-foreground">— {t.dosage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />Prescrire analyse
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <User className="h-4 w-4 mr-2" />Orienter vers spécialiste
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="h-4 w-4 mr-2" />Certificat médical
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
