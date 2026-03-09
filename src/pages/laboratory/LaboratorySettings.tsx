/**
 * LaboratorySettings — Full settings: lab info, catalogue, notifications (granular), security + RGPD.
 * // TODO BACKEND: PUT /api/laboratory/settings
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Building2, Bell, Shield, Save, Clock, CreditCard, FlaskConical,
  CheckCircle, Monitor, Smartphone, MapPin, Moon, LogOut, Download, Trash2, Plus, Edit, X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

type Tab = "laboratory" | "analyses" | "notifications" | "security";

const mockSessions = [
  { id: "s1", device: "Chrome · Windows", location: "Tunis, Tunisie", ip: "197.2.xxx.xxx", lastActive: "Maintenant", current: true },
  { id: "s2", device: "Firefox · Linux", location: "Sfax, Tunisie", ip: "41.226.xxx.xxx", lastActive: "Il y a 3h", current: false },
];

interface NotifPref {
  key: string; label: string; desc: string; category: string;
  email: boolean; sms: boolean; push: boolean;
}

const defaultNotifPrefs: NotifPref[] = [
  { key: "new_demand", label: "Nouvelle demande", desc: "Quand un médecin prescrit une analyse", category: "Demandes", email: true, sms: true, push: true },
  { key: "urgent_demand", label: "Demande urgente", desc: "Notification prioritaire pour urgences", category: "Demandes", email: true, sms: true, push: true },
  { key: "result_validated", label: "Résultat validé", desc: "Confirmation après validation", category: "Résultats", email: true, sms: false, push: true },
  { key: "result_transmitted", label: "Résultat transmis", desc: "Quand les résultats sont envoyés au médecin", category: "Résultats", email: true, sms: false, push: true },
  { key: "pickup_reminder", label: "Prélèvement domicile", desc: "Rappel de prélèvement à domicile programmé", category: "Prélèvements", email: false, sms: true, push: true },
  { key: "doctor_msg", label: "Message médecin", desc: "Nouveau message d'un prescripteur", category: "Communication", email: true, sms: false, push: true },
  { key: "patient_msg", label: "Message patient", desc: "Question d'un patient", category: "Communication", email: false, sms: false, push: true },
  { key: "stock_alert", label: "Stock réactifs", desc: "Alerte seuil critique de réactifs", category: "Stock", email: true, sms: true, push: true },
];

interface AnalyseCatalogue { name: string; delay: string; price: string; }

const initialCatalogue: AnalyseCatalogue[] = [
  { name: "NFS (Numération Formule Sanguine)", delay: "24h", price: "25 DT" },
  { name: "Glycémie à jeun", delay: "4h", price: "10 DT" },
  { name: "Bilan lipidique complet", delay: "24h", price: "40 DT" },
  { name: "HbA1c", delay: "48h", price: "35 DT" },
  { name: "TSH", delay: "48h", price: "30 DT" },
  { name: "Bilan hépatique", delay: "24h", price: "45 DT" },
  { name: "Bilan rénal", delay: "24h", price: "35 DT" },
  { name: "ECBU", delay: "48h", price: "20 DT" },
];

const LaboratorySettings = () => {
  const [tab, setTab] = useState<Tab>("laboratory");
  const [saved, setSaved] = useState(false);

  // Lab info
  const [labInfo, setLabInfo] = useState({
    name: "Laboratoire BioSanté", agrement: "LAB-2026-5678",
    director: "Dr. Mourad Kefi", phone: "+216 71 789 012",
    email: "contact@biosante.tn", fax: "+216 71 789 013",
    address: "30 Rue de la Santé, Centre Ville, 1000 Tunis",
  });

  // Catalogue
  const [catalogue, setCatalogue] = useState(initialCatalogue);
  const [showAddAnalyse, setShowAddAnalyse] = useState(false);
  const [newAnalyse, setNewAnalyse] = useState({ name: "", delay: "24h", price: "" });
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState(defaultNotifPrefs);
  const [quietHours, setQuietHours] = useState(false);
  const [quietFrom, setQuietFrom] = useState("20:00");
  const [quietTo, setQuietTo] = useState("07:00");

  // Security
  const [twoFA, setTwoFA] = useState(false);
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

  const handleAddCatalogue = () => {
    if (!newAnalyse.name.trim()) return;
    setCatalogue(prev => [...prev, { ...newAnalyse }]);
    setNewAnalyse({ name: "", delay: "24h", price: "" });
    setShowAddAnalyse(false);
    toast({ title: "Analyse ajoutée au catalogue" });
  };

  const handleRemoveCatalogue = (idx: number) => {
    setCatalogue(prev => prev.filter((_, i) => i !== idx));
    toast({ title: "Analyse supprimée du catalogue" });
  };

  const tabs = [
    { key: "laboratory" as Tab, label: "Laboratoire", icon: Building2 },
    { key: "analyses" as Tab, label: "Analyses", icon: FlaskConical },
    { key: "notifications" as Tab, label: "Notifications", icon: Bell },
    { key: "security" as Tab, label: "Sécurité", icon: Shield },
  ];

  const notifCategories = [...new Set(notifPrefs.map(p => p.category))];

  return (
    <DashboardLayout role="laboratory" title="Paramètres">
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

        {/* ── Lab info ── */}
        {tab === "laboratory" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations du laboratoire</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Nom</Label><Input value={labInfo.name} onChange={e => setLabInfo(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
                <div><Label>N° Agrément</Label><Input value={labInfo.agrement} onChange={e => setLabInfo(p => ({ ...p, agrement: e.target.value }))} className="mt-1" /></div>
                <div><Label>Directeur</Label><Input value={labInfo.director} onChange={e => setLabInfo(p => ({ ...p, director: e.target.value }))} className="mt-1" /></div>
                <div><Label>Téléphone</Label><Input value={labInfo.phone} onChange={e => setLabInfo(p => ({ ...p, phone: e.target.value }))} className="mt-1" /></div>
                <div><Label>Email</Label><Input value={labInfo.email} onChange={e => setLabInfo(p => ({ ...p, email: e.target.value }))} className="mt-1" /></div>
                <div><Label>Fax</Label><Input value={labInfo.fax} onChange={e => setLabInfo(p => ({ ...p, fax: e.target.value }))} className="mt-1" /></div>
                <div className="sm:col-span-2"><Label>Adresse</Label><Input value={labInfo.address} onChange={e => setLabInfo(p => ({ ...p, address: e.target.value }))} className="mt-1" /></div>
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
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {/* ── Catalogue ── */}
        {tab === "analyses" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Catalogue d'analyses</h3>
                <Button variant="outline" size="sm" onClick={() => setShowAddAnalyse(!showAddAnalyse)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Ajouter
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Configurez les types d'analyses proposées et les délais de résultats.</p>

              {showAddAnalyse && (
                <div className="rounded-lg border bg-muted/20 p-4 mb-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div><Label className="text-xs">Nom</Label><Input value={newAnalyse.name} onChange={e => setNewAnalyse(p => ({ ...p, name: e.target.value }))} className="mt-1" placeholder="Ex: Vitamine D" /></div>
                    <div><Label className="text-xs">Délai</Label><Input value={newAnalyse.delay} onChange={e => setNewAnalyse(p => ({ ...p, delay: e.target.value }))} className="mt-1" placeholder="24h" /></div>
                    <div><Label className="text-xs">Prix</Label><Input value={newAnalyse.price} onChange={e => setNewAnalyse(p => ({ ...p, price: e.target.value }))} className="mt-1" placeholder="30 DT" /></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleAddCatalogue}>Ajouter</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddAnalyse(false)}>Annuler</Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {catalogue.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3 group hover:bg-muted/30 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground">Délai : {a.delay}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">{a.price}</span>
                      <button onClick={() => handleRemoveCatalogue(i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {/* ── Notifications (granular) ── */}
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
                    <p className="text-sm text-muted-foreground">Suspendre hors heures d'ouverture (sauf urgences)</p>
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

            <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer les préférences</Button>
          </div>
        )}

        {/* ── Security + RGPD ── */}
        {tab === "security" && (
          <div className="space-y-6">
            {/* Password */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Changer le mot de passe</h3>
              <div className="max-w-md space-y-4">
                <div><Label>Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <div><Label>Confirmer</Label><Input type="password" className="mt-1" /></div>
                <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={() => toast({ title: "Mot de passe modifié" })}>Changer le mot de passe</Button>
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
                      {twoFA ? "Activée — code SMS à chaque connexion." : "Protégez l'accès aux données sensibles du laboratoire."}
                    </p>
                  </div>
                </div>
                <Switch checked={twoFA} onCheckedChange={v => { setTwoFA(v); toast({ title: v ? "2FA activée" : "2FA désactivée" }); }} />
              </div>
            </div>

            {/* Sessions */}
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />Sessions actives
                </h3>
                {sessions.filter(s => !s.current).length > 0 && (
                  <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => { setSessions(p => p.filter(s => s.current)); toast({ title: "Sessions révoquées" }); }}>
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
                      <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => { setSessions(p => p.filter(ss => ss.id !== s.id)); toast({ title: "Session révoquée" }); }}>
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
                    <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center"><Download className="h-4 w-4 text-accent" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Exporter les données</p>
                      <p className="text-xs text-muted-foreground">Téléchargez une copie des données du laboratoire.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowExportData(true)}><Download className="h-3.5 w-3.5 mr-1" />Exporter</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-4 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center"><Trash2 className="h-4 w-4 text-destructive" /></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Supprimer le compte</p>
                      <p className="text-xs text-muted-foreground">Suppression définitive sous 30 jours.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => setShowDeleteAccount(true)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />Supprimer
                  </Button>
                </div>
              </div>
            </div>

            <ConfirmDialog open={showExportData} onConfirm={() => { setShowExportData(false); toast({ title: "Export RGPD lancé", description: "Email envoyé sous 24h (mock)." }); }} onCancel={() => setShowExportData(false)} title="Exporter les données" description="Un fichier sera envoyé par email." confirmLabel="Lancer l'export" />
            <ConfirmDialog open={showDeleteAccount} onConfirm={() => { setShowDeleteAccount(false); toast({ title: "Demande enregistrée", variant: "destructive" }); }} onCancel={() => setShowDeleteAccount(false)} title="Supprimer le compte" description="Action irréversible. Compte supprimé sous 30 jours." variant="danger" confirmLabel="Confirmer la suppression" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LaboratorySettings;
