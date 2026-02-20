import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const days = ["Lun 17", "Mar 18", "Mer 19", "Jeu 20", "Ven 21", "Sam 22"];
const hours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

const appointments: Record<string, { patient: string; doctor: string; type: string }[]> = {
  "Lun 17-09:00": [{ patient: "Marie Dupont", doctor: "Dr. Martin", type: "Consultation" }],
  "Lun 17-10:00": [{ patient: "Jean Bernard", doctor: "Dr. Lefebvre", type: "Suivi" }],
  "Mar 18-08:30": [{ patient: "Claire Moreau", doctor: "Dr. Martin", type: "Contrôle" }],
  "Mar 18-14:00": [{ patient: "Paul Petit", doctor: "Dr. Durand", type: "Première visite" }],
  "Mer 19-09:30": [{ patient: "Sophie Leroy", doctor: "Dr. Martin", type: "Consultation" }],
  "Jeu 20-11:00": [{ patient: "Luc Garcia", doctor: "Dr. Lefebvre", type: "Suivi" }],
  "Ven 21-08:00": [{ patient: "Anne Dubois", doctor: "Dr. Martin", type: "Contrôle" }],
  "Ven 21-15:00": [{ patient: "Marc Roux", doctor: "Dr. Durand", type: "Consultation" }],
};

const SecretaryAgenda = () => {
  return (
    <DashboardLayout role="secretary" title="Agenda">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <h2 className="text-lg font-semibold text-foreground">Semaine du 17 Février 2026</h2>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau RDV
          </Button>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="p-3 w-20 text-sm font-medium text-muted-foreground text-left">Heure</th>
                {days.map((d) => (
                  <th key={d} className="p-3 text-sm font-medium text-muted-foreground text-center">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((h) => (
                <tr key={h} className="border-b last:border-0">
                  <td className="p-2 text-xs text-muted-foreground">{h}</td>
                  {days.map((d) => {
                    const key = `${d}-${h}`;
                    const apt = appointments[key];
                    return (
                      <td key={key} className="p-1 h-12">
                        {apt ? (
                          <div className="rounded-md bg-primary/10 border border-primary/20 p-1.5 text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                            <p className="font-medium text-primary truncate">{apt[0].patient}</p>
                            <p className="text-primary/70 truncate">{apt[0].doctor} · {apt[0].type}</p>
                          </div>
                        ) : (
                          <div className="h-full rounded-md hover:bg-muted/50 transition-colors cursor-pointer" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryAgenda;
