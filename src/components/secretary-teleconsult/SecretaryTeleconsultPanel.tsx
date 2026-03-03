/**
 * SecretaryTeleconsultPanel — Panel de supervision des téléconsultations du jour.
 *
 * Lit le store partagé teleconsultSessionStore pour afficher les statuts en temps réel.
 * Actions : Envoyer rappel, Reprogrammer, Marquer patient prêt (UI-only).
 */
import { Video, Bell, RefreshCw, Wifi, WifiOff, CheckCircle2, Clock, UserCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  useTeleconsultSessions,
  updateSessionStatus,
  patientJoin,
  type TeleconsultSessionStatus,
} from "@/components/teleconsultation/teleconsultSessionStore";

const statusConfig: Record<TeleconsultSessionStatus, { label: string; className: string; icon: any }> = {
  scheduled:     { label: "Planifié",       className: "bg-muted/50 text-muted-foreground",              icon: Clock },
  patient_ready: { label: "Patient prêt",   className: "bg-accent/10 text-accent animate-pulse",         icon: UserCheck },
  doctor_ready:  { label: "Médecin prêt",   className: "bg-primary/10 text-primary",                     icon: CheckCircle2 },
  in_call:       { label: "En cours",       className: "bg-primary/10 text-primary animate-pulse",       icon: Video },
  ended:         { label: "Terminé",        className: "bg-muted text-muted-foreground",                 icon: CheckCircle2 },
};

export default function SecretaryTeleconsultPanel() {
  const sessions = useTeleconsultSessions();

  const handleSendReminder = (id: string, patientName: string) => {
    // TODO BACKEND: POST /api/teleconsult/{id}/reminder
    toast({ title: "Rappel envoyé", description: `Notification envoyée à ${patientName}.` });
  };

  const handleMarkPatientReady = (id: string, patientName: string) => {
    // TODO BACKEND: PATCH /api/teleconsult/{id}/patient-ready
    patientJoin(id);
    toast({ title: "Patient prêt", description: `${patientName} marqué comme prêt.` });
  };

  const handleReschedule = (id: string, patientName: string) => {
    // TODO BACKEND: PATCH /api/teleconsult/{id}/reschedule
    toast({ title: "Reprogrammation", description: `Demande de reprogrammation pour ${patientName} envoyée.` });
  };

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-card p-5">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
          <Video className="h-4 w-4 text-primary" />Téléconsultations du jour
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">Aucune téléconsultation prévue aujourd'hui.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />Téléconsultations du jour
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{sessions.length}</span>
        </h3>
      </div>
      <div className="divide-y">
        {sessions.map(session => {
          const config = statusConfig[session.status];
          const StatusIcon = config.icon;
          const time = new Date(session.scheduledAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

          return (
            <div key={session.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {session.patientAvatar}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm">{session.patientName}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.className}`}>
                      <StatusIcon className="h-3 w-3" />{config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{time} · {session.doctorName}</p>
                </div>
                {/* Connexion indicator */}
                <div className="shrink-0">
                  {session.status === "patient_ready" || session.status === "in_call" || session.status === "doctor_ready" ? (
                    <span className="flex items-center gap-1 text-[10px] text-accent font-medium">
                      <Wifi className="h-3 w-3" />Connecté
                    </span>
                  ) : session.status === "ended" ? (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />Fini
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <WifiOff className="h-3 w-3" />Hors ligne
                    </span>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-1 shrink-0 flex-wrap">
                  {session.status === "scheduled" && (
                    <>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleSendReminder(session.id, session.patientName)}>
                        <Bell className="h-3 w-3 mr-1" />Rappel
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleMarkPatientReady(session.id, session.patientName)}>
                        <UserCheck className="h-3 w-3 mr-1" />Marquer prêt
                      </Button>
                    </>
                  )}
                  {session.status !== "ended" && session.status !== "in_call" && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleReschedule(session.id, session.patientName)}>
                      <RefreshCw className="h-3 w-3 mr-1" />Reprogrammer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Re-export types for backward compat
export type { TeleconsultSessionStatus as TeleconsultStatus } from "@/components/teleconsultation/teleconsultSessionStore";
export type TeleconsultAppointment = {
  id: number;
  time: string;
  patient: string;
  avatar: string;
  doctor: string;
  status: string;
};
