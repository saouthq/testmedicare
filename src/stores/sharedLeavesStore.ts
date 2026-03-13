/**
 * sharedLeavesStore.ts — Centralized doctor leaves/absences.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { sharedBlockedSlotsStore, addBlockedSlot } from "./sharedBlockedSlotsStore";
import { pushNotification } from "./notificationsStore";
import type { SharedLeave } from "@/types/appointment";
import { useDualQuery } from "@/hooks/useDualData";
import { mapLeaveRow } from "@/lib/supabaseMappers";
import { getAppMode } from "./authStore";
import { supabase } from "@/integrations/supabase/client";

const initialLeaves: SharedLeave[] = [
  { id: 1, startDate: "2026-03-15", endDate: "2026-03-22", motif: "Vacances de printemps", type: "conge", replacementDoctor: "Dr. Sonia Gharbi", notifyPatients: true, status: "upcoming", affectedAppointments: 12, doctor: "Dr. Ahmed Bouazizi" },
  { id: 2, startDate: "2026-04-10", endDate: "2026-04-11", motif: "Congrès cardiologie Sousse", type: "formation", replacementDoctor: "", notifyPatients: true, status: "upcoming", affectedAppointments: 4, doctor: "Dr. Ahmed Bouazizi" },
  { id: 3, startDate: "2026-02-01", endDate: "2026-02-03", motif: "Grippe", type: "maladie", replacementDoctor: "", notifyPatients: true, status: "past", affectedAppointments: 6, doctor: "Dr. Ahmed Bouazizi" },
  { id: 4, startDate: "2026-01-15", endDate: "2026-01-20", motif: "Congé familial", type: "personnel", replacementDoctor: "Dr. Khaled Hammami", notifyPatients: true, status: "past", affectedAppointments: 8, doctor: "Dr. Ahmed Bouazizi" },
];

const store = createStore<SharedLeave[]>("medicare_leaves", initialLeaves);

export const sharedLeavesStore = store;

export function useSharedLeaves() {
  return useDualQuery<SharedLeave[]>({
    store,
    tableName: "doctor_leaves",
    queryKey: ["doctor_leaves"],
    mapRowToLocal: mapLeaveRow,
    orderBy: { column: "start_date", ascending: false },
  });
}

/** Create a leave and auto-generate blocked slots for each day */
export async function createLeave(leave: Omit<SharedLeave, "id">) {
  const id = Date.now();
  store.set(prev => [{ ...leave, id }, ...prev]);

  // Generate blocked slots for each day of the leave
  const start = new Date(leave.startDate);
  const end = new Date(leave.endDate);
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    const leaveBlockId = `leave-blk-${id}-${dateStr}`;
    // Use addBlockedSlot which handles Supabase persistence
    await addBlockedSlot({
      id: leaveBlockId,
      date: dateStr,
      startTime: "08:00",
      duration: 600,
      reason: `Congé: ${leave.motif}`,
      doctor: leave.doctor,
    });
    current.setDate(current.getDate() + 1);
  }

  // Persist to Supabase
  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await (supabase.from as any)("doctor_leaves").insert({
          doctor_id: session.user.id,
          doctor_name: leave.doctor || "",
          start_date: leave.startDate,
          end_date: leave.endDate,
          motif: leave.motif || "",
          type: leave.type || "conge",
          replacement_doctor: leave.replacementDoctor || "",
          notify_patients: leave.notifyPatients ?? true,
          status: leave.status || "upcoming",
          affected_appointments: leave.affectedAppointments || 0,
        });
      }
    } catch (e) {
      console.warn("[createLeave] Supabase insert failed:", e);
    }
  }

  // Notify secretary
  pushNotification({
    type: "generic",
    title: "Nouvelle absence déclarée",
    message: `${leave.doctor} sera absent du ${leave.startDate} au ${leave.endDate} (${leave.motif})`,
    targetRole: "secretary",
    actionLink: "/dashboard/secretary/agenda",
  });

  return id;
}

export async function deleteLeave(id: number) {
  store.set(prev => prev.filter(l => l.id !== id));
  // Remove associated blocked slots
  sharedBlockedSlotsStore.set(prev => prev.filter(b => !b.id.startsWith(`leave-blk-${id}-`)));

  // Persist to Supabase
  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await (supabase.from as any)("doctor_leaves").delete().eq("id", id);
      }
    } catch (e) {
      console.warn("[deleteLeave] Supabase delete failed:", e);
    }
  }
}

/** Check if a date falls within any active leave */
export function isDateInLeave(leaves: SharedLeave[], date: string): SharedLeave | undefined {
  return leaves.find(l =>
    l.status === "upcoming" && date >= l.startDate && date <= l.endDate
  );
}
