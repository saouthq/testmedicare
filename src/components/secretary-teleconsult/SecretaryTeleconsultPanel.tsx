/**
 * SecretaryTeleconsultPanel — Panel de supervision des téléconsultations du jour.
 *
 * Affiche la liste des RDV de type Téléconsultation avec :
 *   - Nom patient, heure, statut (À venir / Patient prêt / En cours / Terminé)
 *   - Actions : Envoyer rappel, Reprogrammer, Voir statut connexion
 *
 * Pas de vidéo — supervision textuelle uniquement.
 */
import { useState } from "react";
import { Video, Bell, RefreshCw, Wifi, WifiOff, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export type TeleconsultStatus = "upcoming" | "patient_ready" | "in_call" | "done";

export interface TeleconsultAppointment {
  id: number;
  time: string;
  patient: string;
  avatar: string;
  doctor: string;
  status: TeleconsultStatus;
}

const statusConfig: Record<TeleconsultStatus, { label: string; className: string; icon: any }> = {
  upcoming:      { label: "À venir",       className: "bg-muted/50 text-muted-foreground", icon: Clock },
  patient_ready: { label: "Patient prêt",  className: "bg-accent/10 text-accent",          icon: CheckCircle2 },
  in_call:       { label: "En cours",      className: "bg-primary/10 text-primary animate-pulse", icon: Video },
  done:          { label: "Terminé",       className: "bg-muted text-muted-foreground",    icon: CheckCircle2 },
};

interface SecretaryTeleconsultPanelProps {
  appointments: TeleconsultAppointment[];
}

export default function SecretaryTeleconsultPanel({ appointments: initialAppointments }: SecretaryTeleconsultPanelProps) {
  const [appointments, setAppointments] = useState(initialAppointments);

  const handleSendReminder = (id: number) => {
    // TODO BACKEND: POST /api/teleconsult/{id}/reminder — envoyer notification au patient
    const apt = appointments.find(a => a.id === id);
    toast({ title: "Rappel envoyé", description: `Notification envoyée à ${apt?.patient}.` });
  };

  const handleReschedule = (id: number) => {
    // TODO BACKEND: PATCH /api/teleconsult/{id}/reschedule — reprogrammer
    const apt = appointments.find(a => a.id === id);
    toast({ title: "Reprogrammation", description: `Demande de reprogrammation pour ${apt?.patient} envoyée.` });
  };

  if (appointments.length === 0) {
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
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{appointments.length}</span>
        </h3>
      </div>
      <div className="divide-y">
        {appointments.map(apt => {
          const config = statusConfig[apt.status];
          const StatusIcon = config.icon;
          return (
            <div key={apt.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {apt.avatar}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">{apt.patient}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.className}`}>
                      <StatusIcon className="h-3 w-3" />{config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{apt.time} · {apt.doctor}</p>
                </div>
                {/* Connexion indicator */}
                <div className="shrink-0">
                  {apt.status === "patient_ready" || apt.status === "in_call" ? (
                    <span className="flex items-center gap-1 text-[10px] text-accent font-medium">
                      <Wifi className="h-3 w-3" />Connecté
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <WifiOff className="h-3 w-3" />Hors ligne
                    </span>
                  )}
                </div>
                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  {apt.status === "upcoming" && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleSendReminder(apt.id)}>
                      <Bell className="h-3 w-3 mr-1" />Rappel
                    </Button>
                  )}
                  {apt.status !== "done" && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={() => handleReschedule(apt.id)}>
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
