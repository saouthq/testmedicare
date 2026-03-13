/**
 * TeleconsultPanel — Panneau vidéo intégré dans la consultation.
 * S'affiche quand isTeleconsult=true dans ConsultationContext.
 * Utilise le TeleconsultationContext interne pour les contrôles vidéo.
 */
import { useState, useEffect, useRef } from "react";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, User,
  Wifi, Monitor, MessageSquare, Maximize2, Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsultation } from "./ConsultationContext";

type ConnectionQuality = "excellent" | "good" | "poor" | "checking";

const connColors: Record<ConnectionQuality, { color: string; label: string }> = {
  excellent: { color: "text-accent", label: "Excellente" },
  good: { color: "text-accent", label: "Bonne" },
  poor: { color: "text-warning", label: "Faible" },
  checking: { color: "text-muted-foreground", label: "…" },
};

export default function TeleconsultPanel() {
  const ctx = useConsultation();
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [conn] = useState<ConnectionQuality>("good");
  const [duration, setDuration] = useState("00:00:00");
  const startRef = useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => {
      const diff = Math.floor((Date.now() - startRef.current) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      setDuration(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const c = connColors[conn];

  return (
    <div className={`rounded-xl border bg-foreground/95 overflow-hidden transition-all ${
      expanded ? "fixed inset-4 z-50" : "relative"
    }`}
      style={{ height: expanded ? "auto" : "280px" }}
    >
      {/* Main video area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
            <User className="h-8 w-8 text-primary-foreground/50" />
          </div>
          <p className="text-primary-foreground/80 text-sm font-medium">{ctx.patient.name}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-accent text-[10px]">Connecté</span>
          </div>
        </div>
      </div>

      {/* Self preview */}
      <div className="absolute bottom-2 right-2 w-28 h-20 rounded-lg bg-foreground/80 border border-primary-foreground/20 flex items-center justify-center">
        {videoOn ? (
          <div className="text-center">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center mx-auto mb-1">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="text-primary-foreground/60 text-[9px]">Vous</p>
          </div>
        ) : (
          <VideoOff className="h-5 w-5 text-primary-foreground/40" />
        )}
      </div>

      {/* Timer + connection */}
      <div className="absolute top-2 left-2 rounded-full bg-foreground/60 backdrop-blur px-2 py-0.5 flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
        <span className="text-primary-foreground text-[11px] font-medium">{duration}</span>
      </div>

      <div className="absolute top-2 right-2 rounded-full bg-foreground/60 backdrop-blur px-2 py-0.5 flex items-center gap-1">
        <Wifi className={`h-3 w-3 ${c.color}`} />
        <span className={`text-[10px] font-medium ${c.color}`}>{c.label}</span>
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <Button
          size="icon"
          variant={muted ? "destructive" : "secondary"}
          className="h-7 w-7 rounded-full"
          onClick={() => setMuted(!muted)}
        >
          {muted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
        </Button>
        <Button
          size="icon"
          variant={videoOn ? "secondary" : "destructive"}
          className="h-7 w-7 rounded-full"
          onClick={() => setVideoOn(!videoOn)}
        >
          {videoOn ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7 rounded-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
