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
    subject: payload.subject || "Demande via formulaire de contact",
    category: "general",
    priority: "medium",
    status: "open",
    requester: payload.name,
    requesterId: "public-visitor",
    requesterRole: "visiteur",
    assignedTo: "Support L1",
    createdAt: now,
    slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 10),
    conversation: [
      {
        id: `msg-${Date.now()}`,
        sender: payload.name,
        senderRole: "user",
        text: payload.message,
        date: now,
      },
    ],
  };

  const current = adminStore.read();
  adminStore.set({
    ...current,
    tickets: [...current.tickets, ticket],
  });

  return ticketNumber;
}
