/**
 * PatientNotifications — Reads from both mock data AND cross-role notifications store.
 * Cross-role events (pharmacy ready, care sheet, lab results) appear automatically.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Bell, Calendar, FileText, MessageSquare, AlertCircle, CheckCircle2, Clock, Trash2, Shield, ChevronRight, Activity, Pill, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type NotificationType = "appointment" | "prescription" | "message" | "result" | "reminder" | "system";

interface Notification {
  id: string; type: NotificationType; title: string; message: string; time: string; read: boolean;
  actionLabel?: string; actionLink?: string; date: string;
}

import { mockNotifications as rawNotifications } from "@/data/mockData";
import { useNotifications } from "@/stores/notificationsStore";

// Enrich mock notifications with actions and dates
const enrichedNotifications: Notification[] = (rawNotifications as any[]).map((n, i) => ({
  ...n,
  date: i < 3 ? "Aujourd'hui" : i < 5 ? "Hier" : "Cette semaine",
  ...(n.type === "appointment" ? { actionLabel: "Voir le RDV", actionLink: "/dashboard/patient/appointments" } : {}),
  ...(n.type === "prescription" ? { actionLabel: "Voir l'ordonnance", actionLink: "/dashboard/patient/prescriptions" } : {}),
  ...(n.type === "message" ? { actionLabel: "Lire le message", actionLink: "/dashboard/patient/messages" } : {}),
  ...(n.type === "result" ? { actionLabel: "Consulter les résultats", actionLink: "/dashboard/patient/health" } : {}),
  ...(n.type === "reminder" ? { actionLabel: "Voir le RDV", actionLink: "/dashboard/patient/appointments" } : {}),
}));

const typeConfig: Record<NotificationType, { icon: any; class: string; label: string }> = {
  appointment: { icon: Calendar, class: "bg-primary/10 text-primary", label: "Rendez-vous" },
  prescription: { icon: Pill, class: "bg-warning/10 text-warning", label: "Ordonnance" },
  message: { icon: MessageSquare, class: "bg-accent/10 text-accent", label: "Message" },
  result: { icon: Activity, class: "bg-accent/10 text-accent", label: "Résultat" },
  reminder: { icon: Clock, class: "bg-warning/10 text-warning", label: "Rappel" },
  system: { icon: AlertCircle, class: "bg-muted text-muted-foreground", label: "Système" },
};

// Map cross-role notification types to display types
function mapCrossType(t: string): NotificationType {
  if (t === "pharmacy_ready" || t === "prescription_sent") return "prescription";
  if (t === "lab_results") return "result";
  if (t === "care_sheet") return "system";
  if (t === "appointment_absent") return "appointment";
  return "system";
}

const PatientNotifications = () => {
  // Cross-role notifications from store
  const { notifications: crossNotifs, setNotifications: setCrossNotifs } = useNotifications("patient");

  // Convert cross-role notifications to local format
  const crossConverted: Notification[] = crossNotifs.map((cn) => ({
    id: cn.id,
    type: mapCrossType(cn.type),
    title: cn.title,
    message: cn.message,
    time: new Date(cn.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    read: cn.read,
    date: "Aujourd'hui",
    actionLabel: cn.actionLink ? "Voir" : undefined,
    actionLink: cn.actionLink,
  }));

  const [notifications, setNotifications] = useState(enrichedNotifications);

  // Merge: cross-role first (newest), then static mocks
  const allNotifications = [...crossConverted, ...notifications];
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const filtered = allNotifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter !== "all") return n.type === filter;
    return true;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    const date = n.date || "Autre";
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {});

  const markRead = (id: string) => {
    // Try local first
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Also mark in cross-role store
    setCrossNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setCrossNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    setCrossNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DashboardLayout role="patient" title="Notifications">
      <div className="max-w-3xl space-y-5">
        {/* Header with unread count */}
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
            <Button variant="outline" size="sm" className="text-xs" onClick={markAllRead}>
              Tout marquer comme lu
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { key: "all" as const, label: "Toutes", count: allNotifications.length },
            { key: "unread" as const, label: "Non lues", count: unreadCount },
            { key: "appointment" as const, label: "RDV", count: allNotifications.filter(n => n.type === "appointment").length },
            { key: "prescription" as const, label: "Ordonnances", count: allNotifications.filter(n => n.type === "prescription").length },
            { key: "result" as const, label: "Résultats", count: allNotifications.filter(n => n.type === "result").length },
            { key: "message" as const, label: "Messages", count: allNotifications.filter(n => n.type === "message").length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted border border-transparent hover:border-border"
              }`}
            >
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                filter === f.key ? "bg-primary-foreground/20" : "bg-muted"
              }`}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Grouped notifications */}
        {Object.entries(grouped).map(([date, notifs]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{date}</p>
            <div className="space-y-2">
              {notifs.map(n => {
                const config = typeConfig[n.type];
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`rounded-xl border bg-card shadow-card transition-all cursor-pointer hover:shadow-card-hover group ${
                      !n.read ? "border-l-4 border-l-primary" : ""
                    }`}
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
                                <h3 className={`text-sm ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                                  {n.title}
                                </h3>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${config.class}`}>
                                  {config.label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                              <Button
                                variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => deleteNotif(n.id, e)}
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>

                          {n.actionLink && (
                            <Link
                              to={n.actionLink}
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium hover:underline"
                            >
                              {n.actionLabel}
                              <ArrowRight className="h-3 w-3" />
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
