import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Settings, Globe, Mail, Bell, Shield, Database, Clock, Save, ToggleLeft, ToggleRight, Palette, Server, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingsTab = "general" | "notifications" | "security" | "maintenance";

const AdminSettings = () => {
  const [tab, setTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);

  // General settings state
  const [platformName, setPlatformName] = useState("MediConnect");
  const [supportEmail, setSupportEmail] = useState("support@mediconnect.tn");
  const [maxFileSize, setMaxFileSize] = useState("10");
  const [autoApprove, setAutoApprove] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="flex items-center">
      {enabled ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
    </button>
  );

  const tabs = [
    { key: "general" as SettingsTab, label: "Général", icon: Settings },
    { key: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { key: "security" as SettingsTab, label: "Sécurité", icon: Shield },
    { key: "maintenance" as SettingsTab, label: "Maintenance", icon: Server },
  ];

  return (
    <DashboardLayout role="admin" title="Paramètres plateforme">
      <div className="max-w-4xl space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border bg-card p-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {/* General */}
        {tab === "general" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Informations générales</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nom de la plateforme</Label><Input value={platformName} onChange={e => setPlatformName(e.target.value)} className="mt-1" /></div>
                <div><Label>Email support</Label><Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="mt-1" /></div>
                <div><Label>Taille max fichiers (Mo)</Label><Input value={maxFileSize} onChange={e => setMaxFileSize(e.target.value)} type="number" className="mt-1" /></div>
                <div><Label>Devise</Label><Input value="Dinar Tunisien (DT)" disabled className="mt-1 bg-muted/50" /></div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground">Inscriptions</h3>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium text-foreground">Approbation automatique des patients</p>
                  <p className="text-xs text-muted-foreground">Les patients sont activés automatiquement à l'inscription</p>
                </div>
                <Toggle enabled={autoApprove} onToggle={() => setAutoApprove(!autoApprove)} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Validation manuelle médecins/labos/pharmacies</p>
                  <p className="text-xs text-muted-foreground">Vérification des documents obligatoire avant activation</p>
                </div>
                <Toggle enabled={true} onToggle={() => {}} />
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />Paramètres de notification</h3>
            {[
              { label: "Notifications email", desc: "Envoyer des emails pour les nouveaux RDV, rappels, etc.", enabled: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
              { label: "SMS de rappel", desc: "Envoyer des SMS de rappel avant les rendez-vous", enabled: smsEnabled, toggle: () => setSmsEnabled(!smsEnabled) },
              { label: "Alertes admin", desc: "Recevoir des alertes pour les signalements et inscriptions", enabled: true, toggle: () => {} },
              { label: "Notifications push", desc: "Notifications dans le navigateur pour les utilisateurs", enabled: false, toggle: () => {} },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Toggle enabled={n.enabled} onToggle={n.toggle} />
              </div>
            ))}
          </div>
        )}

        {/* Security */}
        {tab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Sécurité</h3>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium text-foreground">Authentification à deux facteurs</p>
                  <p className="text-xs text-muted-foreground">Exiger le 2FA pour les comptes administrateur</p>
                </div>
                <Toggle enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <Label>Timeout de session (minutes)</Label>
                  <Input value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} type="number" className="mt-1" />
                </div>
                <div>
                  <Label>Tentatives de connexion max</Label>
                  <Input value="5" disabled className="mt-1 bg-muted/50" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3">Journal de sécurité récent</h3>
              <div className="space-y-2">
                {[
                  { event: "Connexion admin réussie", ip: "197.2.xxx.xxx", time: "Il y a 30 min", status: "ok" },
                  { event: "Modification des paramètres", ip: "197.2.xxx.xxx", time: "Il y a 2h", status: "ok" },
                  { event: "Tentative de connexion échouée", ip: "41.228.xxx.xxx", time: "Il y a 5h", status: "alert" },
                  { event: "Suspension de compte utilisateur", ip: "197.2.xxx.xxx", time: "Il y a 8h", status: "ok" },
                ].map((e, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                    {e.status === "ok" ? <CheckCircle className="h-4 w-4 text-accent shrink-0" /> : <AlertTriangle className="h-4 w-4 text-warning shrink-0" />}
                    <span className="flex-1 text-foreground">{e.event}</span>
                    <span className="text-xs text-muted-foreground">{e.ip}</span>
                    <span className="text-xs text-muted-foreground">{e.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Maintenance */}
        {tab === "maintenance" && (
          <div className="space-y-6">
            <div className={`rounded-xl border p-6 shadow-card ${maintenanceMode ? "bg-destructive/5 border-destructive/30" : "bg-card"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />Mode maintenance
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Activer le mode maintenance rendra la plateforme inaccessible aux utilisateurs</p>
                </div>
                <Toggle enabled={maintenanceMode} onToggle={() => setMaintenanceMode(!maintenanceMode)} />
              </div>
              {maintenanceMode && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" />La plateforme est actuellement en mode maintenance</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Database className="h-4 w-4 text-primary" />Informations système</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Version", value: "2.4.1" },
                  { label: "Dernière mise à jour", value: "18 Fév 2026" },
                  { label: "Espace disque utilisé", value: "12.4 Go / 50 Go" },
                  { label: "Temps de fonctionnement", value: "99.97%" },
                  { label: "Utilisateurs en ligne", value: "234" },
                  { label: "Requêtes/min", value: "1,247" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-medium text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle className="h-4 w-4" />Paramètres sauvegardés</span>
          )}
          <Button className="gradient-primary text-primary-foreground" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />Enregistrer les modifications
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
