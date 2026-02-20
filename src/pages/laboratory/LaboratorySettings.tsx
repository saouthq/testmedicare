import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Bell, Shield, Save, Clock, CreditCard, FlaskConical } from "lucide-react";

type Tab = "laboratory" | "analyses" | "notifications" | "security";

const LaboratorySettings = () => {
  const [tab, setTab] = useState<Tab>("laboratory");

  const tabs = [
    { key: "laboratory" as Tab, label: "Laboratoire", icon: Building2 },
    { key: "analyses" as Tab, label: "Analyses", icon: FlaskConical },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  return (
    <DashboardLayout role="laboratory" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "laboratory" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations du laboratoire</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nom du laboratoire</Label><Input defaultValue="Laboratoire BioSanté" className="mt-1" /></div>
                <div><Label>N° Agrément</Label><Input defaultValue="LAB-2026-5678" className="mt-1" /></div>
                <div><Label>Directeur</Label><Input defaultValue="Dr. Mourad Kefi" className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input defaultValue="+216 71 789 012" className="mt-1" /></div>
                <div><Label>Email</Label><Input defaultValue="contact@biosante.tn" className="mt-1" /></div>
                <div><Label>Fax</Label><Input defaultValue="+216 71 789 013" className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Adresse</Label><Input defaultValue="30 Rue de la Santé, Centre Ville, 1000 Tunis" className="mt-1" /></div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Abonnement</h3>
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

        {tab === "analyses" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Catalogue d'analyses</h3>
            <p className="text-sm text-muted-foreground mb-4">Configurez les types d'analyses proposées et les délais de résultats.</p>
            <div className="space-y-3">
              {[
                { name: "NFS (Numération Formule Sanguine)", delay: "24h", price: "25 DT" },
                { name: "Glycémie à jeun", delay: "4h", price: "10 DT" },
                { name: "Bilan lipidique complet", delay: "24h", price: "40 DT" },
                { name: "HbA1c", delay: "48h", price: "35 DT" },
                { name: "TSH", delay: "48h", price: "30 DT" },
                { name: "Bilan hépatique", delay: "24h", price: "45 DT" },
                { name: "Bilan rénal", delay: "24h", price: "35 DT" },
                { name: "ECBU", delay: "48h", price: "20 DT" },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Délai : {a.delay}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{a.price}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4">+ Ajouter une analyse</Button>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { label: "Nouvelle demande d'analyse", desc: "Quand un médecin prescrit une analyse" },
                { label: "Résultat prêt", desc: "Confirmation quand un résultat est validé" },
                { label: "Prélèvement programmé", desc: "Rappel des prélèvements à domicile" },
                { label: "Messages", desc: "Nouveaux messages de médecins ou patients" },
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
              <p className="text-sm text-muted-foreground mb-4">Sécurisez l'accès aux données sensibles du laboratoire.</p>
              <Button variant="outline">Activer la 2FA</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LaboratorySettings;
