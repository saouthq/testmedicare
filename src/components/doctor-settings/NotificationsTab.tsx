import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Moon, Bell, BellOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface NotifPref {
  key: string;
  label: string;
  desc: string;
  category: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

const defaultPrefs: NotifPref[] = [
  { key: "new_rdv", label: "Nouveau rendez-vous", desc: "Notification à chaque nouveau RDV confirmé", category: "Rendez-vous", email: true, sms: true, push: true },
  { key: "cancel_rdv", label: "Annulation de RDV", desc: "Quand un patient annule son rendez-vous", category: "Rendez-vous", email: true, sms: true, push: true },
  { key: "remind_rdv", label: "Rappel planning", desc: "Rappel quotidien du planning du lendemain (20h)", category: "Rendez-vous", email: true, sms: false, push: true },
  { key: "patient_no_show", label: "Patient absent", desc: "Notification quand un patient ne se présente pas", category: "Rendez-vous", email: false, sms: false, push: true },
  { key: "lab_results", label: "Résultats d'analyses", desc: "Quand de nouveaux résultats labo sont disponibles", category: "Médical", email: true, sms: false, push: true },
  { key: "rx_renewal", label: "Demande de renouvellement", desc: "Quand un patient demande un renouvellement d'ordonnance", category: "Médical", email: true, sms: true, push: true },
  { key: "patient_msg", label: "Messages patients", desc: "Alerte pour chaque nouveau message reçu", category: "Communication", email: false, sms: false, push: true },
  { key: "pro_msg", label: "Messages confrères", desc: "Messages de professionnels du réseau", category: "Communication", email: true, sms: false, push: true },
  { key: "secretary_action", label: "Actions secrétaire", desc: "Quand votre secrétaire effectue une action importante", category: "Cabinet", email: false, sms: false, push: true },
  { key: "billing", label: "Facturation", desc: "Paiements reçus, factures et abonnement", category: "Cabinet", email: true, sms: false, push: false },
];

const NotificationsTab = () => {
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [quietHours, setQuietHours] = useState(true);
  const [quietFrom, setQuietFrom] = useState("22:00");
  const [quietTo, setQuietTo] = useState("07:00");
  const [urgentOverride, setUrgentOverride] = useState(true);

  const toggleChannel = (key: string, channel: "email" | "sms" | "push") => {
    setPrefs(prev => prev.map(p => p.key === key ? { ...p, [channel]: !p[channel] } : p));
  };

  const categories = [...new Set(prefs.map(p => p.category))];

  const handleSave = () => {
    toast({ title: "Préférences sauvegardées", description: "Vos préférences de notification ont été mises à jour." });
  };

  return (
    <div className="space-y-6">
      {/* Notification preferences by category */}
      {categories.map(cat => (
        <div key={cat} className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">{cat}</h3>
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 pb-2 border-b">
              <span />
              <span className="text-[10px] font-semibold text-muted-foreground text-center">Email</span>
              <span className="text-[10px] font-semibold text-muted-foreground text-center">SMS</span>
              <span className="text-[10px] font-semibold text-muted-foreground text-center">Push</span>
            </div>
            {prefs.filter(p => p.category === cat).map(pref => (
              <div key={pref.key} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 py-3 border-b last:border-0 items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">{pref.label}</p>
                  <p className="text-xs text-muted-foreground">{pref.desc}</p>
                </div>
                <div className="flex justify-center">
                  <input type="checkbox" checked={pref.email} onChange={() => toggleChannel(pref.key, "email")} className="rounded border-input" />
                </div>
                <div className="flex justify-center">
                  <input type="checkbox" checked={pref.sms} onChange={() => toggleChannel(pref.key, "sms")} className="rounded border-input" />
                </div>
                <div className="flex justify-center">
                  <input type="checkbox" checked={pref.push} onChange={() => toggleChannel(pref.key, "push")} className="rounded border-input" />
                </div>
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
          <div className="ml-13 space-y-4 mt-4 pl-[52px]">
            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">De</label>
                <input type="time" value={quietFrom} onChange={e => setQuietFrom(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">À</label>
                <input type="time" value={quietTo} onChange={e => setQuietTo(e.target.value)} className="rounded-lg border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">Urgences passent toujours</p>
                  <p className="text-xs text-muted-foreground">Les notifications urgentes (absence patient, résultats critiques) ignorent les heures calmes</p>
                </div>
              </div>
              <Switch checked={urgentOverride} onCheckedChange={setUrgentOverride} />
            </div>
          </div>
        )}
      </div>

      <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />Enregistrer les préférences
      </Button>
    </div>
  );
};

export default NotificationsTab;
