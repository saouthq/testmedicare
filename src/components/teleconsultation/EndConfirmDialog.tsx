/**
 * EndConfirmDialog — Confirmation avant de terminer la consultation.
 */
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeleconsultation } from "./TeleconsultationContext";

export default function EndConfirmDialog() {
  const ctx = useTeleconsultation();

  if (ctx.phase !== "ending") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="rounded-2xl border bg-card shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Terminer la consultation ?</h3>
            <p className="text-sm text-muted-foreground">Cette action mettra fin à l'appel vidéo.</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4 mb-5">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patient</span>
              <span className="font-medium text-foreground">{ctx.otherPerson.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-medium text-foreground">{ctx.callDuration}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={ctx.cancelEnd}>Reprendre l'appel</Button>
          <Button className="flex-1 gradient-primary text-primary-foreground shadow-primary-glow" onClick={ctx.confirmEnd}>
            Terminer
          </Button>
        </div>
      </div>
    </div>
  );
}
