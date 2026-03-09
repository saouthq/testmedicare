/**
 * Feature Matrix Store — Single source of truth for features per activity/specialty/plan
 * Used by: AdminFeatureMatrix (edit), BecomePartner (display), AdminVerifications (review)
 * Persists in localStorage so admin changes reflect everywhere.
 * TODO BACKEND: Replace with real API
 */

const MATRIX_KEY = "medicare_feature_matrix";
const OVERRIDES_KEY = "medicare_feature_overrides";

// ── Types ──
export type ActivityType = "generaliste" | "specialiste" | "dentiste" | "kine" | "laboratory" | "pharmacy" | "clinic";
export type PlanTier = "essentiel" | "pro" | "cabinet";

export interface FeatureDef {
  id: string;
  label: string;
  description: string;
  category: string;
}

export interface FeatureState {
  [featureId: string]: {
    [plan in PlanTier]?: boolean;
  };
}

export type SpecialtyOverrides = Record<string, FeatureState>;

export interface ActivityConfig {
  id: ActivityType;
  label: string;
  specialties?: string[];
}

export interface PlanConfig {
  id: PlanTier;
  label: string;
  price: number;
}

// ── Activities ──
export const activities: ActivityConfig[] = [
  { id: "generaliste", label: "Médecin généraliste" },
  {
    id: "specialiste", label: "Médecin spécialiste",
    specialties: ["Cardiologue", "Dermatologue", "Gynécologue", "Ophtalmologue", "ORL", "Pédiatre", "Pneumologue", "Rhumatologue", "Urologue", "Neurologue", "Psychiatre", "Endocrinologue"],
  },
  { id: "dentiste", label: "Dentiste" },
  { id: "kine", label: "Kinésithérapeute" },
  { id: "laboratory", label: "Laboratoire d'analyses" },
  { id: "pharmacy", label: "Pharmacie" },
  { id: "clinic", label: "Clinique / Établissement" },
];

// ── Plan tiers per activity ──
export const plansByActivity: Record<ActivityType, PlanConfig[]> = {
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

// ── Pricing for BecomePartner (monthly & yearly) ──
export interface PublicPlanConfig {
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  planTier: PlanTier;
  highlighted?: boolean;
}

export const publicPlansByActivity: Record<ActivityType, PublicPlanConfig[]> = {
  generaliste: [
    { name: "Essentiel", subtitle: "Gestion agenda", monthlyPrice: 49, yearlyPrice: 39, planTier: "essentiel" },
    { name: "Pro", subtitle: "Gestion complète", monthlyPrice: 149, yearlyPrice: 129, planTier: "pro", highlighted: true },
    { name: "Cabinet +", subtitle: "Multi-praticiens", monthlyPrice: 299, yearlyPrice: 249, planTier: "cabinet" },
  ],
  specialiste: [
    { name: "Essentiel", subtitle: "Gestion agenda", monthlyPrice: 59, yearlyPrice: 49, planTier: "essentiel" },
    { name: "Pro", subtitle: "Gestion clinique", monthlyPrice: 169, yearlyPrice: 139, planTier: "pro", highlighted: true },
    { name: "Cabinet +", subtitle: "Multi-praticiens", monthlyPrice: 329, yearlyPrice: 279, planTier: "cabinet" },
  ],
  dentiste: [
    { name: "Essentiel", subtitle: "Gestion agenda", monthlyPrice: 49, yearlyPrice: 39, planTier: "essentiel" },
    { name: "Pro", subtitle: "Gestion complète", monthlyPrice: 149, yearlyPrice: 129, planTier: "pro", highlighted: true },
  ],
  kine: [
    { name: "Essentiel", subtitle: "Gestion agenda", monthlyPrice: 39, yearlyPrice: 29, planTier: "essentiel" },
    { name: "Pro", subtitle: "Suivi complet", monthlyPrice: 119, yearlyPrice: 99, planTier: "pro", highlighted: true },
  ],
  laboratory: [
    { name: "Standard", subtitle: "Gestion labo", monthlyPrice: 79, yearlyPrice: 59, planTier: "essentiel" },
    { name: "Premium", subtitle: "Labo connecté", monthlyPrice: 149, yearlyPrice: 129, planTier: "pro", highlighted: true },
  ],
  pharmacy: [
    { name: "Standard", subtitle: "Gestion pharmacie", monthlyPrice: 79, yearlyPrice: 59, planTier: "essentiel" },
    { name: "Premium", subtitle: "Pharmacie connectée", monthlyPrice: 149, yearlyPrice: 129, planTier: "pro", highlighted: true },
  ],
  clinic: [
    { name: "Établissement", subtitle: "Gestion multi-services", monthlyPrice: 499, yearlyPrice: 399, planTier: "pro", highlighted: true },
  ],
};

// ── Feature catalog ──
export const featureCatalog: FeatureDef[] = [
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
  { id: "prescription_specialized", label: "Ordonnance spécialisée", description: "Ordonnances adaptées à la spécialité", category: "Prescriptions" },
  { id: "prescription_digital_send", label: "Envoi numérique pharmacie", description: "Envoi direct de l'ordonnance à la pharmacie", category: "Prescriptions" },
  { id: "prescription_renewal", label: "Renouvellement automatique", description: "Demande de renouvellement sans RDV", category: "Prescriptions" },
  { id: "prescription_templates", label: "Modèles d'ordonnances", description: "Création de modèles réutilisables", category: "Prescriptions" },
  // Téléconsultation
  { id: "teleconsult_video", label: "Téléconsultation vidéo", description: "Consultation à distance en visioconférence HD", category: "Téléconsultation" },
  { id: "teleconsult_chat", label: "Messagerie patient sécurisée", description: "Chat sécurisé avec les patients", category: "Téléconsultation" },
  { id: "teleconsult_screen_share", label: "Partage d'écran", description: "Partage d'écran durant la téléconsultation", category: "Téléconsultation" },
  { id: "teleconsult_recording", label: "Enregistrement consultation", description: "Enregistrement audio/vidéo", category: "Téléconsultation" },
  // Analyses & Labo
  { id: "lab_request", label: "Demandes d'analyses", description: "Envoi de demandes d'analyses au labo", category: "Analyses & Labo" },
  { id: "lab_results_view", label: "Réception résultats labo", description: "Consultation des résultats d'analyses", category: "Analyses & Labo" },
  { id: "lab_auto_integration", label: "Intégration automates", description: "Connexion directe avec automates labo", category: "Analyses & Labo" },
  // Outils spécialisés
  { id: "dental_chart", label: "Schéma dentaire numérique", description: "Cartographie dentaire interactive", category: "Outils spécialisés" },
  { id: "dental_quote", label: "Devis & plans de traitement", description: "Devis détaillés pour traitements dentaires", category: "Outils spécialisés" },
  { id: "kine_exercises", label: "Exercices à domicile", description: "Bibliothèque d'exercices patients", category: "Outils spécialisés" },
  { id: "kine_balance", label: "Bilan kinésithérapie", description: "Formulaire de bilan kiné structuré", category: "Outils spécialisés" },
  { id: "ophtalmo_exam", label: "Examen ophtalmologique", description: "Examen ophtalmo avec acuité visuelle", category: "Outils spécialisés" },
  { id: "cardio_ecg", label: "Interprétation ECG", description: "Module d'interprétation ECG intégré", category: "Outils spécialisés" },
  // Pharmacie
  { id: "rx_reception", label: "Réception ordonnances", description: "Réception ordonnances numériques", category: "Pharmacie" },
  { id: "stock_basic", label: "Gestion de stock basique", description: "Suivi du stock avec alertes", category: "Pharmacie" },
  { id: "stock_advanced", label: "Stock avancé & alertes", description: "Gestion avancée avec prévisions", category: "Pharmacie" },
  { id: "substitution_auto", label: "Substitution automatique", description: "Proposition de génériques", category: "Pharmacie" },
  { id: "guard_schedule", label: "Gestion garde", description: "Calendrier pharmacie de garde", category: "Pharmacie" },
  // IA & Avancé
  { id: "ai_assistant", label: "Assistant IA diagnostic", description: "Aide IA au diagnostic", category: "IA & Avancé" },
  { id: "ai_specialized", label: "IA spécialisée par domaine", description: "Modèle IA adapté à la spécialité", category: "IA & Avancé" },
  { id: "stats_basic", label: "Statistiques basiques", description: "Nombre de RDV, patients, revenus", category: "IA & Avancé" },
  { id: "stats_advanced", label: "Statistiques avancées", description: "Analyse détaillée et tendances", category: "IA & Avancé" },
  { id: "auto_report", label: "Compte-rendu automatisé", description: "Génération automatique de CR", category: "IA & Avancé" },
  // Cabinet & Organisation
  { id: "multi_practitioners", label: "Multi-praticiens", description: "Jusqu'à 5 praticiens", category: "Cabinet & Organisation" },
  { id: "shared_secretary", label: "Secrétariat partagé", description: "Secrétaire commun(e)", category: "Cabinet & Organisation" },
  { id: "centralized_billing", label: "Facturation centralisée", description: "Facturation unique", category: "Cabinet & Organisation" },
  { id: "api_integrations", label: "API & Intégrations", description: "Accès API pour outils tiers", category: "Cabinet & Organisation" },
  { id: "account_manager", label: "Account manager dédié", description: "Interlocuteur dédié", category: "Cabinet & Organisation" },
  // Support
  { id: "support_email", label: "Support email", description: "Support par email sous 48h", category: "Support" },
  { id: "support_priority", label: "Support prioritaire", description: "Réponse sous 4h", category: "Support" },
  { id: "onsite_training", label: "Formation sur site", description: "Formation dans vos locaux", category: "Support" },
];

// ── Default feature states ──
export const buildDefaultState = (activityId: ActivityType): FeatureState => {
  const state: FeatureState = {};
  const plans = plansByActivity[activityId];
  const planIds = plans.map(p => p.id);

  featureCatalog.forEach(f => {
    state[f.id] = {};
    planIds.forEach(plan => {
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
      if (activityId === "specialiste" && f.id === "prescription_specialized" && plan !== "essentiel") enabled = true;
      if (activityId === "laboratory" && ["lab_auto_integration", "lab_results_view", "lab_request"].includes(f.id)) enabled = true;
      if (activityId === "pharmacy" && ["rx_reception", "stock_basic", "guard_schedule"].includes(f.id)) enabled = true;
      if (activityId === "pharmacy" && plan !== "essentiel" && ["stock_advanced", "substitution_auto"].includes(f.id)) enabled = true;

      state[f.id][plan] = enabled;
    });
  });

  return state;
};

// ── Persistence ──
const getStoredMatrix = (): Record<ActivityType, FeatureState> | null => {
  try {
    const raw = localStorage.getItem(MATRIX_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const getStoredOverrides = (): Record<ActivityType, SpecialtyOverrides> | null => {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const getFullMatrix = (): Record<ActivityType, FeatureState> => {
  const stored = getStoredMatrix();
  if (stored) return stored;
  // Build defaults
  const all: Record<string, FeatureState> = {};
  activities.forEach(a => { all[a.id] = buildDefaultState(a.id); });
  return all as Record<ActivityType, FeatureState>;
};

export const getFullOverrides = (): Record<ActivityType, SpecialtyOverrides> => {
  const stored = getStoredOverrides();
  if (stored) return stored;
  const all: Record<string, SpecialtyOverrides> = {};
  activities.forEach(a => { all[a.id] = {}; });
  return all as Record<ActivityType, SpecialtyOverrides>;
};

export const saveMatrix = (matrix: Record<ActivityType, FeatureState>) => {
  localStorage.setItem(MATRIX_KEY, JSON.stringify(matrix));
};

export const saveOverrides = (overrides: Record<ActivityType, SpecialtyOverrides>) => {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
};

// ── Public API: Get features enabled for a given activity/specialty/plan ──
export const getEnabledFeatures = (
  activity: ActivityType,
  plan: PlanTier,
  specialty?: string
): FeatureDef[] => {
  const matrix = getFullMatrix();
  const overrides = getFullOverrides();
  const baseState = matrix[activity] || {};

  // Merge specialty overrides if applicable
  let effectiveState = baseState;
  if (specialty && overrides[activity]?.[specialty]) {
    const specOverrides = overrides[activity][specialty];
    effectiveState = {};
    Object.keys(baseState).forEach(fId => {
      effectiveState[fId] = { ...baseState[fId], ...(specOverrides[fId] || {}) };
    });
  }

  return featureCatalog.filter(f => effectiveState[f.id]?.[plan]);
};

/** Get feature labels for display on plan cards */
export const getEnabledFeatureLabels = (
  activity: ActivityType,
  plan: PlanTier,
  specialty?: string
): string[] => {
  return getEnabledFeatures(activity, plan, specialty).map(f => f.label);
};

/** Map plan name (from BecomePartner) to PlanTier */
export const planNameToTier = (name: string, activity: ActivityType): PlanTier => {
  const lower = name.toLowerCase();
  if (lower.includes("cabinet") || lower.includes("établissement")) return "cabinet";
  if (lower.includes("pro") || lower.includes("premium")) return "pro";
  return "essentiel";
};
