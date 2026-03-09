/**
 * NotificationCenter — Reusable notification drawer for all roles.
 * Uses crossRoleStore notifications. Supports filter, mark read, clear.
 * // TODO BACKEND: Replace with real push notifications / Supabase Realtime
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { useNotifications, type CrossNotification } from "@/stores/notificationsStore";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
}

const typeLabels: Record<string, string> = {
  pharmacy_ready: "Pharmacie",
  care_sheet: "Feuille de soins",
  lab_results: "Résultats labo",
  prescription_sent: "Ordonnance",
  appointment_absent: "Absent",
  generic: "Notification",
};

const NotificationCenter = ({ open, onOpenChange, role }: NotificationCenterProps) => {
  const { notifications, allNotifications, setNotifications } = useNotifications(role);
  const [filterType, setFilterType] = useState<string | null>(null);

  const filtered = filterType
    ? notifications.filter((n) => n.type === filterType)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications(
      allNotifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications(
      allNotifications.map((n) => (n.targetRole === role ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications(allNotifications.filter((n) => n.targetRole !== role));
  };

  const types = Array.from(new Set(notifications.map((n) => n.type)));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </SheetTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead} disabled={unreadCount === 0}>
                <CheckCheck className="h-3.5 w-3.5 mr-1" />Tout lu
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={clearAll} disabled={notifications.length === 0}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />Vider
              </Button>
            </div>
          </div>
          {/* Filters */}
          {types.length > 1 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              <button
                onClick={() => setFilterType(null)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${!filterType ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-accent"}`}
              >
                Tout
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(filterType === t ? null : t)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${filterType === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-accent"}`}
                >
                  {typeLabels[t] || t}
                </button>
              ))}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Aucune notification</p>
              <p className="text-xs mt-1">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="inline-block text-[10px] mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {typeLabels[n.type] || n.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
