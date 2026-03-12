import DashboardLayout from "@/components/layout/DashboardLayout";
import UpgradeBanner from "@/components/shared/UpgradeBanner";
import { useDoctorSubscription } from "@/stores/doctorSubscriptionStore";
import { plansByActivity } from "@/stores/featureMatrixStore";
import { getSpecialtyConfig } from "@/components/consultation/specialtyConfig";
import { useState, useMemo } from "react";
import {
  Calendar, Clock, CheckCircle2, Play,
  Bell, AlertTriangle, MessageSquare, Search,
  FileText, Video, X, ChevronRight,
  Settings, ArrowRight, RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import DoctorJoinTeleconsultButton from "@/components/teleconsultation/DoctorJoinTeleconsultButton";
import { useTeleconsultSessions } from "@/components/teleconsultation/teleconsultSessionStore";
import {
  useRenewalRequests, useProfileCompletion,
  handleRenewal, getProfileCompletionPercent,
} from "@/stores/doctorStore";
import { useSharedAppointments, getTodayDate } from "@/stores/sharedAppointmentsStore";
import { useSharedPatients } from "@/stores/sharedPatientsStore";
import { useActionGating } from "@/hooks/useActionGating";

const CURRENT_DOCTOR = "Dr. Bouazizi";

const DoctorDashboard = () => {
  const teleconsultSessions = useTeleconsultSessions();
  const [allAppointments] = useSharedAppointments();
  const [patients] = useSharedPatients();
  const [renewalRequests] = useRenewalRequests();
  const [profileCompletion] = useProfileCompletion();

  const [sub] = useDoctorSubscription();
  const config = getSpecialtyConfig(sub.activity, sub.specialty);
  const { isEnabled } = useActionGating();
  const isEssentiel = sub.plan === "essentiel";
  const proPlan = plansByActivity[sub.activity]?.find(p => p.id === "pro");
  const completionPercent = getProfileCompletionPercent(profileCompletion);
  const pendingRenewals = renewalRequests.filter(r => r.status === "pending");

  const today = getTodayDate();

  // Derive waiting room from shared appointments store
  const todayAppointments = useMemo(() =>
    allAppointments
      .filter(a => a.date === today && a.doctor === CURRENT_DOCTOR)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [allAppointments, today]
  );

  const activeWaiting = todayAppointments.filter(e => !["done", "cancelled", "absent"].includes(e.status));
  const currentRdv = todayAppointments.find(e => e.status === "in_progress");
  const nextRdv = todayAppointments.find(e => ["pending", "confirmed", "arrived", "in_waiting"].includes(e.status));
  const doneCount = todayAppointments.filter(e => e.status === "done").length;
  const totalCount = todayAppointments.length;

  const getPatientId = (name: string) => {
    const p = patients.find(p => p.name === name);
    return p ? p.id : 1;
  };

  const kpi = config.kpiLabels || { done: "Terminées aujourd'hui", waiting: "En attente", renewals: "Renouvellements", teleconsult: "Téléconsultations" };

  return (
    <DashboardLayout role="doctor" title="Tableau de bord">
      <div className="space-y-6">
        {isEssentiel && (
          <UpgradeBanner
            feature={`Passez au Pro · ${proPlan?.price || 149} DT/mois`}
            description="Débloquez la téléconsultation vidéo, l'assistant IA, les statistiques avancées et la gestion des secrétaires."
          />
        )}
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
            { label: config.sidebarLabels?.["/dashboard/doctor/waiting-room"] || "Salle d'attente", icon: Clock, to: "/dashboard/doctor/waiting-room", color: "text-warning", badge: activeWaiting.length },
            { label: config.sidebarLabels?.["/dashboard/doctor/consultations"] || "Consultation", icon: Play, to: currentRdv ? `/dashboard/doctor/consultation/new?patient=${getPatientId(currentRdv.patient)}` : "/dashboard/doctor/consultations", color: "text-accent" },
            { label: config.sidebarLabels?.["/dashboard/doctor/patients"] || "Mes patients", icon: Search, to: "/dashboard/doctor/patients", color: "text-primary" },
            { label: config.sidebarLabels?.["/dashboard/doctor/prescriptions"] || "Ordonnances", icon: FileText, to: "/dashboard/doctor/prescriptions", color: "text-primary" },
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

        {/* Hero */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl gradient-primary p-5 text-primary-foreground min-h-0">
            <div className="relative z-10">
              <p className="text-primary-foreground/70 text-sm">Bonjour,</p>
              <h2 className="text-xl font-bold mt-0.5">{CURRENT_DOCTOR.replace("Dr. ", "Dr. Ahmed ")}</h2>
              <p className="text-primary-foreground/60 text-xs mt-0.5">{config.dashboardSubtitle}</p>
              <p className="text-primary-foreground/80 mt-1 text-sm">{doneCount}/{totalCount} {config.kpiLabels?.done?.toLowerCase() || "consultations"} · Prochain : <span className="font-semibold">{nextRdv?.startTime || "—"}</span></p>
              <div className="flex gap-3 mt-3 flex-wrap">
                <Link to={`/dashboard/doctor/consultation/new?patient=${currentRdv ? getPatientId(currentRdv.patient) : 1}`}>
                  <Button size="sm" variant="secondary" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"><Play className="h-4 w-4 mr-1.5" />Démarrer {sub.activity === "kine" ? "séance" : "consultation"}</Button>
                </Link>
                <Link to="/dashboard/doctor/waiting-room">
                  <Button size="sm" variant="secondary" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"><Clock className="h-4 w-4 mr-1.5" />{config.sidebarLabels?.["/dashboard/doctor/waiting-room"] || "Salle d'attente"} ({activeWaiting.length})</Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          </div>

          {/* Waiting room */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-warning" />{config.sidebarLabels?.["/dashboard/doctor/waiting-room"] || "Salle d'attente"}</h3>
              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">{activeWaiting.length}</span>
            </div>
            <div className="space-y-2.5">
              {activeWaiting.slice(0, 4).map((w) => (
                <div key={w.id} className={`flex items-center gap-3 rounded-lg border p-3 ${w.status === "in_progress" ? "bg-accent/5 border-accent/20" : "bg-warning/5 border-warning/20"}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${w.status === "in_progress" ? "gradient-primary text-primary-foreground" : "bg-warning/10 text-warning"}`}>{w.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{w.patient}</p>
                    <p className="text-xs text-muted-foreground">RDV {w.startTime} · {w.status === "in_progress" ? "En consultation" : w.status === "in_waiting" ? `Attente depuis ${w.arrivedAt}` : "À venir"}</p>
                  </div>
                  {w.status !== "in_progress" && (
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

        {/* Renewal requests */}
        {pendingRenewals.length > 0 && isEnabled("doctor.handle_renewal") && (
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
                    <p className="text-xs text-muted-foreground truncate">{req.items.join(", ")} · {req.prescriptionId}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground"
                      onClick={() => { const ok = handleRenewal(req.id, "approved"); if (!ok) { toast({ title: "Action désactivée" }); return; } toast({ title: "Renouvellement accepté", description: `Ordonnance renouvelée pour ${req.patientName}.` }); }}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />Accepter
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                      onClick={() => { const ok = handleRenewal(req.id, "rejected"); if (!ok) { toast({ title: "Action désactivée" }); return; } toast({ title: "Refusé", description: `Demande de ${req.patientName} refusée.` }); }}>
                      <X className="h-3 w-3 mr-1" />Refuser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teleconsultations actives */}
        {!config.hideTeleconsult && teleconsultSessions.filter(s => s.status !== "ended").length > 0 && (
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

        {/* Alerts — derived from today's appointments */}
        {(() => {
          const lateAppts = todayAppointments.filter(a => a.status === "in_waiting" && a.waitTime && a.waitTime > 20);
          const urgentAppts = todayAppointments.filter(a => a.tags?.includes("urgent"));
          const alerts = [
            ...lateAppts.map(a => ({ patient: a.patient, text: `En attente depuis ${a.waitTime} min`, severity: "high" as const, link: "/dashboard/doctor/waiting-room" })),
            ...urgentAppts.map(a => ({ patient: a.patient, text: "Marqué urgent", severity: "high" as const, link: `/dashboard/doctor/patients/${getPatientId(a.patient)}` })),
          ];
          if (alerts.length === 0) return null;
          return (
            <div className="rounded-xl border bg-card shadow-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-destructive" />
                <h3 className="font-semibold text-foreground text-sm">Alertes</h3>
                <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{alerts.length}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {alerts.map((a, i) => (
                  <Link key={i} to={a.link} className="rounded-lg border p-3 flex items-start gap-2 cursor-pointer hover:shadow-sm transition-all border-destructive/30 bg-destructive/5 hover:bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1"><p className="text-xs font-medium text-foreground">{a.patient}</p><p className="text-xs text-muted-foreground mt-0.5">{a.text}</p></div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{doneCount}</p>
            <p className="text-xs text-muted-foreground">{kpi.done}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-warning">{activeWaiting.length}</p>
            <p className="text-xs text-muted-foreground">{kpi.waiting}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-primary">{pendingRenewals.length}</p>
            <p className="text-xs text-muted-foreground">{kpi.renewals}</p>
          </div>
          {!config.hideTeleconsult && (
            <div className="rounded-xl border bg-card p-4 shadow-card text-center">
              <p className="text-2xl font-bold text-accent">{teleconsultSessions.filter(s => s.status !== "ended").length}</p>
              <p className="text-xs text-muted-foreground">{kpi.teleconsult}</p>
            </div>
          )}
          {config.hideTeleconsult && (
            <div className="rounded-xl border bg-card p-4 shadow-card text-center">
              <p className="text-2xl font-bold text-accent">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Total du jour</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
