import DashboardLayout from "@/components/layout/DashboardLayout";
import UpgradeBanner from "@/components/shared/UpgradeBanner";
import { useDoctorSubscription } from "@/stores/doctorSubscriptionStore";
import { plansByActivity } from "@/stores/featureMatrixStore";
import { useState } from "react";
import {
  Calendar, Clock, CheckCircle2, Play,
  Bell, AlertTriangle, MessageSquare, Search,
  MoreHorizontal, FileText, Video, RefreshCw, X, ChevronRight,
  Settings, ArrowRight, Pill, UserCheck, RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockUrgentAlerts, mockDoctorProfile, mockPatients } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import DoctorJoinTeleconsultButton from "@/components/teleconsultation/DoctorJoinTeleconsultButton";
import { useTeleconsultSessions } from "@/components/teleconsultation/teleconsultSessionStore";
import {
  useWaitingRoom, useRenewalRequests, useProfileCompletion,
  handleRenewal, getProfileCompletionPercent, type WaitingEntry
} from "@/stores/doctorStore";

const getPatientId = (name: string) => {
  const p = mockPatients.find(p => p.name === name);
  return p ? p.id : 1;
};

type StatusFilter = "all" | "done" | "current" | "upcoming";

const DoctorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const teleconsultSessions = useTeleconsultSessions();
  const [waitingEntries] = useWaitingRoom();
  const [renewalRequests] = useRenewalRequests();
  const [profileCompletion] = useProfileCompletion();

  const [sub] = useDoctorSubscription();
  const isEssentiel = sub.plan === "essentiel";
  const proPlan = plansByActivity[sub.activity]?.find(p => p.id === "pro");
  const completionPercent = getProfileCompletionPercent(profileCompletion);
  const pendingRenewals = renewalRequests.filter(r => r.status === "pending");

  // Derive schedule-like data from waiting room
  const activeWaiting = waitingEntries.filter(e => !["completed", "absent"].includes(e.status));
  const currentRdv = waitingEntries.find(e => e.status === "in_consultation");
  const nextRdv = waitingEntries.find(e => e.status === "scheduled" || e.status === "arrived" || e.status === "waiting");
  const doneCount = waitingEntries.filter(e => e.status === "completed").length;
  const totalCount = waitingEntries.length;

  return (
    <DashboardLayout role="doctor" title="Tableau de bord">
      <div className="space-y-6">
        {/* Upgrade banner for Essentiel plan */}
        {isEssentiel && (
          <UpgradeBanner
            feature={`Passez au Pro · ${proPlan?.price || 149} DT/mois`}
            description="Débloquez la téléconsultation vidéo, l'assistant IA, les statistiques avancées et la gestion des secrétaires."
          />
        )}
        {/* Profile completion banner */}
        {completionPercent < 100 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-warning/30 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-warning">{completionPercent}%</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Complétez votre profil</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {!profileCompletion.photo && "Ajoutez une photo · "}
                {!profileCompletion.presentation && "Rédigez votre présentation · "}
                Un profil complet attire plus de patients.
              </p>
            </div>
            <Link to="/dashboard/doctor/settings">
              <Button size="sm" variant="outline" className="text-xs shrink-0">
                <Settings className="h-3.5 w-3.5 mr-1" />Compléter
              </Button>
            </Link>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Planning", icon: Calendar, to: "/dashboard/doctor/schedule", color: "text-primary" },
            { label: "Salle d'attente", icon: Clock, to: "/dashboard/doctor/waiting-room", color: "text-warning", badge: activeWaiting.length },
            { label: "Consultation", icon: Play, to: currentRdv ? `/dashboard/doctor/consultation/new?patient=${getPatientId(currentRdv.patient)}` : "/dashboard/doctor/consultations", color: "text-accent" },
            { label: "Mes patients", icon: Search, to: "/dashboard/doctor/patients", color: "text-primary" },
            { label: "Ordonnances", icon: FileText, to: "/dashboard/doctor/prescriptions", color: "text-primary" },
          ].map(action => (
            <Link key={action.label} to={action.to} className="rounded-xl border bg-card p-4 hover:shadow-card transition-all text-center relative">
              <action.icon className={`h-6 w-6 mx-auto ${action.color}`} />
              <p className="text-xs font-medium text-foreground mt-2">{action.label}</p>
              {action.badge && action.badge > 0 && (
                <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-warning text-warning-foreground text-[10px] font-bold flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Hero — compact overview */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl gradient-primary p-5 text-primary-foreground">
            <div className="relative z-10">
              <p className="text-primary-foreground/70 text-sm">Bonjour,</p>
              <h2 className="text-xl font-bold mt-0.5">{mockDoctorProfile.name}</h2>
              <p className="text-primary-foreground/80 mt-1 text-sm">{doneCount}/{totalCount} consultations · Prochain : <span className="font-semibold">{nextRdv?.time || "—"}</span></p>
              <div className="flex gap-3 mt-3 flex-wrap">
                <Link to={`/dashboard/doctor/consultation/new?patient=${currentRdv ? getPatientId(currentRdv.patient) : 1}`}>
                  <Button size="sm" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"><Play className="h-4 w-4 mr-1.5" />Démarrer consultation</Button>
                </Link>
                <Link to="/dashboard/doctor/waiting-room">
                  <Button size="sm" variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"><Clock className="h-4 w-4 mr-1.5" />Salle d'attente ({activeWaiting.length})</Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          </div>

          {/* Waiting room */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-warning" />Salle d'attente</h3>
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{activeWaiting.length}</span>
            </div>
            <div className="space-y-2.5">
              {activeWaiting.slice(0, 4).map((w) => (
                <div key={w.id} className={`flex items-center gap-3 rounded-lg border p-3 ${w.status === "in_consultation" ? "bg-accent/5 border-accent/20" : "bg-warning/5 border-warning/20"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${w.status === "in_consultation" ? "gradient-primary text-primary-foreground" : "bg-warning/10 text-warning"}`}>{w.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{w.patient}</p>
                    <p className="text-xs text-muted-foreground">RDV {w.time} · {w.status === "in_consultation" ? "En consultation" : w.status === "waiting" ? `Attente depuis ${w.arrivedAt}` : "À venir"}</p>
                  </div>
                  {w.status !== "in_consultation" && (
                    <Link to={`/dashboard/doctor/consultation/new?patient=${getPatientId(w.patient)}`}>
                      <Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground"><Play className="h-3 w-3 mr-1" />Appeler</Button>
                    </Link>
                  )}
                </div>
              ))}
              {activeWaiting.length > 4 && (
                <Link to="/dashboard/doctor/waiting-room" className="text-xs text-primary hover:underline flex items-center justify-center gap-1 pt-1">
                  Voir tout ({activeWaiting.length}) <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              {activeWaiting.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun patient en attente</p>
              )}
            </div>
          </div>
        </div>

        {/* Renewal requests from patients */}
        {pendingRenewals.length > 0 && (
          <div className="rounded-xl border bg-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Demandes de renouvellement</h3>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{pendingRenewals.length}</span>
            </div>
            <div className="space-y-2">
              {pendingRenewals.map(req => (
                <div key={req.id} className="flex items-center gap-3 rounded-lg border p-3 bg-primary/5 border-primary/20">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{req.patientAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{req.patientName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {req.items.join(", ")} · {req.prescriptionId}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground"
                      onClick={() => { handleRenewal(req.id, "approved"); toast({ title: "Renouvellement accepté", description: `Ordonnance renouvelée pour ${req.patientName}.` }); }}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />Accepter
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                      onClick={() => { handleRenewal(req.id, "rejected"); toast({ title: "Refusé", description: `Demande de ${req.patientName} refusée.` }); }}>
                      <X className="h-3 w-3 mr-1" />Refuser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teleconsultations actives */}
        {teleconsultSessions.filter(s => s.status !== "ended").length > 0 && (
          <div className="rounded-xl border bg-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">Téléconsultations</h3>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {teleconsultSessions.filter(s => s.status !== "ended").length}
              </span>
            </div>
            <div className="space-y-2">
              {teleconsultSessions.filter(s => s.status !== "ended").map(session => (
                <div key={session.id} className="flex items-center gap-3 rounded-lg border p-3 bg-primary/5 border-primary/20">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground">{session.patientAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · Téléconsultation
                    </p>
                  </div>
                  <DoctorJoinTeleconsultButton sessionId={session.id} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {mockUrgentAlerts.length > 0 && (
          <div className="rounded-xl border bg-card shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-destructive" />
              <h3 className="font-semibold text-foreground text-sm">Alertes</h3>
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{mockUrgentAlerts.length}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {mockUrgentAlerts.map((a, i) => (
                <Link key={i} to={(a as any).link || "/dashboard/doctor/patients"} className={`rounded-lg border p-3 flex items-start gap-2 cursor-pointer hover:shadow-sm transition-all ${a.severity === "high" ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10" : "bg-card hover:bg-muted/30"}`}>
                  {a.severity === "high" ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /> : <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                  <div className="flex-1"><p className="text-xs font-medium text-foreground">{a.patient}</p><p className="text-xs text-muted-foreground mt-0.5">{a.text}</p></div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick KPIs */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{doneCount}</p>
            <p className="text-xs text-muted-foreground">Terminées aujourd'hui</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-warning">{activeWaiting.length}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-primary">{pendingRenewals.length}</p>
            <p className="text-xs text-muted-foreground">Renouvellements</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-accent">{teleconsultSessions.filter(s => s.status !== "ended").length}</p>
            <p className="text-xs text-muted-foreground">Téléconsultations</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
