import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsGrid from "@/components/shared/StatsGrid";
import { mockClinicDoctors, mockClinicAppointments, mockClinicRooms } from "@/data/mocks/clinic";
import { Calendar, Users, DoorOpen, Stethoscope, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const ClinicDashboard = () => {
  const todayAppts = mockClinicAppointments.filter(a => a.date === "2026-03-09");
  const completed = todayAppts.filter(a => a.status === "completed").length;
  const inProgress = todayAppts.filter(a => a.status === "in_progress").length;
  const availableDoctors = mockClinicDoctors.filter(d => d.available).length;
  const availableRooms = mockClinicRooms.filter(r => r.status === "available" && r.type !== "waiting").length;

  const items = [
    { label: "RDV aujourd'hui", value: String(todayAppts.length), icon: Calendar },
    { label: "Terminés", value: String(completed), icon: CheckCircle },
    { label: "Médecins présents", value: `${availableDoctors}/${mockClinicDoctors.length}`, icon: Stethoscope },
    { label: "Salles libres", value: String(availableRooms), icon: DoorOpen },
  ];

  const statusLabel: Record<string, string> = { scheduled: "Planifié", arrived: "Arrivé", in_progress: "En cours", completed: "Terminé", cancelled: "Annulé", no_show: "Absent" };
  const statusVariant = (s: string) => s === "cancelled" || s === "no_show" ? "destructive" as const : s === "completed" ? "outline" as const : s === "in_progress" ? "default" as const : "secondary" as const;

  return (
    <DashboardLayout role="clinic" title="Tableau de bord – Clinique">
      <div className="space-y-6">
        <StatsGrid stats={stats} />

        {/* Today's timeline */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Rendez-vous du jour</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-3">Heure</th><th className="text-left p-3">Patient</th><th className="text-left p-3">Médecin</th><th className="text-left p-3">Spécialité</th><th className="text-left p-3">Salle</th><th className="text-left p-3">Statut</th>
                </tr></thead>
                <tbody>
                  {todayAppts.map(a => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{a.time}</td>
                      <td className="p-3">{a.patientName}</td>
                      <td className="p-3 text-muted-foreground">{a.doctorName}</td>
                      <td className="p-3 text-muted-foreground">{a.specialty}</td>
                      <td className="p-3 text-muted-foreground">{a.room}</td>
                      <td className="p-3"><Badge variant={statusVariant(a.status)} className="text-[10px]">{statusLabel[a.status]}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Doctors availability */}
        <div>
          <h2 className="text-sm font-semibold mb-3">Médecins</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockClinicDoctors.map(d => (
              <Card key={d.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm">{d.name}</h3>
                  <Badge variant={d.available ? "secondary" : "outline"} className="text-[10px]">{d.available ? "Disponible" : "Absent"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{d.specialty}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{d.schedule}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{d.consultationsToday} consultations</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClinicDashboard;
