/**
 * Types métier partagés — Prescription
 */

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

export interface RxFavorite {
  label: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface ConsultationPrescriptionItem {
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
}
