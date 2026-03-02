/**
 * Types UI locaux pour la téléconsultation.
 */
export type TelePhase = "precheck" | "waiting" | "call" | "ending" | "summary";

export type ConnectionQuality = "checking" | "excellent" | "good" | "poor" | "disconnected";

export type MediaState = {
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
};

export type DeviceSelection = {
  camera: string;
  mic: string;
  speaker: string;
};

export type ChatMessage = {
  id: string;
  sender: "patient" | "doctor";
  text: string;
  time: string;
};

export type TeleSummary = {
  diagnosis: string;
  notes: string;
  prescriptions: Array<{ medication: string; dosage: string }>;
  analyses: string[];
  nextRdv: string;
  amount: string;
  paymentStatus: "captured" | "pending";
};

export type CheckItem = {
  key: string;
  label: string;
  desc: string;
  iconName: string;
};

export type DossierTab = "notes" | "rx" | "analyses" | "docs" | "historique";
