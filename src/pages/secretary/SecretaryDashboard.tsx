import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, Users, Phone, Clock, ChevronRight, Plus, 
  UserCheck, UserX, AlertCircle, CheckCircle2, Play,
  Bell, TrendingUp, Video, ArrowRight, PhoneCall,
  ArrowUpRight, ArrowDownRight, Banknote, MapPin,
  FileText, Stethoscope, Activity, BarChart3, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const stats = [
  { label: "RDV aujourd'hui", value: "24", change: "+3 vs hier", trend: "up", icon: Calendar, color: "bg-primary/10 text-primary" },
  { label: "Patients du jour", value: "18", change: "2 nouveaux", trend: "up", icon: Users, color: "bg-accent/10 text-accent" },
  { label: "Appels en attente", value: "5", change: "3 non répondus", trend: "neutral", icon: Phone, color: "bg-warning/10 text-warning" },
  { label: "En salle d'attente", value: "3", change: "Moy. 8 min", trend: "neutral", icon: Clock, color: "bg-destructive/10 text-destructive" },
];

const waitingRoom = [
  { patient: "Amine Ben Ali", arrivedAt: "09:15", appointment: "09:30", doctor: "Dr. Bouazizi", wait: "15 min", status: "waiting", avatar: "AB", cnam: true },
  { patient: "Fatma Trabelsi", arrivedAt: "09:20", appointment: "09:45", doctor: "Dr. Gharbi", wait: "10 min", status: "called", avatar: "FT", cnam: true },
  { patient: "Mohamed Sfar", arrivedAt: "09:25", appointment: "10:00", doctor: "Dr. Bouazizi", wait: "5 min", status: "waiting", avatar: "MS", cnam: false },
];

const todayAppointments = [
  { time: "08:30", patient: "Karim Mansour", doctor: "Dr. Bouazizi", type: "Consultation", status: "done", avatar: "KM" },
  { time: "09:00", patient: "Leila Chahed", doctor: "Dr. Gharbi", type: "Suivi", status: "done", avatar: "LC" },
  { time: "09:30", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", type: "Consultation", status: "in_progress", avatar: "AB" },
  { time: "09:45", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", type: "Suivi", status: "waiting", avatar: "FT" },
  { time: "10:00", patient: "Mohamed Sfar", doctor: "Dr. Bouazizi", type: "Contrôle", status: "upcoming", avatar: "MS" },
  { time: "10:30", patient: "Nadia Jemni", doctor: "Dr. Hammami", type: "Consultation", status: "upcoming", avatar: "NJ" },
  { time: "11:00", patient: "Sami Ayari", doctor: "Dr. Bouazizi", type: "Première visite", status: "upcoming", avatar: "SA" },
  { time: "11:30", patient: "Rania Meddeb", doctor: "Dr. Gharbi", type: "Suivi", status: "upcoming", avatar: "RM" },
  { time: "14:00", patient: "Youssef Belhadj", doctor: "Dr. Bouazizi", type: "Téléconsultation", status: "upcoming", teleconsultation: true, avatar: "YB" },
  { time: "14:30", patient: "Salma Dridi", doctor: "Dr. Hammami", type: "Consultation", status: "upcoming", avatar: "SD" },
];

const recentCalls = [
  { caller: "Hana Kammoun", time: "09:15", type: "Prise de RDV", handled: true, phone: "+216 71 234 567" },
  { caller: "Bilel Nasri", time: "09:05", type: "Annulation", handled: true, phone: "+216 22 345 678" },
  { caller: "N° inconnu", time: "08:55", type: "Non répondu", handled: false, phone: "+216 98 765 432" },
  { caller: "Olfa Ben Salah", time: "08:40", type: "Demande info", handled: true, phone: "+216 55 678 901" },
];

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  done: { label: "Terminé", class: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  in_progress: { label: "En cours", class: "bg-primary/10 text-primary", icon: Play },
  waiting: { label: "En salle", class: "bg-warning/10 text-warning", icon: Clock },
  called: { label: "Appelé", class: "bg-accent/10 text-accent", icon: UserCheck },
  upcoming: { label: "À venir", class: "bg-muted/50 text-muted-foreground", icon: Clock },
};

const todayFinancials = {
  total: "1 250 DT",
  cnam: "875 DT",
  directPayment: "375 DT",
  pendingInvoices: 4,
};

const SecretaryDashboard = () => {
  const doneCount = todayAppointments.filter(a => a.status === "done").length;
  const [refreshing, setRefreshing] = useState(false);

  return (
    <DashboardLayout role="secretary" title="Tableau de bord">
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Cabinet Médical El Manar</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />Tunis · Vendredi 20 Février 2026
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setRefreshing(!refreshing)}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />Actualiser
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <PhoneCall className="h-3.5 w-3.5 mr-1" />Journal d'appels
            </Button>
            <Link to="/dashboard/secretary/agenda">
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />Nouveau RDV
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              {s.change && (
                <p className="text-[11px] text-accent mt-1 flex items-center gap-0.5">
                  {s.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                  {s.change}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's timeline */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Rendez-vous du jour
                <span className="text-xs text-muted-foreground ml-2">{doneCount}/{todayAppointments.length}</span>
              </h2>
              <Link to="/dashboard/secretary/agenda" className="text-sm text-primary hover:underline flex items-center gap-1">
                Agenda complet <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Progress bar */}
            <div className="px-5 pt-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] text-muted-foreground">Progression</span>
                <span className="text-[11px] font-semibold text-primary">{Math.round((doneCount / todayAppointments.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(doneCount / todayAppointments.length) * 100}%` }} />
              </div>
            </div>
            <div className="divide-y max-h-[450px] overflow-y-auto">
              {todayAppointments.map((a, i) => {
                const config = statusConfig[a.status];
                return (
                  <div key={i} className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                    a.status === "in_progress" ? "bg-primary/5 border-l-2 border-l-primary" :
                    a.status === "waiting" ? "bg-warning/5 border-l-2 border-l-warning" :
                    a.status === "done" ? "opacity-50" :
                    "hover:bg-muted/30"
                  }`}>
                    <div className="w-12 text-center shrink-0">
                      <p className={`text-sm font-semibold ${a.status === "in_progress" ? "text-primary" : "text-foreground"}`}>{a.time}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary shrink-0">
                      {a.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm truncate">{a.patient}</p>
                        {(a as any).teleconsultation && <Video className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{a.doctor} · {a.type}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium flex items-center gap-1 shrink-0 ${config.class}`}>
                      <config.icon className="h-3 w-3" />
                      {config.label}
                    </span>
                    {a.status === "upcoming" && (
                      <Button variant="outline" size="sm" className="h-7 text-[11px] shrink-0">
                        Accueillir
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Waiting room */}
            <div className="rounded-xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  Salle d'attente
                </h3>
                <span className="text-xs font-semibold text-warning bg-warning/10 px-2.5 py-1 rounded-full">
                  {waitingRoom.length}
                </span>
              </div>
              <div className="divide-y">
                {waitingRoom.map((w, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                        w.status === "called" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
                      }`}>
                        {w.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{w.patient}</p>
                          {w.status === "called" && (
                            <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium">Appelé</span>
                          )}
                          {w.cnam && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">CNAM</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{w.doctor} · RDV {w.appointment}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xs font-semibold ${parseInt(w.wait) > 10 ? "text-destructive" : "text-muted-foreground"}`}>
                          {w.wait}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's financials */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-accent" />
                Recettes du jour
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total encaissé</span>
                  <span className="font-bold text-foreground">{todayFinancials.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Part CNAM</span>
                  <span className="font-semibold text-primary">{todayFinancials.cnam}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paiement direct</span>
                  <span className="font-semibold text-foreground">{todayFinancials.directPayment}</span>
                </div>
                <div className="pt-2 border-t">
                  <Link to="/dashboard/secretary/billing">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <FileText className="h-3.5 w-3.5 mr-1" />Voir la facturation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent calls */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Appels récents
              </h3>
              <div className="space-y-3">
                {recentCalls.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      c.handled ? "bg-accent/10" : "bg-destructive/10"
                    }`}>
                      <Phone className={`h-3.5 w-3.5 ${c.handled ? "text-accent" : "text-destructive"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{c.caller}</p>
                      <p className="text-[10px] text-muted-foreground">{c.time} · {c.type}</p>
                    </div>
                    {!c.handled && (
                      <Button variant="outline" size="sm" className="h-6 text-[10px] shrink-0">
                        Rappeler
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor status */}
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                État des médecins
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Dr. Bouazizi", status: "En consultation", patient: "Amine Ben Ali", color: "bg-primary", specialty: "Généraliste" },
                  { name: "Dr. Gharbi", status: "Disponible", patient: null, color: "bg-accent", specialty: "Cardiologue" },
                  { name: "Dr. Hammami", status: "Absent ce matin", patient: null, color: "bg-muted-foreground", specialty: "Dermatologue" },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {d.name.split(". ")[1]?.[0] || "D"}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${d.color} border-2 border-card`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">{d.specialty} · {d.status}{d.patient ? ` — ${d.patient}` : ""}</p>
                    </div>
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
