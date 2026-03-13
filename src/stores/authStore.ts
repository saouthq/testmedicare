/**
 * authStore.ts — Centralized authentication state.
 * Dual mode: Supabase Auth (production) + Demo scenarios (dev/testing).
 */
import { createStore, useStore } from "./crossRoleStore";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export type UserRole = "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" | "admin" | "hospital" | "clinic";

// ─── Dual mode: Demo (localStorage) vs Production (Supabase) ──
export type AppMode = "demo" | "production";
const modeStore = createStore<AppMode>("medicare_app_mode", "demo");
export function useAppMode() { return useStore(modeStore); }
export function setAppMode(mode: AppMode) { modeStore.set(mode); }
/** Get effective app mode: VITE_APP_MODE=production is always authoritative */
export function getAppMode(): AppMode {
  const envMode = import.meta.env.VITE_APP_MODE as string | undefined;
  if (envMode === "production") return "production";
  return modeStore.read();
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  establishment?: string;
  isDemo: boolean;
  doctorName?: string;
  patientId?: number;
  avatarUrl?: string;
}

// Keep backward compat type alias
export type DemoUser = AppUser;

/** Pre-configured demo scenarios */
export interface DemoScenario {
  id: string;
  label: string;
  description: string;
  user: AppUser;
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

// ─── Store (localStorage cache for quick access) ──────────────
const store = createStore<AppUser | null>("medicare_auth_user", null);

/** Backward compat: sync with localStorage.userRole */
function syncLegacyRole(user: AppUser | null) {
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

// ─── Supabase Auth helpers ──────────────────────────────────

/** Fetch user profile + role from Supabase and set in store */
async function loadSupabaseUser(supabaseUserId: string): Promise<AppUser | null> {
  try {
    const [{ data: profile }, { data: roleData }] = await Promise.all([
      (supabase.from as any)("profiles").select("*").eq("id", supabaseUserId).single(),
      (supabase.from as any)("user_roles").select("role").eq("user_id", supabaseUserId).single(),
    ]);

    if (!profile) return null;

    const role = (roleData?.role as UserRole) || "patient";
    const firstName = profile.first_name || "";
    const lastName = profile.last_name || "";
    const user: AppUser = {
      id: supabaseUserId,
      firstName,
      lastName,
      email: profile.email || "",
      role,
      isDemo: false,
      avatarUrl: profile.avatar_url || "",
      doctorName: role === "doctor" ? `Dr. ${lastName || firstName}` : undefined,
    };

    store.set(user);
    syncLegacyRole(user);

    // Role-specific initializations
    if (role === "doctor") {
      import("./doctorSubscriptionStore").then(m => m.loadDoctorSubscription()).catch(() => {});
    }
    if (role === "admin") {
      import("./adminStore").then(m => m.loadAdminSupabaseData()).catch(() => {});
    }
    if (role === "patient") {
      // Resolve patient_id from patients table and attach to user
      try {
        const { data: patientRow } = await (supabase.from as any)("patients")
          .select("id")
          .eq("user_id", supabaseUserId)
          .maybeSingle();
        if (patientRow?.id) {
          store.set(prev => prev ? { ...prev, patientId: patientRow.id } : prev);
        }
      } catch {}
    }

    return user;
  } catch (err) {
    console.error("[authStore] Failed to load Supabase user:", err);
    return null;
  }
}

/** Initialize Supabase auth listener — call once at app startup */
let _authInitialized = false;
export function initSupabaseAuth() {
  if (_authInitialized) return;
  _authInitialized = true;

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (_loggingOut) return; // Don't process auth events during logout

    if (event === "SIGNED_OUT" || !session?.user) {
      const current = store.read();
      if (current && !current.isDemo) {
        store.set(null);
        syncLegacyRole(null);
      }
      return;
    }

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      const current = store.read();
      if (current?.isDemo) return;
      await loadSupabaseUser(session.user.id);
    }
  });

  // Check existing session on init
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (_loggingOut) return;
    if (session?.user) {
      const current = store.read();
      if (!current?.isDemo) {
        loadSupabaseUser(session.user.id);
      }
    }
  });
}

// ─── React hook ──────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useStore(store);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth listener
    initSupabaseAuth();

    // If logging out, don't try to restore session
    if (_loggingOut) {
      setLoading(false);
      return;
    }

    // Check if we already have a user (demo or supabase)
    const current = store.read();
    if (current) {
      setLoading(false);
      return;
    }

    // Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (_loggingOut) {
        setLoading(false);
        return;
      }
      if (session?.user) {
        loadSupabaseUser(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  return { user, setUser, loading };
}

/** Read current user (non-React) */
export function readAuthUser(): AppUser | null {
  return store.read();
}

/** Get current role (non-React shortcut) */
export function getCurrentRole(): UserRole | null {
  return store.read()?.role || null;
}

// ─── Supabase Auth actions ──────────────────────────────────

/**
 * Sign up with email/password via Supabase Auth.
 */
export async function signUpWithEmail(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gouvernorat?: string;
  role?: UserRole;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        first_name: params.firstName,
        last_name: params.lastName,
        phone: params.phone || "",
        role: params.role || "patient",
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with email/password via Supabase Auth.
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  if (data.user) {
    await loadSupabaseUser(data.user.id);
  }

  return data;
}

/**
 * Send password reset email via Supabase Auth.
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

/**
 * Update password (after reset link click).
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/**
 * Sign out via Supabase Auth.
 */
export async function signOutSupabase() {
  await supabase.auth.signOut();
  store.set(null);
  syncLegacyRole(null);
}

// ─── Demo mode actions (kept for dev/testing) ───────────────

/**
 * Login as a demo user by role or scenario ID.
 */
export function loginDemoAs(roleOrScenarioId: string): AppUser {
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
 */
export function switchDemoRole(role: UserRole) {
  return loginDemoAs(role);
}

/**
 * Logout — clear auth state (both demo and Supabase).
 */
/** Track if we're in the process of logging out to prevent redirect loops */
let _loggingOut = false;
export function isLoggingOut() { return _loggingOut; }

export async function logout() {
  _loggingOut = true;
  const current = store.read();
  // Clear store FIRST (synchronously) so no component sees stale user
  store.set(null);
  syncLegacyRole(null);
  // Then sign out from Supabase
  if (current && !current.isDemo) {
    try { await supabase.auth.signOut(); } catch {}
  }
  // Reset flag after a tick
  setTimeout(() => { _loggingOut = false; }, 100);
}

/**
 * Check if user has a specific role.
 */
export function hasRole(role: UserRole): boolean {
  return store.read()?.role === role;
}
