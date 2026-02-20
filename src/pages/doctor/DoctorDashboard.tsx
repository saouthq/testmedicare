import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Calendar, Users, ClipboardList, TrendingUp, ChevronRight, Clock, 
  Play, CheckCircle2, AlertTriangle, FileText, Pill, User,
  Video, MessageSquare, Bell, Activity, ArrowRight, Phone, Shield, Banknote
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "RDV aujourd'hui", value: "8", subtext: "2 terminés", icon: Calendar, color: "bg-primary/10 text-primary" },
  { label: "Patients actifs", value: "342", subtext: "+12 ce mois", icon: Users, color: "bg-accent/10 text-accent" },
  { label: "Consultations/mois", value: "124", subtext: "+8% vs dernier mois", icon: ClipboardList, color: "bg-warning/10 text-warning" },
  { label: "CA mensuel", value: "4 340 DT", subtext: "+12%", icon: Banknote, color: "bg-primary/10 text-primary" },
];

const todaySchedule = [
  { time: "08:30", patient: "Amine Ben Ali", type: "Consultation", duration: "30 min", status: "done", motif: "Suivi diabète", avatar: "AB", cnam: true },
  { time: "09:00", patient: "Fatma Trabelsi", type: "Suivi", duration: "20 min", status: "done", motif: "Contrôle tension", avatar: "FT", cnam: true },
  { time: "09:30", patient: "Mohamed Sfar", type: "Première visite", duration: "45 min", status: "current", motif: "Bilan initial", avatar: "MS", cnam: false },
  { time: "10:15", patient: "Nadia Jemni", type: "Contrôle", duration: "20 min", status: "upcoming", motif: "Douleurs articulaires", avatar: "NJ", cnam: true },
  { time: "10:45", patient: "Sami Ayari", type: "Consultation", duration: "30 min", status: "upcoming", motif: "Renouvellement ordonnance", avatar: "SA", cnam: true },
  { time: "14:00", patient: "Rania Meddeb", type: "Suivi", duration: "20 min", status: "upcoming", motif: "Suivi cholestérol", avatar: "RM", cnam: true },
  { time: "14:30", patient: "Youssef Belhadj", type: "Téléconsultation", duration: "20 min", status: "upcoming", motif: "Résultats analyses", avatar: "YB", teleconsultation: true, cnam: false },
  { time: "15:00", patient: "Salma Dridi", type: "Consultation", duration: "30 min", status: "upcoming", motif: "Certificat médical", avatar: "SD", cnam: true },
];

const waitingRoom = [
  { patient: "Mohamed Sfar", arrivedAt: "09:20", appointment: "09:30", wait: "10 min" },
  { patient: "Nadia Jemni", arrivedAt: "10:05", appointment: "10:15", wait: "0 min" },
];

const urgentAlerts = [
  { type: "result", patient: "Fatma Trabelsi", text: "Résultats analyses — Cholestérol élevé", severity: "high" },
  { type: "message", patient: "Amine Ben Ali", text: "Question sur posologie Metformine", severity: "normal" },
];

const DoctorDashboard = () => {
  const doneCount = todaySchedule.filter(s => s.status === "done").length;
  const totalCount = todaySchedule.length;

  return (
    <DashboardLayout role="doctor" title="Tableau de bord">
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl gradient-primary p-6 text-primary-foreground">
            <div className="relative z-10">
              <p className="text-primary-foreground/70 text-sm">Bonjour,</p>
              <h2 className="text-2xl font-bold mt-1">Dr. Ahmed Bouazizi</h2>
              <p className="text-primary-foreground/80 mt-2 text-sm">{doneCount}/{totalCount} consultations effectuées · Prochaine : <span className="font-semibold">10:15</span></p>
              <div className="flex gap-3 mt-4">
                <Link to="/dashboard/doctor/consultation/new">
                  <Button size="sm" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"><Play className="h-4 w-4 mr-1.5" />Démarrer consultation</Button>
                </Link>
                <Link to="/dashboard/doctor/schedule">
                  <Button size="sm" variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20">Voir le planning</Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          </div>

          <div className="rounded-xl border bg-card shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-warning" />Salle d'attente</h3>
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{waitingRoom.length} patient{waitingRoom.length > 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-3">
              {waitingRoom.map((w, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3 bg-warning/5 border-warning/20">
                  <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center text-xs font-medium text-warning">{w.patient.split(" ").map(n => n[0]).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{w.patient}</p>
                    <p className="text-xs text-muted-foreground">RDV {w.appointment} · Attente {w.wait}</p>
                  </div>
                  <Link to="/dashboard/doctor/consultation/new"><Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground"><Play className="h-3 w-3 mr-1" />Appeler</Button></Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              <p className="text-[11px] text-accent mt-1">{s.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Planning du jour</h2>
              <Link to="/dashboard/doctor/schedule" className="text-sm text-primary hover:underline flex items-center gap-1">Semaine <ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {todaySchedule.map((s, i) => (
                <div key={i} className={`flex items-center gap-4 px-5 py-3 transition-colors ${s.status === "current" ? "bg-primary/5" : s.status === "done" ? "opacity-50" : "hover:bg-muted/30"}`}>
                  <div className="w-14 text-center shrink-0">
                    <p className={`text-sm font-semibold ${s.status === "current" ? "text-primary" : "text-foreground"}`}>{s.time}</p>
                    <p className="text-[10px] text-muted-foreground">{s.duration}</p>
                  </div>
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`h-3 w-3 rounded-full border-2 ${s.status === "done" ? "bg-accent border-accent" : s.status === "current" ? "bg-primary border-primary animate-pulse" : "bg-card border-border"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm truncate">{s.patient}</p>
                      {(s as any).teleconsultation && <Video className="h-3.5 w-3.5 text-primary shrink-0" />}
                      {s.cnam && <Shield className="h-3 w-3 text-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{s.motif}</p>
                  </div>
                  <div className="shrink-0">
                    {s.status === "done" && <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[11px] font-medium flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Terminé</span>}
                    {s.status === "current" && <Link to="/dashboard/doctor/consultation/new"><Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground"><Play className="h-3 w-3 mr-1" />En cours</Button></Link>}
                    {s.status === "upcoming" && <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[11px] font-medium">À venir</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Bell className="h-4 w-4 text-destructive" />Alertes<span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full ml-auto">{urgentAlerts.length}</span></h3>
              <div className="space-y-3">
                {urgentAlerts.map((a, i) => (
                  <div key={i} className={`rounded-lg border p-3 ${a.severity === "high" ? "border-destructive/30 bg-destructive/5" : "bg-card"}`}>
                    <div className="flex items-start gap-2">
                      {a.severity === "high" ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /> : <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                      <div><p className="text-xs font-medium text-foreground">{a.patient}</p><p className="text-xs text-muted-foreground mt-0.5">{a.text}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-semibold text-foreground mb-4">Actions rapides</h3>
              <div className="space-y-2">
                <Link to="/dashboard/doctor/consultation/new"><Button variant="outline" className="w-full justify-start h-10 text-sm" size="sm"><ClipboardList className="h-4 w-4 mr-2 text-primary" />Nouvelle consultation</Button></Link>
                <Link to="/dashboard/doctor/prescriptions"><Button variant="outline" className="w-full justify-start h-10 text-sm" size="sm"><Pill className="h-4 w-4 mr-2 text-warning" />Rédiger ordonnance</Button></Link>
                <Link to="/dashboard/doctor/patients"><Button variant="outline" className="w-full justify-start h-10 text-sm" size="sm"><Users className="h-4 w-4 mr-2 text-accent" />Rechercher patient</Button></Link>
                <Link to="/dashboard/doctor/messages"><Button variant="outline" className="w-full justify-start h-10 text-sm" size="sm"><MessageSquare className="h-4 w-4 mr-2 text-primary" />Messagerie</Button></Link>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Ce mois</h3>
                <Link to="/dashboard/doctor/stats" className="text-xs text-primary hover:underline">Détails</Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Consultations</span><span className="font-semibold text-foreground">94</span></div>
                <div className="w-full h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: "76%" }} /></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">CA mensuel</span><span className="font-semibold text-foreground">4 340 DT</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Taux d'annulation</span><span className="font-semibold text-accent">4.2%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
