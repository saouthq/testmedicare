/**
 * Types métier partagés — Patient
 */

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
  /** Insurance name from referential */
  insurance?: string;
  /** Insurance member number (optional) */
  insuranceNumber?: string;
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
  status: import("./common").AppointmentStatus;
  type: "cabinet" | "teleconsultation";
  motif: string;
  canModify: boolean;
  canCancel: boolean;
  avatar: string;
  hasInsurance?: boolean;
  cancellationPolicy: string;
  documents: string[];
  instructions: string;
  /** Date/heure ISO pour le calcul d'accès téléconsultation */
  scheduledAt?: string;
  /** ID de session partagée pour le store téléconsultation */
  sessionId?: string;
  /** Règles du cabinet */
  cabinetRules?: {
    cancellationHours: number;
    maxReschedules: number;
    latePolicy: string;
  };
  /** Paiement requis pour téléconsultation */
  requiresPayment?: boolean;
  paymentStatus?: "pending" | "paid" | "failed";
  amount?: number;
  /** ID du médecin pour navigation booking */
  doctorId?: number;
}

export interface PastAppointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: import("./common").AppointmentStatus;
  motif: string;
  hasPrescription: boolean;
  hasReport: boolean;
  /** Feuille de soins disponible */
  hasCareSheet?: boolean;
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

export interface PartnerPharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  openNow: boolean;
}
