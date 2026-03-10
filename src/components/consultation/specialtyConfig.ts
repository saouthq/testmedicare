/**
 * specialtyConfig.ts — Central config for adapting the entire doctor workspace per specialty.
 * Controls: dashboard KPIs, sidebar labels, consultation notes, action dock tabs, vitals, motifs.
 */
import type { ActivityType } from "@/stores/featureMatrixStore";

export interface SpecialtyWorkspaceConfig {
  /** Display name */
  label: string;
  /** Dashboard greeting subtitle */
  dashboardSubtitle: string;
  /** Custom quick actions for dashboard (override defaults) */
  quickActions?: { label: string; icon: string; to: string }[];
  /** KPI labels override */
  kpiLabels?: { done: string; waiting: string; renewals: string; teleconsult: string };
  /** Hide teleconsultation section on dashboard */
  hideTeleconsult?: boolean;
  /** Sidebar label overrides: url → new label */
  sidebarLabels?: Record<string, string>;
  /** Sidebar items to hide */
  sidebarHidden?: string[];
  /** Consultation note sections (override defaults) */
  noteSections: { id: string; label: string; hint?: string; accent: string; placeholder: string; rows?: number; singleLine?: boolean; required?: boolean }[];
  /** ActionDock tab labels */
  dockTabs?: { rx: string; labs: string; docs: string; close: string };
  /** Hide analyses tab */
  hideAnalysesTab?: boolean;
  /** Custom dock tab replacing analyses */
  customDockTab?: { key: string; label: string; icon: string };
  /** Vitals to show in PatientSidebar */
  vitals: { key: string; label: string; unit?: string; icon: string; placeholder?: string }[];
  /** Extra vitals specific to specialty */
  extraVitals?: { key: string; label: string; unit?: string; placeholder?: string }[];
  /** Default consultation amount */
  defaultAmount?: string;
  /** Consultation motifs specific to specialty */
  motifs?: string[];
  /** Color accent for specialty */
  accentColor: string;
}

const defaultNotes = [
  { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Suivi diabète type 2 · Douleur thoracique · Fièvre depuis 3 jours…", singleLine: true, required: true },
  { id: "symptoms", label: "Anamnèse / Symptômes", hint: "Histoire de la maladie", accent: "amber", placeholder: "Évolution des symptômes, intensité, facteurs déclenchants…", rows: 4, required: true },
  { id: "examination", label: "Examen clinique", hint: "Findings objectifs", accent: "teal", placeholder: "État général, auscultation, palpation…", rows: 4, required: true },
  { id: "diagnosis", label: "Diagnostic", accent: "violet", placeholder: "Diagnostic principal, différentiel…", rows: 4, required: true },
  { id: "conclusion", label: "Plan / Conduite à tenir", accent: "emerald", placeholder: "Traitement, examens complémentaires, suivi…", rows: 4 },
];

const defaultVitals = [
  { key: "bp", label: "TA (mmHg)", icon: "Gauge" },
  { key: "heartRate", label: "FC (bpm)", icon: "Heart" },
  { key: "temperature", label: "Température", unit: "°C", icon: "Thermometer" },
  { key: "oxygenSat", label: "SpO2", unit: "%", icon: "Droplets" },
  { key: "weight", label: "Poids", unit: "kg", icon: "Scale" },
  { key: "bmi", label: "IMC", icon: "Activity" },
];

export const specialtyConfigs: Record<string, SpecialtyWorkspaceConfig> = {
  // ─── Généraliste ───────────────────────────────
  default: {
    label: "Médecin généraliste",
    dashboardSubtitle: "Médecine générale",
    accentColor: "primary",
    noteSections: defaultNotes,
    vitals: defaultVitals,
    motifs: ["Consultation générale", "Suivi maladie chronique", "Renouvellement ordonnance", "Certificat médical", "Bilan de santé", "Vaccination"],
  },

  // ─── Ophtalmologue ─────────────────────────────
  "Ophtalmologue": {
    label: "Ophtalmologue",
    dashboardSubtitle: "Ophtalmologie",
    accentColor: "blue-500",
    hideTeleconsult: true,
    sidebarLabels: {
      "/dashboard/doctor/consultations": "Examens",
      "/dashboard/doctor/prescriptions": "Prescriptions optiques",
    },
    sidebarHidden: ["/dashboard/doctor/connect"],
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Baisse d'acuité visuelle · Contrôle annuel · Corps flottants…", singleLine: true, required: true },
      { id: "symptoms", label: "Symptômes visuels", hint: "Anamnèse ophtalmologique", accent: "amber", placeholder: "Baisse de vision, douleurs oculaires, photophobie, larmoiement, vision floue, halos, diplopie…", rows: 3, required: true },
      { id: "examination", label: "Examen ophtalmologique", hint: "Segment antérieur & postérieur", accent: "teal", placeholder: "Acuité visuelle OD/OG, réfraction, lampe à fente, fond d'œil, tonométrie, champ visuel…", rows: 5, required: true },
      { id: "diagnosis", label: "Diagnostic ophtalmologique", accent: "violet", placeholder: "Myopie, astigmatisme, glaucome, cataracte, DMLA, rétinopathie…", rows: 3, required: true },
      { id: "conclusion", label: "Conduite à tenir / Prescription", accent: "emerald", placeholder: "Prescription optique, traitement, surveillance, chirurgie programmée…", rows: 4 },
    ],
    dockTabs: { rx: "Rx optique", labs: "Examens", docs: "Docs", close: "Clôture" },
    vitals: [
      { key: "bp", label: "TA (mmHg)", icon: "Gauge" },
      { key: "heartRate", label: "FC (bpm)", icon: "Heart" },
    ],
    extraVitals: [
      { key: "acuityOD", label: "Acuité OD", placeholder: "10/10" },
      { key: "acuityOG", label: "Acuité OG", placeholder: "10/10" },
      { key: "tonometryOD", label: "PIO OD (mmHg)", placeholder: "14" },
      { key: "tonometryOG", label: "PIO OG (mmHg)", placeholder: "15" },
    ],
    defaultAmount: "45",
    motifs: ["Contrôle annuel", "Baisse acuité visuelle", "Prescription lunettes", "Fond d'œil diabétique", "Glaucome suivi", "Cataracte bilan", "Urgence oculaire"],
  },

  // ─── Cardiologue ───────────────────────────────
  "Cardiologue": {
    label: "Cardiologue",
    dashboardSubtitle: "Cardiologie",
    accentColor: "red-500",
    sidebarLabels: {
      "/dashboard/doctor/consultations": "Consultations cardio",
    },
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Douleur thoracique · Dyspnée d'effort · Suivi HTA · Palpitations…", singleLine: true, required: true },
      { id: "symptoms", label: "Anamnèse cardiologique", hint: "Symptômes cardiovasculaires", accent: "amber", placeholder: "Douleur thoracique (type, irradiation, durée), dyspnée (NYHA), palpitations, syncope, œdèmes…", rows: 4, required: true },
      { id: "examination", label: "Examen cardiovasculaire", hint: "Auscultation, pouls, signes", accent: "teal", placeholder: "Auscultation cardiaque (souffles, B3/B4), pouls périphériques, jugulaires, OMI, hépatomégalie…", rows: 4, required: true },
      { id: "diagnosis", label: "Diagnostic cardiologique", accent: "violet", placeholder: "HTA, insuffisance cardiaque, FA, coronaropathie, valvulopathie…", rows: 3, required: true },
      { id: "conclusion", label: "Plan thérapeutique", accent: "emerald", placeholder: "Traitement, explorations (ECG, écho, Holter, épreuve d'effort), suivi…", rows: 4 },
    ],
    vitals: defaultVitals,
    extraVitals: [
      { key: "ecgResult", label: "ECG", placeholder: "Rythme sinusal" },
      { key: "fevg", label: "FEVG (%)", placeholder: "60" },
    ],
    defaultAmount: "60",
    motifs: ["Consultation cardiologique", "Suivi HTA", "Contrôle ECG", "Écho cardiaque", "Holter tensionnel", "Épreuve d'effort", "Bilan pré-opératoire"],
  },

  // ─── Dermatologue ──────────────────────────────
  "Dermatologue": {
    label: "Dermatologue",
    dashboardSubtitle: "Dermatologie",
    accentColor: "pink-500",
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Lésion cutanée suspecte · Acné · Eczéma · Contrôle naevi…", singleLine: true, required: true },
      { id: "symptoms", label: "Anamnèse dermatologique", hint: "Évolution des lésions", accent: "amber", placeholder: "Date d'apparition, évolution, prurit, douleur, facteurs déclenchants, traitements essayés…", rows: 3, required: true },
      { id: "examination", label: "Examen dermatologique", hint: "Description lésionnelle", accent: "teal", placeholder: "Type de lésion, localisation, taille, couleur, bords, surface, distribution, dermatoscopie…", rows: 5, required: true },
      { id: "diagnosis", label: "Diagnostic dermatologique", accent: "violet", placeholder: "Dermatite atopique, psoriasis, naevus dysplasique, carcinome basocellulaire…", rows: 3, required: true },
      { id: "conclusion", label: "Conduite à tenir", accent: "emerald", placeholder: "Traitement topique/systémique, biopsie, exérèse, photothérapie, suivi…", rows: 4 },
    ],
    vitals: [
      { key: "bp", label: "TA (mmHg)", icon: "Gauge" },
      { key: "weight", label: "Poids", unit: "kg", icon: "Scale" },
    ],
    defaultAmount: "50",
    motifs: ["Contrôle des grains de beauté", "Acné", "Eczéma", "Psoriasis", "Lésion suspecte", "Dermatoscopie", "Allergologie cutanée"],
  },

  // ─── Pédiatre ──────────────────────────────────
  "Pédiatre": {
    label: "Pédiatre",
    dashboardSubtitle: "Pédiatrie",
    accentColor: "green-500",
    sidebarLabels: {
      "/dashboard/doctor/patients": "Mes jeunes patients",
    },
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Visite systématique · Fièvre · Vaccination · Trouble du sommeil…", singleLine: true, required: true },
      { id: "symptoms", label: "Anamnèse pédiatrique", hint: "Symptômes & développement", accent: "amber", placeholder: "Symptômes rapportés par les parents, alimentation, sommeil, comportement, transit…", rows: 4, required: true },
      { id: "examination", label: "Examen pédiatrique", hint: "Examen complet + croissance", accent: "teal", placeholder: "Poids, taille, PC, examen des fontanelles, otoscopie, auscultation, abdomen, réflexes…", rows: 4, required: true },
      { id: "diagnosis", label: "Diagnostic", accent: "violet", placeholder: "Rhinopharyngite, otite, gastro-entérite, développement normal…", rows: 3, required: true },
      { id: "conclusion", label: "Conduite à tenir", accent: "emerald", placeholder: "Traitement, conseils aux parents, vaccinations, prochain RDV de suivi…", rows: 4 },
    ],
    vitals: [
      { key: "weight", label: "Poids", unit: "kg", icon: "Scale" },
      { key: "temperature", label: "Température", unit: "°C", icon: "Thermometer" },
      { key: "heartRate", label: "FC (bpm)", icon: "Heart" },
      { key: "oxygenSat", label: "SpO2", unit: "%", icon: "Droplets" },
    ],
    extraVitals: [
      { key: "height", label: "Taille (cm)", placeholder: "75" },
      { key: "headCirc", label: "PC (cm)", placeholder: "46" },
      { key: "ageMonths", label: "Âge (mois)", placeholder: "12" },
    ],
    defaultAmount: "40",
    motifs: ["Visite systématique", "Vaccination", "Fièvre", "Gastro-entérite", "Otite", "Trouble du sommeil", "Suivi croissance"],
  },

  // ─── ORL ───────────────────────────────────────
  "ORL": {
    label: "ORL",
    dashboardSubtitle: "Oto-rhino-laryngologie",
    accentColor: "amber-500",
    hideTeleconsult: true,
    sidebarHidden: ["/dashboard/doctor/connect"],
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Surdité · Vertiges · Rhinite chronique · Angine récidivante…", singleLine: true, required: true },
      { id: "symptoms", label: "Anamnèse ORL", hint: "Symptômes oreille, nez, gorge", accent: "amber", placeholder: "Hypoacousie, acouphènes, vertiges, obstruction nasale, rhinorrhée, dysphonie, dysphagie…", rows: 4, required: true },
      { id: "examination", label: "Examen ORL", hint: "Otoscopie, rhinoscopie, oropharynx", accent: "teal", placeholder: "Otoscopie bilatérale, tympans, rhinoscopie antérieure/postérieure, cavité buccale, palpation cervicale…", rows: 5, required: true },
      { id: "diagnosis", label: "Diagnostic ORL", accent: "violet", placeholder: "Otite, sinusite, rhinite allergique, polypes, nodules cordes vocales…", rows: 3, required: true },
      { id: "conclusion", label: "Conduite à tenir", accent: "emerald", placeholder: "Traitement, audiogramme, TDM, chirurgie programmée…", rows: 4 },
    ],
    vitals: defaultVitals,
    defaultAmount: "50",
    motifs: ["Audiogramme", "Vertiges", "Sinusite", "Amygdalite", "Acouphènes", "Polypes nasaux", "Bilan pré-opératoire"],
  },

  // ─── Psychiatre ────────────────────────────────
  "Psychiatre": {
    label: "Psychiatre",
    dashboardSubtitle: "Psychiatrie",
    accentColor: "indigo-500",
    sidebarLabels: {
      "/dashboard/doctor/consultations": "Séances",
      "/dashboard/doctor/prescriptions": "Prescriptions psy",
    },
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Suivi dépression · Anxiété généralisée · Insomnie · Première consultation…", singleLine: true, required: true },
      { id: "symptoms", label: "Évaluation clinique", hint: "État psychique actuel", accent: "amber", placeholder: "Humeur, anxiété, sommeil, appétit, idéation suicidaire, fonctionnement social, événements de vie récents…", rows: 5, required: true },
      { id: "examination", label: "Examen mental", hint: "État psychiatrique", accent: "teal", placeholder: "Présentation, contact, discours, pensée (contenu/cours), perception, cognition, insight, jugement…", rows: 5, required: true },
      { id: "diagnosis", label: "Diagnostic psychiatrique", accent: "violet", placeholder: "EDM, TAG, trouble panique, TSPT, trouble bipolaire, schizophrénie…", rows: 3, required: true },
      { id: "conclusion", label: "Plan thérapeutique", accent: "emerald", placeholder: "Psychothérapie, traitement médicamenteux, suivi rapproché, orientation…", rows: 4 },
    ],
    vitals: [
      { key: "bp", label: "TA (mmHg)", icon: "Gauge" },
      { key: "weight", label: "Poids", unit: "kg", icon: "Scale" },
    ],
    defaultAmount: "70",
    motifs: ["Première consultation", "Suivi psychothérapie", "Suivi traitement", "Urgence psy", "Renouvellement ordonnance", "Bilan psychométrique"],
  },

  // ─── Neurologue ────────────────────────────────
  "Neurologue": {
    label: "Neurologue",
    dashboardSubtitle: "Neurologie",
    accentColor: "purple-500",
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Céphalées · Épilepsie suivi · Neuropathie · Tremblements…", singleLine: true, required: true },
      { id: "symptoms", label: "Anamnèse neurologique", hint: "Symptômes neurologiques", accent: "amber", placeholder: "Céphalées (type, localisation, aura), déficits moteurs/sensitifs, troubles cognitifs, convulsions…", rows: 4, required: true },
      { id: "examination", label: "Examen neurologique", hint: "Examen clinique détaillé", accent: "teal", placeholder: "Paires crâniennes, force musculaire (cotation), sensibilité, réflexes, coordination, marche, Romberg…", rows: 5, required: true },
      { id: "diagnosis", label: "Diagnostic neurologique", accent: "violet", placeholder: "Migraine, épilepsie, SEP, maladie de Parkinson, neuropathie périphérique…", rows: 3, required: true },
      { id: "conclusion", label: "Plan thérapeutique", accent: "emerald", placeholder: "Traitement, EEG, IRM, EMG, bilan neuropsychologique, suivi…", rows: 4 },
    ],
    vitals: defaultVitals,
    defaultAmount: "60",
    motifs: ["Céphalées", "Épilepsie suivi", "Neuropathie", "Tremblements", "Bilan mémoire", "EMG", "EEG"],
  },

  // ─── Gynécologue ───────────────────────────────
  "Gynécologue": {
    label: "Gynécologue",
    dashboardSubtitle: "Gynécologie-Obstétrique",
    accentColor: "rose-500",
    sidebarLabels: {
      "/dashboard/doctor/patients": "Mes patientes",
    },
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Suivi grossesse · Frottis · Contraception · Douleurs pelviennes…", singleLine: true, required: true },
      { id: "symptoms", label: "Anamnèse gynécologique", hint: "ATCD gynéco-obstétricaux", accent: "amber", placeholder: "Gestité/Parité, DDR, cycles, contraception actuelle, métrorragies, douleurs, leucorrhées…", rows: 4, required: true },
      { id: "examination", label: "Examen gynécologique", hint: "Examen clinique + écho", accent: "teal", placeholder: "Seins, spéculum, toucher vaginal, échographie pelvienne, col, utérus, annexes…", rows: 4, required: true },
      { id: "diagnosis", label: "Diagnostic", accent: "violet", placeholder: "Grossesse normale, kyste ovarien, endométriose, infection génitale…", rows: 3, required: true },
      { id: "conclusion", label: "Conduite à tenir", accent: "emerald", placeholder: "Traitement, examens complémentaires, échographie de contrôle, suivi grossesse…", rows: 4 },
    ],
    vitals: [
      { key: "bp", label: "TA (mmHg)", icon: "Gauge" },
      { key: "weight", label: "Poids", unit: "kg", icon: "Scale" },
      { key: "heartRate", label: "FC (bpm)", icon: "Heart" },
    ],
    extraVitals: [
      { key: "pregnancyWeek", label: "SA", placeholder: "28" },
      { key: "fetalHR", label: "RCF (bpm)", placeholder: "140" },
    ],
    defaultAmount: "70",
    motifs: ["Suivi grossesse", "Frottis cervico-vaginal", "Contraception", "Échographie obstétricale", "Douleurs pelviennes", "Ménopause suivi"],
  },

  // ─── Dentiste ──────────────────────────────────
  dentiste: {
    label: "Chirurgien-Dentiste",
    dashboardSubtitle: "Chirurgie dentaire",
    accentColor: "cyan-500",
    sidebarLabels: {
      "/dashboard/doctor/consultations": "Actes & Soins",
      "/dashboard/doctor/prescriptions": "Ordonnances",
      "/dashboard/doctor/billing": "Devis & Facturation",
    },
    kpiLabels: { done: "Actes réalisés", waiting: "En salle d'attente", renewals: "Devis en attente", teleconsult: "Téléconsultations" },
    noteSections: [
      { id: "motif", label: "Motif de consultation", accent: "blue", placeholder: "Ex : Douleur dentaire · Contrôle annuel · Détartrage · Prothèse…", singleLine: true, required: true },
      { id: "symptoms", label: "Anamnèse dentaire", hint: "Symptômes bucco-dentaires", accent: "amber", placeholder: "Douleur (localisation, intensité, type), saignements gingivaux, sensibilité, mobilité dentaire…", rows: 3, required: true },
      { id: "examination", label: "Examen bucco-dentaire", hint: "Examen clinique + radiologique", accent: "teal", placeholder: "État dentaire, parodontal, muqueuses, occlusion, ATM, panoramique dentaire, rétro-alvéolaire…", rows: 4, required: true },
      { id: "diagnosis", label: "Diagnostic dentaire", accent: "violet", placeholder: "Carie profonde dent 36, parodontite chronique, pulpite irréversible…", rows: 3, required: true },
      { id: "conclusion", label: "Plan de traitement", accent: "emerald", placeholder: "Soin conservateur, endodontie, extraction, pose couronne, plan prothétique…", rows: 4 },
    ],
    dockTabs: { rx: "Rx", labs: "Devis", docs: "Docs", close: "Clôture" },
    vitals: [
      { key: "bp", label: "TA (mmHg)", icon: "Gauge" },
    ],
    defaultAmount: "80",
    motifs: ["Contrôle annuel", "Détartrage", "Douleur dentaire", "Extraction", "Soin conservateur", "Prothèse", "Orthodontie"],
  },

  // ─── Kinésithérapeute ──────────────────────────
  kine: {
    label: "Kinésithérapeute",
    dashboardSubtitle: "Kinésithérapie",
    accentColor: "orange-500",
    sidebarLabels: {
      "/dashboard/doctor/consultations": "Séances",
      "/dashboard/doctor/prescriptions": "Ordonnances kiné",
      "/dashboard/doctor/waiting-room": "Patients du jour",
    },
    kpiLabels: { done: "Séances terminées", waiting: "En attente", renewals: "Renouvellements", teleconsult: "Télé-rééducation" },
    hideAnalysesTab: true,
    noteSections: [
      { id: "motif", label: "Motif de la séance", accent: "blue", placeholder: "Ex : Rééducation genou post-opératoire · Lombalgie chronique · Entorse cheville…", singleLine: true, required: true },
      { id: "symptoms", label: "Bilan initial / Évolution", hint: "État du patient", accent: "amber", placeholder: "Douleur (EVA), mobilité, force musculaire, autonomie, comparaison avec séance précédente…", rows: 4, required: true },
      { id: "examination", label: "Bilan kinésithérapique", hint: "Tests et mesures", accent: "teal", placeholder: "Bilan articulaire, musculaire, fonctionnel, proprioceptif, posture, marche, équilibre…", rows: 4, required: true },
      { id: "diagnosis", label: "Objectifs de séance", accent: "violet", placeholder: "Gagner 10° de flexion, renforcement quadriceps, travail proprioceptif, reprise marche…", rows: 3, required: true },
      { id: "conclusion", label: "Techniques réalisées & Programme", accent: "emerald", placeholder: "Mobilisations passives/actives, renforcement, étirements, électrothérapie, exercices à domicile…", rows: 4 },
    ],
    vitals: [
      { key: "weight", label: "Poids", unit: "kg", icon: "Scale" },
    ],
    extraVitals: [
      { key: "painEVA", label: "EVA Douleur", placeholder: "5/10" },
      { key: "sessionNum", label: "Séance n°", placeholder: "3/10" },
    ],
    defaultAmount: "25",
    motifs: ["Rééducation post-opératoire", "Lombalgie", "Cervicalgie", "Entorse", "Rééducation épaule", "Rééducation périnéale", "Bilan initial"],
  },
};

/**
 * Get the workspace config for the current doctor subscription
 */
export function getSpecialtyConfig(activity: ActivityType, specialty?: string): SpecialtyWorkspaceConfig {
  if (activity === "dentiste") return specialtyConfigs.dentiste;
  if (activity === "kine") return specialtyConfigs.kine;
  if (specialty && specialtyConfigs[specialty]) return specialtyConfigs[specialty];
  return specialtyConfigs.default;
}
