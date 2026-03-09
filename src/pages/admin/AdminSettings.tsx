/**
 * Admin System Settings — Feature flags, maintenance with motif, OTP config
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Settings, Globe, Bell, Shield, Server, AlertTriangle, CheckCircle, Database, Save, ToggleLeft, ToggleRight, Zap, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";
import MotifDialog from "@/components/admin/MotifDialog";

type SettingsTab = "general" | "features" | "security" | "maintenance";

const AdminSettings = () => {
  const [tab, setTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);

  // General
  const [platformName, setPlatformName] = useState("Medicare.tn");
  const [supportEmail, setSupportEmail] = useState("support@medicare.tn");
  const [maxFileSize, setMaxFileSize] = useState("10");
  const [autoApprovePatients, setAutoApprovePatients] = useState(true);

  // Feature flags
  const [features, setFeatures] = useState({
    teleconsultation: true,
    aiAssistant: true,
    pharmacyGuard: true,
    labDemands: true,
    prescriptionSend: true,
    patientMessaging: false,
    textReviews: true,
    medicinesDirectory: true,
    patientChat: false,
  });

  // Security / OTP
  const [otpCooldown, setOtpCooldown] = useState("60");
  const [otpMaxRetries, setOtpMaxRetries] = useState("5");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFactor, setTwoFactor] = useState(false);

  // Maintenance
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMotifOpen, setMaintenanceMotifOpen] = useState(false);

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="flex items-center">
      {enabled ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
    </button>
  );

  const handleSave = () => {
    appendLog("settings_updated", "system", "settings", "Paramètres système mis à jour");
    setSaved(true);
    toast({ title: "Paramètres sauvegardés" });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMaintenanceToggle = () => {
    if (!maintenanceMode) {
      setMaintenanceMotifOpen(true);
    } else {
      setMaintenanceMode(false);
      appendLog("maintenance_disabled", "system", "maintenance", "Mode maintenance désactivé");
      toast({ title: "Mode maintenance désactivé" });
    }
  };

  const handleMaintenanceConfirm = (motif: string) => {
    setMaintenanceMode(true);
    appendLog("maintenance_enabled", "system", "maintenance", `Mode maintenance activé — Motif : ${motif}`);
    toast({ title: "Mode maintenance activé", variant: "destructive" });
    setMaintenanceMotifOpen(false);
  };

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => {
      const newVal = !prev[key];
      appendLog("feature_flag_changed", "system", key, `Feature "${key}" → ${newVal ? "activé" : "désactivé"}`);
      return { ...prev, [key]: newVal };
    });
  };

  const tabs = [
    { key: "general" as SettingsTab, label: "Général", icon: Settings },
    { key: "features" as SettingsTab, label: "Feature flags", icon: Zap },
    { key: "security" as SettingsTab, label: "Sécurité & OTP", icon: Shield },
    { key: "maintenance" as SettingsTab, label: "Maintenance", icon: Server },
  ];

  const featureLabels: Record<string, { label: string; desc: string }> = {
    teleconsultation: { label: "Téléconsultation", desc: "Activer les consultations vidéo" },
    aiAssistant: { label: "Assistant IA", desc: "IA pour aide au diagnostic (médecins)" },
    pharmacyGuard: { label: "Pharmacies de garde", desc: "Module de gestion des gardes" },
    labDemands: { label: "Demandes labo", desc: "Workflow demandes d'analyses" },
    prescriptionSend: { label: "Envoi ordonnances", desc: "Patients peuvent envoyer aux pharmacies" },
    patientMessaging: { label: "Messagerie patients", desc: "Chat patient-médecin (bêta)" },
    textReviews: { label: "Avis texte", desc: "Avis patients sur les médecins (texte uniquement, pas d'étoiles)" },
    medicinesDirectory: { label: "Annuaire médicaments", desc: "Répertoire public des médicaments" },
    patientChat: { label: "Chat patient", desc: "Chat en temps réel patient-secrétariat" },
  };

  return (
    <DashboardLayout role="admin" title="Paramètres système">
      <div className="max-w-4xl space-y-6">
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
                  <p className="text-xs text-muted-foreground">Les patients sont activés automatiquement</p>
                </div>
                <Toggle enabled={autoApprovePatients} onToggle={() => setAutoApprovePatients(!autoApprovePatients)} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Validation manuelle pros</p>
                  <p className="text-xs text-muted-foreground">Médecins/labos/pharmacies nécessitent KYC</p>
                </div>
                <Toggle enabled={true} onToggle={() => {}} />
              </div>
            </div>
          </div>
        )}

        {/* Feature flags */}
        {tab === "features" && (
          <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Feature flags</h3>
            <p className="text-xs text-muted-foreground">Activez ou désactivez les fonctionnalités de la plateforme.</p>
            {Object.entries(featureLabels).map(([key, { label, desc }]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Toggle enabled={features[key as keyof typeof features]} onToggle={() => toggleFeature(key as keyof typeof features)} />
              </div>
            ))}
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
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <Label>Timeout session (min)</Label>
                  <Input value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} type="number" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" />Configuration OTP</h3>
              <p className="text-xs text-muted-foreground">Paramètres de sécurité pour les codes OTP (login, vérification).</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Cooldown entre envois (sec)</Label>
                  <Input value={otpCooldown} onChange={e => setOtpCooldown(e.target.value)} type="number" className="mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">Temps minimum entre 2 envois d'OTP</p>
                </div>
                <div>
                  <Label>Max tentatives</Label>
                  <Input value={otpMaxRetries} onChange={e => setOtpMaxRetries(e.target.value)} type="number" className="mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">Verrouillage après N échecs</p>
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
                  <p className="text-xs text-muted-foreground mt-1">Rend la plateforme inaccessible aux utilisateurs</p>
                </div>
                <Toggle enabled={maintenanceMode} onToggle={handleMaintenanceToggle} />
              </div>
              {maintenanceMode && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" />La plateforme est en mode maintenance</p>
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
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="flex items-center gap-1 text-sm text-accent"><CheckCircle className="h-4 w-4" />Sauvegardé</span>}
          <Button className="gradient-primary text-primary-foreground" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />Enregistrer
          </Button>
        </div>
      </div>

      {/* Maintenance motif dialog */}
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
