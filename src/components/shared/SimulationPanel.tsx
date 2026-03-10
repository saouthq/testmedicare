/**
 * SimulationPanel — Dev tool to test cross-role workflows, plan simulation, and specialty role testing.
 * Floating button → opens panel with 3 tabs: Cross-rôles, Plan médecin, Spécialités.
 */
import { useState } from "react";
import { Zap, X, FlaskConical, Pill, Stethoscope, UserX, Crown, Eye, Heart, Ear, Brain, Baby, Bone, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pharmacyRespond, prescriptionsStore } from "@/stores/prescriptionsStore";
import { updateLabDemandStatus, addLabPdf, labStore, initLabStoreIfEmpty } from "@/stores/labStore";
import { endConsultation, markPatientAbsent } from "@/stores/appointmentsStore";
import { mockLabDemands } from "@/data/mocks/lab";
import type { SharedLabDemand } from "@/stores/labStore";
import { toast } from "sonner";
import { useDoctorSubscription, setDoctorPlan, setDoctorActivity } from "@/stores/doctorSubscriptionStore";
import { activities, plansByActivity, specialtyFeatureHighlights, type ActivityType, type PlanTier } from "@/stores/featureMatrixStore";
import { useNavigate, useLocation } from "react-router-dom";

type PanelTab = "simulation" | "plan" | "specialty";

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

const SimulationPanel = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("simulation");
  const [sub] = useDoctorSubscription();
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
    initLabStoreIfEmpty(mockLabDemands as SharedLabDemand[]);
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
    endConsultation(1, "Amine Ben Ali", "Dr. Ahmed Bouazizi");
    toast.success("🩺 Consultation terminée.");
  };

  const simulateAbsent = () => {
    markPatientAbsent(99, "Patient Test", "Dr. Ahmed Bouazizi");
    toast.success("❌ Patient marqué absent.");
  };

  const switchToSpecialty = (config: typeof specialtyConfigs[0]) => {
    setDoctorActivity(config.activity, config.specialty);
    setDoctorPlan("pro");
    toast.success(`🔄 Rôle: ${config.label} (Pro)`);
    // If on doctor space, navigate to consultation to test
    if (location.pathname.startsWith("/dashboard/doctor")) {
      navigate("/dashboard/doctor/consultation/new?patient=1");
    } else {
      navigate("/dashboard/doctor");
    }
  };

  const currentActivity = activities.find(a => a.id === sub.activity);
  const currentPlans = plansByActivity[sub.activity] || [];
  const currentSpecialtyInfo = sub.specialty ? specialtyFeatureHighlights[sub.specialty] : null;

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
        <button onClick={() => setTab("simulation")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${tab === "simulation" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
          <Zap className="h-3.5 w-3.5" />Cross-rôles
        </button>
        <button onClick={() => setTab("plan")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${tab === "plan" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
          <Crown className="h-3.5 w-3.5" />Plan
        </button>
        <button onClick={() => setTab("specialty")}
          className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${tab === "specialty" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
          <Stethoscope className="h-3.5 w-3.5" />Spécialités
        </button>
        <button onClick={() => setOpen(false)} className="px-3 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1">
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

        {/* Specialty tab — role switcher + test links */}
        {tab === "specialty" && (
          <>
            <p className="text-[10px] text-muted-foreground">Basculez rapidement vers une spécialité et testez sa consultation.</p>
            
            {/* Current role indicator */}
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

            {/* Specialty grid */}
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
                    {specInfo?.disabledFeatures && specInfo.disabledFeatures.length > 0 && (
                      <p className="text-[9px] text-destructive mt-0.5">⚠ {specInfo.disabledFeatures.length} feature(s) off</p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick test links */}
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

        {/* Reset */}
        <div className="border-t pt-2">
          <Button size="sm" variant="ghost" className="w-full text-[10px] text-destructive" onClick={() => {
            localStorage.removeItem("medicare_notifications");
            localStorage.removeItem("medicare_shared_prescriptions");
            localStorage.removeItem("medicare_lab_demands");
            localStorage.removeItem("medicare_appointment_events");
            localStorage.removeItem("doctor_subscription");
            localStorage.removeItem("doctor_waiting_room");
            localStorage.removeItem("doctor_consultations");
            localStorage.removeItem("doctor_renewal_requests");
            localStorage.removeItem("medicare_admin_modules");
            localStorage.removeItem("medicare_module_labels");
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
