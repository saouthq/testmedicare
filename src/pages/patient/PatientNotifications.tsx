import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Bell, Calendar, FileText, MessageSquare, AlertCircle, CheckCircle2, Clock, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotificationType = "appointment" | "prescription" | "message" | "result" | "reminder" | "system";

interface Notification { id: string; type: NotificationType; title: string; message: string; time: string; read: boolean; }

const initialNotifications: Notification[] = [
  { id: "1", type: "appointment", title: "Rappel de RDV", message: "Votre rendez-vous avec Dr. Bouazizi est demain à 14h30 au cabinet El Manar.", time: "Il y a 1h", read: false },
  { id: "2", type: "result", title: "Résultats disponibles", message: "Les résultats de votre bilan sanguin sont prêts. Consultez-les dans votre dossier médical.", time: "Il y a 3h", read: false },
  { id: "3", type: "message", title: "Nouveau message", message: "Dr. Gharbi vous a envoyé un message concernant votre dernière consultation.", time: "Il y a 5h", read: false },
  { id: "4", type: "prescription", title: "Ordonnance renouvelée", message: "Votre ordonnance ORD-2026-045 a été renouvelée par Dr. Bouazizi.", time: "Hier", read: true },
  { id: "5", type: "reminder", title: "Rappel CNAM", message: "Pensez à renouveler votre carte CNAM avant le 31 mars 2026.", time: "Hier", read: true },
  { id: "6", type: "appointment", title: "RDV confirmé", message: "Votre rendez-vous du 23 Fév avec Dr. Gharbi (Cardiologue) est confirmé.", time: "Il y a 2 jours", read: true },
  { id: "7", type: "system", title: "Mise à jour du profil", message: "Pensez à compléter votre numéro d'assuré CNAM dans votre profil.", time: "Il y a 3 jours", read: true },
];

const typeConfig: Record<NotificationType, { icon: any; class: string }> = {
  appointment: { icon: Calendar, class: "bg-primary/10 text-primary" },
  prescription: { icon: FileText, class: "bg-warning/10 text-warning" },
  message: { icon: MessageSquare, class: "bg-accent/10 text-accent" },
  result: { icon: CheckCircle2, class: "bg-accent/10 text-accent" },
  reminder: { icon: Clock, class: "bg-warning/10 text-warning" },
  system: { icon: AlertCircle, class: "bg-muted text-muted-foreground" },
};

const PatientNotifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <DashboardLayout role="patient" title="Notifications">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-lg border bg-card p-1">
            <button onClick={() => setFilter("all")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Toutes</button>
            <button onClick={() => setFilter("unread")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "unread" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Non lues ({unreadCount})</button>
          </div>
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>Tout marquer comme lu</Button>}
        </div>

        <div className="space-y-3">
          {filtered.map((n) => {
            const config = typeConfig[n.type]; const Icon = config.icon;
            return (
              <div key={n.id} onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                className={`rounded-xl border bg-card p-4 shadow-card transition-all cursor-pointer hover:shadow-card-hover ${!n.read ? "border-l-4 border-l-primary" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${config.class}`}><Icon className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-sm ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{n.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(x => x.id !== n.id)); }}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12"><Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Aucune notification</p></div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientNotifications;
