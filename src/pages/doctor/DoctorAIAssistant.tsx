import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Send, Bot, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FeatureGate from "@/components/shared/FeatureGate";
import type { ChatMessage } from "@/types";

// Keyword-based contextual responses
const keywordResponses: { keywords: string[]; response: string }[] = [
  { keywords: ["tension", "hypertension", "ta", "pression"], response: "📋 **Guidelines Hypertension (ESH/ESC)**\n\n• Objectif TA < 140/90 mmHg (< 130/80 si diabète)\n• 1ère intention : IEC ou ARA2 + thiazidique\n• MAPA recommandée pour confirmer le diagnostic\n• Bilan : ionogramme, créatinine, bilan lipidique, glycémie\n• Contrôle à 4-6 semaines après initiation du traitement" },
  { keywords: ["diabète", "diabete", "glycémie", "hba1c", "insuline"], response: "📋 **Protocole Diabète Type 2**\n\n• Objectif HbA1c < 7% (individualisé selon le patient)\n• 1ère intention : Metformine 500mg → 1000mg x2/j\n• Si HbA1c > 7.5% à 3 mois : ajout Sulfamide ou iDPP4\n• Bilan trimestriel : HbA1c, glycémie à jeun\n• Bilan annuel : fond d'œil, bilan rénal, ECG, pieds" },
  { keywords: ["interaction", "médicament", "contre-indication"], response: "⚠️ **Interactions médicamenteuses fréquentes**\n\n• Metformine + Produits de contraste iodés → arrêt 48h avant\n• AVK + AINS → risque hémorragique majeur\n• IEC + Potassium → hyperkaliémie\n• Statines + Macrolides → rhabdomyolyse\n\nConsultez toujours le Vidal ou Thériaque pour les interactions spécifiques." },
  { keywords: ["ordonnance", "prescription", "renouvellement"], response: "📝 **Règles de prescription**\n\n• Durée max ordonnance : 12 mois (1 mois renouvelable)\n• Stupéfiants : ordonnance sécurisée, 28 jours max\n• Bizone : séparer ALD / hors ALD\n• Vérifier les DCI et les dosages avant envoi" },
  { keywords: ["certificat", "aptitude", "sport"], response: "📄 **Certificat médical**\n\n• Certificat d'aptitude sportive : examen clinique + ECG si > 35 ans\n• Arrêt maladie : durée justifiée par l'état clinique\n• Certificat de non contre-indication : examen du jour\n• Toujours dater, signer et tamponner" },
  { keywords: ["urgence", "douleur thoracique", "infarctus"], response: "🚨 **Urgence — Douleur thoracique**\n\n• SAMU 190 immédiatement si suspicion SCA\n• Aspirine 250mg si pas de contre-indication\n• ECG 12 dérivations dans les 10 min\n• Troponine à H0 et H3\n• Ne pas retarder la prise en charge" },
];

const getAIResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();
  const match = keywordResponses.find(kr => kr.keywords.some(k => lower.includes(k)));
  if (match) return match.response;
  return `Je traite votre demande : "${userMessage}"\n\nCette fonctionnalité nécessite un modèle IA backend (GPT/Claude) pour générer des réponses médicales contextuelles. En mode démonstration, essayez des mots-clés comme : tension, diabète, interaction, ordonnance, certificat, urgence.`;
};

const DoctorAIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "ai-init", sender: "ai", senderName: "Assistant IA", text: "Bonjour Dr. Bouazizi ! Je suis votre assistant IA. Posez-moi des questions sur la tension, le diabète, les interactions médicamenteuses, les protocoles ou les certificats.\n\n⚠️ Mode démonstration — réponses basées sur des mots-clés.", time: "09:00" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "me", text: newMessage, time };
    const aiResponse = getAIResponse(newMessage);
    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");
    setTimeout(() => {
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "ai", senderName: "Assistant IA", text: aiResponse, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <DashboardLayout role="doctor" title="Assistant IA">
      <FeatureGate featureId="ai_assistant">
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
      </FeatureGate>
    </DashboardLayout>
  );
};

export default DoctorAIAssistant;