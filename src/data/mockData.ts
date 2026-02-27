/**
 * ══════════════════════════════════════════════════════════════
 *  MEDICARE — Centralized Mock Data (Barrel Re-export)
 *  All mock data has been split into src/data/mocks/ modules.
 *  This file re-exports everything for backward compatibility.
 *  When the backend is ready, replace imports with real API calls.
 * ══════════════════════════════════════════════════════════════
 */

// Re-export all types from src/types/
export type { AppointmentStatus, InvoiceStatus, NotificationType, Notification, ChatMessage, ChatContact, StatsCard, ChartDataPoint } from "@/types";
export type { Doctor, DoctorScheduleItem, WaitingRoomEntry, UrgentAlert, DoctorConsultation, VitalsEntry, AnalysisResult, ScheduleAppointment, TeleconsultTransaction, SubscriptionInvoice } from "@/types";
export type { Patient, PatientAppointment, PastAppointment, CancelledAppointment, HealthDocument, Antecedent, Treatment, Allergy, Habit, FamilyHistory, Surgery, Vaccination, HealthMeasure, PartnerPharmacy } from "@/types";
export type { Prescription, RxFavorite, ConsultationPrescriptionItem } from "@/types";
export type { PastConsult, ConsultationTemplate } from "@/types";
export type { LabPanel, LabAnalysis, LabResultValue, LabResult, PharmacyPrescriptionItem, PharmacyPrescription } from "@/types";

// Re-export all mock data
export * from "./mocks";
