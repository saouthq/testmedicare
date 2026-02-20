import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User, Video, LayoutGrid, List, Filter, Search, Phone, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ViewMode = "week" | "day" | "list";

const doctors = ["Tous", "Dr. Martin", "Dr. Lefebvre", "Dr. Durand"];

const days = ["Lun 17", "Mar 18", "Mer 19", "Jeu 20", "Ven 21", "Sam 22"];
const hours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

type AppointmentColor = "primary" | "accent" | "warning" | "destructive";

interface CalendarAppointment {
  patient: string;
  doctor: string;
  type: string;
  color: AppointmentColor;
  teleconsultation?: boolean;
  phone?: string;
  confirmed?: boolean;
}

const appointments: Record<string, CalendarAppointment> = {
  "Lun 17-09:00": { patient: "Marie Dupont", doctor: "Dr. Martin", type: "Consultation", color: "primary", phone: "06 12 34 56 78", confirmed: true },
  "Lun 17-10:00": { patient: "Jean Bernard", doctor: "Dr. Lefebvre", type: "Suivi", color: "accent", confirmed: true },
  "Lun 17-10:30": { patient: "Claire Petit", doctor: "Dr. Martin", type: "1ère visite", color: "warning", confirmed: false },
  "Mar 18-08:30": { patient: "Claire Moreau", doctor: "Dr. Martin", type: "Contrôle", color: "accent", confirmed: true },
  "Mar 18-14:00": { patient: "Paul Petit", doctor: "Dr. Durand", type: "1ère visite", color: "warning", confirmed: true },
  "Mar 18-15:00": { patient: "Anne Dubois", doctor: "Dr. Martin", type: "Téléconsultation", color: "primary", teleconsultation: true, confirmed: true },
  "Mer 19-09:30": { patient: "Sophie Leroy", doctor: "Dr. Martin", type: "Consultation", color: "primary", confirmed: true },
  "Mer 19-11:00": { patient: "Luc Garcia", doctor: "Dr. Lefebvre", type: "Consultation", color: "primary", confirmed: false },
  "Jeu 20-08:00": { patient: "Hugo Petit", doctor: "Dr. Martin", type: "Contrôle", color: "accent", confirmed: true },
  "Jeu 20-11:00": { patient: "Luc Garcia", doctor: "Dr. Lefebvre", type: "Suivi", color: "accent", confirmed: true },
  "Jeu 20-14:30": { patient: "Emma Laurent", doctor: "Dr. Durand", type: "Téléconsultation", color: "primary", teleconsultation: true, confirmed: true },
  "Ven 21-08:00": { patient: "Anne Dubois", doctor: "Dr. Martin", type: "Contrôle", color: "accent", confirmed: true },
  "Ven 21-15:00": { patient: "Marc Roux", doctor: "Dr. Durand", type: "Consultation", color: "primary", confirmed: true },
  "Sam 22-09:00": { patient: "Julie Blanc", doctor: "Dr. Martin", type: "Urgence", color: "destructive", confirmed: true },
};

const colorMap: Record<AppointmentColor, string> = {
  primary: "bg-primary/10 border-primary/30 text-primary",
  accent: "bg-accent/10 border-accent/30 text-accent",
  warning: "bg-warning/10 border-warning/30 text-warning",
  destructive: "bg-destructive/10 border-destructive/30 text-destructive",
};

const SecretaryAgenda = () => {
  const [view, setView] = useState<ViewMode>("week");
  const [selectedDoctor, setSelectedDoctor] = useState("Tous");
  const [selectedDay, setSelectedDay] = useState("Lun 17");
  const [showNewRdv, setShowNewRdv] = useState(false);

  const displayDays = view === "day" ? [selectedDay] : days;

  const filteredAppointments = Object.entries(appointments).filter(([key, apt]) => {
    if (selectedDoctor !== "Tous" && apt.doctor !== selectedDoctor) return false;
    return true;
  });

  const totalRdv = filteredAppointments.length;
  const confirmedRdv = filteredAppointments.filter(([_, a]) => a.confirmed).length;

  return (
    <DashboardLayout role="secretary" title="Agenda">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-foreground">Semaine du 17 Février 2026</h2>
              <p className="text-xs text-muted-foreground">{totalRdv} RDV · {confirmedRdv} confirmés</p>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="text-xs ml-2">Aujourd'hui</Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Doctor filter */}
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              {doctors.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDoctor(d)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedDoctor === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              <button onClick={() => setView("week")} className={`rounded-md p-2 text-xs ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setView("day")} className={`rounded-md p-2 text-xs ${view === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNewRdv(true)}>
              <Plus className="h-4 w-4 mr-1.5" />Nouveau RDV
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-primary/20 border border-primary/30" /> Consultation</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-accent/20 border border-accent/30" /> Suivi / Contrôle</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-warning/20 border border-warning/30" /> 1ère visite</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-destructive/20 border border-destructive/30" /> Urgence</div>
          <div className="flex items-center gap-1.5"><Video className="h-3 w-3 text-primary" /> Téléconsultation</div>
          <div className="flex items-center gap-1.5 ml-auto"><div className="h-3 w-3 rounded-full border-2 border-accent bg-accent" /> Confirmé</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full border-2 border-warning bg-warning" /> Non confirmé</div>
        </div>

        {/* Day selector */}
        {view === "day" && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map(d => {
              const dayCount = Object.keys(appointments).filter(k => k.startsWith(d)).length;
              return (
                <button 
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`rounded-xl px-4 py-3 text-center min-w-[80px] transition-all ${
                    selectedDay === d ? "gradient-primary text-primary-foreground shadow-primary-glow" : "border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  <p className="text-xs font-medium">{d.split(" ")[0]}</p>
                  <p className="text-lg font-bold">{d.split(" ")[1]}</p>
                  <p className="text-[10px] opacity-70">{dayCount} RDV</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Calendar grid */}
        <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="p-3 w-20 text-xs font-medium text-muted-foreground text-left sticky left-0 bg-card">Heure</th>
                {displayDays.map((d) => {
                  const dayAppCount = filteredAppointments.filter(([k]) => k.startsWith(d)).length;
                  return (
                    <th key={d} className="p-3 text-center">
                      <p className="text-sm font-semibold text-foreground">{d}</p>
                      <p className="text-[10px] text-muted-foreground">{dayAppCount} RDV</p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {hours.map((h) => (
                <tr key={h} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-2 text-xs text-muted-foreground font-medium sticky left-0 bg-card">{h}</td>
                  {displayDays.map((d) => {
                    const key = `${d}-${h}`;
                    const apt = appointments[key];
                    const isFiltered = apt && (selectedDoctor === "Tous" || apt.doctor === selectedDoctor);
                    return (
                      <td key={key} className="p-1 h-12">
                        {apt && isFiltered ? (
                          <div className={`rounded-lg border p-2 text-xs cursor-pointer hover:shadow-sm transition-all ${colorMap[apt.color]}`}>
                            <div className="flex items-center gap-1">
                              <p className="font-semibold truncate">{apt.patient}</p>
                              {apt.teleconsultation && <Video className="h-3 w-3 shrink-0" />}
                              {!apt.confirmed && <div className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />}
                            </div>
                            <p className="opacity-70 truncate text-[10px]">{apt.doctor} · {apt.type}</p>
                          </div>
                        ) : (
                          <div className="h-full rounded-lg hover:bg-primary/5 hover:border hover:border-dashed hover:border-primary/30 transition-colors cursor-pointer" 
                            onClick={() => setShowNewRdv(true)} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* New RDV modal placeholder */}
        {showNewRdv && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNewRdv(false)}>
            <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Nouveau rendez-vous</h3>
                <button onClick={() => setShowNewRdv(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Patient</label>
                  <Input placeholder="Rechercher un patient..." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Date</label>
                    <Input type="date" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Heure</label>
                    <Input type="time" className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Médecin</label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Dr. Martin</option>
                    <option>Dr. Lefebvre</option>
                    <option>Dr. Durand</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Motif</label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Consultation</option>
                    <option>Suivi</option>
                    <option>Contrôle</option>
                    <option>Première visite</option>
                    <option>Téléconsultation</option>
                    <option>Urgence</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <textarea placeholder="Notes..." rows={2} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewRdv(false)}>Annuler</Button>
                  <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => setShowNewRdv(false)}>Créer le RDV</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretaryAgenda;
