import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Pill, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

const stats = [
  { label: "Ordonnances en attente", value: "12", icon: FileText, color: "text-primary" },
  { label: "Délivrées aujourd'hui", value: "34", icon: CheckCircle2, color: "text-accent" },
  { label: "Ruptures de stock", value: "3", icon: AlertCircle, color: "text-destructive" },
  { label: "Médicaments en stock", value: "1,247", icon: Pill, color: "text-warning" },
];

const pendingPrescriptions = [
  { patient: "Marie Dupont", doctor: "Dr. Martin", date: "20 Fév", items: 3, urgent: false },
  { patient: "Jean Bernard", doctor: "Dr. Lefebvre", date: "20 Fév", items: 1, urgent: true },
  { patient: "Claire Moreau", doctor: "Dr. Durand", date: "19 Fév", items: 5, urgent: false },
  { patient: "Paul Petit", doctor: "Dr. Martin", date: "19 Fév", items: 2, urgent: false },
];

const PharmacyDashboard = () => {
  return (
    <DashboardLayout role="pharmacy" title="Tableau de bord">
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
            <h2 className="font-semibold text-foreground">Ordonnances en attente</h2>
          </div>
          <div className="divide-y">
            {pendingPrescriptions.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{p.patient}</p>
                      {p.urgent && (
                        <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-xs font-medium">Urgent</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Prescrit par {p.doctor} · {p.items} médicament{p.items > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{p.date}</span>
                  <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                    Délivrer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;
