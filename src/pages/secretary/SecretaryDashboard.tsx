import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, Clock, CheckCircle2, Play,
  Bell, MapPin, RefreshCw, Plus, Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { mockSecretaryWaitingRoom, mockSecretaryAppointments } from "@/data/mockData";

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  done: { label: "Terminé", class: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  in_progress: { label: "En consultation", class: "bg-primary/10 text-primary", icon: Play },
  waiting: { label: "En salle", class: "bg-warning/10 text-warning", icon: Clock },
  called: { label: "Appelé", class: "bg-accent/10 text-accent", icon: Bell },
  upcoming: { label: "À venir", class: "bg-muted/50 text-muted-foreground", icon: Clock },
};

const SecretaryDashboard = () => {
  const [waitingRoom, setWaitingRoom] = useState(mockSecretaryWaitingRoom);
  const [appointments, setAppointments] = useState(mockSecretaryAppointments);
  const [refreshing, setRefreshing] = useState(false);
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon">("morning");

  const morningAppts = appointments.filter(a => parseInt(a.time) < 13);
  const afternoonAppts = appointments.filter(a => parseInt(a.time) >= 13);
  const displayedAppts = timeSlot === "morning" ? morningAppts : afternoonAppts;

  const handleCallPatient = (id: number) => {
    setWaitingRoom(prev => prev.map(w => w.id === id ? { ...w, status: "called" } : w));
  };

  const handleSendToConsult = (id: number) => {
    setWaitingRoom(prev => prev.filter(w => w.id !== id));
    setAppointments(prev => prev.map(a => {
      const wr = mockSecretaryWaitingRoom.find(w => w.id === id);
      if (wr && a.patient === wr.patient) return { ...a, status: "in_progress" };
      return a;
    }));
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

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left: Waiting Room + Timeline */}
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
                <div className="p-8 text-center"><Timer className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Salle d'attente vide</p></div>
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
                              <Play className="h-3.5 w-3.5 mr-1" />En consultation
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
                        <p className="text-sm font-semibold text-foreground">{a.time}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.class}`}>{config.label}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{a.patient}</p>
                          {a.cnam && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">CNAM</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{a.type} · {a.doctor}</p>
                      </div>
                      <span className="text-xs font-bold text-foreground">{a.amount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretaryDashboard;
