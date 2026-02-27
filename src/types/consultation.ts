/**
 * Types métier partagés — Consultation
 */

export interface PastConsult {
  date: string;
  motif: string;
  notes: string;
  prescriptions: number;
}

export interface ConsultationTemplate {
  key: string;
  label: string;
  motif: string;
  symptoms: string;
  examination: string;
  diagnosis: string;
  conclusion: string;
  extraAnalyses?: string[];
  defaultDockTab: "rx" | "labs" | "docs" | "tasks";
}
