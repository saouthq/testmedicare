/**
 * DoctorJoinTeleconsultButton — Bouton pour le médecin pour rejoindre/démarrer une téléconsultation.
 *
 * Affiche un état en fonction du store partagé :
 *   - scheduled : "En attente du patient"
 *   - patient_ready : "Patient prêt — Rejoindre" (accent)
 *   - doctor_ready : "En attente du patient" 
 *   - in_call : "Consultation en cours — Rejoindre"
 *   - ended : "Terminée"
 */
import { useNavigate } from "react-router-dom";
import { Video, CheckCircle2, Clock, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTeleconsultSession, doctorJoin, startCall } from "./teleconsultSessionStore";

interface DoctorJoinTeleconsultButtonProps {
  sessionId: string;
  compact?: boolean;
}

export default function DoctorJoinTeleconsultButton({ sessionId, compact = false }: DoctorJoinTeleconsultButtonProps) {
  const navigate = useNavigate();
  const session = useTeleconsultSession(sessionId);

  if (!session) return null;

  const handleJoin = () => {
    // TODO BACKEND: POST /api/teleconsultation/{id}/doctor-join
    doctorJoin(sessionId);
    toast({ title: "Connexion à la téléconsultation…", description: `Session avec ${session.patientName}` });
    navigate("/dashboard/doctor/teleconsultation");
  };

  const handleStart = () => {
    // TODO BACKEND: POST /api/teleconsultation/{id}/start
    startCall(sessionId);
    toast({ title: "Appel démarré", description: `Téléconsultation avec ${session.patientName} en cours.` });
    navigate("/dashboard/doctor/teleconsultation");
  };

  const handleRejoin = () => {
    navigate("/dashboard/doctor/teleconsultation");
  };

  // ── scheduled : en attente
  if (session.status === "scheduled") {
    return (
      <Button variant="outline" size="sm" className={`text-xs ${compact ? "h-7" : ""}`} disabled>
        <Clock className="h-3.5 w-3.5 mr-1" />En attente du patient
      </Button>
    );
  }

  // ── patient_ready : le patient est prêt → bouton accent clignotant
  if (session.status === "patient_ready") {
    return (
      <Button
        size="sm"
        className={`text-xs gradient-primary text-primary-foreground shadow-primary-glow animate-pulse ${compact ? "h-7" : ""}`}
        onClick={handleJoin}
      >
        <Video className="h-3.5 w-3.5 mr-1" />Patient prêt — Rejoindre
      </Button>
    );
  }

  // ── doctor_ready : médecin a rejoint mais patient pas encore
  if (session.status === "doctor_ready") {
    return (
      <Button variant="outline" size="sm" className={`text-xs ${compact ? "h-7" : ""}`} onClick={handleStart}>
        <Play className="h-3.5 w-3.5 mr-1" />Démarrer sans attendre
      </Button>
    );
  }

  // ── in_call : en cours
  if (session.status === "in_call") {
    return (
      <Button
        size="sm"
        className={`text-xs bg-accent text-accent-foreground hover:bg-accent/90 ${compact ? "h-7" : ""}`}
        onClick={handleRejoin}
      >
        <Video className="h-3.5 w-3.5 mr-1 animate-pulse" />En cours — Rejoindre
      </Button>
    );
  }

  // ── ended
  return (
    <Button variant="outline" size="sm" className={`text-xs ${compact ? "h-7" : ""}`} disabled>
      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Terminée
    </Button>
  );
}
