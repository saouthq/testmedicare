/**
 * labStore.ts — Cross-role lab request tracking (localStorage).
 * Doctor creates demand → Lab receives → Lab uploads PDFs → Lab transmits → Patient/Doctor see.
 *
 * // TODO BACKEND: Replace with API calls + real-time updates
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";

export type LabDemandStatus = "received" | "in_progress" | "results_ready" | "transmitted";

export interface LabPdfItem {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}

export interface SharedLabDemand {
  id: string;
  patient: string;
  patientDob: string;
  avatar: string;
  assurance: string;
  numAssurance?: string;
  prescriber: string;
  examens: string[];
  status: LabDemandStatus;
  date: string;
  priority: "normal" | "urgent";
  amount: string;
  pdfs: LabPdfItem[];
  notes?: string;
}

const store = createStore<SharedLabDemand[]>("medicare_lab_demands", []);

export const labStore = store;

export function useSharedLabDemands() {
  return useStore(store);
}

/** Initialize store with mock data if empty */
export function initLabStoreIfEmpty(mockDemands: SharedLabDemand[]) {
  const current = store.read();
  if (current.length === 0) {
    store.set(mockDemands);
  }
}

/** Update lab demand status */
export function updateLabDemandStatus(id: string, status: LabDemandStatus) {
  store.set((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

  if (status === "transmitted") {
    const demand = store.read().find((d) => d.id === id);
    if (demand) {
      // Notify doctor
      pushNotification({
        type: "lab_results",
        title: "Résultats d'analyses transmis",
        message: `Les résultats de ${demand.examens.join(", ")} pour ${demand.patient} sont disponibles.`,
        targetRole: "doctor",
        actionLink: "/dashboard/doctor/patients",
      });
      // Notify patient
      pushNotification({
        type: "lab_results",
        title: "Résultats d'analyses disponibles",
        message: `Vos résultats de ${demand.examens.join(", ")} sont prêts. Consultez votre dossier médical.`,
        targetRole: "patient",
        actionLink: "/dashboard/patient/health",
      });
    }
  }
}

/** Add PDF to a demand */
export function addLabPdf(demandId: string, pdf: LabPdfItem) {
  store.set((prev) =>
    prev.map((d) => (d.id === demandId ? { ...d, pdfs: [...d.pdfs, pdf] } : d))
  );
}

/** Remove PDF from a demand */
export function removeLabPdf(demandId: string, pdfId: string) {
  store.set((prev) =>
    prev.map((d) => (d.id === demandId ? { ...d, pdfs: d.pdfs.filter((p) => p.id !== pdfId) } : d))
  );
}

/** Create a new lab demand from doctor consultation → lab inbox.
 *  // TODO BACKEND: POST /api/lab/demands
 */
export function createLabDemand(data: {
  patient: string;
  patientDob?: string;
  avatar: string;
  assurance?: string;
  prescriber: string;
  examens: string[];
  priority?: "normal" | "urgent";
  notes?: string;
}) {
  const id = `DEM-${Date.now().toString(36).toUpperCase()}`;
  const demand: SharedLabDemand = {
    id,
    patient: data.patient,
    patientDob: data.patientDob || "",
    avatar: data.avatar,
    assurance: data.assurance || "Sans assurance",
    prescriber: data.prescriber,
    examens: data.examens,
    status: "received",
    date: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
    priority: data.priority || "normal",
    amount: `${data.examens.length * 25} DT`,
    pdfs: [],
    notes: data.notes,
  };
  store.set((prev) => [demand, ...prev]);

  // Notify lab
  pushNotification({
    type: "lab_results",
    title: "Nouvelle demande d'analyses",
    message: `Dr. ${data.prescriber} a prescrit ${data.examens.join(", ")} pour ${data.patient}.`,
    targetRole: "laboratory",
    actionLink: "/dashboard/laboratory/analyses",
  });

  return id;
}
