/**
 * Reusable dialog for requiring a motif (reason) before sensitive admin actions.
 * TODO BACKEND: Motif will be sent to API along with the action payload.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface MotifDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motif: string) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
}

const MotifDialog = ({ open, onClose, onConfirm, title, description, confirmLabel = "Confirmer", destructive = false }: MotifDialogProps) => {
  const [motif, setMotif] = useState("");

  const handleConfirm = () => {
    if (!motif.trim()) return;
    onConfirm(motif.trim());
    setMotif("");
    onClose();
  };

  const handleClose = () => {
    setMotif("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${destructive ? "text-destructive" : "text-warning"}`} />
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Motif <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="Saisissez le motif de cette action..."
            value={motif}
            onChange={e => setMotif(e.target.value)}
            className="min-h-[80px]"
          />
          <p className="text-[11px] text-muted-foreground">Ce motif sera enregistré dans les audit logs.</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>Annuler</Button>
          <Button
            size="sm"
            disabled={!motif.trim()}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "gradient-primary text-primary-foreground"}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MotifDialog;
