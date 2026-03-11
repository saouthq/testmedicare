import { CheckCircle2, Clock, X, AlertTriangle, Ban, Video, UserX, Play } from "lucide-react";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no-show" | "in-progress" | "done" | "absent" | "arrived" | "in_waiting" | "in_progress";

const statusConfig: Record<AppointmentStatus, { label: string; icon: any; className: string }> = {
  confirmed: { label: "Confirmé", icon: CheckCircle2, className: "bg-accent/10 text-accent border-accent/20" },
  pending: { label: "En attente", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  cancelled: { label: "Annulé", icon: X, className: "bg-destructive/10 text-destructive border-destructive/20" },
  completed: { label: "Terminé", icon: CheckCircle2, className: "bg-muted text-muted-foreground border-border" },
  done: { label: "Terminé", icon: CheckCircle2, className: "bg-muted text-muted-foreground border-border" },
  "no-show": { label: "Absent", icon: UserX, className: "bg-destructive/10 text-destructive border-destructive/20" },
  absent: { label: "Absent", icon: UserX, className: "bg-destructive/10 text-destructive border-destructive/20" },
  "in-progress": { label: "En cours", icon: Clock, className: "bg-primary/10 text-primary border-primary/20 animate-pulse" },
  in_progress: { label: "En cours", icon: Play, className: "bg-primary/10 text-primary border-primary/20 animate-pulse" },
  arrived: { label: "Arrivé", icon: CheckCircle2, className: "bg-primary/10 text-primary border-primary/20" },
  in_waiting: { label: "En salle d'attente", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
};

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  size?: "sm" | "md";
}

/**
 * StatusBadge — Uniform status badge used across all roles.
 */
const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
  const config = statusConfig[status as AppointmentStatus] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium shrink-0 ${size === "sm" ? "text-[10px]" : "text-xs"} ${config.className}`}>
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
