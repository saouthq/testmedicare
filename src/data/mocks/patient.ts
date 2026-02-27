/**
 * Mock data — Patient domain
 */
import type { Patient, PatientAppointment, PastAppointment, CancelledAppointment, HealthDocument, Antecedent, Treatment, Allergy, Habit, FamilyHistory, Surgery, Vaccination, HealthMeasure, PartnerPharmacy } from "@/types";
import type { Prescription, Notification, ChatMessage, ChatContact } from "@/types";

// ─── Patients ────────────────────────────────────────────────

export const mockPatients: Patient[] = [
  { id: 1, name: "Amine Ben Ali", age: 34, gender: "Homme", dob: "15/03/1991", phone: "+216 22 345 678", email: "amine@email.tn", address: "El Manar, Tunis", avatar: "AB", bloodType: "A+", ssn: "1 91 03 75 012 035 42", mutuelle: "Assurances Maghrebia", cnamId: "12345678", treatingDoctor: "Dr. Ahmed Bouazizi", registeredSince: "Jan 2022", allergies: [{ name: "Pénicilline", severity: "Sévère", reaction: "Réaction cutanée sévère" }], conditions: ["Diabète type 2"], chronicConditions: ["Diabète type 2"], lastVisit: "10 Fév 2026", nextAppointment: "20 Fév 14:30", isNew: false, lastVitals: { ta: "13/8", glycemia: "1.05" }, gouvernorat: "Tunis", balance: 0, notes: "Suivi diabète régulier" },
  { id: 2, name: "Fatma Trabelsi", age: 56, gender: "Femme", dob: "12/07/1970", phone: "+216 55 987 654", email: "fatma@email.tn", address: "Ariana", avatar: "FT", bloodType: "O+", ssn: "2 70 07 75 023 045 53", mutuelle: "CNAM", cnamId: "23456789", treatingDoctor: "Dr. Sonia Gharbi", registeredSince: "Mar 2021", allergies: [], conditions: ["Hypertension", "Cholestérol"], chronicConditions: ["Hypertension", "Cholestérol"], lastVisit: "8 Fév 2026", nextAppointment: "23 Fév 10:00", isNew: false, lastVitals: { ta: "14/8", glycemia: "0.95" }, gouvernorat: "Ariana", balance: 60, notes: "Hypertension — suivi cardio" },
  { id: 3, name: "Mohamed Sfar", age: 28, gender: "Homme", dob: "05/01/1998", phone: "+216 55 456 789", email: "med@email.tn", address: "Ben Arous", avatar: "MS", bloodType: "B+", ssn: "1 98 01 75 034 056 64", mutuelle: "Privée", cnamId: "—", treatingDoctor: "Dr. Ahmed Bouazizi", registeredSince: "Sep 2024", allergies: [{ name: "Aspirine", severity: "Modéré", reaction: "Troubles gastriques" }], conditions: [], chronicConditions: [], lastVisit: "5 Fév 2026", nextAppointment: "25 Fév 09:30", isNew: false, lastVitals: { ta: "11/7", glycemia: "0.88" }, gouvernorat: "Ben Arous", balance: 0, notes: "Suivi post-opératoire" },
  { id: 4, name: "Nadia Jemni", age: 67, gender: "Femme", dob: "18/11/1959", phone: "+216 98 567 890", email: "nadia@email.tn", address: "Manouba", avatar: "NJ", bloodType: "A-", ssn: "2 59 11 75 045 067 75", mutuelle: "CNAM", cnamId: "34567890", treatingDoctor: "Dr. Khaled Hammami", registeredSince: "Jun 2020", allergies: [], conditions: ["Arthrose", "HTA"], chronicConditions: ["Arthrose", "HTA"], lastVisit: "1 Fév 2026", nextAppointment: null, isNew: false, lastVitals: { ta: "15/9", glycemia: "1.10" }, gouvernorat: "Manouba", balance: 25, notes: "Arthrose — anti-inflammatoires" },
  { id: 5, name: "Sami Ayari", age: 42, gender: "Homme", dob: "22/06/1984", phone: "+216 29 678 901", email: "sami@email.tn", address: "Tunis", avatar: "SA", bloodType: "AB+", ssn: "1 84 06 75 056 078 86", mutuelle: "CNAM", cnamId: "45678901", treatingDoctor: "Dr. Ahmed Bouazizi", registeredSince: "Nov 2022", allergies: [{ name: "Acariens", severity: "Modéré", reaction: "Rhinite allergique" }], conditions: ["Asthme"], chronicConditions: ["Asthme"], lastVisit: "28 Jan 2026", nextAppointment: null, isNew: false, lastVitals: { ta: "12/7", glycemia: "0.92" }, gouvernorat: "Tunis", balance: 0, notes: "Asthme léger" },
  { id: 6, name: "Rania Meddeb", age: 51, gender: "Femme", dob: "03/04/1975", phone: "+216 52 789 012", email: "rania@email.tn", address: "Lac", avatar: "RM", bloodType: "O-", ssn: "2 75 04 75 067 089 97", mutuelle: "CNAM", cnamId: "56789012", treatingDoctor: "Dr. Sonia Gharbi", registeredSince: "Fév 2026", allergies: [], conditions: [], chronicConditions: [], lastVisit: null, nextAppointment: "28 Fév 14:00", isNew: true, lastVitals: { ta: "—", glycemia: "—" }, gouvernorat: "Tunis", balance: 0, notes: "Nouveau patient" },
];

// ─── Favorite Doctors ────────────────────────────────────────

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

export const mockPatientPrescriptions: Prescription[] = [
  { id: "ORD-2026-045", doctor: "Dr. Bouazizi", date: "10 Fév 2026", items: ["Metformine 850mg - 2x/jour", "Glibenclamide 5mg - 1x/jour"], status: "active", total: "45 DT", cnam: true, pharmacy: null },
  { id: "ORD-2026-042", doctor: "Dr. Gharbi", date: "3 Fév 2026", items: ["Amlodipine 10mg - 1x/jour"], status: "active", total: "28 DT", cnam: true, pharmacy: "Pharmacie El Amal" },
  { id: "ORD-2025-038", doctor: "Dr. Hammami", date: "15 Déc 2025", items: ["Crème dermocorticoïde", "Lotion hydratante"], status: "expired", total: "35 DT", cnam: true, pharmacy: "Pharmacie Pasteur" },
  { id: "ORD-2025-032", doctor: "Dr. Bouazizi", date: "20 Nov 2025", items: ["Oméprazole 20mg", "Gaviscon"], status: "expired", total: "22 DT", cnam: false, pharmacy: "Pharmacie Pasteur" },
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

// ─── Health Data ─────────────────────────────────────────────

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

// ─── AI Chat (Patient) ──────────────────────────────────────

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

// ─── Partner Pharmacies ──────────────────────────────────────

export const mockPartnerPharmacies: PartnerPharmacy[] = [
  { id: "ph1", name: "Pharmacie El Amal", address: "12 Av. Habib Bourguiba, El Manar", distance: "0.3 km", phone: "+216 71 234 567", openNow: true, rating: 4.7 },
  { id: "ph2", name: "Pharmacie Pasteur", address: "45 Rue Pasteur, Centre Ville", distance: "1.2 km", phone: "+216 71 345 678", openNow: true, rating: 4.5 },
  { id: "ph3", name: "Pharmacie El Manar", address: "3 Rue de la Liberté, El Manar", distance: "0.5 km", phone: "+216 71 456 789", openNow: false, rating: 4.8 },
  { id: "ph4", name: "Pharmacie Ibn Sina", address: "20 Av. de la République, Bardo", distance: "2.1 km", phone: "+216 71 567 890", openNow: true, rating: 4.3 },
  { id: "ph5", name: "Pharmacie Centrale", address: "1 Place de la Victoire, Tunis", distance: "3.0 km", phone: "+216 71 678 901", openNow: true, rating: 4.6 },
  { id: "ph6", name: "Pharmacie de Nuit Tunis", address: "8 Rue de Hollande, Tunis", distance: "2.5 km", phone: "+216 71 789 012", openNow: true, rating: 4.2 },
];
