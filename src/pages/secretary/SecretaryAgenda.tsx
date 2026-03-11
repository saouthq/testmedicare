/**
 * SecretaryAgenda — Agenda secrétaire connecté aux stores partagés
 * Features: date navigation, shared appointments, shared blocked slots, SMS/Modifier buttons
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, User, Video, Search, Phone, X, CheckCircle2, Shield,
  Play, UserCheck, AlertCircle, CalendarDays, Eye, Edit, Timer, Coffee, Stethoscope, RefreshCw, Bell, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useSharedAppointments, createAppointment, updateAppointmentStatus, sendToWaitingRoom, startAppointmentConsultation, completeAppointmentConsultation, markAppointmentAbsent, cancelAppointment, rescheduleAppointment, getAppointmentsForDate, getAppointmentsForDoctor } from "@/stores/sharedAppointmentsStore";
import { useSharedBlockedSlots } from "@/stores/sharedBlockedSlotsStore";
import { useSharedLeaves } from "@/stores/sharedLeavesStore";
import { pushNotification } from "@/stores/notificationsStore";
import type { SharedAppointment, AppointmentStatus, AppointmentType } from "@/types/appointment";
import { APPOINTMENT_STATUS_CONFIG, computeEndTime } from "@/types/appointment";

const DOCTORS = ["Tous", "Dr. Bouazizi", "Dr. Gharbi", "Dr. Hammami"];

const typeColors: Record<string, string> = {
  "Consultation": "bg-primary/10 text-primary",
  "Suivi": "bg-accent/10 text-accent",
  "Contrôle": "bg-accent/10 text-accent",
  "Première visite": "bg-warning/10 text-warning",
  "Téléconsultation": "bg-primary/10 text-primary",
  "Urgence": "bg-destructive/10 text-destructive",
};

const fmtDateStr = (d: Date) => d.toISOString().slice(0, 10);
const DAYS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const SecretaryAgenda = () => {
  const [allApts] = useSharedAppointments();
  const [blockedSlots] = useSharedBlockedSlots();
  const [leaves] = useSharedLeaves();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDoctor, setSelectedDoctor] = useState("Tous");
  const [selectedApt, setSelectedApt] = useState<SharedAppointment | null>(null);
  const [showNewRdv, setShowNewRdv] = useState(false);
  const [search, setSearch] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [showEditRdv, setShowEditRdv] = useState(false);
  const [editMotif, setEditMotif] = useState<AppointmentType>("Consultation");
  const [editNotes, setEditNotes] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // New RDV form
  const [newRdvPatient, setNewRdvPatient] = useState("");
  const [newRdvDate, setNewRdvDate] = useState("");
  const [newRdvTime, setNewRdvTime] = useState("10:00");
  const [newRdvDoctor, setNewRdvDoctor] = useState("Dr. Bouazizi");
  const [newRdvMotif, setNewRdvMotif] = useState<AppointmentType>("Consultation");
  const [newRdvDuration, setNewRdvDuration] = useState(30);
  const [newRdvNotes, setNewRdvNotes] = useState("");
  const [newRdvPhone, setNewRdvPhone] = useState("");

  const dateStr = fmtDateStr(currentDate);
  const dateLabel = `${DAYS_FR[currentDate.getDay()]} ${currentDate.getDate()} ${MONTHS_FR[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const filtered = useMemo(() => {
    let apts = getAppointmentsForDate(allApts, dateStr);
    apts = getAppointmentsForDoctor(apts, selectedDoctor);
    if (search) apts = apts.filter(a => a.patient.toLowerCase().includes(search.toLowerCase()));
    return apts.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [allApts, dateStr, selectedDoctor, search]);

  const morningApts = filtered.filter(a => parseInt(a.startTime) < 12);
  const afternoonApts = filtered.filter(a => parseInt(a.startTime) >= 12);

  const doneCount = filtered.filter(a => a.status === "done").length;
  const waitingCount = filtered.filter(a => a.status === "in_waiting").length;
  const inProgressCount = filtered.filter(a => a.status === "in_progress").length;
  const totalActive = filtered.filter(a => a.status !== "cancelled").length;
  const progress = totalActive > 0 ? Math.round((doneCount / totalActive) * 100) : 0;

  // Date navigation
  const navDate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };
  const goToday = () => setCurrentDate(new Date());

  // Blocked slots & leaves for current date
  const dayBlocks = blockedSlots.filter(b => b.date === dateStr);
  const dayLeave = leaves.find(l => l.status === "upcoming" && dateStr >= l.startDate && dateStr <= l.endDate);

  const handleCreateRdv = () => {
    if (!newRdvPatient.trim()) { toast({ title: "Patient requis", variant: "destructive" }); return; }
    const avatar = newRdvPatient.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    createAppointment({
      date: newRdvDate || dateStr,
      startTime: newRdvTime,
      duration: newRdvDuration,
      patient: newRdvPatient,
      patientId: null,
      avatar,
      doctor: newRdvDoctor,
      type: newRdvMotif,
      motif: newRdvMotif,
      status: "pending",
      phone: newRdvPhone || "+216 XX XXX XXX",
      assurance: "—",
      notes: newRdvNotes,
    });
    setShowNewRdv(false);
    setNewRdvPatient(""); setNewRdvDate(""); setNewRdvTime("10:00");
    setNewRdvDoctor("Dr. Bouazizi"); setNewRdvMotif("Consultation"); setNewRdvDuration(30); setNewRdvNotes(""); setNewRdvPhone("");
    toast({ title: "RDV créé", description: `${newRdvPatient} · ${newRdvTime} avec ${newRdvDoctor}` });
  };

  const handleAccueil = (id: string) => {
    sendToWaitingRoom(id);
    toast({ title: "Patient accueilli", description: "Envoyé en salle d'attente" });
  };
  const handleCall = (id: string) => {
    startAppointmentConsultation(id);
    toast({ title: "Patient envoyé en consultation" });
  };
  const handleDone = (id: string) => {
    completeAppointmentConsultation(id);
    toast({ title: "Consultation terminée" });
  };
  const handleCancel = (id: string) => {
    cancelAppointment(id);
    toast({ title: "RDV annulé" });
  };
  const handleAbsent = (id: string) => {
    markAppointmentAbsent(id);
    pushNotification({ type: "appointment_absent", title: "Patient absent", message: `Le patient n'est pas venu à son RDV.`, targetRole: "patient" });
    toast({ title: "Patient marqué absent" });
  };
  const handleSmsRappel = (apt: SharedAppointment) => {
    toast({ title: "SMS envoyé", description: `Rappel envoyé à ${apt.patient} (${apt.phone})` });
  };
  const handleReschedule = () => {
    if (!selectedApt || !reschedDate || !reschedTime) return;
    rescheduleAppointment(selectedApt.id, reschedDate, reschedTime);
    toast({ title: "RDV reporté", description: `${selectedApt.patient} → ${reschedDate} à ${reschedTime}` });
    setShowReschedule(false);
    setReschedDate(""); setReschedTime("");
  };

  const openEditRdv = (apt: SharedAppointment) => {
    setEditMotif(apt.type);
    setEditNotes(apt.notes || "");
    setEditPhone(apt.phone);
    setShowEditRdv(true);
  };
  const handleEditRdv = () => {
    if (!selectedApt) return;
    updateAppointmentStatus(selectedApt.id, selectedApt.status, { type: editMotif, notes: editNotes, phone: editPhone } as Partial<SharedAppointment>);
    toast({ title: "RDV modifié", description: `${selectedApt.patient} — modifications enregistrées` });
    setShowEditRdv(false);
    setSelectedApt({ ...selectedApt, type: editMotif, notes: editNotes, phone: editPhone });
  };

  const statusIcon = (status: AppointmentStatus) => {
    const map: Record<string, any> = { done: CheckCircle2, in_progress: Stethoscope, in_waiting: Clock, confirmed: CheckCircle2, pending: CalendarDays, cancelled: X, absent: AlertCircle };
    return map[status] || CalendarDays;
  };

  const renderCard = (apt: SharedAppointment) => {
    const cfg = APPOINTMENT_STATUS_CONFIG[apt.status];
    const isSelected = selectedApt?.id === apt.id;
    const SIcon = statusIcon(apt.status);

    return (
      <div key={apt.id} onClick={() => setSelectedApt(apt)}
        className={`rounded-xl p-4 transition-all cursor-pointer ${cfg.bgClassName} ${isSelected ? "ring-2 ring-primary shadow-md" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="w-14 text-center shrink-0">
            <p className={`text-sm font-bold ${apt.status === "in_progress" ? "text-primary" : apt.status === "done" ? "text-muted-foreground" : "text-foreground"}`}>{apt.startTime}</p>
            <p className="text-[10px] text-muted-foreground">{apt.endTime}</p>
          </div>
          <div className={`w-0.5 h-12 rounded-full ${apt.status === "in_progress" ? "bg-primary" : apt.status === "in_waiting" ? "bg-warning" : apt.status === "done" ? "bg-muted-foreground/30" : "bg-border"}`} />
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            apt.status === "in_progress" ? "gradient-primary text-primary-foreground" :
            apt.status === "in_waiting" ? "bg-warning/20 text-warning" : "bg-primary/10 text-primary"
          }`}>{apt.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-sm ${apt.status === "cancelled" ? "line-through text-muted-foreground" : "text-foreground"}`}>{apt.patient}</p>
              {apt.teleconsultation && <Video className="h-3.5 w-3.5 text-primary shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColors[apt.type] || "bg-muted text-muted-foreground"}`}>{apt.type}</span>
              <span className="text-[11px] text-muted-foreground">{apt.motif}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{apt.doctor}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {apt.status === "in_waiting" && apt.waitTime !== undefined && (
              <div className="flex items-center gap-1 text-warning mr-1"><Timer className="h-3 w-3" /><span className="text-[10px] font-bold">{apt.waitTime} min</span></div>
            )}
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1 ${cfg.className}`}>
              <SIcon className="h-3 w-3" /><span className="hidden sm:inline">{cfg.label}</span>
            </span>
          </div>
        </div>
        {!["done", "cancelled", "absent"].includes(apt.status) && (
          <div className="flex items-center gap-1.5 mt-3 ml-[72px]">
            {(apt.status === "confirmed" || apt.status === "pending") && (
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={e => { e.stopPropagation(); handleAccueil(apt.id); }}>
                <UserCheck className="h-3 w-3" />Accueillir
              </Button>
            )}
            {apt.status === "pending" && (
              <Button size="sm" variant="ghost" className="h-7 text-[10px] text-muted-foreground gap-1" onClick={e => { e.stopPropagation(); handleSmsRappel(apt); }}>
                <Phone className="h-3 w-3" />SMS rappel
              </Button>
            )}
            {apt.status === "in_waiting" && (
              <Button size="sm" className="h-7 text-[10px] gap-1 gradient-primary text-primary-foreground" onClick={e => { e.stopPropagation(); handleCall(apt.id); }}>
                <Play className="h-3 w-3" />Envoyer en consultation
              </Button>
            )}
            {apt.status === "in_progress" && (
              <Button size="sm" className="h-7 text-[10px] gap-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={e => { e.stopPropagation(); handleDone(apt.id); }}>
                <CheckCircle2 className="h-3 w-3" />Terminer
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout role="secretary" title="Agenda du jour">
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navDate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <div>
                <h2 className="text-lg font-bold text-foreground">{dateLabel}</h2>
                <p className="text-xs text-muted-foreground">Cabinet Médical El Manar · Tunis</p>
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navDate(1)}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={goToday}>Aujourd'hui</Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher patient..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-44 text-xs" />
              </div>
              <div className="flex gap-1 rounded-lg border bg-card p-0.5">
                {DOCTORS.map(d => (
                  <button key={d} onClick={() => setSelectedDoctor(d)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${selectedDoctor === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {d === "Tous" ? d : d.replace("Dr. ", "")}
                  </button>
                ))}
              </div>
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm" onClick={() => setShowNewRdv(true)}>
                <Plus className="h-4 w-4 mr-1" />Nouveau RDV
              </Button>
            </div>
          </div>

          {/* Leave warning */}
          {dayLeave && (
            <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive font-medium">
                {dayLeave.doctor} est absent(e) : {dayLeave.motif}
                {dayLeave.replacementDoctor && ` — Remplaçant : ${dayLeave.replacementDoctor}`}
              </p>
            </div>
          )}

          {/* Blocked slots */}
          {dayBlocks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {dayBlocks.map(b => (
                <span key={b.id} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full">
                  🔒 {b.startTime} · {b.reason} ({b.doctor})
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div><p className="text-lg font-bold text-foreground">{totalActive}</p><p className="text-[10px] text-muted-foreground">RDV total</p></div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <div><p className="text-lg font-bold text-accent">{doneCount}</p><p className="text-[10px] text-muted-foreground">Terminés</p></div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              <div><p className="text-lg font-bold text-primary">{inProgressCount}</p><p className="text-[10px] text-muted-foreground">En cours</p></div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-warning/5 border border-warning/20 px-3 py-2">
              <Clock className="h-4 w-4 text-warning" />
              <div><p className="text-lg font-bold text-warning">{waitingCount}</p><p className="text-[10px] text-muted-foreground">En attente</p></div>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-lg bg-muted/50 px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">Progression</span>
                <span className="text-xs font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main timeline */}
          <div className="lg:col-span-2 space-y-1">
            <div className="flex items-center gap-2 mb-2 mt-1">
              <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center"><Coffee className="h-3 w-3 text-warning" /></div>
              <span className="text-xs font-semibold text-foreground">Matin</span>
              <span className="text-[10px] text-muted-foreground">({morningApts.length} RDV)</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">{morningApts.map(renderCard)}</div>

            <div className="flex items-center gap-3 py-4">
              <div className="flex-1 h-px bg-border" />
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
                <Coffee className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Pause déjeuner · 12:00 - 14:00</span>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center"><CalendarDays className="h-3 w-3 text-primary" /></div>
              <span className="text-xs font-semibold text-foreground">Après-midi</span>
              <span className="text-[10px] text-muted-foreground">({afternoonApts.length} RDV)</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">{afternoonApts.map(renderCard)}</div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun rendez-vous ce jour</p>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {selectedApt ? (
              <div className="rounded-xl border bg-card shadow-card animate-fade-in">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm">Détail du RDV</h3>
                  <button onClick={() => { setSelectedApt(null); setShowReschedule(false); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">{selectedApt.avatar}</div>
                    <div>
                      <p className="font-bold text-foreground">{selectedApt.patient}</p>
                      <p className="text-xs text-muted-foreground">{selectedApt.doctor}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted/50 p-2.5"><p className="text-[10px] text-muted-foreground">Heure</p><p className="text-xs font-semibold text-foreground">{selectedApt.startTime} - {selectedApt.endTime}</p></div>
                    <div className="rounded-lg bg-muted/50 p-2.5"><p className="text-[10px] text-muted-foreground">Type</p><p className="text-xs font-semibold text-foreground">{selectedApt.type}</p></div>
                    <div className="rounded-lg bg-muted/50 p-2.5"><p className="text-[10px] text-muted-foreground">Motif</p><p className="text-xs font-semibold text-foreground">{selectedApt.motif}</p></div>
                    <div className="rounded-lg bg-muted/50 p-2.5"><p className="text-[10px] text-muted-foreground">Téléphone</p><p className="text-xs font-semibold text-foreground">{selectedApt.phone}</p></div>
                  </div>
                  {selectedApt.arrivedAt && (
                    <div className="rounded-lg bg-warning/5 border border-warning/20 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Arrivé(e) à</p>
                      <p className="text-xs font-bold text-warning">{selectedApt.arrivedAt} {selectedApt.waitTime !== undefined ? `· ${selectedApt.waitTime} min d'attente` : ""}</p>
                    </div>
                  )}

                  {/* Reschedule */}
                  {showReschedule && (
                    <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 space-y-2">
                      <p className="text-xs font-semibold text-foreground">Reporter le RDV</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="date" value={reschedDate} onChange={e => setReschedDate(e.target.value)} className="h-8 text-xs" />
                        <Input type="time" value={reschedTime} onChange={e => setReschedTime(e.target.value)} className="h-8 text-xs" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-[10px]" onClick={() => setShowReschedule(false)}>Annuler</Button>
                        <Button size="sm" className="flex-1 text-[10px] gradient-primary text-primary-foreground" onClick={handleReschedule} disabled={!reschedDate || !reschedTime}>Confirmer</Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    {(selectedApt.status === "pending" || selectedApt.status === "confirmed") && (
                      <Button size="sm" className="w-full text-xs gap-1.5" variant="outline" onClick={() => handleAccueil(selectedApt.id)}>
                        <UserCheck className="h-3.5 w-3.5" />Accueillir le patient
                      </Button>
                    )}
                    {selectedApt.status === "in_waiting" && (
                      <Button size="sm" className="w-full text-xs gap-1.5 gradient-primary text-primary-foreground" onClick={() => handleCall(selectedApt.id)}>
                        <Play className="h-3.5 w-3.5" />Envoyer en consultation
                      </Button>
                    )}
                    {selectedApt.status === "in_progress" && (
                      <Button size="sm" className="w-full text-xs gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleDone(selectedApt.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />Marquer terminé
                      </Button>
                    )}
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="flex-1 text-[10px] gap-1" onClick={() => { if (selectedApt.phone) window.open(`tel:${selectedApt.phone}`); }}><Phone className="h-3 w-3" />Appeler</Button>
                      <Button size="sm" variant="ghost" className="flex-1 text-[10px] gap-1" onClick={() => handleSmsRappel(selectedApt)}><MessageSquare className="h-3 w-3" />SMS</Button>
                      <Button size="sm" variant="ghost" className="flex-1 text-[10px] gap-1" onClick={() => openEditRdv(selectedApt)}><Edit className="h-3 w-3" />Modifier</Button>
                      <Button size="sm" variant="ghost" className="flex-1 text-[10px] gap-1" onClick={() => setShowReschedule(true)}><RefreshCw className="h-3 w-3" />Reporter</Button>
                    </div>
                    {!["done", "cancelled", "absent"].includes(selectedApt.status) && (
                      <div className="flex gap-1.5 pt-1">
                        <Button size="sm" variant="ghost" className="flex-1 text-[10px] text-destructive gap-1" onClick={() => { handleCancel(selectedApt.id); setSelectedApt(null); }}>
                          <X className="h-3 w-3" />Annuler
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 text-[10px] text-destructive gap-1" onClick={() => { handleAbsent(selectedApt.id); setSelectedApt(null); }}>
                          <AlertCircle className="h-3 w-3" />Absent
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-card shadow-card p-6 text-center">
                <Eye className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Cliquez sur un RDV pour voir les détails</p>
              </div>
            )}

            {/* Waiting room */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-warning" />Salle d'attente</h3>
                <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">{waitingCount}</span>
              </div>
              <div className="divide-y">
                {filtered.filter(a => a.status === "in_waiting").map(a => (
                  <div key={a.id} className="p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-warning/15 flex items-center justify-center text-[10px] font-bold text-warning">{a.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{a.patient}</p>
                      <p className="text-[10px] text-muted-foreground">{a.doctor} · arrivé {a.arrivedAt}</p>
                    </div>
                    {a.waitTime !== undefined && (
                      <div className="flex items-center gap-1 text-warning"><Timer className="h-3 w-3" /><span className="text-[10px] font-bold">{a.waitTime}m</span></div>
                    )}
                    <Button size="sm" className="h-6 text-[9px] gradient-primary text-primary-foreground" onClick={() => handleCall(a.id)}>
                      <Play className="h-2.5 w-2.5 mr-0.5" />Appeler
                    </Button>
                  </div>
                ))}
                {waitingCount === 0 && <div className="p-4 text-center text-xs text-muted-foreground">Aucun patient en attente</div>}
              </div>
            </div>

            {/* Doctors status */}
            <div className="rounded-xl border bg-card shadow-card p-4">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-3"><Stethoscope className="h-4 w-4 text-primary" />Médecins</h3>
              <div className="space-y-2.5">
                {DOCTORS.filter(d => d !== "Tous").map(d => {
                  const doctorApts = getAppointmentsForDate(allApts, dateStr).filter(a => a.doctor === d);
                  const inProgress = doctorApts.find(a => a.status === "in_progress");
                  const status = inProgress ? "En consultation" : doctorApts.some(a => a.status === "in_waiting") ? "Patient en attente" : "Disponible";
                  const color = inProgress ? "bg-primary" : status === "Patient en attente" ? "bg-warning" : "bg-accent";
                  return (
                    <div key={d} className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{d.split(". ")[1]?.[0]}</div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${color} border-2 border-card`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">{d}</p>
                        <p className="text-[10px] text-muted-foreground">{status}{inProgress ? ` — ${inProgress.patient}` : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* New RDV modal */}
        {showNewRdv && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowNewRdv(false)}>
            <div className="bg-card rounded-2xl border shadow-elevated p-6 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Nouveau rendez-vous</h3>
                <button onClick={() => setShowNewRdv(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div><Label className="text-xs">Patient *</Label><Input placeholder="Nom du patient" value={newRdvPatient} onChange={e => setNewRdvPatient(e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">Téléphone</Label><Input placeholder="+216 XX XXX XXX" value={newRdvPhone} onChange={e => setNewRdvPhone(e.target.value)} className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Date</Label><Input type="date" value={newRdvDate || dateStr} onChange={e => setNewRdvDate(e.target.value)} className="mt-1" /></div>
                  <div><Label className="text-xs">Heure</Label><Input type="time" value={newRdvTime} onChange={e => setNewRdvTime(e.target.value)} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Médecin</Label>
                    <select value={newRdvDoctor} onChange={e => setNewRdvDoctor(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      {DOCTORS.filter(d => d !== "Tous").map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div><Label className="text-xs">Durée</Label>
                    <select value={newRdvDuration} onChange={e => setNewRdvDuration(+e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                      {[15, 20, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                </div>
                <div><Label className="text-xs">Motif</Label>
                  <select value={newRdvMotif} onChange={e => setNewRdvMotif(e.target.value as AppointmentType)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Consultation</option><option>Suivi</option><option>Contrôle</option><option>Première visite</option><option>Téléconsultation</option><option>Urgence</option>
                  </select>
                </div>
                <div><Label className="text-xs">Notes</Label>
                  <textarea placeholder="Notes..." rows={2} value={newRdvNotes} onChange={e => setNewRdvNotes(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewRdv(false)}>Annuler</Button>
                  <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleCreateRdv}>Créer le RDV</Button>
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
