import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Send, Bot, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message { id: string; sender: "me" | "ai"; text: string; time: string; }

const aiInitialMessages: Message[] = [
  { id: "1", sender: "ai", text: "Bonjour Dr. Bouazizi ! Je suis votre assistant IA Medicare. Comment puis-je vous aider ? Je peux vous aider avec des informations médicales, des protocoles ou des interactions médicamenteuses.", time: "—" },
];

const aiResponses = [
  "D'après les dernières recommandations HAS (2025), pour un patient diabétique de type 2 avec HbA1c entre 7% et 8%, le traitement de première intention reste la Metformine. Si les objectifs ne sont pas atteints après 3-6 mois, l'ajout d'un inhibiteur SGLT2 ou d'un agoniste GLP-1 est recommandé, surtout en cas de risque cardiovasculaire.",
  "Interaction potentielle détectée : l'association Metformine + AINS (ibuprofène) peut augmenter le risque d'acidose lactique, surtout en cas d'insuffisance rénale. Alternative recommandée : Paracétamol.",
  "Je vous recommande de vérifier la clairance de la créatinine avant de prescrire. Pour plus de précisions, consultez le Vidal ou le CRAT.",
];

const DoctorAIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(aiInitialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [responseIdx, setResponseIdx] = useState(0);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), sender: "me", text: newMessage, time };
    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");
    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: aiResponses[responseIdx % aiResponses.length], time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => [...prev, aiMsg]);
      setResponseIdx(prev => prev + 1);
    }, 1200);
  };

  return (
    <DashboardLayout role="doctor" title="Assistant IA">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
        {/* Disclaimer banner */}
        <div className="bg-warning/5 border-b border-warning/20 px-4 py-3">
          <p className="text-xs text-warning flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            ⚕️ Assistant informatif uniquement. Ne remplace pas un avis médical professionnel. Vérifiez toujours les informations avant de prescrire.
          </p>
        </div>

        {/* Chat header */}
        <div className="flex items-center gap-3 border-b p-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Assistant IA Medicare</p>
            <p className="text-xs text-muted-foreground">En ligne · Réponse instantanée</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" :
                "bg-primary/5 border border-primary/20 text-foreground rounded-bl-sm"
              }`}>
                {msg.sender === "ai" && <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1"><Bot className="h-3 w-3" />Assistant IA</p>}
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Posez une question médicale..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="flex-1"
            />
            <Button size="icon" className="gradient-primary text-primary-foreground h-9 w-9 shrink-0" onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAIAssistant;
