/**
 * Admin Notification Templates — CRUD with create + edit + audit
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Bell, Edit3, Save, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

interface NotifTemplate {
  id: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
  variables: string[];
}

const initialTemplates: NotifTemplate[] = [
  { id: "tpl-1", name: "RDV confirmé", channel: "sms", subject: "", body: "Votre RDV avec {{doctor_name}} est confirmé le {{date}} à {{time}}. — Medicare.tn", variables: ["doctor_name", "date", "time"] },
  { id: "tpl-2", name: "Rappel RDV", channel: "sms", subject: "", body: "Rappel : RDV demain à {{time}} avec {{doctor_name}}. Adresse : {{address}}.", variables: ["doctor_name", "time", "address"] },
  { id: "tpl-3", name: "Validation professionnelle", channel: "email", subject: "Votre compte Medicare a été validé", body: "Bonjour {{name}}, votre compte professionnel Medicare a été validé. Vous pouvez maintenant accéder à votre espace.", variables: ["name"] },
  { id: "tpl-4", name: "Résultat disponible", channel: "sms", subject: "", body: "Vos résultats d'analyses sont disponibles sur Medicare.tn. Connectez-vous pour les consulter.", variables: [] },
  { id: "tpl-5", name: "Bienvenue patient", channel: "email", subject: "Bienvenue sur Medicare", body: "Bonjour {{name}}, bienvenue sur Medicare.tn ! Prenez votre premier RDV en quelques clics.", variables: ["name"] },
  { id: "tpl-6", name: "OTP Connexion", channel: "sms", subject: "", body: "Votre code de connexion Medicare est : {{code}}. Valable 5 minutes.", variables: ["code"] },
  { id: "tpl-7", name: "Ordonnance disponible", channel: "push", subject: "Ordonnance prête", body: "Votre ordonnance de {{doctor_name}} est disponible dans votre espace.", variables: ["doctor_name"] },
];

const AdminNotificationTemplates = () => {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formChannel, setFormChannel] = useState("sms");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

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

  const handleCreate = () => {
    if (!formName.trim() || !formBody.trim()) {
      toast({ title: "Nom et contenu obligatoires", variant: "destructive" });
      return;
    }
    const vars = Array.from(formBody.matchAll(/\{\{(\w+)\}\}/g)).map(m => m[1]);
    const newTpl: NotifTemplate = {
      id: `tpl-${Date.now()}`, name: formName, channel: formChannel,
      subject: formSubject, body: formBody, variables: vars,
    };
    setTemplates(prev => [newTpl, ...prev]);
    appendLog("template_created", "notification_template", newTpl.id, `Template "${formName}" créé`);
    toast({ title: "Template créé" });
    setFormName(""); setFormChannel("sms"); setFormSubject(""); setFormBody("");
    setCreateOpen(false);
  };

  const handleDuplicate = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    if (!tpl) return;
    const dup: NotifTemplate = { ...tpl, id: `tpl-${Date.now()}`, name: `${tpl.name} (copie)` };
    setTemplates(prev => [dup, ...prev]);
    toast({ title: "Template dupliqué" });
  };

  const handleDelete = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    appendLog("template_deleted", "notification_template", id, `Template "${tpl?.name}" supprimé`);
    toast({ title: "Template supprimé" });
  };

  const filtered = channelFilter === "all" ? templates : templates.filter(t => t.channel === channelFilter);

  return (
    <DashboardLayout role="admin" title="Templates notifications">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Gérez les modèles de notifications. Variables : {'{{'}...{'}}'}.</p>
          </div>
          <div className="flex gap-2">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />Nouveau template
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-foreground text-sm">{t.name}</h4>
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase">{t.channel}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleDuplicate(t.id)} title="Dupliquer">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => editing === t.id ? saveEdit() : startEdit(t.id)}>
                    {editing === t.id ? <><Save className="h-3 w-3 mr-1" />Sauvegarder</> : <><Edit3 className="h-3 w-3 mr-1" />Modifier</>}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleDelete(t.id)} title="Supprimer">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
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

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau template de notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Nom *</Label>
                <Input className="mt-1" value={formName} onChange={e => setFormName(e.target.value)} placeholder="RDV annulé" />
              </div>
              <div>
                <Label className="text-xs">Canal *</Label>
                <Select value={formChannel} onValueChange={setFormChannel}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formChannel === "email" && (
              <div>
                <Label className="text-xs">Sujet</Label>
                <Input className="mt-1" value={formSubject} onChange={e => setFormSubject(e.target.value)} placeholder="Sujet de l'email" />
              </div>
            )}
            <div>
              <Label className="text-xs">Contenu *</Label>
              <Textarea className="mt-1 min-h-[100px]" value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Votre {{variable}} ici..." />
              <p className="text-[10px] text-muted-foreground mt-1">Variables auto-détectées : {`{{nom}}`}, {`{{date}}`}, etc.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleCreate}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminNotificationTemplates;
