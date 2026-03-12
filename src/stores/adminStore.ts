/**
 * adminStore.ts — Central persistent admin store (Zustand-like via crossRoleStore).
 * Single source of truth for all admin entities.
 * All admin pages consume data from here; no more inline useState with mocks.
 *
 * TODO BACKEND: Replace localStorage persistence with API calls.
 */
import { createStore, useStore } from "./crossRoleStore";
import { appendLog } from "@/services/admin/adminAuditService";
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
    setOrganizations: (updater: AdminOrganization[] | ((prev: AdminOrganization[]) => AdminOrganization[])) =>
      set(prev => ({ ...prev, organizations: typeof updater === "function" ? updater(prev.organizations) : updater })),
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
    setCampaigns: (updater: AdminCampaign[] | ((prev: AdminCampaign[]) => AdminCampaign[])) =>
      set(prev => ({ ...prev, campaigns: typeof updater === "function" ? updater(prev.campaigns) : updater })),
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
// SEEDING
// ═══════════════════════════════════════════
export function seedAdminStoreIfEmpty(seedData: AdminState) {
  const current = adminStore.read();
  // Only seed if empty (no users loaded yet)
  if (current.users.length === 0) {
    adminStore.set(seedData);
  }
}
