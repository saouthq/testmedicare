/**
 * Admin Notification Templates — CRUD with create, edit, preview, test send, duplicate, delete
 * Variables auto-detection, channel filter, audit trail
 * TODO BACKEND: Replace with real API
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import {
  Bell, Edit3, Save, Plus, Trash2, Copy, Send, Eye, X, Search,
  Mail, MessageSquare, Smartphone, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { appendLog } from "@/services/admin/adminAuditService";
import { toast } from "@/hooks/use-toast";

interface NotifTemplate {
  id: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
  variables: string[];
  active: boolean;
  lastModified: string;
  usageCount: number;
}

const initialTemplates: NotifTemplate[] = [
  { id: "tpl-1", name: "RDV confirmé", channel: "sms", subject: "", body: "Votre RDV avec {{doctor_name}} est confirmé le {{date}} à {{time}}. — Medicare.tn", variables: ["doctor_name", "date", "time"], active: true, lastModified: "08 Mar 2026", usageCount: 4521 },
  { id: "tpl-2", name: "Rappel RDV", channel: "sms", subject: "", body: "Rappel : RDV demain à {{time}} avec {{doctor_name}}. Adresse : {{address}}.", variables: ["doctor_name", "time", "address"], active: true, lastModified: "07 Mar 2026", usageCount: 8900 },
  { id: "tpl-3", name: "Validation professionnelle", channel: "email", subject: "Votre compte Medicare a été validé", body: "Bonjour {{name}},\n\nVotre compte professionnel Medicare a été validé avec succès.\n\nVous pouvez maintenant accéder à votre espace et commencer à gérer vos rendez-vous.\n\nCordialement,\nL'équipe Medicare.tn", variables: ["name"], active: true, lastModified: "05 Mar 2026", usageCount: 342 },
  { id: "tpl-4", name: "Résultat disponible", channel: "sms", subject: "", body: "Vos résultats d'analyses sont disponibles sur Medicare.tn. Connectez-vous pour les consulter.", variables: [], active: true, lastModified: "01 Mar 2026", usageCount: 1200 },
  { id: "tpl-5", name: "Bienvenue patient", channel: "email", subject: "Bienvenue sur Medicare", body: "Bonjour {{name}},\n\nBienvenue sur Medicare.tn !\nPrenez votre premier RDV en quelques clics.\n\nCordialement,\nL'équipe Medicare", variables: ["name"], active: true, lastModified: "28 Fév 2026", usageCount: 8500 },
  { id: "tpl-6", name: "OTP Connexion", channel: "sms", subject: "", body: "Votre code de connexion Medicare est : {{code}}. Valable 5 minutes.", variables: ["code"], active: true, lastModified: "01 Mar 2026", usageCount: 15000 },
  { id: "tpl-7", name: "Ordonnance disponible", channel: "push", subject: "Ordonnance prête", body: "Votre ordonnance de {{doctor_name}} est disponible dans votre espace.", variables: ["doctor_name"], active: true, lastModified: "06 Mar 2026", usageCount: 2100 },
  { id: "tpl-8", name: "Paiement reçu", channel: "email", subject: "Confirmation de paiement", body: "Bonjour {{name}},\n\nNous confirmons la réception de votre paiement de {{amount}} DT pour {{service}}.\n\nRéférence : {{reference}}\n\nCordialement,\nMedicare.tn", variables: ["name", "amount", "service", "reference"], active: true, lastModified: "05 Mar 2026", usageCount: 1800 },
  { id: "tpl-9", name: "RDV annulé", channel: "sms", subject: "", body: "Votre RDV du {{date}} avec {{doctor_name}} a été annulé. Vous pouvez reprendre RDV sur Medicare.tn", variables: ["date", "doctor_name"], active: false, lastModified: "01 Mar 2026", usageCount: 450 },
];

const channelIcons: Record<string, any> = { sms: Smartphone, email: Mail, push: Bell };
const channelColors: Record<string, string> = { sms: "bg-accent/10 text-accent", email: "bg-primary/10 text-primary", push: "bg-warning/10 text-warning" };

const AdminNotificationTemplates = () => {
  const [templates, setTemplates] = useState(initialTemplates);
  const [channelFilter, setChannelFilter] = useState("all");
  const [search, setSearch] = useState("");
  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formChannel, setFormChannel] = useState("sms");
  const [formSubject, setFormSubject] = useState("");
  const [formBody, setFormBody] = useState("");
  // Preview
  const [previewTpl, setPreviewTpl] = useState<NotifTemplate | null>(null);
  // Test send
  const [testSending, setTestSending] = useState(false);

  const resetForm = () => { setFormName(""); setFormChannel("sms"); setFormSubject(""); setFormBody(""); setEditId(null); };

  const openCreate = () => { resetForm(); setEditOpen(true); };

  const openEdit = (t: NotifTemplate) => {
    setEditId(t.id);
    setFormName(t.name);
    setFormChannel(t.channel);
    setFormSubject(t.subject);
    setFormBody(t.body);
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formBody.trim()) {
      toast({ title: "Nom et contenu obligatoires", variant: "destructive" }); return;
    }
    const vars = Array.from(formBody.matchAll(/\{\{(\w+)\}\}/g)).map(m => m[1]);
    if (editId) {
      setTemplates(prev => prev.map(t => t.id === editId ? {
        ...t, name: formName, channel: formChannel, subject: formSubject, body: formBody,
        variables: vars, lastModified: new Date().toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" }),
      } : t));
      appendLog("template_updated", "notification_template", editId, `Template "${formName}" modifié`);
      toast({ title: "Template modifié" });
    } else {
      const newTpl: NotifTemplate = {
        id: `tpl-${Date.now()}`, name: formName, channel: formChannel,
        subject: formSubject, body: formBody, variables: vars,
        active: true, lastModified: new Date().toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" }),
        usageCount: 0,
      };
      setTemplates(prev => [newTpl, ...prev]);
      appendLog("template_created", "notification_template", newTpl.id, `Template "${formName}" créé`);
      toast({ title: "Template créé" });
    }
    resetForm();
    setEditOpen(false);
  };

  const handleDuplicate = (t: NotifTemplate) => {
    const dup: NotifTemplate = { ...t, id: `tpl-${Date.now()}`, name: `${t.name} (copie)`, usageCount: 0 };
    setTemplates(prev => [dup, ...prev]);
    toast({ title: "Template dupliqué" });
  };

  const handleDelete = (id: string) => {
    const tpl = templates.find(t => t.id === id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    appendLog("template_deleted", "notification_template", id, `Template "${tpl?.name}" supprimé`);
    toast({ title: "Template supprimé" });
  };

  const handleToggleActive = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
    const tpl = templates.find(t => t.id === id);
    toast({ title: tpl?.active ? "Template désactivé" : "Template activé" });
  };

  const handleTestSend = async (tpl: NotifTemplate) => {
    setTestSending(true);
    // TODO BACKEND: POST /api/notifications/test-send
    await new Promise(r => setTimeout(r, 1200));
    setTestSending(false);
    appendLog("template_test_sent", "notification_template", tpl.id, `Test envoyé pour template "${tpl.name}"`);
    toast({ title: "Test envoyé !", description: `Un ${tpl.channel === "email" ? "email" : tpl.channel === "sms" ? "SMS" : "push"} de test a été envoyé à admin@medicare.tn` });
  };

  const renderPreviewBody = (body: string) => {
    return body.replace(/\{\{(\w+)\}\}/g, (_, v) => {
      const samples: Record<string, string> = {
        name: "Fatma Trabelsi", doctor_name: "Dr. Ahmed Bouazizi", date: "15 Mar 2026",
        time: "14:30", address: "15 Rue de la Liberté, Tunis", code: "847291",
        amount: "60", service: "Téléconsultation", reference: "MC-20260315-042",
      };
      return `<strong class="text-primary">${samples[v] || v}</strong>`;
    });
  };

  const filtered = useMemo(() => {
    let list = templates;
    if (channelFilter !== "all") list = list.filter(t => t.channel === channelFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.body.toLowerCase().includes(q));
    }
    return list;
  }, [templates, channelFilter, search]);

  const stats = useMemo(() => ({
    total: templates.length,
    active: templates.filter(t => t.active).length,
    sms: templates.filter(t => t.channel === "sms").length,
    email: templates.filter(t => t.channel === "email").length,
    push: templates.filter(t => t.channel === "push").length,
  }), [templates]);

  return (
    <DashboardLayout role="admin" title="Templates notifications">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-card p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
            <p className="text-2xl font-bold text-accent">{stats.active}</p>
            <p className="text-[11px] text-muted-foreground">Actifs</p>
          </div>
          <div className="rounded-xl border bg-accent/5 p-4 shadow-card text-center">
            <Smartphone className="h-4 w-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.sms}</p>
            <p className="text-[10px] text-muted-foreground">SMS</p>
          </div>
          <div className="rounded-xl border bg-primary/5 p-4 shadow-card text-center">
            <Mail className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.email}</p>
            <p className="text-[10px] text-muted-foreground">Email</p>
          </div>
          <div className="rounded-xl border bg-warning/5 p-4 shadow-card text-center">
            <Bell className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.push}</p>
            <p className="text-[10px] text-muted-foreground">Push</p>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm w-56" />
            </div>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-28 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5 mr-1" />Nouveau template
          </Button>
        </div>

        {/* Templates list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun template trouvé</p>
            </div>
          )}
          {filtered.map(t => {
            const ChannelIcon = channelIcons[t.channel] || Bell;
            return (
              <div key={t.id} className={`rounded-xl border bg-card p-5 shadow-card transition-all ${!t.active ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`mt-0.5 p-2 rounded-lg ${channelColors[t.channel]}`}>
                      <ChannelIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground text-sm">{t.name}</h4>
                        <span className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${channelColors[t.channel]}`}>{t.channel}</span>
                        {!t.active && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Inactif</span>}
                      </div>
                      {t.subject && <p className="text-xs text-muted-foreground mt-0.5">Sujet : {t.subject}</p>}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.body}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {t.variables.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {t.variables.map(v => <span key={v} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{`{{${v}}}`}</span>)}
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground">{t.usageCount.toLocaleString()} envois · {t.lastModified}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Aperçu" onClick={() => setPreviewTpl(t)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Modifier" onClick={() => openEdit(t)}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Dupliquer" onClick={() => handleDuplicate(t)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title={t.active ? "Désactiver" : "Activer"} onClick={() => handleToggleActive(t.id)}>
                      {t.active ? <CheckCircle className="h-3.5 w-3.5 text-accent" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" title="Supprimer" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Modifier le template" : "Nouveau template"}</DialogTitle>
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
              <Textarea className="mt-1 min-h-[120px] font-mono text-sm" value={formBody} onChange={e => setFormBody(e.target.value)} placeholder="Votre {{variable}} ici..." />
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-muted-foreground">Variables auto-détectées : {Array.from(formBody.matchAll(/\{\{(\w+)\}\}/g)).map(m => m[1]).join(", ") || "aucune"}</p>
                <p className="text-[10px] text-muted-foreground">{formBody.length} car.</p>
              </div>
            </div>

            {/* Quick insert variables */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Insérer une variable :</p>
              <div className="flex gap-1 flex-wrap">
                {["name", "doctor_name", "date", "time", "address", "code", "amount", "reference"].map(v => (
                  <button key={v} onClick={() => setFormBody(b => b + `{{${v}}}`)}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors font-mono">
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setEditOpen(false); resetForm(); }}>Annuler</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleSave}>
              {editId ? "Sauvegarder" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Sheet */}
      <Sheet open={!!previewTpl} onOpenChange={v => !v && setPreviewTpl(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {previewTpl && (
            <>
              <SheetHeader>
                <SheetTitle className="text-sm">Aperçu — {previewTpl.name}</SheetTitle>
                <SheetDescription className="sr-only">Aperçu du template</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${channelColors[previewTpl.channel]}`}>
                    {previewTpl.channel.toUpperCase()}
                  </span>
                  {previewTpl.active
                    ? <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Actif</span>
                    : <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactif</span>
                  }
                </div>

                {/* Rendered preview */}
                <div className="rounded-lg border bg-card p-5">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Aperçu avec données exemples :</p>
                  {previewTpl.subject && (
                    <p className="font-semibold text-foreground text-sm mb-2">Sujet : {previewTpl.subject}</p>
                  )}
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: renderPreviewBody(previewTpl.body) }} />
                </div>

                {/* Raw template */}
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Template brut :</p>
                  <p className="text-xs text-foreground font-mono whitespace-pre-wrap">{previewTpl.body}</p>
                </div>

                {/* Variables */}
                {previewTpl.variables.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Variables ({previewTpl.variables.length})</p>
                    <div className="flex gap-1 flex-wrap">
                      {previewTpl.variables.map(v => <span key={v} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">{`{{${v}}}`}</span>)}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total envois</span>
                    <span className="font-medium text-foreground">{previewTpl.usageCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernière modification</span>
                    <span className="text-foreground">{previewTpl.lastModified}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleTestSend(previewTpl)} disabled={testSending}>
                    <Send className="h-3.5 w-3.5 mr-1" />{testSending ? "Envoi en cours..." : "Envoyer un test"}
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setPreviewTpl(null); openEdit(previewTpl); }}>
                    <Edit3 className="h-3.5 w-3.5 mr-1" />Modifier
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default AdminNotificationTemplates;
