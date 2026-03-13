/**
 * favoriteDoctorsStore.ts — Patient's favorite doctors (persistent).
 * Dual-mode: localStorage (demo) / Supabase favorite_doctors table (production).
 */
import { createStore } from "./crossRoleStore";
import { useDualQuery } from "@/hooks/useDualData";
import { supabase } from "@/integrations/supabase/client";
import { getAppMode } from "./authStore";

export interface FavoriteDoctor {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  acceptsMessages: boolean;
  doctorUuid?: string; // Supabase doctor_id
}

const initialFavorites: FavoriteDoctor[] = [
  { name: "Dr. Bouazizi", specialty: "Généraliste", avatar: "AB", id: 1, acceptsMessages: true },
  { name: "Dr. Gharbi", specialty: "Cardiologue", avatar: "SG", id: 2, acceptsMessages: false },
  { name: "Dr. Hammami", specialty: "Dermatologue", avatar: "KH", id: 3, acceptsMessages: true },
];

const store = createStore<FavoriteDoctor[]>("medicare_favorite_doctors", initialFavorites);

export function useFavoriteDoctors() {
  return useDualQuery<FavoriteDoctor[]>({
    store,
    tableName: "favorite_doctors",
    queryKey: ["favorite_doctors"],
    mapRowToLocal: (row: any): FavoriteDoctor => ({
      id: row.id,
      name: row.doctor_name || "",
      specialty: row.specialty || "",
      avatar: row.avatar || "",
      acceptsMessages: row.accepts_messages ?? false,
      doctorUuid: row.doctor_id,
    }),
    orderBy: { column: "created_at", ascending: false },
  });
}

export async function addFavoriteDoctor(doc: FavoriteDoctor) {
  store.set(prev => prev.some(d => d.id === doc.id) ? prev : [...prev, doc]);

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !doc.doctorUuid) return;
      await (supabase.from as any)("favorite_doctors").upsert({
        patient_user_id: session.user.id,
        doctor_id: doc.doctorUuid,
        doctor_name: doc.name,
        specialty: doc.specialty,
        avatar: doc.avatar,
        accepts_messages: doc.acceptsMessages,
      }, { onConflict: "patient_user_id,doctor_id" });
    } catch {}
  }
}

export async function removeFavoriteDoctor(id: number) {
  store.set(prev => prev.filter(d => d.id !== id));

  if (getAppMode() === "production") {
    try {
      await (supabase.from as any)("favorite_doctors").delete().eq("id", id);
    } catch {}
  }
}
