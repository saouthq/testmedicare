/**
 * prescriptionsStore.ts — Cross-role prescription tracking.
 * Patient sends → Pharmacy sees → Pharmacy responds → Patient sees status.
 * Dual-mode: localStorage (demo) + Supabase pharmacy_prescriptions (production).
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { pharmacyRxStore } from "./pharmacyStore";
import { getAppMode } from "./authStore";
import { supabase } from "@/integrations/supabase/client";
import type { PharmacyPrescription } from "@/types";

export interface PharmacySentItem {
  prescriptionId: string;
  pharmacyId: string;
  pharmacyName: string;
  status: "pending" | "preparing" | "ready" | "unavailable";
  respondedAt?: string;
  pickupTime?: string;
  alternatives?: { medication: string; alternative: string }[];
}

export interface SharedPrescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  items: string[];
  assurance: string;
  total: string;
  sentToPharmacies: PharmacySentItem[];
}

const store = createStore<SharedPrescription[]>("medicare_shared_prescriptions", []);

export const prescriptionsStore = store;

export function useSharedPrescriptions() {
  return useStore(store);
}

/** Patient sends prescription to pharmacies */
export async function sendPrescriptionToPharmacies(
  prescription: Omit<SharedPrescription, "sentToPharmacies">,
  pharmacies: { id: string; name: string }[]
) {
  const items: PharmacySentItem[] = pharmacies.map((ph) => ({
    prescriptionId: prescription.id,
    pharmacyId: ph.id,
    pharmacyName: ph.name,
    status: "pending" as const,
  }));

  store.set((prev) => {
    const existing = prev.find((p) => p.id === prescription.id);
    if (existing) {
      return prev.map((p) =>
        p.id === prescription.id
          ? { ...p, sentToPharmacies: [...p.sentToPharmacies, ...items] }
          : p
      );
    }
    return [...prev, { ...prescription, sentToPharmacies: items }];
  });

  // Persist to Supabase: create pharmacy_prescriptions entries
  if (getAppMode() === "production") {
    for (const ph of pharmacies) {
      try {
        await (supabase.from as any)("pharmacy_prescriptions").insert({
          prescription_id: prescription.id,
          pharmacy_id: ph.id,
          patient_name: prescription.patientName,
          doctor_name: prescription.doctorName,
          date: prescription.date,
          items: prescription.items.map(name => ({ name, dosage: "", quantity: 1, availability: "available", price: "—" })),
          status: "received",
          total: prescription.total || "0 DT",
          assurance: prescription.assurance || "",
          urgent: false,
        });
      } catch (e) {
        console.warn("[sendPrescriptionToPharmacies] Supabase insert failed:", e);
      }
    }
  }

  // Also create entries in pharmacyRxStore so pharmacy sees incoming prescriptions (demo mode)
  if (getAppMode() === "demo") {
    for (const ph of pharmacies) {
      const rxId = `rx-sent-${Date.now()}-${ph.id}`;
      const pharmacyRx: PharmacyPrescription = {
        id: rxId,
        patient: prescription.patientName,
        avatar: prescription.patientName.split(" ").map(w => w[0]).join("").toUpperCase(),
        doctor: prescription.doctorName,
        date: prescription.date,
        items: prescription.items.map(name => ({ name, dosage: "", quantity: 1, availability: "available" as const, price: "—" })),
        status: "received",
        total: prescription.total || "—",
        assurance: prescription.assurance || "Sans assurance",
        urgent: false,
        patientPhone: "",
      };
      pharmacyRxStore.set(prev => [...prev, pharmacyRx]);
    }
  }

  // Notify pharmacy
  pushNotification({
    type: "prescription_sent",
    title: "Nouvelle ordonnance reçue",
    message: `${prescription.patientName} a envoyé l'ordonnance ${prescription.id}.`,
    targetRole: "pharmacy",
    actionLink: "/dashboard/pharmacy/prescriptions",
  });
}

/** Pharmacy responds to a prescription */
export function pharmacyRespond(
  prescriptionId: string,
  pharmacyId: string,
  response: {
    status: "preparing" | "ready" | "unavailable";
    pickupTime?: string;
    alternatives?: { medication: string; alternative: string }[];
  }
) {
  store.set((prev) =>
    prev.map((p) => {
      if (p.id !== prescriptionId) return p;
      return {
        ...p,
        sentToPharmacies: p.sentToPharmacies.map((ph) => {
          if (ph.pharmacyId !== pharmacyId) return ph;
          return {
            ...ph,
            ...response,
            respondedAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          };
        }),
      };
    })
  );

  // Notify patient
  const rx = store.read().find((p) => p.id === prescriptionId);
  const phName = rx?.sentToPharmacies.find((ph) => ph.pharmacyId === pharmacyId)?.pharmacyName || "Pharmacie";

  if (response.status === "ready") {
    pushNotification({
      type: "pharmacy_ready",
      title: "Ordonnance prête à retirer",
      message: `${phName} confirme : votre ordonnance ${prescriptionId} est prête${response.pickupTime ? ` — retrait ${response.pickupTime}` : ""}.`,
      targetRole: "patient",
      actionLink: "/dashboard/patient/prescriptions",
    });
  } else if (response.status === "unavailable") {
    pushNotification({
      type: "generic",
      title: "Ordonnance non disponible",
      message: `${phName} ne peut pas honorer l'ordonnance ${prescriptionId}.`,
      targetRole: "patient",
      actionLink: "/dashboard/patient/prescriptions",
    });
  }
}
