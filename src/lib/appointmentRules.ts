/**
 * appointmentRules.ts — Centralized business rules for appointments.
 * Used by: PublicBooking, MyAppointments, PatientAppointments, SecretaryDashboard, DoctorSchedule
 *
 * // TODO BACKEND: Validate server-side as well (never trust client alone)
 */
import type { SharedAppointment, AppointmentType } from "@/types/appointment";
import { sharedAppointmentsStore } from "@/stores/sharedAppointmentsStore";
import { sharedAvailabilityStore } from "@/stores/sharedAvailabilityStore";
import { sharedBlockedSlotsStore } from "@/stores/sharedBlockedSlotsStore";
import { sharedLeavesStore } from "@/stores/sharedLeavesStore";

// ─── Constants ──────────────────────────────────────────────
const CANCELLATION_HOURS = 24;
const MAX_RESCHEDULES = 2;

// ─── Time helpers ───────────────────────────────────────────
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

// ─── 24h Cancellation Rule ──────────────────────────────────

export interface CancelCheck {
  allowed: boolean;
  reason?: string;
  /** If within penalty window (< 24h but still technically possible) */
  penalty?: boolean;
}

/**
 * Check if an appointment can be cancelled.
 * Rules:
 * - Only pending/confirmed can be cancelled
 * - Cancellation is free if > 24h before
 * - Within 24h: still allowed but flagged as penalty (late cancellation)
 * - Past / done / in_progress / absent cannot be cancelled
 */
export function canCancel(appointment: SharedAppointment): CancelCheck {
  // Status check
  if (!["pending", "confirmed"].includes(appointment.status)) {
    return { allowed: false, reason: "Ce rendez-vous ne peut plus être annulé." };
  }

  // Time check
  const aptDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`);
  const now = new Date();
  const hoursUntil = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 0) {
    return { allowed: false, reason: "Ce rendez-vous est déjà passé." };
  }

  if (hoursUntil < CANCELLATION_HOURS) {
    return {
      allowed: true,
      penalty: true,
      reason: `Annulation tardive (moins de ${CANCELLATION_HOURS}h). Des frais peuvent s'appliquer.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if an appointment can be rescheduled.
 */
export function canReschedule(appointment: SharedAppointment): CancelCheck {
  if (!["pending", "confirmed"].includes(appointment.status)) {
    return { allowed: false, reason: "Ce rendez-vous ne peut plus être reprogrammé." };
  }

  const aptDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`);
  const now = new Date();
  const hoursUntil = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 0) {
    return { allowed: false, reason: "Ce rendez-vous est déjà passé." };
  }

  if (hoursUntil < CANCELLATION_HOURS) {
    return {
      allowed: true,
      penalty: true,
      reason: `Reprogrammation tardive (moins de ${CANCELLATION_HOURS}h).`,
    };
  }

  return { allowed: true };
}

// ─── Booking Validation ─────────────────────────────────────

export interface BookingValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a booking request before creating the appointment.
 * Checks: double-booking, availability, blocked slots, leaves, teleconsult eligibility
 */
export function validateBooking(payload: {
  date: string;
  startTime: string;
  duration: number;
  doctor: string;
  type?: AppointmentType;
  teleconsultation?: boolean;
}): BookingValidation {
  const errors: string[] = [];
  const startMin = timeToMin(payload.startTime);
  const endMin = startMin + payload.duration;

  // 1. Check availability (working hours)
  const JS_DAY_TO_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const aptDate = new Date(payload.date + "T00:00:00");
  const frDayName = JS_DAY_TO_FR[aptDate.getDay()];
  const availability = sharedAvailabilityStore.read();
  const dayConfig = availability.days[frDayName];

  if (!dayConfig || !dayConfig.active) {
    errors.push(`Le praticien ne consulte pas le ${frDayName.toLowerCase()}.`);
  } else {
    const dayStartMin = timeToMin(dayConfig.start);
    const dayEndMin = timeToMin(dayConfig.end);

    if (startMin < dayStartMin || endMin > dayEndMin) {
      errors.push("Ce créneau est en dehors des horaires de consultation.");
    }

    // Check break time
    if (dayConfig.breakStart && dayConfig.breakEnd) {
      const breakStartMin = timeToMin(dayConfig.breakStart);
      const breakEndMin = timeToMin(dayConfig.breakEnd);
      if (startMin < breakEndMin && endMin > breakStartMin) {
        errors.push("Ce créneau tombe pendant la pause du praticien.");
      }
    }
  }

  // 2. Check double-booking (considering duration, not just startTime)
  const existingApts = sharedAppointmentsStore.read().filter(a =>
    a.date === payload.date &&
    a.doctor === payload.doctor &&
    !["cancelled", "absent"].includes(a.status)
  );

  const hasOverlap = existingApts.some(a => {
    const aStart = timeToMin(a.startTime);
    const aEnd = aStart + a.duration;
    return startMin < aEnd && endMin > aStart;
  });

  if (hasOverlap) {
    errors.push("Ce créneau est déjà occupé.");
  }

  // 3. Check blocked slots
  const blockedSlots = sharedBlockedSlotsStore.read();
  const hasBlocked = blockedSlots.some(b => {
    if (b.date !== payload.date && !b.recurring) return false;
    if (b.recurring && b.recurringDays) {
      if (!b.recurringDays.includes(aptDate.getDay())) return false;
    } else if (b.date !== payload.date) {
      return false;
    }
    const bStart = timeToMin(b.startTime);
    const bEnd = bStart + b.duration;
    return startMin < bEnd && endMin > bStart;
  });

  if (hasBlocked) {
    errors.push("Ce créneau est bloqué par le praticien.");
  }

  // 4. Check leaves
  const leaves = sharedLeavesStore.read();
  const isOnLeave = leaves.some(l =>
    l.status !== "past" && payload.date >= l.startDate && payload.date <= l.endDate
  );

  if (isOnLeave) {
    errors.push("Le praticien est en congé à cette date.");
  }

  // 5. Must not be in the past
  const now = new Date();
  const aptDateTime = new Date(`${payload.date}T${payload.startTime}:00`);
  if (aptDateTime < now) {
    errors.push("Impossible de réserver un créneau dans le passé.");
  }

  return { valid: errors.length === 0, errors };
}

// ─── Exports ────────────────────────────────────────────────
export { CANCELLATION_HOURS, MAX_RESCHEDULES };
