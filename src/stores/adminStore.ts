/**
 * adminStore.ts — Central persistent admin store (Zustand-like via crossRoleStore).
 * Single source of truth for all admin entities.
 * Syncs subscriptions, organizations, and campaigns with Supabase in production mode.
 */
import { createStore, useStore } from "./crossRoleStore";
import { appendLog } from "@/services/admin/adminAuditService";
import { getAppMode } from "./authStore";
import { supabase } from "@/integrations/supabase/client";
import type {
  AdminState, AdminUser, AdminOrganization, OnboardingApplication,
  AdminSubscription, AdminPayment, AdminTicket, AdminDispute,
  AdminModerationReport, AdminCampaign, AdminNotificationTemplate,
  AdminContentPage, AdminApiKey, AdminWebhook, AdminDataRequest,
  AdminConsentLog, AdminRetentionPolicy, AdminAccount, AdminGuardPharmacy,
  AdminSettings, AdminNote, VerificationEvent, TicketMessage, DisputeMessage,
  ModerationNote, UserStatus, VerificationStatus, SubscriptionStatus,
  PaymentStatus, CampaignStatus, ModerationStatus,
} from "@/types/admin";

// ═══════════════════════════════════════════
// DEFAULT SETTINGS
// ═══════════════════════════════════════════
const defaultSettings: AdminSettings = {
  platformName: "Medicare.tn",
  supportEmail: "support@medicare.tn",
  supportPhone: "+216 71 000 000",
  maxFileSize: "10",
  autoApprovePatients: true,
  defaultLanguage: "fr",
  timezone: "Africa/Tunis",
  termsUrl: "https://medicare.tn/legal/cgu",
  privacyUrl: "https://medicare.tn/legal/privacy",
  maintenanceMode: false,
  maintenanceMessage: "La plateforme est en maintenance. Nous serons de retour très bientôt.",
  features: {
    teleconsultation: true, aiAssistant: true, pharmacyGuard: true,
    labDemands: true, prescriptionSendPharmacy: true, prescriptionSendLab: true,
    patientMessaging: false, textReviews: true, medicinesDirectory: true,
    patientChat: false, onlinePayment: true, appointmentReminder: true,
    disputeReporting: true, commentReporting: true,
  },
  notifConfig: {
    rdvReminder: true, rdvReminderDelay: "24", rdvConfirmation: true,
    prescriptionReady: true, labResultReady: true, accountApproved: true,
    paymentReceipt: true, weeklyReport: false, marketingConsent: true,
  },
  security: {
    otpCooldown: "60", otpMaxRetries: "5", sessionTimeout: "30",
    twoFactor: false, passwordMinLength: "8", loginAttempts: "5", lockoutDuration: "15",
  },
  emailConfig: {
    smtpHost: "smtp.medicare.tn", smtpPort: "587", smtpUser: "noreply@medicare.tn",
    smtpTls: true, fromName: "Medicare.tn", fromEmail: "noreply@medicare.tn", replyTo: "support@medicare.tn",
  },
  smsConfig: { provider: "tunisie_telecom", senderId: "MEDICARE", enabled: true, rateLimit: "100" },
  pushConfig: { enabled: true },
};

// ═══════════════════════════════════════════
// INITIAL (EMPTY) STATE
// ═══════════════════════════════════════════
const emptyState: AdminState = {
  users: [], organizations: [], onboardingApplications: [],
  subscriptions: [], payments: [], tickets: [], disputes: [],
  moderationReports: [], campaigns: [], notificationTemplates: [],
  contentPages: [], apiKeys: [], webhooks: [], dataRequests: [],
  consentLogs: [], retentionPolicies: [], adminAccounts: [],
  guardPharmacies: [], settings: defaultSettings,
};

// ═══════════════════════════════════════════
// STORE INSTANCE
// ═══════════════════════════════════════════
export const adminStore = createStore<AdminState>("medicare_admin", emptyState);

// ═══════════════════════════════════════════
// SUPABASE SYNC HELPERS
// ═══════════════════════════════════════════

/** Sync subscriptions from Supabase */
async function syncSubscriptionsFromSupabase() {
  if (getAppMode() !== "production") return;
  try {
    const { data } = await (supabase.from as any)("subscriptions").select("*").order("created_at", { ascending: false });
    if (data?.length) {
      const mapped: AdminSubscription[] = data.map((s: any) => ({
        id: s.id, userId: s.user_id, organizationId: "", doctorName: s.specialty || "Praticien",
        plan: s.plan || "Essentiel", monthlyPrice: s.plan === "pro" ? 99 : s.plan === "cabinet_plus" ? 199 : 0,
        status: s.status === "active" ? "active" : s.status === "trialing" ? "trial" : s.status as SubscriptionStatus,
        startDate: s.current_period_start || s.created_at?.slice(0, 10) || "",
        renewalDate: s.current_period_end || "",
        promoName: "", history: [],
      }));
      adminStore.set(prev => ({ ...prev, subscriptions: mapped }));
    }
  } catch (e) {
    console.warn("[syncSubscriptionsFromSupabase]", e);
  }
}

/** Sync organizations from Supabase */
async function syncOrganizationsFromSupabase() {
  if (getAppMode() !== "production") return;
  try {
    const { data } = await (supabase.from as any)("organizations").select("*").order("created_at", { ascending: false });
    if (data?.length) {
      const mapped: AdminOrganization[] = data.map((o: any) => ({
        id: o.id, name: o.name, type: o.type || "cabinet",
        city: o.city || "Tunis", address: o.address || "", phone: o.phone || "", email: o.email || "",
        status: o.status as any || "active", memberIds: [], secretaryNames: [],
        membersCount: o.members_count || 0,
        createdAt: new Date(o.created_at).toLocaleDateString("fr-TN", { month: "short", year: "numeric" }),
        subscriptionId: o.subscription_id || "", internalNotes: [],
      }));
      adminStore.set(prev => ({ ...prev, organizations: mapped }));
    }
  } catch (e) {
    console.warn("[syncOrganizationsFromSupabase]", e);
  }
}

/** Sync campaigns from Supabase */
async function syncCampaignsFromSupabase() {
  if (getAppMode() !== "production") return;
  try {
    const { data } = await (supabase.from as any)("campaigns").select("*").order("created_at", { ascending: false });
    if (data?.length) {
      const mapped: AdminCampaign[] = data.map((c: any) => ({
        id: c.id, title: c.name || c.subject || "", target: c.target || "all",
        channel: c.type || "sms", message: c.content || "",
        status: c.status as CampaignStatus || "draft",
        sentAt: c.sent_at ? new Date(c.sent_at).toLocaleDateString("fr-TN") : undefined,
        scheduledAt: c.scheduled_at ? new Date(c.scheduled_at).toISOString().slice(0, 16).replace("T", " ") : undefined,
        recipientCount: c.recipients_count || 0,
        openRate: c.open_rate || 0, clickRate: 0, deliveryRate: 0,
      }));
      adminStore.set(prev => ({ ...prev, campaigns: mapped }));
    }
  } catch (e) {
    console.warn("[syncCampaignsFromSupabase]", e);
  }
}

/** Persist organization to Supabase */
async function upsertOrganizationToSupabase(org: AdminOrganization) {
  if (getAppMode() !== "production") return;
  try {
    await (supabase.from as any)("organizations").upsert({
      id: org.id, name: org.name, type: org.type, city: org.city,
      address: org.address, phone: org.phone, email: org.email,
      status: org.status, members_count: org.membersCount,
      subscription_id: org.subscriptionId || null,
    }, { onConflict: "id" });
  } catch (e) {
    console.warn("[upsertOrganizationToSupabase]", e);
  }
}

/** Persist campaign to Supabase */
async function upsertCampaignToSupabase(c: AdminCampaign) {
  if (getAppMode() !== "production") return;
  try {
    await (supabase.from as any)("campaigns").upsert({
      id: c.id, name: c.title, type: c.channel, target: c.target,
      content: c.message, status: c.status,
      recipients_count: c.recipientCount || 0,
      open_rate: c.openRate || 0,
      sent_at: c.sentAt ? new Date(c.sentAt).toISOString() : null,
      scheduled_at: c.scheduledAt ? new Date(c.scheduledAt.replace(" ", "T")).toISOString() : null,
    }, { onConflict: "id" });
  } catch (e) {
    console.warn("[upsertCampaignToSupabase]", e);
  }
}

/** Load all admin Supabase data on init */
export async function loadAdminSupabaseData() {
  if (getAppMode() !== "production") return;
  await Promise.all([
    syncSubscriptionsFromSupabase(),
    syncOrganizationsFromSupabase(),
    syncCampaignsFromSupabase(),
  ]);
}

// ═══════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════
export function useAdminStore(): [AdminState, (updater: AdminState | ((prev: AdminState) => AdminState)) => void] {
  return useStore(adminStore);
}

/** Convenience: get a slice */
export function useAdminUsers() {
  const [state, set] = useAdminStore();
  return {
    users: state.users,
    setUsers: (updater: AdminUser[] | ((prev: AdminUser[]) => AdminUser[])) =>
      set(prev => ({ ...prev, users: typeof updater === "function" ? updater(prev.users) : updater })),
  };
}

export function useAdminOrganizations() {
  const [state, set] = useAdminStore();
  return {
    organizations: state.organizations,
    setOrganizations: (updater: AdminOrganization[] | ((prev: AdminOrganization[]) => AdminOrganization[])) => {
      set(prev => {
        const newOrgs = typeof updater === "function" ? updater(prev.organizations) : updater;
        // Sync changed orgs to Supabase
        if (getAppMode() === "production") {
          const prevIds = new Set(prev.organizations.map(o => JSON.stringify(o)));
          newOrgs.forEach(o => { if (!prevIds.has(JSON.stringify(o))) upsertOrganizationToSupabase(o); });
        }
        return { ...prev, organizations: newOrgs };
      });
    },
  };
}

export function useAdminOnboarding() {
  const [state, set] = useAdminStore();
  return {
    applications: state.onboardingApplications,
    setApplications: (updater: OnboardingApplication[] | ((prev: OnboardingApplication[]) => OnboardingApplication[])) =>
      set(prev => ({ ...prev, onboardingApplications: typeof updater === "function" ? updater(prev.onboardingApplications) : updater })),
  };
}

export function useAdminSubscriptions() {
  const [state, set] = useAdminStore();
  return {
    subscriptions: state.subscriptions,
    setSubscriptions: (updater: AdminSubscription[] | ((prev: AdminSubscription[]) => AdminSubscription[])) =>
      set(prev => ({ ...prev, subscriptions: typeof updater === "function" ? updater(prev.subscriptions) : updater })),
  };
}

export function useAdminPayments() {
  const [state, set] = useAdminStore();
  return {
    payments: state.payments,
    setPayments: (updater: AdminPayment[] | ((prev: AdminPayment[]) => AdminPayment[])) =>
      set(prev => ({ ...prev, payments: typeof updater === "function" ? updater(prev.payments) : updater })),
  };
}

export function useAdminTickets() {
  const [state, set] = useAdminStore();
  return {
    tickets: state.tickets,
    setTickets: (updater: AdminTicket[] | ((prev: AdminTicket[]) => AdminTicket[])) =>
      set(prev => ({ ...prev, tickets: typeof updater === "function" ? updater(prev.tickets) : updater })),
  };
}

export function useAdminDisputes() {
  const [state, set] = useAdminStore();
  return {
    disputes: state.disputes,
    setDisputes: (updater: AdminDispute[] | ((prev: AdminDispute[]) => AdminDispute[])) =>
      set(prev => ({ ...prev, disputes: typeof updater === "function" ? updater(prev.disputes) : updater })),
  };
}

export function useAdminModerationReports() {
  const [state, set] = useAdminStore();
  return {
    reports: state.moderationReports,
    setReports: (updater: AdminModerationReport[] | ((prev: AdminModerationReport[]) => AdminModerationReport[])) =>
      set(prev => ({ ...prev, moderationReports: typeof updater === "function" ? updater(prev.moderationReports) : updater })),
  };
}

export function useAdminCampaigns() {
  const [state, set] = useAdminStore();
  return {
    campaigns: state.campaigns,
    setCampaigns: (updater: AdminCampaign[] | ((prev: AdminCampaign[]) => AdminCampaign[])) => {
      set(prev => {
        const newCampaigns = typeof updater === "function" ? updater(prev.campaigns) : updater;
        // Sync changed campaigns to Supabase
        if (getAppMode() === "production") {
          const prevIds = new Set(prev.campaigns.map(c => JSON.stringify(c)));
          newCampaigns.forEach(c => { if (!prevIds.has(JSON.stringify(c))) upsertCampaignToSupabase(c); });
        }
        return { ...prev, campaigns: newCampaigns };
      });
    },
  };
}

export function useAdminNotificationTemplates() {
  const [state, set] = useAdminStore();
  return {
    templates: state.notificationTemplates,
    setTemplates: (updater: AdminNotificationTemplate[] | ((prev: AdminNotificationTemplate[]) => AdminNotificationTemplate[])) =>
      set(prev => ({ ...prev, notificationTemplates: typeof updater === "function" ? updater(prev.notificationTemplates) : updater })),
  };
}

export function useAdminContentPages() {
  const [state, set] = useAdminStore();
  return {
    pages: state.contentPages,
    setPages: (updater: AdminContentPage[] | ((prev: AdminContentPage[]) => AdminContentPage[])) =>
      set(prev => ({ ...prev, contentPages: typeof updater === "function" ? updater(prev.contentPages) : updater })),
  };
}

export function useAdminApiPartners() {
  const [state, set] = useAdminStore();
  return {
    apiKeys: state.apiKeys,
    webhooks: state.webhooks,
    setApiKeys: (updater: AdminApiKey[] | ((prev: AdminApiKey[]) => AdminApiKey[])) =>
      set(prev => ({ ...prev, apiKeys: typeof updater === "function" ? updater(prev.apiKeys) : updater })),
    setWebhooks: (updater: AdminWebhook[] | ((prev: AdminWebhook[]) => AdminWebhook[])) =>
      set(prev => ({ ...prev, webhooks: typeof updater === "function" ? updater(prev.webhooks) : updater })),
  };
}

export function useAdminCompliance() {
  const [state, set] = useAdminStore();
  return {
    dataRequests: state.dataRequests,
    consentLogs: state.consentLogs,
    retentionPolicies: state.retentionPolicies,
    setDataRequests: (updater: AdminDataRequest[] | ((prev: AdminDataRequest[]) => AdminDataRequest[])) =>
      set(prev => ({ ...prev, dataRequests: typeof updater === "function" ? updater(prev.dataRequests) : updater })),
    setRetentionPolicies: (updater: AdminRetentionPolicy[] | ((prev: AdminRetentionPolicy[]) => AdminRetentionPolicy[])) =>
      set(prev => ({ ...prev, retentionPolicies: typeof updater === "function" ? updater(prev.retentionPolicies) : updater })),
  };
}

export function useAdminIAM() {
  const [state, set] = useAdminStore();
  return {
    accounts: state.adminAccounts,
    setAccounts: (updater: AdminAccount[] | ((prev: AdminAccount[]) => AdminAccount[])) =>
      set(prev => ({ ...prev, adminAccounts: typeof updater === "function" ? updater(prev.adminAccounts) : updater })),
  };
}

export function useAdminGuardPharmacies() {
  const [state, set] = useAdminStore();
  return {
    pharmacies: state.guardPharmacies,
    setPharmacies: (updater: AdminGuardPharmacy[] | ((prev: AdminGuardPharmacy[]) => AdminGuardPharmacy[])) =>
      set(prev => ({ ...prev, guardPharmacies: typeof updater === "function" ? updater(prev.guardPharmacies) : updater })),
  };
}

export function useAdminSettings() {
  const [state, set] = useAdminStore();
  return {
    settings: state.settings,
    setSettings: (updater: AdminSettings | ((prev: AdminSettings) => AdminSettings)) =>
      set(prev => ({ ...prev, settings: typeof updater === "function" ? updater(prev.settings) : updater })),
  };
}

// ═══════════════════════════════════════════
// DERIVED SELECTORS (for Dashboard & Analytics)
// ═══════════════════════════════════════════
export function useAdminDashboardStats() {
  const [state] = useAdminStore();
  const { users, onboardingApplications: apps, subscriptions: subs, payments, tickets, disputes, moderationReports, guardPharmacies, campaigns } = state;

  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    pendingUsers: users.filter(u => u.status === "pending").length,
    suspendedUsers: users.filter(u => u.status === "suspended").length,
    verifiedUsers: users.filter(u => u.verified).length,
    usersByRole: {
      doctors: users.filter(u => u.role === "doctor").length,
      patients: users.filter(u => u.role === "patient").length,
      pharmacies: users.filter(u => u.role === "pharmacy").length,
      laboratories: users.filter(u => u.role === "laboratory").length,
      secretaries: users.filter(u => u.role === "secretary").length,
    },
    pendingVerifications: apps.filter(a => a.status === "pending").length,
    blockedOnboarding: apps.filter(a => a.stuckDays >= 3 && a.currentStep !== "activated").length,
    onboardingConversionRate: apps.length > 0 ? Math.round((apps.filter(a => a.currentStep === "activated").length / apps.length) * 100) : 0,
    activeSubscriptions: subs.filter(s => s.status === "active").length,
    trialSubscriptions: subs.filter(s => s.status === "trial").length,
    expiredSubscriptions: subs.filter(s => s.status === "expired").length,
    unpaidSubscriptions: subs.filter(s => s.status === "unpaid").length,
    mrr: subs.filter(s => s.status === "active").reduce((sum, s) => sum + s.monthlyPrice, 0),
    totalRevenue: payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
    failedPayments: payments.filter(p => p.status === "failed").length,
    refundedAmount: payments.filter(p => p.status === "refunded").reduce((sum, p) => sum + p.amount, 0),
    openTickets: tickets.filter(t => t.status === "open").length,
    inProgressTickets: tickets.filter(t => t.status === "in_progress").length,
    openDisputes: disputes.filter(d => d.status === "open").length,
    investigatingDisputes: disputes.filter(d => d.status === "investigating").length,
    pendingReports: moderationReports.filter(r => r.status === "pending").length,
    highPriorityReports: moderationReports.filter(r => r.priority === "high" && r.status === "pending").length,
    guardPharmaciesCount: guardPharmacies.filter(p => p.isGuard).length,
    activeCampaigns: campaigns.filter(c => c.status === "sent" || c.status === "scheduled").length,
  };
}

// ═══════════════════════════════════════════
// CROSS-ENTITY LOOKUPS
// ═══════════════════════════════════════════
export function useAdminLookups() {
  const [state] = useAdminStore();

  const getUserById = (id: string) => state.users.find(u => u.id === id);
  const getOrgById = (id: string) => state.organizations.find(o => o.id === id);
  const getSubById = (id: string) => state.subscriptions.find(s => s.id === id);
  const getPaymentsByUserId = (userId: string) => state.payments.filter(p => p.payerId === userId);
  const getTicketsByUserId = (userId: string) => state.tickets.filter(t => t.requesterId === userId);
  const getDisputesByUserId = (userId: string) => state.disputes.filter(d => d.patientId === userId || d.doctorId === userId);
  const getOrgByUserId = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    return user?.organizationId ? state.organizations.find(o => o.id === user.organizationId) : undefined;
  };
  const getSubByUserId = (userId: string) => state.subscriptions.find(s => s.userId === userId);
  const getOnboardingByUserId = (userId: string) => state.onboardingApplications.find(a => a.userId === userId);
  const getMembersByOrgId = (orgId: string) => state.users.filter(u => u.organizationId === orgId);
  const getSubByOrgId = (orgId: string) => state.subscriptions.find(s => s.organizationId === orgId);
  const getPaymentsByOrgId = (orgId: string) => state.payments.filter(p => p.organizationId === orgId);

  return {
    getUserById, getOrgById, getSubById, getPaymentsByUserId, getTicketsByUserId,
    getDisputesByUserId, getOrgByUserId, getSubByUserId, getOnboardingByUserId,
    getMembersByOrgId, getSubByOrgId, getPaymentsByOrgId,
  };
}

// ═══════════════════════════════════════════
// CASCADE OPERATIONS
// ═══════════════════════════════════════════

/**
 * Suspend an organization + cascade: suspend all members + suspend org subscription.
 */
export function suspendOrganizationWithCascade(orgId: string, motif: string) {
  const state = adminStore.read();
  const org = state.organizations.find(o => o.id === orgId);
  if (!org) return;

  // 1. Suspend org
  const updatedOrgs = state.organizations.map(o =>
    o.id === orgId ? { ...o, status: "suspended" as const } : o
  );

  // 2. Suspend all members
  const memberIds = state.users.filter(u => u.organizationId === orgId).map(u => u.id);
  const updatedUsers = state.users.map(u =>
    u.organizationId === orgId ? { ...u, status: "suspended" as const } : u
  );

  // 3. Suspend org subscription
  const updatedSubs = state.subscriptions.map(s =>
    s.organizationId === orgId ? { ...s, status: "suspended" as const } : s
  );

  adminStore.set({
    ...state,
    organizations: updatedOrgs,
    users: updatedUsers,
    subscriptions: updatedSubs,
  });

  // Persist to Supabase
  if (getAppMode() === "production") {
    upsertOrganizationToSupabase({ ...org, status: "suspended" as any });
  }

  // Audit
  appendLog("org_cascade_suspend", "organization", orgId,
    `Organisation "${org.name}" suspendue en cascade (${memberIds.length} membres, abonnement) — Motif : ${motif}`
  );
}

// ═══════════════════════════════════════════
// SEEDING
// ═══════════════════════════════════════════
export function seedAdminStoreIfEmpty(seedData: AdminState) {
  const current = adminStore.read();
  // Only seed if empty (no users loaded yet)
  if (current.users.length === 0) {
    adminStore.set(seedData);
  }
}
