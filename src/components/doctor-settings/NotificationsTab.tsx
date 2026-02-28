import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const notifications = [
  { label: "Nouveau rendez-vous", desc: "Recevoir une notification à chaque nouveau RDV" },
  { label: "Annulation de RDV", desc: "Être notifié quand un patient annule" },
  { label: "Résultats d'analyses", desc: "Notification quand de nouveaux résultats sont disponibles" },
  { label: "Messages patients", desc: "Recevoir une alerte pour chaque nouveau message" },
  { label: "Rappel planning", desc: "Rappel quotidien du planning du jour" },
];

const NotificationsTab = () => {
  const handleSave = () => {
    // TODO BACKEND: PUT /api/doctor/notification-preferences
    toast({ title: "Enregistré", description: "Vos modifications ont été sauvegardées." });
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h3 className="font-semibold text-foreground mb-4">Préférences de notification</h3>
      <div className="space-y-4">
        {notifications.map((n, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
            <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />Email</label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="rounded border-input" />SMS</label>
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-6 gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Enregistrer</Button>
    </div>
  );
};

export default NotificationsTab;
