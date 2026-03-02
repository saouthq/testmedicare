/**
 * ChatPanel — Panel chat latéral pendant l'appel.
 */
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeleconsultation } from "./TeleconsultationContext";

export default function ChatPanel() {
  const ctx = useTeleconsultation();

  if (!ctx.chatOpen) return null;

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-card border-l flex flex-col z-10">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Chat</h3>
        <button onClick={() => ctx.setChatOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {ctx.chatMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === ctx.role ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              msg.sender === ctx.role ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}>
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-0.5 ${msg.sender === ctx.role ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-2 flex gap-2">
        <input
          value={ctx.newMessage}
          onChange={e => ctx.setNewMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ctx.sendChat()}
          placeholder="Message..."
          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button size="icon" className="h-8 w-8 gradient-primary text-primary-foreground" onClick={ctx.sendChat}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
