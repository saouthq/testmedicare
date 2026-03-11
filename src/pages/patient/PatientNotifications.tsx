/**
 * PatientNotifications — Fully driven by notificationsStore.
 * No more mock imports — all notifications come from the cross-role store.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Bell, Calendar, FileText, MessageSquare, AlertCircle, CheckCircle2, Clock, Trash2, Shield, ChevronRight, Activity, Pill, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import {
  useNotifications,
  markNotificationRead,
  markAllRead as storeMarkAllRead,
  deleteNotification,
  type CrossNotification,
} from "@/stores/notificationsStore";

type DisplayType = "appointment" | "prescription" | "message" | "result" | "reminder" | "system";

const typeConfig: Record<DisplayType, { icon: any; class: string; label: string }> = {
  appointment: { icon: Calendar, class: "bg-primary/10 text-primary", label: "Rendez-vous" },
  prescription: { icon: Pill, class: "bg-warning/10 text-warning", label: "Ordonnance" },
  message: { icon: MessageSquare, class: "bg-accent/10 text-accent", label: "Message" },
  result: { icon: Activity, class: "bg-accent/10 text-accent", label: "Résultat" },
  reminder: { icon: Clock, class: "bg-warning/10 text-warning", label: "Rappel" },
  system: { icon: AlertCircle, class: "bg-muted text-muted-foreground", label: "Système" },
};

/** Map store notification type to display type */
function mapType(t: CrossNotification["type"]): DisplayType {
  if (t === "appointment_booked" || t === "appointment_rescheduled" || t === "appointment_absent" || t === "appointment") return "appointment";
  if (t === "pharmacy_ready" || t === "prescription_sent" || t === "billing") return "prescription";
  if (t === "lab_results" || t === "result") return "result";
  if (t === "care_sheet" || t === "system" || t === "generic") return "system";
  if (t === "message") return "message";
  if (t === "reminder") return "reminder";
  return "system";
}

/** Group notifications by relative date */
function getDateGroup(createdAt: string): string {
  const now = new Date();
  const date = new Date(createdAt);
  const diffHours = (now.getTime() - date.getTime()) / 3600_000;
  if (diffHours < 24) return "Aujourd'hui";
  if (diffHours < 48) return "Hier";
  if (diffHours < 168) return "Cette semaine";
  return "Plus ancien";
}

const PatientNotifications = () => {
  const { notifications } = useNotifications("patient");
  const [filter, setFilter] = useState<"all" | "unread" | DisplayType>("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const enriched = notifications.map(n => ({
    ...n,
    displayType: mapType(n.type),
    dateGroup: getDateGroup(n.createdAt),
    time: new Date(n.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  }));

  const filtered = enriched.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter !== "all") return n.displayType === filter;
    return true;
  });

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, n) => {
    if (!acc[n.dateGroup]) acc[n.dateGroup] = [];
    acc[n.dateGroup].push(n);
    return acc;
  }, {});

  const handleMarkRead = (id: string) => markNotificationRead(id);
  const handleMarkAllRead = () => storeMarkAllRead("patient");
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <DashboardLayout role="patient" title="Notifications">
      <div className="max-w-3xl space-y-5">
        {unreadCount > 0 && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}</p>
                <p className="text-xs text-muted-foreground">Restez informé de vos rendez-vous et résultats</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleMarkAllRead}>
              Tout marquer comme lu
            </Button>
          </div>
        )}

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {([
            { key: "all" as const, label: "Toutes", count: enriched.length },
            { key: "unread" as const, label: "Non lues", count: unreadCount },
            { key: "appointment" as const, label: "RDV", count: enriched.filter(n => n.displayType === "appointment").length },
            { key: "prescription" as const, label: "Ordonnances", count: enriched.filter(n => n.displayType === "prescription").length },
            { key: "result" as const, label: "Résultats", count: enriched.filter(n => n.displayType === "result").length },
            { key: "message" as const, label: "Messages", count: enriched.filter(n => n.displayType === "message").length },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted border border-transparent hover:border-border"
              }`}
            >
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f.key ? "bg-primary-foreground/20" : "bg-muted"}`}>{f.count}</span>
            </button>
          ))}
        </div>

        {Object.entries(grouped).map(([date, notifs]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{date}</p>
            <div className="space-y-2">
              {notifs.map(n => {
                const config = typeConfig[n.displayType];
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`rounded-xl border bg-card shadow-card transition-all cursor-pointer hover:shadow-card-hover group ${!n.read ? "border-l-4 border-l-primary" : ""}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${config.class}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`text-sm ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{n.title}</h3>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${config.class}`}>{config.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDelete(n.id, e)}>
                                <Trash2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          {n.actionLink && (
                            <Link to={n.actionLink} onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:underline">
                              Voir <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-foreground font-medium">Aucune notification</p>
            <p className="text-sm text-muted-foreground mt-1">Vous êtes à jour !</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientNotifications;
