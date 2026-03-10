/**
 * specialtyPatientConfig.ts — Adapts the patient record (dossier) per doctor specialty.
 * Controls: tabs, vitals displayed, reminder types, sidebar widgets.
 */

export interface PatientSpecialtyConfig {
  /** Which tabs to show */
  tabs: { value: string; label: string }[];
  /** Vitals keys to show in sidebar */
  vitalsKeys: { key: string; label: string; unit?: string }[];
  /** Extra sidebar widgets */
  sidebarWidgets?: { id: string; title: string; items: string[] }[];
  /** Reminders specific to specialty */
  reminders?: { label: string; hint: string }[];
  /** Antecedent labels */
  anteLabels?: { medical: string; surgical: string; traumatic: string; family: string };
}

const defaultTabs = [
  { value: "historique", label: "Historique" },
  { value: "antecedents", label: "Antécédents" },
  { value: "traitement", label: "Traitement" },
  { value: "constantes", label: "Constantes" },
  { value: "notes", label: "Notes clinique" },
  { value: "notes_prive", label: "Notes privé" },
  { value: "documents", label: "Documents" },
];

const defaultVitals = [
  { key: "ta", label: "TA", unit: "mmHg" },
  { key: "fc", label: "FC", unit: "bpm" },
  { key: "weight", label: "Poids", unit: "kg" },
  { key: "gly", label: "Glycémie" },
];

export const patientSpecialtyConfigs: Record<string, PatientSpecialtyConfig> = {
  default: {
    tabs: defaultTabs,
    vitalsKeys: defaultVitals,
    reminders: [
      { label: "Bilan HbA1c à prescrire", hint: "3 mois" },
      { label: "Fond d'œil annuel", hint: "à prévoir" },
    ],
  },

  "Ophtalmologue": {
    tabs: [
      { value: "historique", label: "Historique examens" },
      { value: "antecedents", label: "ATCD ophtalmologiques" },
      { value: "traitement", label: "Traitement en cours" },
      { value: "constantes", label: "Mesures visuelles" },
      { value: "notes", label: "Notes cliniques" },
      { value: "notes_prive", label: "Notes privé" },
      { value: "documents", label: "Documents & Imagerie" },
    ],
    vitalsKeys: [
      { key: "acuityOD", label: "Acuité OD" },
      { key: "acuityOG", label: "Acuité OG" },
      { key: "tonometryOD", label: "PIO OD", unit: "mmHg" },
      { key: "tonometryOG", label: "PIO OG", unit: "mmHg" },
      { key: "ta", label: "TA", unit: "mmHg" },
    ],
    sidebarWidgets: [
      { id: "correction", title: "Correction optique actuelle", items: ["OD: —", "OG: —"] },
    ],
    reminders: [
      { label: "Fond d'œil de contrôle", hint: "annuel" },
      { label: "Champ visuel de suivi (glaucome)", hint: "6 mois" },
      { label: "Renouvellement prescription optique", hint: "à vérifier" },
    ],
    anteLabels: { medical: "ATCD ophtalmologiques", surgical: "Chirurgies oculaires", traumatic: "Traumatismes oculaires", family: "ATCD familiaux (glaucome, DMLA)" },
  },

  "Cardiologue": {
    tabs: [
      { value: "historique", label: "Historique cardio" },
      { value: "antecedents", label: "ATCD cardiovasculaires" },
      { value: "traitement", label: "Traitement cardiaque" },
      { value: "constantes", label: "Constantes & ECG" },
      { value: "notes", label: "Notes cliniques" },
      { value: "notes_prive", label: "Notes privé" },
      { value: "documents", label: "Examens & Imagerie" },
    ],
    vitalsKeys: [
      { key: "ta", label: "TA", unit: "mmHg" },
      { key: "fc", label: "FC", unit: "bpm" },
      { key: "weight", label: "Poids", unit: "kg" },
      { key: "ecg", label: "ECG" },
      { key: "fevg", label: "FEVG", unit: "%" },
    ],
    reminders: [
      { label: "ECG de contrôle", hint: "trimestriel" },
      { label: "Bilan lipidique", hint: "annuel" },
      { label: "Écho cardiaque de suivi", hint: "annuel" },
    ],
    anteLabels: { medical: "ATCD cardiovasculaires", surgical: "Chirurgies cardiaques", traumatic: "Traumatismes", family: "ATCD familiaux cardiovasculaires" },
  },

  "Pédiatre": {
    tabs: [
      { value: "historique", label: "Historique consultations" },
      { value: "antecedents", label: "ATCD néonatals & infantiles" },
      { value: "traitement", label: "Traitement en cours" },
      { value: "constantes", label: "Croissance & Constantes" },
      { value: "notes", label: "Notes cliniques" },
      { value: "notes_prive", label: "Notes privé" },
      { value: "documents", label: "Documents & Carnet" },
    ],
    vitalsKeys: [
      { key: "weight", label: "Poids", unit: "kg" },
      { key: "height", label: "Taille", unit: "cm" },
      { key: "headCirc", label: "PC", unit: "cm" },
      { key: "fc", label: "FC", unit: "bpm" },
      { key: "gly", label: "Température", unit: "°C" },
    ],
    sidebarWidgets: [
      { id: "vaccins", title: "Calendrier vaccinal", items: ["BCG ✓", "DTC-Polio ✓", "ROR ✓", "Hépatite B ✓"] },
    ],
    reminders: [
      { label: "Vaccination de rappel", hint: "à vérifier" },
      { label: "Visite systématique (croissance)", hint: "trimestriel" },
    ],
    anteLabels: { medical: "ATCD néonatals & pathologies", surgical: "Chirurgies pédiatriques", traumatic: "Traumatismes", family: "ATCD familiaux & héréditaires" },
  },

  "Dermatologue": {
    tabs: defaultTabs,
    vitalsKeys: [
      { key: "ta", label: "TA", unit: "mmHg" },
      { key: "weight", label: "Poids", unit: "kg" },
    ],
    reminders: [
      { label: "Contrôle naevi (dermatoscopie)", hint: "annuel" },
      { label: "Bilan hépatique (si isotrétinoïne)", hint: "mensuel" },
    ],
    anteLabels: { medical: "ATCD dermatologiques", surgical: "Exérèses / Biopsies", traumatic: "Brûlures / Cicatrices", family: "ATCD familiaux (mélanome, psoriasis)" },
  },

  "Psychiatre": {
    tabs: [
      { value: "historique", label: "Historique séances" },
      { value: "antecedents", label: "ATCD psychiatriques" },
      { value: "traitement", label: "Traitement psychotrope" },
      { value: "constantes", label: "Constantes" },
      { value: "notes", label: "Notes de suivi" },
      { value: "notes_prive", label: "Notes confidentielles" },
      { value: "documents", label: "Documents" },
    ],
    vitalsKeys: [
      { key: "ta", label: "TA", unit: "mmHg" },
      { key: "weight", label: "Poids", unit: "kg" },
    ],
    reminders: [
      { label: "Réévaluation traitement", hint: "1 mois" },
      { label: "Bilan biologique (lithiémie, hépatique)", hint: "trimestriel" },
      { label: "Échelle PHQ-9 / GAD-7", hint: "à chaque séance" },
    ],
    anteLabels: { medical: "ATCD psychiatriques", surgical: "Hospitalisations psychiatriques", traumatic: "Événements traumatiques", family: "ATCD psychiatriques familiaux" },
  },

  "Gynécologue": {
    tabs: [
      { value: "historique", label: "Historique gynéco" },
      { value: "antecedents", label: "ATCD gynéco-obstétricaux" },
      { value: "traitement", label: "Traitement / Contraception" },
      { value: "constantes", label: "Constantes" },
      { value: "notes", label: "Notes cliniques" },
      { value: "notes_prive", label: "Notes privé" },
      { value: "documents", label: "Examens & Échographies" },
    ],
    vitalsKeys: [
      { key: "ta", label: "TA", unit: "mmHg" },
      { key: "weight", label: "Poids", unit: "kg" },
      { key: "fc", label: "FC", unit: "bpm" },
    ],
    reminders: [
      { label: "Frottis cervico-vaginal", hint: "tous les 3 ans" },
      { label: "Mammographie", hint: "à partir de 50 ans" },
      { label: "Suivi grossesse (si applicable)", hint: "mensuel" },
    ],
    anteLabels: { medical: "ATCD gynécologiques", surgical: "Chirurgies gynécologiques", traumatic: "Obstétricaux (G/P)", family: "ATCD familiaux (cancer sein/ovaire)" },
  },

  dentiste: {
    tabs: [
      { value: "historique", label: "Historique soins" },
      { value: "antecedents", label: "ATCD médicaux" },
      { value: "traitement", label: "Plan de traitement" },
      { value: "constantes", label: "Constantes" },
      { value: "notes", label: "Notes cliniques" },
      { value: "notes_prive", label: "Notes privé" },
      { value: "documents", label: "Radiographies & Docs" },
    ],
    vitalsKeys: [
      { key: "ta", label: "TA", unit: "mmHg" },
    ],
    reminders: [
      { label: "Détartrage de contrôle", hint: "semestriel" },
      { label: "Panoramique dentaire", hint: "annuel" },
      { label: "Contrôle prothèse", hint: "à planifier" },
    ],
    anteLabels: { medical: "ATCD médicaux généraux", surgical: "Chirurgies dentaires antérieures", traumatic: "Traumatismes dentaires", family: "ATCD familiaux" },
  },

  kine: {
    tabs: [
      { value: "historique", label: "Historique séances" },
      { value: "antecedents", label: "ATCD & Pathologies" },
      { value: "traitement", label: "Programme rééducation" },
      { value: "constantes", label: "Bilans" },
      { value: "notes", label: "Notes de séance" },
      { value: "notes_prive", label: "Notes privé" },
      { value: "documents", label: "Ordonnances & Docs" },
    ],
    vitalsKeys: [
      { key: "weight", label: "Poids", unit: "kg" },
      { key: "painEVA", label: "EVA Douleur", unit: "/10" },
    ],
    reminders: [
      { label: "Bilan de réévaluation", hint: "10 séances" },
      { label: "Renouvellement ordonnance kiné", hint: "à vérifier" },
    ],
    anteLabels: { medical: "ATCD médicaux & orthopédiques", surgical: "Chirurgies orthopédiques", traumatic: "Traumatismes musculo-squelettiques", family: "ATCD familiaux" },
  },

  "ORL": {
    tabs: defaultTabs,
    vitalsKeys: defaultVitals,
    reminders: [
      { label: "Audiogramme de contrôle", hint: "annuel" },
      { label: "TDM sinus de contrôle", hint: "à planifier" },
    ],
    anteLabels: { medical: "ATCD ORL", surgical: "Chirurgies ORL", traumatic: "Traumatismes", family: "ATCD familiaux (surdité)" },
  },

  "Neurologue": {
    tabs: defaultTabs,
    vitalsKeys: defaultVitals,
    reminders: [
      { label: "IRM cérébrale de contrôle", hint: "annuel" },
      { label: "Dosage antiépileptiques", hint: "trimestriel" },
      { label: "EEG de suivi", hint: "semestriel" },
    ],
    anteLabels: { medical: "ATCD neurologiques", surgical: "Neurochirurgies", traumatic: "Traumatismes crâniens", family: "ATCD familiaux neurologiques" },
  },
};

export function getPatientSpecialtyConfig(activity: string, specialty?: string): PatientSpecialtyConfig {
  if (activity === "dentiste" && patientSpecialtyConfigs.dentiste) return patientSpecialtyConfigs.dentiste;
  if (activity === "kine" && patientSpecialtyConfigs.kine) return patientSpecialtyConfigs.kine;
  if (specialty && patientSpecialtyConfigs[specialty]) return patientSpecialtyConfigs[specialty];
  return patientSpecialtyConfigs.default;
}
