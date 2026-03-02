/**
 * CallScreen — Écran principal d'appel vidéo.
 * Layout vidéo (principale + mini preview), timer, qualité réseau.
 */
import { Stethoscope, User, VideoOff, Wifi } from "lucide-react";
import { useTeleconsultation } from "./TeleconsultationContext";
import ChatPanel from "./ChatPanel";
import DossierPanel from "./DossierPanel";
import CallControls from "./CallControls";

const connectionColors: Record<string, { color: string; label: string }> = {
  excellent: { color: "text-accent", label: "Excellente" },
  good: { color: "text-accent", label: "Bonne" },
  poor: { color: "text-warning", label: "Faible" },
  disconnected: { color: "text-destructive", label: "Déconnecté" },
  checking: { color: "text-muted-foreground", label: "Vérification…" },
};

export default function CallScreen() {
  const ctx = useTeleconsultation();
  const conn = connectionColors[ctx.connection] || connectionColors.checking;

  return (
    <div className="space-y-4">
      {/* Video area */}
      <div className="relative rounded-xl border bg-foreground/95 overflow-hidden" style={{ height: "calc(100vh - 320px)", minHeight: "400px" }}>
        {/* Main video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-primary-foreground/50" />
            </div>
            <p className="text-primary-foreground/80 text-lg font-medium">{ctx.otherPerson.name}</p>
            <p className="text-primary-foreground/50 text-sm">{ctx.otherPerson.role}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <p className="text-accent text-xs font-medium">Connecté</p>
            </div>
          </div>
        </div>

        {/* Self camera preview */}
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg bg-foreground/80 border border-primary-foreground/20 flex items-center justify-center">
          {ctx.media.isVideoOn ? (
            <div className="text-center">
              <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-2">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <p className="text-primary-foreground/60 text-xs">Vous</p>
            </div>
          ) : (
            <div className="text-center">
              <VideoOff className="h-8 w-8 text-primary-foreground/40 mx-auto" />
              <p className="text-primary-foreground/40 text-xs mt-1">Caméra désactivée</p>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="absolute top-4 left-4 rounded-full bg-foreground/60 backdrop-blur px-3 py-1 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <p className="text-primary-foreground text-sm font-medium">{ctx.callDuration}</p>
        </div>

        {/* Connection quality */}
        <div className="absolute top-4 right-4 rounded-full bg-foreground/60 backdrop-blur px-3 py-1 flex items-center gap-1.5">
          <Wifi className={`h-3 w-3 ${conn.color}`} />
          <span className={`text-xs font-medium ${conn.color}`}>{conn.label}</span>
        </div>

        {/* Doctor fiche rapide (when no dossier open) */}
        {ctx.role === "doctor" && !ctx.dossierOpen && !ctx.chatOpen && (
          <div className="absolute top-14 left-4 w-64 rounded-xl bg-card/95 backdrop-blur border shadow-elevated p-3 space-y-2">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-primary" />Fiche rapide patient
            </p>
            <div className="space-y-1.5 text-[11px]">
              {[
                ["Âge", "33 ans"], ["Groupe sanguin", "A+"], ["Allergies", "Pénicilline"],
                ["Traitements", "Metformine 500mg"], ["Antécédents", "Diabète T2"], ["Dernière visite", "5 Fév 2026"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={`font-medium ${k === "Allergies" ? "text-destructive" : "text-foreground"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panels */}
        <DossierPanel />
        <ChatPanel />
      </div>

      {/* Controls bar */}
      <CallControls />

      {/* Bottom info */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
            {ctx.otherPerson.initials}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{ctx.otherPerson.name}</p>
            <p className="text-xs text-muted-foreground">{ctx.otherPerson.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi className={`h-3.5 w-3.5 ${conn.color}`} />
          <span>{conn.label}</span>
        </div>
      </div>
    </div>
  );
}
