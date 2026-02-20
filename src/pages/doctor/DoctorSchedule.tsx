import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChevronLeft, ChevronRight, Plus, Video, User, Clock, Calendar as CalendarIcon, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type ViewMode = "week" | "day";

const days = ["Lun 17", "Mar 18", "Mer 19", "Jeu 20", "Ven 21", "Sam 22"];
const hours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

type AppointmentColor = "primary" | "accent" | "warning" | "destructive";

interface Appointment { patient: string; type: string; duration: number; color: AppointmentColor; teleconsultation?: boolean; motif?: string; }

const appointments: Record<string, Appointment> = {
  "Lun 17-09:00": { patient: "Amine Ben Ali", type: "Consultation", duration: 1, color: "primary", motif: "Suivi diabète" },
  "Lun 17-09:30": { patient: "Fatma Trabelsi", type: "Suivi", duration: 1, color: "accent", motif: "Contrôle tension" },
  "Lun 17-10:30": { patient: "Mohamed Sfar", type: "Première visite", duration: 2, color: "warning", motif: "Bilan initial" },
  "Mar 18-08:30": { patient: "Nadia Jemni", type: "Contrôle", duration: 1, color: "accent", motif: "Douleurs articulaires" },
  "Mar 18-10:00": { patient: "Sami Ayari", type: "Téléconsultation", duration: 1, color: "primary", teleconsultation: true, motif: "Renouvellement" },
  "Mar 18-14:00": { patient: "Rania Meddeb", type: "Suivi", duration: 1, color: "accent", motif: "Cholestérol" },
  "Mar 18-15:30": { patient: "Youssef Belhadj", type: "Consultation", duration: 1, color: "primary", motif: "Check-up" },
  "Mer 19-09:00": { patient: "Salma Dridi", type: "Consultation", duration: 1, color: "primary", motif: "Consultation" },
  "Mer 19-11:00": { patient: "Karim Mansour", type: "Première visite", duration: 2, color: "warning", motif: "Bilan" },
  "Jeu 20-08:00": { patient: "Leila Chahed", type: "Contrôle", duration: 1, color: "accent", motif: "Suivi" },
  "Jeu 20-14:30": { patient: "Bilel Nasri", type: "Téléconsultation", duration: 1, color: "primary", teleconsultation: true, motif: "Résultats" },
  "Jeu 20-16:00": { patient: "Olfa Ben Salah", type: "Consultation", duration: 1, color: "primary", motif: "Certificat" },
  "Ven 21-09:30": { patient: "Imen Bouhlel", type: "Suivi", duration: 1, color: "accent", motif: "Suivi grossesse" },
  "Ven 21-15:00": { patient: "Walid Jlassi", type: "Consultation", duration: 1, color: "primary", motif: "Consultation" },
};

const colorMap: Record<AppointmentColor, string> = {
  primary: "bg-primary/10 border-primary/30 text-primary",
  accent: "bg-accent/10 border-accent/30 text-accent",
  warning: "bg-warning/10 border-warning/30 text-warning",
  destructive: "bg-destructive/10 border-destructive/30 text-destructive",
};

const DoctorSchedule = () => {
  const [view, setView] = useState<ViewMode>("week");
  const [selectedDay, setSelectedDay] = useState("Lun 17");
  const displayDays = view === "week" ? days : [selectedDay];

  return (
    <DashboardLayout role="doctor" title="Planning">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="text-center"><h2 className="text-lg font-bold text-foreground">Semaine du 17 Février 2026</h2><p className="text-xs text-muted-foreground">Février 2026</p></div>
            <Button variant="outline" size="icon" className="h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="text-xs ml-2">Aujourd'hui</Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              <button onClick={() => setView("week")} className={`rounded-md p-2 text-xs font-medium transition-colors ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setView("day")} className={`rounded-md p-2 text-xs font-medium transition-colors ${view === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><List className="h-4 w-4" /></button>
            </div>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm"><Plus className="h-4 w-4 mr-1.5" />Bloquer créneau</Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-primary/20 border border-primary/30" /> Consultation</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-accent/20 border border-accent/30" /> Suivi / Contrôle</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-warning/20 border border-warning/30" /> Première visite</div>
          <div className="flex items-center gap-1.5"><Video className="h-3 w-3 text-primary" /> Téléconsultation</div>
        </div>

        {view === "day" && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map(d => (
              <button key={d} onClick={() => setSelectedDay(d)}
                className={`rounded-xl px-4 py-3 text-center min-w-[80px] transition-all ${selectedDay === d ? "gradient-primary text-primary-foreground shadow-primary-glow" : "border bg-card text-foreground hover:border-primary/50"}`}>
                <p className="text-xs font-medium">{d.split(" ")[0]}</p><p className="text-lg font-bold">{d.split(" ")[1]}</p>
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th className="p-3 w-20 text-xs font-medium text-muted-foreground text-left sticky left-0 bg-card">Heure</th>
                {displayDays.map((d) => {
                  const dayAppCount = Object.keys(appointments).filter(k => k.startsWith(d)).length;
                  return <th key={d} className="p-3 text-center"><p className="text-sm font-semibold text-foreground">{d}</p><p className="text-[10px] text-muted-foreground">{dayAppCount} RDV</p></th>;
                })}
              </tr>
            </thead>
            <tbody>
              {hours.map((h) => (
                <tr key={h} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-2 text-xs text-muted-foreground font-medium sticky left-0 bg-card">{h}</td>
                  {displayDays.map((d) => {
                    const key = `${d}-${h}`; const apt = appointments[key];
                    return (
                      <td key={key} className="p-1 h-12">
                        {apt ? (
                          <div className={`rounded-lg border p-2 text-xs cursor-pointer hover:shadow-sm transition-all ${colorMap[apt.color]}`}>
                            <div className="flex items-center gap-1"><p className="font-semibold truncate">{apt.patient}</p>{apt.teleconsultation && <Video className="h-3 w-3 shrink-0" />}</div>
                            <p className="opacity-70 truncate text-[10px]">{apt.motif}</p>
                          </div>
                        ) : (
                          <div className="h-full rounded-lg hover:bg-primary/5 hover:border hover:border-dashed hover:border-primary/30 transition-colors cursor-pointer" />
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
