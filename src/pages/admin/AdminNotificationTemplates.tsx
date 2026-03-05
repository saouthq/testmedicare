import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Bell, Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

const initialTemplates = [
  { id: "tpl-1", name: "RDV confirmé", channel: "sms", subject: "", body: "Votre RDV avec {{doctor_name}} est confirmé le {{date}} à {{time}}. — Medicare.tn", variables: ["doctor_name", "date", "time"] },
  { id: "tpl-2", name: "Rappel RDV", channel: "sms", subject: "", body: "Rappel : RDV demain à {{time}} avec {{doctor_name}}. Adresse : {{address}}.", variables: ["doctor_name", "time", "address"] },
  { id: "tpl-3", name: "Validation professionnelle", channel: "email", subject: "Votre compte Medicare a été validé", body: "Bonjour {{name}}, votre compte professionnel Medicare a été validé. Vous pouvez maintenant accéder à votre espace.", variables: ["name"] },
  { id: "tpl-4", name: "Résultat disponible", channel: "sms", subject: "", body: "Vos résultats d'analyses sont disponibles sur Medicare.tn. Connectez-vous pour les consulter.", variables: [] },
  { id: "tpl-5", name: "Bienvenue patient", channel: "email", subject: "Bienvenue sur Medicare", body: "Bonjour {{name}}, bienvenue sur Medicare.tn ! Prenez votre premier RDV en quelques clics.", variables: ["name"] },
];

const AdminNotificationTemplates = () => {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  const startEdit = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    if (tpl) { setEditing(id); setEditBody(tpl.body); }
  };

  const saveEdit = () => {
    if (!editing) return;
    setTemplates(prev => prev.map(t => t.id === editing ? { ...t, body: editBody } : t));
    appendLog("template_updated", "notification_template", editing, `Template "${templates.find(t => t.id === editing)?.name}" mis à jour`);
    toast({ title: "Template sauvegardé" });
    setEditing(null);
  };

  return (
    <DashboardLayout role="admin" title="Templates notifications">
      <div className="space-y-6 max-w-3xl">
        <p className="text-sm text-muted-foreground">Gérez les modèles de notifications envoyées aux utilisateurs. Utilisez les variables entre {'{{'}...{'}}'} pour personnaliser le contenu.</p>

        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-foreground text-sm">{t.name}</h4>
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase">{t.channel}</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => editing === t.id ? saveEdit() : startEdit(t.id)}>
                  {editing === t.id ? <><Save className="h-3 w-3 mr-1" />Sauvegarder</> : <><Edit3 className="h-3 w-3 mr-1" />Modifier</>}
                </Button>
              </div>
              {editing === t.id ? (
                <Textarea value={editBody} onChange={e => setEditBody(e.target.value)} className="text-sm min-h-[80px]" />
              ) : (
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{t.body}</p>
              )}
              {t.variables.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Variables :</span>
                  {t.variables.map(v => <span key={v} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{`{{${v}}}`}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminNotificationTemplates;
