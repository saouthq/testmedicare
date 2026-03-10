/**
 * PharmacyConnect — Messagerie pro-to-pro et patient-pharmacie
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { MessageSquare, Send, Users, Stethoscope, User, Search, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  from: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface Contact {
  id: string;
  name: string;
  type: "doctor" | "patient" | "pharmacy";
  avatar: string;
  lastMessage: string;
  unread: number;
  online: boolean;
}

const mockContacts: Contact[] = [
  { id: "d1", name: "Dr. Ahmed Bouazizi", type: "doctor", avatar: "AB", lastMessage: "L'ordonnance est prête?", unread: 2, online: true },
  { id: "d2", name: "Dr. Sonia Trabelsi", type: "doctor", avatar: "ST", lastMessage: "Merci pour la substitution", unread: 0, online: false },
  { id: "p1", name: "Amine Ben Ali", type: "patient", avatar: "AB", lastMessage: "Je passe à quelle heure?", unread: 1, online: true },
  { id: "p2", name: "Fatma Chérif", type: "patient", avatar: "FC", lastMessage: "Ordonnance reçue", unread: 0, online: false },
  { id: "ph1", name: "Pharmacie Centrale", type: "pharmacy", avatar: "PC", lastMessage: "Avez-vous du Ventoline?", unread: 0, online: true },
];

const mockMessages: Record<string, Message[]> = {
  d1: [
    { id: "1", from: "Dr. Ahmed Bouazizi", text: "Bonjour, l'ordonnance de M. Ben Ali est-elle prête?", time: "10:30", isMe: false },
    { id: "2", from: "Moi", text: "Bonjour Dr, oui elle est prête sauf l'Oméprazole. J'ai proposé l'Esoméprazole en substitution.", time: "10:35", isMe: true },
    { id: "3", from: "Dr. Ahmed Bouazizi", text: "Parfait, la substitution est validée. Merci.", time: "10:36", isMe: false },
  ],
  p1: [
    { id: "1", from: "Amine Ben Ali", text: "Bonjour, j'ai reçu la notification. Je peux passer à quelle heure?", time: "11:00", isMe: false },
    { id: "2", from: "Moi", text: "Bonjour, votre ordonnance est prête. Vous pouvez passer avant 18h.", time: "11:05", isMe: true },
  ],
};

type TabType = "all" | "doctors" | "patients";

const PharmacyConnect = () => {
  const [tab, setTab] = useState<TabType>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const filteredContacts = mockContacts.filter(c => {
    if (tab === "doctors" && c.type !== "doctor") return false;
    if (tab === "patients" && c.type !== "patient") return false;
    if (search) return c.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const handleSend = () => {
    if (!message.trim() || !selectedContact) return;
    const newMsg: Message = { id: Date.now().toString(), from: "Moi", text: message, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), isMe: true };
    setMessages(prev => ({ ...prev, [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg] }));
    setMessage("");
    toast({ title: "Message envoyé" });
  };

  return (
    <DashboardLayout role="pharmacy" title="Connect">
      <div className="rounded-xl border bg-card shadow-card overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
        <div className="grid grid-cols-[320px_1fr] h-full">
          {/* Contacts sidebar */}
          <div className="border-r flex flex-col">
            <div className="p-4 border-b space-y-3">
              <div className="flex gap-0.5 rounded-lg border bg-muted/30 p-0.5">
                {([["all", "Tous"], ["doctors", "Médecins"], ["patients", "Patients"]] as [TabType, string][]).map(([t, l]) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 h-8 text-xs" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y">
              {filteredContacts.map(c => (
                <button key={c.id} onClick={() => setSelectedContact(c)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left ${selectedContact?.id === c.id ? "bg-primary/5" : ""}`}>
                  <div className="relative">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold ${c.type === "doctor" ? "bg-primary/10 text-primary" : c.type === "patient" ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}>
                      {c.avatar}
                    </div>
                    {c.online && <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-accent border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      {c.unread > 0 && <span className="h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">{c.unread}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          {selectedContact ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold ${selectedContact.type === "doctor" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                    {selectedContact.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedContact.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {selectedContact.type === "doctor" ? <Stethoscope className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {selectedContact.type === "doctor" ? "Médecin" : selectedContact.type === "patient" ? "Patient" : "Pharmacie"}
                      {selectedContact.online && <span className="text-accent">· En ligne</span>}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(messages[selectedContact.id] || []).map(m => (
                  <div key={m.id} className={`flex ${m.isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${m.isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Écrire un message..." className="flex-1 text-sm" onKeyDown={e => e.key === "Enter" && handleSend()} />
                  <Button className="gradient-primary text-primary-foreground" onClick={handleSend}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PharmacyConnect;
