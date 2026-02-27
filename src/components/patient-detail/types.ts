/**
 * Types UI locaux — Dossier Patient (DoctorPatientDetail)
 * Les types métier (Patient, Prescription…) restent dans src/types/.
 */

export type MainTab = "historique" | "antecedents" | "traitement" | "constantes" | "notes" | "notes_prive" | "documents";
export type HistFilter = "all" | "consult" | "rx" | "lab" | "doc";
export type DrawerKind = null | "detail" | "rx" | "lab" | "doc";
export type DocFileKind = "document" | "photo";
export type WorkflowStep = 1 | 2 | 3;
export type DocTemplate = "report" | "certificate" | "referral" | "sickleave";

export type TimelineOpen = { kind: "consult" | "rx" | "lab" | "doc" };

export type TimelineEvent = {
  id: string;
  at: string;
  ts: number;
  type: HistFilter;
  title: string;
  desc?: string;
  open?: TimelineOpen;
  payload?: any;
};

export type PatientFile = {
  id: string;
  at: string;
  ts: number;
  kind: DocFileKind;
  name: string;
  mime: string;
  size?: number;
  url?: string;
  meta?: any;
};

export type Ante = { medical: string; surgical: string; traumatic: string; family: string };
export type VersionText = { id: string; at: string; ts: number; text: string };
export type VersionAnte = { id: string; at: string; ts: number; data: Ante };
export type VersionVitals = {
  id: string;
  at: string;
  ts: number;
  data: { ta: string; fc: string; weight: string; gly: string };
};

export type VitalsData = { ta: string; fc: string; weight: string; gly: string };

export type RxDraftItem = {
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
};

export type LabPanel = {
  key: string;
  label: string;
  hint?: string;
};
