import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { FlaskConical, Search, Plus, Clock, CheckCircle2, AlertCircle, Activity, Shield, User, Eye, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const analyses = [
  { id: "ANA-001", patient: "Amine Ben Ali", type: "Bilan sanguin complet", doctor: "Dr. Bouazizi", date: "20 Fév 2026", status: "in_progress", amount: "85 DT", cnam: true, avatar: "AB" },
  { id: "ANA-002", patient: "Fatma Trabelsi", type: "Analyse d'urine", doctor: "Dr. Gharbi", date: "19 Fév 2026", status: "ready", amount: "35 DT", cnam: true, avatar: "FT" },
  { id: "ANA-003", patient: "Mohamed Sfar", type: "TSH - Thyroïde", doctor: "Dr. Hammami", date: "20 Fév 2026", status: "waiting", amount: "45 DT", cnam: false, avatar: "MS" },
  { id: "ANA-004", patient: "Nadia Jemni", type: "Glycémie à jeun", doctor: "Dr. Bouazizi", date: "18 Fév 2026", status: "ready", amount: "25 DT", cnam: true, avatar: "NJ" },
  { id: "ANA-005", patient: "Sami Ayari", type: "Hémogramme (NFS)", doctor: "Dr. Bouazizi", date: "20 Fév 2026", status: "in_progress", amount: "40 DT", cnam: true, avatar: "SA" },
  { id: "ANA-006", patient: "Rania Meddeb", type: "Bilan lipidique", doctor: "Dr. Bouazizi", date: "17 Fév 2026", status: "ready", amount: "55 DT", cnam: true, avatar: "RM" },
];

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  waiting: { label: "En attente prélèvement", class: "bg-warning/10 text-warning", icon: AlertCircle },
  in_progress: { label: "En cours d'analyse", class: "bg-primary/10 text-primary", icon: Clock },
  ready: { label: "Résultat prêt", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
};

const LaboratoryAnalyses = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = analyses.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.patient.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout role="laboratory" title="Analyses">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {[
                { key: "all", label: "Toutes" },
                { key: "waiting", label: "En attente" },
                { key: "in_progress", label: "En cours" },
                { key: "ready", label: "Prêtes" },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-9 h-9 w-48 text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle analyse
          </Button>
        </div>

        <div className="space-y-4">
          {filtered.map((a) => {
            const config = statusConfig[a.status];
            const Icon = config.icon;
            return (
              <div key={a.id} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${config.class}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{a.id}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.class}`}>{config.label}</span>
                        {a.cnam && (
                          <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            <Shield className="h-3 w-3" />CNAM
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">{a.type}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />{a.patient} · Prescrit par {a.doctor} · {a.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Banknote className="h-4 w-4 text-accent" />{a.amount}
                    </span>
                    {a.status === "ready" && (
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="h-3.5 w-3.5 mr-1" />Résultats
                      </Button>
                    )}
                    {a.status === "waiting" && (
                      <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
                        Enregistrer prélèvement
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryAnalyses;
