/**
 * teleconsultHelpers.ts — Logique centralisée pour l'accès à une téléconsultation.
 *
 * getTeleconsultJoinState(appointment, now) calcule l'état du bouton "Rejoindre"
 * en fonction de l'heure du RDV :
 *   - T-15 min : bouton activé ("ready")
 *   - T+60 min : expiré
 *   - Entre T-60 et T-15 : countdown
 *   - Avant T-60 : too_early
 */

export type TeleconsultJoinState =
  | "too_early"   // Plus de 60 min avant le RDV
  | "countdown"   // Entre 60 min et 15 min avant
  | "ready"       // Fenêtre ouverte (T-15 → T+60)
  | "in_call"     // En cours (géré par le parent si besoin)
  | "ended"       // Consultation terminée normalement
  | "expired";    // Fenêtre dépassée (+60 min)

export interface TeleconsultJoinResult {
  state: TeleconsultJoinState;
  /** Minutes restantes avant ouverture (0 si déjà ouvert) */
  minutesToOpen: number;
  /** Label à afficher sur le bouton */
  label: string;
  /** true = bouton désactivé */
  disabled: boolean;
}

/**
 * Calcule l'état du bouton "Rejoindre la téléconsultation".
 *
 * @param scheduledAt - Date/heure ISO du RDV (ex: "2026-03-03T14:30:00")
 * @param now         - Date courante (injectable pour les tests)
 */
export function getTeleconsultJoinState(
  scheduledAt: string | Date,
  now: Date = new Date()
): TeleconsultJoinResult {
  const scheduled = new Date(scheduledAt);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60_000);

  // Fenêtre : T-15 min → T+60 min
  const OPEN_BEFORE = 15;   // minutes avant le RDV
  const CLOSE_AFTER = 60;   // minutes après le RDV

  // Après T+60 → expiré
  if (diffMin < -CLOSE_AFTER) {
    return { state: "expired", minutesToOpen: 0, label: "Consultation expirée", disabled: true };
  }

  // Entre T et T+60 → ready (consultation commencée)
  if (diffMin <= 0 && diffMin >= -CLOSE_AFTER) {
    return { state: "ready", minutesToOpen: 0, label: "Rejoindre la consultation", disabled: false };
  }

  // Entre T-15 et T → ready
  if (diffMin > 0 && diffMin <= OPEN_BEFORE) {
    return { state: "ready", minutesToOpen: 0, label: "Rejoindre la consultation", disabled: false };
  }

  // Entre T-60 et T-15 → countdown
  if (diffMin > OPEN_BEFORE && diffMin <= 60) {
    const minsLeft = diffMin - OPEN_BEFORE;
    return {
      state: "countdown",
      minutesToOpen: minsLeft,
      label: `Disponible dans ${minsLeft} min`,
      disabled: true,
    };
  }

  // Plus de 60 min avant → too_early
  return {
    state: "too_early",
    minutesToOpen: diffMin - OPEN_BEFORE,
    label: `Disponible dans ${diffMin - OPEN_BEFORE} min`,
    disabled: true,
  };
}
