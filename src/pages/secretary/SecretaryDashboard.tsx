import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar, Users, Phone, Clock, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "RDV aujourd'hui", value: "24", icon: Calendar, color: "text-primary" },
  { label: "Patients du jour", value: "18", icon: Users, color: "text-accent" },
  { label: "Appels en attente", value: "5", icon: Phone, color: "text-warning" },
  { label: "Salle d'attente", value: "3", icon: Clock, color: "text-destructive" },
];

const waitingRoom = [
  { patient: "Marie Dupont", arrivedAt: "09:15", appointment: "09:30", doctor: "Dr. Martin" },
  { patient: "Jean Bernard", arrivedAt: "09:20", appointment: "09:45", doctor: "Dr. Lefebvre" },
  { patient: "Claire Moreau", arrivedAt: "09:25", appointment: "10:00", doctor: "Dr. Martin" },
];

const todayAppointments = [
  { time: "09:30", patient: "Marie Dupont", doctor: "Dr. Martin", type: "Consultation", status: "waiting" },
  { time: "09:45", patient: "Jean Bernard", doctor: "Dr. Lefebvre", type: "Suivi", status: "waiting" },
  { time: "10:00", patient: "Claire Moreau", doctor: "Dr. Martin", type: "Contrôle", status: "upcoming" },
  { time: "10:30", patient: "Paul Petit", doctor: "Dr. Durand", type: "Consultation", status: "upcoming" },
  { time: "11:00", patient: "Sophie Leroy", doctor: "Dr. Martin", type: "Première visite", status: "upcoming" },
  { time: "11:30", patient: "Luc Garcia", doctor: "Dr. Lefebvre", type: "Suivi", status: "upcoming" },
];

const SecretaryDashboard = () => {
  return (
    <DashboardLayout role="secretary" title="Tableau de bord">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div />
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau RDV
          </Button>
        </div>

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
          {/* Appointments */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="font-semibold text-foreground">Rendez-vous du jour</h2>
              <a href="/dashboard/secretary/agenda" className="text-sm text-primary hover:underline flex items-center">
                Agenda complet <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
            <div className="divide-y">
              {todayAppointments.map((a, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <div className="w-14 text-center">
                    <p className="text-sm font-medium text-foreground">{a.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{a.patient}</p>
                    <p className="text-sm text-muted-foreground">{a.doctor} · {a.type}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    a.status === "waiting" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                  }`}>
                    {a.status === "waiting" ? "En salle" : "À venir"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Waiting room */}
          <div className="rounded-xl border bg-card shadow-card">
            <div className="border-b p-5">
              <h2 className="font-semibold text-foreground">Salle d'attente</h2>
            </div>
            <div className="divide-y">
              {waitingRoom.map((w, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{w.patient}</p>
                    <span className="text-xs text-muted-foreground">Arrivée {w.arrivedAt}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">RDV {w.appointment} · {w.doctor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryDashboard;
