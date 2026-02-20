import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar, Clock, FileText, Activity, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Prochain RDV", value: "Aujourd'hui 14h30", icon: Calendar, color: "text-primary" },
  { label: "RDV à venir", value: "3", icon: Clock, color: "text-accent" },
  { label: "Ordonnances", value: "5", icon: FileText, color: "text-warning" },
  { label: "Analyses", value: "2 résultats", icon: Activity, color: "text-destructive" },
];

const upcomingAppointments = [
  { doctor: "Dr. Sophie Martin", specialty: "Médecin généraliste", date: "Aujourd'hui", time: "14:30", status: "confirmed" },
  { doctor: "Dr. Pierre Durand", specialty: "Cardiologue", date: "23 Fév", time: "10:00", status: "confirmed" },
  { doctor: "Dr. Marie Lefebvre", specialty: "Dermatologue", date: "28 Fév", time: "16:15", status: "pending" },
];

const PatientDashboard = () => {
  return (
    <DashboardLayout role="patient" title="Tableau de bord">
      <div className="space-y-6">
        {/* Stats */}
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming appointments */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="font-semibold text-foreground">Prochains rendez-vous</h2>
              <Link to="/dashboard/patient/appointments" className="text-sm text-primary hover:underline flex items-center">
                Voir tout <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y">
              {upcomingAppointments.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{a.doctor.split(" ")[1][0]}{a.doctor.split(" ")[2]?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{a.doctor}</p>
                      <p className="text-sm text-muted-foreground">{a.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{a.date}</p>
                    <p className="text-sm text-muted-foreground">{a.time}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    a.status === "confirmed" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                  }`}>
                    {a.status === "confirmed" ? "Confirmé" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <Link to="/dashboard/patient/search" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Prendre un RDV</p>
                  <p className="text-xs text-muted-foreground">Rechercher un praticien</p>
                </div>
              </Link>
              <Link to="/dashboard/patient/prescriptions" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Mes ordonnances</p>
                  <p className="text-xs text-muted-foreground">Consulter et télécharger</p>
                </div>
              </Link>
              <Link to="/dashboard/patient/profile" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dossier médical</p>
                  <p className="text-xs text-muted-foreground">Historique et documents</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
