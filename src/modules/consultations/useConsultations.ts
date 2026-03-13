/**
 * useConsultations — React hooks for consultation domain.
 * Components import this; never import repos or Supabase directly.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore, useCallback } from "react";
import { getConsultationRepo, consultationsStore } from "./index";
import { getAppMode, readAuthUser } from "@/stores/authStore";
import type { CreateConsultationInput, UpdateConsultationInput, Consultation, ConsultationVital } from "./types";

// ─── Doctor's consultations list ────────────────────────────
export function useDoctorConsultations() {
  const mode = getAppMode();
  const user = readAuthUser();
  const doctorId = user?.id || "";

  // Demo: subscribe to store
  const localData = useSyncExternalStore(
    consultationsStore.subscribe,
    consultationsStore.getSnapshot,
    consultationsStore.getSnapshot,
  );

  // Production: use React Query
  const query = useQuery<Consultation[]>({
    queryKey: ["consultations", "doctor", doctorId],
    queryFn: () => getConsultationRepo().listByDoctor(doctorId),
    enabled: mode === "production" && !!doctorId,
  });

  if (mode === "production") {
    return {
      consultations: query.data || [],
      isLoading: query.isLoading,
    };
  }

  return {
    consultations: localData.filter(c => c.doctorId === doctorId || !doctorId),
    isLoading: false,
  };
}

// ─── Patient's consultations list ───────────────────────────
export function usePatientConsultations(patientId: number | null | undefined) {
  const mode = getAppMode();

  const localData = useSyncExternalStore(
    consultationsStore.subscribe,
    consultationsStore.getSnapshot,
    consultationsStore.getSnapshot,
  );

  const query = useQuery<Consultation[]>({
    queryKey: ["consultations", "patient", patientId],
    queryFn: () => getConsultationRepo().listByPatient(patientId!),
    enabled: mode === "production" && !!patientId,
  });

  if (mode === "production") {
    return { consultations: query.data || [], isLoading: query.isLoading };
  }

  return {
    consultations: localData.filter(c => c.patientId === patientId),
    isLoading: false,
  };
}

// ─── Single consultation ────────────────────────────────────
export function useConsultation(id: string | null) {
  const mode = getAppMode();

  const localData = useSyncExternalStore(
    consultationsStore.subscribe,
    consultationsStore.getSnapshot,
    consultationsStore.getSnapshot,
  );

  const query = useQuery<Consultation | null>({
    queryKey: ["consultation", id],
    queryFn: () => getConsultationRepo().getById(id!),
    enabled: mode === "production" && !!id,
  });

  if (mode === "production") {
    return { consultation: query.data || null, isLoading: query.isLoading };
  }

  return {
    consultation: localData.find(c => c.id === id) || null,
    isLoading: false,
  };
}

// ─── Consultation by appointment ────────────────────────────
export function useConsultationByAppointment(appointmentId: string | null) {
  const mode = getAppMode();

  const localData = useSyncExternalStore(
    consultationsStore.subscribe,
    consultationsStore.getSnapshot,
    consultationsStore.getSnapshot,
  );

  const query = useQuery<Consultation | null>({
    queryKey: ["consultation", "appointment", appointmentId],
    queryFn: () => getConsultationRepo().getByAppointment(appointmentId!),
    enabled: mode === "production" && !!appointmentId,
  });

  if (mode === "production") {
    return { consultation: query.data || null, isLoading: query.isLoading };
  }

  return {
    consultation: localData.find(c => c.appointmentId === appointmentId) || null,
    isLoading: false,
  };
}

// ─── Create consultation mutation ───────────────────────────
export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConsultationInput) => getConsultationRepo().create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });
}

// ─── Update consultation mutation ───────────────────────────
export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateConsultationInput) => getConsultationRepo().update(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["consultation", data.id] });
    },
  });
}

// ─── Vitals ─────────────────────────────────────────────────
export function useConsultationVitals(consultationId: string | null) {
  const mode = getAppMode();

  return useQuery<ConsultationVital[]>({
    queryKey: ["consultation-vitals", consultationId],
    queryFn: () => getConsultationRepo().getVitals(consultationId!),
    enabled: !!consultationId,
  });
}

export function useSaveVitals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ consultationId, vitals }: {
      consultationId: string;
      vitals: Omit<ConsultationVital, "id" | "consultationId">[];
    }) => getConsultationRepo().saveVitals(consultationId, vitals),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["consultation-vitals", vars.consultationId] });
    },
  });
}
