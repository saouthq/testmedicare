import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { ClipboardList, Plus, User, Calendar, FileText, Shield, Eye, ChevronDown, Video, Send, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type ConsultFilter = "today" | "week" | "all";

const initialConsultations = [
  { id: 1, patient: "Amine Ben Ali", date: "20 Fév 2026", time: "09:30", motif: "Suivi diabète", notes: "Glycémie stable, renouvellement traitement", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "AB", status: "completed" },
  { id: 2, patient: "Fatma Trabelsi", date: "20 Fév 2026", time: "09:00", motif: "Contrôle tension", notes: "TA 14/8, ajustement posologie", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "FT", status: "completed" },
  { id: 3, patient: "Mohamed Sfar", date: "18 Fév 2026", time: "14:00", motif: "Suivi post-opératoire", notes: "Cicatrisation normale, retrait fils J+15", prescriptions: 0, cnam: false, amount: "50 DT", avatar: "MS", status: "completed" },
  { id: 4, patient: "Nadia Jemni", date: "17 Fév 2026", time: "10:30", motif: "Douleurs articulaires", notes: "Prescription anti-inflammatoires", prescriptions: 2, cnam: true, amount: "35 DT", avatar: "NJ", status: "completed" },
  { id: 5, patient: "Sami Ayari", date: "15 Fév 2026", time: "11:00", motif: "Renouvellement ordonnance", notes: "Ventoline + Seretide renouvelés pour 3 mois", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "SA", status: "completed" },
];

const DoctorConsultations = () => {
  const [filter, setFilter] = useState<ConsultFilter>("today");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [consultations] = useState(initialConsultations);

  const filtered = consultations.filter(c => {
    if (filter === "today") return c.date === "20 Fév 2026";
    if (filter === "week") return ["20 Fév 2026", "18 Fév 2026", "17 Fév 2026"].includes(c.date);
    return true;
  });

  const todayTotal = consultations.filter(c => c.date === "20 Fév 2026").reduce((sum, c) => sum + parseInt(c.amount), 0);

  return (
    <DashboardLayout role="doctor" title="Consultations">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
            {[{ key: "today" as ConsultFilter, label: "Aujourd'hui" }, { key: "week" as ConsultFilter, label: "Cette semaine" }, { key: "all" as ConsultFilter, label: "Tout" }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {filter === "today" && <span className="text-sm font-semibold text-foreground bg-accent/10 text-accent px-3 py-1.5 rounded-lg">CA jour : {todayTotal} DT</span>}
            <Link to="/dashboard/doctor/consultation/new">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm"><Plus className="h-4 w-4 mr-2" />Nouvelle consultation</Button>
            </Link>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Aucune consultation pour cette période</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all overflow-hidden">
              <div className="p-5 cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to="/dashboard/doctor/patients/1" onClick={e => e.stopPropagation()} className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">{c.avatar}</Link>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to="/dashboard/doctor/patients/1" onClick={e => e.stopPropagation()} className="font-semibold text-foreground hover:text-primary transition-colors">{c.patient}</Link>
                        {c.cnam && <span className="flex items-center gap-1 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium"><Shield className="h-3 w-3" />CNAM</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.date} à {c.time} · {c.motif}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">{c.amount}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === c.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>
              {expandedId === c.id && (
                <div className="border-t px-5 py-4 bg-muted/10 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes de consultation</p>
                    <p className="text-sm text-foreground">{c.notes}</p>
                  </div>
                  {c.prescriptions > 0 && (
                    <div className="flex items-center gap-1 text-sm text-primary"><FileText className="h-3.5 w-3.5" /><span>{c.prescriptions} ordonnance{c.prescriptions > 1 ? "s" : ""} générée{c.prescriptions > 1 ? "s" : ""}</span></div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Link to="/dashboard/doctor/patients/1"><Button variant="outline" size="sm" className="text-xs"><Eye className="h-3.5 w-3.5 mr-1" />Voir le patient</Button></Link>
                    <Button variant="outline" size="sm" className="text-xs"><Printer className="h-3.5 w-3.5 mr-1" />Imprimer CR</Button>
                    {c.prescriptions > 0 && <Button variant="outline" size="sm" className="text-xs"><Send className="h-3.5 w-3.5 mr-1" />Envoyer ordonnance</Button>}
                    <Link to="/dashboard/doctor/consultation/new"><Button variant="outline" size="sm" className="text-xs"><ClipboardList className="h-3.5 w-3.5 mr-1" />Nouvelle consultation</Button></Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">{filtered.length} consultation(s) affichée(s)</p>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConsultations;
