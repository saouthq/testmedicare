/**
 * Mock data — Promotions & Doctor Subscriptions
 * TODO BACKEND: Replace with real API calls
 */
import type { Promotion, DoctorSubscription } from "@/types/promotion";

export const mockAdminPromotions: Promotion[] = [
  {
    id: "promo-1",
    name: "6 mois gratuits 2026",
    type: "free_months",
    value: 6,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    target: "all",
    newDoctorsOnly: true,
    requireSignupDuringPeriod: true,
    autoApply: true,
    requireCode: false,
    notes: "Offre de lancement annuelle — 6 mois gratuits pour tout nouveau médecin s'inscrivant pendant 2026.",
    status: "active",
    usageCount: 34,
    createdAt: "2025-12-15T10:00:00Z",
  },
  {
    id: "promo-2",
    name: "Réduction Pro -30%",
    type: "percent_discount",
    value: 30,
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    target: "pro",
    newDoctorsOnly: false,
    requireSignupDuringPeriod: false,
    autoApply: false,
    requireCode: true,
    promoCode: "PRO30",
    notes: "Réduction de 30% sur le plan Pro pendant 3 mois.",
    status: "active",
    usageCount: 12,
    createdAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "promo-3",
    name: "Essai gratuit 1 mois",
    type: "free_trial",
    value: 1,
    startDate: "2025-06-01",
    endDate: "2025-12-31",
    target: "basic",
    newDoctorsOnly: true,
    requireSignupDuringPeriod: true,
    autoApply: true,
    requireCode: false,
    notes: "Ancien essai gratuit 2025.",
    status: "inactive",
    usageCount: 156,
    createdAt: "2025-05-10T08:00:00Z",
  },
];

export const mockDoctorSubscriptions: DoctorSubscription[] = [
  {
    id: "sub-1", doctorId: 1, doctorName: "Dr. Ahmed Bouazizi", plan: "Basic",
    status: "active", startDate: "2025-09-01", renewalDate: "2026-09-01",
    promoId: "promo-1", promoName: "6 mois gratuits 2026", promoEndDate: "2026-09-01",
    monthlyPrice: 39,
    history: [
      { date: "2025-09-01", event: "Souscription plan Basic" },
      { date: "2026-01-15", event: "Promo '6 mois gratuits 2026' appliquée" },
    ],
  },
  {
    id: "sub-2", doctorId: 2, doctorName: "Dr. Sonia Gharbi", plan: "Pro",
    status: "active", startDate: "2025-11-01", renewalDate: "2026-11-01",
    monthlyPrice: 129,
    history: [
      { date: "2025-11-01", event: "Souscription plan Pro" },
      { date: "2026-02-20", event: "Promo 'Réduction Pro -30%' appliquée — code PRO30" },
    ],
    promoId: "promo-2", promoName: "Réduction Pro -30%", promoEndDate: "2026-06-30",
  },
  {
    id: "sub-3", doctorId: 3, doctorName: "Dr. Khaled Hammami", plan: "Basic",
    status: "trial", startDate: "2026-02-15", renewalDate: "2026-03-15",
    monthlyPrice: 39,
    history: [{ date: "2026-02-15", event: "Début essai gratuit" }],
  },
  {
    id: "sub-4", doctorId: 5, doctorName: "Dr. Nabil Karray", plan: "Pro",
    status: "expired", startDate: "2025-03-01", renewalDate: "2026-03-01",
    monthlyPrice: 129,
    history: [
      { date: "2025-03-01", event: "Souscription plan Pro" },
      { date: "2026-03-01", event: "Abonnement expiré — non renouvelé" },
    ],
  },
  {
    id: "sub-5", doctorId: 6, doctorName: "Dr. Ines Mansour", plan: "Basic",
    status: "active", startDate: "2026-01-10", renewalDate: "2027-01-10",
    promoId: "promo-1", promoName: "6 mois gratuits 2026", promoEndDate: "2026-07-10",
    monthlyPrice: 39,
    history: [
      { date: "2026-01-10", event: "Souscription plan Basic" },
      { date: "2026-01-10", event: "Promo '6 mois gratuits 2026' appliquée automatiquement" },
    ],
  },
];
