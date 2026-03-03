/**
 * JoinTeleconsultButton — Bouton réutilisable "Rejoindre la téléconsultation".
 *
 * Affiche un état visuel dynamique basé sur getTeleconsultJoinState :
 *   - too_early / countdown : disabled, gris ou pulse
 *   - ready : gradient-primary, cliquable
 *   - ended / expired : muted + CTA "Contacter le cabinet"
 *
 * Rafraîchit automatiquement toutes les 30 secondes.
 * Met à jour le store partagé quand le patient rejoint.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getTeleconsultJoinState, type TeleconsultJoinResult } from "./teleconsultHelpers";
import { patientJoin } from "./teleconsultSessionStore";

interface JoinTeleconsultButtonProps {
  /** Date/heure ISO du RDV */
  scheduledAt: string;
  /** ID de session téléconsultation (pour le store partagé) */
  sessionId?: string;
  /** Date courante (injectable pour tests/démo) */
  now?: Date;
  /** Afficher en pleine largeur */
  fullWidth?: boolean;
}

export default function JoinTeleconsultButton({ scheduledAt, sessionId, now, fullWidth = false }: JoinTeleconsultButtonProps) {
  const navigate = useNavigate();
  const [joinState, setJoinState] = useState<TeleconsultJoinResult>(() =>
    getTeleconsultJoinState(scheduledAt, now ?? new Date())
  );

  // Actualise l'état toutes les 30 secondes
  useEffect(() => {
    const update = () => setJoinState(getTeleconsultJoinState(scheduledAt, now ?? new Date()));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [scheduledAt, now]);

  const handleJoin = () => {
    // TODO BACKEND: validate join / session — vérifier que le patient a le droit de rejoindre
    if (sessionId) {
      patientJoin(sessionId);
    }
    toast({ title: "Connexion à la téléconsultation…", description: "Vérification de la session en cours." });
    navigate("/dashboard/patient/teleconsultation");
  };

  const handleContact = () => {
    // TODO BACKEND: envoyer message au cabinet
    toast({ title: "Contacter le cabinet", description: "Redirection vers la messagerie." });
    navigate("/dashboard/patient/messages");
  };

  // ── États visuels ──
  if (joinState.state === "expired" || joinState.state === "ended") {
    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? "w-full" : ""}`}>
        <Button disabled variant="outline" className={`text-xs ${fullWidth ? "w-full" : ""}`}>
          <Video className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          {joinState.label}
        </Button>
        <Button variant="outline" size="sm" className={`text-xs ${fullWidth ? "w-full" : ""}`} onClick={handleContact}>
          <Phone className="h-3.5 w-3.5 mr-1.5" />Contacter le cabinet
        </Button>
      </div>
    );
  }

  if (joinState.state === "ready") {
    return (
      <Button
        className={`gradient-primary text-primary-foreground shadow-primary-glow ${fullWidth ? "w-full" : ""}`}
        onClick={handleJoin}
      >
        <Video className="h-4 w-4 mr-2" />Rejoindre la consultation
      </Button>
    );
  }

  // countdown ou too_early
  return (
    <Button
      disabled
      variant="outline"
      className={`text-xs ${joinState.state === "countdown" ? "animate-pulse" : ""} ${fullWidth ? "w-full" : ""}`}
    >
      <Video className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
      {joinState.label}
    </Button>
  );
}
