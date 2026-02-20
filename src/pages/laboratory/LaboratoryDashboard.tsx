import DashboardLayout from "@/components/layout/DashboardLayout";
import { FlaskConical, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";

const stats = [
  { label: "Analyses en cours", value: "28", icon: FlaskConical, color: "text-primary" },
  { label: "Résultats prêts", value: "15", icon: CheckCircle2, color: "text-accent" },
  { label: "En attente prélèvement", value: "7", icon: Clock, color: "text-warning" },
  { label: "Urgences", value: "2", icon: AlertCircle, color: "text-destructive" },
];

const analyses = [
  { patient: "Marie Dupont", type: "Bilan sanguin complet", doctor: "Dr. Martin", status: "in_progress", date: "20 Fév" },
  { patient: "Jean Bernard", type: "Analyse d'urine", doctor: "Dr. Lefebvre", status: "ready", date: "19 Fév" },
  { patient: "Claire Moreau", type: "TSH - Thyroïde", doctor: "Dr. Durand", status: "waiting", date: "20 Fév" },
  { patient: "Paul Petit", type: "Glycémie à jeun", doctor: "Dr. Martin", status: "ready", date: "18 Fév" },
  { patient: "Sophie Leroy", type: "Hémogramme", doctor: "Dr. Garcia", status: "in_progress", date: "20 Fév" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary" },
  ready: { label: "Prêt", class: "bg-accent/10 text-accent" },
  waiting: { label: "En attente", class: "bg-warning/10 text-warning" },
};

const LaboratoryDashboard = () => {
  return (
    <DashboardLayout role="laboratory" title="Tableau de bord">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card shadow-card">
          <div className="flex items-center justify-between border-b p-5">
            <h2 className="font-semibold text-foreground">Analyses récentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-sm font-medium text-muted-foreground">Patient</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Type d'analyse</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Médecin prescripteur</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analyses.map((a, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-medium text-foreground">{a.patient}</td>
                    <td className="p-4 text-sm text-muted-foreground">{a.type}</td>
                    <td className="p-4 text-sm text-muted-foreground">{a.doctor}</td>
                    <td className="p-4 text-sm text-muted-foreground">{a.date}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[a.status].class}`}>
                        {statusConfig[a.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaboratoryDashboard;
