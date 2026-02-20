import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Bell, Shield, Save, Clock, CreditCard } from "lucide-react";

type Tab = "pharmacy" | "hours" | "notifications" | "security";

const PharmacySettings = () => {
  const [tab, setTab] = useState<Tab>("pharmacy");

  const tabs = [
    { key: "pharmacy" as Tab, label: "Pharmacie", icon: Building2 },
    { key: "hours" as Tab, label: "Horaires", icon: Clock },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  return (
    <DashboardLayout role="pharmacy" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "pharmacy" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations de la pharmacie</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nom de la pharmacie</Label><Input defaultValue="Pharmacie El Manar" className="mt-1" /></div>
                <div><Label>N° Licence</Label><Input defaultValue="PH-2026-1234" className="mt-1" /></div>
                <div><Label>Pharmacien titulaire</Label><Input defaultValue="Dr. Samira Bouzid" className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input defaultValue="+216 71 456 789" className="mt-1" /></div>
                <div><Label>Email</Label><Input defaultValue="pharmacie.elmanar@email.tn" className="mt-1" /></div>
                <div><Label>Fax</Label><Input defaultValue="+216 71 456 790" className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Adresse</Label><Input defaultValue="25 Rue Pasteur, El Manar, 2092 Tunis" className="mt-1" /></div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Abonnement & Facturation</h3>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Plan Standard</p>
                  <p className="text-xs text-muted-foreground">59 DT/mois · Renouvelé le 1er Mars 2026</p>
                </div>
                <Button variant="outline" size="sm"><CreditCard className="h-4 w-4 mr-2" />Gérer</Button>
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "hours" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Horaires d'ouverture</h3>
            <div className="space-y-4">
              {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => (
                <div key={day} className="rounded-lg border p-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 w-28">
                    <input type="checkbox" defaultChecked={day !== "Dimanche"} className="rounded border-input" />
                    <span className="text-sm font-medium text-foreground">{day}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div><Label className="text-xs">Ouverture</Label><Input type="time" defaultValue="08:00" className="mt-1" /></div>
                    <div><Label className="text-xs">Fermeture</Label><Input type="time" defaultValue={day === "Samedi" ? "13:00" : "19:00"} className="mt-1" /></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-warning/5 border border-warning/20 p-3">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-input" /><span className="text-sm text-foreground font-medium">Pharmacie de garde (rotation)</span></label>
              <p className="text-xs text-muted-foreground mt-1 ml-6">Activer pour apparaître dans la liste des pharmacies de garde</p>
            </div>
            <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { label: "Nouvelle ordonnance", desc: "Quand un médecin envoie une ordonnance" },
                { label: "Stock faible", desc: "Alerte quand un produit est en rupture" },
                { label: "Messages patients", desc: "Nouveaux messages reçus" },
                { label: "Rappels de commande", desc: "Rappel pour les commandes fournisseur" },
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
            <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow"><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
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
                <Button className="gradient-primary text-primary-foreground shadow-primary-glow">Changer le mot de passe</Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Double authentification</h3>
              <p className="text-sm text-muted-foreground mb-4">Sécurisez l'accès à votre compte pharmacie.</p>
              <Button variant="outline">Activer la 2FA</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PharmacySettings;
