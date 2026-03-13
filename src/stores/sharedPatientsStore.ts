/**
 * sharedPatientsStore.ts — Centralized patients shared between doctor & secretary.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { useDualQuery } from "@/hooks/useDualData";
import { mapPatientRow } from "@/lib/supabaseMappers";

export interface SharedPatient {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  dob: string;
  assurance: string;
  numAssure: string;
  doctor: string;
  gouvernorat: string;
  lastVisit: string;
  nextAppointment: string | null;
  balance: number;
  notes: string;
  history: { date: string; type: string; doctor: string; motif: string; amount: string; paid: boolean }[];
}

const initialPatients: SharedPatient[] = [
  {
    id: 1, name: "Amine Ben Ali", phone: "+216 71 234 567", email: "amine@email.tn", avatar: "AB",
    dob: "15/03/1991", assurance: "Maghrebia", numAssure: "12345678", doctor: "Dr. Bouazizi",
    gouvernorat: "Tunis", lastVisit: "20 Fév 2026", nextAppointment: "28 Fév 14:30", balance: 0,
    notes: "Suivi diabète régulier",
    history: [
      { date: "20 Fév 2026", type: "Consultation", doctor: "Dr. Bouazizi", motif: "Suivi diabète", amount: "35 DT", paid: true },
      { date: "10 Jan 2026", type: "Contrôle", doctor: "Dr. Bouazizi", motif: "Bilan annuel", amount: "35 DT", paid: true },
      { date: "15 Nov 2025", type: "Consultation", doctor: "Dr. Gharbi", motif: "ECG contrôle", amount: "50 DT", paid: true },
    ],
  },
  {
    id: 2, name: "Fatma Trabelsi", phone: "+216 22 345 678", email: "fatma@email.tn", avatar: "FT",
    dob: "12/07/1970", assurance: "Assurance publique", numAssure: "23456789", doctor: "Dr. Gharbi",
    gouvernorat: "Ariana", lastVisit: "18 Fév 2026", nextAppointment: "25 Fév 10:00", balance: 60,
    notes: "Hypertension — suivi cardio",
    history: [
      { date: "18 Fév 2026", type: "Suivi", doctor: "Dr. Gharbi", motif: "Tension artérielle", amount: "50 DT", paid: false },
      { date: "5 Jan 2026", type: "Consultation", doctor: "Dr. Gharbi", motif: "Bilan cardio", amount: "50 DT", paid: true },
    ],
  },
  {
    id: 3, name: "Mohamed Sfar", phone: "+216 55 456 789", email: "med@email.tn", avatar: "MS",
    dob: "05/01/1998", assurance: "STAR", numAssure: "—", doctor: "Dr. Bouazizi",
    gouvernorat: "Ben Arous", lastVisit: "15 Fév 2026", nextAppointment: null, balance: 0,
    notes: "Suivi post-opératoire",
    history: [{ date: "15 Fév 2026", type: "Contrôle", doctor: "Dr. Bouazizi", motif: "Post-opératoire", amount: "35 DT", paid: true }],
  },
  {
    id: 4, name: "Nadia Jemni", phone: "+216 98 567 890", email: "nadia@email.tn", avatar: "NJ",
    dob: "18/11/1959", assurance: "Assurance publique", numAssure: "34567890", doctor: "Dr. Hammami",
    gouvernorat: "Manouba", lastVisit: "10 Fév 2026", nextAppointment: "3 Mar 09:00", balance: 25,
    notes: "Arthrose — anti-inflammatoires",
    history: [{ date: "10 Fév 2026", type: "Consultation", doctor: "Dr. Hammami", motif: "Douleurs articulaires", amount: "45 DT", paid: false }],
  },
  {
    id: 5, name: "Sami Ayari", phone: "+216 29 678 901", email: "sami@email.tn", avatar: "SA",
    dob: "22/06/1984", assurance: "Assurance publique", numAssure: "45678901", doctor: "Dr. Bouazizi",
    gouvernorat: "Tunis", lastVisit: "8 Fév 2026", nextAppointment: null, balance: 0,
    notes: "Asthme léger",
    history: [{ date: "8 Fév 2026", type: "Consultation", doctor: "Dr. Bouazizi", motif: "Renouvellement traitement", amount: "35 DT", paid: true }],
  },
  {
    id: 6, name: "Rania Meddeb", phone: "+216 52 789 012", email: "rania@email.tn", avatar: "RM",
    dob: "08/09/1987", assurance: "CNRPS", numAssure: "56789012", doctor: "Dr. Gharbi",
    gouvernorat: "Tunis", lastVisit: "15 Fév 2026", nextAppointment: null, balance: 60,
    notes: "Suivi cardiologique",
    history: [{ date: "15 Fév 2026", type: "Suivi", doctor: "Dr. Gharbi", motif: "ECG contrôle", amount: "60 DT", paid: false }],
  },
  {
    id: 7, name: "Youssef Belhadj", phone: "+216 98 123 456", email: "youssef@email.tn", avatar: "YB",
    dob: "30/04/1995", assurance: "Sans assurance", numAssure: "—", doctor: "Dr. Bouazizi",
    gouvernorat: "Tunis", lastVisit: "18 Fév 2026", nextAppointment: null, balance: 0,
    notes: "Patient téléconsultation",
    history: [{ date: "18 Fév 2026", type: "Téléconsultation", doctor: "Dr. Bouazizi", motif: "Renouvellement Rx", amount: "35 DT", paid: true }],
  },
  {
    id: 8, name: "Salma Dridi", phone: "+216 71 345 678", email: "salma@email.tn", avatar: "SD",
    dob: "14/02/1993", assurance: "Maghrebia", numAssure: "67890123", doctor: "Dr. Bouazizi",
    gouvernorat: "Ariana", lastVisit: "12 Fév 2026", nextAppointment: null, balance: 150,
    notes: "Bilan complet en cours",
    history: [{ date: "12 Fév 2026", type: "Consultation", doctor: "Dr. Bouazizi", motif: "Bilan complet", amount: "150 DT", paid: false }],
  },
  {
    id: 9, name: "Karim Mansour", phone: "+216 55 234 567", email: "karim@email.tn", avatar: "KM",
    dob: "25/12/1988", assurance: "Assurance publique", numAssure: "78901234", doctor: "Dr. Bouazizi",
    gouvernorat: "Tunis", lastVisit: "20 Fév 2026", nextAppointment: null, balance: 0,
    notes: "Suivi diabète",
    history: [{ date: "20 Fév 2026", type: "Contrôle", doctor: "Dr. Bouazizi", motif: "Suivi diabète", amount: "35 DT", paid: true }],
  },
  {
    id: 10, name: "Leila Chahed", phone: "+216 22 567 890", email: "leila@email.tn", avatar: "LC",
    dob: "03/08/1975", assurance: "CNRPS", numAssure: "89012345", doctor: "Dr. Gharbi",
    gouvernorat: "Ariana", lastVisit: "20 Fév 2026", nextAppointment: null, balance: 0,
    notes: "Suivi tension",
    history: [{ date: "20 Fév 2026", type: "Suivi", doctor: "Dr. Gharbi", motif: "Tension artérielle", amount: "45 DT", paid: true }],
  },
];

const store = createStore<SharedPatient[]>("medicare_shared_patients", initialPatients);

export const sharedPatientsStore = store;

export function useSharedPatients() {
  return useDualQuery<SharedPatient[]>({
    store,
    tableName: "patients",
    queryKey: ["patients"],
    mapRowToLocal: mapPatientRow,
    orderBy: { column: "created_at", ascending: false },
  });
}

export function addPatient(patient: Omit<SharedPatient, "id">) {
  const id = Date.now();
  store.set(prev => [...prev, { ...patient, id }]);
  pushNotification({
    type: "generic",
    title: "Nouveau patient enregistré",
    message: `${patient.name} a été ajouté à la base patients.`,
    targetRole: "doctor",
    actionLink: "/dashboard/doctor/patients",
  });
  return id;
}

export function updatePatient(id: number, update: Partial<SharedPatient>) {
  store.set(prev => prev.map(p => p.id === id ? { ...p, ...update } : p));
}
