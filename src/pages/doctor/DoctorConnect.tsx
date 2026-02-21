import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Send, Paperclip, ChevronLeft, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockProContacts, mockCabinetContacts, mockProMessages, mockCabinetMessages, ChatContact, ChatMessage } from "@/data/mockData";

/* Connect = inter-pro + cabinet only (AI moved to dedicated page) */
type ConnectTab = "professionals" | "cabinet";

const DoctorConnect = () => {
  const [tab, setTab] = useState<ConnectTab>("professionals");
  const [selectedContact, setSelectedContact] = useState<string | null>("p1");
  const [newMessage, setNewMessage] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({ ...mockProMessages, ...mockCabinetMessages });
  const [searchQuery, setSearchQuery] = useState("");

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

  const tabs: { key: ConnectTab; label: string; icon: any }[] = [
    { key: "professionals", label: "Professionnels", icon: Users },
    { key: "cabinet", label: "Cabinet", icon: Building2 },
  ];

  return (
    <DashboardLayout role="doctor" title="Connect">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
        <div className="flex h-full">
          {/* Left panel */}
          <div className={`w-full sm:w-80 border-r flex flex-col ${mobileShowChat ? "hidden sm:flex" : "flex"}`}>
            <div className="flex border-b">
              {tabs.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setSelectedContact(t.key === "professionals" ? "p1" : "c1"); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${tab === t.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </button>
              ))}
            </div>

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
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden sm:flex" : "flex"}`}>
            {currentContact ? (
              <>
                <div className="flex items-center justify-between border-b p-3">
                  <div className="flex items-center gap-3">
                    <button className="sm:hidden" onClick={() => setMobileShowChat(false)}><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">{currentContact.avatar}</div>
                      {currentContact.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-card" />}
                    </div>
                    <div><p className="text-sm font-medium text-foreground">{currentContact.name}</p><p className="text-xs text-muted-foreground">{currentContact.specialty}</p></div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" :
                        "bg-muted text-foreground rounded-bl-sm"
                      }`}>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorConnect;