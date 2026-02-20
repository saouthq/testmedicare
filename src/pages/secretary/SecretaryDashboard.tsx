import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, Users, Phone, Clock, ChevronRight, Plus, 
  UserCheck, CheckCircle2, Play, Pause,
  Bell, Video, ArrowUpRight, Banknote, MapPin,
  FileText, Stethoscope, RefreshCw, PhoneCall, X,
  AlertTriangle, Coffee, Timer, TrendingUp, Activity,
  MessageSquare, ArrowRight, Eye, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const initialWaitingRoom = [
  { id: 1, patient: "Amine Ben Ali", arrivedAt: "09:15", appointment: "09:30", doctor: "Dr. Bouazizi", motif: "Suivi diabète", status: "waiting" as string, avatar: "AB", cnam: true, waitMin: 15 },
  { id: 2, patient: "Fatma Trabelsi", arrivedAt: "09:20", appointment: "09:45", doctor: "Dr. Gharbi", motif: "Bilan cardiaque", status: "waiting" as string, avatar: "FT", cnam: true, waitMin: 10 },
  { id: 3, patient: "Mohamed Sfar", arrivedAt: "09:25", appointment: "10:00", doctor: "Dr. Bouazizi", motif: "Contrôle annuel", status: "waiting" as string, avatar: "MS", cnam: false, waitMin: 5 },
];

const initialAppointments = [
  { id: 1, time: "08:30", patient: "Karim Mansour", doctor: "Dr. Bouazizi", type: "Consultation", status: "done" as string, avatar: "KM", amount: "35 DT", cnam: true },
  { id: 2, time: "09:00", patient: "Leila Chahed", doctor: "Dr. Gharbi", type: "Suivi", status: "done" as string, avatar: "LC", amount: "45 DT", cnam: true },
  { id: 3, time: "09:30", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", type: "Consultation", status: "in_progress" as string, avatar: "AB", amount: "35 DT", cnam: true },
  { id: 4, time: "09:45", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", type: "Suivi", status: "waiting" as string, avatar: "FT", amount: "45 DT", cnam: true },
  { id: 5, time: "10:00", patient: "Mohamed Sfar", doctor: "Dr. Bouazizi", type: "Contrôle", status: "upcoming" as string, avatar: "MS", amount: "35 DT", cnam: false },
  { id: 6, time: "10:30", patient: "Nadia Jemni", doctor: "Dr. Hammami", type: "Consultation", status: "upcoming" as string, avatar: "NJ", amount: "40 DT", cnam: true },
  { id: 7, time: "11:00", patient: "Sami Ayari", doctor: "Dr. Bouazizi", type: "Première visite", status: "upcoming" as string, avatar: "SA", amount: "50 DT", cnam: true },
  { id: 8, time: "14:00", patient: "Youssef Belhadj", doctor: "Dr. Bouazizi", type: "Téléconsultation", status: "upcoming" as string, avatar: "YB", teleconsultation: true, amount: "35 DT", cnam: false },
  { id: 9, time: "14:30", patient: "Salma Dridi", doctor: "Dr. Hammami", type: "Consultation", status: "upcoming" as string, avatar: "SD", amount: "40 DT", cnam: true },
  { id: 10, time: "15:00", patient: "Hana Kammoun", doctor: "Dr. Bouazizi", type: "Suivi", status: "upcoming" as string, avatar: "HK", amount: "35 DT", cnam: true },
  { id: 11, time: "15:30", patient: "Bilel Nasri", doctor: "Dr. Gharbi", type: "Consultation", status: "upcoming" as string, avatar: "BN", amount: "45 DT", cnam: true },
  { id: 12, time: "16:00", patient: "Olfa Ben Salah", doctor: "Dr. Hammami", type: "Suivi", status: "upcoming" as string, avatar: "OB", amount: "40 DT", cnam: false },
];

const initialCalls = [
  { id: 1, caller: "Hana Kammoun", time: "09:15", type: "Prise de RDV", handled: true, phone: "+216 71 234 567" },
  { id: 2, caller: "Bilel Nasri", time: "09:05", type: "Annulation", handled: true, phone: "+216 22 345 678" },
  { id: 3, caller: "N° inconnu", time: "08:55", type: "Non répondu", handled: false, phone: "+216 98 765 432" },
  { id: 4, caller: "Olfa Ben Salah", time: "08:40", type: "Demande info", handled: true, phone: "+216 55 678 901" },
];

const doctors = [
  { name: "Dr. Bouazizi", specialty: "Généraliste", status: "busy", patient: "Amine Ben Ali", nextFree: "10:00", rdvCount: 6 },
  { name: "Dr. Gharbi", specialty: "Cardiologue", status: "available", patient: null, nextFree: null, rdvCount: 4 },
  { name: "Dr. Hammami", specialty: "Dermatologue", status: "absent", patient: null, nextFree: "14:00", rdvCount: 2 },
];

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  done: { label: "Terminé", class: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  in_progress: { label: "En consultation", class: "bg-primary/10 text-primary", icon: Activity },
  waiting: { label: "En salle", class: "bg-warning/10 text-warning", icon: Clock },
  called: { label: "Appelé", class: "bg-accent/10 text-accent", icon: UserCheck },
  upcoming: { label: "À venir", class: "bg-muted/50 text-muted-foreground", icon: Clock },
};

const SecretaryDashboard = () => {
  const [waitingRoom, setWaitingRoom] = useState(initialWaitingRoom);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [calls, setCalls] = useState(initialCalls);
  const [refreshing, setRefreshing] = useState(false);
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon">("morning");

  const doneCount = appointments.filter(a => a.status === "done").length;
  const inProgressCount = appointments.filter(a => a.status === "in_progress").length;
  const waitingCount = waitingRoom.filter(w => w.status === "waiting").length;
  const totalCA = appointments.filter(a => a.status === "done").reduce((s, a) => s + parseFloat(a.amount), 0);
  const avgWait = waitingRoom.length > 0 ? Math.round(waitingRoom.reduce((s, w) => s + w.waitMin, 0) / waitingRoom.length) : 0;

  const morningAppts = appointments.filter(a => parseInt(a.time) < 13);
  const afternoonAppts = appointments.filter(a => parseInt(a.time) >= 13);
  const displayedAppts = timeSlot === "morning" ? morningAppts : afternoonAppts;

  const handleCallPatient = (id: number) => {
    setWaitingRoom(prev => prev.map(w => w.id === id ? { ...w, status: "called" } : w));
  };

  const handleSendToConsult = (id: number) => {
    setWaitingRoom(prev => prev.filter(w => w.id !== id));
    setAppointments(prev => prev.map(a => {
      const wr = initialWaitingRoom.find(w => w.id === id);
      if (wr && a.patient === wr.patient) return { ...a, status: "in_progress" };
      return a;
    }));
  };

  const handleAccueil = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "waiting" } : a));
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      const maxId = Math.max(...waitingRoom.map(w => w.id), 0);
      setWaitingRoom(prev => [...prev, {
        id: maxId + 1, patient: appt.patient, arrivedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        appointment: appt.time, doctor: appt.doctor, motif: appt.type, status: "waiting", avatar: appt.avatar, cnam: appt.cnam || false, waitMin: 0
      }]);
    }
  };

  const handleDone = (id: number) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "done" } : a));
  };

  const handleCallback = (id: number) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, handled: true, type: "Rappelé" } : c));
  };

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1000); };

  return (
    <DashboardLayout role="secretary" title="Tableau de bord">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Cabinet Médical El Manar</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Tunis · Vendredi 20 Février 2026 · <span className="font-medium text-foreground">09:30</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={handleRefresh}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />Actualiser
            </Button>
            <Link to="/dashboard/secretary/agenda">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm"><Plus className="h-4 w-4 mr-1.5" />Nouveau RDV</Button>
            </Link>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Calendar className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
                <p className="text-[11px] text-muted-foreground">RDV total</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
              <div>
                <p className="text-2xl font-bold text-accent">{doneCount}</p>
                <p className="text-[11px] text-muted-foreground">Terminés</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
              <div>
                <p className="text-2xl font-bold text-warning">{waitingCount}</p>
                <p className="text-[11px] text-muted-foreground">En attente</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Timer className="h-5 w-5 text-destructive" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgWait}<span className="text-sm font-normal text-muted-foreground"> min</span></p>
                <p className="text-[11px] text-muted-foreground">Attente moy.</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><Banknote className="h-5 w-5 text-accent" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCA}<span className="text-sm font-normal text-muted-foreground"> DT</span></p>
                <p className="text-[11px] text-muted-foreground">CA du jour</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progression de la journée</span>
            <span className="text-sm font-bold text-primary">{doneCount}/{appointments.length} — {Math.round((doneCount / appointments.length) * 100)}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 flex">
              <div className="bg-accent h-full" style={{ width: `${(doneCount / appointments.length) * 100}%` }} />
              <div className="bg-primary h-full animate-pulse" style={{ width: `${(inProgressCount / appointments.length) * 100}%` }} />
              <div className="bg-warning h-full" style={{ width: `${(waitingCount / appointments.length) * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[11px]">
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-accent" />Terminés ({doneCount})</span>
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" />En cours ({inProgressCount})</span>
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-warning" />En attente ({waitingCount})</span>
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-muted-foreground/30" />À venir ({appointments.filter(a => a.status === "upcoming").length})</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left: Timeline + Waiting Room */}
          <div className="lg:col-span-2 space-y-5">
            {/* Waiting Room - prominent */}
            <div className="rounded-xl border border-warning/30 bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />Salle d'attente
                  <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-0.5 rounded-full ml-1">{waitingRoom.filter(w => w.status !== "done").length}</span>
                </h3>
              </div>
              {waitingRoom.length === 0 ? (
                <div className="p-8 text-center"><Coffee className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Salle d'attente vide</p></div>
              ) : (
                <div className="divide-y">
                  {waitingRoom.map((w) => (
                    <div key={w.id} className={`p-4 transition-colors ${w.status === "called" ? "bg-accent/5" : "hover:bg-muted/30"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${w.status === "called" ? "bg-accent text-accent-foreground" : "bg-warning/10 text-warning"}`}>
                          {w.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground text-sm">{w.patient}</p>
                            {w.status === "called" && <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold animate-pulse">APPELÉ</span>}
                            {w.cnam && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">CNAM</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{w.doctor} · {w.motif} · RDV {w.appointment}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Timer className="h-3 w-3 text-muted-foreground" />
                            <span className={`text-[11px] font-medium ${w.waitMin > 15 ? "text-destructive" : w.waitMin > 10 ? "text-warning" : "text-muted-foreground"}`}>
                              Arrivé à {w.arrivedAt} · {w.waitMin} min d'attente
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {w.status === "waiting" && (
                            <Button size="sm" className="h-8 text-xs gradient-primary text-primary-foreground" onClick={() => handleCallPatient(w.id)}>
                              <Bell className="h-3.5 w-3.5 mr-1" />Appeler
                            </Button>
                          )}
                          {w.status === "called" && (
                            <Button size="sm" className="h-8 text-xs bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleSendToConsult(w.id)}>
                              <ArrowRight className="h-3.5 w-3.5 mr-1" />Envoyer en consultation
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Appointments Timeline */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Planning du jour</h2>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 rounded-lg border bg-muted/50 p-0.5">
                    <button onClick={() => setTimeSlot("morning")} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${timeSlot === "morning" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      Matin
                    </button>
                    <button onClick={() => setTimeSlot("afternoon")} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${timeSlot === "afternoon" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      Après-midi
                    </button>
                  </div>
                  <Link to="/dashboard/secretary/agenda" className="text-xs text-primary hover:underline flex items-center gap-1">Agenda <ChevronRight className="h-3.5 w-3.5" /></Link>
                </div>
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {displayedAppts.map((a) => {
                  const config = statusConfig[a.status];
                  return (
                    <div key={a.id} className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                      a.status === "in_progress" ? "bg-primary/5 border-l-3 border-l-primary" :
                      a.status === "waiting" ? "bg-warning/5 border-l-3 border-l-warning" :
                      a.status === "done" ? "opacity-40" : "hover:bg-muted/30"
                    }`}>
                      <div className="w-12 text-center shrink-0">
                        <p className={`text-sm font-bold ${a.status === "in_progress" ? "text-primary" : a.status === "done" ? "text-muted-foreground" : "text-foreground"}`}>{a.time}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">{a.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm truncate">{a.patient}</p>
                          {(a as any).teleconsultation && <Video className="h-3.5 w-3.5 text-primary shrink-0" />}
                          {a.cnam && <span className="text-[8px] bg-primary/10 text-primary px-1 py-0.5 rounded font-medium">CNAM</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{a.doctor} · {a.type}</p>
                      </div>
                      <span className="text-xs font-semibold text-foreground shrink-0">{a.amount}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 shrink-0 ${config.class}`}>
                        <config.icon className="h-3 w-3" />{config.label}
                      </span>
                      <div className="flex gap-1 shrink-0">
                        {a.status === "upcoming" && (
                          <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleAccueil(a.id)}>Accueillir</Button>
                        )}
                        {a.status === "in_progress" && (
                          <Button variant="outline" size="sm" className="h-7 text-[10px] text-accent border-accent/30" onClick={() => handleDone(a.id)}>Terminé</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Doctors status */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="border-b px-5 py-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />État des médecins</h3>
              </div>
              <div className="divide-y">
                {doctors.map((d, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {d.name.split(". ")[1]?.[0] || "D"}{d.name.split(". ")[1]?.[1] || ""}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${
                          d.status === "busy" ? "bg-primary" : d.status === "available" ? "bg-accent" : "bg-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{d.name}</p>
                        <p className="text-[11px] text-muted-foreground">{d.specialty} · {d.rdvCount} RDV</p>
                      </div>
                    </div>
                    <div className="mt-2 ml-13">
                      {d.status === "busy" && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-primary font-medium">En consultation — {d.patient}</span>
                        </div>
                      )}
                      {d.status === "available" && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                          <span className="text-accent font-medium">Disponible</span>
                        </div>
                      )}
                      {d.status === "absent" && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          <span className="text-muted-foreground">Absent · Retour à {d.nextFree}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily revenue */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Banknote className="h-4 w-4 text-accent" />Recettes du jour</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Total encaissé</span><span className="font-bold text-foreground text-lg">{totalCA} DT</span></div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Part CNAM</span><span className="font-semibold text-primary">{Math.round(totalCA * 0.7)} DT</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Paiement direct</span><span className="font-semibold text-foreground">{Math.round(totalCA * 0.3)} DT</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Restant à encaisser</span><span className="font-semibold text-warning">{appointments.filter(a => a.status !== "done").reduce((s, a) => s + parseFloat(a.amount), 0)} DT</span></div>
                <div className="pt-2">
                  <Link to="/dashboard/secretary/billing"><Button variant="outline" size="sm" className="w-full text-xs"><FileText className="h-3.5 w-3.5 mr-1" />Facturation détaillée</Button></Link>
                </div>
              </div>
            </div>

            {/* Recent calls */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />Appels récents</h3>
              <div className="space-y-3">
                {calls.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 text-sm">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${c.handled ? "bg-accent/10" : "bg-destructive/10"}`}>
                      <Phone className={`h-3.5 w-3.5 ${c.handled ? "text-accent" : "text-destructive"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{c.caller}</p>
                      <p className="text-[10px] text-muted-foreground">{c.time} · {c.type}</p>
                    </div>
                    {!c.handled && (
                      <Button variant="outline" size="sm" className="h-6 text-[10px] shrink-0" onClick={() => handleCallback(c.id)}>
                        <PhoneCall className="h-3 w-3 mr-1" />Rappeler
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryDashboard;
