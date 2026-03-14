import { Video } from "lucide-react";
import type { SharedAppointment } from "@/types/appointment";
import { getStripeClassFromColorClass } from "./scheduleHelpers";

export default function AppointmentCard({
  appointment,
  colorClass,
  compact = false,
  onClick,
}: {
  appointment: SharedAppointment;
  colorClass: string;
  compact?: boolean;
  onClick: () => void;
}) {
  const isCancelled = appointment.status === "cancelled" || appointment.status === "absent";
  const isDone = appointment.status === "done";
  const stripeClass = getStripeClassFromColorClass(colorClass);
  const surfaceClass = isCancelled
    ? "border-red-200/70 bg-red-50/55 text-slate-700 opacity-[0.58]"
    : isDone
      ? "border-slate-200 bg-slate-100/80 text-slate-700 opacity-[0.60]"
      : "border-slate-200 bg-white text-slate-800 shadow-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative h-full w-full overflow-hidden rounded-lg border text-left transition-all hover:border-primary/30 hover:shadow-md ${surfaceClass}`}
      title={`${appointment.patient} · ${appointment.startTime}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1.5 ${stripeClass}`} />
      <div className="flex h-full flex-col justify-between p-2 pl-3">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{appointment.startTime}</span>
            {appointment.teleconsultation ? <Video className="h-3.5 w-3.5 shrink-0 text-primary" /> : null}
          </div>
          <p className={`mt-0.5 truncate font-bold ${compact ? "text-[11px]" : "text-xs"}`}>
            {appointment.patient}
          </p>
          {!compact ? (
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {appointment.motif || appointment.type}
            </p>
          ) : null}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="rounded-md bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
            {appointment.type}
          </span>
          {!compact ? (
            <span className="text-[10px] font-medium text-slate-500">{appointment.duration} min</span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
