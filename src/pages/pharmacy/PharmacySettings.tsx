/**
 * Pharmacy Settings — Profile, hours, garde badge, notifications, security
 * CNAM → Assurance.
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Bell, Shield, Save, Clock, CreditCard, Moon } from "lucide-react";
import { toast } from "sonner";

type Tab = "pharmacy" | "hours" | "notifications" | "security";

const PharmacySettings = () => {
  const [tab, setTab] = useState<Tab>("pharmacy");
  const [isGarde, setIsGarde] = useState(false);

  const tabs = [
    { key: "pharmacy" as Tab, label: "Pharmacie", icon: Building2 },
    { key: "hours" as Tab, label: "Horaires & Garde", icon: Clock },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  return (
    <DashboardLayout role="pharmacy" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        {/* Tab selector (mobile scroll) */}
        <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {/* ── Pharmacy info ── */}
        {tab === "pharmacy" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations de la pharmacie</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nom</Label><Input defaultValue="Pharmacie El Manar" className="mt-1" /></div>
                <div><Label>N° Licence</Label><Input defaultValue="PH-2026-1234" className="mt-1" /></div>
                <div><Label>Pharmacien titulaire</Label><Input defaultValue="Dr. Samira Bouzid" className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input defaultValue="+216 71 456 789" className="mt-1" /></div>
                <div><Label>Email</Label><Input defaultValue="pharmacie.elmanar@email.tn" className="mt-1" /></div>
                <div><Label>Fax</Label><Input defaultValue="+216 71 456 790" className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Adresse</Label><Input defaultValue="25 Rue Pasteur, El Manar, 2092 Tunis" className="mt-1" /></div>
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
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => toast.success("Enregistré")}>
              <Save className="h-4 w-4 mr-2" />Enregistrer
            </Button>
          </div>
        )}

        {/* ── Hours + Garde badge ── */}
        {tab === "hours" && (
          <div className="space-y-6">
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
            </div>

            {/* ── Garde badge ── */}
            <div className={`rounded-xl border p-6 shadow-card transition-all ${isGarde ? "bg-warning/5 border-warning/30" : "bg-card"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isGarde ? "bg-warning/20" : "bg-muted"}`}>
                    <Moon className={`h-5 w-5 ${isGarde ? "text-warning" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Pharmacie de garde</h3>
                    <p className="text-xs text-muted-foreground">Activer manuellement quand vous êtes de garde</p>
                  </div>
                </div>
                <button onClick={() => { setIsGarde(!isGarde); toast.success(isGarde ? "Mode garde désactivé" : "Mode garde activé"); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isGarde ? "bg-warning" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isGarde ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              {isGarde && (
                <div className="mt-3 rounded-lg bg-warning/10 border border-warning/20 p-3">
                  <p className="text-xs text-warning font-medium">🌙 Mode garde actif — Votre pharmacie apparaît dans la liste des pharmacies de garde</p>
                </div>
              )}
            </div>

            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => toast.success("Horaires enregistrés")}>
              <Save className="h-4 w-4 mr-2" />Enregistrer
            </Button>
          </div>
        )}

        {/* ── Notifications ── */}
        {tab === "notifications" && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
            <div className="space-y-4">
              {[
                { label: "Nouvelle ordonnance reçue", desc: "Quand un patient envoie une ordonnance" },
                { label: "Stock faible", desc: "Alerte quand un produit atteint le seuil critique" },
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
            <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => toast.success("Enregistré")}>
              <Save className="h-4 w-4 mr-2" />Enregistrer
            </Button>
          </div>
        )}

        {/* ── Security ── */}
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
