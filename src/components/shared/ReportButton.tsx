/**
 * ReportButton — Bouton de signalement pour litiges, abus, commentaires.
 * Now uses reportsStore instead of raw localStorage.
 */
import { useState } from "react";
import { Flag, Send, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { submitReport, type ReportType } from "@/stores/reportsStore";
import { getCurrentRole } from "@/stores/authStore";

export type { ReportType };

interface ReportButtonProps {
  type: ReportType;
  targetId: string;
  targetName: string;
  variant?: "icon" | "button" | "menu-item";
  label?: string;
  size?: "sm" | "default";
}

const reportReasons: Record<ReportType, string[]> = {
  dispute: ["Consultation non réalisée", "Comportement inapproprié", "Erreur de facturation", "Problème technique", "Autre"],
  comment: ["Contenu offensant", "Spam / Publicité", "Faux avis", "Hors sujet", "Autre"],
  doctor: ["Absence non justifiée", "Comportement non professionnel", "Problème de facturation", "Autre"],
  patient: ["Absence répétée", "Comportement agressif", "Fausse identité", "Autre"],
  appointment: ["RDV non honoré", "Retard excessif", "Mauvaise prise en charge", "Autre"],
  other: ["Autre"],
};

const typeLabels: Record<ReportType, string> = {
  dispute: "Signaler un litige",
  comment: "Signaler ce commentaire",
  doctor: "Signaler ce praticien",
  patient: "Signaler ce patient",
  appointment: "Signaler ce rendez-vous",
  other: "Signaler",
};

export function ReportButton({ type, targetId, targetName, variant = "button", label, size = "sm" }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);

  const isEnabled = () => {
    try {
      const flags = JSON.parse(localStorage.getItem("medicare_admin_features") || "{}");
      if (type === "dispute" && flags.disputeReporting === false) return false;
      if (type === "comment" && flags.commentReporting === false) return false;
    } catch {}
    return true;
  };

  if (!isEnabled()) return null;

  const handleSubmit = () => {
    if (!reason) return;
    const role = getCurrentRole() || "unknown";
    // TODO BACKEND: POST /api/reports
    submitReport({
      type,
      targetId,
      targetName,
      reason,
      details,
      reporter: role === "patient" ? "Patient" : role === "doctor" ? "Médecin" : role,
      reporterRole: role,
    });
    toast({ title: "Signalement envoyé", description: "Votre signalement sera traité par l'équipe de modération." });
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setReason(""); setDetails(""); }, 1500);
  };

  const displayLabel = label || typeLabels[type];
  const reasons = reportReasons[type];

  return (
    <>
      {variant === "icon" && (
        <button onClick={() => setOpen(true)} className="text-muted-foreground hover:text-destructive transition-colors" title={displayLabel} aria-label={displayLabel}>
          <Flag className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        </button>
      )}
      {variant === "button" && (
        <Button variant="outline" size={size} onClick={() => setOpen(true)} className="text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30">
          <Flag className="h-3.5 w-3.5 mr-1" />{displayLabel}
        </Button>
      )}
      {variant === "menu-item" && (
        <button onClick={() => setOpen(true)} className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-colors">
          <Flag className="h-4 w-4" />{displayLabel}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border bg-card shadow-elevated p-5 mx-0 sm:mx-4 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden flex justify-center mb-3"><div className="h-1 w-10 rounded-full bg-muted-foreground/20" /></div>
            
            {sent ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground">Signalement envoyé</h3>
                <p className="text-sm text-muted-foreground mt-2">Notre équipe de modération traitera votre signalement dans les plus brefs délais.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Flag className="h-5 w-5 text-destructive" />{displayLabel}
                  </h3>
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Fermer"><X className="h-5 w-5" /></button>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 mb-4">
                  <p className="text-xs text-muted-foreground">Concerné :</p>
                  <p className="text-sm font-medium text-foreground">{targetName}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Motif du signalement</p>
                    <div className="space-y-1.5">
                      {reasons.map(r => (
                        <button key={r} onClick={() => setReason(r)}
                          className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-all ${
                            reason === r ? "border-destructive bg-destructive/5 text-destructive font-medium" : "text-foreground hover:border-destructive/30"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Détails (optionnel)</p>
                    <Textarea
                      placeholder="Décrivez le problème en détail..."
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                  <Button onClick={handleSubmit} disabled={!reason} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    <Send className="h-4 w-4 mr-1" />Envoyer le signalement
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ReportButton;
