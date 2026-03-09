import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Shield, Smartphone, Monitor, MapPin, Clock, Trash2, Download, AlertTriangle, LogOut, Globe } from "lucide-react";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

const mockSessions = [
  { id: "s1", device: "Chrome · macOS", location: "Tunis, Tunisie", ip: "197.2.xxx.xxx", lastActive: "Maintenant", current: true },
  { id: "s2", device: "Safari · iPhone 15", location: "Tunis, Tunisie", ip: "197.2.xxx.xxx", lastActive: "Il y a 2h", current: false },
  { id: "s3", device: "Firefox · Windows", location: "Sousse, Tunisie", ip: "41.228.xxx.xxx", lastActive: "Il y a 3 jours", current: false },
];

const SecurityTab = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState(mockSessions);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showExportData, setShowExportData] = useState(false);

  const handleChangePassword = () => {
    toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été changé avec succès." });
  };

  const handleToggle2FA = () => {
    setTwoFAEnabled(!twoFAEnabled);
    toast({
      title: !twoFAEnabled ? "2FA activée" : "2FA désactivée",
      description: !twoFAEnabled
        ? "La double authentification par SMS est maintenant active."
        : "La double authentification a été désactivée.",
    });
  };

  const handleRevokeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast({ title: "Session révoquée", description: "L'appareil a été déconnecté." });
  };

  const handleRevokeAll = () => {
    setSessions(prev => prev.filter(s => s.current));
    toast({ title: "Toutes les sessions révoquées", description: "Tous les autres appareils ont été déconnectés." });
  };

  const handleExportData = () => {
    setShowExportData(false);
    toast({ title: "Export RGPD lancé", description: "Vous recevrez un email avec vos données dans les 24h (mock)." });
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccount(false);
    toast({ title: "Demande de suppression", description: "Votre demande a été enregistrée. Votre compte sera supprimé sous 30 jours (mock).", variant: "destructive" });
  };

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
        <div className="max-w-md space-y-4">
          <div><Label>Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
          <div><Label>Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
          <div><Label>Confirmer le nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleChangePassword}>Changer le mot de passe</Button>
        </div>
      </div>

      {/* 2FA */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Double authentification (2FA)</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {twoFAEnabled
                  ? "Activée — un code SMS sera envoyé à chaque connexion."
                  : "Ajoutez une couche de sécurité supplémentaire via SMS."}
              </p>
            </div>
          </div>
          <Switch checked={twoFAEnabled} onCheckedChange={handleToggle2FA} />
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />Sessions actives
          </h3>
          {sessions.filter(s => !s.current).length > 0 && (
            <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={handleRevokeAll}>
              <LogOut className="h-3.5 w-3.5 mr-1" />Déconnecter tout
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className={`rounded-lg border p-4 flex items-center justify-between ${s.current ? "border-primary/30 bg-primary/5" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                  {s.device.includes("iPhone") || s.device.includes("Android") ? <Smartphone className="h-4 w-4 text-muted-foreground" /> : <Monitor className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    {s.device}
                    {s.current && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">Actuelle</span>}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />{s.location} · <Clock className="h-3 w-3" />{s.lastActive}
                  </p>
                </div>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={() => handleRevokeSession(s.id)}>
                  <LogOut className="h-3.5 w-3.5 mr-1" />Révoquer
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RGPD - Data export & account deletion */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />Protection des données (RGPD)
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <Download className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Exporter mes données</p>
                <p className="text-xs text-muted-foreground">Téléchargez une copie de toutes vos données personnelles (profil, consultations, patients).</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowExportData(true)}>
              <Download className="h-3.5 w-3.5 mr-1" />Exporter
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4 bg-destructive/5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Supprimer mon compte</p>
                <p className="text-xs text-muted-foreground">Suppression définitive de votre compte et de toutes vos données sous 30 jours.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowDeleteAccount(true)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={showExportData}
        onConfirm={handleExportData}
        onCancel={() => setShowExportData(false)}
        title="Exporter vos données"
        description="Un fichier contenant toutes vos données personnelles sera généré et envoyé à votre adresse email. Ce processus peut prendre jusqu'à 24h."
        confirmLabel="Lancer l'export"
      />
      <ConfirmDialog
        open={showDeleteAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteAccount(false)}
        title="Supprimer votre compte"
        description="Cette action est irréversible. Votre compte, vos données patients et votre historique seront supprimés définitivement sous 30 jours. Vous recevrez un email de confirmation."
        variant="danger"
        confirmLabel="Confirmer la suppression"
      />
    </div>
  );
};

export default SecurityTab;
