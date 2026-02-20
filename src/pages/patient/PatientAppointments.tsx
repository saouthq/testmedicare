import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar, Clock, MapPin, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const appointments = [
  { doctor: "Dr. Sophie Martin", specialty: "Médecin généraliste", date: "20 Fév 2026", time: "14:30", address: "12 rue de la Paix, Paris 2e", status: "confirmed" },
  { doctor: "Dr. Pierre Durand", specialty: "Cardiologue", date: "23 Fév 2026", time: "10:00", address: "45 avenue Victor Hugo, Paris 16e", status: "confirmed" },
  { doctor: "Dr. Marie Lefebvre", specialty: "Dermatologue", date: "28 Fév 2026", time: "16:15", address: "8 boulevard Haussmann, Paris 9e", status: "pending" },
  { doctor: "Dr. Thomas Garcia", specialty: "Ophtalmologue", date: "5 Mar 2026", time: "11:00", address: "23 rue du Faubourg, Paris 10e", status: "confirmed" },
];

const pastAppointments = [
  { doctor: "Dr. Sophie Martin", specialty: "Médecin généraliste", date: "10 Fév 2026", time: "09:00", status: "completed" },
  { doctor: "Dr. Julie Bernard", specialty: "Pédiatre", date: "3 Fév 2026", time: "14:00", status: "completed" },
  { doctor: "Dr. Pierre Durand", specialty: "Cardiologue", date: "15 Jan 2026", time: "10:30", status: "cancelled" },
];

const PatientAppointments = () => {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <DashboardLayout role="patient" title="Mes rendez-vous">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            <button
              onClick={() => setTab("upcoming")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "upcoming" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setTab("past")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "past" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Passés
            </button>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau RDV
          </Button>
        </div>

        {tab === "upcoming" ? (
          <div className="space-y-4">
            {appointments.map((a, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{a.doctor}</h3>
                      <p className="text-sm text-primary">{a.specialty}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{a.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.time}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />{a.address}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      a.status === "confirmed" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                    }`}>
                      {a.status === "confirmed" ? "Confirmé" : "En attente"}
                    </span>
                    <Button variant="outline" size="sm">Modifier</Button>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {pastAppointments.map((a, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{a.doctor}</p>
                    <p className="text-sm text-muted-foreground">{a.specialty} · {a.date} à {a.time}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    a.status === "completed" ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"
                  }`}>
                    {a.status === "completed" ? "Terminé" : "Annulé"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;
