/**
 * Types métier partagés — Document / Lab
 */

export interface LabPanel {
  key: string;
  label: string;
  hint?: string;
}

export interface LabAnalysis {
  id: string;
  patient: string;
  type: string;
  doctor: string;
  date: string;
  status: string;
  amount: string;
  cnam: boolean;
  avatar: string;
  priority: string;
}

export interface LabResultValue {
  name: string;
  value: string;
  ref: string;
  status: string;
}

export interface LabResult {
  id: string;
  analysis: string;
  patient: string;
  type: string;
  date: string;
  doctor: string;
  sent: boolean;
  amount: string;
  cnam: boolean;
  avatar: string;
  values: LabResultValue[];
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
