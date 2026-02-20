import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const hours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

const appointments: Record<string, { patient: string; type: string }[]> = {
  "Lun-09:00": [{ patient: "Marie Dupont", type: "Consultation" }],
  "Lun-09:30": [{ patient: "Jean Martin", type: "Suivi" }],
  "Lun-10:30": [{ patient: "Claire Petit", type: "Première visite" }],
  "Mar-08:30": [{ patient: "Luc Bernard", type: "Contrôle" }],
  "Mar-10:00": [{ patient: "Sophie Moreau", type: "Consultation" }],
  "Mar-14:00": [{ patient: "Paul Leroy", type: "Suivi" }],
  "Mer-09:00": [{ patient: "Anne Dubois", type: "Consultation" }],
  "Mer-11:00": [{ patient: "Marc Roux", type: "Première visite" }],
  "Jeu-08:00": [{ patient: "Julie Blanc", type: "Contrôle" }],
  "Jeu-14:30": [{ patient: "Pierre Noir", type: "Consultation" }],
  "Ven-09:30": [{ patient: "Emma Vert", type: "Suivi" }],
  "Ven-15:00": [{ patient: "Hugo Gris", type: "Consultation" }],
};

const DoctorSchedule = () => {
  return (
    <DashboardLayout role="doctor" title="Planning">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <h2 className="text-lg font-semibold text-foreground">Semaine du 17 Février 2026</h2>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Bloquer créneau
          </Button>
        </div>

        <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
          <table className="w-full min-w-[700px]">
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
                      <td key={key} className="p-1 h-10">
                        {apt ? (
                          <div className="rounded-md bg-primary/10 border border-primary/20 p-1.5 text-xs cursor-pointer hover:bg-primary/20 transition-colors">
                            <p className="font-medium text-primary truncate">{apt[0].patient}</p>
                            <p className="text-primary/70 truncate">{apt[0].type}</p>
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

export default DoctorSchedule;
