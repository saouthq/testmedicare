/**
 * Mock data — Laboratory domain
 * Model: Lab receives demands from doctors, attaches PDF results, transmits back.
 * No structured values (normal/high/low). Results = 1..N PDF files only.
 */

/** A single PDF result file attached to a demand */
export interface LabPdf {
  id: string;
  name: string;
  size: string;       // e.g. "245 Ko"
  uploadedAt: string; // display date
}

/** Lab demand status lifecycle: received → in_progress → results_ready → transmitted */
export type LabDemandStatus = "received" | "in_progress" | "results_ready" | "transmitted";

/** A demand created by a doctor, processed by the lab */
export interface LabDemand {
  id: string;
  patient: string;
  patientDob: string;
  avatar: string;
  assurance: string;        // "Assurance publique", "Maghrebia", "Sans assurance"…
  numAssurance?: string;
  prescriber: string;       // doctor name
  examens: string[];        // list of requested exams
  status: LabDemandStatus;
  date: string;             // date received
  priority: "normal" | "urgent";
  amount: string;
  pdfs: LabPdf[];           // result PDFs (0..N)
  notes?: string;           // internal lab notes
}

/* ── KPI stats ─────────────────────────────────────────── */
export const mockLabStats = [
  { label: "Reçues", value: "12", color: "bg-warning/10 text-warning", change: "+3 aujourd'hui" },
  { label: "En cours", value: "5", color: "bg-primary/10 text-primary", change: "2 urgentes" },
  { label: "Résultat prêt", value: "4", color: "bg-accent/10 text-accent", change: "à transmettre" },
  { label: "Transmis", value: "38", color: "bg-muted text-muted-foreground", change: "ce mois" },
];

/* ── Main demands list ─────────────────────────────────── */
export const mockLabDemands: LabDemand[] = [
  {
    id: "DEM-001", patient: "Amine Ben Ali", patientDob: "12/03/1992", avatar: "AB",
    assurance: "Assurance publique", numAssurance: "12345678",
    prescriber: "Dr. Bouazizi", examens: ["Bilan sanguin complet", "HbA1c"],
    status: "in_progress", date: "20 Fév 2026", priority: "normal", amount: "120 DT",
    pdfs: [], notes: "Prélèvement effectué à 8h30",
  },
  {
    id: "DEM-002", patient: "Fatma Trabelsi", patientDob: "05/11/1970", avatar: "FT",
    assurance: "CNRPS", numAssurance: "87654321",
    prescriber: "Dr. Gharbi", examens: ["Analyse d'urine", "ECBU"],
    status: "results_ready", date: "19 Fév 2026", priority: "normal", amount: "55 DT",
    pdfs: [
      { id: "PDF-001", name: "Résultat_Urine_FT.pdf", size: "245 Ko", uploadedAt: "20 Fév 2026" },
      { id: "PDF-002", name: "Résultat_ECBU_FT.pdf", size: "180 Ko", uploadedAt: "20 Fév 2026" },
    ],
  },
  {
    id: "DEM-003", patient: "Mohamed Sfar", patientDob: "22/07/1998", avatar: "MS",
    assurance: "Sans assurance",
    prescriber: "Dr. Hammami", examens: ["TSH", "T3", "T4"],
    status: "received", date: "20 Fév 2026", priority: "urgent", amount: "90 DT",
    pdfs: [],
  },
  {
    id: "DEM-004", patient: "Nadia Jemni", patientDob: "14/09/1959", avatar: "NJ",
    assurance: "Assurance publique", numAssurance: "11223344",
    prescriber: "Dr. Bouazizi", examens: ["Glycémie à jeun"],
    status: "transmitted", date: "18 Fév 2026", priority: "normal", amount: "25 DT",
    pdfs: [
      { id: "PDF-003", name: "Glycemie_NJ_180226.pdf", size: "120 Ko", uploadedAt: "18 Fév 2026" },
    ],
  },
  {
    id: "DEM-005", patient: "Sami Ayari", patientDob: "30/01/1984", avatar: "SA",
    assurance: "Maghrebia", numAssurance: "MG-55667",
    prescriber: "Dr. Bouazizi", examens: ["Hémogramme (NFS)"],
    status: "in_progress", date: "20 Fév 2026", priority: "normal", amount: "40 DT",
    pdfs: [],
  },
  {
    id: "DEM-006", patient: "Rania Meddeb", patientDob: "18/06/1988", avatar: "RM",
    assurance: "Assurance publique", numAssurance: "99887766",
    prescriber: "Dr. Gharbi", examens: ["Bilan lipidique"],
    status: "transmitted", date: "17 Fév 2026", priority: "normal", amount: "55 DT",
    pdfs: [
      { id: "PDF-004", name: "Bilan_Lipidique_RM.pdf", size: "310 Ko", uploadedAt: "17 Fév 2026" },
    ],
  },
  {
    id: "DEM-007", patient: "Karim Mansour", patientDob: "02/12/1975", avatar: "KM",
    assurance: "STAR",
    prescriber: "Dr. Bouazizi", examens: ["CRP", "VS"],
    status: "received", date: "20 Fév 2026", priority: "urgent", amount: "30 DT",
    pdfs: [],
  },
  {
    id: "DEM-008", patient: "Leila Chahed", patientDob: "25/04/1991", avatar: "LC",
    assurance: "GAT", numAssurance: "GT-12340",
    prescriber: "Dr. Hammami", examens: ["Bilan hépatique", "Bilan rénal"],
    status: "results_ready", date: "19 Fév 2026", priority: "normal", amount: "80 DT",
    pdfs: [
      { id: "PDF-005", name: "Bilan_Hepatique_LC.pdf", size: "290 Ko", uploadedAt: "20 Fév 2026" },
    ],
    notes: "Bilan rénal encore en attente de relecture",
  },
];

/* ── Exam types reference ──────────────────────────────── */
export const mockLabAnalysisTypes = [
  "Bilan sanguin complet", "NFS (Hémogramme)", "Glycémie à jeun", "HbA1c",
  "Bilan lipidique", "TSH", "T3", "T4", "Bilan hépatique", "Bilan rénal",
  "CRP", "VS", "Analyse d'urine", "ECBU", "Vitamine D", "Sérologie",
];

/* ── Patient list for lab ──────────────────────────────── */
export const mockLabPatients = [
  { name: "Amine Ben Ali", dob: "12/03/1992", assurance: "CNAM", phone: "+216 71 234 567", avatar: "AB", totalDemands: 4 },
  { name: "Fatma Trabelsi", dob: "05/11/1970", assurance: "CNRPS", phone: "+216 22 345 678", avatar: "FT", totalDemands: 6 },
  { name: "Mohamed Sfar", dob: "22/07/1998", assurance: "Sans assurance", phone: "+216 55 456 789", avatar: "MS", totalDemands: 1 },
  { name: "Nadia Jemni", dob: "14/09/1959", assurance: "CNAM", phone: "+216 98 567 890", avatar: "NJ", totalDemands: 8 },
  { name: "Sami Ayari", dob: "30/01/1984", assurance: "Maghrebia", phone: "+216 29 678 901", avatar: "SA", totalDemands: 3 },
  { name: "Rania Meddeb", dob: "18/06/1988", assurance: "CNAM", phone: "+216 52 789 012", avatar: "RM", totalDemands: 5 },
  { name: "Karim Mansour", dob: "02/12/1975", assurance: "STAR", phone: "+216 50 890 123", avatar: "KM", totalDemands: 2 },
  { name: "Leila Chahed", dob: "25/04/1991", assurance: "GAT", phone: "+216 23 901 234", avatar: "LC", totalDemands: 3 },
];
