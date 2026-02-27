/**
 * Mock data — Doctor domain
 */
import type { Doctor, DoctorScheduleItem, WaitingRoomEntry, UrgentAlert, DoctorConsultation, VitalsEntry, AnalysisResult, ScheduleAppointment, TeleconsultTransaction, SubscriptionInvoice } from "@/types";
import type { StatsCard, ChartDataPoint, ChatContact, ChatMessage } from "@/types";
import type { Prescription, RxFavorite, ConsultationPrescriptionItem } from "@/types";
import type { PastConsult, ConsultationTemplate } from "@/types";
import type { LabPanel } from "@/types";

// ─── Doctors (Search / Public) ───────────────────────────────

export const mockDoctors: Doctor[] = [
  { id: 1, name: "Dr. Ahmed Bouazizi", specialty: "Médecin généraliste", address: "15 Av. de la Liberté, El Manar, 2092 Tunis", distance: "0.8 km", phone: "+216 71 234 567", rating: 4.8, reviews: 234, nextSlot: "Aujourd'hui 14:30", avatar: "AB", price: 35, languages: ["Français", "Arabe"], teleconsultation: true, cnam: true, availAM: [true, true, false, true, false, true, false], availPM: [true, false, false, true, true, false, false] },
  { id: 2, name: "Dr. Sonia Gharbi", specialty: "Cardiologue", address: "32 Rue Charles de Gaulle, 2080 Ariana", distance: "2.3 km", phone: "+216 71 234 568", rating: 4.9, reviews: 187, nextSlot: "Demain 09:00", avatar: "SG", price: 60, languages: ["Français", "Arabe"], teleconsultation: false, cnam: true, availAM: [false, true, true, false, false, false, false], availPM: [false, false, false, false, true, false, false] },
  { id: 3, name: "Dr. Khaled Hammami", specialty: "Dermatologue", address: "8 Boulevard Bab Bnet, 1006 Tunis", distance: "1.5 km", phone: "+216 71 234 569", rating: 4.7, reviews: 156, nextSlot: "23 Fév 10:30", avatar: "KH", price: 50, languages: ["Français", "Arabe", "Anglais"], teleconsultation: true, cnam: true, availAM: [false, false, false, true, false, true, false], availPM: [false, false, false, false, true, false, false] },
  { id: 4, name: "Dr. Leila Chebbi", specialty: "Ophtalmologue", address: "45 Av. Habib Bourguiba, 4000 Sousse", distance: "3.1 km", phone: "+216 73 456 789", rating: 4.6, reviews: 98, nextSlot: "24 Fév 11:00", avatar: "LC", price: 45, languages: ["Français", "Arabe"], teleconsultation: true, cnam: false, availAM: [false, false, false, false, false, false, false], availPM: [false, false, false, false, false, false, false] },
  { id: 5, name: "Dr. Nabil Karray", specialty: "Pédiatre", address: "22 Rue de Marseille, 1002 Tunis", distance: "1.2 km", phone: "+216 71 567 890", rating: 4.9, reviews: 312, nextSlot: "Aujourd'hui 16:00", avatar: "NK", price: 40, languages: ["Français", "Arabe", "Anglais"], teleconsultation: true, cnam: true, availAM: [false, false, true, false, false, true, false], availPM: [true, false, false, true, false, false, false] },
  { id: 6, name: "Dr. Ines Mansour", specialty: "Gynécologue", address: "10 Rue du Lac Constance, Les Berges du Lac", distance: "4.0 km", phone: "+216 71 678 901", rating: 4.8, reviews: 421, nextSlot: "25 Fév 09:30", avatar: "IM", price: 70, languages: ["Français", "Arabe"], teleconsultation: true, cnam: true, availAM: [false, false, false, false, false, false, false], availPM: [false, false, false, false, false, false, false] },
];

// ─── Doctor Public Profile ───────────────────────────────────

export const mockDoctorProfile = {
  name: "Dr. Ahmed Bouazizi",
  specialty: "Médecin généraliste",
  subSpecialties: ["Diabétologie", "Médecine du sport"],
  initials: "AB",
  reviewCount: 127,
  verifiedReviewCount: 122,
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
  { author: "Amine B.", date: "10 Fév 2026", text: "Très bon médecin, à l'écoute et professionnel.", helpful: 12, verified: true },
  { author: "Fatma T.", date: "5 Fév 2026", text: "Ponctuel et efficace. Explique bien les traitements.", helpful: 8, verified: true },
  { author: "Mohamed S.", date: "28 Jan 2026", text: "Bon suivi médical, cabinet propre et moderne.", helpful: 5, verified: true },
  { author: "Nadia J.", date: "20 Jan 2026", text: "Excellent suivi pour mon diabète.", helpful: 15, verified: true },
  { author: "Sami A.", date: "15 Jan 2026", text: "Bonne consultation, docteur à l'écoute.", helpful: 3, verified: false },
];

export const mockFaqItems = [
  { q: "Comment se déroule une première consultation ?", a: "La première consultation dure environ 45 minutes. Elle comprend un entretien approfondi sur vos antécédents médicaux, un examen clinique complet et si nécessaire, des examens complémentaires." },
  { q: "Prenez-vous la CNAM ?", a: "Oui, le cabinet est conventionné CNAM Secteur 1. Le tiers payant est pratiqué." },
  { q: "Faites-vous des téléconsultations ?", a: "Oui, je propose des téléconsultations vidéo pour le suivi de maladies chroniques et le renouvellement d'ordonnances." },
  { q: "Quel est le délai moyen pour obtenir un RDV ?", a: "Le délai moyen est de 2 à 3 jours ouvrés. Pour les urgences, des créneaux sont réservés chaque jour." },
];

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

export const mockUrgentAlerts: (UrgentAlert & { link?: string })[] = [
  { type: "result", patient: "Fatma Trabelsi", text: "Résultats analyses — Cholestérol élevé", severity: "high", link: "/dashboard/doctor/patients/2" },
  { type: "message", patient: "Amine Ben Ali", text: "Question sur posologie Metformine", severity: "normal", link: "/dashboard/doctor/messages" },
];

// ─── Doctor Consultations ────────────────────────────────────

export const mockDoctorConsultations: DoctorConsultation[] = [
  { id: 1, patient: "Amine Ben Ali", date: "20 Fév 2026", time: "09:30", motif: "Suivi diabète", notes: "Glycémie stable, renouvellement traitement", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "AB", status: "completed" },
  { id: 2, patient: "Fatma Trabelsi", date: "20 Fév 2026", time: "09:00", motif: "Contrôle tension", notes: "TA 14/8, ajustement posologie", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "FT", status: "completed" },
  { id: 3, patient: "Mohamed Sfar", date: "18 Fév 2026", time: "14:00", motif: "Suivi post-opératoire", notes: "Cicatrisation normale, retrait fils J+15", prescriptions: 0, cnam: false, amount: "50 DT", avatar: "MS", status: "completed" },
  { id: 4, patient: "Nadia Jemni", date: "17 Fév 2026", time: "10:30", motif: "Douleurs articulaires", notes: "Prescription anti-inflammatoires", prescriptions: 2, cnam: true, amount: "35 DT", avatar: "NJ", status: "completed" },
  { id: 5, patient: "Sami Ayari", date: "15 Fév 2026", time: "11:00", motif: "Renouvellement ordonnance", notes: "Ventoline + Seretide renouvelés pour 3 mois", prescriptions: 1, cnam: true, amount: "35 DT", avatar: "SA", status: "completed" },
];

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

// ─── Doctor Prescriptions ────────────────────────────────────

export const mockDoctorPrescriptions: Prescription[] = [
  { id: "ORD-2026-045", doctor: "Dr. Bouazizi", patient: "Amine Ben Ali", date: "20 Fév 2026", items: ["Metformine 850mg - 2x/jour", "Glibenclamide 5mg - 1x/jour"], status: "active", total: "45 DT", cnam: true, pharmacy: null, sent: true },
  { id: "ORD-2026-044", doctor: "Dr. Bouazizi", patient: "Fatma Trabelsi", date: "20 Fév 2026", items: ["Amlodipine 10mg - 1x/jour"], status: "active", total: "28 DT", cnam: true, pharmacy: null, sent: true },
  { id: "ORD-2026-043", doctor: "Dr. Bouazizi", patient: "Nadia Jemni", date: "17 Fév 2026", items: ["Ibuprofène 400mg - 3x/jour pendant 7 jours", "Tramadol 50mg - si douleur intense"], status: "active", total: "35 DT", cnam: true, pharmacy: null, sent: false },
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

// ─── AI Chat (Doctor) ────────────────────────────────────────

export const mockAiInitialMessages: ChatMessage[] = [
  { id: "1", sender: "ai", text: "Bonjour Dr. Bouazizi ! Je suis votre assistant IA Medicare. Comment puis-je vous aider ? Je peux vous aider avec des informations médicales, des protocoles ou des interactions médicamenteuses.", time: "—" },
];

export const mockAiResponses = [
  "D'après les dernières recommandations HAS (2025), pour un patient diabétique de type 2 avec HbA1c entre 7% et 8%, le traitement de première intention reste la Metformine. Si les objectifs ne sont pas atteints après 3-6 mois, l'ajout d'un inhibiteur SGLT2 ou d'un agoniste GLP-1 est recommandé, surtout en cas de risque cardiovasculaire.",
  "Interaction potentielle détectée : l'association Metformine + AINS (ibuprofène) peut augmenter le risque d'acidose lactique, surtout en cas d'insuffisance rénale. Alternative recommandée : Paracétamol.",
  "Je vous recommande de vérifier la clairance de la créatinine avant de prescrire. Pour plus de précisions, consultez le Vidal ou le CRAT.",
];

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

// ─── Consultation Workbench ──────────────────────────────────

export const mockRxFavorites: RxFavorite[] = [
  { label: "Paracétamol 1g", dosage: "1 cp x3/j", duration: "3 jours", instructions: "Si douleur/fièvre" },
  { label: "Amoxicilline 1g", dosage: "1 cp x2/j", duration: "6 jours", instructions: "Selon indication" },
  { label: "IPP (Oméprazole 20mg)", dosage: "1 gélule/j", duration: "14 jours", instructions: "Le matin à jeun" },
];

export const mockPastConsults: PastConsult[] = [
  { date: "15 Jan 2026", motif: "Suivi diabète", notes: "HbA1c à 7.1%. Bonne observance. Maintien traitement.", prescriptions: 1 },
  { date: "10 Oct 2025", motif: "Contrôle glycémie", notes: "Glycémie à jeun 1.15g/L. Ajustement posologie Metformine.", prescriptions: 1 },
  { date: "5 Juil 2025", motif: "Bilan annuel", notes: "Bilan complet. Fonction rénale normale. Fond d'œil RAS.", prescriptions: 2 },
];

export const mockLabSuggestionsBase = ["NFS", "CRP", "Ionogramme", "Créatinine", "TSH", "Bilan lipidique"];
export const mockLabSuggestionsDT2 = ["HbA1c", "Glycémie à jeun", "Microalbuminurie", "Bilan lipidique", "Créatinine"];
export const mockLabSuggestionsAngine = ["TDR streptocoque", "CRP", "NFS"];

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
