/**
 * useAdminData.ts — Dual-mode admin data hooks.
 * Demo: reads from adminStore (localStorage + seed data).
 * Production: queries Supabase tables directly.
 *
 * Tables used:
 * - profiles + user_roles → AdminUsers
 * - appointments → AdminAppointments
 * - audit_logs → AdminLogs
 * - invoices → AdminPayments
 * - support_tickets → AdminTickets
 * - doctors_directory → AdminVerifications
 * - pharmacies_directory → AdminGuardPharmacies
 */
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "@/stores/authStore";
import { useAuthReady } from "@/hooks/useSupabaseQuery";
import type { AdminUser, UserRole, UserStatus } from "@/types/admin";

// ─── Map Supabase rows to AdminUser ──────────────────────────

interface ProfileWithRole {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  gouvernorat: string | null;
  assurance_number: string | null;
  role?: string;
}

function mapProfileToAdminUser(profile: ProfileWithRole, role?: string): AdminUser {
  return {
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name}`.trim() || "Sans nom",
    email: profile.email || "",
    phone: profile.phone || "",
    role: (role || "patient") as UserRole,
    status: "active" as UserStatus,
    subscription: "—",
    joined: new Date(profile.created_at).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" }),
    lastLogin: "—",
    verified: true,
    internalNotes: [],
  };
}

// ─── Admin Users (profiles + user_roles) ─────────────────────

export function useAdminUsersSupabase() {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady } = useAuthReady();

  return useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (pErr) { console.error("[admin] profiles:", pErr); return []; }

      // Fetch roles
      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rErr) { console.error("[admin] user_roles:", rErr); return []; }

      const roleMap = new Map<string, string>();
      (roles || []).forEach((r: any) => roleMap.set(r.user_id, r.role));

      return (profiles || []).map((p: any) => mapProfileToAdminUser(p, roleMap.get(p.id)));
    },
    enabled: isProduction && isReady,
  });
}

// ─── Admin Appointments ──────────────────────────────────────

export interface AdminAppointmentRow {
  id: string;
  patient_name: string;
  doctor_name: string;
  date: string;
  start_time: string;
  end_time: string;
  type: string;
  status: string;
  insurance: string | null;
  teleconsultation: boolean | null;
  payment_status: string | null;
  paid_amount: number | null;
  notes: string | null;
  created_at: string;
}

export function useAdminAppointmentsSupabase() {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady } = useAuthReady();

  return useQuery<AdminAppointmentRow[]>({
    queryKey: ["admin", "appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("date", { ascending: false })
        .limit(500);
      if (error) { console.error("[admin] appointments:", error); return []; }
      return data || [];
    },
    enabled: isProduction && isReady,
  });
}

// ─── Admin Audit Logs ────────────────────────────────────────

export interface AdminAuditLogRow {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  user_name: string | null;
  details: any;
  created_at: string;
}

export function useAdminAuditLogsSupabase() {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady } = useAuthReady();

  return useQuery<AdminAuditLogRow[]>({
    queryKey: ["admin", "audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) { console.error("[admin] audit_logs:", error); return []; }
      return data || [];
    },
    enabled: isProduction && isReady,
  });
}

// ─── Admin Invoices / Payments ───────────────────────────────

export interface AdminInvoiceRow {
  id: string;
  patient_name: string;
  doctor_name: string;
  amount: number;
  status: string;
  type: string;
  date: string;
  payment: string | null;
  assurance: string | null;
  created_at: string;
}

export function useAdminInvoicesSupabase() {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady } = useAuthReady();

  return useQuery<AdminInvoiceRow[]>({
    queryKey: ["admin", "invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) { console.error("[admin] invoices:", error); return []; }
      return data || [];
    },
    enabled: isProduction && isReady,
  });
}

// ─── Admin Support Tickets ───────────────────────────────────

export function useAdminTicketsSupabase() {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady } = useAuthReady();

  return useQuery<any[]>({
    queryKey: ["admin", "support_tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) { console.error("[admin] support_tickets:", error); return []; }
      return data || [];
    },
    enabled: isProduction && isReady,
  });
}

// ─── Admin Dashboard Stats (production) ──────────────────────

export function useAdminDashboardStatsSupabase() {
  const mode = getAppMode();
  const isProduction = mode === "production";
  const { isReady } = useAuthReady();

  return useQuery({
    queryKey: ["admin", "dashboard_stats"],
    queryFn: async () => {
      const [profilesRes, rolesRes, aptsRes, invoicesRes, ticketsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("appointments").select("status", { count: "exact" }),
        supabase.from("invoices").select("amount, status"),
        supabase.from("support_tickets").select("status"),
      ]);

      const totalUsers = profilesRes.count || 0;
      const roles = rolesRes.data || [];
      const doctors = roles.filter((r: any) => r.role === "doctor").length;
      const patients = roles.filter((r: any) => r.role === "patient").length;
      const pharmacies = roles.filter((r: any) => r.role === "pharmacy").length;
      const laboratories = roles.filter((r: any) => r.role === "laboratory").length;

      const invoices = invoicesRes.data || [];
      const totalRevenue = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.amount || 0), 0);
      const pendingPayments = invoices.filter((i: any) => i.status === "pending").reduce((s: number, i: any) => s + (i.amount || 0), 0);

      const tickets = ticketsRes.data || [];
      const openTickets = tickets.filter((t: any) => t.status === "open").length;

      return {
        totalUsers,
        activeUsers: totalUsers,
        pendingUsers: 0,
        suspendedUsers: 0,
        usersByRole: { doctors, patients, pharmacies, laboratories, secretaries: 0 },
        pendingVerifications: 0,
        totalRevenue,
        mrr: Math.round(totalRevenue / 6),
        pendingPayments,
        failedPayments: 0,
        refundedAmount: 0,
        openTickets,
        inProgressTickets: 0,
        openDisputes: 0,
        investigatingDisputes: 0,
        pendingReports: 0,
        highPriorityReports: 0,
        guardPharmaciesCount: 0,
        activeCampaigns: 0,
        blockedOnboarding: 0,
        onboardingConversionRate: 0,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
        expiredSubscriptions: 0,
        unpaidSubscriptions: 0,
        verifiedUsers: totalUsers,
      };
    },
    enabled: isProduction && isReady,
  });
}

// ─── Admin user mutations ────────────────────────────────────

export function useAdminUserUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminUserRoleUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
