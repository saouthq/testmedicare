/**
 * CallControls — Barre de contrôles audio/vidéo pendant l'appel.
 */
import { FileText, MessageSquare, Mic, MicOff, Monitor, Phone, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeleconsultation } from "./TeleconsultationContext";

export default function CallControls() {
  const ctx = useTeleconsultation();

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant={ctx.media.isMuted ? "destructive" : "outline"}
        size="icon" className="h-12 w-12 rounded-full"
        onClick={ctx.toggleMute}
        title={ctx.media.isMuted ? "Activer micro" : "Couper micro"}
      >
        {ctx.media.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
      <Button
        variant={!ctx.media.isVideoOn ? "destructive" : "outline"}
        size="icon" className="h-12 w-12 rounded-full"
        onClick={ctx.toggleVideo}
        title={ctx.media.isVideoOn ? "Couper caméra" : "Activer caméra"}
      >
        {ctx.media.isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>
      <Button
        variant={!ctx.media.isSpeakerOn ? "destructive" : "outline"}
        size="icon" className="h-12 w-12 rounded-full"
        onClick={ctx.toggleSpeaker}
        title={ctx.media.isSpeakerOn ? "Couper haut-parleur" : "Activer haut-parleur"}
      >
        {ctx.media.isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </Button>
      <Button
        variant={ctx.media.isScreenSharing ? "default" : "outline"}
        size="icon" className="h-12 w-12 rounded-full"
        onClick={ctx.toggleScreenShare}
        title="Partage d'écran"
      >
        <Monitor className="h-5 w-5" />
      </Button>
      <Button
        variant={ctx.chatOpen ? "default" : "outline"}
        size="icon" className="h-12 w-12 rounded-full"
        onClick={() => ctx.setChatOpen(!ctx.chatOpen)}
        title="Chat"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
      {ctx.role === "doctor" && (
        <Button
          variant={ctx.dossierOpen ? "default" : "outline"}
          size="icon" className="h-12 w-12 rounded-full"
          onClick={() => ctx.setDossierOpen(!ctx.dossierOpen)}
          title="Dossier / Notes"
        >
          <FileText className="h-5 w-5" />
        </Button>
      )}
      <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full" onClick={ctx.endCall} title="Terminer">
        <Phone className="h-6 w-6 rotate-[135deg]" />
      </Button>
    </div>
  );
}
