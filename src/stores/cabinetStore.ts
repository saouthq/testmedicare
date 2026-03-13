/**
 * cabinetStore.ts — Cabinet / practice management.
 * Manages: cabinets, doctor↔cabinet affiliations, secretary↔cabinet affiliations.
 *
 * A cabinet can have multiple doctors and multiple secretaries.
 * A secretary can be affiliated to multiple cabinets.
 * A doctor can belong to multiple cabinets.
 *
 * // TODO BACKEND: Replace with API — GET/POST /api/cabinets, /api/cabinets/:id/secretaries
 */
import { createStore } from "./crossRoleStore";
import { useDemoOnlyStore } from "@/hooks/useDualData";
import { pushNotification } from "./notificationsStore";
import { appendLog } from "@/services/admin/adminAuditService";

// ── Types ──

export type SecretaryStatus = "invited" | "active" | "suspended";

export interface CabinetSecretary {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: SecretaryStatus;
  since: string;
  lastLogin: string | null;
  permissions: string[];
}

export interface Cabinet {
  id: string;
  name: string;
  address: string;
  phone: string;
  doctorIds: string[];       // doctor names/IDs affiliated
  secretaries: CabinetSecretary[];
}

export interface CabinetState {
  cabinets: Cabinet[];
  /** Currently selected cabinet ID (for secretary multi-cabinet context) */
  selectedCabinetId: string | null;
}

// ── Seed data ──

const SEED: CabinetState = {
  cabinets: [
    {
      id: "cab-1",
      name: "Cabinet Dr. Bouazizi",
      address: "15 Avenue Habib Bourguiba, Tunis",
      phone: "+216 71 234 567",
      doctorIds: ["Dr. Bouazizi", "Dr. Hammami"],
      secretaries: [
        {
          id: "sec-1",
          name: "Leila Hammami",
          email: "leila@cabinet-bouazizi.tn",
          phone: "+216 71 234 568",
          status: "active",
          since: "Jan 2025",
          lastLogin: "Aujourd'hui 08:30",
          permissions: ["agenda", "patients", "facturation", "documents"],
        },
        {
          id: "sec-2",
          name: "Sara Jelassi",
          email: "sara@cabinet-bouazizi.tn",
          phone: "+216 55 987 654",
          status: "active",
          since: "Mar 2025",
          lastLogin: "Hier 17:45",
          permissions: ["agenda", "patients"],
        },
      ],
    },
    {
      id: "cab-2",
      name: "Cabinet Dr. Gharbi — Cardio",
      address: "22 Rue de Marseille, Tunis",
      phone: "+216 71 345 678",
      doctorIds: ["Dr. Gharbi", "Dr. Bouazizi"],
      secretaries: [
        {
          id: "sec-1", // Same secretary across cabinets (multi-cabinet)
          name: "Leila Hammami",
          email: "leila@cabinet-bouazizi.tn",
          phone: "+216 71 234 568",
          status: "active",
          since: "Fév 2025",
          lastLogin: "Aujourd'hui 08:30",
          permissions: ["agenda", "patients"],
        },
      ],
    },
  ],
  selectedCabinetId: "cab-1",
};

const store = createStore<CabinetState>("medicare_cabinets", SEED);

export function useCabinetStore() {
  return useStore(store);
}

export function readCabinetState(): CabinetState {
  return store.read();
}

// ── Actions ──

/**
 * Get all cabinets for a specific doctor.
 */
export function getCabinetsForDoctor(doctorName: string): Cabinet[] {
  return store.read().cabinets.filter(c => c.doctorIds.includes(doctorName));
}

/**
 * Get all cabinets for a specific secretary.
 */
export function getCabinetsForSecretary(secretaryId: string): Cabinet[] {
  return store.read().cabinets.filter(c => c.secretaries.some(s => s.id === secretaryId));
}

/**
 * Get all doctors across all cabinets that a secretary manages.
 */
export function getDoctorsForSecretary(secretaryId: string): string[] {
  const cabinets = getCabinetsForSecretary(secretaryId);
  const doctors = new Set<string>();
  cabinets.forEach(c => c.doctorIds.forEach(d => doctors.add(d)));
  return Array.from(doctors);
}

/**
 * Select active cabinet (for secretary context switching).
 */
export function selectCabinet(cabinetId: string) {
  store.set(prev => ({ ...prev, selectedCabinetId: cabinetId }));
}

/**
 * Get the currently selected cabinet.
 */
export function getSelectedCabinet(): Cabinet | null {
  const state = store.read();
  return state.cabinets.find(c => c.id === state.selectedCabinetId) || state.cabinets[0] || null;
}

/**
 * Invite a new secretary to a cabinet.
 * // TODO BACKEND: POST /api/cabinets/:cabinetId/secretaries/invite — send email
 */
export function inviteSecretary(
  cabinetId: string,
  data: { name: string; email: string; phone: string; permissions: string[] },
  invitedBy = "Dr. Bouazizi"
) {
  const id = `sec-${Date.now()}`;
  const secretary: CabinetSecretary = {
    id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    status: "invited",
    since: new Date().toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
    lastLogin: null,
    permissions: data.permissions,
  };

  store.set(prev => ({
    ...prev,
    cabinets: prev.cabinets.map(c =>
      c.id === cabinetId ? { ...c, secretaries: [...c.secretaries, secretary] } : c
    ),
  }));

  pushNotification({
    type: "generic",
    title: "Nouvelle secrétaire invitée",
    message: `${data.name} a été invitée au cabinet par ${invitedBy}.`,
    targetRole: "doctor",
  });

  appendLog("secretary_invited", "secretary", id, `Secrétaire "${data.name}" invitée au cabinet par ${invitedBy}`, invitedBy);

  return id;
}

/**
 * Update secretary status in a cabinet.
 */
export function updateSecretaryStatus(cabinetId: string, secretaryId: string, status: SecretaryStatus, actorName = "Admin") {
  store.set(prev => ({
    ...prev,
    cabinets: prev.cabinets.map(c =>
      c.id === cabinetId
        ? { ...c, secretaries: c.secretaries.map(s => s.id === secretaryId ? { ...s, status } : s) }
        : c
    ),
  }));

  appendLog(`secretary_${status}`, "secretary", secretaryId, `Secrétaire ${secretaryId} → ${status} par ${actorName}`, actorName);
}

/**
 * Remove a secretary from a cabinet.
 */
export function removeSecretary(cabinetId: string, secretaryId: string, actorName = "Admin") {
  store.set(prev => ({
    ...prev,
    cabinets: prev.cabinets.map(c =>
      c.id === cabinetId
        ? { ...c, secretaries: c.secretaries.filter(s => s.id !== secretaryId) }
        : c
    ),
  }));

  appendLog("secretary_removed", "secretary", secretaryId, `Secrétaire ${secretaryId} retirée du cabinet ${cabinetId} par ${actorName}`, actorName);
}

/**
 * Create a new cabinet.
 * // TODO BACKEND: POST /api/cabinets
 */
export function createCabinet(data: { name: string; address: string; phone: string; doctorIds: string[] }) {
  const id = `cab-${Date.now()}`;
  store.set(prev => ({
    ...prev,
    cabinets: [...prev.cabinets, { ...data, id, secretaries: [] }],
  }));
  return id;
}
