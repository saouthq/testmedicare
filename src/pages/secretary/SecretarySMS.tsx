/**
 * SecretarySMS — Gestion des rappels SMS automatiques et manuels.
 * Dual-mode: localStorage (demo) + Supabase sms_log (production).
 */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  MessageSquare, Send, Clock, CheckCircle2, AlertCircle, Users,
  Plus, Search, Calendar, Bell, Settings, Eye, Trash2, X, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { mockSecretaryTemplates } from "@/data/mockData";
import { useSharedAppointments, getTodayDate } from "@/stores/sharedAppointmentsStore";
import { getAppMode } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";

type SMSTab = "send" | "templates" | "history" | "auto";

interface SMSHistory {
  id: number; recipient: string; phone: string; message: string;
  sentAt: string; status: "delivered" | "pending" | "failed"; type: "manual" | "auto";
}

const mockHistory: SMSHistory[] = [
  { id: 1, recipient: "Amine Ben Ali", phone: "+216 71 234 567", message: "Rappel : RDV demain 28 Fév à 14:30 avec Dr. Bouazizi.", sentAt: "20 Fév 20:00", status: "delivered", type: "auto" },
  { id: 2, recipient: "Fatma Trabelsi", phone: "+216 22 345 678", message: "Votre RDV du 25 Fév à 10:00 est confirmé.", sentAt: "20 Fév 15:30", status: "delivered", type: "manual" },
  { id: 3, recipient: "Nadia Jemni", phone: "+216 98 567 890", message: "Rappel : RDV demain 3 Mar à 09:00 avec Dr. Hammami.", sentAt: "20 Fév 20:00", status: "pending", type: "auto" },
  { id: 4, recipient: "Sami Ayari", phone: "+216 29 678 901", message: "Merci de nous envoyer les documents avant votre prochain RDV.", sentAt: "19 Fév 14:00", status: "delivered", type: "manual" },
  { id: 5, recipient: "Bilel Nasri", phone: "+216 22 345 678", message: "Rappel : RDV demain avec Dr. Gharbi.", sentAt: "19 Fév 20:00", status: "failed", type: "auto" },
];

const autoRules = [
  { id: 1, name: "Rappel J-1", desc: "SMS envoyé la veille du RDV à 20h", enabled: true, timing: "J-1 20:00" },
  { id: 2, name: "Confirmation réservation", desc: "SMS automatique à la confirmation d'un nouveau RDV", enabled: true, timing: "Immédiat" },
  { id: 3, name: "Rappel J-7", desc: "Rappel une semaine avant le RDV", enabled: false, timing: "J-7 10:00" },
  { id: 4, name: "Post-consultation", desc: "Message de suivi 24h après la consultation", enabled: false, timing: "J+1 10:00" },
  { id: 5, name: "Anniversaire patient", desc: "SMS de vœux le jour de l'anniversaire", enabled: false, timing: "08:00" },
];

/** Map Supabase sms_log row to SMSHistory */
function mapSmsRow(row: any): SMSHistory {
  return {
    id: row.id,
    recipient: row.recipient || "",
    phone: row.phone || "",
    message: row.message || "",
    sentAt: row.sent_at ? new Date(row.sent_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "",
    status: (row.status === "sent" ? "delivered" : row.status) as SMSHistory["status"],
    type: (row.sms_type || "manual") as "manual" | "auto",
  };
}

const SecretarySMS = () => {
  const [tab, setTab] = useState<SMSTab>("send");
  const [templates, setTemplates] = useState(mockSecretaryTemplates);
  const [history, setHistory] = useState<SMSHistory[]>(mockHistory);
  const [rules, setRules] = useState(autoRules);
  const [allAppointments] = useSharedAppointments();
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Send tab
  const [recipients, setRecipients] = useState<string[]>([]);
  const [messageText, setMessageText] = useState("");
  const [scheduleSend, setScheduleSend] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  // Load SMS history from Supabase in production
  useEffect(() => {
    if (getAppMode() !== "production") return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setDoctorId(session.user.id);
      const { data } = await (supabase.from as any)("sms_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data && data.length > 0) {
        setHistory(data.map(mapSmsRow));
      }
    })();
  }, []);

  // Tomorrow's appointments from shared store
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const tomorrowAppts = allAppointments.filter(a => a.date === tomorrowStr && !["cancelled", "absent", "done"].includes(a.status));

  const handleSendBulk = async () => {
    if (recipients.length === 0 && !messageText.trim()) return;
    toast({ title: "SMS envoyés", description: `${recipients.length || 1} message(s) ${scheduleSend ? "programmé(s)" : "envoyé(s)"}.` });

    // Persist each SMS to sms_log
    if (getAppMode() === "production" && doctorId) {
      for (const recipient of recipients) {
        try {
          await (supabase.from as any)("sms_log").insert({
            doctor_id: doctorId,
            recipient,
            message: messageText,
            sms_type: "manual",
            status: scheduleSend ? "pending" : "sent",
            sent_at: scheduleSend ? null : new Date().toISOString(),
          });
        } catch {}
      }
    }

    setRecipients([]);
    setMessageText("");
  };

  const handleSendReminders = async () => {
    toast({ title: "Rappels envoyés", description: `${tomorrowAppts.length} SMS de rappel envoyés pour les RDV de demain.` });

    if (getAppMode() === "production" && doctorId) {
      for (const apt of tomorrowAppts) {
        try {
          await (supabase.from as any)("sms_log").insert({
            doctor_id: doctorId,
            recipient: apt.patient,
            phone: apt.phone || "",
            message: `Rappel : RDV demain à ${apt.startTime} avec ${apt.doctor}.`,
            sms_type: "auto",
            status: "sent",
            sent_at: new Date().toISOString(),
          });
        } catch {}
      }
    }
  };

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    const rule = rules.find(r => r.id === id);
    toast({ title: rule?.enabled ? "Règle désactivée" : "Règle activée" });
  };

  const statusConfig: Record<string, { label: string; cls: string }> = {
    delivered: { label: "Délivré", cls: "text-accent bg-accent/10" },
    pending: { label: "En attente", cls: "text-warning bg-warning/10" },
    failed: { label: "Échoué", cls: "text-destructive bg-destructive/10" },
  };

  return (
    <DashboardLayout role="secretary" title="SMS & Rappels">
      <div className="space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Send className="h-5 w-5 text-primary" /></div>
            <div><p className="text-lg font-bold text-foreground">{history.length}</p><p className="text-[10px] text-muted-foreground">Envoyés ce mois</p></div>
          </div>
          <div className="rounded-xl border bg-accent/5 border-accent/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-accent" /></div>
            <div><p className="text-lg font-bold text-accent">{history.filter(h => h.status === "delivered").length}</p><p className="text-[10px] text-muted-foreground">Délivrés</p></div>
          </div>
          <div className="rounded-xl border bg-warning/5 border-warning/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
            <div><p className="text-lg font-bold text-warning">{tomorrowAppts.length}</p><p className="text-[10px] text-muted-foreground">Rappels à envoyer</p></div>
          </div>
          <div className="rounded-xl border bg-destructive/5 border-destructive/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertCircle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-lg font-bold text-destructive">{history.filter(h => h.status === "failed").length}</p><p className="text-[10px] text-muted-foreground">Échecs</p></div>
          </div>
        </div>

        {/* Quick action */}
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-semibold text-foreground">{tomorrowAppts.length} patients ont un RDV demain</p>
              <p className="text-xs text-muted-foreground">Envoyez un rappel SMS automatique maintenant</p>
            </div>
          </div>
          <Button className="gradient-primary text-primary-foreground" size="sm" onClick={handleSendReminders}>
            <Send className="h-3.5 w-3.5 mr-1" />Envoyer les rappels
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border bg-card p-0.5 w-fit">
          {([
            { key: "send" as SMSTab, label: "Envoyer", icon: Send },
            { key: "templates" as SMSTab, label: "Templates", icon: Copy },
            { key: "history" as SMSTab, label: "Historique", icon: Clock },
            { key: "auto" as SMSTab, label: "Automatisations", icon: Settings },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Send tab */}
        {tab === "send" && (
          <div className="rounded-xl border bg-card p-6 shadow-card max-w-2xl">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Nouveau SMS</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Destinataires</Label>
                <div className="mt-1 flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setRecipients(tomorrowAppts.map(a => a.patient))}>
                    <Calendar className="h-3.5 w-3.5 mr-1" />RDV de demain ({tomorrowAppts.length})
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setRecipients(["Tous les patients"])}>
                    <Users className="h-3.5 w-3.5 mr-1" />Tous les patients
                  </Button>
                </div>
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {recipients.slice(0, 5).map((r, i) => (
                      <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{r}</span>
                    ))}
                    {recipients.length > 5 && <span className="text-[10px] text-muted-foreground px-2 py-1">+{recipients.length - 5} autres</span>}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">Templates</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {templates.map(tpl => (
                    <button key={tpl.id} onClick={() => setMessageText(tpl.message)}
                      className="text-[10px] bg-muted text-foreground px-2 py-1 rounded-full hover:bg-muted/80 transition-colors">{tpl.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Message</Label>
                <Textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={4} className="mt-1" placeholder="Saisissez votre message..." />
                <p className="text-[10px] text-muted-foreground mt-1">{messageText.length}/160 · {Math.ceil(messageText.length / 160) || 1} SMS</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={scheduleSend} onCheckedChange={setScheduleSend} />
                <Label className="text-xs">Programmer l'envoi</Label>
                {scheduleSend && <Input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="h-8 w-56 text-xs" />}
              </div>
              <Button className="gradient-primary text-primary-foreground shadow-primary-glow" onClick={handleSendBulk}>
                <Send className="h-4 w-4 mr-2" />{scheduleSend ? "Programmer" : "Envoyer"}
              </Button>
            </div>
          </div>
        )}

        {/* Templates tab */}
        {tab === "templates" && (
          <div className="space-y-3 max-w-2xl">
            {templates.map(tpl => (
              <div key={tpl.id} className="rounded-xl border bg-card p-4 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground text-sm">{tpl.name}</h4>
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tpl.category}</span>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{tpl.message}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="text-[10px]" onClick={() => { setTab("send"); setMessageText(tpl.message); }}>
                    <Send className="h-3 w-3 mr-1" />Utiliser
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[10px]">
                    <Eye className="h-3 w-3 mr-1" />Prévisualiser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b text-left">
                <th className="p-3 text-[11px] font-medium text-muted-foreground">Destinataire</th>
                <th className="p-3 text-[11px] font-medium text-muted-foreground hidden sm:table-cell">Message</th>
                <th className="p-3 text-[11px] font-medium text-muted-foreground">Date</th>
                <th className="p-3 text-[11px] font-medium text-muted-foreground">Type</th>
                <th className="p-3 text-[11px] font-medium text-muted-foreground">Statut</th>
              </tr></thead>
              <tbody className="divide-y">
                {history.map(h => (
                  <tr key={h.id} className="hover:bg-muted/30">
                    <td className="p-3"><p className="text-xs font-medium text-foreground">{h.recipient}</p><p className="text-[10px] text-muted-foreground">{h.phone}</p></td>
                    <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell max-w-64 truncate">{h.message}</td>
                    <td className="p-3 text-xs text-muted-foreground">{h.sentAt}</td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${h.type === "auto" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{h.type === "auto" ? "Auto" : "Manuel"}</span></td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig[h.status]?.cls || "bg-muted text-muted-foreground"}`}>{statusConfig[h.status]?.label || h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Automations tab */}
        {tab === "auto" && (
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm text-muted-foreground">Configurez les envois automatiques de SMS pour réduire les no-shows et améliorer la communication.</p>
            {rules.map(rule => (
              <div key={rule.id} className={`rounded-xl border bg-card p-4 shadow-card flex items-center gap-4 ${rule.enabled ? "" : "opacity-60"}`}>
                <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">{rule.name}</h4>
                  <p className="text-xs text-muted-foreground">{rule.desc}</p>
                </div>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">{rule.timing}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecretarySMS;