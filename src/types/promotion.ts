/**
 * Promotion & Subscription types for admin promotions module
 * TODO BACKEND: These types should match the API contract
 */

export type PromotionType = "free_months" | "percent_discount" | "fixed_amount" | "free_trial";
export type PromotionStatus = "active" | "inactive" | "expired";
export type PromotionTarget = "basic" | "pro" | "all";

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  value: number; // months, %, or DT depending on type
  startDate: string;
  endDate: string;
  target: PromotionTarget;
  newDoctorsOnly: boolean;
  requireSignupDuringPeriod: boolean;
  autoApply: boolean;
  requireCode: boolean;
  promoCode?: string;
  specialties?: string[];
  cities?: string[];
  notes: string;
  status: PromotionStatus;
  usageCount: number;
  createdAt: string;
}

export type DoctorSubStatus = "trial" | "active" | "expired" | "cancelled";

export interface DoctorSubscription {
  id: string;
  doctorId: number;
  doctorName: string;
  plan: "Basic" | "Pro";
  status: DoctorSubStatus;
  startDate: string;
  renewalDate: string;
  promoId?: string;
  promoName?: string;
  promoEndDate?: string;
  monthlyPrice: number;
  history: { date: string; event: string }[];
}

export interface PromotionEligibility {
  promotionId: string;
  doctorId: number;
  eligible: boolean;
  reason?: string;
}
