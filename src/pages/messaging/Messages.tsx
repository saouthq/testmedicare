import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

const contacts: Contact[] = [
  { id: "1", name: "Dr. Sophie Martin", role: "Médecin généraliste", avatar: "SM", lastMessage: "Vos résultats sont bons, on se revoit dans 3 mois.", time: "10:30", unread: 1, online: true },
  { id: "2", name: "Dr. Pierre Durand", role: "Cardiologue", avatar: "PD", lastMessage: "N'oubliez pas votre bilan la semaine prochaine.", time: "Hier", unread: 0, online: false },
  { id: "3", name: "Pharmacie Saint-Honoré", role: "Pharmacie", avatar: "PS", lastMessage: "Votre ordonnance est prête à retirer.", time: "Hier", unread: 2, online: true },
  { id: "4", name: "Labo BioAnalyse", role: "Laboratoire", avatar: "LB", lastMessage: "Vos résultats d'analyses sont disponibles.", time: "18 Fév", unread: 0, online: false },
  { id: "5", name: "Dr. Marie Lefebvre", role: "Dermatologue", avatar: "ML", lastMessage: "Comment évolue votre traitement ?", time: "15 Fév", unread: 0, online: false },
];

const conversationMessages: Record<string, Message[]> = {
  "1": [
    { id: "1", sender: "them", text: "Bonjour M. Dupont, j'ai bien reçu vos résultats d'analyses.", time: "09:45" },
    { id: "2", sender: "them", text: "Votre glycémie est à 1.05 g/L, ce qui est dans les normes. L'HbA1c est à 6.8%, ce qui montre un bon équilibre du diabète.", time: "09:46" },
    { id: "3", sender: "me", text: "Merci docteur ! Est-ce que je dois modifier mon traitement ?", time: "10:15" },
    { id: "4", sender: "them", text: "Non, on continue le traitement actuel. Metformine 850mg 2x/jour + Glibenclamide 5mg 1x/jour.", time: "10:20" },
    { id: "5", sender: "me", text: "D'accord, merci beaucoup.", time: "10:25" },
    { id: "6", sender: "them", text: "Vos résultats sont bons, on se revoit dans 3 mois.", time: "10:30" },
  ],
};

const Messages = ({ role = "patient" }: { role?: "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" }) => {
  const [selectedContact, setSelectedContact] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState(conversationMessages);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const contact = contacts.find(c => c.id === selectedContact);
  const currentMessages = selectedContact ? (messages[selectedContact] || []) : [];

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: newMessage,
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), msg],
    }));
    setNewMessage("");
  };

  return (
    <DashboardLayout role={role} title="Messagerie">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden" style={{ height: "calc(100vh - 180px)" }}>
        <div className="flex h-full">
          {/* Contact list */}
          <div className={`w-full sm:w-80 border-r flex flex-col ${mobileShowChat ? "hidden sm:flex" : "flex"}`}>
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedContact(c.id); setMobileShowChat(true); }}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors ${
                    selectedContact === c.id ? "bg-primary/5 border-r-2 border-r-primary" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {c.avatar}
                    </div>
                    {c.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden sm:flex" : "flex"}`}>
            {contact ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between border-b p-3">
                  <div className="flex items-center gap-3">
                    <button className="sm:hidden" onClick={() => setMobileShowChat(false)}>
                      <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {contact.avatar}
                      </div>
                      {contact.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-card" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.online ? "En ligne" : "Hors ligne"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="h-4 w-4 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4 text-muted-foreground" /></Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === "me"
                          ? "gradient-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="border-t p-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Input
                      placeholder="Écrire un message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      className="gradient-primary text-primary-foreground h-9 w-9 shrink-0"
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Sélectionnez une conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
