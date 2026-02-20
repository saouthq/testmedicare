import DashboardLayout from "@/components/layout/DashboardLayout";
import { ChevronLeft, ChevronRight, Plus, Video, User, Clock, Calendar as CalendarIcon, LayoutGrid, List, X, CheckCircle2, Repeat, Ban, Play, AlertTriangle, Phone, MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/shared/StatusBadge";
import UpgradeBanner from "@/components/shared/UpgradeBanner";

type ViewMode = "week" | "day";
type ModalType = null | "availability" | "block" | "appointment-action" | "empty-slot" | "create-rdv";

const days = ["Lun 17", "Mar 18", "Mer 19", "Jeu 20", "Ven 21", "Sam 22"];
const hours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

type AppointmentColor = "primary" | "accent" | "warning" | "destructive";

interface Appointment {
  patient: string; type: string; duration: number; color: AppointmentColor;
  teleconsultation?: boolean; motif?: string; status?: string; phone?: string;
}

const initialAppointments: Record<string, Appointment> = {
  "Lun 17-09:00": { patient: "Amine Ben Ali", type: "Consultation", duration: 1, color: "primary", motif: "Suivi diabète", status: "confirmed", phone: "+216 55 123 456" },
  "Lun 17-09:30": { patient: "Fatma Trabelsi", type: "Suivi", duration: 1, color: "accent", motif: "Contrôle tension", status: "confirmed" },
  "Lun 17-10:30": { patient: "Mohamed Sfar", type: "Première visite", duration: 2, color: "warning", motif: "Bilan initial", status: "pending" },
  "Mar 18-08:30": { patient: "Nadia Jemni", type: "Contrôle", duration: 1, color: "accent", motif: "Douleurs articulaires", status: "confirmed" },
  "Mar 18-10:00": { patient: "Sami Ayari", type: "Téléconsultation", duration: 1, color: "primary", teleconsultation: true, motif: "Renouvellement", status: "confirmed" },
  "Mar 18-14:00": { patient: "Rania Meddeb", type: "Suivi", duration: 1, color: "accent", motif: "Cholestérol", status: "confirmed" },
  "Mar 18-15:30": { patient: "Youssef Belhadj", type: "Consultation", duration: 1, color: "primary", motif: "Check-up", status: "pending" },
  "Mer 19-09:00": { patient: "Salma Dridi", type: "Consultation", duration: 1, color: "primary", motif: "Consultation", status: "confirmed" },
  "Mer 19-11:00": { patient: "Karim Mansour", type: "Première visite", duration: 2, color: "warning", motif: "Bilan", status: "confirmed" },
  "Jeu 20-08:00": { patient: "Leila Chahed", type: "Contrôle", duration: 1, color: "accent", motif: "Suivi", status: "confirmed" },
  "Jeu 20-14:30": { patient: "Bilel Nasri", type: "Téléconsultation", duration: 1, color: "primary", teleconsultation: true, motif: "Résultats", status: "confirmed" },
  "Jeu 20-16:00": { patient: "Olfa Ben Salah", type: "Consultation", duration: 1, color: "primary", motif: "Certificat", status: "confirmed" },
  "Ven 21-09:30": { patient: "Imen Bouhlel", type: "Suivi", duration: 1, color: "accent", motif: "Suivi grossesse", status: "confirmed" },
  "Ven 21-15:00": { patient: "Walid Jlassi", type: "Consultation", duration: 1, color: "primary", motif: "Consultation", status: "confirmed" },
};

const colorMap: Record<AppointmentColor, string> = {
  primary: "bg-primary/10 border-primary/30 text-primary",
  accent: "bg-accent/10 border-accent/30 text-accent",
  warning: "bg-warning/10 border-warning/30 text-warning",
  destructive: "bg-destructive/10 border-destructive/30 text-destructive",
};

const recurDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const DoctorSchedule = () => {
  const [view, setView] = useState<ViewMode>("week");
  const [selectedDay, setSelectedDay] = useState("Lun 17");
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedAppKey, setSelectedAppKey] = useState<string | null>(null);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [emptySlotKey, setEmptySlotKey] = useState<string | null>(null);

  // Availability creation state
  const [availDays, setAvailDays] = useState<string[]>(["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]);
  const [availStart, setAvailStart] = useState("08:00");
  const [availEnd, setAvailEnd] = useState("18:00");
  const [availType, setAvailType] = useState("all");

  const displayDays = view === "week" ? days : [selectedDay];
  const selectedApt = selectedAppKey ? appointments[selectedAppKey] : null;

  const handleAction = (action: string) => {
    if (!selectedAppKey) return;
    if (action === "confirm") {
      setAppointments(prev => ({ ...prev, [selectedAppKey]: { ...prev[selectedAppKey], status: "confirmed", color: "primary" } }));
    } else if (action === "cancel" || action === "no-show") {
      const updated = { ...appointments };
      delete updated[selectedAppKey];
      setAppointments(updated);
    } else if (action === "arrived") {
      setAppointments(prev => ({ ...prev, [selectedAppKey]: { ...prev[selectedAppKey], status: "arrived", color: "accent" } }));
    }
    setModal(null);
    setSelectedAppKey(null);
  };

  return (
    <DashboardLayout role="doctor" title="Planning">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="text-center"><h2 className="text-base sm:text-lg font-bold text-foreground">Semaine du 17 Fév 2026</h2><p className="text-xs text-muted-foreground">Février 2026</p></div>
            <Button variant="outline" size="icon" className="h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="text-xs ml-2">Aujourd'hui</Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 rounded-lg border bg-card p-0.5">
              <button onClick={() => setView("week")} className={`rounded-md p-2 text-xs font-medium transition-colors ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setView("day")} className={`rounded-md p-2 text-xs font-medium transition-colors ${view === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><List className="h-4 w-4" /></button>
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setModal("availability")}><Repeat className="h-3.5 w-3.5 mr-1.5" />Disponibilités</Button>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setModal("block")}><Ban className="h-3.5 w-3.5 mr-1.5" />Bloquer</Button>
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
                {displayDays.map(d => {
                  const count = Object.keys(appointments).filter(k => k.startsWith(d)).length;
                  return <th key={d} className="p-3 text-center"><p className="text-sm font-semibold text-foreground">{d}</p><p className="text-[10px] text-muted-foreground">{count} RDV</p></th>;
                })}
              </tr>
            </thead>
            <tbody>
              {hours.map(h => (
                <tr key={h} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-2 text-xs text-muted-foreground font-medium sticky left-0 bg-card">{h}</td>
                  {displayDays.map(d => {
                    const key = `${d}-${h}`;
                    const apt = appointments[key];
                    return (
                      <td key={key} className="p-1 h-12">
                        {apt ? (
                          <div onClick={() => { setSelectedAppKey(key); setModal("appointment-action"); }}
                            className={`rounded-lg border p-2 text-xs cursor-pointer hover:shadow-sm transition-all ${colorMap[apt.color]} ${apt.status === "pending" ? "border-dashed" : ""}`}>
                            <div className="flex items-center gap-1">
                              <p className="font-semibold truncate">{apt.patient}</p>
                              {apt.teleconsultation && <Video className="h-3 w-3 shrink-0" />}
                              {apt.status === "pending" && <Clock className="h-3 w-3 shrink-0 text-warning" />}
                            </div>
                            <p className="opacity-70 truncate text-[10px]">{apt.motif}</p>
                          </div>
                        ) : (
                          <div className="h-full rounded-lg hover:bg-primary/5 hover:border hover:border-dashed hover:border-primary/30 transition-colors cursor-pointer"
                            onClick={() => { setEmptySlotKey(key); setModal("empty-slot"); }} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upgrade banner for basic plan */}
        <UpgradeBanner feature="Statistiques avancées" description="Analysez vos taux de remplissage, no-show et revenus avec le plan Pro." />
      </div>

      {/* Availability creation modal */}
      {modal === "availability" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Repeat className="h-5 w-5 text-primary" />Disponibilités récurrentes</h3>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Jours</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recurDays.map(d => (
                    <button key={d} onClick={() => setAvailDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${availDays.includes(d) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{d.slice(0, 3)}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Début</label><Input type="time" value={availStart} onChange={e => setAvailStart(e.target.value)} className="mt-1 h-9" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Fin</label><Input type="time" value={availEnd} onChange={e => setAvailEnd(e.target.value)} className="mt-1 h-9" /></div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Type de créneaux</label>
                <select value={availType} onChange={e => setAvailType(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option value="all">Tous types</option>
                  <option value="consultation">Consultation uniquement</option>
                  <option value="urgence">Urgences</option>
                  <option value="nouveau">Nouveaux patients</option>
                  <option value="suivi">Suivi uniquement</option>
                </select>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground rounded-lg border bg-muted/30 p-3">
                <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                <span>Cette règle s'appliquera chaque semaine. Vous pourrez ajouter des exceptions (congés, jours fériés) ensuite.</span>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => setModal(null)}>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />Enregistrer les disponibilités
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Block slot modal */}
      {modal === "block" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><Ban className="h-5 w-5 text-destructive" />Bloquer des créneaux</h3>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Motif</label>
                <select className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option>Congé</option><option>Formation</option><option>Jour férié</option><option>Personnel</option><option>Autre</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Date début</label><Input type="date" className="mt-1 h-9" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Date fin</label><Input type="date" className="mt-1 h-9" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="allday" className="rounded border-input" defaultChecked />
                <label htmlFor="allday" className="text-sm text-muted-foreground">Journée entière</label>
              </div>
              <Button className="w-full" variant="destructive" onClick={() => setModal(null)}>
                <Ban className="h-4 w-4 mr-1.5" />Bloquer la période
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment action modal */}
      {modal === "appointment-action" && selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => { setModal(null); setSelectedAppKey(null); }}>
          <div className="w-full max-w-sm rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{selectedApt.patient}</h3>
              <button onClick={() => { setModal(null); setSelectedAppKey(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <p className="text-muted-foreground">{selectedApt.motif} · {selectedApt.type}</p>
              {selectedApt.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{selectedApt.phone}</p>}
              <StatusBadge status={selectedApt.status === "pending" ? "pending" : selectedApt.status === "arrived" ? "in-progress" : "confirmed"} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Actions rapides</p>
              {selectedApt.status === "pending" && (
                <Button variant="outline" className="w-full justify-start h-9 text-sm" onClick={() => handleAction("confirm")}><CheckCircle2 className="h-4 w-4 mr-2 text-accent" />Confirmer le RDV</Button>
              )}
              <Button variant="outline" className="w-full justify-start h-9 text-sm" onClick={() => handleAction("arrived")}><Play className="h-4 w-4 mr-2 text-primary" />Marquer arrivé</Button>
              <Link to="/dashboard/doctor/consultation/new"><Button variant="outline" className="w-full justify-start h-9 text-sm"><Play className="h-4 w-4 mr-2 text-accent" />Démarrer consultation</Button></Link>
              <Button variant="outline" className="w-full justify-start h-9 text-sm"><RefreshCw className="h-4 w-4 mr-2 text-warning" />Déplacer</Button>
              <Button variant="outline" className="w-full justify-start h-9 text-sm"><MessageSquare className="h-4 w-4 mr-2 text-primary" />Envoyer un message</Button>
              <Button variant="outline" className="w-full justify-start h-9 text-sm text-destructive" onClick={() => handleAction("cancel")}><X className="h-4 w-4 mr-2" />Annuler le RDV</Button>
              <Button variant="outline" className="w-full justify-start h-9 text-sm text-destructive" onClick={() => handleAction("no-show")}><AlertTriangle className="h-4 w-4 mr-2" />Marquer absent (no-show)</Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty slot menu */}
      {modal === "empty-slot" && emptySlotKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => { setModal(null); setEmptySlotKey(null); }}>
          <div className="w-full max-w-xs rounded-2xl border bg-card shadow-elevated p-5 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground text-sm">Créneau libre</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{emptySlotKey.replace("-", " · ")}</p>
              </div>
              <button onClick={() => { setModal(null); setEmptySlotKey(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start h-10 text-sm" onClick={() => { setModal("create-rdv"); }}>
                <Plus className="h-4 w-4 mr-2 text-primary" />Créer un rendez-vous
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 text-sm" onClick={() => {
                if (emptySlotKey) {
                  setAppointments(prev => ({ ...prev, [emptySlotKey]: { patient: "— Bloqué —", type: "Indisponible", duration: 1, color: "destructive", motif: "Créneau bloqué", status: "blocked" } }));
                }
                setModal(null); setEmptySlotKey(null);
              }}>
                <Ban className="h-4 w-4 mr-2 text-destructive" />Bloquer ce créneau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create RDV modal */}
      {modal === "create-rdv" && emptySlotKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => { setModal(null); setEmptySlotKey(null); }}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-elevated p-6 mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" />Nouveau RDV</h3>
              <button onClick={() => { setModal(null); setEmptySlotKey(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4 bg-muted/50 rounded-lg p-2.5">{emptySlotKey.replace("-", " · ")}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Patient</label>
                <Input placeholder="Rechercher un patient..." className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Motif</label>
                <select className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                  <option>Consultation</option><option>Suivi</option><option>Contrôle</option><option>Première visite</option><option>Téléconsultation</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Présentiel</option><option>Téléconsultation</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Durée</label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>15 min</option><option>20 min</option><option>30 min</option><option>45 min</option><option>60 min</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <textarea placeholder="Notes optionnelles..." className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" rows={2} />
              </div>
              <Button className="w-full gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => { setModal(null); setEmptySlotKey(null); }}>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />Créer le rendez-vous
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorSchedule;
