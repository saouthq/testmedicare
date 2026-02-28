/**
 * Mock data — Secretary domain
 */
import type { ChatContact, ChatMessage } from "@/types";

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

/** Full patient data with id and history — used by SecretaryPatients page */
export const mockSecretaryPatientsWithHistory = [
  {
    id: 1, name: "Amine Ben Ali", phone: "+216 71 234 567", email: "amine@email.tn",
    lastVisit: "20 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: "28 Fév 14:30",
    cnamId: "12345678", assurance: "CNAM", dob: "15/03/1991", avatar: "AB",
    balance: 0, notes: "Suivi diabète régulier", gouvernorat: "Tunis",
    history: [
      { date: "20 Fév 2026", type: "Consultation", doctor: "Dr. Bouazizi", motif: "Suivi diabète", amount: "35 DT", paid: true },
      { date: "10 Jan 2026", type: "Contrôle", doctor: "Dr. Bouazizi", motif: "Bilan annuel", amount: "35 DT", paid: true },
      { date: "15 Nov 2025", type: "Consultation", doctor: "Dr. Gharbi", motif: "ECG contrôle", amount: "50 DT", paid: true },
    ],
  },
  {
    id: 2, name: "Fatma Trabelsi", phone: "+216 22 345 678", email: "fatma@email.tn",
    lastVisit: "18 Fév 2026", doctor: "Dr. Gharbi", nextAppointment: "25 Fév 10:00",
    cnamId: "23456789", assurance: "CNAM", dob: "12/07/1970", avatar: "FT",
    balance: 60, notes: "Hypertension — suivi cardio", gouvernorat: "Ariana",
    history: [
      { date: "18 Fév 2026", type: "Suivi", doctor: "Dr. Gharbi", motif: "Tension artérielle", amount: "50 DT", paid: false },
      { date: "5 Jan 2026", type: "Consultation", doctor: "Dr. Gharbi", motif: "Bilan cardio", amount: "50 DT", paid: true },
    ],
  },
  {
    id: 3, name: "Mohamed Sfar", phone: "+216 55 456 789", email: "med@email.tn",
    lastVisit: "15 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: null as string | null,
    cnamId: "—", assurance: "Privée", dob: "05/01/1998", avatar: "MS",
    balance: 0, notes: "Suivi post-opératoire", gouvernorat: "Ben Arous",
    history: [
      { date: "15 Fév 2026", type: "Contrôle", doctor: "Dr. Bouazizi", motif: "Post-opératoire", amount: "35 DT", paid: true },
    ],
  },
  {
    id: 4, name: "Nadia Jemni", phone: "+216 98 567 890", email: "nadia@email.tn",
    lastVisit: "10 Fév 2026", doctor: "Dr. Hammami", nextAppointment: "3 Mar 09:00",
    cnamId: "34567890", assurance: "CNAM", dob: "18/11/1959", avatar: "NJ",
    balance: 25, notes: "Arthrose — anti-inflammatoires", gouvernorat: "Manouba",
    history: [
      { date: "10 Fév 2026", type: "Consultation", doctor: "Dr. Hammami", motif: "Douleurs articulaires", amount: "45 DT", paid: false },
    ],
  },
  {
    id: 5, name: "Sami Ayari", phone: "+216 29 678 901", email: "sami@email.tn",
    lastVisit: "8 Fév 2026", doctor: "Dr. Bouazizi", nextAppointment: null as string | null,
    cnamId: "45678901", assurance: "CNAM", dob: "22/06/1984", avatar: "SA",
    balance: 0, notes: "Asthme léger", gouvernorat: "Tunis",
    history: [
      { date: "8 Fév 2026", type: "Consultation", doctor: "Dr. Bouazizi", motif: "Renouvellement traitement", amount: "35 DT", paid: true },
    ],
  },
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

/** Billing act types reference data */
export const mockSecretaryBillingActTypes = [
  { label: "Consultation générale", price: 35 },
  { label: "Consultation spécialisée", price: 60 },
  { label: "1ère consultation", price: 80 },
  { label: "Bilan complet", price: 150 },
  { label: "Téléconsultation", price: 35 },
  { label: "ECG", price: 40 },
  { label: "Suivi", price: 35 },
  { label: "Contrôle", price: 25 },
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

/** Full document data with id, iconKey, status, patient — used by SecretaryDocuments page */
export const mockSecretaryDocumentsFull = [
  { id: 1, name: "Fiche patient - Amine Ben Ali", type: "PDF", size: "245 Ko", date: "20 Fév 2026", category: "Fiches patients", iconKey: "FileText", patient: "Amine Ben Ali", status: "validated" as const },
  { id: 2, name: "Bulletin de soins CNAM - Fatma Trabelsi", type: "PDF", size: "120 Ko", date: "18 Fév 2026", category: "CNAM", iconKey: "Shield", patient: "Fatma Trabelsi", status: "validated" as const },
  { id: 3, name: "Ordonnance ORD-2026-045", type: "PDF", size: "89 Ko", date: "20 Fév 2026", category: "Ordonnances", iconKey: "FileText", patient: "Amine Ben Ali", status: "validated" as const },
  { id: 4, name: "Résultats analyses - Mohamed Sfar", type: "PDF", size: "1.2 Mo", date: "15 Fév 2026", category: "Analyses", iconKey: "File", patient: "Mohamed Sfar", status: "pending" as const },
  { id: 5, name: "Facture Février 2026", type: "PDF", size: "56 Ko", date: "1 Fév 2026", category: "Comptabilité", iconKey: "FileText", status: "validated" as const },
  { id: 6, name: "Certificat médical - Sami Ayari", type: "PDF", size: "34 Ko", date: "19 Fév 2026", category: "Certificats", iconKey: "FileText", patient: "Sami Ayari", status: "draft" as const },
  { id: 7, name: "Déclaration CNAM mensuelle", type: "PDF", size: "180 Ko", date: "1 Fév 2026", category: "CNAM", iconKey: "Shield", status: "validated" as const },
  { id: 8, name: "Convention CNAM - Dr. Bouazizi", type: "PDF", size: "450 Ko", date: "1 Jan 2026", category: "CNAM", iconKey: "Shield", status: "validated" as const },
  { id: 9, name: "Radiographie thorax - Nadia Jemni", type: "DICOM", size: "8.5 Mo", date: "12 Fév 2026", category: "Imagerie", iconKey: "Image", patient: "Nadia Jemni", status: "validated" as const },
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

export const mockSecretaryStats = {
  rdvTotal: 18,
  termines: 6,
  attente: 3,
  attenteMoy: 12,
  caJour: 420,
};

// ─── Secretary Cabinet Chat ──────────────────────────────────

export const mockSecretaryCabinetContacts: ChatContact[] = [
  { id: "sc1", name: "Chat du cabinet", role: "Dr. Bouazizi · Dr. Gharbi · Dr. Hammami", avatar: "CB", lastMessage: "Le patient de 14h30 a annulé.", time: "11:15", unread: 2, online: true },
  { id: "sc2", name: "Dr. Ahmed Bouazizi", role: "Médecin généraliste", avatar: "AB", lastMessage: "Merci pour la mise à jour du planning.", time: "10:45", unread: 0, online: true },
  { id: "sc3", name: "Dr. Sonia Gharbi", role: "Cardiologue", avatar: "SG", lastMessage: "Le patient Trabelsi est arrivé ?", time: "09:30", unread: 1, online: false },
];

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
