import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Heart, Activity, FileText, Calendar, Phone, Mail, AlertTriangle, Pill, MessageSquare, Edit, Plus, Clock, Printer, Stethoscope, Shield, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";
import { mockConsultationPatient, mockVitalsHistory, mockPatientConsultations, mockPatientDetailPrescriptions, mockPatientAnalyses } from "@/data/mockData";

type Tab = "summary" | "consultations" | "prescriptions" | "analyses" | "documents";

const DoctorPatientDetail = () => {
  const [tab, setTab] = useState<Tab>("summary");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("Suivi régulier diabète type 2. Bonne observance thérapeutique. Contrôle trimestriel HbA1c. Fond d'oeil annuel à programmer.");
  const tabs = [
    { key: "summary" as Tab, label: "Résumé" }, { key: "consultations" as Tab, label: "Consultations" },
    { key: "prescriptions" as Tab, label: "Ordonnances" }, { key: "analyses" as Tab, label: "Analyses" }, { key: "documents" as Tab, label: "Documents" },
  ];

  const patient = mockConsultationPatient;

  return (
    <DashboardLayout role="doctor" title="Fiche patient">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/doctor/patients"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />Imprimer</Button>
            <Button variant="outline" size="sm"><MessageSquare className="h-4 w-4 mr-1" />Message</Button>
            <Link to="/dashboard/doctor/consultation/new"><Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm"><Plus className="h-4 w-4 mr-1" />Nouvelle consultation</Button></Link>
          </div>
        </div>

        {/* Patient header enhanced */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">AB</div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{patient.name}</h2>
                <p className="text-sm text-muted-foreground">{patient.age} ans · {patient.gender} · Né le 15/03/1991</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {patient.allergies.map(a => <span key={a} className="flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" />{a}</span>)}
                  {patient.conditions.map(c => <span key={c} className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{c}</span>)}
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />71 234 567</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />amine@email.tn</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Tunis</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:w-48 text-sm">
              <div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground text-xs">Groupe sanguin</p><p className="font-medium text-foreground">{patient.bloodType}</p></div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3"><p className="text-xs text-primary font-medium flex items-center gap-1"><Shield className="h-3 w-3" />Mutuelle</p><p className="font-medium text-foreground">{patient.mutuelle}</p></div>
              <div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground text-xs">Patient depuis</p><p className="font-medium text-foreground">Jan 2022</p></div>
              <div className="rounded-lg bg-muted/50 p-3"><p className="text-muted-foreground text-xs">Dernière visite</p><p className="font-medium text-foreground">20 Fév 2026</p></div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
          ))}
        </div>

        {tab === "summary" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-6">
              {/* Vitals history */}
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-primary" />Évolution des constantes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="pb-2 text-left text-muted-foreground font-medium">Date</th><th className="pb-2 text-left text-muted-foreground font-medium">TA</th><th className="pb-2 text-left text-muted-foreground font-medium">FC</th><th className="pb-2 text-left text-muted-foreground font-medium">Poids</th><th className="pb-2 text-left text-muted-foreground font-medium">Glycémie</th></tr></thead>
                    <tbody>{mockVitalsHistory.map((v, i) => <tr key={i} className="border-b last:border-0"><td className="py-2 text-muted-foreground">{v.date}</td><td className="py-2 text-foreground">{v.systolic}/{v.diastolic}</td><td className="py-2 text-foreground">{v.heartRate}</td><td className="py-2 text-foreground">{v.weight} kg</td><td className="py-2 font-medium">{v.glycemia} g/L</td></tr>)}</tbody>
                  </table>
                </div>
              </div>

              {/* Clinical notes */}
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" />Notes cliniques</h3>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditingNotes(!editingNotes)}>
                    <Edit className="h-3.5 w-3.5 mr-1" />{editingNotes ? "Valider" : "Modifier"}
                  </Button>
                </div>
                {editingNotes ? (
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">{notes}</p>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Current treatments */}
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Pill className="h-5 w-5 text-primary" />Traitements en cours</h3>
                <div className="space-y-2">{mockPatientDetailPrescriptions.filter(p => p.status === "active").flatMap(p => p.items).map((item, i) => <div key={i} className="flex items-center gap-2 text-sm rounded-lg bg-muted/50 p-2.5"><Pill className="h-3.5 w-3.5 text-primary shrink-0" /><span className="text-foreground">{item}</span></div>)}</div>
              </div>

              {/* Recent consultations */}
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Dernières consultations</h3>
                <div className="space-y-2">{mockPatientConsultations.slice(0, 3).map((c, i) => <div key={i} className="rounded-lg border p-3"><div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground">{c.motif}</p><span className="text-xs text-muted-foreground">{c.date}</span></div><p className="text-xs text-muted-foreground mt-1">{c.notes}</p></div>)}</div>
              </div>

              {/* Quick actions */}
              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Actions rapides</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/dashboard/doctor/consultation/new"><Button variant="outline" size="sm" className="w-full text-xs"><Stethoscope className="h-3.5 w-3.5 mr-1" />Consultation</Button></Link>
                  <Button variant="outline" size="sm" className="w-full text-xs"><FileText className="h-3.5 w-3.5 mr-1" />Ordonnance</Button>
                  <Button variant="outline" size="sm" className="w-full text-xs"><Calendar className="h-3.5 w-3.5 mr-1" />Planifier RDV</Button>
                  <Button variant="outline" size="sm" className="w-full text-xs"><Printer className="h-3.5 w-3.5 mr-1" />Certificat</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "consultations" && (
          <div className="space-y-4">
            {mockPatientConsultations.map((c, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Activity className="h-5 w-5 text-primary" /></div>
                    <div><h4 className="font-semibold text-foreground">{c.motif}</h4><p className="text-sm text-muted-foreground">{c.date}</p><p className="text-sm text-foreground mt-2">{c.notes}</p>
                      {c.prescriptions > 0 && <span className="text-xs text-primary flex items-center gap-1 mt-2"><FileText className="h-3 w-3" />{c.prescriptions} ordonnance(s)</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "prescriptions" && (
          <div className="space-y-4">
            {mockPatientDetailPrescriptions.map(p => (
              <div key={p.id} className="rounded-xl border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2"><h4 className="font-semibold text-foreground">{p.id}</h4><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{p.status === "active" ? "Active" : "Expirée"}</span></div>
                    <p className="text-sm text-muted-foreground mt-1">{p.date}</p>
                    <div className="mt-2 space-y-1">{p.items.map((item, i) => <p key={i} className="text-sm text-foreground flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{item}</p>)}</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs shrink-0"><Printer className="h-3.5 w-3.5 mr-1" />Imprimer</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "analyses" && (
          <div className="space-y-4">
            {mockPatientAnalyses.map(a => (
              <div key={a.id} className="rounded-xl border bg-card shadow-card">
                <div className="p-5 border-b"><div className="flex items-center gap-2"><h4 className="font-semibold text-foreground">{a.type}</h4><span className="text-sm text-muted-foreground">— {a.date}</span></div></div>
                <div className="p-5"><table className="w-full text-sm"><thead><tr className="text-left"><th className="pb-2 font-medium text-muted-foreground">Paramètre</th><th className="pb-2 font-medium text-muted-foreground">Résultat</th><th className="pb-2 font-medium text-muted-foreground">Référence</th></tr></thead><tbody>{a.values.map((v, i) => <tr key={i} className="border-t"><td className="py-2 text-foreground">{v.name}</td><td className="py-2 font-medium">{v.value}</td><td className="py-2 text-muted-foreground">{v.ref}</td></tr>)}</tbody></table></div>
              </div>
            ))}
          </div>
        )}

        {tab === "documents" && <div className="text-center py-12"><FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Les documents du patient seront affichés ici</p><Button variant="outline" className="mt-3"><Plus className="h-4 w-4 mr-1" />Ajouter un document</Button></div>}
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatientDetail;
