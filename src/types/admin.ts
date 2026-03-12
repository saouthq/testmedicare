/**
 * Admin domain types — Central type definitions for the admin store.
 * All admin entities reference each other via IDs for cross-linking.
 * TODO BACKEND: These types map 1:1 to future API response schemas.
 */

// ═══════════════════════════════════════════
// USER
// ═══════════════════════════════════════════
export type UserRole = "doctor" | "patient" | "pharmacy" | "laboratory" | "secretary";
export type UserStatus = "active" | "pending" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  subscription: string;
  joined: string;
  lastLogin: string;
  verified: boolean;
  organizationId?: string;
  kycApplicationId?: string;
  internalNotes: AdminNote[];
}

// ═══════════════════════════════════════════
// ORGANIZATION
// ═══════════════════════════════════════════
export type OrgType = "cabinet" | "clinic" | "hospital" | "lab" | "pharmacy";
export type OrgStatus = "active" | "pending" | "suspended";

export interface AdminOrganization {
  id: string;
  type: OrgType;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status: OrgStatus;
  ownerId?: string;
  memberIds: string[];
  secretaryNames: string[];
  subscriptionId?: string;
  membersCount: number;
  createdAt: string;
  internalNotes: AdminNote[];
}

// ═══════════════════════════════════════════
// ONBOARDING / KYC VERIFICATION
// ═══════════════════════════════════════════
export type OnboardingStep = "started" | "profile_filled" | "docs_uploaded" | "plan_chosen" | "kyc_submitted" | "activated";
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface VerificationEvent {
  id: string;
  type: "submitted" | "note" | "relance" | "approved" | "rejected" | "docs_requested";
  text: string;
  author: string;
  createdAt: string;
}

export interface OnboardingApplication {
  id: string;
  userId?: string;
  organizationId?: string;
  entityType: "doctor" | "lab" | "pharmacy";
  entityName: string;
  specialty: string;
  activity?: string;
  city: string;
  email: string;
  phone: string;
  submittedAt: string;
  status: VerificationStatus;
  currentStep: OnboardingStep;
  stuckDays: number;
  lastActivity: string;
  docs: string[];
  events: VerificationEvent[];
  plan?: string;
  planPrice?: number;
  billing?: "monthly" | "yearly";
  promoApplied?: string;
}

// ═══════════════════════════════════════════
// SUBSCRIPTION
// ═══════════════════════════════════════════
export type SubscriptionStatus = "trial" | "active" | "expired" | "unpaid" | "suspended" | "cancelled";

export interface AdminSubscription {
  id: string;
  userId: string;
  organizationId?: string;
  doctorName: string;
  plan: string;
  monthlyPrice: number;
  status: SubscriptionStatus;
  startDate: string;
  renewalDate: string;
  promoName?: string;
  promoDiscount?: number;
  history: { date: string; event: string }[];
}

// ═══════════════════════════════════════════
// PAYMENT
// ═══════════════════════════════════════════
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface AdminPayment {
  id: string;
  type: "subscription" | "teleconsult";
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  payerName: string;
  payerEmail: string;
  payerId?: string;
  subscriptionId?: string;
  organizationId?: string;
  method: string;
  reference: string;
  adminNote?: string;
}

// ═══════════════════════════════════════════
// SUPPORT TICKET
// ═══════════════════════════════════════════
export type TicketStatus = "open" | "in_progress" | "closed";
export type TicketPriority = "high" | "medium" | "low";

export interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  text: string;
  time: string;
}

export interface AdminTicket {
  id: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  requester: string;
  requesterId?: string;
  requesterRole: string;
  assignedTo: string;
  createdAt: string;
  slaDeadline: string;
  conversation: TicketMessage[];
}

// ═══════════════════════════════════════════
// DISPUTE
// ═══════════════════════════════════════════
export type DisputeStatus = "open" | "investigating" | "resolved" | "closed";

export interface DisputeMessage {
  id: string;
  author: string;
  authorRole: "patient" | "doctor" | "admin";
  text: string;
  createdAt: string;
}

export interface AdminDispute {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: DisputeStatus;
  patientName: string;
  patientId?: string;
  doctorName: string;
  doctorId?: string;
  paymentId?: string;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
  messages: DisputeMessage[];
}

// ═══════════════════════════════════════════
// MODERATION REPORT
// ═══════════════════════════════════════════
export type ModerationStatus = "pending" | "resolved" | "rejected";

export interface ModerationNote {
  id: string;
  author: string;
  text: string;
  type: "note" | "action" | "escalation";
  createdAt: string;
}

export interface AdminModerationReport {
  id: string;
  type: string;
  reason: string;
  reporter: string;
  reporterRole: string;
  target: string;
  targetRole: string;
  targetId?: string;
  date: string;
  priority: string;
  status: ModerationStatus;
  details: string;
  evidence: string[];
  notes: ModerationNote[];
}

// ═══════════════════════════════════════════
// CAMPAIGN
// ═══════════════════════════════════════════
export type CampaignStatus = "draft" | "sent" | "scheduled" | "cancelled";

export interface AdminCampaign {
  id: string;
  title: string;
  target: string;
  channel: string;
  message: string;
  status: CampaignStatus;
  sentAt?: string;
  scheduledAt?: string;
  recipientCount?: number;
  segmentCity?: string;
  segmentSpecialty?: string;
  openRate?: number;
  clickRate?: number;
  deliveryRate?: number;
}

// ═══════════════════════════════════════════
// NOTIFICATION TEMPLATE
// ═══════════════════════════════════════════
export interface AdminNotificationTemplate {
  id: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
  variables: string[];
  active: boolean;
  lastModified: string;
  usageCount: number;
}

// ═══════════════════════════════════════════
// CONTENT PAGE
// ═══════════════════════════════════════════
export type ContentPageType = "legal" | "faq" | "announcement" | "banner";

export interface AdminContentPage {
  id: string;
  title: string;
  type: ContentPageType;
  status: "published" | "draft";
  lastModified: string;
  content: string;
}

// ═══════════════════════════════════════════
// API PARTNER
// ═══════════════════════════════════════════
export interface AdminApiKey {
  id: string;
  name: string;
  key: string;
  status: "active" | "revoked";
  quotaUsed: number;
  quotaMax: number;
  lastUsed: string;
  createdAt: string;
}

export interface AdminWebhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failing";
  lastTriggered: string;
  failCount: number;
}

// ═══════════════════════════════════════════
// COMPLIANCE / RGPD
// ═══════════════════════════════════════════
export type DataRequestType = "export" | "delete" | "rectify" | "access";
export type DataRequestStatus = "pending" | "processing" | "completed" | "rejected";

export interface AdminDataRequest {
  id: string;
  type: DataRequestType;
  userName: string;
  userEmail: string;
  userId?: string;
  userRole: string;
  reason: string;
  status: DataRequestStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

export interface AdminConsentLog {
  id: string;
  userName: string;
  userEmail: string;
  consentType: string;
  action: "granted" | "revoked";
  timestamp: string;
  ip: string;
}

export interface AdminRetentionPolicy {
  id: string;
  dataType: string;
  description: string;
  retentionDays: number;
  autoDelete: boolean;
  lastPurge?: string;
}

// ═══════════════════════════════════════════
// IAM
// ═══════════════════════════════════════════
export type AdminSubRole = "superadmin" | "support" | "verification" | "finance" | "moderation" | "compliance";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: AdminSubRole;
  status: "active" | "suspended";
  lastLogin: string;
  createdAt: string;
}

// ═══════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════
export interface AdminSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  maxFileSize: string;
  autoApprovePatients: boolean;
  defaultLanguage: string;
  timezone: string;
  termsUrl: string;
  privacyUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  features: Record<string, boolean>;
  notifConfig: Record<string, boolean | string>;
  security: {
    otpCooldown: string;
    otpMaxRetries: string;
    sessionTimeout: string;
    twoFactor: boolean;
    passwordMinLength: string;
    loginAttempts: string;
    lockoutDuration: string;
  };
  emailConfig: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpTls: boolean;
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
  smsConfig: {
    provider: string;
    senderId: string;
    enabled: boolean;
    rateLimit: string;
  };
  pushConfig: {
    enabled: boolean;
  };
}

// ═══════════════════════════════════════════
// GUARD PHARMACIES
// ═══════════════════════════════════════════
export interface AdminGuardPharmacy {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  isGuard: boolean;
}

// ═══════════════════════════════════════════
// INTERNAL NOTE
// ═══════════════════════════════════════════
export interface AdminNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

// ═══════════════════════════════════════════
// FULL ADMIN STATE
// ═══════════════════════════════════════════
export interface AdminState {
  users: AdminUser[];
  organizations: AdminOrganization[];
  onboardingApplications: OnboardingApplication[];
  subscriptions: AdminSubscription[];
  payments: AdminPayment[];
  tickets: AdminTicket[];
  disputes: AdminDispute[];
  moderationReports: AdminModerationReport[];
  campaigns: AdminCampaign[];
  notificationTemplates: AdminNotificationTemplate[];
  contentPages: AdminContentPage[];
  apiKeys: AdminApiKey[];
  webhooks: AdminWebhook[];
  dataRequests: AdminDataRequest[];
  consentLogs: AdminConsentLog[];
  retentionPolicies: AdminRetentionPolicy[];
  adminAccounts: AdminAccount[];
  guardPharmacies: AdminGuardPharmacy[];
  settings: AdminSettings;
}
