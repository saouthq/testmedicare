/**
 * LaboratorySettings — Streamlined settings: lab info, catalogue, notifications, security.
 * Mobile-optimized with select-based tab navigation.
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
  CheckCircle, Monitor, Smartphone, Plus, X, Moon, Download, Trash2
} from "lucide-react";
import { toast } from "sonner";
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
  { key: "result_transmitted", label: "Résultat transmis", desc: "Quand les résultats sont envoyés", category: "Résultats", email: true, sms: false, push: true },
  { key: "stock_alert", label: "Stock réactifs", desc: "Alerte seuil critique de réactifs", category: "Stock", email: true, sms: true, push: true },
  { key: "doctor_msg", label: "Message médecin", desc: "Nouveau message d'un prescripteur", category: "Communication", email: true, sms: false, push: true },
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

  const [labInfo, setLabInfo] = useState({
    name: "Laboratoire BioSanté", agrement: "LAB-2026-5678",
    director: "Dr. Mourad Kefi", phone: "+216 71 789 012",
    email: "contact@biosante.tn", fax: "+216 71 789 013",
    address: "30 Rue de la Santé, Centre Ville, 1000 Tunis",
  });

  const [catalogue, setCatalogue] = useState(initialCatalogue);
  const [showAddAnalyse, setShowAddAnalyse] = useState(false);
  const [newAnalyse, setNewAnalyse] = useState({ name: "", delay: "24h", price: "" });

  const [notifPrefs, setNotifPrefs] = useState(defaultNotifPrefs);
  const [quietHours, setQuietHours] = useState(false);
  const [quietFrom, setQuietFrom] = useState("20:00");
  const [quietTo, setQuietTo] = useState("07:00");

  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState(mockSessions);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Paramètres sauvegardés ✓");
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
    toast.success("Analyse ajoutée ✓");
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "laboratory", label: "Laboratoire", icon: Building2 },
    { key: "analyses", label: "Catalogue", icon: FlaskConical },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Sécurité", icon: Shield },
  ];

  const notifCategories = [...new Set(notifPrefs.map(p => p.category))];

  return (
    <DashboardLayout role="laboratory" title="Paramètres">
      <div className="max-w-4xl space-y-6">
        {saved && (
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 flex items-center gap-2 animate-fade-in">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span className="text-sm text-accent font-medium">Sauvegardé</span>
          </div>
        )}

        {/* Tab nav — select on mobile, buttons on desktop */}
        <select value={tab} onChange={e => setTab(e.target.value as Tab)} className="sm:hidden w-full rounded-lg border bg-background px-3 py-2 text-sm">
          {tabs.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <div className="hidden sm:flex gap-0.5 rounded-lg border bg-card p-0.5 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Lab info */}
        {tab === "laboratory" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Informations du laboratoire</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Nom", key: "name" }, { label: "N° Agrément", key: "agrement" },
                  { label: "Directeur", key: "director" }, { label: "Téléphone", key: "phone" },
                  { label: "Email", key: "email" }, { label: "Fax", key: "fax" },
                ].map(f => (
                  <div key={f.key}><Label className="text-xs">{f.label}</Label><Input value={(labInfo as any)[f.key]} onChange={e => setLabInfo(p => ({ ...p, [f.key]: e.target.value }))} className="mt-1" /></div>
                ))}
                <div className="sm:col-span-2"><Label className="text-xs">Adresse</Label><Input value={labInfo.address} onChange={e => setLabInfo(p => ({ ...p, address: e.target.value }))} className="mt-1" /></div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Abonnement</h3>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
                <div><p className="font-semibold text-foreground">Plan Standard</p><p className="text-xs text-muted-foreground">59 DT/mois · Renouvelé le 1er Mars 2026</p></div>
                <Button variant="outline" size="sm"><CreditCard className="h-4 w-4 mr-2" />Gérer</Button>
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {/* Catalogue */}
        {tab === "analyses" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Catalogue d'analyses ({catalogue.length})</h3>
                <Button variant="outline" size="sm" onClick={() => setShowAddAnalyse(!showAddAnalyse)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />Ajouter
                </Button>
              </div>

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

              <div className="space-y-1.5">
                {catalogue.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3 group hover:bg-muted/30 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-2"><Clock className="h-3 w-3" />{a.delay}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">{a.price}</span>
                      <button onClick={() => { setCatalogue(prev => prev.filter((_, j) => j !== i)); toast.success("Supprimé"); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80" aria-label="Supprimer">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <div className="space-y-6">
            {notifCategories.map(cat => (
              <div key={cat} className="rounded-xl border bg-card p-5 shadow-card">
                <h3 className="font-semibold text-foreground mb-3">{cat}</h3>
                <div className="space-y-0.5">
                  <div className="grid grid-cols-[1fr_50px_50px_50px] gap-2 pb-2 border-b">
                    <span />
                    <span className="text-[9px] font-semibold text-muted-foreground text-center">Email</span>
                    <span className="text-[9px] font-semibold text-muted-foreground text-center">SMS</span>
                    <span className="text-[9px] font-semibold text-muted-foreground text-center">Push</span>
                  </div>
                  {notifPrefs.filter(p => p.category === cat).map(pref => (
                    <div key={pref.key} className="grid grid-cols-[1fr_50px_50px_50px] gap-2 py-2.5 border-b last:border-0 items-center">
                      <div>
                        <p className="text-sm font-medium text-foreground">{pref.label}</p>
                        <p className="text-[10px] text-muted-foreground">{pref.desc}</p>
                      </div>
                      <div className="flex justify-center"><input type="checkbox" checked={pref.email} onChange={() => toggleNotifChannel(pref.key, "email")} className="rounded border-input h-4 w-4" /></div>
                      <div className="flex justify-center"><input type="checkbox" checked={pref.sms} onChange={() => toggleNotifChannel(pref.key, "sms")} className="rounded border-input h-4 w-4" /></div>
                      <div className="flex justify-center"><input type="checkbox" checked={pref.push} onChange={() => toggleNotifChannel(pref.key, "push")} className="rounded border-input h-4 w-4" /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Heures calmes</h3>
                    <p className="text-[11px] text-muted-foreground">Suspendre hors heures d'ouverture (sauf urgences)</p>
                  </div>
                </div>
                <Switch checked={quietHours} onCheckedChange={setQuietHours} />
              </div>
              {quietHours && (
                <div className="flex items-center gap-3 mt-3 ml-8">
                  <div><label className="text-[10px] text-muted-foreground block mb-1">De</label><input type="time" value={quietFrom} onChange={e => setQuietFrom(e.target.value)} className="rounded-lg border bg-background px-3 py-1.5 text-xs" /></div>
                  <div><label className="text-[10px] text-muted-foreground block mb-1">À</label><input type="time" value={quietTo} onChange={e => setQuietTo(e.target.value)} className="rounded-lg border bg-background px-3 py-1.5 text-xs" /></div>
                </div>
              )}
            </div>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
          </div>
        )}

        {/* Security */}
        {tab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Mot de passe</h3>
              <div className="max-w-md space-y-3">
                <div><Label className="text-xs">Mot de passe actuel</Label><Input type="password" className="mt-1" /></div>
                <div><Label className="text-xs">Nouveau mot de passe</Label><Input type="password" className="mt-1" /></div>
                <div><Label className="text-xs">Confirmer</Label><Input type="password" className="mt-1" /></div>
                <Button className="gradient-primary text-primary-foreground" onClick={() => toast.success("Mot de passe modifié (mock)")}>Changer</Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">Double authentification (2FA)</h3>
                    <p className="text-xs text-muted-foreground mt-1">{twoFA ? "Activée" : "Protégez votre compte"}</p>
                  </div>
                </div>
                <Switch checked={twoFA} onCheckedChange={v => { setTwoFA(v); toast.success(v ? "2FA activée" : "2FA désactivée"); }} />
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" />Sessions actives</h3>
                {sessions.filter(s => !s.current).length > 0 && (
                  <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => { setSessions(p => p.filter(s => s.current)); toast.success("Sessions révoquées"); }}>
                    Révoquer les autres
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className={`rounded-lg border p-3 flex items-center justify-between ${s.current ? "border-accent/30 bg-accent/5" : ""}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.device} {s.current && <span className="text-[9px] text-accent font-medium ml-1">(cette session)</span>}</p>
                      <p className="text-[10px] text-muted-foreground">{s.location} · IP {s.ip} · {s.lastActive}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
              <h3 className="font-semibold text-destructive mb-2">Zone de danger</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Export des données (mock)")}><Download className="h-3.5 w-3.5 mr-1.5" />Exporter mes données</Button>
                <Button variant="outline" size="sm" className="text-xs text-destructive" onClick={() => setShowDeleteAccount(true)}><Trash2 className="h-3.5 w-3.5 mr-1.5" />Supprimer le compte</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteAccount}
        title="Supprimer le compte laboratoire ?"
        description="Cette action est irréversible. Toutes les données seront supprimées."
        confirmLabel="Supprimer définitivement"
        variant="danger"
        onConfirm={() => { setShowDeleteAccount(false); toast.success("Compte supprimé (mock)"); }}
        onCancel={() => setShowDeleteAccount(false)}
      />
    </DashboardLayout>
  );
};

export default LaboratorySettings;
