/**
 * Types métier partagés — Document / Lab / Pharmacy
 */

/** Panel used by doctor when creating a lab request */
export interface LabPanel {
  key: string;
  label: string;
  hint?: string;
}

/* ── Pharmacy types ────────────────────────────────────── */

/** Availability per medication item */
export type PharmacyItemAvailability = "available" | "partial" | "unavailable";

/** Single medication in a pharmacy prescription */
export interface PharmacyPrescriptionItem {
  name: string;
  dosage: string;           // e.g. "500mg", "1g"
  quantity: number;          // prescribed quantity
  availability: PharmacyItemAvailability;
  alternative?: string;     // free-text alternative suggestion
  price: string;
}

/** Prescription status lifecycle */
export type PharmacyPrescriptionStatus =
  | "received"       // patient sent it
  | "preparing"      // pharmacist started
  | "ready_pickup"   // ready + pickup time set
  | "delivered"      // patient picked up
  | "partial"        // some items unavailable, delivered what's possible
  | "unavailable";   // all items unavailable

/** Full prescription as seen by pharmacy */
export interface PharmacyPrescription {
  id: string;
  patient: string;
  avatar: string;
  doctor: string;
  date: string;              // date received
  items: PharmacyPrescriptionItem[];
  status: PharmacyPrescriptionStatus;
  total: string;
  assurance: string;         // "CNAM", "CNRPS", "Sans assurance"…
  numAssurance?: string;
  urgent: boolean;
  pickupTime?: string;       // e.g. "14:30", required when ready_pickup
  comment?: string;          // global pharmacist comment
  patientPhone?: string;
}
