/**
 * reviewsStore.ts — Patient reviews for doctors.
 * Dual-mode: localStorage in Demo, Supabase in Production.
 */
import { createStore, useStore } from "./crossRoleStore";
import { useSupabaseTable } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useDualQuery } from "@/hooks/useDualData";
import { mapReviewRow } from "@/lib/supabaseMappers";
import { getAppMode } from "./authStore";

export interface Review {
  id: string;
  appointmentId: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  rating: number;
  text: string;
  verified: boolean;
  createdAt: string;
}

const store = createStore<Review[]>("medicare_reviews", []);

export const reviewsStore = store;

export function useReviews() {
  return useDualQuery<Review[]>({
    store,
    tableName: "reviews",
    queryKey: ["reviews"],
    mapRowToLocal: mapReviewRow,
    orderBy: { column: "created_at", ascending: false },
  });
}

/** Supabase-aware reviews hook */
export function useReviewsSupabase() {
  const [localReviews] = useStore(store);
  return useSupabaseTable<Review>({
    queryKey: ["reviews"],
    tableName: "reviews",
    orderBy: { column: "created_at", ascending: false },
    enabled: true,
    fallbackData: localReviews,
  });
}

export async function submitReview(review: Omit<Review, "id" | "createdAt">) {
  const full = {
    ...review,
    id: `rev-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.set(prev => [full, ...prev]);

  if (getAppMode() === "production") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Resolve patient_id from patients table
        let patientId: number | null = null;
        const { data: patients } = await (supabase.from as any)("patients")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1);
        if (patients?.[0]) {
          patientId = patients[0].id;
        }

        await (supabase.from as any)("reviews").insert({
          id: full.id,
          appointment_id: review.appointmentId || "",
          patient_id: patientId,
          patient_name: review.patientName,
          doctor_name: review.doctorName,
          doctor_id: review.doctorId ? String(review.doctorId) : null,
          rating: review.rating,
          text: review.text,
          verified: false,
        });
      }
    } catch (e) {
      console.warn("[submitReview] Supabase insert failed:", e);
    }
  }
}

export function getReviewsForDoctor(doctorId: number): Review[] {
  return store.read().filter(r => r.doctorId === doctorId);
}

export function getAverageRating(doctorId: number): number {
  const reviews = getReviewsForDoctor(doctorId);
  if (reviews.length === 0) return 0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

const SEED_REVIEWS: Review[] = [
  { id: "rev-1", appointmentId: "apt-100", patientId: 1, patientName: "Amine B.", doctorId: 1, doctorName: "Dr. Ahmed Bouazizi", rating: 5, text: "Très bon médecin, à l'écoute et professionnel.", verified: true, createdAt: "2026-02-10T10:00:00Z" },
  { id: "rev-2", appointmentId: "apt-101", patientId: 2, patientName: "Fatma T.", doctorId: 1, doctorName: "Dr. Ahmed Bouazizi", rating: 5, text: "Ponctuel et efficace. Explique bien les traitements.", verified: true, createdAt: "2026-02-05T10:00:00Z" },
  { id: "rev-3", appointmentId: "apt-102", patientId: 3, patientName: "Mohamed S.", doctorId: 1, doctorName: "Dr. Ahmed Bouazizi", rating: 4, text: "Bon suivi médical, cabinet propre et moderne.", verified: true, createdAt: "2026-01-28T10:00:00Z" },
  { id: "rev-4", appointmentId: "apt-103", patientId: 4, patientName: "Nadia J.", doctorId: 1, doctorName: "Dr. Ahmed Bouazizi", rating: 5, text: "Excellent suivi pour mon diabète.", verified: true, createdAt: "2026-01-20T10:00:00Z" },
  { id: "rev-5", appointmentId: "apt-104", patientId: 5, patientName: "Sami A.", doctorId: 1, doctorName: "Dr. Ahmed Bouazizi", rating: 4, text: "Bonne consultation, docteur à l'écoute.", verified: false, createdAt: "2026-01-15T10:00:00Z" },
  { id: "rev-6", appointmentId: "apt-105", patientId: 1, patientName: "Amine B.", doctorId: 2, doctorName: "Dr. Sonia Gharbi", rating: 5, text: "Excellente cardiologue, très professionnelle.", verified: true, createdAt: "2026-02-01T10:00:00Z" },
];

export function seedReviewsIfEmpty() {
  const current = store.read();
  if (current.length === 0) {
    store.set(SEED_REVIEWS);
  }
}
