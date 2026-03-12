/**
 * Admin System Settings — Connected to central admin store
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useCallback } from "react";
import {
  Settings, Globe, Bell, Shield, Server, AlertTriangle, CheckCircle,
  Database, Save, ToggleLeft, ToggleRight, Zap, KeyRound,
  Mail, MessageSquare, Clock, Users, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";
import { useAdminSettings } from "@/stores/adminStore";

type SettingsTab = "general" | "features" | "notifications" | "security" | "maintenance";

const AdminSettings = () => {
  const [tab, setTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);
  const { settings, setSettings } = useAdminSettings();

  // Derived local state from store settings
  const { platformName, supportEmail, supportPhone, maxFileSize, autoApprovePatients,
    defaultLanguage, timezone, termsUrl, privacyUrl, features, notifConfig, security,
    maintenanceMode, maintenanceMessage } = settings;

  const update = useCallback((patch: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, [setSettings]);

  const [maintenanceMotifOpen, setMaintenanceMotifOpen] = useState(false);

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="flex items-center">
      {enabled ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
    </button>
  );

  const handleSave = () => {
    appendLog("settings_updated", "system", "settings", `Paramètres système mis à jour (onglet: ${tab})`);
    setSaved(true);
    toast({ title: "Paramètres sauvegardés" });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMaintenanceToggle = () => {
    if (!maintenanceMode) {
      setMaintenanceMotifOpen(true);
    } else {
      update({ maintenanceMode: false });
      appendLog("maintenance_disabled", "system", "maintenance", "Mode maintenance désactivé");
      toast({ title: "Mode maintenance désactivé" });
    }
  };

  const handleMaintenanceConfirm = (motif: string) => {
    update({ maintenanceMode: true });
    appendLog("maintenance_enabled", "system", "maintenance", `Mode maintenance activé — Motif : ${motif}`);
    toast({ title: "Mode maintenance activé", variant: "destructive" });
    setMaintenanceMotifOpen(false);
  };

  const toggleFeature = (key: string) => {
    const newVal = !features[key];
    update({ features: { ...features, [key]: newVal } });
    appendLog("feature_flag_changed", "system", key, `Feature "${key}" → ${newVal ? "activé" : "désactivé"}`);
  };

  const tabs = [
    { key: "general" as SettingsTab, label: "Général", icon: Settings },
    { key: "features" as SettingsTab, label: "Feature flags", icon: Zap },
    { key: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { key: "security" as SettingsTab, label: "Sécurité", icon: Shield },
    { key: "maintenance" as SettingsTab, label: "Maintenance", icon: Server },
  ];

  const featureLabels: Record<string, { label: string; desc: string; category: string }> = {
    teleconsultation: { label: "Téléconsultation", desc: "Activer les consultations vidéo", category: "Clinique" },
    aiAssistant: { label: "Assistant IA", desc: "IA pour aide au diagnostic (médecins)", category: "Clinique" },
    pharmacyGuard: { label: "Pharmacies de garde", desc: "Module de gestion des gardes", category: "Pharmacie" },
    labDemands: { label: "Demandes labo", desc: "Workflow demandes d'analyses", category: "Laboratoire" },
    prescriptionSendPharmacy: { label: "Envoi ordonnances → Pharmacie", desc: "Patients et médecins peuvent envoyer aux pharmacies", category: "Ordonnances" },
    prescriptionSendLab: { label: "Envoi ordonnances → Labo", desc: "Envoi des demandes d'analyses aux laboratoires", category: "Ordonnances" },
    patientMessaging: { label: "Messagerie patients", desc: "Chat patient-médecin (bêta)", category: "Communication" },
    textReviews: { label: "Avis texte", desc: "Avis patients sur les médecins", category: "Public" },
    medicinesDirectory: { label: "Annuaire médicaments", desc: "Répertoire public des médicaments", category: "Public" },
    patientChat: { label: "Chat patient", desc: "Chat en temps réel patient-secrétariat", category: "Communication" },
    onlinePayment: { label: "Paiement en ligne", desc: "Paiement par carte bancaire (téléconsultation)", category: "Finance" },
    appointmentReminder: { label: "Rappels RDV", desc: "SMS/push de rappel automatique", category: "Communication" },
    disputeReporting: { label: "Signalement litiges", desc: "Patients et médecins peuvent signaler un litige", category: "Modération" },
    commentReporting: { label: "Signalement commentaires", desc: "Signaler un avis inapproprié", category: "Modération" },
  };

  // Group features by category
  const categories = [...new Set(Object.values(featureLabels).map(f => f.category))];

  return (
    <DashboardLayout role="admin" title="Paramètres système">
      <div className="max-w-4xl space-y-6">
        <div className="flex gap-1 rounded-lg border bg-card p-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* General */}
        {tab === "general" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-5">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Informations plateforme</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-xs">Nom de la plateforme</Label><Input value={platformName} onChange={e => update({ platformName: e.target.value })} className="mt-1" /></div>
                <div><Label className="text-xs">Email support</Label><Input value={supportEmail} onChange={e => update({ supportEmail: e.target.value })} className="mt-1" /></div>
                <div><Label className="text-xs">Téléphone support</Label><Input value={supportPhone} onChange={e => update({ supportPhone: e.target.value })} className="mt-1" /></div>
                <div><Label className="text-xs">Devise</Label><Input value="Dinar Tunisien (DT)" disabled className="mt-1 bg-muted/50" /></div>
                <div><Label className="text-xs">Taille max fichiers (Mo)</Label><Input value={maxFileSize} onChange={e => update({ maxFileSize: e.target.value })} type="number" className="mt-1" /></div>
                <div>
                  <Label className="text-xs">Langue par défaut</Label>
                  <Select value={defaultLanguage} onValueChange={v => update({ defaultLanguage: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">Arabe</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Fuseau horaire</Label><Input value={timezone} disabled className="mt-1 bg-muted/50" /></div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Pages légales</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label className="text-xs">URL CGU</Label><Input value={termsUrl} onChange={e => update({ termsUrl: e.target.value })} className="mt-1" /></div>
                <div><Label className="text-xs">URL Politique de confidentialité</Label><Input value={privacyUrl} onChange={e => update({ privacyUrl: e.target.value })} className="mt-1" /></div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Inscriptions</h3>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium text-foreground">Approbation auto des patients</p>
                  <p className="text-xs text-muted-foreground">Les patients sont activés sans validation manuelle</p>
                </div>
                <Toggle enabled={autoApprovePatients} onToggle={() => update({ autoApprovePatients: !autoApprovePatients })} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Validation manuelle pros</p>
                  <p className="text-xs text-muted-foreground">Médecins, labos, pharmacies nécessitent KYC</p>
                </div>
                <Toggle enabled={true} onToggle={() => {}} />
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" />Modèle de revenus</h3>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm font-medium text-foreground">Abonnements uniquement</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Les revenus de la plateforme proviennent exclusivement des abonnements des professionnels de santé.
                  Aucune commission n'est prélevée sur les téléconsultations — les médecins fixent librement leurs tarifs.
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground">Gérez les plans et tarifs d'abonnement depuis la page « Plans & Tarifs » dans le menu Finance & Offres.</p>
            </div>
          </div>
        )}

        {/* Feature flags — grouped by category */}
        {tab === "features" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Feature flags</h3>
              <p className="text-xs text-muted-foreground">Activez ou désactivez les fonctionnalités. Les changements affectent <strong>tous les espaces</strong> concernés (patient, médecin, pharmacie, etc.).</p>
            </div>
            {categories.map(cat => (
              <div key={cat} className="rounded-xl border bg-card p-6 shadow-card space-y-1">
                <h4 className="text-sm font-semibold text-foreground mb-3">{cat}</h4>
                {Object.entries(featureLabels).filter(([, v]) => v.category === cat).map(([key, { label, desc }]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Toggle enabled={!!features[key]} onToggle={() => toggleFeature(key)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />Notifications automatiques</h3>
              <p className="text-xs text-muted-foreground">Configurez quels événements déclenchent une notification.</p>
              {[
                { key: "rdvReminder", label: "Rappel de RDV", desc: "SMS/push avant le rendez-vous" },
                { key: "rdvConfirmation", label: "Confirmation de RDV", desc: "Email après prise de RDV" },
                { key: "prescriptionReady", label: "Ordonnance disponible", desc: "Push au patient" },
                { key: "labResultReady", label: "Résultats d'analyses", desc: "SMS/push quand résultats prêts" },
                { key: "accountApproved", label: "Compte approuvé", desc: "Email au professionnel" },
                { key: "paymentReceipt", label: "Reçu de paiement", desc: "Email après paiement" },
                { key: "weeklyReport", label: "Rapport hebdomadaire", desc: "Email récapitulatif aux médecins" },
                { key: "marketingConsent", label: "Opt-in marketing", desc: "Permettre les emails promotionnels" },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Toggle
                    enabled={!!(notifConfig as Record<string, boolean | string>)[n.key]}
                    onToggle={() => update({ notifConfig: { ...notifConfig, [n.key]: !(notifConfig as Record<string, boolean | string>)[n.key] } })}
                  />
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Délai de rappel RDV</h3>
              <div className="max-w-xs">
                <Label className="text-xs">Heures avant le RDV</Label>
                <Input value={notifConfig.rdvReminderDelay as string} onChange={e => update({ notifConfig: { ...notifConfig, rdvReminderDelay: e.target.value } })} type="number" className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">Le rappel sera envoyé {notifConfig.rdvReminderDelay}h avant le RDV</p>
              </div>
            </div>
          </div>
        )}

        {/* Security & OTP */}
        {tab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Sécurité</h3>
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-sm font-medium text-foreground">2FA admin obligatoire</p>
                  <p className="text-xs text-muted-foreground">Exiger le 2FA pour les admins</p>
                </div>
                <Toggle enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <div>
                  <Label className="text-xs">Timeout session (min)</Label>
                  <Input value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} type="number" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Longueur min MDP</Label>
                  <Input value={passwordMinLength} onChange={e => setPasswordMinLength(e.target.value)} type="number" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Tentatives connexion max</Label>
                  <Input value={loginAttempts} onChange={e => setLoginAttempts(e.target.value)} type="number" className="mt-1" />
                </div>
              </div>
              <div className="max-w-xs">
                <Label className="text-xs">Durée verrouillage (min)</Label>
                <Input value={lockoutDuration} onChange={e => setLockoutDuration(e.target.value)} type="number" className="mt-1" />
                <p className="text-[10px] text-muted-foreground mt-1">Après {loginAttempts} échecs, le compte est bloqué {lockoutDuration} min</p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" />Configuration OTP</h3>
              <p className="text-xs text-muted-foreground">Paramètres pour les codes OTP (login, vérification).</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Cooldown entre envois (sec)</Label>
                  <Input value={otpCooldown} onChange={e => setOtpCooldown(e.target.value)} type="number" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Max tentatives</Label>
                  <Input value={otpMaxRetries} onChange={e => setOtpMaxRetries(e.target.value)} type="number" className="mt-1" />
                </div>
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
                  <p className="text-xs text-muted-foreground mt-1">Rend la plateforme inaccessible</p>
                </div>
                <Toggle enabled={maintenanceMode} onToggle={handleMaintenanceToggle} />
              </div>
              {maintenanceMode && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Plateforme en maintenance</p>
                  </div>
                  <div>
                    <Label className="text-xs">Message affiché aux utilisateurs</Label>
                    <Textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} className="mt-1" rows={2} />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Database className="h-4 w-4 text-primary" />Informations système</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Version", value: "2.4.1" },
                  { label: "Dernière MàJ", value: "18 Fév 2026" },
                  { label: "Espace disque", value: "12.4 Go / 50 Go" },
                  { label: "Uptime", value: "99.97%" },
                  { label: "Utilisateurs en ligne", value: "234" },
                  { label: "Requêtes/min", value: "1,247" },
                  { label: "Cache hit rate", value: "94.2%" },
                  { label: "Erreurs/jour", value: "< 0.01%" },
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

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pb-6">
          {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle className="h-4 w-4" />Sauvegardé</span>}
          <Button className="gradient-primary text-primary-foreground" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />Enregistrer
          </Button>
        </div>
      </div>

      <MotifDialog
        open={maintenanceMotifOpen}
        onClose={() => setMaintenanceMotifOpen(false)}
        onConfirm={handleMaintenanceConfirm}
        title="Activer le mode maintenance"
        description="La plateforme sera inaccessible à tous les utilisateurs."
        confirmLabel="Activer la maintenance"
        destructive
      />
    </DashboardLayout>
  );
};

export default AdminSettings;
