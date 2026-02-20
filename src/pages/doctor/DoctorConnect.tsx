import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Send, Paperclip, ChevronLeft, Users, Building2, Bot, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConnectTab = "professionals" | "cabinet" | "ai";

interface Contact { id: string; name: string; specialty: string; avatar: string; lastMessage: string; time: string; unread: number; online: boolean; }
interface Message { id: string; sender: "me" | "them" | "ai"; text: string; time: string; senderName?: string; }

const proContacts: Contact[] = [
  { id: "p1", name: "Dr. Sonia Gharbi", specialty: "Cardiologue", avatar: "SG", lastMessage: "Merci pour l'orientation, je prends en charge.", time: "10:30", unread: 1, online: true },
  { id: "p2", name: "Dr. Khaled Hammami", specialty: "Dermatologue", avatar: "KH", lastMessage: "Les résultats du bilan cutané sont bons.", time: "Hier", unread: 0, online: false },
  { id: "p3", name: "Dr. Leila Chahed", specialty: "Endocrinologue", avatar: "LC", lastMessage: "Je vous envoie le protocole.", time: "18 Fév", unread: 0, online: true },
];

const cabinetContacts: Contact[] = [
  { id: "c1", name: "Chat du cabinet", specialty: "Dr. Bouazizi · Mme Fatma (Secrétaire)", avatar: "CB", lastMessage: "Le patient de 14h30 a annulé.", time: "11:15", unread: 2, online: true },
];

const proMessages: Record<string, Message[]> = {
  "p1": [
    { id: "1", sender: "me", text: "Bonjour Dr. Gharbi, j'ai un patient avec suspicion d'arythmie. Pourriez-vous le prendre en charge ?", time: "09:45" },
    { id: "2", sender: "them", text: "Bonjour Dr. Bouazizi, bien sûr. Envoyez-moi son dossier et je planifie un ECG.", time: "10:00" },
    { id: "3", sender: "me", text: "Je vous envoie le dossier maintenant. Merci beaucoup !", time: "10:15" },
    { id: "4", sender: "them", text: "Merci pour l'orientation, je prends en charge.", time: "10:30" },
  ],
};

const cabinetMessages: Record<string, Message[]> = {
  "c1": [
    { id: "1", sender: "them", text: "Le patient de 14h30 a appelé pour annuler.", time: "11:00", senderName: "Mme Fatma" },
    { id: "2", sender: "me", text: "D'accord, essayez de placer un patient en liste d'attente sur ce créneau.", time: "11:10" },
    { id: "3", sender: "them", text: "Le patient de 14h30 a annulé.", time: "11:15", senderName: "Mme Fatma" },
  ],
};

const aiInitialMessages: Message[] = [
  { id: "1", sender: "ai", text: "Bonjour Dr. Bouazizi ! Je suis votre assistant IA Medicare. Comment puis-je vous aider ? Je peux vous aider avec des informations médicales, des protocoles ou des interactions médicamenteuses.", time: "—" },
];

const aiResponses = [
  "D'après les dernières recommandations HAS (2025), pour un patient diabétique de type 2 avec HbA1c entre 7% et 8%, le traitement de première intention reste la Metformine. Si les objectifs ne sont pas atteints après 3-6 mois, l'ajout d'un inhibiteur SGLT2 ou d'un agoniste GLP-1 est recommandé, surtout en cas de risque cardiovasculaire.",
  "Interaction potentielle détectée : l'association Metformine + AINS (ibuprofène) peut augmenter le risque d'acidose lactique, surtout en cas d'insuffisance rénale. Alternative recommandée : Paracétamol.",
  "Je vous recommande de vérifier la clairance de la créatinine avant de prescrire. Pour plus de précisions, consultez le Vidal ou le CRAT.",
];

const DoctorConnect = () => {
  const [tab, setTab] = useState<ConnectTab>("professionals");
  const [selectedContact, setSelectedContact] = useState<string | null>("p1");
  const [newMessage, setNewMessage] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({ ...proMessages, ...cabinetMessages });
  const [aiMessages, setAiMessages] = useState<Message[]>(aiInitialMessages);
  const [aiResponseIdx, setAiResponseIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const contacts = tab === "professionals" ? proContacts : tab === "cabinet" ? cabinetContacts : [];
  const currentContact = contacts.find(c => c.id === selectedContact);
  const currentMessages = tab === "ai" ? aiMessages : (selectedContact ? messages[selectedContact] || [] : []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    
    if (tab === "ai") {
      const userMsg: Message = { id: Date.now().toString(), sender: "me", text: newMessage, time };
      setAiMessages(prev => [...prev, userMsg]);
      setNewMessage("");
      setTimeout(() => {
        const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: aiResponses[aiResponseIdx % aiResponses.length], time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
        setAiMessages(prev => [...prev, aiMsg]);
        setAiResponseIdx(prev => prev + 1);
      }, 1200);
    } else if (selectedContact) {
      const msg: Message = { id: Date.now().toString(), sender: "me", text: newMessage, time };
      setMessages(prev => ({ ...prev, [selectedContact]: [...(prev[selectedContact] || []), msg] }));
      setNewMessage("");
    }
  };

  const tabs: { key: ConnectTab; label: string; icon: any }[] = [
    { key: "professionals", label: "Professionnels", icon: Users },
    { key: "cabinet", label: "Cabinet", icon: Building2 },
    { key: "ai", label: "Assistant IA", icon: Bot },
  ];

  return (
    <DashboardLayout role="doctor" title="Connect">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
        <div className="flex h-full">
          {/* Left panel */}
          <div className={`w-full sm:w-80 border-r flex flex-col ${mobileShowChat ? "hidden sm:flex" : "flex"}`}>
            {/* Tabs */}
            <div className="flex border-b">
              {tabs.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setSelectedContact(t.key === "professionals" ? "p1" : t.key === "cabinet" ? "c1" : null); setMobileShowChat(t.key === "ai"); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </button>
              ))}
            </div>

            {tab !== "ai" && (
              <>
                <div className="p-3 border-b">
                  <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" /></div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                    <button key={c.id} onClick={() => { setSelectedContact(c.id); setMobileShowChat(true); }}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors ${selectedContact === c.id ? "bg-primary/5 border-r-2 border-r-primary" : ""}`}>
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">{c.avatar}</div>
                        {c.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-card" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between"><p className="text-sm font-medium text-foreground truncate">{c.name}</p><span className="text-xs text-muted-foreground shrink-0">{c.time}</span></div>
                        <p className="text-[11px] text-muted-foreground">{c.specialty}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                      </div>
                      {c.unread > 0 && <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center shrink-0">{c.unread}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab === "ai" && (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><Bot className="h-8 w-8 text-primary" /></div>
                  <h3 className="font-semibold text-foreground">Assistant IA Medicare</h3>
                  <p className="text-xs text-muted-foreground mt-1">Posez vos questions médicales, protocoles, interactions médicamenteuses</p>
                  <div className="mt-4 rounded-lg bg-warning/5 border border-warning/20 p-3">
                    <p className="text-[11px] text-warning flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />Assistant informatif uniquement. Ne remplace pas un avis médical.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!mobileShowChat && tab !== "ai" ? "hidden sm:flex" : "flex"}`}>
            {(currentContact || tab === "ai") ? (
              <>
                <div className="flex items-center justify-between border-b p-3">
                  <div className="flex items-center gap-3">
                    <button className="sm:hidden" onClick={() => setMobileShowChat(false)}><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
                    {tab === "ai" ? (
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="h-5 w-5 text-primary" /></div>
                        <div><p className="text-sm font-medium text-foreground">Assistant IA Medicare</p><p className="text-xs text-muted-foreground">En ligne · Réponse instantanée</p></div>
                      </div>
                    ) : currentContact && (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">{currentContact.avatar}</div>
                          {currentContact.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-card" />}
                        </div>
                        <div><p className="text-sm font-medium text-foreground">{currentContact.name}</p><p className="text-xs text-muted-foreground">{currentContact.specialty}</p></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {tab === "ai" && (
                    <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 mb-4">
                      <p className="text-[11px] text-warning flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 shrink-0" />⚕️ Cet assistant est informatif et ne remplace pas un avis médical professionnel. Vérifiez toujours les informations avant de prescrire.</p>
                    </div>
                  )}
                  {currentMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" : 
                        msg.sender === "ai" ? "bg-primary/5 border border-primary/20 text-foreground rounded-bl-sm" :
                        "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        {msg.senderName && <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.senderName}</p>}
                        {msg.sender === "ai" && <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1"><Bot className="h-3 w-3" />Assistant IA</p>}
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t p-3">
                  <div className="flex items-center gap-2">
                    {tab !== "ai" && <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Paperclip className="h-4 w-4 text-muted-foreground" /></Button>}
                    <Input 
                      placeholder={tab === "ai" ? "Posez une question médicale..." : "Écrire un message..."} 
                      value={newMessage} onChange={e => setNewMessage(e.target.value)} 
                      onKeyDown={e => e.key === "Enter" && sendMessage()} className="flex-1" 
                    />
                    <Button size="icon" className="gradient-primary text-primary-foreground h-9 w-9 shrink-0" onClick={sendMessage} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Sélectionnez une conversation</p></div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConnect;
