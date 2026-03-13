/**
 * adminModulesStore.ts — Global platform module toggles controlled by admin.
 * When a module is disabled, it affects ALL roles: sidebar links hidden, pages show maintenance, workflows blocked.
 *
 * // TODO BACKEND: Replace with server-side feature flags
 */
import { createStore, useStore } from "./crossRoleStore";
import { appendLog } from "@/services/admin/adminAuditService";
import { saveAdminConfig, loadAdminConfig } from "./adminConfigSync";

/**
 * Every toggleable module in the platform.
 * Each module maps to specific sidebar links, pages, and workflows.
 */
export interface PlatformModule {
  id: string;
  label: string;
  description: string;
  category: "core" | "communication" | "clinical" | "finance" | "professional" | "public";
  /** Which roles are impacted when this module is disabled */
  affectedRoles: string[];
  /** Sidebar URLs that should be hidden when disabled */
  sidebarUrls: string[];
  /** Route prefixes that should show maintenance screen when disabled */
  routePrefixes: string[];
  /** Whether this module is critical (cannot be disabled without confirmation) */
  critical?: boolean;
}

export const platformModules: PlatformModule[] = [
  // ── Core ──
  {
    id: "appointments",
    label: "Rendez-vous",
    description: "Prise de RDV en ligne, planning médecin, agenda secrétaire, salle d'attente",
    category: "core",
    affectedRoles: ["patient", "doctor", "secretary"],
    sidebarUrls: [
      "/dashboard/patient/appointments", "/search", "/dashboard/doctor/schedule",
      "/dashboard/doctor/waiting-room", "/dashboard/secretary/agenda",
    ],
    routePrefixes: [
      "/dashboard/patient/appointments", "/search", "/booking",
      "/dashboard/doctor/schedule", "/dashboard/doctor/waiting-room",
      "/dashboard/secretary/agenda", "/find-appointments", "/my-appointments",
    ],
    critical: true,
  },
  {
    id: "consultations",
    label: "Consultations",
    description: "Consultations en cabinet, notes cliniques, clôture, CIM-10",
    category: "clinical",
    affectedRoles: ["doctor"],
    sidebarUrls: ["/dashboard/doctor/consultations", "/dashboard/doctor/consultation/new"],
    routePrefixes: ["/dashboard/doctor/consultations", "/dashboard/doctor/consultation"],
  },
  {
    id: "teleconsultation",
    label: "Téléconsultation",
    description: "Consultations vidéo, precheck, salle d'attente virtuelle, résumé",
    category: "clinical",
    affectedRoles: ["patient", "doctor"],
    sidebarUrls: ["/dashboard/patient/teleconsultation", "/dashboard/doctor/teleconsultation"],
    routePrefixes: ["/dashboard/patient/teleconsultation", "/dashboard/doctor/teleconsultation"],
  },
  {
    id: "prescriptions",
    label: "Ordonnances",
    description: "Création, envoi, renouvellement d'ordonnances, envoi pharmacie",
    category: "clinical",
    affectedRoles: ["patient", "doctor", "pharmacy"],
    sidebarUrls: [
      "/dashboard/patient/prescriptions", "/dashboard/doctor/prescriptions",
      "/dashboard/pharmacy/prescriptions",
    ],
    routePrefixes: [
      "/dashboard/patient/prescriptions", "/dashboard/doctor/prescriptions",
      "/dashboard/pharmacy/prescriptions",
    ],
  },
  {
    id: "patient_health",
    label: "Espace Santé Patient",
    description: "Dossier médical, antécédents, allergies, vaccinations, documents",
    category: "clinical",
    affectedRoles: ["patient"],
    sidebarUrls: ["/dashboard/patient/health"],
    routePrefixes: ["/dashboard/patient/health"],
  },
  {
    id: "patient_records",
    label: "Dossier Patient (Médecin)",
    description: "Accès au dossier patient côté médecin, timeline, notes privées",
    category: "clinical",
    affectedRoles: ["doctor"],
    sidebarUrls: ["/dashboard/doctor/patients"],
    routePrefixes: ["/dashboard/doctor/patients"],
  },
  // ── Communication ──
  {
    id: "messaging",
    label: "Messagerie",
    description: "Chat interne entre patients, médecins, pharmacies, laboratoires",
    category: "communication",
    affectedRoles: ["patient", "doctor", "pharmacy", "laboratory", "secretary"],
    sidebarUrls: [
      "/dashboard/patient/messages", "/dashboard/doctor/messages",
      "/dashboard/pharmacy/messages", "/dashboard/laboratory/messages",
      "/dashboard/secretary/messages",
    ],
    routePrefixes: [
      "/dashboard/patient/messages", "/dashboard/doctor/messages",
      "/dashboard/pharmacy/messages", "/dashboard/laboratory/messages",
      "/dashboard/secretary/messages",
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Centre de notifications cross-rôle, alertes, rappels",
    category: "communication",
    affectedRoles: ["patient"],
    sidebarUrls: ["/dashboard/patient/notifications"],
    routePrefixes: ["/dashboard/patient/notifications"],
  },
  // ── Professional ──
  {
    id: "laboratory",
    label: "Espace Laboratoire",
    description: "Réception demandes, pipeline analyses, transmission résultats",
    category: "professional",
    affectedRoles: ["laboratory"],
    sidebarUrls: [
      "/dashboard/laboratory", "/dashboard/laboratory/analyses",
      "/dashboard/laboratory/results", "/dashboard/laboratory/patients",
    ],
    routePrefixes: ["/dashboard/laboratory"],
    critical: true,
  },
  {
    id: "pharmacy",
    label: "Espace Pharmacie",
    description: "Gestion ordonnances, stock, historique, garde de nuit",
    category: "professional",
    affectedRoles: ["pharmacy"],
    sidebarUrls: [
      "/dashboard/pharmacy", "/dashboard/pharmacy/prescriptions",
      "/dashboard/pharmacy/stock", "/dashboard/pharmacy/history",
    ],
    routePrefixes: ["/dashboard/pharmacy"],
    critical: true,
  },
  {
    id: "secretary",
    label: "Espace Secrétaire",
    description: "Dashboard secrétaire, facturation, documents, gestion patients",
    category: "professional",
    affectedRoles: ["secretary"],
    sidebarUrls: [
      "/dashboard/secretary", "/dashboard/secretary/agenda",
      "/dashboard/secretary/patients", "/dashboard/secretary/billing",
      "/dashboard/secretary/office", "/dashboard/secretary/documents",
    ],
    routePrefixes: ["/dashboard/secretary"],
    critical: true,
  },
  // ── Finance ──
  {
    id: "billing",
    label: "Facturation",
    description: "Facturation cabinet, abonnements, paiements téléconsultation",
    category: "finance",
    affectedRoles: ["doctor", "secretary"],
    sidebarUrls: ["/dashboard/doctor/billing", "/dashboard/secretary/billing"],
    routePrefixes: ["/dashboard/doctor/billing", "/dashboard/secretary/billing"],
  },
  {
    id: "ai_assistant",
    label: "Assistant IA",
    description: "Assistant IA pour les médecins, aide au diagnostic, suggestions",
    category: "clinical",
    affectedRoles: ["doctor"],
    sidebarUrls: ["/dashboard/doctor/ai-assistant"],
    routePrefixes: ["/dashboard/doctor/ai-assistant"],
  },
  {
    id: "doctor_connect",
    label: "Connect (Intégrations)",
    description: "Intégrations tierces, API, connecteurs",
    category: "professional",
    affectedRoles: ["doctor"],
    sidebarUrls: ["/dashboard/doctor/connect"],
    routePrefixes: ["/dashboard/doctor/connect"],
  },
  {
    id: "doctor_stats",
    label: "Statistiques Médecin",
    description: "Tableaux de bord analytiques, KPIs, graphiques",
    category: "finance",
    affectedRoles: ["doctor"],
    sidebarUrls: ["/dashboard/doctor/stats"],
    routePrefixes: ["/dashboard/doctor/stats"],
  },
  {
    id: "doctor_secretary_mgmt",
    label: "Gestion Secrétaires",
    description: "Le médecin peut gérer ses secrétaires",
    category: "professional",
    affectedRoles: ["doctor"],
    sidebarUrls: ["/dashboard/doctor/secretary"],
    routePrefixes: ["/dashboard/doctor/secretary"],
  },
  // ── Public ──
  {
    id: "public_directories",
    label: "Annuaires Publics",
    description: "Annuaires cliniques, hôpitaux, pharmacies, médicaments",
    category: "public",
    affectedRoles: [],
    sidebarUrls: [],
    routePrefixes: ["/clinics", "/hospitals", "/pharmacies", "/medicaments", "/clinic/", "/hospital/", "/pharmacy/", "/medicament/"],
  },
  {
    id: "public_profiles",
    label: "Profils Publics Médecins",
    description: "Pages profil public des médecins avec prise de RDV",
    category: "public",
    affectedRoles: [],
    sidebarUrls: [],
    routePrefixes: ["/doctor/"],
  },
  // ── Établissements ──
  {
    id: "hospital",
    label: "Espace Hôpital",
    description: "Gestion hospitalière : services, patients, personnel, équipements",
    category: "professional",
    affectedRoles: ["hospital"],
    sidebarUrls: [
      "/dashboard/hospital", "/dashboard/hospital/departments",
      "/dashboard/hospital/patients", "/dashboard/hospital/staff",
      "/dashboard/hospital/equipment",
    ],
    routePrefixes: ["/dashboard/hospital"],
    critical: true,
  },
  {
    id: "clinic_mgmt",
    label: "Espace Clinique",
    description: "Gestion clinique : médecins, RDV, salles, planning",
    category: "professional",
    affectedRoles: ["clinic"],
    sidebarUrls: [
      "/dashboard/clinic", "/dashboard/clinic/doctors",
      "/dashboard/clinic/appointments", "/dashboard/clinic/rooms",
    ],
    routePrefixes: ["/dashboard/clinic"],
    critical: true,
  },
];

// ── Store ──
export type ModuleStates = Record<string, boolean>;

const defaultStates: ModuleStates = Object.fromEntries(
  platformModules.map(m => [m.id, true])
);

const store = createStore<ModuleStates>("medicare_admin_modules", defaultStates);

export function useAdminModules() {
  return useStore(store);
}

export function isModuleEnabled(moduleId: string): boolean {
  const states = store.read();
  return states[moduleId] !== false; // default to enabled
}

/** Check if a specific route is allowed (not in a disabled module) */
export function isRouteEnabled(path: string): boolean {
  const states = store.read();
  for (const mod of platformModules) {
    if (states[mod.id] === false) {
      for (const prefix of mod.routePrefixes) {
        if (path.startsWith(prefix) || path === prefix) {
          return false;
        }
      }
    }
  }
  return true;
}

/** Check if a sidebar URL should be visible */
export function isSidebarUrlEnabled(url: string): boolean {
  const states = store.read();
  for (const mod of platformModules) {
    if (states[mod.id] === false) {
      if (mod.sidebarUrls.includes(url)) return false;
    }
  }
  return true;
}

/** Get the disabled module info for a given route (for maintenance screen) */
export function getDisabledModuleForRoute(path: string): PlatformModule | null {
  const states = store.read();
  for (const mod of platformModules) {
    if (states[mod.id] === false) {
      for (const prefix of mod.routePrefixes) {
        if (path.startsWith(prefix) || path === prefix) {
          return mod;
        }
      }
    }
  }
  return null;
}

/** Toggle a module on/off */
export function toggleModule(moduleId: string, enabled: boolean, adminName?: string) {
  store.set(prev => ({ ...prev, [moduleId]: enabled }));
  const mod = platformModules.find(m => m.id === moduleId);
  appendLog(
    enabled ? "module_enabled" : "module_disabled",
    "module",
    moduleId,
    `Module "${mod?.label || moduleId}" ${enabled ? "activé" : "désactivé"} par ${adminName || "admin"}`
  );
  saveAdminConfig("admin_modules", store.read());
}

/** Bulk update modules */
export function setModuleStates(states: ModuleStates) {
  store.set(states);
}

/** Get count of disabled modules */
export function getDisabledCount(): number {
  const states = store.read();
  return Object.values(states).filter(v => v === false).length;
}
