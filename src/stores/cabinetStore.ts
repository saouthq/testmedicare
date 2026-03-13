/**
 * cabinetStore.ts — Cabinet / practice management.
 * Dual-mode: localStorage (demo) / Supabase cabinets + cabinet_members (production).
 */
import { createStore } from "./crossRoleStore";
import { useDemoOnlyStore } from "@/hooks/useDualData";
import { pushNotification } from "./notificationsStore";
import { appendLog } from "@/services/admin/adminAuditService";
import { getAppMode } from "./authStore";
import { supabase } from "@/integrations/supabase/client";

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
  doctorIds: string[];
  secretaries: CabinetSecretary[];
}

export interface CabinetState {
  cabinets: Cabinet[];
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
          id: "sec-1",
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
  const EMPTY: CabinetState = { cabinets: [], selectedCabinetId: null };
  return useDemoOnlyStore(store, EMPTY);
}

export function readCabinetState(): CabinetState {
  return store.read();
}

// ── Actions ──

export function getCabinetsForDoctor(doctorName: string): Cabinet[] {
  return store.read().cabinets.filter(c => c.doctorIds.includes(doctorName));
}

export function getCabinetsForSecretary(secretaryId: string): Cabinet[] {
  return store.read().cabinets.filter(c => c.secretaries.some(s => s.id === secretaryId));
}

export function getDoctorsForSecretary(secretaryId: string): string[] {
  const cabinets = getCabinetsForSecretary(secretaryId);
  const doctors = new Set<string>();
  cabinets.forEach(c => c.doctorIds.forEach(d => doctors.add(d)));
  return Array.from(doctors);
}

export function selectCabinet(cabinetId: string) {
  store.set(prev => ({ ...prev, selectedCabinetId: cabinetId }));
}

export function getSelectedCabinet(): Cabinet | null {
  const state = store.read();
  return state.cabinets.find(c => c.id === state.selectedCabinetId) || state.cabinets[0] || null;
}

export async function inviteSecretary(
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

  // Persist to Supabase
  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("cabinet_members").insert({
        cabinet_id: cabinetId,
        user_id: id, // placeholder — real user_id assigned on accept
        user_name: data.name,
        user_email: data.email,
        user_phone: data.phone,
        role: "secretary",
        status: "invited",
        permissions: data.permissions,
      });
    } catch {}
  }

  pushNotification({
    type: "generic",
    title: "Nouvelle secrétaire invitée",
    message: `${data.name} a été invitée au cabinet par ${invitedBy}.`,
    targetRole: "doctor",
  });

  appendLog("secretary_invited", "secretary", id, `Secrétaire "${data.name}" invitée au cabinet par ${invitedBy}`, invitedBy);
  return id;
}

export async function updateSecretaryStatus(cabinetId: string, secretaryId: string, status: SecretaryStatus, actorName = "Admin") {
  store.set(prev => ({
    ...prev,
    cabinets: prev.cabinets.map(c =>
      c.id === cabinetId
        ? { ...c, secretaries: c.secretaries.map(s => s.id === secretaryId ? { ...s, status } : s) }
        : c
    ),
  }));

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("cabinet_members")
        .update({ status })
        .eq("cabinet_id", cabinetId)
        .eq("user_id", secretaryId);
    } catch {}
  }

  appendLog(`secretary_${status}`, "secretary", secretaryId, `Secrétaire ${secretaryId} → ${status} par ${actorName}`, actorName);
}

export async function removeSecretary(cabinetId: string, secretaryId: string, actorName = "Admin") {
  store.set(prev => ({
    ...prev,
    cabinets: prev.cabinets.map(c =>
      c.id === cabinetId
        ? { ...c, secretaries: c.secretaries.filter(s => s.id !== secretaryId) }
        : c
    ),
  }));

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("cabinet_members")
        .delete()
        .eq("cabinet_id", cabinetId)
        .eq("user_id", secretaryId);
    } catch {}
  }

  appendLog("secretary_removed", "secretary", secretaryId, `Secrétaire ${secretaryId} retirée du cabinet ${cabinetId} par ${actorName}`, actorName);
}

export async function createCabinet(data: { name: string; address: string; phone: string; doctorIds: string[] }) {
  const id = `cab-${Date.now()}`;
  store.set(prev => ({
    ...prev,
    cabinets: [...prev.cabinets, { ...data, id, secretaries: [] }],
  }));

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return id;
      await (supabase.from as any)("cabinets").insert({
        id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        owner_id: session.user.id,
      });
    } catch {}
  }

  return id;
}
