/**
 * doctorProfileStore.ts — Doctor public profile (persistent, cross-role readable).
 * Used by: DoctorSettings/ProfileTab, DoctorPublicProfile, CareSheetModal
 *
 * // TODO BACKEND: Replace with API
 */
import { createStore, useStore } from "./crossRoleStore";

export interface DoctorProfile {
  name: string;
  specialty: string;
  subSpecialties: string[];
  initials: string;
  email: string;
  address: string;
  phone: string;
  convention: string;
  price: string;
  consultationDuration: number;
  priceRange: Record<string, number>;
  languages: string[];
  experience: string;
  registrationYear: number;
  orderNumber: string;
  presentation: string;
  diplomas: { title: string; school: string; year: string }[];
  horaires: { day: string; hours: string; open: boolean }[];
  motifs: { name: string; duration: string; price: string }[];
  reviewCount: number;
  actes: string[];
  memberships: string[];
  accessInfo: { parking: boolean; handicap: boolean; elevator: boolean; publicTransport: string };
}

const defaultProfile: DoctorProfile = {
  name: "Dr. Ahmed Bouazizi",
  specialty: "Médecin généraliste",
  subSpecialties: ["Diabétologie", "Médecine du sport"],
  initials: "AB",
  email: "ahmed.bouazizi@mediconnect.tn",
  address: "15 Av. de la Liberté, El Manar, 2092 Tunis",
  phone: "+216 71 234 567",
  convention: "Conventionné Secteur 1",
  price: "35 DT",
  consultationDuration: 30,
  priceRange: { consultation: 35, suivi: 25, premiere: 50, certificat: 20 },
  languages: ["Français", "Arabe", "Anglais"],
  experience: "15 ans",
  registrationYear: 2010,
  orderNumber: "TN-10101010",
  presentation: "Médecin généraliste diplômé de la Faculté de Médecine de Tunis, je vous accueille dans mon cabinet moderne à El Manar pour des consultations de médecine générale, suivi de maladies chroniques (diabète, hypertension), bilans de santé complets et vaccinations.\n\nJe porte une attention particulière à l'écoute de mes patients et à une approche globale de la santé. Mon cabinet est équipé d'un ECG, d'un échographe et d'un laboratoire d'analyses rapides.\n\nConventionné Assurance, je pratique le tiers payant pour faciliter vos démarches.",
  diplomas: [
    { title: "Doctorat en Médecine", school: "Faculté de Médecine de Tunis", year: "2010" },
    { title: "DU Diabétologie", school: "Université de Tunis El Manar", year: "2012" },
    { title: "DIU Médecine du Sport", school: "Université Paris Descartes", year: "2014" },
    { title: "Formation Échographie", school: "Institut Pasteur de Tunis", year: "2016" },
  ],
  horaires: [
    { day: "Lundi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Mardi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Mercredi", hours: "08:00 - 12:00", open: true },
    { day: "Jeudi", hours: "08:00 - 12:00 / 14:00 - 18:00", open: true },
    { day: "Vendredi", hours: "08:00 - 12:00 / 14:00 - 17:00", open: true },
    { day: "Samedi", hours: "08:00 - 13:00", open: true },
    { day: "Dimanche", hours: "Fermé", open: false },
  ],
  motifs: [
    { name: "Consultation générale", duration: "30 min", price: "35 DT" },
    { name: "Suivi maladie chronique", duration: "20 min", price: "25 DT" },
    { name: "Première consultation", duration: "45 min", price: "50 DT" },
    { name: "Certificat médical", duration: "15 min", price: "20 DT" },
    { name: "Vaccination", duration: "15 min", price: "25 DT" },
    { name: "ECG", duration: "20 min", price: "40 DT" },
  ],
  reviewCount: 127,
};

const store = createStore<DoctorProfile>("medicare_doctor_profile", defaultProfile);

export const doctorProfileStore = store;

export function useDoctorProfile() {
  return useStore(store);
}

/** Update doctor profile fields */
export function updateDoctorProfile(updates: Partial<DoctorProfile>) {
  // TODO BACKEND: PUT /api/doctor/profile
  store.set(prev => ({ ...prev, ...updates }));
}

/** Read-only access for non-React contexts */
export const readDoctorProfile = () => store.read();
