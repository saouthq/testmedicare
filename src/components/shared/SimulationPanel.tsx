/**
 * SimulationPanel — Comprehensive dev tool for testing ALL workflows across all roles.
 * Floating button → opens panel with tabs: Navigation, Workflows, Plan, Spécialités, Admin.
 */
import { useState, useMemo } from "react";
import {
  Zap, X, FlaskConical, Pill, Stethoscope, UserX, Crown, Eye, Heart, Ear, Brain, Baby, Bone, Smile,
  LayoutDashboard, Users, Calendar, FileText, Settings, MessageSquare, ClipboardList, Banknote,
  Building2, ShieldCheck, BarChart3, Plug, Bot, Clock, Gavel, Flag, CreditCard, ScrollText, Activity,
  UserCheck, CalendarPlus, Send, Video, Phone, Bell, RefreshCw, Lock, CheckCircle2, AlertTriangle,
  ArrowRight, Inbox, Upload, Download, Star, Truck, Power, Key, FileDown, CalendarDays, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { pharmacyRespond, prescriptionsStore } from "@/stores/prescriptionsStore";
import { updateLabDemandStatus, addLabPdf, labStore } from "@/stores/labStore";
import {
  sharedAppointmentsStore, completeAppointmentConsultation, markAppointmentAbsent,
  sendToWaitingRoom, startAppointmentConsultation, createAppointment, getTodayDate,
  cancelAppointment, rescheduleAppointment,
} from "@/stores/sharedAppointmentsStore";
import { resetDemo } from "@/stores/seedStores";
import { toast } from "sonner";
import { useDoctorSubscription, setDoctorPlan, setDoctorActivity } from "@/stores/doctorSubscriptionStore";
import { activities, plansByActivity, specialtyFeatureHighlights, type ActivityType } from "@/stores/featureMatrixStore";
import { useNavigate, useLocation } from "react-router-dom";
import { switchDemoRole, loginDemoAs, type UserRole } from "@/stores/authStore";
import { pushNotification, notifyPatient, notifyDoctor } from "@/stores/notificationsStore";
import { useAdminModules, toggleModule, platformModules } from "@/stores/adminModulesStore";

type PanelTab = "navigation" | "simulation" | "plan" | "specialty" | "admin";

const specialtyConfigs = [
  { id: "generaliste", label: "Généraliste", icon: Stethoscope, activity: "generaliste" as ActivityType, specialty: undefined, color: "text-primary" },
  { id: "cardiologue", label: "Cardiologue", icon: Heart, activity: "specialiste" as ActivityType, specialty: "Cardiologue", color: "text-red-500" },
  { id: "ophtalmologue", label: "Ophtalmologue", icon: Eye, activity: "specialiste" as ActivityType, specialty: "Ophtalmologue", color: "text-blue-500" },
  { id: "dermatologue", label: "Dermatologue", icon: Stethoscope, activity: "specialiste" as ActivityType, specialty: "Dermatologue", color: "text-pink-500" },
  { id: "pediatre", label: "Pédiatre", icon: Baby, activity: "specialiste" as ActivityType, specialty: "Pédiatre", color: "text-green-500" },
  { id: "orl", label: "ORL", icon: Ear, activity: "specialiste" as ActivityType, specialty: "ORL", color: "text-amber-500" },
  { id: "neurologue", label: "Neurologue", icon: Brain, activity: "specialiste" as ActivityType, specialty: "Neurologue", color: "text-purple-500" },
  { id: "psychiatre", label: "Psychiatre", icon: Brain, activity: "specialiste" as ActivityType, specialty: "Psychiatre", color: "text-indigo-500" },
  { id: "gynecologue", label: "Gynécologue", icon: Heart, activity: "specialiste" as ActivityType, specialty: "Gynécologue", color: "text-rose-500" },
  { id: "dentiste", label: "Dentiste", icon: Smile, activity: "dentiste" as ActivityType, specialty: undefined, color: "text-cyan-500" },
  { id: "kine", label: "Kinésithérapeute", icon: Bone, activity: "kine" as ActivityType, specialty: undefined, color: "text-orange-500" },
];

interface NavGroup { label: string; icon: any; color: string; role: string; links: { label: string; url: string; icon: any }[] }

const roleNavGroups: NavGroup[] = [
  {
    label: "Patient", icon: Users, color: "text-primary", role: "patient",
    links: [
      { label: "Dashboard", url: "/dashboard/patient", icon: LayoutDashboard },
      { label: "Rendez-vous", url: "/dashboard/patient/appointments", icon: Calendar },
      { label: "Recherche", url: "/search", icon: Eye },
      { label: "Espace santé", url: "/dashboard/patient/health", icon: Activity },
      { label: "Ordonnances", url: "/dashboard/patient/prescriptions", icon: FileText },
      { label: "Notifications", url: "/dashboard/patient/notifications", icon: Bell },
      { label: "Messagerie", url: "/dashboard/patient/messages", icon: MessageSquare },
      { label: "Paramètres", url: "/dashboard/patient/settings", icon: Settings },
    ],
  },
  {
    label: "Médecin", icon: Stethoscope, color: "text-accent", role: "doctor",
    links: [
      { label: "Dashboard", url: "/dashboard/doctor", icon: LayoutDashboard },
      { label: "Planning", url: "/dashboard/doctor/schedule", icon: Calendar },
      { label: "Salle d'attente", url: "/dashboard/doctor/waiting-room", icon: Clock },
      { label: "Patients", url: "/dashboard/doctor/patients", icon: Users },
      { label: "Consultation", url: "/dashboard/doctor/consultation/new?patient=1", icon: ClipboardList },
      { label: "Fiche patient", url: "/dashboard/doctor/patients/1", icon: Eye },
      { label: "Protocoles", url: "/dashboard/doctor/protocols", icon: BookOpen },
      { label: "Documents", url: "/dashboard/doctor/documents", icon: FileText },
      { label: "Tarifs", url: "/dashboard/doctor/tarifs", icon: Banknote },
      { label: "Congés", url: "/dashboard/doctor/leaves", icon: CalendarDays },
      { label: "Facturation", url: "/dashboard/doctor/billing", icon: Banknote },
      { label: "Téléconsultation", url: "/dashboard/doctor/teleconsultation", icon: Video },
      { label: "Connect", url: "/dashboard/doctor/connect", icon: Plug },
      { label: "Assistant IA", url: "/dashboard/doctor/ai-assistant", icon: Bot },
      { label: "Statistiques", url: "/dashboard/doctor/stats", icon: BarChart3 },
      { label: "Secrétaires", url: "/dashboard/doctor/secretary", icon: Building2 },
      { label: "Paramètres", url: "/dashboard/doctor/settings", icon: Settings },
    ],
  },
  {
    label: "Pharmacie", icon: Pill, color: "text-warning", role: "pharmacy",
    links: [
      { label: "Dashboard", url: "/dashboard/pharmacy", icon: LayoutDashboard },
      { label: "Ordonnances", url: "/dashboard/pharmacy/prescriptions", icon: FileText },
      { label: "Stock", url: "/dashboard/pharmacy/stock", icon: Pill },
      { label: "Patients", url: "/dashboard/pharmacy/patients", icon: Users },
      { label: "Historique", url: "/dashboard/pharmacy/history", icon: Clock },
      { label: "Connect", url: "/dashboard/pharmacy/connect", icon: Plug },
      { label: "Paramètres", url: "/dashboard/pharmacy/settings", icon: Settings },
    ],
  },
  {
    label: "Laboratoire", icon: FlaskConical, color: "text-accent", role: "laboratory",
    links: [
      { label: "Dashboard", url: "/dashboard/laboratory", icon: LayoutDashboard },
      { label: "Analyses", url: "/dashboard/laboratory/analyses", icon: FlaskConical },
      { label: "Résultats", url: "/dashboard/laboratory/results", icon: ClipboardList },
      { label: "Patients", url: "/dashboard/laboratory/patients", icon: Users },
      { label: "Qualité", url: "/dashboard/laboratory/quality", icon: ShieldCheck },
      { label: "Statistiques", url: "/dashboard/laboratory/reporting", icon: BarChart3 },
      { label: "Paramètres", url: "/dashboard/laboratory/settings", icon: Settings },
    ],
  },
  {
    label: "Secrétaire", icon: Building2, color: "text-primary", role: "secretary",
    links: [
      { label: "Dashboard", url: "/dashboard/secretary", icon: LayoutDashboard },
      { label: "Agenda", url: "/dashboard/secretary/agenda", icon: Calendar },
      { label: "Patients", url: "/dashboard/secretary/patients", icon: Users },
      { label: "Bureau", url: "/dashboard/secretary/office", icon: Building2 },
      { label: "Documents", url: "/dashboard/secretary/documents", icon: FileText },
      { label: "Facturation", url: "/dashboard/secretary/billing", icon: Banknote },
      { label: "Journal appels", url: "/dashboard/secretary/call-log", icon: Phone },
      { label: "SMS & Rappels", url: "/dashboard/secretary/sms", icon: Send },
      { label: "Statistiques", url: "/dashboard/secretary/stats", icon: BarChart3 },
      { label: "Paramètres", url: "/dashboard/secretary/settings", icon: Settings },
    ],
  },
  {
    label: "Hôpital", icon: Building2, color: "text-accent", role: "hospital",
    links: [
      { label: "Dashboard", url: "/dashboard/hospital", icon: LayoutDashboard },
      { label: "Services", url: "/dashboard/hospital/departments", icon: Building2 },
      { label: "Patients", url: "/dashboard/hospital/patients", icon: Users },
      { label: "Personnel", url: "/dashboard/hospital/staff", icon: Stethoscope },
      { label: "Équipements", url: "/dashboard/hospital/equipment", icon: Activity },
      { label: "Paramètres", url: "/dashboard/hospital/settings", icon: Settings },
    ],
  },
  {
    label: "Clinique", icon: Building2, color: "text-primary", role: "clinic",
    links: [
      { label: "Dashboard", url: "/dashboard/clinic", icon: LayoutDashboard },
      { label: "Médecins", url: "/dashboard/clinic/doctors", icon: Stethoscope },
      { label: "Rendez-vous", url: "/dashboard/clinic/appointments", icon: Calendar },
      { label: "Salles", url: "/dashboard/clinic/rooms", icon: Building2 },
      { label: "Paramètres", url: "/dashboard/clinic/settings", icon: Settings },
    ],
  },
  {
    label: "Admin", icon: ShieldCheck, color: "text-destructive", role: "admin",
    links: [
      { label: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
      { label: "Utilisateurs", url: "/dashboard/admin/users", icon: Users },
      { label: "Vérifications", url: "/dashboard/admin/verifications", icon: ShieldCheck },
      { label: "Modules", url: "/dashboard/admin/modules", icon: Power },
      { label: "Config Sidebar", url: "/dashboard/admin/sidebar-config", icon: Settings },
      { label: "Plans", url: "/dashboard/admin/plans", icon: Crown },
      { label: "Feature Matrix", url: "/dashboard/admin/feature-matrix", icon: BarChart3 },
      { label: "Feature Flags", url: "/dashboard/admin/feature-flags", icon: Flag },
      { label: "Litiges", url: "/dashboard/admin/disputes", icon: Gavel },
      { label: "Modération", url: "/dashboard/admin/moderation", icon: Flag },
      { label: "Audit Logs", url: "/dashboard/admin/audit-logs", icon: ScrollText },
      { label: "Paiements", url: "/dashboard/admin/payments", icon: CreditCard },
      { label: "Abonnements", url: "/dashboard/admin/subscriptions", icon: CreditCard },
      { label: "Paramètres", url: "/dashboard/admin/settings", icon: Settings },
    ],
  },
  {
    label: "Public", icon: Eye, color: "text-muted-foreground", role: "public",
    links: [
      { label: "Accueil", url: "/", icon: LayoutDashboard },
      { label: "Recherche", url: "/search", icon: Eye },
      { label: "Profil médecin", url: "/doctor/1", icon: Stethoscope },
      { label: "Réservation", url: "/booking/1", icon: Calendar },
      { label: "Mes RDV", url: "/my-appointments", icon: Calendar },
      { label: "Cliniques", url: "/clinics", icon: Building2 },
      { label: "Hôpitaux", url: "/hospitals", icon: Building2 },
      { label: "Pharmacies", url: "/pharmacies", icon: Pill },
      { label: "Médicaments", url: "/medicaments", icon: FlaskConical },
      { label: "Comment ça marche", url: "/how-it-works", icon: Eye },
      { label: "Devenir partenaire", url: "/become-partner", icon: Users },
      { label: "Aide", url: "/help", icon: MessageSquare },
    ],
  },
];

function resolveRole(url: string): string | undefined {
  if (url.startsWith("/dashboard/pharmacy")) return "pharmacy";
  if (url.startsWith("/dashboard/laboratory")) return "laboratory";
  if (url.startsWith("/dashboard/secretary")) return "secretary";
  if (url.startsWith("/dashboard/doctor")) return "doctor";
  if (url.startsWith("/dashboard/patient")) return "patient";
  if (url.startsWith("/dashboard/hospital")) return "hospital";
  if (url.startsWith("/dashboard/clinic")) return "clinic";
  if (url.startsWith("/dashboard/admin")) return "admin";
  return undefined;
}

const SimulationPanel = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("navigation");
  const [sub] = useDoctorSubscription();
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [moduleStates] = useAdminModules();
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Simulation actions ───────────────────────────────

  const simulatePharmacyReady = () => {
    const prescriptions = prescriptionsStore.read();
    const pending = prescriptions.flatMap((p) =>
      p.sentToPharmacies
        .filter((ph) => ph.status === "pending")
        .map((ph) => ({ prescriptionId: p.id, pharmacyId: ph.pharmacyId, pharmacyName: ph.pharmacyName }))
    );
    if (pending.length === 0) {
      toast.info("Aucune ordonnance en attente côté pharmacie.");
      return;
    }
    const item = pending[0];
    pharmacyRespond(item.prescriptionId, item.pharmacyId, { status: "ready", pickupTime: "Avant 18h" });
    toast.success(`✅ Pharmacie "${item.pharmacyName}" → prête pour ${item.prescriptionId}`);
  };

  const simulateLabTransmit = () => {
    const demands = labStore.read();
    const ready = demands.find((d) => d.status === "results_ready");
    const inProgress = demands.find((d) => d.status === "in_progress");
    const received = demands.find((d) => d.status === "received");
    const target = ready || inProgress || received;
    if (!target) { toast.info("Aucune demande labo à traiter."); return; }
    if (target.status === "received") {
      updateLabDemandStatus(target.id, "in_progress");
      toast.success(`🔬 ${target.id} → en cours d'analyse`);
    } else if (target.status === "in_progress") {
      addLabPdf(target.id, { id: `PDF-sim-${Date.now()}`, name: `Resultat_${target.id}.pdf`, size: "250 Ko", uploadedAt: new Date().toLocaleDateString("fr-FR") });
      updateLabDemandStatus(target.id, "results_ready");
      toast.success(`📄 PDF ajouté + résultat prêt pour ${target.id}`);
    } else {
      updateLabDemandStatus(target.id, "transmitted");
      toast.success(`📤 ${target.id} transmis au médecin et patient`);
    }
  };

  const simulateConsultationEnd = () => {
    const apts = sharedAppointmentsStore.read();
    const inProgress = apts.find(a => a.status === "in_progress");
    if (!inProgress) { toast.info("Aucune consultation en cours."); return; }
    completeAppointmentConsultation(inProgress.id);
    toast.success(`🩺 Consultation terminée — ${inProgress.patient}`);
  };

  const simulateAbsent = () => {
    const apts = sharedAppointmentsStore.read();
    const today = getTodayDate();
    const target = apts.find(a => a.date === today && ["confirmed", "pending", "in_waiting"].includes(a.status));
    if (!target) { toast.info("Aucun RDV disponible pour marquer absent."); return; }
    markAppointmentAbsent(target.id);
    toast.success(`❌ ${target.patient} marqué absent (${target.startTime})`);
  };

  const simulateArrival = () => {
    const apts = sharedAppointmentsStore.read();
    const today = getTodayDate();
    const target = apts.find(a => a.date === today && a.status === "confirmed");
    if (!target) { toast.info("Aucun RDV confirmé aujourd'hui."); return; }
    sendToWaitingRoom(target.id);
    toast.success(`🏥 ${target.patient} envoyé en salle d'attente`);
  };

  const simulateStartConsultation = () => {
    const apts = sharedAppointmentsStore.read();
    const today = getTodayDate();
    const target = apts.find(a => a.date === today && a.status === "in_waiting");
    if (!target) { toast.info("Aucun patient en salle d'attente."); return; }
    startAppointmentConsultation(target.id);
    toast.success(`🩺 Consultation démarrée — ${target.patient}`);
  };

  const simulateNewAppointment = () => {
    const today = getTodayDate();
    createAppointment({
      date: today, startTime: "16:30", duration: 30,
      patient: "Nouveau Patient Test", patientId: null, avatar: "NP",
      doctor: "Dr. Bouazizi", type: "Consultation", motif: "Consultation générale",
      status: "confirmed", phone: "+216 99 999 999", assurance: "Sans assurance", createdBy: "patient",
    });
    toast.success("📅 RDV créé aujourd'hui à 16:30");
  };

  const simulateCancelAppointment = () => {
    const apts = sharedAppointmentsStore.read();
    const target = apts.find(a => ["pending", "confirmed"].includes(a.status));
    if (!target) { toast.info("Aucun RDV annulable."); return; }
    cancelAppointment(target.id);
    toast.success(`🚫 RDV ${target.id} annulé — ${target.patient}`);
  };

  const simulateFullWorkflow = () => {
    const today = getTodayDate();
    // Step 1: Create appointment
    createAppointment({
      date: today, startTime: "15:00", duration: 20,
      patient: "Workflow Complet Test", patientId: null, avatar: "WC",
      doctor: "Dr. Bouazizi", type: "Consultation", motif: "Bilan général",
      status: "confirmed", phone: "+216 11 222 333", assurance: "CNAM", createdBy: "patient",
    });
    // Step 2: arrival
    setTimeout(() => {
      const apts = sharedAppointmentsStore.read();
      const apt = apts.find(a => a.patient === "Workflow Complet Test" && a.status === "confirmed");
      if (apt) sendToWaitingRoom(apt.id);
    }, 500);
    // Step 3: start
    setTimeout(() => {
      const apts = sharedAppointmentsStore.read();
      const apt = apts.find(a => a.patient === "Workflow Complet Test" && a.status === "in_waiting");
      if (apt) startAppointmentConsultation(apt.id);
    }, 1000);
    // Step 4: end
    setTimeout(() => {
      const apts = sharedAppointmentsStore.read();
      const apt = apts.find(a => a.patient === "Workflow Complet Test" && a.status === "in_progress");
      if (apt) completeAppointmentConsultation(apt.id);
    }, 1500);
    toast.success("⚡ Workflow complet lancé (RDV → Arrivée → Consultation → Fin)");
  };

  const simulateNotification = () => {
    notifyPatient("Rappel RDV", "Votre rendez-vous est demain à 10:00 avec Dr. Bouazizi.", "/dashboard/patient/appointments");
    notifyDoctor("Nouveau patient", "Un nouveau patient a pris rendez-vous pour demain.", "/dashboard/doctor/waiting-room");
    toast.success("🔔 Notifications envoyées (patient + médecin)");
  };

  const simulateTeleconsult = () => {
    const today = getTodayDate();
    createAppointment({
      date: today, startTime: "17:00", duration: 20,
      patient: "Patient Téléconsult", patientId: null, avatar: "PT",
      doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Suivi à distance",
      status: "confirmed", phone: "+216 55 666 777", assurance: "CNAM", createdBy: "patient",
      teleconsultation: true,
    });
    toast.success("📹 RDV Téléconsultation créé pour 17:00");
  };

  const switchToSpecialty = (config: typeof specialtyConfigs[0]) => {
    setDoctorActivity(config.activity, config.specialty);
    setDoctorPlan("pro");
    toast.success(`🔄 Spécialité: ${config.label} (Pro)`);
    if (location.pathname.startsWith("/dashboard/doctor")) {
      navigate("/dashboard/doctor/consultation/new?patient=1");
    } else {
      switchDemoRole("doctor");
      navigate("/dashboard/doctor");
    }
  };

  const goTo = (url: string, role?: string) => {
    const resolved = role || resolveRole(url);
    if (resolved && resolved !== "public") {
      switchDemoRole(resolved as UserRole);
    }
    navigate(url);
  };

  const currentActivity = activities.find(a => a.id === sub.activity);
  const currentPlans = plansByActivity[sub.activity] || [];
  const currentSpecialtyInfo = sub.specialty ? specialtyFeatureHighlights[sub.specialty] : null;
  const currentRole = resolveRole(location.pathname) || "public";

  // Admin module stats
  const enabledModules = Object.values(moduleStates).filter(Boolean).length;
  const disabledModules = platformModules.length - enabledModules;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[100] h-12 w-12 rounded-full gradient-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Ouvrir le panneau de simulation"
      >
        <Zap className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[420px] max-h-[85vh] rounded-2xl border bg-card shadow-elevated animate-fade-in overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Simulation Panel</span>
          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{currentRole}</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b shrink-0 overflow-x-auto">
        {([
          { key: "navigation" as PanelTab, label: "🗺️ Nav" },
          { key: "simulation" as PanelTab, label: "⚡ Workflows" },
          { key: "admin" as PanelTab, label: "🔒 Modules" },
          { key: "plan" as PanelTab, label: "💎 Plan" },
          { key: "specialty" as PanelTab, label: "🩺 Spé" },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-[10px] font-medium transition-colors whitespace-nowrap px-2 ${tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {/* ═══ Navigation tab ═══ */}
        {tab === "navigation" && (
          <>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 flex items-center gap-2">
              <span className="text-[10px] text-primary font-medium">📍</span>
              <span className="text-[11px] text-foreground font-medium truncate flex-1">{location.pathname}</span>
              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{currentRole}</span>
            </div>

            {/* Quick role grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "Patient", role: "patient", url: "/dashboard/patient", color: "text-primary" },
                { label: "Médecin", role: "doctor", url: "/dashboard/doctor", color: "text-accent" },
                { label: "Secrétaire", role: "secretary", url: "/dashboard/secretary", color: "text-primary" },
                { label: "Pharmacie", role: "pharmacy", url: "/dashboard/pharmacy", color: "text-warning" },
                { label: "Labo", role: "laboratory", url: "/dashboard/laboratory", color: "text-accent" },
                { label: "Hôpital", role: "hospital", url: "/dashboard/hospital", color: "text-primary" },
                { label: "Clinique", role: "clinic", url: "/dashboard/clinic", color: "text-accent" },
                { label: "Admin", role: "admin", url: "/dashboard/admin", color: "text-destructive" },
              ].map(r => (
                <button key={r.role} onClick={() => goTo(r.url, r.role)}
                  className={`rounded-lg border px-1.5 py-2 text-center text-[10px] font-medium transition-all hover:bg-muted/50 ${
                    currentRole === r.role ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>

            {/* Expandable role groups */}
            <div className="space-y-0.5">
              {roleNavGroups.map(group => {
                const isExpanded = expandedRole === group.role;
                const isCurrentRole = currentRole === group.role;
                const Icon = group.icon;
                return (
                  <div key={group.role}>
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : group.role)}
                      className={`w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-all ${
                        isCurrentRole ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                      }`}>
                      <Icon className={`h-3.5 w-3.5 ${group.color}`} />
                      <span className="text-[11px] font-semibold text-foreground flex-1">{group.label}</span>
                      <span className="text-[9px] text-muted-foreground">{group.links.length}</span>
                      <span className={`text-[10px] transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                    </button>
                    {isExpanded && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-muted pl-2">
                        {group.links.map(link => {
                          const isActive = location.pathname === link.url || location.pathname.startsWith(link.url + "/");
                          const LinkIcon = link.icon;
                          return (
                            <button key={link.url} onClick={() => goTo(link.url, group.role)}
                              className={`w-full flex items-center gap-2 rounded-md px-2 py-1 text-left transition-all ${
                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              }`}>
                              <LinkIcon className="h-3 w-3 shrink-0" />
                              <span className="text-[10px] font-medium">{link.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══ Workflows tab ═══ */}
        {tab === "simulation" && (
          <>
            {/* Full workflow */}
            <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-3">
              <p className="text-[10px] font-semibold text-primary uppercase mb-2">⚡ Workflow complet</p>
              <Button size="sm" className="w-full text-xs gradient-primary text-primary-foreground" onClick={simulateFullWorkflow}>
                <Zap className="h-3.5 w-3.5 mr-1.5" />RDV → Arrivée → Consultation → Fin
              </Button>
              <p className="text-[9px] text-muted-foreground mt-1.5">Exécute les 4 étapes automatiquement en séquence</p>
            </div>

            {/* RDV workflow */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Rendez-vous</p>
              <div className="space-y-1">
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateNewAppointment}>
                  <CalendarPlus className="h-3.5 w-3.5 mr-2 text-primary" />Créer un RDV (aujourd'hui 16:30)
                </Button>
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateTeleconsult}>
                  <Video className="h-3.5 w-3.5 mr-2 text-accent" />Créer un RDV téléconsultation
                </Button>
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateCancelAppointment}>
                  <X className="h-3.5 w-3.5 mr-2 text-destructive" />Annuler un RDV
                </Button>
              </div>
            </div>

            {/* Salle d'attente */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Salle d'attente</p>
              <div className="space-y-1">
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateArrival}>
                  <UserCheck className="h-3.5 w-3.5 mr-2 text-accent" />Arrivée patient → salle d'attente
                </Button>
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateStartConsultation}>
                  <Stethoscope className="h-3.5 w-3.5 mr-2 text-primary" />Démarrer consultation
                </Button>
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateConsultationEnd}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-accent" />Terminer consultation
                </Button>
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateAbsent}>
                  <UserX className="h-3.5 w-3.5 mr-2 text-destructive" />Marquer patient absent
                </Button>
              </div>
            </div>

            {/* Cross-rôle */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Cross-rôle</p>
              <div className="space-y-1">
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulatePharmacyReady}>
                  <Pill className="h-3.5 w-3.5 mr-2 text-warning" />Pharmacie → ordonnance prête
                </Button>
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateLabTransmit}>
                  <FlaskConical className="h-3.5 w-3.5 mr-2 text-accent" />Labo → avancer la demande
                </Button>
                <Button size="sm" variant="outline" className="w-full text-[11px] justify-start h-8" onClick={simulateNotification}>
                  <Bell className="h-3.5 w-3.5 mr-2 text-primary" />Envoyer notifications test
                </Button>
              </div>
            </div>

            {/* State info */}
            <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
              <p className="text-[10px] font-medium text-foreground">État des stores :</p>
              <div className="grid grid-cols-2 gap-1 text-[9px] text-muted-foreground">
                <span>RDV: {sharedAppointmentsStore.read().length}</span>
                <span>Labo: {labStore.read().length}</span>
                <span>Rx: {prescriptionsStore.read().length}</span>
                <span>Modules: {enabledModules}/{platformModules.length}</span>
              </div>
            </div>
          </>
        )}

        {/* ═══ Admin modules tab ═══ */}
        {tab === "admin" && (
          <>
            <p className="text-[10px] text-muted-foreground">Activez/désactivez les modules globalement. Impacte tous les rôles en temps réel.</p>
            
            <div className="flex items-center gap-2 text-[10px]">
              <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{enabledModules} actifs</span>
              <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">{disabledModules} désactivés</span>
            </div>

            {/* Quick actions */}
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="flex-1 text-[10px] h-7" onClick={() => {
                platformModules.forEach(m => toggleModule(m.id, true, "SimPanel"));
                toast.success("✅ Tous les modules activés");
              }}>
                <Power className="h-3 w-3 mr-1" />Tout activer
              </Button>
              <Button size="sm" variant="outline" className="flex-1 text-[10px] h-7 text-destructive" onClick={() => {
                platformModules.forEach(m => { if (!m.critical) toggleModule(m.id, false, "SimPanel"); });
                toast.success("⛔ Non-critiques désactivés");
              }}>
                <Lock className="h-3 w-3 mr-1" />Mode minimal
              </Button>
            </div>

            {/* Module toggles by category */}
            {(() => {
              const categories = [...new Set(platformModules.map(m => m.category))];
              const catLabels: Record<string, string> = {
                core: "Noyau", clinical: "Clinique", communication: "Communication",
                professional: "Professionnel", finance: "Finance", public: "Public",
              };
              return categories.map(cat => (
                <div key={cat}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{catLabels[cat] || cat}</p>
                  <div className="space-y-0.5">
                    {platformModules.filter(m => m.category === cat).map(mod => {
                      const enabled = moduleStates[mod.id] !== false;
                      return (
                        <button key={mod.id}
                          onClick={() => toggleModule(mod.id, !enabled, "SimPanel")}
                          className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-all border ${
                            enabled ? "border-accent/20 bg-accent/5" : "border-destructive/20 bg-destructive/5 opacity-70"
                          }`}>
                          {enabled 
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                            : <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-medium text-foreground">{mod.label}</span>
                            {mod.critical && <span className="text-[8px] bg-destructive/10 text-destructive px-1 py-0.5 rounded ml-1.5">CRITIQUE</span>}
                          </div>
                          <span className="text-[9px] text-muted-foreground shrink-0">{mod.affectedRoles.length} rôle(s)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}

            <div className="border-t pt-2">
              <Button size="sm" variant="outline" className="w-full text-[10px] h-7" onClick={() => goTo("/dashboard/admin/modules", "admin")}>
                <Settings className="h-3 w-3 mr-1.5" />Ouvrir AdminModules (page complète)
              </Button>
              <Button size="sm" variant="outline" className="w-full text-[10px] h-7 mt-1" onClick={() => goTo("/dashboard/admin/sidebar-config", "admin")}>
                <Settings className="h-3 w-3 mr-1.5" />Config Sidebar par rôle
              </Button>
            </div>
          </>
        )}

        {/* ═══ Plan tab ═══ */}
        {tab === "plan" && (
          <>
            <p className="text-[10px] text-muted-foreground">Testez l'impact du plan sur les fonctionnalités médecin.</p>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Activité</label>
              <select value={sub.activity} onChange={e => {
                const act = e.target.value as ActivityType;
                const specs = activities.find(a => a.id === act)?.specialties;
                setDoctorActivity(act, specs?.[0]);
                toast.success(`Activité → ${activities.find(a => a.id === act)?.label}`);
              }} className="w-full rounded-lg border bg-background px-3 py-2 text-xs">
                {activities.filter(a => ["generaliste", "specialiste", "dentiste", "kine"].includes(a.id)).map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
            {currentActivity?.specialties && (
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">Spécialité</label>
                <select value={sub.specialty || ""} onChange={e => setDoctorActivity(sub.activity, e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs">
                  {currentActivity.specialties.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            )}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Plan</label>
              <div className="flex gap-1.5">
                {currentPlans.map(p => (
                  <button key={p.id} onClick={() => { setDoctorPlan(p.id); toast.success(`Plan → ${p.label}`); }}
                    className={`flex-1 rounded-lg border px-2 py-2 text-center transition-all ${sub.plan === p.id ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "text-muted-foreground hover:border-primary/50"}`}>
                    <p className="text-xs font-semibold">{p.label}</p>
                    <p className="text-[10px]">{p.price} DT</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5 text-xs">
              <p className="font-medium text-foreground">État actuel :</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{currentActivity?.label}{sub.specialty ? ` · ${sub.specialty}` : ""} · Plan {currentPlans.find(p => p.id === sub.plan)?.label}</p>
            </div>
          </>
        )}

        {/* ═══ Specialty tab ═══ */}
        {tab === "specialty" && (
          <>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5">
              <p className="text-[10px] font-medium text-primary uppercase">Spécialité active</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {sub.activity === "generaliste" ? "Généraliste" : sub.activity === "dentiste" ? "Dentiste" : sub.activity === "kine" ? "Kinésithérapeute" : sub.specialty || "Spécialiste"}
              </p>
              {currentSpecialtyInfo && (
                <div className="mt-1.5 space-y-0.5">
                  {currentSpecialtyInfo.highlights.slice(0, 3).map((h, i) => (
                    <p key={i} className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-accent shrink-0" />{h}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {specialtyConfigs.map(config => {
                const isActive = (config.activity === sub.activity && config.specialty === sub.specialty) ||
                  (config.activity === sub.activity && !config.specialty && !sub.specialty);
                const Icon = config.icon;
                return (
                  <button key={config.id} onClick={() => switchToSpecialty(config)}
                    className={`rounded-lg border p-2 text-left transition-all ${
                      isActive ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50 hover:border-primary/30"
                    }`}>
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      <span className="text-[10px] font-medium text-foreground truncate">{config.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1 border-t pt-2">
              <Button size="sm" variant="outline" className="w-full text-[10px] justify-start h-7" onClick={() => { switchDemoRole("doctor"); navigate("/dashboard/doctor/consultation/new?patient=1"); }}>
                <Stethoscope className="h-3 w-3 mr-1.5 text-primary" />Ouvrir une consultation
              </Button>
              <Button size="sm" variant="outline" className="w-full text-[10px] justify-start h-7" onClick={() => goTo("/dashboard/doctor/patients/1")}>
                <Eye className="h-3 w-3 mr-1.5 text-primary" />Fiche patient
              </Button>
            </div>
          </>
        )}

        {/* Reset */}
        <div className="border-t pt-2">
          <Button size="sm" variant="ghost" className="w-full text-[10px] text-destructive h-7" onClick={() => {
            resetDemo();
            toast.success("🔄 Démo réinitialisée");
            window.location.reload();
          }}>
            <RefreshCw className="h-3 w-3 mr-1.5" />Réinitialiser la démo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
