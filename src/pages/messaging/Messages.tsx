import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, ChevronLeft, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockMessagingContacts, mockConversationMessages, mockSecretaryCabinetContacts, mockSecretaryCabinetMessages, ChatMessage, ChatContact } from "@/data/mockData";

type MessagingTab = "messages" | "cabinet";

const Messages = ({ role = "patient" }: { role?: "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" }) => {
  const hasCabinetChat = role === "secretary";

  const [tab, setTab] = useState<MessagingTab>("messages");
  const [selectedContact, setSelectedContact] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    ...mockConversationMessages,
    ...mockSecretaryCabinetMessages,
  });
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const contacts: ChatContact[] = tab === "cabinet" ? mockSecretaryCabinetContacts : mockMessagingContacts;
  const contact = contacts.find(c => c.id === selectedContact);
  const currentMessages = selectedContact ? (messages[selectedContact] || []) : [];

  const handleTabChange = (newTab: MessagingTab) => {
    setTab(newTab);
    const defaultContact = newTab === "cabinet" ? mockSecretaryCabinetContacts[0]?.id : mockMessagingContacts[0]?.id;
    setSelectedContact(defaultContact || null);
    setMobileShowChat(false);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    const msg: ChatMessage = { id: Date.now().toString(), sender: "me", text: newMessage, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => ({ ...prev, [selectedContact]: [...(prev[selectedContact] || []), msg] }));
    setNewMessage("");
  };

  return (
    <DashboardLayout role={role} title="Messagerie">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
        <div className="flex h-full">
          <div className={`w-full sm:w-80 border-r flex flex-col ${mobileShowChat ? "hidden sm:flex" : "flex"}`}>
            {/* Tabs for secretary */}
            {hasCabinetChat && (
              <div className="flex border-b">
                <button onClick={() => handleTabChange("messages")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${tab === "messages" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <Users className="h-3.5 w-3.5" />Messages
                </button>
                <button onClick={() => handleTabChange("cabinet")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${tab === "cabinet" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <Building2 className="h-3.5 w-3.5" />Cabinet
                  {mockSecretaryCabinetContacts.reduce((acc, c) => acc + c.unread, 0) > 0 && (
                    <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {mockSecretaryCabinetContacts.reduce((acc, c) => acc + c.unread, 0)}
                    </span>
                  )}
                </button>
              </div>
            )}

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
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center shrink-0">{c.unread}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden sm:flex" : "flex"}`}>
            {contact ? (
              <>
                <div className="flex items-center justify-between border-b p-3">
                  <div className="flex items-center gap-3">
                    <button className="sm:hidden" onClick={() => setMobileShowChat(false)}><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
                    <div className="relative">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${tab === "cabinet" ? "bg-accent/10 text-accent" : "gradient-primary text-primary-foreground"}`}>{contact.avatar}</div>
                      {contact.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-card" />}
                    </div>
                    <div><p className="text-sm font-medium text-foreground">{contact.name}</p><p className="text-xs text-muted-foreground">{contact.online ? "En ligne" : "Hors ligne"}</p></div>
                  </div>
                  {tab === "messages" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="h-4 w-4 text-muted-foreground" /></Button>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.sender === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
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

export default Messages;
