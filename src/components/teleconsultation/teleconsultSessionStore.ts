/**
 * teleconsultSessionStore.ts — Store global mock pour l'état des sessions de téléconsultation.
 *
 * Permet de partager l'état d'une session entre Patient, Médecin et Secrétaire
 * sans backend. Utilise un pattern "external store" compatible avec React.
 *
 * // TODO BACKEND: Remplacer par des WebSocket / polling API
 *
 * Cycle de vie d'une session :
 *   scheduled → patient_ready → doctor_ready → in_call → ended
 */

/** Statuts possibles d'une session de téléconsultation */
export type TeleconsultSessionStatus =
  | "scheduled"      // RDV planifié, personne n'a rejoint
  | "patient_ready"  // Le patient a rejoint la salle d'attente
  | "doctor_ready"   // Le médecin est prêt (patient pas encore là ou déjà là)
  | "in_call"        // Appel en cours (les 2 sont connectés)
  | "ended";         // Consultation terminée

export interface TeleconsultSession {
  id: string;
  patientName: string;
  doctorName: string;
  scheduledAt: string;
  status: TeleconsultSessionStatus;
  patientAvatar: string;
  doctorAvatar: string;
}

// ─── Store interne ───────────────────────────────────────────

let sessions: TeleconsultSession[] = [
  {
    id: "teleconsult-1",
    patientName: "Youssef Belhadj",
    doctorName: "Dr. Ahmed Bouazizi",
    scheduledAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    status: "scheduled",
    patientAvatar: "YB",
    doctorAvatar: "AB",
  },
  {
    id: "teleconsult-2",
    patientName: "Amine Ben Ali",
    doctorName: "Dr. Sonia Gharbi",
    scheduledAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    status: "scheduled",
    patientAvatar: "AB",
    doctorAvatar: "SG",
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  // Crée une nouvelle référence pour déclencher les re-renders
  sessions = [...sessions];
  listeners.forEach(l => l());
}

// ─── API publique (lecture) ──────────────────────────────────

/** Retourne toutes les sessions (snapshot immuable) */
export function getSessions(): TeleconsultSession[] {
  return sessions;
}

/** Retourne une session par ID */
export function getSession(id: string): TeleconsultSession | undefined {
  return sessions.find(s => s.id === id);
}

/** S'abonner aux changements — retourne la fonction de désabonnement */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── API publique (écriture) ─────────────────────────────────

/** Met à jour le statut d'une session */
export function updateSessionStatus(id: string, status: TeleconsultSessionStatus) {
  const idx = sessions.findIndex(s => s.id === id);
  if (idx === -1) return;
  sessions[idx] = { ...sessions[idx], status };
  emitChange();
}

/** Patient rejoint → status passe à "patient_ready" */
export function patientJoin(id: string) {
  // TODO BACKEND: POST /api/teleconsultation/{id}/patient-join
  updateSessionStatus(id, "patient_ready");
}

/** Médecin rejoint → si patient déjà prêt, passe à "in_call", sinon "doctor_ready" */
export function doctorJoin(id: string) {
  // TODO BACKEND: POST /api/teleconsultation/{id}/doctor-join
  const session = getSession(id);
  if (!session) return;
  if (session.status === "patient_ready") {
    updateSessionStatus(id, "in_call");
  } else {
    updateSessionStatus(id, "doctor_ready");
  }
}

/** Démarrer l'appel manuellement (médecin) */
export function startCall(id: string) {
  // TODO BACKEND: POST /api/teleconsultation/{id}/start
  updateSessionStatus(id, "in_call");
}

/** Terminer la session */
export function endSession(id: string) {
  // TODO BACKEND: POST /api/teleconsultation/{id}/end
  updateSessionStatus(id, "ended");
}

// ─── Hook React ──────────────────────────────────────────────

import { useSyncExternalStore } from "react";

/** Hook pour consommer les sessions avec re-render automatique */
export function useTeleconsultSessions(): TeleconsultSession[] {
  return useSyncExternalStore(subscribe, getSessions, getSessions);
}

/** Hook pour une session unique */
export function useTeleconsultSession(id: string): TeleconsultSession | undefined {
  const all = useTeleconsultSessions();
  return all.find(s => s.id === id);
}
