import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, User, Video, LayoutGrid, List, Search, Phone, X, CheckCircle2, Shield,
  Play, UserCheck, AlertCircle, Pause, MapPin, CalendarDays, Eye, MoreHorizontal, Bell, Printer, Send, Edit, Trash2,
  PhoneCall, MessageSquare, FileText, Timer, ArrowRight, Coffee, Stethoscope, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ViewMode = "timeline" | "list";
type AppointmentStatus = "done" | "in_progress" | "in_waiting" | "confirmed" | "upcoming" | "cancelled" | "no_show";

interface AgendaAppointment {
  id: number;
  time: string;
  endTime: string;
  patient: string;
  avatar: string;
  doctor: string;
  type: string;
  motif: string;
  status: AppointmentStatus;
  phone: string;
  cnam: boolean;
  teleconsultation?: boolean;
  notes?: string;
  arrivedAt?: string;
  waitTime?: number;
}

const doctors = ["Tous", "Dr. Bouazizi", "Dr. Gharbi", "Dr. Hammami"];

const initialAppointments: AgendaAppointment[] = [
  { id: 1, time: "08:00", endTime: "08:30", patient: "Karim Mansour", avatar: "KM", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Suivi diabète", status: "done", phone: "+216 71 111 111", cnam: true, notes: "Glycémie stable" },
  { id: 2, time: "08:30", endTime: "09:00", patient: "Leila Chahed", avatar: "LC", doctor: "Dr. Gharbi", type: "Suivi", motif: "Tension artérielle", status: "done", phone: "+216 71 222 222", cnam: true },
  { id: 3, time: "09:00", endTime: "09:30", patient: "Hana Kammoun", avatar: "HK", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Douleurs dorsales", status: "done", phone: "+216 71 333 333", cnam: true },
  { id: 4, time: "09:30", endTime: "10:00", patient: "Amine Ben Ali", avatar: "AB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Suivi diabète", status: "in_progress", phone: "+216 71 234 567", cnam: true, arrivedAt: "09:15" },
  { id: 5, time: "09:45", endTime: "10:15", patient: "Fatma Trabelsi", avatar: "FT", doctor: "Dr. Gharbi", type: "Suivi", motif: "Cardio - ECG", status: "in_waiting", phone: "+216 22 345 678", cnam: true, arrivedAt: "09:20", waitTime: 25 },
  { id: 6, time: "10:00", endTime: "10:30", patient: "Mohamed Sfar", avatar: "MS", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Post-opératoire", status: "in_waiting", phone: "+216 55 456 789", cnam: false, arrivedAt: "09:40", waitTime: 15 },
  { id: 7, time: "10:30", endTime: "11:00", patient: "Nadia Jemni", avatar: "NJ", doctor: "Dr. Hammami", type: "1ère visite", motif: "Consultation dermatologique", status: "confirmed", phone: "+216 98 567 890", cnam: true },
  { id: 8, time: "11:00", endTime: "11:30", patient: "Sami Ayari", avatar: "SA", doctor: "Dr. Bouazizi", type: "1ère visite", motif: "Bilan complet", status: "confirmed", phone: "+216 29 678 901", cnam: true },
  { id: 9, time: "11:30", endTime: "12:00", patient: "Bilel Nasri", avatar: "BN", doctor: "Dr. Gharbi", type: "Suivi", motif: "Hypertension", status: "upcoming", phone: "+216 50 789 012", cnam: true },
  { id: 10, time: "14:00", endTime: "14:30", patient: "Youssef Belhadj", avatar: "YB", doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Renouvellement ordonnance", status: "confirmed", phone: "+216 71 890 123", cnam: false, teleconsultation: true },
  { id: 11, time: "14:30", endTime: "15:00", patient: "Salma Dridi", avatar: "SD", doctor: "Dr. Hammami", type: "Consultation", motif: "Acné sévère", status: "upcoming", phone: "+216 71 901 234", cnam: true },
  { id: 12, time: "15:00", endTime: "15:30", patient: "Olfa Ben Salah", avatar: "OB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Fatigue chronique", status: "upcoming", phone: "+216 55 012 345", cnam: true },
  { id: 13, time: "15:30", endTime: "16:00", patient: "Rania Meddeb", avatar: "RM", doctor: "Dr. Gharbi", type: "Contrôle", motif: "ECG de contrôle", status: "cancelled", phone: "+216 71 123 456", cnam: true },
  { id: 14, time: "16:00", endTime: "16:30", patient: "Imen Bouhlel", avatar: "IB", doctor: "Dr. Bouazizi", type: "Urgence", motif: "Douleur thoracique", status: "upcoming", phone: "+216 50 234 567", cnam: true },
  { id: 15, time: "16:30", endTime: "17:00", patient: "Walid Jlassi", avatar: "WJ", doctor: "Dr. Hammami", type: "Consultation", motif: "Eczéma", status: "upcoming", phone: "+216 22 345 678", cnam: false },
];

const statusConfig: Record<AppointmentStatus, { label: string; class: string; bgClass: string; icon: any }> = {
  done: { label: "Terminé", class: "bg-muted text-muted-foreground", bgClass: "bg-muted/30 opacity-60", icon: CheckCircle2 },
  in_progress: { label: "En consultation", class: "bg-primary/15 text-primary border border-primary/30", bgClass: "bg-primary/5 border-l-4 border-l-primary", icon: Stethoscope },
  in_waiting: { label: "En salle d'attente", class: "bg-warning/15 text-warning border border-warning/30", bgClass: "bg-warning/5 border-l-4 border-l-warning", icon: Clock },
  confirmed: { label: "Confirmé", class: "bg-accent/15 text-accent border border-accent/30", bgClass: "hover:bg-accent/5", icon: CheckCircle2 },
  upcoming: { label: "À venir", class: "bg-secondary text-secondary-foreground", bgClass: "hover:bg-muted/30", icon: CalendarDays },
  cancelled: { label: "Annulé", class: "bg-destructive/10 text-destructive", bgClass: "opacity-40 line-through", icon: X },
  no_show: { label: "Absent", class: "bg-destructive/15 text-destructive border border-destructive/30", bgClass: "opacity-50 bg-destructive/5", icon: AlertCircle },
};

const typeColors: Record<string, string> = {
  "Consultation": "bg-primary/10 text-primary",
  "Suivi": "bg-accent/10 text-accent",
  "Contrôle": "bg-accent/10 text-accent",
  "1ère visite": "bg-warning/10 text-warning",
  "Téléconsultation": "bg-primary/10 text-primary",
  "Urgence": "bg-destructive/10 text-destructive",
};

const SecretaryAgenda = () => {
  const [view, setView] = useState<ViewMode>("timeline");
  const [selectedDoctor, setSelectedDoctor] = useState("Tous");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedApt, setSelectedApt] = useState<AgendaAppointment | null>(null);
  const [showNewRdv, setShowNewRdv] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = appointments.filter(a => {
    if (selectedDoctor !== "Tous" && a.doctor !== selectedDoctor) return false;
    if (search && !a.patient.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const morningApts = filtered.filter(a => parseInt(a.time) < 12);
  const afternoonApts = filtered.filter(a => parseInt(a.time) >= 12);

  const doneCount = filtered.filter(a => a.status === "done").length;
  const waitingCount = filtered.filter(a => a.status === "in_waiting").length;
  const inProgressCount = filtered.filter(a => a.status === "in_progress").length;
  const totalActive = filtered.filter(a => a.status !== "cancelled").length;
  const progress = totalActive > 0 ? Math.round((doneCount / totalActive) * 100) : 0;

  const handleAccueil = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "in_waiting" as AppointmentStatus, arrivedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), waitTime: 0 } : a));
  };

  const handleCall = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "in_progress" as AppointmentStatus } : a));
  };

  const handleDone = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "done" as AppointmentStatus } : a));
  };

  const handleCancel = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a));
  };

  const handleNoShow = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "no_show" as AppointmentStatus } : a));
  };

  const currentTime = "09:45";

  const renderAppointmentCard = (apt: AgendaAppointment) => {
    const config = statusConfig[apt.status];
    const isSelected = selectedApt?.id === apt.id;

    return (
      <div
        key={apt.id}
        onClick={() => setSelectedApt(apt)}
        className={`rounded-xl p-4 transition-all cursor-pointer ${config.bgClass} ${isSelected ? "ring-2 ring-primary shadow-md" : ""} ${apt.status === "cancelled" ? "" : "hover:shadow-sm"}`}
      >
        <div className="flex items-center gap-3">
          {/* Time column */}
          <div className="w-14 text-center shrink-0">
            <p className={`text-sm font-bold ${apt.status === "in_progress" ? "text-primary" : apt.status === "done" ? "text-muted-foreground" : "text-foreground"}`}>{apt.time}</p>
            <p className="text-[10px] text-muted-foreground">{apt.endTime}</p>
          </div>

          {/* Divider */}
          <div className={`w-0.5 h-12 rounded-full ${apt.status === "in_progress" ? "bg-primary" : apt.status === "in_waiting" ? "bg-warning" : apt.status === "done" ? "bg-muted-foreground/30" : "bg-border"}`} />

          {/* Patient avatar */}
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            apt.status === "in_progress" ? "gradient-primary text-primary-foreground" :
            apt.status === "in_waiting" ? "bg-warning/20 text-warning" :
            "bg-primary/10 text-primary"
          }`}>
            {apt.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-sm ${apt.status === "cancelled" ? "line-through text-muted-foreground" : "text-foreground"}`}>{apt.patient}</p>
              {apt.teleconsultation && <Video className="h-3.5 w-3.5 text-primary shrink-0" />}
              {apt.cnam && <Shield className="h-3 w-3 text-primary/60 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColors[apt.type] || "bg-muted text-muted-foreground"}`}>{apt.type}</span>
              <span className="text-[11px] text-muted-foreground">{apt.motif}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{apt.doctor}</p>
          </div>

          {/* Status + Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {apt.status === "in_waiting" && apt.waitTime !== undefined && (
              <div className="flex items-center gap-1 text-warning mr-1">
                <Timer className="h-3 w-3" />
                <span className="text-[10px] font-bold">{apt.waitTime} min</span>
              </div>
            )}
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1 ${config.class}`}>
              <config.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{config.label}</span>
            </span>
          </div>
        </div>

        {/* Quick actions row */}
        {apt.status !== "done" && apt.status !== "cancelled" && apt.status !== "no_show" && (
          <div className="flex items-center gap-1.5 mt-3 ml-[72px]">
            {apt.status === "confirmed" && (
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={e => { e.stopPropagation(); handleAccueil(apt.id); }}>
                <UserCheck className="h-3 w-3" />Accueillir
              </Button>
            )}
            {apt.status === "upcoming" && (
              <>
                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={e => { e.stopPropagation(); handleAccueil(apt.id); }}>
                  <UserCheck className="h-3 w-3" />Accueillir
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-muted-foreground gap-1" onClick={e => { e.stopPropagation(); }}>
                  <Phone className="h-3 w-3" />SMS rappel
                </Button>
              </>
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
        {/* Header with date + stats bar */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
              <div>
                <h2 className="text-lg font-bold text-foreground">Jeudi 20 Février 2026</h2>
                <p className="text-xs text-muted-foreground">Cabinet Médical El Manar · Tunis</p>
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" className="text-xs">Aujourd'hui</Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Rechercher patient..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 w-44 text-xs" />
              </div>
              <div className="flex gap-1 rounded-lg border bg-card p-0.5">
                {doctors.map(d => (
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

          {/* Live stats bar */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{totalActive}</p>
                <p className="text-[10px] text-muted-foreground">RDV total</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <div>
                <p className="text-lg font-bold text-accent">{doneCount}</p>
                <p className="text-[10px] text-muted-foreground">Terminés</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-bold text-primary">{inProgressCount}</p>
                <p className="text-[10px] text-muted-foreground">En cours</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-warning/5 border border-warning/20 px-3 py-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <p className="text-lg font-bold text-warning">{waitingCount}</p>
                <p className="text-[10px] text-muted-foreground">En attente</p>
              </div>
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
            {/* Morning */}
            <div className="flex items-center gap-2 mb-2 mt-1">
              <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center"><Coffee className="h-3 w-3 text-warning" /></div>
              <span className="text-xs font-semibold text-foreground">Matin</span>
              <span className="text-[10px] text-muted-foreground">({morningApts.length} RDV)</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {morningApts.map(renderAppointmentCard)}
            </div>

            {/* Pause déjeuner */}
            <div className="flex items-center gap-3 py-4">
              <div className="flex-1 h-px bg-border" />
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-1.5">
                <Coffee className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Pause déjeuner · 12:00 - 14:00</span>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Afternoon */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center"><CalendarDays className="h-3 w-3 text-primary" /></div>
              <span className="text-xs font-semibold text-foreground">Après-midi</span>
              <span className="text-[10px] text-muted-foreground">({afternoonApts.length} RDV)</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {afternoonApts.map(renderAppointmentCard)}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Selected appointment detail */}
            {selectedApt ? (
              <div className="rounded-xl border bg-card shadow-card animate-fade-in">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm">Détail du RDV</h3>
                  <button onClick={() => setSelectedApt(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
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
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Heure</p>
                      <p className="text-xs font-semibold text-foreground">{selectedApt.time} - {selectedApt.endTime}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Type</p>
                      <p className="text-xs font-semibold text-foreground">{selectedApt.type}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Motif</p>
                      <p className="text-xs font-semibold text-foreground">{selectedApt.motif}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Téléphone</p>
                      <p className="text-xs font-semibold text-foreground">{selectedApt.phone}</p>
                    </div>
                  </div>

                  {selectedApt.cnam && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs font-semibold text-primary">Assuré CNAM</p>
                        <p className="text-[10px] text-muted-foreground">Prise en charge conventionnelle</p>
                      </div>
                    </div>
                  )}

                  {selectedApt.arrivedAt && (
                    <div className="rounded-lg bg-warning/5 border border-warning/20 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Arrivé(e) à</p>
                      <p className="text-xs font-bold text-warning">{selectedApt.arrivedAt} {selectedApt.waitTime !== undefined ? `· ${selectedApt.waitTime} min d'attente` : ""}</p>
                    </div>
                  )}

                  {selectedApt.notes && (
                    <div className="rounded-lg bg-muted/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Notes</p>
                      <p className="text-xs text-foreground">{selectedApt.notes}</p>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    {selectedApt.status === "upcoming" && (
                      <>
                        <Button size="sm" className="w-full text-xs gap-1.5" variant="outline" onClick={() => handleAccueil(selectedApt.id)}>
                          <UserCheck className="h-3.5 w-3.5" />Accueillir le patient
                        </Button>
                        <Button size="sm" className="w-full text-xs gap-1.5" variant="outline">
                          <Bell className="h-3.5 w-3.5" />Envoyer rappel SMS
                        </Button>
                      </>
                    )}
                    {selectedApt.status === "confirmed" && (
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
                      <Button size="sm" variant="ghost" className="flex-1 text-[10px] gap-1"><Phone className="h-3 w-3" />Appeler</Button>
                      <Button size="sm" variant="ghost" className="flex-1 text-[10px] gap-1"><MessageSquare className="h-3 w-3" />SMS</Button>
                      <Button size="sm" variant="ghost" className="flex-1 text-[10px] gap-1"><Edit className="h-3 w-3" />Modifier</Button>
                    </div>
                    {selectedApt.status !== "done" && selectedApt.status !== "cancelled" && (
                      <div className="flex gap-1.5 pt-1">
                        <Button size="sm" variant="ghost" className="flex-1 text-[10px] text-destructive gap-1" onClick={() => handleCancel(selectedApt.id)}>
                          <X className="h-3 w-3" />Annuler
                        </Button>
                        <Button size="sm" variant="ghost" className="flex-1 text-[10px] text-destructive gap-1" onClick={() => handleNoShow(selectedApt.id)}>
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

            {/* Waiting room live */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />Salle d'attente
                </h3>
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
                    <div className="flex items-center gap-1 text-warning">
                      <Timer className="h-3 w-3" />
                      <span className="text-[10px] font-bold">{a.waitTime}m</span>
                    </div>
                    <Button size="sm" className="h-6 text-[9px] gradient-primary text-primary-foreground" onClick={() => handleCall(a.id)}>
                      <Play className="h-2.5 w-2.5 mr-0.5" />Appeler
                    </Button>
                  </div>
                ))}
                {waitingCount === 0 && (
                  <div className="p-4 text-center text-xs text-muted-foreground">Aucun patient en attente</div>
                )}
              </div>
            </div>

            {/* Doctors status */}
            <div className="rounded-xl border bg-card shadow-card p-4">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
                <Stethoscope className="h-4 w-4 text-primary" />Médecins
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: "Dr. Bouazizi", status: "En consultation", patient: "Amine Ben Ali", color: "bg-primary" },
                  { name: "Dr. Gharbi", status: "Disponible", patient: null, color: "bg-accent" },
                  { name: "Dr. Hammami", status: "Arrive à 10h30", patient: null, color: "bg-muted-foreground" },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {d.name.split(". ")[1]?.[0]}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${d.color} border-2 border-card`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">{d.status}{d.patient ? ` — ${d.patient}` : ""}</p>
                    </div>
                  </div>
                ))}
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Patient</label>
                  <Input placeholder="Rechercher un patient..." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium text-muted-foreground">Date</label><Input type="date" className="mt-1" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground">Heure</label><Input type="time" className="mt-1" /></div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Médecin</label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Dr. Bouazizi</option><option>Dr. Gharbi</option><option>Dr. Hammami</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Motif</label>
                  <select className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Consultation</option><option>Suivi</option><option>Contrôle</option><option>Première visite</option><option>Téléconsultation</option><option>Urgence</option>
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
