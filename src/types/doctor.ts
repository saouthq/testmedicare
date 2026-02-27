/**
 * Types métier partagés — Doctor
 */

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
  availAM: boolean[];
  availPM: boolean[];
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

export interface TeleconsultTransaction {
  id: string;
  patient: string;
  avatar: string;
  dateRdv: string;
  amount: number;
  status: import("./common").InvoiceStatus;
  ref: string;
  motif: string;
}

export interface SubscriptionInvoice {
  id: string;
  month: string;
  amount: number;
  status: import("./common").InvoiceStatus;
  date: string;
}
