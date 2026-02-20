import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Video, VideoOff, Mic, MicOff, Phone, MessageSquare, Monitor,
  Settings, Maximize2, FileText, Send, User
} from "lucide-react";

const Teleconsultation = ({ role = "patient" }: { role?: "patient" | "doctor" }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "doctor", text: "Bonjour, comment allez-vous aujourd'hui ?", time: "14:30" },
    { sender: "patient", text: "Bonjour docteur, j'ai quelques questions sur mon traitement.", time: "14:31" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const otherPerson = role === "patient"
    ? { name: "Dr. Sophie Martin", role: "Médecin généraliste" }
    : { name: "Jean Dupont", role: "Patient" };

  const sendChat = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      sender: role,
      text: newMessage,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setNewMessage("");
  };

  return (
    <DashboardLayout role={role} title="Téléconsultation">
      <div className="space-y-4">
        {/* Video area */}
        <div className="relative rounded-xl border bg-foreground/95 overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
          {/* Main video (remote) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-primary-foreground/50" />
              </div>
              <p className="text-primary-foreground/80 text-lg font-medium">{otherPerson.name}</p>
              <p className="text-primary-foreground/50 text-sm">{otherPerson.role}</p>
              <p className="text-primary-foreground/40 text-xs mt-2">En attente de connexion...</p>
            </div>
          </div>

          {/* Self video (picture-in-picture) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg bg-foreground/80 border border-primary-foreground/20 flex items-center justify-center">
            {isVideoOn ? (
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

          {/* Duration */}
          <div className="absolute top-4 left-4 rounded-full bg-foreground/60 backdrop-blur px-3 py-1">
            <p className="text-primary-foreground text-sm font-medium">00:05:32</p>
          </div>

          {/* Chat panel */}
          {isChatOpen && (
            <div className="absolute top-0 right-0 bottom-0 w-80 bg-card border-l flex flex-col">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Chat</h3>
                <button onClick={() => setIsChatOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === role ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.sender === role ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-0.5 ${msg.sender === role ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-2 flex gap-2">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Message..."
                  className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button size="icon" className="h-8 w-8 gradient-primary text-primary-foreground" onClick={sendChat}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            variant={!isVideoOn ? "destructive" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
            <Monitor className="h-5 w-5" />
          </Button>
          <Button
            variant={isChatOpen ? "default" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          {role === "doctor" && (
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
              <FileText className="h-5 w-5" />
            </Button>
          )}
          <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full">
            <Phone className="h-6 w-6 rotate-[135deg]" />
          </Button>
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between rounded-lg border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
              {otherPerson.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{otherPerson.name}</p>
              <p className="text-xs text-muted-foreground">{otherPerson.role}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Connexion sécurisée · Chiffrée de bout en bout
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Teleconsultation;
