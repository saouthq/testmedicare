import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar, Users, ClipboardList, TrendingUp, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "RDV aujourd'hui", value: "8", icon: Calendar, color: "text-primary" },
  { label: "Patients total", value: "342", icon: Users, color: "text-accent" },
  { label: "Consultations/mois", value: "124", icon: ClipboardList, color: "text-warning" },
  { label: "Taux d'occupation", value: "87%", icon: TrendingUp, color: "text-destructive" },
];

const todaySchedule = [
  { time: "08:30", patient: "Marie Dupont", type: "Consultation", duration: "30 min", status: "done" },
  { time: "09:00", patient: "Jean Martin", type: "Suivi", duration: "20 min", status: "done" },
  { time: "09:30", patient: "Claire Petit", type: "Première visite", duration: "45 min", status: "current" },
  { time: "10:15", patient: "Luc Bernard", type: "Contrôle", duration: "20 min", status: "upcoming" },
  { time: "10:45", patient: "Sophie Moreau", type: "Consultation", duration: "30 min", status: "upcoming" },
  { time: "14:00", patient: "Paul Leroy", type: "Suivi", duration: "20 min", status: "upcoming" },
];

const DoctorDashboard = () => {
  return (
    <DashboardLayout role="doctor" title="Tableau de bord">
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today schedule */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="font-semibold text-foreground">Planning du jour</h2>
              <Link to="/dashboard/doctor/schedule" className="text-sm text-primary hover:underline flex items-center">
                Planning complet <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y">
              {todaySchedule.map((s, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 ${s.status === "current" ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                  <div className="w-14 text-center">
                    <p className={`text-sm font-medium ${s.status === "current" ? "text-primary" : "text-foreground"}`}>{s.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{s.patient}</p>
                    <p className="text-sm text-muted-foreground">{s.type} · {s.duration}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.status === "done" ? "bg-muted text-muted-foreground" :
                    s.status === "current" ? "bg-primary/10 text-primary" :
                    "bg-accent/10 text-accent"
                  }`}>
                    {s.status === "done" ? "Terminé" : s.status === "current" ? "En cours" : "À venir"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h2 className="font-semibold text-foreground mb-4">Actions rapides</h2>
              <div className="space-y-3">
                <Link to="/dashboard/doctor/consultations" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Nouvelle consultation</span>
                </Link>
                <Link to="/dashboard/doctor/prescriptions" className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-warning" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Rédiger ordonnance</span>
                </Link>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h2 className="font-semibold text-foreground mb-3">Notifications</h2>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-muted-foreground">Nouveau RDV demandé par <span className="text-foreground font-medium">Marie Dupont</span></p>
                </div>
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent mt-1.5 shrink-0" />
                  <p className="text-muted-foreground">Résultats d'analyses reçus pour <span className="text-foreground font-medium">Jean Martin</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
