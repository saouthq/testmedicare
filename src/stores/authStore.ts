/**
 * authStore.ts — Centralized authentication state (demo mode).
 * Replaces all direct localStorage.userRole usage across the app.
 *
 * // TODO BACKEND: Replace with real JWT/session-based auth via API.
 */
import { createStore, useStore } from "./crossRoleStore";

export type UserRole = "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" | "admin" | "hospital" | "clinic";

export interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  establishment?: string;
  isDemo: boolean;
  /** For doctor role: the doctor name used in appointment store */
  doctorName?: string;
  /** For patient role: the patient ID in sharedPatientsStore */
  patientId?: number;
}

/** Pre-configured demo scenarios */
export interface DemoScenario {
  id: string;
  label: string;
  description: string;
  user: DemoUser;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "patient-amine",
    label: "Patient — Amine Ben Ali",
    description: "Patient avec RDV, ordonnances actives et historique",
    user: {
      id: "demo-patient-1", firstName: "Amine", lastName: "Ben Ali",
      email: "amine@email.tn", role: "patient", isDemo: true, patientId: 1,
    },
  },
  {
    id: "doctor-bouazizi",
    label: "Dr. Ahmed Bouazizi — Généraliste",
    description: "Médecin avec planning chargé et patients en attente",
    user: {
      id: "demo-doctor-1", firstName: "Ahmed", lastName: "Bouazizi",
      email: "dr.bouazizi@medicare.tn", role: "doctor", isDemo: true,
      establishment: "Cabinet El Manar", doctorName: "Dr. Bouazizi",
    },
  },
  {
    id: "secretary-demo",
    label: "Secrétaire — Cabinet El Manar",
    description: "Gestion de la salle d'attente et des RDV",
    user: {
      id: "demo-secretary-1", firstName: "Sonia", lastName: "Hamdi",
      email: "sonia@cabinet-elmanar.tn", role: "secretary", isDemo: true,
      establishment: "Cabinet El Manar",
    },
  },
  {
    id: "pharmacy-demo",
    label: "Pharmacie — El Amal",
    description: "Réception d'ordonnances et gestion de stock",
    user: {
      id: "demo-pharmacy-1", firstName: "Pharmacie", lastName: "El Amal",
      email: "pharmacie@elamal.tn", role: "pharmacy", isDemo: true,
      establishment: "Pharmacie El Amal",
    },
  },
  {
    id: "laboratory-demo",
    label: "Laboratoire — BioLab Tunis",
    description: "Analyses en cours et transmission des résultats",
    user: {
      id: "demo-lab-1", firstName: "Laboratoire", lastName: "BioLab",
      email: "contact@biolab.tn", role: "laboratory", isDemo: true,
      establishment: "BioLab Tunis",
    },
  },
  {
    id: "admin-demo",
    label: "Administrateur — Medicare",
    description: "Contrôle complet : utilisateurs, plans, modération",
    user: {
      id: "demo-admin-1", firstName: "Admin", lastName: "Medicare",
      email: "admin@medicare.tn", role: "admin", isDemo: true,
    },
  },
];

// ─── Store ──────────────────────────────────────────────────
const store = createStore<DemoUser | null>("medicare_auth_user", null);

/** Backward compat: sync with localStorage.userRole */
function syncLegacyRole(user: DemoUser | null) {
  if (user) {
    localStorage.setItem("userRole", user.role);
  } else {
    localStorage.removeItem("userRole");
  }
}

// On init, if no auth user but legacy role exists, create a minimal user
const legacyRole = localStorage.getItem("userRole");
if (!store.read() && legacyRole) {
  const scenario = DEMO_SCENARIOS.find(s => s.user.role === legacyRole);
  if (scenario) {
    store.set(scenario.user);
  }
}

export const authStore = store;

export function useAuth() {
  const [user, setUser] = useStore(store);
  return { user, setUser };
}

/** Read current user (non-React) */
export function readAuthUser(): DemoUser | null {
  return store.read();
}

/** Get current role (non-React shortcut) */
export function getCurrentRole(): UserRole | null {
  return store.read()?.role || null;
}

/**
 * Login as a demo user by role or scenario ID.
 * // TODO BACKEND: Replace with POST /api/auth/login
 */
export function loginDemoAs(roleOrScenarioId: string): DemoUser {
  const scenario = DEMO_SCENARIOS.find(s => s.id === roleOrScenarioId || s.user.role === roleOrScenarioId);
  const user = scenario?.user || {
    id: `demo-${roleOrScenarioId}`,
    firstName: roleOrScenarioId,
    lastName: "Demo",
    email: `${roleOrScenarioId}@demo.tn`,
    role: roleOrScenarioId as UserRole,
    isDemo: true,
  };
  store.set(user);
  syncLegacyRole(user);
  return user;
}

/**
 * Switch role quickly (from SimulationPanel).
 * // TODO BACKEND: Not applicable — dev tool only.
 */
export function switchDemoRole(role: UserRole) {
  return loginDemoAs(role);
}

/**
 * Logout — clear auth state.
 * // TODO BACKEND: POST /api/auth/logout + clear JWT cookie
 */
export function logout() {
  store.set(null);
  syncLegacyRole(null);
}

/**
 * Check if user has a specific role.
 */
export function hasRole(role: UserRole): boolean {
  return store.read()?.role === role;
}
