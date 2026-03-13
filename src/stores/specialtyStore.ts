/**
 * specialtyStore.ts — Admin-managed specialty registry.
 * Source of truth for all specialties across the platform.
 * Connected to: specialtyConfig, common.ts specialties list, search, registration, KYC.
 *
 * // TODO BACKEND: Replace with GET/POST/PUT/DELETE /api/admin/specialties
 */
import { createStore, useStore } from "./crossRoleStore";
import { saveAdminConfig, loadAdminConfig } from "./adminConfigSync";

export type SpecialtyCategory = "generaliste" | "specialiste" | "dentiste" | "paramedical" | "chirurgien";

export interface ManagedSpecialty {
  id: string;
  label: string;
  icon: string;
  category: SpecialtyCategory;
  enabled: boolean;
  activeDoctors: number;
  features: string[];
  requiredDocs: string[];
  motifs: string[];
  /** Default consultation amount in DT */
  defaultAmount: number;
  /** Whether teleconsultation is available */
  teleconsultEnabled: boolean;
  /** Whether AI assistant is available */
  aiEnabled: boolean;
  /** Custom note sections for consultation */
  noteSections: string[];
  /** Custom vitals to track */
  customVitals: string[];
  createdAt: string;
  updatedAt: string;
}

const now = new Date().toISOString();

const initialSpecialties: ManagedSpecialty[] = [
  {
    id: "generaliste", label: "Médecin généraliste", icon: "🩺", category: "generaliste",
    enabled: true, activeDoctors: 124, defaultAmount: 35, teleconsultEnabled: true, aiEnabled: true,
    features: ["Ordonnances", "Analyses", "Téléconsultation", "Certificats", "Feuille de soins"],
    requiredDocs: ["Diplôme de médecine", "Inscription Ordre des médecins"],
    motifs: ["Consultation générale", "Suivi maladie chronique", "Renouvellement ordonnance", "Certificat médical", "Vaccination", "Bilan de santé"],
    noteSections: ["Motif", "Anamnèse", "Examen clinique", "Diagnostic", "Plan de traitement"],
    customVitals: ["TA", "FC", "Température", "SpO2", "Poids", "IMC"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "cardiologue", label: "Cardiologue", icon: "❤️", category: "specialiste",
    enabled: true, activeDoctors: 18, defaultAmount: 60, teleconsultEnabled: true, aiEnabled: true,
    features: ["ECG intégré", "Écho cardiaque", "Holter", "Épreuve d'effort", "Ordonnances cardio"],
    requiredDocs: ["DES Cardiologie", "Inscription Ordre"],
    motifs: ["Bilan cardiaque", "Suivi HTA", "Douleur thoracique", "Palpitations", "Souffle cardiaque", "Post-infarctus"],
    noteSections: ["Motif", "Anamnèse cardiologique", "Examen cardiovasculaire", "ECG", "Diagnostic", "Plan"],
    customVitals: ["TA", "FC", "SpO2", "Poids", "Tour de taille"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "ophtalmologue", label: "Ophtalmologue", icon: "👁️", category: "specialiste",
    enabled: true, activeDoctors: 12, defaultAmount: 50, teleconsultEnabled: false, aiEnabled: false,
    features: ["Acuité visuelle", "Fond d'œil", "Tonométrie", "Prescription optique", "OCT"],
    requiredDocs: ["DES Ophtalmologie", "Inscription Ordre"],
    motifs: ["Contrôle vue", "Baisse d'acuité", "Rougeur oculaire", "Corps flottants", "Glaucome", "Cataracte"],
    noteSections: ["Motif", "Acuité visuelle OD/OG", "Examen biomicroscopique", "Fond d'œil", "Diagnostic", "Prescription"],
    customVitals: ["PIO OD", "PIO OG", "AV OD", "AV OG"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "dermatologue", label: "Dermatologue", icon: "🔬", category: "specialiste",
    enabled: true, activeDoctors: 15, defaultAmount: 50, teleconsultEnabled: true, aiEnabled: true,
    features: ["Galerie photos", "Dermatoscopie", "Biopsie", "Photothérapie"],
    requiredDocs: ["DES Dermatologie", "Inscription Ordre"],
    motifs: ["Acné", "Eczéma", "Psoriasis", "Grain de beauté suspect", "Chute de cheveux", "Mycose"],
    noteSections: ["Motif", "Description lésion", "Localisation", "Diagnostic", "Traitement"],
    customVitals: [],
    createdAt: now, updatedAt: now,
  },
  {
    id: "pediatre", label: "Pédiatre", icon: "👶", category: "specialiste",
    enabled: true, activeDoctors: 22, defaultAmount: 40, teleconsultEnabled: true, aiEnabled: true,
    features: ["Courbes de croissance", "Carnet vaccinal", "Développement psychomoteur"],
    requiredDocs: ["DES Pédiatrie", "Inscription Ordre"],
    motifs: ["Suivi nourrisson", "Vaccination", "Fièvre", "Gastro-entérite", "Bronchiolite", "Éruption cutanée"],
    noteSections: ["Motif", "Anamnèse", "Examen pédiatrique", "Croissance", "Diagnostic", "Plan"],
    customVitals: ["Poids", "Taille", "PC", "Température", "FC"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "orl", label: "ORL", icon: "👂", category: "specialiste",
    enabled: true, activeDoctors: 8, defaultAmount: 50, teleconsultEnabled: false, aiEnabled: false,
    features: ["Audiogramme", "Endoscopie", "Vidéonystagmographie"],
    requiredDocs: ["DES ORL", "Inscription Ordre"],
    motifs: ["Otite", "Sinusite", "Angine", "Vertiges", "Surdité", "Acouphènes"],
    noteSections: ["Motif", "Examen ORL", "Audiométrie", "Diagnostic", "Plan"],
    customVitals: ["Température"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "psychiatre", label: "Psychiatre", icon: "🧠", category: "specialiste",
    enabled: true, activeDoctors: 10, defaultAmount: 60, teleconsultEnabled: true, aiEnabled: false,
    features: ["Échelles PHQ-9/GAD-7", "Notes confidentielles", "Suivi psychotropes"],
    requiredDocs: ["DES Psychiatrie", "Inscription Ordre"],
    motifs: ["Dépression", "Anxiété", "Insomnie", "Trouble bipolaire", "TOC", "Suivi psychotropes"],
    noteSections: ["Motif", "Entretien", "Évaluation psychique", "Diagnostic", "Traitement"],
    customVitals: ["Poids"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "neurologue", label: "Neurologue", icon: "⚡", category: "specialiste",
    enabled: true, activeDoctors: 6, defaultAmount: 60, teleconsultEnabled: true, aiEnabled: true,
    features: ["EEG", "EMG", "Dosage antiépileptiques"],
    requiredDocs: ["DES Neurologie", "Inscription Ordre"],
    motifs: ["Céphalées", "Migraine", "Épilepsie", "Parkinson", "Sclérose en plaques", "Neuropathie"],
    noteSections: ["Motif", "Anamnèse neurologique", "Examen neurologique", "Diagnostic", "Plan"],
    customVitals: ["TA", "FC"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "gynecologue", label: "Gynécologue", icon: "🌸", category: "specialiste",
    enabled: true, activeDoctors: 14, defaultAmount: 50, teleconsultEnabled: true, aiEnabled: false,
    features: ["Suivi grossesse", "Échographie obstétricale", "Frottis"],
    requiredDocs: ["DES Gynécologie-Obstétrique", "Inscription Ordre"],
    motifs: ["Suivi grossesse", "Contraception", "Frottis", "Trouble du cycle", "Ménopause", "Infertilité"],
    noteSections: ["Motif", "Anamnèse gynécologique", "Examen", "Échographie", "Diagnostic", "Plan"],
    customVitals: ["TA", "Poids", "HU"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "dentiste", label: "Chirurgien-Dentiste", icon: "🦷", category: "dentiste",
    enabled: true, activeDoctors: 35, defaultAmount: 40, teleconsultEnabled: false, aiEnabled: false,
    features: ["Schéma dentaire", "Devis & Plans", "Panoramique", "CBCT"],
    requiredDocs: ["Diplôme de chirurgie dentaire", "Inscription Ordre des dentistes"],
    motifs: ["Douleur dentaire", "Détartrage", "Carie", "Extraction", "Prothèse", "Orthodontie"],
    noteSections: ["Motif", "Examen bucco-dentaire", "Schéma dentaire", "Actes réalisés", "Plan de traitement"],
    customVitals: [],
    createdAt: now, updatedAt: now,
  },
  {
    id: "kine", label: "Kinésithérapeute", icon: "🦴", category: "paramedical",
    enabled: true, activeDoctors: 28, defaultAmount: 25, teleconsultEnabled: false, aiEnabled: false,
    features: ["Échelle EVA", "Bilans articulaires", "Programme exercices"],
    requiredDocs: ["Diplôme de kinésithérapie", "Inscription Ordre des kinés"],
    motifs: ["Rééducation post-opératoire", "Lombalgie", "Cervicalgie", "Entorse", "Rééducation respiratoire", "Rééducation périnéale"],
    noteSections: ["Motif", "Bilan kinésithérapique", "Objectifs", "Actes réalisés", "Évolution"],
    customVitals: ["EVA douleur"],
    createdAt: now, updatedAt: now,
  },
  // ─── New paramedical specialties ──
  {
    id: "osteopathe", label: "Ostéopathe", icon: "🦴", category: "paramedical",
    enabled: true, activeDoctors: 18, defaultAmount: 50, teleconsultEnabled: false, aiEnabled: false,
    features: ["Schéma corporel", "Tests ostéopathiques", "Bilan postural"],
    requiredDocs: ["Diplôme d'ostéopathie", "Inscription registre ADELI"],
    motifs: ["Lombalgie", "Cervicalgie", "Douleur articulaire", "Bilan postural", "Migraine cervicogénique", "Suivi nourrisson"],
    noteSections: ["Motif", "Bilan palpatoire", "Tests fonctionnels", "Techniques réalisées", "Conseils"],
    customVitals: ["EVA douleur"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "sage_femme", label: "Sage-femme", icon: "🤱", category: "paramedical",
    enabled: true, activeDoctors: 20, defaultAmount: 35, teleconsultEnabled: true, aiEnabled: false,
    features: ["Suivi grossesse", "Monitoring fœtal", "Préparation accouchement", "Suivi post-partum"],
    requiredDocs: ["Diplôme de sage-femme", "Inscription Ordre des sages-femmes"],
    motifs: ["Suivi grossesse", "Préparation accouchement", "Suivi post-partum", "Rééducation périnéale", "Consultation contraception", "Allaitement"],
    noteSections: ["Motif", "Examen obstétrical", "Monitoring", "Diagnostic", "Plan"],
    customVitals: ["TA", "Poids", "HU", "RCF"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "orthophoniste", label: "Orthophoniste", icon: "🗣️", category: "paramedical",
    enabled: true, activeDoctors: 15, defaultAmount: 30, teleconsultEnabled: true, aiEnabled: false,
    features: ["Bilan de langage", "Exercices personnalisés", "Suivi progression"],
    requiredDocs: ["Certificat de capacité d'orthophonie", "Inscription ADELI"],
    motifs: ["Bilan de langage", "Retard de parole", "Trouble articulatoire", "Dyslexie", "Bégaiement", "Déglutition atypique"],
    noteSections: ["Motif", "Bilan orthophonique", "Tests réalisés", "Objectifs", "Plan de rééducation"],
    customVitals: [],
    createdAt: now, updatedAt: now,
  },
  {
    id: "psychologue", label: "Psychologue", icon: "💭", category: "paramedical",
    enabled: true, activeDoctors: 22, defaultAmount: 50, teleconsultEnabled: true, aiEnabled: false,
    features: ["Notes de séance chiffrées", "Échelles psychométriques", "Suivi thérapeutique"],
    requiredDocs: ["Master en psychologie", "Inscription ADELI"],
    motifs: ["Première consultation", "Suivi psychothérapie", "Anxiété", "Dépression", "Gestion du stress", "Deuil", "Thérapie de couple"],
    noteSections: ["Motif", "Entretien clinique", "Observations", "Hypothèses", "Plan thérapeutique"],
    customVitals: [],
    createdAt: now, updatedAt: now,
  },
  {
    id: "nutritionniste", label: "Nutritionniste / Diététicien", icon: "🥗", category: "paramedical",
    enabled: true, activeDoctors: 12, defaultAmount: 40, teleconsultEnabled: true, aiEnabled: false,
    features: ["Plan alimentaire", "Journal alimentaire", "Suivi poids/IMC", "Recettes personnalisées"],
    requiredDocs: ["BTS Diététique ou DU Nutrition", "Inscription ADELI"],
    motifs: ["Perte de poids", "Rééquilibrage alimentaire", "Diabète", "Suivi grossesse", "TCA", "Intolérances alimentaires"],
    noteSections: ["Motif", "Enquête alimentaire", "Mesures anthropométriques", "Plan alimentaire", "Objectifs"],
    customVitals: ["Poids", "IMC", "Tour de taille"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "podologue", label: "Podologue", icon: "🦶", category: "paramedical",
    enabled: true, activeDoctors: 8, defaultAmount: 35, teleconsultEnabled: false, aiEnabled: false,
    features: ["Schéma podologique", "Prescription semelles", "Bilan biomécanique"],
    requiredDocs: ["Diplôme de podologie", "Inscription ADELI"],
    motifs: ["Douleur plantaire", "Ongle incarné", "Semelles orthopédiques", "Bilan podologique", "Épine calcanéenne", "Hallux valgus"],
    noteSections: ["Motif", "Examen podologique", "Bilan biomécanique", "Diagnostic", "Plan de traitement"],
    customVitals: [],
    createdAt: now, updatedAt: now,
  },
  {
    id: "orthoptiste", label: "Orthoptiste", icon: "👀", category: "paramedical",
    enabled: true, activeDoctors: 6, defaultAmount: 30, teleconsultEnabled: false, aiEnabled: false,
    features: ["Bilan orthoptique", "Exercices visuels", "Rééducation oculomotrice"],
    requiredDocs: ["Certificat d'orthoptie", "Inscription ADELI"],
    motifs: ["Bilan orthoptique", "Strabisme", "Fatigue visuelle", "Troubles de convergence", "Rééducation post-chirurgie", "Dépistage enfant"],
    noteSections: ["Motif", "Bilan oculomoteur", "Tests de vision binoculaire", "Diagnostic", "Programme de rééducation"],
    customVitals: ["AV OD", "AV OG"],
    createdAt: now, updatedAt: now,
  },
  // ─── Additional medical specialists ──
  {
    id: "pneumologue", label: "Pneumologue", icon: "🫁", category: "specialiste",
    enabled: true, activeDoctors: 8, defaultAmount: 50, teleconsultEnabled: true, aiEnabled: true,
    features: ["Spirométrie", "Oxymétrie", "Suivi BPCO/Asthme"],
    requiredDocs: ["DES Pneumologie", "Inscription Ordre"],
    motifs: ["Toux chronique", "Asthme", "BPCO", "Apnée du sommeil", "Pneumonie", "Tabacologie"],
    noteSections: ["Motif", "Anamnèse respiratoire", "Examen pulmonaire", "Spirométrie", "Diagnostic", "Plan"],
    customVitals: ["SpO2", "DEP"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "rhumatologue", label: "Rhumatologue", icon: "💪", category: "specialiste",
    enabled: true, activeDoctors: 7, defaultAmount: 55, teleconsultEnabled: true, aiEnabled: true,
    features: ["Scores DAS28/HAQ", "Suivi biothérapies", "Bilan articulaire"],
    requiredDocs: ["DES Rhumatologie", "Inscription Ordre"],
    motifs: ["Douleurs articulaires", "Polyarthrite", "Spondylarthrite", "Goutte", "Ostéoporose", "Fibromyalgie"],
    noteSections: ["Motif", "Bilan articulaire", "Examen rhumatologique", "Diagnostic", "Plan"],
    customVitals: ["EVA douleur"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "gastro_enterologue", label: "Gastro-entérologue", icon: "🔬", category: "specialiste",
    enabled: true, activeDoctors: 9, defaultAmount: 55, teleconsultEnabled: true, aiEnabled: true,
    features: ["Compte-rendu endoscopie", "Suivi MICI", "Score de fibrose"],
    requiredDocs: ["DES Gastro-entérologie", "Inscription Ordre"],
    motifs: ["Douleurs abdominales", "Reflux", "Coloscopie", "MICI suivi", "Hépatite", "Constipation chronique"],
    noteSections: ["Motif", "Anamnèse digestive", "Examen abdominal", "Endoscopie", "Diagnostic", "Plan"],
    customVitals: ["Poids", "IMC"],
    createdAt: now, updatedAt: now,
  },
  {
    id: "urologue", label: "Urologue", icon: "🔬", category: "specialiste",
    enabled: true, activeDoctors: 6, defaultAmount: 55, teleconsultEnabled: true, aiEnabled: true,
    features: ["Score IPSS", "Suivi PSA", "Bilan urodynamique"],
    requiredDocs: ["DES Urologie", "Inscription Ordre"],
    motifs: ["Troubles urinaires", "HBP", "Lithiase urinaire", "Bilan PSA", "Infection urinaire", "Infertilité masculine"],
    noteSections: ["Motif", "Anamnèse urologique", "Examen", "Diagnostic", "Plan"],
    customVitals: [],
    createdAt: now, updatedAt: now,
  },
  {
    id: "endocrinologue", label: "Endocrinologue", icon: "🧬", category: "specialiste",
    enabled: true, activeDoctors: 7, defaultAmount: 55, teleconsultEnabled: true, aiEnabled: true,
    features: ["Suivi diabète", "Bilan thyroïdien", "Courbes glycémiques"],
    requiredDocs: ["DES Endocrinologie", "Inscription Ordre"],
    motifs: ["Diabète suivi", "Thyroïde", "Surpoids/Obésité", "Troubles hormonaux", "Ostéoporose", "Puberté précoce"],
    noteSections: ["Motif", "Anamnèse endocrino", "Examen", "Bilan biologique", "Diagnostic", "Plan"],
    customVitals: ["Poids", "IMC", "Glycémie"],
    createdAt: now, updatedAt: now,
  },
];

const store = createStore<ManagedSpecialty[]>("medicare_specialties", initialSpecialties);

export function useSpecialties() {
  return useStore(store);
}

export function readSpecialties(): ManagedSpecialty[] {
  return store.read();
}

export function getEnabledSpecialtyLabels(): string[] {
  return store.read().filter(s => s.enabled).map(s => s.label);
}

export function addSpecialty(spec: Omit<ManagedSpecialty, "id" | "createdAt" | "updatedAt" | "activeDoctors">) {
  const id = spec.label.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
  const now = new Date().toISOString();
  store.set(prev => [...prev, { ...spec, id, activeDoctors: 0, createdAt: now, updatedAt: now }]);
  saveAdminConfig("specialties", store.read());
  return id;
}

export function updateSpecialty(id: string, update: Partial<ManagedSpecialty>) {
  store.set(prev => prev.map(s => s.id === id ? { ...s, ...update, updatedAt: new Date().toISOString() } : s));
  saveAdminConfig("specialties", store.read());
}

export function deleteSpecialty(id: string) {
  store.set(prev => prev.filter(s => s.id !== id));
  saveAdminConfig("specialties", store.read());
}

export function toggleSpecialty(id: string) {
  store.set(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled, updatedAt: new Date().toISOString() } : s));
  saveAdminConfig("specialties", store.read());
}

/** Load specialties from Supabase */
export async function loadSpecialtiesFromSupabase() {
  const data = await loadAdminConfig<ManagedSpecialty[]>("specialties");
  if (data && data.length > 0) store.set(data);
}
