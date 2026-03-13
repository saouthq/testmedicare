/**
 * supportService.ts — Creates support tickets in the admin store
 * from public-facing forms (Help page, etc.)
 * // TODO BACKEND: POST /api/support/ticket
 */
import { adminStore } from "@/stores/adminStore";
import type { AdminTicket } from "@/types/admin";

let ticketCounter = 1000;

export function createSupportTicket(payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): string {
  ticketCounter++;
  const ticketNumber = `TK-${ticketCounter}`;
  const now = new Date().toISOString().slice(0, 10);

  const ticket: AdminTicket = {
    id: `ticket-public-${Date.now()}`,
    number: ticketNumber,
    requesterId: "public-visitor",
    requesterName: payload.name,
    requesterEmail: payload.email,
    subject: payload.subject || "Demande via formulaire de contact",
    description: payload.message,
    status: "open",
    priority: "medium",
    category: "general",
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: payload.name,
        senderRole: "user",
        text: payload.message,
        date: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const current = adminStore.read();
  adminStore.set({
    ...current,
    tickets: [...current.tickets, ticket],
  });

  return ticketNumber;
}
