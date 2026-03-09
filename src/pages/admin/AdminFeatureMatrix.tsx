/**
 * Admin Feature Matrix — Control features per activity type, specialty, and plan
 * Doctolib-style granular control over platform capabilities
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Layers, Save, CheckCircle, Search, RotateCcw, Copy, Filter,
  Stethoscope, FlaskConical, Pill, Building2, ChevronDown, ChevronRight,
  ToggleLeft, ToggleRight, AlertTriangle, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

// ── Types ──
type ActivityType = "generaliste" | "specialiste" | "dentiste" | "kine" | "laboratory" | "pharmacy" | "clinic";
type PlanTier = "essentiel" | "pro" | "cabinet";

interface FeatureDef {
  id: string;
  label: string;
  description: string;
  category: string;
}

interface FeatureState {
  [featureId: string]: {
    [plan in PlanTier]?: boolean;
  };
}

// ── Activities ──
const activities: { id: ActivityType; label: string; icon: any; specialties?: string[] }[] = [
  { id: "generaliste", label: "Médecin généraliste", icon: Stethoscope },
  {
    id: "specialiste", label: "Médecin spécialiste", icon: Stethoscope,
    specialties: ["Cardiologue", "Dermatologue", "Gynécologue", "Ophtalmologue", "ORL", "Pédiatre", "Pneumologue", "Rhumatologue", "Urologue", "Neurologue", "Psychiatre", "Endocrinologue"],
  },
  { id: "dentiste", label: "Dentiste", icon: Stethoscope },
  { id: "kine", label: "Kinésithérapeute", icon: Stethoscope },
  { id: "laboratory", label: "Laboratoire", icon: FlaskConical },
  { id: "pharmacy", label: "Pharmacie", icon: Pill },
  { id: "clinic", label: "Clinique / Établissement", icon: Building2 },
];

// ── Plan tiers per activity ──
const plansByActivity: Record<ActivityType, { id: PlanTier; label: string; price: number }[]> = {
  generaliste: [
    { id: "essentiel", label: "Essentiel", price: 49 },
    { id: "pro", label: "Pro", price: 149 },
    { id: "cabinet", label: "Cabinet+", price: 299 },
  ],
  specialiste: [
    { id: "essentiel", label: "Essentiel", price: 59 },
    { id: "pro", label: "Pro", price: 169 },
    { id: "cabinet", label: "Cabinet+", price: 329 },
  ],
  dentiste: [
    { id: "essentiel", label: "Essentiel", price: 49 },
    { id: "pro", label: "Pro", price: 149 },
  ],
  kine: [
    { id: "essentiel", label: "Essentiel", price: 39 },
    { id: "pro", label: "Pro", price: 119 },
  ],
  laboratory: [
    { id: "essentiel", label: "Standard", price: 79 },
    { id: "pro", label: "Premium", price: 149 },
  ],
  pharmacy: [
    { id: "essentiel", label: "Standard", price: 79 },
    { id: "pro", label: "Premium", price: 149 },
  ],
  clinic: [
    { id: "pro", label: "Établissement", price: 499 },
  ],
};

// ── Feature catalog ──
const featureCatalog: FeatureDef[] = [
  // Agenda & RDV
  { id: "agenda_online", label: "Agenda en ligne 24h/24", description: "Prise de RDV en ligne par les patients", category: "Agenda & RDV" },
  { id: "sms_reminders", label: "Rappels SMS automatiques", description: "Envoi automatique de rappels SMS avant chaque RDV", category: "Agenda & RDV" },
  { id: "multi_location", label: "Multi-cabinet", description: "Gestion de plusieurs lieux de consultation", category: "Agenda & RDV" },
  { id: "recurring_slots", label: "Créneaux récurrents", description: "Définition de plages horaires récurrentes", category: "Agenda & RDV" },
  { id: "patient_queue", label: "Salle d'attente virtuelle", description: "File d'attente numérique pour les patients", category: "Agenda & RDV" },

  // Dossier médical
  { id: "patient_file_basic", label: "Fiche patient basique", description: "Informations de base du patient (nom, âge, contact)", category: "Dossier médical" },
  { id: "patient_file_full", label: "Dossier médical complet", description: "Antécédents, allergies, traitements, constantes", category: "Dossier médical" },
  { id: "vitals_tracking", label: "Suivi des constantes", description: "Évolution tension, poids, glycémie, etc.", category: "Dossier médical" },
  { id: "medical_history", label: "Historique consultations", description: "Accès à l'historique complet des consultations", category: "Dossier médical" },
  { id: "shared_records", label: "Dossier partagé inter-praticiens", description: "Partage du dossier entre praticiens du même cabinet", category: "Dossier médical" },

  // Prescriptions
  { id: "prescription_basic", label: "Ordonnance simple", description: "Prescription de médicaments avec posologie", category: "Prescriptions" },
  { id: "prescription_specialized", label: "Ordonnance spécialisée", description: "Ordonnances adaptées à la spécialité (ophtalmo, dentaire...)", category: "Prescriptions" },
  { id: "prescription_digital_send", label: "Envoi numérique pharmacie", description: "Envoi direct de l'ordonnance à la pharmacie du patient", category: "Prescriptions" },
  { id: "prescription_renewal", label: "Renouvellement automatique", description: "Le patient peut demander un renouvellement sans RDV", category: "Prescriptions" },
  { id: "prescription_templates", label: "Modèles d'ordonnances", description: "Création et sauvegarde de modèles réutilisables", category: "Prescriptions" },

  // Téléconsultation
  { id: "teleconsult_video", label: "Téléconsultation vidéo", description: "Consultation à distance en visioconférence HD", category: "Téléconsultation" },
  { id: "teleconsult_chat", label: "Messagerie patient sécurisée", description: "Chat sécurisé avec les patients entre les RDV", category: "Téléconsultation" },
  { id: "teleconsult_screen_share", label: "Partage d'écran", description: "Partage d'écran durant la téléconsultation", category: "Téléconsultation" },
  { id: "teleconsult_recording", label: "Enregistrement consultation", description: "Enregistrement audio/vidéo (avec consentement)", category: "Téléconsultation" },

  // Analyses & Labo
  { id: "lab_request", label: "Demandes d'analyses", description: "Envoi de demandes d'analyses au labo connecté", category: "Analyses & Labo" },
  { id: "lab_results_view", label: "Réception résultats labo", description: "Consultation des résultats d'analyses directement", category: "Analyses & Labo" },
  { id: "lab_auto_integration", label: "Intégration automates", description: "Connexion directe avec les automates du laboratoire", category: "Analyses & Labo" },

  // Outils spécialisés
  { id: "dental_chart", label: "Schéma dentaire numérique", description: "Schéma interactif pour cartographie dentaire", category: "Outils spécialisés" },
  { id: "dental_quote", label: "Devis & plans de traitement", description: "Création de devis détaillés pour traitements dentaires", category: "Outils spécialisés" },
  { id: "kine_exercises", label: "Exercices à domicile", description: "Bibliothèque d'exercices à envoyer aux patients", category: "Outils spécialisés" },
  { id: "kine_balance", label: "Bilan kinésithérapie", description: "Formulaire de bilan kiné structuré", category: "Outils spécialisés" },
  { id: "ophtalmo_exam", label: "Examen ophtalmologique", description: "Formulaire d'examen ophtalmo avec acuité visuelle", category: "Outils spécialisés" },
  { id: "cardio_ecg", label: "Interprétation ECG", description: "Module d'interprétation d'ECG intégré", category: "Outils spécialisés" },

  // Pharmacie
  { id: "rx_reception", label: "Réception ordonnances", description: "Réception d'ordonnances numériques des médecins", category: "Pharmacie" },
  { id: "stock_basic", label: "Gestion de stock basique", description: "Suivi du stock avec alertes de seuil", category: "Pharmacie" },
  { id: "stock_advanced", label: "Stock avancé & alertes", description: "Gestion avancée avec prévisions et alertes automatiques", category: "Pharmacie" },
  { id: "substitution_auto", label: "Substitution automatique", description: "Proposition automatique de génériques disponibles", category: "Pharmacie" },
  { id: "guard_schedule", label: "Gestion garde", description: "Calendrier et notification de pharmacie de garde", category: "Pharmacie" },

  // IA & Avancé
  { id: "ai_assistant", label: "Assistant IA diagnostic", description: "Aide IA au diagnostic basée sur les symptômes", category: "IA & Avancé" },
  { id: "ai_specialized", label: "IA spécialisée par domaine", description: "Modèle IA adapté à la spécialité (cardio, dermato...)", category: "IA & Avancé" },
  { id: "stats_basic", label: "Statistiques basiques", description: "Nombre de RDV, patients, revenus", category: "IA & Avancé" },
  { id: "stats_advanced", label: "Statistiques avancées", description: "Analyse détaillée, comparaisons, tendances", category: "IA & Avancé" },
  { id: "auto_report", label: "Compte-rendu automatisé", description: "Génération automatique de compte-rendus de consultation", category: "IA & Avancé" },

  // Multi-praticiens
  { id: "multi_practitioners", label: "Multi-praticiens", description: "Jusqu'à 5 praticiens dans le même compte", category: "Cabinet & Organisation" },
  { id: "shared_secretary", label: "Secrétariat partagé", description: "Un(e) secrétaire commun(e) à plusieurs praticiens", category: "Cabinet & Organisation" },
  { id: "centralized_billing", label: "Facturation centralisée", description: "Facturation unique pour tout le cabinet", category: "Cabinet & Organisation" },
  { id: "api_integrations", label: "API & Intégrations", description: "Accès API pour connecter des outils tiers", category: "Cabinet & Organisation" },
  { id: "account_manager", label: "Account manager dédié", description: "Interlocuteur dédié pour l'accompagnement", category: "Cabinet & Organisation" },

  // Support
  { id: "support_email", label: "Support email", description: "Support par email sous 48h", category: "Support" },
  { id: "support_priority", label: "Support prioritaire", description: "Support avec réponse sous 4h", category: "Support" },
  { id: "onsite_training", label: "Formation sur site", description: "Session de formation dans vos locaux", category: "Support" },
];

// ── Default feature states per activity ──
const buildDefaultState = (activityId: ActivityType): FeatureState => {
  const state: FeatureState = {};
  const plans = plansByActivity[activityId];
  const planIds = plans.map(p => p.id);

  featureCatalog.forEach(f => {
    state[f.id] = {};
    planIds.forEach(plan => {
      // Smart defaults based on category & plan tier
      let enabled = false;

      // Basic features for all plans
      if (["agenda_online", "sms_reminders", "recurring_slots", "patient_file_basic", "support_email", "stats_basic"].includes(f.id)) {
        enabled = true;
      }
      // Pro features
      if (plan !== "essentiel" && [
        "patient_file_full", "vitals_tracking", "medical_history", "prescription_basic",
        "prescription_digital_send", "prescription_templates", "teleconsult_video",
        "teleconsult_chat", "lab_request", "lab_results_view", "ai_assistant",
        "stats_advanced", "support_priority",
      ].includes(f.id)) {
        enabled = true;
      }
      // Cabinet+ features
      if (plan === "cabinet" && [
        "multi_location", "patient_queue", "shared_records", "prescription_specialized",
        "prescription_renewal", "teleconsult_screen_share", "ai_specialized",
        "auto_report", "multi_practitioners", "shared_secretary", "centralized_billing",
        "api_integrations", "account_manager",
      ].includes(f.id)) {
        enabled = true;
      }

      // Activity-specific
      if (activityId === "dentiste" && ["dental_chart", "dental_quote"].includes(f.id) && plan !== "essentiel") enabled = true;
      if (activityId === "kine" && ["kine_exercises", "kine_balance"].includes(f.id) && plan !== "essentiel") enabled = true;
      if ((activityId === "specialiste") && f.id === "prescription_specialized" && plan !== "essentiel") enabled = true;
      if (activityId === "laboratory" && ["lab_auto_integration", "lab_results_view", "lab_request"].includes(f.id)) enabled = true;
      if (activityId === "pharmacy" && ["rx_reception", "stock_basic", "guard_schedule"].includes(f.id)) enabled = true;
      if (activityId === "pharmacy" && plan !== "essentiel" && ["stock_advanced", "substitution_auto"].includes(f.id)) enabled = true;

      state[f.id][plan] = enabled;
    });
  });

  return state;
};

// ── Specialty overrides (stored per specialty) ──
type SpecialtyOverrides = Record<string, FeatureState>;

const AdminFeatureMatrix = () => {
  const [activity, setActivity] = useState<ActivityType>("generaliste");
  const [specialty, setSpecialty] = useState<string>("");
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(featureCatalog.map(f => f.category)));
  const [saved, setSaved] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Feature states per activity
  const [statesByActivity, setStatesByActivity] = useState<Record<ActivityType, FeatureState>>(() => {
    const all: Record<string, FeatureState> = {};
    activities.forEach(a => { all[a.id] = buildDefaultState(a.id); });
    return all as Record<ActivityType, FeatureState>;
  });

  // Specialty overrides
  const [specialtyOverrides, setSpecialtyOverrides] = useState<Record<ActivityType, SpecialtyOverrides>>(() => {
    const all: Record<string, SpecialtyOverrides> = {};
    activities.forEach(a => { all[a.id] = {}; });
    return all as Record<ActivityType, SpecialtyOverrides>;
  });

  const currentPlans = plansByActivity[activity];
  const currentActivity = activities.find(a => a.id === activity)!;
  const categories = useMemo(() => [...new Set(featureCatalog.map(f => f.category))], []);

  // Get effective state (specialty override > activity default)
  const getEffectiveState = (): FeatureState => {
    const base = statesByActivity[activity];
    if (specialty && specialtyOverrides[activity][specialty]) {
      const overrides = specialtyOverrides[activity][specialty];
      const merged: FeatureState = {};
      Object.keys(base).forEach(fId => {
        merged[fId] = { ...base[fId], ...(overrides[fId] || {}) };
      });
      return merged;
    }
    return base;
  };

  const effectiveState = getEffectiveState();

  // Filter features
  const filteredFeatures = useMemo(() => {
    let list = featureCatalog;
    if (filterCategory !== "all") list = list.filter(f => f.category === filterCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => f.label.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    return list;
  }, [search, filterCategory]);

  const groupedFeatures = useMemo(() => {
    const grouped: Record<string, FeatureDef[]> = {};
    filteredFeatures.forEach(f => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push(f);
    });
    return grouped;
  }, [filteredFeatures]);

  const toggleFeature = (featureId: string, plan: PlanTier) => {
    if (specialty) {
      // Store as specialty override
      setSpecialtyOverrides(prev => {
        const actOverrides = { ...prev[activity] };
        if (!actOverrides[specialty]) actOverrides[specialty] = {};
        const specOverride = { ...actOverrides[specialty] };
        if (!specOverride[featureId]) specOverride[featureId] = {};
        specOverride[featureId] = { ...specOverride[featureId], [plan]: !effectiveState[featureId]?.[plan] };
        actOverrides[specialty] = specOverride;
        return { ...prev, [activity]: actOverrides };
      });
    } else {
      // Update base activity state
      setStatesByActivity(prev => {
        const actState = { ...prev[activity] };
        actState[featureId] = { ...actState[featureId], [plan]: !actState[featureId]?.[plan] };
        return { ...prev, [activity]: actState };
      });
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category); else next.add(category);
      return next;
    });
  };

  // Enable all features for a plan in a category
  const enableAllInCategory = (category: string, plan: PlanTier) => {
    const features = featureCatalog.filter(f => f.category === category);
    if (specialty) {
      setSpecialtyOverrides(prev => {
        const actOverrides = { ...prev[activity] };
        if (!actOverrides[specialty]) actOverrides[specialty] = {};
        const specOverride = { ...actOverrides[specialty] };
        features.forEach(f => {
          if (!specOverride[f.id]) specOverride[f.id] = {};
          specOverride[f.id] = { ...specOverride[f.id], [plan]: true };
        });
        actOverrides[specialty] = specOverride;
        return { ...prev, [activity]: actOverrides };
      });
    } else {
      setStatesByActivity(prev => {
        const actState = { ...prev[activity] };
        features.forEach(f => {
          actState[f.id] = { ...actState[f.id], [plan]: true };
        });
        return { ...prev, [activity]: actState };
      });
    }
    toast({ title: `Toutes les fonctionnalités "${category}" activées pour ${currentPlans.find(p => p.id === plan)?.label}` });
  };

  const copyFromActivity = (source: ActivityType) => {
    setStatesByActivity(prev => ({
      ...prev,
      [activity]: { ...prev[source] },
    }));
    toast({ title: `Configuration copiée depuis "${activities.find(a => a.id === source)?.label}"` });
  };

  const resetToDefaults = () => {
    setStatesByActivity(prev => ({
      ...prev,
      [activity]: buildDefaultState(activity),
    }));
    if (specialty) {
      setSpecialtyOverrides(prev => {
        const actOverrides = { ...prev[activity] };
        delete actOverrides[specialty];
        return { ...prev, [activity]: actOverrides };
      });
    }
    toast({ title: "Configuration réinitialisée" });
  };

  const handleSave = () => {
    const label = specialty
      ? `${currentActivity.label} — ${specialty}`
      : currentActivity.label;
    appendLog("feature_matrix_updated", "system", activity, `Matrice de fonctionnalités mise à jour pour ${label}`);
    setSaved(true);
    toast({ title: "Matrice sauvegardée", description: label });
    setTimeout(() => setSaved(false), 2000);
  };

  // Stats
  const enabledCount = useMemo(() => {
    let count = 0;
    Object.values(effectiveState).forEach(plans => {
      Object.values(plans).forEach(v => { if (v) count++; });
    });
    return count;
  }, [effectiveState]);

  const totalSlots = featureCatalog.length * currentPlans.length;

  const Toggle = ({ enabled, onChange, size = "md" }: { enabled: boolean; onChange: () => void; size?: "sm" | "md" }) => (
    <button onClick={onChange} className="flex items-center transition-transform hover:scale-110">
      {enabled
        ? <ToggleRight className={`${size === "sm" ? "h-5 w-5" : "h-6 w-6"} text-primary`} />
        : <ToggleLeft className={`${size === "sm" ? "h-5 w-5" : "h-6 w-6"} text-muted-foreground`} />
      }
    </button>
  );

  return (
    <DashboardLayout role="admin" title="Matrice des fonctionnalités">
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Contrôle des fonctionnalités par activité & plan
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Activez ou désactivez chaque fonctionnalité selon le type de professionnel, la spécialité et le plan d'abonnement.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {enabledCount}/{totalSlots} actifs
            </span>
            {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle className="h-4 w-4" />Sauvegardé</span>}
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />Réinitialiser
            </Button>
            <Button className="gradient-primary text-primary-foreground" size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 mr-1" />Enregistrer
            </Button>
          </div>
        </div>

        {/* Selectors */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Activity */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Type d'activité</label>
            <Select value={activity} onValueChange={v => { setActivity(v as ActivityType); setSpecialty(""); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activities.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="flex items-center gap-2"><a.icon className="h-4 w-4" />{a.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialty (if applicable) */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Spécialité {!currentActivity.specialties && <span className="text-muted-foreground/50">(N/A)</span>}
            </label>
            {currentActivity.specialties ? (
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Par défaut (toutes)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Par défaut (toutes spécialités)</SelectItem>
                  {currentActivity.specialties.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 rounded-md border bg-muted/30 flex items-center px-3 text-sm text-muted-foreground">
                Pas de sous-spécialités
              </div>
            )}
            {specialty && specialty !== "__all__" && (
              <p className="text-[10px] text-warning mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />Les modifications ici sont des surcharges spécifiques à "{specialty}"
              </p>
            )}
          </div>

          {/* Category filter */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Catégorie</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Copy from */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Copier depuis</label>
            <Select value="__none__" onValueChange={v => v !== "__none__" && copyFromActivity(v as ActivityType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Copier config d'un autre profil..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__" disabled>Sélectionner une source...</SelectItem>
                {activities.filter(a => a.id !== activity).map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une fonctionnalité..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Plan header bar */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 20rem)" }}>
          {/* Sticky plan header */}
          <div className="grid border-b shrink-0" style={{ gridTemplateColumns: `2fr ${currentPlans.map(() => "1fr").join(" ")}` }}>
            <div className="p-4 bg-muted/30 flex items-center">
              <span className="text-sm font-semibold text-foreground">Fonctionnalité</span>
            </div>
            {currentPlans.map(plan => (
              <div key={plan.id} className={`p-4 text-center ${plan.id === "pro" ? "bg-primary/5" : "bg-muted/30"}`}>
                <p className="font-bold text-foreground text-sm">{plan.label}</p>
                <p className="text-xs text-primary font-semibold">{plan.price} DT/mois</p>
              </div>
            ))}
          </div>

          {/* Scrollable feature rows */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {Object.entries(groupedFeatures).map(([category, features]) => (
              <div key={category}>
                {/* Category header */}
                <div
                  className="grid border-b bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors"
                  style={{ gridTemplateColumns: `2fr ${currentPlans.map(() => "1fr").join(" ")}` }}
                  onClick={() => toggleCategory(category)}
                >
                  <div className="p-3 flex items-center gap-2">
                    {expandedCats.has(category) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-semibold text-foreground">{category}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {features.length}
                    </span>
                  </div>
                  {currentPlans.map(plan => (
                    <div key={plan.id} className="p-3 flex items-center justify-center" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6 px-2 text-muted-foreground hover:text-primary"
                        onClick={() => enableAllInCategory(category, plan.id)}
                      >
                        Tout activer
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Feature rows */}
                {expandedCats.has(category) && features.map(feature => (
                  <div
                    key={feature.id}
                    className="grid border-b last:border-0 hover:bg-muted/5 transition-colors"
                    style={{ gridTemplateColumns: `2fr ${currentPlans.map(() => "1fr").join(" ")}` }}
                  >
                    <div className="p-3 pl-10 flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-default">
                              <span className="text-sm text-foreground">{feature.label}</span>
                              <Info className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">{feature.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {/* Show override indicator */}
                      {specialty && specialty !== "__all__" && specialtyOverrides[activity]?.[specialty]?.[feature.id] && (
                        <span className="text-[9px] bg-warning/10 text-warning px-1 py-0.5 rounded">surcharge</span>
                      )}
                    </div>
                    {currentPlans.map(plan => (
                      <div key={plan.id} className={`p-3 flex items-center justify-center ${plan.id === "pro" ? "bg-primary/[0.02]" : ""}`}>
                        <Toggle
                          enabled={!!effectiveState[feature.id]?.[plan.id]}
                          onChange={() => toggleFeature(feature.id, plan.id)}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">Résumé par plan</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {currentPlans.map(plan => {
              const count = Object.values(effectiveState).filter(plans => plans[plan.id]).length;
              const pct = Math.round((count / featureCatalog.length) * 100);
              return (
                <div key={plan.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{plan.label}</span>
                    <span className="text-xs text-primary font-bold">{count}/{featureCatalog.length}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{pct}% des fonctionnalités activées</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFeatureMatrix;
