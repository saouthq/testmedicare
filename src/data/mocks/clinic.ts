/**
 * Mock data — Clinic management workspace
 */

export interface ClinicDoctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  schedule: string;
  phone: string;
  consultationsToday: number;
}

export interface ClinicAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  time: string;
  date: string;
  status: "scheduled" | "arrived" | "in_progress" | "completed" | "cancelled" | "no_show";
  room: string;
  type: "consultation" | "surgery" | "follow_up" | "emergency";
  insurance: string;
}

export interface ClinicRoom {
  id: string;
  name: string;
  type: "consultation" | "surgery" | "examination" | "waiting" | "recovery";
  floor: string;
  status: "available" | "occupied" | "cleaning" | "maintenance";
  currentDoctor?: string;
  currentPatient?: string;
  equipment: string[];
}

export const mockClinicDoctors: ClinicDoctor[] = [
  { id: "cd-1", name: "Dr. Sami Chtourou", specialty: "Médecine Générale", available: true, schedule: "8h-16h", phone: "+216 98 500 001", consultationsToday: 8 },
  { id: "cd-2", name: "Dr. Meriem Bouraoui", specialty: "Cardiologie", available: true, schedule: "9h-17h", phone: "+216 98 500 002", consultationsToday: 5 },
  { id: "cd-3", name: "Dr. Nizar Hajji", specialty: "Chirurgie Esthétique", available: false, schedule: "En bloc opératoire", phone: "+216 98 500 003", consultationsToday: 2 },
  { id: "cd-4", name: "Dr. Amina Rekik", specialty: "Dermatologie", available: true, schedule: "8h30-15h", phone: "+216 98 500 004", consultationsToday: 10 },
  { id: "cd-5", name: "Dr. Hassen Masmoudi", specialty: "ORL", available: true, schedule: "10h-18h", phone: "+216 98 500 005", consultationsToday: 6 },
  { id: "cd-6", name: "Dr. Wafa Riahi", specialty: "Ophtalmologie", available: false, schedule: "Jour de repos", phone: "+216 98 500 006", consultationsToday: 0 },
];

export const mockClinicAppointments: ClinicAppointment[] = [
  { id: "ca-1", patientName: "Salma Ben Hamida", doctorName: "Dr. Sami Chtourou", specialty: "Médecine Générale", time: "08:30", date: "2026-03-09", status: "completed", room: "Salle 1", type: "consultation", insurance: "CNAM" },
  { id: "ca-2", patientName: "Rami Boukadi", doctorName: "Dr. Meriem Bouraoui", specialty: "Cardiologie", time: "09:00", date: "2026-03-09", status: "completed", room: "Salle 3", type: "consultation", insurance: "Assurance privée" },
  { id: "ca-3", patientName: "Nour Bouzid", doctorName: "Dr. Amina Rekik", specialty: "Dermatologie", time: "09:30", date: "2026-03-09", status: "in_progress", room: "Salle 4", type: "consultation", insurance: "CNAM" },
  { id: "ca-4", patientName: "Tarek Hmidi", doctorName: "Dr. Nizar Hajji", specialty: "Chirurgie Esthétique", time: "10:00", date: "2026-03-09", status: "in_progress", room: "Bloc A", type: "surgery", insurance: "Assurance privée" },
  { id: "ca-5", patientName: "Asma Gharbi", doctorName: "Dr. Hassen Masmoudi", specialty: "ORL", time: "10:30", date: "2026-03-09", status: "arrived", room: "Salle 5", type: "consultation", insurance: "CNSS" },
  { id: "ca-6", patientName: "Firas Maatoug", doctorName: "Dr. Sami Chtourou", specialty: "Médecine Générale", time: "11:00", date: "2026-03-09", status: "scheduled", room: "Salle 1", type: "follow_up", insurance: "CNAM" },
  { id: "ca-7", patientName: "Hela Nasri", doctorName: "Dr. Meriem Bouraoui", specialty: "Cardiologie", time: "11:30", date: "2026-03-09", status: "scheduled", room: "Salle 3", type: "follow_up", insurance: "CNAM" },
  { id: "ca-8", patientName: "Saber Chelbi", doctorName: "Dr. Amina Rekik", specialty: "Dermatologie", time: "12:00", date: "2026-03-09", status: "scheduled", room: "Salle 4", type: "consultation", insurance: "Assurance privée" },
  { id: "ca-9", patientName: "Mariam Louati", doctorName: "Dr. Sami Chtourou", specialty: "Médecine Générale", time: "14:00", date: "2026-03-09", status: "scheduled", room: "Salle 1", type: "consultation", insurance: "CNSS" },
  { id: "ca-10", patientName: "Omar Sassi", doctorName: "Dr. Hassen Masmoudi", specialty: "ORL", time: "14:30", date: "2026-03-09", status: "cancelled", room: "Salle 5", type: "consultation", insurance: "CNAM" },
];

export const mockClinicRooms: ClinicRoom[] = [
  { id: "cr-1", name: "Salle 1", type: "consultation", floor: "RDC", status: "occupied", currentDoctor: "Dr. Sami Chtourou", currentPatient: "Firas Maatoug", equipment: ["Bureau", "Stéthoscope", "Tensiomètre", "PC"] },
  { id: "cr-2", name: "Salle 2", type: "consultation", floor: "RDC", status: "available", equipment: ["Bureau", "Stéthoscope", "Otoscope", "PC"] },
  { id: "cr-3", name: "Salle 3", type: "consultation", floor: "1er", status: "occupied", currentDoctor: "Dr. Meriem Bouraoui", currentPatient: "Rami Boukadi", equipment: ["ECG", "Bureau", "Échographe", "PC"] },
  { id: "cr-4", name: "Salle 4", type: "examination", floor: "1er", status: "occupied", currentDoctor: "Dr. Amina Rekik", currentPatient: "Nour Bouzid", equipment: ["Dermatoscope", "Laser", "Bureau", "PC"] },
  { id: "cr-5", name: "Salle 5", type: "consultation", floor: "1er", status: "available", equipment: ["Bureau", "Stéthoscope", "Endoscope nasal", "PC"] },
  { id: "cr-6", name: "Bloc A", type: "surgery", floor: "2ème", status: "occupied", currentDoctor: "Dr. Nizar Hajji", currentPatient: "Tarek Hmidi", equipment: ["Table opératoire", "Anesthésie", "Monitoring", "Éclairage scialytique"] },
  { id: "cr-7", name: "Bloc B", type: "surgery", floor: "2ème", status: "maintenance", equipment: ["Table opératoire", "Anesthésie", "Monitoring"] },
  { id: "cr-8", name: "Salle de réveil", type: "recovery", floor: "2ème", status: "available", equipment: ["Lits", "Monitoring", "Oxygène", "Aspirateur"] },
  { id: "cr-9", name: "Salle d'attente A", type: "waiting", floor: "RDC", status: "available", equipment: ["Sièges", "TV", "Distributeur eau"] },
  { id: "cr-10", name: "Salle d'attente B", type: "waiting", floor: "1er", status: "cleaning", equipment: ["Sièges", "TV"] },
];
