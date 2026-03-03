/**
 * TeleconsultationContext — State global de la téléconsultation.
 * Gère les phases, les médias, le chat, les notes et le résumé.
 *
 * // TODO BACKEND: Remplacer les mocks par des appels WebRTC + API
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import type { TelePhase, ConnectionQuality, MediaState, ChatMessage, TeleSummary, DossierTab } from "./types";
import { useTeleconsultSessions, startCall as storeStartCall, endSession as storeEndSession } from "./teleconsultSessionStore";

interface TeleCtx {
  role: "patient" | "doctor";
  phase: TelePhase; setPhase: (p: TelePhase) => void;
  // Media
  media: MediaState;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  toggleScreenShare: () => void;
  // Connection
  connection: ConnectionQuality;
  // Timer
  callDuration: string;
  // Checks (precheck)
  checks: Record<string, boolean>;
  toggleCheck: (key: string) => void;
  allChecked: boolean;
  // Chat
  chatOpen: boolean; setChatOpen: (v: boolean) => void;
  chatMessages: ChatMessage[];
  newMessage: string; setNewMessage: (v: string) => void;
  sendChat: () => void;
  // Dossier
  dossierOpen: boolean; setDossierOpen: (v: boolean) => void;
  dossierTab: DossierTab; setDossierTab: (v: DossierTab) => void;
  // Notes
  callNotes: string; setCallNotes: (v: string) => void;
  // Summary
  summary: TeleSummary; setSummary: React.Dispatch<React.SetStateAction<TeleSummary>>;
  // Actions
  startCall: () => void;
  endCall: () => void;
  confirmEnd: () => void;
  cancelEnd: () => void;
  copyLink: () => void;
  sendReminder: () => void;
  retestMic: () => void;
  // Other person
  otherPerson: { name: string; role: string; initials: string };
}

const Ctx = createContext<TeleCtx | null>(null);

export function useTeleconsultation() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTeleconsultation must be inside TeleconsultationProvider");
  return v;
}

export function TeleconsultationProvider({ role, children }: { role: "patient" | "doctor"; children: ReactNode }) {
  const [phase, setPhase] = useState<TelePhase>(role === "patient" ? "precheck" : "waiting");
  const [media, setMedia] = useState<MediaState>({ isMuted: false, isVideoOn: true, isSpeakerOn: true, isScreenSharing: false });
  const [connection, setConnection] = useState<ConnectionQuality>("checking");
  const [callDuration, setCallDuration] = useState("00:00:00");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Checks
  const [checks, setChecks] = useState<Record<string, boolean>>({
    internet: false, camera: false, micro: false, quiet: false, documents: false, identity: false,
  });
  const allChecked = Object.values(checks).every(Boolean);
  const toggleCheck = (key: string) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "doctor", text: "Bonjour, comment allez-vous aujourd'hui ?", time: "14:30" },
    { id: "2", sender: "patient", text: "Bonjour docteur, j'ai quelques questions sur mon traitement.", time: "14:31" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Dossier
  const [dossierOpen, setDossierOpen] = useState(false);
  const [dossierTab, setDossierTab] = useState<DossierTab>("notes");

  // Notes
  const [callNotes, setCallNotes] = useState("");

  // Summary
  const [summary, setSummary] = useState<TeleSummary>({
    diagnosis: "", nextRdv: "15 jours", amount: "35", paymentStatus: "captured",
    notes: "Le patient présente des symptômes de fatigue chronique. Bilan sanguin demandé.",
    prescriptions: [
      { medication: "Vitamine D3 1000UI", dosage: "1 gélule/jour pendant 3 mois" },
      { medication: "Magnésium B6", dosage: "2 comprimés/jour pendant 1 mois" },
    ],
    analyses: ["NFS complète", "Bilan thyroïdien (TSH, T3, T4)"],
  });

  const otherPerson = role === "patient"
    ? { name: "Dr. Ahmed Bouazizi", role: "Médecin généraliste", initials: "AB" }
    : { name: "Amine Ben Ali", role: "Patient · 33 ans · CNAM", initials: "AB" };

  // Simulate connection check
  useEffect(() => {
    if (phase === "precheck" || phase === "waiting") {
      const t = setTimeout(() => setConnection("excellent"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "call") setConnection("excellent");
  }, [phase]);

  const sendChat = useCallback(() => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}`, sender: role, text: newMessage,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setNewMessage("");
  }, [newMessage, role]);

  const sessions = useTeleconsultSessions();
  // Find the first active session for this role
  const activeSession = sessions.find(s => s.status !== "ended");

  const startCall = useCallback(() => {
    // TODO BACKEND: POST /api/teleconsultation/join
    // Update shared store
    if (activeSession) {
      storeStartCall(activeSession.id);
    }
    setPhase("call");
    let seconds = 0;
    intervalRef.current = setInterval(() => {
      seconds++;
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      setCallDuration(`${h}:${m}:${s}`);
    }, 1000);
  }, [activeSession]);

  const endCall = useCallback(() => setPhase("ending"), []);
  const confirmEnd = useCallback(() => {
    // TODO BACKEND: POST /api/teleconsultation/end
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Update shared store
    if (activeSession) {
      storeEndSession(activeSession.id);
    }
    setPhase("summary");
    toast({ title: "Consultation terminée", description: "Récapitulatif disponible." });
  }, [activeSession]);
  const cancelEnd = useCallback(() => setPhase("call"), []);

  const toggleMute = () => setMedia(m => ({ ...m, isMuted: !m.isMuted }));
  const toggleVideo = () => setMedia(m => ({ ...m, isVideoOn: !m.isVideoOn }));
  const toggleSpeaker = () => setMedia(m => ({ ...m, isSpeakerOn: !m.isSpeakerOn }));
  const toggleScreenShare = () => {
    // TODO BACKEND: WebRTC screen share
    setMedia(m => ({ ...m, isScreenSharing: !m.isScreenSharing }));
    toast({ title: "Partage d'écran", description: "Fonctionnalité UI-only (à brancher)." });
  };

  const copyLink = () => {
    // TODO BACKEND: GET /api/teleconsultation/link
    navigator.clipboard.writeText("https://medicare.tn/teleconsult/abc123").catch(() => {});
    toast({ title: "Lien copié", description: "Le lien a été copié dans le presse-papiers." });
  };
  const sendReminder = () => {
    // TODO BACKEND: POST /api/teleconsultation/reminder
    toast({ title: "Rappel envoyé", description: "Le patient a été notifié (mock)." });
  };
  const retestMic = () => {
    // TODO BACKEND: Test microphone
    toast({ title: "Test micro", description: "Microphone fonctionnel (mock)." });
  };

  // Cleanup
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const value: TeleCtx = {
    role, phase, setPhase, media, toggleMute, toggleVideo, toggleSpeaker, toggleScreenShare,
    connection, callDuration, checks, toggleCheck, allChecked,
    chatOpen, setChatOpen, chatMessages, newMessage, setNewMessage, sendChat,
    dossierOpen, setDossierOpen, dossierTab, setDossierTab,
    callNotes, setCallNotes, summary, setSummary,
    startCall, endCall, confirmEnd, cancelEnd,
    copyLink, sendReminder, retestMic, otherPerson,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
