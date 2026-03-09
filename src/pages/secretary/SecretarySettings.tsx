/**
 * SecretarySettings — Full settings with profile, notifications, security.
 * Mirrors doctor settings quality with sessions, RGPD, granular notifications.
 * // TODO BACKEND: PUT /api/secretary/settings
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, Bell, Shield, Save, CheckCircle, Monitor, Smartphone, MapPin, 
  Clock, LogOut, Download, Trash2, Moon, Mail, Phone
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Tab = "profile" | "notifications" | "security";

const mockSessions = [
  { id: "s1", device: "Chrome · macOS", location: "Tunis, Tunisie", ip: "197.2.xxx.xxx", lastActive: "Maintenant", current: true },
  { id: "s2", device: "Safari · iPhone", location: "Tunis, Tunisie", ip: "197.2.xxx.xxx", lastActive: "Il y a 1h", current: false },
];

interface NotifPref {
  key: string; label: string; desc: string; category: string;
  email: boolean; sms: boolean; push: boolean;
}

const defaultNotifPrefs: NotifPref[] = [
  { key: "new_rdv", label: "Nouveau rendez-vous", desc: "Notification à chaque nouveau RDV créé", category: "Agenda", email: true, sms: false, push: true },
  { key: "cancel_rdv", label: "Annulation de RDV", desc: "Quand un patient annule", category: "Agenda", email: true, sms: true, push: true },
  { key: "remind_rdv", label: "Rappel planning", desc: "Rappel du planning du lendemain (20h)", category: "Agenda", email: true, sms: false, push: true },
  { key: "patient_arrival", label: "Arrivée patient", desc: "Quand un patient fait son check-in", category: "Salle d'attente", email: false, sms: false, push: true },
  { key: "consult_end", label: "Fin de consultation", desc: "Quand le médecin termine une consultation", category: "Salle d'attente", email: false, sms: false, push: true },
  { key: "patient_msg", label: "Messages patients", desc: "Nouveau message d'un patient", category: "Communication", email: false, sms: false, push: true },
  { key: "doctor_msg", label: "Messages médecin", desc: "Message du médecin rattaché", category: "Communication", email: true, sms: false, push: true },
  { key: "billing_alert", label: "Impayés", desc: "Alerte quand un patient a un solde impayé", category: "Facturation", email: true, sms: false, push: true },
  { key: "document_upload", label: "Nouveau document", desc: "Document ajouté au dossier d'un patient", category: "Documents", email: false, sms: false, push: true },
];

const SecretarySettings = () => {
  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  // Profile
  const [profile, setProfile] = useState({
    firstName: "Leila", lastName: "Hammami",
    email: "leila@cabinet-bouazizi.tn", phone: "+216 71 234 568",
    role: "Secrétaire médicale", cabinet: "Cabinet Médical El Manar",
  });

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState(defaultNotifPrefs);
  const [quietHours, setQuietHours] = useState(true);
  const [quietFrom, setQuietFrom] = useState("20:00");
  const [quietTo, setQuietTo] = useState("07:00");

  // Security
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState(mockSessions);
  const [showExportData, setShowExportData] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Paramètres sauvegardés" });
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotifChannel = (key: string, channel: "email" | "sms" | "push") => {
    setNotifPrefs(prev => prev.map(p => p.key === key ? { ...p, [channel]: !p[channel] } : p));
  };

  const tabs = [
    { key: "profile" as Tab, label: "Profil", icon: User },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  const notifCategories = [...new Set(notifPrefs.map(p => p.category))];

  return (
    <DashboardLayout role="secretary" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        {saved && (
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 flex items-center gap-2 animate-fade-in">
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

        {/* ── Profile tab ── */}
        {tab === "profile" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations personnelles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Prénom</Label><Input value={profile.firstName} onChange={e => setProfile(prev => ({ ...prev, firstName: e.target.value }))} className="mt-1" /></div>
                <div><Label>Nom</Label><Input value={profile.lastName} onChange={e => setProfile(prev => ({ ...prev, lastName: e.target.value }))} className="mt-1" /></div>
                <div><Label>Email professionnel</Label><Input value={profile.email} onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))} className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input value={profile.phone} onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))} className="mt-1" /></div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Rattachement</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Rôle</p>
                  <p className="text-sm font-medium text-foreground">{profile.role}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">Cabinet</p>
                  <p className="text-sm font-medium text-foreground">{profile.cabinet}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Pour changer de rattachement, contactez le médecin responsable.</p>
            </div>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />Enregistrer
            </Button>
          </div>
        )}

        {/* ── Notifications tab ── */}
        {tab === "notifications" && (
          <div className="space-y-6">
            {notifCategories.map(cat => (
              <div key={cat} className="rounded-xl border bg-card p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-4">{cat}</h3>
                <div className="space-y-1">
                  <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 pb-2 border-b">
                    <span />
                    <span className="text-[10px] font-semibold text-muted-foreground text-center">Email</span>
                    <span className="text-[10px] font-semibold text-muted-foreground text-center">SMS</span>
                    <span className="text-[10px] font-semibold text-muted-foreground text-center">Push</span>
                  </div>
                  {notifPrefs.filter(p => p.category === cat).map(pref => (
                    <div key={pref.key} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 py-3 border-b last:border-0 items-center">
                      <div>
                        <p className="text-sm font-medium text-foreground">{pref.label}</p>
                        <p className="text-xs text-muted-foreground">{pref.desc}</p>
                      </div>
                      <div className="flex justify-center"><input type="checkbox" checked={pref.email} onChange={() => toggleNotifChannel(pref.key, "email")} className="rounded border-input" /></div>
                      <div className="flex justify-center"><input type="checkbox" checked={pref.sms} onChange={() => toggleNotifChannel(pref.key, "sms")} className="rounded border-input" /></div>
                      <div className="flex justify-center"><input type="checkbox" checked={pref.push} onChange={() => toggleNotifChannel(pref.key, "push")} className="rounded border-input" /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Quiet hours */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Moon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Heures calmes</h3>
                    <p className="text-sm text-muted-foreground">Suspendre les notifications hors heures de travail</p>
                  </div>
                </div>
                <Switch checked={quietHours} onCheckedChange={setQuietHours} />
              </div>
              {quietHours && (
                <div className="flex items-center gap-3 pl-[52px]">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">De</label>
                    <input type="time" value={quietFrom} onChange={e => setQuietFrom(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">À</label>
                    <input type="time" value={quietTo} onChange={e => setQuietTo(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
                  </div>
                </div>
              )}
            </div>

            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />Enregistrer les préférences
            </Button>
          </div>
        )}

        {/* ── Security tab ── */}
        {tab === "security" && (
          <div className="space-y-6">
            {/* Change password */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
              <div className="max-w-md space-y-4">
                <div><Label>Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Confirmer</Label><Input type="password" className="mt-1" /></div>
                <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => toast({ title: "Mot de passe modifié" })}>
                  Changer le mot de passe
                </Button>
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
                      {twoFAEnabled ? "Activée — code SMS à chaque connexion." : "Ajoutez une couche de sécurité supplémentaire."}
                    </p>
                  </div>
                </div>
                <Switch checked={twoFAEnabled} onCheckedChange={(v) => {
                  setTwoFAEnabled(v);
                  toast({ title: v ? "2FA activée" : "2FA désactivée" });
                }} />
              </div>
            </div>

            {/* Active sessions */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />Sessions actives
                </h3>
                {sessions.filter(s => !s.current).length > 0 && (
                  <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => {
                    setSessions(prev => prev.filter(s => s.current));
                    toast({ title: "Sessions révoquées" });
                  }}>
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
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => {
                        setSessions(prev => prev.filter(ss => ss.id !== s.id));
                        toast({ title: "Session révoquée" });
                      }}>
                        <LogOut className="h-3.5 w-3.5 mr-1" />Révoquer
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RGPD */}
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
                      <p className="text-xs text-muted-foreground">Téléchargez une copie de vos données personnelles.</p>
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
                      <p className="text-xs text-muted-foreground">Suppression définitive sous 30 jours.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => setShowDeleteAccount(true)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />Supprimer
                  </Button>
                </div>
              </div>
            </div>

            <ConfirmDialog
              open={showExportData}
              onConfirm={() => { setShowExportData(false); toast({ title: "Export RGPD lancé", description: "Email envoyé sous 24h (mock)." }); }}
              onCancel={() => setShowExportData(false)}
              title="Exporter vos données"
              description="Un fichier contenant vos données personnelles sera envoyé à votre adresse email."
              confirmLabel="Lancer l'export"
            />
            <ConfirmDialog
              open={showDeleteAccount}
              onConfirm={() => { setShowDeleteAccount(false); toast({ title: "Demande enregistrée", variant: "destructive" }); }}
              onCancel={() => setShowDeleteAccount(false)}
              title="Supprimer votre compte"
              description="Action irréversible. Votre compte sera supprimé sous 30 jours."
              variant="danger"
              confirmLabel="Confirmer la suppression"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretarySettings;
