import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Phone, AlertTriangle, Activity, Calendar, MessageSquare, FileText, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockPatients } from "@/data/mockData";

type PatientFilter = "all" | "recent" | "chronic" | "new";

const DoctorPatients = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PatientFilter>("all");

  const filtered = mockPatients.filter(p => {
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
              {([
                { key: "all" as PatientFilter, label: "Tous" },
                { key: "recent" as PatientFilter, label: "Récents" },
                { key: "chronic" as PatientFilter, label: "Chroniques" },
                { key: "new" as PatientFilter, label: "Nouveaux" },
              ]).map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-foreground">{mockPatients.length}</p><p className="text-[11px] text-muted-foreground">Total patients</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-primary">{mockPatients.filter(p => p.chronicConditions.length > 0).length}</p><p className="text-[11px] text-muted-foreground">Chroniques</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-accent">{mockPatients.filter(p => p.nextAppointment).length}</p><p className="text-[11px] text-muted-foreground">RDV planifiés</p></div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center"><p className="text-xl font-bold text-warning">{mockPatients.filter(p => p.isNew).length}</p><p className="text-[11px] text-muted-foreground">Nouveaux</p></div>
        </div>

        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all group">
              <div className="flex items-start gap-4">
                <Link to={`/dashboard/doctor/patients/${p.id}`} className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 hover:opacity-80 transition-opacity ${p.isNew ? "bg-warning/10 text-warning border-2 border-warning/30" : "gradient-primary text-primary-foreground"}`}>{p.avatar}</Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/dashboard/doctor/patients/${p.id}`} className="font-semibold text-foreground text-sm hover:text-primary transition-colors">{p.name}</Link>
                        <span className="text-xs text-muted-foreground">{p.age} ans</span>
                        {p.isNew && <span className="text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">Nouveau</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {p.chronicConditions.map(c => <span key={c} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c}</span>)}
                        {p.allergies.map(a => <span key={a.name} className="flex items-center gap-0.5 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"><AlertTriangle className="h-2.5 w-2.5" />{a.name}</span>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link to="/dashboard/doctor/consultation/new"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Consultation"><FileText className="h-4 w-4" /></Button></Link>
                      <Link to="/dashboard/doctor/messages"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Message"><MessageSquare className="h-4 w-4" /></Button></Link>
                      <Link to={`/dashboard/doctor/patients/${p.id}`}><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Voir"><Eye className="h-4 w-4" /></Button></Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                    {p.lastVisit && <span>Dernière visite : {p.lastVisit}</span>}
                    {p.nextAppointment && <span className="flex items-center gap-1 text-accent font-medium"><Calendar className="h-3 w-3" />Prochain : {p.nextAppointment}</span>}
                    {p.lastVitals.ta !== "—" && <span className="flex items-center gap-1"><Activity className="h-3 w-3" />TA {p.lastVitals.ta}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">{filtered.length} patient(s) affiché(s)</p>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;