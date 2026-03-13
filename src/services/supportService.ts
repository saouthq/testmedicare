/**
 * supportService.ts — Creates support tickets.
 * Dual-mode: localStorage (demo) + Supabase support_tickets (production).
 */
import { adminStore } from "@/stores/adminStore";
import { getAppMode } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import type { AdminTicket } from "@/types/admin";

let ticketCounter = 1000;

export async function createSupportTicket(payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<string> {
  ticketCounter++;
  const ticketNumber = `TK-${ticketCounter}`;
  const now = new Date().toISOString().slice(0, 10);

  // Try Supabase in production
  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await (supabase.from as any)("support_tickets").insert({
        user_id: session?.user?.id || null,
        subject: payload.subject || "Demande via formulaire de contact",
        status: "open",
        conversation: [
          {
            id: `msg-${Date.now()}`,
            sender: "user",
            senderName: payload.name,
            text: payload.message,
            time: now,
          },
        ],
      });
      return ticketNumber;
    } catch (e) {
      console.warn("[supportService] Supabase insert failed, falling back to localStorage:", e);
    }
  }

  // Fallback: localStorage
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
        sender: "user" as const,
        senderName: payload.name,
        text: payload.message,
        time: now,
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
