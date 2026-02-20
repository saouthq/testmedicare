import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Shield, Save, CheckCircle } from "lucide-react";

type Tab = "profile" | "notifications" | "security";

const SecretarySettings = () => {
  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { key: "profile" as Tab, label: "Profil", icon: User },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  return (
    <DashboardLayout role="secretary" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        {saved && (
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span className="text-sm text-accent font-medium">Paramètres sauvegardés</span>
          </div>
        )}

        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations personnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Prénom</Label><Input defaultValue="Leila" className="mt-1" /></div>
                <div><Label>Nom</Label><Input defaultValue="Hammami" className="mt-1" /></div>
                <div><Label>Email professionnel</Label><Input defaultValue="leila@cabinet-bouazizi.tn" className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input defaultValue="+216 71 234 568" className="mt-1" /></div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations professionnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Cabinet</Label><Input defaultValue="Cabinet Médical El Manar" disabled className="mt-1 bg-muted/50" /></div>
                <div><Label>Médecin responsable</Label><Input defaultValue="Dr. Ahmed Bouazizi" disabled className="mt-1 bg-muted/50" /></div>
                <div className="sm:col-span-2"><Label>Adresse</Label><Input defaultValue="15 Av. de la Liberté, El Manar, 2092 Tunis" disabled className="mt-1 bg-muted/50" /></div>
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { label: "Nouveau rendez-vous", desc: "Notification à chaque nouvelle prise de RDV" },
                { label: "Annulation de RDV", desc: "Être notifiée quand un patient annule" },
                { label: "Appels manqués", desc: "Rappel des appels non pris en charge" },
                { label: "Arrivée patient", desc: "Notification quand un patient se présente à l'accueil" },
                { label: "Rappel planning", desc: "Résumé quotidien du planning du jour" },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />Email</label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />SMS</label>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
              <div className="max-w-md space-y-4">
                <div><Label>Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Confirmer</Label><Input type="password" className="mt-1" /></div>
                <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}>Changer le mot de passe</Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Double authentification</h3>
              <p className="text-sm text-muted-foreground mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
              <Button variant="outline">Activer la 2FA</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretarySettings;
