/**
 * SimulationPanel — Dev tool to test cross-role workflows, plan simulation, specialty testing, and full navigation.
 * Floating button → opens panel with 4 tabs: Cross-rôles, Plan médecin, Spécialités, Navigation.
 */
import { useState } from "react";
import { Zap, X, FlaskConical, Pill, Stethoscope, UserX, Crown, Eye, Heart, Ear, Brain, Baby, Bone, Smile, LayoutDashboard, Users, Calendar, FileText, Settings, MessageSquare, ClipboardList, Banknote, Building2, ShieldCheck, BarChart3, Plug, Bot, Clock, Gavel, Flag, CreditCard, ScrollText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pharmacyRespond, prescriptionsStore } from "@/stores/prescriptionsStore";
import { updateLabDemandStatus, addLabPdf, labStore } from "@/stores/labStore";
import { completeAppointmentConsultation, markAppointmentAbsent } from "@/stores/sharedAppointmentsStore";
import { toast } from "sonner";
import { toast } from "sonner";
import { useDoctorSubscription, setDoctorPlan, setDoctorActivity } from "@/stores/doctorSubscriptionStore";
import { activities, plansByActivity, specialtyFeatureHighlights, type ActivityType, type PlanTier } from "@/stores/featureMatrixStore";
import { useNavigate, useLocation } from "react-router-dom";

type PanelTab = "simulation" | "plan" | "specialty" | "navigation";

/** All testable specialty configs */
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

/** Role navigation structure for quick-access to all spaces */
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
      { label: "Notifications", url: "/dashboard/patient/notifications", icon: Activity },
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
      { label: "Ordonnances", url: "/dashboard/doctor/prescriptions", icon: FileText },
      { label: "Fiche patient", url: "/dashboard/doctor/patients/1", icon: Eye },
      { label: "Protocoles", url: "/dashboard/doctor/protocols", icon: ClipboardList },
      { label: "Documents", url: "/dashboard/doctor/documents", icon: FileText },
      { label: "Tarifs", url: "/dashboard/doctor/tarifs", icon: Banknote },
      { label: "Congés", url: "/dashboard/doctor/leaves", icon: Calendar },
      { label: "Facturation", url: "/dashboard/doctor/billing", icon: Banknote },
      { label: "Téléconsultation", url: "/dashboard/doctor/teleconsultation", icon: Eye },
      { label: "Connect", url: "/dashboard/doctor/connect", icon: Plug },
      { label: "Assistant IA", url: "/dashboard/doctor/ai-assistant", icon: Bot },
      { label: "Statistiques", url: "/dashboard/doctor/stats", icon: BarChart3 },
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
      { label: "Paramètres", url: "/dashboard/secretary/settings", icon: Settings },
    ],
  },
  {
    label: "Admin", icon: ShieldCheck, color: "text-destructive", role: "admin",
    links: [
      { label: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
      { label: "Utilisateurs", url: "/dashboard/admin/users", icon: Users },
      { label: "Vérifications", url: "/dashboard/admin/verifications", icon: ShieldCheck },
      { label: "Paiements", url: "/dashboard/admin/payments", icon: CreditCard },
      { label: "Modules", url: "/dashboard/admin/modules", icon: Settings },
      { label: "Plans", url: "/dashboard/admin/plans", icon: Crown },
      { label: "Spécialités", url: "/dashboard/admin/specialties", icon: Stethoscope },
      { label: "Feature Flags", url: "/dashboard/admin/feature-flags", icon: Flag },
      { label: "Feature Matrix", url: "/dashboard/admin/feature-matrix", icon: BarChart3 },
      { label: "IAM", url: "/dashboard/admin/iam", icon: ShieldCheck },
      { label: "Litiges", url: "/dashboard/admin/disputes", icon: Gavel },
      { label: "Modération", url: "/dashboard/admin/moderation", icon: Flag },
      { label: "Audit Logs", url: "/dashboard/admin/audit-logs", icon: ScrollText },
      { label: "Compliance", url: "/dashboard/admin/compliance", icon: ShieldCheck },
      { label: "Actions", url: "/dashboard/admin/actions", icon: Zap },
      { label: "Satisfaction", url: "/dashboard/admin/satisfaction", icon: Activity },
      { label: "API & Partenaires", url: "/dashboard/admin/api-partners", icon: Activity },
      { label: "Rapports", url: "/dashboard/admin/reports", icon: Activity },
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

const SimulationPanel = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("navigation");
  const [sub] = useDoctorSubscription();
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const simulatePharmacyReady = () => {
    const prescriptions = prescriptionsStore.read();
    const pending = prescriptions.flatMap((p) =>
      p.sentToPharmacies
        .filter((ph) => ph.status === "pending")
        .map((ph) => ({ prescriptionId: p.id, pharmacyId: ph.pharmacyId, pharmacyName: ph.pharmacyName }))
    );
    if (pending.length === 0) {
      toast.info("Aucune ordonnance en attente. Envoyez d'abord une ordonnance depuis l'espace patient.");
      return;
    }
    const item = pending[0];
    pharmacyRespond(item.prescriptionId, item.pharmacyId, { status: "ready", pickupTime: "Avant 18h" });
    toast.success(`✅ Pharmacie "${item.pharmacyName}" a répondu : prête à retirer pour ${item.prescriptionId}`);
  };

  const simulateLabTransmit = () => {
    const demands = labStore.read();
    const demands = labStore.read();
    const ready = demands.find((d) => d.status === "results_ready");
    const inProgress = demands.find((d) => d.status === "in_progress");
    const target = ready || inProgress;
    if (!target) { toast.info("Aucune demande labo en cours/prête."); return; }
    if (target.status === "in_progress") {
      addLabPdf(target.id, { id: `PDF-sim-${Date.now()}`, name: `Simulation_${target.id}.pdf`, size: "250 Ko", uploadedAt: new Date().toLocaleDateString("fr-FR") });
      updateLabDemandStatus(target.id, "results_ready");
      toast.success(`📄 PDF ajouté + résultat prêt pour ${target.id}.`);
    } else {
      updateLabDemandStatus(target.id, "transmitted");
      toast.success(`📤 Demande ${target.id} transmise.`);
    }
  };

  const simulateConsultationEnd = () => {
    // Use first in_progress appointment
    completeAppointmentConsultation("apt-1");
    toast.success("🩺 Consultation terminée.");
  };

  const simulateAbsent = () => {
    markAppointmentAbsent("apt-99");
    toast.success("❌ Patient marqué absent.");
  };

  const switchToSpecialty = (config: typeof specialtyConfigs[0]) => {
    setDoctorActivity(config.activity, config.specialty);
    setDoctorPlan("pro");
    toast.success(`🔄 Rôle: ${config.label} (Pro)`);
    if (location.pathname.startsWith("/dashboard/doctor")) {
      navigate("/dashboard/doctor/consultation/new?patient=1");
    } else {
      navigate("/dashboard/doctor");
    }
  };

  const goTo = (url: string, role?: string) => {
    // Auto-set role for admin routes
    if (role === "admin") {
      localStorage.setItem("userRole", "admin");
    }
    navigate(url);
  };

  const currentActivity = activities.find(a => a.id === sub.activity);
  const currentPlans = plansByActivity[sub.activity] || [];
  const currentSpecialtyInfo = sub.specialty ? specialtyFeatureHighlights[sub.specialty] : null;

  // Detect which role space the user is currently in
  const currentRole = location.pathname.startsWith("/dashboard/admin") ? "admin"
    : location.pathname.startsWith("/dashboard/doctor") ? "doctor"
    : location.pathname.startsWith("/dashboard/patient") ? "patient"
    : location.pathname.startsWith("/dashboard/pharmacy") ? "pharmacy"
    : location.pathname.startsWith("/dashboard/laboratory") ? "laboratory"
    : location.pathname.startsWith("/dashboard/secretary") ? "secretary"
    : "public";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[100] h-12 w-12 rounded-full gradient-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        title="Panel de simulation"
      >
        <Zap className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-96 max-h-[80vh] rounded-2xl border bg-card shadow-elevated animate-fade-in overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="flex border-b shrink-0">
        {([
          { key: "navigation" as PanelTab, label: "🗺️ Nav", icon: LayoutDashboard },
          { key: "simulation" as PanelTab, label: "⚡ Test", icon: Zap },
          { key: "plan" as PanelTab, label: "💎 Plan", icon: Crown },
          { key: "specialty" as PanelTab, label: "🩺 Spé", icon: Stethoscope },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-[11px] font-medium transition-colors ${tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
        <button onClick={() => setOpen(false)} className="px-3 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {/* Navigation tab — full role sitemap */}
        {tab === "navigation" && (
          <>
            <p className="text-[10px] text-muted-foreground">Naviguez dans tous les espaces de la plateforme.</p>
            
            {/* Current location */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 flex items-center gap-2">
              <span className="text-[10px] text-primary font-medium">📍</span>
              <span className="text-[11px] text-foreground font-medium truncate">{location.pathname}</span>
              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-auto">{currentRole}</span>
            </div>

            {/* Role groups */}
            <div className="space-y-1">
              {roleNavGroups.map(group => {
                const isExpanded = expandedRole === group.role;
                const isCurrentRole = currentRole === group.role;
                const Icon = group.icon;
                return (
                  <div key={group.role}>
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : group.role)}
                      className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-all ${
                        isCurrentRole ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${group.color}`} />
                      <span className="text-xs font-semibold text-foreground flex-1">{group.label}</span>
                      <span className="text-[9px] text-muted-foreground">{group.links.length} pages</span>
                      <span className={`text-[10px] transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                    </button>
                    {isExpanded && (
                      <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-muted pl-3">
                        {group.links.map(link => {
                          const isActive = location.pathname === link.url || location.pathname.startsWith(link.url + "/");
                          const LinkIcon = link.icon;
                          return (
                            <button
                              key={link.url}
                              onClick={() => goTo(link.url, group.role)}
                              className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-all ${
                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                              }`}
                            >
                              <LinkIcon className="h-3 w-3 shrink-0" />
                              <span className="text-[11px] font-medium">{link.label}</span>
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

        {/* Simulation tab */}
        {tab === "simulation" && (
          <>
            <p className="text-[10px] text-muted-foreground">Testez les workflows end-to-end sans backend.</p>
            <div className="space-y-2">
              <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={simulatePharmacyReady}>
                <Pill className="h-3.5 w-3.5 mr-2 text-accent" />Simuler réponse pharmacie
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={simulateLabTransmit}>
                <FlaskConical className="h-3.5 w-3.5 mr-2 text-primary" />Simuler transmission labo
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={simulateConsultationEnd}>
                <Stethoscope className="h-3.5 w-3.5 mr-2 text-accent" />Simuler fin consultation
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={simulateAbsent}>
                <UserX className="h-3.5 w-3.5 mr-2 text-destructive" />Simuler patient absent
              </Button>
            </div>
            
            {/* Quick role switchers */}
            <div className="border-t pt-2 space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-medium">Accès rapide :</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "Patient", url: "/dashboard/patient", color: "text-primary" },
                  { label: "Médecin", url: "/dashboard/doctor", color: "text-accent" },
                  { label: "Pharmacie", url: "/dashboard/pharmacy", color: "text-warning" },
                  { label: "Labo", url: "/dashboard/laboratory", color: "text-primary" },
                  { label: "Secrétaire", url: "/dashboard/secretary", color: "text-primary" },
                  { label: "Admin", url: "/dashboard/admin", color: "text-destructive" },
                ].map(r => (
                  <button key={r.url}
                    onClick={() => goTo(r.url, r.label === "Admin" ? "admin" : undefined)}
                    className={`rounded-lg border px-2 py-2 text-center text-[10px] font-medium transition-all hover:bg-muted/50 ${
                      location.pathname.startsWith(r.url) ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Plan tab */}
        {tab === "plan" && (
          <>
            <p className="text-[10px] text-muted-foreground">Changez le plan/activité pour voir l'impact en temps réel.</p>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1.5">Activité</label>
              <select value={sub.activity} onChange={e => { const act = e.target.value as ActivityType; const specs = activities.find(a => a.id === act)?.specialties; setDoctorActivity(act, specs?.[0]); toast.success(`Activité → ${activities.find(a => a.id === act)?.label}`); }} className="w-full rounded-lg border bg-background px-3 py-2 text-xs">
                {activities.filter(a => ["generaliste", "specialiste", "dentiste", "kine"].includes(a.id)).map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
            {currentActivity?.specialties && (
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1.5">Spécialité</label>
                <select value={sub.specialty || ""} onChange={e => setDoctorActivity(sub.activity, e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-xs">
                  {currentActivity.specialties.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            )}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1.5">Plan actif</label>
              <div className="flex gap-1.5">
                {currentPlans.map(p => (
                  <button key={p.id} onClick={() => { setDoctorPlan(p.id); toast.success(`Plan → ${p.label} (${p.price} DT/mois)`); }}
                    className={`flex-1 rounded-lg border px-2 py-2 text-center transition-all ${sub.plan === p.id ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "text-muted-foreground hover:border-primary/50"}`}>
                    <p className="text-xs font-semibold">{p.label}</p>
                    <p className="text-[10px]">{p.price} DT</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs">
              <p className="font-medium text-foreground">État actuel :</p>
              <p className="text-muted-foreground mt-1">{currentActivity?.label}{sub.specialty ? ` · ${sub.specialty}` : ""} · Plan {currentPlans.find(p => p.id === sub.plan)?.label}</p>
            </div>
          </>
        )}

        {/* Specialty tab */}
        {tab === "specialty" && (
          <>
            <p className="text-[10px] text-muted-foreground">Basculez rapidement vers une spécialité et testez sa consultation.</p>
            
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <p className="text-[10px] font-medium text-primary uppercase">Rôle actif</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {sub.activity === "generaliste" ? "Généraliste" : sub.activity === "dentiste" ? "Dentiste" : sub.activity === "kine" ? "Kinésithérapeute" : sub.specialty || "Spécialiste"}
              </p>
              {currentSpecialtyInfo && (
                <div className="mt-2 space-y-1">
                  {currentSpecialtyInfo.highlights.slice(0, 3).map((h, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
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
                const specInfo = config.specialty ? specialtyFeatureHighlights[config.specialty] : null;
                return (
                  <button key={config.id} onClick={() => switchToSpecialty(config)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      isActive ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50 hover:border-primary/30"
                    }`}>
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      <span className="text-xs font-medium text-foreground truncate">{config.label}</span>
                    </div>
                    {specInfo && (
                      <p className="text-[9px] text-muted-foreground mt-1 truncate">{specInfo.highlights[0]}</p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 border-t pt-2">
              <p className="text-[10px] text-muted-foreground font-medium">Tests rapides :</p>
              <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={() => navigate("/dashboard/doctor/consultation/new?patient=1")}>
                <Stethoscope className="h-3.5 w-3.5 mr-2 text-primary" />Ouvrir une consultation
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={() => navigate("/dashboard/doctor")}>
                <Zap className="h-3.5 w-3.5 mr-2 text-accent" />Dashboard médecin
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs justify-start" onClick={() => navigate("/dashboard/doctor/patients/1")}>
                <Eye className="h-3.5 w-3.5 mr-2 text-primary" />Fiche patient
              </Button>
            </div>
          </>
        )}

        <div className="border-t pt-2">
          <Button size="sm" variant="ghost" className="w-full text-[10px] text-destructive" onClick={() => {
            // Clear ALL shared store localStorage keys
            const keys = Object.keys(localStorage).filter(k => 
              k.startsWith("medicare_") || k.startsWith("doctor_") || k.startsWith("guest")
            );
            keys.forEach(k => localStorage.removeItem(k));
            window.location.reload();
          }}>
            🗑️ Réinitialiser tous les stores
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
