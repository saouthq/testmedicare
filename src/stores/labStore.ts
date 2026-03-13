/**
 * labStore.ts — Cross-role lab request tracking.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { useSupabaseTable, useSupabaseRealtime, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useDualQuery } from "@/hooks/useDualData";
import { mapLabDemandRow } from "@/lib/supabaseMappers";

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
  return useDualQuery<SharedLabDemand[]>({
    store,
    tableName: "lab_demands",
    queryKey: ["lab_demands"],
    mapRowToLocal: mapLabDemandRow,
    orderBy: { column: "created_at", ascending: false },
  });
}

/** Supabase-aware hook for lab demands */
export function useLabDemandsSupabase() {
  const { userId, isAuthenticated } = useAuthReady();
  const [localDemands] = useStore(store);

  const query = useSupabaseTable<SharedLabDemand>({
    queryKey: ["lab_demands", userId || ""],
    tableName: "lab_demands",
    orderBy: { column: "created_at", ascending: false },
    enabled: isAuthenticated,
    fallbackData: localDemands,
  });

  useSupabaseRealtime("lab_demands", [["lab_demands", userId || ""]]);

  return query;
}

/** Initialize store with mock data if empty */
export function initLabStoreIfEmpty(mockDemands: SharedLabDemand[]) {
  const current = store.read();
  if (current.length === 0) {
    store.set(mockDemands);
  }
}

/** Update lab demand status */
export async function updateLabDemandStatus(id: string, status: LabDemandStatus) {
  store.set((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

  // Try Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("lab_demands").update({ status }).eq("id", id);
    }
  } catch {}

  if (status === "transmitted") {
    const demand = store.read().find((d) => d.id === id);
    if (demand) {
      pushNotification({
        type: "lab_results",
        title: "Résultats d'analyses transmis",
        message: `Les résultats de ${demand.examens.join(", ")} pour ${demand.patient} sont disponibles.`,
        targetRole: "doctor",
        actionLink: "/dashboard/doctor/patients",
      });
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

/** Create a new lab demand from doctor consultation → lab inbox. */
export async function createLabDemand(data: {
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

  // Try Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("lab_demands").insert({
        id,
        doctor_id: session.user.id,
        patient_name: data.patient,
        patient_dob: data.patientDob || "",
        patient_avatar: data.avatar,
        assurance: data.assurance || "Sans assurance",
        prescriber_name: data.prescriber,
        examens: data.examens,
        status: "received",
        date: demand.date,
        priority: data.priority || "normal",
        amount: demand.amount,
        pdfs: [],
        notes: data.notes || "",
      });
    }
  } catch (e) {
    console.warn("[createLabDemand] Supabase insert failed:", e);
  }

  pushNotification({
    type: "lab_results",
    title: "Nouvelle demande d'analyses",
    message: `Dr. ${data.prescriber} a prescrit ${data.examens.join(", ")} pour ${data.patient}.`,
    targetRole: "laboratory",
    actionLink: "/dashboard/laboratory/analyses",
  });

  return id;
}
