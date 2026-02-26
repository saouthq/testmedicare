/**
 * ══════════════════════════════════════════════════════════════
 *  MEDICARE — Centralized Mock Data
 *  Single source of truth for all mock/fake data in the app.
 *  When the backend is ready, replace imports from this file
 *  with real API calls.
 * ══════════════════════════════════════════════════════════════
 */

// ─── Shared Types ────────────────────────────────────────────

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled" | "no-show" | "in-progress";
export type InvoiceStatus = "paid" | "pending" | "failed" | "refunded";
export type NotificationType = "appointment" | "prescription" | "message" | "result" | "reminder" | "system";

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  address: string;
  distance?: string;
  phone: string;
  rating: number;
  reviews: number;
  price: number;
  languages: string[];
  teleconsultation: boolean;
  cnam: boolean;
  nextSlot: string;
  /** 7-day availability arrays */
  availAM: boolean[];
  availPM: boolean[];
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  avatar: string;
  bloodType: string;
  ssn: string;
  mutuelle: string;
  cnamId: string;
  treatingDoctor: string;
  registeredSince: string;
  allergies: { name: string; severity: string; reaction?: string }[];
  conditions: string[];
  chronicConditions: string[];
  lastVisit: string | null;
  nextAppointment: string | null;
  isNew: boolean;
  lastVitals: { ta: string; glycemia: string };
  gouvernorat: string;
  balance: number;
  notes: string;
}

export interface PatientAppointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  address: string;
  status: AppointmentStatus;
  type: "cabinet" | "teleconsultation";
  motif: string;
  canModify: boolean;
  canCancel: boolean;
  avatar: string;
  cnam: boolean;
  cancellationPolicy: string;
  documents: string[];
  instructions: string;
}

export interface PastAppointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  motif: string;
  hasPrescription: boolean;
  hasReport: boolean;
  avatar: string;
  amount: string;
}

export interface CancelledAppointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  avatar: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Prescription {
  id: string;
  doctor: string;
  patient?: string;
  date: string;
  items: string[];
  status: "active" | "expired";
  total: string;
  cnam: boolean;
  pharmacy: string | null;
  sent?: boolean;
}

export interface HealthDocument {
  name: string;
  type: string;
  date: string;
  source: string;
  size: string;
}

export interface Antecedent {
  name: string;
  date: string;
  details: string;
}

export interface Treatment {
  name: string;
  dose: string;
  prescriber: string;
  since: string;
  status: string;
}

export interface Allergy {
  name: string;
  severity: string;
  reaction: string;
}

export interface Habit {
  label: string;
  value: string;
}

export interface FamilyHistory {
  name: string;
  details: string;
}

export interface Surgery {
  name: string;
  date: string;
  hospital: string;
}

export interface Vaccination {
  name: string;
  doses: string;
  lastDate: string;
  nextDate: string | null;
}

export interface HealthMeasure {
  label: string;
  value: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them" | "ai";
  text: string;
  time: string;
  senderName?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface DoctorScheduleItem {
  time: string;
  patient: string;
  type: string;
  duration: string;
  status: "done" | "current" | "upcoming";
  motif: string;
  avatar: string;
  cnam: boolean;
  phone?: string;
  teleconsultation?: boolean;
}

export interface WaitingRoomEntry {
  patient: string;
  arrivedAt: string;
  appointment: string;
  wait: string;
  avatar: string;
}

export interface UrgentAlert {
  type: string;
  patient: string;
  text: string;
  severity: "high" | "normal";
}

export interface DoctorConsultation {
  id: number;
  patient: string;
  date: string;
  time: string;
  motif: string;
  notes: string;
  prescriptions: number;
  cnam: boolean;
  amount: string;
  avatar: string;
  status: string;
}

export interface VitalsEntry {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  weight: number;
  glycemia: number;
}

export interface AnalysisResult {
  id: string;
  date: string;
  type: string;
  status: string;
  values: { name: string; value: string; ref: string; status: string }[];
}

export interface TeleconsultTransaction {
  id: string;
  patient: string;
  avatar: string;
  dateRdv: string;
  amount: number;
  status: InvoiceStatus;
  ref: string;
  motif: string;
}

export interface SubscriptionInvoice {
  id: string;
  month: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
}

export interface ScheduleAppointment {
  patient: string;
  type: string;
  duration: number;
  color: "primary" | "accent" | "warning" | "destructive";
  teleconsultation?: boolean;
  motif?: string;
  status?: string;
  phone?: string;
}

export interface StatsCard {
  label: string;
  value: string;
  change: string;
  color: string;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

// ─── Specialties ─────────────────────────────────────────────

export const specialties = [
  "Médecin généraliste", "Dentiste", "Cardiologue", "Dermatologue",
  "Ophtalmologue", "Pédiatre", "Gynécologue", "ORL", "Kinésithérapeute",
  "Psychiatre", "Rhumatologue", "Chirurgien",
];

export const specialtiesWithAll = ["Tous", ...specialties.slice(0, 9)];

export const languages = ["Français", "Arabe", "Anglais", "Allemand", "Italien", "Espagnol"];

// ─── Doctors (Search / Public) ───────────────────────────────

export const mockDoctors: Doctor[] = [
  { id: 1, name: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", address: "15 Av. de la Liberté, El Manar, 2092 Tunis", distance: "0.8 km", phone: "+216 71 234 567", rating: 4.8, reviews: 234, nextSlot: "Aujourd'hui 14:30", avatar: "AB", price: 35, languages: ["Français", "Arabe"], teleconsultation: true, cnam: true, availAM: [true, true, false, true, false, true, false], availPM: [true, false, false, true, true, false, false] },
  { id: 2, name: "Dr. Sonia Gharbi", specialty: "Cardiologue", address: "32 Rue Charles de Gaulle, 2080 Ariana", distance: "2.3 km", phone: "+216 71 234 568", rating: 4.9, reviews: 187, nextSlot: "Demain 09:00", avatar: "SG", price: 60, languages: ["Français", "Arabe"], teleconsultation: false, cnam: true, availAM: [false, true, true, false, false, false, false], availPM: [false, false, false, false, true, false, false] },
  { id: 3, name: "Dr. Khaled Hammami", specialty: "Dermatologue", address: "8 Boulevard Bab Bnet, 1006 Tunis", distance: "1.5 km", phone: "+216 71 234 569", rating: 4.7, reviews: 156, nextSlot: "23 Fév 10:30", avatar: "KH", price: 50, languages: ["Français", "Arabe", "Anglais"], teleconsultation: true, cnam: true, availAM: [false, false, false, true, false, true, false], availPM: [false, false, false, false, true, false, false] },
  { id: 4, name: "Dr. Leila Chebbi", specialty: "Ophtalmologue", address: "45 Av. Habib Bourguiba, 4000 Sousse", distance: "3.1 km", phone: "+216 73 456 789", rating: 4.6, reviews: 98, nextSlot: "24 Fév 11:00", avatar: "LC", price: 45, languages: ["Français", "Arabe"], teleconsultation: true, cnam: false, availAM: [false, false, false, false, false, false, false], availPM: [false, false, false, false, false, false, false] },
  { id: 5, name: "Dr. Nabil Karray", specialty: "Pédiatre", address: "22 Rue de Marseille, 1002 Tunis", distance: "1.2 km", phone: "+216 71 567 890", rating: 4.9, reviews: 312, nextSlot: "Aujourd'hui 16:00", avatar: "NK", price: 40, languages: ["Français", "Arabe", "Anglais"], teleconsultation: true, cnam: true, availAM: [false, false, true, false, false, true, false], availPM: [true, false, false, true, false, false, false] },
  { id: 6, name: "Dr. Ines Mansour", specialty: "Gynécologue", address: "10 Rue du Lac Constance, Les Berges du Lac", distance: "4.0 km", phone: "+216 71 678 901", rating: 4.8, reviews: 421, nextSlot: "25 Fév 09:30", avatar: "IM", price: 70, languages: ["Français", "Arabe"], teleconsultation: true, cnam: true, availAM: [false, false, false, false, false, false, false], availPM: [false, false, false, false, false, false, false] },
];

// ─── Availability dates (7 days) ─────────────────────────────

export const availDates = [
  { label: "Lun 17", short: "17/02", morning: true, afternoon: true },
  { label: "Mar 18", short: "18/02", morning: true, afternoon: false },
  { label: "Mer 19", short: "19/02", morning: false, afternoon: false },
  { label: "Jeu 20", short: "20/02", morning: true, afternoon: true },
  { label: "Ven 21", short: "21/02", morning: false, afternoon: true },
  { label: "Sam 22", short: "22/02", morning: true, afternoon: false },
  { label: "Dim 23", short: "23/02", morning: false, afternoon: false },
];

// ─── Doctor Public Profile ───────────────────────────────────

export const mockDoctorProfile = {
  name: "Dr. Ahmed Bouazizi",
  specialty: "Médecin généraliste",
  subSpecialties: ["Diabétologie", "Médecine du sport"],
  initials: "AB",
  rating: 4.8,
  reviewCount: 127,
  address: "15 Av. de la Liberté, El Manar, 2092 Tunis",
  phone: "+216 71 234 567",
  convention: "Conventionné CNAM",
  price: "35 DT",
  priceRange: { consultation: 35, suivi: 25, premiere: 50, certificat: 20 },
  languages: ["Français", "Arabe", "Anglais"],
  experience: "15 ans",
  registrationYear: 2010,
  orderNumber: "TN-10101010",
  presentation: "Médecin généraliste diplômé de la Faculté de Médecine de Tunis, je vous accueille dans mon cabinet moderne à El Manar pour des consultations de médecine générale, suivi de maladies chroniques (diabète, hypertension), bilans de santé complets et vaccinations.\n\nJe porte une attention particulière à l'écoute de mes patients et à une approche globale de la santé. Mon cabinet est équipé d'un ECG, d'un échographe et d'un laboratoire d'analyses rapides.\n\nConventionné CNAM, je pratique le tiers payant pour faciliter vos démarches.",
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
    { name: "Bilan de santé complet", duration: "60 min", price: "80 DT" },
    { name: "Vaccination", duration: "15 min", price: "25 DT" },
    { name: "Téléconsultation", duration: "20 min", price: "30 DT" },
  ],
  teleconsultation: true,
  actes: ["ECG", "Échographie abdominale", "Spirométrie", "Tests rapides (glycémie, CRP)", "Vaccinations", "Petite chirurgie"],
  memberships: ["Ordre National des Médecins de Tunisie", "Société Tunisienne de Médecine Générale", "Association Tunisienne de Diabétologie"],
  accessInfo: { parking: true, handicap: true, elevator: true, publicTransport: "Métro ligne 1 - Station El Manar (200m)" },
};

export const mockAvailableSlots = [
  { date: "Jeu. 20 Fév", day: "Jeudi", slots: ["09:00", "09:30", "10:00", "11:00", "14:30", "15:00", "16:00"] },
  { date: "Ven. 21 Fév", day: "Vendredi", slots: ["08:30", "09:00", "10:30", "11:00"] },
  { date: "Sam. 22 Fév", day: "Samedi", slots: ["08:00", "09:00", "10:00", "11:00", "12:00"] },
  { date: "Lun. 24 Fév", day: "Lundi", slots: ["08:00", "09:00", "09:30", "10:00", "14:00", "14:30", "15:00", "16:00", "16:30"] },
  { date: "Mar. 25 Fév", day: "Mardi", slots: ["08:30", "10:00", "11:00", "14:30", "15:30"] },
];

export const mockReviews = [
  { author: "Amine B.", rating: 5, date: "10 Fév 2026", text: "Très bon médecin, à l'écoute et professionnel.", helpful: 12, verified: true },
  { author: "Fatma T.", rating: 5, date: "5 Fév 2026", text: "Ponctuel et efficace. Explique bien les traitements.", helpful: 8, verified: true },
  { author: "Mohamed S.", rating: 4, date: "28 Jan 2026", text: "Bon suivi médical, cabinet propre et moderne.", helpful: 5, verified: true },
  { author: "Nadia J.", rating: 5, date: "20 Jan 2026", text: "Excellent suivi pour mon diabète.", helpful: 15, verified: true },
  { author: "Sami A.", rating: 4, date: "15 Jan 2026", text: "Bonne consultation, docteur à l'écoute.", helpful: 3, verified: false },
];

export const mockFaqItems = [
  { q: "Comment se déroule une première consultation ?", a: "La première consultation dure environ 45 minutes. Elle comprend un entretien approfondi sur vos antécédents médicaux, un examen clinique complet et si nécessaire, des examens complémentaires." },
  { q: "Prenez-vous la CNAM ?", a: "Oui, le cabinet est conventionné CNAM Secteur 1. Le tiers payant est pratiqué." },
  { q: "Faites-vous des téléconsultations ?", a: "Oui, je propose des téléconsultations vidéo pour le suivi de maladies chroniques et le renouvellement d'ordonnances." },
  { q: "Quel est le délai moyen pour obtenir un RDV ?", a: "Le délai moyen est de 2 à 3 jours ouvrés. Pour les urgences, des créneaux sont réservés chaque jour." },
];

export const mockRatingDistribution = [
  { stars: 5, count: 89, pct: 70 },
  { stars: 4, count: 25, pct: 20 },
  { stars: 3, count: 8, pct: 6 },
  { stars: 2, count: 3, pct: 2 },
  { stars: 1, count: 2, pct: 2 },
];

// ─── Patients ────────────────────────────────────────────────

export const mockPatients: Patient[] = [
  { id: 1, name: "Amine Ben Ali", age: 34, gender: "Homme", dob: "15/03/1991", phone: "+216 22 345 678", email: "amine@email.tn", address: "El Manar, Tunis", avatar: "AB", bloodType: "A+", ssn: "1 91 03 75 012 035 42", mutuelle: "Assurances Maghrebia", cnamId: "12345678", treatingDoctor: "Dr. Ahmed Bouazizi", registeredSince: "Jan 2022", allergies: [{ name: "Pénicilline", severity: "Sévère", reaction: "Réaction cutanée sévère" }], conditions: ["Diabète type 2"], chronicConditions: ["Diabète type 2"], lastVisit: "10 Fév 2026", nextAppointment: "20 Fév 14:30", isNew: false, lastVitals: { ta: "13/8", glycemia: "1.05" }, gouvernorat: "Tunis", balance: 0, notes: "Suivi diabète régulier" },
  { id: 2, name: "Fatma Trabelsi", age: 56, gender: "Femme", dob: "12/07/1970", phone: "+216 55 987 654", email: "fatma@email.tn", address: "Ariana", avatar: "FT", bloodType: "O+", ssn: "2 70 07 75 023 045 53", mutuelle: "CNAM", cnamId: "23456789", treatingDoctor: "Dr. Sonia Gharbi", registeredSince: "Mar 2021", allergies: [], conditions: ["Hypertension", "Cholestérol"], chronicConditions: ["Hypertension", "Cholestérol"], lastVisit: "8 Fév 2026", nextAppointment: "23 Fév 10:00", isNew: false, lastVitals: { ta: "14/8", glycemia: "0.95" }, gouvernorat: "Ariana", balance: 60, notes: "Hypertension — suivi cardio" },
  { id: 3, name: "Mohamed Sfar", age: 28, gender: "Homme", dob: "05/01/1998", phone: "+216 55 456 789", email: "med@email.tn", address: "Ben Arous", avatar: "MS", bloodType: "B+", ssn: "1 98 01 75 034 056 64", mutuelle: "Privée", cnamId: "—", treatingDoctor: "Dr. Ahmed Bouazizi", registeredSince: "Sep 2024", allergies: [{ name: "Aspirine", severity: "Modéré", reaction: "Troubles gastriques" }], conditions: [], chronicConditions: [], lastVisit: "5 Fév 2026", nextAppointment: "25 Fév 09:30", isNew: false, lastVitals: { ta: "11/7", glycemia: "0.88" }, gouvernorat: "Ben Arous", balance: 0, notes: "Suivi post-opératoire" },
  { id: 4, name: "Nadia Jemni", age: 67, gender: "Femme", dob: "18/11/1959", phone: "+216 98 567 890", email: "nadia@email.tn", address: "Manouba", avatar: "NJ", bloodType: "A-", ssn: "2 59 11 75 045 067 75", mutuelle: "CNAM", cnamId: "34567890", treatingDoctor: "Dr. Khaled Hammami", registeredSince: "Jun 2020", allergies: [], conditions: ["Arthrose", "HTA"], chronicConditions: ["Arthrose", "HTA"], lastVisit: "1 Fév 2026", nextAppointment: null, isNew: false, lastVitals: { ta: "15/9", glycemia: "1.10" }, gouvernorat: "Manouba", balance: 25, notes: "Arthrose — anti-inflammatoires" },
  { id: 5, name: "Sami Ayari", age: 42, gender: "Homme", dob: "22/06/1984", phone: "+216 29 678 901", email: "sami@email.tn", address: "Tunis", avatar: "SA", bloodType: "AB+", ssn: "1 84 06 75 056 078 86", mutuelle: "CNAM", cnamId: "45678901", treatingDoctor: "Dr. Ahmed Bouazizi", registeredSince: "Nov 2022", allergies: [{ name: "Acariens", severity: "Modéré", reaction: "Rhinite allergique" }], conditions: ["Asthme"], chronicConditions: ["Asthme"], lastVisit: "28 Jan 2026", nextAppointment: null, isNew: false, lastVitals: { ta: "12/7", glycemia: "0.92" }, gouvernorat: "Tunis", balance: 0, notes: "Asthme léger" },
  { id: 6, name: "Rania Meddeb", age: 51, gender: "Femme", dob: "03/04/1975", phone: "+216 52 789 012", email: "rania@email.tn", address: "Lac", avatar: "RM", bloodType: "O-", ssn: "2 75 04 75 067 089 97", mutuelle: "CNAM", cnamId: "56789012", treatingDoctor: "Dr. Sonia Gharbi", registeredSince: "Fév 2026", allergies: [], conditions: [], chronicConditions: [], lastVisit: null, nextAppointment: "28 Fév 14:00", isNew: true, lastVitals: { ta: "—", glycemia: "—" }, gouvernorat: "Tunis", balance: 0, notes: "Nouveau patient" },
];

// ─── Favorite Doctors (Patient Dashboard) ────────────────────

export const mockFavoriteDoctors = [
  { name: "Dr. Bouazizi", specialty: "Généraliste", avatar: "AB", id: 1 },
  { name: "Dr. Gharbi", specialty: "Cardiologue", avatar: "SG", id: 2 },
  { name: "Dr. Hammami", specialty: "Dermatologue", avatar: "KH", id: 3 },
];

// ─── Patient Health Summary ──────────────────────────────────

export const mockHealthSummary = {
  bloodType: "A+",
  treatingDoctor: "Dr. Ahmed Bouazizi",
  cnam: true,
  cnamId: "12345678",
  allergies: ["Pénicilline"],
  vaccinations: 2,
};

// ─── Patient Appointments ────────────────────────────────────

export const mockPatientAppointments: PatientAppointment[] = [
  { id: 1, doctor: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", date: "Aujourd'hui", time: "14:30", type: "cabinet", address: "15 Av. de la Liberté, El Manar", avatar: "AB", status: "confirmed", motif: "Suivi diabète", canModify: true, canCancel: true, cnam: true, cancellationPolicy: "Annulation gratuite jusqu'à 24h avant", documents: ["Carte CNAM", "Pièce d'identité"], instructions: "Arrivez 10 min en avance." },
  { id: 2, doctor: "Dr. Sonia Gharbi", specialty: "Cardiologue", date: "23 Fév", time: "10:00", type: "cabinet", address: "32 Rue Charles de Gaulle, Ariana", avatar: "SG", status: "confirmed", motif: "Bilan cardiaque", canModify: true, canCancel: true, cnam: true, cancellationPolicy: "Annulation gratuite jusqu'à 48h avant", documents: ["Carte CNAM"], instructions: "Venez à jeun." },
  { id: 3, doctor: "Dr. Khaled Hammami", specialty: "Dermatologue", date: "28 Fév", time: "16:15", type: "teleconsultation", address: "", avatar: "KH", status: "pending", motif: "Consultation dermatologie", canModify: false, canCancel: true, cnam: true, cancellationPolicy: "Annulation gratuite jusqu'à 24h avant", documents: [], instructions: "Préparez votre caméra." },
];

export const mockPatientAppointmentsFull: PatientAppointment[] = [
  ...mockPatientAppointments,
  { id: 4, doctor: "Dr. Leila Chebbi", specialty: "Ophtalmologue", date: "5 Mar 2026", time: "11:00", type: "cabinet", address: "12 Rue de Carthage, Sousse", avatar: "LC", status: "confirmed", motif: "Contrôle annuel vue", canModify: true, canCancel: true, cnam: false, cancellationPolicy: "Annulation gratuite jusqu'à 24h avant", documents: ["Pièce d'identité"], instructions: "" },
];

export const mockPastAppointments: PastAppointment[] = [
  { id: 5, doctor: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", date: "10 Fév 2026", time: "09:00", status: "completed", motif: "Suivi diabète", hasPrescription: true, hasReport: true, avatar: "AB", amount: "35 DT" },
  { id: 6, doctor: "Dr. Nabil Karray", specialty: "Pédiatre", date: "3 Fév 2026", time: "14:00", status: "completed", motif: "Consultation enfant", hasPrescription: false, hasReport: true, avatar: "NK", amount: "40 DT" },
  { id: 7, doctor: "Dr. Sonia Gharbi", specialty: "Cardiologue", date: "15 Jan 2026", time: "10:30", status: "no-show", motif: "Bilan cardiaque", hasPrescription: false, hasReport: false, avatar: "SG", amount: "60 DT" },
];

export const mockCancelledAppointments: CancelledAppointment[] = [
  { id: 8, doctor: "Dr. Sonia Gharbi", specialty: "Cardiologue", date: "8 Fév 2026", time: "15:00", reason: "Indisponibilité du praticien", avatar: "SG" },
  { id: 9, doctor: "Dr. Khaled Hammami", specialty: "Dermatologue", date: "20 Jan 2026", time: "11:30", reason: "Annulation par le patient", avatar: "KH" },
];

// ─── Patient Recent Prescriptions ────────────────────────────

export const mockRecentPrescriptions = [
  { id: "ORD-045", doctor: "Dr. Bouazizi", date: "10 Fév", items: 3, status: "active" },
  { id: "ORD-042", doctor: "Dr. Gharbi", date: "3 Fév", items: 1, status: "active" },
];

// ─── Patient Prescriptions (full) ────────────────────────────

export const mockPatientPrescriptions: Prescription[] = [
  { id: "ORD-2026-045", doctor: "Dr. Bouazizi", date: "10 Fév 2026", items: ["Metformine 850mg - 2x/jour", "Glibenclamide 5mg - 1x/jour"], status: "active", total: "45 DT", cnam: true, pharmacy: null },
  { id: "ORD-2026-042", doctor: "Dr. Gharbi", date: "3 Fév 2026", items: ["Amlodipine 10mg - 1x/jour"], status: "active", total: "28 DT", cnam: true, pharmacy: "Pharmacie El Amal" },
  { id: "ORD-2025-038", doctor: "Dr. Hammami", date: "15 Déc 2025", items: ["Crème dermocorticoïde", "Lotion hydratante"], status: "expired", total: "35 DT", cnam: true, pharmacy: "Pharmacie Pasteur" },
  { id: "ORD-2025-032", doctor: "Dr. Bouazizi", date: "20 Nov 2025", items: ["Oméprazole 20mg", "Gaviscon"], status: "expired", total: "22 DT", cnam: false, pharmacy: "Pharmacie Pasteur" },
];

// ─── Doctor Prescriptions ────────────────────────────────────

export const mockDoctorPrescriptions: Prescription[] = [
  { id: "ORD-2026-045", doctor: "Dr. Bouazizi", patient: "Amine Ben Ali", date: "20 Fév 2026", items: ["Metformine 850mg - 2x/jour", "Glibenclamide 5mg - 1x/jour"], status: "active", total: "45 DT", cnam: true, pharmacy: null, sent: true },
  { id: "ORD-2026-044", doctor: "Dr. Bouazizi", patient: "Fatma Trabelsi", date: "20 Fév 2026", items: ["Amlodipine 10mg - 1x/jour"], status: "active", total: "28 DT", cnam: true, pharmacy: null, sent: true },
  { id: "ORD-2026-043", doctor: "Dr. Bouazizi", patient: "Nadia Jemni", date: "17 Fév 2026", items: ["Ibuprofène 400mg - 3x/jour pendant 7 jours", "Tramadol 50mg - si douleur intense"], status: "active", total: "35 DT", cnam: true, pharmacy: null, sent: false },
];

// ─── Notifications ───────────────────────────────────────────

export const mockNotifications: Notification[] = [
  { id: "1", type: "appointment", title: "Rappel de RDV", message: "Votre rendez-vous avec Dr. Bouazizi est demain à 14h30 au cabinet El Manar.", time: "Il y a 1h", read: false },
  { id: "2", type: "result", title: "Résultats disponibles", message: "Les résultats de votre bilan sanguin sont prêts. Consultez-les dans votre dossier médical.", time: "Il y a 3h", read: false },
  { id: "3", type: "message", title: "Nouveau message", message: "Dr. Gharbi vous a envoyé un message concernant votre dernière consultation.", time: "Il y a 5h", read: false },
  { id: "4", type: "prescription", title: "Ordonnance renouvelée", message: "Votre ordonnance ORD-2026-045 a été renouvelée par Dr. Bouazizi.", time: "Hier", read: true },
  { id: "5", type: "reminder", title: "Rappel CNAM", message: "Pensez à renouveler votre carte CNAM avant le 31 mars 2026.", time: "Hier", read: true },
  { id: "6", type: "appointment", title: "RDV confirmé", message: "Votre rendez-vous du 23 Fév avec Dr. Gharbi (Cardiologue) est confirmé.", time: "Il y a 2 jours", read: true },
  { id: "7", type: "system", title: "Mise à jour du profil", message: "Pensez à compléter votre numéro d'assuré CNAM dans votre profil.", time: "Il y a 3 jours", read: true },
];

// ─── Health Data (Patient Health Page) ───────────────────────

export const mockHealthDocuments: HealthDocument[] = [
  { name: "Résultats analyses - Glycémie", type: "Analyse", date: "15 Fév 2026", source: "Labo BioSanté", size: "245 Ko" },
  { name: "Ordonnance Dr. Bouazizi", type: "Ordonnance", date: "10 Fév 2026", source: "Dr. Ahmed Bouazizi", size: "120 Ko" },
  { name: "Radio thoracique", type: "Imagerie", date: "5 Jan 2026", source: "Centre Imagerie Tunis", size: "2.1 Mo" },
  { name: "Compte-rendu consultation", type: "Consultation", date: "20 Déc 2025", source: "Dr. Sonia Gharbi", size: "85 Ko" },
  { name: "Certificat médical", type: "Certificat", date: "15 Nov 2025", source: "Dr. Ahmed Bouazizi", size: "55 Ko" },
];

export const mockAntecedents: Antecedent[] = [
  { name: "Diabète type 2", date: "Depuis 2020", details: "Suivi régulier, traitement oral" },
  { name: "Hypertension artérielle", date: "Depuis 2022", details: "Traitement par Amlodipine 5mg" },
  { name: "Asthme léger", date: "Depuis l'enfance", details: "Ventoline en cas de crise" },
  { name: "Appendicectomie", date: "Mars 2015", details: "Hôpital Charles Nicolle" },
];

export const mockTreatments: Treatment[] = [
  { name: "Metformine 850mg", dose: "1 cp matin et soir", prescriber: "Dr. Bouazizi", since: "Jan 2021", status: "active" },
  { name: "Amlodipine 5mg", dose: "1 cp le matin", prescriber: "Dr. Bouazizi", since: "Mar 2022", status: "active" },
];

export const mockAllergies: Allergy[] = [
  { name: "Pénicilline", severity: "Sévère", reaction: "Réaction cutanée sévère" },
  { name: "Acariens", severity: "Modéré", reaction: "Rhinite allergique" },
];

export const mockHabits: Habit[] = [
  { label: "Tabac", value: "Non-fumeur" },
  { label: "Alcool", value: "Occasionnel" },
  { label: "Activité physique", value: "3x / semaine" },
  { label: "Alimentation", value: "Régime diabétique" },
];

export const mockFamilyHistory: FamilyHistory[] = [
  { name: "Diabète (père)", details: "Type 2" },
  { name: "Hypertension (mère)", details: "" },
];

export const mockSurgeries: Surgery[] = [
  { name: "Appendicectomie", date: "Mars 2015", hospital: "Hôpital Charles Nicolle, Tunis" },
];

export const mockVaccinations: Vaccination[] = [
  { name: "COVID-19 (Pfizer)", doses: "3 doses", lastDate: "15 Jan 2022", nextDate: null },
  { name: "Grippe saisonnière", doses: "1 dose", lastDate: "10 Oct 2025", nextDate: "Oct 2026" },
  { name: "Hépatite B", doses: "3 doses", lastDate: "2005", nextDate: null },
  { name: "Tétanos", doses: "Rappel", lastDate: "Mar 2020", nextDate: "Mar 2030" },
];

export const mockMeasures: HealthMeasure[] = [
  { label: "Tension artérielle", value: "13/8 mmHg", date: "15 Fév 2026" },
  { label: "Glycémie", value: "1.05 g/L", date: "15 Fév 2026" },
  { label: "Poids", value: "75 kg", date: "10 Fév 2026" },
  { label: "IMC", value: "24.2", date: "10 Fév 2026" },
];

// ─── AI Chat (Doctor & Patient) ──────────────────────────────

export const mockAiInitialMessages: ChatMessage[] = [
  { id: "1", sender: "ai", text: "Bonjour Dr. Bouazizi ! Je suis votre assistant IA Medicare. Comment puis-je vous aider ? Je peux vous aider avec des informations médicales, des protocoles ou des interactions médicamenteuses.", time: "—" },
];

export const mockAiResponses = [
  "D'après les dernières recommandations HAS (2025), pour un patient diabétique de type 2 avec HbA1c entre 7% et 8%, le traitement de première intention reste la Metformine. Si les objectifs ne sont pas atteints après 3-6 mois, l'ajout d'un inhibiteur SGLT2 ou d'un agoniste GLP-1 est recommandé, surtout en cas de risque cardiovasculaire.",
  "Interaction potentielle détectée : l'association Metformine + AINS (ibuprofène) peut augmenter le risque d'acidose lactique, surtout en cas d'insuffisance rénale. Alternative recommandée : Paracétamol.",
  "Je vous recommande de vérifier la clairance de la créatinine avant de prescrire. Pour plus de précisions, consultez le Vidal ou le CRAT.",
];

export const mockPatientAiInitial: ChatMessage[] = [
  { id: "1", sender: "ai", text: "Bonjour ! Je suis l'assistant virtuel Medicare. Je peux vous aider à comprendre vos résultats ou vous orienter. Que puis-je faire pour vous ?", time: "—" },
];

export const mockPatientAiResponses = [
  "D'après vos résultats, votre glycémie est dans les normes (1.05 g/L). Continuez votre traitement et vos contrôles réguliers. N'hésitez pas à consulter votre médecin traitant pour toute question.",
  "Je vous recommande de consulter un spécialiste pour ce type de symptômes. Vous pouvez rechercher un praticien directement depuis l'onglet 'Prendre RDV'.",
];

// ─── Messaging ───────────────────────────────────────────────

export const mockMessagingContacts: ChatContact[] = [
  { id: "1", name: "Dr. Ahmed Bouazizi", role: "Médecin généraliste", avatar: "AB", lastMessage: "Vos résultats sont bons, on se revoit dans 3 mois.", time: "10:30", unread: 1, online: true },
  { id: "2", name: "Dr. Sonia Gharbi", role: "Cardiologue", avatar: "SG", lastMessage: "N'oubliez pas votre bilan la semaine prochaine.", time: "Hier", unread: 0, online: false },
  { id: "3", name: "Pharmacie El Manar", role: "Pharmacie", avatar: "PE", lastMessage: "Votre ordonnance est prête à retirer.", time: "Hier", unread: 2, online: true },
  { id: "4", name: "Labo BioAnalyse Tunis", role: "Laboratoire", avatar: "LB", lastMessage: "Vos résultats d'analyses sont disponibles.", time: "18 Fév", unread: 0, online: false },
  { id: "5", name: "Dr. Khaled Hammami", role: "Dermatologue", avatar: "KH", lastMessage: "Comment évolue votre traitement ?", time: "15 Fév", unread: 0, online: false },
];

export const mockConversationMessages: Record<string, ChatMessage[]> = {
  "1": [
    { id: "1", sender: "them", text: "Bonjour, j'ai bien reçu vos résultats d'analyses.", time: "09:45" },
    { id: "2", sender: "them", text: "Votre glycémie est à 1.05 g/L, ce qui est dans les normes. L'HbA1c est à 6.8%.", time: "09:46" },
    { id: "3", sender: "me", text: "Merci docteur ! Est-ce que je dois modifier mon traitement ?", time: "10:15" },
    { id: "4", sender: "them", text: "Non, on continue le traitement actuel. Metformine 850mg 2x/jour + Glibenclamide 5mg 1x/jour.", time: "10:20" },
    { id: "5", sender: "me", text: "D'accord, merci beaucoup.", time: "10:25" },
    { id: "6", sender: "them", text: "Vos résultats sont bons, on se revoit dans 3 mois.", time: "10:30" },
  ],
};

// ─── Doctor Connect (Inter-Pro) ──────────────────────────────

export const mockProContacts: ChatContact[] = [
  { id: "p1", name: "Dr. Sonia Gharbi", role: "Cardiologue", specialty: "Cardiologue", avatar: "SG", lastMessage: "Merci pour l'orientation, je prends en charge.", time: "10:30", unread: 1, online: true },
  { id: "p2", name: "Dr. Khaled Hammami", role: "Dermatologue", specialty: "Dermatologue", avatar: "KH", lastMessage: "Les résultats du bilan cutané sont bons.", time: "Hier", unread: 0, online: false },
  { id: "p3", name: "Dr. Leila Chahed", role: "Endocrinologue", specialty: "Endocrinologue", avatar: "LC", lastMessage: "Je vous envoie le protocole.", time: "18 Fév", unread: 0, online: true },
];

export const mockCabinetContacts: ChatContact[] = [
  { id: "c1", name: "Chat du cabinet", role: "Dr. Bouazizi · Mme Fatma (Secrétaire)", specialty: "Dr. Bouazizi · Mme Fatma (Secrétaire)", avatar: "CB", lastMessage: "Le patient de 14h30 a annulé.", time: "11:15", unread: 2, online: true },
];

export const mockProMessages: Record<string, ChatMessage[]> = {
  "p1": [
    { id: "1", sender: "me", text: "Bonjour Dr. Gharbi, j'ai un patient avec suspicion d'arythmie. Pourriez-vous le prendre en charge ?", time: "09:45" },
    { id: "2", sender: "them", text: "Bonjour Dr. Bouazizi, bien sûr. Envoyez-moi son dossier et je planifie un ECG.", time: "10:00" },
    { id: "3", sender: "me", text: "Je vous envoie le dossier maintenant. Merci beaucoup !", time: "10:15" },
    { id: "4", sender: "them", text: "Merci pour l'orientation, je prends en charge.", time: "10:30" },
  ],
};

export const mockCabinetMessages: Record<string, ChatMessage[]> = {
  "c1": [
    { id: "1", sender: "them", text: "Le patient de 14h30 a appelé pour annuler.", time: "11:00", senderName: "Mme Fatma" },
    { id: "2", sender: "me", text: "D'accord, essayez de placer un patient en liste d'attente sur ce créneau.", time: "11:10" },
    { id: "3", sender: "them", text: "Le patient de 14h30 a annulé.", time: "11:15", senderName: "Mme Fatma" },
  ],
};

// ─── Doctor Dashboard ────────────────────────────────────────

export const mockTodaySchedule: DoctorScheduleItem[] = [
  { time: "08:30", patient: "Amine Ben Ali", type: "Consultation", duration: "30 min", status: "done", motif: "Suivi diabète", avatar: "AB", cnam: true, phone: "+216 55 123 456" },
  { time: "09:00", patient: "Fatma Trabelsi", type: "Suivi", duration: "20 min", status: "done", motif: "Contrôle tension", avatar: "FT", cnam: true, phone: "+216 55 234 567" },
  { time: "09:30", patient: "Mohamed Sfar", type: "Première visite", duration: "45 min", status: "current", motif: "Bilan initial", avatar: "MS", cnam: false, phone: "+216 55 345 678" },
  { time: "10:15", patient: "Nadia Jemni", type: "Contrôle", duration: "20 min", status: "upcoming", motif: "Douleurs articulaires", avatar: "NJ", cnam: true, phone: "+216 55 456 789" },
  { time: "10:45", patient: "Sami Ayari", type: "Consultation", duration: "30 min", status: "upcoming", motif: "Renouvellement ordonnance", avatar: "SA", cnam: true },
  { time: "14:00", patient: "Rania Meddeb", type: "Suivi", duration: "20 min", status: "upcoming", motif: "Suivi cholestérol", avatar: "RM", cnam: true },
  { time: "14:30", patient: "Youssef Belhadj", type: "Téléconsultation", duration: "20 min", status: "upcoming", motif: "Résultats analyses", avatar: "YB", teleconsultation: true, cnam: false },
  { time: "15:00", patient: "Salma Dridi", type: "Consultation", duration: "30 min", status: "upcoming", motif: "Certificat médical", avatar: "SD", cnam: true },
];

export const mockWaitingRoom: WaitingRoomEntry[] = [
  { patient: "Mohamed Sfar", arrivedAt: "09:20", appointment: "09:30", wait: "10 min", avatar: "MS" },
  { patient: "Nadia Jemni", arrivedAt: "10:05", appointment: "10:15", wait: "0 min", avatar: "NJ" },
];

export const mockUrgentAlerts: UrgentAlert[] = [
  { type: "result", patient: "Fatma Trabelsi", text: "Résultats analyses — Cholestérol élevé", severity: "high" },
  { type: "message", patient: "Amine Ben Ali", text: "Question sur posologie Metformine", severity: "normal" },
];

// ─── Doctor Consultations ────────────────────────────────────

export const mockDoctorConsultations: DoctorConsultation[] = [
  { id: 1, patient: "Amine Ben Ali", date: "20 Fév 2026", time: "09:30", motif: "Suivi diabète", notes: "Glycémie stable, renouvellement traitement", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "AB", status: "completed" },
  { id: 2, patient: "Fatma Trabelsi", date: "20 Fév 2026", time: "09:00", motif: "Contrôle tension", notes: "TA 14/8, ajustement posologie", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "FT", status: "completed" },
  { id: 3, patient: "Mohamed Sfar", date: "18 Fév 2026", time: "14:00", motif: "Suivi post-opératoire", notes: "Cicatrisation normale, retrait fils J+15", prescriptions: 0, cnam: false, amount: "50 DT", avatar: "MS", status: "completed" },
  { id: 4, patient: "Nadia Jemni", date: "17 Fév 2026", time: "10:30", motif: "Douleurs articulaires", notes: "Prescription anti-inflammatoires", prescriptions: 2, cnam: true, amount: "35 DT", avatar: "NJ", status: "completed" },
  { id: 5, patient: "Sami Ayari", date: "15 Fév 2026", time: "11:00", motif: "Renouvellement ordonnance", notes: "Ventoline + Seretide renouvelés pour 3 mois", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "SA", status: "completed" },
];

// ─── Doctor Consultation Detail (Patient Context) ────────────

export const mockConsultationPatient = {
  name: "Amine Ben Ali", age: 34, gender: "Homme", bloodType: "A+",
  allergies: ["Pénicilline"], conditions: ["Diabète type 2"], lastVisit: "10 Fév 2026",
  ssn: "1 91 03 75 012 035 42", mutuelle: "Assurances Maghrebia", medecinTraitant: "Dr. Ahmed Bouazizi",
};

// ─── Doctor Patient Detail ───────────────────────────────────

export const mockVitalsHistory: VitalsEntry[] = [
  { date: "10 Fév 2026", systolic: 130, diastolic: 80, heartRate: 72, weight: 75, glycemia: 1.05 },
  { date: "15 Jan 2026", systolic: 128, diastolic: 82, heartRate: 75, weight: 75.5, glycemia: 1.12 },
  { date: "5 Déc 2025", systolic: 135, diastolic: 85, heartRate: 70, weight: 76, glycemia: 1.18 },
  { date: "20 Nov 2025", systolic: 132, diastolic: 78, heartRate: 68, weight: 76.2, glycemia: 1.08 },
];

export const mockPatientConsultations = [
  { date: "10 Fév 2026", motif: "Suivi diabète", notes: "Glycémie stable 1.05 g/L. Maintien du traitement.", prescriptions: 1 },
  { date: "15 Jan 2026", motif: "Bilan cardiaque annuel", notes: "ECG normal. TA 13/8.", prescriptions: 0 },
];

export const mockPatientDetailPrescriptions = [
  { id: "ORD-045", date: "10 Fév 2026", items: ["Metformine 850mg - 2x/jour", "Glibenclamide 5mg - 1x/jour"], status: "active" },
  { id: "ORD-032", date: "20 Nov 2025", items: ["Oméprazole 20mg"], status: "expired" },
];

export const mockPatientAnalyses: AnalysisResult[] = [
  { id: "ANA-012", date: "10 Fév 2026", type: "Bilan sanguin", status: "ready", values: [{ name: "Glycémie", value: "1.05 g/L", ref: "0.70-1.10", status: "normal" }, { name: "HbA1c", value: "6.8%", ref: "< 7%", status: "normal" }] },
];

// ─── Doctor Stats ────────────────────────────────────────────

export const mockMonthlyConsultations: ChartDataPoint[] = [
  { month: "Sep", count: 98 }, { month: "Oct", count: 112 }, { month: "Nov", count: 105 },
  { month: "Déc", count: 87 }, { month: "Jan", count: 124 }, { month: "Fév", count: 94 },
];

export const mockPatientsByType = [
  { name: "Consultation", value: 45, color: "hsl(205, 85%, 45%)" },
  { name: "Suivi", value: 25, color: "hsl(160, 60%, 45%)" },
  { name: "Première visite", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Contrôle", value: 15, color: "hsl(205, 30%, 70%)" },
];

export const mockWeeklyRevenue: ChartDataPoint[] = [
  { day: "Lun", revenue: 280 }, { day: "Mar", revenue: 350 }, { day: "Mer", revenue: 175 },
  { day: "Jeu", revenue: 315 }, { day: "Ven", revenue: 245 }, { day: "Sam", revenue: 0 },
];

export const mockDoctorStatsCards: StatsCard[] = [
  { label: "Consultations ce mois", value: "94", change: "+12%", color: "text-primary" },
  { label: "Patients actifs", value: "342", change: "+5%", color: "text-accent" },
  { label: "CA mensuel", value: "4 340 DT", change: "+8%", color: "text-warning" },
  { label: "Durée moy. consultation", value: "22 min", change: "-3%", color: "text-primary" },
  { label: "Taux d'occupation", value: "87%", change: "+2%", color: "text-accent" },
  { label: "Taux d'annulation", value: "4.2%", change: "-1%", color: "text-destructive" },
];

// ─── Doctor Billing ──────────────────────────────────────────

export const mockSubscriptionInfo = {
  plan: "Basic",
  price: "39 DT/mois",
  status: "active" as const,
  nextRenewal: "20 Mar 2026",
  cardLast4: "4821",
  cardBrand: "Visa",
};

export const mockPlans = [
  {
    key: "basic", name: "Basic", price: "39", period: "DT/mois",
    features: ["Agenda en ligne", "Prise de rendez-vous patients", "Fiche praticien publique", "5 SMS de rappel / mois", "Messagerie patients", "Support email"],
    notIncluded: ["Téléconsultation vidéo", "Gestion secrétaire", "Ordonnances numériques", "SMS illimités", "Statistiques avancées"],
  },
  {
    key: "pro", name: "Pro", price: "129", period: "DT/mois", popular: true,
    features: ["Tout le plan Basic +", "Téléconsultation vidéo", "Gestion de secrétaire(s)", "Ordonnances numériques", "SMS de rappel illimités", "Statistiques avancées", "Dossier patient complet", "Support prioritaire", "Multi-cabinet"],
    notIncluded: [],
  },
];

export const mockSubscriptionInvoices: SubscriptionInvoice[] = [
  { id: "SUB-2026-02", month: "Février 2026", amount: 39, status: "paid", date: "1 Fév 2026" },
  { id: "SUB-2026-01", month: "Janvier 2026", amount: 39, status: "paid", date: "1 Jan 2026" },
  { id: "SUB-2025-12", month: "Décembre 2025", amount: 39, status: "paid", date: "1 Déc 2025" },
  { id: "SUB-2025-11", month: "Novembre 2025", amount: 39, status: "failed", date: "1 Nov 2025" },
];

export const mockTeleconsultTransactions: TeleconsultTransaction[] = [
  { id: "TX-2026-0142", patient: "Youssef Belhadj", avatar: "YB", dateRdv: "20 Fév 2026 14:30", amount: 45, status: "pending", ref: "FAC-2026-0142", motif: "Résultats analyses" },
  { id: "TX-2026-0141", patient: "Rania Meddeb", avatar: "RM", dateRdv: "19 Fév 2026 10:00", amount: 35, status: "paid", ref: "FAC-2026-0141", motif: "Suivi cholestérol" },
  { id: "TX-2026-0139", patient: "Amine Ben Ali", avatar: "AB", dateRdv: "18 Fév 2026 16:00", amount: 45, status: "paid", ref: "FAC-2026-0139", motif: "Suivi diabète" },
  { id: "TX-2026-0137", patient: "Sami Ayari", avatar: "SA", dateRdv: "17 Fév 2026 09:00", amount: 35, status: "failed", ref: "FAC-2026-0137", motif: "Renouvellement ordonnance" },
  { id: "TX-2026-0135", patient: "Salma Dridi", avatar: "SD", dateRdv: "15 Fév 2026 11:30", amount: 45, status: "refunded", ref: "FAC-2026-0135", motif: "Consultation annulée" },
];

// ─── Doctor Schedule (Calendar) ──────────────────────────────

export const mockScheduleDays = ["Lun 17", "Mar 18", "Mer 19", "Jeu 20", "Ven 21", "Sam 22"];
export const mockScheduleHours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

export const mockScheduleAppointments: Record<string, ScheduleAppointment> = {
  "Lun 17-09:00": { patient: "Amine Ben Ali", type: "Consultation", duration: 1, color: "primary", motif: "Suivi diabète", status: "confirmed", phone: "+216 55 123 456" },
  "Lun 17-09:30": { patient: "Fatma Trabelsi", type: "Suivi", duration: 1, color: "accent", motif: "Contrôle tension", status: "confirmed" },
  "Lun 17-10:30": { patient: "Mohamed Sfar", type: "Première visite", duration: 2, color: "warning", motif: "Bilan initial", status: "pending" },
  "Mar 18-08:30": { patient: "Nadia Jemni", type: "Contrôle", duration: 1, color: "accent", motif: "Douleurs articulaires", status: "confirmed" },
  "Mar 18-10:00": { patient: "Sami Ayari", type: "Téléconsultation", duration: 1, color: "primary", teleconsultation: true, motif: "Renouvellement", status: "confirmed" },
  "Mar 18-14:00": { patient: "Rania Meddeb", type: "Suivi", duration: 1, color: "accent", motif: "Cholestérol", status: "confirmed" },
  "Mar 18-15:30": { patient: "Youssef Belhadj", type: "Consultation", duration: 1, color: "primary", motif: "Check-up", status: "pending" },
  "Mer 19-09:00": { patient: "Salma Dridi", type: "Consultation", duration: 1, color: "primary", motif: "Consultation", status: "confirmed" },
  "Mer 19-11:00": { patient: "Karim Mansour", type: "Première visite", duration: 2, color: "warning", motif: "Bilan", status: "confirmed" },
  "Jeu 20-08:00": { patient: "Leila Chahed", type: "Contrôle", duration: 1, color: "accent", motif: "Suivi", status: "confirmed" },
  "Jeu 20-14:30": { patient: "Bilel Nasri", type: "Téléconsultation", duration: 1, color: "primary", teleconsultation: true, motif: "Résultats", status: "confirmed" },
  "Jeu 20-16:00": { patient: "Olfa Ben Salah", type: "Consultation", duration: 1, color: "primary", motif: "Certificat", status: "confirmed" },
  "Ven 21-09:30": { patient: "Imen Bouhlel", type: "Suivi", duration: 1, color: "accent", motif: "Suivi grossesse", status: "confirmed" },
  "Ven 21-15:00": { patient: "Walid Jlassi", type: "Consultation", duration: 1, color: "primary", motif: "Consultation", status: "confirmed" },
};

export const mockRecurDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// ─── Doctor Onboarding ───────────────────────────────────────

export const mockDefaultMotifs = [
  { name: "Consultation générale", duration: 30, price: 35 },
  { name: "Suivi", duration: 20, price: 25 },
  { name: "Première consultation", duration: 45, price: 50 },
  { name: "Certificat médical", duration: 15, price: 20 },
];

export const mockDefaultHoraires = [
  { day: "Lundi", morning: "08:00-12:00", afternoon: "14:00-18:00", open: true },
  { day: "Mardi", morning: "08:00-12:00", afternoon: "14:00-18:00", open: true },
  { day: "Mercredi", morning: "08:00-12:00", afternoon: "", open: true },
  { day: "Jeudi", morning: "08:00-12:00", afternoon: "14:00-18:00", open: true },
  { day: "Vendredi", morning: "08:00-12:00", afternoon: "14:00-17:00", open: true },
  { day: "Samedi", morning: "08:00-13:00", afternoon: "", open: true },
  { day: "Dimanche", morning: "", afternoon: "", open: false },
];

// ─── Landing Page ────────────────────────────────────────────

export const mockLandingSpecialties = ["Médecin généraliste", "Dentiste", "Ophtalmologue", "Dermatologue", "Gynécologue", "Pédiatre", "Kinésithérapeute", "Cardiologue"];

export const mockLandingFeatures = [
  { title: "Prise de RDV en ligne", description: "Réservez votre rendez-vous 24h/24, 7j/7 en quelques clics." },
  { title: "Rappels automatiques", description: "Recevez des rappels par SMS au +216 avant chaque consultation." },
  { title: "Prise en charge CNAM", description: "Trouvez des praticiens conventionnés CNAM partout en Tunisie." },
  { title: "Téléconsultation", description: "Consultez votre médecin à distance depuis votre domicile." },
];

export const mockLandingRoles = [
  { title: "Médecins", description: "Gérez votre agenda, vos patients et vos consultations.", link: "/dashboard/doctor", color: "bg-primary/10 text-primary" },
  { title: "Patients", description: "Prenez RDV, consultez vos ordonnances et votre historique.", link: "/dashboard/patient", color: "bg-accent/10 text-accent" },
  { title: "Pharmacies", description: "Recevez et gérez les ordonnances de vos patients.", link: "/dashboard/pharmacy", color: "bg-warning/10 text-warning" },
  { title: "Laboratoires", description: "Gérez les analyses et partagez les résultats.", link: "/dashboard/laboratory", color: "bg-destructive/10 text-destructive" },
  { title: "Secrétariat", description: "Pilotez le cabinet : agenda, facturation, patients.", link: "/dashboard/secretary", color: "bg-primary/10 text-primary" },
];

export const mockLandingStats = [
  { value: "5 000+", label: "Praticiens" },
  { value: "500K+", label: "Patients" },
  { value: "2M+", label: "RDV pris" },
  { value: "4.8/5", label: "Satisfaction" },
];

// ─── Secretary ───────────────────────────────────────────────

export const mockSecretaryWaitingRoom = [
  { id: 1, patient: "Amine Ben Ali", arrivedAt: "09:15", appointment: "09:30", doctor: "Dr. Bouazizi", motif: "Suivi diabète", status: "waiting" as string, avatar: "AB", cnam: true, waitMin: 15 },
  { id: 2, patient: "Fatma Trabelsi", arrivedAt: "09:20", appointment: "09:45", doctor: "Dr. Gharbi", motif: "Bilan cardiaque", status: "waiting" as string, avatar: "FT", cnam: true, waitMin: 10 },
  { id: 3, patient: "Mohamed Sfar", arrivedAt: "09:25", appointment: "10:00", doctor: "Dr. Bouazizi", motif: "Contrôle annuel", status: "waiting" as string, avatar: "MS", cnam: false, waitMin: 5 },
];

export const mockSecretaryAppointments = [
  { id: 1, time: "08:30", patient: "Karim Mansour", doctor: "Dr. Bouazizi", type: "Consultation", status: "done" as string, avatar: "KM", amount: "35 DT", cnam: true },
  { id: 2, time: "09:00", patient: "Leila Chahed", doctor: "Dr. Gharbi", type: "Suivi", status: "done" as string, avatar: "LC", amount: "45 DT", cnam: true },
  { id: 3, time: "09:30", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", type: "Consultation", status: "in_progress" as string, avatar: "AB", amount: "35 DT", cnam: true },
  { id: 4, time: "09:45", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", type: "Suivi", status: "waiting" as string, avatar: "FT", amount: "45 DT", cnam: true },
  { id: 5, time: "10:00", patient: "Mohamed Sfar", doctor: "Dr. Bouazizi", type: "Contrôle", status: "upcoming" as string, avatar: "MS", amount: "35 DT", cnam: false },
  { id: 6, time: "10:30", patient: "Nadia Jemni", doctor: "Dr. Hammami", type: "Consultation", status: "upcoming" as string, avatar: "NJ", amount: "40 DT", cnam: true },
  { id: 7, time: "11:00", patient: "Sami Ayari", doctor: "Dr. Bouazizi", type: "Première visite", status: "upcoming" as string, avatar: "SA", amount: "50 DT", cnam: true },
  { id: 8, time: "14:00", patient: "Youssef Belhadj", doctor: "Dr. Bouazizi", type: "Téléconsultation", status: "upcoming" as string, avatar: "YB", teleconsultation: true, amount: "35 DT", cnam: false },
  { id: 9, time: "14:30", patient: "Salma Dridi", doctor: "Dr. Hammami", type: "Consultation", status: "upcoming" as string, avatar: "SD", amount: "40 DT", cnam: true },
  { id: 10, time: "15:00", patient: "Hana Kammoun", doctor: "Dr. Bouazizi", type: "Suivi", status: "upcoming" as string, avatar: "HK", amount: "35 DT", cnam: true },
  { id: 11, time: "15:30", patient: "Bilel Nasri", doctor: "Dr. Gharbi", type: "Consultation", status: "upcoming" as string, avatar: "BN", amount: "45 DT", cnam: true },
  { id: 12, time: "16:00", patient: "Olfa Ben Salah", doctor: "Dr. Hammami", type: "Suivi", status: "upcoming" as string, avatar: "OB", amount: "40 DT", cnam: false },
];

export const mockSecretaryCalls = [
  { id: 1, caller: "Hana Kammoun", time: "09:15", type: "Prise de RDV", handled: true, phone: "+216 71 234 567" },
  { id: 2, caller: "Bilel Nasri", time: "09:05", type: "Annulation", handled: true, phone: "+216 22 345 678" },
  { id: 3, caller: "N° inconnu", time: "08:55", type: "Non répondu", handled: false, phone: "+216 98 765 432" },
  { id: 4, caller: "Olfa Ben Salah", time: "08:40", type: "Demande info", handled: true, phone: "+216 55 678 901" },
];

export const mockSecretaryDoctors = [
  { name: "Dr. Bouazizi", specialty: "Généraliste", status: "busy", patient: "Amine Ben Ali", nextFree: "10:00", rdvCount: 6 },
  { name: "Dr. Gharbi", specialty: "Cardiologue", status: "available", patient: null as string | null, nextFree: null as string | null, rdvCount: 4 },
  { name: "Dr. Hammami", specialty: "Dermatologue", status: "absent", patient: null as string | null, nextFree: "14:00", rdvCount: 2 },
];

export const mockSecretaryOfficeDoctors = [
  { name: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", status: "available", patients: 12, phone: "+216 71 234 567", conventionCNAM: true },
  { name: "Dr. Sonia Gharbi", specialty: "Cardiologue", status: "in_consultation", patients: 8, phone: "+216 71 234 568", conventionCNAM: true },
  { name: "Dr. Khaled Hammami", specialty: "Dermatologue", status: "absent", patients: 0, phone: "+216 71 234 569", conventionCNAM: true },
];

export const mockOfficeInfo = {
  name: "Cabinet Médical El Manar",
  address: "15 Avenue de la Liberté, El Manar, 2092 Tunis",
  phone: "+216 71 234 567",
  fax: "+216 71 234 568",
  email: "contact@cabinet-elmanar.tn",
  openingHours: "Lun-Ven: 8h-18h / Sam: 8h-13h",
  conventionCNAM: true,
  registreCommerce: "B12345678",
};

export const mockOfficeWeeklyStats = [
  { label: "RDV cette semaine", value: "87", trend: "+12%" },
  { label: "Taux d'occupation", value: "82%", trend: "+5%" },
  { label: "Taux d'annulation", value: "4.2%", trend: "-1%" },
  { label: "Nouveaux patients/mois", value: "23", trend: "+3" },
];

export const mockOfficeEquipment = [
  { name: "ECG 12 dérivations", status: "ok", lastMaintenance: "Jan 2026" },
  { name: "Tensiomètre électronique", status: "ok", lastMaintenance: "Fév 2026" },
  { name: "Échographe portable", status: "maintenance", lastMaintenance: "Nov 2025" },
  { name: "Oxymètre de pouls", status: "ok", lastMaintenance: "Fév 2026" },
];

export const mockSecretaryPatients = [
  { name: "Amine Ben Ali", phone: "+216 71 234 567", email: "amine@email.tn", lastVisit: "20 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: "28 Fév 14:30", cnamId: "12345678", assurance: "CNAM", dob: "15/03/1991", avatar: "AB", balance: 0, notes: "Suivi diabète régulier", gouvernorat: "Tunis" },
  { name: "Fatma Trabelsi", phone: "+216 22 345 678", email: "fatma@email.tn", lastVisit: "18 Fév 2026", doctor: "Dr. Gharbi", nextAppointment: "25 Fév 10:00", cnamId: "23456789", assurance: "CNAM", dob: "12/07/1970", avatar: "FT", balance: 60, notes: "Hypertension — suivi cardio", gouvernorat: "Ariana" },
  { name: "Mohamed Sfar", phone: "+216 55 456 789", email: "med@email.tn", lastVisit: "15 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: null as string | null, cnamId: "—", assurance: "Privée", dob: "05/01/1998", avatar: "MS", balance: 0, notes: "Suivi post-opératoire", gouvernorat: "Ben Arous" },
  { name: "Nadia Jemni", phone: "+216 98 567 890", email: "nadia@email.tn", lastVisit: "10 Fév 2026", doctor: "Dr. Hammami", nextAppointment: "3 Mar 09:00", cnamId: "34567890", assurance: "CNAM", dob: "18/11/1959", avatar: "NJ", balance: 25, notes: "Arthrose — anti-inflammatoires", gouvernorat: "Manouba" },
  { name: "Sami Ayari", phone: "+216 29 678 901", email: "sami@email.tn", lastVisit: "8 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: null as string | null, cnamId: "45678901", assurance: "CNAM", dob: "22/06/1984", avatar: "SA", balance: 0, notes: "Asthme léger", gouvernorat: "Tunis" },
];

export const mockSecretaryBillingInvoices = [
  { id: "FAC-2026-087", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", date: "20 Fév", amount: 35, type: "Consultation G", payment: "CNAM", status: "paid", avatar: "AB", cnam: true },
  { id: "FAC-2026-086", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", date: "20 Fév", amount: 60, type: "Cardio", payment: "—", status: "pending", avatar: "FT", cnam: true },
  { id: "FAC-2026-085", patient: "Mohamed Sfar", doctor: "Dr. Bouazizi", date: "19 Fév", amount: 35, type: "Consultation G", payment: "Espèces", status: "paid", avatar: "MS", cnam: false },
  { id: "FAC-2026-084", patient: "Nadia Jemni", doctor: "Dr. Hammami", date: "19 Fév", amount: 80, type: "1ère consultation", payment: "—", status: "pending", avatar: "NJ", cnam: true },
  { id: "FAC-2026-083", patient: "Sami Ayari", doctor: "Dr. Bouazizi", date: "18 Fév", amount: 35, type: "Consultation G", payment: "Chèque", status: "paid", avatar: "SA", cnam: true },
  { id: "FAC-2026-082", patient: "Youssef Belhadj", doctor: "Dr. Bouazizi", date: "18 Fév", amount: 35, type: "Téléconsultation", payment: "Virement", status: "paid", avatar: "YB", cnam: false },
  { id: "FAC-2026-080", patient: "Rania Meddeb", doctor: "Dr. Gharbi", date: "15 Fév", amount: 60, type: "Suivi", payment: "—", status: "overdue", avatar: "RM", cnam: true },
  { id: "FAC-2026-078", patient: "Salma Dridi", doctor: "Dr. Bouazizi", date: "12 Fév", amount: 150, type: "Bilan complet", payment: "—", status: "overdue", avatar: "SD", cnam: true },
];

export const mockSecretaryDocuments = [
  { name: "Fiche patient - Amine Ben Ali", type: "PDF", size: "245 Ko", date: "20 Fév 2026", category: "Fiches patients" },
  { name: "Bulletin de soins CNAM - Fatma Trabelsi", type: "PDF", size: "120 Ko", date: "18 Fév 2026", category: "CNAM" },
  { name: "Ordonnance ORD-2026-045", type: "PDF", size: "89 Ko", date: "20 Fév 2026", category: "Ordonnances" },
  { name: "Résultats analyses - Mohamed Sfar", type: "PDF", size: "1.2 Mo", date: "15 Fév 2026", category: "Analyses" },
  { name: "Facture Février 2026", type: "PDF", size: "56 Ko", date: "1 Fév 2026", category: "Comptabilité" },
  { name: "Certificat médical - Sami Ayari", type: "PDF", size: "34 Ko", date: "19 Fév 2026", category: "Certificats" },
  { name: "Déclaration CNAM mensuelle", type: "PDF", size: "180 Ko", date: "1 Fév 2026", category: "CNAM" },
  { name: "Convention CNAM - Dr. Bouazizi", type: "PDF", size: "450 Ko", date: "1 Jan 2026", category: "CNAM" },
  { name: "Radiographie thorax - Nadia Jemni", type: "DICOM", size: "8.5 Mo", date: "12 Fév 2026", category: "Imagerie" },
];

export const mockDocumentCategories = ["Tous", "Fiches patients", "Ordonnances", "CNAM", "Analyses", "Certificats", "Comptabilité", "Imagerie"];

// ─── Secretary Agenda ────────────────────────────────────────

export const mockSecretaryAgendaDoctors = ["Tous", "Dr. Bouazizi", "Dr. Gharbi", "Dr. Hammami"];

export const mockSecretaryAgendaAppointments = [
  { id: 1, time: "08:00", endTime: "08:30", patient: "Karim Mansour", avatar: "KM", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Suivi diabète", status: "done", phone: "+216 71 111 111", cnam: true, notes: "Glycémie stable" },
  { id: 2, time: "08:30", endTime: "09:00", patient: "Leila Chahed", avatar: "LC", doctor: "Dr. Gharbi", type: "Suivi", motif: "Tension artérielle", status: "done", phone: "+216 71 222 222", cnam: true },
  { id: 3, time: "09:00", endTime: "09:30", patient: "Hana Kammoun", avatar: "HK", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Douleurs dorsales", status: "done", phone: "+216 71 333 333", cnam: true },
  { id: 4, time: "09:30", endTime: "10:00", patient: "Amine Ben Ali", avatar: "AB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Suivi diabète", status: "in_progress", phone: "+216 71 234 567", cnam: true, arrivedAt: "09:15" },
  { id: 5, time: "09:45", endTime: "10:15", patient: "Fatma Trabelsi", avatar: "FT", doctor: "Dr. Gharbi", type: "Suivi", motif: "Cardio - ECG", status: "in_waiting", phone: "+216 22 345 678", cnam: true, arrivedAt: "09:20", waitTime: 25 },
  { id: 6, time: "10:00", endTime: "10:30", patient: "Mohamed Sfar", avatar: "MS", doctor: "Dr. Bouazizi", type: "Contrôle", motif: "Post-opératoire", status: "in_waiting", phone: "+216 55 456 789", cnam: false, arrivedAt: "09:40", waitTime: 15 },
  { id: 7, time: "10:30", endTime: "11:00", patient: "Nadia Jemni", avatar: "NJ", doctor: "Dr. Hammami", type: "1ère visite", motif: "Consultation dermatologique", status: "confirmed", phone: "+216 98 567 890", cnam: true },
  { id: 8, time: "11:00", endTime: "11:30", patient: "Sami Ayari", avatar: "SA", doctor: "Dr. Bouazizi", type: "1ère visite", motif: "Bilan complet", status: "confirmed", phone: "+216 29 678 901", cnam: true },
  { id: 9, time: "11:30", endTime: "12:00", patient: "Bilel Nasri", avatar: "BN", doctor: "Dr. Gharbi", type: "Suivi", motif: "Hypertension", status: "upcoming", phone: "+216 50 789 012", cnam: true },
  { id: 10, time: "14:00", endTime: "14:30", patient: "Youssef Belhadj", avatar: "YB", doctor: "Dr. Bouazizi", type: "Téléconsultation", motif: "Renouvellement ordonnance", status: "confirmed", phone: "+216 71 890 123", cnam: false, teleconsultation: true },
  { id: 11, time: "14:30", endTime: "15:00", patient: "Salma Dridi", avatar: "SD", doctor: "Dr. Hammami", type: "Consultation", motif: "Acné sévère", status: "upcoming", phone: "+216 71 901 234", cnam: true },
  { id: 12, time: "15:00", endTime: "15:30", patient: "Olfa Ben Salah", avatar: "OB", doctor: "Dr. Bouazizi", type: "Consultation", motif: "Fatigue chronique", status: "upcoming", phone: "+216 55 012 345", cnam: true },
  { id: 13, time: "15:30", endTime: "16:00", patient: "Rania Meddeb", avatar: "RM", doctor: "Dr. Gharbi", type: "Contrôle", motif: "ECG de contrôle", status: "cancelled", phone: "+216 71 123 456", cnam: true },
  { id: 14, time: "16:00", endTime: "16:30", patient: "Imen Bouhlel", avatar: "IB", doctor: "Dr. Bouazizi", type: "Urgence", motif: "Douleur thoracique", status: "upcoming", phone: "+216 50 234 567", cnam: true },
  { id: 15, time: "16:30", endTime: "17:00", patient: "Walid Jlassi", avatar: "WJ", doctor: "Dr. Hammami", type: "Consultation", motif: "Eczéma", status: "upcoming", phone: "+216 22 345 678", cnam: false },
];

// ─── Laboratory ──────────────────────────────────────────────

export const mockLabAnalyses = [
  { patient: "Amine Ben Ali", type: "Bilan sanguin complet", doctor: "Dr. Bouazizi", status: "in_progress", date: "20 Fév", priority: "normal", avatar: "AB", amount: "85 DT", progress: 65 },
  { patient: "Fatma Trabelsi", type: "Analyse d'urine", doctor: "Dr. Gharbi", status: "ready", date: "19 Fév", priority: "normal", avatar: "FT", amount: "35 DT", progress: 100 },
  { patient: "Mohamed Sfar", type: "TSH - Thyroïde", doctor: "Dr. Hammami", status: "waiting", date: "20 Fév", priority: "urgent", avatar: "MS", amount: "45 DT", progress: 0 },
  { patient: "Nadia Jemni", type: "Glycémie à jeun", doctor: "Dr. Bouazizi", status: "ready", date: "18 Fév", priority: "normal", avatar: "NJ", amount: "25 DT", progress: 100 },
  { patient: "Sami Ayari", type: "Hémogramme (NFS)", doctor: "Dr. Bouazizi", status: "in_progress", date: "20 Fév", priority: "normal", avatar: "SA", amount: "40 DT", progress: 40 },
];

export const mockLabPatients = [
  { name: "Amine Ben Ali", age: 34, lastAnalysis: "Bilan sanguin", date: "20 Fév 2026", status: "in_progress", total: 8, phone: "+216 71 234 567", cnam: true, avatar: "AB" },
  { name: "Fatma Trabelsi", age: 56, lastAnalysis: "Analyse d'urine", date: "19 Fév 2026", status: "ready", total: 12, phone: "+216 22 345 678", cnam: true, avatar: "FT" },
  { name: "Mohamed Sfar", age: 28, lastAnalysis: "TSH", date: "20 Fév 2026", status: "waiting", total: 3, phone: "+216 55 456 789", cnam: false, avatar: "MS" },
  { name: "Nadia Jemni", age: 67, lastAnalysis: "Glycémie", date: "18 Fév 2026", status: "ready", total: 15, phone: "+216 98 567 890", cnam: true, avatar: "NJ" },
  { name: "Sami Ayari", age: 42, lastAnalysis: "Hémogramme", date: "20 Fév 2026", status: "in_progress", total: 6, phone: "+216 29 678 901", cnam: true, avatar: "SA" },
  { name: "Rania Meddeb", age: 38, lastAnalysis: "Bilan lipidique", date: "17 Fév 2026", status: "ready", total: 9, phone: "+216 52 789 012", cnam: true, avatar: "RM" },
];

// ─── Pharmacy ────────────────────────────────────────────────

export const mockPharmacyStock = [
  { id: 1, name: "Amoxicilline 500mg", category: "Antibiotiques", quantity: 245, threshold: 50, status: "ok", price: "8.5 DT", expiry: "Mar 2027", supplier: "Siphat" },
  { id: 2, name: "Paracétamol 1g", category: "Antalgiques", quantity: 532, threshold: 100, status: "ok", price: "3.2 DT", expiry: "Juin 2027", supplier: "Adwya" },
  { id: 3, name: "Ibuprofène 400mg", category: "Anti-inflammatoires", quantity: 12, threshold: 50, status: "low", price: "6.8 DT", expiry: "Déc 2026", supplier: "Siphat" },
  { id: 4, name: "Metformine 850mg", category: "Antidiabétiques", quantity: 89, threshold: 30, status: "ok", price: "12 DT", expiry: "Sep 2027", supplier: "Sanofi" },
  { id: 5, name: "Ventoline 100µg", category: "Bronchodilatateurs", quantity: 5, threshold: 20, status: "critical", price: "18 DT", expiry: "Fév 2027", supplier: "GSK" },
  { id: 6, name: "Oméprazole 20mg", category: "Anti-acides", quantity: 8, threshold: 30, status: "critical", price: "9.5 DT", expiry: "Jan 2027", supplier: "Adwya" },
  { id: 7, name: "Amlodipine 10mg", category: "Antihypertenseurs", quantity: 67, threshold: 25, status: "ok", price: "15 DT", expiry: "Avr 2027", supplier: "Medis" },
  { id: 8, name: "Bisoprolol 5mg", category: "Bêtabloquants", quantity: 42, threshold: 20, status: "ok", price: "11 DT", expiry: "Mai 2027", supplier: "Sanofi" },
  { id: 9, name: "Glibenclamide 5mg", category: "Antidiabétiques", quantity: 18, threshold: 25, status: "low", price: "7 DT", expiry: "Nov 2026", supplier: "Siphat" },
];

export const mockPharmacyCategories = ["Tous", "Antibiotiques", "Antalgiques", "Anti-inflammatoires", "Antidiabétiques", "Antihypertenseurs", "Bronchodilatateurs", "Anti-acides", "Bêtabloquants"];

// ─── Admin ───────────────────────────────────────────────────

export const mockAdminRevenueData: ChartDataPoint[] = [
  { month: "Sep", value: 32000 }, { month: "Oct", value: 35200 }, { month: "Nov", value: 38100 },
  { month: "Déc", value: 41500 }, { month: "Jan", value: 45200 }, { month: "Fév", value: 48750 },
];

export const mockAdminRegistrationData: ChartDataPoint[] = [
  { day: "Lun", doctors: 3, patients: 18, others: 2 },
  { day: "Mar", doctors: 5, patients: 22, others: 1 },
  { day: "Mer", doctors: 2, patients: 15, others: 3 },
  { day: "Jeu", doctors: 4, patients: 25, others: 2 },
  { day: "Ven", doctors: 6, patients: 20, others: 4 },
  { day: "Sam", doctors: 1, patients: 8, others: 0 },
  { day: "Dim", doctors: 0, patients: 5, others: 0 },
];

export const mockAdminPendingApprovals = [
  { id: 1, name: "Dr. Karim Bouzid", role: "Médecin - Cardiologue", date: "18 Fév 2026", docs: "Diplôme + CIN", email: "karim@email.tn" },
  { id: 2, name: "Pharmacie El Amal", role: "Pharmacie - Sousse", date: "19 Fév 2026", docs: "Licence + Registre", email: "elamal@pharmacy.tn" },
  { id: 3, name: "Dr. Nadia Hamdi", role: "Médecin - Dermatologue", date: "20 Fév 2026", docs: "Diplôme + CIN", email: "nadia@email.tn" },
];

export const mockAdminRecentActivity = [
  { type: "inscription", desc: "Dr. Karim Bouzid - Cardiologue", time: "Il y a 2h", status: "pending" },
  { type: "abonnement", desc: "Dr. Sonia Gharbi a souscrit Pro (129 DT/mois)", time: "Il y a 3h", status: "success" },
  { type: "signalement", desc: "Signalement sur Dr. Fathi Mejri - Avis suspect", time: "Il y a 5h", status: "warning" },
  { type: "inscription", desc: "Pharmacie El Amal - Sousse", time: "Il y a 6h", status: "pending" },
  { type: "paiement", desc: "Paiement reçu - Labo BioSanté (59 DT)", time: "Il y a 8h", status: "success" },
  { type: "signalement", desc: "Patient signale un profil médecin frauduleux", time: "Il y a 12h", status: "warning" },
];

// Aliases for backward compatibility
export const mockAdminStats = [
  { label: "Utilisateurs", value: "12,458", color: "text-primary", change: "+12%" },
  { label: "Médecins", value: "1,245", color: "text-accent", change: "+8%" },
  { label: "Laboratoires", value: "87", color: "text-warning", change: "+3%" },
  { label: "Pharmacies", value: "234", color: "text-primary", change: "+5%" },
];

export const mockAdminRevenue = mockAdminRevenueData;

export const mockAdminUsers = [
  { id: 1, name: "Dr. Ahmed Bouazizi", email: "ahmed@email.tn", phone: "+216 71 234 567", role: "doctor", status: "active", subscription: "Pro", joined: "Jan 2024", lastLogin: "20 Fév 2026", verified: true },
  { id: 2, name: "Fatma Trabelsi", email: "fatma@email.tn", phone: "+216 55 987 654", role: "patient", status: "active", subscription: "Gratuit", joined: "Mar 2024", lastLogin: "19 Fév 2026", verified: true },
  { id: 3, name: "Pharmacie El Manar", email: "elmanar@pharmacy.tn", phone: "+216 71 555 666", role: "pharmacy", status: "active", subscription: "Standard", joined: "Juin 2024", lastLogin: "20 Fév 2026", verified: true },
  { id: 4, name: "Labo BioSanté", email: "biosante@lab.tn", phone: "+216 71 777 888", role: "laboratory", status: "active", subscription: "Pro", joined: "Sep 2024", lastLogin: "18 Fév 2026", verified: true },
  { id: 5, name: "Dr. Karim Bouzid", email: "karim@email.tn", phone: "+216 71 111 222", role: "doctor", status: "pending", subscription: "—", joined: "18 Fév 2026", lastLogin: "—", verified: false },
  { id: 6, name: "Dr. Nadia Hamdi", email: "nadia@email.tn", phone: "+216 71 333 444", role: "doctor", status: "pending", subscription: "—", joined: "20 Fév 2026", lastLogin: "—", verified: false },
  { id: 7, name: "Amine Ben Ali", email: "amine@email.tn", phone: "+216 22 345 678", role: "patient", status: "suspended", subscription: "Gratuit", joined: "Fév 2024", lastLogin: "10 Fév 2026", verified: true },
];

export const mockAdminReports = [
  { id: 1, type: "avis", reason: "Avis frauduleux sur le profil du Dr. Mejri", reporter: "Dr. Sonia Gharbi", target: "Patient anonyme", date: "19 Fév 2026", priority: "high", status: "pending" as string, details: "Plusieurs avis 1 étoile publiés en série depuis un compte créé récemment." },
  { id: 2, type: "profil", reason: "Profil médecin non vérifié avec activité suspecte", reporter: "Système auto", target: "Dr. Fathi Mejri", date: "18 Fév 2026", priority: "high", status: "pending" as string, details: "Ce compte a été créé il y a 3 jours et a déjà publié 15 consultations." },
  { id: 3, type: "comportement", reason: "Comportement inapproprié en téléconsultation", reporter: "Fatma Trabelsi", target: "Dr. Inconnu", date: "17 Fév 2026", priority: "medium", status: "pending" as string, details: "La patiente rapporte un comportement non professionnel durant une téléconsultation." },
  { id: 4, type: "contenu", reason: "Photo de profil inappropriée", reporter: "Système auto", target: "Utilisateur #4521", date: "15 Fév 2026", priority: "low", status: "resolved" as string, details: "Photo de profil ne correspondant pas aux normes de la plateforme." },
];

export const mockAdminSubscriptions = [
  { name: "Gratuit", count: 8500, revenue: "0 DT" },
  { name: "Starter (49 DT/mois)", count: 320, revenue: "15,680 DT" },
  { name: "Pro (129 DT/mois)", count: 145, revenue: "18,705 DT" },
];

export const mockLabStats = [
  { label: "Analyses aujourd'hui", value: "24", color: "bg-primary/10 text-primary", change: "+12%" },
  { label: "En cours", value: "8", color: "bg-warning/10 text-warning", change: "3 urgentes" },
  { label: "Terminées", value: "14", color: "bg-accent/10 text-accent", change: "+18%" },
  { label: "CA du jour", value: "1,850 DT", color: "bg-primary/10 text-primary", change: "+8%" },
];

export const mockLabAnalysesFull = mockLabAnalyses;

export const mockPharmacyStats = [
  { label: "Ordonnances", value: "18", color: "bg-primary/10 text-primary", change: "+5 aujourd'hui" },
  { label: "Délivrées", value: "12", color: "bg-accent/10 text-accent", change: "+8%" },
  { label: "En attente", value: "6", color: "bg-warning/10 text-warning", change: "2 urgentes" },
  { label: "CA du jour", value: "945 DT", color: "bg-primary/10 text-primary", change: "+12%" },
];

export const mockPharmacyPrescriptions = [
  { patient: "Amine Ben Ali", avatar: "AB", doctor: "Dr. Bouazizi", items: 3, date: "20 Fév", total: "85 DT", urgent: false, cnam: true },
  { patient: "Fatma Trabelsi", avatar: "FT", doctor: "Dr. Gharbi", items: 1, date: "20 Fév", total: "22 DT", urgent: true, cnam: true },
  { patient: "Karim Mansour", avatar: "KM", doctor: "Dr. Hammami", items: 2, date: "19 Fév", total: "54 DT", urgent: false, cnam: false },
];

export const mockPharmacyDeliveries = [
  { patient: "Leila Chahed", time: "09:45", items: ["Amoxicilline", "Paracétamol"], amount: 42 },
  { patient: "Mohamed Sfar", time: "09:20", items: ["Metformine"], amount: 18 },
  { patient: "Hana Kammoun", time: "08:50", items: ["Amlodipine", "Aspirine"], amount: 35 },
];

export const mockSecretaryStats = {
  rdvTotal: 18,
  termines: 6,
  attente: 3,
  attenteMoy: 12,
  caJour: 420,
};

// ─── Pharmacy Prescriptions (full detail) ────────────────────

export interface PharmacyPrescriptionItem {
  name: string;
  available: boolean;
  quantity: number;
  price: string;
}

export interface PharmacyPrescription {
  id: string; patient: string; doctor: string; date: string;
  items: PharmacyPrescriptionItem[]; status: string; total: string;
  cnam: boolean; avatar: string; urgent: boolean;
}

export const mockPharmacyPrescriptionsFull: PharmacyPrescription[] = [
  { id: "ORD-2026-045", patient: "Amine Ben Ali", doctor: "Dr. Bouazizi", date: "20 Fév", items: [
    { name: "Metformine 850mg", available: true, quantity: 60, price: "12 DT" },
    { name: "Glibenclamide 5mg", available: true, quantity: 30, price: "7 DT" },
    { name: "Oméprazole 20mg", available: false, quantity: 0, price: "9.5 DT" },
  ], status: "pending", total: "28.5 DT", cnam: true, avatar: "AB", urgent: false },
  { id: "ORD-2026-044", patient: "Fatma Trabelsi", doctor: "Dr. Gharbi", date: "20 Fév", items: [
    { name: "Amlodipine 10mg", available: true, quantity: 30, price: "15 DT" },
  ], status: "pending", total: "15 DT", cnam: true, avatar: "FT", urgent: true },
  { id: "ORD-2026-043", patient: "Mohamed Sfar", doctor: "Dr. Hammami", date: "17 Fév", items: [
    { name: "Ibuprofène 400mg", available: true, quantity: 20, price: "6.8 DT" },
    { name: "Tramadol 50mg", available: true, quantity: 10, price: "11 DT" },
  ], status: "delivered", total: "17.8 DT", cnam: false, avatar: "MS", urgent: false },
  { id: "ORD-2026-042", patient: "Nadia Jemni", doctor: "Dr. Bouazizi", date: "15 Fév", items: [
    { name: "Ventoline 100µg", available: true, quantity: 1, price: "18 DT" },
  ], status: "delivered", total: "18 DT", cnam: true, avatar: "NJ", urgent: false },
  { id: "ORD-2026-041", patient: "Sami Ayari", doctor: "Dr. Bouazizi", date: "14 Fév", items: [
    { name: "Paracétamol 1g", available: true, quantity: 16, price: "3.2 DT" },
    { name: "Amoxicilline 500mg", available: true, quantity: 24, price: "8.5 DT" },
  ], status: "delivered", total: "11.7 DT", cnam: true, avatar: "SA", urgent: false },
  { id: "ORD-2026-040", patient: "Rania Meddeb", doctor: "Dr. Gharbi", date: "12 Fév", items: [
    { name: "Bisoprolol 5mg", available: true, quantity: 30, price: "11 DT" },
  ], status: "partial", total: "11 DT", cnam: true, avatar: "RM", urgent: false },
];

// ─── Pharmacy History ────────────────────────────────────────

export const mockPharmacyHistory = [
  { id: "DEL-078", patient: "Sami Ayari", prescription: "ORD-2026-043", items: ["Ibuprofène 400mg", "Tramadol 50mg"], date: "20 Fév 2026", time: "14:30", pharmacist: "S. Maalej", amount: 35, cnam: true, avatar: "SA", type: "full" },
  { id: "DEL-077", patient: "Rania Meddeb", prescription: "ORD-2026-042", items: ["Ventoline 100µg"], date: "20 Fév 2026", time: "10:15", pharmacist: "A. Kchaou", amount: 22, cnam: true, avatar: "RM", type: "full" },
  { id: "DEL-076", patient: "Youssef Belhadj", prescription: "ORD-2026-040", items: ["Paracétamol 1g", "Oméprazole 20mg"], date: "19 Fév 2026", time: "16:45", pharmacist: "S. Maalej", amount: 18, cnam: false, avatar: "YB", type: "full" },
  { id: "DEL-075", patient: "Mohamed Sfar", prescription: "ORD-2026-038", items: ["Amoxicilline 500mg"], date: "18 Fév 2026", time: "09:00", pharmacist: "A. Kchaou", amount: 8.5, cnam: false, avatar: "MS", type: "full" },
  { id: "DEL-074", patient: "Amine Ben Ali", prescription: "ORD-2026-035", items: ["Metformine 850mg", "Glibenclamide 5mg"], date: "17 Fév 2026", time: "11:20", pharmacist: "S. Maalej", amount: 45, cnam: true, avatar: "AB", type: "full" },
  { id: "DEL-073", patient: "Fatma Trabelsi", prescription: "ORD-2026-033", items: ["Amlodipine 10mg", "Bisoprolol 5mg"], date: "16 Fév 2026", time: "15:30", pharmacist: "A. Kchaou", amount: 38, cnam: true, avatar: "FT", type: "partial" },
  { id: "DEL-072", patient: "Nadia Jemni", prescription: "ORD-2026-030", items: ["Doliprane 1g"], date: "15 Fév 2026", time: "10:00", pharmacist: "S. Maalej", amount: 4.5, cnam: true, avatar: "NJ", type: "full" },
  { id: "DEL-071", patient: "Karim Mansour", prescription: "ORD-2026-028", items: ["Augmentin 1g", "Nifuroxazide 200mg"], date: "14 Fév 2026", time: "14:15", pharmacist: "A. Kchaou", amount: 25, cnam: false, avatar: "KM", type: "full" },
];

// ─── Laboratory Analyses (full detail) ───────────────────────

export interface LabAnalysis {
  id: string; patient: string; type: string; doctor: string; date: string;
  status: string; amount: string; cnam: boolean; avatar: string; priority: string;
}

export const mockLabAnalysesDetail: LabAnalysis[] = [
  { id: "ANA-001", patient: "Amine Ben Ali", type: "Bilan sanguin complet", doctor: "Dr. Bouazizi", date: "20 Fév 2026", status: "in_progress", amount: "85 DT", cnam: true, avatar: "AB", priority: "normal" },
  { id: "ANA-002", patient: "Fatma Trabelsi", type: "Analyse d'urine", doctor: "Dr. Gharbi", date: "19 Fév 2026", status: "ready", amount: "35 DT", cnam: true, avatar: "FT", priority: "normal" },
  { id: "ANA-003", patient: "Mohamed Sfar", type: "TSH - Thyroïde", doctor: "Dr. Hammami", date: "20 Fév 2026", status: "waiting", amount: "45 DT", cnam: false, avatar: "MS", priority: "urgent" },
  { id: "ANA-004", patient: "Nadia Jemni", type: "Glycémie à jeun", doctor: "Dr. Bouazizi", date: "18 Fév 2026", status: "ready", amount: "25 DT", cnam: true, avatar: "NJ", priority: "normal" },
  { id: "ANA-005", patient: "Sami Ayari", type: "Hémogramme (NFS)", doctor: "Dr. Bouazizi", date: "20 Fév 2026", status: "in_progress", amount: "40 DT", cnam: true, avatar: "SA", priority: "normal" },
  { id: "ANA-006", patient: "Rania Meddeb", type: "Bilan lipidique", doctor: "Dr. Bouazizi", date: "17 Fév 2026", status: "ready", amount: "55 DT", cnam: true, avatar: "RM", priority: "normal" },
];

export const mockLabAnalysisTypes = ["Bilan sanguin complet", "NFS (Hémogramme)", "Glycémie à jeun", "HbA1c", "Bilan lipidique", "TSH", "Bilan hépatique", "Bilan rénal", "CRP", "Analyse d'urine", "Vitamine D", "Sérologie"];

// ─── Laboratory Results ──────────────────────────────────────

export interface LabResultValue { name: string; value: string; ref: string; status: string; }
export interface LabResult {
  id: string; analysis: string; patient: string; type: string; date: string;
  doctor: string; sent: boolean; amount: string; cnam: boolean; avatar: string;
  values: LabResultValue[];
}

export const mockLabResults: LabResult[] = [
  {
    id: "RES-001", analysis: "ANA-002", patient: "Fatma Trabelsi", type: "Analyse d'urine", date: "19 Fév 2026",
    doctor: "Dr. Gharbi", sent: true, amount: "35 DT", cnam: true, avatar: "FT",
    values: [
      { name: "pH", value: "6.5", ref: "5.0 - 8.0", status: "normal" },
      { name: "Protéines", value: "Négatif", ref: "Négatif", status: "normal" },
      { name: "Glucose", value: "Négatif", ref: "Négatif", status: "normal" },
      { name: "Leucocytes", value: "Négatif", ref: "Négatif", status: "normal" },
    ],
  },
  {
    id: "RES-002", analysis: "ANA-004", patient: "Nadia Jemni", type: "Glycémie à jeun", date: "18 Fév 2026",
    doctor: "Dr. Bouazizi", sent: false, amount: "25 DT", cnam: true, avatar: "NJ",
    values: [{ name: "Glycémie", value: "1.32 g/L", ref: "0.70 - 1.10 g/L", status: "high" }],
  },
  {
    id: "RES-003", analysis: "ANA-006", patient: "Rania Meddeb", type: "Bilan lipidique", date: "17 Fév 2026",
    doctor: "Dr. Bouazizi", sent: true, amount: "55 DT", cnam: true, avatar: "RM",
    values: [
      { name: "Cholestérol total", value: "2.40 g/L", ref: "< 2.00 g/L", status: "high" },
      { name: "HDL", value: "0.55 g/L", ref: "> 0.40 g/L", status: "normal" },
      { name: "LDL", value: "1.60 g/L", ref: "< 1.30 g/L", status: "high" },
      { name: "Triglycérides", value: "1.20 g/L", ref: "< 1.50 g/L", status: "normal" },
    ],
  },
];

// ─── Admin Logs ──────────────────────────────────────────────

export const mockAdminLogs = [
  { id: 1, time: "20 Fév 09:45", user: "Dr. Bouazizi", action: "Connexion", detail: "Connexion réussie depuis 196.203.xx.xx", level: "info" },
  { id: 2, time: "20 Fév 09:42", user: "Admin", action: "Validation compte", detail: "Dr. Karim Bouzid — Cardiologue approuvé", level: "info" },
  { id: 3, time: "20 Fév 09:38", user: "Système", action: "Alerte sécurité", detail: "3 tentatives de connexion échouées — IP 41.226.xx.xx", level: "security" },
  { id: 4, time: "20 Fév 09:30", user: "Dr. Gharbi", action: "Modification profil", detail: "Mise à jour des horaires d'ouverture", level: "info" },
  { id: 5, time: "20 Fév 09:15", user: "Admin", action: "Suspension compte", detail: "Dr. Fathi Mejri — Profil signalé pour fraude", level: "warning" },
  { id: 6, time: "20 Fév 09:10", user: "Pharmacie El Amal", action: "Inscription", detail: "Nouvelle inscription — En attente de validation", level: "info" },
  { id: 7, time: "20 Fév 09:00", user: "Système", action: "Sauvegarde automatique", detail: "Base de données sauvegardée avec succès", level: "info" },
  { id: 8, time: "20 Fév 08:55", user: "Admin", action: "Rejet inscription", detail: "Labo XYZ — Documents non conformes", level: "warning" },
  { id: 9, time: "19 Fév 22:00", user: "Système", action: "Maintenance planifiée", detail: "Nettoyage des sessions expirées", level: "info" },
  { id: 10, time: "19 Fév 18:30", user: "Patient inconnu", action: "Tentative d'accès", detail: "Accès refusé — Token expiré", level: "error" },
  { id: 11, time: "19 Fév 17:00", user: "Admin", action: "Export données", detail: "Export CSV des utilisateurs actifs", level: "info" },
  { id: 12, time: "19 Fév 15:30", user: "Dr. Hammami", action: "Suppression RDV", detail: "Annulation du RDV #4532", level: "warning" },
];

// ─── Partner Pharmacies (Patient Prescriptions) ──────────────

export interface PartnerPharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  openNow: boolean;
  rating: number;
}

export const mockPartnerPharmacies: PartnerPharmacy[] = [
  { id: "ph1", name: "Pharmacie El Amal", address: "12 Av. Habib Bourguiba, El Manar", distance: "0.3 km", phone: "+216 71 234 567", openNow: true, rating: 4.7 },
  { id: "ph2", name: "Pharmacie Pasteur", address: "45 Rue Pasteur, Centre Ville", distance: "1.2 km", phone: "+216 71 345 678", openNow: true, rating: 4.5 },
  { id: "ph3", name: "Pharmacie El Manar", address: "3 Rue de la Liberté, El Manar", distance: "0.5 km", phone: "+216 71 456 789", openNow: false, rating: 4.8 },
  { id: "ph4", name: "Pharmacie Ibn Sina", address: "20 Av. de la République, Bardo", distance: "2.1 km", phone: "+216 71 567 890", openNow: true, rating: 4.3 },
  { id: "ph5", name: "Pharmacie Centrale", address: "1 Place de la Victoire, Tunis", distance: "3.0 km", phone: "+216 71 678 901", openNow: true, rating: 4.6 },
  { id: "ph6", name: "Pharmacie de Nuit Tunis", address: "8 Rue de Hollande, Tunis", distance: "2.5 km", phone: "+216 71 789 012", openNow: true, rating: 4.2 },
];

// ─── Secretary Cabinet Chat Contacts ─────────────────────────

export const mockSecretaryCabinetContacts: ChatContact[] = [
  { id: "sc1", name: "Chat du cabinet", role: "Dr. Bouazizi · Dr. Gharbi · Dr. Hammami", avatar: "CB", lastMessage: "Le patient de 14h30 a annulé.", time: "11:15", unread: 2, online: true },
  { id: "sc2", name: "Dr. Ahmed Bouazizi", role: "Médecin généraliste", avatar: "AB", lastMessage: "Merci pour la mise à jour du planning.", time: "10:45", unread: 0, online: true },
  { id: "sc3", name: "Dr. Sonia Gharbi", role: "Cardiologue", avatar: "SG", lastMessage: "Le patient Trabelsi est arrivé ?", time: "09:30", unread: 1, online: false },
];

// ─── Consultation Workbench Mocks ─────────────────────────────

export interface RxFavorite {
  label: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export const mockRxFavorites: RxFavorite[] = [
  { label: "Paracétamol 1g", dosage: "1 cp x3/j", duration: "3 jours", instructions: "Si douleur/fièvre" },
  { label: "Amoxicilline 1g", dosage: "1 cp x2/j", duration: "6 jours", instructions: "Selon indication" },
  { label: "IPP (Oméprazole 20mg)", dosage: "1 gélule/j", duration: "14 jours", instructions: "Le matin à jeun" },
];

export interface PastConsult {
  date: string;
  motif: string;
  notes: string;
  prescriptions: number;
}

export const mockPastConsults: PastConsult[] = [
  { date: "15 Jan 2026", motif: "Suivi diabète", notes: "HbA1c à 7.1%. Bonne observance. Maintien traitement.", prescriptions: 1 },
  { date: "10 Oct 2025", motif: "Contrôle glycémie", notes: "Glycémie à jeun 1.15g/L. Ajustement posologie Metformine.", prescriptions: 1 },
  { date: "5 Juil 2025", motif: "Bilan annuel", notes: "Bilan complet. Fonction rénale normale. Fond d'œil RAS.", prescriptions: 2 },
];

export const mockLabSuggestionsBase = ["NFS", "CRP", "Ionogramme", "Créatinine", "TSH", "Bilan lipidique"];
export const mockLabSuggestionsDT2 = ["HbA1c", "Glycémie à jeun", "Microalbuminurie", "Bilan lipidique", "Créatinine"];
export const mockLabSuggestionsAngine = ["TDR streptocoque", "CRP", "NFS"];

// ─── Consultation Workbench Initial Values ───────────────────

export interface ConsultationPrescriptionItem {
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export const mockConsultationInitialVitals = {
  systolic: "130", diastolic: "80", heartRate: "72", temperature: "37.0",
  weight: "75", oxygenSat: "98", height: "175", respiratoryRate: "16",
};

export const mockConsultationInitialNotes = {
  motif: "Suivi diabète de type 2",
  symptoms: "Patient se plaint de fatigue accrue depuis 2 semaines. Pas de douleurs particulières. Sommeil perturbé.",
  examination: "Examen clinique normal. Abdomen souple, pas de masse palpable. Auscultation pulmonaire claire. Pas d'œdème des MI.",
  diagnosis: "Diabète de type 2 équilibré. Asthénie à surveiller.",
  conclusion: "Maintien du traitement actuel. Contrôle HbA1c dans 3 mois. Hygiène de vie : activité physique régulière recommandée.",
};

export const mockConsultationInitialPrescription: ConsultationPrescriptionItem[] = [
  { medication: "Metformine 850mg", dosage: "1 comprimé matin et soir", duration: "3 mois", instructions: "Pendant les repas" },
  { medication: "Glibenclamide 5mg", dosage: "1 comprimé le matin", duration: "3 mois", instructions: "Avant le petit déjeuner" },
];

export const mockConsultationInitialAnalyses = ["HbA1c", "Glycémie à jeun"];

export interface ConsultationTemplate {
  key: string;
  label: string;
  motif: string;
  symptoms: string;
  examination: string;
  diagnosis: string;
  conclusion: string;
  extraAnalyses?: string[];
  defaultDockTab: "rx" | "labs" | "docs" | "tasks";
}

export const mockConsultationTemplates: ConsultationTemplate[] = [
  {
    key: "dt2", label: "Suivi diabète T2", defaultDockTab: "rx",
    motif: "Suivi diabète de type 2",
    symptoms: "Observance traitement : oui. Fatigue intermittente. Alimentation à rééquilibrer. Activité physique : irrégulière.",
    examination: "TA correcte. Auscultation cardio-pulmonaire RAS. Pas d'œdème. Pied diabétique : pas de lésion.",
    diagnosis: "Diabète T2 — suivi. Objectifs glycémie à rappeler.",
    conclusion: "Renforcer hygiène de vie. Prescrire HbA1c + bilan lipidique. Contrôle dans 3 mois.",
    extraAnalyses: ["HbA1c", "Bilan lipidique", "Créatinine"],
  },
  {
    key: "hta", label: "HTA — contrôle", defaultDockTab: "rx",
    motif: "Contrôle hypertension",
    symptoms: "Pas de céphalées. Pas de douleur thoracique. Bonne tolérance du traitement.",
    examination: "TA à contrôler en automesure. Auscultation RAS. Pas d'œdème.",
    diagnosis: "Hypertension artérielle — suivi.",
    conclusion: "Poursuite traitement. Bilan rénal/ionogramme si besoin. Contrôle dans 1–3 mois.",
  },
  {
    key: "angine", label: "Angine", defaultDockTab: "labs",
    motif: "Odynophagie / suspicion angine",
    symptoms: "Mal de gorge depuis 48h. Fièvre ? À préciser. Pas de dyspnée.",
    examination: "Examen ORL : amygdales inflammatoires. Adénopathies cervicales ? À préciser.",
    diagnosis: "Angine (à confirmer). Tests rapides si disponible.",
    conclusion: "Traitement symptomatique. ATB si critères / test positif. Surveillance 48–72h.",
  },
];


// ─── Lab Panels (Patient Detail) ─────────────────────────────

export interface LabPanel {
  key: string;
  label: string;
  hint?: string;
}

export const mockLabPanels: LabPanel[] = [
  { key: "nfs", label: "NFS", hint: "Bilan sanguin" },
  { key: "gly", label: "Glycémie", hint: "à jeun" },
  { key: "hba1c", label: "HbA1c", hint: "3 mois" },
  { key: "lip", label: "Bilan lipidique", hint: "cholestérol" },
  { key: "crp", label: "CRP", hint: "inflammation" },
  { key: "tsh", label: "TSH", hint: "thyroïde" },
  { key: "iono", label: "Ionogramme", hint: "Na/K/Cl" },
  { key: "creat", label: "Créatinine", hint: "fonction rénale" },
];

// ─── Doc Template Helpers ────────────────────────────────────

export const getDocTemplateText = (template: string, patientName: string): string => {
  const date = new Date().toLocaleDateString();
  switch (template) {
    case "certificate":
      return `Je soussigné(e), Dr. ________, certifie avoir examiné ${patientName} en date du ${date}.\n\nConclusion : ________.\n\nFait pour servir et valoir ce que de droit.`;
    case "referral":
      return `Cher/Chère confrère/consœur,\n\nJe vous adresse ${patientName} pour avis spécialisé concernant : ________.\n\nContexte / éléments cliniques :\n- ________\n\nJe vous remercie par avance.\n\nCordialement,\nDr. ________`;
    case "sickleave":
      return `Je soussigné(e), Dr. ________, certifie que l'état de santé de ${patientName} nécessite un arrêt de travail du __/__/____ au __/__/____.\n\nMotif (optionnel) : ________.\n\nFait à ________, le ${date}.`;
    case "report":
    default:
      return `Compte-rendu de consultation — ${date}\n\nMotif : ________.\n\nExamen / Synthèse :\n- ________\n\nConclusion / Conduite à tenir :\n- ________`;
  }
};

export const mockSecretaryCabinetMessages: Record<string, ChatMessage[]> = {
  "sc1": [
    { id: "1", sender: "them", text: "Le patient de 14h30 a appelé pour annuler.", time: "11:00", senderName: "Dr. Bouazizi" },
    { id: "2", sender: "me", text: "D'accord, j'essaie de placer un patient en liste d'attente.", time: "11:10" },
    { id: "3", sender: "them", text: "Le patient de 14h30 a annulé.", time: "11:15", senderName: "Dr. Gharbi" },
  ],
  "sc2": [
    { id: "1", sender: "them", text: "Bonjour, est-ce que le patient Ben Ali est arrivé ?", time: "09:15" },
    { id: "2", sender: "me", text: "Oui docteur, il est en salle d'attente depuis 09:15.", time: "09:20" },
    { id: "3", sender: "them", text: "Merci pour la mise à jour du planning.", time: "10:45" },
  ],
};
