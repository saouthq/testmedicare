import DashboardLayout from "@/components/layout/DashboardLayout";
import { FlaskConical, Search, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const analyses = [
  { id: "ANA-001", patient: "Marie Dupont", type: "Bilan sanguin complet", doctor: "Dr. Martin", date: "20 Fév 2026", status: "in_progress" },
  { id: "ANA-002", patient: "Jean Bernard", type: "Analyse d'urine", doctor: "Dr. Lefebvre", date: "19 Fév 2026", status: "ready" },
  { id: "ANA-003", patient: "Claire Moreau", type: "TSH - Thyroïde", doctor: "Dr. Durand", date: "20 Fév 2026", status: "waiting" },
  { id: "ANA-004", patient: "Paul Petit", type: "Glycémie à jeun", doctor: "Dr. Martin", date: "18 Fév 2026", status: "ready" },
  { id: "ANA-005", patient: "Sophie Leroy", type: "Hémogramme", doctor: "Dr. Garcia", date: "20 Fév 2026", status: "in_progress" },
  { id: "ANA-006", patient: "Luc Garcia", type: "Bilan lipidique", doctor: "Dr. Martin", date: "17 Fév 2026", status: "ready" },
];

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  waiting: { label: "En attente prélèvement", class: "bg-warning/10 text-warning", icon: AlertCircle },
  in_progress: { label: "En cours d'analyse", class: "bg-primary/10 text-primary", icon: Clock },
  ready: { label: "Résultat prêt", class: "bg-accent/10 text-accent", icon: CheckCircle2 },
};

const LaboratoryAnalyses = () => {
  return (
    <DashboardLayout role="laboratory" title="Analyses">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher une analyse..." className="pl-10" />
          </div>
          <Button className="gradient-primary text-primary-foreground" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle analyse
          </Button>
        </div>

        <div className="space-y-4">
          {analyses.map((a) => {
            const config = statusConfig[a.status];
            const Icon = config.icon;
            return (
              <div key={a.id} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${config.class}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{a.id}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.class}`}>{config.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{a.type}</p>
                      <p className="text-sm text-muted-foreground">Patient: {a.patient} · Prescrit par {a.doctor} · {a.date}</p>
                    </div>
                  </div>
                  {a.status === "ready" && (
                    <Button variant="outline" size="sm">Voir résultats</Button>
                  )}
                  {a.status === "waiting" && (
                    <Button className="gradient-primary text-primary-foreground" size="sm">Enregistrer prélèvement</Button>
                  )}
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
