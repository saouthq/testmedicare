import { CheckCircle2, Clock, X, AlertTriangle, Ban, Video, UserX } from "lucide-react";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no-show" | "in-progress";

const statusConfig: Record<AppointmentStatus, { label: string; icon: any; className: string }> = {
  confirmed: { label: "Confirmé", icon: CheckCircle2, className: "bg-accent/10 text-accent" },
  pending: { label: "En attente", icon: Clock, className: "bg-warning/10 text-warning" },
  cancelled: { label: "Annulé", icon: X, className: "bg-destructive/10 text-destructive" },
  completed: { label: "Terminé", icon: CheckCircle2, className: "bg-muted text-muted-foreground" },
  "no-show": { label: "Absent", icon: UserX, className: "bg-destructive/10 text-destructive" },
  "in-progress": { label: "En cours", icon: Clock, className: "bg-primary/10 text-primary animate-pulse" },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: "sm" | "md";
}

const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${config.className} ${size === "sm" ? "text-[11px]" : "text-xs"}`}>
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
