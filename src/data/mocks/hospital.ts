/**
 * Mock data — Hospital management workspace
 */

export interface HospitalDepartment {
  id: string;
  name: string;
  head: string;
  totalBeds: number;
  occupiedBeds: number;
  staff: number;
  status: "active" | "maintenance" | "restricted";
}

export interface HospitalPatient {
  id: string;
  name: string;
  age: number;
  department: string;
  roomNumber: string;
  admissionDate: string;
  diagnosis: string;
  status: "hospitalized" | "observation" | "icu" | "discharged" | "pending_admission";
  doctor: string;
  insurance: string;
}

export interface HospitalStaff {
  id: string;
  name: string;
  role: "doctor" | "nurse" | "technician" | "admin" | "surgeon";
  department: string;
  shift: "morning" | "afternoon" | "night" | "off";
  phone: string;
  specialty?: string;
}

export interface HospitalEquipment {
  id: string;
  name: string;
  department: string;
  status: "operational" | "maintenance" | "out_of_service" | "reserved";
  lastMaintenance: string;
  nextMaintenance: string;
  serialNumber: string;
}

export const mockHospitalDepartments: HospitalDepartment[] = [
  { id: "dep-1", name: "Cardiologie", head: "Pr. Ahmed Ben Salah", totalBeds: 30, occupiedBeds: 24, staff: 18, status: "active" },
  { id: "dep-2", name: "Chirurgie Générale", head: "Pr. Fatma Khelifi", totalBeds: 40, occupiedBeds: 35, staff: 25, status: "active" },
  { id: "dep-3", name: "Pédiatrie", head: "Dr. Nadia Trabelsi", totalBeds: 25, occupiedBeds: 18, staff: 15, status: "active" },
  { id: "dep-4", name: "Urgences", head: "Dr. Karim Bouaziz", totalBeds: 20, occupiedBeds: 17, staff: 22, status: "active" },
  { id: "dep-5", name: "Réanimation", head: "Pr. Sami Gharbi", totalBeds: 12, occupiedBeds: 10, staff: 20, status: "active" },
  { id: "dep-6", name: "Neurologie", head: "Dr. Leila Hamdi", totalBeds: 20, occupiedBeds: 14, staff: 12, status: "active" },
  { id: "dep-7", name: "Maternité", head: "Pr. Amel Sassi", totalBeds: 35, occupiedBeds: 28, staff: 20, status: "active" },
  { id: "dep-8", name: "Orthopédie", head: "Dr. Mehdi Jebali", totalBeds: 22, occupiedBeds: 15, staff: 14, status: "maintenance" },
];

export const mockHospitalPatients: HospitalPatient[] = [
  { id: "hp-1", name: "Mohamed Ben Ali", age: 65, department: "Cardiologie", roomNumber: "C-101", admissionDate: "2026-03-05", diagnosis: "Insuffisance cardiaque", status: "hospitalized", doctor: "Pr. Ahmed Ben Salah", insurance: "CNAM" },
  { id: "hp-2", name: "Fatma Khedher", age: 42, department: "Chirurgie Générale", roomNumber: "CH-203", admissionDate: "2026-03-07", diagnosis: "Cholécystectomie programmée", status: "hospitalized", doctor: "Pr. Fatma Khelifi", insurance: "CNSS" },
  { id: "hp-3", name: "Youssef Mansouri", age: 8, department: "Pédiatrie", roomNumber: "P-105", admissionDate: "2026-03-08", diagnosis: "Bronchiolite aiguë", status: "hospitalized", doctor: "Dr. Nadia Trabelsi", insurance: "CNAM" },
  { id: "hp-4", name: "Amira Gharbi", age: 29, department: "Maternité", roomNumber: "M-302", admissionDate: "2026-03-09", diagnosis: "Accouchement imminent", status: "hospitalized", doctor: "Pr. Amel Sassi", insurance: "Assurance privée" },
  { id: "hp-5", name: "Khaled Dridi", age: 55, department: "Réanimation", roomNumber: "REA-04", admissionDate: "2026-03-06", diagnosis: "Détresse respiratoire", status: "icu", doctor: "Pr. Sami Gharbi", insurance: "CNAM" },
  { id: "hp-6", name: "Sana Bouslama", age: 38, department: "Urgences", roomNumber: "URG-12", admissionDate: "2026-03-09", diagnosis: "Traumatisme crânien léger", status: "observation", doctor: "Dr. Karim Bouaziz", insurance: "CNSS" },
  { id: "hp-7", name: "Ali Mejri", age: 71, department: "Neurologie", roomNumber: "N-201", admissionDate: "2026-03-04", diagnosis: "AVC ischémique", status: "hospitalized", doctor: "Dr. Leila Hamdi", insurance: "CNAM" },
  { id: "hp-8", name: "Ines Boukhris", age: 25, department: "Orthopédie", roomNumber: "—", admissionDate: "—", diagnosis: "Fracture du fémur", status: "pending_admission", doctor: "Dr. Mehdi Jebali", insurance: "Assurance privée" },
  { id: "hp-9", name: "Riadh Hammami", age: 60, department: "Cardiologie", roomNumber: "C-108", admissionDate: "2026-03-02", diagnosis: "Infarctus du myocarde", status: "hospitalized", doctor: "Pr. Ahmed Ben Salah", insurance: "CNAM" },
  { id: "hp-10", name: "Olfa Trabelsi", age: 33, department: "Chirurgie Générale", roomNumber: "CH-210", admissionDate: "2026-03-01", diagnosis: "Appendicectomie", status: "discharged", doctor: "Pr. Fatma Khelifi", insurance: "CNSS" },
];

export const mockHospitalStaff: HospitalStaff[] = [
  { id: "hs-1", name: "Pr. Ahmed Ben Salah", role: "doctor", department: "Cardiologie", shift: "morning", phone: "+216 98 100 001", specialty: "Cardiologie interventionnelle" },
  { id: "hs-2", name: "Pr. Fatma Khelifi", role: "surgeon", department: "Chirurgie Générale", shift: "morning", phone: "+216 98 100 002", specialty: "Chirurgie digestive" },
  { id: "hs-3", name: "Dr. Nadia Trabelsi", role: "doctor", department: "Pédiatrie", shift: "morning", phone: "+216 98 100 003", specialty: "Pédiatrie générale" },
  { id: "hs-4", name: "Dr. Karim Bouaziz", role: "doctor", department: "Urgences", shift: "night", phone: "+216 98 100 004", specialty: "Médecine d'urgence" },
  { id: "hs-5", name: "Salwa Hafsi", role: "nurse", department: "Cardiologie", shift: "morning", phone: "+216 98 200 001" },
  { id: "hs-6", name: "Rim Zouari", role: "nurse", department: "Réanimation", shift: "night", phone: "+216 98 200 002" },
  { id: "hs-7", name: "Walid Saadi", role: "technician", department: "Urgences", shift: "afternoon", phone: "+216 98 300 001" },
  { id: "hs-8", name: "Hichem Ammar", role: "admin", department: "Administration", shift: "morning", phone: "+216 98 400 001" },
  { id: "hs-9", name: "Pr. Sami Gharbi", role: "doctor", department: "Réanimation", shift: "morning", phone: "+216 98 100 005", specialty: "Anesthésie-Réanimation" },
  { id: "hs-10", name: "Dr. Leila Hamdi", role: "doctor", department: "Neurologie", shift: "afternoon", phone: "+216 98 100 006", specialty: "Neurologie" },
];

export const mockHospitalEquipment: HospitalEquipment[] = [
  { id: "eq-1", name: "Scanner CT 256 coupes", department: "Radiologie", status: "operational", lastMaintenance: "2026-02-15", nextMaintenance: "2026-05-15", serialNumber: "CT-2024-001" },
  { id: "eq-2", name: "IRM 3 Tesla", department: "Radiologie", status: "operational", lastMaintenance: "2026-01-20", nextMaintenance: "2026-04-20", serialNumber: "IRM-2023-002" },
  { id: "eq-3", name: "Ventilateur mécanique Dräger", department: "Réanimation", status: "operational", lastMaintenance: "2026-03-01", nextMaintenance: "2026-06-01", serialNumber: "VM-2024-010" },
  { id: "eq-4", name: "Défibrillateur portable", department: "Urgences", status: "operational", lastMaintenance: "2026-02-28", nextMaintenance: "2026-05-28", serialNumber: "DEF-2024-005" },
  { id: "eq-5", name: "Échographe Doppler", department: "Cardiologie", status: "maintenance", lastMaintenance: "2026-01-10", nextMaintenance: "2026-03-10", serialNumber: "ECH-2023-008" },
  { id: "eq-6", name: "Table d'opération hydraulique", department: "Chirurgie Générale", status: "operational", lastMaintenance: "2026-02-20", nextMaintenance: "2026-08-20", serialNumber: "TOP-2022-003" },
  { id: "eq-7", name: "Moniteur fœtal", department: "Maternité", status: "operational", lastMaintenance: "2026-03-05", nextMaintenance: "2026-09-05", serialNumber: "MF-2024-012" },
  { id: "eq-8", name: "Pompe à perfusion", department: "Pédiatrie", status: "out_of_service", lastMaintenance: "2025-12-01", nextMaintenance: "—", serialNumber: "PP-2021-020" },
];
