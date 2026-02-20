import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, ChevronRight, Phone, Mail, Plus, Filter, AlertTriangle, Activity, Calendar, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type PatientFilter = "all" | "recent" | "chronic" | "new";

const patients = [
  { name: "Amine Ben Ali", age: 34, lastVisit: "10 Fév 2026", phone: "71 234 567", email: "amine@email.tn", condition: "Diabète type 2", avatar: "AB", nextAppointment: "20 Fév 14:30", isNew: false, chronicConditions: ["Diabète type 2"], allergies: ["Pénicilline"], lastVitals: { ta: "13/8", glycemia: "1.05" } },
  { name: "Fatma Trabelsi", age: 56, lastVisit: "8 Fév 2026", phone: "22 345 678", email: "fatma@email.tn", condition: "Hypertension", avatar: "FT", nextAppointment: "23 Fév 10:00", isNew: false, chronicConditions: ["Hypertension", "Cholestérol"], allergies: [], lastVitals: { ta: "14/8", glycemia: "0.95" } },
  { name: "Mohamed Sfar", age: 28, lastVisit: "5 Fév 2026", phone: "55 456 789", email: "med@email.tn", condition: "Suivi post-op", avatar: "MS", nextAppointment: "25 Fév 09:30", isNew: false, chronicConditions: [], allergies: ["Aspirine"], lastVitals: { ta: "11/7", glycemia: "0.88" } },
  { name: "Nadia Jemni", age: 67, lastVisit: "1 Fév 2026", phone: "98 567 890", email: "nadia@email.tn", condition: "Arthrose", avatar: "NJ", nextAppointment: null, isNew: false, chronicConditions: ["Arthrose", "HTA"], allergies: [], lastVitals: { ta: "15/9", glycemia: "1.10" } },
  { name: "Sami Ayari", age: 42, lastVisit: "28 Jan 2026", phone: "29 678 901", email: "sami@email.tn", condition: "Asthme", avatar: "SA", nextAppointment: null, isNew: false, chronicConditions: ["Asthme"], allergies: ["Acariens"], lastVitals: { ta: "12/7", glycemia: "0.92" } },
  { name: "Rania Meddeb", age: 51, lastVisit: null, phone: "52 789 012", email: "rania@email.tn", condition: "Nouveau patient", avatar: "RM", nextAppointment: "28 Fév 14:00", isNew: true, chronicConditions: [], allergies: [], lastVitals: { ta: "—", glycemia: "—" } },
];

const DoctorPatients = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PatientFilter>("all");

  const filtered = patients.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "recent") return p.lastVisit !== null;
    if (filter === "chronic") return p.chronicConditions.length > 0;
    if (filter === "new") return p.isNew;
    return true;
  });

  return (
    <DashboardLayout role="doctor" title="Mes patients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un patient (nom, prénom)..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" />
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {([ { key: "all" as PatientFilter, label: "Tous" }, { key: "recent" as PatientFilter, label: "Récents" }, { key: "chronic" as PatientFilter, label: "Chroniques" }, { key: "new" as PatientFilter, label: "Nouveaux" } ]).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
              ))}
            </div>
            <Button className="gradient-primary text-primary-foreground" size="sm"><Plus className="h-4 w-4 mr-1" />Nouveau</Button>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-4">
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-foreground">{patients.length}</p><p className="text-[11px] text-muted-foreground">Total patients</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-primary">{patients.filter(p => p.chronicConditions.length > 0).length}</p><p className="text-[11px] text-muted-foreground">Pathologies chroniques</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-accent">{patients.filter(p => p.nextAppointment).length}</p><p className="text-[11px] text-muted-foreground">RDV planifiés</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-warning">{patients.filter(p => p.isNew).length}</p><p className="text-[11px] text-muted-foreground">Nouveaux</p></div>
        </div>

        <div className="space-y-3">
          {filtered.map((p, i) => (
            <Link key={i} to="/dashboard/doctor/patients/1">
              <div className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${p.isNew ? "bg-warning/10 text-warning border-2 border-warning/30" : "gradient-primary text-primary-foreground"}`}>{p.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
                          <span className="text-xs text-muted-foreground">{p.age} ans</span>
                          {p.isNew && <span className="text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">Nouveau</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {p.chronicConditions.map(c => <span key={c} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c}</span>)}
                          {p.allergies.map(a => <span key={a} className="flex items-center gap-0.5 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"><AlertTriangle className="h-2.5 w-2.5" />{a}</span>)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      {p.lastVisit && <span>Dernière visite : {p.lastVisit}</span>}
                      {p.nextAppointment && <span className="flex items-center gap-1 text-accent font-medium"><Calendar className="h-3 w-3" />Prochain : {p.nextAppointment}</span>}
                      {p.lastVitals.ta !== "—" && <span className="flex items-center gap-1"><Activity className="h-3 w-3" />TA {p.lastVitals.ta}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">{filtered.length} patient(s) affiché(s)</p>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;
