/**
 * Types métier partagés — Document / Lab
 */

/** Panel used by doctor when creating a lab request */
export interface LabPanel {
  key: string;
  label: string;
  hint?: string;
}

export interface PharmacyPrescriptionItem {
  name: string;
  available: boolean;
  quantity: number;
  price: string;
}

export interface PharmacyPrescription {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  items: PharmacyPrescriptionItem[];
  status: string;
  total: string;
  cnam: boolean;
  avatar: string;
  urgent: boolean;
}
