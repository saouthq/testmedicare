/**
 * WaitingScreen — Écran d'attente (patient pas encore là).
 * Statut animé, actions : copier lien, envoyer message, re-tester micro.
 */
import { Clock, Copy, Loader2, MessageSquare, Mic, Video, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeleconsultation } from "./TeleconsultationContext";

export default function WaitingScreen() {
  const ctx = useTeleconsultation();

  const statusLabel = ctx.connection === "checking"
    ? "Vérification de la connexion…"
    : ctx.connection === "poor"
      ? "Connexion faible — vérifiez votre réseau"
      : "En attente du patient…";

  const statusColor = ctx.connection === "poor" ? "text-warning" : "text-accent";

  return (
    <div className="max-w-lg mx-auto space-y-6 pt-8">
      {/* Status card */}
      <div className="rounded-2xl border bg-card shadow-card p-8 text-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Salle d'attente virtuelle</h2>
        <div className={`flex items-center justify-center gap-2 mt-3 ${statusColor}`}>
          <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
          <span className="text-sm font-medium">{statusLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Le patient sera connecté automatiquement dès qu'il rejoint.
        </p>

        {/* Connection quality */}
        <div className="flex items-center justify-center gap-2 mt-4 p-2 rounded-lg bg-muted/50">
          <Wifi className={`h-3.5 w-3.5 ${ctx.connection === "excellent" ? "text-accent" : ctx.connection === "poor" ? "text-warning" : "text-muted-foreground"}`} />
          <span className="text-xs text-muted-foreground">
            {ctx.connection === "excellent" ? "Connexion excellente" : ctx.connection === "good" ? "Bonne connexion" : ctx.connection === "poor" ? "Connexion faible" : "Vérification…"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border bg-card shadow-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {ctx.otherPerson.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{ctx.otherPerson.name}</p>
            <p className="text-xs text-muted-foreground">{ctx.otherPerson.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Aujourd'hui à 14:30 · Durée estimée : 20 min</span>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-xl border bg-card shadow-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Actions rapides</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" size="sm" className="text-xs justify-start" onClick={ctx.copyLink}>
            <Copy className="h-3.5 w-3.5 mr-2" />Copier le lien
          </Button>
          <Button variant="outline" size="sm" className="text-xs justify-start" onClick={ctx.sendReminder}>
            <MessageSquare className="h-3.5 w-3.5 mr-2" />Envoyer un rappel
          </Button>
          <Button variant="outline" size="sm" className="text-xs justify-start" onClick={ctx.retestMic}>
            <Mic className="h-3.5 w-3.5 mr-2" />Re-tester le micro
          </Button>
          <Button size="sm" className="text-xs gradient-primary text-primary-foreground shadow-primary-glow justify-start" onClick={ctx.startCall}>
            <Video className="h-3.5 w-3.5 mr-2" />Démarrer sans attendre
          </Button>
        </div>
      </div>
    </div>
  );
}
