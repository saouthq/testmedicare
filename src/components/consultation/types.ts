import type { ReactNode } from "react";

export type DockTab = "rx" | "labs" | "docs" | "tasks";
export type SlideType = "rx" | "labs" | "report" | "certificate" | "sickleave" | "rdv";

export type PrescriptionItem = {
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
};

export type VitalsState = {
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperature: string;
  weight: string;
  oxygenSat: string;
  height: string;
  respiratoryRate: string;
};

export type CompletionState = {
  vitalsOk: boolean;
  notesOk: boolean;
  rxOk: boolean;
  labsOk: boolean;
  docsOk: boolean;
  doneCount: number;
  total: number;
};

export type CommandAction = {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  onRun: () => void;
};
