/**
 * Barrel re-export — Types métier partagés
 */
export * from "./patient";
export * from "./doctor";
export * from "./prescription";
export * from "./consultation";
export * from "./document";
export * from "./common";
export * from "./promotion";
export {
  type SharedAppointment,
  type SharedBlockedSlot,
  type SharedLeave,
  type AvailabilityDay,
  type AvailabilityConfig,
  type SharedActe,
  type AppointmentType,
  type AppointmentColorKey,
  APPOINTMENT_STATUS_CONFIG,
  DEFAULT_TYPE_COLORS,
  computeEndTime,
} from "./appointment";
// Re-export AppointmentStatus from appointment.ts as SharedAppointmentStatus to avoid conflict with common.ts
export { type AppointmentStatus as SharedAppointmentStatus } from "./appointment";