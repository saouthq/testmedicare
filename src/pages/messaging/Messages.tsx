/**
 * Messages — Cross-role messaging page.
 * Now uses messagesStore instead of direct mock imports.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { Search, Send, Paperclip, Phone, Video, ChevronLeft, Building2, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useChatThreads, useChatMessages, sendMessage, markThreadRead,
  getThreadsForUser, getMessagesForThread, getUnreadCount,
  type ChatThread, type ChatMessage,
} from "@/stores/messagesStore";
import { readAuthUser } from "@/stores/authStore";

type MessagingTab = "messages" | "cabinet";

const Messages = ({ role = "patient" }: { role?: "patient" | "doctor" | "pharmacy" | "laboratory" | "secretary" | "hospital" | "clinic" }) => {
  const hasCabinetChat = role === "secretary";
  const authUser = readAuthUser();
  const userId = authUser?.id || `demo-${role}-1`;

  const [tab, setTab] = useState<MessagingTab>("messages");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const [allThreads] = useChatThreads();
  const [allMessages] = useChatMessages();

  // Filter threads for current user + tab
  const threads = useMemo(() => {
    const category = tab === "cabinet" ? "cabinet" : "messages";
    return getThreadsForUser(allThreads, userId, category)
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  }, [allThreads, userId, tab]);

  const filteredThreads = useMemo(() => {
    if (!searchQuery) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter(t => {
      const other = t.participantA.id === userId ? t.participantB : t.participantA;
      return other.name.toLowerCase().includes(q);
    });
  }, [threads, searchQuery, userId]);

  // Auto-select first thread
  const activeThreadId = selectedThreadId && threads.some(t => t.id === selectedThreadId) ? selectedThreadId : threads[0]?.id || null;
  const activeThread = threads.find(t => t.id === activeThreadId);

  const currentMessages = useMemo(() => {
    if (!activeThreadId) return [];
    return getMessagesForThread(allMessages, activeThreadId);
  }, [allMessages, activeThreadId]);

  // Get contact info from thread
  const getContact = (thread: ChatThread) => {
    return thread.participantA.id === userId ? thread.participantB : thread.participantA;
  };

  const getUnread = (thread: ChatThread) => {
    return thread.participantA.id === userId ? thread.unreadA : thread.unreadB;
  };

  const contact = activeThread ? getContact(activeThread) : null;
  const canSendMessage = !activeThread || activeThread.acceptsMessages || role !== "patient";

  const cabinetUnread = useMemo(() => getUnreadCount(allThreads, userId, "cabinet"), [allThreads, userId]);

  const handleTabChange = (newTab: MessagingTab) => {
    setTab(newTab);
    setSelectedThreadId(null);
    setMobileShowChat(false);
  };

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setMobileShowChat(true);
    markThreadRead(threadId, userId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeThreadId || !canSendMessage) return;
    const name = authUser ? `${authUser.firstName} ${authUser.lastName}` : undefined;
    sendMessage(activeThreadId, userId, newMessage, name);
    setNewMessage("");
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffH = (now.getTime() - d.getTime()) / 3600000;
      if (diffH < 24) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      if (diffH < 48) return "Hier";
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    } catch { return ""; }
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
                  {cabinetUnread > 0 && (
                    <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {cabinetUnread}
                    </span>
                  )}
                </button>
              </div>
            )}

            <div className="p-3 border-b">
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" /></div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredThreads.map(t => {
                const c = getContact(t);
                const unread = getUnread(t);
                return (
                  <button key={t.id} onClick={() => handleSelectThread(t.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors ${activeThreadId === t.id ? "bg-primary/5 border-r-2 border-r-primary" : ""}`}>
                    <div className="relative shrink-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${tab === "cabinet" ? "bg-accent/10 text-accent" : "gradient-primary text-primary-foreground"}`}>{c.avatar}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{formatTime(t.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{t.lastMessage}</p>
                      {role === "patient" && !t.acceptsMessages && (
                        <p className="text-[10px] text-warning flex items-center gap-0.5 mt-0.5"><AlertCircle className="h-3 w-3" />Lecture seule</p>
                      )}
                    </div>
                    {unread > 0 && <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center shrink-0">{unread}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden sm:flex" : "flex"}`}>
            {contact && activeThread ? (
              <>
                <div className="flex items-center justify-between border-b p-3">
                  <div className="flex items-center gap-3">
                    <button className="sm:hidden" onClick={() => setMobileShowChat(false)} aria-label="Retour à la liste"><ChevronLeft className="h-5 w-5 text-muted-foreground" /></button>
                    <div className="relative">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium ${tab === "cabinet" ? "bg-accent/10 text-accent" : "gradient-primary text-primary-foreground"}`}>{contact.avatar}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.role}</p>
                    </div>
                  </div>
                  {tab === "messages" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Appeler"><Phone className="h-4 w-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Appel vidéo"><Video className="h-4 w-4 text-muted-foreground" /></Button>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${msg.senderId === userId ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                        {msg.senderName && msg.senderId !== userId && <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.senderName}</p>}
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.senderId === userId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3">
                  {canSendMessage ? (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Joindre un fichier"><Paperclip className="h-4 w-4 text-muted-foreground" /></Button>
                      <Input placeholder="Écrire un message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMessage()} className="flex-1" />
                      <Button size="icon" className="gradient-primary text-primary-foreground h-9 w-9 shrink-0" onClick={handleSendMessage} disabled={!newMessage.trim()} aria-label="Envoyer"><Send className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                      <p className="text-sm text-warning font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />Ce praticien n'accepte pas les messages
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Vous pouvez uniquement consulter l'historique des conversations.</p>
                    </div>
                  )}
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
