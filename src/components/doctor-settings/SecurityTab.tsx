import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Shield, Smartphone } from "lucide-react";

const SecurityTab = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const handleChangePassword = () => {
    // TODO BACKEND: POST /api/auth/change-password
    toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été changé avec succès." });
  };

  const handleToggle2FA = () => {
    // TODO BACKEND: POST /api/auth/toggle-2fa
    setTwoFAEnabled(!twoFAEnabled);
    toast({
      title: !twoFAEnabled ? "2FA activée" : "2FA désactivée",
      description: !twoFAEnabled
        ? "La double authentification par SMS est maintenant active."
        : "La double authentification a été désactivée.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
        <div className="max-w-md space-y-4">
          <div><Label>Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
          <div><Label>Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
          <div><Label>Confirmer le nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
          <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleChangePassword}>Changer le mot de passe</Button>
        </div>
      </div>
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
    </div>
  );
};

export default SecurityTab;
