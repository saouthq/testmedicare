/**
 * AdminFeatureFlags — System-wide feature flags
 * Toggle features globally across the entire platform.
 * TODO BACKEND: Replace with server-side feature flags
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Flag, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useSystemFlags, toggleFeatureFlag, type SystemFeatureFlag } from "@/stores/entitlementStore";

const AdminFeatureFlags = () => {
  const [flags] = useSystemFlags();
  const [toggleDialog, setToggleDialog] = useState<SystemFeatureFlag | null>(null);
  const [reason, setReason] = useState("");

  const handleToggle = () => {
    if (!toggleDialog || !reason.trim()) {
      toast({ title: "Motif obligatoire", variant: "destructive" }); return;
    }
    toggleFeatureFlag(toggleDialog.featureId, !toggleDialog.enabled, reason, "Admin");
    toast({
      title: toggleDialog.enabled ? "Feature désactivée" : "Feature activée",
      description: toggleDialog.label,
    });
    setToggleDialog(null);
    setReason("");
  };

  const enabledCount = flags.filter(f => f.enabled).length;
  const disabledCount = flags.length - enabledCount;

  return (
    <DashboardLayout role="admin" title="Feature Flags Système">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />Feature Flags Système
            </h2>
            <p className="text-sm text-muted-foreground">Activer/désactiver globalement des fonctionnalités sur toute la plateforme.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />{enabledCount} actifs
            </span>
            {disabledCount > 0 && (
              <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full flex items-center gap-1">
                <XCircle className="h-3 w-3" />{disabledCount} désactivés
              </span>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Impact global</p>
            <p className="text-xs text-muted-foreground mt-1">
              Désactiver un flag affecte TOUS les utilisateurs, quel que soit leur plan ou leurs overrides.
              Les features désactivées affichent un message "Temporairement indisponible" au lieu du contenu.
              Un motif obligatoire est requis et chaque action est tracée dans l'audit log.
            </p>
          </div>
        </div>

        {/* Flags table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Dernière modification</TableHead>
                <TableHead>Par</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map(f => (
                <TableRow key={f.id}>
                  <TableCell>
                    <p className="font-medium text-foreground text-sm">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.featureId}</p>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      f.enabled ? "bg-accent/10 text-accent border-accent/20" : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {f.enabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {f.enabled ? "Actif" : "Désactivé"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{f.reason || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(f.updatedAt).toLocaleDateString("fr-TN", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-xs text-foreground">{f.updatedBy}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={f.enabled ? "outline" : "default"}
                      size="sm"
                      className={`text-xs ${f.enabled ? "text-destructive border-destructive/30 hover:bg-destructive/10" : "gradient-primary text-primary-foreground"}`}
                      onClick={() => { setToggleDialog(f); setReason(""); }}
                    >
                      {f.enabled ? "Désactiver" : "Activer"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Toggle confirmation */}
      <Dialog open={!!toggleDialog} onOpenChange={() => setToggleDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{toggleDialog?.enabled ? "Désactiver" : "Activer"} — {toggleDialog?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {toggleDialog?.enabled && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-xs text-destructive font-medium">⚠️ Attention : cette action affecte tous les utilisateurs de la plateforme immédiatement.</p>
              </div>
            )}
            <div>
              <Label className="text-xs">Motif obligatoire *</Label>
              <Input className="mt-1" value={reason} onChange={e => setReason(e.target.value)} placeholder="Raison de ce changement..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setToggleDialog(null)}>Annuler</Button>
            <Button
              className={toggleDialog?.enabled ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "gradient-primary text-primary-foreground"}
              onClick={handleToggle}
              disabled={!reason.trim()}
            >
              {toggleDialog?.enabled ? "Désactiver" : "Activer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminFeatureFlags;
