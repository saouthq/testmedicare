import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const SecurityTab = () => {
  const handleChangePassword = () => {
    // TODO BACKEND: POST /api/auth/change-password
    toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été changé avec succès." });
  };

  const handleEnable2FA = () => {
    // TODO BACKEND: POST /api/auth/enable-2fa
    toast({ title: "2FA", description: "Fonctionnalité à venir." });
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
        <h3 className="font-semibold text-foreground mb-4">Double authentification</h3>
        <p className="text-sm text-muted-foreground mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
        <Button variant="outline" onClick={handleEnable2FA}>Activer la 2FA</Button>
      </div>
    </div>
  );
};

export default SecurityTab;
