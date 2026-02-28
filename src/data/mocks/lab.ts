/**
 * Mock data — Laboratory domain
 */
import type { LabAnalysis, LabResult } from "@/types";

export const mockLabStats = [
  { label: "Analyses aujourd'hui", value: "24", color: "bg-primary/10 text-primary", change: "+12%" },
  { label: "En cours", value: "8", color: "bg-warning/10 text-warning", change: "3 urgentes" },
  { label: "Terminées", value: "14", color: "bg-accent/10 text-accent", change: "+18%" },
  { label: "CA du jour", value: "1,850 DT", color: "bg-primary/10 text-primary", change: "+8%" },
];

export const mockLabAnalyses = [
  { patient: "Amine Ben Ali", type: "Bilan sanguin complet", doctor: "Dr. Bouazizi", status: "in_progress", date: "20 Fév", priority: "normal", avatar: "AB", amount: "85 DT", progress: 65 },
  { patient: "Fatma Trabelsi", type: "Analyse d'urine", doctor: "Dr. Gharbi", status: "ready", date: "19 Fév", priority: "normal", avatar: "FT", amount: "35 DT", progress: 100 },
  { patient: "Mohamed Sfar", type: "TSH - Thyroïde", doctor: "Dr. Hammami", status: "waiting", date: "20 Fév", priority: "urgent", avatar: "MS", amount: "45 DT", progress: 0 },
  { patient: "Nadia Jemni", type: "Glycémie à jeun", doctor: "Dr. Bouazizi", status: "ready", date: "18 Fév", priority: "normal", avatar: "NJ", amount: "25 DT", progress: 100 },
  { patient: "Sami Ayari", type: "Hémogramme (NFS)", doctor: "Dr. Bouazizi", status: "in_progress", date: "20 Fév", priority: "normal", avatar: "SA", amount: "40 DT", progress: 40 },
];

export const mockLabAnalysesFull = mockLabAnalyses;

/** Full dashboard analyses with id, values, cnam — used by LaboratoryDashboard */
export const mockLabDashboardAnalyses = [
  { id: 1, patient: "Amine Ben Ali", avatar: "AB", type: "Bilan sanguin complet", doctor: "Dr. Bouazizi", status: "in_progress" as const, date: "20 Fév", priority: "normal", amount: "85 DT", progress: 65, cnam: true, values: [
    { name: "Glycémie", value: "1.05 g/L", ref: "0.70 - 1.10", status: "normal" },
    { name: "HbA1c", value: "6.8%", ref: "< 7%", status: "normal" },
    { name: "Cholestérol total", value: "2.45 g/L", ref: "< 2.00", status: "high" },
  ]},
  { id: 2, patient: "Fatma Trabelsi", avatar: "FT", type: "Analyse d'urine", doctor: "Dr. Gharbi", status: "ready" as const, date: "19 Fév", priority: "normal", amount: "35 DT", progress: 100, cnam: true, values: [
    { name: "pH", value: "6.0", ref: "4.5 - 8.0", status: "normal" },
    { name: "Protéines", value: "Traces", ref: "Négatif", status: "high" },
    { name: "Glucose", value: "Négatif", ref: "Négatif", status: "normal" },
  ]},
  { id: 3, patient: "Mohamed Sfar", avatar: "MS", type: "TSH - Thyroïde", doctor: "Dr. Hammami", status: "waiting" as const, date: "20 Fév", priority: "urgent", amount: "45 DT", progress: 0, cnam: false },
  { id: 4, patient: "Nadia Jemni", avatar: "NJ", type: "Glycémie à jeun", doctor: "Dr. Bouazizi", status: "ready" as const, date: "18 Fév", priority: "normal", amount: "25 DT", progress: 100, cnam: true, values: [
    { name: "Glycémie à jeun", value: "1.32 g/L", ref: "0.70 - 1.10", status: "high" },
  ]},
  { id: 5, patient: "Sami Ayari", avatar: "SA", type: "Hémogramme (NFS)", doctor: "Dr. Bouazizi", status: "in_progress" as const, date: "20 Fév", priority: "normal", amount: "40 DT", progress: 40, cnam: true },
  { id: 6, patient: "Rania Meddeb", avatar: "RM", type: "Bilan lipidique", doctor: "Dr. Gharbi", status: "sent" as const, date: "17 Fév", priority: "normal", amount: "55 DT", progress: 100, cnam: true },
  { id: 7, patient: "Karim Mansour", avatar: "KM", type: "CRP + VS", doctor: "Dr. Bouazizi", status: "waiting" as const, date: "20 Fév", priority: "urgent", amount: "30 DT", progress: 0, cnam: true },
];

/** Per-patient analysis history — used by LaboratoryPatients */
export const mockLabPatientAnalysesHistory: Record<string, { id: string; type: string; date: string; status: string; doctor: string; amount: string }[]> = {
  "Amine Ben Ali": [
    { id: "ANA-001", type: "Glycémie à jeun", date: "20 Fév 2026", status: "ready", doctor: "Dr. Bouazizi", amount: "15 DT" },
    { id: "ANA-005", type: "HbA1c", date: "15 Jan 2026", status: "sent", doctor: "Dr. Bouazizi", amount: "35 DT" },
    { id: "ANA-009", type: "Bilan lipidique", date: "10 Nov 2025", status: "sent", doctor: "Dr. Bouazizi", amount: "40 DT" },
  ],
  "Fatma Trabelsi": [
    { id: "ANA-002", type: "NFS", date: "18 Fév 2026", status: "in_progress", doctor: "Dr. Gharbi", amount: "25 DT" },
    { id: "ANA-006", type: "Bilan rénal", date: "5 Jan 2026", status: "sent", doctor: "Dr. Gharbi", amount: "35 DT" },
  ],
  "Mohamed Sfar": [
    { id: "ANA-003", type: "Bilan hépatique", date: "15 Fév 2026", status: "waiting", doctor: "Dr. Bouazizi", amount: "45 DT" },
  ],
  "Nadia Jemni": [
    { id: "ANA-004", type: "TSH", date: "10 Fév 2026", status: "ready", doctor: "Dr. Hammami", amount: "30 DT" },
    { id: "ANA-007", type: "Vitamine D", date: "20 Déc 2025", status: "sent", doctor: "Dr. Hammami", amount: "25 DT" },
  ],
};

export const mockLabPatients = [
  { name: "Amine Ben Ali", age: 34, lastAnalysis: "Bilan sanguin", date: "20 Fév 2026", status: "in_progress", total: 8, phone: "+216 71 234 567", cnam: true, avatar: "AB" },
  { name: "Fatma Trabelsi", age: 56, lastAnalysis: "Analyse d'urine", date: "19 Fév 2026", status: "ready", total: 12, phone: "+216 22 345 678", cnam: true, avatar: "FT" },
  { name: "Mohamed Sfar", age: 28, lastAnalysis: "TSH", date: "20 Fév 2026", status: "waiting", total: 3, phone: "+216 55 456 789", cnam: false, avatar: "MS" },
  { name: "Nadia Jemni", age: 67, lastAnalysis: "Glycémie", date: "18 Fév 2026", status: "ready", total: 15, phone: "+216 98 567 890", cnam: true, avatar: "NJ" },
  { name: "Sami Ayari", age: 42, lastAnalysis: "Hémogramme", date: "20 Fév 2026", status: "in_progress", total: 6, phone: "+216 29 678 901", cnam: true, avatar: "SA" },
  { name: "Rania Meddeb", age: 38, lastAnalysis: "Bilan lipidique", date: "17 Fév 2026", status: "ready", total: 9, phone: "+216 52 789 012", cnam: true, avatar: "RM" },
];

export const mockLabAnalysesDetail: LabAnalysis[] = [
  { id: "ANA-001", patient: "Amine Ben Ali", type: "Bilan sanguin complet", doctor: "Dr. Bouazizi", date: "20 Fév 2026", status: "in_progress", amount: "85 DT", cnam: true, avatar: "AB", priority: "normal" },
  { id: "ANA-002", patient: "Fatma Trabelsi", type: "Analyse d'urine", doctor: "Dr. Gharbi", date: "19 Fév 2026", status: "ready", amount: "35 DT", cnam: true, avatar: "FT", priority: "normal" },
  { id: "ANA-003", patient: "Mohamed Sfar", type: "TSH - Thyroïde", doctor: "Dr. Hammami", date: "20 Fév 2026", status: "waiting", amount: "45 DT", cnam: false, avatar: "MS", priority: "urgent" },
  { id: "ANA-004", patient: "Nadia Jemni", type: "Glycémie à jeun", doctor: "Dr. Bouazizi", date: "18 Fév 2026", status: "ready", amount: "25 DT", cnam: true, avatar: "NJ", priority: "normal" },
  { id: "ANA-005", patient: "Sami Ayari", type: "Hémogramme (NFS)", doctor: "Dr. Bouazizi", date: "20 Fév 2026", status: "in_progress", amount: "40 DT", cnam: true, avatar: "SA", priority: "normal" },
  { id: "ANA-006", patient: "Rania Meddeb", type: "Bilan lipidique", doctor: "Dr. Bouazizi", date: "17 Fév 2026", status: "ready", amount: "55 DT", cnam: true, avatar: "RM", priority: "normal" },
];

export const mockLabAnalysisTypes = ["Bilan sanguin complet", "NFS (Hémogramme)", "Glycémie à jeun", "HbA1c", "Bilan lipidique", "TSH", "Bilan hépatique", "Bilan rénal", "CRP", "Analyse d'urine", "Vitamine D", "Sérologie"];

export const mockLabResults: LabResult[] = [
  {
    id: "RES-001", analysis: "ANA-002", patient: "Fatma Trabelsi", type: "Analyse d'urine", date: "19 Fév 2026",
    doctor: "Dr. Gharbi", sent: true, amount: "35 DT", cnam: true, avatar: "FT",
    values: [
      { name: "pH", value: "6.5", ref: "5.0 - 8.0", status: "normal" },
      { name: "Protéines", value: "Négatif", ref: "Négatif", status: "normal" },
      { name: "Glucose", value: "Négatif", ref: "Négatif", status: "normal" },
      { name: "Leucocytes", value: "Négatif", ref: "Négatif", status: "normal" },
    ],
  },
  {
    id: "RES-002", analysis: "ANA-004", patient: "Nadia Jemni", type: "Glycémie à jeun", date: "18 Fév 2026",
    doctor: "Dr. Bouazizi", sent: false, amount: "25 DT", cnam: true, avatar: "NJ",
    values: [{ name: "Glycémie", value: "1.32 g/L", ref: "0.70 - 1.10 g/L", status: "high" }],
  },
  {
    id: "RES-003", analysis: "ANA-006", patient: "Rania Meddeb", type: "Bilan lipidique", date: "17 Fév 2026",
    doctor: "Dr. Bouazizi", sent: true, amount: "55 DT", cnam: true, avatar: "RM",
    values: [
      { name: "Cholestérol total", value: "2.40 g/L", ref: "< 2.00 g/L", status: "high" },
      { name: "HDL", value: "0.55 g/L", ref: "> 0.40 g/L", status: "normal" },
      { name: "LDL", value: "1.60 g/L", ref: "< 1.30 g/L", status: "high" },
      { name: "Triglycérides", value: "1.20 g/L", ref: "< 1.50 g/L", status: "normal" },
    ],
  },
];
