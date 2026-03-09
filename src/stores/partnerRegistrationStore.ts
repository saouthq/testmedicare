/**
 * Partner Registration Store — shared between BecomePartner (public) and AdminVerifications (admin)
 * Persists in localStorage so registrations created on the public page appear in admin KYC queue.
 * TODO BACKEND: Replace with real API
 */
import { appendLog } from "@/services/admin/adminAuditService";
import { getPromotions } from "@/services/admin/adminPromotionsService";

const REG_KEY = "medicare_partner_registrations";

export type PartnerType = "doctor" | "lab" | "pharmacy" | "clinic";
export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface PartnerRegistration {
  id: string;
  type: PartnerType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization?: string;
  activity: string; // generaliste, specialiste, dentiste, kine, laboratory, pharmacy, clinic
  specialty?: string;
  city: string;
  plan: string; // Essentiel, Pro, Cabinet+, Standard, Premium, Établissement
  planPrice: number;
  billing: "monthly" | "yearly";
  promoApplied?: string; // promo name if auto-applied
  promoId?: string;
  message?: string;
  status: RegistrationStatus;
  submittedAt: string;
  docs: string[];
  events: { id: string; type: string; text: string; author: string; createdAt: string }[];
}

// ── Persistence ──
const getStored = (): PartnerRegistration[] => {
  try {
    const raw = localStorage.getItem(REG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const save = (data: PartnerRegistration[]) => localStorage.setItem(REG_KEY, JSON.stringify(data));

// ── Public API ──

export const getRegistrations = (): PartnerRegistration[] => getStored();

export const getRegistrationsByType = (type: PartnerType): PartnerRegistration[] =>
  getStored().filter(r => r.type === type);

export const getPendingCount = (): number =>
  getStored().filter(r => r.status === "pending").length;

/** Map activity to entity type */
const activityToType = (activity: string): PartnerType => {
  if (["generaliste", "specialiste", "dentiste", "kine"].includes(activity)) return "doctor";
  if (activity === "laboratory") return "lab";
  if (activity === "pharmacy") return "pharmacy";
  return "clinic";
};

/** Auto-generate expected docs based on type */
const getRequiredDocs = (type: PartnerType): string[] => {
  switch (type) {
    case "doctor": return ["Diplôme de médecine", "CIN recto/verso", "Attestation Ordre des médecins"];
    case "lab": return ["Autorisation d'exercice", "Registre de commerce", "CIN gérant"];
    case "pharmacy": return ["Licence de pharmacie", "Registre de commerce", "CIN titulaire"];
    case "clinic": return ["Autorisation sanitaire", "Registre de commerce", "Convention cadre"];
  }
};

/** Check if an active promo applies to this registration */
const findApplicablePromo = (plan: string): { name: string; id: string } | null => {
  const promos = getPromotions();
  const now = new Date();
  const active = promos.filter(p =>
    p.status === "active" &&
    new Date(p.startDate) <= now &&
    new Date(p.endDate) >= now &&
    p.newDoctorsOnly &&
    p.autoApply
  );

  if (active.length === 0) return null;

  // Find best match (target "all" or matching plan)
  const planKey = plan.toLowerCase().includes("pro") || plan.toLowerCase().includes("premium") ? "pro" : "basic";
  const match = active.find(p => p.target === "all" || p.target === planKey);
  return match ? { name: match.name, id: match.id } : null;
};

/** Submit a partner registration from the public page */
export const submitRegistration = (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization?: string;
  activity: string;
  specialty?: string;
  city: string;
  plan: string;
  planPrice: number;
  billing: "monthly" | "yearly";
  message?: string;
}): PartnerRegistration => {
  const type = activityToType(data.activity);
  const docs = getRequiredDocs(type);
  const promo = findApplicablePromo(data.plan);
  const now = new Date().toISOString();

  const entityName = type === "doctor"
    ? `Dr. ${data.firstName} ${data.lastName}`
    : data.organization || `${data.firstName} ${data.lastName}`;

  const registration: PartnerRegistration = {
    id: `reg-${Date.now()}`,
    type,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    organization: data.organization,
    activity: data.activity,
    specialty: data.specialty,
    city: data.city,
    plan: data.plan,
    planPrice: data.planPrice,
    billing: data.billing,
    promoApplied: promo?.name,
    promoId: promo?.id,
    message: data.message,
    status: "pending",
    submittedAt: now,
    docs: docs.map(d => `${d} (en attente)`),
    events: [
      {
        id: `evt-${Date.now()}`,
        type: "submitted",
        text: `Inscription en ligne — Plan ${data.plan} (${data.planPrice} DT/${data.billing === "yearly" ? "an" : "mois"})${promo ? ` — Promo "${promo.name}" éligible` : ""}`,
        author: entityName,
        createdAt: now,
      },
    ],
  };

  const list = getStored();
  list.unshift(registration);
  save(list);

  appendLog("partner_registration", "registration", registration.id, `Nouvelle inscription ${type}: ${entityName} — Plan ${data.plan}`);

  return registration;
};

/** Update registration status (from admin) */
export const updateRegistrationStatus = (id: string, status: RegistrationStatus, motif: string): PartnerRegistration | null => {
  const list = getStored();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return null;

  list[idx].status = status;
  list[idx].events.push({
    id: `evt-${Date.now()}`,
    type: status,
    text: `${status === "approved" ? "Dossier approuvé" : "Dossier refusé"} — ${motif}`,
    author: "Admin",
    createdAt: new Date().toISOString(),
  });

  save(list);
  appendLog(`registration_${status}`, "registration", id, `${list[idx].firstName} ${list[idx].lastName}: ${motif}`);
  return list[idx];
};

/** Add an event to a registration */
export const addRegistrationEvent = (id: string, type: string, text: string): void => {
  const list = getStored();
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return;

  list[idx].events.push({
    id: `evt-${Date.now()}`,
    type,
    text,
    author: "Admin",
    createdAt: new Date().toISOString(),
  });

  save(list);
};
