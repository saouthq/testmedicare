/**
 * messagesStore.ts — Cross-role messaging store.
 * Dual-mode: Supabase Realtime when authenticated, localStorage fallback for demo.
 */
import { createStore, useStore } from "./crossRoleStore";
import { pushNotification } from "./notificationsStore";
import { getCurrentRole } from "./authStore";
import { useSupabaseRealtime, useAuthReady } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ──────────────────────────────────────────────────

export interface ChatThread {
  id: string;
  participantA: { id: string; name: string; avatar: string; role: string };
  participantB: { id: string; name: string; avatar: string; role: string };
  lastMessage: string;
  lastMessageAt: string;
  unreadA: number;
  unreadB: number;
  acceptsMessages: boolean;
  category?: "messages" | "cabinet";
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  text: string;
  createdAt: string;
  readAt?: string;
}

// ─── Seed Data ──────────────────────────────────────────────

const SEED_THREADS: ChatThread[] = [
  {
    id: "thread-1",
    participantA: { id: "demo-patient-1", name: "Amine Ben Ali", avatar: "AB", role: "patient" },
    participantB: { id: "demo-doctor-1", name: "Dr. Ahmed Bouazizi", avatar: "AB", role: "doctor" },
    lastMessage: "Vos résultats sont bons, on se revoit dans 3 mois.",
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadA: 1, unreadB: 0, acceptsMessages: true, category: "messages",
  },
  {
    id: "thread-2",
    participantA: { id: "demo-patient-1", name: "Amine Ben Ali", avatar: "AB", role: "patient" },
    participantB: { id: "doctor-2", name: "Dr. Sonia Gharbi", avatar: "SG", role: "doctor" },
    lastMessage: "N'oubliez pas votre bilan la semaine prochaine.",
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadA: 0, unreadB: 0, acceptsMessages: false, category: "messages",
  },
  {
    id: "thread-3",
    participantA: { id: "demo-patient-1", name: "Amine Ben Ali", avatar: "AB", role: "patient" },
    participantB: { id: "demo-pharmacy-1", name: "Pharmacie El Manar", avatar: "PE", role: "pharmacy" },
    lastMessage: "Votre ordonnance est prête à retirer.",
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadA: 2, unreadB: 0, acceptsMessages: true, category: "messages",
  },
  {
    id: "thread-4",
    participantA: { id: "demo-patient-1", name: "Amine Ben Ali", avatar: "AB", role: "patient" },
    participantB: { id: "demo-lab-1", name: "Labo BioAnalyse Tunis", avatar: "LB", role: "laboratory" },
    lastMessage: "Vos résultats d'analyses sont disponibles.",
    lastMessageAt: new Date(Date.now() - 172800000).toISOString(),
    unreadA: 0, unreadB: 0, acceptsMessages: true, category: "messages",
  },
  {
    id: "thread-5",
    participantA: { id: "demo-patient-1", name: "Amine Ben Ali", avatar: "AB", role: "patient" },
    participantB: { id: "doctor-3", name: "Dr. Khaled Hammami", avatar: "KH", role: "doctor" },
    lastMessage: "Comment évolue votre traitement ?",
    lastMessageAt: new Date(Date.now() - 345600000).toISOString(),
    unreadA: 0, unreadB: 0, acceptsMessages: true, category: "messages",
  },
  {
    id: "thread-cab-1",
    participantA: { id: "demo-secretary-1", name: "Sonia Hamdi", avatar: "SH", role: "secretary" },
    participantB: { id: "demo-doctor-1", name: "Dr. Ahmed Bouazizi", avatar: "AB", role: "doctor" },
    lastMessage: "Le patient de 14h30 a annulé.",
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    unreadA: 1, unreadB: 0, acceptsMessages: true, category: "cabinet",
  },
  {
    id: "thread-cab-2",
    participantA: { id: "demo-secretary-1", name: "Sonia Hamdi", avatar: "SH", role: "secretary" },
    participantB: { id: "doctor-2", name: "Dr. Sonia Gharbi", avatar: "SG", role: "doctor" },
    lastMessage: "Résultats du labo reçus pour Mme Trabelsi.",
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    unreadA: 0, unreadB: 0, acceptsMessages: true, category: "cabinet",
  },
];

const SEED_MESSAGES: ChatMessage[] = [
  { id: "msg-1", threadId: "thread-1", senderId: "demo-doctor-1", text: "Bonjour, j'ai bien reçu vos résultats d'analyses.", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "msg-2", threadId: "thread-1", senderId: "demo-doctor-1", text: "Votre glycémie est à 1.05 g/L, ce qui est dans les normes. L'HbA1c est à 6.8%.", createdAt: new Date(Date.now() - 7140000).toISOString() },
  { id: "msg-3", threadId: "thread-1", senderId: "demo-patient-1", text: "Merci docteur ! Est-ce que je dois modifier mon traitement ?", createdAt: new Date(Date.now() - 5400000).toISOString() },
  { id: "msg-4", threadId: "thread-1", senderId: "demo-doctor-1", text: "Non, on continue le traitement actuel. Metformine 850mg 2x/jour + Glibenclamide 5mg 1x/jour.", createdAt: new Date(Date.now() - 5100000).toISOString() },
  { id: "msg-5", threadId: "thread-1", senderId: "demo-patient-1", text: "D'accord, merci beaucoup.", createdAt: new Date(Date.now() - 4800000).toISOString() },
  { id: "msg-6", threadId: "thread-1", senderId: "demo-doctor-1", text: "Vos résultats sont bons, on se revoit dans 3 mois.", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "msg-cab-1", threadId: "thread-cab-1", senderId: "demo-secretary-1", text: "Bonjour docteur, le patient de 14h30 a annulé.", createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "msg-cab-2", threadId: "thread-cab-1", senderId: "demo-doctor-1", text: "D'accord, essayez de replacer le suivant.", createdAt: new Date(Date.now() - 1500000).toISOString() },
];

// ─── Stores ─────────────────────────────────────────────────

const threadsStore = createStore<ChatThread[]>("medicare_chat_threads", SEED_THREADS);
const messagesItemsStore = createStore<ChatMessage[]>("medicare_chat_messages", SEED_MESSAGES);

export { threadsStore, messagesItemsStore };

// ─── Hooks ──────────────────────────────────────────────────

export function useChatThreads() {
  return useStore(threadsStore);
}

export function useChatMessages() {
  return useStore(messagesItemsStore);
}

/** Supabase Realtime sync for chat */
export function useChatRealtime() {
  useSupabaseRealtime("chat_messages", [["chat_messages"], ["chat_threads"]]);
}

// ─── Actions ────────────────────────────────────────────────

/** Send a message in a thread */
export async function sendMessage(threadId: string, senderId: string, text: string, senderName?: string) {
  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    threadId,
    senderId,
    senderName,
    text,
    createdAt: new Date().toISOString(),
  };

  messagesItemsStore.set(prev => [...prev, msg]);

  threadsStore.set(prev => prev.map(t => {
    if (t.id !== threadId) return t;
    const isA = t.participantA.id === senderId;
    return {
      ...t,
      lastMessage: text,
      lastMessageAt: msg.createdAt,
      unreadA: isA ? t.unreadA : t.unreadA + 1,
      unreadB: isA ? t.unreadB + 1 : t.unreadB,
    };
  }));

  // Try Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await (supabase.from as any)("chat_messages").insert({
        id: msg.id,
        thread_id: threadId,
        sender_id: senderId,
        sender_name: senderName || "",
        text,
      });
      await (supabase.from as any)("chat_threads")
        .update({ last_message: text, last_message_at: msg.createdAt })
        .eq("id", threadId);
    }
  } catch {}

  // Notify the other participant
  const thread = threadsStore.read().find(t => t.id === threadId);
  if (thread) {
    const recipient = thread.participantA.id === senderId ? thread.participantB : thread.participantA;
    const targetRole = recipient.role as "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" | "admin";
    pushNotification({
      type: "message",
      title: "Nouveau message",
      message: `${senderName || "Nouveau message"}: ${text.slice(0, 60)}${text.length > 60 ? "…" : ""}`,
      targetRole,
      actionLink: `/dashboard/${targetRole}/messages`,
    });
  }
}

/** Mark all messages in a thread as read for a participant */
export function markThreadRead(threadId: string, userId: string) {
  const now = new Date().toISOString();

  messagesItemsStore.set(prev => prev.map(m =>
    m.threadId === threadId && m.senderId !== userId && !m.readAt
      ? { ...m, readAt: now }
      : m
  ));

  threadsStore.set(prev => prev.map(t => {
    if (t.id !== threadId) return t;
    const isA = t.participantA.id === userId;
    return { ...t, unreadA: isA ? 0 : t.unreadA, unreadB: isA ? t.unreadB : 0 };
  }));
}

/** Get threads for a user by role, optionally filtered by category */
export function getThreadsForUser(threads: ChatThread[], userId: string, category?: "messages" | "cabinet"): ChatThread[] {
  return threads.filter(t => {
    const isParticipant = t.participantA.id === userId || t.participantB.id === userId;
    const matchesCategory = !category || t.category === category;
    return isParticipant && matchesCategory;
  });
}

/** Get messages for a thread */
export function getMessagesForThread(messages: ChatMessage[], threadId: string): ChatMessage[] {
  return messages.filter(m => m.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Get unread count for a user across all threads of a category */
export function getUnreadCount(threads: ChatThread[], userId: string, category?: "messages" | "cabinet"): number {
  return getThreadsForUser(threads, userId, category).reduce((acc, t) => {
    const isA = t.participantA.id === userId;
    return acc + (isA ? t.unreadA : t.unreadB);
  }, 0);
}

/** Seed messaging store if empty */
export function seedMessagesIfEmpty() {
  if (threadsStore.read().length > 0) return;
  threadsStore.set(SEED_THREADS);
  messagesItemsStore.set(SEED_MESSAGES);
}
