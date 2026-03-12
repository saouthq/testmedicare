/**
 * specialtyStore.ts — Admin-managed specialty registry.
 * Source of truth for all specialties across the platform.
 * Connected to: specialtyConfig, common.ts specialties list, search, registration, KYC.
 *
 * // TODO BACKEND: Replace with GET/POST/PUT/DELETE /api/admin/specialties
 */
import { createStore, useStore } from "./crossRoleStore";

export type SpecialtyCategory = "generaliste" | "specialiste" | "dentiste" | "paramedical";

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
  return id;
}

export function updateSpecialty(id: string, update: Partial<ManagedSpecialty>) {
  store.set(prev => prev.map(s => s.id === id ? { ...s, ...update, updatedAt: new Date().toISOString() } : s));
}

export function deleteSpecialty(id: string) {
  store.set(prev => prev.filter(s => s.id !== id));
}

export function toggleSpecialty(id: string) {
  store.set(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled, updatedAt: new Date().toISOString() } : s));
}
