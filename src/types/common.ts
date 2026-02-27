/**
 * Types métier partagés — Common
 */

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled" | "no-show" | "in-progress";
export type InvoiceStatus = "paid" | "pending" | "failed" | "refunded";
export type NotificationType = "appointment" | "prescription" | "message" | "result" | "reminder" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them" | "ai";
  text: string;
  time: string;
  senderName?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface StatsCard {
  label: string;
  value: string;
  change: string;
  color: string;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}
