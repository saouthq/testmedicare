import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Send, Paperclip, ChevronLeft, Users, Building2, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockProContacts, mockCabinetContacts, mockProMessages, mockCabinetMessages, ChatContact, ChatMessage } from "@/data/mockData";

type ConnectTab = "professionals" | "cabinet" | "ai";

const aiSuggestions = [
  "Résumer le dossier du patient Amine Ben Ali",
  "Quelles interactions avec Metformine + Glibenclamide ?",
  "Protocole de suivi diabète type 2",
  "Rédiger un courrier d'adressage cardiologue",
];

const DoctorConnect = () => {
  const [tab, setTab] = useState<ConnectTab>("professionals");
  const [selectedContact, setSelectedContact] = useState<string | null>("p1");
  const [newMessage, setNewMessage] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({ ...mockProMessages, ...mockCabinetMessages });
  const [searchQuery, setSearchQuery] = useState("");

  // AI chat state
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    { id: "ai-1", sender: "ai", senderName: "Assistant IA", text: "Bonjour Dr. Bouazizi ! Je suis votre assistant IA. Posez-moi des questions sur vos patients, des interactions médicamenteuses, des protocoles ou demandez-moi de rédiger un courrier.", time: "09:00" },
  ]);
  const [aiInput, setAiInput] = useState("");

  const contacts = tab === "professionals" ? mockProContacts : mockCabinetContacts;
  const currentContact = contacts.find(c => c.id === selectedContact);
  const currentMessages = selectedContact ? messages[selectedContact] || [] : [];

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const msg: ChatMessage = { id: Date.now().toString(), sender: "me", text: newMessage, time };
    setMessages(prev => ({ ...prev, [selectedContact]: [...(prev[selectedContact] || []), msg] }));
    setNewMessage("");
  };

  const sendAiMessage = (text?: string) => {
    const msgText = text || aiInput;
    if (!msgText.trim()) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "me", text: msgText, time };
    
    // Simulated AI response
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      senderName: "Assistant IA",
      text: `Je traite votre demande : "${msgText}"\n\nVoici une réponse simulée. En production, cette réponse proviendrait d'un modèle IA médical avec accès au dossier patient.`,
      time,
    };
    
    setAiMessages(prev => [...prev, userMsg, aiResponse]);
    setAiInput("");
  };

  const tabs: { key: ConnectTab; label: string; icon: any }[] = [
    { key: "professionals", label: "Confrères", icon: Users },
    { key: "cabinet", label: "Cabinet", icon: Building2 },
    { key: "ai", label: "Assistant IA", icon: Bot },
  ];

  return (
    <DashboardLayout role="doctor" title="Connect">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
        <div className="flex h-full">
          {/* Left panel */}
          <div className={`w-full sm:w-80 border-r flex flex-col ${(mobileShowChat || tab === "ai") ? "hidden sm:flex" : "flex"}`}>
            <div className="flex border-b">
              {tabs.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); if (t.key === "professionals") setSelectedContact("p1"); else if (t.key === "cabinet") setSelectedContact("c1"); setMobileShowChat(false); }}
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
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${tab === "cabinet" ? "bg-accent/10 text-accent" : "gradient-primary text-primary-foreground"}`}>{c.avatar}</div>
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
              <div className="flex-1 p-4 space-y-3">
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-foreground">Suggestions</p>
                  </div>
                  <div className="space-y-2">
                    {aiSuggestions.map((s, i) => (
                      <button key={i} onClick={() => { sendAiMessage(s); setMobileShowChat(true); }}
                        className="w-full text-left text-xs text-muted-foreground hover:text-primary bg-card rounded-lg border px-3 py-2 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat area - Professionals & Cabinet */}
          {tab !== "ai" && (
            <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden sm:flex" : "flex"}`}>
              {currentContact ? (
                <>
                  <div className="flex items-center justify-between border-b p-3">
                    <div className="flex items-center gap-3">
                      <button className="sm:hidden" onClick={() => setMobileShowChat(false)}><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
                      <div className="relative">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${tab === "cabinet" ? "bg-accent/10 text-accent" : "gradient-primary text-primary-foreground"}`}>{currentContact.avatar}</div>
                        {currentContact.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-card" />}
                      </div>
                      <div><p className="text-sm font-medium text-foreground">{currentContact.name}</p><p className="text-xs text-muted-foreground">{currentContact.specialty}</p></div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {currentMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                          {msg.senderName && <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.senderName}</p>}
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t p-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Paperclip className="h-4 w-4 text-muted-foreground" /></Button>
                      <Input placeholder="Écrire un message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} className="flex-1" />
                      <Button size="icon" className="gradient-primary text-primary-foreground h-9 w-9 shrink-0" onClick={sendMessage} disabled={!newMessage.trim()}><Send className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Sélectionnez une conversation</p></div>
              )}
            </div>
          )}

          {/* Chat area - AI */}
          {tab === "ai" && (
            <div className={`flex-1 flex flex-col ${!mobileShowChat && tab === "ai" ? "flex" : mobileShowChat ? "flex" : "hidden sm:flex"}`}>
              <div className="flex items-center gap-3 border-b p-3">
                <button className="sm:hidden" onClick={() => setMobileShowChat(false)}><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm font-medium text-foreground">Assistant IA Médical</p><p className="text-xs text-muted-foreground">Aide au diagnostic, interactions, rédaction</p></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                      {msg.senderName && <p className="text-[10px] font-semibold mb-1 opacity-70 flex items-center gap-1"><Bot className="h-3 w-3" />{msg.senderName}</p>}
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Posez une question médicale..." value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAiMessage()} className="flex-1" />
                  <Button size="icon" className="gradient-primary text-primary-foreground h-9 w-9 shrink-0" onClick={() => sendAiMessage()} disabled={!aiInput.trim()}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConnect;
